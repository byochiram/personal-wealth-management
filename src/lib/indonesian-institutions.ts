/**
 * Indonesian financial institutions catalog — banks + digital wallets.
 *
 * Each entry maps a brand (the name a user actually says — "BCA",
 * "Jenius", "Blu") to its legal entity ("Bank Central Asia",
 * "Bank BTPN") and an IDX ticker if the parent is publicly listed.
 *
 * The ticker lets us reuse the 971 stock logos already in
 * /public/stock-logos/{TICKER}.png — most major IDX banks have a
 * logo there, so we don't need separate bank-logo asset shipping.
 *
 * Brands that share a parent (Jenius/BTPN, D-Save/Danamon, Livin/Mandiri,
 * Permata/PermataME, etc.) all point to the same ticker — they're
 * just different mobile-banking brands of the same legal bank.
 *
 * needsLogo=true means we don't have a logo source yet (private bank,
 * foreign subsidiary, or e-wallet). User can ship a PNG to
 * /public/wallet-logos/{slug}.png to fill these in later.
 */

export type InstitutionType = 'cash' | 'bank' | 'digital_wallet' | 'rdn'

export interface FinancialInstitution {
  /** Brand the user types ("BCA", "GoPay") — case-insensitive match key */
  brand: string
  /** Legal entity name */
  legal: string
  /** Account type slug used by accounts.type column */
  type: InstitutionType
  /** IDX ticker for logo lookup (uses /stock-logos/{ticker}.png). null if private/non-listed. */
  ticker: string | null
  /** True if no logo source (digital wallet, private bank). User can add to /public/wallet-logos/{slug}.png. */
  needsLogo?: boolean
  /** Slug for /public/wallet-logos/{slug}.png lookup when needsLogo */
  slug?: string
}

