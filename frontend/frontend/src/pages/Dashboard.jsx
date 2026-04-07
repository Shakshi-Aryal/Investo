import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GlossaryWidget from "../components/GlossaryWidget";
import Darklogo from "../assets/Darklogo.png";
import Lightlogo from "../assets/Lightlogo.png";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap');
  
  .dash-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    width: 100%;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .dash-dark {
    background: radial-gradient(circle at top right, #1a0508, #080306);
    color: #ffffff;
    --accent: #D90A14;
    --accent-glow: rgba(217, 10, 20, 0.15);
    --card-bg: rgba(255, 255, 255, 0.03);
    --card-border: rgba(217, 10, 20, 0.1);
    --input-bg: rgba(255, 255, 255, 0.05);
    --text-muted: #9a7a7c;
  }

  .dash-light {
    background: radial-gradient(circle at top right, #fff5e6, #faf8f3);
    color: #1a1208;
    --accent: #BA7517;
    --accent-glow: rgba(186, 117, 23, 0.1);
    --card-bg: rgba(255, 255, 255, 0.7);
    --card-border: rgba(186, 117, 23, 0.15);
    --input-bg: #ffffff;
    --text-muted: #8a6a3a;
  }

  .dash-container { width: 100%; max-width: 1200px; z-index: 1; }

  .dash-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 60px;
    backdrop-filter: blur(10px);
    padding: 16px 24px;
    border-radius: 24px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
  }

  .dash-search-wrapper { flex: 1; max-width: 400px; position: relative; margin: 0 24px; }
  .dash-search-input {
    width: 100%; background: var(--input-bg); border: 1px solid var(--card-border);
    padding: 12px 16px 12px 44px; border-radius: 12px; color: inherit; outline: none; font-size: 14px;
  }
  .dash-search-input:focus { border-color: var(--accent); box-shadow: 0 0 15px var(--accent-glow); }
  .dash-search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); opacity: 0.5; }

  .dash-btn-circle {
    width: 42px; height: 42px; border-radius: 12px; background: var(--input-bg);
    border: 1px solid var(--card-border); cursor: pointer; display: flex;
    align-items: center; justify-content: center; transition: all 0.2s; color: inherit; font-size: 18px;
  }
  .dash-btn-circle:hover { background: var(--accent); color: white; border-color: var(--accent); transform: translateY(-2px); }

  .logout-trigger:hover {
    background: var(--accent) !important;
    box-shadow: 0 0 15px var(--accent-glow);
  }

  .dash-welcome h1 { font-family: 'Syne', sans-serif; font-size: clamp(32px, 5vw, 48px); font-weight: 800; letter-spacing: -2px; }
  .dash-welcome h1 span { background: linear-gradient(90deg, var(--accent), #ff6b72); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

  .dash-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }

  .dash-card {
    background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 24px; padding: 32px;
    cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: flex; flex-direction: column; gap: 16px;
  }
  .dash-card:hover { transform: translateY(-10px); border-color: var(--accent); background: var(--input-bg); }

  .dash-icon-box { width: 50px; height: 50px; background: var(--accent-glow); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
  .dash-card h3 { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; }
  .dash-card p { font-size: 14px; color: var(--text-muted); }

  .dash-section-label { display: flex; align-items: center; gap: 12px; margin-top: 60px; margin-bottom: 24px; }
  .dash-section-line { flex: 1; height: 1px; background: var(--card-border); }

  @media (max-width: 768px) {
    .dash-header { flex-wrap: wrap; gap: 16px; }
    .dash-search-wrapper { order: 3; max-width: 100%; margin: 0; width: 100%; }
  }
`;

function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Theme Broadcaster
  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(isDarkMode));
    // 🔥 This line makes sure the Widget "sinks" instantly in the same tab
    window.dispatchEvent(new Event("storage"));
  }, [isDarkMode]);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    navigate("/login");
  };

  const features = [
    { title: "My Profile", icon: "👤", desc: "Manage your identity, security settings, and preferences.", link: "/profile" },
    { title: "Market Glossary", icon: "📖", desc: "Translate complex financial jargon into simple insights.", link: "/glossary" },
    { title: "NEPSE Analysis", icon: "📈", desc: "Real-time candlestick charts and technical indicators.", link: "/stock-charts" },
    { title: "Wealth Tracker", icon: "💰", desc: "Log income and expenses with automated categorization.", link: "/expense-tracker" },
    { title: "Smart Portfolio", icon: "💼", desc: "Visualize your asset allocation and ROI performance.", link: "/portfolio" },
    { title: "Alerts & Tasks", icon: "🔔", desc: "Never miss a dividend or a meeting with smart reminders.", link: "/reminders" },
    { title: "Global Markets", icon: "🌍", desc: "Stay ahead with Gold, Forex, and Economic headlines.", link: "/news" },
  ];

  return (
    <div className={`dash-root ${isDarkMode ? "dash-dark" : "dash-light"}`}>
      <style>{css}</style>
      <div className="dash-container">
        <header className="dash-header">
          <button className="dash-btn-circle" onClick={() => navigate(-1)}>←</button>
          
          <div className="dash-search-wrapper">
            <span className="dash-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Find tools or assets..."
              className="dash-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button className="dash-btn-circle logout-trigger" onClick={handleLogout} title="Sign Out">
              <span style={{ fontSize: '20px' }}>⎋</span>
            </button> 

            <button className="dash-btn-circle" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? "☀️" : "🌙"}
            </button>
            
            <img src={isDarkMode ? Darklogo : Lightlogo} alt="Investo" style={{ height: '24px', margin: '0 12px' }} />
            
            <img
              src="https://i.pravatar.cc/150?u=investo"
              alt="User"
              style={{ width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', border: '1px solid var(--card-border)' }}
              onClick={() => navigate("/profile")}
            />
          </div>
        </header>

        <div className="dash-welcome">
          <h1>Explore your <span>Finances</span></h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Welcome back! What are we analyzing today?</p>
        </div>

        <div className="dash-grid">
          {features
            .filter(f => f.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((item) => (
            <div key={item.title} className="dash-card" onClick={() => navigate(item.link)}>
              <div className="dash-icon-box">{item.icon}</div>
              <div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="dash-section-label">
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '24px' }}>Daily <span>Knowledge</span></h2>
          <div className="dash-section-line"></div>
        </div>
        
        <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '24px', border: '1px solid var(--card-border)' }}>
          <GlossaryWidget />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;