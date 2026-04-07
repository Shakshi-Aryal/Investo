import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Darklogo from "../assets/Darklogo.png";
import Lightlogo from "../assets/Lightlogo.png";

const layoutCss = `
  .app-layout { display: flex; min-height: 100vh; transition: all 0.4s; }
  
  /* Sidebar Styles */
  .side-drawer {
    position: fixed; top: 0; left: -300px; width: 280px; height: 100vh;
    background: var(--card-bg); backdrop-filter: blur(25px);
    border-right: 1px solid var(--card-border); z-index: 1000;
    transition: left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
    padding: 100px 24px 40px; display: flex; flex-direction: column; gap: 12px;
  }
  .side-drawer.open { left: 0; box-shadow: 20px 0 60px rgba(0,0,0,0.2); }

  /* Top Nav Styles (from Dashboard) */
  .top-nav {
    position: sticky; top: 0; width: 100%; max-width: 1200px; margin: 0 auto;
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px 24px; border-radius: 24px; background: var(--card-bg);
    border: 1px solid var(--card-border); backdrop-filter: blur(10px); z-index: 900;
    margin-bottom: 40px;
  }

  .main-content { flex: 1; padding: 32px; display: flex; flex-direction: column; align-items: center; }
`;

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(isDarkMode));
    window.dispatchEvent(new Event("storage")); // Syncs widgets
  }, [isDarkMode]);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "My Profile", path: "/profile", icon: "👤" },
    { name: "Stock Charts", path: "/stock-charts", icon: "📈" },
    { name: "Wealth Tracker", path: "/expense-tracker", icon: "💰" },
    { name: "Knowledge", path: "/glossary", icon: "📖" },
  ];

  return (
    <div className={`app-layout ${isDarkMode ? "dash-dark mode-dark" : "dash-light mode-light"}`}>
      <style>{layoutCss}</style>

      {/* ── SIDEBAR ── */}
      <div className={`side-drawer ${isNavOpen ? "open" : ""}`}>
        <h2 style={{ fontFamily: "Syne", padding: "0 20px 30px", fontSize: "28px" }}>Investo<span>.</span></h2>
        {navItems.map((item) => (
          <div 
            key={item.path} 
            className={`nav-item ${location.pathname === item.path ? "active" : ""}`} 
            onClick={() => { navigate(item.path); setIsNavOpen(false); }}
          >
            {item.icon} {item.name}
          </div>
        ))}
      </div>

      {/* ── MAIN AREA ── */}
      <main className="main-content">
        {/* ── TOP NAV ── */}
        <header className="top-nav">
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="dash-btn-circle" onClick={() => setIsNavOpen(!isNavOpen)}>
              {isNavOpen ? "✕" : "☰"}
            </button>
            <button className="dash-btn-circle" onClick={() => navigate(-1)}>←</button>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button className="dash-btn-circle logout-trigger" onClick={handleLogout} title="Sign Out">⎋</button>
            <button className="dash-btn-circle" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? "☀️" : "🌙"}
            </button>
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
        <div className="dash-container">
            {children}
        </div>
      </main>
    </div>
  );
}