import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  BusFront,
  Lock,
  Mail,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  QrCode,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [emailOrId, setEmailOrId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const redirectAfterLogin = (role) => {
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
      return;
    }
    if (role === "student") navigate("/student");
    else if (role === "conductor") navigate("/conductor");
    else if (role === "admin") navigate("/admin");
    else navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(emailOrId, password);
      redirectAfterLogin(res.user.role);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPreset = async (roleKey) => {
    setError(null);
    setLoading(true);
    try {
      const res = await quickLogin(roleKey);
      redirectAfterLogin(res.user.role);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 bg-[#001733]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#7C9ED9] to-[#3a64a8] text-[#001733] shadow-vista">
            <BusFront size={26} className="stroke-[2.5]" />
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Sign In to SmartBus
          </h2>
          <p className="mt-1 text-xs text-slate-300">
            Access your digital pass or verification portal
          </p>
        </div>

        {/* 1-Click Quick Demo Presets Box (Oxford & Vista) */}
        <div className="rounded-2xl border border-[#7C9ED9]/40 bg-[#042a59] p-4 shadow-vista-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#7C9ED9] mb-2.5">
            <Sparkles size={14} className="text-[#7C9ED9]" />
            <span>Instant Demo Logins (No password typing needed):</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickPreset("admin")}
              disabled={loading}
              className="flex items-center justify-between rounded-xl border border-purple-500/30 bg-[#021836] p-2.5 font-bold text-purple-300 hover:bg-[#083570] transition"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-purple-400" /> Admin
              </span>
              <span className="text-[10px] text-purple-300 font-normal">Fleet</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPreset("conductor")}
              disabled={loading}
              className="flex items-center justify-between rounded-xl border border-[#7C9ED9]/40 bg-[#021836] p-2.5 font-bold text-[#7C9ED9] hover:bg-[#083570] transition"
            >
              <span className="flex items-center gap-1.5">
                <QrCode size={14} className="text-[#7C9ED9]" /> Conductor
              </span>
              <span className="text-[10px] text-[#A5C2F6] font-normal">Scanner</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPreset("student_active")}
              disabled={loading}
              className="flex items-center justify-between rounded-xl border border-cyan-500/30 bg-[#021836] p-2.5 font-bold text-cyan-300 hover:bg-[#083570] transition"
            >
              <span className="flex items-center gap-1.5">
                <GraduationCap size={14} className="text-cyan-400" /> Active Pass
              </span>
              <span className="text-[10px] text-[#7C9ED9] font-black">VALID</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPreset("student_expired")}
              disabled={loading}
              className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-[#021836] p-2.5 font-bold text-amber-300 hover:bg-[#083570] transition"
            >
              <span className="flex items-center gap-1.5">
                <GraduationCap size={14} className="text-amber-400" /> Expired Pass
              </span>
              <span className="text-[10px] text-amber-400 font-bold">EXPIRED</span>
            </button>
          </div>
        </div>

        {/* Main Login Card (Oxford Blue Surface) */}
        <div className="rounded-3xl border border-[#0e428a] bg-[#042a59] p-8 shadow-2xl">
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-xl bg-rose-500/15 border border-rose-500/30 p-3 text-xs text-rose-300">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Email Address or Student ID
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={emailOrId}
                  onChange={(e) => setEmailOrId(e.target.value)}
                  placeholder="e.g. rahul@college.edu or COL2026001"
                  className="w-full rounded-xl border border-[#0e428a] bg-[#001733] py-2.5 pl-10 pr-4 text-xs text-white focus:border-[#7C9ED9] focus:outline-none focus:ring-1 focus:ring-[#7C9ED9]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#0e428a] bg-[#001733] py-2.5 pl-10 pr-4 text-xs text-white focus:border-[#7C9ED9] focus:outline-none focus:ring-1 focus:ring-[#7C9ED9]"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-300">
                Demo passwords: <code>Student@123</code>, <code>Conductor@123</code>, <code>Admin@123</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[#7C9ED9] py-3 text-xs font-black text-[#001733] shadow-vista transition hover:bg-[#688ed0] disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 border-t border-[#0e3b79] pt-5 text-center text-xs text-slate-300">
            Don't have an institutional account?{" "}
            <Link to="/register" className="font-bold text-[#7C9ED9] hover:underline">
              Register as Student
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
