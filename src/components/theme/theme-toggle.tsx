'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from './theme-provider'

/**
 * Compact 3-button segmented control for theme selection.
 * Shows Light / Dark / Auto.
 */
export function ThemeToggle() {
  const { mode, setMode } = useTheme()

  const opts: Array<{ value: 'light' | 'dark' | 'auto'; label: string; icon: React.ReactNode }> = [
    { value: 'light', label: 'Terang', icon: <Sun className="size-3.5" /> },
    { value: 'dark', label: 'Gelap', icon: <Moon className="size-3.5" /> },
    { value: 'auto', label: 'Auto', icon: <Monitor className="size-3.5" /> },
  ]

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-lg p-0.5 border"
      style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
    >
      {opts.map((opt) => {
        const active = mode === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setMode(opt.value)}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition"
            style={{
              backgroundColor: active ? 'var(--surface)' : 'transparent',
              color: active ? 'var(--ink)' : 'var(--ink-muted)',
              boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            {opt.icon}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
