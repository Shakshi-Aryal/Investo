import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Stockcharts() {
  const API = "http://127.0.0.1:8000/api";

  const [stocks, setStocks] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [status, setStatus] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [selectedStock, setSelectedStock] = useState("NABIL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const safeJson = async (res, fallback = []) => {
    try {
      if (!res.ok) return fallback;
      return await res.json();
    } catch (err) { return fallback; }
  };

  const fetchData = async () => {
    const [sRes, gRes, lRes, stRes, wRes] = await Promise.all([
      fetch(`${API}/stocks/`),
      fetch(`${API}/gainers/`),
      fetch(`${API}/losers/`),
      fetch(`${API}/status/`),
      fetch(`${API}/watchlist/`),
    ]);

    setStocks(await safeJson(sRes, []));
    setGainers(await safeJson(gRes, []));
    setLosers(await safeJson(lRes, []));
    setStatus(await safeJson(stRes, null));
    setWatchlist(await safeJson(wRes, []));
    setLoading(false);
  };

  const fetchChart = async (symbol) => {
    const res = await fetch(`${API}/chart/?symbol=${symbol}`);
    const data = await safeJson(res, []);
    setChartData(data.map(d => ({ date: d.date, price: d.close })));
  };

  const toggleWatchlist = async (symbol) => {
    await fetch(`${API}/watchlist/toggle/?symbol=${symbol}`);
    fetchData(); // Sync everything
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchChart(selectedStock); }, [selectedStock]);

  const filteredStocks = stocks.filter(s => s.symbol?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#0F0505] text-white p-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📊 NEPSE Pro</h1>
        <div className={`px-4 py-2 rounded-lg text-sm font-bold ${status?.isOpen ? "bg-green-600" : "bg-red-600"}`}>
          {status?.isOpen ? "Market Open" : "Market Closed / Offline"}
        </div>
      </div>

      {/* ⭐ WATCHLIST CARD SECTION */}
      <div className="bg-[#111] border border-yellow-900/30 p-4 rounded-xl mb-6 shadow-2xl">
        <h2 className="text-yellow-500 font-bold mb-4 flex items-center">⭐ My Watchlist</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {watchlist.map((s, i) => (
            <div key={i} className="relative group bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 hover:border-yellow-600 transition-all">
              {/* DELETE BUTTON (VISIBLE ON HOVER) */}
              <button 
                onClick={() => toggleWatchlist(s.symbol)}
                className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-10"
              >
                ✕
              </button>
              
              <div className="text-xs text-gray-500 mb-1 font-mono">{s.symbol}</div>
              <div className="text-xl font-bold">Rs.{s.last_traded_price || '---'}</div>
              <div className={`text-sm font-semibold mt-1 ${s.percentage_change >= 0 ? "text-green-400" : "text-red-400"}`}>
                {s.percentage_change >= 0 ? "▲" : "▼"} {Math.abs(s.percentage_change)}%
              </div>
            </div>
          ))}
          {watchlist.length === 0 && (
            <p className="text-gray-600 text-sm italic py-2">Select stocks below to build your watchlist.</p>
          )}
        </div>
      </div>

      {/* Market Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
          <h2 className="text-green-400 font-bold mb-3">Top Gainers</h2>
          {gainers.map((g, i) => (
            <div key={i} className="flex justify-between border-b border-gray-800 py-2 text-sm">
              <span>{g.symbol}</span><span className="text-green-400 font-bold">+{g.percentageChange}%</span>
            </div>
          ))}
        </div>

        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
          <h2 className="text-red-400 font-bold mb-3">Top Losers</h2>
          {losers.map((l, i) => (
            <div key={i} className="flex justify-between border-b border-gray-800 py-2 text-sm">
              <span>{l.symbol}</span><span className="text-red-400 font-bold">{l.percentageChange}%</span>
            </div>
          ))}
        </div>

        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
          <h2 className="text-blue-400 font-bold mb-3">{selectedStock} History</h2>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip contentStyle={{backgroundColor: '#111', border: 'none', borderRadius: '8px'}} />
              <Line type="monotone" dataKey="price" stroke="#3b82f6" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input 
          type="text" placeholder="🔍 Search Stock Symbol (e.g. NABIL, AHPC)..." 
          className="w-full p-4 rounded-xl bg-[#1a1a1a] border border-gray-800 outline-none focus:border-blue-500 transition-all text-lg"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Stock List Table */}
      <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-800 shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-[#222] text-gray-400 text-xs uppercase tracking-widest">
            <tr>
              <th className="p-4">Stock</th>
              <th>LTP (Rs.)</th>
              <th>Change %</th>
              <th className="text-center">Watchlist</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((s, i) => {
              const isSaved = watchlist.some(w => w.symbol === s.symbol);
              return (
                <tr key={i} className="border-t border-gray-800 hover:bg-[#252525] cursor-pointer transition-colors" onClick={() => setSelectedStock(s.symbol)}>
                  <td className="p-4 font-bold text-blue-100">{s.symbol}</td>
                  <td className="font-mono">{s.last_traded_price || '---'}</td>
                  <td className={`font-semibold ${s.percentage_change >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {s.percentage_change}%
                  </td>
                  <td className="text-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleWatchlist(s.symbol); }}
                      className={`text-2xl transition-transform active:scale-150 ${isSaved ? "text-yellow-500" : "text-gray-700 hover:text-gray-500"}`}
                    >
                      {isSaved ? "⭐" : "☆"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}