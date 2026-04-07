import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Darklogo from "../assets/Darklogo.png";
import Lightlogo from "../assets/Lightlogo.png";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');

  .feat-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    padding: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ── DYNAMIC THEMES ── */
  .mode-dark {
    background: radial-gradient(circle at top right, #1a0508, #080306);
    color: #ffffff;
    --accent: #D90A14;
    --accent-glow: rgba(217, 10, 20, 0.15);
    --card-bg: rgba(255, 255, 255, 0.03);
    --card-border: rgba(217, 10, 20, 0.1);
    --input-bg: rgba(255, 255, 255, 0.05);
    --text-muted: #9a7a7c;
  }

  .mode-light {
    background: radial-gradient(circle at top right, #fff5e6, #faf8f3);
    color: #1a1208;
    --accent: #BA7517;
    --accent-glow: rgba(186, 117, 23, 0.1);
    --card-bg: rgba(255, 255, 255, 0.7);
    --card-border: rgba(186, 117, 23, 0.15);
    --input-bg: #ffffff;
    --text-muted: #8a6a3a;
  }

  /* ── NAVIGATION ── */
  .dash-header {
    width: 100%; max-width: 1200px; display: flex; justify-content: space-between;
    align-items: center; margin-bottom: 30px; backdrop-filter: blur(10px);
    padding: 16px 24px; border-radius: 24px; background: var(--card-bg);
    border: 1px solid var(--card-border); z-index: 1001;
  }

  .dash-btn-circle {
    width: 42px; height: 42px; border-radius: 12px; background: var(--input-bg);
    border: 1px solid var(--card-border); cursor: pointer; display: flex;
    align-items: center; justify-content: center; transition: 0.2s; color: inherit;
  }
  .dash-btn-circle:hover { background: var(--accent); color: white; border-color: var(--accent); }

  .nav-trigger {
    width: 42px; height: 42px; border-radius: 12px; background: var(--input-bg);
    border: 1px solid var(--card-border); cursor: pointer;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  }
  .bar { width: 18px; height: 2px; background: var(--accent); border-radius: 2px; transition: 0.3s; }

  .side-drawer {
    position: fixed; top: 0; left: -320px; width: 300px; height: 100vh;
    background: var(--card-bg); backdrop-filter: blur(25px);
    border-right: 1px solid var(--card-border); z-index: 1000;
    transition: left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
    padding: 100px 24px 40px; display: flex; flex-direction: column; gap: 12px;
  }
  .side-drawer.open { left: 0; box-shadow: 20px 0 60px rgba(0,0,0,0.2); }

  .nav-item {
    padding: 14px 20px; border-radius: 14px; color: var(--text-muted);
    font-weight: 600; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; gap: 12px; font-family: 'Syne', sans-serif;
  }
  .nav-item:hover, .nav-item.active { background: var(--accent-glow); color: var(--accent); transform: translateX(5px); }

  /* ── STOCK SPECIFIC UI ── */
  .stock-container { width: 100%; max-width: 1200px; display: flex; flex-direction: column; gap: 24px; }
  
  .glass-card {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 24px; padding: 24px; backdrop-filter: blur(10px);
  }

  .status-badge {
    padding: 6px 14px; border-radius: 10px; font-size: 12px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 1px;
  }

  .stock-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
  .stock-table th { padding: 12px; color: var(--text-muted); font-size: 11px; text-transform: uppercase; text-align: left; }
  .stock-table td { padding: 16px; background: var(--input-bg); transition: 0.3s; }
  .stock-table tr td:first-child { border-radius: 14px 0 0 14px; }
  .stock-table tr td:last-child { border-radius: 0 14px 14px 0; }
  .stock-table tr:hover td { background: var(--accent-glow); }
  .active-row td { border-top: 1px solid var(--accent); border-bottom: 1px solid var(--accent); }

  .search-box {
    width: 100%; padding: 16px 24px; background: var(--card-bg);
    border: 1px solid var(--card-border); border-radius: 20px;
    color: inherit; outline: none; font-size: 16px; transition: 0.3s;
  }
  .search-box:focus { border-color: var(--accent); box-shadow: 0 0 20px var(--accent-glow); }

  .watchlist-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
  .watch-item { 
    background: var(--input-bg); padding: 20px; border-radius: 20px; 
    border: 1px solid var(--card-border); position: relative; 
  }
`;

export default function Stockcharts() {
  const API = "http://127.0.0.1:8000/api";
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [isDarkMode, setIsDarkMode] = useState(() => JSON.parse(localStorage.getItem("theme") || "true"));
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [stocks, setStocks] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [status, setStatus] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [selectedStock, setSelectedStock] = useState("NABIL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isChartZoomed, setIsChartZoomed] = useState(false);

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(isDarkMode));
    window.dispatchEvent(new Event("storage"));
  }, [isDarkMode]);

  const safeJson = async (res, fallback = []) => {
    try { return res.ok ? await res.json() : fallback; } catch { return fallback; }
  };

  const fetchData = async () => {
    setLoading(true);
    const [sRes, gRes, lRes, stRes, wRes] = await Promise.all([
      fetch(`${API}/stocks/`), fetch(`${API}/gainers/`),
      fetch(`${API}/losers/`), fetch(`${API}/status/`), fetch(`${API}/watchlist/`),
    ]);
    setStocks(await safeJson(sRes, []));
    setGainers(await safeJson(gRes, []));
    setLosers(await safeJson(lRes, []));
    setStatus(await safeJson(stRes, null));
    setWatchlist(await safeJson(wRes, []));
    setLoading(false);
  };

  const fetchChart = async (symbol) => {
    const res = await fetch(`${API}/chart/?symbol=${symbol}`);
    const data = await safeJson(res, []);
    setChartData(data.map(d => ({ date: d.date, price: d.close })));
  };

  const toggleWatchlist = async (symbol) => {
    await fetch(`${API}/watchlist/toggle/?symbol=${symbol}`);
    fetchData(); 
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchChart(selectedStock); }, [selectedStock]);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "My Profile", path: "/profile", icon: "👤" },
    { name: "Stock Charts", path: "/stock-charts", icon: "📈" },
    { name: "Wealth Tracker", path: "/expense-tracker", icon: "💰" },
    { name: "Knowledge", path: "/glossary", icon: "📖" },
  ];

  const filteredStocks = stocks.filter(s => s.symbol?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={`feat-root ${isDarkMode ? "mode-dark" : "mode-light"}`}>
      <style>{css}</style>

      {/* ── UNIFIED HEADER ── */}
      <header className="dash-header">
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="nav-trigger" onClick={() => setIsNavOpen(!isNavOpen)}>
            <div className="bar" /><div className="bar" /><div className="bar" />
          </button>
          <button className="dash-btn-circle" onClick={() => navigate(-1)}>←</button>
        </div>
        <img src={isDarkMode ? Darklogo : Lightlogo} alt="Investo" style={{ height: '24px' }} />
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="dash-btn-circle" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? "☀️" : "🌙"}
          </button>
          <img src="https://i.pravatar.cc/150?u=investo" style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid var(--card-border)' }} />
        </div>
      </header>

      {/* ── SIDE DRAWER ── */}
      <div className={`side-drawer ${isNavOpen ? 'open' : ''}`}>
        <h2 style={{ fontFamily: 'Syne', padding: '0 20px 30px', fontSize: '28px' }}>Investo<span>.</span></h2>
        {navItems.map(item => (
          <div key={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
            {item.icon} {item.name}
          </div>
        ))}
      </div>

      <main className="stock-container">
        {/* Market Status Bar */}
        <div className="flex justify-between items-center">
          <h1 style={{ fontFamily: 'Syne', fontSize: '28px' }}>NEPSE <span style={{color:'var(--accent)'}}>Analytics</span></h1>
          <div className="status-badge" style={{ background: status?.isOpen ? 'rgba(34,197,94,0.1)' : 'rgba(217,10,20,0.1)', color: status?.isOpen ? '#22c55e' : '#ef4444' }}>
            {status?.isOpen ? "● Market Open" : "○ Market Closed"}
          </div>
        </div>

        {/* Watchlist Section */}
        <section className="glass-card">
          <h3 style={{ fontFamily: 'Syne', marginBottom: '20px', color: 'var(--accent)' }}>⭐ Watchlist</h3>
          <div className="watchlist-grid">
            {watchlist.map((s, i) => (
              <div key={i} className="watch-item">
                <button onClick={() => toggleWatchlist(s.symbol)} style={{ position:'absolute', top:'10px', right:'10px', border:'none', background:'none', cursor:'pointer', color:'#ef4444' }}>✕</button>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>{s.symbol}</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', margin: '4px 0' }}>Rs.{s.last_traded_price}</div>
                <div style={{ fontSize: '13px', color: s.percentage_change >= 0 ? '#22c55e' : '#ef4444' }}>
                  {s.percentage_change >= 0 ? "▲" : "▼"} {Math.abs(s.percentage_change)}%
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats & Mini Chart */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div className="glass-card">
            <h4 style={{ color: '#22c55e', marginBottom: '15px' }}>Top Gainers</h4>
            {gainers.slice(0, 4).map((g, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--card-border)' }}>
                <span>{g.symbol}</span><span style={{ color: '#22c55e' }}>+{g.percentage_change}%</span>
              </div>
            ))}
          </div>

          <div 
            className="glass-card" 
            style={{ cursor: 'pointer', border: '1px solid var(--accent)' }}
            onClick={() => setIsChartZoomed(true)}
          >
            <div className="flex justify-between">
              <h4 style={{ color: 'var(--accent)' }}>{selectedStock} Performance</h4>
              <span style={{ fontSize: '10px', opacity: 0.5 }}>CLICK TO EXPAND</span>
            </div>
            <div style={{ height: '120px', marginTop: '10px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line type="monotone" dataKey="price" stroke={isDarkMode ? "#D90A14" : "#BA7517"} dot={false} strokeWidth={2} />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ background: '#000', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Main Stock Table */}
        <input 
          className="search-box" 
          placeholder="Search Symbol (e.g. NABIL)..." 
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="glass-card" style={{ padding: '10px' }}>
          <table className="stock-table">
            <thead>
              <tr><th>Symbol</th><th>LTP (Rs.)</th><th>Change</th><th style={{ textAlign: 'center' }}>Watch</th></tr>
            </thead>
            <tbody>
              {filteredStocks.map((s, i) => {
                const isSaved = watchlist.some(w => w.symbol === s.symbol);
                return (
                  <tr key={i} className={selectedStock === s.symbol ? "active-row" : ""} onClick={() => setSelectedStock(s.symbol)}>
                    <td style={{ fontWeight: 'bold' }}>{s.symbol}</td>
                    <td style={{ fontFamily: 'monospace' }}>{s.last_traded_price}</td>
                    <td style={{ color: s.percentage_change >= 0 ? '#22c55e' : '#ef4444' }}>{s.percentage_change}%</td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleWatchlist(s.symbol); }}
                        style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
                      >
                        {isSaved ? "⭐" : "☆"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* ── FULLSCREEN MODAL CHART ── */}
      {isChartZoomed && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '1000px', height: '80vh', position: 'relative' }}>
            <button onClick={() => setIsChartZoomed(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }}>✕</button>
            <h2 style={{ fontFamily: 'Syne', fontSize: '32px', marginBottom: '30px' }}>{selectedStock} <span style={{ color: 'var(--accent)' }}>History</span></h2>
            <div style={{ height: '70%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
                  <YAxis stroke="var(--text-muted)" domain={['auto', 'auto']} orientation="right" />
                  <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }} />
                  <Line type="monotone" dataKey="price" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}