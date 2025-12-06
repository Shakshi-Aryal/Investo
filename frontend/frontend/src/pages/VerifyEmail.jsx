import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function VerifyEmail() {
  const { uid, token } = useParams(); // from route /verify-email/:uid/:token
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/verify-email/${uid}/${token}/`, {
          method: "GET",
        });

        const data = await response.json();

        if (response.ok) {
          setMessage("Email verified successfully! Redirecting to login...");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setMessage(data.error || "Invalid or expired verification link");
        }
      } catch {
        setMessage("Failed to connect to server");
      }
    };

    verify();
  }, [uid, token, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#0F0505] text-white">
      <div className="bg-[#1A0B0B] p-8 rounded-lg shadow-lg text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default VerifyEmail;
