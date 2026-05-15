import React from "react";
import { motion } from "framer-motion";
import MainLayout from "../layouts/MainLayout";
import { LineChart, Search, Eye, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FeatureMarket() {
  const navigate = useNavigate();

  return (
    <MainLayout isPublic={true}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ maxWidth: 900, margin: "0 auto", padding: "40px 0" }}>
        
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(16, 185, 129, 0.1)", color: "var(--color-green)", padding: "8px 16px", borderRadius: 30, fontSize: 13, fontWeight: 700, marginBottom: 24 }}>
            <LineChart size={16} /> CORE FEATURE
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, margin: "0 0 24px", lineHeight: 1.1 }}>
            Real-Time <span className="heading-gradient" style={{ background: "linear-gradient(90deg, var(--color-green), var(--color-blue))", WebkitBackgroundClip: "text" }}>Insights</span>
          </h1>
          <p style={{ fontSize: "18px", color: "var(--text-muted)", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
            Don't fly blind. Get live market data, interactive stock charts, and the latest financial news directly within your dashboard.
          </p>
        </div>

        <div className="bento-grid bento-grid-2">
          <div className="glass-strong" style={{ padding: 40 }}>
            <Search size={32} color="var(--color-blue)" style={{ marginBottom: 24 }} />
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, marginBottom: 16 }}>Symbol Lookup</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              Quickly search for any ticker symbol to pull up its daily performance, historical charts, and current valuation.
            </p>
          </div>
          <div className="glass-strong" style={{ padding: 40 }}>
            <Eye size={32} color="var(--color-green)" style={{ marginBottom: 24 }} />
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, marginBottom: 16 }}>Watchlists</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              Keep an eye on potential investments. Create custom watchlists to monitor price movements without committing capital.
            </p>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 64 }}>
          <button className="inv-btn-primary" onClick={() => navigate("/register")} style={{ width: "auto", padding: "16px 32px", fontSize: 16, borderRadius: 30, background: "var(--color-green)" }}>
            Explore the Market <ArrowRight size={18} />
          </button>
        </div>
        
      </motion.div>
    </MainLayout>
  );
}
