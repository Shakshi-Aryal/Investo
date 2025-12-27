import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/darkCalendar.css"; // Dark theme
import AddReminder from "../components/AddReminder";

export default function ReminderCalendar() {
  const [date, setDate] = useState(new Date());
  const [reminders, setReminders] = useState([]);

  const selectedDate = date.toISOString().split("T")[0];

  // Fetch reminders for the user
  const fetchReminders = async () => {
    const res = await fetch("http://localhost:8000/api/reminders/", {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    });
    const data = await res.json();
    setReminders(data);
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  // Real-time browser notification
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM
      const today = now.toISOString().split("T")[0];

      reminders
        .filter(r => r.date === today && r.time === currentTime)
        .forEach(r => {
          if (Notification.permission === "granted") {
            new Notification(`Reminder: ${r.title}`, {
              body: r.description || "No description",
            });
          }
        });
    }, 10000); // check every 10 seconds for testing

    return () => clearInterval(interval);
  }, [reminders]);

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Filter reminders for the selected date
  const dayReminders = reminders.filter(r => r.date === selectedDate);

  // Delete reminder
  const handleDelete = async id => {
    await fetch(`http://localhost:8000/api/reminders/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    });
    fetchReminders();
  };

  return (
    <div className="min-h-screen bg-[#0F0505] text-white p-6">
      <h1 className="text-4xl font-bold text-[#D90A14] mb-6">Reminders</h1>

      {/* TOP SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* CALENDAR CARD */}
        <div className="bg-[#1A0B0B] p-4 rounded-xl shadow-lg">
          <Calendar onChange={setDate} value={date} />
        </div>

        {/* ADD REMINDER CARD */}
        <AddReminder selectedDate={selectedDate} onAdded={fetchReminders} />
      </div>

      {/* TASK LIST */}
      <div className="bg-[#1A0B0B] p-6 rounded-xl shadow-lg">
        <h2 className="text-xl mb-4">Tasks on {date.toDateString()}</h2>

        {dayReminders.length === 0 && (
          <p className="text-gray-400">No reminders for this day.</p>
        )}

        {dayReminders.map(r => (
          <div
            key={r.id}
            className="border-b border-red-800 py-3 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{r.title}</p>
              <p className="text-sm text-gray-400">{r.time}</p>
              {r.description && (
                <p className="text-sm text-gray-500">{r.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              {/* Edit button */}
              <EditReminder reminder={r} onUpdated={fetchReminders} />

              {/* Delete button */}
              <button
                onClick={() => handleDelete(r.id)}
                className="bg-red-700 hover:bg-red-900 text-white px-3 py-1 rounded"
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

// Inline component for editing reminders
function EditReminder({ reminder, onUpdated }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    title: reminder.title,
    description: reminder.description || "",
    time: reminder.time,
  });

  const submitEdit = async () => {
    const res = await fetch(
      `http://localhost:8000/api/reminders/${reminder.id}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (res.ok) {
      alert("Reminder updated");
      onUpdated();
      setOpen(false);
    } else {
      alert("Failed to update reminder");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-yellow-700 hover:bg-yellow-900 text-white px-3 py-1 rounded"
      >
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-[#1A0B0B] p-6 rounded-xl w-80">
            <h3 className="text-xl text-[#D90A14] mb-4">Edit Reminder</h3>
            <input
              className="w-full p-2 mb-3 rounded bg-[#0F0505] border border-gray-700 text-white"
              value={data.title}
              onChange={e => setData({ ...data, title: e.target.value })}
            />
            <textarea
              className="w-full p-2 mb-3 rounded bg-[#0F0505] border border-gray-700 text-white"
              value={data.description}
              onChange={e =>
                setData({ ...data, description: e.target.value })
              }
            />
            <input
              type="time"
              className="w-full p-2 mb-4 rounded bg-[#0F0505] border border-gray-700 text-white"
              value={data.time}
              onChange={e => setData({ ...data, time: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1 bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={submitEdit}
                className="px-3 py-1 bg-[#D90A14] rounded hover:bg-[#FF1A2B]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
