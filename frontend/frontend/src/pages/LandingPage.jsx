import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ContactEmail from "../components/ContactEmail";
import ContactModal from "../components/ContactModal";
import {
  ArrowRight,
  LineChart,
  PieChart,
  BookOpen,
  Bell,
  Globe,
  ChartCandlestick,
  Mail,
} from "lucide-react";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const ACTIVE_FEATURES = [
  {
    title: "NEPSE Live Tracker",
    desc: "Session-aware simulation (Mon–Fri, 11:00–15:00 NPT), circuit breakers, and Lakhs/Crores market metrics.",
    path: "/features/market",
    icon: LineChart,
  },
  {
    title: "OHLC Candlestick Analytics",
    desc: "Professional green/red daily candles synced to live and historical NEPSE price data.",
    path: "/features/market",
    icon: ChartCandlestick,
  },
  {
    title: "Multi-Asset Capital Allocation",
    desc: "Digital NEPSE holdings plus physical gold, real estate, and cash — one Lakhs/Crores valuation ledger.",
    path: "/features/portfolio",
    icon: PieChart,
  },
  {
    title: "Financial Reminders Calendar",
    desc: "Bills, subscriptions, and custom alerts with undo-safe actions and in-app notifications.",
    path: "/register",
    icon: Bell,
  },
  {
    title: "Global & Domestic Economic Feed",
    desc: "Live NPR FX grid, bullion ticker, and dual global/Nepal news panels on your command center.",
    path: "/features/news",
    icon: Globe,
  },
  {
    title: "Draggable Financial Glossary",
    desc: "Viewport-bounded, always-on terminology assistant — drag anywhere while you analyze markets.",
    path: "/register",
    icon: BookOpen,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [contactOpen, setContactOpen] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    controls.start("show");
  }, [controls]);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    setMousePosition({
      x: (clientX / innerWidth - 0.5) * 18,
      y: (clientY / innerHeight - 0.5) * -18,
    });
  };

  return (
    <MainLayout isPublic={true}>
      <div
        onMouseMove={handleMouseMove}
        style={{ display: "flex", flexDirection: "column", gap: 100, paddingBottom: 40 }}
      >
        {/* Hero */}
        <section
          style={{
            minHeight: "calc(100vh - 200px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            perspective: 1200,
          }}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            style={{ maxWidth: 820, marginBottom: 56, position: "relative", zIndex: 10 }}
          >
            <motion.div
              variants={itemVariants}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--accent-dim)",
                color: "var(--accent)",
                padding: "6px 16px",
                borderRadius: 30,
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 24,
                letterSpacing: 0.5,
                border: "1px solid var(--accent-glow)",
              }}
            >
              NEPSE SIMULATION PLATFORM
            </motion.div>

            <motion.h1
              variants={itemVariants}
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(44px, 8vw, 88px)",
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                margin: "0 0 24px",
                color: "var(--text-main)",
              }}
            >
              Nepal markets, <br />
              <span className="heading-gradient" style={{ display: "inline-block" }}>
                institutionally presented.
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              style={{
                fontSize: "clamp(16px, 2vw, 20px)",
                color: "var(--text-muted)",
                maxWidth: 600,
                margin: "0 auto 40px",
                lineHeight: 1.65,
              }}
            >
              Investo delivers live NEPSE tracking, candlestick analytics, multi-asset capital allocation,
              economic intelligence, and reminders — in one cohesive financial command center.
            </motion.p>

            <motion.div variants={itemVariants} style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="inv-btn-primary"
                onClick={() => navigate("/register")}
                style={{ width: "auto", padding: "16px 32px", fontSize: 16, borderRadius: 30 }}
              >
                Open Command Center <ArrowRight size={18} />
              </button>
              <button
                type="button"
                onClick={() => navigate("/login")}
                style={{
                  width: "auto",
                  padding: "16px 32px",
                  fontSize: 16,
                  borderRadius: 30,
                  background: "var(--input-bg)",
                  color: "var(--text-main)",
                  border: "1px solid var(--input-border)",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Sign In
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 80, rotateX: 16 }}
            animate={{
              opacity: 1,
              y: 0,
              rotateX: mousePosition.y,
              rotateY: mousePosition.x,
            }}
            transition={{
              opacity: { duration: 1, delay: 0.5 },
              y: { duration: 1, delay: 0.5, type: "spring", bounce: 0.35 },
              rotateX: { type: "spring", stiffness: 120, damping: 22 },
              rotateY: { type: "spring", stiffness: 120, damping: 22 },
            }}
            style={{ width: "100%", maxWidth: 920, transformStyle: "preserve-3d" }}
          >
            <div
              className="glass-strong"
              style={{
                padding: 32,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "linear-gradient(135deg, var(--card-bg) 0%, rgba(15,23,42,0.75) 100%)",
                boxShadow: "0 32px 64px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <div className="bento-grid bento-grid-3">
                <div className="glass-strong" style={{ padding: 20 }}>
                  <LineChart size={24} color="var(--accent)" style={{ marginBottom: 12 }} />
                  <div className="metric-label">NEPSE Index</div>
                  <div className="metric-medium">~2,650</div>
                </div>
                <div className="glass-strong" style={{ padding: 20 }}>
                  <ChartCandlestick size={24} color="var(--color-green)" style={{ marginBottom: 12 }} />
                  <div className="metric-label">Daily circuit</div>
                  <div className="metric-medium">±10%</div>
                </div>
                <div className="glass-strong" style={{ padding: 20 }}>
                  <PieChart size={24} color="var(--color-purple)" style={{ marginBottom: 12 }} />
                  <div className="metric-label">Valuation</div>
                  <div className="metric-medium">Lakhs / Crore</div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Active modules */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={containerVariants}
          style={{ width: "100%" }}
        >
          <motion.div variants={itemVariants} className="page-header">
            <h2 style={{ fontSize: "clamp(28px, 5vw, 42px)", margin: 0 }}>
              Built modules, <span className="heading-gradient">shipping today</span>
            </h2>
            <p>Every item below is live in the application — no placeholder roadmaps.</p>
          </motion.div>

          <div className="bento-grid bento-grid-2" style={{ marginTop: 40 }}>
            {ACTIVE_FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="glass-strong"
                style={{ padding: 32, cursor: "pointer" }}
                onClick={() => navigate(f.path)}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
              >
                <f.icon size={28} color="var(--accent)" style={{ marginBottom: 16 }} />
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 22, margin: "0 0 12px" }}>{f.title}</h3>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 20px" }}>{f.desc}</p>
                <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                  Learn more <ArrowRight size={16} />
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Contact */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={containerVariants}
          className="glass-strong"
          style={{
            padding: "clamp(32px, 6vw, 56px)",
            textAlign: "center",
            borderColor: "var(--accent-glow)",
          }}
        >
          <motion.div variants={itemVariants} style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16, color: "var(--accent)", fontSize: 13, fontWeight: 700 }}>
            <Mail size={16} /> CONTACT & SUPPORT
          </motion.div>
          <motion.h2 variants={itemVariants} style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(24px, 4vw, 36px)", margin: "0 0 12px" }}>
            Questions about Investo?
          </motion.h2>
          <motion.p variants={itemVariants} style={{ color: "var(--text-muted)", maxWidth: 520, margin: "0 auto 24px", lineHeight: 1.6 }}>
            Reach our team for product support, feedback, and partnership inquiries.
          </motion.p>
          <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
            <ContactEmail style={{ fontSize: 16, justifyContent: "center" }} />
          </motion.div>
          <motion.button
            variants={itemVariants}
            type="button"
            className="inv-btn-primary"
            onClick={() => setContactOpen(true)}
            style={{ width: "auto", margin: "0 auto", padding: "12px 24px", borderRadius: 30 }}
          >
            Open Contact Form
          </motion.button>
        </motion.section>
      </div>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </MainLayout>
  );
}
