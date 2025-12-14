import React, { useState } from "react";

function ExpenseTracker() {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [description, setDescription] = useState("");
  const [history, setHistory] = useState([]);

  const addEntry = (e) => {
    e.preventDefault();

    if (!amount || !description) return;

    const entry = {
      id: Date.now(),
      amount: parseFloat(amount),
      type,
      description,
    };

    setHistory([entry, ...history]);

    setAmount("");
    setDescription("");
  };

  return (
    <div className="min-h-screen w-full bg-[#0F0505] text-white p-6">
      {/* Title */}
      <h1 className="text-3xl font-bold mb-6">Expense Tracker</h1>

      {/* Form */}
      <form
        onSubmit={addEntry}
        className="p-4 bg-[#1A0B0B] rounded-xl shadow-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 bg-[#0F0505] border border-gray-700 rounded-md text-white"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="p-2 bg-[#0F0505] border border-gray-700 rounded-md text-white"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-2 bg-[#0F0505] border border-gray-700 rounded-md text-white"
        />

        <button className="bg-[#D90A14] hover:bg-[#FF1A2B] p-2 rounded-md font-semibold">
          Add
        </button>
      </form>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-[#1A0B0B] rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-300">Income</h2>
          <p className="text-2xl font-bold text-green-400">
            Rs.{" "}
            {history
              .filter((h) => h.type === "income")
              .reduce((sum, h) => sum + h.amount, 0)}
          </p>
        </div>

        <div className="p-4 bg-[#1A0B0B] rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-300">Expense</h2>
          <p className="text-2xl font-bold text-red-400">
            Rs.{" "}
            {history
              .filter((h) => h.type === "expense")
              .reduce((sum, h) => sum + h.amount, 0)}
          </p>
        </div>

        <div className="p-4 bg-[#1A0B0B] rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-300">Balance</h2>
          <p className="text-2xl font-bold text-blue-400">
            Rs.{" "}
            {history.reduce(
              (sum, h) => sum + (h.type === "income" ? h.amount : -h.amount),
              0
            )}
          </p>
        </div>
      </div>

      {/* History */}
      <div className="p-4 bg-[#1A0B0B] rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">History</h2>

        {history.length === 0 ? (
          <p className="text-gray-400">No transactions yet.</p>
        ) : (
          history.map((h) => (
            <div
              key={h.id}
              className="flex justify-between p-2 border-b border-gray-700"
            >
              <span>{h.description}</span>
              <span
                className={
                  h.type === "income"
                    ? "text-green-400 font-bold"
                    : "text-red-400 font-bold"
                }
              >
                {h.type === "income" ? "+ " : "- "} Rs. {h.amount}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ExpenseTracker;
