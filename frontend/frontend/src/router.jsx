import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import PasswordReset from "./pages/PasswordReset";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import VerifyEmail from "./pages/VerifyEmail";
import Glossary from "./pages/Glossary"; // ✅ new page

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Redirect / → /register */}
        <Route path="/" element={<Navigate to="/register" />} />

        {/* Register & Login Pages */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pass" element={<PasswordReset />} />

        {/* Landing Page */}
        <Route path="/landing" element={<App />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Glossary Page */}
        <Route path="/glossary" element={<Glossary />} />

        {/* Email Verification Route */}
        <Route path="/verify-email/:uid/:token" element={<VerifyEmail />} />

      </Routes>
    </BrowserRouter>
  );
}
