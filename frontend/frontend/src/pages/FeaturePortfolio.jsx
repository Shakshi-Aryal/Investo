import React from "react";
import { motion } from "framer-motion";
import MainLayout from "../layouts/MainLayout";
import { PieChart, TrendingUp, Download, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FeaturePortfolio() {
  const navigate = useNavigate();

  return (
    <MainLayout isPublic={true}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: 900, margin: "0 auto", padding: "40px 0" }}
      >
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--accent-dim)", color: "var(--accent)",
            padding: "8px 16px", borderRadius: 30, fontSize: 13, fontWeight: 700, marginBottom: 24,
          }}>
            <PieChart size={16} /> LIVE MODULE
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, margin: "0 0 24px", lineHeight: 1.1 }}>
            Multi-Asset <span className="heading-gradient">Capital Allocation</span>
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
            Digital NEPSE holdings and physical gold, real estate, and cash — unified in a Lakhs/Crores valuation ledger with allocation charts.
          </p>
        </div>

        <div className="bento-grid bento-grid-2">
          <div className="glass-strong" style={{ padding: 40 }}>
            <TrendingUp size={32} color="var(--accent)" style={{ marginBottom: 24 }} />
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, marginBottom: 16 }}>Asset Performance Analytics</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              ROI bars, type allocation pies, and capital vs valuation area charts across every asset class.
            </p>
          </div>
          <div className="glass-strong" style={{ padding: 40 }}>
            <Download size={32} color="var(--color-pink)" style={{ marginBottom: 24 }} />
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, marginBottom: 16 }}>Institutional PDF Export</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              Generate a clean portfolio report for advisors or personal records in one click.
            </p>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 64 }}>
          <button type="button" className="inv-btn-primary" onClick={() => navigate("/register")} style={{ width: "auto", padding: "16px 32px", fontSize: 16, borderRadius: 30 }}>
            Open Capital Allocation <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    </MainLayout>
  );
}
