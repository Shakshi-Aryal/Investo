import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

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
  ];

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-[#0F0505] text-white p-6">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
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
    </div>
  );
}

export default Dashboard;
