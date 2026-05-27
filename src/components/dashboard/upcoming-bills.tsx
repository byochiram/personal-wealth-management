'use client'

import { useMemo } from 'react'
import { Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Contract, CreditCard } from '@/types'

interface BillItem {
  source: 'contract' | 'debt' | 'cc' | 'recurring'
  title: string
  amount: number | null
  dueDate: Date
  daysUntil: number
  emoji: string
  href: string
}

interface UpcomingBillsProps {
  contracts: Contract[]
  debts: Array<{ id: string; name: string; remaining: number; due_date: string | null; monthly_payment: number }>
  creditCards: CreditCard[]
  recurring: Array<{ id: string; name: string; type: string; amount: number; frequency: string; day_of_period: number }>
}

export function UpcomingBills({ contracts, debts, creditCards, recurring }: UpcomingBillsProps) {
  const bills = useMemo<BillItem[]>(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const horizonMs = 14 * 86_400_000 // 14 days
    const cutoff = today.getTime() + horizonMs
    const out: BillItem[] = []

    // 1) Contracts ending in next 14 days (renewal/expiry reminder)
    for (const c of contracts) {
      if (!c.end_date) continue
      const dueDate = new Date(c.end_date)
      dueDate.setHours(0, 0, 0, 0)
      const days = Math.round((dueDate.getTime() - today.getTime()) / 86_400_000)
      if (days < 0 || dueDate.getTime() > cutoff) continue
      out.push({
        source: 'contract',
        title: c.name,
        amount: c.cost ?? null,
        dueDate,
        daysUntil: days,
        emoji: '📄',
        href: '/dashboard/contracts',
      })
    }

    // 2) Debts with due_date in next 14 days
    for (const d of debts) {
      if (!d.due_date) continue
      const dueDate = new Date(d.due_date)
      dueDate.setHours(0, 0, 0, 0)
      const days = Math.round((dueDate.getTime() - today.getTime()) / 86_400_000)
      if (days < 0 || dueDate.getTime() > cutoff) continue
      out.push({
        source: 'debt',
        title: d.name,
        amount: d.monthly_payment > 0 ? d.monthly_payment : d.remaining,
        dueDate,
        daysUntil: days,
        emoji: '💳',
        href: '/dashboard/debts',
      })
    }

    // 3) Credit cards — compute next due_day from today
    for (const c of creditCards) {
      if (c.current_balance <= 0) continue
      const y = today.getFullYear()
      const m = today.getMonth()
      let dueDate = new Date(y, m, c.due_day)
      dueDate.setHours(0, 0, 0, 0)
      if (dueDate.getTime() < today.getTime()) {
        dueDate = new Date(y, m + 1, c.due_day)
        dueDate.setHours(0, 0, 0, 0)
      }
      const days = Math.round((dueDate.getTime() - today.getTime()) / 86_400_000)
      if (days < 0 || dueDate.getTime() > cutoff) continue
      out.push({
        source: 'cc',
        title: `${c.name}${c.last_four ? ` ••${c.last_four}` : ''}`,
        amount: c.current_balance,
        dueDate,
        daysUntil: days,
        emoji: '💳',
        href: '/dashboard/credit-cards',
      })
    }

    // 4) Monthly recurring (only expense type — income reminders are nice but less urgent)
    for (const r of recurring) {
      if (r.frequency !== 'monthly' || r.type === 'income') continue
      const y = today.getFullYear()
      const m = today.getMonth()
      let dueDate = new Date(y, m, r.day_of_period)
      dueDate.setHours(0, 0, 0, 0)
      if (dueDate.getTime() < today.getTime()) {
        dueDate = new Date(y, m + 1, r.day_of_period)
        dueDate.setHours(0, 0, 0, 0)
      }
      const days = Math.round((dueDate.getTime() - today.getTime()) / 86_400_000)
      if (days < 0 || dueDate.getTime() > cutoff) continue
      out.push({
        source: 'recurring',
        title: r.name,
        amount: r.amount,
        dueDate,
        daysUntil: days,
        emoji: r.type === 'saving' || r.type === 'investment' ? '🎯' : '🔁',
        href: '/dashboard/recurring',
      })
    }

    // Sort by due date ascending, then by amount desc
    return out.sort((a, b) => a.daysUntil - b.daysUntil || (b.amount ?? 0) - (a.amount ?? 0))
  }, [contracts, debts, creditCards, recurring])

  const totalThisWeek = bills
    .filter((b) => b.daysUntil <= 7)
    .reduce((s, b) => s + (b.amount ?? 0), 0)

  if (bills.length === 0) {
    return (
      <div className="s-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="size-4" style={{ color: 'var(--ink-muted)' }} />
          <p className="caps">Tagihan Mendatang</p>
        </div>
        <p className="text-sm py-6 text-center" style={{ color: 'var(--ink-soft)' }}>
          Tidak ada tagihan dalam 14 hari ke depan.
        </p>
      </div>
    )
  }

  return (
    <div className="s-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="size-4" style={{ color: 'var(--ink-muted)' }} />
          <div>
            <p className="caps">Tagihan Mendatang</p>
            <h3 className="text-base font-semibold mt-0.5" style={{ color: 'var(--ink)' }}>
              {bills.length} dalam 14 hari
            </h3>
          </div>
        </div>
        {totalThisWeek > 0 && (
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--ink-soft)' }}>Total minggu ini</p>
            <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--coral-600)' }}>
              {formatCurrency(totalThisWeek)}
            </p>
          </div>
        )}
      </div>
      <ul className="divide-y" style={{ borderColor: 'var(--border-soft)' }}>
        {bills.slice(0, 7).map((b, i) => {
          const urgency = b.daysUntil <= 3 ? 'critical' : b.daysUntil <= 7 ? 'warn' : 'normal'
          const colors = {
            critical: { bg: 'rgba(244,63,94,0.10)', text: 'var(--coral-700)', accent: 'var(--coral-500)' },
            warn:     { bg: 'rgba(245,158,11,0.10)', text: 'var(--amber-700)', accent: 'var(--amber-500)' },
            normal:   { bg: 'var(--surface-2)',     text: 'var(--ink-muted)',  accent: 'var(--ink-muted)' },
          }[urgency]
          const dueLabel = b.daysUntil === 0 ? 'Hari ini' : b.daysUntil === 1 ? 'Besok' : `${b.daysUntil} hari lagi`

          return (
            <li key={`${b.source}-${i}`} className="flex items-center gap-3 py-2.5">
              <span
                className="text-base shrink-0 size-8 rounded-lg flex items-center justify-center"
                style={{ background: colors.bg }}
              >
                {b.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>
                  {b.title}
                </p>
                <p className="text-[11px] truncate" style={{ color: colors.text }}>
                  {dueLabel} · {b.dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              {b.amount && b.amount > 0 ? (
                <p className="text-sm font-semibold tabular-nums shrink-0" style={{ color: 'var(--ink)' }}>
                  {formatCurrency(b.amount)}
                </p>
              ) : (
                <span className="text-[10px] shrink-0" style={{ color: 'var(--ink-soft)' }}>—</span>
              )}
            </li>
          )
        })}
      </ul>
      {bills.length > 7 && (
        <p className="text-[11px] text-center pt-2" style={{ color: 'var(--ink-soft)' }}>
          +{bills.length - 7} tagihan lainnya
        </p>
      )}
    </div>
  )
}