export const INDONESIAN_INSTITUTIONS: FinancialInstitution[] = [
  // ─── Cash ─────────────────────────────────────────────────
  { brand: 'Cash',        legal: 'On Hand Cash',  type: 'cash', ticker: null, needsLogo: true, slug: 'cash' },

  // ─── Banks (sorted alphabetically by brand) ───────────────
  { brand: 'Aladin',                    legal: 'Bank Aladin Syariah',                  type: 'bank', ticker: 'BANK',  slug: 'aladin' },
  { brand: 'Amar',                      legal: 'Bank Amar Indonesia',                  type: 'bank', ticker: 'AMAR' },
  { brand: 'Arta Graha',                legal: 'Bank Artha Graha Internasional',       type: 'bank', ticker: 'INPC' },
  { brand: 'BCA',                       legal: 'Bank Central Asia',                    type: 'bank', ticker: 'BBCA' },
  { brand: 'Blu',                       legal: 'Bank Digital BCA',                     type: 'bank', ticker: 'BBCA',  slug: 'blu' },  // BCA Digital subsidiary
  { brand: 'BNI',                       legal: 'Bank Negara Indonesia',                type: 'bank', ticker: 'BBNI' },
  { brand: 'Hibank',                    legal: 'Bank Hibank Indonesia',                type: 'bank', ticker: 'BBNI',  slug: 'hibank' },  // BNI digital
  { brand: 'BRI',                       legal: 'Bank Rakyat Indonesia',                type: 'bank', ticker: 'BBRI' },
  { brand: 'Bank Raya',                 legal: 'Bank Raya Indonesia',                  type: 'bank', ticker: 'AGRO' },  // BRI digital subsidiary
  { brand: 'BSI',                       legal: 'Bank Syariah Indonesia',               type: 'bank', ticker: 'BRIS' },
  { brand: 'BTN',                       legal: 'Bank Tabungan Negara',                 type: 'bank', ticker: 'BBTN' },
  { brand: 'BTPN',                      legal: 'Bank BTPN',                            type: 'bank', ticker: 'BTPN' },
  { brand: 'Jenius',                    legal: 'Bank BTPN',                            type: 'bank', ticker: 'BTPN',  slug: 'jenius' },  // BTPN digital
  { brand: 'BTPN Syariah',              legal: 'Bank BTPN Syariah',                    type: 'bank', ticker: 'BTPS' },
  { brand: 'Bumi Arta',                 legal: 'Bank Bumi Arta',                       type: 'bank', ticker: 'BNBA' },
  { brand: 'Capital',                   legal: 'Bank Capital Indonesia',               type: 'bank', ticker: 'BACA' },
  { brand: 'CIMB Niaga',                legal: 'Bank CIMB Niaga',                      type: 'bank', ticker: 'BNGA' },
  { brand: 'China Construction Bank',   legal: 'Bank China Construction Bank Indonesia', type: 'bank', ticker: 'MCOR' },
  { brand: 'Danamon',                   legal: 'Bank Danamon Indonesia',               type: 'bank', ticker: 'BDMN' },
  { brand: 'D-Save',                    legal: 'Bank Danamon Indonesia',               type: 'bank', ticker: 'BDMN',  slug: 'd-save' },
  { brand: 'DBS Indonesia',             legal: 'Bank DBS Indonesia',                   type: 'bank', ticker: null, needsLogo: true, slug: 'dbs' },
  { brand: 'Digibank by DBS',           legal: 'Bank DBS Indonesia',                   type: 'bank', ticker: null, needsLogo: true, slug: 'digibank' },
  { brand: 'Ganesha',                   legal: 'Bank Ganesha',                         type: 'bank', ticker: 'BGTG' },
  { brand: 'HSBC',                      legal: 'Bank HSBC Indonesia',                  type: 'bank', ticker: null, needsLogo: true, slug: 'hsbc' },
  { brand: 'IBK',                       legal: 'Bank IBK Indonesia',                   type: 'bank', ticker: 'AGRS' },
  { brand: 'Ina Perdana',               legal: 'Bank Ina Perdana',                     type: 'bank', ticker: 'BINA' },
  { brand: 'Jago',                      legal: 'Bank Jago',                            type: 'bank', ticker: 'ARTO' },
  { brand: 'JTrust',                    legal: 'Bank Jtrust Indonesia',                type: 'bank', ticker: 'BCIC' },
  { brand: 'KB Bukopin',                legal: 'Bank KB Bukopin',                      type: 'bank', ticker: 'BBKP' },
  { brand: 'Line Bank',                 legal: 'Bank KEB Hana Indonesia',              type: 'bank', ticker: 'BBHI',  slug: 'line-bank' },
  { brand: 'Krom',                      legal: 'Bank Krom Indonesia',                  type: 'bank', ticker: 'BBSI',  slug: 'krom' },
  { brand: 'Mandiri',                   legal: 'Bank Mandiri',                         type: 'bank', ticker: 'BMRI' },
  { brand: 'Livin Mandiri',             legal: 'Bank Mandiri',                         type: 'bank', ticker: 'BMRI',  slug: 'livin' },
  { brand: 'Maspion',                   legal: 'Bank Maspion Indonesia',               type: 'bank', ticker: 'BMAS' },
  { brand: 'Mayapada',                  legal: 'Bank Mayapada Internasional',          type: 'bank', ticker: 'MAYA' },
  { brand: 'Maybank',                   legal: 'Bank Maybank Indonesia',               type: 'bank', ticker: 'BNII' },
  { brand: 'Mega',                      legal: 'Bank Mega',                            type: 'bank', ticker: 'MEGA' },
  { brand: 'Mestika Dharma',            legal: 'Bank Mestika Dharma',                  type: 'bank', ticker: 'BBMD' },
  { brand: 'MNC',                       legal: 'Bank MNC Internasional',               type: 'bank', ticker: 'BABP' },
  { brand: 'Motion Bank',               legal: 'Bank MNC Internasional',               type: 'bank', ticker: 'BABP',  slug: 'motion' },
  { brand: 'MAS',                       legal: 'Bank Multiarta Sentosa',               type: 'bank', ticker: null, needsLogo: true, slug: 'mas' },
  { brand: 'Nobu',                      legal: 'Bank Nationalnobu',                    type: 'bank', ticker: 'NOBU' },
  { brand: 'Neo Bank',                  legal: 'Bank Neo Commerce',                    type: 'bank', ticker: 'BBYB' },
  { brand: 'OCBC NISP',                 legal: 'Bank OCBC NISP',                       type: 'bank', ticker: 'NISP' },
  { brand: 'BOII',                      legal: 'Bank of India Indonesia',              type: 'bank', ticker: 'BSWD' },
  { brand: 'Oke Indonesia',             legal: 'Bank Oke Indonesia',                   type: 'bank', ticker: 'DNAR' },
  { brand: 'Pan Indonesia',             legal: 'Bank Pan Indonesia',                   type: 'bank', ticker: 'PNBN' },
  { brand: 'Panin',                     legal: 'Bank Panin Dubai Syariah',             type: 'bank', ticker: 'PNBS' },
  { brand: 'BPD Banten',                legal: 'Bank Pembangunan Daerah Banten',       type: 'bank', ticker: 'BEKS' },
  { brand: 'BPD Jawa Barat',            legal: 'Bank Pembangunan Daerah Jawa Barat dan Banten', type: 'bank', ticker: 'BJBR' },
  { brand: 'BPD Jawa Timur',            legal: 'Bank Pembangunan Daerah Jawa Timur',   type: 'bank', ticker: 'BJTM' },
  { brand: 'Permata',                   legal: 'Bank Permata',                         type: 'bank', ticker: 'BNLI' },
  { brand: 'PermataME',                 legal: 'Bank Permata',                         type: 'bank', ticker: 'BNLI',  slug: 'permatame' },
  { brand: 'QNB',                       legal: 'Bank QNB Indonesia',                   type: 'bank', ticker: 'BKSW' },
  { brand: 'Seabank',                   legal: 'Bank Seabank Indonesia',               type: 'bank', ticker: null, needsLogo: true, slug: 'seabank' },
  { brand: 'Sinarmas',                  legal: 'Bank Sinarmas',                        type: 'bank', ticker: 'BSIM' },
  { brand: 'Superbank',                 legal: 'Bank Super Indonesia',                 type: 'bank', ticker: null, needsLogo: true, slug: 'superbank' },
  { brand: 'UOB',                       legal: 'Bank UOB Indonesia',                   type: 'bank', ticker: null, needsLogo: true, slug: 'uob' },
  { brand: 'TMRW by UOB',               legal: 'Bank UOB Indonesia',                   type: 'bank', ticker: null, needsLogo: true, slug: 'tmrw' },
  { brand: 'Victoria',                  legal: 'Bank Victoria International',          type: 'bank', ticker: 'BVIC' },
  { brand: 'Woori',                     legal: 'Bank Woori Saudara Indonesia 1906',    type: 'bank', ticker: 'SDRA' },

  // ─── Digital Wallets (none IDX-listed) ────────────────────
  { brand: 'GoPay',     legal: 'GoPay (Gojek)',         type: 'digital_wallet', ticker: null, needsLogo: true, slug: 'gopay' },
  { brand: 'OVO',       legal: 'OVO',                    type: 'digital_wallet', ticker: null, needsLogo: true, slug: 'ovo' },
  { brand: 'DANA',      legal: 'DANA',                   type: 'digital_wallet', ticker: null, needsLogo: true, slug: 'dana' },
  { brand: 'ShopeePay', legal: 'ShopeePay',              type: 'digital_wallet', ticker: null, needsLogo: true, slug: 'shopeepay' },
  { brand: 'LinkAja',   legal: 'LinkAja',                type: 'digital_wallet', ticker: null, needsLogo: true, slug: 'linkaja' },
  { brand: 'Apple Pay', legal: 'Apple Pay',              type: 'digital_wallet', ticker: null, needsLogo: true, slug: 'apple-pay' },
  { brand: 'Paypal',    legal: 'Paypal',                 type: 'digital_wallet', ticker: null, needsLogo: true, slug: 'paypal' },
  { brand: 'Uangku',    legal: 'Uangku',                 type: 'digital_wallet', ticker: null, needsLogo: true, slug: 'uangku' },
]

