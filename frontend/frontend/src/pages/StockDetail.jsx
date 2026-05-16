import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import useMarketWebSocket from '../hooks/useMarketWebSocket';
import CandlestickChart from '../components/market/CandlestickChart';
import BuyStockModal from '../components/market/BuyStockModal';
import toast from 'react-hot-toast';
import { TrendingUp } from 'lucide-react';

import { apiUrl } from '../config';
import { formatVolume, formatMarketCap } from '../utils/nepalFormat';
import '../styles/market.css';

const PERIODS = ['1D', '1W', '1M', '3M', '6M'];

function formatPrice(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function StockDetail() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState(null);
  const [history, setHistory] = useState([]);
  const [period, setPeriod] = useState('1D');
  const [loading, setLoading] = useState(true);
  const [liveTick, setLiveTick] = useState(null);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  // Alert modal state
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertTarget, setAlertTarget] = useState('');
  const [alertCondition, setAlertCondition] = useState('above');
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);

  const { stockData } = useMarketWebSocket(symbol);

  const getToken = () => localStorage.getItem('jwt');

  const fetchStockDetail = useCallback(async () => {
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(apiUrl(`/market/stocks/${symbol}/`), { headers });
      if (res.ok) {
        const data = await res.json();
        setStock(data);
        setIsWatchlisted(data.is_watchlisted || false);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  const fetchHistory = useCallback(async () => {
    try {
      const tf = period === '1D' ? '1m' : '1d';
      const res = await fetch(
        `${apiUrl(`/market/stocks/${symbol}/history/`)}?timeframe=${tf}&period=${period}`
      );
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch {
      /* silent */
    }
  }, [symbol, period]);

  const fetchAlerts = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(apiUrl('/market/alerts/'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Filter alerts for this stock
        setAlerts(data.filter(a => a.stock_symbol === symbol));
      }
    } catch {
      /* silent */
    }
  }, [symbol]);

  useEffect(() => {
    fetchStockDetail();
    fetchHistory();
    fetchAlerts();
  }, [fetchStockDetail, fetchHistory, fetchAlerts]);

  // Merge real-time WebSocket updates
  useEffect(() => {
    if (stockData && stockData.symbol === symbol) {
      setStock(prev => prev ? { ...prev, ...stockData } : prev);
      setLiveTick({
        price: parseFloat(stockData.current_price),
        volume: parseInt(stockData.volume || 0),
        timestamp: Date.now(),
      });
    }
  }, [stockData, symbol]);

  const toggleWatchlist = async () => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in to use watchlist');
      navigate('/login');
      return;
    }
    setWatchlistLoading(true);
    try {
      const res = await fetch(apiUrl('/market/watchlist/toggle/'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsWatchlisted(data.is_watchlisted);
        toast.success(data.is_watchlisted ? `${symbol} added to watchlist` : `${symbol} removed from watchlist`);
      }
    } catch (err) {
      toast.error('Failed to update watchlist');
    } finally {
      setWatchlistLoading(false);
    }
  };

  const createAlert = async () => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in to create alerts');
      navigate('/login');
      return;
    }
    if (!alertTarget || isNaN(parseFloat(alertTarget))) {
      toast.error('Enter a valid target price');
      return;
    }
    setAlertsLoading(true);
    try {
      const res = await fetch(apiUrl('/market/alerts/'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stock_id: stock.id,
          target_price: parseFloat(alertTarget),
          condition: alertCondition,
        }),
      });
      if (res.ok) {
        toast.success(`Alert set: ${symbol} ${alertCondition} Rs. ${alertTarget}`);
        setShowAlertModal(false);
        setAlertTarget('');
        fetchAlerts();
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to create alert');
      }
    } catch (err) {
      toast.error('Failed to create alert');
    } finally {
      setAlertsLoading(false);
    }
  };

  const deleteAlert = async (alertId) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(apiUrl(`/market/alerts/${alertId}/`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
        toast.success('Alert deleted');
      }
    } catch (err) {
      toast.error('Failed to delete alert');
    }
  };

  if (loading || !stock) {
    return (
      <MainLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid var(--card-border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading {symbol}...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </MainLayout>
    );
  }

  const pct = parseFloat(stock.percentage_change || 0);
  const isUp = pct >= 0;

  return (
    <MainLayout>
      <div className="stock-detail-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ── STOCK HEADER ── */}
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--card-border)',
          borderRadius: '16px', padding: '24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '32px', fontFamily: 'var(--font-heading)', fontWeight: '800' }}>
                {stock.symbol}
              </h1>
              <span style={{
                padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                background: 'var(--accent-dim)', color: 'var(--accent)',
              }}>
                {(stock.sector || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '16px' }}>{stock.company_name}</p>
            <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, letterSpacing: 0.4 }}>
              NEPSE Scrip · OHLC Candlestick Analytics
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
              Rs. {formatPrice(stock.current_price)}
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: isUp ? 'var(--success-color)' : 'var(--danger-color)' }}>
              {isUp ? '+' : ''}{formatPrice(stock.point_change)} ({isUp ? '+' : ''}{pct.toFixed(2)}%)
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', width: '100%', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowBuyModal(true)}
              className="inv-btn-primary"
              style={{ width: 'auto', padding: '10px 20px', borderRadius: 10, fontSize: 14 }}
            >
              <TrendingUp size={16} /> Invest / Buy Stock
            </button>
            <button
              onClick={toggleWatchlist}
              disabled={watchlistLoading}
              style={{
                padding: '10px 20px', borderRadius: '10px', fontWeight: '700', fontSize: '14px',
                cursor: 'pointer', border: '1px solid var(--card-border)',
                background: isWatchlisted ? 'var(--accent)' : 'var(--input-bg)',
                color: isWatchlisted ? 'white' : 'inherit',
                transition: 'all 0.2s',
              }}
            >
              {watchlistLoading ? '...' : isWatchlisted ? '⭐ Watchlisted' : '☆ Add to Watchlist'}
            </button>
            <button
              onClick={() => setShowAlertModal(true)}
              style={{
                padding: '10px 20px', borderRadius: '10px', fontWeight: '700', fontSize: '14px',
                cursor: 'pointer', border: '1px solid var(--accent)',
                background: 'var(--accent-dim)', color: 'var(--accent)',
                transition: 'all 0.2s',
              }}
            >
              🔔 Set Price Alert
            </button>
          </div>
        </div>

        {/* ── CHART SECTION ── */}
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--card-border)',
          borderRadius: '16px', padding: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Price Chart</h2>
            <div className="timeframe-selector">
              {PERIODS.map(p => (
                <button
                  key={p}
                  className={`tf-btn ${period === p ? 'active' : ''}`}
                  onClick={() => setPeriod(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-container" style={{ height: '480px', padding: 0 }}>
            <CandlestickChart
              symbol={symbol}
              data={history}
              timeframe={period === '1D' ? '1m' : '1d'}
              liveTick={liveTick}
              lastPrice={stock.current_price}
            />
          </div>
        </div>

        {/* ── STOCK STATS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Open', value: `Rs. ${formatPrice(stock.open_price)}` },
            { label: 'Prev Close', value: `Rs. ${formatPrice(stock.previous_close)}` },
            { label: 'Day High', value: `Rs. ${formatPrice(stock.high_price)}`, color: 'var(--success-color)' },
            { label: 'Day Low', value: `Rs. ${formatPrice(stock.low_price)}`, color: 'var(--danger-color)' },
            { label: 'Volume', value: formatVolume(stock.volume) },
            { label: 'Market Cap', value: formatMarketCap(stock.market_cap) },
            { label: 'Listed Shares', value: parseInt(stock.total_listed_shares || 0).toLocaleString() },
            { label: 'Sector', value: (stock.sector || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) },
          ].map(item => (
            <div key={item.label} className="stat-card">
              <span className="stat-label">{item.label}</span>
              <span className="stat-value" style={{ fontSize: '18px', color: item.color || 'inherit' }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* ── ACTIVE ALERTS ── */}
        {alerts.length > 0 && (
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--card-border)',
            borderRadius: '16px', padding: '24px',
          }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700' }}>🔔 Your Alerts for {symbol}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {alerts.map(alert => (
                <div key={alert.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px', background: 'var(--input-bg)',
                  borderRadius: '10px', border: '1px solid var(--card-border)',
                }}>
                  <div>
                    <span style={{ fontWeight: '700' }}>{alert.stock_symbol}</span>
                    <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>
                      {alert.condition === 'above' ? '↑ above' : '↓ below'}
                    </span>
                    <span style={{ fontWeight: '700', color: 'var(--accent)' }}>Rs. {formatPrice(alert.target_price)}</span>
                    {alert.is_triggered && (
                      <span style={{ marginLeft: '8px', padding: '2px 8px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', borderRadius: '4px', fontSize: '11px' }}>
                        TRIGGERED
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '18px' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── ALERT MODAL ── */}
      {showAlertModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px',
        }}>
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--card-border)',
            borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '420px',
          }}>
            <h2 style={{ margin: '0 0 8px', fontFamily: 'var(--font-heading)' }}>Set Price Alert</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 24px' }}>
              Current price: <strong>Rs. {formatPrice(stock.current_price)}</strong>
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600' }}>
                Condition
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['above', 'below'].map(c => (
                  <button
                    key={c}
                    onClick={() => setAlertCondition(c)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px', fontWeight: '700',
                      cursor: 'pointer', border: '1px solid var(--card-border)',
                      background: alertCondition === c ? 'var(--accent)' : 'var(--input-bg)',
                      color: alertCondition === c ? 'white' : 'inherit',
                    }}
                  >
                    {c === 'above' ? '↑ Above' : '↓ Below'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600' }}>
                Target Price (Rs.)
              </label>
              <input
                type="number"
                value={alertTarget}
                onChange={e => setAlertTarget(e.target.value)}
                placeholder={`e.g. ${parseFloat(stock.current_price).toFixed(0)}`}
                style={{
                  width: '100%', padding: '12px 16px', background: 'var(--input-bg)',
                  border: '1px solid var(--card-border)', borderRadius: '10px',
                  color: 'inherit', outline: 'none', fontSize: '16px', boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { setShowAlertModal(false); setAlertTarget(''); }}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px', fontWeight: '700',
                  cursor: 'pointer', border: '1px solid var(--card-border)',
                  background: 'var(--input-bg)', color: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                onClick={createAlert}
                disabled={alertsLoading}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px', fontWeight: '700',
                  cursor: 'pointer', border: 'none',
                  background: 'var(--accent)', color: 'white',
                }}
              >
                {alertsLoading ? 'Creating...' : 'Create Alert'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BuyStockModal
        stock={stock}
        open={showBuyModal}
        onClose={() => setShowBuyModal(false)}
      />
    </MainLayout>
  );
}
