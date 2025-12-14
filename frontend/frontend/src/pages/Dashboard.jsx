import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlossaryWidget from "../components/GlossaryWidget";

function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const cards = [
    {
      title: "Profile",
      description: "View and edit your profile information",
      onClick: () => navigate("/profile"),
    },
    {
      title: "Glossary",
      description: "Check out the investment glossary",
      onClick: () => navigate("/glossary"),
    },
    {
      title: "Stock Charts",
      description: "View Nepse stock candlestick charts",
      onClick: () => navigate("/stock-charts"),
    },

    // ⭐ NEW CARD ADDED — EXPENSE TRACKER
    {
      title: "Expense Tracker",
      description: "Track your daily income and expenses",
      onClick: () => navigate("/expense-tracker"),
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    alert(`Searching for: ${searchQuery}`);
  };

  return (
    <div className="min-h-screen w-full bg-[#0F0505] text-white p-6 relative">
      {/* ---------------- Top Bar ---------------- */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="bg-[#D90A14] hover:bg-[#FF1A2B] p-2 rounded-md font-semibold"
        >
          Back
        </button>

        <form onSubmit={handleSearch} className="flex flex-1 mx-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-2 rounded-l-md bg-[#1A0B0B] border border-gray-700 text-white"
          />
          <button
            type="submit"
            className="bg-[#D90A14] hover:bg-[#FF1A2B] p-2 rounded-r-md"
          >
            Search
          </button>
        </form>

        <div
          onClick={() => navigate("/profile")}
          className="w-12 h-12 rounded-full overflow-hidden cursor-pointer border-2 border-gray-600"
        >
          <img
            src="https://i.pravatar.cc/300"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* ---------------- Dashboard Cards ---------------- */}
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {cards.map((card) => (
          <div
            key={card.title}
            onClick={card.onClick}
            className="cursor-pointer p-6 rounded-xl shadow-lg bg-[#1A0B0B] hover:bg-[#D90A14] transition-all duration-200"
          >
            <h2 className="text-2xl font-semibold mb-2">{card.title}</h2>
            <p className="text-gray-300">{card.description}</p>
          </div>
        ))}
      </div>

      {/* ---------------- Glossary Widget ---------------- */}
      <GlossaryWidget />
    </div>
  );
}

export default Dashboard;
