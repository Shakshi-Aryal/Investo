import React from "react";
import MainLayout from "../layouts/MainLayout";
import { motion } from "framer-motion";

export default function Terms() {
  return (
    <MainLayout isPublic={true}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ maxWidth: 800, margin: "0 auto", padding: "40px 0" }}
      >
        <div className="page-header" style={{ textAlign: "left", marginBottom: 48 }}>
          <h1>Terms of <span className="heading-gradient">Service</span></h1>
          <p>The rules of the platform.</p>
        </div>
        
        <div className="glass-strong" style={{ display: "flex", flexDirection: "column", gap: 24, fontSize: 16, lineHeight: 1.6, color: "var(--text-muted)" }}>
          <p style={{ fontStyle: "italic" }}>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)", fontSize: 20, margin: 0 }}>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Investo, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.
          </p>
          
          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)", fontSize: 20, margin: "16px 0 0" }}>2. User Accounts</h2>
          <p>
            You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.
          </p>
          
          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)", fontSize: 20, margin: "16px 0 0" }}>3. Financial Advice Disclaimer</h2>
          <p>
            Investo is a portfolio tracking tool, not a financial advisor. The information provided by the platform should not be considered financial advice. You are solely responsible for your investment decisions.
          </p>
          
          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)", fontSize: 20, margin: "16px 0 0" }}>4. Termination</h2>
          <p>
            We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
        </div>
      </motion.div>
    </MainLayout>
  );
}
