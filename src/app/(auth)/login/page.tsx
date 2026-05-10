'use client'

/**
 * Login page — Budggt-inspired: minimal, centered, single column.
 *
 * Direction: form yang fokus ke fungsi (masuk), bukan landing page kedua.
 * Logo → nama → tagline 1 baris → card form → link daftar. Done.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        return
      }
      router.push('/dashboard')
    } catch {
      setError('Ada masalah. Coba lagi sebentar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ background: 'var(--paper)' }}
    >
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-extrabold text-white"
              style={{
                background: 'linear-gradient(135deg, var(--emerald-500), var(--emerald-700))',
                letterSpacing: '-0.04em',
                boxShadow: '0 10px 28px -10px rgba(16,185,129,0.50)',
              }}
            >
              K
            </div>
          </Link>
          <h1
            className="mt-4 text-2xl font-bold tracking-tight"
            style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}
          >
            Klunting.
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--ink-muted)' }}>
            Atur uang & aset di satu tempat.
          </p>
        </div>

        {/* Form */}
        <div
          className="mt-8 rounded-2xl border p-6"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border-soft)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
            {error && (
              <div
                className="rounded-lg border p-3 text-sm"
                style={{
                  background: 'rgba(239, 68, 68, 0.06)',
                  borderColor: 'rgba(239, 68, 68, 0.30)',
                  color: '#991B1B',
                }}
              >
                {error}
              </div>
            )}

            <Input
              type="email"
              placeholder="Alamat email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
              autoComplete="email"
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11"
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-sm pt-1">
              <label
                className="flex items-center gap-2 cursor-pointer select-none"
                style={{ color: 'var(--ink-muted)' }}
              >
                <input type="checkbox" className="size-3.5 rounded border-gray-300" defaultChecked />
                Ingat saya
              </label>
              <Link
                href="/forgot-password"
                className="font-medium hover:underline"
                style={{ color: 'var(--emerald-700)' }}
              >
                Lupa password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full text-sm font-semibold"
              style={{
                background: 'linear-gradient(135deg, var(--emerald-500), var(--emerald-700))',
                color: '#FFFFFF',
              }}
            >
              {loading ? 'Memproses…' : 'Masuk'}
            </Button>
          </form>
        </div>

        {/* Register */}
        <p className="mt-6 text-center text-sm" style={{ color: 'var(--ink-muted)' }}>
          Belum punya akun?{' '}
          <Link
            href="/register"
            className="font-semibold hover:underline"
            style={{ color: 'var(--ink)' }}
          >
            Daftar
          </Link>
        </p>
      </div>
    </div>
  )
}
