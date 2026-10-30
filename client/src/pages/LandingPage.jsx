import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BusFront,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export default function LandingPage() {
  const { user, quickLogin } = useAuth();
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    api
      .get("/routes")
      .then((res) => {
        if (res.data.success) setRoutes(res.data.routes);
      })
      .catch(() => {});
  }, []);

  const handleDemoSwitch = async (role) => {
    setSwitching(true);
    try {
      await quickLogin(role);
      if (role.startsWith("student")) navigate("/student");
      else if (role === "conductor") navigate("/conductor");
      else if (role === "admin") navigate("/admin");
    } finally {
      setSwitching(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#001733] text-slate-100">
      {/* Hero Section (Oxford Blue with Vista Blue ambient glow) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#002147] via-[#001733] to-[#001733] text-white pt-16 pb-24 md:pt-24 md:pb-32 border-b border-[#0e428a]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#7C9ED9]/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Column: Headline and CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#7C9ED9]/40 bg-[#7C9ED9]/15 px-4 py-1.5 text-xs font-bold text-[#7C9ED9] shadow-vista-sm">
                <ShieldCheck size={16} className="text-[#7C9ED9]" />
                <span>Next-Gen Institutional Transport Verification</span>
              </div>

              <h1 className="text-4xl font-black tracking-tight sm:text-6xl sm:leading-tight text-white">
                Your bus pass.{" "}
                <span className="block bg-gradient-to-r from-[#7C9ED9] via-[#A5C2F6] to-[#BED5FA] bg-clip-text text-transparent">
                  Always with you.
                </span>
              </h1>

              <p className="max-w-2xl text-base sm:text-lg text-slate-200 leading-relaxed">
                Lost, forgotten, or damaged physical passes are solved permanently.
                SmartBus provides school and college students with secure digital passes featuring live anti-screenshot security tokens,
                enabling conductors to verify authorization in milliseconds.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {user ? (
                  <Link
                    to={user.role === "student" ? "/student" : user.role === "conductor" ? "/conductor" : "/admin"}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#7C9ED9] px-6 py-3.5 text-sm font-black text-[#001733] shadow-vista transition hover:bg-[#688ed0]"
                  >
                    Go to Your Dashboard ({user.role.toUpperCase()})
                    <ArrowRight size={17} />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#7C9ED9] px-6 py-3.5 text-sm font-black text-[#001733] shadow-vista transition hover:bg-[#688ed0]"
                    >
                      Sign In to SmartBus
                      <ArrowRight size={17} />
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 rounded-xl border border-[#0e428a] bg-[#042a59] px-6 py-3.5 text-sm font-bold text-slate-200 transition hover:bg-[#083570] hover:text-[#7C9ED9] hover:border-[#7C9ED9]/50"
                    >
                      Student Registration
                    </Link>
                  </>
                )}
              </div>

              {/* 1-Click Interactive Demo Launcher Bar */}
              <div className="pt-6 border-t border-[#0e3b79]">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#7C9ED9]" />
                  Instant Live Demo Presets (Test any role without typing):
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleDemoSwitch("student_active")}
                    disabled={switching}
                    className="rounded-xl bg-[#042a59] hover:bg-[#093976] border border-[#7C9ED9]/40 px-3.5 py-1.5 text-xs font-bold text-[#7C9ED9] transition shadow-vista-sm"
                  >
                    🎓 Student (Active Pass)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoSwitch("conductor")}
                    disabled={switching}
                    className="rounded-xl bg-[#042a59] hover:bg-[#093976] border border-cyan-500/30 px-3.5 py-1.5 text-xs font-bold text-cyan-300 transition"
                  >
                    🚌 Bus Conductor (QR Scanner)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoSwitch("admin")}
                    disabled={switching}
                    className="rounded-xl bg-[#042a59] hover:bg-[#093976] border border-purple-500/30 px-3.5 py-1.5 text-xs font-bold text-purple-300 transition"
                  >
                    🛡️ College Admin (Fleet Approvals)
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Digital Pass Card Preview (Vista Blue & Oxford Style) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-3xl bg-[#031d40] border border-[#7C9ED9]/50 p-5 shadow-vista relative overflow-hidden">
                {/* Floating pill badge */}
                <div className="flex items-center justify-between pb-4 border-b border-[#0e428a]">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[#7C9ED9] text-[#001733] flex items-center justify-center shadow-sm">
                      <BusFront size={18} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">APEX TRANSIT</h4>
                      <p className="text-[10px] text-slate-300">Digital Student Pass</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#7C9ED9]/25 border border-[#7C9ED9]/60 px-2.5 py-0.5 text-[10px] font-black text-[#7C9ED9] shadow-vista-sm">
                    ● ACTIVE
                  </span>
                </div>

                {/* Profile snippet */}
                <div className="flex items-center gap-3.5 my-4">
                  <img
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80"
                    alt="Student"
                    className="h-14 w-14 rounded-xl object-cover ring-2 ring-[#7C9ED9]/60 shadow-vista-sm"
                  />
                  <div>
                    <h3 className="font-bold text-white text-base">Rahul Kumar</h3>
                    <p className="text-xs font-mono font-bold text-[#7C9ED9]">COL2026001</p>
                    <p className="text-[11px] text-slate-300">B.Tech Computer Science</p>
                  </div>
                </div>

                {/* QR Code box mockup */}
                <div className="rounded-2xl bg-white p-4 flex flex-col items-center justify-center text-slate-900 my-3 shadow-inner">
                  <QrCode size={110} className="text-[#001733]" />
                  <span className="text-[10px] font-mono font-bold text-slate-700 mt-2 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    PASS-A8X72K
                  </span>
                </div>

                {/* Route info in Oxford Slate */}
                <div className="rounded-xl bg-[#021836] p-3 space-y-1.5 text-xs border border-[#0e428a]">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Route:</span>
                    <span className="font-semibold text-slate-100">North Campus Express</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Assigned Bus:</span>
                    <span className="font-mono font-bold text-[#7C9ED9]">KA-09-AB-1234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Valid Until:</span>
                    <span className="font-mono font-bold text-white">31 Dec 2026</span>
                  </div>
                </div>

                <div className="mt-3 text-center text-[10px] text-[#7C9ED9] font-mono">
                  Live encrypted token • Anti-screenshot security enabled
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs Solution Comparison Section */}
      <section className="py-20 bg-[#001b3b] border-b border-[#0e428a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-[#7C9ED9] bg-[#7C9ED9]/15 border border-[#7C9ED9]/30 px-3 py-1 rounded-full">
              The Real Problem
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Why Traditional Plastic Passes Fail
            </h2>
            <p className="mt-3 text-slate-300 text-sm">
              Students and transport administrators struggle daily with antiquated paper or plastic card passes.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* The Old Painful Way */}
            <div className="rounded-3xl border border-rose-500/30 bg-rose-950/20 p-8 shadow-sm">
              <div className="inline-flex rounded-xl bg-rose-500/20 p-3 text-rose-400 mb-4 border border-rose-500/30">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Traditional Physical Passes</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span><strong>Forgotten or left at home:</strong> Students face travel denial even though bus fees have already been paid.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span><strong>Lost or stolen cards:</strong> Anyone finding the card can attempt to travel using another student's pass.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span><strong>Slow manual inspection:</strong> Bus conductors waste time visually checking worn-out laminated badges.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span><strong>Lengthy reprint delays:</strong> Reissuing a physical pass takes days or weeks through administrative red tape.</span>
                </li>
              </ul>
            </div>

            {/* The SmartBus Solution (Vista Blue & Oxford) */}
            <div className="rounded-3xl border border-[#7C9ED9]/50 bg-[#7C9ED9]/10 p-8 shadow-vista">
              <div className="inline-flex rounded-xl bg-[#7C9ED9]/20 p-3 text-[#7C9ED9] mb-4 border border-[#7C9ED9]/40">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">The SmartBus Digital Solution</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-100">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#7C9ED9] font-bold">✓</span>
                  <span><strong>Always accessible:</strong> Students access their verified pass on any mobile phone or browser anytime.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#7C9ED9] font-bold">✓</span>
                  <span><strong>1-Click Lost Pass Lockdown:</strong> If a physical card is lost, student suspends it instantly to prevent misuse.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#7C9ED9] font-bold">✓</span>
                  <span><strong>Real-Time Sub-Second QR Scan:</strong> Conductor's phone verifies validity, student photo, and route instantly.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#7C9ED9] font-bold">✓</span>
                  <span><strong>Student ID Fallback:</strong> Forgot your phone? Conductor looks up your Student ID in the system database.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Three Pillars: Student, Conductor, Admin */}
      <section className="py-20 bg-[#001733] border-b border-[#0e428a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black tracking-tight text-white">
              Three Portals. One Connected Ecosystem.
            </h2>
            <p className="mt-3 text-slate-300 text-sm">
              Tailored experiences for students, bus staff, and campus administrators.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Student Card */}
            <div className="rounded-3xl border border-[#0e428a] bg-[#042a59] p-7 transition hover:border-[#7C9ED9]/60 hover:shadow-vista-sm">
              <div className="h-12 w-12 rounded-2xl bg-[#7C9ED9]/20 text-[#7C9ED9] border border-[#7C9ED9]/40 flex items-center justify-center mb-5">
                <Smartphone size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">1. Student Portal</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                View your active bus pass, QR code, route stops, and validity countdown. Request renewals and report lost passes in seconds.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => handleDemoSwitch("student_active")}
                  className="text-xs font-bold text-[#7C9ED9] hover:underline flex items-center gap-1"
                >
                  Explore Student View <ChevronRight size={15} />
                </button>
              </div>
            </div>

            {/* Conductor Card */}
            <div className="rounded-3xl border border-[#0e428a] bg-[#042a59] p-7 transition hover:border-[#7C9ED9]/60 hover:shadow-vista-sm">
              <div className="h-12 w-12 rounded-2xl bg-[#7C9ED9]/20 text-[#7C9ED9] border border-[#7C9ED9]/40 flex items-center justify-center mb-5">
                <QrCode size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">2. Conductor Portal</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Lightning-fast browser camera QR scanner with instant VALID / EXPIRED / SUSPENDED badges, photo identification, and ID lookup.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => handleDemoSwitch("conductor")}
                  className="text-xs font-bold text-[#7C9ED9] hover:underline flex items-center gap-1"
                >
                  Explore Conductor View <ChevronRight size={15} />
                </button>
              </div>
            </div>

            {/* Admin Card */}
            <div className="rounded-3xl border border-[#0e428a] bg-[#042a59] p-7 transition hover:border-purple-500/50">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center mb-5">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">3. Admin Portal</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Full fleet oversight: approve applications, manage renewals, register bus routes & stops, handle lost card reports, and view audit charts.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => handleDemoSwitch("admin")}
                  className="text-xs font-bold text-purple-300 hover:underline flex items-center gap-1"
                >
                  Explore Admin View <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Routes Directory Preview */}
      {routes.length > 0 && (
        <section className="py-20 bg-[#001b3b] border-b border-[#0e428a]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#7C9ED9]">Campus Transit Fleet</span>
                <h2 className="mt-1 text-2xl font-black text-white">Available Bus Routes</h2>
              </div>
              <Link
                to="/register"
                className="text-xs font-bold text-[#7C9ED9] hover:underline flex items-center gap-1"
              >
                Apply for a route pass <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {routes.map((route) => (
                <div key={route.routeId} className="rounded-2xl border border-[#0e428a] bg-[#042a59] p-5 hover:border-[#7C9ED9]/50 transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-[#7C9ED9] font-mono bg-[#7C9ED9]/15 border border-[#7C9ED9]/30 px-2 py-0.5 rounded">
                      {route.routeId}
                    </span>
                    <span className="text-xs font-mono font-bold text-white bg-[#001733] border border-[#0e428a] px-2 py-0.5 rounded">
                      {route.busNumber}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{route.routeName}</h4>
                  <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                    <MapPin size={13} className="text-[#7C9ED9]" />
                    {route.stops?.length || 0} Scheduled Stops
                  </p>
                  <div className="mt-4 border-t border-[#0e3b79] pt-3 flex items-center justify-between text-[11px] text-slate-300">
                    <span>Driver: {route.driverName?.split(" ")[0]}</span>
                    <span>Cap: {route.capacity} seats</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-[#0e428a] bg-[#00142e] py-10 text-center text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4">
          <p className="font-bold text-slate-200">SmartBus — Smart Digital Bus Pass & Student Verification System</p>
          <p className="mt-1">Theme: Oxford Blue & Vista Blue • Built with React, Vite, Node.js, Express, and MongoDB.</p>
          <p className="mt-3">© {new Date().getFullYear()} Apex Institute of Technology Transit Division. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
