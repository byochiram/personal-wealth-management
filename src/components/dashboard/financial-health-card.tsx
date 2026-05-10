'use client'

/**
 * Financial Health Score card — headline metric for the dashboard.
 *
 * Compact view (default): big score (0-100), tier badge, mini ring chart,
 * 1-line description. Click "Detail" to expand into full breakdown of
 * 7 indicators with status + tip per indicator.
 *
 * Design tenets:
 *   - The score IS the headline — bigger than anything else around it
 *   - Tier color (red/amber/green/emerald) does most of the work
 *   - Breakdown should feel diagnostic ("why is my score X?"), not punitive
 *   - Skor 0/N/A state should encourage user to add data, not shame them
 */

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, Activity, Sparkles } from 'lucide-react'
import type { FHSResult, FHSIndicator } from '@/lib/financial-health'
import { EduTip } from '@/components/edu/edu-tip'

interface Props {
  result: FHSResult
  /** Show the breakdown panel by default */
  defaultExpanded?: boolean
}

const GROUP_ICONS: Record<FHSIndicator['group'], string> = {
  Spend: '💸',
  Save: '🛡️',
  Borrow: '💳',
  Plan: '🎯',
}

export function FinancialHealthCard({ result, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const { score, tier, tierMeta, breakdown } = result

  // Group indicators by category for the breakdown panel
  const grouped = useMemo(() => {
    const out: Record<string, FHSIndicator[]> = { Spend: [], Save: [], Borrow: [], Plan: [] }
    for (const ind of breakdown) out[ind.group].push(ind)
    return out
  }, [breakdown])

  // Calculate progress arc — 0-100 score → 0-360 degrees
  const arcAngle = (score / 100) * 360

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: '0 4px 12px -4px rgba(0,0,0,0.06)',
      }}
    >
      {/* ─── Header / Compact view ─────────────────────────────── */}
      <div className="p-5 sm:p-6 flex items-start gap-4">
        {/* Big circular score */}
        <div className="relative shrink-0">
          <div
            className="size-24 sm:size-28 rounded-full flex items-center justify-center"
            style={{
              background: `conic-gradient(${tierMeta.color} ${arcAngle}deg, var(--surface-2) 0deg)`,
            }}
          >
            <div
              className="size-[80%] rounded-full flex flex-col items-center justify-center"
              style={{ background: 'var(--surface)' }}
            >
              <p
                className="num tabular text-3xl sm:text-4xl font-bold leading-none"
                style={{ color: tierMeta.color }}
              >
                {score}
              </p>
              <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                /100
              </p>
            </div>
          </div>
        </div>

        {/* Right side: tier + description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="caps">Skor Kesehatan Finansial</p>
            <EduTip topic="financial-health" side="bottom" />
          </div>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide"
              style={{
                background: `${tierMeta.color}1A`,  // 10% opacity
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
          <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--ink)' }}>
            {tierMeta.description}
          </p>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold transition hover:underline"
            style={{ color: 'var(--ink-soft)' }}
          >
            {expanded ? 'Sembunyikan' : 'Lihat'} breakdown
            {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </button>
        </div>
      </div>

      {/* ─── Breakdown panel (expand) ──────────────────────────── */}
      {expanded && (
        <div
          className="border-t px-5 sm:px-6 py-4 space-y-4"
          style={{ borderColor: 'var(--border-soft)', background: 'var(--surface-2)' }}
        >
          {(['Spend', 'Save', 'Borrow', 'Plan'] as const).map((group) => {
            const items = grouped[group]
            if (items.length === 0) return null
            return (
              <div key={group}>
                <p
                  className="text-[10px] uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5"
                  style={{ color: 'var(--ink-soft)' }}
                >
                  <span>{GROUP_ICONS[group]}</span>
                  {group}
                </p>
                <div className="space-y-2">
                  {items.map((ind) => (
                    <IndicatorRow key={ind.key} indicator={ind} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function IndicatorRow({ indicator }: { indicator: FHSIndicator }) {
  const isNa = indicator.status === 'na'

  // Status color — matches the tier color scheme
  const statusColor = (() => {
    switch (indicator.status) {
      case 'good':    return '#10B981'
      case 'warning': return '#F59E0B'
      case 'poor':    return '#DC2626'
      case 'na':      return 'var(--ink-soft)'
    }
  })()

  return (
    <div
      className="rounded-lg border p-3"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border-soft)',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <p className="text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>
          {indicator.label}
        </p>
        {!isNa && (
          <span
            className="num tabular text-xs font-bold shrink-0"
            style={{ color: statusColor }}
          >
            {indicator.score}/100
          </span>
        )}
        {isNa && (
          <span className="text-[10px] uppercase tracking-wide opacity-60 shrink-0" style={{ color: 'var(--ink-soft)' }}>
            N/A
          </span>
        )}
      </div>
      <p className="text-[12px] leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
        {indicator.explainer}
      </p>
      {indicator.tip && (
        <p
          className="text-[11.5px] leading-relaxed mt-1.5 pt-1.5 border-t italic"
          style={{ color: 'var(--ink-soft)', borderColor: 'var(--border-soft)' }}
        >
          💡 {indicator.tip}
        </p>
      )}
    </div>
  )
}
