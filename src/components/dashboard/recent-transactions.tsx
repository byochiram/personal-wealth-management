'use client'

import { useMemo } from 'react'
import { ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Transaction } from '@/types'

// Per dashboard-refine.jsx — icon-circle tinted bg per category cluster.
// Emoji + tint chosen contextually (food, transport, salary, etc).
// Falls back to type-based default if category doesn't match.
function categoryStyle(category: string, type: string): { emoji: string; tint: string } {
  const cat = (category || '').toLowerCase()
  if (cat.includes('makan') || cat.includes('food') || cat.includes('kopi')) return { emoji: '☕', tint: 'var(--amber-100)' }
  if (cat.includes('belanja') || cat.includes('shop')) return { emoji: '🛒', tint: 'var(--sky-100)' }
  if (cat.includes('transport') || cat.includes('bensin') || cat.includes('grab') || cat.includes('gojek')) return { emoji: '⛽', tint: 'var(--coral-100)' }
  if (cat.includes('langganan') || cat.includes('netflix') || cat.includes('spotify') || cat.includes('subscript')) return { emoji: '📺', tint: 'var(--vi-100, #EDE9FE)' }
  if (cat.includes('tagihan') || cat.includes('listrik') || cat.includes('air')) return { emoji: '💡', tint: 'var(--amber-100)' }
  if (cat.includes('gaji') || cat.includes('bonus') || cat.includes('thr')) return { emoji: '💰', tint: 'var(--emerald-100)' }
  if (cat.includes('investasi') || cat.includes('saham')) return { emoji: '📈', tint: 'var(--sky-100)' }
  if (cat.includes('tabung') || cat.includes('saving')) return { emoji: '🏦', tint: 'var(--emerald-100)' }
  if (cat.includes('kesehatan') || cat.includes('rumah sakit')) return { emoji: '🏥', tint: 'var(--coral-100)' }
  if (cat.includes('hiburan') || cat.includes('game')) return { emoji: '🎮', tint: 'var(--vi-100, #EDE9FE)' }
  // Type-based fallback
  if (type === 'income') return { emoji: '💰', tint: 'var(--emerald-100)' }
  if (type === 'expense') return { emoji: '💸', tint: 'var(--coral-100)' }
  if (type === 'saving') return { emoji: '🏦', tint: 'var(--amber-100)' }
  if (type === 'investment') return { emoji: '📈', tint: 'var(--sky-100)' }
  return { emoji: '•', tint: 'var(--surface-2)' }
}

function relativeTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return 'Hari ini'
  if (diffDays === 1) return 'Kemarin'
  if (diffDays < 7) return `${diffDays} hari lalu`
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  const recent = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [transactions],
  )

  return (
    <div className="s-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold" style={{ color: 'var(--ink)' }}>
          Transaksi terkini
        </h3>
        <a
          href="/dashboard/transactions"
          className="text-xs font-semibold hover:underline inline-flex items-center gap-1"
          style={{ color: 'var(--emerald-700)' }}
        >
          Semua transaksi <ArrowRight className="size-3" />
        </a>
      </div>
      {recent.length === 0 ? (
        <p className="text-sm py-6 text-center" style={{ color: 'var(--ink-soft)' }}>
          Belum ada transaksi bulan ini.
        </p>
      ) : (
        <div className="space-y-1">
          {recent.map((tx, i) => {
            const cat = categoryStyle(tx.category, tx.type)
            const pos = tx.type === 'income'
            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 py-2.5"
                style={{ borderBottom: i < recent.length - 1 ? '1px solid var(--border-soft)' : 'none' }}
              >
                <div
                  className="size-9 rounded-[10px] flex items-center justify-center text-base shrink-0"
                  style={{ background: cat.tint }}
                >
                  {cat.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-medium truncate" style={{ color: 'var(--ink)' }}>
                    {tx.description || tx.category}
                  </p>
                  <p className="text-[11.5px] truncate" style={{ color: 'var(--ink-soft)' }}>
                    {tx.category}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className="num text-[13.5px] font-semibold leading-tight"
                    style={{ color: pos ? 'var(--emerald-700)' : 'var(--ink)' }}
                  >
                    {pos ? '+' : tx.type === 'expense' ? '−' : ''}{formatCurrency(tx.amount)}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                    {relativeTime(tx.date)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
