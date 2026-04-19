import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Globe, ArrowRight, RefreshCcw, BookOpen, Newspaper, TrendingUp, Landmark, BarChart3, PieChart } from "lucide-react";

const NRB_FOREX_API = "https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=1&from=2026-04-07&to=2026-04-08";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');

  .feat-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    padding: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

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

  .brand-logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 24px;
    letter-spacing: -1px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

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

  .glass-card {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 24px; padding: 24px; backdrop-filter: blur(10px);
  }

  .forex-table { width: 100%; border-collapse: separate; border-spacing: 0; }
  .forex-table th { padding: 16px; color: var(--text-muted); font-size: 11px; text-transform: uppercase; border-bottom: 1px solid var(--card-border); text-align: left; }
  .forex-table td { padding: 16px; border-bottom: 1px solid var(--card-border); font-size: 14px; }

  /* Newspaper Modal Styling */
  .paper-canvas {
    background: #fdfaf0;
    color: #1a1a1a;
    width: 100%;
    max-width: 1000px;
    max-height: 90vh;
    overflow-y: auto;
    border: 1px solid #d4c4a8;
    position: relative;
    box-shadow: 0 40px 100px rgba(0,0,0,0.6);
    font-family: 'Playfair Display', serif;
  }
  .paper-masthead {
    text-align: center;
    padding: 40px 0 10px;
    border-bottom: 4px double #1a1a1a;
    margin: 0 40px;
  }
  .paper-grid {
    display: grid;
    grid-template-columns: 220px 1fr 220px;
    gap: 30px;
    padding: 30px 40px;
  }
  .paper-sidebar { border-right: 1px solid #d4c4a8; padding-right: 20px; }
  .paper-sidebar-right { border-left: 1px solid #d4c4a8; padding-left: 20px; }
  .dropcap::first-letter {
    float: left; font-size: 60px; line-height: 48px; padding-top: 4px; padding-right: 8px; font-weight: 900;
  }
`;

export default function NewsPortal() {
  const navigate = useNavigate();
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
    { category: "NEPSE", title: "Upper Tamakoshi Rights Share Listing Impacts Hydropower Index", source: "Nepal Stock House", date: "2026-04-08", snippet: "Hydropower sub-index saw high volatility as major right shares hit the market.", impact: "high" },
    { category: "GLOBAL TECH", title: "NVIDIA Quantum-2 Chips Begin Mass Export", source: "Bloomberg", date: "2026-04-07", snippet: "Tech stocks surge globally as NVIDIA announces the next phase of AI hardware.", impact: "medium" },
    { category: "MACRO", title: "NRB Tightens Liquidity to Curb Unproductive Lending", source: "The Kathmandu Post", date: "2026-04-07", snippet: "NRB increases the CRR to stabilize interest rates amid rising credit demand.", impact: "high" }
  ]);

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(isDarkMode));
    fetchLiveRates();
  }, [isDarkMode]);

  const fetchLiveRates = async () => {
    setLoading(true);
    try {
      const response = await fetch(NRB_FOREX_API);
      const data = await response.json();
      if (data.status.code === 200) setForex(data.data.payload[0].rates);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  return (
    <div className={`feat-root ${isDarkMode ? "mode-dark" : "mode-light"}`}>
      <style>{css}</style>

      <header className="dash-header">
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button className="dash-btn-circle" onClick={() => setIsNavOpen(!isNavOpen)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ width: '18px', height: '2px', background: 'var(--accent)' }} />
              <div style={{ width: '12px', height: '2px', background: 'var(--accent)' }} />
            </div>
          </button>
          <div className="brand-logo">Investo<span style={{ color: 'var(--accent)' }}>.</span></div>
        </div>
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

      <div className={`side-drawer ${isNavOpen ? 'open' : ''}`}>
        <div className="brand-logo" style={{ padding: '0 20px 30px', fontSize: '32px' }}>Investo<span style={{ color: 'var(--accent)' }}>.</span></div>
        <div className="nav-item active">🏠 Dashboard</div>
        <div className="nav-item">📊 Intelligence</div>
        <div className="nav-item">👤 Profile</div>
      </div>

      <main style={{ width: '100%', maxWidth: '1200px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
                <p style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>Terminal Intelligence</p>
                <h1 style={{ fontFamily: 'Syne', fontSize: '36px' }}>Market <span style={{ color: 'var(--accent)' }}>Central</span></h1>
            </div>
            <button onClick={fetchLiveRates} className="dash-btn-circle">
                <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
            </button>
        </div>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            <BullionCard title="Fine Gold (24K)" sell={metalRates.fineGold.sell} buy={metalRates.fineGold.buy} purity={metalRates.fineGold.purity} icon="🏆" />
            <BullionCard title="Tejabi Gold" sell={metalRates.tejabiGold.sell} buy={metalRates.tejabiGold.buy} purity={metalRates.tejabiGold.purity} icon="🏵️" />
            <BullionCard title="Silver" sell={metalRates.silver.sell} buy={metalRates.silver.buy} purity={metalRates.silver.purity} icon="🥈" />
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
            <div className="glass-card" style={{ overflowX: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Globe size={20} color="var(--accent)" />
                    <h2 style={{ fontFamily: 'Syne', fontSize: '18px' }}>Global FX Rates</h2>
                </div>
                <table className="forex-table">
                    <thead>
                        <tr><th>Currency</th><th>Unit</th><th style={{ color: '#10B981' }}>Buying</th><th style={{ color: '#EF4444' }}>Selling</th></tr>
                    </thead>
                    <tbody>
                        {forex.map((cur, idx) => (
                            <tr key={idx}>
                                <td style={{ fontWeight: '700' }}><span style={{ background: 'var(--accent-glow)', color: 'var(--accent)', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', marginRight: '10px' }}>{cur.currency.iso3}</span>{cur.currency.name}</td>
                                <td style={{ color: 'var(--text-muted)' }}>{cur.currency.unit}</td>
                                <td style={{ color: '#10B981', fontWeight: 'bold' }}>{cur.buy}</td>
                                <td style={{ color: '#EF4444', fontWeight: 'bold' }}>{cur.sell}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Newspaper size={18} color="var(--accent)" /><h2 style={{ fontFamily: 'Syne', fontSize: '18px' }}>Top Stories</h2></div>
                {news.map((item, i) => (
                    <div key={i} className="glass-card" style={{ padding: '20px', cursor: 'pointer', borderLeft: item.impact === 'high' ? '4px solid var(--accent)' : '1px solid var(--card-border)' }}>
                         <span style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '8px', display: 'block' }}>{item.category}</span>
                         <h3 style={{ fontWeight: '700', fontSize: '14px', lineHeight: '1.4', marginBottom: '12px' }}>{item.title}</h3>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.source}</span>
                             <ArrowRight size={14} color="var(--accent)" />
                         </div>
                    </div>
                ))}
            </div>
        </div>
      </main>

      {/* VOLUMIZED NEWSPAPER MODAL */}
      {showNewspaper && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(20px)' }}>
          <div className="paper-canvas">
            <button onClick={() => setShowNewspaper(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#000', borderRadius: '50%', width: '32px', height: '32px', border: 'none', cursor: 'pointer', color: '#fff', zIndex: 50 }}><X size={18} /></button>
            
            <div className="paper-masthead">
              <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '3px', margin: '0 0 10px' }}>The Intelligence of Markets</p>
              <h1 style={{ fontSize: '84px', fontWeight: '900', letterSpacing: '-4px', margin: 0, lineHeight: 0.9 }}>INVESTO DAILY</h1>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase' }}>
                <span>Vol. LXIV — No. 112</span>
                <span>Kathmandu, Wednesday, April 8, 2026</span>
                <span>Premium Edition</span>
              </div>
            </div>

            <div className="paper-grid">
              {/* Left Column: Briefs */}
              <div className="paper-sidebar">
                <div style={{ background: '#1a1a1a', color: '#fff', padding: '5px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px' }}>MARKET PULSE</div>
                <div style={{ marginBottom: '25px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '900', lineHeight: 1.1, marginBottom: '8px' }}>Remittance Hits $15B Milestone</h4>
                  <p style={{ fontSize: '14px', margin: 0 }}>NRB confirms 14% growth in inflow, stabilizing the national reserve ratio.</p>
                </div>
                <div style={{ height: '1px', background: '#d4c4a8', margin: '20px 0' }} />
                <div style={{ marginBottom: '25px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '900', lineHeight: 1.1, marginBottom: '8px' }}>Interest Rates Stabilize at 7.4%</h4>
                  <p style={{ fontSize: '14px', margin: 0 }}>Commercial banks report surplus liquidity as credit demand for SMEs slows.</p>
                </div>
              </div>

              {/* Center Column: Main Story */}
              <div>
                <h2 style={{ fontSize: '46px', fontWeight: '900', lineHeight: 1, letterSpacing: '-1.5px', marginBottom: '20px' }}>NRB Signals Contraction as Hydropower Stocks Face Liquidity Wall</h2>
                <p className="dropcap" style={{ fontSize: '17px', lineHeight: 1.5, textAlign: 'justify' }}>
                  The Nepal Rastra Bank (NRB) has officially signaled a pivot toward a more conservative monetary stance for the second quarter of 2026. This decision, aimed at curbing speculative lending in "unproductive sectors," has triggered immediate waves across the NEPSE index.
                </p>
                <p style={{ fontSize: '17px', lineHeight: 1.5, textAlign: 'justify', marginTop: '15px' }}>
                  Hydropower stocks, which have enjoyed a year of robust retail interest, saw a cumulative 4% drop within minutes of the opening bell. "The era of cheap capital is ending," noted one lead analyst. "We are seeing a flight to quality as institutional players move into fixed-income assets and blue-chip commercial banks."
                </p>
                <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <BarChart3 size={50} strokeWidth={1.5} />
                  <div>
                    <span style={{ fontWeight: '900', fontSize: '14px' }}>FIG A.1: LIQUIDITY VELOCITY</span>
                    <p style={{ fontSize: '12px', margin: 0, fontStyle: 'italic' }}>Quarterly analysis shows a sharp rise in fixed deposits over equity allocations.</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Global Trends */}
              <div className="paper-sidebar-right">
                <div style={{ borderBottom: '2px solid #1a1a1a', paddingBottom: '5px', marginBottom: '15px', fontWeight: '900', fontSize: '14px' }}>GLOBAL WRAP</div>
                <div style={{ marginBottom: '25px' }}>
                  <span style={{ color: '#D90A14', fontSize: '12px', fontWeight: '900' }}>NYSE / TECH</span>
                  <h4 style={{ fontSize: '17px', fontWeight: '900', lineHeight: 1.1, margin: '5px 0' }}>NVIDIA Quantum Export Begins</h4>
                  <p style={{ fontSize: '13px', margin: 0 }}>Quantum-2 chipsets trigger a global hardware rally in Asian markets.</p>
                </div>
                <div style={{ marginBottom: '25px' }}>
                  <span style={{ color: '#D90A14', fontSize: '12px', fontWeight: '900' }}>BRENT CRUDE</span>
                  <h4 style={{ fontSize: '17px', fontWeight: '900', lineHeight: 1.1, margin: '5px 0' }}>Oil Hits Resistance at $92</h4>
                  <p style={{ fontSize: '13px', margin: 0 }}>Supply chain logistics stabilize in the Mediterranean shipping routes.</p>
                </div>
                <div style={{ textAlign: 'center', marginTop: '40px', opacity: 0.4 }}>
                  <PieChart size={64} strokeWidth={1} />
                  <p style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '10px' }}>Asset Allocation Index</p>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '2px solid #1a1a1a', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold' }}>
              <span>PROPRIETARY DATA HUB</span>
              <span>© 2026 INVESTO GLOBAL MEDIA GROUP</span>
              <span>CLASSIFIED ACCESS ONLY</span>
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