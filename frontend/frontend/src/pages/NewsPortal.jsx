import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, TrendingUp, Globe, Coins, ArrowRight, RefreshCcw, BookOpen } from "lucide-react";
import Darklogo from "../assets/Darklogo.png";
import Lightlogo from "../assets/Lightlogo.png";

const NRB_FOREX_API = "https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=1&from=2026-01-17&to=2026-01-18";

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

  /* ── NEWS UI ── */
  .glass-card {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 24px; padding: 24px; backdrop-filter: blur(10px);
  }

  .forex-table {
    width: 100%; border-collapse: separate; border-spacing: 0;
  }
  .forex-table th { padding: 16px; color: var(--text-muted); font-size: 12px; text-transform: uppercase; border-bottom: 1px solid var(--card-border); }
  .forex-table td { padding: 16px; border-bottom: 1px solid var(--card-border); }
`;

export default function NewsPortal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(() => JSON.parse(localStorage.getItem("theme") || "true"));
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [forex, setForex] = useState([]);
  const [showNewspaper, setShowNewspaper] = useState(false);
  
  const [metalRates] = useState({
    fineGold: { buy: 276500, sell: 277200, purity: "99.99%" }, 
    tejabiGold: { buy: 275100, sell: 275800, purity: "91.6%" },
    silver: { buy: 5485, sell: 5645, purity: "99.9%" }
  });

  const [news] = useState([
    {
      title: "Gold price climbs above Rs 277,000 per tola in Nepal",
      source: "The Rising Nepal",
      date: "2026-01-17",
      snippet: "The Federation of Nepal Gold and Silver Dealers' Association fixed the price of hallmark gold at Rs 277,200 today...",
    },
    {
      title: "NRB Maintains Stable Inflation Targets for Q3",
      source: "Kathmandu Post",
      date: "2026-01-16",
      snippet: "Nepal Rastra Bank reports inflation contained at 3.8% despite global supply chain pressures.",
    }
  ]);

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(isDarkMode));
    window.dispatchEvent(new Event("storage"));
    fetchLiveRates();
  }, [isDarkMode]);

  const fetchLiveRates = async () => {
    setLoading(true);
    try {
      const response = await fetch(NRB_FOREX_API);
      const data = await response.json();
      if (data.status.code === 200 && data.data.payload.length > 0) {
        setForex(data.data.payload[0].rates);
      }
    } catch (error) {
      console.error("Failed to fetch NRB rates", error);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "Profile", path: "/profile", icon: "👤" },
    { name: "Charts", path: "/stock-charts", icon: "📈" },
    { name: "Intelligence", path: "/news", icon: "🌐" },
    { name: "Reminders", path: "/reminders", icon: "⏰" },
  ];

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
          <button className="dash-btn-circle" onClick={() => setShowNewspaper(true)}>
             <BookOpen size={18} />
          </button>
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

      <main style={{ width: '100%', maxWidth: '1200px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
                <p style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>Real-time Intelligence</p>
                <h1 style={{ fontFamily: 'Syne', fontSize: '36px' }}>Market <span style={{ color: 'var(--accent)' }}>Portal</span></h1>
            </div>
            <button onClick={fetchLiveRates} className="dash-btn-circle">
                <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
            </button>
        </div>

        {/* BULLION SECTION */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            <BullionCard title="Fine Gold (24K)" sell={metalRates.fineGold.sell} buy={metalRates.fineGold.buy} purity={metalRates.fineGold.purity} icon="🏆" />
            <BullionCard title="Tejabi Gold" sell={metalRates.tejabiGold.sell} buy={metalRates.tejabiGold.buy} purity={metalRates.tejabiGold.purity} icon="🏵️" />
            <BullionCard title="Silver" sell={metalRates.silver.sell} buy={metalRates.silver.buy} purity={metalRates.silver.purity} icon="🥈" />
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
            {/* FOREX TABLE */}
            <div className="glass-card" style={{ overflowX: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Globe size={20} color="var(--accent)" />
                    <h2 style={{ fontFamily: 'Syne', fontSize: '18px' }}>NRB Exchange Rates</h2>
                </div>
                <table className="forex-table">
                    <thead>
                        <tr>
                            <th>Currency</th>
                            <th>Unit</th>
                            <th style={{ color: '#10B981' }}>Buying</th>
                            <th style={{ color: '#EF4444' }}>Selling</th>
                        </tr>
                    </thead>
                    <tbody>
                        {forex.map((cur, idx) => (
                            <tr key={idx}>
                                <td style={{ fontWeight: '700' }}>
                                    <span style={{ background: 'var(--accent-glow)', color: 'var(--accent)', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', marginRight: '10px' }}>{cur.currency.iso3}</span>
                                    {cur.currency.name}
                                </td>
                                <td style={{ color: 'var(--text-muted)' }}>{cur.currency.unit}</td>
                                <td style={{ color: '#10B981', fontWeight: 'bold' }}>{cur.buy}</td>
                                <td style={{ color: '#EF4444', fontWeight: 'bold' }}>{cur.sell}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* NEWS FEED */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ fontFamily: 'Syne', fontSize: '18px' }}>Top Stories</h2>
                {news.map((item, i) => (
                    <div key={i} className="glass-card" style={{ padding: '20px', transition: '0.3s', cursor: 'pointer' }}>
                         <p style={{ color: 'var(--accent)', fontSize: '10px', fontWeight: '800', marginBottom: '8px' }}>{item.source} • {item.date}</p>
                         <h3 style={{ fontWeight: '700', fontSize: '15px', lineHeight: '1.4', marginBottom: '10px' }}>{item.title}</h3>
                         <p style={{ fontSize: '13px', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.snippet}</p>
                         <ArrowRight size={14} style={{ marginTop: '15px', color: 'var(--accent)' }} />
                    </div>
                ))}
            </div>
        </div>
      </main>

      {/* NEWSPAPER MODAL */}
      {showNewspaper && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(10px)' }}>
          <div style={{ background: '#f4f1ea', color: '#1a1a1a', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '4px', position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
            <button onClick={() => setShowNewspaper(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#000' }}><X size={24} /></button>
            <div style={{ background: '#D90A14', padding: '15px', textAlign: 'center', color: '#fff', fontFamily: 'Syne', fontWeight: '800', fontSize: '24px' }}>INVESTO DAILY</div>
            <div style={{ padding: '40px', fontFamily: 'serif' }}>
              <h3 style={{ fontSize: '32px', fontWeight: '900', textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>NEPAL INTELLIGENCE REPORT</h3>
              <div style={{ columnCount: 2, columnGap: '30px', textAlign: 'justify' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#D90A14' }}>Remittance Surges Q1</h4>
                <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>NRB reports indicate that remittance inflows have hit a record high for the start of 2026. This influx is expected to stabilize foreign exchange reserves despite rising import costs.</p>
                <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#D90A14' }}>Bullion Market Alert</h4>
                <p style={{ fontSize: '14px', lineHeight: '1.6' }}>With gold prices hovering near Rs 277k, local jewelry markets see a shift towards investment-grade bars as consumer sentiment pivots from decorative to survivalist financial strategies.</p>
              </div>
              <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ccc', textAlign: 'center', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>© 2026 Investo Nepal - Data sourced from NRB & FENOSGODA</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BullionCard({ title, sell, buy, purity, icon }) {
    return (
        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: '40px', position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }}>{icon}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{title}</span>
                <span style={{ fontSize: '10px', background: 'var(--accent-glow)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{purity}</span>
            </div>
            <div style={{ marginBottom: '15px' }}>
                <p style={{ fontSize: '10px', color: '#EF4444', fontWeight: '800', textTransform: 'uppercase' }}>Selling Rate</p>
                <p style={{ fontSize: '28px', fontWeight: '900', fontFamily: 'Syne' }}>Rs {sell.toLocaleString()}</p>
            </div>
            <div style={{ paddingTop: '15px', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <p style={{ fontSize: '10px', color: '#10B981', fontWeight: '800', textTransform: 'uppercase' }}>Buying Rate</p>
                    <p style={{ fontSize: '16px', fontWeight: '700', color: '#10B981' }}>Rs {buy.toLocaleString()}</p>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>per Tola</span>
            </div>
        </div>
    );
}