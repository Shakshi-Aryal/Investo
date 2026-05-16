import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { useNotifications } from "../context/NotificationContext";

export default function Settings() {
  const navigate = useNavigate();
  const { unreadCount, setUnreadCount } = useNotifications();
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem("notifications_enabled") === "true"
  );

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    setUnreadCount(0);
    navigate("/login");
  };

  const toggleNotifications = () => {
    const newVal = !notificationsEnabled;
    setNotificationsEnabled(newVal);
    localStorage.setItem("notifications_enabled", newVal);
  };

  const goToProfile = () => {
    navigate("/profile");
  };

  useEffect(() => {
    // Ensure preference is stored on mount
    if (localStorage.getItem("notifications_enabled") === null) {
      localStorage.setItem("notifications_enabled", notificationsEnabled);
    }
  }, []);

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 800 }}>
        Platform Settings
      </h1>
      <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <button
          onClick={goToProfile}
          style={{
            padding: "12px 20px",
            borderRadius: "12px",
            background: "var(--accent)",
            color: "white",
            border: "none",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          👤 My Profile
        </button>
        <ThemeToggle />
        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={toggleNotifications}
          />
          Enable In‑App Notifications
        </label>
        <button
          onClick={handleLogout}
          style={{
            padding: "12px 20px",
            borderRadius: "12px",
            background: "var(--danger-color)",
            color: "white",
            border: "none",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
