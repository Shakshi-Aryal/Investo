import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import useMarketWebSocket from '../hooks/useMarketWebSocket';
import '../styles/market.css';

const SECTORS = [
  { value: '', label: 'All Sectors' },
  { value: 'commercial_bank', label: 'Commercial Bank' },
  { value: 'development_bank', label: 'Development Bank' },
  { value: 'finance', label: 'Finance' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'hydropower', label: 'Hydropower' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'microfinance', label: 'Microfinance' },
  { value: 'hotel_tourism', label: 'Hotel & Tourism' },
  { value: 'trading', label: 'Trading' },
  { value: 'others', label: 'Others' },
];

const SORT_OPTIONS = [
  { value: 'symbol', label: 'Symbol' },
  { value: 'current_price', label: 'Price' },
  { value: 'percentage_change', label: '% Change' },
  { value: 'volume', label: 'Volume' },
  { value: 'market_cap', label: 'Market Cap' },
];

function formatPrice(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatVolume(val) {
  const n = parseInt(val);
  if (isNaN(n)) return '—';
  if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function formatMarketCap(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  if (n >= 10000000) return 'Rs. ' + (n / 10000000).toFixed(2) + ' Cr';
  if (n >= 100000) return 'Rs. ' + (n / 100000).toFixed(2) + ' L';
  return 'Rs. ' + n.toLocaleString();
}

export default function MarketDashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [sortBy, setSortBy] = useState('symbol');
  const [sortOrder, setSortOrder] = useState('asc');
  const [activeTab, setActiveTab] = useState('all'); // all | gainers | losers | active

  const { marketData, indexData } = useMarketWebSocket();

  const fetchMarketOverview = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/market/overview/');
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch (err) {
      console.error('[Market] Overview fetch error:', err);
    }
  }, []);

  const fetchStockList = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedSector) params.set('sector', selectedSector);
      params.set('sort_by', sortBy);
      params.set('order', sortOrder);

      const res = await fetch(`http://localhost:8000/api/market/stocks/?${params}`);
      if (res.ok) {
        const data = await res.json();
        setStocks(data);
      }
    } catch (err) {
      console.error('[Market] Stock list fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedSector, sortBy, sortOrder]);

  const fetchSectors = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/market/sectors/');
      if (res.ok) {
        const data = await res.json();
        setSectors(data);
      }
    } catch (err) {
      console.error('[Market] Sectors fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchMarketOverview();
    fetchSectors();
  }, [fetchMarketOverview, fetchSectors]);

  useEffect(() => {
    fetchStockList();
  }, [fetchStockList]);

  // Merge real-time WebSocket updates into stock list
  useEffect(() => {
    if (marketData && marketData.length > 0) {
      setStocks(prev => prev.map(s => {
        const update = marketData.find(u => u.symbol === s.symbol);
        return update ? { ...s, ...update } : s;
      }));
    }
  }, [marketData]);

  const currentIdx = indexData || overview?.index;

  // Determine which stocks to show based on active tab
  const getDisplayStocks = () => {
    if (activeTab === 'gainers') return (overview?.top_gainers || []);
    if (activeTab === 'losers') return (overview?.top_losers || []);
    if (activeTab === 'active') return (overview?.most_active || []);
    return stocks;
  };

  const displayStocks = getDisplayStocks();

  const sentimentColor = () => {
    const label = overview?.sentiment?.label;
    if (label === 'Bullish') return 'var(--success-color)';
    if (label === 'Bearish') return 'var(--danger-color)';
    return 'var(--text-muted)';
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid var(--card-border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading Market Data...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="market-dashboard">
        {/* ── PAGE HEADER ── */}
        <header className="market-header">
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>Market Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              Real-time simulation of the Nepal Stock Exchange (NEPSE)
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {currentIdx?.is_market_open ? (
              <div style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)'
              }}>
                ● Market Open
              </div>
            ) : (
              <div style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                background: 'rgba(239,83,80,0.1)', color: '#ef5350', border: '1px solid rgba(239,83,80,0.2)'
              }}>
                ● Market Closed
              </div>
            )}
          </div>
        </header>

        {/* ── MARKET INDEX STATS ── */}
        <div className="stats-grid">
          <div className="stat-card" style={{ borderLeft: '3px solid var(--accent)' }}>
            <span className="stat-label">NEPSE Index</span>
            <span className="stat-value">{parseFloat(currentIdx?.index_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className={`stat-change ${parseFloat(currentIdx?.percentage_change || 0) >= 0 ? 'change-up' : 'change-down'}`}>
              {parseFloat(currentIdx?.percentage_change || 0) >= 0 ? '▲' : '▼'} {Math.abs(parseFloat(currentIdx?.percentage_change || 0)).toFixed(2)}%
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Total Volume</span>
            <span className="stat-value">{formatVolume(currentIdx?.total_volume || 0)}</span>
            <span className="stat-change" style={{ color: 'var(--text-muted)' }}>Today's Trading</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Market Sentiment</span>
            <span className="stat-value" style={{ color: sentimentColor(), fontSize: '22px' }}>
              {overview?.sentiment?.label || 'Neutral'}
            </span>
            <span className="stat-change" style={{ color: 'var(--text-muted)' }}>
              <span className="change-up">{overview?.sentiment?.advancing || 0} Adv</span>
              {' / '}
              <span className="change-down">{overview?.sentiment?.declining || 0} Dec</span>
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Listed Stocks</span>
            <span className="stat-value">{stocks.length}</span>
            <span className="stat-change" style={{ color: 'var(--text-muted)' }}>Active Securities</span>
          </div>
        </div>

        {/* ── SECTOR PERFORMANCE ── */}
        {sectors.length > 0 && (
          <section>
            <h2 className="section-title" style={{ marginBottom: '16px', fontSize: '16px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Sector Performance
            </h2>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {sectors.map(s => (
                <div
                  key={s.sector}
                  onClick={() => setSelectedSector(selectedSector === s.sector ? '' : s.sector)}
                  style={{
                    minWidth: '140px', padding: '16px', borderRadius: '12px', cursor: 'pointer',
                    background: selectedSector === s.sector ? 'var(--accent-dim)' : 'var(--card-bg)',
                    border: `1px solid ${selectedSector === s.sector ? 'var(--accent)' : 'var(--card-border)'}`,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>
                    {s.sector_display}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: parseFloat(s.avg_change) >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                    {parseFloat(s.avg_change) >= 0 ? '+' : ''}{parseFloat(s.avg_change).toFixed(2)}%
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {s.stock_count} stocks
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── MAIN CONTENT GRID ── */}
        <div className="market-grid-main">
          {/* ── STOCK TABLE ── */}
          <section className="market-section">
            {/* Tab Switcher */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'All Stocks' },
                { key: 'gainers', label: '🟢 Top Gainers' },
                { key: 'losers', label: '🔴 Top Losers' },
                { key: 'active', label: '⚡ Most Active' },
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`tf-btn ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search & Filter (only for All Stocks tab) */}
            {activeTab === 'all' && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search symbol or company..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    flex: '1', minWidth: '200px', padding: '10px 16px',
                    background: 'var(--input-bg)', border: '1px solid var(--card-border)',
                    borderRadius: '10px', color: 'inherit', outline: 'none', fontSize: '14px',
                  }}
                />
                <select
                  value={selectedSector}
                  onChange={e => setSelectedSector(e.target.value)}
                  style={{
                    padding: '10px 16px', background: 'var(--input-bg)',
                    border: '1px solid var(--card-border)', borderRadius: '10px',
                    color: 'inherit', outline: 'none', fontSize: '14px', cursor: 'pointer',
                  }}
                >
                  {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  style={{
                    padding: '10px 16px', background: 'var(--input-bg)',
                    border: '1px solid var(--card-border)', borderRadius: '10px',
                    color: 'inherit', outline: 'none', fontSize: '14px', cursor: 'pointer',
                  }}
                >
                  {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>Sort: {s.label}</option>)}
                </select>
                <button
                  onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
                  className="tf-btn"
                  style={{ minWidth: '44px' }}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            )}

            {/* Table */}
            <div className="trading-table-container">
              <table className="trading-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Price (Rs)</th>
                    <th>Change</th>
                    <th>High / Low</th>
                    <th>Volume</th>
                    <th>Market Cap</th>
                  </tr>
                </thead>
                <tbody>
                  {displayStocks.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No stocks found
                      </td>
                    </tr>
                  ) : (
                    displayStocks.map(stock => {
                      const pct = parseFloat(stock.percentage_change || 0);
                      return (
                        <tr
                          key={stock.symbol}
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/market/${stock.symbol}`)}
                        >
                          <td>
                            <div className="stock-symbol-cell">
                              <span className="symbol-name">{stock.symbol}</span>
                              <span className="company-name">{stock.company_name}</span>
                            </div>
                          </td>
                          <td className="price-cell" style={{ fontWeight: '700', fontFamily: 'monospace' }}>
                            Rs. {formatPrice(stock.current_price)}
                          </td>
                          <td className={`change-cell ${pct >= 0 ? 'change-up' : 'change-down'}`} style={{ fontWeight: '700' }}>
                            {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
                          </td>
                          <td className="hl-cell" style={{ fontSize: '13px' }}>
                            <span className="change-up">{formatPrice(stock.high_price)}</span>
                            {' / '}
                            <span className="change-down">{formatPrice(stock.low_price)}</span>
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>{formatVolume(stock.volume)}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{formatMarketCap(stock.market_cap)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── SIDEBAR ── */}
          <aside className="market-sidebar">
            {/* Top Gainers */}
            <div className="sidebar-card" style={{
              background: 'var(--card-bg)', border: '1px solid var(--card-border)',
              borderRadius: '16px', padding: '20px',
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '700', color: 'var(--success-color)' }}>
                🟢 Top Gainers
              </h3>
              <div className="mini-list">
                {(overview?.top_gainers || []).map(s => (
                  <div
                    key={s.symbol}
                    className="mini-list-item"
                    onClick={() => navigate(`/market/${s.symbol}`)}
                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--divider)' }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>{s.symbol}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rs. {formatPrice(s.current_price)}</div>
                    </div>
                    <span className="change-up" style={{ fontWeight: '700' }}>+{parseFloat(s.percentage_change).toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Losers */}
            <div className="sidebar-card" style={{
              background: 'var(--card-bg)', border: '1px solid var(--card-border)',
              borderRadius: '16px', padding: '20px', marginTop: '16px',
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '700', color: 'var(--danger-color)' }}>
                🔴 Top Losers
              </h3>
              <div className="mini-list">
                {(overview?.top_losers || []).map(s => (
                  <div
                    key={s.symbol}
                    className="mini-list-item"
                    onClick={() => navigate(`/market/${s.symbol}`)}
                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--divider)' }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>{s.symbol}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rs. {formatPrice(s.current_price)}</div>
                    </div>
                    <span className="change-down" style={{ fontWeight: '700' }}>{parseFloat(s.percentage_change).toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Active */}
            <div className="sidebar-card" style={{
              background: 'var(--card-bg)', border: '1px solid var(--card-border)',
              borderRadius: '16px', padding: '20px', marginTop: '16px',
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '700', color: 'var(--accent)' }}>
                ⚡ Most Active
              </h3>
              <div className="mini-list">
                {(overview?.most_active || []).map(s => (
                  <div
                    key={s.symbol}
                    className="mini-list-item"
                    onClick={() => navigate(`/market/${s.symbol}`)}
                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--divider)' }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>{s.symbol}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Vol: {formatVolume(s.volume)}</div>
                    </div>
                    <span className={parseFloat(s.percentage_change) >= 0 ? 'change-up' : 'change-down'} style={{ fontWeight: '700' }}>
                      {parseFloat(s.percentage_change) >= 0 ? '+' : ''}{parseFloat(s.percentage_change).toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
