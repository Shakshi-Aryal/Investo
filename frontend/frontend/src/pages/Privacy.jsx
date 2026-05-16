import React from "react";
import MainLayout from "../layouts/MainLayout";
import { motion } from "framer-motion";
import ContactEmail from "../components/ContactEmail";

const sections = [
  {
    title: "Information we collect",
    body: "Account details you provide at registration, portfolio and expense data you enter, and technical logs such as device type and usage patterns to keep the platform reliable.",
  },
  {
    title: "How we use your data",
    body: "Your information powers core features — dashboards, reminders, and community participation. We do not sell personal financial data to advertisers or data brokers.",
  },
  {
    title: "Security practices",
    body: "Data is encrypted in transit via HTTPS. Sensitive fields are protected at rest using industry-standard practices. We review access controls regularly.",
  },
  {
    title: "Your rights",
    body: "You may export, correct, or delete your account data through Platform Settings or by emailing our support team. Deletion requests are processed within a reasonable timeframe.",
  },
  {
    title: "Cookies & analytics",
    body: "We use minimal session cookies for authentication and optional anonymized analytics to improve product quality. You can disable non-essential cookies in your browser.",
  },
];

export default function Privacy() {
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
            Privacy <span className="heading-gradient">Policy</span>
          </h1>
          <p>How Investo handles your information.</p>
        </div>

        <p style={{ fontStyle: "italic", color: "var(--text-muted)", marginBottom: 24 }}>
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {sections.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="glass-strong"
              style={{ padding: 28 }}
            >
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 18, margin: "0 0 10px", color: "var(--text-main)" }}>
                {i + 1}. {s.title}
              </h2>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: "var(--text-muted)" }}>{s.body}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="glass-strong"
          style={{ padding: 28, marginTop: 24, textAlign: "center" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 18, margin: "0 0 12px" }}>Privacy inquiries</h2>
          <ContactEmail />
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