// Index by brand for fast lookup (case-insensitive)
const BRAND_INDEX = new Map<string, FinancialInstitution>()
for (const inst of INDONESIAN_INSTITUTIONS) {
  BRAND_INDEX.set(inst.brand.toLowerCase(), inst)
}

/**
 * Try to identify an institution from a free-text account name.
 * "BCA Tabungan Utama" → matches "BCA" brand.
 * "Jenius Gaji" → matches "Jenius" brand.
 *
 * Strategy: longest brand-name match wins. We sort the catalog by brand
 * length descending so "BTPN Syariah" wins over "BTPN" when the name
 * contains "BTPN Syariah".
 */
const SORTED_BRANDS = [...INDONESIAN_INSTITUTIONS].sort((a, b) => b.brand.length - a.brand.length)

export function identifyInstitution(name: string | null | undefined): FinancialInstitution | undefined {
  if (!name) return undefined
  const upper = name.toUpperCase()
  for (const inst of SORTED_BRANDS) {
    const brandUpper = inst.brand.toUpperCase()
    // Word-boundary-ish match: brand appears as standalone token or at start/end
    if (upper.startsWith(brandUpper + ' ') || upper.endsWith(' ' + brandUpper) || upper === brandUpper || upper.includes(' ' + brandUpper + ' ')) {
      return inst
    }
  }
  // Fallback: substring match (less precise)
  for (const inst of SORTED_BRANDS) {
    if (upper.includes(inst.brand.toUpperCase())) return inst
  }
  return undefined
}

export function getInstitutionByBrand(brand: string): FinancialInstitution | undefined {
  return BRAND_INDEX.get(brand.toLowerCase())
}

// Quick lists for UI grouping
export const BANK_INSTITUTIONS = INDONESIAN_INSTITUTIONS.filter((i) => i.type === 'bank')
export const WALLET_INSTITUTIONS = INDONESIAN_INSTITUTIONS.filter((i) => i.type === 'digital_wallet')
export const CASH_INSTITUTIONS = INDONESIAN_INSTITUTIONS.filter((i) => i.type === 'cash')
