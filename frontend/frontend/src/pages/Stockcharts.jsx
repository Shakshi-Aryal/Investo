import React from "react";

export default function Stockcharts() {
  return (
    <div className="min-h-screen bg-[#0F0505] text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">NEPSE Stock Charts</h1>
      <p className="mb-4 text-gray-300">
        For educational/demo purposes, this embeds NepseAlpha charts.
      </p>

      <div className="w-full max-w-6xl h-[700px]">
        <iframe
          src="https://nepsealpha.com/trading/chart"
          title="NepseAlpha Charts"
          className="w-full h-full rounded-lg shadow-lg border border-gray-700"
          sandbox="allow-scripts allow-same-origin allow-popups"
        ></iframe>
      </div>
    </div>
  );
}
