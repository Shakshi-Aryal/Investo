import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlossaryWidget from "../components/GlossaryWidget";
import MainLayout from "../layouts/MainLayout";

const dashCss = `
  .dash-welcome h1 { font-family: var(--font-heading); font-size: clamp(32px, 5vw, 48px); font-weight: 800; letter-spacing: -2px; }
  .dash-welcome h1 span { background: linear-gradient(90deg, var(--accent), #ff6b72); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

  .dash-search-wrapper { flex: 1; max-width: 500px; position: relative; margin-bottom: 32px; }
  .dash-search-input {
    width: 100%; background: var(--input-bg); border: 1px solid var(--card-border);
    padding: 14px 16px 14px 44px; border-radius: var(--border-radius-md); color: inherit; outline: none; font-size: 14px;
    font-family: var(--font-primary); transition: border-color 0.2s, box-shadow 0.2s;
  }
  .dash-search-input:focus { border-color: var(--accent); box-shadow: 0 0 15px var(--accent-glow); }
  .dash-search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); opacity: 0.5; }

  .dash-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }

  .dash-card {
    background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--border-radius-lg); padding: 32px;
    cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: flex; flex-direction: column; gap: 16px;
    backdrop-filter: blur(10px);
  }
  .dash-card:hover { transform: translateY(-8px); border-color: var(--accent); box-shadow: 0 12px 40px var(--accent-glow); }

  .dash-icon-box { width: 50px; height: 50px; background: var(--accent-dim); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
  .dash-card h3 { font-family: var(--font-heading); font-size: 20px; font-weight: 700; }
  .dash-card p { font-size: 14px; color: var(--text-muted); }

  .dash-section-label { display: flex; align-items: center; gap: 12px; margin-top: 60px; margin-bottom: 24px; }
  .dash-section-line { flex: 1; height: 1px; background: var(--card-border); }

  @media (max-width: 768px) {
    .dash-search-wrapper { max-width: 100%; }
  }
`;

function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const features = [
    { title: "My Profile", icon: "👤", desc: "Manage your identity, security settings, and preferences.", link: "/profile" },
    { title: "Market Glossary", icon: "📖", desc: "Translate complex financial jargon into simple insights.", link: "/glossary" },
    { title: "NEPSE Analysis", icon: "📈", desc: "Real-time candlestick charts and technical indicators.", link: "/stock-charts" },
    { title: "Wealth Tracker", icon: "💰", desc: "Log income and expenses with automated categorization.", link: "/expense-tracker" },
    { title: "Smart Portfolio", icon: "💼", desc: "Visualize your asset allocation and ROI performance.", link: "/portfolio" },
    { title: "Alerts & Tasks", icon: "🔔", desc: "Never miss a dividend or a meeting with smart reminders.", link: "/reminders" },
    { title: "Global Markets", icon: "🌍", desc: "Stay ahead with Gold, Forex, and Economic headlines.", link: "/news" },
    { title: "Community Chat", icon: "💬", desc: "Chat with fellow investors in real-time group discussions.", link: "/community" },
  ];

  return (
    <MainLayout>
      <style>{dashCss}</style>
      <div style={{ width: '100%' }}>
        <div className="dash-welcome">
          <h1>Explore your <span>Finances</span></h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '24px' }}>Welcome back! What are we analyzing today?</p>
        </div>

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
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '24px' }}>Daily <span className="heading-gradient">Knowledge</span></h2>
          <div className="dash-section-line"></div>
        </div>
        
        <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--card-border)' }}>
          <GlossaryWidget />
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;