'use client'

/**
 * Net Worth Hero — dashboard's top card. Greeting + total net worth +
 * 12-month synthetic growth chart + simple "kapan capai Rp 1B?" forecast.
 *
 * The growth chart is a sparkline derived from monthly net cashflow (we
 * don't snapshot net_worth yet; this is a proxy until that table is wired).
 */

import { useMemo, useState } from 'react'
import { formatCurrency, formatCompactCurrency } from '@/lib/utils'

interface MonthlyData {
  month: string
  income: number
  expense: number
  net: number
}

interface NetWorthHeroProps {
  liquidTotal: number
  nonLiquidTotal: number
  investmentsTotal: number
  debtTotal: number
  /** User name for the greeting (first name preferred) */
  userName?: string
  /** Monthly cashflow trend for the 12-month sparkline on the right */
  monthlyTrend?: MonthlyData[]
}

export function NetWorthHero({
  liquidTotal,
  nonLiquidTotal,
  investmentsTotal,
  debtTotal,
  userName,
  monthlyTrend = [],
}: NetWorthHeroProps) {
  const totalAssets = liquidTotal + nonLiquidTotal + investmentsTotal
  const netWorth = totalAssets - debtTotal

  // Time-aware witty greeting per design handoff microcopy library.
  const now = new Date()
  const hour = now.getHours()
  const dateSeed = now.getDate() + now.getMonth() * 31  // stable per day
  const greetingMain = hour >= 4 && hour < 11 ? 'Pagi'
    : hour >= 11 && hour < 15 ? 'Siang'
    : hour >= 15 && hour < 18 ? 'Sore'
    : hour >= 18 && hour < 23 ? 'Malam'
    : 'Wah masih bangun?'
  const subOptions = (() => {
    if (hour >= 4 && hour < 11) return ['uangmu lagi sehat-sehat aja', 'siap nabung hari ini', 'udah sarapan? jangan lupa catat']
    if (hour >= 11 && hour < 15) return ['udah makan? jangan lupa catat', 'review pengeluaran sebentar yuk']
    if (hour >= 15 && hour < 18) return ['review pengeluaran hari ini yuk', 'udah hampir gajian, sabar']
    if (hour >= 18 && hour < 23) return ['santai dulu, uangmu udah dijaga', 'selamat istirahat']
    return ['jangan lupa tidur ya', 'begadang sambil cek finansial']
  })()
  const subGreeting = subOptions[dateSeed % subOptions.length]

  // Period filter for the chart — chip-style selector per mockup ("1Y" active).
  // Filters the monthlyTrend slice shown in the sparkline.
  const [chartPeriod, setChartPeriod] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('1Y')
  const periodToMonths = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12, 'ALL': 12 } as const
  const filteredTrend = useMemo(() => {
    const months = periodToMonths[chartPeriod]
    if (months >= monthlyTrend.length) return monthlyTrend
    return monthlyTrend.slice(-months)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartPeriod, monthlyTrend])

  // Build CUMULATIVE net worth growth trend (proxy):
  //   - Anchor: current netWorth at the LAST month
  //   - Each prior month = current - sum(net cashflow forward)
  // This synthesizes a "Net Worth growth" line from monthly net cashflow,
  // since we don't have actual net_worth_snapshots wired here yet.
  const sparklineData = (() => {
    if (filteredTrend.length === 0) return null
    // Walk backward: start at netWorth, subtract net cashflow of each
    // forward month to reconstruct prior month's value.
    const cumulative: number[] = []
    let running = netWorth
    for (let i = filteredTrend.length - 1; i >= 0; i--) {
      cumulative.unshift(running)
      running -= filteredTrend[i].net
    }
    const max = Math.max(...cumulative)
    const min = Math.min(...cumulative)
    const range = max - min || 1
    const W = 600
    const H = 160
    const points = cumulative.map((v, i) => {
      const x = (i / Math.max(1, cumulative.length - 1)) * W
      const y = H - ((v - min) / range) * (H - 24) - 12
      return { x, y, v }
    })
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
    const areaPath = `${linePath} L${W},${H} L0,${H} Z`
    // Compute % change from start to end of period
    const startVal = cumulative[0]
    const endVal = cumulative[cumulative.length - 1]
    const change = endVal - startVal
    const changePct = startVal !== 0 ? (change / Math.abs(startVal)) * 100 : 0
    return { points, linePath, areaPath, W, H, change, changePct }
  })()

  // Forecast: if recent 3-month avg net trend continues, when do we hit Rp 1B?
  const forecastText = (() => {
    if (monthlyTrend.length < 3) return null
    const recentAvg = monthlyTrend.slice(-3).reduce((s, m) => s + m.net, 0) / 3
    if (recentAvg <= 0) return null
    const target = 1_000_000_000  // Rp 1 miliar
    if (netWorth >= target) return null
    const monthsToTarget = Math.ceil((target - netWorth) / recentAvg)
    if (monthsToTarget > 60 || monthsToTarget < 1) return null
    return monthsToTarget
  })()

  const PERIODS = ['1M', '3M', '6M', '1Y', 'ALL'] as const

  return (
    <div className="space-y-5">
      {/* Greeting row — page-level h1 (replaces "Home" header title per
          mockup). Date moved to header top-left bar (per user feedback). */}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
        {greetingMain}{userName ? `, ${userName}` : ''}.
        <span
          className="ml-2 font-normal text-base sm:text-lg"
          style={{ color: 'var(--ink-muted)' }}
        >
          {subGreeting}.
        </span>
      </h1>

      {/* Net Worth Hero card */}
      <div className="dark-card p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle ambient emerald glow */}
        <div
          className="absolute -top-20 -right-20 size-72 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--emerald-400), transparent 70%)' }}
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8 items-start">
          {/* LEFT: Net Worth value + delta chips + forecast */}
          <div className="min-w-0">
            <p className="caps" style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.5)' }}>Net Worth</p>
            <p
              className="num tabular mt-2 leading-none font-bold whitespace-nowrap"
              style={{
                color: 'var(--on-black)',
                fontSize: 'clamp(36px, 5.5vw, 52px)',
                letterSpacing: '-0.035em',
              }}
            >
              {formatCurrency(netWorth)}
            </p>
            {/* Delta chips — emerald increase + percentage */}
            {sparklineData && sparklineData.change !== 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{
                    background: sparklineData.change >= 0 ? 'rgba(16,185,129,0.18)' : 'rgba(244,63,94,0.18)',
                    color: sparklineData.change >= 0 ? '#6EE7B7' : '#FB7185',
                  }}
                >
                  {sparklineData.change >= 0 ? '↑' : '↓'} {formatCompactCurrency(Math.abs(sparklineData.change))} {chartPeriod === 'ALL' ? 'all-time' : chartPeriod === '1M' ? 'bulan ini' : chartPeriod}
                </span>
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  {sparklineData.changePct >= 0 ? '+' : ''}{sparklineData.changePct.toFixed(1)}%
                </span>
              </div>
            )}
            {/* Forecast text per mockup line 111-113 */}
            {forecastText && (
              <p className="text-[13px] mt-5 leading-[1.5]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Kalau kecepatan ini lanjut, kamu akan capai{' '}
                <span className="font-semibold" style={{ color: 'var(--emerald-400)' }}>Rp 1 miliar</span>{' '}
                dalam {forecastText} bulan.
              </p>
            )}
            {/* Asset/debt sub line */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                Aset <span className="num font-semibold ml-1" style={{ color: 'var(--on-black)' }}>{formatCurrency(totalAssets)}</span>
              </span>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                Utang <span className="num font-semibold ml-1" style={{ color: '#FB7185' }}>−{formatCurrency(debtTotal)}</span>
              </span>
            </div>
          </div>

          {/* RIGHT: Net Worth growth chart with period chip selector */}
          <div className="min-w-0">
            <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
              <p className="caps" style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.5)' }}>
                {chartPeriod === 'ALL' ? 'All Time' : chartPeriod === '1M' ? '1 Bulan Terakhir' : chartPeriod === '3M' ? '3 Bulan Terakhir' : chartPeriod === '6M' ? '6 Bulan Terakhir' : '12 Bulan Terakhir'}
              </p>
              {/* Period chip selector per mockup line 119-122 */}
              <div className="flex gap-0.5 rounded-lg p-0.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setChartPeriod(p)}
                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors"
                    style={{
                      background: chartPeriod === p ? 'rgba(255,255,255,0.12)' : 'transparent',
                      color: chartPeriod === p ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {sparklineData ? (
              <svg viewBox={`0 0 ${sparklineData.W} ${sparklineData.H}`} className="w-full" style={{ height: 160 }} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="nw-spark-grad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={sparklineData.areaPath} fill="url(#nw-spark-grad)" />
                <path d={sparklineData.linePath} fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                {sparklineData.points.length > 0 && (
                  <>
                    <circle
                      cx={sparklineData.points[sparklineData.points.length - 1].x}
                      cy={sparklineData.points[sparklineData.points.length - 1].y}
                      r="5" fill="#34D399"
                    />
                    <circle
                      cx={sparklineData.points[sparklineData.points.length - 1].x}
                      cy={sparklineData.points[sparklineData.points.length - 1].y}
                      r="10" fill="#34D399" opacity="0.30"
                    />
                  </>
                )}
              </svg>
            ) : (
              <div className="h-[160px] flex items-center justify-center text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Catat transaksi untuk lihat trend
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
