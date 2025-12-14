// src/AppRoutes.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import ForgotPassword from "./components/ForgotPassword"; // ✅ Forgot Password page
import ResetPassword from "./pages/ResetPassword"; // ✅ Reset Password page
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import VerifyEmail from "./pages/VerifyEmail";
import Glossary from "./pages/Glossary";
import Profile from "./pages/Profile";
import StockCharts from "./pages/StockCharts"; 
import ExpenseTracker from "./pages/ExpenseTracker"; 

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Redirect / → /register */}
        <Route path="/" element={<Navigate to="/register" />} />

        {/* Register & Login Pages */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pass" element={<ForgotPassword />} /> {/* ✅ Forgot Password */}

        {/* Reset Password Page */}
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

        {/* Landing Page */}
        <Route path="/landing" element={<App />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Profile Page */}
        <Route path="/profile" element={<Profile />} />

        {/* Stock Charts */}
        <Route path="/stock-charts" element={<StockCharts />} />

        {/* Glossary */}
        <Route path="/glossary" element={<Glossary />} />

        {/* Expense Tracker */}
        <Route path="/expense-tracker" element={<ExpenseTracker />} />

        {/* Email Verification */}
        <Route path="/verify-email/:uid/:token" element={<VerifyEmail />} />

      </Routes>
    </BrowserRouter>
  );
}
