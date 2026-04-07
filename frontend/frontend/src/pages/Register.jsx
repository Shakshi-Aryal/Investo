import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import Darklogo from "../assets/Darklogo.png";
import Lightlogo from "../assets/Lightlogo.png";
import googlelogo from "../assets/googlelogo.png";
import Spinner from "../components/Spinner";
import InvestoRightPanel from "../components/InvestoRightPanel";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  .inv-root *, .inv-root *::before, .inv-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .inv-root {
    font-family: 'DM Sans', sans-serif;
    display: flex;
    width: 100vw;
    min-height: 100vh;
    overflow: hidden;
    transition: background 0.35s, color 0.35s;
  }
  .inv-dark {
    background: #080306;
    color: #f0eaea;
    --accent: #D90A14;
    --accent-dim: rgba(217,10,20,0.12);
    --accent-hover: #b5080f;
    --card-bg: #110709;
    --card-border: rgba(217,10,20,0.14);
    --input-bg: #0d0508;
    --input-border: rgba(217,10,20,0.18);
    --input-border-focus: #D90A14;
    --label: #9a7a7c;
    --muted: #6a4a4c;
    --panel-bg: linear-gradient(145deg, #110207 0%, #1e040a 50%, #100206 100%);
    --google-bg: #110709;
    --google-border: rgba(217,10,20,0.22);
    --google-hover: rgba(217,10,20,0.1);
    --divider: rgba(217,10,20,0.14);
    --success-bg: rgba(34,197,94,0.1);
  }
  .inv-light {
    background: #faf8f3;
    color: #1a1208;
    --accent: #BA7517;
    --accent-dim: rgba(186,117,23,0.1);
    --accent-hover: #9a5f10;
    --card-bg: #ffffff;
    --card-border: rgba(186,117,23,0.18);
    --input-bg: #fffcf5;
    --input-border: rgba(186,117,23,0.22);
    --input-border-focus: #BA7517;
    --label: #8a6a3a;
    --muted: #b09060;
    --panel-bg: linear-gradient(145deg, #fff9ee 0%, #fdf0ce 50%, #fff5e0 100%);
    --google-bg: #ffffff;
    --google-border: rgba(186,117,23,0.22);
    --google-hover: rgba(186,117,23,0.07);
    --divider: rgba(186,117,23,0.18);
    --success-bg: rgba(34,197,94,0.08);
  }
  .inv-left { width: 55%; min-height: 100vh; padding: 0 48px 48px; display: flex; flex-direction: column; align-items: center; overflow-y: auto; position: relative; }
  .inv-topbar { width: 100%; max-width: 440px; display: flex; justify-content: space-between; align-items: center; padding: 28px 0 0; margin-bottom: 8px; }
  .inv-logo { width: 130px; object-fit: contain; }
  .inv-toggle { padding: 8px 18px; border-radius: 40px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid var(--card-border); background: var(--card-bg); color: inherit; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
  .inv-toggle:hover { border-color: var(--accent); }
  .inv-hero { text-align: center; margin: 18px 0 22px; }
  .inv-hero h1 { font-family: 'Syne', sans-serif; font-size: 30px; font-weight: 800; letter-spacing: -0.8px; line-height: 1.15; }
  .inv-hero h1 span { color: var(--accent); }
  .inv-hero p { font-size: 14px; color: var(--label); margin-top: 6px; }
  .inv-card { width: 100%; max-width: 440px; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px; padding: 28px 28px 24px; }
  .inv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .inv-full { grid-column: 1 / -1; }
  .inv-field { display: flex; flex-direction: column; gap: 6px; }
  .inv-label { font-size: 12px; font-weight: 500; letter-spacing: 0.4px; color: var(--label); text-transform: uppercase; }
  .inv-input { width: 100%; padding: 11px 14px; border-radius: 11px; border: 1px solid var(--input-border); background: var(--input-bg); color: inherit; font-family: 'DM Sans', sans-serif; font-size: 14px; transition: border-color 0.18s, box-shadow 0.18s; outline: none; }
  .inv-input:focus { border-color: var(--input-border-focus); box-shadow: 0 0 0 3px var(--accent-dim); }
  .inv-btn-submit { width: 100%; padding: 13px; border-radius: 12px; border: none; background: var(--accent); color: white; font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; transition: background 0.2s, transform 0.15s; margin-top: 6px; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .inv-btn-submit:hover:not(:disabled) { background: var(--accent-hover); }
  .inv-divider { display: flex; align-items: center; gap: 10px; margin: 18px 0; }
  .inv-divider-line { flex: 1; height: 1px; background: var(--divider); }
  .inv-divider span { font-size: 12px; color: var(--muted); white-space: nowrap; }
  .inv-btn-google { width: 100%; padding: 11px 16px; border-radius: 12px; border: 1px solid var(--google-border); background: var(--google-bg); color: inherit; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; }
  .inv-btn-google:hover { background: var(--google-hover); border-color: var(--accent); }
  .inv-btn-google img { width: 18px; height: 18px; }
  .inv-msg-error { padding: 10px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 12px; background: rgba(220,38,38,0.1); color: #ef4444; border: 1px solid rgba(220,38,38,0.18); }
  .inv-footer { font-size: 13px; color: var(--muted); margin-top: 20px; padding-bottom: 32px; }
  .inv-footer a { color: var(--accent); font-weight: 600; cursor: pointer; text-decoration: none; }
  .inv-footer a:hover { text-decoration: underline; }
  .inv-success-box { width: 100%; max-width: 440px; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px; padding: 36px 28px; text-align: center; }
  .inv-success-icon { width: 56px; height: 56px; border-radius: 50%; background: var(--success-bg); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 26px; }
  @media (max-width: 768px) { .inv-left { width: 100%; padding: 0 20px 32px; } }
`;

function InvestoRegister({ isDarkMode, setIsDarkMode }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "", email: "", password: "", confirmPassword: "",
    first_name: "", last_name: "", date_of_birth: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match!");
      setLoading(false);
      return;
    }

    const payload = { ...formData };
    delete payload.confirmPassword;

    try {
      const response = await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        let errorMsg = typeof data === "object" ? Object.values(data).flat().join(" ") : data.detail || "Something went wrong";
        setMessage(errorMsg);
      } else {
        setIsRegistered(true);
      }
    } catch {
      setMessage("Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (tokenResponse) => {
      try {
        const response = await fetch("http://localhost:8000/api/google-login/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: tokenResponse.code }),
        });
        const data = await response.json();
        if (response.ok && data.access) {
          localStorage.setItem("jwt", data.access);
          navigate("/dashboard");
        } else {
          setMessage(data.error || "Google login failed");
        }
      } catch {
        setMessage("Failed to connect to the server");
      }
    },
    onError: () => setMessage("Google login failed"),
  });

  return (
    <div className={`inv-root ${isDarkMode ? "inv-dark" : "inv-light"}`}>
      <div className="inv-left">
        <div className="inv-topbar">
          <img src={isDarkMode ? Darklogo : Lightlogo} alt="Investo" className="inv-logo" />
          <button className="inv-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? "☀ Light" : "☾ Dark"}
          </button>
        </div>

        <div className="inv-hero">
          <h1>Start Your <span>Journey</span></h1>
          <p>Create your account and take control of your finances</p>
        </div>

        {!isRegistered ? (
          <form onSubmit={handleSubmit} className="inv-card">
            {message && <div className="inv-msg-error">{message}</div>}
            <div className="inv-grid">
              <div className="inv-field"><label className="inv-label">First Name</label><input className="inv-input" type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="John" required /></div>
              <div className="inv-field"><label className="inv-label">Last Name</label><input className="inv-input" type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Doe" required /></div>
              <div className="inv-field inv-full"><label className="inv-label">Username</label><input className="inv-input" type="text" name="username" value={formData.username} onChange={handleChange} placeholder="johndoe123" required /></div>
              <div className="inv-field inv-full"><label className="inv-label">Email Address</label><input className="inv-input" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required /></div>
              <div className="inv-field inv-full"><label className="inv-label">Date of Birth</label><input className="inv-input" type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required /></div>
              <div className="inv-field"><label className="inv-label">Password</label><input className="inv-input" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required /></div>
              <div className="inv-field"><label className="inv-label">Confirm</label><input className="inv-input" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required /></div>
            </div>
            <button type="submit" className="inv-btn-submit" disabled={loading}>{loading ? <Spinner size={5} color="white" /> : "Create Account"}</button>
            <div className="inv-divider"><div className="inv-divider-line" /><span>or continue with</span><div className="inv-divider-line" /></div>
            <button type="button" className="inv-btn-google" onClick={() => googleLogin()}><img src={googlelogo} alt="Google" />Continue with Google</button>
          </form>
        ) : (
          <div className="inv-success-box"><div className="inv-success-icon">✓</div><h2>You&apos;re registered!</h2><p>Check your email to verify your account. Once verified, you can <a onClick={() => navigate("/login")}>sign in</a>.</p></div>
        )}
        <p className="inv-footer">Already have an account? <a onClick={() => navigate("/login")}>Sign in</a></p>
      </div>
      <InvestoRightPanel isDarkMode={isDarkMode} />
    </div>
  );
}

function Register() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  return (
    <GoogleOAuthProvider clientId="716900923722-2570apf8khecitbmi9eudofohdrhbsfl.apps.googleusercontent.com">
      <style>{css}</style>
      <InvestoRegister isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
    </GoogleOAuthProvider>
  );
}

export default Register;