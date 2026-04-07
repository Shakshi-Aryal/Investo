import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Pie, Bar } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Darklogo from "../assets/Darklogo.png";
import Lightlogo from "../assets/Lightlogo.png";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, ArcElement, BarElement, Tooltip, Legend);

const API_URL = "http://127.0.0.1:8000/api/portfolio/";
const TOKEN_KEY = "jwt";

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

  /* ── PORTFOLIO UI ── */
  .portfolio-container { width: 100%; max-width: 1200px; display: flex; flex-direction: column; gap: 24px; }
  
  .glass-card {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 24px; padding: 24px; backdrop-filter: blur(10px);
  }

  .stat-val { font-size: 28px; font-weight: 800; font-family: 'Syne', sans-serif; }

  .invest-form {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px; margin-bottom: 24px;
  }

  .invest-input {
    padding: 14px 18px; border-radius: 14px; background: var(--input-bg);
    border: 1px solid var(--card-border); color: inherit; outline: none;
    transition: 0.3s;
  }
  .invest-input:focus { border-color: var(--accent); }

  .btn-main {
    padding: 14px 24px; border-radius: 14px; border: none; font-weight: 700;
    cursor: pointer; transition: 0.3s; font-family: 'Syne', sans-serif;
    color: white;
  }

  .portfolio-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px; border-bottom: 1px solid var(--card-border);
    transition: 0.2s;
  }
  .portfolio-item:hover { background: var(--accent-glow); border-radius: 12px; }
`;

function PortfolioManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem(TOKEN_KEY);

  // State
  const [isDarkMode, setIsDarkMode] = useState(() => JSON.parse(localStorage.getItem("theme") || "true"));
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [investmentName, setInvestmentName] = useState("");
  const [capital, setCapital] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [timePeriod, setTimePeriod] = useState("");
  const [portfolio, setPortfolio] = useState([]);
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(isDarkMode));
    window.dispatchEvent(new Event("storage"));
  }, [isDarkMode]);

  const fetchPortfolio = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setPortfolio(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => { if (token) fetchPortfolio(); }, [token]);

  const addPortfolio = async (e) => {
    e.preventDefault();
    try {
      const item = {
        investment_name: investmentName,
        total_capital: parseFloat(capital),
        investment_amount: parseFloat(investmentAmount),
        estimated_return_per_year: 10,
        time_period: parseInt(timePeriod),
      };
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        setInvestmentName(""); setCapital(""); setInvestmentAmount(""); setTimePeriod("");
        fetchPortfolio();
      }
    } catch (err) { console.error(err); }
  };

  const deletePortfolio = async (id) => {
    if (!window.confirm("Remove this entry?")) return;
    try {
      await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPortfolio();
    } catch (err) { console.error(err); }
  };

  const totalCapital = portfolio.reduce((sum, p) => sum + p.total_capital, 0);
  const totalInvestment = portfolio.reduce((sum, p) => sum + p.investment_amount, 0);
  const avgROI = portfolio.length > 0 ? portfolio.reduce((sum, p) => sum + p.roi, 0) / portfolio.length : 0;

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Investo Portfolio Report", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [["Investment", "Capital", "Value", "Time", "ROI %"]],
      body: portfolio.map((p) => [p.investment_name, p.total_capital, p.investment_amount, p.time_period, p.roi]),
    });
    doc.save("Investo_Portfolio.pdf");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "My Profile", path: "/profile", icon: "👤" },
    { name: "Stock Charts", path: "/stock-charts", icon: "📈" },
    { name: "Portfolio", path: "/portfolio", icon: "💼" },
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

      <main className="portfolio-container">
        <h1 style={{ fontFamily: 'Syne', fontSize: '32px' }}>Portfolio <span style={{color:'var(--accent)'}}>Management</span></h1>

        {/* INPUT FORM */}
        <section className="glass-card">
          <form onSubmit={addPortfolio} className="invest-form">
            <input className="invest-input" placeholder="Investment Name" value={investmentName} onChange={(e) => setInvestmentName(e.target.value)} required />
            <input className="invest-input" type="number" placeholder="Total Capital" value={capital} onChange={(e) => setCapital(e.target.value)} required />
            <input className="invest-input" type="number" placeholder="Current Value" value={investmentAmount} onChange={(e) => setInvestmentAmount(e.target.value)} required />
            <input className="invest-input" type="number" placeholder="Years" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} required />
            <button className="btn-main" style={{ background: 'var(--accent)' }}>Add Entry</button>
          </form>
        </section>

        {/* SUMMARY STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          <div className="glass-card">
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Total Capital</p>
            <p className="stat-val" style={{ color: '#3B82F6' }}>Rs. {totalCapital.toLocaleString()}</p>
          </div>
          <div className="glass-card">
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Current Market Value</p>
            <p className="stat-val" style={{ color: '#10B981' }}>Rs. {totalInvestment.toLocaleString()}</p>
          </div>
          <div className="glass-card">
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Weighted Avg ROI</p>
            <p className="stat-val" style={{ color: '#F59E0B' }}>{avgROI.toFixed(2)}%</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn-main" style={{ background: '#3B82F6' }} onClick={() => setShowCharts(!showCharts)}>
            {showCharts ? "Hide Analytics" : "View Analytics"}
          </button>
          <button className="btn-main" style={{ background: '#10B981' }} onClick={generatePDF}>Export PDF</button>
        </div>

        {/* CHARTS SECTION */}
        {showCharts && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            <div className="glass-card"><Bar data={{ ...roiData, datasets: [{ ...roiData.datasets[0], backgroundColor: isDarkMode ? '#D90A14' : '#BA7517' }] }} options={{ responsive: true, plugins: { legend: { labels: { color: isDarkMode ? '#fff' : '#000' } } } }} /></div>
            <div className="glass-card"><Pie data={capitalPie} options={{ responsive: true, plugins: { legend: { labels: { color: isDarkMode ? '#fff' : '#000' } } } }} /></div>
          </div>
        )}

        {/* ASSET LIST */}
        <section className="glass-card">
          <h3 style={{ fontFamily: 'Syne', marginBottom: '20px' }}>Asset Allocation</h3>
          {portfolio.map((p) => (
            <div key={p.id} className="portfolio-item">
              <div>
                <p style={{ fontWeight: '700' }}>{p.investment_name}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Cap: Rs.{p.total_capital} | Val: Rs.{p.investment_amount} | {p.time_period}Y
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{ fontWeight: '800', color: p.roi >= 0 ? '#10B981' : '#EF4444' }}>{p.roi?.toFixed(1)}%</span>
                <button onClick={() => deletePortfolio(p.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default PortfolioManagement;