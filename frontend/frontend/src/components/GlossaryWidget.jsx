import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";

export default function GlossaryWidget() {
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nodeRef = useRef(null);

  // 🔥 Load saved position OR default
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem("glossary-pos");
    return saved ? JSON.parse(saved) : { x: 20, y: 20 };
  });

  // 🔥 Save position on drag stop
  const handleStop = (e, data) => {
    const newPos = { x: data.x, y: data.y };
    setPosition(newPos);
    localStorage.setItem("glossary-pos", JSON.stringify(newPos));
  };

  // 🔥 Close glossary when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (open && nodeRef.current && !nodeRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // ----------- Your existing code below remains unchanged -----------

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!word.trim()) return;

    setLoading(true);
    setResults(null);
    setError("");

    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );

      if (!response.ok) {
        throw new Error("Word not found!");
      }

      const data = await response.json();
      setResults(data[0]);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      onStop={handleStop}
    >
      <div ref={nodeRef} className="fixed z-50">
        {!open && (
          <div
            onClick={() => setOpen(true)}
            className="w-14 h-14 bg-[#D90A14] rounded-lg flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200"
            title="Open Glossary"
          >
            <span className="text-white font-bold text-sm">G</span>
          </div>
        )}

        {open && (
          <div className="w-80 bg-[#1A0B0B] text-white p-4 rounded-lg shadow-xl">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-[#D90A14]">Glossary</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSearch} className="flex mb-4">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Type a word..."
                className="flex-1 p-2 rounded-l-lg bg-[#0F0505] text-white outline-none border border-gray-700"
              />
              <button
                type="submit"
                className="p-2 bg-[#D90A14] rounded-r-lg font-bold hover:bg-[#a8151d] transition-all duration-200"
              >
                Search
              </button>
            </form>

            {loading && <p className="text-gray-400 mb-2">Loading...</p>}
            {error && <p className="text-red-500 mb-2">{error}</p>}

            {results && (
              <div className="bg-[#0F0505] p-2 rounded-md max-h-60 overflow-y-auto">
                <h4 className="text-[#D90A14] font-semibold">{results.word}</h4>
                {results.phonetics && results.phonetics[0]?.text && (
                  <p className="text-gray-400 italic">
                    {results.phonetics[0].text}
                  </p>
                )}
                {results.meanings.map((m, i) => (
                  <div key={i} className="mb-2">
                    <p className="text-gray-300 italic">{m.partOfSpeech}</p>
                    <ul className="list-disc ml-4 text-gray-200">
                      {m.definitions.map((d, idx) => (
                        <li key={idx}>
                          {d.definition}
                          {d.example && (
                            <span className="text-gray-400 italic">
                              {" "}
                              — {d.example}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Draggable>
  );
}
