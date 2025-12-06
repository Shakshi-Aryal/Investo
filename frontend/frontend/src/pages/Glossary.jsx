import React, { useState } from "react";

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
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );

      if (!response.ok) {
        throw new Error("Word not found!");
      }

      const data = await response.json();
      setResults(data[0]); // take the first result
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0F0505] text-white p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6">Glossary</h1>
      <p className="text-gray-400 mb-6 text-center max-w-xl">
        Search for financial, business, or general terms and get definitions.
      </p>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="w-full max-w-md flex mb-6">
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Type a word..."
          className="flex-1 p-3 rounded-l-lg bg-[#1A0B0B] text-white outline-none border border-gray-700"
        />
        <button
          type="submit"
          className="p-3 bg-[#D90A14] rounded-r-lg font-bold hover:bg-[#a8151d] transition-all duration-200"
        >
          Search
        </button>
      </form>

      {/* Loading */}
      {loading && <p className="text-gray-400">Loading...</p>}

      {/* Error */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Results */}
      {results && (
        <div className="w-full max-w-2xl bg-[#1A0B0B] p-6 rounded-lg shadow-lg space-y-4">
          <h2 className="text-2xl font-bold text-[#D90A14]">
            {results.word}
          </h2>

          {results.phonetics && results.phonetics.length > 0 && (
            <p className="text-gray-400 italic">
              {results.phonetics[0].text}
            </p>
          )}

          {results.meanings.map((meaning, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-lg font-semibold text-gray-300">
                {meaning.partOfSpeech}
              </h3>
              <ul className="list-disc ml-6 mt-1">
                {meaning.definitions.map((def, i) => (
                  <li key={i} className="text-gray-200 mb-1">
                    {def.definition}
                    {def.example && (
                      <span className="text-gray-400 italic"> — {def.example}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Glossary;
