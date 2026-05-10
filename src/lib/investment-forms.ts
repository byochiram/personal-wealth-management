/**
 * Per-category investment form configuration.
 *
 * Each Indonesian asset class has different characteristics → different
 * fields make sense. Stocks need ticker + broker. Gold needs gram +
 * gram-price. Time deposits need tenor + interest rate. etc.
 *
 * Rather than custom DB columns per type, we relabel the existing
 * `quantity` / `avg_cost` / `current_price` fields contextually + add
 * helper text + curate platform dropdowns. Notes field absorbs any
 * extra category-specific data (coupon rate, maturity, etc.).
 *
 * Research basis: typical Indonesian retail investment products as of
 * 2026 — APERD-licensed platforms, OJK-registered P2P, BPJS/DPLK rules,
 * Antam/Pegadaian gold pricing.
 */

import type { Investment } from '@/types'

type Category = Investment['category']

export interface FieldSpec {
  label: string
  placeholder?: string
  /** Short helper line under the label */
  help?: string
  /** Number step for numeric fields */
  step?: string
}

export interface CategoryFormConfig {
  /** Human-readable category name (Indonesian) */
  label: string
  emoji: string
  /** Show the ticker field? Most non-listed assets don't have a ticker. */
  showTicker: boolean
  ticker?: FieldSpec
  /** Hint shown above the ticker (or first field) */
  topHint?: string
  /** Name field config (some categories rename "Nama" to "Issuer", etc.) */
  name: FieldSpec
  /** Platform field config — if `options` set, render as dropdown */
  platform: FieldSpec & { options?: { value: string; label: string; sub?: string }[] }
  /** Quantity field — relabeled per category (gram, lot, unit, lembar, etc.) */
  quantity: FieldSpec
  /** Avg cost — relabeled per category (per gram, per unit, nominal, etc.) */
  avgCost: FieldSpec
  /** Current price — relabeled per category */
  currentPrice: FieldSpec
  /** Notes placeholder hints user about extra info to capture */
  notesHelp?: string
}

// ── Indonesian platform catalogs ────────────────────────────────────

/** APERD-licensed mutual fund platforms */
const MUTUAL_FUND_PLATFORMS = [
  { value: 'Bibit', label: 'Bibit', sub: 'APERD · Robo' },
  { value: 'Bareksa', label: 'Bareksa', sub: 'APERD · Penasihat Investasi' },
  { value: 'Tanamduit', label: 'Tanamduit', sub: 'APERD' },
  { value: 'Pluang', label: 'Pluang', sub: 'APERD · Multi-aset' },
  { value: 'Ajaib', label: 'Ajaib', sub: 'APERD' },
  { value: 'Stockbit', label: 'Stockbit', sub: 'APERD' },
  { value: 'Makmur', label: 'Makmur', sub: 'APERD' },
  { value: 'Manulife AM', label: 'Manulife Asset Management', sub: 'MI langsung' },
  { value: 'Bahana', label: 'Bahana TCW', sub: 'MI langsung' },
  { value: 'Sucorinvest', label: 'Sucorinvest AM', sub: 'MI langsung' },
  { value: 'Schroders', label: 'Schroders Indonesia', sub: 'MI langsung' },
  { value: 'BNI AM', label: 'BNI Asset Management', sub: 'MI langsung' },
  { value: 'Mandiri Investasi', label: 'Mandiri Investasi', sub: 'MI langsung' },
  { value: 'Lainnya', label: 'Lainnya', sub: '' },
]

/** Gold platforms — physical + digital */
const GOLD_PLATFORMS = [
  { value: 'Antam (fisik)', label: 'Antam (fisik)', sub: 'PT Aneka Tambang — fisik' },
  { value: 'UBS (fisik)', label: 'UBS (fisik)', sub: 'fisik' },
  { value: 'Treasury', label: 'Treasury', sub: 'Digital' },
  { value: 'Pegadaian Digital', label: 'Pegadaian Digital', sub: 'Digital' },
  { value: 'Pluang', label: 'Pluang', sub: 'Digital' },
  { value: 'Indogold', label: 'Indogold', sub: 'Digital' },
  { value: 'Tokopedia Emas', label: 'Tokopedia Emas', sub: 'Digital' },
  { value: 'Shopee Emas', label: 'Shopee Emas', sub: 'Digital' },
  { value: 'Lainnya', label: 'Lainnya', sub: '' },
]

