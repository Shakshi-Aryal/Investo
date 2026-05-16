import React from "react";
import { motion } from "framer-motion";
import MainLayout from "../layouts/MainLayout";
import { LineChart, ChartCandlestick, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FeatureMarket() {
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
            background: "rgba(16, 185, 129, 0.1)", color: "var(--color-green)",
            padding: "8px 16px", borderRadius: 30, fontSize: 13, fontWeight: 700, marginBottom: 24,
          }}>
            <LineChart size={16} /> LIVE MODULE
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, margin: "0 0 24px", lineHeight: 1.1 }}>
            NEPSE <span className="heading-gradient">Live Tracker</span>
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
            Session-aware NEPSE simulation with ±10% daily circuits, Lakhs/Crores turnover, and integrated OHLC candlestick analytics per scrip.
          </p>
        </div>

        <div className="bento-grid bento-grid-2">
          <div className="glass-strong" style={{ padding: 40 }}>
            <LineChart size={32} color="var(--color-green)" style={{ marginBottom: 24 }} />
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, marginBottom: 16 }}>Live Index & Scrips</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              Mon–Fri 11:00–15:00 NPT trading window with static prices when the exchange is closed.
            </p>
          </div>
          <div className="glass-strong" style={{ padding: 40 }}>
            <ChartCandlestick size={32} color="var(--accent)" style={{ marginBottom: 24 }} />
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, marginBottom: 16 }}>OHLC Candlestick Analytics</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              Bullish green and bearish red candles from daily open/close with historical and intraday timeframes.
            </p>
          </div>
        </div>

        <div className="glass-strong" style={{ padding: 32, marginTop: 24 }}>
          <TrendingUp size={28} color="var(--accent)" style={{ marginBottom: 16 }} />
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 22, marginBottom: 12 }}>Direct market investing</h2>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
            Purchase kitta from the live board — holdings sync instantly to your Capital Allocation ledger without a page reload.
          </p>
        </div>

        <div style={{ textAlign: "center", marginTop: 64 }}>
          <button
            type="button"
            className="inv-btn-primary"
            onClick={() => navigate("/register")}
            style={{ width: "auto", padding: "16px 32px", fontSize: 16, borderRadius: 30, background: "var(--color-green)" }}
          >
            Open NEPSE Live Tracker <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    </MainLayout>
  );
}
