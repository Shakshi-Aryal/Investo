import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import Darklogo from "../assets/Darklogo.png";
import Lightlogo from "../assets/Lightlogo.png";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import { useNotifications } from "../context/NotificationContext";
import Footer from "../components/Footer";

const navStyles = `
  .floating-nav {
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--card-bg);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--card-border);
    border-radius: 50px;
    padding: 8px 16px;
    z-index: 1000;
    width: calc(100% - 48px);
    max-width: 1000px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .nav-links-container {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .pill-link {
    padding: 8px 16px;
    border-radius: 30px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .pill-link:hover {
    color: var(--text-main);
    background: var(--accent-dim);
  }
  
  .pill-link.active {
    background: var(--text-main);
    color: var(--bg-main);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  .nav-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .nav-icon-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid transparent;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }
  
  .nav-icon-btn:hover {
    background: var(--accent-dim);
    color: var(--text-main);
  }
  
  .nav-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    background: var(--danger-color);
    color: white;
    font-size: 10px;
    font-weight: 800;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .main-wrapper {
    padding-top: 100px; /* Space for floating nav */
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  @media (max-width: 768px) {
    .nav-links-container { display: none; /* In a full app, we'd add a mobile hamburger menu here */ }
  }
`;

export default function MainLayout({ children, isAdmin: propIsAdmin = false, isPublic = false }) {
  const isLocalStorageAdmin = localStorage.getItem("is_admin") === "true";
  const isAdmin = propIsAdmin || isLocalStorageAdmin;
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const { unreadCount } = useNotifications();
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (isPublic) return;
    const fetchMiniProfile = async () => {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) return;
        const res = await fetch("http://127.0.0.1:8000/api/profile/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.avatar) setAvatar(data.avatar);
        }
      } catch (_) {}
    };
    fetchMiniProfile();
  }, [location.pathname, isPublic]);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    navigate("/login");
  };

  const authenticatedNavItems = isAdmin ? [
    { name: "Admin Portal", path: "/admin" },
    { name: "Community", path: "/community" },
    { name: "Settings", path: "/settings" },
  ] : [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Tracker", path: "/expense-tracker" },
    { name: "Markets", path: "/market" },
    { name: "Community", path: "/community" },
  ];

  const publicNavItems = [
    { name: "Portfolio Tracking", path: "/features/portfolio" },
    { name: "Expense Manager", path: "/features/expenses" },
    { name: "Market Insights", path: "/features/market" },
    { name: "Community", path: "/features/community" },
  ];

  const navItems = isPublic ? publicNavItems : authenticatedNavItems;

  return (
    <>
      <style>{navStyles}</style>
      
      {/* ── FLOATING TOP NAV ── */}
      <header className="floating-nav">
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', paddingLeft: 8 }} onClick={() => navigate(isPublic ? '/' : '/dashboard')}>
          <img src={isDarkMode ? Darklogo : Lightlogo} alt="Investo" style={{ height: "22px" }} />
        </div>

        {/* Center: Links */}
        <nav className="nav-links-container">
          {navItems.map(item => (
            <div 
              key={item.name}
              className={`pill-link ${(location.pathname === item.path && !isPublic) ? 'active' : ''}`}
              onClick={() => {
                navigate(item.path);
              }}
            >
              {item.name}
            </div>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="nav-actions">
          <div style={{ transform: 'scale(0.85)' }}>
            <ThemeToggle />
          </div>

          {isPublic ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: 8 }}>
              <button 
                onClick={() => navigate("/login")}
                style={{ background: "transparent", border: "none", color: "var(--text-main)", fontWeight: 600, fontSize: 13, cursor: "pointer", padding: "8px 12px", borderRadius: 20 }}
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate("/register")}
                style={{ background: "var(--accent)", color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", padding: "8px 16px", borderRadius: 20, boxShadow: "0 4px 12px var(--accent-glow)" }}
              >
                Get Started
              </button>
            </div>
          ) : (
            <>
              <button className="nav-icon-btn" onClick={() => navigate("/notifications")} title="Notifications">
                <Bell size={18} />
                {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
              </button>

              <button className="nav-icon-btn" onClick={handleLogout} title="Sign Out" style={{ color: 'var(--danger-color)' }}>
                <LogOut size={18} />
              </button>

              <img
                src={avatar || "https://i.pravatar.cc/150?u=investo"}
                alt="User Profile"
                title="Profile"
                style={{ width: "36px", height: "36px", borderRadius: "50%", border: "2px solid var(--card-border)", cursor: 'pointer', objectFit: 'cover' }}
                onClick={() => navigate("/profile")}
              />
            </>
          )}
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="main-wrapper">
        <div style={{ width: '100%', maxWidth: '1200px', padding: '0 24px 40px', flex: 1 }}>
          {children}
        </div>
        <Footer />
      </main>
    </>
  );
}