'use client'

import { useT } from '@/lib/i18n/context'
import { formatCurrency, formatCompactCurrency } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: number
  note?: string
  direction?: 'up' | 'down'
  /** Color identity: tints background + accent indicator */
  kind?: 'income' | 'expense' | 'saving' | 'net'
}

export function KpiCard({ label, value, note, direction, kind }: KpiCardProps) {
  const t = useT()
  // Per-kind palette: gradient hero card with tinted bg + icon-box +
  // delta chip. Combines the previous colorful hero look (user prefers)
  // with the dashboard-refine.jsx icon-box + delta chip pattern.
  const palette = (() => {
    switch (kind) {
      case 'income':
        return {
          cardBg: 'linear-gradient(135deg, var(--emerald-50), var(--surface) 70%)',
          ring: 'var(--emerald-100)',
          iconBg: 'var(--emerald-100)',
          accent: 'var(--emerald-700)',
          chipBg: 'var(--emerald-100)',
          icon: '💰',
        }
      case 'expense':
        return {
          cardBg: 'linear-gradient(135deg, var(--coral-50), var(--surface) 70%)',
          ring: 'var(--coral-100)',
          iconBg: 'var(--coral-100)',
          accent: 'var(--coral-700)',
          chipBg: 'var(--coral-100)',
          icon: '💸',
        }
      case 'saving':
        return {
          cardBg: 'linear-gradient(135deg, var(--amber-50), var(--surface) 70%)',
          ring: 'var(--amber-100)',
          iconBg: 'var(--amber-100)',
          accent: 'var(--amber-700)',
          chipBg: 'var(--amber-100)',
          icon: '🏦',
        }
      case 'net':
        return value >= 0 ? {
          cardBg: 'linear-gradient(135deg, var(--sky-50), var(--surface) 70%)',
          ring: 'var(--sky-100)',
          iconBg: 'var(--sky-100)',
          accent: 'var(--sky-600)',
          chipBg: 'var(--sky-100)',
          icon: '📈',
        } : {
          cardBg: 'linear-gradient(135deg, var(--coral-50), var(--surface) 70%)',
          ring: 'var(--coral-100)',
          iconBg: 'var(--coral-100)',
          accent: 'var(--coral-700)',
          chipBg: 'var(--coral-100)',
          icon: '📉',
        }
      default:
        return {
          cardBg: 'var(--surface)',
          ring: 'var(--border)',
          iconBg: 'var(--surface-2)',
          accent: 'var(--ink)',
          chipBg: 'var(--surface-2)',
          icon: '•',
        }
    }
  })()

  return (
    <div
      className="rounded-2xl p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
      style={{
        background: palette.cardBg,
        border: `1px solid ${palette.ring}`,
      }}
    >
      {/* Header row — icon-box left + delta chip right (per mockup) */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div
          className="size-10 rounded-[10px] flex items-center justify-center text-base"
          style={{ background: palette.iconBg }}
        >
          {palette.icon}
        </div>
        {direction && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold"
            style={{ background: palette.chipBg, color: palette.accent }}
          >
            {direction === 'up' ? '↑' : '↓'}
          </span>
        )}
      </div>
      {/* Label small + Value big — per dashboard-refine.jsx spec */}
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--ink-muted)' }}>
        {label}
      </p>
      <p
        className="num tabular text-xl sm:text-[22px] leading-tight font-bold"
        style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}
      >
        {/* Compact on mobile, full on sm+ */}
        <span className="sm:hidden">{formatCompactCurrency(value)}</span>
        <span className="hidden sm:inline">{formatCurrency(value)}</span>
      </p>
      <p className="text-[11px] mt-1" style={{ color: 'var(--ink-soft)' }}>
        {note ?? t('dashboard.current_month')}
      </p>
    </div>
  )
}
