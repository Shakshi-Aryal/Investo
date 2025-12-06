import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import loginimage from "../assets/loginpage.jpg";
import googlelogo from "../assets/googlelogo.png";
import InputField from "../components/InputField";
import NormalButton from "../components/NormalButton";

function Register() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match!");
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
        setMessage(
          typeof data === "object"
            ? Object.values(data).flat().join(" ")
            : data.detail || "Something went wrong"
        );
      } else {
        // ✅ Instead of redirect, show verification message
        setIsRegistered(true);
        setMessage("Registration successful! Check your email to verify your account.");
      }
    } catch {
      setMessage("Failed to connect to the server");
    }
  };

  // Google login
  const handleGoogleLogin = async (authCode) => {
    try {
      const response = await fetch("http://localhost:8000/api/google-login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: authCode }),
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
  };

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (tokenResponse) => {
      const code = tokenResponse.code;
      if (!code) {
        setMessage("No auth code received from Google");
        return;
      }
      await handleGoogleLogin(code);
    },
    onError: () => setMessage("Google login failed"),
  });

  return (
    <GoogleOAuthProvider clientId="716900923722-2570apf8khecitbmi9eudofohdrhbsfl.apps.googleusercontent.com">
      <div className="flex h-screen w-screen bg-[#0F0505] text-white overflow-hidden">
        {/* LEFT SIDE */}
        <div className="w-full md:w-1/2 h-full overflow-y-auto p-6 flex flex-col items-center">
          <h1 className="text-4xl font-bold text-center mt-4">Start Your Journey!</h1>
          <h4 className="text-lg mt-2">Create your account</h4>

          {!isRegistered ? (
            <form onSubmit={handleSubmit} className="w-full max-w-sm mt-4 space-y-4 bg-[#1A0B0B] p-6 rounded-lg shadow-lg">
              {message && <p className="text-red-500">{message}</p>}

              <InputField fieldtype="text" name="username" value={formData.username} onChange={handleChange} placeholder="Enter username" label="Username" />
              <InputField fieldtype="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email" label="Email" />
              <InputField fieldtype="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Enter first name" label="First Name" />
              <InputField fieldtype="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Enter last name" label="Last Name" />
              <InputField fieldtype="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} label="Date of Birth" />
              <InputField fieldtype="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter password" label="Password" />
              <InputField fieldtype="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm password" label="Confirm Password" />

              <NormalButton btype="submit" text="Register" bgColor="#D90A14" textColor="white" hoverBorder="#D90A14" hoverBg="#0F0505" hoverText="#D90A14" bColor="#D90A14" />
            </form>
          ) : (
            <div className="w-full max-w-sm mt-4 bg-[#1A0B0B] p-6 rounded-lg shadow-lg text-center">
              <p className="text-green-500">{message}</p>
              <p className="mt-4">After verification, you can <span className="text-[#D90A14] cursor-pointer font-bold" onClick={() => navigate("/login")}>Login</span>.</p>
            </div>
          )}

          {/* Google Login */}
          <div className="mt-4 w-full max-w-sm flex justify-center">
            <button onClick={() => googleLogin()} className="flex items-center justify-center w-max border border-[#D90A14] text-white rounded-full p-2 mt-2 transition-all duration-200 bg-black hover:bg-[#a8151d]">
              <img src={googlelogo} alt="Google logo" className="w-6 h-6 mr-3 rounded-full object-cover" />
              <span className="font-medium tracking-wide">Continue with Google</span>
            </button>
          </div>

          <p className="mt-6 text-sm">
            Already have an account?{" "}
            <span className="text-[#D90A14] cursor-pointer hover:text-[#78050a] font-bold" onClick={() => navigate("/login")}>
              Login
            </span>
          </p>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="hidden md:block md:w-1/2 h-full relative">
          <img src={loginimage} alt="Register Illustration" className="w-full h-full object-cover opacity-40" />
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <h1 className="font-luckiest text-white text-3xl font-bold">Investo</h1>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Register;
