/** Safe numeric coercion for portfolio API fields (may arrive as strings). */
export function safeNum(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function normalizeHolding(raw) {
  if (!raw || raw.id == null) return null;
  return {
    ...raw,
    id: raw.id,
    investment_name: raw.investment_name || 'Unnamed Asset',
    investment_type: raw.investment_type || 'other_physical',
    stock_symbol: raw.stock_symbol || '',
    quantity: safeNum(raw.quantity, 1),
    total_capital: safeNum(raw.total_capital),
    investment_amount: safeNum(raw.investment_amount),
    estimated_return_per_year: safeNum(raw.estimated_return_per_year, 10),
    time_period: safeNum(raw.time_period, 1),
    roi: safeNum(raw.roi),
  };
}

export function truncateLabel(name, max = 12) {
  const s = String(name || '—');
  return s.length > max ? `${s.slice(0, max)}…` : s;
}
