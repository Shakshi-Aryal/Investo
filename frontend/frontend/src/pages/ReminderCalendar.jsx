import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import AddReminder from "../components/AddReminder";
import Darklogo from "../assets/Darklogo.png";
import Lightlogo from "../assets/Lightlogo.png";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');

  .feat-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    padding: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ── DYNAMIC THEMES ── */
  .mode-dark {
    background: radial-gradient(circle at top right, #1a0508, #080306);
    color: #ffffff;
    --accent: #D90A14;
    --accent-glow: rgba(217, 10, 20, 0.15);
    --card-bg: rgba(255, 255, 255, 0.03);
    --card-border: rgba(217, 10, 20, 0.1);
    --input-bg: rgba(255, 255, 255, 0.05);
    --text-muted: #9a7a7c;
  }

  .mode-light {
    background: radial-gradient(circle at top right, #fff5e6, #faf8f3);
    color: #1a1208;
    --accent: #BA7517;
    --accent-glow: rgba(186, 117, 23, 0.1);
    --card-bg: rgba(255, 255, 255, 0.7);
    --card-border: rgba(186, 117, 23, 0.15);
    --input-bg: #ffffff;
    --text-muted: #8a6a3a;
  }

  /* ── GLOBAL INPUT FIXES ── */
  /* Target specific inputs to ensure placeholders show */
  .feat-root input::placeholder, 
  .feat-root textarea::placeholder { 
    color: var(--text-muted) !important; 
    opacity: 0.6 !important; 
  }
  
  .feat-root input, .feat-root textarea { 
    color: inherit !important; 
    font-family: 'DM Sans', sans-serif;
  }

  /* ── NAVIGATION & UI ── */
  .dash-header {
    width: 100%; max-width: 1200px; display: flex; justify-content: space-between;
    align-items: center; margin-bottom: 30px; backdrop-filter: blur(10px);
    padding: 16px 24px; border-radius: 24px; background: var(--card-bg);
    border: 1px solid var(--card-border); z-index: 1001;
  }

  .dash-btn-circle {
    width: 42px; height: 42px; border-radius: 12px; background: var(--input-bg);
    border: 1px solid var(--card-border); cursor: pointer; display: flex;
    align-items: center; justify-content: center; transition: 0.2s; color: inherit;
  }
  .dash-btn-circle:hover { background: var(--accent); color: white; border-color: var(--accent); }

  .nav-trigger {
    width: 42px; height: 42px; border-radius: 12px; background: var(--input-bg);
    border: 1px solid var(--card-border); cursor: pointer;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  }
  .bar { width: 18px; height: 2px; background: var(--accent); border-radius: 2px; transition: 0.3s; }

  .side-drawer {
    position: fixed; top: 0; left: -320px; width: 300px; height: 100vh;
    background: var(--card-bg); backdrop-filter: blur(25px);
    border-right: 1px solid var(--card-border); z-index: 1000;
    transition: left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
    padding: 100px 24px 40px; display: flex; flex-direction: column; gap: 12px;
  }
  .side-drawer.open { left: 0; box-shadow: 20px 0 60px rgba(0,0,0,0.2); }

  .nav-item {
    padding: 14px 20px; border-radius: 14px; color: var(--text-muted);
    font-weight: 600; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; gap: 12px; font-family: 'Syne', sans-serif;
  }
  .nav-item:hover, .nav-item.active { background: var(--accent-glow); color: var(--accent); transform: translateX(5px); }

  .reminders-grid {
    width: 100%; max-width: 1200px; display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 24px;
  }

  .glass-card {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 24px; padding: 24px; backdrop-filter: blur(10px);
    height: fit-content;
    transition: background 0.3s ease;
  }

  /* ── CALENDAR SYNC FIXES ── */
  .react-calendar { 
    border: none !important; 
    background: transparent !important; 
    width: 100% !important; 
    color: inherit !important; 
    font-family: 'DM Sans', sans-serif;
  }

  .react-calendar__navigation button { 
    color: inherit !important; 
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 16px;
    border-radius: 8px;
    background: none;
  }

  .react-calendar__navigation button:enabled:hover {
    background-color: var(--accent-glow) !important;
  }

  .react-calendar__month-view__weekdays {
    color: var(--accent) !important;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 12px;
    margin-bottom: 8px;
  }

  .react-calendar__month-view__weekdays__weekday abbr {
    text-decoration: none !important;
  }

  .react-calendar__tile { 
    color: inherit !important; 
    border-radius: 10px; 
    padding: 12px 0 !important;
    transition: 0.2s;
  }

  .react-calendar__tile:enabled:hover {
    background: var(--accent-glow) !important;
    color: var(--accent) !important;
  }

  /* Selected Day */
  .react-calendar__tile--active { 
    background: var(--accent) !important; 
    color: white !important; 
  }

  /* TODAY FIX: Use accent-glow background to prevent white-on-white text */
  .react-calendar__tile--now {
    background: var(--accent-glow) !important;
    border: 1px solid var(--accent) !important;
    color: var(--accent) !important;
    font-weight: 700;
  }

  .react-calendar__month-view__days__day--neighboringMonth {
    color: var(--text-muted) !important;
    opacity: 0.4;
  }

  .task-item {
    padding: 16px; background: var(--input-bg); border-radius: 16px;
    margin-bottom: 12px; border: 1px solid var(--card-border);
    display: flex; justify-content: space-between; align-items: center;
  }

  .btn-action {
    padding: 6px 14px; border-radius: 10px; font-size: 12px; font-weight: 700;
    cursor: pointer; transition: 0.2s; border: none; font-family: 'Syne', sans-serif;
  }
  .btn-delete { background: rgba(217, 10, 20, 0.1); color: #ef4444; }
  .btn-delete:hover { background: #ef4444; color: white; }
  .btn-edit { background: var(--accent-glow); color: var(--accent); margin-right: 8px; }
`;

export default function ReminderCalendar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isDarkMode, setIsDarkMode] = useState(() => JSON.parse(localStorage.getItem("theme") || "true"));
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [reminders, setReminders] = useState([]);

  const selectedDate = date.toISOString().split("T")[0];

  useEffect(() => {
    const handleStorageChange = () => {
      const storedTheme = JSON.parse(localStorage.getItem("theme") || "true");
      setIsDarkMode(storedTheme);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("theme", JSON.stringify(newMode));
    window.dispatchEvent(new Event("storage"));
  };

  const fetchReminders = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/reminders/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      });
      const data = await res.json();
      setReminders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  useEffect(() => { fetchReminders(); }, []);

  const handleDelete = async id => {
    await fetch(`http://localhost:8000/api/reminders/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    });
    fetchReminders();
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "My Profile", path: "/profile", icon: "👤" },
    { name: "Stock Charts", path: "/stock-charts", icon: "📈" },
    { name: "Wealth Tracker", path: "/expense-tracker", icon: "💰" },
    { name: "Knowledge", path: "/glossary", icon: "📖" },
    { name: "Reminders", path: "/reminders", icon: "⏰" },
  ];

  const dayReminders = reminders.filter(r => r.date === selectedDate);

  return (
    <div className={`feat-root ${isDarkMode ? "mode-dark" : "mode-light"}`}>
      <style>{css}</style>
      <header className="dash-header">
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="nav-trigger" onClick={() => setIsNavOpen(!isNavOpen)}>
            <div className="bar" /><div className="bar" /><div className="bar" />
          </button>
          <button className="dash-btn-circle" onClick={() => navigate(-1)}>←</button>
        </div>
        <img src={isDarkMode ? Darklogo : Lightlogo} alt="Investo" style={{ height: '24px' }} />
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="dash-btn-circle" onClick={toggleTheme}>
            {isDarkMode ? "☀️" : "🌙"}
          </button>
          <img src="https://i.pravatar.cc/150?u=investo" style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid var(--card-border)' }} alt="User" />
        </div>
      </header>

      <div className={`side-drawer ${isNavOpen ? 'open' : ''}`}>
        <h2 style={{ fontFamily: 'Syne', padding: '0 20px 30px', fontSize: '28px' }}>Investo<span>.</span></h2>
        {navItems.map(item => (
          <div key={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
            {item.icon} {item.name}
          </div>
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: '1200px', marginBottom: '24px' }}>
         <h1 style={{ fontFamily: 'Syne', fontSize: '32px' }}>Schedule <span style={{color: 'var(--accent)'}}>Reminders</span></h1>
      </div>

      <div className="reminders-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card"><Calendar onChange={setDate} value={date} /></div>
          <div className="glass-card"><AddReminder selectedDate={selectedDate} onAdded={fetchReminders} /></div>
        </div>
        <div className="glass-card">
          <h2 style={{ fontFamily: 'Syne', fontSize: '20px', marginBottom: '20px' }}>
            Tasks for <span style={{color:'var(--accent)'}}>{date.toDateString()}</span>
          </h2>
          {dayReminders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic' }}>No reminders scheduled.</p>
          ) : (
            dayReminders.map(r => (
              <div key={r.id} className="task-item">
                <div>
                  <p style={{ fontWeight: '700', fontSize: '15px' }}>{r.title}</p>
                  <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '600' }}>{r.time}</p>
                  {r.description && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{r.description}</p>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <EditReminder reminder={r} onUpdated={fetchReminders} />
                  <button onClick={() => handleDelete(r.id)} className="btn-action btn-delete">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function EditReminder({ reminder, onUpdated }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ title: reminder.title, description: reminder.description || "", time: reminder.time });

  const submitEdit = async () => {
    const res = await fetch(`http://localhost:8000/api/reminders/${reminder.id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      body: JSON.stringify(data),
    });
    if (res.ok) { onUpdated(); setOpen(false); }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-action btn-edit">Edit</button>
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <h3 style={{ fontFamily: 'Syne', color: 'var(--accent)', marginBottom: '20px' }}>Update Task</h3>
            <input
              style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'inherit', outline: 'none' }}
              value={data.title} placeholder="Title"
              onChange={e => setData({ ...data, title: e.target.value })}
            />
            <textarea
              style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'inherit', outline: 'none', minHeight: '80px' }}
              value={data.description} placeholder="Description"
              onChange={e => setData({ ...data, description: e.target.value })}
            />
            <input
              type="time"
              style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'inherit', outline: 'none' }}
              value={data.time}
              onChange={e => setData({ ...data, time: e.target.value })}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setOpen(false)} style={{ background: 'none', color: 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>Cancel</button>
              <button onClick={submitEdit} style={{ background: 'var(--accent)', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}