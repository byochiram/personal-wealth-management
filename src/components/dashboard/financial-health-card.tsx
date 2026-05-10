'use client'

/**
 * Financial Health Score card — headline diagnostic for the dashboard.
 *
 * Minimalist 3-column layout:
 *   1. BIG score + tier + 1-line verdict (left, the headline)
 *   2. Compact indicator bars per pillar (middle, no inline tips)
 *   3. Burn rate / runway panel (right)
 *
 * Tips per indicator hidden by default — surface via native browser
 * tooltip (title attribute) on hover. Keeps the visual surface clean.
 *
 * Design tenets:
 *   - The score IS the headline — make it punchy (text-6xl/7xl)
 *   - Tier color does the visual storytelling
 *   - Breakdown bars are scannable in 2 seconds, not a wall of text
 *   - Detail / tips → hover, not inline
 */

import { useMemo } from 'react'
import { Activity, Sparkles } from 'lucide-react'
import type { FHSResult, FHSIndicator } from '@/lib/financial-health'
import { formatCurrency } from '@/lib/utils'
import { EduTip } from '@/components/edu/edu-tip'

interface Props {
  result: FHSResult
  /** Liquid balance — for burn rate calc */
  liquidBalance: number
  /** Avg monthly expense — for burn rate calc */
  monthlyExpense: number
}

const GROUP_LABELS: Record<FHSIndicator['group'], string> = {
  Spend: 'Spend',
  Save: 'Save',
  Borrow: 'Borrow',
  Plan: 'Plan',
}

