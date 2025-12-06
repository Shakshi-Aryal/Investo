import { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginimage from "../assets/loginpage.jpg";
import googlelogo from "../assets/googlelogo.png";
import InputField from "../components/InputField";
import NormalButton from "../components/NormalButton";
import { useGoogleLogin } from "@react-oauth/google";

function Login() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // -----------------------------
  // NORMAL LOGIN
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

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
        localStorage.setItem("token", data.access); // unified key
        setMessage("Login successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 800);
      }
    } catch (error) {
      setMessage("Failed to connect to the server");
    }
  };

  // -----------------------------
  // GOOGLE LOGIN HANDLER
  // -----------------------------
  const handleGoogleLogin = async (token) => {
    try {
      const response = await fetch("http://localhost:8000/api/google-login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      // Django sometimes returns "access" instead of "token"
      const jwt = data.access || data.token;

      if (jwt) {
        localStorage.setItem("token", jwt); // unified key for both logins
        navigate("/dashboard");
      } else {
        setMessage(data.error || "Google login failed");
      }
    } catch {
      setMessage("Failed to connect to the server");
    }
  };

  // -----------------------------
  // GOOGLE LOGIN TRIGGER
  // -----------------------------
  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) =>
      handleGoogleLogin(tokenResponse.access_token),
    onError: () => setMessage("Google login failed"),
  });

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-[#0F0505] text-white">
      <div className="w-full md:w-1/2 flex flex-col items-center">
        <h1 className="text-4xl font-bold">Welcome!</h1>
        <h4 className="text-lg mt-2">Login with email or username</h4>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm p-6 rounded-lg shadow-lg mt-4 space-y-4 bg-[#1A0B0B]"
        >
          {message && (
            <p className={message.includes("successful") ? "text-green-500" : "text-red-500"}>
              {message}
            </p>
          )}

          <InputField
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter username or email"
            fieldtype="text"
          />

          <InputField
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            fieldtype="password"
            showToggle={true}
          />

          <p
            className="w-full flex py-3 cursor-pointer justify-end text-[#D90A14] hover:text-[#78050a]"
            onClick={() => navigate("/pass")}
          >
            Forgot your password?
          </p>

          <NormalButton
            btype="submit"
            text="Login"
            bgColor="#D90A14"
            textColor="white"
            hoverBorder="#D90A14"
            hoverBg="#0F0505"
            hoverText="#D90A14"
            bColor="#D90A14"
          />
        </form>

        {/* GOOGLE LOGIN BUTTON */}
        <div className="mt-4 w-full max-w-sm flex justify-center">
          <button
            onClick={() => googleLogin()}
            className="flex items-center justify-center w-max border border-[#D90A14] text-white rounded-full p-2 mt-2 transition-all duration-200 bg-black hover:bg-[#a8151d]"
          >
            <img src={googlelogo} alt="Google logo" className="w-6 h-6 mr-3 rounded-full object-cover" />
            <span className="font-medium tracking-wide">Continue with Google</span>
          </button>
        </div>

        <p className="mt-4 text-sm">
          Don't have an account?{" "}
          <span
            className="text-[#D90A14] cursor-pointer hover:text-[#78050a] font-bold"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </div>

      <div className="hidden md:block w-1/2 h-full relative">
        <img src={loginimage} alt="Login Illustration" className="w-full h-full object-cover opacity-40" />
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <h1 className="font-luckiest text-white text-3xl font-bold">Investo</h1>
        </div>
      </div>
    </div>
  );
}

export default Login;
