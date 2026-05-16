import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { motion } from "framer-motion";
import ContactEmail from "../components/ContactEmail";
import ContactModal from "../components/ContactModal";

const blocks = [
  {
    title: "Our mission",
    body: "Investo is a Nepal-focused financial command center: NEPSE live tracking, OHLC candlesticks, multi-asset capital allocation, economic feeds, reminders, and an always-available glossary — engineered for clarity and professional-grade presentation.",
  },
  {
    title: "What ships today",
    body: "NEPSE Live Tracker with session hours and circuit limits; Lakhs/Crores valuation ledger; Global & Domestic Economic Feed; Financial Reminders Calendar; and a draggable glossary widget. Every module on our landing page is live in production.",
  },
  {
    title: "Design standard",
    body: "Glass surfaces, bento layouts, and purposeful motion guide attention through dense financial data — reducing noise so decisions feel faster and calmer.",
  },
  {
    title: "Contact & support",
    body: null,
    isContact: true,
  },
];

export default function About() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <MainLayout isPublic={true}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: 720, margin: "0 auto", padding: "48px 0" }}
      >
        <div className="page-header" style={{ textAlign: "left", marginBottom: 40 }}>
          <h1>
            About <span className="heading-gradient">Investo</span>
          </h1>
          <p>The mission and modules behind our NEPSE-ready financial platform.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {blocks.map((block, i) => (
            <motion.div
              key={block.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              className="glass-strong"
              style={{ padding: 28 }}
            >
              <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)", fontSize: 20, margin: "0 0 12px" }}>
                {block.title}
              </h2>
              {block.isContact ? (
                <>
                  <p style={{ margin: "0 0 16px", fontSize: 16, lineHeight: 1.65, color: "var(--text-muted)" }}>
                    Product support, feedback, and partnership inquiries:
                  </p>
                  <ContactEmail />
                  <button
                    type="button"
                    className="inv-btn-primary"
                    onClick={() => setContactOpen(true)}
                    style={{ width: "auto", marginTop: 20, padding: "12px 22px", borderRadius: 12 }}
                  >
                    Contact Us
                  </button>
                </>
              ) : (
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.65, color: "var(--text-muted)" }}>{block.body}</p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </MainLayout>
  );
}
