/**
 * Klunting — Landing page (root /).
 *
 * Copy direction: senior copywriter, conversion-focused.
 * - Hook: question yang nyentil (creates curiosity + reveals pain)
 * - Hero sub: spesifik benefits + remove friction
 * - Stats strip: visual proof (numbers > words)
 * - Cara kerja: lower the barrier (3 steps, jelas)
 * - Features: outcome-focused (bukan "ada fitur X" tapi "X bikin kamu bisa Y")
 * - Persona quotes: vivid, dari mulut user
 * - CTA strip: urgency tanpa manipulasi
 *
 * Server component. Authed → /dashboard, anon → render landing.
 */

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  ArrowRight, Camera, Wallet, TrendingUp, Brain, Shield, Sparkles,
  Check,
} from 'lucide-react'

export default async function LandingPage() {
  let isAuthed = false
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    isAuthed = !!user
  } catch {
    isAuthed = false
  }
  if (isAuthed) redirect('/dashboard')

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
      {/* ─── NAV ───────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 sm:px-12 py-5 border-b"
        style={{ borderColor: 'var(--border-soft)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="size-8 rounded-[9px] flex items-center justify-center font-extrabold text-base text-white"
            style={{
              background: 'linear-gradient(135deg, var(--emerald-500), var(--emerald-700))',
              letterSpacing: '-0.04em',
              boxShadow: '0 8px 24px -8px rgba(16,185,129,0.45)',
            }}
          >
            K
          </div>
          <div className="font-bold text-base tracking-tight">Klunting</div>
        </div>
        <nav className="hidden md:flex gap-7 text-sm" style={{ color: 'var(--ink-muted)' }}>
          <a href="#cara-kerja" className="hover:text-[var(--ink)] transition-colors">Cara kerja</a>
          <a href="#fitur" className="hover:text-[var(--ink)] transition-colors">Fitur</a>
          <a href="#untuk-siapa" className="hover:text-[var(--ink)] transition-colors">Untuk siapa</a>
          <Link href="/dashboard/pricing" className="hover:text-[var(--ink)] transition-colors">Harga</Link>
        </nav>
        <div className="flex gap-2 items-center">
          <Link
            href="/login"
            className="px-3 py-2 text-sm font-medium hover:bg-[var(--surface-2)] rounded-md transition-colors"
            style={{ color: 'var(--ink)' }}
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-semibold transition hover:opacity-90"
            style={{ background: 'var(--ink)', color: 'var(--surface)' }}
          >
            Mulai gratis
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </header>

      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 sm:px-12 py-16 sm:py-24">
        <div
          className="absolute -top-10 -right-16 size-[480px] rounded-full opacity-50 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.18), transparent 60%)' }}
        />
        <div
          className="absolute top-[200px] -left-20 size-[360px] rounded-full opacity-40 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.10), transparent 60%)' }}
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          {/* LEFT — copy */}
          <div>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold mb-6"
              style={{ background: 'var(--emerald-100)', color: 'var(--emerald-800)' }}
            >
              <span className="size-1.5 rounded-full" style={{ background: 'var(--emerald-500)' }} />
              Buat kamu yang punya 3+ app keuangan
            </span>
            <h1
              className="font-bold tracking-tight"
              style={{
                fontSize: 'clamp(40px, 6.5vw, 72px)',
                lineHeight: 1.04,
                letterSpacing: '-0.04em',
              }}
            >
              Berapa kekayaanmu,<br />
              <span style={{ color: 'var(--emerald-700)' }}>sebenernya?</span>
            </h1>
            <p
              className="mt-6 text-lg leading-relaxed max-w-xl"
              style={{ color: 'var(--ink-muted)' }}
            >
              Saldo BCA, GoPay, reksa dana Bibit, saham Stockbit, emas Pegadaian, cicilan KPR.
              Kebanyakan orang punya 5+ app keuangan dan gak tau total asetnya.
              Klunting jumlahin semuanya jadi satu net worth, update tiap hari.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 items-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition hover:opacity-90"
                style={{
                  background: 'var(--ink)',
                  color: 'var(--surface)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                }}
              >
                Mulai gratis (2 menit setup)
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#cara-kerja"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-medium border transition hover:bg-[var(--surface-2)]"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
              >
                Liat cara kerjanya
              </a>
            </div>
            <div
              className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[13px]"
              style={{ color: 'var(--ink-muted)' }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-3.5" style={{ color: 'var(--emerald-600)' }} />
                Gratis selamanya
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-3.5" style={{ color: 'var(--emerald-600)' }} />
                Tanpa kartu kredit
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-3.5" style={{ color: 'var(--emerald-600)' }} />
                Data terenkripsi
              </span>
            </div>
          </div>

          {/* RIGHT — dark net-worth card mockup */}
          <div className="relative">
            <div className="dark-card p-7 relative" style={{ boxShadow: '0 24px 60px -16px rgba(0,0,0,0.30)' }}>
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <p
                    className="text-[10px] uppercase font-semibold"
                    style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.16em' }}
                  >
                    Net Worth · Hari ini
                  </p>
                  <p
                    className="num tabular font-bold mt-2 leading-none"
                    style={{ color: 'var(--on-black)', fontSize: 44, letterSpacing: '-0.03em' }}
                  >
                    Rp 487,3<span style={{ color: 'rgba(255,255,255,0.55)' }}>jt</span>
                  </p>
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold mt-3"
                    style={{ background: 'rgba(16,185,129,0.18)', color: '#6EE7B7' }}
                  >
                    ↑ 12,4% bulan ini
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: '#FB7185' }} />
                  <span className="size-2 rounded-full" style={{ background: '#FBBF24' }} />
                  <span className="size-2 rounded-full" style={{ background: '#34D399' }} />
                </div>
              </div>

              <svg viewBox="0 0 320 80" className="w-full" style={{ height: 80 }}>
                <defs>
                  <linearGradient id="hg-landing" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.40" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,60 L40,55 L80,58 L120,40 L160,45 L200,30 L240,28 L280,18 L320,12 L320,80 L0,80 Z" fill="url(#hg-landing)" />
                <path d="M0,60 L40,55 L80,58 L120,40 L160,45 L200,30 L240,28 L280,18 L320,12" stroke="#34D399" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

              <div
                className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
              >
                {[
                  { label: 'Aset Cair', value: 'Rp 84jt', color: '#34D399' },
                  { label: 'Investasi', value: 'Rp 312jt', color: '#7DD3FC' },
                  { label: 'Utang', value: 'Rp 45jt', color: '#FB7185' },
                ].map((s) => (
                  <div key={s.label}>
                    <p
                      className="text-[10px] font-semibold uppercase"
                      style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.10em' }}
                    >
                      {s.label}
                    </p>
                    <p className="num text-base font-semibold mt-1" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating notif: insight */}
            <div
              className="hidden sm:flex absolute -bottom-6 -left-6 bg-white rounded-2xl px-4 py-3 gap-3 items-center max-w-[280px]"
              style={{ boxShadow: '0 12px 32px -8px rgba(0,0,0,0.22)' }}
            >
              <div
                className="size-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ background: 'var(--emerald-100)' }}
              >
                ☕
              </div>
              <div>
                <p className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--ink)' }}>
                  Pengeluaran kopi turun 60%
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                  Hemat Rp 480k bulan ini
                </p>
              </div>
            </div>

            {/* Floating notif: receipt scan */}
            <div
              className="hidden sm:flex absolute -top-4 -right-4 bg-white rounded-xl px-3 py-2.5 gap-2.5 items-center border"
              style={{ borderColor: 'var(--border-soft)', boxShadow: '0 8px 24px -8px rgba(0,0,0,0.15)' }}
            >
              <div
                className="size-7 rounded-lg flex items-center justify-center text-sm"
                style={{ background: 'var(--amber-100)' }}
              >
                📸
              </div>
              <div>
                <p className="text-[10px] font-medium" style={{ color: 'var(--ink-muted)' }}>
                  Indomaret · 3 detik
                </p>
                <p className="num text-[12px] font-semibold mt-0.5" style={{ color: 'var(--ink)' }}>
                  Rp 47.500 · 4 item
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUSTED BY ────────────────────────────────────────── */}
      <section className="px-6 sm:px-12 pb-16">
        <p
          className="text-center text-[11px] uppercase font-semibold mb-6"
          style={{ color: 'var(--ink-soft)', letterSpacing: '0.18em' }}
        >
          Tarik aset dari platform yang kamu pakai
        </p>
        <div
          className="flex justify-center flex-wrap gap-x-8 sm:gap-x-12 gap-y-3 font-bold text-base opacity-60"
          style={{ color: 'var(--ink-muted)' }}
        >
          <span>BIBIT</span>
          <span>Bareksa</span>
          <span>Stockbit</span>
          <span>Pluang</span>
          <span>Pintu</span>
          <span>IPOT</span>
          <span>Mirae</span>
        </div>
      </section>

      {/* ─── STATS STRIP ───────────────────────────────────────── */}
      <section className="px-6 sm:px-12 pb-12">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4 sm:gap-8">
          {[
            {
              num: '2 menit',
              label: 'Setup awal',
              hint: 'Daftar → connect → liat',
            },
            {
              num: '7+',
              label: 'Platform investasi',
              hint: 'Bibit, Stockbit, IPOT, dll',
            },
            {
              num: 'Rp 0',
              label: 'Selamanya',
              hint: 'Solo plan tanpa batas waktu',
            },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p
                className="font-bold tracking-tight"
                style={{
                  color: 'var(--ink)',
                  fontSize: 'clamp(28px, 4vw, 44px)',
                  letterSpacing: '-0.025em',
                  lineHeight: 1,
                }}
              >
                {s.num}
              </p>
              <p
                className="mt-2 text-sm font-semibold"
                style={{ color: 'var(--ink)' }}
              >
                {s.label}
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--ink-muted)' }}>
                {s.hint}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────── */}
      <section
        id="cara-kerja"
        className="px-6 sm:px-12 py-16 sm:py-24"
        style={{ background: 'var(--surface)' }}
      >
        <div className="max-w-3xl mb-12">
          <span className="caps">Cara kerja</span>
          <h2
            className="font-bold mt-3 tracking-tight"
            style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1.1 }}
          >
            Dari nol ke <span style={{ color: 'var(--emerald-700)' }}>net worth utuh</span> dalam satu sore.
          </h2>
          <p className="mt-4 text-lg" style={{ color: 'var(--ink-muted)' }}>
            Gak perlu tutorial 30 menit atau setup ratusan kategori manual.
            Tiga langkah, kamu udah liat angka real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              num: '01',
              title: 'Daftar pakai email',
              body: 'Email + password. Klunting auto-set 100 kategori transaksi, akun Cash, dan Solo plan gratis.',
              time: '30 detik',
            },
            {
              num: '02',
              title: 'Tambahin asetmu',
              body: 'Saldo bank, e-wallet, portfolio investasi, utang. Manual atau import. Sekali aja, sisanya auto-update.',
              time: '5 menit',
            },
            {
              num: '03',
              title: 'Liat insight pertamamu',
              body: 'Net worth real-time. Pengeluaran terbesar bulan ini. Forecast saldo akhir bulan. Semua langsung kelihatan.',
              time: 'Langsung',
            },
          ].map((step) => (
            <div
              key={step.num}
              className="rounded-2xl p-6 border"
              style={{ background: 'var(--paper)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <span
                  className="num text-3xl font-bold"
                  style={{ color: 'var(--emerald-700)', letterSpacing: '-0.02em' }}
                >
                  {step.num}
                </span>
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                  style={{ background: 'var(--surface-2)', color: 'var(--ink-muted)', letterSpacing: '0.08em' }}
                >
                  {step.time}
                </span>
              </div>
              <h3
                className="text-lg font-bold tracking-tight mb-2"
                style={{ color: 'var(--ink)', letterSpacing: '-0.01em' }}
              >
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ──────────────────────────────────────────── */}
      <section id="fitur" className="px-6 sm:px-12 py-16 sm:py-24">
        <div className="max-w-3xl mb-12">
          <span className="caps">Fitur</span>
          <h2
            className="font-bold mt-3 tracking-tight"
            style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1.1 }}
          >
            Klunting hitung <span style={{ color: 'var(--emerald-700)' }}>kekayaanmu utuh.</span>
          </h2>
          <p className="mt-4 text-lg" style={{ color: 'var(--ink-muted)' }}>
            Kamu kerja keras naikin gaji, naikin investasi, naikin aset.
            Klunting bantu kamu liat hasil kerja itu utuh, jelas, dan real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: Camera, color: 'var(--emerald-500)', bg: 'var(--emerald-100)',
              title: 'Foto struk, beres dalam 3 detik.',
              body: 'Foto struk Indomaret, Alfamart, atau restoran. AI baca total, item, dan kategori. Kamu hemat 5 menit per transaksi.',
            },
            {
              icon: Brain, color: 'var(--sky-500)', bg: 'var(--sky-100)',
              title: 'Catat secepat ngetik chat.',
              body: 'Ketik "kopi 35rb" atau "gaji 8jt". Klunting baca, kategorize, dan simpan. Tanpa form, tanpa dropdown.',
            },
            {
              icon: TrendingUp, color: 'var(--amber-500)', bg: 'var(--amber-100)',
              title: 'Asetmu nyebar? Klunting satuin.',
              body: 'Klunting tarik harga aset dari Bibit, Stockbit, IPOT, Pluang, Pintu, Pegadaian, dan BCA. Liat satu net worth dengan return tiap aset di satu layar.',
            },
            {
              icon: Wallet, color: 'var(--coral-500)', bg: 'var(--coral-100)',
              title: 'Anggaran 12 bulan ke depan.',
              body: 'Plan pemasukan, pengeluaran, tabungan, dan investasi sampai akhir tahun. Pilih mode 50/30/20 atau zero-based. Klunting alert kamu pas mulai over.',
            },
            {
              icon: Sparkles, color: '#8B5CF6', bg: '#EDE9FE',
              title: 'AI yang baca pola kamu.',
              body: 'Tiap awal bulan kamu dapet insight kayak: "Pengeluaran kopi naik 60%." "Forecast saldo akhir bulan tipis Rp 200k." Semua dari data kamu sendiri.',
            },
            {
              icon: Shield, color: 'var(--emerald-700)', bg: 'var(--emerald-100)',
              title: 'Mode kalem buat hari merah.',
              body: 'Pas pasar koreksi -8%, klik calm mode. Klunting samarin angka tapi positioning kamu tetep keliatan. Lihat yang penting, tanpa panik.',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl p-6 border transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div
                className="size-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: f.bg }}
              >
                <f.icon className="size-5" style={{ color: f.color }} />
              </div>
              <h3
                className="text-lg font-bold tracking-tight mb-2"
                style={{ color: 'var(--ink)', letterSpacing: '-0.01em' }}
              >
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── UNTUK SIAPA ───────────────────────────────────────── */}
      <section
        id="untuk-siapa"
        className="px-6 sm:px-12 py-16 sm:py-24"
        style={{ background: 'var(--surface)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12">
            <span className="caps">Untuk siapa</span>
            <h2
              className="font-bold mt-3 tracking-tight"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1.1 }}
            >
              Buat kamu yang capek <span style={{ color: 'var(--ink-muted)' }}>nge-track manual.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                tag: 'Profesional muda',
                pain: '"Gaji 8jt, tabungan stuck. Bingung di mana yang harus dipotong."',
                fix: 'Klunting kasih breakdown jelas: 35% di GoFood, 12% transport, 8% subscription. Kamu tau pasti yang biggest leak. Mulai potong dari situ.',
              },
              {
                tag: 'Investor pemula',
                pain: '"Reksa dana di Bibit, saham di Stockbit, emas di Pegadaian. Total return-ku berapa?"',
                fix: 'Connect semua dalam 5 menit. Liat satu net worth, satu IRR, satu alokasi aset. Nggak perlu spreadsheet bulanan lagi.',
              },
              {
                tag: 'Pasangan / keluarga',
                pain: '"Pengeluaran rumah tangga campur. Bingung siapa belanja apa."',
                fix: 'Wallet bersama, transaksi keliatan dua-duanya, anggaran kompak. Plan Family bisa sampai 4 anggota — pasangan, anak, atau orang tua.',
              },
            ].map((p) => (
              <div
                key={p.tag}
                className="rounded-2xl p-6 border"
                style={{ background: 'var(--paper)', borderColor: 'var(--border)' }}
              >
                <span
                  className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold mb-4"
                  style={{ background: 'var(--surface-2)', color: 'var(--ink)' }}
                >
                  {p.tag}
                </span>
                <p
                  className="text-base font-semibold leading-snug mb-3"
                  style={{ color: 'var(--ink)' }}
                >
                  {p.pain}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                  {p.fix}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPARISON / WHY KLUNTING ─────────────────────────── */}
      <section className="px-6 sm:px-12 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-10">
            <span className="caps">Kenapa Klunting</span>
            <h2
              className="font-bold mt-3 tracking-tight"
              style={{ fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-0.03em', lineHeight: 1.1 }}
            >
              Excel kamu udah cape. <span style={{ color: 'var(--ink-muted)' }}>Pindah ke yang otomatis.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div
              className="rounded-2xl p-6 border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <p
                className="text-[11px] uppercase font-semibold mb-4"
                style={{ color: 'var(--ink-muted)', letterSpacing: '0.14em' }}
              >
                Sebelum Klunting
              </p>
              <ul className="space-y-2.5 text-sm" style={{ color: 'var(--ink-muted)' }}>
                <li>· Buka 5 app buat ngitung total aset</li>
                <li>· Excel keuangan yang gak ke-update 2 minggu</li>
                <li>· Akhir bulan: "Lho, kok saldo segini doang?"</li>
                <li>· Goal nabung mandek 6 bulan</li>
                <li>· Bingung mau invest dari mana mulai</li>
              </ul>
            </div>
            <div
              className="rounded-2xl p-6 border"
              style={{
                background: 'linear-gradient(135deg, var(--emerald-50, #ECFDF5), var(--surface))',
                borderColor: 'var(--emerald-200, #A7F3D0)',
              }}
            >
              <p
                className="text-[11px] uppercase font-semibold mb-4"
                style={{ color: 'var(--emerald-700)', letterSpacing: '0.14em' }}
              >
                Sesudah Klunting
              </p>
              <ul className="space-y-2.5 text-sm" style={{ color: 'var(--ink)' }}>
                <li className="flex gap-2">
                  <Check className="size-4 shrink-0 mt-0.5" style={{ color: 'var(--emerald-600)' }} />
                  Klunting jumlahin semua asetmu di satu dashboard
                </li>
                <li className="flex gap-2">
                  <Check className="size-4 shrink-0 mt-0.5" style={{ color: 'var(--emerald-600)' }} />
                  Kamu catat transaksi 3 detik via foto struk atau ketik chat
                </li>
                <li className="flex gap-2">
                  <Check className="size-4 shrink-0 mt-0.5" style={{ color: 'var(--emerald-600)' }} />
                  AI alert pas pengeluaranmu mulai bocor
                </li>
                <li className="flex gap-2">
                  <Check className="size-4 shrink-0 mt-0.5" style={{ color: 'var(--emerald-600)' }} />
                  Goal nabung yang progressnya keliatan per bulan
                </li>
                <li className="flex gap-2">
                  <Check className="size-4 shrink-0 mt-0.5" style={{ color: 'var(--emerald-600)' }} />
                  Insight personal dari data kamu, contoh "kopi naik 60%"
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA STRIP ──────────────────────────────────────────── */}
      <section className="px-6 sm:px-12 pb-20 sm:pb-28">
        <div
          className="max-w-5xl mx-auto rounded-3xl p-10 sm:p-14 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--emerald-600), var(--emerald-800))',
            boxShadow: '0 24px 48px -16px rgba(16,185,129,0.40)',
          }}
        >
          <div
            className="absolute -top-20 -right-20 size-80 rounded-full opacity-40 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.20), transparent 60%)' }}
          />
          <div className="relative text-center">
            <h2
              className="font-bold tracking-tight"
              style={{
                color: '#FFFFFF',
                fontSize: 'clamp(28px, 4vw, 40px)',
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
              }}
            >
              Pengeluaran kamu hari ini<br />bakal ke mana?
            </h2>
            <p
              className="mt-4 text-base sm:text-lg max-w-xl mx-auto"
              style={{ color: 'rgba(255,255,255,0.88)' }}
            >
              Pake ingatan, kamu lupa. Pake Excel, kamu lupa update.
              Pake Klunting, otomatis ke-record. Mulai gratis sekarang.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center items-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold transition hover:opacity-90"
                style={{
                  background: '#FFFFFF',
                  color: 'var(--emerald-700)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                }}
              >
                Daftar gratis (2 menit setup)
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/dashboard/pricing"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-base font-medium transition hover:bg-white/10"
                style={{
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.30)',
                }}
              >
                Lihat semua plan
              </Link>
            </div>
            <p
              className="mt-6 text-[12px]"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              Solo plan gratis selamanya · Upgrade ke Pro Rp 79k/bulan kapan saja
            </p>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────── */}
      <footer
        className="border-t px-6 sm:px-12 py-10"
        style={{ borderColor: 'var(--border-soft)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="size-7 rounded-[8px] flex items-center justify-center font-extrabold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, var(--emerald-500), var(--emerald-700))' }}
            >
              K
            </div>
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--ink)' }}>Klunting</span>
              {' '}— Wealth Management App · © {new Date().getFullYear()}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm" style={{ color: 'var(--ink-muted)' }}>
            <Link href="/dashboard/pricing" className="hover:text-[var(--ink)] transition-colors">Harga</Link>
            <a href="mailto:support@klunting.com" className="hover:text-[var(--ink)] transition-colors">Support</a>
            <span>Built in Indonesia 🇮🇩</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
