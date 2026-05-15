import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AlertCircle, Trash2, Download, Plus, TrendingUp, TrendingDown, ArrowUpRight, RotateCcw } from "lucide-react";
import MainLayout from "../layouts/MainLayout";

const API_URL = "http://127.0.0.1:8000/api/portfolio/";
const TOKEN_KEY = "jwt";

/* ── Circular progress ring ──────────────────────────────────── */
function ProgressRing({ value, size = 72, color = "var(--accent)" }) {
  const clamp = Math.min(Math.max(value, 0), 100);
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (clamp / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle className="progress-ring-bg" cx={size/2} cy={size/2} r={r} />
      <circle
        className="progress-ring-fill"
        cx={size/2} cy={size/2} r={r}
        stroke={color}
        strokeDasharray={circ}
        strokeDashoffset={offset}
      />
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
      padding: "12px 16px", fontSize: 13,
      boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
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

/* ── Stagger animation config ────────────────────────────────── */
const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
};

/* High contrast premium colors */
const CHART_COLORS = [
  "var(--accent)", "var(--color-orange)", "var(--color-pink)", 
  "var(--color-green)", "var(--color-purple)", "var(--color-red)"
];

export default function PortfolioManagement() {
  const token = localStorage.getItem(TOKEN_KEY);
  const [portfolio, setPortfolio] = useState([]);

  // Form states
  const [investmentName, setInvestmentName] = useState("");
  const [capital, setCapital] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [timePeriod, setTimePeriod] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchPortfolio = async () => {
    try {
      const res = await fetch(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setPortfolio(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => { if (token) fetchPortfolio(); }, [token]);

  const visiblePortfolio = useMemo(() => {
    return portfolio;
  }, [portfolio]);

  // ── Computed stats ────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalCapital = visiblePortfolio.reduce((s, p) => s + p.total_capital, 0);
    const totalValue = visiblePortfolio.reduce((s, p) => s + p.investment_amount, 0);
    const netProfit = totalValue - totalCapital;
    const profitPct = totalCapital > 0 ? ((netProfit / totalCapital) * 100) : 0;
    const avgROI = visiblePortfolio.length > 0 ? visiblePortfolio.reduce((s, p) => s + (p.roi || 0), 0) / visiblePortfolio.length : 0;
    return { totalCapital, totalValue, netProfit, profitPct, avgROI };
  }, [visiblePortfolio]);

  // ── Chart data ────────────────────────────────────────────────
  const roiChartData = visiblePortfolio.map(p => ({
    name: p.investment_name.length > 12 ? p.investment_name.slice(0, 12) + "…" : p.investment_name,
    ROI: parseFloat((p.roi || 0).toFixed(1)),
  }));

  const pieData = visiblePortfolio.map(p => ({
    name: p.investment_name,
    value: p.total_capital,
  }));

  const growthData = visiblePortfolio.map((p, i) => ({
    name: p.investment_name.length > 10 ? p.investment_name.slice(0, 10) + "…" : p.investment_name,
    Capital: p.total_capital,
    Value: p.investment_amount,
  }));

  // ── Validation ────────────────────────────────────────────────
  const validateField = (name, value) => {
    let msg = "";
    if (value !== "" && parseFloat(value) <= 0) msg = "Must be greater than 0";
    setErrors(prev => ({ ...prev, [name]: msg }));
  };
  const hasErrors = errors.capital || errors.amount || errors.time;

  const addPortfolio = async (e) => {
    e.preventDefault();
    if (parseFloat(capital) <= 0 || parseFloat(investmentAmount) <= 0 || parseInt(timePeriod) <= 0) return;
    setSubmitting(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          investment_name: investmentName,
          total_capital: parseFloat(capital),
          investment_amount: parseFloat(investmentAmount),
          estimated_return_per_year: 10,
          time_period: parseInt(timePeriod),
        }),
      });
      if (res.ok) {
        setInvestmentName(""); setCapital(""); setInvestmentAmount(""); setTimePeriod("");
        setErrors({});
        fetchPortfolio();
      }
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  // ── Confirmation Modal Logic ─────────────────────────────────
  const handleDeleteRequest = (id, name) => {
    setItemToDelete({ id, name });
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await fetch(`${API_URL}${itemToDelete.id}/`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setItemToDelete(null);
      fetchPortfolio();
    } catch (err) { console.error("Deletion failed", err); }
  };

  const cancelDelete = () => {
    setItemToDelete(null);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Investo Portfolio Report", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [["Investment", "Capital", "Value", "Profit/Loss", "ROI %"]],
      body: visiblePortfolio.map(p => [
        p.investment_name,
        `Rs.${p.total_capital.toLocaleString()}`,
        `Rs.${p.investment_amount.toLocaleString()}`,
        `Rs.${(p.investment_amount - p.total_capital).toFixed(0)}`,
        `${(p.roi || 0).toFixed(1)}%`,
      ]),
    });
    doc.save("Investo_Portfolio.pdf");
  };

  const isProfit = stats.netProfit >= 0;

  return (
    <MainLayout>
      <motion.div
        style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24 }}
        variants={containerVariants} initial="hidden" animate="show"
      >
        {/* ── PAGE HEADER ────────────────────────────────────── */}
        <motion.div className="page-header" variants={cardVariants}>
          <h1>Portfolio <span className="heading-gradient">Performance</span></h1>
          <p>Track assets, ROI, and historical growth</p>
        </motion.div>

        {/* ── METRICS BENTO ROW ──────────────────────────────── */}
        <motion.div className="bento-grid bento-grid-4" variants={cardVariants}>
          {/* Initial Capital */}
          <div className="glass-strong">
            <p className="metric-label">Invested Capital</p>
            <p className="metric-huge" style={{ color: "var(--accent)" }}>
              <span style={{ fontSize: "0.5em", fontWeight: 600, opacity: 0.7 }}>Rs.</span>
              {Math.round(stats.totalCapital).toLocaleString()}
            </p>
            <span className="micro-badge micro-badge-accent" style={{ marginTop: 12 }}>
              {visiblePortfolio.length} active assets
            </span>
          </div>

          {/* Current Value */}
          <div className="glass-strong">
            <p className="metric-label">Current Valuation</p>
            <p className="metric-huge" style={{ color: "var(--text-main)" }}>
              <span style={{ fontSize: "0.5em", fontWeight: 600, opacity: 0.7 }}>Rs.</span>
              {Math.round(stats.totalValue).toLocaleString()}
            </p>
            {stats.totalCapital > 0 && (
              <span className={`micro-badge ${isProfit ? "micro-badge-success" : "micro-badge-danger"}`} style={{ marginTop: 12 }}>
                {isProfit ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                {isProfit ? "+" : ""}{stats.profitPct.toFixed(1)}% Total
              </span>
            )}
          </div>

          {/* Net Profit/Loss */}
          <div className="glass-strong" style={{ borderColor: isProfit ? "var(--color-green)" : "var(--color-red)" }}>
            <p className="metric-label">Net Return</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <p className="metric-huge" style={{ color: isProfit ? "var(--color-green)" : "var(--color-red)" }}>
                {isProfit ? "+" : ""}Rs.{Math.abs(Math.round(stats.netProfit)).toLocaleString()}
              </p>
            </div>
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
              {isProfit ? <ArrowUpRight size={14} color="var(--color-green)"/> : <TrendingDown size={14} color="var(--color-red)"/>}
              <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
                {isProfit ? "Portfolio is growing" : "Portfolio declining"}
              </span>
            </div>
          </div>

          {/* Avg ROI with ring */}
          <div className="glass-strong" style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <ProgressRing
                value={Math.min(Math.abs(stats.avgROI), 100)} size={80}
                color={stats.avgROI >= 0 ? "var(--color-green)" : "var(--color-red)"}
              />
              <span style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 16, fontWeight: 800,
                fontFamily: "var(--font-heading)",
                color: stats.avgROI >= 0 ? "var(--color-green)" : "var(--color-red)",
              }}>
                {stats.avgROI.toFixed(0)}%
              </span>
            </div>
            <div>
              <p className="metric-label">Avg ROI</p>
              <p className="metric-medium" style={{ color: stats.avgROI >= 0 ? "var(--color-green)" : "var(--color-red)" }}>
                {stats.avgROI.toFixed(1)}%
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── CHARTS ROW ─────────────────────────────────────── */}
        {visiblePortfolio.length > 0 && (
          <motion.div className="bento-grid bento-grid-2" variants={cardVariants}>
            {/* ROI Bar Chart */}
            <div className="glass-strong">
              <p className="section-title">Asset Performance (ROI)</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={roiChartData} barCategoryGap="20%" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--card-border)' }} />
                  <Bar dataKey="ROI" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {roiChartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Asset Distribution */}
            <div className="glass-strong">
              <p className="section-title">Capital Distribution</p>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData} cx="50%" cy="50%" innerRadius="60%" outerRadius="85%"
                    paddingAngle={4} dataKey="value" stroke="none"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={10} formatter={(val) => <span style={{ fontSize: 13, color: "var(--text-main)", fontWeight: 500 }}>{val}</span>} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", top: "45%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>Total</p>
                <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 20, margin: 0, color: "var(--text-main)" }}>
                  Rs.{Math.round(stats.totalCapital).toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── GROWTH AREA CHART ──────────────────────────────── */}
        {visiblePortfolio.length > 0 && (
          <motion.div className="glass-strong" variants={cardVariants}>
            <p className="section-title">Capital vs Valuation Trends</p>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradCapital" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-pink)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-pink)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Capital" stroke="var(--accent)" strokeWidth={3} fill="url(#gradCapital)" />
                <Area type="monotone" dataKey="Value" stroke="var(--color-pink)" strokeWidth={3} fill="url(#gradValue)" />
                <Legend iconType="circle" iconSize={10} formatter={(val) => <span style={{ fontSize: 13, color: "var(--text-main)", fontWeight: 500 }}>{val}</span>} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* ── ADD INVESTMENT FORM ─────────────────────────────── */}
        <motion.div className="glass-strong" variants={cardVariants}>
          <p className="section-title">Record New Investment</p>
          <form onSubmit={addPortfolio} style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 20, alignItems: "end",
          }}>
            <div className="bento-form-group">
              <label>Asset Name</label>
              <input className="inv-input" placeholder="e.g. AAPL Stock" value={investmentName}
                onChange={e => setInvestmentName(e.target.value)} required />
            </div>
            <div className="bento-form-group">
              <label>Invested Amount</label>
              <input className={`inv-input ${errors.capital ? "error-border" : ""}`}
                type="number" placeholder="Rs. 0" value={capital}
                onChange={e => { setCapital(e.target.value); validateField("capital", e.target.value); }} required />
            </div>
            <div className="bento-form-group">
              <label>Current Market Value</label>
              <input className={`inv-input ${errors.amount ? "error-border" : ""}`}
                type="number" placeholder="Rs. 0" value={investmentAmount}
                onChange={e => { setInvestmentAmount(e.target.value); validateField("amount", e.target.value); }} required />
            </div>
            <div className="bento-form-group">
              <label>Holding Period (Years)</label>
              <input className={`inv-input ${errors.time ? "error-border" : ""}`}
                type="number" placeholder="1" value={timePeriod}
                onChange={e => { setTimePeriod(e.target.value); validateField("time", e.target.value); }} required />
            </div>
            <button className="inv-btn-primary" disabled={hasErrors || !capital || !investmentAmount || submitting}
              style={{ height: 46 }}>
              <Plus size={18}/> {submitting ? "Processing…" : "Add Asset"}
            </button>
          </form>
        </motion.div>

        {/* ── HOLDINGS TABLE ──────────────────────────────────── */}
        {visiblePortfolio.length > 0 && (
          <motion.div className="glass-strong" variants={cardVariants} style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "24px 32px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p className="section-title" style={{ margin: 0 }}>Asset Portfolio</p>
              <button onClick={generatePDF}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 18px", borderRadius: 12,
                  background: "var(--accent)", color: "#fff", border: "none",
                  cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 13,
                  transition: "all 0.2s",
                }}
              >
                <Download size={16}/> Export Report
              </button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--card-border)", background: "rgba(0,0,0,0.02)" }}>
                    {["Asset", "Capital", "Valuation", "Net Gain", "ROI", ""].map(h => (
                      <th key={h} style={{
                        padding: "16px 32px", textAlign: "left", fontSize: 12,
                        fontFamily: "var(--font-heading)", textTransform: "uppercase",
                        letterSpacing: "1px", color: "var(--text-muted)", fontWeight: 700,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visiblePortfolio.map((p, idx) => {
                    const profit = p.investment_amount - p.total_capital;
                    const pos = profit >= 0;
                    return (
                      <tr key={p.id} className="table-row-hover" style={{
                        borderBottom: "1px solid var(--card-border)",
                        animation: `fadeSlideUp 0.4s ${idx * 0.05}s both`,
                        transition: "background 0.2s"
                      }}>
                        <td style={{ padding: "20px 32px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                              width: 40, height: 40, borderRadius: 12,
                              background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 16, fontWeight: 800, color: "var(--accent)", fontFamily: "var(--font-heading)",
                            }}>
                              {p.investment_name[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: "var(--text-main)" }}>{p.investment_name}</div>
                              <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{p.time_period} Year Hold</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "20px 32px", fontWeight: 600 }}>Rs.{p.total_capital.toLocaleString()}</td>
                        <td style={{ padding: "20px 32px", fontWeight: 600 }}>Rs.{p.investment_amount.toLocaleString()}</td>
                        <td style={{ padding: "20px 32px" }}>
                          <span className={`micro-badge ${pos ? "micro-badge-success" : "micro-badge-danger"}`}>
                            {pos ? "+" : ""}Rs.{Math.round(profit).toLocaleString()}
                          </span>
                        </td>
                        <td style={{ padding: "20px 32px", fontWeight: 800, fontFamily: "var(--font-heading)", color: pos ? "var(--color-green)" : "var(--color-red)" }}>
                          {(p.roi || 0).toFixed(1)}%
                        </td>
                        <td style={{ padding: "20px 32px" }}>
                          <button onClick={() => handleDeleteRequest(p.id, p.investment_name)}
                            style={{
                              display: "flex", alignItems: "center", gap: 6,
                              background: "transparent", color: "var(--text-muted)",
                              border: "none", padding: "8px", borderRadius: 8,
                              cursor: "pointer", transition: "all 0.2s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = "var(--danger-color)"; e.currentTarget.style.background = "var(--danger-bg)"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                          >
                            <RotateCcw size={18}/>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {visiblePortfolio.length === 0 && (
          <motion.div className="glass-strong" variants={cardVariants}
            style={{ textAlign: "center", padding: 80 }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>📈</div>
            <p style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 800, marginBottom: 8, color: "var(--text-main)" }}>
              No Assets Tracked
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: 15, maxWidth: 400, margin: "0 auto" }}>
              Start building your portfolio tracker by adding your first investment record above.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* ── CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {itemToDelete && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="modal-content"
            >
              <div className="modal-icon">
                <AlertCircle size={32} />
              </div>
              <h2 className="modal-title">Confirm Reversal</h2>
              <p className="modal-desc">
                Are you sure you want to remove <strong>{itemToDelete.name}</strong> from your portfolio? This action is permanent and will recalculate your historical ROI.
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