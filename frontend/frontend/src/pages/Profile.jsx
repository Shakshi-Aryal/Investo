import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Darklogo from "../assets/Darklogo.png";
import Lightlogo from "../assets/Lightlogo.png";

const TOKEN_KEY = "jwt";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap');

  .feat-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    padding: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ── DYNAMIC THEMES ── */
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

  /* ── TOP NAV BAR (From Dashboard) ── */
  .dash-header {
    width: 100%;
    max-width: 1200px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    backdrop-filter: blur(10px);
    padding: 16px 24px;
    border-radius: 24px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    z-index: 1001;
  }

  .dash-btn-circle {
    width: 42px; height: 42px; border-radius: 12px; background: var(--input-bg);
    border: 1px solid var(--card-border); cursor: pointer; display: flex;
    align-items: center; justify-content: center; transition: all 0.2s; color: inherit; font-size: 18px;
  }
  .dash-btn-circle:hover { background: var(--accent); color: white; border-color: var(--accent); transform: translateY(-2px); }

  /* ── SIDEBAR ── */
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

  /* ── PROFILE CARD ── */
  .profile-card {
    width: 100%; max-width: 500px;
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 30px; padding: 40px; backdrop-filter: blur(10px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    position: relative;
  }

  .avatar-box {
    width: 80px; height: 80px; background: var(--accent);
    border-radius: 24px; margin: 0 auto 20px; display: flex;
    align-items: center; justify-content: center; font-size: 32px;
    color: white; font-family: 'Syne', sans-serif; box-shadow: 0 10px 20px var(--accent-glow);
  }

  .info-row { margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--card-border); }
  .info-label { font-size: 10px; text-transform: uppercase; color: var(--text-muted); font-weight: 800; letter-spacing: 1px; }
  .info-value { font-size: 16px; font-weight: 600; margin-top: 4px; }

  .feat-input {
    width: 100%; padding: 12px 16px; background: var(--input-bg);
    border: 1px solid var(--card-border); border-radius: 12px;
    color: inherit; outline: none; transition: 0.3s; margin-top: 5px;
  }
  .feat-input:focus { border-color: var(--accent); box-shadow: 0 0 10px var(--accent-glow); }

  .btn-group { display: flex; gap: 12px; margin-top: 20px; }
  .btn-main {
    flex: 1; padding: 14px; background: var(--accent);
    color: white; border: none; border-radius: 14px;
    font-family: 'Syne', sans-serif; font-weight: 700; cursor: pointer; transition: 0.3s;
  }
  .btn-main:hover { opacity: 0.9; transform: translateY(-2px); }

  .btn-cancel {
    flex: 1; padding: 14px; background: transparent;
    border: 1px solid var(--card-border); border-radius: 14px;
    color: var(--text-muted); cursor: pointer; transition: 0.2s;
  }
  .btn-cancel:hover { background: var(--accent-glow); color: var(--accent); }

  .status-msg { padding: 12px; border-radius: 10px; font-size: 13px; margin-bottom: 20px; text-align: center; font-weight: 500; }
  .error-box { background: rgba(217, 10, 20, 0.1); color: #ff4d4d; border: 1px solid rgba(217, 10, 20, 0.2); }
  .success-box { background: rgba(34, 197, 94, 0.1); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.2); }

  @media (max-width: 768px) {
    .dash-header { padding: 12px; }
    .logo-img { display: none; }
  }
