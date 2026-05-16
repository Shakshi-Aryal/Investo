import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, AreaChart, Area, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, Plus, Trash2, AlertCircle, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, RotateCcw } from "lucide-react";
import MainLayout from "../layouts/MainLayout";

import {
  Chart as ChartJS, CategoryScale, LinearScale, ArcElement, BarElement,
  PointElement, LineElement, Title, Tooltip as CJSTooltip, Legend as CJSLegend,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, ArcElement, BarElement, PointElement, LineElement, Title, CJSTooltip, CJSLegend);

import { apiUrl } from "../config";

const API_URL = apiUrl("/expenses/");

/* ── Category config ─────────────────────────────────────────── */
const CATEGORY_META = {
  food:     { icon: "🍕", label: "Food", color: "var(--color-orange)" },
  clothing: { icon: "👕", label: "Clothing", color: "var(--color-purple)" },
  emi:      { icon: "🏦", label: "EMI", color: "var(--color-pink)" },
  misc:     { icon: "📦", label: "Miscellaneous", color: "var(--color-blue)" },
  salary:   { icon: "💵", label: "Salary", color: "var(--color-green)" },
  other:    { icon: "📋", label: "Other", color: "var(--text-muted)" },
};

const TYPE_META = {
  income:  { icon: "📈", label: "Income", color: "var(--color-green)" },
  expense: { icon: "📉", label: "Expense", color: "var(--color-red)" },
  saving:  { icon: "🏦", label: "Saving", color: "var(--color-purple)" },
};

/* ── Circular progress ring ──────────────────────────────────── */
function ProgressRing({ value, size = 64, color = "var(--accent)" }) {
  const clamp = Math.min(Math.max(value, 0), 100);
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (clamp / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle className="progress-ring-bg" cx={size/2} cy={size/2} r={r} />
      <circle className="progress-ring-fill" cx={size/2} cy={size/2} r={r}
        stroke={color} strokeDasharray={circ} strokeDashoffset={offset} />
    </svg>
  );
}

