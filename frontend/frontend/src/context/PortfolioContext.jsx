import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiUrl } from '../config';
import { normalizeHolding } from '../utils/portfolioMath';

const PORTFOLIO_API = apiUrl('/portfolio/');
const TOKEN_KEY = 'jwt';

const PortfolioContext = createContext(null);

/**
 * Immutable merge: update one digital holding by symbol, or prepend — never drops other rows.
 */
function mergeHoldings(prev, incoming) {
  const item = normalizeHolding(incoming);
  if (!item) return prev;

  const isDigital =
    item.investment_type === 'stocks_digital' && item.stock_symbol;

  if (isDigital) {
    const idx = prev.findIndex(
      (h) =>
        h.investment_type === 'stocks_digital' &&
        h.stock_symbol === item.stock_symbol,
    );
    if (idx >= 0) {
      const next = [...prev];
      next[idx] = { ...prev[idx], ...item };
      return next;
    }
  }

  const existingById = prev.findIndex((h) => h.id === item.id);
  if (existingById >= 0) {
    const next = [...prev];
    next[existingById] = { ...prev[existingById], ...item };
    return next;
  }

  return [item, ...prev];
}

export function PortfolioProvider({ children }) {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);

  const getToken = () => localStorage.getItem(TOKEN_KEY);

  const fetchWallet = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setWalletBalance(null);
      return null;
    }
    try {
      const res = await fetch(apiUrl('/profile/'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const bal = parseFloat(data.trading_balance);
        if (!Number.isNaN(bal)) setWalletBalance(bal);
        return bal;
      }
    } catch {
      /* silent */
    }
    return null;
  }, []);

  const fetchPortfolio = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setHoldings([]);
      return [];
    }
    setLoading(true);
    try {
      const res = await fetch(PORTFOLIO_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const raw = Array.isArray(data) ? data : data.results || [];
        const list = raw.map(normalizeHolding).filter(Boolean);
        setHoldings(list);
        return list;
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
    return [];
  }, []);

  useEffect(() => {
    if (getToken()) {
      fetchPortfolio();
      fetchWallet();
    }
  }, [fetchPortfolio, fetchWallet]);

  const addHolding = useCallback((item) => {
    setHoldings((prev) => mergeHoldings(prev, item));
  }, []);

  const buyStock = useCallback(
    async ({ symbol, shares }) => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${PORTFOLIO_API}buy_stock/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: String(symbol || '').trim().toUpperCase(),
          shares: parseFloat(shares),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Purchase failed');
      }

      const data = await res.json();
      setHoldings((prev) => mergeHoldings(prev, data));
      if (data.trading_balance != null) {
        const bal = parseFloat(data.trading_balance);
        if (!Number.isNaN(bal)) setWalletBalance(bal);
      }
      return data;
    },
    [],
  );

  const removeHolding = useCallback((id) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const addManualHolding = useCallback((item) => {
    setHoldings((prev) => mergeHoldings(prev, item));
  }, []);

  return (
    <PortfolioContext.Provider
      value={{
        holdings,
        loading,
        walletBalance,
        fetchPortfolio,
        fetchWallet,
        buyStock,
        addHolding,
        addManualHolding,
        removeHolding,
        setHoldings,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error('usePortfolio must be used within PortfolioProvider');
  }
  return ctx;
}

export default PortfolioContext;
