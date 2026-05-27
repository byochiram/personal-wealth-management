'use client'

/**
 * Calm Mode Toggle — anti-panic UX. Now reads/writes via CalmModeProvider
 * so multiple instances (header + profile + investment page) stay in sync.
 */

import { Heart, HeartPulse } from 'lucide-react'
import { useCalmMode } from '@/components/privacy/calm-mode-provider'

export function CalmModeToggle({ compact = false }: { compact?: boolean }) {
  const { calm, toggle } = useCalmMode()

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition"
        style={{
          background: calm ? 'rgba(236,72,153,0.10)' : 'var(--surface-2)',
          color: calm ? '#EC4899' : 'var(--ink-muted)',
        }}
        title={calm ? 'Calm Mode aktif — P/L harian disamarkan' : 'Aktifkan Calm Mode — kurangi panic from market noise'}
      >
        {calm ? <HeartPulse className="size-3" /> : <Heart className="size-3" />}
        Calm Mode
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition border"
      style={{
        background: calm ? 'rgba(236,72,153,0.08)' : 'var(--surface)',
        borderColor: calm ? 'rgba(236,72,153,0.30)' : 'var(--border)',
        color: calm ? '#EC4899' : 'var(--ink-muted)',
      }}
      title={
        calm
          ? 'Calm Mode aktif — angka loss disamarkan untuk kurangi panic selling'
          : 'Aktifkan Calm Mode — bagus saat market sedang volatil'
      }
    >
      {calm ? <HeartPulse className="size-3.5" /> : <Heart className="size-3.5" />}
      <span>{calm ? 'Calm Mode ON' : 'Calm Mode'}</span>
    </button>
  )
}
