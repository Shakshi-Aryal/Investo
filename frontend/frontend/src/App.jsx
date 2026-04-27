// src/AppRoutes.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import VerifyEmail from "./pages/VerifyEmail";
import Glossary from "./pages/Glossary";
import Profile from "./pages/Profile";
import StockCharts from "./pages/StockCharts";
import ExpenseTracker from "./pages/ExpenseTracker";
import ReminderCalendar from "./pages/ReminderCalendar";
import NewsPortal from "./pages/NewsPortal";
import PortfolioManagement from "./pages/PortfolioManagement";

// IMPORT YOUR ADMIN PAGE
// Note: Using 'Admin' (capitalized) is standard React convention 
// even if the filename is admin.jsx
import Admin from "./pages/admin"; 
import Community from "./pages/Community";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect / → /register */}
        <Route path="/" element={<Navigate to="/register" />} />

        {/* Register & Login Pages */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pass" element={<ForgotPassword />} />

        {/* Admin Portal - This fixes the blank page redirect */}
        <Route path="/admin" element={<Admin />} />

        {/* Reset Password */}
        <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />

        {/* Landing */}
        <Route path="/landing" element={<App />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Profile */}
        <Route path="/profile" element={<Profile />} />

        {/* Stock Charts */}
        <Route path="/stock-charts" element={<StockCharts />} />

        {/* Glossary */}
        <Route path="/glossary" element={<Glossary />} />

        {/* Expense Tracker */}
        <Route path="/expense-tracker" element={<ExpenseTracker />} />

        {/* PORTFOLIO MANAGEMENT */}
        <Route path="/portfolio" element={<PortfolioManagement />} />
        <Route path="/portfolio-management" element={<PortfolioManagement />} />

        {/* Reminders */}
        <Route path="/reminders" element={<ReminderCalendar />} />

        {/* NEWS & MARKETS */}
        <Route path="/news" element={<NewsPortal />} />

        {/* Community Chat */}
        <Route path="/community" element={<Community />} />

        {/* Email Verification */}
        <Route path="/verify-email/:uid/:token" element={<VerifyEmail />} />

        {/* Optional: Catch-all for 404 Not Found to avoid future blank pages */}
        <Route path="*" element={<div style={{ padding: "20px" }}>404 - Page Not Found</div>} />

      </Routes>
    </BrowserRouter>
  );
}