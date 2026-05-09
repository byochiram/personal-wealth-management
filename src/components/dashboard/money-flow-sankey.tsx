'use client'

/**
 * Money Flow Sankey — Stockbit-style flow viz applied to personal finance.
 *
 *   Income source (left)  →  Total Pemasukan (middle)  →  Spending category (right)
 *
 * Three semantic groups colored consistently:
 *   - Income     → emerald
 *   - Expense    → coral
 *   - Saving     → amber
 *   - Investment → sky
 *
 * Why a middle node? It anchors the visual: every link width sums into it on
 * one side and back out the other, so the user instantly sees that all money
 * is accounted for. (A direct source→category bipartite layout looks busy
 * with N×M crossings even for 5 categories on each side.)
 *
 * Uses recharts' built-in Sankey. Custom node renderer matches our palette;
 * default link gradient is replaced with category-tinted strokes.
 */

import { useMemo } from 'react'
import {
  Sankey,
  Tooltip,
  Layer,
  Rectangle,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

export type FlowKind = 'income' | 'expense' | 'saving' | 'investment' | 'middle'

interface CategoryAmount {
  name: string
  amount: number
  kind: FlowKind
}

interface MoneyFlowSankeyProps {
  income: CategoryAmount[]      // left side
  outflow: CategoryAmount[]     // right side: expense + saving + investment
  middleLabel?: string          // default "Total Pemasukan"
  height?: number               // default 360
  emptyMessage?: string
}

// ─── Color palette ──────────────────────────────────────────────────────
const COLORS: Record<FlowKind, { node: string; link: string }> = {
  income:     { node: '#10B981', link: 'rgba(16, 185, 129, 0.45)' }, // emerald
  expense:    { node: '#EF4444', link: 'rgba(239, 68, 68, 0.45)' },  // coral
  saving:     { node: '#F59E0B', link: 'rgba(245, 158, 11, 0.45)' }, // amber
  investment: { node: '#0EA5E9', link: 'rgba(14, 165, 233, 0.45)' }, // sky
  middle:     { node: '#6366F1', link: 'rgba(99, 102, 241, 0.30)' }, // indigo accent for hub
}

// ─── Custom node renderer — bar + name + amount ─────────────────────────
interface SankeyNodeData {
  name: string
  value: number
  payload?: { kind?: FlowKind }
}

function renderNode(props: {
  x: number
  y: number
  width: number
  height: number
  index: number
  payload: SankeyNodeData
  containerWidth: number
}) {
  const { x, y, width, height, payload, containerWidth } = props
  const kind: FlowKind = payload.payload?.kind ?? 'income'
  const color = COLORS[kind].node
  const isLeft = x < containerWidth / 2
  const labelX = isLeft ? x - 8 : x + width + 8
  const anchor = isLeft ? 'end' : 'start'

  return (
    <Layer>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={Math.max(height, 4)}
        fill={color}
        fillOpacity={0.95}
      />
      <text
        x={labelX}
        y={y + height / 2 - 4}
        textAnchor={anchor}
        dominantBaseline="middle"
        style={{
          fontSize: 11,
          fontWeight: 600,
          fill: 'currentColor',
        }}
      >
        {payload.name}
      </text>
      <text
        x={labelX}
        y={y + height / 2 + 9}
        textAnchor={anchor}
        dominantBaseline="middle"
        style={{
          fontSize: 10,
          fill: 'currentColor',
          opacity: 0.65,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {formatCurrency(payload.value)}
      </text>
    </Layer>
  )
}

// ─── Custom link renderer — colored by source/target kind ───────────────
interface SankeyLinkData {
  sourceX: number
  sourceY: number
  sourceControlX: number
  targetX: number
  targetY: number
  targetControlX: number
  linkWidth: number
  payload: {
    target: { payload?: { kind?: FlowKind } }
    source: { payload?: { kind?: FlowKind } }
  }
}

function renderLink(props: SankeyLinkData) {
  const {
    sourceX, sourceY, sourceControlX,
    targetX, targetY, targetControlX,
    linkWidth, payload,
  } = props
  // Color the link by target kind on outflow side, source kind on inflow side
  const targetKind = payload.target.payload?.kind
  const sourceKind = payload.source.payload?.kind
  const kind: FlowKind = (targetKind && targetKind !== 'middle')
    ? targetKind
    : (sourceKind ?? 'income')
  const stroke = COLORS[kind].link

  return (
    <Layer>
      <path
        d={`
          M${sourceX},${sourceY}
          C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
        `}
        stroke={stroke}
        strokeWidth={Math.max(linkWidth, 1)}
        fill="none"
        strokeOpacity={1}
      />
    </Layer>
  )
}

// ─── Main component ─────────────────────────────────────────────────────

export function MoneyFlowSankey({
  income,
  outflow,
  middleLabel = 'Total Pemasukan',
  height = 360,
  emptyMessage = 'Belum ada transaksi untuk periode ini.',
}: MoneyFlowSankeyProps) {
  const data = useMemo(() => {
    const incomeFiltered = income.filter((c) => c.amount > 0)
    const outflowFiltered = outflow.filter((c) => c.amount > 0)

    if (incomeFiltered.length === 0 && outflowFiltered.length === 0) {
      return null
    }

    const totalIn = incomeFiltered.reduce((s, c) => s + c.amount, 0)
    const totalOut = outflowFiltered.reduce((s, c) => s + c.amount, 0)
    // The middle node value is determined by recharts from link totals.

    // Build node + link arrays. Index order matters for source/target refs.
    const nodes: { name: string; kind: FlowKind }[] = []
    const links: { source: number; target: number; value: number }[] = []

    // Income nodes (left)
    const incomeStartIdx = nodes.length
    incomeFiltered.forEach((c) => nodes.push({ name: c.name, kind: c.kind }))

    // Middle node
    const middleIdx = nodes.length
    nodes.push({ name: middleLabel, kind: 'middle' })

    // Outflow nodes (right)
    const outflowStartIdx = nodes.length
    outflowFiltered.forEach((c) => nodes.push({ name: c.name, kind: c.kind }))

    // Income → Middle links
    incomeFiltered.forEach((c, i) => {
      links.push({ source: incomeStartIdx + i, target: middleIdx, value: c.amount })
    })

    // If outflow > income (deficit), the middle still needs balanced flow.
    // We scale outflow links to the income total proportionally so the diagram
    // doesn't get visually weird. The amount labels still show real values.
    const scale = totalIn > 0 && totalOut > 0 ? Math.min(1, totalIn / totalOut) : 1

    outflowFiltered.forEach((c, i) => {
      links.push({
        source: middleIdx,
        target: outflowStartIdx + i,
        value: Math.max(c.amount * scale, 1),
      })
    })

    // Edge case: only income or only outflow → recharts needs at least one link
    if (links.length === 0) return null

    return { nodes, links }
  }, [income, outflow, middleLabel])

  if (!data) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border text-sm"
        style={{
          height,
          color: 'var(--ink-soft)',
          borderColor: 'var(--border-soft)',
          background: 'var(--surface-2)',
        }}
      >
        {emptyMessage}
      </div>
    )
  }

  return (
    <div
      className="rounded-xl"
      style={{ width: '100%', height, color: 'var(--ink)' }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <Sankey
          data={data}
          nodePadding={20}
          nodeWidth={10}
          margin={{ top: 14, right: 130, bottom: 14, left: 130 }}
          link={renderLink as never}
          node={renderNode as never}
        >
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const p = payload[0]
              const data = p.payload as { name?: string; source?: { name: string }; target?: { name: string }; value?: number; payload?: { value?: number } }
              if (data.source && data.target) {
                return (
                  <div
                    className="rounded-md border px-2.5 py-1.5 text-xs shadow-md"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--ink)',
                    }}
                  >
                    <p className="font-medium">
                      {data.source.name} → {data.target.name}
                    </p>
                    <p className="num tabular mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                      {formatCurrency(data.payload?.value ?? data.value ?? 0)}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
        </Sankey>
      </ResponsiveContainer>
    </div>
  )
}
