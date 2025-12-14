import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NormalButton from "../components/NormalButton";
import InputField from "../components/InputField";

function ResetPassword() {
  const navigate = useNavigate();
  const { uid, token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/reset-password/${uid}/${token}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.error || "Failed to reset password");
      }
    } catch (err) {
      setMessage("Failed to connect to the server");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-[#0F0505] text-white">
      <div className="w-full md:w-1/3 flex flex-col items-center bg-[#1A0B0B] p-6 rounded-lg shadow-lg space-y-4">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        {message && (
          <p
            className={
              message.includes("successful") ? "text-green-500" : "text-red-500"
            }
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <InputField
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            fieldtype="password"
            showToggle={true}
          />

          <InputField
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            fieldtype="password"
            showToggle={true}
          />

          <NormalButton
            btype="submit"
            text="Reset Password"
            bgColor="#D90A14"
            textColor="white"
            hoverBorder="#D90A14"
            hoverBg="#0F0505"
            hoverText="#D90A14"
            bColor="#D90A14"
          />
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
