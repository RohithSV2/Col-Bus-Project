import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  ShieldCheck,
  Users,
  BusFront,
  Clock,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Plus,
  RefreshCw,
  Search,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'passes' | 'renewals' | 'routes' | 'students' | 'issues' | 'logs'
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Tab specific data states
  const [passesList, setPassesList] = useState([]);
  const [passFilter, setPassFilter] = useState("all");
  const [passSearch, setPassSearch] = useState("");

  const [renewalsList, setRenewalsList] = useState([]);
  const [routesList, setRoutesList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [issuesList, setIssuesList] = useState([]);
  const [logsList, setLogsList] = useState([]);

  // New Route Modal
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [newRouteForm, setNewRouteForm] = useState({
    routeName: "",
    busNumber: "",
    driverName: "",
    driverPhone: "",
    capacity: 50,
    stopsText: "Central Station (07:30 AM), Metro Gate (07:45 AM), Campus Gate (08:30 AM)",
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, passesRes, renewalsRes, routesRes, studentsRes, issuesRes, logsRes] =
        await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/passes"),
          api.get("/admin/renewals"),
          api.get("/routes"),
          api.get("/admin/students"),
          api.get("/admin/issues"),
          api.get("/admin/logs?limit=50"),
        ]);

      if (statsRes.data.success) setStats(statsRes.data);
      if (passesRes.data.success) setPassesList(passesRes.data.passes);
      if (renewalsRes.data.success) setRenewalsList(renewalsRes.data.renewals);
      if (routesRes.data.success) setRoutesList(routesRes.data.routes);
      if (studentsRes.data.success) setStudentsList(studentsRes.data.students);
      if (issuesRes.data.success) setIssuesList(issuesRes.data.issues);
      if (logsRes.data.success) setLogsList(logsRes.data.logs);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApprovePass = async (passId) => {
    try {
      const res = await api.patch(`/admin/passes/${passId}/approve`, { durationDays: 180 });
      if (res.data.success) {
        setMessage({ type: "success", text: `Pass ${passId} approved and activated!` });
        fetchDashboardData();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to approve pass." });
    }
  };

  const handleRejectPass = async (passId) => {
    const reason = prompt("Enter reason for rejection:", "Application verification requirements not met.");
    if (!reason) return;

    try {
      const res = await api.patch(`/admin/passes/${passId}/reject`, { reason });
      if (res.data.success) {
        setMessage({ type: "success", text: `Pass ${passId} marked as rejected.` });
        fetchDashboardData();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to reject pass." });
    }
  };

  const handleSuspendPass = async (passId) => {
    const reason = prompt("Enter suspension reason:", "Lost card reported / Disciplinary block.");
    if (!reason) return;

    try {
      const res = await api.patch(`/admin/passes/${passId}/suspend`, { reason });
      if (res.data.success) {
        setMessage({ type: "success", text: `Pass ${passId} suspended. Conductor scans will block entry.` });
        fetchDashboardData();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to suspend pass." });
    }
  };

  const handleReactivatePass = async (passId) => {
    try {
      const res = await api.patch(`/admin/passes/${passId}/reactivate`, { extendDays: 90 });
      if (res.data.success) {
        setMessage({ type: "success", text: `Pass ${passId} reactivated successfully!` });
        fetchDashboardData();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to reactivate pass." });
    }
  };

  const handleApproveRenewal = async (requestId) => {
    try {
      const res = await api.patch(`/admin/renewals/${requestId}/approve`);
      if (res.data.success) {
        setMessage({ type: "success", text: `Renewal request #${requestId} approved!` });
        fetchDashboardData();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to approve renewal." });
    }
  };

  const handleRejectRenewal = async (requestId) => {
    const comments = prompt("Enter rejection reason:", "Fee receipt not verified.");
    if (!comments) return;

    try {
      const res = await api.patch(`/admin/renewals/${requestId}/reject`, { comments });
      if (res.data.success) {
        setMessage({ type: "success", text: `Renewal request #${requestId} rejected.` });
        fetchDashboardData();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to reject renewal." });
    }
  };

  const handleResolveIssue = async (issueId) => {
    const resolutionNote = prompt("Enter resolution notes:", "Replacement card generated. Digital pass reissued.");
    if (!resolutionNote) return;

    try {
      const res = await api.patch(`/admin/issues/${issueId}/resolve`, { resolutionNote });
      if (res.data.success) {
        setMessage({ type: "success", text: `Issue #${issueId} marked as resolved.` });
        fetchDashboardData();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to resolve issue." });
    }
  };

  const handleToggleStudent = async (studentId) => {
    try {
      const res = await api.patch(`/admin/students/${studentId}/toggle`);
      if (res.data.success) {
        setMessage({ type: "success", text: res.data.message });
        fetchDashboardData();
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update student state." });
    }
  };

  const handleCreateRouteSubmit = async (e) => {
    e.preventDefault();
    try {
      const stopItems = newRouteForm.stopsText.split(",").map((s, idx) => {
        const parts = s.trim().split("(");
        const name = parts[0]?.trim() || `Stop ${idx + 1}`;
        const morning = parts[1]?.replace(")", "")?.trim() || "08:00 AM";
        return {
          stopName: name,
          stopOrder: idx + 1,
          morningTime: morning,
          eveningTime: "05:00 PM",
        };
      });

      const res = await api.post("/routes", {
        routeName: newRouteForm.routeName,
        busNumber: newRouteForm.busNumber,
        driverName: newRouteForm.driverName,
        driverPhone: newRouteForm.driverPhone,
        capacity: Number(newRouteForm.capacity),
        stops: stopItems,
      });

      if (res.data.success) {
        setMessage({ type: "success", text: "New bus route added to campus fleet!" });
        setShowAddRouteModal(false);
        fetchDashboardData();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to create route." });
    }
  };

  const filteredPasses = passesList.filter((p) => {
    const matchesFilter = passFilter === "all" ? true : p.status === passFilter;
    const matchesSearch = passSearch
      ? p.studentName?.toLowerCase().includes(passSearch.toLowerCase()) ||
        p.studentId?.toLowerCase().includes(passSearch.toLowerCase()) ||
        p.passId?.toLowerCase().includes(passSearch.toLowerCase()) ||
        p.routeName?.toLowerCase().includes(passSearch.toLowerCase())
      : true;
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 bg-[#090a0f] text-white">
      {/* Admin Executive Header (Carbon Black & Mint) */}
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#0d1017] via-[#141924] to-[#0d1017] border border-[#00f5a0]/40 p-6 shadow-mint sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#00f5a0]/15 border border-[#00f5a0]/30 px-3 py-1 text-xs font-bold text-[#00f5a0] mb-2">
            <ShieldCheck size={14} />
            <span>Transport Administration & Fleet Command</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-white">
            Campus Transit Command Center
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Logged in as <strong className="text-white">{user?.name}</strong> • Apex Institute of Technology
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-[#171b26] border border-[#262c3e] px-4 py-2 text-xs font-bold text-slate-200 hover:text-[#00f5a0] hover:border-[#00f5a0]/40 transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Sync Data</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddRouteModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[#00f5a0] px-4 py-2 text-xs font-black text-slate-950 shadow-mint hover:bg-[#00d68b] transition"
          >
            <Plus size={16} />
            <span>Add Route</span>
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {message && (
        <div
          className={`mb-6 flex items-start justify-between rounded-2xl p-4 text-xs font-bold ${
            message.type === "success"
              ? "bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/40"
              : "bg-rose-500/15 text-rose-300 border border-rose-500/40"
          }`}
        >
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage(null)} className="font-black underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards Grid (Carbon Black & Mint) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-8">
        <div className="rounded-2xl border border-[#222838] bg-[#12151e] p-4 shadow-xl">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
            Students
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-white font-mono">
              {stats?.stats?.totalStudents || 0}
            </span>
            <Users size={18} className="text-[#00f5a0]" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#00f5a0]/40 bg-[#00f5a0]/10 p-4 shadow-mint-sm">
          <span className="text-[10px] font-black text-[#00f5a0] uppercase tracking-wider block">
            Active Passes
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-[#00f5a0] font-mono">
              {stats?.stats?.activePasses || 0}
            </span>
            <CheckCircle2 size={18} className="text-[#00f5a0]" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#222838] bg-[#12151e] p-4 shadow-xl">
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider block">
            Pending
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-cyan-300 font-mono">
              {stats?.stats?.pendingPasses || 0}
            </span>
            <Clock size={18} className="text-cyan-400" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#222838] bg-[#12151e] p-4 shadow-xl">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
            Expired
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-amber-300 font-mono">
              {stats?.stats?.expiredPasses || 0}
            </span>
            <AlertTriangle size={18} className="text-amber-400" />
          </div>
        </div>

        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 shadow-xl">
          <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider block">
            Suspended (Lost)
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-rose-300 font-mono">
              {stats?.stats?.suspendedPasses || 0}
            </span>
            <AlertOctagon size={18} className="text-rose-400" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#222838] bg-[#12151e] p-4 shadow-xl">
          <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider block">
            Bus Routes
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-purple-300 font-mono">
              {stats?.stats?.totalRoutes || routesList.length}
            </span>
            <BusFront size={18} className="text-purple-400" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6 flex overflow-x-auto border-b border-[#1f2434] gap-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`pb-3 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "overview" ? "border-b-2 border-[#00f5a0] text-[#00f5a0]" : "text-slate-400 hover:text-white"
          }`}
        >
          <TrendingUp size={16} />
          Analytics & Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("passes")}
          className={`pb-3 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "passes" ? "border-b-2 border-[#00f5a0] text-[#00f5a0]" : "text-slate-400 hover:text-white"
          }`}
        >
          <BusFront size={16} />
          Pass Management ({passesList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("renewals")}
          className={`pb-3 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "renewals" ? "border-b-2 border-[#00f5a0] text-[#00f5a0]" : "text-slate-400 hover:text-white"
          }`}
        >
          <Clock size={16} />
          Renewals ({renewalsList.filter((r) => r.status === "pending").length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("routes")}
          className={`pb-3 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "routes" ? "border-b-2 border-[#00f5a0] text-[#00f5a0]" : "text-slate-400 hover:text-white"
          }`}
        >
          <MapPin size={16} />
          Routes & Fleet ({routesList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("issues")}
          className={`pb-3 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "issues" ? "border-b-2 border-[#00f5a0] text-[#00f5a0]" : "text-slate-400 hover:text-white"
          }`}
        >
          <AlertTriangle size={16} />
          Lost Cards & Issues ({issuesList.filter((i) => i.status !== "resolved").length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("students")}
          className={`pb-3 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "students" ? "border-b-2 border-[#00f5a0] text-[#00f5a0]" : "text-slate-400 hover:text-white"
          }`}
        >
          <Users size={16} />
          Student Roster ({studentsList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("logs")}
          className={`pb-3 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "logs" ? "border-b-2 border-[#00f5a0] text-[#00f5a0]" : "text-slate-400 hover:text-white"
          }`}
        >
          <ShieldCheck size={16} />
          Scan Audit Trail ({logsList.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Route Distribution Chart in Mint & Slate */}
            <div className="lg:col-span-7 rounded-3xl border border-[#222838] bg-[#12151e] p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-1">
                Active Passes & Bus Capacity by Route
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Real-time passenger load vs seated bus capacity across institutional fleet.
              </p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.passesByRoute || []}>
                    <XAxis dataKey="routeName" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0c0e15", borderColor: "#262d3e", color: "#fff", borderRadius: "12px" }} />
                    <Bar dataKey="activePasses" fill="#00f5a0" name="Active Student Passes" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="capacity" fill="#222838" name="Bus Capacity" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Verification Results Breakdown Donut */}
            <div className="lg:col-span-5 rounded-3xl border border-[#222838] bg-[#12151e] p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-1">
                Conductor Scan Outcomes
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Distribution of scan results across all active routes.
              </p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.verificationsByResult || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {(stats?.verificationsByResult || []).map((entry, index) => {
                        const mintColors = ["#00f5a0", "#f59e0b", "#f43f5e", "#64748b"];
                        return <Cell key={`cell-${index}`} fill={mintColors[index % mintColors.length]} />;
                      })}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0c0e15", borderColor: "#262d3e", color: "#fff", borderRadius: "12px" }} />
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Pending Applications Action Box */}
          {passesList.filter((p) => p.status === "pending").length > 0 && (
            <div className="rounded-3xl border border-[#00f5a0]/40 bg-[#00f5a0]/10 p-6 shadow-mint">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Clock size={18} className="text-[#00f5a0]" />
                    Pending Pass Applications ({passesList.filter((p) => p.status === "pending").length})
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Review and approve students who submitted transit applications.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setActiveTab("passes"); setPassFilter("pending"); }}
                  className="rounded-xl bg-[#00f5a0] px-4 py-2 text-xs font-black text-slate-950 hover:bg-[#00d68b]"
                >
                  View All Pending
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {passesList
                  .filter((p) => p.status === "pending")
                  .slice(0, 4)
                  .map((pass) => (
                    <div key={pass.passId} className="flex items-center justify-between rounded-2xl bg-[#12151e] p-4 border border-[#222838]">
                      <div>
                        <h4 className="font-bold text-xs text-white">{pass.studentName}</h4>
                        <p className="text-[11px] font-mono text-[#00f5a0]">{pass.studentId} • {pass.routeName}</p>
                        <p className="text-[10px] text-slate-400">Stop: {pass.pickupStop}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleApprovePass(pass.passId)}
                          className="rounded-lg bg-[#00f5a0] px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-[#00d68b]"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectPass(pass.passId)}
                          className="rounded-lg bg-[#1c2232] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-[#252c3e]"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PASSES DIRECTORY & ACTIONS */}
      {activeTab === "passes" && (
        <div className="rounded-3xl border border-[#222838] bg-[#12151e] p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Filter pills */}
            <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
              {["all", "pending", "active", "expired", "suspended"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setPassFilter(st)}
                  className={`rounded-xl px-3 py-1.5 uppercase tracking-wide transition ${
                    passFilter === st
                      ? "bg-[#00f5a0] text-slate-950 font-black shadow-mint-sm"
                      : "bg-[#181c28] text-slate-400 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={passSearch}
                onChange={(e) => setPassSearch(e.target.value)}
                placeholder="Search name, ID, or route..."
                className="w-full rounded-xl border border-[#272e40] bg-[#0c0e15] py-2 pl-3 pr-8 text-xs text-white focus:border-[#00f5a0] focus:outline-none"
              />
              <Search size={14} className="absolute right-3 top-2.5 text-slate-500" />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#222838]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#171b26] text-white font-bold border-b border-[#222838]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Pass ID</th>
                  <th className="py-3 px-4">Route / Bus</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2332]">
                {filteredPasses.map((p) => (
                  <tr key={p.passId} className="hover:bg-[#161a25] transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{p.studentName}</div>
                      <div className="font-mono text-[10px] text-[#00f5a0]">{p.studentId}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">{p.passId}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{p.routeName}</div>
                      <div className="text-[10px] text-slate-400">Stop: {p.pickupStop}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">{p.expiryDate}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                          p.status === "active"
                            ? "bg-[#00f5a0]/20 text-[#00f5a0]"
                            : p.status === "pending"
                            ? "bg-cyan-500/20 text-cyan-300"
                            : p.status === "expired"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {p.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      {p.status === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprovePass(p.passId)}
                            className="rounded-lg bg-[#00f5a0] px-2.5 py-1 text-xs font-black text-slate-950 hover:bg-[#00d68b]"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectPass(p.passId)}
                            className="rounded-lg bg-[#1d2232] px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-[#252c3e]"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {p.status === "active" && (
                        <button
                          type="button"
                          onClick={() => handleSuspendPass(p.passId)}
                          className="rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 text-xs font-bold hover:bg-rose-500/30"
                        >
                          Suspend
                        </button>
                      )}

                      {(p.status === "suspended" || p.status === "expired") && (
                        <button
                          type="button"
                          onClick={() => handleReactivatePass(p.passId)}
                          className="rounded-lg bg-[#00f5a0]/20 text-[#00f5a0] border border-[#00f5a0]/30 px-2.5 py-1 text-xs font-bold hover:bg-[#00f5a0]/30"
                        >
                          Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RENEWALS */}
      {activeTab === "renewals" && (
        <div className="rounded-3xl border border-[#222838] bg-[#12151e] p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white">Pass Renewal Requests</h3>
          <div className="space-y-3">
            {renewalsList.length > 0 ? (
              renewalsList.map((req) => (
                <div key={req.requestId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#222838] p-4 bg-[#141723]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#00f5a0]">#{req.requestId}</span>
                      <h4 className="font-bold text-white text-sm">{req.studentName} ({req.studentId})</h4>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Extension: <strong>+{req.requestedExtensionDays} Days</strong> • Fee Receipt: <code className="text-[#00f5a0]">{req.receiptNumber}</code>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Notes: {req.comments}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status === "pending" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApproveRenewal(req.requestId)}
                          className="rounded-xl bg-[#00f5a0] px-3.5 py-1.5 text-xs font-black text-slate-950 hover:bg-[#00d68b]"
                        >
                          Approve Extension
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectRenewal(req.requestId)}
                          className="rounded-xl bg-[#1c2232] px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-[#252c3e]"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-400">
                        {req.status?.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No renewal requests logged.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ROUTES & FLEET */}
      {activeTab === "routes" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Campus Bus Fleet & Routes</h3>
            <button
              type="button"
              onClick={() => setShowAddRouteModal(true)}
              className="rounded-xl bg-[#00f5a0] px-4 py-2 text-xs font-black text-slate-950 hover:bg-[#00d68b] shadow-mint flex items-center gap-1.5"
            >
              <Plus size={15} /> Add New Route
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {routesList.map((route) => (
              <div key={route.routeId} className="rounded-3xl border border-[#222838] bg-[#12151e] p-6 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30 px-2.5 py-1 rounded-lg">
                    {route.routeId}
                  </span>
                  <span className="font-mono text-xs font-bold border border-[#272e40] bg-[#161a26] px-2 py-0.5 rounded text-white">
                    {route.busNumber}
                  </span>
                </div>

                <h4 className="font-bold text-white text-base">{route.routeName}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Driver: {route.driverName} ({route.driverPhone}) • Capacity: {route.capacity} Seats
                </p>

                {/* Stops */}
                <div className="mt-4 border-t border-[#1f2434] pt-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                    Stops & Schedule ({route.stops?.length || 0})
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {route.stops?.map((stop, sIdx) => (
                      <div key={sIdx} className="flex items-center justify-between text-xs py-1 px-2.5 rounded bg-[#161a25]">
                        <span className="font-medium text-slate-200">{stop.stopName}</span>
                        <span className="text-[10px] font-mono text-[#00f5a0]">
                          AM: {stop.morningTime} | PM: {stop.eveningTime}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: LOST CARDS & ISSUES */}
      {activeTab === "issues" && (
        <div className="rounded-3xl border border-[#222838] bg-[#12151e] p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Student Incident & Lost Card Reports</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Lost physical pass incidents and route mismatch requests.
            </p>
          </div>

          <div className="space-y-3">
            {issuesList.map((issue) => (
              <div key={issue.issueId} className="rounded-2xl border border-[#222838] p-4 bg-[#141723] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-300 bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded">
                      {issue.issueType.replace("_", " ").toUpperCase()}
                    </span>
                    <h4 className="font-bold text-white text-sm">{issue.studentName} ({issue.studentId})</h4>
                  </div>
                  <p className="text-xs text-slate-200 mt-1.5 font-medium">{issue.description}</p>
                  {issue.resolutionNote && (
                    <p className="text-[11px] text-[#00f5a0] mt-1">
                      <strong>Resolution:</strong> {issue.resolutionNote}
                    </p>
                  )}
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Reported on {new Date(issue.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {issue.status !== "resolved" ? (
                    <button
                      type="button"
                      onClick={() => handleResolveIssue(issue.issueId)}
                      className="rounded-xl bg-[#00f5a0] px-4 py-2 text-xs font-black text-slate-950 hover:bg-[#00d68b]"
                    >
                      Resolve & Reissue
                    </button>
                  ) : (
                    <span className="rounded-full bg-[#00f5a0]/20 text-[#00f5a0] px-3 py-1 text-xs font-bold">
                      RESOLVED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: STUDENTS ROSTER */}
      {activeTab === "students" && (
        <div className="rounded-3xl border border-[#222838] bg-[#12151e] p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white">Student Account Directory</h3>
          <div className="overflow-x-auto rounded-2xl border border-[#222838]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#171b26] text-white font-bold border-b border-[#222838]">
                <tr>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Pass Status</th>
                  <th className="py-3 px-4">Account</th>
                  <th className="py-3 px-4 text-right">Toggle Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2332]">
                {studentsList.map((st) => (
                  <tr key={st.id} className="hover:bg-[#161a25] transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#00f5a0]">{st.studentId}</td>
                    <td className="py-3 px-4 font-semibold text-white">{st.name}</td>
                    <td className="py-3 px-4">{st.course}</td>
                    <td className="py-3 px-4">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                        st.passStatus === "active" ? "bg-[#00f5a0]/20 text-[#00f5a0]" : "bg-slate-800 text-slate-400"
                      }`}>
                        {st.passStatus?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-semibold ${st.isActive !== false ? "text-[#00f5a0]" : "text-rose-400"}`}>
                        {st.isActive !== false ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleStudent(st.studentId)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                          st.isActive !== false
                            ? "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25"
                            : "bg-[#00f5a0]/15 text-[#00f5a0] hover:bg-[#00f5a0]/25"
                        }`}
                      >
                        {st.isActive !== false ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: SCAN AUDIT LOGS */}
      {activeTab === "logs" && (
        <div className="rounded-3xl border border-[#222838] bg-[#12151e] p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white">Institutional Conductor Scan Audit Log</h3>
          <div className="overflow-x-auto rounded-2xl border border-[#222838]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#171b26] text-white font-bold border-b border-[#222838]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Passenger / Student</th>
                  <th className="py-3 px-4">Pass ID</th>
                  <th className="py-3 px-4">Bus / Route</th>
                  <th className="py-3 px-4">Conductor</th>
                  <th className="py-3 px-4">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2332]">
                {logsList.map((log) => (
                  <tr key={log.logId} className="hover:bg-[#161a25] transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {new Date(log.verificationTime).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{log.studentName}</div>
                      <div className="font-mono text-[10px] text-[#00f5a0]">{log.studentId}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">{log.passId}</td>
                    <td className="py-3 px-4">
                      <div>{log.busNumber}</div>
                      <div className="text-[10px] text-slate-500">{log.routeName}</div>
                    </td>
                    <td className="py-3 px-4 font-medium">{log.verifiedBy}</td>
                    <td className="py-3 px-4">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                        log.result === "VALID" ? "bg-[#00f5a0]/20 text-[#00f5a0]" : "bg-rose-500/20 text-rose-300"
                      }`}>
                        {log.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD ROUTE MODAL */}
      {showAddRouteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#12151e] border border-[#222838] p-6 shadow-2xl text-white">
            <h3 className="text-lg font-bold">Add New Bus Route</h3>
            <p className="text-xs text-slate-400 mt-1">Register a bus route and stops in the fleet master.</p>

            <form onSubmit={handleCreateRouteSubmit} className="mt-5 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Route Name *</label>
                <input
                  type="text"
                  required
                  value={newRouteForm.routeName}
                  onChange={(e) => setNewRouteForm({ ...newRouteForm, routeName: e.target.value })}
                  placeholder="e.g. Route 5 — Airport Road Shuttle"
                  className="w-full rounded-xl border border-[#272e40] bg-[#0c0e15] px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Bus Registration No *</label>
                  <input
                    type="text"
                    required
                    value={newRouteForm.busNumber}
                    onChange={(e) => setNewRouteForm({ ...newRouteForm, busNumber: e.target.value })}
                    placeholder="e.g. KA-09-JK-9900"
                    className="w-full rounded-xl border border-[#272e40] bg-[#0c0e15] px-3.5 py-2 text-xs font-mono uppercase text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Capacity (Seats)</label>
                  <input
                    type="number"
                    value={newRouteForm.capacity}
                    onChange={(e) => setNewRouteForm({ ...newRouteForm, capacity: e.target.value })}
                    className="w-full rounded-xl border border-[#272e40] bg-[#0c0e15] px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={newRouteForm.driverName}
                    onChange={(e) => setNewRouteForm({ ...newRouteForm, driverName: e.target.value })}
                    placeholder="e.g. Prakash Rao"
                    className="w-full rounded-xl border border-[#272e40] bg-[#0c0e15] px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Driver Phone</label>
                  <input
                    type="text"
                    value={newRouteForm.driverPhone}
                    onChange={(e) => setNewRouteForm({ ...newRouteForm, driverPhone: e.target.value })}
                    placeholder="+91 98765 00000"
                    className="w-full rounded-xl border border-[#272e40] bg-[#0c0e15] px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Stops List (Comma-separated with morning times)
                </label>
                <textarea
                  rows={2}
                  value={newRouteForm.stopsText}
                  onChange={(e) => setNewRouteForm({ ...newRouteForm, stopsText: e.target.value })}
                  className="w-full rounded-xl border border-[#272e40] bg-[#0c0e15] px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddRouteModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#00f5a0] px-4 py-2 text-xs font-black text-slate-950 hover:bg-[#00d68b]"
                >
                  Register Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
