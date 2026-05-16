import React from "react";
import { motion } from "framer-motion";
import MainLayout from "../layouts/MainLayout";
import { Users, MessageSquare, BookOpen, ArrowRight, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FeatureCommunity() {
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
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(139, 92, 246, 0.1)",
              color: "var(--color-purple)",
              padding: "8px 16px",
              borderRadius: 30,
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 24,
            }}
          >
            <Users size={16} /> CORE FEATURE
          </div>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: 800,
              margin: "0 0 24px",
              lineHeight: 1.1,
            }}
          >
            Premium Financial Forum &{" "}
            <span
              className="heading-gradient"
              style={{
                background: "linear-gradient(90deg, var(--color-purple), var(--color-pink))",
                WebkitBackgroundClip: "text",
              }}
            >
              Knowledge Hub
            </span>
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 620, margin: "0 auto", lineHeight: 1.6 }}>
            A curated community for investors who value signal over noise — share strategies, learn from
            top contributors, and build financial literacy in one editorial-grade space.
          </p>
        </div>

        <div className="bento-grid bento-grid-2">
          <div className="glass-strong" style={{ padding: 40 }}>
            <MessageSquare size={32} color="var(--color-purple)" style={{ marginBottom: 24 }} />
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, marginBottom: 16 }}>
              Discussion Forums
            </h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              Join threaded conversations on market trends, individual equities, and long-term wealth
              building — structured for clarity, not endless scrolling.
            </p>
          </div>
          <div className="glass-strong" style={{ padding: 40 }}>
            <BookOpen size={32} color="var(--color-pink)" style={{ marginBottom: 24 }} />
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, marginBottom: 16 }}>
              Knowledge Library
            </h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              Bookmark expert write-ups, glossary entries, and platform guides — your personal reference
              desk inside the hub.
            </p>
          </div>
          <div className="glass-strong" style={{ padding: 40, gridColumn: "1 / -1" }}>
            <Award size={32} color="var(--accent)" style={{ marginBottom: 24 }} />
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, marginBottom: 16 }}>
              Contributor Recognition
            </h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 640 }}>
              Top voices earn visibility through quality engagement — not vanity metrics. The hub
              elevates thoughtful analysis so every member learns faster.
            </p>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 64 }}>
          <button
            type="button"
            className="inv-btn-primary"
            onClick={() => navigate("/register")}
            style={{ width: "auto", padding: "16px 32px", fontSize: 16, borderRadius: 30, background: "var(--color-purple)" }}
          >
            Join the Knowledge Hub <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    </MainLayout>
  );
}
