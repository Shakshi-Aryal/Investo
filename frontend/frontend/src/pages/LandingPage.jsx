import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { ArrowRight, Activity, PieChart, Shield, Zap } from "lucide-react";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();

  useEffect(() => {
    controls.start("show");
  }, [controls]);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20; // max rotation 10deg
    const y = (clientY / innerHeight - 0.5) * -20;
    setMousePosition({ x, y });
  };

  return (
    <MainLayout isPublic={true}>
      <div 
        onMouseMove={handleMouseMove}
        style={{
          minHeight: "calc(100vh - 150px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "40px 0",
          perspective: 1000
        }}
      >
        {/* Kinetic Typography Hero */}
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate={controls}
          style={{ maxWidth: 800, marginBottom: 64, position: "relative", zIndex: 10 }}
        >
          <motion.div 
            variants={itemVariants}
            style={{ 
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--accent-dim)", color: "var(--accent)",
              padding: "6px 16px", borderRadius: 30, fontSize: 13, fontWeight: 700,
              marginBottom: 24, letterSpacing: 0.5, border: "1px solid var(--accent-glow)"
            }}
          >
            <Zap size={14} fill="currentColor" /> INVESTO 2.0 IS LIVE
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(48px, 8vw, 84px)",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              margin: "0 0 24px",
              color: "var(--text-main)"
            }}
          >
            Wealth tracking, <br />
            <span className="heading-gradient" style={{ display: "inline-block" }}>beautifully engineered.</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            style={{
              fontSize: "clamp(16px, 2vw, 20px)",
              color: "var(--text-muted)",
              maxWidth: 600,
              margin: "0 auto 40px",
              lineHeight: 1.6
            }}
          >
            The premium financial ecosystem designed for clarity, speed, and absolute control. Get a unified view of your portfolio today.
          </motion.p>
          
          <motion.div variants={itemVariants} style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <button 
              className="inv-btn-primary"
              onClick={() => navigate("/register")}
              style={{ width: "auto", padding: "16px 32px", fontSize: 16, borderRadius: 30 }}
            >
              Start Building Free <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => navigate("/login")}
              style={{
                width: "auto", padding: "16px 32px", fontSize: 16, borderRadius: 30,
                background: "var(--input-bg)", color: "var(--text-main)",
                border: "1px solid var(--input-border)", fontFamily: "var(--font-heading)",
                fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--card-border)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--input-bg)"}
            >
              Sign In
            </button>
          </motion.div>
        </motion.div>

        {/* Interactive Dashboard Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 100, rotateX: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            rotateX: mousePosition.y,
            rotateY: mousePosition.x
          }}
          transition={{ 
            opacity: { duration: 1, delay: 0.6 },
            y: { duration: 1, delay: 0.6, type: "spring", bounce: 0.4 },
            rotateX: { type: "spring", stiffness: 150, damping: 20 },
            rotateY: { type: "spring", stiffness: 150, damping: 20 }
          }}
          style={{
            width: "100%",
            maxWidth: 900,
            transformStyle: "preserve-3d",
            position: "relative"
          }}
        >
          {/* Abstract background glow */}
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) translateZ(-50px)",
            width: "100%", height: "100%", background: "var(--accent)", filter: "blur(120px)", opacity: 0.15,
            borderRadius: "50%"
          }} />
          
          <div className="glass-strong" style={{
            padding: 32,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "linear-gradient(135deg, var(--card-bg) 0%, rgba(15,23,42,0.8) 100%)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"
          }}>
            {/* Mock Header */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
              <div style={{ width: 120, height: 16, background: "var(--input-border)", borderRadius: 8 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ width: 32, height: 32, background: "var(--input-border)", borderRadius: "50%" }} />
                <div style={{ width: 32, height: 32, background: "var(--input-border)", borderRadius: "50%" }} />
              </div>
            </div>
            
            {/* Mock Grid */}
            <div className="bento-grid bento-grid-3">
              <div className="glass-strong" style={{ padding: 20, transform: "translateZ(20px)", transition: "transform 0.3s" }}>
                <Activity size={24} color="var(--accent)" style={{ marginBottom: 12 }} />
                <div style={{ width: "60%", height: 12, background: "var(--text-muted)", opacity: 0.5, borderRadius: 6, marginBottom: 8 }} />
                <div style={{ width: "80%", height: 24, background: "var(--text-main)", borderRadius: 6 }} />
              </div>
              <div className="glass-strong" style={{ padding: 20, transform: "translateZ(30px)", transition: "transform 0.3s" }}>
                <PieChart size={24} color="var(--color-pink)" style={{ marginBottom: 12 }} />
                <div style={{ width: "60%", height: 12, background: "var(--text-muted)", opacity: 0.5, borderRadius: 6, marginBottom: 8 }} />
                <div style={{ width: "90%", height: 24, background: "var(--text-main)", borderRadius: 6 }} />
              </div>
              <div className="glass-strong" style={{ padding: 20, transform: "translateZ(40px)", transition: "transform 0.3s" }}>
                <Shield size={24} color="var(--color-green)" style={{ marginBottom: 12 }} />
                <div style={{ width: "60%", height: 12, background: "var(--text-muted)", opacity: 0.5, borderRadius: 6, marginBottom: 8 }} />
                <div style={{ width: "70%", height: 24, background: "var(--text-main)", borderRadius: 6 }} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
