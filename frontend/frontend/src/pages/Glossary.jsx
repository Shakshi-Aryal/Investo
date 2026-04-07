import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Spinner from "../components/Spinner";
import Darklogo from "../assets/Darklogo.png";
import Lightlogo from "../assets/Lightlogo.png";

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

  /* ── TOP NAV BAR (Consistent with Dashboard/Profile) ── */
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

  /* ── SIDEBAR TRIGGER ── */
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

  /* ── GLOSSARY CARD ── */
  .glossary-card {
    width: 100%; max-width: 600px;
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 30px; padding: 40px; backdrop-filter: blur(10px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  }

  .search-row { display: flex; gap: 10px; margin: 25px 0; }
  
  .feat-input {
    flex: 1; padding: 14px 18px; background: var(--input-bg);
    border: 1px solid var(--card-border); border-radius: 14px;
    color: inherit; outline: none; transition: 0.3s;
  }
  .feat-input:focus { border-color: var(--accent); box-shadow: 0 0 10px var(--accent-glow); }

  .btn-search {
    padding: 0 24px; background: var(--accent);
    color: white; border: none; border-radius: 14px;
    font-family: 'Syne', sans-serif; font-weight: 700; cursor: pointer;
    transition: 0.3s; display: flex; align-items: center; justify-content: center;
  }
  .btn-search:hover { opacity: 0.9; transform: translateY(-2px); }

  .result-container {
    margin-top: 30px; border-top: 1px solid var(--card-border); padding-top: 25px;
    animation: fadeIn 0.5s ease;
  }
  
  .word-title { font-family: 'Syne', sans-serif; font-size: 38px; color: var(--accent); text-transform: capitalize; }
  .phonetic { font-size: 14px; color: var(--text-muted); margin-bottom: 20px; font-style: italic; }
  
  .meaning-section { margin-bottom: 24px; }
  .pos-tag { 
    font-size: 10px; font-weight: 800; text-transform: uppercase; 
    color: var(--accent); background: var(--accent-glow); 
    padding: 4px 10px; border-radius: 6px; letter-spacing: 1px;
  }
  .definition-text { margin: 10px 0; font-size: 15px; line-height: 1.6; }
  .example-text { 
    font-size: 14px; color: var(--text-muted); font-style: italic; 
    padding-left: 15px; border-left: 2px solid var(--accent); 
  }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  @media (max-width: 768px) {
    .dash-header { padding: 12px; }
    .logo-img { display: none; }
  }
`;

function Glossary() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isNavOpen, setIsNavOpen] = useState(false);
  const [word, setWord] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Broadcast theme changes to sync with GlossaryWidget if it exists in the DOM
  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(isDarkMode));
    window.dispatchEvent(new Event("storage"));
  }, [isDarkMode]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!word.trim()) return;
    setLoading(true);
    setResults(null);
    setError("");

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!response.ok) throw new Error("Word not found!");
      const data = await response.json();
      setResults(data[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
    <div className={`feat-root ${isDarkMode ? "mode-dark" : "mode-light"}`}>
      <style>{css}</style>

      {/* ── TOP NAV BAR (Unified) ── */}
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
            style={{ width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', border: '1px solid var(--card-border)' }}
            onClick={() => navigate("/profile")}
          />
        </div>
      </header>

      {/* ── SHARED SIDEBAR ── */}
      <div className={`side-drawer ${isNavOpen ? 'open' : ''}`}>
        <h2 style={{ fontFamily: 'Syne', padding: '0 20px 30px', fontSize: '28px' }}>Investo<span>.</span></h2>
        {navItems.map(item => (
          <div key={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
            {item.icon} {item.name}
          </div>
        ))}
      </div>

      {/* ── GLOSSARY CONTENT ── */}
      <div className="glossary-card">
        <h1 style={{ fontFamily: 'Syne', textAlign: 'center', fontSize: '32px' }}>
          Market <span>Knowledge</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '14px', marginTop: '5px' }}>
          Instant definitions for finance and trading terms.
        </p>

        <form onSubmit={handleSearch} className="search-row">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Type a word (e.g. Dividend)..."
            className="feat-input"
          />
          <button type="submit" className="btn-search">
            {loading ? <Spinner size={18} color="white" /> : "Search"}
          </button>
        </form>

        {error && <div className="status-msg error-box" style={{padding: '12px', borderRadius: '10px', background: 'rgba(217,10,20,0.1)', color: '#ff4d4d', textAlign:'center'}}>{error}</div>}

        {results && (
          <div className="result-container">
            <h2 className="word-title">{results.word}</h2>
            {results.phonetics?.[0]?.text && (
              <p className="phonetic">{results.phonetics[0].text}</p>
            )}

            {results.meanings.map((meaning, index) => (
              <div key={index} className="meaning-section">
                <span className="pos-tag">{meaning.partOfSpeech}</span>
                {meaning.definitions.slice(0, 2).map((def, i) => (
                  <div key={i} style={{ marginBottom: '15px' }}>
                    <p className="definition-text">{def.definition}</p>
                    {def.example && (
                      <p className="example-text">"{def.example}"</p>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Glossary;