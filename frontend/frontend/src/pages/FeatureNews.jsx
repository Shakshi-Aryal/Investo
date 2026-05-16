import React from "react";
import { motion } from "framer-motion";
import MainLayout from "../layouts/MainLayout";
import { Globe, DollarSign, Newspaper, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FeatureNews() {
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
            background: "rgba(59, 130, 246, 0.1)", color: "var(--color-blue)",
            padding: "8px 16px", borderRadius: 30, fontSize: 13, fontWeight: 700, marginBottom: 24,
          }}>
            <Globe size={16} /> LIVE MODULE
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, margin: "0 0 24px", lineHeight: 1.1 }}>
            Global & Domestic <span className="heading-gradient">Economic Feed</span>
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
            NPR exchange rates, bullion spot prices, and dual global/Nepal news panels — on your Overview Hub and full News Portal.
          </p>
        </div>

        <div className="bento-grid bento-grid-2">
          <div className="glass-strong" style={{ padding: 40 }}>
            <DollarSign size={32} color="var(--accent)" style={{ marginBottom: 24 }} />
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, marginBottom: 16 }}>NPR FX & Bullion Grid</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              Live buy/sell rates and gold/silver tickers formatted for Nepali investors.
            </p>
          </div>
          <div className="glass-strong" style={{ padding: 40 }}>
            <Newspaper size={32} color="var(--color-green)" style={{ marginBottom: 24 }} />
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, marginBottom: 16 }}>Dual News Panels</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              Global market trends and Nepal economic headlines in one cohesive feed.
            </p>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 64 }}>
          <button
            type="button"
            className="inv-btn-primary"
            onClick={() => navigate("/register")}
            style={{ width: "auto", padding: "16px 32px", fontSize: 16, borderRadius: 30 }}
          >
            Access Economic Feed <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    </MainLayout>
  );
}