/* ── Custom recharts tooltip ─────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--card-bg)", backdropFilter: "blur(12px)",
      border: "1px solid var(--card-border)", borderRadius: 12,
      padding: "12px 16px", fontSize: 13, boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
    }}>
      <p style={{ fontWeight: 700, marginBottom: 4, color: "var(--text-main)" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600, margin: "2px 0" }}>
          {p.name}: Rs.{typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
};

export default function ExpenseTracker() {
  const navigate = useNavigate();
  const token = localStorage.getItem("jwt");

  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("misc");
  const [description, setDescription] = useState("");
  const [amountError, setAmountError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);

  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => { if (!token) navigate("/login"); }, [token, navigate]);

  // Auto-select category when type changes
  useEffect(() => {
    if (type === "expense") setCategory("misc");
    else if (type === "income") setCategory("salary");
    else if (type === "saving") setCategory("other");
  }, [type]);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setHistory((await res.json()).reverse());
    } catch { /* silent */ }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const visibleHistory = useMemo(() => {
    return history;
  }, [history]);

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmount(val);
    setAmountError(val !== "" && parseFloat(val) <= 0 ? "Amount must be > 0" : "");
  };

  const addEntry = async (e) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) { setAmountError("Invalid amount."); return; }
    setSubmitting(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsed, type, category, description }),
      });
      if (res.ok) { setAmount(""); setDescription(""); setAmountError(""); fetchExpenses(); }
    } catch { /* silent */ }
    finally { setSubmitting(false); }
  };

  // ── Confirmation Modal Logic ─────────────────────────────────
  const handleDeleteRequest = (id, desc) => {
    setItemToDelete({ id, desc });
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await fetch(`${API_URL}${itemToDelete.id}/`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setItemToDelete(null);
      fetchExpenses();
    } catch { /* silent */ }
  };

  const cancelDelete = () => {
    setItemToDelete(null);
  };

  // ── Computed stats ────────────────────────────────────────────
  const stats = useMemo(() => {
    const income = visibleHistory.filter(h => h.type === "income").reduce((s, h) => s + h.amount, 0);
    const expense = visibleHistory.filter(h => h.type === "expense").reduce((s, h) => s + h.amount, 0);
    const savings = visibleHistory.filter(h => h.type === "saving").reduce((s, h) => s + h.amount, 0);
    const balance = income - expense - savings;
    const expensePct = income > 0 ? (expense / income * 100) : 0;
    const savingsRate = income > 0 ? (savings / income * 100) : 0;
    return { income, expense, savings, balance, expensePct, savingsRate };
  }, [visibleHistory]);

  const categoryBreakdown = useMemo(() => {
    const expenses = visibleHistory.filter(h => h.type === "expense");
    const total = expenses.reduce((s, h) => s + h.amount, 0);
    const grouped = {};
    expenses.forEach(h => { grouped[h.category] = (grouped[h.category] || 0) + h.amount; });
    return Object.entries(grouped)
      .map(([cat, amt]) => ({
        category: cat, amount: amt, percentage: total > 0 ? (amt / total * 100) : 0,
        ...(CATEGORY_META[cat] || CATEGORY_META.other),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [visibleHistory]);

  // ── Chart data ────────────────────────────────────────────────
  const overviewData = [
    { name: "Income", amount: stats.income, fill: "var(--color-green)" },
    { name: "Expenses", amount: stats.expense, fill: "var(--color-red)" },
    { name: "Savings", amount: stats.savings, fill: "var(--color-purple)" },
  ];

  const trendData = useMemo(() => {
    return visibleHistory.slice().reverse().map((h, i) => ({
      idx: `Tx ${i + 1}`, amount: h.amount, type: h.type, desc: h.description
    }));
  }, [visibleHistory]);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Investo Expense Statement", 14, 20);
    autoTable(doc, {
      startY: 30, head: [["Type", "Description", "Category", "Amount"]],
      body: visibleHistory.map(h => [h.type, h.description, h.category, `Rs.${h.amount.toLocaleString()}`]),
    });
    doc.save("Investo_Statement.pdf");
  };

  const categoryOptions = type === "expense"
    ? [["food","Food"],["clothing","Clothing"],["emi","EMI"],["misc","Miscellaneous"],["other","Other"]]
    : type === "income" ? [["salary","Salary"],["other","Other"]] : [["other","Other"]];

  const isPositiveBalance = stats.balance >= 0;

  return (
    <MainLayout>
      <motion.div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24 }}
        variants={containerVariants} initial="hidden" animate="show"
      >
        <motion.div className="page-header" variants={cardVariants}>
          <h1>Cash Flow <span className="heading-gradient">Ledger</span></h1>
          <p>Income, expenses, and spending funnel analytics</p>
        </motion.div>

        {/* ── HERO METRICS ───────────────────────────────────── */}
        <motion.div className="bento-grid bento-grid-4" variants={cardVariants}>
          <div className="glass-strong">
            <p className="metric-label">Total Income</p>
            <p className="metric-huge" style={{ color: "var(--color-green)" }}>
              <span style={{ fontSize: "0.5em", fontWeight: 600, opacity: 0.7 }}>Rs.</span>
              {Math.round(stats.income).toLocaleString()}
            </p>
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <ArrowUpRight size={14} color="var(--color-green)" />
              <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
                {visibleHistory.filter(h => h.type === "income").length} deposits
              </span>
            </div>
          </div>

          <div className="glass-strong">
            <p className="metric-label">Total Expenses</p>
            <p className="metric-huge" style={{ color: "var(--color-red)" }}>
              <span style={{ fontSize: "0.5em", fontWeight: 600, opacity: 0.7 }}>Rs.</span>
              {Math.round(stats.expense).toLocaleString()}
            </p>
            {stats.income > 0 && (
              <span className="micro-badge micro-badge-danger" style={{ marginTop: 12 }}>
                {stats.expensePct.toFixed(0)}% of income consumed
              </span>
            )}
          </div>

          <div className="glass-strong" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <ProgressRing value={stats.savingsRate} size={72} color="var(--color-purple)" />
              <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, fontFamily: "var(--font-heading)", color: "var(--color-purple)" }}>
                {stats.savingsRate.toFixed(0)}%
              </span>
            </div>
            <div>
              <p className="metric-label">Savings</p>
              <p className="metric-medium" style={{ color: "var(--color-purple)" }}>Rs.{Math.round(stats.savings).toLocaleString()}</p>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>savings rate</span>
            </div>
          </div>

          <div className="glass-strong" style={{ borderColor: isPositiveBalance ? "var(--color-green)" : "var(--color-red)" }}>
            <p className="metric-label">Available Balance</p>
            <p className="metric-huge" style={{ color: isPositiveBalance ? "var(--color-green)" : "var(--color-red)" }}>
              <span style={{ fontSize: "0.5em", fontWeight: 600, opacity: 0.7 }}>Rs.</span>
              {Math.round(Math.abs(stats.balance)).toLocaleString()}
            </p>
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
              {isPositiveBalance ? <ArrowUpRight size={14} color="var(--color-green)" /> : <ArrowDownRight size={14} color="var(--color-red)" />}
              <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
                {isPositiveBalance ? "Positive flow" : "Negative flow"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── CHARTS ROW ─────────────────────────────────────── */}
        {visibleHistory.length > 0 && (
          <motion.div className="bento-grid bento-grid-2" variants={cardVariants}>
            <div className="glass-strong">
              <p className="section-title">Cash Flow Overview</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={overviewData} barCategoryGap="25%" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--card-border)' }} />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} maxBarSize={64}>
                    {overviewData.map((d, i) => (<Cell key={i} fill={d.fill} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-strong">
              <p className="section-title">Spending Funnel</p>
              {categoryBreakdown.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center", padding: 60 }}>No expense data</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 12 }}>
                  {categoryBreakdown.map(cat => (
                    <div key={cat.category}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ width: 36, height: 36, borderRadius: 10, background: `${cat.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                            {cat.icon}
                          </span>
                          <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-main)" }}>{cat.label}</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-main)" }}>Rs.{Math.round(cat.amount).toLocaleString()}</span>
                          <span className="micro-badge" style={{ marginLeft: 8, background: `${cat.color}15`, color: cat.color }}>
                            {cat.percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="category-bar-track" style={{ height: 10 }}>
                        <div className="category-bar-fill" style={{ width: `${cat.percentage}%`, background: cat.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── SPENDING TREND AREA CHART ──────────────────────── */}
        {visibleHistory.length > 2 && (
          <motion.div className="glass-strong" variants={cardVariants}>
            <p className="section-title">Transaction Flow Trend</p>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradFlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="idx" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="var(--accent)" strokeWidth={3} fill="url(#gradFlow)" name="Amount" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* ── ADD TRANSACTION FORM ────────────────────────────── */}
        <motion.div className="glass-strong" variants={cardVariants}>
          <p className="section-title">New Record</p>
          <form onSubmit={addEntry} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div className="pill-toggle-group">
                {["expense", "income", "saving"].map(t => (
                  <button key={t} type="button" className={`pill-toggle ${type === t ? "active" : ""}`} onClick={() => setType(t)}>
                    {TYPE_META[t].icon} {TYPE_META[t].label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, alignItems: "end" }}>
              <div className="bento-form-group">
                <label>Amount (Rs.)</label>
                <input className={`inv-input ${amountError ? "error-border" : ""}`} type="number" placeholder="0.00" value={amount} onChange={handleAmountChange} step="any" required />
              </div>
              <div className="bento-form-group">
                <label>Category</label>
                <select className="inv-input" value={category} onChange={e => setCategory(e.target.value)} style={{ cursor: "pointer" }}>
                  {categoryOptions.map(([val, lbl]) => (
                    <option key={val} value={val}>{(CATEGORY_META[val]?.icon || "") + " " + lbl}</option>
                  ))}
                </select>
              </div>
              <div className="bento-form-group">
                <label>Description</label>
                <input className="inv-input" placeholder="What's this for?" value={description} onChange={e => setDescription(e.target.value)} required />
              </div>
              <button className="inv-btn-primary" disabled={!!amountError || !amount || submitting} style={{ height: 46 }}>
                <Plus size={18} /> {submitting ? "Processing…" : "Add Entry"}
              </button>
            </div>
          </form>
        </motion.div>

        {/* ── TRANSACTION HISTORY ──────────────────────────────── */}
        <motion.div className="glass-strong" variants={cardVariants} style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "24px 32px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p className="section-title" style={{ margin: 0 }}>Recent Transactions</p>
            <button onClick={generatePDF} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, background: "var(--accent-dim)", color: "var(--text-main)", border: "1px solid var(--card-border)", cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 13, transition: "all 0.2s" }}>
              <Download size={16} /> Export CSV/PDF
            </button>
          </div>

          {visibleHistory.length === 0 ? (
            <div style={{ textAlign: "center", padding: 80 }}>
              <div style={{ fontSize: 56, marginBottom: 20 }}>💰</div>
              <p style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 800, marginBottom: 8, color: "var(--text-main)" }}>No Activity Yet</p>
              <p style={{ color: "var(--text-muted)", fontSize: 15 }}>Record your first transaction above to see the breakdown.</p>
            </div>
          ) : (
            <div style={{ padding: "0 16px 16px" }}>
              {visibleHistory.map((h, idx) => {
                const catMeta = CATEGORY_META[h.category] || CATEGORY_META.other;
                const isIncome = h.type === "income";
                return (
                  <div key={h.id} className="tx-card" style={{ animation: `fadeSlideUp 0.35s ${idx * 0.03}s both`, padding: "16px 20px", margin: "4px 0", borderRadius: 16 }}>
                    <div className="tx-icon-box" style={{ background: `${catMeta.color}15`, border: `1px solid ${catMeta.color}30`, width: 48, height: 48, fontSize: 20 }}>
                      {catMeta.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, textTransform: "capitalize", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-main)" }}>
                        {h.description}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, display: "flex", gap: 8, alignItems: "center", fontWeight: 500 }}>
                        <span className="micro-badge" style={{ fontSize: 10, background: `${catMeta.color}15`, color: catMeta.color }}>{catMeta.label}</span>
                        <span style={{ textTransform: "capitalize" }}>{h.type}</span>
                        {h.created_at && <span>• {new Date(h.created_at).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginRight: 16 }}>
                      <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 18, color: isIncome ? "var(--color-green)" : "var(--text-main)" }}>
                        {isIncome ? "+" : "-"} Rs.{h.amount.toLocaleString()}
                      </span>
                    </div>
                    <button onClick={() => handleDeleteRequest(h.id, h.description)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 8, borderRadius: 10, transition: "all 0.2s", flexShrink: 0 }} onMouseEnter={e => { e.currentTarget.style.color = "var(--danger-color)"; e.currentTarget.style.background = "var(--danger-bg)"; }} onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}>
                      <RotateCcw size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* ── CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {itemToDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="modal-content">
              <div className="modal-icon"><AlertCircle size={32} /></div>
              <h2 className="modal-title">Confirm Reversal</h2>
              <p className="modal-desc">
                Are you sure you want to reverse the transaction <strong>{itemToDelete.desc}</strong>? This will permanently remove it from your records.
              </p>
              <div className="modal-actions">
                <button className="modal-btn-cancel" onClick={cancelDelete}>Cancel</button>
                <button className="modal-btn-confirm" onClick={confirmDelete}>Confirm Reversal</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}