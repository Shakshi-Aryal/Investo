import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Lock, FileText, Mail } from "lucide-react";
import ContactEmail from "./ContactEmail";
import ContactModal from "./ContactModal";

export default function Footer() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <footer style={{
        marginTop: "auto",
        padding: "48px 24px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderTop: "1px solid var(--divider)",
        background: "var(--bg-main)",
      }}>
        <div style={{
          display: "flex",
          gap: 28,
          marginBottom: 20,
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
          <Link to="/about" style={linkStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
            <Shield size={16} /> About Investo
          </Link>
          <button type="button" onClick={() => setContactOpen(true)} style={{ ...linkStyle, background: "none", border: "none", cursor: "pointer" }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
            <Mail size={16} /> Contact Us
          </button>
          <Link to="/privacy" style={linkStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
            <Lock size={16} /> Privacy Policy
          </Link>
          <Link to="/terms" style={linkStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
            <FileText size={16} /> Terms of Service
          </Link>
        </div>

        <div style={{ marginBottom: 16, textAlign: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Support
          </span>
          <div style={{ marginTop: 8 }}>
            <ContactEmail style={{ fontSize: 14 }} />
          </div>
        </div>

        <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>
          &copy; {new Date().getFullYear()} Investo. All rights reserved.
        </div>
      </footer>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}

const linkStyle = {
  color: "var(--text-muted)",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 500,
  display: "flex",
  alignItems: "center",
  gap: 8,
  transition: "color 0.2s",
};

function hoverIn(e) {
  e.currentTarget.style.color = "var(--text-main)";
}
function hoverOut(e) {
  e.currentTarget.style.color = "var(--text-muted)";
}
