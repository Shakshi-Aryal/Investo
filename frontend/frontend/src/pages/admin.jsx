import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { AlertCircle, Ban, Server, Users, Activity, ShieldAlert, ArrowUpRight } from "lucide-react";
import MainLayout from "../layouts/MainLayout";

import { API_BASE } from "../config";

const API_URL = `${API_BASE}/`;

// Mock data for graphs
const revenueData = [
  { name: "Jan", revenue: 45000 }, { name: "Feb", revenue: 52000 },
  { name: "Mar", revenue: 48000 }, { name: "Apr", revenue: 61000 },
  { name: "May", revenue: 59000 }, { name: "Jun", revenue: 75000 },
  { name: "Jul", revenue: 82000 }
];
const errorLogs = [
  { id: 1, time: "10:24 AM", msg: "Database timeout on /api/portfolio", sev: "high" },
  { id: 2, time: "09:12 AM", msg: "Failed authentication attempt (IP: 192.168.1.1)", sev: "medium" },
  { id: 3, time: "Yesterday", msg: "Rate limit exceeded for user #4592", sev: "low" },
];

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
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newGroupName, setNewGroupName] = useState("");
  
  // Reversal Modal State
  const [userToSuspend, setUserToSuspend] = useState(null);
  
  const token = localStorage.getItem("jwt");

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}admin-portal/stats/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) setStats(await response.json());

      const commRes = await fetch(`${API_URL}community/groups/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (commRes.ok) setGroups(await commRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    try {
      const res = await fetch(`${API_URL}community/groups/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroupName, description: "Official Channel", is_announcement: true })
      });
      if (res.ok) {
        setGroups([await res.json(), ...groups]);
        setNewGroupName("");
      }
    } catch (err) { console.error(err); }
  };

  const confirmSuspend = () => {
    // Mock suspension logic since backend doesn't support it yet
    setStats(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userToSuspend.id ? { ...u, suspended: true } : u)
    }));
    setUserToSuspend(null);
  };

  // Process User Growth Data
  const growthData = useMemo(() => {
    if (!stats?.users) return [];
    // Group users by join date
    const counts = {};
    stats.users.forEach(u => {
      const date = new Date(u.date_joined).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      counts[date] = (counts[date] || 0) + 1;
    });
    return Object.entries(counts).map(([name, Users]) => ({ name, Users }));
  }, [stats]);

  return (
    <MainLayout isAdmin={true}>
      <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
        
        <motion.div className="page-header" variants={cardVariants}>
          <h1>Admin <span className="heading-gradient">Command</span></h1>
          <p>Global oversight, analytics, and platform health.</p>
        </motion.div>

        {/* ── MACRO METRICS ── */}
        <motion.div className="bento-grid bento-grid-4" variants={cardVariants}>
          <div className="glass-strong" style={{ borderColor: "var(--accent)" }}>
            <p className="metric-label"><Users size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} /> Total Users</p>
            <p className="metric-huge" style={{ color: "var(--accent)" }}>{stats?.summary?.total_users || 0}</p>
            <span className="micro-badge micro-badge-accent" style={{ marginTop: 12 }}>All time registrations</span>
          </div>
          <div className="glass-strong">
            <p className="metric-label"><Activity size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} /> Active Today</p>
            <p className="metric-huge" style={{ color: "var(--success-color)" }}>{stats?.summary?.active_today || 0}</p>
            <span className="micro-badge micro-badge-success" style={{ marginTop: 12 }}><ArrowUpRight size={12}/> High engagement</span>
          </div>
          <div className="glass-strong">
            <p className="metric-label">ARR (Mock)</p>
            <p className="metric-huge" style={{ color: "var(--color-pink)" }}>$82k</p>
            <span className="micro-badge" style={{ marginTop: 12, background: "rgba(236, 72, 153, 0.15)", color: "var(--color-pink)" }}>
              +14% this month
            </span>
          </div>
          <div className="glass-strong" style={{ display: "flex", flexDirection: "column" }}>
            <p className="metric-label"><Server size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} /> API Health</p>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--success-color)", boxShadow: "0 0 12px var(--success-color)" }} />
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 24, color: "var(--text-main)" }}>Operational</span>
            </div>
            <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>99.99% Uptime • 42ms ping</span>
          </div>
        </motion.div>

        {/* ── CHARTS ROW ── */}
        <motion.div className="bento-grid bento-grid-2" variants={cardVariants}>
          {/* Revenue Area Graph */}
          <div className="glass-strong">
            <p className="section-title">Revenue Trajectory</p>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-pink)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-pink)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-pink)" strokeWidth={3} fill="url(#gradRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* User Growth Step-Chart */}
          <div className="glass-strong">
            <p className="section-title">User Acquisition</p>
            {growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={growthData} barCategoryGap="20%" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--card-border)' }} />
                  <Bar dataKey="Users" fill="var(--accent)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>No data available</div>
            )}
          </div>
        </motion.div>

        {/* ── USER MGMT & LOGS ── */}
        <motion.div className="bento-grid bento-grid-3" variants={cardVariants}>
          
          {/* User Table */}
          <div className="glass-strong" style={{ gridColumn: "span 2", padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "24px 32px 16px" }}>
              <p className="section-title" style={{ margin: 0 }}>User Management</p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--card-border)", background: "rgba(0,0,0,0.02)" }}>
                    <th style={{ padding: "16px 32px", textAlign: "left", fontSize: 12, fontFamily: "var(--font-heading)", textTransform: "uppercase", color: "var(--text-muted)" }}>User</th>
                    <th style={{ padding: "16px 32px", textAlign: "left", fontSize: 12, fontFamily: "var(--font-heading)", textTransform: "uppercase", color: "var(--text-muted)" }}>Joined</th>
                    <th style={{ padding: "16px 32px", textAlign: "left", fontSize: 12, fontFamily: "var(--font-heading)", textTransform: "uppercase", color: "var(--text-muted)" }}>Activity</th>
                    <th style={{ padding: "16px 32px", textAlign: "center", fontSize: 12, fontFamily: "var(--font-heading)", textTransform: "uppercase", color: "var(--text-muted)" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.users?.map(user => (
                    <tr key={user.id} style={{ borderBottom: "1px solid var(--divider)", opacity: user.suspended ? 0.5 : 1 }}>
                      <td style={{ padding: "16px 32px" }}>
                        <div style={{ fontWeight: 700, color: "var(--text-main)" }}>{user.username}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{user.email}</div>
                      </td>
                      <td style={{ padding: "16px 32px", fontWeight: 500 }}>{new Date(user.date_joined).toLocaleDateString()}</td>
                      <td style={{ padding: "16px 32px" }}>
                        <span className="micro-badge micro-badge-accent">{user.used_today_count} requests</span>
                      </td>
                      <td style={{ padding: "16px 32px", textAlign: "center" }}>
                        <button 
                          onClick={() => !user.suspended && setUserToSuspend(user)}
                          disabled={user.suspended}
                          style={{
                            background: user.suspended ? "transparent" : "var(--danger-bg)", color: "var(--danger-color)",
                            border: "none", padding: "8px 12px", borderRadius: 8, cursor: user.suspended ? "not-allowed" : "pointer",
                            fontWeight: 600, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6,
                            transition: "all 0.2s"
                          }}
                        >
                          <Ban size={14} /> {user.suspended ? "Suspended" : "Suspend"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Logs & Community */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Error Logs */}
            <div className="glass-strong">
              <p className="section-title"><ShieldAlert size={16} style={{ display: "inline", verticalAlign: "middle" }} /> System Logs</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {errorLogs.map(log => (
                  <div key={log.id} style={{ padding: 12, borderRadius: 12, background: "var(--input-bg)", border: "1px solid var(--input-border)", fontSize: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: log.sev === "high" ? "var(--danger-color)" : log.sev === "medium" ? "var(--color-orange)" : "var(--text-muted)" }}>
                        {log.sev.toUpperCase()}
                      </span>
                      <span style={{ color: "var(--text-muted)" }}>{log.time}</span>
                    </div>
                    <div style={{ color: "var(--text-main)", lineHeight: 1.4 }}>{log.msg}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commmunity Group Create */}
            <div className="glass-strong">
              <p className="section-title">New Broadcast Channel</p>
              <form onSubmit={handleCreateGroup} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="floating-input-group">
                  <input type="text" className="floating-input" placeholder=" " value={newGroupName} onChange={e => setNewGroupName(e.target.value)} required />
                  <label className="floating-label">Channel Name</label>
                </div>
                <button type="submit" className="inv-btn-primary" style={{ padding: "10px", fontSize: 14 }}>Create Channel</button>
              </form>
            </div>
          </div>

        </motion.div>
      </motion.div>

      {/* ── CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {userToSuspend && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="modal-content">
              <div className="modal-icon"><AlertCircle size={32} /></div>
              <h2 className="modal-title">Suspend User</h2>
              <p className="modal-desc">
                Are you sure you want to suspend <strong>{userToSuspend.username}</strong>? This will revoke their access to the platform immediately.
              </p>
              <div className="modal-actions">
                <button className="modal-btn-cancel" onClick={() => setUserToSuspend(null)}>Cancel</button>
                <button className="modal-btn-confirm" onClick={confirmSuspend}>Confirm Suspension</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}