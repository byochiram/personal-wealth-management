'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import {
  fetchLiquidEntries,
  sumLiquid,
  findDuplicates,
  type UnifiedLiquidEntry,
} from '@/lib/liquid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil, Trash2, Loader2, Link as LinkIcon, AlertTriangle } from 'lucide-react'

const TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  cash:           { label: 'Kas',       emoji: '💵' },
  bank:           { label: 'Bank',      emoji: '🏦' },
  digital_wallet: { label: 'E-Wallet',  emoji: '📱' },
  investment:     { label: 'Investasi', emoji: '📈' },
  receivable:     { label: 'Piutang',   emoji: '🤝' },
}

interface FormState {
  id: string | null
  name: string
  type: 'receivable' | 'cash' | 'bank' | 'digital_wallet'
  balance: number
}
const EMPTY: FormState = { id: null, name: '', type: 'receivable', balance: 0 }

export default function LiquidAssetsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<UnifiedLiquidEntry[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const data = await fetchLiquidEntries(supabase, user.id)
    setEntries(data)
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load() }, [])

  async function save() {
    if (!form.name.trim()) {
      alert('Nama aset wajib diisi.')
      return
    }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const now = new Date()
    const payload = {
      user_id: user.id,
      name: form.name.trim(),
      type: form.type,
      balance: form.balance,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    }
    const op = form.id
      ? supabase.from('assets_liquid').update(payload).eq('id', form.id)
      : supabase.from('assets_liquid').insert(payload)
    const { error } = await op
    setSaving(false)
    if (error) {
      alert(`Gagal simpan: ${error.message}`)
      return
    }
    setDialogOpen(false)
    void load()
  }

  async function remove(id: string, source: 'account' | 'asset_liquid') {
    if (source === 'account') {
      alert('Akun tidak bisa dihapus dari sini. Buka menu "Akun" di sidebar untuk menghapus.')
      return
    }
    if (!confirm('Hapus aset ini?')) return
    const { error } = await supabase.from('assets_liquid').delete().eq('id', id)
    if (error) alert(`Gagal hapus: ${error.message}`)
    void load()
  }

  const accountEntries = entries.filter((e) => e.source === 'account')
  const otherEntries = entries.filter((e) => e.source === 'asset_liquid')
  const total = sumLiquid(entries)
  const duplicates = findDuplicates(entries)

  const byType = entries.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + e.balance
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div className="dark-card p-6 sm:p-7">
        <p className="caps">Aset Likuid</p>
        <p className="num tabular mt-3 text-white text-4xl sm:text-5xl font-semibold">
          {formatCurrency(total)}
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--on-black-mut)' }}>
          {entries.length} aset · dapat dicairkan cepat
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {Object.entries(byType).map(([type, val]) => {
            const info = TYPE_LABELS[type]
            return (
              <span
                key={type}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={{
                  background: 'var(--black-2)',
                  color: 'var(--on-black)',
                  border: '1px solid var(--black-line)',
                }}
              >
                {info?.label ?? type} <span className="num opacity-70">· {formatCurrency(val)}</span>
              </span>
            )
          })}
        </div>
      </div>

      {duplicates.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <AlertTriangle className="size-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-amber-900">Terdeteksi kemungkinan duplikat</p>
            <p className="mt-1 text-amber-800">
              Aset berikut punya nama yang sama dengan Akun, jadi nilai-nya di-hitung dua kali:
              <span className="font-semibold"> {duplicates.map((d) => d.name).join(', ')}</span>.
              Hapus dari Aset Likuid untuk menghindari double-count
              (data Akun otomatis update dari transaksi).
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--indigo-600)' }} />
        </div>
      ) : (
        <>
          {/* Section 1: Dari Akun (read-only, sourced from accounts table) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base" style={{ color: 'var(--ink)' }}>
                  Dari Akun
                </h3>
                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                  Saldo otomatis ter-update dari setiap transaksi.
                </p>
              </div>
              <Link
                href="/dashboard/accounts"
                className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 h-8 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition"
              >
                <LinkIcon className="size-3.5" />
                Kelola Akun
              </Link>
            </div>
            {accountEntries.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                  Belum ada akun.{' '}
                  <Link href="/dashboard/accounts" className="font-semibold hover:underline" style={{ color: 'var(--indigo-600)' }}>
                    Bikin akun pertama →
                  </Link>
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {accountEntries.map((a) => {
                  const info = TYPE_LABELS[a.type] ?? TYPE_LABELS.bank
                  return (
                    <div
                      key={`acc-${a.id}`}
                      className="rounded-lg p-5 bg-white border border-[var(--border-soft)]"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold" style={{ color: 'var(--ink)' }}>{a.name}</p>
                          <Badge className="mt-1 rounded-sm px-1.5 py-0 text-[10px] border-0 font-medium" style={{ background: 'var(--surface-2)', color: 'var(--ink-muted)' }}>
                            {info?.label ?? a.type}
                          </Badge>
                        </div>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: 'var(--indigo-50, #eef2ff)', color: 'var(--indigo-600, #4f46e5)' }}>
                          Live
                        </span>
                      </div>
                      <p className="num text-2xl mt-4 tabular font-semibold" style={{ color: 'var(--ink)' }}>
                        {formatCurrency(a.balance)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Section 2: Aset Lain (CRUD on assets_liquid) */}
          <section className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base" style={{ color: 'var(--ink)' }}>
                  Aset Lain
                </h3>
                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                  Piutang, tabungan terkunci, atau aset cair lain yang bukan rekening transaksi.
                </p>
              </div>
              <Button onClick={() => { setForm(EMPTY); setDialogOpen(true) }}>
                <Plus className="h-4 w-4" />
                Tambah Aset Lain
              </Button>
            </div>
            {otherEntries.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                  Belum ada aset lain. Tambah piutang atau tabungan terkunci di sini.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {otherEntries.map((a) => {
                  const info = TYPE_LABELS[a.type] ?? TYPE_LABELS.bank
                  return (
                    <div
                      key={`al-${a.id}`}
                      className="group relative rounded-lg p-5 bg-white border border-[var(--border-soft)] hover:border-[var(--ink)] transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold" style={{ color: 'var(--ink)' }}>{a.name}</p>
                          <Badge className="mt-1 rounded-sm px-1.5 py-0 text-[10px] border-0 font-medium" style={{ background: 'var(--surface-2)', color: 'var(--ink-muted)' }}>
                            {info?.label ?? a.type}
                          </Badge>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setForm({
                                id: a.id,
                                name: a.name,
                                type: a.type as FormState['type'],
                                balance: a.balance,
                              })
                              setDialogOpen(true)
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => remove(a.id, a.source)}
                          >
                            <Trash2 className="h-3.5 w-3.5" style={{ color: 'var(--danger)' }} />
                          </Button>
                        </div>
                      </div>
                      <p className="num text-2xl mt-4 tabular font-semibold" style={{ color: 'var(--ink)' }}>
                        {formatCurrency(a.balance)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? 'Edit Aset Lain' : 'Tambah Aset Lain'}</DialogTitle>
            <DialogDescription>
              Untuk akun yang dipakai transaksi rutin (BCA/Cash/GoPay), buka menu{' '}
              <Link href="/dashboard/accounts" className="font-semibold hover:underline" style={{ color: 'var(--indigo-600)' }}>
                Akun
              </Link>
              {' '}— saldo-nya auto update dari transaksi.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Nama</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Piutang Andi, Tabungan Haji, Cash di brankas" />
            </div>
            <div className="grid gap-1.5">
              <Label>Tipe</Label>
              <Select value={form.type} onValueChange={(v) => v && setForm({ ...form, type: v as FormState['type'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="receivable">🤝 Piutang</SelectItem>
                  <SelectItem value="cash">💵 Kas (non-transaksional)</SelectItem>
                  <SelectItem value="bank">🏦 Bank (terkunci/non-transaksional)</SelectItem>
                  <SelectItem value="digital_wallet">📱 E-Wallet (cadangan)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Saldo (Rp)</Label>
              <Input type="number" value={form.balance || ''} onChange={(e) => setForm({ ...form, balance: Number(e.target.value) || 0 })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={save} disabled={saving || !form.name}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {form.id ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
