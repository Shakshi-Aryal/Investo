import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Darklogo from "../assets/Darklogo.png";
import Lightlogo from "../assets/Lightlogo.png";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

export default function MainLayout({ children, isAdmin: propIsAdmin = false }) {
  const isLocalStorageAdmin = localStorage.getItem("is_admin") === "true";
  const isAdmin = propIsAdmin || isLocalStorageAdmin;
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { isDarkMode } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    navigate("/login");
  };

  const navItems = isAdmin ? [
    { name: "Admin Portal", path: "/admin", icon: "🛡️" },
    { name: "Community", path: "/community", icon: "💬" },
  ] : [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "My Profile", path: "/profile", icon: "👤" },
    { name: "Stock Charts", path: "/stock-charts", icon: "📈" },
    { name: "Wealth Tracker", path: "/expense-tracker", icon: "💰" },
    { name: "Knowledge", path: "/glossary", icon: "📖" },
    { name: "Community", path: "/community", icon: "💬" },
  ];

  return (
    <div className="app-layout">
      {/* ── SIDEBAR ── */}
      <div className={`side-drawer ${isNavOpen ? "open" : ""}`}>
        <h2 style={{ fontFamily: "var(--font-heading)", padding: "0 20px 30px", fontSize: "28px" }}>
          Investo<span style={{ color: 'var(--accent)' }}>.</span>
        </h2>
        {navItems.map((item) => (
          <div 
            key={item.path} 
            className={`nav-item ${location.pathname === item.path ? "active" : ""}`} 
            onClick={() => { navigate(item.path); setIsNavOpen(false); }}
          >
            <span style={{ marginRight: '12px' }}>{item.icon}</span> {item.name}
          </div>
        ))}
      </div>

      {/* ── MAIN AREA ── */}
      <main className="main-content">
        {/* ── TOP NAV ── */}
        <header className="top-nav">
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="inv-btn-icon" onClick={() => setIsNavOpen(!isNavOpen)}>
              {isNavOpen ? "✕" : "☰"}
            </button>
            <button className="inv-btn-icon" onClick={() => navigate(-1)}>←</button>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button className="inv-btn-icon logout-trigger" onClick={handleLogout} title="Sign Out" style={{ color: 'var(--danger-color)' }}>⎋</button>
            <ThemeToggle />
            <img src={isDarkMode ? Darklogo : Lightlogo} alt="Investo" style={{ height: "20px", margin: "0 8px" }} />
            <img
              src="https://i.pravatar.cc/150?u=investo"
              alt="User"
              style={{ width: "40px", height: "40px", borderRadius: "12px", border: "1px solid var(--card-border)", cursor: 'pointer' }}
              onClick={() => navigate("/profile")}
            />
          </div>
        </header>

        {/* Page Content goes here */}
        <div className="dash-container" style={{ width: '100%', maxWidth: '1200px' }}>
            {children}
        </div>
      </main>
    </div>
  );
}