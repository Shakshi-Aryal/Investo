import React from "react";
import MainLayout from "../layouts/MainLayout";
import { motion } from "framer-motion";

export default function About() {
  return (
    <MainLayout isPublic={true}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ maxWidth: 800, margin: "0 auto", padding: "40px 0" }}
      >
        <div className="page-header" style={{ textAlign: "left", marginBottom: 48 }}>
          <h1>About <span className="heading-gradient">Us</span></h1>
          <p>The mission behind Investo.</p>
        </div>
        
        <div className="glass-strong" style={{ display: "flex", flexDirection: "column", gap: 24, fontSize: 16, lineHeight: 1.6, color: "var(--text-muted)" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)", fontSize: 24, margin: 0 }}>Our Vision</h2>
          <p>
            We believe that financial clarity shouldn't be locked behind complex enterprise tools. Investo was built to bring the power of professional portfolio management to everyone, wrapped in an interface that is as beautiful as it is powerful.
          </p>
          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)", fontSize: 24, margin: "16px 0 0" }}>The Team</h2>
          <p>
            Investo is developed by a passionate group of engineers and designers dedicated to pushing the boundaries of web experiences. We obsess over every pixel, every animation, and every line of code to ensure you get a product that feels "host-ready" for the enterprise.
          </p>
          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)", fontSize: 24, margin: "16px 0 0" }}>Contact</h2>
          <p>
            Have questions or feedback? Reach out to us anytime at hello@investo.app.
          </p>
        </div>
      </motion.div>
    </MainLayout>
  );
}
