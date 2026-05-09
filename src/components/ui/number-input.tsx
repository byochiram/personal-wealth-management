'use client'

/**
 * NumberInput — formatted-as-you-type currency input.
 *
 * Display: "12.500.000" (Indonesian locale, dot thousand separator)
 * Storage: raw number 12500000
 *
 * Usage:
 *   <NumberInput value={amount} onChange={setAmount} placeholder="0" />
 *
 * Behaves like a regular <Input> for everything else (id, className, disabled,
 * autoFocus, etc) — props are forwarded.
 */

import { forwardRef, useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number
  onChange: (value: number) => void
  /** If true, leading zero shown as empty (placeholder). Default true. */
  emptyOnZero?: boolean
}

function formatNumber(n: number): string {
  if (!Number.isFinite(n) || n === 0) return ''
  return Math.round(n).toLocaleString('id-ID')
}

function parseNumber(s: string): number {
  // Strip everything except digits (handles "12.500", "12,500", "Rp 12.500")
  const digits = s.replace(/\D/g, '')
  return digits ? parseInt(digits, 10) : 0
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput({ value, onChange, emptyOnZero = true, ...props }, ref) {
    // Local string state for what's displayed in the input
    const [display, setDisplay] = useState<string>(emptyOnZero && value === 0 ? '' : formatNumber(value))

    // Sync display when value changes externally (e.g. form reset)
    useEffect(() => {
      const formatted = emptyOnZero && value === 0 ? '' : formatNumber(value)
      setDisplay(formatted)
    }, [value, emptyOnZero])

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={(e) => {
          const raw = e.target.value
          const n = parseNumber(raw)
          // Show formatted version (auto-add dots as user types)
          setDisplay(n === 0 && emptyOnZero ? raw.replace(/\D/g, '') : formatNumber(n))
          onChange(n)
        }}
        onBlur={(e) => {
          // On blur, normalize formatting
          setDisplay(emptyOnZero && value === 0 ? '' : formatNumber(value))
          props.onBlur?.(e)
        }}
        {...props}
      />
    )
  },
)
