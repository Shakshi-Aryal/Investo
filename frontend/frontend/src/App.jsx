import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import FeaturePortfolio from "./pages/FeaturePortfolio";
import FeatureExpenses from "./pages/FeatureExpenses";
import FeatureMarket from "./pages/FeatureMarket";
import FeatureNews from "./pages/FeatureNews";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Login from "./pages/Login";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import VerifyEmail from "./pages/VerifyEmail";
import Glossary from "./pages/Glossary";
import Profile from "./pages/Profile";
import PortfolioManagement from "./pages/PortfolioManagement";
import MarketDashboard from "./pages/MarketDashboard";
import StockDetail from "./pages/StockDetail";
import Notifications from "./pages/Notifications";
import ExpenseTracker from "./pages/ExpenseTracker";
import ReminderCalendar from "./pages/ReminderCalendar";
import NewsPortal from "./pages/NewsPortal";
import Stockcharts from "./pages/Stockcharts";
import { NotificationProvider } from "./context/NotificationContext";
import { PortfolioProvider } from "./context/PortfolioContext";
import GlossaryWidget from "./components/GlossaryWidget";
import { Toaster } from "react-hot-toast";
import Admin from "./pages/admin";
import Settings from "./pages/Settings";
import Community from "./pages/Community";

const toasterOptions = {
  position: "top-right",
  gutter: 12,
  toastOptions: {
    duration: 4000,
    style: {
      borderRadius: "14px",
      background: "var(--card-bg)",
      color: "var(--text-main)",
      border: "1px solid var(--card-border)",
      backdropFilter: "blur(12px)",
      boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
      fontSize: "14px",
      fontWeight: 600,
    },
  },
};

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <PortfolioProvider>
        <Toaster {...toasterOptions} />
        <GlossaryWidget />
        <Routes>
          {/* Landing & Content Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/features/portfolio" element={<FeaturePortfolio />} />
          <Route path="/features/expenses" element={<FeatureExpenses />} />
          <Route path="/features/market" element={<FeatureMarket />} />
          <Route path="/features/news" element={<FeatureNews />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Auth Pages */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pass" element={<ForgotPassword />} />
          <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:uid/:token" element={<VerifyEmail />} />

          {/* Admin Portal */}
          <Route path="/admin" element={<Admin />} />

          {/* Main App */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />

          {/* Stock Market Module */}
          <Route path="/market" element={<MarketDashboard />} />
          <Route path="/market/:symbol" element={<StockDetail />} />
          <Route path="/stock-charts" element={<Stockcharts />} />

          {/* Notifications */}
          <Route path="/notifications" element={<Notifications />} />

          {/* Other Features */}
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/expense-tracker" element={<ExpenseTracker />} />
          <Route path="/portfolio" element={<PortfolioManagement />} />
          <Route path="/portfolio-management" element={<PortfolioManagement />} />
          <Route path="/reminders" element={<ReminderCalendar />} />
          <Route path="/news" element={<NewsPortal />} />
          <Route path="/community" element={<Community />} />
           <Route path="/settings" element={<Settings />} />

          {/* 404 */}
          <Route path="*" element={<div style={{ padding: "20px", color: "#fff" }}>404 - Page Not Found</div>} />
        </Routes>
        </PortfolioProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}
