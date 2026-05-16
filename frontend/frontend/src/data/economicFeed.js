/**
 * Pre-seeded sample structures for the Live Economic & Market News Portal.
 * Rates reflect realistic Nepal market reference levels (NPR).
 */

export const PRECIOUS_METALS = {
  gold: {
    id: 'gold_hallmark',
    label: 'Gold (Hallmark)',
    symbol: 'Au',
    pricePerTola: 292800,
    changePct: 0.85,
    up: true,
    unit: 'NPR / Tola',
    updatedAt: 'Live · Nepal Bullion',
  },
  goldTejabi: {
    id: 'gold_tejabi',
    label: 'Gold (Tejabi)',
    symbol: 'Au',
    pricePerTola: 291200,
    changePct: 0.72,
    up: true,
    unit: 'NPR / Tola',
    updatedAt: 'Live · Nepal Bullion',
  },
  silver: {
    id: 'silver_fine',
    label: 'Silver (Fine)',
    symbol: 'Ag',
    pricePerTola: 5150,
    changePct: -0.35,
    up: false,
    unit: 'NPR / Tola',
    updatedAt: 'Live · Nepal Bullion',
  },
};

export const FX_RATES_NPR = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', buy: 133.52, sell: 134.18, changePct: 0.08, up: true },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', buy: 144.65, sell: 145.40, changePct: -0.12, up: false },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', buy: 168.20, sell: 169.10, changePct: 0.22, up: true },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳', buy: 1.595, sell: 1.602, changePct: 0.05, up: true, perUnit: 100 },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', buy: 87.35, sell: 88.05, changePct: 0.18, up: true },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', buy: 18.42, sell: 18.58, changePct: -0.04, up: false },
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', buy: 35.58, sell: 35.78, changePct: 0.06, up: true },
  { code: 'QAR', name: 'Qatari Riyal', flag: '🇶🇦', buy: 36.62, sell: 36.85, changePct: 0.03, up: true },
];

export const GLOBAL_MARKET_NEWS = [
  {
    id: 'g1',
    source: 'Bloomberg',
    category: 'Monetary Policy',
    title: 'Fed officials signal room for rate cuts if inflation holds below 2.5% through summer',
    summary: 'Treasury yields eased as markets priced in two cuts before year-end.',
    time: '42m ago',
    trend: 'bullish',
  },
  {
    id: 'g2',
    source: 'Reuters',
    category: 'Technology',
    title: 'Mega-cap tech leads S&P 500 higher as AI infrastructure spending beats forecasts',
    summary: 'Semiconductor names outperformed broad indices for a third session.',
    time: '1h ago',
    trend: 'bullish',
  },
  {
    id: 'g3',
    source: 'Financial Times',
    category: 'Commodities',
    title: 'Brent crude stabilizes near $82 after OPEC+ affirms gradual output increases',
    summary: 'Energy equities lagged as traders weighed supply discipline vs. demand softness.',
    time: '2h ago',
    trend: 'neutral',
  },
  {
    id: 'g4',
    source: 'WSJ',
    category: 'FX',
    title: 'Dollar index retreats as European PMIs surprise to the upside',
    summary: 'EUR/USD tested multi-week highs amid softer US retail sales.',
    time: '3h ago',
    trend: 'bearish',
  },
  {
    id: 'g5',
    source: 'CNBC',
    category: 'Equities',
    title: 'Asian markets mixed: Nikkei gains on weak yen, Hang Seng slips on property data',
    summary: 'Regional investors rotated into exporters and defensive healthcare.',
    time: '4h ago',
    trend: 'neutral',
  },
];

export const NEPAL_ECONOMIC_NEWS = [
  {
    id: 'n1',
    source: 'Nepal Rastra Bank',
    category: 'Policy',
    title: 'NRB holds policy rate steady; emphasizes stable FX and remittance inflows',
    summary: 'Official reserves adequate for 11+ months of imports at current pace.',
    time: '35m ago',
    trend: 'neutral',
  },
  {
    id: 'n2',
    source: 'Kathmandu Post',
    category: 'NEPSE',
    title: 'NEPSE turnover rises 18% as hydropower and microfinance lead advancers',
    summary: 'Institutional participation picked up ahead of quarterly earnings.',
    time: '1h ago',
    trend: 'bullish',
  },
  {
    id: 'n3',
    source: 'Himalayan Times',
    category: 'Remittance',
    title: 'Worker remittances up 21% YoY in first quarter of FY 2081/82',
    summary: 'Gulf and Malaysia corridors contributed the bulk of inflows.',
    time: '2h ago',
    trend: 'bullish',
  },
  {
    id: 'n4',
    source: 'Federation of Nepalese Chambers',
    category: 'Industry',
    title: 'Manufacturing PMI edges higher on improved domestic orders',
    summary: 'Exporters cite stable NPR against USD as a tailwind for quotes.',
    time: '3h ago',
    trend: 'bullish',
  },
  {
    id: 'n5',
    source: 'Bizmandu',
    category: 'Tourism',
    title: 'Tourist arrivals cross pre-pandemic weekly average for first time since 2019',
    summary: 'Hospitality sector hiring and FX earnings show early recovery signs.',
    time: '5h ago',
    trend: 'bullish',
  },
];

export function formatNpr(amount, opts = {}) {
  const { decimals = 0, compact = false } = opts;
  const n = Number(amount);
  if (isNaN(n)) return '—';
  if (compact && n >= 100000) return `Rs. ${(n / 100000).toFixed(2)}L`;
  return `Rs. ${n.toLocaleString('en-NP', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
