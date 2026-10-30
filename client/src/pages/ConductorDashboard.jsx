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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 bg-[#001733] text-white">
      {/* Conductor Fleet Banner (Oxford Blue & Vista Blue) */}
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#001f3f] via-[#042a59] to-[#001f3f] border border-[#7C9ED9]/50 p-6 shadow-vista sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#7C9ED9]/20 border border-[#7C9ED9]/40 px-3 py-1 text-xs font-bold text-[#7C9ED9] mb-2">
            <ShieldCheck size={14} />
            <span>Staff Terminal: {user?.name} ({user?.studentId || "CON-01"})</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-white">
            Conductor Verification Terminal
          </h1>
          <p className="text-xs text-slate-200 mt-1 flex items-center gap-2">
            <span>Assigned Bus: <strong className="font-mono text-[#7C9ED9]">{user?.assignedBusNumber || "KA-09-AB-1234"}</strong></span>
            <span>•</span>
            <span>Route: <strong className="text-white">{user?.assignedRouteId || "Route 1 — North Campus Express"}</strong></span>
          </p>
        </div>

        {/* Real-time counters */}
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[#021836] border border-[#0e428a] px-4 py-2.5 text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block">
              Scanned Today
            </span>
            <span className="text-2xl font-black font-mono text-white">
              {historyStats?.totalScans || historyLogs.length}
            </span>
          </div>
          <div className="rounded-2xl bg-[#7C9ED9]/20 border border-[#7C9ED9]/50 px-4 py-2.5 text-center shadow-vista-sm">
            <span className="text-[10px] uppercase tracking-wider text-[#7C9ED9] font-extrabold block">
              Valid Passes
            </span>
            <span className="text-2xl font-black font-mono text-[#7C9ED9]">
              {historyStats?.validCount || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Oxford Blue & Vista) */}
      <div className="mb-6 flex border-b border-[#0e428a] gap-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("scan")}
          className={`pb-3 transition flex items-center gap-1.5 ${
            activeTab === "scan" ? "border-b-2 border-[#7C9ED9] text-[#7C9ED9]" : "text-slate-300 hover:text-white"
          }`}
        >
          <QrCode size={16} />
          Scan QR Code
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("search")}
          className={`pb-3 transition flex items-center gap-1.5 ${
            activeTab === "search" ? "border-b-2 border-[#7C9ED9] text-[#7C9ED9]" : "text-slate-300 hover:text-white"
          }`}
        >
          <Search size={16} />
          Lookup Student by ID
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`pb-3 transition flex items-center gap-1.5 ${
            activeTab === "history" ? "border-b-2 border-[#7C9ED9] text-[#7C9ED9]" : "text-slate-300 hover:text-white"
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
              <div className="rounded-3xl border border-[#0e428a] bg-[#042a59] p-5 shadow-xl">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Most Recent Verification
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{historyLogs[0].studentName}</h4>
                    <p className="text-xs font-mono text-slate-300">ID: {historyLogs[0].studentId}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-black ${
                      historyLogs[0].result === "VALID"
                        ? "bg-[#7C9ED9]/25 text-[#7C9ED9] border border-[#7C9ED9]/50"
                        : historyLogs[0].result === "EXPIRED"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    }`}
                  >
                    {historyLogs[0].result}
                  </span>
                </div>
                <div className="mt-3 border-t border-[#0e3b79] pt-2 flex items-center justify-between text-[11px] text-slate-300">
                  <span>Method: {historyLogs[0].scanMethod}</span>
                  <span>{new Date(historyLogs[0].verificationTime).toLocaleTimeString()}</span>
                </div>
              </div>
            )}

            {/* Verification Instructions */}
            <div className="rounded-3xl border border-[#0e428a] bg-[#042a59] p-6 shadow-xl space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#7C9ED9] flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#7C9ED9]" />
                Staff Verification Protocol
              </h3>
              <ul className="space-y-2 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="font-black text-[#7C9ED9]">1.</span>
                  <span><strong>Look for Live Ticker:</strong> Ensure the student's digital pass displays an active ticking seconds counter.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black text-[#7C9ED9]">2.</span>
                  <span><strong>Verify Photo:</strong> Compare the photo on the verification screen with the student presenting the pass.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black text-[#7C9ED9]">3.</span>
                  <span><strong>Suspended Passes:</strong> If a pass is marked SUSPENDED, politely explain that the card was reported lost or blocked.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black text-[#7C9ED9]">4.</span>
                  <span><strong>No Phone / Flat Battery:</strong> Switch to the <em>Lookup Student by ID</em> tab to verify them via institutional ID.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 2. LOOKUP STUDENT TAB */}
      {activeTab === "search" && (
        <div className="rounded-3xl border border-[#0e428a] bg-[#042a59] p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">
              Institutional ID & Name Lookup
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Ideal when a student left their phone at home, lost their card, or has a dead battery.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-lg">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Student ID (e.g. COL2026001) or name..."
                className="w-full rounded-xl border border-[#0e428a] bg-[#001733] py-2.5 pl-10 pr-4 text-xs text-white focus:border-[#7C9ED9] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="rounded-xl bg-[#7C9ED9] px-5 py-2.5 text-xs font-black text-[#001733] shadow-vista hover:bg-[#688ed0] disabled:opacity-50 transition"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </form>

          {/* Quick preset chips */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Try demo ID:</span>
            {["COL2026001", "COL2026003", "COL2026004"].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setSearchQuery(id)}
                className="rounded-lg bg-[#021836] hover:bg-[#083570] border border-[#0e428a] font-mono text-[11px] px-2 py-0.5 text-slate-200"
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
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#0e428a] bg-[#021836] p-4 transition hover:border-[#7C9ED9]/50"
                >
                  <div className="flex items-center gap-3.5">
                    {student.photoUrl ? (
                      <img
                        src={student.photoUrl}
                        alt={student.name}
                        className="h-12 w-12 rounded-xl object-cover ring-2 ring-[#7C9ED9]/50"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-[#042a59] flex items-center justify-center text-slate-300">
                        <User size={20} />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-white text-sm">{student.name}</h4>
                      <p className="text-xs font-mono font-bold text-[#7C9ED9]">{student.studentId}</p>
                      <p className="text-[11px] text-slate-300">{student.course} • Stop: {student.pickupStop}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        student.passStatus === "active"
                          ? "bg-[#7C9ED9]/25 text-[#7C9ED9] border border-[#7C9ED9]/50"
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
                      className="rounded-xl bg-[#7C9ED9] px-4 py-2 text-xs font-black text-[#001733] shadow-vista hover:bg-[#688ed0] transition"
                    >
                      Inspect & Log Boarding
                    </button>
                  </div>
                </div>
              ))
            ) : hasSearched ? (
              <div className="rounded-2xl border border-[#0e428a] bg-[#021836] p-8 text-center text-xs text-slate-300">
                No students matched the query "{searchQuery}".
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* 3. VERIFICATION LOG TAB */}
      {activeTab === "history" && (
        <div className="rounded-3xl border border-[#0e428a] bg-[#042a59] p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Live Verification Log</h3>
              <p className="text-xs text-slate-300 mt-0.5">
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
                      ? "bg-[#7C9ED9] text-[#001733] font-black shadow-vista-sm"
                      : "bg-[#021836] text-slate-300 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#0e428a]">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-[#001f3f] text-white font-bold border-b border-[#0e428a]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Pass ID</th>
                  <th className="py-3 px-4">Route / Bus</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0e3b79]">
                {filteredLogs.map((log) => (
                  <tr key={log.logId} className="hover:bg-[#06336e] transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{log.studentName}</div>
                      <div className="font-mono text-[10px] text-[#7C9ED9]">{log.studentId}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">{log.passId}</td>
                    <td className="py-3 px-4">
                      <div>{log.busNumber}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{log.routeName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                          log.result === "VALID"
                            ? "bg-[#7C9ED9]/25 text-[#7C9ED9]"
                            : log.result === "EXPIRED"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {log.result}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-300">{log.scanMethod}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
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
