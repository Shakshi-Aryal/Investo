import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";

export default function GlossaryWidget() {
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nodeRef = useRef(null);

  // ── THEME SYNC ──
  // Reads from the same 'theme' key used in Login/Profile
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Listen for storage changes (if user toggles theme in another tab/component)
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("theme");
      if (saved !== null) setIsDarkMode(JSON.parse(saved));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ── POSITION PERSISTENCE ──
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem("glossary-pos");
    return saved ? JSON.parse(saved) : { x: 30, y: 30 };
  });

  const handleStop = (e, data) => {
    const newPos = { x: data.x, y: data.y };
    setPosition(newPos);
    localStorage.setItem("glossary-pos", JSON.stringify(newPos));
  };

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (open && nodeRef.current && !nodeRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!word.trim()) return;
    setLoading(true);
    setResults(null);
    setError("");

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!response.ok) throw new Error("Not found");
      const data = await response.json();
      setResults(data[0]);
    } catch (err) {
      setError("Term not found.");
    } finally {
      setLoading(false);
    }
  };

  // ── CSS CONSTANTS ──
  const themeStyles = isDarkMode ? {
    accent: "#D90A14",
    bg: "rgba(20, 5, 5, 0.85)",
    border: "rgba(217, 10, 20, 0.2)",
    text: "#ffffff",
    input: "rgba(0, 0, 0, 0.3)",
    muted: "#9a7a7c"
  } : {
    accent: "#BA7517",
    bg: "rgba(255, 250, 240, 0.85)",
    border: "rgba(186, 117, 23, 0.2)",
    text: "#1a1208",
    input: "#ffffff",
    muted: "#8a6a3a"
  };

  return (
    <Draggable nodeRef={nodeRef} position={position} onStop={handleStop} handle=".drag-handle">
      <div 
        ref={nodeRef} 
        className="fixed z-[9999]"
        style={{ 
          fontFamily: "'DM Sans', sans-serif",
          color: themeStyles.text 
        }}
      >
        {!open ? (
          <div
            onClick={() => setOpen(true)}
            className="drag-handle w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl cursor-grab active:cursor-grabbing hover:scale-110 transition-all duration-300"
            style={{ 
              background: `linear-gradient(135deg, ${themeStyles.accent}, #ff6b72)`,
              border: `2px solid rgba(255,255,255,0.1)`
            }}
          >
            <span className="text-white text-xl">📖</span>
          </div>
        ) : (
          <div 
            className="w-80 rounded-3xl p-5 shadow-2xl backdrop-blur-xl border"
            style={{ 
              backgroundColor: themeStyles.bg,
              borderColor: themeStyles.border,
              animation: 'widgetPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            {/* Header / Drag Area */}
            <div className="drag-handle flex justify-between items-center mb-4 cursor-move">
              <h3 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '14px', letterSpacing: '1px', color: themeStyles.accent }}>
                INVESTO GLOSSARY
              </h3>
              <button onClick={() => setOpen(false)} className="opacity-50 hover:opacity-100 transition-opacity">✕</button>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative flex items-center">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Financial term..."
                className="w-full p-3 pr-12 rounded-xl outline-none border transition-all text-sm"
                style={{ 
                  backgroundColor: themeStyles.input,
                  borderColor: themeStyles.border,
                  color: themeStyles.text
                }}
              />
              <button 
                type="submit" 
                className="absolute right-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-transform active:scale-95"
                style={{ backgroundColor: themeStyles.accent }}
              >
                GO
              </button>
            </form>

            {/* Content Area */}
            <div className="mt-4 max-h-64 overflow-y-auto pr-2 custom-scroll">
              {loading && <div className="text-center py-4 opacity-50 text-xs">Decoding market data...</div>}
              {error && <div className="text-center py-4 text-xs" style={{ color: themeStyles.accent }}>{error}</div>}
              
              {results && (
                <div className="fade-in">
                  <h4 className="text-lg font-bold capitalize mb-1" style={{ fontFamily: 'Syne' }}>{results.word}</h4>
                  {results.meanings.map((m, i) => (
                    <div key={i} className="mb-4">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md" 
                        style={{ backgroundColor: `${themeStyles.accent}20`, color: themeStyles.accent }}>
                        {m.partOfSpeech}
                      </span>
                      <p className="text-xs mt-2 leading-relaxed opacity-90">{m.definitions[0].definition}</p>
                      {m.definitions[0].example && (
                        <p className="text-[11px] mt-1 italic border-left pl-2 opacity-60" style={{ borderLeft: `2px solid ${themeStyles.border}` }}>
                          "{m.definitions[0].example}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <style>{`
          @keyframes widgetPop {
            from { opacity: 0; transform: scale(0.9) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .custom-scroll::-webkit-scrollbar { width: 4px; }
          .custom-scroll::-webkit-scrollbar-thumb { background: ${themeStyles.border}; border-radius: 10px; }
          .fade-in { animation: fadeIn 0.4s ease; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}</style>
      </div>
    </Draggable>
  );
}