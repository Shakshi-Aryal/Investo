/**
 * South Asian number formatting for NEPSE dashboards (Lakhs / Crores).
 */

export function formatNpr(value) {
  const n = parseFloat(value);
  if (isNaN(n) || n === 0) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e7) return `${sign}रू ${(abs / 1e7).toFixed(1)} Crore`;
  if (abs >= 1e5) return `${sign}रू ${(abs / 1e5).toFixed(1)} Lakh`;
  return `${sign}रू ${abs.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

/** Share volume or count — Lakhs / Crores without currency prefix */
export function formatQuantity(value) {
  const n = parseInt(value, 10);
  if (isNaN(n)) return '—';
  if (n >= 1e7) return `${(n / 1e7).toFixed(2)} Crore`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(2)} Lakh`;
  return n.toLocaleString('en-IN');
}

/** Market cap and turnover (NPR) */
export function formatMarketCap(val) {
  return formatNpr(val);
}

export function formatVolume(val) {
  return formatQuantity(val);
}
