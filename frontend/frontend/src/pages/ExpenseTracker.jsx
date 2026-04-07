import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Pie, Bar, Line } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { X, TrendingUp, PieChart, BarChart, Download, Plus, Trash2 } from "lucide-react";
import Darklogo from "../assets/Darklogo.png";
import Lightlogo from "../assets/Lightlogo.png";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, ArcElement, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const API_URL = "http://127.0.0.1:8000/api/expenses/";

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
  .bar-line { width: 18px; height: 2px; background: var(--accent); border-radius: 2px; transition: 0.3s; }

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

  .invest-input {
    padding: 14px 18px; border-radius: 14px; background: var(--input-bg);
    border: 1px solid var(--card-border); color: inherit; outline: none;
    transition: 0.3s; width: 100%;
  }
  .invest-input:focus { border-color: var(--accent); }

  .btn-main {
    padding: 14px 24px; border-radius: 14px; border: none; font-weight: 700;
    cursor: pointer; transition: 0.3s; font-family: 'Syne', sans-serif;
    color: white; display: flex; align-items: center; justify-content: center; gap: 8px;
  }

  .history-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px; border-bottom: 1px solid var(--card-border);
  }
  .history-row:hover { background: var(--accent-glow); border-radius: 12px; }
`;

function ExpenseTracker() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("jwt");

  const [isDarkMode, setIsDarkMode] = useState(() => JSON.parse(localStorage.getItem("theme") || "true"));
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("misc");
  const [description, setDescription] = useState("");
  const [history, setHistory] = useState([]);
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    if (!token) navigate("/login");
    localStorage.setItem("theme", JSON.stringify(isDarkMode));
    window.dispatchEvent(new Event("storage"));
  }, [isDarkMode, token, navigate]);

  useEffect(() => {
    if (type === "expense") setCategory("misc");
    else if (type === "income") setCategory("salary");
    else if (type === "saving") setCategory("other");
  }, [type]);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setHistory((await res.json()).reverse());
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const addEntry = async (e) => {
    e.preventDefault();
    const expense = { amount: parseFloat(amount), type, category, description };
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(expense),
      });
      if (res.ok) {
        setAmount(""); setDescription(""); fetchExpenses();
      }
    } catch (err) { console.error(err); }
  };

  const deleteEntry = async (id) => {
    if (!window.confirm("Delete transaction?")) return;
    try {
      await fetch(`${API_URL}${id}/`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      fetchExpenses();
    } catch (err) { console.error(err); }
  };

  const income = history.filter((h) => h.type === "income").reduce((sum, h) => sum + h.amount, 0);
  const totalExpense = history.filter((h) => h.type === "expense").reduce((sum, h) => sum + h.amount, 0);
  const totalSavings = history.filter((h) => h.type === "saving").reduce((sum, h) => sum + h.amount, 0);
  const balance = income - totalExpense - totalSavings;

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Investo Expense Statement", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [["Type", "Description", "Category", "Amount"]],
      body: history.map((h) => [h.type, h.description, h.category, h.amount]),
    });
    doc.save("Investo_Statement.pdf");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "Portfolio", path: "/portfolio", icon: "💼" },
    { name: "Expense Tracker", path: "/expenses", icon: "💳" },
    { name: "Market News", path: "/news", icon: "🌐" },
  ];

  return (
    <div className={`feat-root ${isDarkMode ? "mode-dark" : "mode-light"}`}>
      <style>{css}</style>

      {/* HEADER */}
      <header className="dash-header">
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="nav-trigger" onClick={() => setIsNavOpen(!isNavOpen)}>
            <div className="bar-line" /><div className="bar-line" /><div className="bar-line" />
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

      {/* DRAWER */}
      <div className={`side-drawer ${isNavOpen ? 'open' : ''}`}>
        <h2 style={{ fontFamily: 'Syne', padding: '0 20px 30px', fontSize: '28px' }}>Investo<span>.</span></h2>
        {navItems.map(item => (
          <div key={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
            {item.icon} {item.name}
          </div>
        ))}
      </div>

      <main style={{ width: '100%', maxWidth: '1200px' }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: '32px', marginBottom: '24px' }}>Expense <span style={{color:'var(--accent)'}}>Tracker</span></h1>

        {/* INPUT FORM */}
        <section className="glass-card" style={{ marginBottom: '24px' }}>
          <form onSubmit={addEntry} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <input className="invest-input" type="number" placeholder="Amount (Rs.)" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <select className="invest-input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="saving">Saving</option>
            </select>
            <input className="invest-input" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
            <button className="btn-main" style={{ background: 'var(--accent)' }}>
              <Plus size={18} /> Add Entry
            </button>
          </form>
        </section>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <StatCard label="Total Income" val={income} color="#10B981" />
          <StatCard label="Expenses" val={totalExpense} color="#EF4444" />
          <StatCard label="Savings" val={totalSavings} color="#EC4899" />
          <StatCard label="Net Balance" val={balance} color="#3B82F6" />
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <button className="btn-main" style={{ background: '#3B82F6' }} onClick={() => setShowCharts(!showCharts)}>
             {showCharts ? <X size={18}/> : <TrendingUp size={18}/>} {showCharts ? "Hide Analytics" : "View Analytics"}
          </button>
          <button className="btn-main" style={{ background: '#10B981' }} onClick={generatePDF}>
            <Download size={18} /> Export Statement
          </button>
        </div>

        {showCharts && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
             <div className="glass-card"><h4 style={{marginBottom:'15px', fontSize:'14px'}}>Monthly Overview</h4><Bar data={{labels: ["Income", "Expenses", "Savings"], datasets: [{ data: [income, totalExpense, totalSavings], backgroundColor: ['#10B981','#EF4444','#EC4899']}]}} options={{plugins:{legend:{display:false}}}} /></div>
             <div className="glass-card"><h4 style={{marginBottom:'15px', fontSize:'14px'}}>Spending Trend</h4><Line data={{labels: history.map((_,i)=>i), datasets:[{label:'Flow', data: history.map(h=>h.amount), borderColor:'#3B82F6', tension:0.4}]}} /></div>
          </div>
        )}

        {/* HISTORY */}
        <section className="glass-card">
          <h3 style={{ fontFamily: 'Syne', marginBottom: '20px' }}>Recent Transactions</h3>
          {history.length === 0 ? <p style={{color:'var(--text-muted)'}}>No data found.</p> : 
            history.map((h) => (
              <div key={h.id} className="history-row">
                <div>
                  <p style={{ fontWeight: '700', textTransform: 'capitalize' }}>{h.description}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{h.category} • {h.type}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <span style={{ fontWeight: '800', color: h.type === 'income' ? '#10B981' : '#EF4444' }}>
                    {h.type === 'income' ? '+' : '-'} Rs. {h.amount.toLocaleString()}
                  </span>
                  <button onClick={() => deleteEntry(h.id)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18}/></button>
                </div>
              </div>
            ))
          }
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, val, color }) {
  return (
    <div className="glass-card" style={{ textAlign: 'center' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</p>
      <p style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Syne', color: color }}>Rs. {val.toLocaleString()}</p>
    </div>
  );
}

export default ExpenseTracker;