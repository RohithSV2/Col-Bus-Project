import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  BusFront,
  LogOut,
  Sparkles,
  ChevronDown,
  QrCode,
  Sliders,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, quickLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleQuickSwitch = async (roleKey) => {
    setSwitching(true);
    setDemoMenuOpen(false);
    try {
      await quickLogin(roleKey);
      if (roleKey.startsWith("student")) navigate("/student");
      else if (roleKey === "conductor") navigate("/conductor");
      else if (roleKey === "admin") navigate("/admin");
    } catch (e) {
      console.error(e);
    } finally {
      setSwitching(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return (
          <span className="rounded-full bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-[10px] font-bold text-purple-300">
            Admin
          </span>
        );
      case "conductor":
        return (
          <span className="rounded-full bg-[#00f5a0]/20 border border-[#00f5a0]/40 px-2 py-0.5 text-[10px] font-bold text-[#00f5a0]">
            Conductor
          </span>
        );
      case "student":
        return (
          <span className="rounded-full bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
            Student
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#1f2433] bg-[#0d0f17]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00f5a0] to-[#059669] text-slate-950 shadow-mint-sm transition group-hover:scale-105">
            <BusFront size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white group-hover:text-[#00f5a0] transition">
                SmartBus
              </span>
              <span className="rounded bg-[#00f5a0]/15 border border-[#00f5a0]/30 px-1.5 py-0.5 text-[10px] font-bold text-[#00f5a0] uppercase tracking-wider">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Digital Pass & Student Transit</p>
          </div>
        </Link>

        {/* Navigation Links based on role */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
          <Link
            to="/"
            className={`rounded-lg px-3 py-2 transition ${
              location.pathname === "/"
                ? "bg-[#161a25] text-[#00f5a0] border border-[#00f5a0]/30 shadow-mint-sm"
                : "text-slate-300 hover:text-white hover:bg-[#161a25]"
            }`}
          >
            Home
          </Link>

          {user && user.role === "student" && (
            <Link
              to="/student"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition ${
                location.pathname.startsWith("/student")
                  ? "bg-[#161a25] text-[#00f5a0] border border-[#00f5a0]/30 shadow-mint-sm"
                  : "text-slate-300 hover:text-white hover:bg-[#161a25]"
              }`}
            >
              <GraduationCap size={15} />
              Student Portal
            </Link>
          )}

          {user && (user.role === "conductor" || user.role === "admin") && (
            <Link
              to="/conductor"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition ${
                location.pathname.startsWith("/conductor")
                  ? "bg-[#161a25] text-[#00f5a0] border border-[#00f5a0]/30 shadow-mint-sm"
                  : "text-slate-300 hover:text-white hover:bg-[#161a25]"
              }`}
            >
              <QrCode size={15} />
              Conductor Scanner
            </Link>
          )}

          {user && user.role === "admin" && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition ${
                location.pathname.startsWith("/admin")
                  ? "bg-[#161a25] text-purple-400 border border-purple-500/30"
                  : "text-slate-300 hover:text-white hover:bg-[#161a25]"
              }`}
            >
              <Sliders size={15} />
              Admin Portal
            </Link>
          )}
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Switcher Button (Electric Mint Theme) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              disabled={switching}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#00f5a0]/40 bg-[#00f5a0]/10 px-3 py-1.5 text-xs font-bold text-[#00f5a0] shadow-mint-sm transition hover:bg-[#00f5a0]/20 focus:outline-none"
              title="Switch demo account roles"
            >
              <Sparkles size={14} className="text-[#00f5a0] animate-pulse" />
              <span>{switching ? "Switching..." : "Demo Switcher"}</span>
              <ChevronDown size={13} className="text-[#00f5a0]" />
            </button>

            {demoMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#23293a] bg-[#12151e] p-2 shadow-2xl ring-1 ring-black/40 z-50 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setDemoMenuOpen(false)}
              >
                <div className="px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                  Instant Demo Roles
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickSwitch("admin")}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-[#1a1f2e] hover:text-purple-300 transition"
                >
                  <span className="text-purple-400 font-bold">Admin</span>
                  <span className="text-[10px] text-slate-400">Fleet & Passes</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSwitch("conductor")}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-[#1a1f2e] hover:text-[#00f5a0] transition"
                >
                  <span className="text-[#00f5a0] font-bold">Conductor</span>
                  <span className="text-[10px] text-slate-400">Live QR Scanner</span>
                </button>
                <div className="my-1.5 border-t border-[#1f2433]"></div>
                <div className="px-2.5 py-1 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Student Scenarios:
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickSwitch("student_active")}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs text-slate-200 hover:bg-[#1a1f2e] transition"
                >
                  <span>Rahul (Active Pass)</span>
                  <span className="rounded bg-[#00f5a0]/20 text-[#00f5a0] px-1.5 py-0.2 text-[10px] font-bold">VALID</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSwitch("student_expired")}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs text-slate-200 hover:bg-[#1a1f2e] transition"
                >
                  <span>Arjun (Expired Pass)</span>
                  <span className="rounded bg-amber-500/20 text-amber-300 px-1.5 py-0.2 text-[10px] font-bold">EXPIRED</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSwitch("student_suspended")}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs text-slate-200 hover:bg-[#1a1f2e] transition"
                >
                  <span>Priya (Lost Card)</span>
                  <span className="rounded bg-rose-500/20 text-rose-300 px-1.5 py-0.2 text-[10px] font-bold">BLOCKED</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSwitch("student_pending")}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs text-slate-200 hover:bg-[#1a1f2e] transition"
                >
                  <span>Ananya (Pending)</span>
                  <span className="rounded bg-slate-700 text-slate-300 px-1.5 py-0.2 text-[10px] font-bold">PENDING</span>
                </button>
              </div>
            )}
          </div>

          {/* User Logged in State */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-white">{user.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400">{user.studentId || user.email}</span>
                  {getRoleBadge(user.role)}
                </div>
              </div>

              {user.photoUrl && (
                <img
                  src={user.photoUrl}
                  alt={user.name}
                  className="h-9 w-9 rounded-xl object-cover ring-2 ring-[#00f5a0]/40 shadow-mint-sm"
                />
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl border border-[#222838] bg-[#161a25] px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-[#202534] hover:text-rose-400"
                title="Sign out"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-300 transition hover:text-white hover:bg-[#161a25]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-[#00f5a0] px-4 py-1.5 text-xs font-black text-slate-950 shadow-mint transition hover:bg-[#00d68b]"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
