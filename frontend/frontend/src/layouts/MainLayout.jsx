import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, User, Bell, LogOut, Settings, LayoutDashboard } from "lucide-react";
import Darklogo from "../assets/Darklogo.png";
import Lightlogo from "../assets/Lightlogo.png";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import { useNotifications } from "../context/NotificationContext";
import Footer from "../components/Footer";
import { apiUrl } from "../config";

const navStyles = `
  .global-header {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    width: calc(100% - 40px);
    max-width: 1100px;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 16px;
    pointer-events: none;
  }

  .global-header > * {
    pointer-events: auto;
  }

  .floating-pill-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: var(--card-bg);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--card-border);
    border-radius: 999px;
    padding: 6px 8px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.06);
    justify-self: center;
  }

  .header-logo {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 999px;
    background: var(--card-bg);
    backdrop-filter: blur(20px);
    border: 1px solid var(--card-border);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    justify-self: start;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .header-logo:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 32px var(--accent-glow);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-self: end;
  }

  .pill-link {
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    white-space: nowrap;
    border: none;
    background: transparent;
    font-family: var(--font-heading);
  }

  .pill-link:hover {
    color: var(--text-main);
    background: var(--accent-dim);
  }

  .pill-link.active {
    background: var(--text-main);
    color: var(--bg-main);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
  }

  .profile-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px 4px 4px;
    border-radius: 999px;
    background: var(--card-bg);
    backdrop-filter: blur(20px);
    border: 1px solid var(--card-border);
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-main);
    font-size: 13px;
    font-weight: 600;
    font-family: var(--font-heading);
  }

  .profile-trigger:hover {
    border-color: var(--accent);
    box-shadow: 0 8px 24px var(--accent-glow);
  }

  .profile-label {
    display: none;
  }

  @media (min-width: 640px) {
    .profile-label { display: inline; }
  }

  .nav-bell-btn {
    position: relative;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid var(--card-border);
    background: var(--card-bg);
    backdrop-filter: blur(20px);
    color: var(--text-main);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .nav-bell-btn:hover {
    border-color: var(--accent);
    box-shadow: 0 8px 24px var(--accent-glow);
    color: var(--accent);
  }

  .nav-bell-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    background: var(--danger-color);
    color: #fff;
    font-size: 10px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  }

  .profile-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--card-border);
  }

  .profile-menu {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    min-width: 220px;
    background: var(--card-bg);
    backdrop-filter: blur(24px);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 8px;
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.15);
    animation: menuIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes menuIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .profile-menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    border: none;
    background: transparent;
    color: var(--text-main);
    font-size: 14px;
    font-weight: 500;
    border-radius: 10px;
    cursor: pointer;
    text-align: left;
    font-family: var(--font-primary);
    transition: background 0.15s;
  }

  .profile-menu-item:hover {
    background: var(--accent-dim);
  }

  .profile-menu-item.danger {
    color: var(--danger-color);
  }

  .profile-menu-divider {
    height: 1px;
    background: var(--divider);
    margin: 6px 0;
  }

  .menu-badge {
    margin-left: auto;
    background: var(--danger-color);
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 999px;
  }

  .main-wrapper {
    padding-top: 96px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .mobile-nav-toggle {
    display: none;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 999px;
    padding: 8px 14px;
  }

  @media (max-width: 900px) {
    .global-header > .floating-pill-nav:not(.mobile-open) {
      display: none;
    }
    .global-header {
      grid-template-columns: auto 1fr;
    }
    .mobile-nav-toggle {
      display: inline-flex;
      align-items: center;
    }
    .floating-pill-nav.mobile-open {
      display: flex;
      flex-wrap: wrap;
      position: fixed;
      top: 76px;
      left: 50%;
      transform: translateX(-50%);
      max-width: calc(100% - 40px);
      z-index: 999;
      grid-column: 1 / -1;
    }
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("jwt"));
  const profileRef = useRef(null);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("jwt"));
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setProfileOpen(false);
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isPublic) return;
    const fetchMiniProfile = async () => {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) return;
        const res = await fetch(apiUrl("/profile/"), {
          headers: { Authorization: `Bearer ${token}` },
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
    localStorage.removeItem("is_admin");
    setProfileOpen(false);
    navigate("/login");
  };

  const authenticatedNavItems = isAdmin
    ? [
        { name: "Admin", path: "/admin" },
        { name: "Community", path: "/community" },
        { name: "Settings", path: "/settings" },
      ]
    : [
        { name: "Overview Hub", path: "/dashboard" },
        { name: "Capital Allocation", path: "/portfolio" },
        { name: "NEPSE Live", path: "/market" },
        { name: "Economic Feed", path: "/news" },
        { name: "Reminders", path: "/reminders" },
        { name: "Cash Flow", path: "/expense-tracker" },
      ];

  const publicNavItems = [
    { name: "NEPSE Live", path: "/features/market" },
    { name: "Capital Allocation", path: "/features/portfolio" },
    { name: "Economic Feed", path: "/features/news" },
    { name: "About", path: "/about" },
  ];

  const navItems = isPublic ? publicNavItems : authenticatedNavItems;

  const isActive = (path) => {
    if (isPublic) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const NavLinks = ({ className = "floating-pill-nav" }) => (
    <nav className={className}>
      {navItems.map((item) => (
        <button
          key={item.name}
          type="button"
          className={`pill-link ${isActive(item.path) ? "active" : ""}`}
          onClick={() => navigate(item.path)}
        >
          {item.name}
        </button>
      ))}
    </nav>
  );

  return (
    <>
      <style>{navStyles}</style>

      <header className="global-header">
        <div
          className="header-logo"
          onClick={() => navigate(isPublic ? "/" : "/dashboard")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate(isPublic ? "/" : "/dashboard")}
        >
          <img src={isDarkMode ? Darklogo : Lightlogo} alt="Investo" style={{ height: 22 }} />
        </div>

        <NavLinks />

        <div className="header-actions">
          <ThemeToggle />

          {!isPublic && isAuthenticated && (
            <button
              type="button"
              className="nav-bell-btn"
              onClick={() => navigate("/notifications")}
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="nav-bell-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
              )}
            </button>
          )}

          <div ref={profileRef} style={{ position: "relative" }}>
            <button
              type="button"
              className="profile-trigger"
              onClick={() => setProfileOpen((o) => !o)}
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              {isPublic ? (
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "var(--accent-dim)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent)",
                  }}
                >
                  <User size={18} />
                </span>
              ) : (
                <img
                  src={avatar || "https://i.pravatar.cc/150?u=investo"}
                  alt=""
                  className="profile-avatar"
                />
              )}
              <span className="profile-label">{isPublic ? "Account" : "Profile"}</span>
              <ChevronDown
                size={16}
                style={{
                  transition: "transform 0.2s",
                  transform: profileOpen ? "rotate(180deg)" : "none",
                  color: "var(--text-muted)",
                }}
              />
            </button>

            {profileOpen && (
              <div className="profile-menu" role="menu">
                {isPublic ? (
                  <>
                    <button
                      type="button"
                      className="profile-menu-item"
                      onClick={() => navigate("/login")}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      className="profile-menu-item"
                      onClick={() => navigate("/register")}
                    >
                      Get Started
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="profile-menu-item"
                      onClick={() => navigate("/profile")}
                    >
                      <User size={16} /> My Profile
                    </button>
                    <button
                      type="button"
                      className="profile-menu-item"
                      onClick={() => navigate("/dashboard")}
                    >
                      <LayoutDashboard size={16} /> Dashboard
                    </button>
                    <button
                      type="button"
                      className="profile-menu-item"
                      onClick={() => navigate("/notifications")}
                    >
                      <Bell size={16} /> Notifications
                      {unreadCount > 0 && <span className="menu-badge">{unreadCount}</span>}
                    </button>
                    {!isAdmin && (
                      <button
                        type="button"
                        className="profile-menu-item"
                        onClick={() => navigate("/settings")}
                      >
                        <Settings size={16} /> Settings
                      </button>
                    )}
                    <div className="profile-menu-divider" />
                    <button
                      type="button"
                      className="profile-menu-item danger"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className="mobile-nav-toggle pill-link"
            onClick={() => setMobileNavOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            Menu
          </button>
        </div>
      </header>

      {mobileNavOpen && <NavLinks className="floating-pill-nav mobile-open" />}

      <main className="main-wrapper">
        <div style={{ width: "100%", maxWidth: 1200, padding: "0 24px 40px", flex: 1 }}>
          {children}
        </div>
        <Footer />
      </main>
    </>
  );
}
