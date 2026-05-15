import React from "react";
import { motion } from "framer-motion";
import MainLayout from "../layouts/MainLayout";
import { Users, MessageSquare, Globe, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FeatureCommunity() {
  const navigate = useNavigate();

  return (
    <MainLayout isPublic={true}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ maxWidth: 900, margin: "0 auto", padding: "40px 0" }}>
        
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(139, 92, 246, 0.1)", color: "var(--color-purple)", padding: "8px 16px", borderRadius: 30, fontSize: 13, fontWeight: 700, marginBottom: 24 }}>
            <Users size={16} /> CORE FEATURE
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, margin: "0 0 24px", lineHeight: 1.1 }}>
            Join the <span className="heading-gradient" style={{ background: "linear-gradient(90deg, var(--color-purple), var(--color-pink))", WebkitBackgroundClip: "text" }}>Network</span>
          </h1>
          <p style={{ fontSize: "18px", color: "var(--text-muted)", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
            Connect with other investors, share strategies, and learn from top performers in our built-in community hub.
          </p>
        </div>

        <div className="bento-grid bento-grid-2">
          <div className="glass-strong" style={{ padding: 40 }}>
            <MessageSquare size={32} color="var(--color-purple)" style={{ marginBottom: 24 }} />
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, marginBottom: 16 }}>Discussion Boards</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              Participate in active discussions about market trends, individual stocks, and general personal finance strategies.
            </p>
          </div>
          <div className="glass-strong" style={{ padding: 40 }}>
            <Globe size={32} color="var(--color-pink)" style={{ marginBottom: 24 }} />
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, marginBottom: 16 }}>Broadcast Channels</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              Get official platform updates and macro-economic announcements pushed directly to you via admin-curated broadcast channels.
            </p>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 64 }}>
          <button className="inv-btn-primary" onClick={() => navigate("/register")} style={{ width: "auto", padding: "16px 32px", fontSize: 16, borderRadius: 30, background: "var(--color-purple)" }}>
            Join the Community <ArrowRight size={18} />
          </button>
        </div>
        
      </motion.div>
    </MainLayout>
  );
}
