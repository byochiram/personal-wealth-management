'use client'

import { formatCurrency } from '@/lib/utils'
import type { Transaction } from '@/types'

interface HealthScorePanelProps {
  monthTransactions: Transaction[]
  yearTransactions: Transaction[]
  savingRate: number
  liquidTotal: number
  debtTotal: number
  efCurrent: number
  efTarget: number
}

export function HealthScorePanel({
  monthTransactions, yearTransactions, savingRate, liquidTotal, debtTotal, efCurrent, efTarget,
}: HealthScorePanelProps) {
  // Silence unused var (reserved for future EF-vs-target breakdown)
  void efTarget

  const monthExpense = monthTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  // 1. Saving rate score (20pts)
  const savingRateScore = Math.min(20, Math.max(0, (savingRate / 30) * 20))

  // 2. Debt ratio score (20pts)
  const debtRatio = liquidTotal > 0 ? debtTotal / liquidTotal : 5
  const debtScore = debtRatio <= 0 ? 20 : debtRatio <= 1 ? 20 : debtRatio <= 2 ? 15 : debtRatio <= 4 ? 10 : 5

  // 3. Emergency fund score (20pts)
  const efMonths = monthExpense > 0 ? efCurrent / monthExpense : 0
  const efScore = efMonths >= 6 ? 20 : efMonths >= 3 ? 15 : efMonths >= 1 ? 10 : 5

  // 4. Growth score (20pts)
  const growthScore = (() => {
    const inc = yearTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const exp = yearTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    if (inc === 0) return 5
    const ratio = (inc - exp) / inc
    return ratio >= 0.3 ? 20 : ratio >= 0.15 ? 15 : ratio >= 0 ? 10 : 0
  })()

  // 5. Budget adherence (20pts)
  const budgetScore = savingRate > 0 ? 15 : 5

  const total = Math.round(savingRateScore + debtScore + efScore + growthScore + budgetScore)
  const grade = total >= 85 ? 'A' : total >= 70 ? 'B' : total >= 55 ? 'C' : total >= 40 ? 'D' : 'E'
  const verdict = total >= 85 ? 'Excellent'
    : total >= 70 ? 'Good'
    : total >= 55 ? 'Fair'
    : total >= 40 ? 'Needs Work'
    : 'Critical'
  const verdictDesc = total >= 85 ? 'Kondisi finansialmu luar biasa — pertahankan ritme ini.'
    : total >= 70 ? 'Finansialmu sehat. Masih ada ruang untuk optimasi.'
    : total >= 55 ? 'Ada beberapa area yang perlu diperbaiki.'
    : total >= 40 ? 'Banyak aspek yang butuh perhatian segera.'
    : 'Kondisi darurat — prioritaskan stabilisasi.'

  // Score ring
  const totalCapped = Math.min(100, Math.max(0, total))
  const circumference = 2 * Math.PI * 62
  const ringOffset = circumference - (totalCapped / 100) * circumference
  const ringColor = total >= 70 ? 'var(--butter-400)'
    : total >= 55 ? 'var(--orange-400)'
    : 'var(--danger)'

  const burnMonths = monthExpense > 0 ? liquidTotal / monthExpense : 0
  const burnColor = burnMonths >= 6 ? 'var(--butter-600)' : burnMonths >= 3 ? 'var(--orange-500)' : 'var(--danger)'

  const components = [
    { label: 'Saving Rate', v: savingRateScore, max: 20 },
    { label: 'Debt Ratio',  v: debtScore,       max: 20 },
    { label: 'Emergency',   v: efScore,         max: 20 },
    { label: 'Growth',      v: growthScore,     max: 20 },
    { label: 'Budget',      v: budgetScore,     max: 20 },
  ]

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-6 sm:p-8"
      style={{
        background:
          'linear-gradient(135deg, var(--butter-50) 0%, var(--surface) 40%, var(--surface) 100%)',
        borderColor: 'var(--border-soft)',
      }}
    >
      {/* Decorative background blob */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{ background: 'var(--butter-200)' }}
      />

      <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left: Score ring + verdict */}
        <div className="lg:col-span-1">
          <p className="caps">Financial Health</p>
          <h3 className="mt-1 text-lg font-semibold" style={{ color: 'var(--ink)' }}>
            Skor Kesehatan Finansial
          </h3>

          <div className="mt-6 flex items-center gap-5">
            <div className="relative shrink-0">
              <svg width={150} height={150} viewBox="0 0 150 150">
                <circle cx={75} cy={75} r={62} fill="none" stroke="var(--surface-2)" strokeWidth={12} />
                <circle
                  cx={75} cy={75} r={62} fill="none"
                  stroke={ringColor}
                  strokeWidth={12}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={ringOffset}
                  transform="rotate(-90 75 75)"
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="num font-bold tabular leading-none" style={{ fontSize: 44, color: 'var(--ink)' }}>
                  {total}
                </span>
                <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-soft)' }}>
                  /100
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold"
                  style={{ background: ringColor, color: 'var(--ink)' }}
                >
                  {grade}
                </span>
                <span className="text-base font-semibold" style={{ color: 'var(--ink)' }}>
                  {verdict}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                {verdictDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Middle: Component bars */}
        <div className="lg:col-span-1">
          <p className="caps">Breakdown</p>
          <h3 className="mt-1 text-lg font-semibold" style={{ color: 'var(--ink)' }}>
            5 Pilar Kesehatan
          </h3>
          <div className="mt-5 space-y-2.5">
            {components.map((s) => {
              const pct = (s.v / s.max) * 100
              const barColor = s.v >= s.max * 0.7 ? 'var(--butter-400)'
                : s.v >= s.max * 0.4 ? 'var(--orange-400)'
                : 'var(--danger)'
              return (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium" style={{ color: 'var(--ink)' }}>
                      {s.label}
                    </span>
                    <span className="num tabular font-semibold" style={{ color: 'var(--ink)' }}>
                      {Math.round(s.v)}<span style={{ color: 'var(--ink-soft)' }}>/{s.max}</span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: barColor }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Burn rate & key stats */}
        <div className="lg:col-span-1">
          <p className="caps">Runway / Burn Rate</p>
          <h3 className="mt-1 text-lg font-semibold" style={{ color: 'var(--ink)' }}>
            Cash Coverage
          </h3>
          <div
            className="mt-5 rounded-xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)' }}
          >
            <p className="num tabular font-bold leading-none" style={{ fontSize: 48, color: burnColor }}>
              {burnMonths.toFixed(1)}
              <span className="text-base font-normal ml-1.5" style={{ color: 'var(--ink-muted)' }}>bulan</span>
            </p>
            <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
              Tanpa pemasukan baru, liquid cash bisa cover pengeluaran bulanan selama{' '}
              <span className="font-semibold" style={{ color: 'var(--ink)' }}>{burnMonths.toFixed(1)} bulan</span>.
            </p>
            <div className="mt-4 pt-3 border-t space-y-1.5" style={{ borderColor: 'var(--border-soft)' }}>
              <div className="flex items-center justify-between text-[11px]">
                <span style={{ color: 'var(--ink-muted)' }}>Liquid cash</span>
                <span className="num font-semibold" style={{ color: 'var(--ink)' }}>{formatCurrency(liquidTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span style={{ color: 'var(--ink-muted)' }}>Pengeluaran/bulan</span>
                <span className="num font-semibold" style={{ color: 'var(--ink)' }}>{formatCurrency(monthExpense)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
