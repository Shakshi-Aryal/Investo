import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { LogIn, Eye, EyeOff, Shield, UserPlus, CheckCircle } from "lucide-react";
import Darklogo from "../assets/Darklogo.png";
import Lightlogo from "../assets/Lightlogo.png";
import googlelogo from "../assets/googlelogo.png";
import { apiUrl } from "../config";

export default function Register() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(isDarkMode));
    document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const [formData, setFormData] = useState({
    username: "", email: "", password: "", confirmPassword: "",
    first_name: "", last_name: "", date_of_birth: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setMessage("Password must be 8+ chars with uppercase, lowercase, and a number.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    const dob = new Date(formData.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
    
    if (age < 18) {
      setMessage("You must be at least 18 years old to register.");
      return;
    }

    setLoading(true);
    const payload = { ...formData };
    delete payload.confirmPassword;

    try {
      const response = await fetch(apiUrl("/register/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        let errorMsg = typeof data === "object" ? Object.values(data).flat().join(" ") : data.detail || "Registration failed";
        setMessage(errorMsg);
      } else {
        setIsRegistered(true);
      }
    } catch {
      setMessage("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const response = await fetch(apiUrl("/google-login/"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: tokenResponse.code }),
        });
        const data = await response.json();
        if (response.ok && data.access) {
          localStorage.setItem("jwt", data.access);
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
        padding: "48px 24px", position: "relative", overflow: "hidden", background: "var(--bg-main)"
      }}>
        {/* Background Accents */}
        <div style={{
          position: "fixed", top: "-10%", left: "-10%", width: "50%", height: "50%",
          background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
          filter: "blur(60px)", zIndex: 0
        }} />
        <div style={{
          position: "fixed", bottom: "-10%", right: "-10%", width: "50%", height: "50%",
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
          width: "100%", maxWidth: 640, padding: "40px 48px", zIndex: 1,
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
              Create Account
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 15, margin: "8px 0 0" }}>
              Join Investo and take control of your financial future
            </p>
          </div>

          {!isRegistered ? (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {message && (
                <div style={{
                  background: "var(--danger-bg)", color: "var(--danger-color)",
                  padding: "12px 16px", borderRadius: 12, fontSize: 14,
                  border: "1px solid rgba(239, 68, 68, 0.2)", display: "flex", gap: 8
                }}>
                  <Shield size={18} style={{ flexShrink: 0 }} /> <span>{message}</span>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="floating-input-group">
                  <input type="text" name="first_name" className="floating-input" placeholder=" " value={formData.first_name} onChange={handleChange} required />
                  <label className="floating-label">First Name</label>
                </div>
                <div className="floating-input-group">
                  <input type="text" name="last_name" className="floating-input" placeholder=" " value={formData.last_name} onChange={handleChange} required />
                  <label className="floating-label">Last Name</label>
                </div>
              </div>

              <div className="floating-input-group">
                <input type="text" name="username" className="floating-input" placeholder=" " value={formData.username} onChange={handleChange} required />
                <label className="floating-label">Username</label>
              </div>

              <div className="floating-input-group">
                <input type="email" name="email" className="floating-input" placeholder=" " value={formData.email} onChange={handleChange} required />
                <label className="floating-label">Email Address</label>
              </div>

              <div className="floating-input-group">
                <input type="date" name="date_of_birth" className="floating-input" placeholder=" " value={formData.date_of_birth} onChange={handleChange} required />
                <label className="floating-label" style={{ top: 12, fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>Date of Birth</label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="floating-input-group">
                  <input type={showPassword ? "text" : "password"} name="password" className="floating-input" placeholder=" " value={formData.password} onChange={handleChange} required />
                  <label className="floating-label">Password</label>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex" }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="floating-input-group">
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" className="floating-input" placeholder=" " value={formData.confirmPassword} onChange={handleChange} required />
                  <label className="floating-label">Confirm Password</label>
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex" }}>
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="inv-btn-primary" disabled={loading} style={{ height: 48, fontSize: 16, marginTop: 8 }}>
                {loading ? "Creating Account..." : "Register Account"}
                {!loading && <UserPlus size={18} />}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--success-bg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "var(--success-color)" }}>
                <CheckCircle size={40} />
              </div>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, margin: "0 0 12px" }}>You're all set!</h2>
              <p style={{ color: "var(--text-muted)" }}>Your account has been created successfully. Please check your email to verify your account before logging in.</p>
            </div>
          )}

          {!isRegistered && (
            <>
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
            </>
          )}

          <p style={{ textAlign: "center", margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <button type="button" onClick={() => navigate("/login")} style={{
              background: "none", border: "none", color: "var(--accent)",
              fontWeight: 700, cursor: "pointer", padding: 0
            }}>
              Sign In
            </button>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}