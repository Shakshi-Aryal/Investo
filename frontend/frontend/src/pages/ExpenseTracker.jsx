import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api/expenses/";

function ExpenseTracker() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [description, setDescription] = useState("");
  const [history, setHistory] = useState([]);

  // ✅ Match the key used in Login.jsx
  const token = localStorage.getItem("access");

  // Redirect if not logged in
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  /* ---------------- FETCH FROM BACKEND ---------------- */
  const fetchExpenses = async () => {
    if (!token) return;

    try {
      const res = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.log("Offline: loading local data");
      loadLocalExpenses();
    }
  };

  /* ---------------- LOCAL STORAGE ---------------- */
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

  /* ---------------- SYNC WHEN ONLINE ---------------- */
  const syncOfflineExpenses = async () => {
    const local = JSON.parse(localStorage.getItem("offlineExpenses")) || [];
    if (!token || local.length === 0) return;

    for (let exp of local) {
      await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: exp.amount,
          type: exp.type,
          description: exp.description,
        }),
      });
    }

    localStorage.removeItem("offlineExpenses");
    fetchExpenses();
  };

  /* ---------------- ADD ENTRY ---------------- */
  const addEntry = async (e) => {
    e.preventDefault();
    if (!amount || !description) return;

    const expense = {
      id: Date.now(),
      amount: parseFloat(amount),
      type,
      description,
    };

    if (navigator.onLine && token) {
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(expense),
        });

        if (res.ok) fetchExpenses();
        else saveLocalExpense(expense);
      } catch {
        saveLocalExpense(expense);
      }
    } else {
      saveLocalExpense(expense);
    }

    setAmount("");
    setDescription("");
  };

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    fetchExpenses();
    syncOfflineExpenses();
    window.addEventListener("online", syncOfflineExpenses);
    return () => window.removeEventListener("online", syncOfflineExpenses);
  }, []);

  /* ---------------- CALCULATIONS ---------------- */
  const income = history
    .filter((h) => h.type === "income")
    .reduce((sum, h) => sum + h.amount, 0);

  const expense = history
    .filter((h) => h.type === "expense")
    .reduce((sum, h) => sum + h.amount, 0);

  const balance = income - expense;

  return (
    <div className="min-h-screen w-full bg-[#0F0505] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Expense Tracker</h1>

      {/* FORM */}
      <form
        onSubmit={addEntry}
        className="p-4 bg-[#1A0B0B] rounded-xl shadow-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
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
        </select>

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-2 bg-[#0F0505] border border-gray-700 rounded-md"
        />

        <button className="bg-[#D90A14] hover:bg-[#FF1A2B] p-2 rounded-md font-semibold">
          Add
        </button>
      </form>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-[#1A0B0B] rounded-xl">
          <h2>Income</h2>
          <p className="text-green-400 text-xl">Rs. {income}</p>
        </div>
        <div className="p-4 bg-[#1A0B0B] rounded-xl">
          <h2>Expense</h2>
          <p className="text-red-400 text-xl">Rs. {expense}</p>
        </div>
        <div className="p-4 bg-[#1A0B0B] rounded-xl">
          <h2>Balance</h2>
          <p className="text-blue-400 text-xl">Rs. {balance}</p>
        </div>
      </div>

      {/* HISTORY */}
      <div className="p-4 bg-[#1A0B0B] rounded-xl">
        <h2 className="text-xl mb-4">History</h2>

        {history.length === 0 ? (
          <p className="text-gray-400">No transactions yet.</p>
        ) : (
          history.map((h) => (
            <div
              key={h.id}
              className="flex justify-between border-b border-gray-700 p-2"
            >
              <span>{h.description}</span>
              <span
                className={
                  h.type === "income" ? "text-green-400" : "text-red-400"
                }
              >
                {h.type === "income" ? "+" : "-"} Rs. {h.amount}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ExpenseTracker;
