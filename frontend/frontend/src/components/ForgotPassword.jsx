import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import NormalButton from "../components/NormalButton";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/forgot-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Check your email for a reset link!");
      } else {
        setMessage(data.error || "Something went wrong");
      }
    } catch (err) {
      setMessage("Failed to connect to the server");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-[#0F0505] text-white">
      <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-[#1A0B0B]">
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
        <p className="mb-4 text-gray-300">
          Enter your email to receive a password reset link.
        </p>

        {message && (
          <p className={message.includes("Check") ? "text-green-500 mb-2" : "text-red-500 mb-2"}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            fieldtype="email"
          />

          <NormalButton
            btype="submit"
            text={loading ? "Sending..." : "Send Reset Link"}
            bgColor="#D90A14"
            textColor="white"
            hoverBorder="#D90A14"
            hoverBg="#0F0505"
            hoverText="#D90A14"
            bColor="#D90A14"
          />
        </form>

        <p
          className="mt-4 text-sm text-[#D90A14] cursor-pointer hover:text-[#78050a]"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
