import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import GlossaryWidget from "../components/GlossaryWidget";
import MainLayout from "../layouts/MainLayout";

const dashCss = `
  .dash-search-wrapper { flex: 1; width: 100%; max-width: 500px; position: relative; margin-bottom: 32px; }
  .dash-search-input {
    width: 100%; background: var(--input-bg); border: 1px solid var(--input-border);
    padding: 16px 20px 16px 48px; border-radius: var(--border-radius-lg); color: inherit; outline: none; font-size: 15px;
    font-family: var(--font-primary); transition: all 0.2s;
  }
  .dash-search-input:focus { border-color: var(--input-border-focus); box-shadow: 0 0 0 4px var(--accent-dim); }
  .dash-search-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); opacity: 0.5; font-size: 18px; }

  .dash-card {
    background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 24px; padding: 32px;
    cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: flex; flex-direction: column; gap: 16px;
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }
  .dash-card:hover { transform: translateY(-8px); border-color: var(--accent); box-shadow: 0 16px 48px var(--accent-glow); }

  .dash-icon-box { width: 56px; height: 56px; background: var(--accent-dim); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
  .dash-card h3 { font-family: var(--font-heading); font-size: 20px; font-weight: 700; color: var(--text-main); margin: 0; }
  .dash-card p { font-size: 14px; color: var(--text-muted); margin: 0; line-height: 1.5; }

  .dash-section-label { display: flex; align-items: center; gap: 16px; margin-top: 64px; margin-bottom: 32px; }
  .dash-section-line { flex: 1; height: 1px; background: var(--divider); }
`;

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const features = [
    { title: "Portfolio Performance", icon: "💼", desc: "Visualize your asset allocation, ROI trends, and historical growth.", link: "/portfolio" },
    { title: "Wealth Tracker", icon: "💰", desc: "Log income and expenses with visual spending funnels.", link: "/expense-tracker" },
    { title: "Market Hub", icon: "📊", desc: "Real-time charts and global economic news.", link: "/market" },
    { title: "Alerts & Tasks", icon: "🔔", desc: "Never miss a dividend or a meeting with smart reminders.", link: "/reminders" },
    { title: "Community Chat", icon: "💬", desc: "Chat with fellow investors in real-time discussions.", link: "/community" },
    { title: "Glossary", icon: "📖", desc: "Translate complex financial jargon into simple insights.", link: "/glossary" },
    { title: "My Profile", icon: "👤", desc: "Manage your identity, security settings, and preferences.", link: "/profile" },
    { title: "Settings", icon: "⚙️", desc: "Configure app preferences and dark mode.", link: "/settings" },
  ];

  const filteredFeatures = features.filter(f => f.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <MainLayout>
      <style>{dashCss}</style>
      <motion.div style={{ width: '100%' }} variants={containerVariants} initial="hidden" animate="show">
        
        <motion.div className="page-header" style={{ textAlign: 'left', marginBottom: 40 }} variants={itemVariants}>
          <h1>Explore your <span className="heading-gradient">Finances</span></h1>
          <p>Welcome back! Select a tool to start analyzing.</p>
        </motion.div>

        <motion.div className="dash-search-wrapper" variants={itemVariants}>
          <span className="dash-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Find tools, settings, or features..."
            className="dash-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>

        <motion.div className="bento-grid bento-grid-3" variants={containerVariants}>
          {filteredFeatures.map((item) => (
            <motion.div key={item.title} className="dash-card" variants={itemVariants} onClick={() => navigate(item.link)}>
              <div className="dash-icon-box">{item.icon}</div>
              <div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </motion.div>
          ))}
          {filteredFeatures.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              No tools found matching "{searchQuery}".
            </div>
          )}
        </motion.div>

        <motion.div className="dash-section-label" variants={itemVariants}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '24px', margin: 0 }}>
            Daily <span className="heading-gradient">Knowledge</span>
          </h2>
          <div className="dash-section-line"></div>
        </motion.div>
        
        <motion.div className="glass-strong" style={{ padding: '32px' }} variants={itemVariants}>
          <GlossaryWidget />
        </motion.div>

      </motion.div>
    </MainLayout>
  );
}