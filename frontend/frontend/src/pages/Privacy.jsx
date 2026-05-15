import React from "react";
import MainLayout from "../layouts/MainLayout";
import { motion } from "framer-motion";

export default function Privacy() {
  return (
    <MainLayout isPublic={true}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ maxWidth: 800, margin: "0 auto", padding: "40px 0" }}
      >
        <div className="page-header" style={{ textAlign: "left", marginBottom: 48 }}>
          <h1>Privacy <span className="heading-gradient">Policy</span></h1>
          <p>Your data, secured.</p>
        </div>
        
        <div className="glass-strong" style={{ display: "flex", flexDirection: "column", gap: 24, fontSize: 16, lineHeight: 1.6, color: "var(--text-muted)" }}>
          <p style={{ fontStyle: "italic" }}>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)", fontSize: 20, margin: 0 }}>1. Information We Collect</h2>
          <p>
            When you use Investo, we collect information you provide directly to us (such as account details) and information automatically collected through your use of the service (such as device information and usage logs).
          </p>
          
          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)", fontSize: 20, margin: "16px 0 0" }}>2. How We Use Your Data</h2>
          <p>
            We use your data solely to provide, maintain, and improve the Investo platform. We do not sell your personal financial data to third parties.
          </p>
          
          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)", fontSize: 20, margin: "16px 0 0" }}>3. Data Security</h2>
          <p>
            We implement enterprise-grade security measures to protect your data. All sensitive information is encrypted in transit and at rest.
          </p>
          
          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)", fontSize: 20, margin: "16px 0 0" }}>4. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information at any time through your account settings or by contacting our support team.
          </p>
        </div>
      </motion.div>
    </MainLayout>
  );
}
