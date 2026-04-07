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
  .inv-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .inv-label { font-size: 12px; font-weight: 500; letter-spacing: 0.4px; color: var(--label); text-transform: uppercase; }
  .inv-input { width: 100%; padding: 11px 14px; border-radius: 11px; border: 1px solid var(--input-border); background: var(--input-bg); color: inherit; font-family: 'DM Sans', sans-serif; font-size: 14px; transition: border-color 0.18s, box-shadow 0.18s; outline: none; }
  .inv-input:focus { border-color: var(--input-border-focus); box-shadow: 0 0 0 3px var(--accent-dim); }
  .inv-forgot { display: block; text-align: right; font-size: 13px; color: var(--accent); cursor: pointer; margin-top: -8px; margin-bottom: 16px; text-decoration: none; font-weight: 500; }
  .inv-forgot:hover { text-decoration: underline; }
  .inv-btn-submit { width: 100%; padding: 13px; border-radius: 12px; border: none; background: var(--accent); color: white; font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; transition: background 0.2s, transform 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .inv-btn-submit:hover:not(:disabled) { background: var(--accent-hover); }
  .inv-divider { display: flex; align-items: center; gap: 10px; margin: 18px 0; }
  .inv-divider-line { flex: 1; height: 1px; background: var(--divider); }
  .inv-divider span { font-size: 12px; color: var(--muted); white-space: nowrap; }
  .inv-btn-google { width: 100%; padding: 11px 16px; border-radius: 12px; border: 1px solid var(--google-border); background: var(--google-bg); color: inherit; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; }
  .inv-btn-google:hover { background: var(--google-hover); border-color: var(--accent); }
  .inv-btn-google img { width: 18px; height: 18px; }
  .inv-msg-error { padding: 10px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 12px; background: rgba(220,38,38,0.1); color: #ef4444; border: 1px solid rgba(220,38,38,0.18); }
  .inv-footer { font-size: 13px; color: var(--muted); margin-top: 20px; }
  .inv-footer a { color: var(--accent); font-weight: 600; cursor: pointer; text-decoration: none; }
  .inv-footer a:hover { text-decoration: underline; }
  @media (max-width: 768px) { .inv-left { width: 100%; padding: 0 20px 32px; } }
`;

const TOKEN_KEY = "jwt";

function InvestoLogin({ isDarkMode, setIsDarkMode }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Invalid credentials");
      } else {
        localStorage.setItem(TOKEN_KEY, data.access);
        navigate("/dashboard");
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
          localStorage.setItem(TOKEN_KEY, data.access);
          navigate("/dashboard");
        } else {
          setMessage(data.error || "Google login failed");
        }
      } catch {
        setMessage("Failed to connect to server");
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
          <h1>Welcome <span>Back</span></h1>
          <p>Login to manage your portfolio and insights</p>
        </div>

        <form onSubmit={handleSubmit} className="inv-card">
          {message && <div className="inv-msg-error">{message}</div>}
          <div className="inv-field">
            <label className="inv-label">Username or Email</label>
            <input className="inv-input" type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Enter your credentials" required />
          </div>
          <div className="inv-field">
            <label className="inv-label">Password</label>
            <input className="inv-input" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
          </div>
          <a className="inv-forgot" onClick={() => navigate("/pass")}>Forgot password?</a>
          <button type="submit" className="inv-btn-submit" disabled={loading}>
            {loading ? <Spinner size={5} color="white" /> : "Sign In"}
          </button>
          <div className="inv-divider">
            <div className="inv-divider-line" />
            <span>or continue with</span>
            <div className="inv-divider-line" />
          </div>
          <button type="button" className="inv-btn-google" onClick={() => googleLogin()}>
            <img src={googlelogo} alt="Google" />
            Continue with Google
          </button>
        </form>
        <p className="inv-footer">
          Don't have an account? <a onClick={() => navigate("/register")}>Register</a>
        </p>
      </div>
      <InvestoRightPanel isDarkMode={isDarkMode} />
    </div>
  );
}

function Login() {
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
      <InvestoLogin isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
    </GoogleOAuthProvider>
  );
}

export default Login;