export function FinancialHealthCard({ result, liquidBalance, monthlyExpense }: Props) {
  const { score, tier, tierMeta, breakdown } = result

  // Group indicators by pillar
  const grouped = useMemo(() => {
    const out: Record<string, FHSIndicator[]> = { Spend: [], Save: [], Borrow: [], Plan: [] }
    for (const ind of breakdown) out[ind.group].push(ind)
    return out
  }, [breakdown])

  // Score arc — 0-100 → 0-360deg conic gradient
  const arcAngle = (score / 100) * 360

  // Burn rate
  const burnMonths = monthlyExpense > 0 ? liquidBalance / monthlyExpense : 0
  const burnColor = burnMonths >= 6 ? '#10B981'
    : burnMonths >= 3 ? '#F59E0B'
    : burnMonths >= 1 ? '#EA580C'
    : '#DC2626'
  const burnVerdict = burnMonths >= 6 ? 'Sangat aman'
    : burnMonths >= 3 ? 'Cukup aman'
    : burnMonths >= 1 ? 'Tipis'
    : 'Risiko tinggi'

  return (
    <div
      className="rounded-2xl border p-6 sm:p-8"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: '0 4px 12px -4px rgba(0,0,0,0.06)',
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ─── Col 1: BIG Score + Tier + Verdict ──────────────── */}
        <div className="lg:col-span-4">
          <div className="flex items-center gap-1.5 mb-3">
            <p className="caps">Skor Kesehatan Finansial</p>
            <EduTip topic="financial-health" side="bottom" />
          </div>

          {/* Score with circular arc — visually anchors the card */}
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div
                className="size-36 sm:size-40 rounded-full flex items-center justify-center"
                style={{
                  background: `conic-gradient(${tierMeta.color} ${arcAngle}deg, var(--surface-2) 0deg)`,
                }}
              >
                <div
                  className="size-[82%] rounded-full flex flex-col items-center justify-center"
                  style={{ background: 'var(--surface)' }}
                >
                  <p
                    className="num tabular font-bold leading-none"
                    style={{ color: tierMeta.color, fontSize: 56 }}
                  >
                    {score}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--ink-soft)' }}>
                    /100
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide"
                  style={{
                    background: `${tierMeta.color}1A`,
                    color: tierMeta.color,
                  }}
                >
                  <Activity className="size-3" />
                  {tierMeta.label}
                </span>
                {tier === 'thriving' && (
                  <Sparkles className="size-4" style={{ color: tierMeta.color }} />
                )}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                {tierMeta.description}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Col 2: Compact bars per pillar (no inline tips) ───── */}
        <div className="lg:col-span-5 lg:border-l lg:border-r lg:px-6" style={{ borderColor: 'var(--border-soft)' }}>
          <p className="caps mb-3">Breakdown</p>
          <div className="space-y-3">
            {(['Spend', 'Save', 'Borrow', 'Plan'] as const).map((group) => {
              const items = grouped[group]
              if (items.length === 0) return null
              return (
                <div key={group}>
                  <p
                    className="text-[9px] uppercase tracking-wider font-semibold mb-1.5"
                    style={{ color: 'var(--ink-soft)' }}
                  >
                    {GROUP_LABELS[group]}
                  </p>
                  <div className="space-y-1.5">
                    {items.map((ind) => (
                      <IndicatorBar key={ind.key} indicator={ind} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ─── Col 3: Burn rate / Runway ──────────────────────────── */}
        <div className="lg:col-span-3">
          <p className="caps">Runway / Burn Rate</p>
          <h4 className="text-base font-semibold mt-1" style={{ color: 'var(--ink)' }}>
            Cash Coverage
          </h4>
          <div
            className="mt-3 rounded-xl p-4"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border-soft)',
            }}
          >
            <p className="num tabular font-bold leading-none" style={{ fontSize: 40, color: burnColor }}>
              {burnMonths > 99 ? '99+' : burnMonths.toFixed(1)}
              <span className="text-sm font-normal ml-1.5" style={{ color: 'var(--ink-muted)' }}>
                bulan
              </span>
            </p>
            <p className="text-[11px] mt-2 leading-relaxed" style={{ color: burnColor }}>
              {burnVerdict}
            </p>
            <p className="text-[11px] mt-2 leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
              Tanpa pemasukan baru, liquid cash bisa cover{' '}
              <span className="font-semibold num" style={{ color: 'var(--ink)' }}>
                {burnMonths > 99 ? '> 99' : burnMonths.toFixed(1)} bulan
              </span> pengeluaran.
            </p>
            <div
              className="mt-3 pt-3 border-t space-y-1"
              style={{ borderColor: 'var(--border-soft)' }}
            >
              <div className="flex items-center justify-between text-[11px]">
                <span style={{ color: 'var(--ink-muted)' }}>Liquid cash</span>
                <span className="num font-semibold" style={{ color: 'var(--ink)' }}>
                  {formatCurrency(liquidBalance)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span style={{ color: 'var(--ink-muted)' }}>Pengeluaran/bln</span>
                <span className="num font-semibold" style={{ color: 'var(--ink)' }}>
                  {formatCurrency(monthlyExpense)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Compact one-line indicator: label + score on top, thin bar below.
 * Hover for full explainer + tip via native browser tooltip (title attr).
 * No inline tip clutter — keeps the breakdown scannable.
 */
function IndicatorBar({ indicator }: { indicator: FHSIndicator }) {
  const isNa = indicator.status === 'na'
  const barColor = (() => {
    if (isNa) return 'var(--ink-soft)'
    if (indicator.score >= 75) return '#10B981'
    if (indicator.score >= 50) return '#F59E0B'
    return '#DC2626'
  })()
  const pct = isNa ? 0 : Math.min(100, Math.max(0, indicator.score))

  // Hover tooltip combines explainer + tip (if any)
  const tooltip = indicator.tip
    ? `${indicator.explainer}\n\n💡 ${indicator.tip}`
    : indicator.explainer

  return (
    <div title={tooltip} className="cursor-help">
      <div className="flex items-center justify-between text-[11px] mb-1">
        <span style={{ color: 'var(--ink)' }}>
          {indicator.label}
        </span>
        <span
          className="num tabular font-semibold shrink-0"
          style={{ color: isNa ? 'var(--ink-soft)' : barColor }}
        >
          {isNa ? 'N/A' : `${indicator.score}`}
        </span>
      </div>
      <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
    </div>
  )
}