`;

function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isNavOpen, setIsNavOpen] = useState(false);
  const [userData, setUserData] = useState({ username: "", first_name: "", last_name: "", email: "", date_of_birth: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);

  // Sync Theme Broadcaster
  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(isDarkMode));
    window.dispatchEvent(new Event("storage"));
  }, [isDarkMode]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) { setError("Not logged in."); setLoading(false); return; }
        const response = await axios.get("http://127.0.0.1:8000/api/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
      } catch (err) {
        setError("Failed to fetch profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await axios.put("http://127.0.0.1:8000/api/profile/", userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(response.data);
      setSuccess("Profile updated!");
      setTimeout(() => setEditing(false), 1000);
    } catch (err) {
      setError("Update failed.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "My Profile", path: "/profile", icon: "👤" },
    { name: "Stock Charts", path: "/stock-charts", icon: "📈" },
    { name: "Wealth Tracker", path: "/expense-tracker", icon: "💰" },
    { name: "Knowledge", path: "/glossary", icon: "📖" },
  ];

  if (loading) return (
    <div className={`feat-root ${isDarkMode ? "mode-dark" : "mode-light"}`}>
      <style>{css}</style>
      <div className="profile-card" style={{textAlign:'center'}}>Syncing Secure Profile...</div>
    </div>
  );

  return (
    <div className={`feat-root ${isDarkMode ? "mode-dark" : "mode-light"}`}>
      <style>{css}</style>

      {/* ── TOP NAV BAR (Integrated) ── */}
      <header className="dash-header">
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="nav-trigger" onClick={() => setIsNavOpen(!isNavOpen)}>
            <div className="bar" /><div className="bar" /><div className="bar" />
          </button>
          <button className="dash-btn-circle" onClick={() => navigate(-1)}>←</button>
        </div>

        <img src={isDarkMode ? Darklogo : Lightlogo} alt="Investo" className="logo-img" style={{ height: '24px' }} />

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="dash-btn-circle" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? "☀️" : "🌙"}
          </button>
          <button className="dash-btn-circle" onClick={handleLogout} title="Sign Out">
            <span>⎋</span>
          </button>
          <img
            src="https://i.pravatar.cc/150?u=investo"
            alt="User"
            style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid var(--card-border)' }}
          />
        </div>
      </header>

      {/* ── SIDEBAR ── */}
      <div className={`side-drawer ${isNavOpen ? 'open' : ''}`}>
        <h2 style={{ fontFamily: 'Syne', padding: '0 20px 30px', fontSize: '28px' }}>Investo<span>.</span></h2>
        {navItems.map(item => (
          <div key={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
            {item.icon} {item.name}
          </div>
        ))}
      </div>

      {/* ── PROFILE CONTENT ── */}
      <div className="profile-card">
        <div className="avatar-box">{userData.username?.charAt(0).toUpperCase()}</div>
        <h1 style={{ fontFamily: 'Syne', textAlign: 'center', marginBottom: '30px', fontSize: '32px' }}>
            Account <span>Settings</span>
        </h1>

        {error && !editing ? (
          <div style={{textAlign:'center'}}>
            <p className="status-msg error-box">{error}</p>
            <button className="btn-main" onClick={() => navigate("/login")}>Go to Login</button>
          </div>
        ) : !editing ? (
          <div className="fade-in">
            <div className="info-row"><div className="info-label">Username</div><div className="info-value">{userData.username}</div></div>
            <div className="info-row"><div className="info-label">Full Name</div><div className="info-value">{userData.first_name} {userData.last_name}</div></div>
            <div className="info-row"><div className="info-label">Email</div><div className="info-value">{userData.email}</div></div>
            <div className="info-row"><div className="info-label">Date of Birth</div><div className="info-value">{userData.date_of_birth || "—"}</div></div>
            <button className="btn-main" onClick={() => setEditing(true)}>Modify Details</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="fade-in">
            {success && <div className="status-msg success-box">{success}</div>}
            {error && <div className="status-msg error-box">{error}</div>}

            {["username", "first_name", "last_name", "email", "date_of_birth"].map((field) => (
              <div key={field} style={{marginBottom: '15px'}}>
                <label className="info-label">{field.replace("_", " ")}</label>
                <input
                  type={field === "date_of_birth" ? "date" : field === "email" ? "email" : "text"}
                  name={field}
                  value={userData[field] || ""}
                  onChange={handleChange}
                  className="feat-input"
                />
              </div>
            ))}

            <div className="btn-group">
              <button type="submit" className="btn-main">Save Changes</button>
              <button type="button" className="btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;