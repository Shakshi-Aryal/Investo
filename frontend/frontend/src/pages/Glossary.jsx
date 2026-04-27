import React, { useState } from "react";
import Spinner from "../components/Spinner";
import MainLayout from "../layouts/MainLayout";

const css = `
  .glossary-card {
    width: 100%; max-width: 600px;
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: var(--border-radius-lg); padding: 40px; backdrop-filter: blur(10px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    margin: 0 auto;
  }

  .search-row { display: flex; gap: 10px; margin: 25px 0; }
  
  .feat-input {
    flex: 1; padding: 14px 18px; background: var(--input-bg);
    border: 1px solid var(--card-border); border-radius: 14px;
    color: inherit; outline: none; transition: 0.3s;
    font-family: var(--font-primary);
  }
  .feat-input:focus { border-color: var(--accent); box-shadow: 0 0 10px var(--accent-glow); }

  .btn-search {
    padding: 0 24px; background: var(--accent);
    color: white; border: none; border-radius: 14px;
    font-family: var(--font-heading); font-weight: 700; cursor: pointer;
    transition: 0.3s; display: flex; align-items: center; justify-content: center;
  }
  .btn-search:hover { opacity: 0.9; transform: translateY(-2px); }

  .result-container {
    margin-top: 30px; border-top: 1px solid var(--card-border); padding-top: 25px;
    animation: fadeIn 0.5s ease;
  }
  
  .word-title { font-family: var(--font-heading); font-size: 38px; color: var(--accent); text-transform: capitalize; }
  .phonetic { font-size: 14px; color: var(--text-muted); margin-bottom: 20px; font-style: italic; }
  
  .meaning-section { margin-bottom: 24px; }
  .pos-tag { 
    font-size: 10px; font-weight: 800; text-transform: uppercase; 
    color: var(--accent); background: var(--accent-dim); 
    padding: 4px 10px; border-radius: 6px; letter-spacing: 1px;
  }
  .definition-text { margin: 10px 0; font-size: 15px; line-height: 1.6; }
  .example-text { 
    font-size: 14px; color: var(--text-muted); font-style: italic; 
    padding-left: 15px; border-left: 2px solid var(--accent); 
  }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
`;

function Glossary() {
  const [word, setWord] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <MainLayout>
      <style>{css}</style>

      {/* ── GLOSSARY CONTENT ── */}
      <div className="glossary-card">
        <h1 style={{ fontFamily: 'var(--font-heading)', textAlign: 'center', fontSize: '32px' }}>
          Market <span className="heading-gradient">Knowledge</span>
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

        {error && <div style={{padding: '12px', borderRadius: '10px', background: 'var(--danger-bg)', color: 'var(--danger-color)', textAlign:'center', marginBottom: '16px'}}>{error}</div>}

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
    </MainLayout>
  );
}

export default Glossary;