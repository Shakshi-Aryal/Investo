import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import PasswordReset from "./pages/PasswordReset";
import Register from "./pages/Register";

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

          {/* Landing Page moved to /landing */}
          <Route path="/landing" element={<App />} />

        </Routes>
      </BrowserRouter>
    );
}
