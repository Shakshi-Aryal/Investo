import { useState } from "react";

export default function AddReminder({ selectedDate, onAdded }) {
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const [data, setData] = useState({
    title: "",
    description: "",
    time: getCurrentTime(), // default to current time
    email_notify: true,
  });

  const submit = async () => {
    if (!data.title.trim()) return alert("Title required");

    const res = await fetch("http://localhost:8000/api/reminders/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({ ...data, date: selectedDate }),
    });

    if (res.ok) {
      alert("Reminder added");
      setData({ title: "", description: "", time: getCurrentTime(), email_notify: true });
      if (onAdded) onAdded();
    } else {
      alert("Failed to add reminder");
    }
  };

  return (
    <div className="bg-[#1A0B0B] p-6 rounded-xl shadow-lg">
      <h2 className="text-xl mb-4 text-[#D90A14]">Add Reminder</h2>

      <input
        className="w-full p-2 mb-3 rounded bg-[#0F0505] border border-gray-700 text-white"
        placeholder="Title"
        value={data.title}
        onChange={e => setData({ ...data, title: e.target.value })}
      />

      <textarea
        className="w-full p-2 mb-3 rounded bg-[#0F0505] border border-gray-700 text-white"
        placeholder="Description"
        value={data.description}
        onChange={e => setData({ ...data, description: e.target.value })}
      />

      <input
        type="time"
        className="w-full p-2 mb-4 rounded bg-[#0F0505] border border-gray-700 text-white"
        value={data.time}
        onChange={e => setData({ ...data, time: e.target.value })}
      />

      <button
        onClick={submit}
        className="w-full bg-[#D90A14] hover:bg-[#FF1A2B] py-2 rounded font-semibold"
      >
        Save Reminder
      </button>
    </div>
  );
}
