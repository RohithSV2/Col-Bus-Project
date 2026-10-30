import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboard from "./pages/StudentDashboard";
import ConductorDashboard from "./pages/ConductorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#001733] text-slate-100 flex flex-col font-sans selection:bg-[#7C9ED9] selection:text-[#001733]">
          <Navbar />
          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Student Portal */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={["student", "admin"]}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Conductor Portal */}
              <Route
                path="/conductor"
                element={
                  <ProtectedRoute allowedRoles={["conductor", "admin"]}>
                    <ConductorDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Portal */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