/** Bond/SBN platforms — banks + APERD */
const BOND_PLATFORMS = [
  { value: 'Bareksa', label: 'Bareksa', sub: 'Mitra distribusi resmi' },
  { value: 'Indo Premier', label: 'Indo Premier', sub: 'Sekuritas' },
  { value: 'Mandiri Sekuritas', label: 'Mandiri Sekuritas', sub: 'Sekuritas' },
  { value: 'BCA', label: 'BCA', sub: 'Mitra distribusi SBN' },
  { value: 'BRI', label: 'BRI', sub: 'Mitra distribusi SBN' },
  { value: 'Mandiri', label: 'Mandiri', sub: 'Mitra distribusi SBN' },
  { value: 'BNI', label: 'BNI', sub: 'Mitra distribusi SBN' },
  { value: 'CIMB Niaga', label: 'CIMB Niaga', sub: 'Mitra distribusi SBN' },
  { value: 'Permata', label: 'Permata', sub: 'Mitra distribusi SBN' },
  { value: 'Lainnya', label: 'Lainnya', sub: '' },
]

/** Time deposit (deposito) — banks */
const TIME_DEPOSIT_PLATFORMS = [
  { value: 'BCA', label: 'BCA', sub: '' },
  { value: 'Mandiri', label: 'Mandiri', sub: '' },
  { value: 'BRI', label: 'BRI', sub: '' },
  { value: 'BNI', label: 'BNI', sub: '' },
  { value: 'CIMB Niaga', label: 'CIMB Niaga', sub: '' },
  { value: 'Permata', label: 'Permata', sub: '' },
  { value: 'OCBC NISP', label: 'OCBC NISP', sub: '' },
  { value: 'Maybank', label: 'Maybank', sub: '' },
  { value: 'BTPN Jenius', label: 'BTPN Jenius', sub: 'Digital' },
  { value: 'Bank Jago', label: 'Bank Jago', sub: 'Digital' },
  { value: 'Bank Neo Commerce', label: 'Bank Neo Commerce', sub: 'Digital' },
  { value: 'Allo Bank', label: 'Allo Bank', sub: 'Digital' },
  { value: 'Seabank', label: 'Seabank', sub: 'Digital' },
  { value: 'Lainnya', label: 'Lainnya', sub: '' },
]

/** OJK-registered P2P lending platforms */
const P2P_PLATFORMS = [
  { value: 'Investree', label: 'Investree', sub: 'OJK · invoice/working capital' },
  { value: 'Modalku', label: 'Modalku (Funding Societies)', sub: 'OJK · UMKM' },
  { value: 'Akseleran', label: 'Akseleran', sub: 'OJK · UMKM' },
  { value: 'Amartha', label: 'Amartha', sub: 'OJK · mikro' },
  { value: 'KoinWorks', label: 'KoinWorks', sub: 'OJK · multi-produk' },
  { value: 'Asetku', label: 'Asetku', sub: 'OJK' },
  { value: 'Danain', label: 'Danain', sub: 'OJK' },
  { value: 'Crowdo', label: 'Crowdo', sub: 'OJK · UMKM' },
  { value: 'Lainnya', label: 'Lainnya (cek di sikapiuangmu.ojk.go.id)', sub: '' },
]

/** DPLK providers + BPJS Ketenagakerjaan */
const PENSION_PLATFORMS = [
  { value: 'BPJS Ketenagakerjaan JHT', label: 'BPJS Ketenagakerjaan — JHT', sub: 'Wajib pekerja formal' },
  { value: 'BPJS Ketenagakerjaan JP', label: 'BPJS Ketenagakerjaan — JP', sub: 'Wajib pekerja formal' },
  { value: 'DPLK Manulife', label: 'DPLK Manulife', sub: 'Sukarela · DPLK' },
  { value: 'DPLK Allianz', label: 'DPLK Allianz', sub: 'Sukarela · DPLK' },
  { value: 'DPLK BRI', label: 'DPLK BRI Life', sub: 'Sukarela · DPLK' },
  { value: 'DPLK Mandiri', label: 'DPLK Mandiri', sub: 'Sukarela · DPLK' },
  { value: 'DPLK BNI', label: 'DPLK BNI', sub: 'Sukarela · DPLK' },
  { value: 'DPLK Bumiputera', label: 'DPLK Bumiputera', sub: 'Sukarela · DPLK' },
  { value: 'DPPK Perusahaan', label: 'DPPK (Dana Pensiun Pemberi Kerja)', sub: 'Dari kantor' },
  { value: 'Taspen', label: 'Taspen', sub: 'ASN' },
  { value: 'Asabri', label: 'Asabri', sub: 'TNI/Polri' },
  { value: 'Lainnya', label: 'Lainnya', sub: '' },
]

// ── Form configs per category ───────────────────────────────────────

