import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, TrendingUp, Globe, Coins, ArrowRight, RefreshCcw, BookOpen } from "lucide-react";

// OFFICIAL NEPAL SOURCES (Using 2026 API Dates)
const NRB_FOREX_API = "https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=1&from=2026-01-17&to=2026-01-18";

export default function NewsPortal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [forex, setForex] = useState([]);
  const [showNewspaper, setShowNewspaper] = useState(false);
  
  // Real January 2026 Rates for Nepal
  const [metalRates, setMetalRates] = useState({
    fineGold: { buy: 276500, sell: 277200, purity: "99.99%" }, 
    tejabiGold: { buy: 275100, sell: 275800, purity: "91.6%" },
    silver: { buy: 5485, sell: 5645, purity: "99.9%" }
  });

  // Mock News Data
  const [news, setNews] = useState([
    {
      title: "Gold price climbs above Rs 277,000 per tola in Nepal",
      source: "The Rising Nepal",
      date: "2026-01-17",
      snippet: "The Federation of Nepal Gold and Silver Dealers' Association fixed the price of hallmark gold at Rs 277,200 today...",
      url: "#"
    },
    {
      title: "NRB Maintains Stable Inflation Targets for Q3",
      source: "Kathmandu Post",
      date: "2026-01-16",
      snippet: "Nepal Rastra Bank reports inflation contained at 3.8% despite global supply chain pressures.",
      url: "#"
    }
  ]);

  useEffect(() => {
    fetchLiveRates();
  }, []);

  const fetchLiveRates = async () => {
    setLoading(true);
    try {
      const response = await fetch(NRB_FOREX_API);
      const data = await response.json();
      if (data.status.code === 200 && data.data.payload.length > 0) {
        setForex(data.data.payload[0].rates);
      }
    } catch (error) {
      console.error("Failed to fetch NRB rates", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-4 md:p-8 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-red-600 uppercase">Investo.np</h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest">Nepal Intelligence Portal</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowNewspaper(true)}
            className="hidden md:flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition border border-white/10"
          >
            <BookOpen size={18} /> The Daily Brief
          </button>
          <button onClick={fetchLiveRates} className="p-2 hover:bg-white/5 rounded-full transition">
            <RefreshCcw size={20} className={loading ? "animate-spin text-red-500" : "text-gray-400"} />
          </button>
        </div>
      </div>

      {/* 1. BULLION MARKET SECTION */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Coins className="text-yellow-500" />
          <h2 className="text-xl font-bold italic">Gold & Silver (FENOSGODA)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BullionCard title="Fine Gold (24K)" buy={metalRates.fineGold.buy} sell={metalRates.fineGold.sell} unit="Tola" color="border-yellow-600/30" purity={metalRates.fineGold.purity} />
          <BullionCard title="Tejabi Gold" buy={metalRates.tejabiGold.buy} sell={metalRates.tejabiGold.sell} unit="Tola" color="border-orange-600/30" purity={metalRates.tejabiGold.purity} />
          <BullionCard title="Silver" buy={metalRates.silver.buy} sell={metalRates.silver.sell} unit="Tola" color="border-gray-500/30" purity={metalRates.silver.purity} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* 2. FOREX TABLE */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="text-blue-500" />
            <h2 className="text-xl font-bold italic">NRB Official Exchange</h2>
          </div>
          <div className="overflow-x-auto bg-[#111112] rounded-2xl border border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm uppercase">
                  <th className="p-4 font-medium">Currency</th>
                  <th className="p-4 font-medium">Unit</th>
                  <th className="p-4 font-medium text-green-400">Buy (Rs)</th>
                  <th className="p-4 font-medium text-red-400">Sell (Rs)</th>
                </tr>
              </thead>
              <tbody>
                {forex.map((cur, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                    <td className="p-4 font-bold">
                        <div className="flex items-center gap-3">
                         <span className="bg-white/10 px-2 py-1 rounded text-[10px] text-gray-300">{cur.currency.iso3}</span>
                         <span className="text-sm">{cur.currency.name}</span>
                        </div>
                    </td>
                    <td className="p-4 text-gray-400">{cur.currency.unit}</td>
                    <td className="p-4 font-mono text-green-400">{cur.buy}</td>
                    <td className="p-4 font-mono text-red-400">{cur.sell}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. NEWS FEED */}
        <div className="space-y-6">
           <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-red-500" />
            <h2 className="text-xl font-bold italic">Market News</h2>
          </div>
          {news.map((item, i) => (
            <div key={i} className="bg-[#111112] p-5 rounded-2xl border border-white/5 hover:border-red-500/30 transition group">
              <span className="text-[10px] text-red-500 font-bold uppercase">{item.source} • {item.date}</span>
              <h3 className="text-md font-bold mt-1 group-hover:text-red-400 transition">{item.title}</h3>
              <p className="text-gray-500 text-xs mt-2 line-clamp-2">{item.snippet}</p>
              <ArrowRight size={14} className="mt-3 text-gray-600 group-hover:translate-x-1 transition cursor-pointer" />
            </div>
          ))}
        </div>
      </div>

      {/* NEWSPAPER MODAL */}
      {showNewspaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-[#f4f1ea] text-black w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-sm relative shadow-2xl">
            <button onClick={() => setShowNewspaper(false)} className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-full"><X size={24} /></button>
            <div className="bg-[#e31219] p-4 text-center text-white font-serif text-2xl font-bold">The Investor Insight</div>
            <div className="p-8 font-serif">
              <h3 className="text-3xl font-bold text-center border-b-2 border-black pb-4 mb-6 uppercase">Nepal Weekly Edition</h3>
              <article className="mb-8">
                <h4 className="text-xl font-bold mb-2">Bullion Market Hits Resistance</h4>
                <p className="leading-relaxed text-gray-800">Gold prices remain at historic highs as investors seek safety amid global currency fluctuations. Local traders expect a steady demand through the marriage season despite high costs.</p>
              </article>
              <article>
                <h4 className="text-xl font-bold mb-2">Foreign Exchange Stability</h4>
                <p className="leading-relaxed text-gray-800">NRB reserves show improvement this month, primarily driven by strong remittance inflows which peaked in mid-January 2026.</p>
              </article>
              <div className="mt-10 pt-6 border-t border-black text-center text-xs text-gray-500 italic">© 2026 Investo Nepal - Financial Intelligence Unit</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BullionCard({ title, buy, sell, unit, color, purity }) {
  return (
    <div className={`bg-[#111112] border ${color} p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:bg-[#161618]`}>
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition">
        <TrendingUp size={48} />
      </div>
      
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-400 text-xs uppercase tracking-widest">{title}</h3>
        <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] font-mono text-yellow-500/80 uppercase">
          {purity} Pure
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-3xl font-black">Rs {sell.toLocaleString()}</p>
          <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">Selling Rate</p>
        </div>
        <div className="flex justify-between items-end border-t border-white/5 pt-4">
          <div>
            <p className="text-lg font-bold text-green-500">Rs {buy.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500 uppercase">Buying</p>
          </div>
          <span className="text-gray-600 text-[10px]">per {unit}</span>
        </div>
      </div>
    </div>
  );
}