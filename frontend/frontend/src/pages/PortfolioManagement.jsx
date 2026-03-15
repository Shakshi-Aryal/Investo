import React, { useState, useEffect } from "react";
import { Pie, Bar } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, ArcElement, BarElement, Tooltip, Legend);

const API_URL = "http://127.0.0.1:8000/api/portfolio/";
const TOKEN_KEY = "jwt";

function PortfolioManagement() {

  const token = localStorage.getItem(TOKEN_KEY);

  const [investmentName, setInvestmentName] = useState("");
  const [capital, setCapital] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [timePeriod, setTimePeriod] = useState("");

  const [portfolio, setPortfolio] = useState([]);
  const [showCharts, setShowCharts] = useState(false);

  // ---------------- FETCH ----------------
  const fetchPortfolio = async () => {

    try {

      const res = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Unauthorized or API error:", res.status);
        return;
      }

      const data = await res.json();
      setPortfolio(data);

    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    if (token) fetchPortfolio();
  }, [token]);

  // ---------------- ADD ----------------
  const addPortfolio = async (e) => {

    e.preventDefault();

    try {

      const item = {
        investment_name: investmentName,
        total_capital: parseFloat(capital),
        investment_amount: parseFloat(investmentAmount),
        estimated_return_per_year: 10,
        time_period: parseInt(timePeriod),
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });

      if (!res.ok) {
        console.error("Add failed");
        return;
      }

      setInvestmentName("");
      setCapital("");
      setInvestmentAmount("");
      setTimePeriod("");

      fetchPortfolio();

    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- DELETE ----------------
  const deletePortfolio = async (id) => {

    if (!window.confirm("Delete this investment?")) return;

    try {

      await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchPortfolio();

    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- CALCULATIONS ----------------

  const totalCapital = portfolio.reduce((sum, p) => sum + p.total_capital, 0);

  const totalInvestment = portfolio.reduce(
    (sum, p) => sum + p.investment_amount,
    0
  );

  const avgROI =
    portfolio.length > 0
      ? portfolio.reduce((sum, p) => sum + p.roi, 0) / portfolio.length
      : 0;

  // ---------------- CHART DATA ----------------

  const roiData = {
    labels: portfolio.map((p) => p.investment_name),
    datasets: [
      {
        label: "ROI %",
        data: portfolio.map((p) => p.roi),
        backgroundColor: "#3B82F6",
      },
    ],
  };

  const capitalPie = {
    labels: portfolio.map((p) => p.investment_name),
    datasets: [
      {
        data: portfolio.map((p) => p.total_capital),
        backgroundColor: [
          "#EF4444",
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#EC4899",
        ],
      },
    ],
  };

  // ---------------- PDF REPORT ----------------

  const generatePDF = () => {

    const doc = new jsPDF();

    doc.text("Portfolio Report", 14, 20);
    doc.text(`Total Capital: ${totalCapital}`, 14, 30);
    doc.text(`Total Investment Value: ${totalInvestment}`, 14, 40);
    doc.text(`Average ROI: ${avgROI.toFixed(2)}%`, 14, 50);

    autoTable(doc, {
      startY: 60,
      head: [["Investment", "Capital", "Value", "Time", "ROI %"]],
      body: portfolio.map((p) => [
        p.investment_name,
        p.total_capital,
        p.investment_amount,
        p.time_period,
        p.roi,
      ]),
    });

    doc.save("PortfolioReport.pdf");
  };

  return (
    <div className="min-h-screen w-full bg-[#0F0505] text-white p-6">

      <h1 className="text-3xl font-bold mb-6">Portfolio Management</h1>

      {/* FORM */}

      <form
        onSubmit={addPortfolio}
        className="p-4 bg-[#1A0B0B] rounded-xl mb-6 grid md:grid-cols-5 gap-4"
      >

        <input
          type="text"
          placeholder="Investment Name"
          value={investmentName}
          onChange={(e) => setInvestmentName(e.target.value)}
          className="p-2 bg-[#0F0505] border border-gray-700 rounded"
        />

        <input
          type="number"
          placeholder="Capital"
          value={capital}
          onChange={(e) => setCapital(e.target.value)}
          className="p-2 bg-[#0F0505] border border-gray-700 rounded"
        />

        <input
          type="number"
          placeholder="Value"
          value={investmentAmount}
          onChange={(e) => setInvestmentAmount(e.target.value)}
          className="p-2 bg-[#0F0505] border border-gray-700 rounded"
        />

        <input
          type="number"
          placeholder="Time Period (years)"
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="p-2 bg-[#0F0505] border border-gray-700 rounded"
        />

        <button className="bg-red-600 hover:bg-red-700 rounded p-2">
          Add
        </button>

      </form>

      {/* SUMMARY */}

      <div className="grid md:grid-cols-3 gap-4 mb-6">

        <div className="p-4 bg-[#1A0B0B] rounded-xl">
          <h2>Total Capital</h2>
          <p className="text-blue-400 text-xl">{totalCapital}</p>
        </div>

        <div className="p-4 bg-[#1A0B0B] rounded-xl">
          <h2>Total Value</h2>
          <p className="text-green-400 text-xl">{totalInvestment}</p>
        </div>

        <div className="p-4 bg-[#1A0B0B] rounded-xl">
          <h2>Average ROI</h2>
          <p className="text-yellow-400 text-xl">{avgROI.toFixed(2)}%</p>
        </div>

      </div>

      {/* BUTTONS */}

      <div className="flex gap-4 mb-6">

        <button
          onClick={() => setShowCharts(true)}
          className="bg-blue-600 p-2 rounded"
        >
          View Analytics
        </button>

        <button
          onClick={generatePDF}
          className="bg-green-600 p-2 rounded"
        >
          Generate Report
        </button>

      </div>

      {/* CHARTS */}

      {showCharts && (

        <div className="grid md:grid-cols-2 gap-6 mb-8">

          <div className="bg-[#1A0B0B] p-4 rounded">
            <Bar data={roiData} />
          </div>

          <div className="bg-[#1A0B0B] p-4 rounded">
            <Pie data={capitalPie} />
          </div>

        </div>

      )}

      {/* LIST */}

      <div className="p-4 bg-[#1A0B0B] rounded-xl">

        {portfolio.map((p) => (

          <div
            key={p.id}
            className="flex justify-between border-b border-gray-700 p-2"
          >

            <div>
              <p>{p.investment_name}</p>
              <p className="text-gray-400 text-sm">
                Capital {p.total_capital} | Value {p.investment_amount}
              </p>
            </div>

            <div className="flex gap-4">

              <span>{p.roi?.toFixed(2)}%</span>

              <button
                onClick={() => deletePortfolio(p.id)}
                className="bg-red-600 px-2 rounded"
              >
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default PortfolioManagement;