export const INVESTMENT_FORM_CONFIGS: Partial<Record<Category, CategoryFormConfig>> = {
  // mutual fund — Reksa Dana (UP units, NAV per unit)
  mutual_fund: {
    label: 'Reksa Dana',
    emoji: '🏦',
    showTicker: false,
    topHint: 'Catat reksa dana yang kamu beli — jenis (pasar uang/pendapatan tetap/saham/campuran), MI penerbit, & jumlah unit.',
    name: {
      label: 'Nama Reksa Dana',
      placeholder: 'BRI Seruni Pasar Uang II',
      help: 'Nama produk persis seperti di prospektus / platform',
    },
    platform: {
      label: 'Platform / MI',
      placeholder: 'Pilih atau ketik manual',
      help: 'APERD distribusi (Bibit/Bareksa/dll) atau MI langsung',
      options: MUTUAL_FUND_PLATFORMS,
    },
    quantity: {
      label: 'Jumlah Unit Penyertaan (UP)',
      placeholder: '1234.5678',
      help: 'Angka unit yang kamu pegang — ada di portfolio platform',
      step: '0.0001',
    },
    avgCost: {
      label: 'NAB per Unit saat Beli',
      placeholder: '1.234',
      help: 'Nilai Aktiva Bersih per unit waktu kamu beli',
    },
    currentPrice: {
      label: 'NAB per Unit Terkini',
      placeholder: '1.450',
      help: 'NAB harian — biasanya update sore hari kerja',
    },
    notesHelp: 'Tip: tulis jenis (pasar uang/pendapatan tetap/saham/campuran/syariah) + tingkat risiko',
  },

  // Gold — Antam, UBS, digital (Treasury, Pegadaian)
  gold: {
    label: 'Emas',
    emoji: '🥇',
    showTicker: false,
    topHint: 'Untuk emas fisik catat berat & sertifikat. Untuk emas digital cek harga di platform pas beli.',
    name: {
      label: 'Nama / Tipe',
      placeholder: 'Antam LM 5gr / UBS 10gr / Treasury Digital',
      help: 'Brand + tipe — contoh: Antam Logam Mulia 5 gram',
    },
    platform: {
      label: 'Tempat Beli / Custodian',
      placeholder: 'Antam, Treasury, Pegadaian...',
      help: 'Penjual / tempat penyimpanan',
      options: GOLD_PLATFORMS,
    },
    quantity: {
      label: 'Berat (gram)',
      placeholder: '5.5',
      help: 'Total gram emas yang kamu pegang',
      step: '0.001',
    },
    avgCost: {
      label: 'Harga Beli per gram',
      placeholder: '1.250.000',
      help: 'Harga buyback Antam/dealer waktu kamu beli',
    },
    currentPrice: {
      label: 'Harga Pasar per gram',
      placeholder: '1.350.000',
      help: 'Cek harga jual Antam terkini di logammulia.com',
    },
    notesHelp: 'Tip: catat nomor seri sertifikat (Antam) + lokasi simpan (rumah/SDB/Pegadaian)',
  },

  // Bond — Obligasi korporat (FR, INDF Bond, dll)
  bond: {
    label: 'Obligasi Korporat',
    emoji: '📜',
    showTicker: true,
    ticker: {
      label: 'Kode / ISIN (opsional)',
      placeholder: 'INDF01 / IDX0000XXX',
      help: 'Kode obligasi atau ISIN',
    },
    topHint: 'Obligasi korporat — bunga (kupon) tetap atau floating, ada tanggal jatuh tempo. PPh Final 10% atas kupon.',
    name: {
      label: 'Nama Obligasi / Issuer',
      placeholder: 'Obligasi Telkom Tahap I 2024 Seri A',
      help: 'Nama lengkap dari prospektus',
    },
    platform: {
      label: 'Mitra Distribusi',
      placeholder: 'Bareksa, Indo Premier, dll',
      help: 'Tempat kamu beli',
      options: BOND_PLATFORMS,
    },
    quantity: {
      label: 'Jumlah Unit (lembar)',
      placeholder: '10',
      help: 'Berapa unit/lembar obligasi yang dimiliki',
      step: '1',
    },
    avgCost: {
      label: 'Nominal per Unit (Pokok)',
      placeholder: '1.000.000',
      help: 'Nilai nominal/face value per lembar',
    },
    currentPrice: {
      label: 'Harga Pasar per Unit',
      placeholder: '1.020.000',
      help: 'Harga sekarang — bisa premium/discount dari nominal',
    },
    notesHelp: 'Tip: catat coupon % p.a., frekuensi bayar (semi-annual umumnya), maturity date, & rating Pefindo (AAA/AA/A/BBB)',
  },

  // SBN — ORI/SBR/SR/ST
  sbn: {
    label: 'SBN Ritel',
    emoji: '🇮🇩',
    showTicker: true,
    ticker: {
      label: 'Seri',
      placeholder: 'ORI021 / SBR012 / SR017 / ST013',
      help: 'Seri SBN ritel — ORI/SBR/SR/ST + nomor',
    },
    topHint: 'Surat Berharga Negara ritel — diterbitkan Kemenkeu, dijamin negara, kupon fixed/floating, PPh Final 10%.',
    name: {
      label: 'Nama Seri',
      placeholder: 'ORI Seri 021 / Sukuk Tabungan ST013',
      help: 'Nama lengkap seri yang kamu beli',
    },
    platform: {
      label: 'Mitra Distribusi',
      placeholder: 'Bareksa, BCA, BRI, Mandiri, dll',
      help: 'Bank atau APERD tempat order',
      options: BOND_PLATFORMS,
    },
    quantity: {
      label: 'Nominal (Rp)',
      placeholder: '5.000.000',
      help: 'Total nominal yang kamu pegang (kelipatan Rp 1jt biasanya)',
      step: '1000000',
    },
    avgCost: {
      label: 'Harga Beli (% dari nominal)',
      placeholder: '100',
      help: '100 = at par. <100 = discount. >100 = premium',
      step: '0.01',
    },
    currentPrice: {
      label: 'Harga Pasar (% nominal)',
      placeholder: '101.5',
      help: 'Untuk SBN tradable (ORI, SR). SBR/ST non-tradable, isi sama dengan beli',
      step: '0.01',
    },
    notesHelp: 'Tip: catat coupon % p.a., tenor, tanggal jatuh tempo, frekuensi kupon (bulanan untuk ORI/SR/SBR/ST)',
  },

  // Time Deposit — Deposito bank
  time_deposit: {
    label: 'Deposito',
    emoji: '🏛️',
    showTicker: false,
    topHint: 'Deposito berjangka — bunga fixed sesuai tenor, dijamin LPS hingga Rp 2M (per bank, jika bunga ≤ tingkat LPS). PPh Final 20% atas bunga.',
    name: {
      label: 'Nama / Nomor Bilyet',
      placeholder: 'Deposito BCA Tenor 12 bulan',
      help: 'Identifikasi singkat — bisa nomor bilyet 4 digit terakhir',
    },
    platform: {
      label: 'Bank',
      placeholder: 'BCA, Mandiri, BRI, BNI, Jenius, Jago...',
      help: 'Bank penyimpan deposito',
      options: TIME_DEPOSIT_PLATFORMS,
    },
    quantity: {
      label: 'Tenor (bulan)',
      placeholder: '12',
      help: 'Jangka waktu — 1, 3, 6, 12, atau 24 bulan',
      step: '1',
    },
    avgCost: {
      label: 'Pokok Deposito (Rp)',
      placeholder: '50.000.000',
      help: 'Jumlah dana yang dideposit',
    },
    currentPrice: {
      label: 'Bunga p.a. (%)',
      placeholder: '5.5',
      help: 'Suku bunga tahunan — biasanya 3-7% tergantung bank & tenor',
      step: '0.01',
    },
    notesHelp: 'Tip: catat tanggal mulai, tanggal jatuh tempo, auto-rollover (Y/N), & status LPS guarantee',
  },

  // Forex — Valuta asing
  forex: {
    label: 'Valas',
    emoji: '💱',
    showTicker: true,
    ticker: {
      label: 'Currency Code',
      placeholder: 'USD / EUR / SGD / JPY / GBP',
      help: 'Kode 3-huruf ISO 4217',
    },
    topHint: 'Mata uang asing fisik atau digital. Untuk hedging atau saving.',
    name: {
      label: 'Nama / Tujuan',
      placeholder: 'USD untuk umroh / SGD tabungan',
      help: 'Konteks kepemilikan',
    },
    platform: {
      label: 'Tempat Simpan',
      placeholder: 'Money changer / Bank / Wise / Revolut',
      help: 'Lokasi penyimpanan',
    },
    quantity: {
      label: 'Jumlah Mata Uang Asing',
      placeholder: '5000',
      help: 'Jumlah USD/EUR/dll yang kamu pegang',
      step: '0.01',
    },
    avgCost: {
      label: 'Avg Cost (Rp per unit)',
      placeholder: '15.500',
      help: 'Rata-rata kurs beli (Rp per 1 USD/EUR/dll)',
    },
    currentPrice: {
      label: 'Kurs Pasar (Rp per unit)',
      placeholder: '16.700',
      help: 'Kurs jual saat ini',
    },
    notesHelp: 'Tip: catat tujuan pemegangan (hedging/umroh/saving) + kurs yang dipakai (Antam, Bank Indonesia, market)',
  },

  // P2P Lending
  p2p: {
    label: 'P2P Lending',
    emoji: '🤝',
    showTicker: false,
    topHint: 'PASTIKAN platform terdaftar OJK & member AFPI. Cek di sikapiuangmu.ojk.go.id sebelum invest. Bunga tinggi = risiko default tinggi.',
    name: {
      label: 'Nama Pinjaman / Project ID',
      placeholder: 'INV-2024-0123 / Modalku Bisnis Kuliner',
      help: 'ID pinjaman atau nama project di platform',
    },
    platform: {
      label: 'Platform P2P',
      placeholder: 'Investree, Modalku, Akseleran, dll',
      help: 'Hanya platform yang terdaftar OJK',
      options: P2P_PLATFORMS,
    },
    quantity: {
      label: 'Tenor (bulan)',
      placeholder: '6',
      help: 'Jangka waktu pinjaman',
      step: '1',
    },
    avgCost: {
      label: 'Pokok Investasi (Rp)',
      placeholder: '5.000.000',
      help: 'Modal yang kamu salurkan',
    },
    currentPrice: {
      label: 'Outstanding Pokok (Rp)',
      placeholder: '4.200.000',
      help: 'Sisa pokok yang belum dibayar borrower',
    },
    notesHelp: 'Tip: catat bunga p.a. (%), risk grade (A/B/C), industry borrower, status (Lancar/Default/Restrukturisasi), maturity date',
  },

  // Pension — DPLK + BPJS
  pension: {
    label: 'Dana Pensiun',
    emoji: '🌴',
    showTicker: false,
    topHint: 'BPJS JHT/JP wajib untuk pekerja formal. DPLK sukarela — kontribusi deductible up to 5% gross income (max Rp 2,4jt/thn per PMK 168/2023).',
    name: {
      label: 'Nama Akun / Plan',
      placeholder: 'DPLK Manulife Plan Saham / BPJS JHT',
      help: 'Identifikasi akun pensiun',
    },
    platform: {
      label: 'Provider',
      placeholder: 'BPJS / DPLK Manulife / DPLK Allianz...',
      help: 'BPJS Ketenagakerjaan atau DPLK provider',
      options: PENSION_PLATFORMS,
    },
    quantity: {
      label: 'Iuran Bulanan (Rp)',
      placeholder: '500.000',
      help: 'Kontribusi rutin per bulan',
    },
    avgCost: {
      label: 'Total Iuran Sejauh Ini (Rp)',
      placeholder: '24.000.000',
      help: 'Akumulasi iuran yang sudah disetor',
    },
    currentPrice: {
      label: 'Saldo Saat Ini (Rp)',
      placeholder: '28.500.000',
      help: 'Saldo terkini — cek di iAkun BPJS TK atau DPLK',
    },
    notesHelp: 'Tip: catat target umur pensiun, paket investasi (konservatif/moderat/agresif), & employer contribution (jika ada)',
  },

  // Business — bisnis / equity stake
  business: {
    label: 'Bisnis / Usaha',
    emoji: '💼',
    showTicker: false,
    topHint: 'Equity di bisnis pribadi atau kepemilikan saham di startup/UMKM yang belum listing.',
    name: {
      label: 'Nama Bisnis',
      placeholder: 'PT Kopi Senja / UD Maju Jaya',
      help: 'Nama legal entitas',
    },
    platform: {
      label: 'Sektor / Industri',
      placeholder: 'F&B, Tech, Retail, Manufaktur, Jasa, dll',
      help: 'Bidang usaha',
    },
    quantity: {
      label: 'Kepemilikan (%)',
      placeholder: '25',
      help: 'Persentase saham/equity yang dimiliki',
      step: '0.01',
    },
    avgCost: {
      label: 'Modal Awal (Rp)',
      placeholder: '50.000.000',
      help: 'Total modal yang sudah disetor',
    },
    currentPrice: {
      label: 'Valuasi Sekarang (Rp)',
      placeholder: '120.000.000',
      help: 'Fair value berdasarkan revenue/aset/last raise',
    },
    notesHelp: 'Tip: catat revenue tahunan, jumlah karyawan, status (operating/idle), & co-founder breakdown',
  },
}

/** Helper to get config or fallback to a generic spec */
export function getCategoryFormConfig(category: Category): CategoryFormConfig | null {
  return INVESTMENT_FORM_CONFIGS[category] ?? null
}
