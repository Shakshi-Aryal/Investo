import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Pie, Bar } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AlertCircle, Trash2, TrendingUp, Download, Plus } from "lucide-react";
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
    box-sizing: border-box;
    max-width: 100vw;
    overflow-x: hidden;
  }

  .mode-dark {
    background: radial-gradient(circle at top right, #1a0508, #080306);
    color: #ffffff;
    --accent: #D90A14;
    --accent-glow: rgba(217, 10, 20, 0.15);
    --card-bg: rgba(255, 255, 255, 0.03);
    --card-border: rgba(217, 10, 20, 0.15);
    --input-bg: rgba(255, 255, 255, 0.05);
    --text-muted: #9a7a7c;
    --table-head: rgba(255, 255, 255, 0.05);
    --error: #ff4d4d;
  }

  .mode-light {
    background: radial-gradient(circle at top right, #fff5e6, #faf8f3);
    color: #1a1208;
    --accent: #BA7517;
    --accent-glow: rgba(186, 117, 23, 0.1);
    --card-bg: rgba(255, 255, 255, 0.7);
    --card-border: rgba(186, 117, 23, 0.2);
    --input-bg: #ffffff;
    --text-muted: #8a6a3a;
    --table-head: rgba(186, 117, 23, 0.05);
    --error: #d93025;
  }

  .dash-header {
    width: 100%; max-width: 1200px; display: flex; justify-content: space-between;
    align-items: center; margin-bottom: 30px; backdrop-filter: blur(10px);
    padding: 16px 24px; border-radius: 24px; background: var(--card-bg);
    border: 1px solid var(--card-border); z-index: 1001;
    box-sizing: border-box;
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

  .portfolio-container { 
    width: 100%; 
    max-width: 1200px; 
    display: flex; 
    flex-direction: column; 
    gap: 24px;
    box-sizing: border-box;
  }
  
  .glass-card {
    background: var(--card-bg); 
    border: 1px solid var(--card-border);
    border-radius: 24px; 
    padding: 24px; 
    backdrop-filter: blur(10px);
    overflow: hidden;
  }

  .stat-val { 
    font-size: clamp(1.4rem, 4vw, 28px);
    font-weight: 800; 
    font-family: 'Syne', sans-serif;
    word-break: break-all;
  }

  .invest-form {
    display: grid; 
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px; 
    margin-bottom: 10px;
  }

  .input-group { display: flex; flex-direction: column; }

  .invest-input {
    padding: 14px 18px; border-radius: 14px; background: var(--input-bg);
    border: 1px solid var(--card-border); color: inherit; outline: none;
    transition: 0.3s; width: 100%; box-sizing: border-box;
  }
  .invest-input:focus { border-color: var(--accent); }
  .invest-input.error { border-color: var(--error); background: rgba(255, 77, 77, 0.05); }

  .error-text {
    color: var(--error); font-size: 11px; margin-top: 5px; font-weight: 600;
    display: flex; align-items: center; gap: 4px;
  }

  .btn-main {
    padding: 14px 24px; border-radius: 14px; border: none; font-weight: 700;
    cursor: pointer; transition: 0.3s; font-family: 'Syne', sans-serif;
    color: white; height: 50px;
  }
  .btn-main:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(1); }

  .modern-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
  .modern-table th { background: var(--table-head); padding: 16px; font-family: 'Syne', sans-serif; text-transform: uppercase; letter-spacing: 1px; font-size: 11px; color: var(--accent); border-bottom: 2px solid var(--card-border); }
  .modern-table td { padding: 16px; border-bottom: 1px solid var(--card-border); transition: 0.3s; }
  .modern-table tr:hover td { background: var(--accent-glow); }

  .badge-profit { color: #10B981; background: rgba(16, 185, 129, 0.1); padding: 4px 8px; border-radius: 6px; font-weight: 700; }
  .badge-loss { color: #EF4444; background: rgba(239, 68, 68, 0.1); padding: 4px 8px; border-radius: 6px; font-weight: 700; }

  .table-wrapper { width: 100%; overflow-x: auto; border-radius: 16px; }

  @media (max-width: 768px) { .feat-root { padding: 16px; } }
`;

function PortfolioManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem(TOKEN_KEY);

  const [isDarkMode, setIsDarkMode] = useState(() => JSON.parse(localStorage.getItem("theme") || "true"));
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  // Input States
  const [investmentName, setInvestmentName] = useState("");
  const [capital, setCapital] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [timePeriod, setTimePeriod] = useState("");
  
  // Validation States
  const [errors, setErrors] = useState({ capital: "", amount: "", time: "" });

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

  // Validation Handler
  const validateField = (name, value) => {
    let errorMsg = "";
    if (value !== "" && parseFloat(value) <= 0) {
      errorMsg = "Must be greater than 0";
    }
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const addPortfolio = async (e) => {
    e.preventDefault();
    
    // Final logic check
    if (parseFloat(capital) <= 0 || parseFloat(investmentAmount) <= 0 || parseInt(timePeriod) <= 0) {
      alert("All numerical values must be positive.");
      return;
    }

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
        setErrors({ capital: "", amount: "", time: "" });
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

  // Stats calculation
  const totalCapital = portfolio.reduce((sum, p) => sum + p.total_capital, 0);
  const totalInvestment = portfolio.reduce((sum, p) => sum + p.investment_amount, 0);
  const netProfit = totalInvestment - totalCapital;
  const avgROI = portfolio.length > 0 ? portfolio.reduce((sum, p) => sum + p.roi, 0) / portfolio.length : 0;

  const roiData = {
    labels: portfolio.map(p => p.investment_name),
    datasets: [{
      label: 'ROI %',
      data: portfolio.map(p => p.roi),
    }]
  };

  const capitalPie = {
    labels: portfolio.map(p => p.investment_name),
    datasets: [{
      data: portfolio.map(p => p.total_capital),
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
    }]
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Investo Portfolio Report", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [["Investment", "Capital", "Value", "Profit/Loss", "ROI %"]],
      body: portfolio.map((p) => [
        p.investment_name, 
        p.total_capital, 
        p.investment_amount, 
        (p.investment_amount - p.total_capital).toFixed(2),
        p.roi.toFixed(2) + "%"
      ]),
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

  const hasErrors = errors.capital || errors.amount || errors.time;

  return (
    <div className={`feat-root ${isDarkMode ? "mode-dark" : "mode-light"}`}>
      <style>{css}</style>

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
          <img src="https://i.pravatar.cc/150?u=investo" style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid var(--card-border)' }} alt="User" />
        </div>
      </header>

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

        <section className="glass-card">
          <form onSubmit={addPortfolio} className="invest-form">
            <div className="input-group">
                <input className="invest-input" placeholder="Investment Name" value={investmentName} onChange={(e) => setInvestmentName(e.target.value)} required />
            </div>

            <div className="input-group">
                <input className={`invest-input ${errors.capital ? 'error' : ''}`} type="number" placeholder="Total Capital" value={capital} 
                    onChange={(e) => { setCapital(e.target.value); validateField('capital', e.target.value); }} required />
                {errors.capital && <span className="error-text"><AlertCircle size={10}/> {errors.capital}</span>}
            </div>

            <div className="input-group">
                <input className={`invest-input ${errors.amount ? 'error' : ''}`} type="number" placeholder="Current Value" value={investmentAmount} 
                    onChange={(e) => { setInvestmentAmount(e.target.value); validateField('amount', e.target.value); }} required />
                {errors.amount && <span className="error-text"><AlertCircle size={10}/> {errors.amount}</span>}
            </div>

            <div className="input-group">
                <input className={`invest-input ${errors.time ? 'error' : ''}`} type="number" placeholder="Years" value={timePeriod} 
                    onChange={(e) => { setTimePeriod(e.target.value); validateField('time', e.target.value); }} required />
                {errors.time && <span className="error-text"><AlertCircle size={10}/> {errors.time}</span>}
            </div>

            <button className="btn-main" style={{ background: 'var(--accent)' }} disabled={hasErrors || !capital || !investmentAmount}>
                Add Entry
            </button>
          </form>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="glass-card">
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Initial Capital</p>
            <p className="stat-val" style={{ color: '#3B82F6' }}>Rs.{Math.round(totalCapital).toLocaleString()}</p>
          </div>
          <div className="glass-card">
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Current Value</p>
            <p className="stat-val" style={{ color: '#10B981' }}>Rs.{Math.round(totalInvestment).toLocaleString()}</p>
          </div>
          <div className="glass-card" style={{ border: netProfit >= 0 ? '1px solid #10B981' : '1px solid #EF4444' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Net Profit/Loss</p>
            <p className="stat-val" style={{ color: netProfit >= 0 ? '#10B981' : '#EF4444' }}>
              {netProfit >= 0 ? "+" : ""}Rs.{Math.round(netProfit).toLocaleString()}
            </p>
          </div>
          <div className="glass-card">
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Avg ROI</p>
            <p className="stat-val" style={{ color: '#F59E0B' }}>{avgROI.toFixed(1)}%</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button className="btn-main" style={{ background: '#3B82F6' }} onClick={() => setShowCharts(!showCharts)}>
            {showCharts ? "Hide Analytics" : "View Analytics"}
          </button>
          <button className="btn-main" style={{ background: '#10B981' }} onClick={generatePDF}>Export PDF</button>
        </div>

        {showCharts && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div className="glass-card"><Bar data={{ ...roiData, datasets: [{ ...roiData.datasets[0], backgroundColor: isDarkMode ? '#D90A14' : '#BA7517' }] }} options={{ responsive: true, plugins: { legend: { labels: { color: isDarkMode ? '#fff' : '#000' } } } }} /></div>
            <div className="glass-card"><Pie data={capitalPie} options={{ responsive: true, plugins: { legend: { labels: { color: isDarkMode ? '#fff' : '#000' } } } }} /></div>
          </div>
        )}

        <section className="glass-card">
          <h3 style={{ fontFamily: 'Syne', marginBottom: '20px' }}>Asset Allocation</h3>
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Investment</th>
                  <th>Capital</th>
                  <th>Current Value</th>
                  <th>Profit/Loss</th>
                  <th>ROI</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((p) => {
                  const profit = p.investment_amount - p.total_capital;
                  const isPositive = profit >= 0;
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: '700' }}>{p.investment_name}</td>
                      <td>Rs.{p.total_capital.toLocaleString()}</td>
                      <td>Rs.{p.investment_amount.toLocaleString()}</td>
                      <td>
                        <span className={isPositive ? "badge-profit" : "badge-loss"}>
                          {isPositive ? "+" : ""}Rs.{Math.round(profit).toLocaleString()}
                        </span>
                      </td>
                      <td style={{ fontWeight: '800', color: isPositive ? '#10B981' : '#EF4444' }}>
                        {p.roi?.toFixed(1)}%
                      </td>
                      <td>
                        <button 
                          onClick={() => deletePortfolio(p.id)} 
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: 'none', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}
                        >
                          <Trash2 size={14} style={{ marginRight: '4px' }}/> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default PortfolioManagement;