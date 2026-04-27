import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pie, Bar, Line } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { X, TrendingUp, PieChart, BarChart, Download, Plus, Trash2 } from "lucide-react";
import MainLayout from "../layouts/MainLayout";

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
  .glass-card {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: var(--border-radius-lg); padding: 24px; backdrop-filter: blur(10px);
  }

  .invest-input {
    padding: 14px 18px; border-radius: 14px; background: var(--input-bg);
    border: 1px solid var(--card-border); color: inherit; outline: none;
    transition: 0.3s; width: 100%; font-family: var(--font-primary);
  }
  .invest-input:focus { border-color: var(--accent); box-shadow: 0 0 10px var(--accent-glow); }

  .btn-main {
    padding: 14px 24px; border-radius: 14px; border: none; font-weight: 700;
    cursor: pointer; transition: 0.3s; font-family: var(--font-heading);
    color: white; display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .btn-main:hover { transform: translateY(-2px); opacity: 0.9; }

  .history-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px; border-bottom: 1px solid var(--card-border);
    transition: background 0.15s;
  }
  .history-row:hover { background: var(--accent-dim); border-radius: var(--border-radius-md); }
`;

function ExpenseTracker() {
  const navigate = useNavigate();
  const token = localStorage.getItem("jwt");

  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("misc");
  const [description, setDescription] = useState("");
  const [history, setHistory] = useState([]);
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

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

  return (
    <MainLayout>
      <style>{css}</style>
      <main style={{ width: '100%' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', marginBottom: '24px' }}>Expense <span className="heading-gradient">Tracker</span></h1>

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

        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <button className="btn-main" style={{ background: '#3B82F6' }} onClick={() => setShowCharts(!showCharts)}>
             {showCharts ? <X size={18}/> : <TrendingUp size={18}/>} {showCharts ? "Hide Analytics" : "View Analytics"}
          </button>
          <button className="btn-main" style={{ background: '#10B981' }} onClick={generatePDF}>
            <Download size={18} /> Export Statement
          </button>
        </div>

        {showCharts && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
             <div className="glass-card"><h4 style={{marginBottom:'15px', fontSize:'14px', color: 'var(--text-muted)'}}>Monthly Overview</h4><Bar data={{labels: ["Income", "Expenses", "Savings"], datasets: [{ data: [income, totalExpense, totalSavings], backgroundColor: ['#10B981','#EF4444','#EC4899']}]}} options={{plugins:{legend:{display:false}}}} /></div>
             <div className="glass-card"><h4 style={{marginBottom:'15px', fontSize:'14px', color: 'var(--text-muted)'}}>Spending Trend</h4><Line data={{labels: history.map((_,i)=>i), datasets:[{label:'Flow', data: history.map(h=>h.amount), borderColor:'#3B82F6', tension:0.4}]}} /></div>
          </div>
        )}

        {/* HISTORY */}
        <section className="glass-card">
          <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '20px' }}>Recent Transactions</h3>
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
    </MainLayout>
  );
}

function StatCard({ label, val, color }) {
  return (
    <div className="glass-card" style={{ textAlign: 'center' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px', fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: color }}>Rs. {val.toLocaleString()}</p>
    </div>
  );
}

export default ExpenseTracker;