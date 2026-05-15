import React from "react";
import { motion } from "framer-motion";
import MainLayout from "../layouts/MainLayout";
import { Activity, ShieldAlert, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FeatureExpenses() {
  const navigate = useNavigate();

  return (
    <MainLayout isPublic={true}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ maxWidth: 900, margin: "0 auto", padding: "40px 0" }}>
        
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(239, 68, 68, 0.1)", color: "var(--danger-color)", padding: "8px 16px", borderRadius: 30, fontSize: 13, fontWeight: 700, marginBottom: 24 }}>
            <Activity size={16} /> CORE FEATURE
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, margin: "0 0 24px", lineHeight: 1.1 }}>
            Tame Your <span className="heading-gradient" style={{ background: "linear-gradient(90deg, var(--danger-color), var(--color-orange))", WebkitBackgroundClip: "text" }}>Cash Flow</span>
          </h1>
          <p style={{ fontSize: "18px", color: "var(--text-muted)", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
            Log income, track expenses, and visualize your spending funnels. Discover exactly where your money goes every month.
          </p>
        </div>

        <div className="bento-grid bento-grid-2">
          <div className="glass-strong" style={{ padding: 40 }}>
            <Zap size={32} color="var(--color-orange)" style={{ marginBottom: 24 }} />
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, marginBottom: 16 }}>Lightning Fast Logging</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              Add transactions in seconds. Our streamlined modal system ensures you spend less time managing money and more time making it.
            </p>
          </div>
          <div className="glass-strong" style={{ padding: 40 }}>
            <ShieldAlert size={32} color="var(--danger-color)" style={{ marginBottom: 24 }} />
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, marginBottom: 16 }}>Spending Funnels</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              Identify your biggest expense categories with our automated breakdown charts. Instantly spot lifestyle creep before it affects your savings rate.
            </p>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 64 }}>
          <button className="inv-btn-primary" onClick={() => navigate("/register")} style={{ width: "auto", padding: "16px 32px", fontSize: 16, borderRadius: 30, background: "var(--color-orange)" }}>
            Control Your Cash Flow <ArrowRight size={18} />
          </button>
        </div>
        
      </motion.div>
    </MainLayout>
  );
}
