'use client'

/**
 * Calm Mode — global state for masking loss-colored numbers.
 *
 * Loss aversion (Kahneman-Tversky 1979): kerugian terasa ~2× lebih sakit
 * daripada keuntungan setara. Investor sering panic-sell saat liat merah
 * di portfolio. Calm Mode mengaburkan angka loss agar user bisa pakai app
 * tanpa terpicu reaksi emosi.
 *
 * Why a context (not local-state-with-localStorage)?
 *   Sebelumnya CalmModeToggle pake local state + localStorage. Tiap instance
 *   read sendiri, jadi kalau ada >1 toggle di page (mis. di header + profile),
 *   klik salah satu tidak sync ke yang lain sampai reload. Sekarang context
 *   shared, semua toggle in-sync.
 *
 * Persisted di localStorage. Per-device, ngga sync ke server.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

interface CalmContextValue {
  calm: boolean
  toggle: () => void
  setCalm: (v: boolean) => void
}

const CalmContext = createContext<CalmContextValue | null>(null)
const STORAGE_KEY = 'pwm.calm-mode'

export function CalmModeProvider({ children }: { children: React.ReactNode }) {
  const [calm, setCalmState] = useState(false)

  useEffect(() => {
    try {
      setCalmState(localStorage.getItem(STORAGE_KEY) === 'true')
    } catch {
      /* ignore */
    }
  }, [])

  // Mirror to body attribute so global CSS can target without per-component wiring
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (calm) document.body.setAttribute('data-calm', 'true')
    else document.body.removeAttribute('data-calm')
  }, [calm])

  const setCalm = useCallback((v: boolean) => {
    setCalmState(v)
    try {
      localStorage.setItem(STORAGE_KEY, String(v))
    } catch {
      /* ignore */
    }
  }, [])

  const toggle = useCallback(() => setCalm(!calm), [calm, setCalm])

  return (
    <CalmContext.Provider value={{ calm, toggle, setCalm }}>
      {children}
    </CalmContext.Provider>
  )
}

export function useCalmMode() {
  const ctx = useContext(CalmContext)
  if (!ctx) throw new Error('useCalmMode must be used inside <CalmModeProvider>')
  return ctx
}
