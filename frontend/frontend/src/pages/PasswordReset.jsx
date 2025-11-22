import { useNavigate } from "react-router-dom";
import loginimage from "../assets/loginpage.jpg";
import NormalButton from "../components/NormalButton";
import InputField from "../components/InputField";

function PasswordReset() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-[#0F0505] text-white">
      {/* <div className="w-full h-3/4 flex flex-col md:flex-row items-center justify-center bg-[#290303] p-8 shadow-lg"> */}
            {/* Left Side: Form and Welcome Text */}
            <div className="w-full md:w-1/2 flex flex-col items-center">
            <h1 className="text-4xl font-bold">Reset Password</h1>

            <form className="w-full max-w-sm p-6 rounded-lg shadow-lg mt-4">
              <div className="mb-4">
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="text"
                  name="email"
                  placeholder="Enter your email"
                  required
                  className="w-full px-3 py-2 mt-1 bg-[#0F0505] border-2 border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-[#D90A14]"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Password</label>
                <InputField fieldtype="password" showToggle={true} placeholder="Enter your password"/>
              </div>
              <div className="py-5">
                <NormalButton text="SignUp" bgColor="#D90A14" textColor="white" hoverBorder="#D90A14" hoverBg="#0F0505" hoverText="#D90A14" bColor="#D90A14"/>
              </div>
            </form>
            <p className="mt-4 text-sm">
              Already have an account?{" "}
              <span
                className="text-[#D90A14] cursor-pointer hover:text-[#78050a] font-bold"
                onClick={() => navigate("/login")}
              >
                Login
              </span>
            </p>
          </div>
        {/* Right Side: Image */}
        <div className="hidden md:block w-1/2 h-full relative">
          <img
            src={loginimage}
            alt="Login Illustration"
            className="w-full h-full object-cover opacity-40"
          />
            {/* Overlay Text */}
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <h1 className="font-luckiest text-white text-3xl font-bold">FitForge</h1>
          </div>
        </div>
      {/* </div> */}
    </div>
  );
}

export default PasswordReset;
