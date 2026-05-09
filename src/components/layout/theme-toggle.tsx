'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/components/theme/theme-provider'

/**
 * Header theme toggle — compact icon button that cycles light → dark → auto.
 * Backed by the global ThemeProvider so it's in sync with the segmented
 * picker in /dashboard/profile.
 */
export function ThemeToggle() {
  const { mode, setMode } = useTheme()

  function cycle() {
    const next = mode === 'light' ? 'dark' : mode === 'dark' ? 'auto' : 'light'
    setMode(next)
  }

  const Icon = mode === 'light' ? Sun : mode === 'dark' ? Moon : Monitor
  const label = mode === 'light' ? 'Mode terang' : mode === 'dark' ? 'Mode gelap' : 'Mode otomatis'

  return (
    <button
      type="button"
      onClick={cycle}
      className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-[var(--surface-2)]"
      aria-label={`${label} (klik untuk ubah)`}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
