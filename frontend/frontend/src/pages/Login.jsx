import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { LogIn, Key, Mail, Eye, EyeOff, Shield } from "lucide-react";
import Darklogo from "../assets/Darklogo.png";
import Lightlogo from "../assets/Lightlogo.png";
import googlelogo from "../assets/googlelogo.png";

const TOKEN_KEY = "jwt";

export default function Login() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(isDarkMode));
    document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    
    const endpoint = isAdminMode 
      ? "http://localhost:8000/api/admin-portal/login/" 
      : "http://localhost:8000/api/login/";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      
      if (!response.ok) {
        setMessage(data.error || data.detail || "Invalid credentials. Please try again.");
      } else {
        localStorage.setItem(TOKEN_KEY, data.access);
        if (data.is_admin || isAdminMode) {
          localStorage.setItem("is_admin", "true");
          navigate("/admin");
        } else {
          localStorage.setItem("is_admin", "false");
          navigate("/dashboard");
        }
      }
    } catch (error) {
      setMessage("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8000/api/google-login/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: tokenResponse.code }),
        });
        const data = await response.json();
        if (response.ok && data.access) {
          localStorage.setItem(TOKEN_KEY, data.access);
          navigate("/dashboard");
        } else {
          setMessage(data.error || "Google auth failed.");
        }
      } catch {
        setMessage("Connection failed.");
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <GoogleOAuthProvider clientId="716900923722-2570apf8khecitbmi9eudofohdrhbsfl.apps.googleusercontent.com">
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24, position: "relative", overflow: "hidden"
      }}>
        {/* Background Accents */}
        <div style={{
          position: "absolute", top: "-10%", left: "-10%", width: "50%", height: "50%",
          background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
          filter: "blur(60px)", zIndex: 0
        }} />
        <div style={{
          position: "absolute", bottom: "-10%", right: "-10%", width: "50%", height: "50%",
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)",
          filter: "blur(60px)", zIndex: 0
        }} />

        {/* Theme Toggle */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={{
            position: "absolute", top: 24, right: 24, zIndex: 10,
            background: "var(--card-bg)", border: "1px solid var(--card-border)",
            padding: "8px 16px", borderRadius: 30, color: "var(--text-main)",
            cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 600,
            backdropFilter: "blur(12px)", transition: "all 0.2s"
          }}
        >
          {isDarkMode ? "☀ Light Mode" : "☾ Dark Mode"}
        </button>

        {/* Main Card */}
        <div className="glass-strong animate-in" style={{
          width: "100%", maxWidth: 440, padding: "40px 32px", zIndex: 1,
          display: "flex", flexDirection: "column", gap: 32
        }}>
          
          {/* Header */}
          <div style={{ textAlign: "center" }}>
            <img 
              src={isDarkMode ? Darklogo : Lightlogo} 
              alt="Investo Logo" 
              style={{ height: 28, marginBottom: 24 }} 
            />
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 800, margin: 0 }}>
              {isAdminMode ? "Admin Portal" : "Welcome Back"}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 15, margin: "8px 0 0" }}>
              {isAdminMode ? "Secure administrative access" : "Sign in to your portfolio dashboard"}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {message && (
              <div style={{
                background: "var(--danger-bg)", color: "var(--danger-color)",
                padding: "12px 16px", borderRadius: 12, fontSize: 14,
                border: "1px solid rgba(239, 68, 68, 0.2)", display: "flex", gap: 8
              }}>
                <Shield size={18} /> {message}
              </div>
            )}

            <div className="floating-input-group">
              <input
                type="text" name="username"
                className="floating-input"
                placeholder=" "
                value={formData.username} onChange={handleChange} required
              />
              <label className="floating-label">Username or Email</label>
              <Mail size={18} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
            </div>

            <div className="floating-input-group">
              <input
                type={showPassword ? "text" : "password"} name="password"
                className="floating-input"
                placeholder=" "
                value={formData.password} onChange={handleChange} required
              />
              <label className="floating-label">Password</label>
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                  background: "transparent", border: "none", color: "var(--text-muted)",
                  cursor: "pointer", display: "flex", padding: 4
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button type="button" onClick={() => navigate("/pass")} style={{
                background: "none", border: "none", color: "var(--text-muted)",
                fontSize: 13, fontWeight: 500, cursor: "pointer"
              }}>
                Forgot password?
              </button>
              <button type="button" onClick={() => setIsAdminMode(!isAdminMode)} style={{
                background: "none", border: "none", color: "var(--accent)",
                fontSize: 13, fontWeight: 600, cursor: "pointer"
              }}>
                {isAdminMode ? "User Login" : "Admin Login"}
              </button>
            </div>

            <button type="submit" className="inv-btn-primary" disabled={loading} style={{ height: 48, fontSize: 16 }}>
              {loading ? "Authenticating..." : (isAdminMode ? "Access Portal" : "Sign In")}
              {!loading && <LogIn size={18} />}
            </button>
          </form>

          {!isAdminMode && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: "var(--divider)" }} />
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Or</span>
                <div style={{ flex: 1, height: 1, background: "var(--divider)" }} />
              </div>

              <button type="button" onClick={() => googleLogin()} style={{
                width: "100%", padding: 12, borderRadius: 12, background: "var(--input-bg)",
                border: "1px solid var(--input-border)", color: "var(--text-main)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all 0.2s"
              }}>
                <img src={googlelogo} alt="Google" style={{ width: 20, height: 20 }} />
                Continue with Google
              </button>
            </div>
          )}

          <p style={{ textAlign: "center", margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
            Don't have an account?{" "}
            <button type="button" onClick={() => navigate("/register")} style={{
              background: "none", border: "none", color: "var(--accent)",
              fontWeight: 700, cursor: "pointer", padding: 0
            }}>
              Create one
            </button>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}