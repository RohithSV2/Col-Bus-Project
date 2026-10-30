import React, { useState, useEffect } from "react";
import {
  QrCode,
  Search,
  History,
  BusFront,
  User,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import QRScannerComponent from "../components/QRScannerComponent";
import VerificationResultModal from "../components/VerificationResultModal";

export default function ConductorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("scan"); // 'scan' | 'search' | 'history'

  // Scanner & Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // History state
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyStats, setHistoryStats] = useState(null);
  const [filterResult, setFilterResult] = useState("all");

  const fetchHistory = async () => {
    try {
      const res = await api.get("/conductor/history");
      if (res.data.success) {
        setHistoryLogs(res.data.logs);
        setHistoryStats(res.data.stats);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleScanSuccess = async (tokenOrId, scanMethod) => {
    if (isVerifying) return;
    setIsVerifying(true);

    try {
      const res = await api.post("/conductor/verify", {
        token: tokenOrId,
        scanMethod,
        location: user?.pickupStop || "Main Bus Entrance",
      });

      if (res.data.success) {
        setVerificationResult(res.data);
        fetchHistory();
      }
    } catch (err) {
      setVerificationResult({
        result: "INVALID",
        message: "❌ Verification Server Error",
        reason: err.response?.data?.message || "Could not verify pass against server.",
        verifiedAt: new Date().toISOString(),
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await api.get(`/conductor/search?query=${encodeURIComponent(searchQuery.trim())}`);
      if (res.data.success) {
        setSearchResults(res.data.students);
      }
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleVerifyStudentDirect = async (student) => {
    if (!student.pass) {
      setVerificationResult({
        result: "INVALID",
        message: "❌ No Bus Pass Issued",
        reason: "Student does not have any bus pass record in the database.",
        student,
        verifiedAt: new Date().toISOString(),
      });
      return;
    }
    handleScanSuccess(student.pass.passId, "manual_id");
  };

  const filteredLogs = historyLogs.filter((log) => {
    if (filterResult === "all") return true;
    return log.result?.toLowerCase() === filterResult.toLowerCase();
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 bg-[#090a0f] text-white">
      {/* Conductor Fleet Banner (Carbon Black & Electric Mint) */}
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#0d1017] via-[#131722] to-[#0d1017] border border-[#00f5a0]/40 p-6 shadow-mint sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#00f5a0]/15 border border-[#00f5a0]/30 px-3 py-1 text-xs font-bold text-[#00f5a0] mb-2">
            <ShieldCheck size={14} />
            <span>Staff Terminal: {user?.name} ({user?.studentId || "CON-01"})</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-white">
            Conductor Verification Terminal
          </h1>
          <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
            <span>Assigned Bus: <strong className="font-mono text-[#00f5a0]">{user?.assignedBusNumber || "KA-09-AB-1234"}</strong></span>
            <span>•</span>
            <span>Route: <strong className="text-white">{user?.assignedRouteId || "Route 1 — North Campus Express"}</strong></span>
          </p>
        </div>

        {/* Real-time counters */}
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[#171b26] border border-[#262c3e] px-4 py-2.5 text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block">
              Scanned Today
            </span>
            <span className="text-2xl font-black font-mono text-white">
              {historyStats?.totalScans || historyLogs.length}
            </span>
          </div>
          <div className="rounded-2xl bg-[#00f5a0]/15 border border-[#00f5a0]/40 px-4 py-2.5 text-center shadow-mint-sm">
            <span className="text-[10px] uppercase tracking-wider text-[#00f5a0] font-extrabold block">
              Valid Passes
            </span>
            <span className="text-2xl font-black font-mono text-[#00f5a0]">
              {historyStats?.validCount || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Carbon Black & Mint) */}
      <div className="mb-6 flex border-b border-[#1f2434] gap-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("scan")}
          className={`pb-3 transition flex items-center gap-1.5 ${
            activeTab === "scan" ? "border-b-2 border-[#00f5a0] text-[#00f5a0]" : "text-slate-400 hover:text-white"
          }`}
        >
          <QrCode size={16} />
          Scan QR Code
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("search")}
          className={`pb-3 transition flex items-center gap-1.5 ${
            activeTab === "search" ? "border-b-2 border-[#00f5a0] text-[#00f5a0]" : "text-slate-400 hover:text-white"
          }`}
        >
          <Search size={16} />
          Lookup Student by ID
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`pb-3 transition flex items-center gap-1.5 ${
            activeTab === "history" ? "border-b-2 border-[#00f5a0] text-[#00f5a0]" : "text-slate-400 hover:text-white"
          }`}
        >
          <History size={16} />
          Verification Log ({historyLogs.length})
        </button>
      </div>

      {/* 1. QR SCANNER TAB */}
      {activeTab === "scan" && (
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7">
            <QRScannerComponent
              onScanSuccess={handleScanSuccess}
              isVerifying={isVerifying}
            />
          </div>

          <div className="lg:col-span-5 space-y-5">
            {/* Last Scanned Quick Card */}
            {historyLogs[0] && (
              <div className="rounded-3xl border border-[#222838] bg-[#12151e] p-5 shadow-xl">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2">
                  Most Recent Verification
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{historyLogs[0].studentName}</h4>
                    <p className="text-xs font-mono text-slate-400">ID: {historyLogs[0].studentId}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-black ${
                      historyLogs[0].result === "VALID"
                        ? "bg-[#00f5a0]/20 text-[#00f5a0] border border-[#00f5a0]/40"
                        : historyLogs[0].result === "EXPIRED"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    }`}
                  >
                    {historyLogs[0].result}
                  </span>
                </div>
                <div className="mt-3 border-t border-[#1c2230] pt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Method: {historyLogs[0].scanMethod}</span>
                  <span>{new Date(historyLogs[0].verificationTime).toLocaleTimeString()}</span>
                </div>
              </div>
            )}

            {/* Verification Instructions */}
            <div className="rounded-3xl border border-[#222838] bg-[#12151e] p-6 shadow-xl space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#00f5a0] flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#00f5a0]" />
                Staff Verification Protocol
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="font-black text-[#00f5a0]">1.</span>
                  <span><strong>Look for Live Ticker:</strong> Ensure the student's digital pass displays an active ticking seconds counter.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black text-[#00f5a0]">2.</span>
                  <span><strong>Verify Photo:</strong> Compare the photo on the verification screen with the student presenting the pass.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black text-[#00f5a0]">3.</span>
                  <span><strong>Suspended Passes:</strong> If a pass is marked SUSPENDED, politely explain that the card was reported lost or blocked.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black text-[#00f5a0]">4.</span>
                  <span><strong>No Phone / Flat Battery:</strong> Switch to the <em>Lookup Student by ID</em> tab to verify them via institutional ID.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 2. LOOKUP STUDENT TAB */}
      {activeTab === "search" && (
        <div className="rounded-3xl border border-[#222838] bg-[#12151e] p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">
              Institutional ID & Name Lookup
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ideal when a student left their phone at home, lost their card, or has a dead battery.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-lg">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Student ID (e.g. COL2026001) or name..."
                className="w-full rounded-xl border border-[#272e40] bg-[#0c0e15] py-2.5 pl-10 pr-4 text-xs text-white focus:border-[#00f5a0] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="rounded-xl bg-[#00f5a0] px-5 py-2.5 text-xs font-black text-slate-950 shadow-mint hover:bg-[#00d68b] disabled:opacity-50 transition"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </form>

          {/* Quick preset chips */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Try demo ID:</span>
            {["COL2026001", "COL2026003", "COL2026004"].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setSearchQuery(id)}
                className="rounded-lg bg-[#181c28] hover:bg-[#222738] border border-[#2b3348] font-mono text-[11px] px-2 py-0.5 text-slate-300"
              >
                {id}
              </button>
            ))}
          </div>

          {/* Search Results Display */}
          <div className="space-y-3 pt-2">
            {searchResults.length > 0 ? (
              searchResults.map((student) => (
                <div
                  key={student.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#222838] bg-[#141723] p-4 transition hover:border-[#00f5a0]/40"
                >
                  <div className="flex items-center gap-3.5">
                    {student.photoUrl ? (
                      <img
                        src={student.photoUrl}
                        alt={student.name}
                        className="h-12 w-12 rounded-xl object-cover ring-2 ring-[#00f5a0]/40"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                        <User size={20} />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-white text-sm">{student.name}</h4>
                      <p className="text-xs font-mono font-bold text-[#00f5a0]">{student.studentId}</p>
                      <p className="text-[11px] text-slate-400">{student.course} • Stop: {student.pickupStop}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        student.passStatus === "active"
                          ? "bg-[#00f5a0]/20 text-[#00f5a0] border border-[#00f5a0]/40"
                          : student.passStatus === "expired"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : student.passStatus === "suspended"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {student.passStatus.toUpperCase()}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleVerifyStudentDirect(student)}
                      className="rounded-xl bg-[#00f5a0] px-4 py-2 text-xs font-black text-slate-950 shadow-mint hover:bg-[#00d68b] transition"
                    >
                      Inspect & Log Boarding
                    </button>
                  </div>
                </div>
              ))
            ) : hasSearched ? (
              <div className="rounded-2xl border border-[#222838] bg-[#141723] p-8 text-center text-xs text-slate-400">
                No students matched the query "{searchQuery}".
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* 3. VERIFICATION LOG TAB */}
      {activeTab === "history" && (
        <div className="rounded-3xl border border-[#222838] bg-[#12151e] p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Live Verification Log</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Timestamped records of passes verified on this device and fleet.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
              {["all", "VALID", "EXPIRED", "SUSPENDED"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterResult(st)}
                  className={`rounded-xl px-3 py-1.5 transition ${
                    filterResult === st
                      ? "bg-[#00f5a0] text-slate-950 font-black shadow-mint-sm"
                      : "bg-[#181c28] text-slate-400 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#222838]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#171b26] text-white font-bold border-b border-[#222838]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Pass ID</th>
                  <th className="py-3 px-4">Route / Bus</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2332]">
                {filteredLogs.map((log) => (
                  <tr key={log.logId} className="hover:bg-[#161a25] transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{log.studentName}</div>
                      <div className="font-mono text-[10px] text-[#00f5a0]">{log.studentId}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">{log.passId}</td>
                    <td className="py-3 px-4">
                      <div>{log.busNumber}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{log.routeName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                          log.result === "VALID"
                            ? "bg-[#00f5a0]/20 text-[#00f5a0]"
                            : log.result === "EXPIRED"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {log.result}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{log.scanMethod}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(log.verificationTime).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* POPUP VERIFICATION RESULT MODAL */}
      <VerificationResultModal
        result={verificationResult}
        onClose={() => setVerificationResult(null)}
      />
    </div>
  );
}
