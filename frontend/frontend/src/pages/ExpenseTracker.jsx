import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// IMPORTANT: Import Bar and Line here
import { Pie, Bar, Line } from "react-chartjs-2"; 
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,   // Required for Bar Chart
  PointElement, // Required for Line Chart
  LineElement,  // Required for Line Chart
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register all components to avoid the "react-dom" error
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  ArcElement, 
  BarElement, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend
);

const API_URL = "http://127.0.0.1:8000/api/expenses/";

function ExpenseTracker() {
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("misc");
  const [description, setDescription] = useState("");
  const [history, setHistory] = useState([]);
  const [showCharts, setShowCharts] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);

  const token = localStorage.getItem("jwt");

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // ---------------- RESET CATEGORY ON TYPE CHANGE ----------------
  useEffect(() => {
    if (type === "expense") setCategory("misc");
    else if (type === "income") setCategory("salary");
    else if (type === "saving") setCategory("other");
  }, [type]);

  // ---------------- FETCH EXPENSES ----------------
  const fetchExpenses = async () => {
    if (!token) return;
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        // Sort by newest first
        setHistory(data.reverse()); 
      } else if (res.status === 401) {
        localStorage.removeItem("jwt");
        navigate("/login");
      }
    } catch {
      loadLocalExpenses();
    }
  };

  // ---------------- LOCAL STORAGE & SYNC ----------------
  const saveLocalExpense = (expense) => {
    const local = JSON.parse(localStorage.getItem("offlineExpenses")) || [];
    local.push(expense);
    localStorage.setItem("offlineExpenses", JSON.stringify(local));
    setHistory((prev) => [expense, ...prev]);
  };

  const loadLocalExpenses = () => {
    const local = JSON.parse(localStorage.getItem("offlineExpenses")) || [];
    setHistory(local);
  };

  const syncOfflineExpenses = async () => {
    const local = JSON.parse(localStorage.getItem("offlineExpenses")) || [];
    if (!token || local.length === 0) return;

    for (let exp of local) {
      try {
        const payload = { ...exp };
        delete payload.tempId;
        await fetch(API_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error("Sync failed", err);
      }
    }
    localStorage.removeItem("offlineExpenses");
    fetchExpenses();
  };

  // ---------------- ADD ENTRY ----------------
  const addEntry = async (e) => {
    e.preventDefault();
    if (!amount || !description) {
      alert("Please fill in Amount and Description");
      return;
    }

    const expense = {
      amount: parseFloat(amount),
      type,
      category,
      description,
    };

    if (!navigator.onLine) {
      expense.tempId = Date.now();
      saveLocalExpense(expense);
      resetForm();
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(expense),
      });

      if (res.ok) fetchExpenses();
      else {
        const err = await res.json();
        console.error("Server Error:", err);
        alert("Failed to save. Check inputs.");
      }
    } catch {
      expense.tempId = Date.now();
      saveLocalExpense(expense);
    }
    resetForm();
  };

  const resetForm = () => {
    setAmount("");
    setDescription("");
  };

  // ---------------- DELETE ENTRY ----------------
  const deleteEntry = async (h) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    if (navigator.onLine && token && h.id) {
      try {
        await fetch(`${API_URL}${h.id}/`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        setHistory((prev) => prev.filter((item) => item.id !== h.id));
      } catch {}
    } else if (h.tempId) {
      const local = JSON.parse(localStorage.getItem("offlineExpenses")) || [];
      localStorage.setItem("offlineExpenses", JSON.stringify(local.filter((e) => e.tempId !== h.tempId)));
      setHistory((prev) => prev.filter((item) => item.tempId !== h.tempId));
    }
  };

  useEffect(() => {
    fetchExpenses();
    syncOfflineExpenses();
    window.addEventListener("online", syncOfflineExpenses);
    return () => window.removeEventListener("online", syncOfflineExpenses);
  }, []);

  // ---------------- CALCULATIONS ----------------
  const income = history.filter((h) => h.type === "income").reduce((sum, h) => sum + h.amount, 0);
  const totalExpense = history.filter((h) => h.type === "expense").reduce((sum, h) => sum + h.amount, 0);
  const totalSavings = history.filter((h) => h.type === "saving").reduce((sum, h) => sum + h.amount, 0);
  const balance = income - totalExpense - totalSavings;

  // ---------------- CHART DATA ----------------
  const categoryColors = {
    food: "#F87171", clothing: "#60A5FA", emi: "#FBBF24", misc: "#34D399",
    salary: "#6366F1", other: "#F472B6",
  };

  // 1. PIE CHART
  const categoryData = {
    labels: ["Income", "Expenses", "Savings"],
    datasets: [{
      label: "Amount",
      data: [income, totalExpense, totalSavings],
      backgroundColor: [categoryColors.salary, categoryColors.misc, categoryColors.other],
      borderColor: "#1A0B0B",
      borderWidth: 2,
    }],
  };

  // 2. BAR CHART (Overview)
  const barData = {
    labels: ["Income", "Expenses", "Savings"],
    datasets: [{
      label: "Financial Overview",
      data: [income, totalExpense, totalSavings],
      backgroundColor: ["#10B981", "#EF4444", "#EC4899"], 
      borderRadius: 5,
    }],
  };
  
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { color: 'white' }, grid: { color: '#333' } },
      x: { ticks: { color: 'white' }, grid: { display: false } }
    }
  };

  // 3. LINE CHART (Trend)
  const chronologicalHistory = [...history].reverse();
  let runningBalance = 0;
  const balanceTrend = chronologicalHistory.map((h) => {
    if (h.type === "income") runningBalance += h.amount;
    else runningBalance -= h.amount;
    return runningBalance;
  });

  const lineData = {
    labels: chronologicalHistory.map((_, i) => i + 1),
    datasets: [{
      label: "Balance Trend",
      data: balanceTrend,
      borderColor: "#3B82F6",
      backgroundColor: "rgba(59, 130, 246, 0.2)",
      tension: 0.3,
      fill: true,
    }],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { color: 'white' }, grid: { color: '#333' } },
      x: { display: false } 
    }
  };

  // 4. CATEGORY PIE
  const expenseByCategory = history
    .filter((h) => h.type === "expense")
    .reduce((acc, h) => {
      acc[h.category] = (acc[h.category] || 0) + h.amount;
      return acc;
    }, {});

  const expenseCategoryData = {
    labels: Object.keys(expenseByCategory),
    datasets: [{
      label: "Expenses by Category",
      data: Object.values(expenseByCategory),
      backgroundColor: Object.keys(expenseByCategory).map((c) => categoryColors[c] || "#9CA3AF"),
      borderColor: "#1A0B0B",
    }],
  };

  // ---------------- PDF REPORT ----------------
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Expense Report", 14, 20);
    doc.text(`Income: Rs. ${income}`, 14, 28);
    doc.text(`Expense: Rs. ${totalExpense}`, 14, 36);
    doc.text(`Savings: Rs. ${totalSavings}`, 14, 44);
    doc.text(`Balance: Rs. ${balance}`, 14, 52);

    autoTable(doc, {
      head: [["Type", "Description", "Category", "Amount"]],
      body: history.map((h) => [
        h.type.charAt(0).toUpperCase() + h.type.slice(1),
        h.description,
        h.category,
        h.amount,
      ]),
      startY: 60,
    });

    doc.save("ExpenseReport.pdf");
    setShowReportConfirm(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#0F0505] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Expense Tracker</h1>

      {/* FORM */}
      <form onSubmit={addEntry} className="p-4 bg-[#1A0B0B] rounded-xl shadow-lg mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input 
          type="number" 
          placeholder="Amount" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 bg-[#0F0505] border border-gray-700 rounded-md"
        />
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value)}
          className="p-2 bg-[#0F0505] border border-gray-700 rounded-md"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
          <option value="saving">Saving</option>
        </select>

        {type === "expense" && (
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 bg-[#0F0505] border border-gray-700 rounded-md"
          >
            <option value="food">Food</option>
            <option value="clothing">Clothing</option>
            <option value="emi">EMI</option>
            <option value="misc">Miscellaneous</option>
          </select>
        )}

        <input 
          type="text" 
          placeholder="Description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          className="p-2 bg-[#0F0505] border border-gray-700 rounded-md"
        />
        <button className="bg-[#D90A14] hover:bg-[#FF1A2B] p-2 rounded-md font-semibold col-span-1 md:col-span-1">Add</button>
      </form>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-[#1A0B0B] rounded-xl"><h2>Income</h2><p className="text-green-400 text-xl">Rs. {income}</p></div>
        <div className="p-4 bg-[#1A0B0B] rounded-xl"><h2>Expense</h2><p className="text-red-400 text-xl">Rs. {totalExpense}</p></div>
        <div className="p-4 bg-[#1A0B0B] rounded-xl"><h2>Savings</h2><p className="text-pink-400 text-xl">Rs. {totalSavings}</p></div>
        <div className="p-4 bg-[#1A0B0B] rounded-xl"><h2>Balance</h2><p className="text-blue-400 text-xl">Rs. {balance}</p></div>
      </div>

      {/* CHART & REPORT BUTTONS */}
      <div className="flex gap-4 mb-8">
        <button onClick={() => setShowCharts(true)} className="bg-blue-600 hover:bg-blue-700 p-2 rounded-md font-semibold">View Analytics</button>
        <button onClick={() => setShowReportConfirm(true)} className="bg-green-600 hover:bg-green-700 p-2 rounded-md font-semibold">Generate Report</button>
      </div>

      {/* CHARTS CONTAINER */}
      {showCharts && (
        <div className="p-6 bg-[#1A0B0B] rounded-xl mb-8 shadow-lg relative">
          <button onClick={() => setShowCharts(false)} className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm">Close</button>
          <h2 className="text-xl mb-6">Financial Analytics</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* PIE 1 */}
            <div className="bg-[#0F0505] p-4 rounded-xl flex flex-col items-center">
              <h3 className="mb-2 text-gray-300">Overview</h3>
              <div className="h-64 w-full flex justify-center"><Pie data={categoryData} /></div>
            </div>

            {/* BAR CHART */}
            <div className="bg-[#0F0505] p-4 rounded-xl flex flex-col items-center">
              <h3 className="mb-2 text-gray-300">Comparison</h3>
              <div className="h-64 w-full"><Bar data={barData} options={barOptions} /></div>
            </div>

             {/* LINE CHART */}
             <div className="bg-[#0F0505] p-4 rounded-xl flex flex-col items-center md:col-span-2">
              <h3 className="mb-2 text-gray-300">Balance Trend</h3>
              <div className="h-64 w-full"><Line data={lineData} options={lineOptions} /></div>
            </div>

            {/* PIE 2 */}
            <div className="bg-[#0F0505] p-4 rounded-xl flex flex-col items-center md:col-span-2">
              <h3 className="mb-2 text-gray-300">Spending Breakdown</h3>
              <div className="h-64 w-full flex justify-center"><Pie data={expenseCategoryData} /></div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT CONFIRMATION */}
      {showReportConfirm && (
        <div className="p-4 bg-[#1A0B0B] rounded-xl mb-8 shadow-lg">
          <h2 className="text-xl mb-4">Generate Report</h2>
          <p className="mb-4">Are you sure you want to generate the PDF report?</p>
          <div className="flex gap-4">
            <button onClick={generatePDF} className="bg-green-600 hover:bg-green-700 p-2 rounded-md font-semibold">Yes, Generate</button>
            <button onClick={() => setShowReportConfirm(false)} className="bg-red-600 hover:bg-red-700 p-2 rounded-md font-semibold">Cancel</button>
          </div>
        </div>
      )}

      {/* HISTORY (Restored to your preferred UI) */}
      <div className="p-4 bg-[#1A0B0B] rounded-xl">
        <h2 className="text-xl mb-4">History</h2>
        {history.length === 0 ? (
          <p className="text-gray-400">No transactions yet.</p>
        ) : (
          history.map((h, index) => (
            <div key={h.id || h.tempId || index} className="flex justify-between items-center border-b border-gray-700 p-2">
              <div className="flex flex-col">
                <span className="font-semibold">{h.type.charAt(0).toUpperCase() + h.type.slice(1)}</span>
                <span className="text-sm text-gray-400">
                  {h.description} 
                  <span className="text-xs border border-gray-600 rounded px-1 ml-2">{h.category}</span>
                </span>
              </div>
              <div className="flex gap-4 items-center">
                <span className={h.type === "income" ? "text-green-400" : h.type === "saving" ? "text-pink-400" : "text-red-400"}>
                  {h.type === "income" || h.type === "saving" ? "+" : "-"} Rs. {h.amount}
                </span>
                <button onClick={() => deleteEntry(h)} className="bg-red-600 hover:bg-red-700 p-1 rounded-md text-sm">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ExpenseTracker;