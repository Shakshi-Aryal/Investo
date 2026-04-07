import { useState, useEffect } from "react";

export default function AddReminder({ selectedDate, onAdded }) {
  // --- THEME SYNC LOGIC ---
  const [isDarkMode, setIsDarkMode] = useState(() => 
    JSON.parse(localStorage.getItem("theme") || "true")
  );

  useEffect(() => {
    const handleSync = () => {
      const storedTheme = JSON.parse(localStorage.getItem("theme") || "true");
      setIsDarkMode(storedTheme);
    };
    window.addEventListener("storage", handleSync);
    return () => window.removeEventListener("storage", handleSync);
  }, []);

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const [data, setData] = useState({
    title: "",
    description: "",
    time: getCurrentTime(),
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
    /* REPLACED: Tailwind hex classes with style object using CSS variables.
       This ensures the card background, borders, and text follow the 'Investo' theme.
    */
    <div style={{
      background: 'var(--card-bg)',
      padding: '24px',
      borderRadius: '24px',
      border: '1px solid var(--card-border)',
      backdropFilter: 'blur(10px)',
      color: 'inherit'
    }}>
      <h2 style={{ 
        fontFamily: 'Syne', 
        fontSize: '20px', 
        marginBottom: '16px', 
        color: 'var(--accent)' 
      }}>Add Reminder</h2>

      <input
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '12px',
          borderRadius: '12px',
          background: 'var(--input-bg)',
          border: '1px solid var(--card-border)',
          color: 'inherit',
          outline: 'none'
        }}
        placeholder="Title"
        value={data.title}
        onChange={e => setData({ ...data, title: e.target.value })}
      />

      <textarea
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '12px',
          borderRadius: '12px',
          background: 'var(--input-bg)',
          border: '1px solid var(--card-border)',
          color: 'inherit',
          minHeight: '80px',
          outline: 'none'
        }}
        placeholder="Description"
        value={data.description}
        onChange={e => setData({ ...data, description: e.target.value })}
      />

      <input
        type="time"
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '20px',
          borderRadius: '12px',
          background: 'var(--input-bg)',
          border: '1px solid var(--card-border)',
          color: 'inherit',
          outline: 'none'
        }}
        value={data.time}
        onChange={e => setData({ ...data, time: e.target.value })}
      />

      <button
        onClick={submit}
        style={{
          width: '100%',
          background: 'var(--accent)',
          color: 'white',
          padding: '12px',
          borderRadius: '12px',
          fontWeight: '700',
          cursor: 'pointer',
          border: 'none',
          fontFamily: 'Syne',
          transition: '0.3s opacity'
        }}
        onMouseOver={(e) => e.target.style.opacity = '0.9'}
        onMouseOut={(e) => e.target.style.opacity = '1'}
      >
        Save Reminder
      </button>
    </div>
  );
}