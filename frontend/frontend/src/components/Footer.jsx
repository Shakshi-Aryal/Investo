import React from "react";
import { Link } from "react-router-dom";
import { Shield, Lock, FileText } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{
      marginTop: "auto",
      padding: "48px 24px 24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      borderTop: "1px solid var(--divider)",
      background: "var(--bg-main)"
    }}>
      <div style={{
        display: "flex",
        gap: 32,
        marginBottom: 24,
        flexWrap: "wrap",
        justifyContent: "center"
      }}>
        <Link to="/about" style={{
          color: "var(--text-muted)", textDecoration: "none", fontSize: 14, fontWeight: 500,
          display: "flex", alignItems: "center", gap: 8, transition: "color 0.2s"
        }} onMouseEnter={e => e.target.style.color = "var(--text-main)"} onMouseLeave={e => e.target.style.color = "var(--text-muted)"}>
          <Shield size={16} /> About Us
        </Link>
        <Link to="/privacy" style={{
          color: "var(--text-muted)", textDecoration: "none", fontSize: 14, fontWeight: 500,
          display: "flex", alignItems: "center", gap: 8, transition: "color 0.2s"
        }} onMouseEnter={e => e.target.style.color = "var(--text-main)"} onMouseLeave={e => e.target.style.color = "var(--text-muted)"}>
          <Lock size={16} /> Privacy Policy
        </Link>
        <Link to="/terms" style={{
          color: "var(--text-muted)", textDecoration: "none", fontSize: 14, fontWeight: 500,
          display: "flex", alignItems: "center", gap: 8, transition: "color 0.2s"
        }} onMouseEnter={e => e.target.style.color = "var(--text-main)"} onMouseLeave={e => e.target.style.color = "var(--text-muted)"}>
          <FileText size={16} /> Terms of Service
        </Link>
      </div>

      <div style={{
        fontSize: 13,
        color: "var(--text-muted)",
        textAlign: "center"
      }}>
        &copy; {new Date().getFullYear()} Investo. All rights reserved.
      </div>
    </footer>
  );
}