import React from "react";
import MainLayout from "../layouts/MainLayout";
import { motion } from "framer-motion";
import ContactEmail from "../components/ContactEmail";

const sections = [
  {
    title: "Acceptance of terms",
    body: "By creating an account or using Investo, you agree to these Terms of Service. If you do not agree, please discontinue use of the platform.",
  },
  {
    title: "Account responsibility",
    body: "You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. Notify us immediately of unauthorized access.",
  },
  {
    title: "Not financial advice",
    body: "Investo provides tools for tracking and education. Nothing on the platform constitutes personalized investment, tax, or legal advice. You alone are responsible for financial decisions.",
  },
  {
    title: "Acceptable use",
    body: "You may not use Investo to distribute malware, harass other members, manipulate markets, or violate applicable laws. We reserve the right to suspend accounts that breach these rules.",
  },
  {
    title: "Termination",
    body: "We may suspend or terminate access at any time for violations of these terms or to protect platform integrity. You may close your account at any time through Settings.",
  },
];

export default function Terms() {
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
            Terms of <span className="heading-gradient">Service</span>
          </h1>
          <p>The rules for using Investo.</p>
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
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 18, margin: "0 0 12px" }}>Legal & support contact</h2>
          <ContactEmail />
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
