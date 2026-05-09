'use client'

/**
 * Theme provider — handles light/dark/auto mode.
 *
 * - Reads from localStorage 'pwm-theme' on mount
 * - Applies .dark class to <html> when resolved theme is dark
 * - Listens to system preference changes when mode = 'auto'
 * - Provides hook for child components to read/set
 *
 * Persistence is localStorage (per-device). We could sync to
 * profiles.theme_mode in a follow-up, but local is more responsive.
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type ThemeMode = 'light' | 'dark' | 'auto'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  mode: ThemeMode             // user preference
  resolved: ResolvedTheme     // actual applied theme
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'pwm-theme'

function readStored(): ThemeMode {
  if (typeof window === 'undefined') return 'auto'
  const v = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
  return v === 'light' || v === 'dark' || v === 'auto' ? v : 'auto'
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolve(mode: ThemeMode): ResolvedTheme {
  if (mode === 'auto') return getSystemTheme()
  return mode
}

function applyTheme(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('auto')
  const [resolved, setResolved] = useState<ResolvedTheme>('light')

  // Initial mount: read storage + apply
  useEffect(() => {
    const stored = readStored()
    const r = resolve(stored)
    setModeState(stored)
    setResolved(r)
    applyTheme(r)
  }, [])

  // Listen to system theme changes when in auto mode
  useEffect(() => {
    if (mode !== 'auto') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    function onChange() {
      const r: ResolvedTheme = mq.matches ? 'dark' : 'light'
      setResolved(r)
      applyTheme(r)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [mode])

  const setMode = useCallback((newMode: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, newMode)
    const r = resolve(newMode)
    setModeState(newMode)
    setResolved(r)
    applyTheme(r)
  }, [])

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
