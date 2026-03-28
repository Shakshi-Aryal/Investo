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

// Existing
import ReminderCalendar from "./pages/ReminderCalendar";

// NEW: NEWS PORTAL
import NewsPortal from "./pages/NewsPortal";

// NEW: PORTFOLIO MANAGEMENT
import PortfolioManagement from "./pages/PortfolioManagement";

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

        {/* Email Verification */}
        <Route path="/verify-email/:uid/:token" element={<VerifyEmail />} />

      </Routes>
    </BrowserRouter>
  );
}