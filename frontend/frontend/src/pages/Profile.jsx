import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

const TOKEN_KEY = "jwt";

const css = `
  .profile-card {
    width: 100%; max-width: 500px;
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: var(--border-radius-lg); padding: 40px; backdrop-filter: blur(10px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    position: relative; margin: 0 auto;
  }

  .avatar-box {
    width: 80px; height: 80px; background: var(--accent);
    border-radius: var(--border-radius-lg); margin: 0 auto 20px; display: flex;
    align-items: center; justify-content: center; font-size: 32px;
    color: white; font-family: var(--font-heading); box-shadow: 0 10px 20px var(--accent-glow);
  }

  .info-row { margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--card-border); }
  .info-label { font-size: 10px; text-transform: uppercase; color: var(--text-muted); font-weight: 800; letter-spacing: 1px; }
  .info-value { font-size: 16px; font-weight: 600; margin-top: 4px; }

  .feat-input {
    width: 100%; padding: 12px 16px; background: var(--input-bg);
    border: 1px solid var(--card-border); border-radius: var(--border-radius-md);
    color: inherit; outline: none; transition: 0.3s; margin-top: 5px;
    font-family: var(--font-primary);
  }
  .feat-input:focus { border-color: var(--accent); box-shadow: 0 0 10px var(--accent-glow); }

  .btn-group { display: flex; gap: 12px; margin-top: 20px; }
  .btn-main {
    flex: 1; padding: 14px; background: var(--accent);
    color: white; border: none; border-radius: 14px;
    font-family: var(--font-heading); font-weight: 700; cursor: pointer; transition: 0.3s;
  }
  .btn-main:hover { opacity: 0.9; transform: translateY(-2px); }

  .btn-cancel {
    flex: 1; padding: 14px; background: transparent;
    border: 1px solid var(--card-border); border-radius: 14px;
    color: var(--text-muted); cursor: pointer; transition: 0.2s;
    font-family: var(--font-primary);
  }
  .btn-cancel:hover { background: var(--accent-dim); color: var(--accent); }

  .status-msg { padding: 12px; border-radius: 10px; font-size: 13px; margin-bottom: 20px; text-align: center; font-weight: 500; }
  .error-box { background: var(--danger-bg); color: var(--danger-color); border: 1px solid var(--danger-color); }
  .success-box { background: var(--success-bg); color: var(--success-color); border: 1px solid var(--success-color); }
`;

function Profile() {
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({ username: "", first_name: "", last_name: "", email: "", date_of_birth: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) { setError("Not logged in."); setLoading(false); return; }
        const response = await axios.get("http://127.0.0.1:8000/api/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
      } catch (err) {
        setError("Failed to fetch profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await axios.put("http://127.0.0.1:8000/api/profile/", userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(response.data);
      setSuccess("Profile updated!");
      setTimeout(() => setEditing(false), 1000);
    } catch (err) {
      setError("Update failed.");
    }
  };

  if (loading) return (
    <MainLayout>
      <style>{css}</style>
      <div className="profile-card" style={{textAlign:'center'}}>Syncing Secure Profile...</div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <style>{css}</style>

      {/* ── PROFILE CONTENT ── */}
      <div className="profile-card">
        <div className="avatar-box">{userData.username?.charAt(0).toUpperCase()}</div>
        <h1 style={{ fontFamily: 'var(--font-heading)', textAlign: 'center', marginBottom: '30px', fontSize: '32px' }}>
            Account <span className="heading-gradient">Settings</span>
        </h1>

        {error && !editing ? (
          <div style={{textAlign:'center'}}>
            <p className="status-msg error-box">{error}</p>
            <button className="btn-main" onClick={() => navigate("/login")}>Go to Login</button>
          </div>
        ) : !editing ? (
          <div>
            <div className="info-row"><div className="info-label">Username</div><div className="info-value">{userData.username}</div></div>
            <div className="info-row"><div className="info-label">Full Name</div><div className="info-value">{userData.first_name} {userData.last_name}</div></div>
            <div className="info-row"><div className="info-label">Email</div><div className="info-value">{userData.email}</div></div>
            <div className="info-row"><div className="info-label">Date of Birth</div><div className="info-value">{userData.date_of_birth || "—"}</div></div>
            <button className="btn-main" onClick={() => setEditing(true)}>Modify Details</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {success && <div className="status-msg success-box">{success}</div>}
            {error && <div className="status-msg error-box">{error}</div>}

            {["username", "first_name", "last_name", "email", "date_of_birth"].map((field) => (
              <div key={field} style={{marginBottom: '15px'}}>
                <label className="info-label">{field.replace("_", " ")}</label>
                <input
                  type={field === "date_of_birth" ? "date" : field === "email" ? "email" : "text"}
                  name={field}
                  value={userData[field] || ""}
                  onChange={handleChange}
                  className="feat-input"
                />
              </div>
            ))}

            <div className="btn-group">
              <button type="submit" className="btn-main">Save Changes</button>
              <button type="button" className="btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}

export default Profile;