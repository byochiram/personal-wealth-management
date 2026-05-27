'use client'

import { ArrowRight } from 'lucide-react'
import { formatCompactCurrency } from '@/lib/utils'

interface GoalsWidgetProps {
  goals: Array<{ id: string; name: string; target_amount: number; current_amount: number; deadline: string | null }>
}

// Per dashboard-refine.jsx — emoji per goal name + tier-colored progress
// bars (emerald → amber → coral cycling). ETA shown as small text on right.
function goalEmoji(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('rumah') || n.includes('dp') || n.includes('kpr')) return '🏡'
  if (n.includes('liburan') || n.includes('travel') || n.includes('honeymoon')) return '✈️'
  if (n.includes('pensiun') || n.includes('retire')) return '🌴'
  if (n.includes('mobil') || n.includes('motor') || n.includes('kendaraan')) return '🚗'
  if (n.includes('pendidikan') || n.includes('sekolah') || n.includes('kuliah')) return '🎓'
  if (n.includes('umroh') || n.includes('haji')) return '🕌'
  if (n.includes('darurat') || n.includes('emergency')) return '🛡️'
  if (n.includes('bisnis') || n.includes('usaha')) return '💼'
  if (n.includes('gadget') || n.includes('hp') || n.includes('iphone')) return '📱'
  if (n.includes('nikah') || n.includes('wedding')) return '💒'
  return '🎯'
}

const GOAL_COLORS = ['var(--emerald-500)', 'var(--amber-500)', 'var(--coral-500)']

function etaLabel(deadline: string | null): string | null {
  if (!deadline) return null
  const d = new Date(deadline)
  return d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
}

export function GoalsWidget({ goals }: GoalsWidgetProps) {
  if (goals.length === 0) {
    return (
      <div className="s-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="caps">Tujuan Keuangan</p>
            <h3 className="text-base font-semibold mt-0.5" style={{ color: 'var(--ink)' }}>
              Belum ada goal
            </h3>
          </div>
          <a href="/dashboard/goals" className="text-xs font-medium hover:underline" style={{ color: 'var(--emerald-700)' }}>
            Buat sekarang →
          </a>
        </div>
        <p className="text-sm py-4 text-center" style={{ color: 'var(--ink-soft)' }}>
          Set target keuangan biar ada arah — &ldquo;DP Rumah&rdquo;, &ldquo;Liburan Bali&rdquo;, dll.
        </p>
      </div>
    )
  }

  return (
    <div className="s-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold" style={{ color: 'var(--ink)' }}>
          Goals aktif
        </h3>
        <a href="/dashboard/goals" className="text-xs font-semibold hover:underline inline-flex items-center gap-1" style={{ color: 'var(--emerald-700)' }}>
          Lihat semua <ArrowRight className="size-3" />
        </a>
      </div>
      <div className="space-y-4">
        {goals.slice(0, 3).map((g, i) => {
          const pct = g.target_amount > 0 ? Math.min(100, (g.current_amount / g.target_amount) * 100) : 0
          const color = GOAL_COLORS[i % GOAL_COLORS.length]
          const eta = etaLabel(g.deadline)
          return (
            <div key={g.id}>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-sm font-medium truncate flex items-center gap-1.5" style={{ color: 'var(--ink)' }}>
                  <span>{goalEmoji(g.name)}</span>
                  {g.name}
                </span>
                <span className="num text-xs shrink-0" style={{ color: 'var(--ink-muted)' }}>
                  {pct.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full overflow-hidden mb-1" style={{ background: 'var(--surface-2)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px]" style={{ color: 'var(--ink-soft)' }}>
                <span className="num">
                  {formatCompactCurrency(g.current_amount)} / {formatCompactCurrency(g.target_amount)}
                </span>
                {eta && <span>est. {eta}</span>}
              </div>
            </div>
          )
        })}
      </div>
      <a
        href="/dashboard/goals"
        className="mt-4 w-full inline-flex items-center justify-center py-2 rounded-lg border-dashed text-xs font-medium transition hover:bg-[var(--surface-2)]"
        style={{ borderWidth: 1, borderColor: 'var(--border)', color: 'var(--ink-muted)' }}
      >
        + Tambah goal baru
      </a>
    </div>
  )
}
