import React, { useState, useEffect } from "react";
import {
  BusFront,
  ShieldCheck,
  Clock,
  AlertTriangle,
  MapPin,
  AlertOctagon,
  FileText,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import DigitalPassCard from "../components/DigitalPassCard";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [passData, setPassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pass"); // 'pass' | 'route' | 'history' | 'support'

  // Modals state
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [renewalDays, setRenewalDays] = useState(180);
  const [renewalComments, setRenewalComments] = useState("");
  const [renewalReceipt, setRenewalReceipt] = useState("");
  const [submittingRenewal, setSubmittingRenewal] = useState(false);

  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueType, setIssueType] = useState("lost_pass");
  const [issueDescription, setIssueDescription] = useState("");
  const [suspendPassToggle, setSuspendPassToggle] = useState(true);
  const [submittingIssue, setSubmittingIssue] = useState(false);

  const [message, setMessage] = useState(null);

  const fetchPassDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get("/passes/my-pass");
      if (res.data.success) {
        setPassData(res.data);
      }
    } catch (err) {
      console.error("Error fetching pass:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassDetails();
  }, []);

  const handleRenewalSubmit = async (e) => {
    e.preventDefault();
    setSubmittingRenewal(true);
    try {
      const res = await api.post("/passes/renew", {
        passId: passData?.pass?.passId,
        requestedExtensionDays: Number(renewalDays),
        comments: renewalComments,
        receiptNumber: renewalReceipt,
      });
      if (res.data.success) {
        setMessage({ type: "success", text: "Renewal request submitted successfully! Awaiting admin confirmation." });
        setShowRenewalModal(false);
        fetchPassDetails();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to submit renewal request." });
    } finally {
      setSubmittingRenewal(false);
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setSubmittingIssue(true);
    try {
      const res = await api.post("/passes/report-issue", {
        passId: passData?.pass?.passId,
        issueType,
        description: issueDescription,
        suspendNow: issueType === "lost_pass" && suspendPassToggle,
      });
      if (res.data.success) {
        setMessage({
          type: "success",
          text: issueType === "lost_pass"
            ? "Lost pass reported! Pass has been safely suspended to protect against unauthorized travel."
            : "Support report logged successfully.",
        });
        setShowIssueModal(false);
        setIssueDescription("");
        fetchPassDetails();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to report issue." });
    } finally {
      setSubmittingIssue(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-[#090a0f]">
        <RefreshCw size={30} className="animate-spin text-[#00f5a0]" />
        <p className="text-xs font-bold text-slate-400">Retrieving digital bus pass...</p>
      </div>
    );
  }

  const pass = passData?.pass;
  const route = passData?.route;
  const daysRemaining = passData?.daysRemaining;
  const pendingRenewal = passData?.pendingRenewal;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 bg-[#090a0f]">
      {/* Top Banner / Welcome Row */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#00f5a0]">
            Apex Student Portal
          </span>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Institutional ID: <span className="font-mono font-bold text-[#00f5a0]">{user?.studentId}</span> • {user?.course}
          </p>
        </div>

        {/* Quick status pill in Mint & Carbon */}
        <div className="flex items-center gap-3">
          {pass && (
            <div className="flex items-center gap-2 rounded-2xl bg-[#141723] border border-[#23293a] px-4 py-2 shadow-sm">
              <span className="text-xs text-slate-400">Pass Validity:</span>
              <span className={`text-xs font-black font-mono ${daysRemaining < 0 ? 'text-amber-400' : 'text-[#00f5a0]'}`}>
                {daysRemaining > 0 ? `${daysRemaining} days left` : "Expired"}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={fetchPassDetails}
            className="flex items-center gap-1.5 rounded-xl border border-[#23293a] bg-[#141723] px-3.5 py-2 text-xs font-bold text-slate-300 shadow-sm hover:text-[#00f5a0] hover:border-[#00f5a0]/40 transition"
            title="Refresh status"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Alert Notices */}
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

      {pass?.status === "expired" && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 p-4 text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={20} className="text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold">Your Bus Pass Has Expired ({pass.expiryDate})</p>
              <p className="text-[11px] text-amber-300">Please request a semester renewal to keep travelling without interruption.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowRenewalModal(true)}
            className="rounded-xl bg-amber-500 text-slate-950 font-black px-4 py-2 text-xs shadow-sm hover:bg-amber-400 shrink-0"
          >
            Request Renewal Now
          </button>
        </div>
      )}

      {pass?.status === "suspended" && (
        <div className="mb-6 rounded-2xl bg-rose-500/15 border border-rose-500/40 p-4 text-rose-200 flex items-start gap-3">
          <AlertOctagon size={22} className="text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold">Pass Suspended: Lost Card Protection Active</p>
            <p className="text-[11px] text-rose-300 mt-0.5">
              {pass.rejectionReason || "This pass was marked as lost/stolen. Conductor scans will flag this card as suspended to prevent someone else using your pass."}
            </p>
            <p className="text-[11px] font-bold text-[#00f5a0] mt-2">
              Note: Contact the transport administration desk to verify your identity and reactivate your digital pass.
            </p>
          </div>
        </div>
      )}

      {pendingRenewal && (
        <div className="mb-6 rounded-2xl bg-[#00f5a0]/10 border border-[#00f5a0]/30 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#00f5a0]" />
            <span className="text-xs font-semibold">
              Renewal Request #{pendingRenewal.requestId} is pending review (+{pendingRenewal.requestedExtensionDays} days extension).
            </span>
          </div>
          <span className="text-[10px] font-black text-[#00f5a0] bg-[#00f5a0]/20 border border-[#00f5a0]/40 px-2.5 py-1 rounded-full">
            UNDER REVIEW
          </span>
        </div>
      )}

      {/* Navigation Tabs (Electric Mint & Carbon) */}
      <div className="mb-8 flex overflow-x-auto border-b border-[#1f2434] gap-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("pass")}
          className={`pb-3 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "pass" ? "border-b-2 border-[#00f5a0] text-[#00f5a0]" : "text-slate-400 hover:text-white"
          }`}
        >
          <BusFront size={16} />
          My Digital Pass
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("route")}
          className={`pb-3 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "route" ? "border-b-2 border-[#00f5a0] text-[#00f5a0]" : "text-slate-400 hover:text-white"
          }`}
        >
          <MapPin size={16} />
          Route & Schedule
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`pb-3 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "history" ? "border-b-2 border-[#00f5a0] text-[#00f5a0]" : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText size={16} />
          Pass History
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("support")}
          className={`pb-3 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "support" ? "border-b-2 border-[#00f5a0] text-[#00f5a0]" : "text-slate-400 hover:text-white"
          }`}
        >
          <HelpCircle size={16} />
          Report Lost Pass / Issue
        </button>
      </div>

      {/* TAB 1: DIGITAL PASS */}
      {activeTab === "pass" && (
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          <div className="lg:col-span-6 flex justify-center">
            <DigitalPassCard
              pass={pass}
              student={user}
              onRenew={() => setShowRenewalModal(true)}
              onReportIssue={() => setShowIssueModal(true)}
            />
          </div>

          <div className="lg:col-span-6 space-y-6">
            {/* Quick How to Use Guide in Carbon & Mint */}
            <div className="rounded-3xl border border-[#222838] bg-[#12151e] p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#00f5a0]" />
                How Conductor Verification Works
              </h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                When boarding your college bus, show the QR code on your phone to the conductor. The conductor scans it with their mobile camera, which instantly checks the campus database and confirms:
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl bg-[#161a26] p-3 border border-[#252c3e]">
                  <span className="font-bold text-[#00f5a0]">✅ Dynamic Anti-Screenshot</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Live ticker proves the pass is not a forwarded image.</p>
                </div>
                <div className="rounded-2xl bg-[#161a26] p-3 border border-[#252c3e]">
                  <span className="font-bold text-[#00f5a0]">🛡️ Tokenized Pass ID</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Personal information is validated securely on server.</p>
                </div>
                <div className="rounded-2xl bg-[#161a26] p-3 border border-[#252c3e]">
                  <span className="font-bold text-[#00f5a0]">📱 No Phone? No Problem</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Tell conductor your ID <code className="text-[#00f5a0]">{user?.studentId}</code> for direct lookup.</p>
                </div>
                <div className="rounded-2xl bg-[#161a26] p-3 border border-[#252c3e]">
                  <span className="font-bold text-[#00f5a0]">🖨️ Physical Backup</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Print a paper copy anytime using the Print button.</p>
                </div>
              </div>
            </div>

            {/* Assigned Bus & Route Summary Card */}
            {pass && (
              <div className="rounded-3xl border border-[#222838] bg-[#12151e] p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BusFront size={16} className="text-[#00f5a0]" /> Assigned Transit Details
                  </h3>
                  <span className="text-xs font-mono font-bold bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30 px-2.5 py-1 rounded-lg">
                    {pass.passId}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-[#1f2434]">
                    <span className="text-slate-400">Route Name:</span>
                    <span className="font-semibold text-white">{pass.routeName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#1f2434]">
                    <span className="text-slate-400">Bus Registration:</span>
                    <span className="font-mono font-bold text-[#00f5a0]">{pass.busNumber || "Fleet Bus"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#1f2434]">
                    <span className="text-slate-400">Your Designated Stop:</span>
                    <span className="font-bold text-white">{pass.pickupStop}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#1f2434]">
                    <span className="text-slate-400">Pass Issued Date:</span>
                    <span className="font-medium text-slate-300">{pass.issuedDate}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Valid Expiry Date:</span>
                    <span className="font-bold font-mono text-[#00f5a0]">{pass.expiryDate}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ROUTE & SCHEDULE */}
      {activeTab === "route" && (
        <div className="rounded-3xl border border-[#222838] bg-[#12151e] p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">
                {route?.routeName || pass?.routeName || "Assigned Bus Route"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Bus Fleet No: <span className="font-mono font-bold text-[#00f5a0]">{route?.busNumber || pass?.busNumber}</span> • Driver: {route?.driverName || "Assigned Staff"} ({route?.driverPhone || "In-Service"})
              </p>
            </div>
            <div className="rounded-xl bg-[#00f5a0]/15 border border-[#00f5a0]/30 px-3.5 py-1.5 text-xs text-[#00f5a0] font-bold">
              Your Boarding Stop: {pass?.pickupStop || "Depot"}
            </div>
          </div>

          {/* Stops Timeline */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#00f5a0]/30">
            {route?.stops?.map((stop, index) => {
              const isUserStop = stop.stopName === pass?.pickupStop;
              return (
                <div key={index} className="relative flex items-start gap-4">
                  <div
                    className={`absolute -left-6 mt-1 h-3.5 w-3.5 rounded-full border-2 border-[#090a0f] ring-2 ${
                      isUserStop ? "bg-[#00f5a0] ring-[#00f5a0] animate-pulse" : "bg-[#1e2536] ring-[#2b354c]"
                    }`}
                  ></div>
                  <div className={`flex-1 rounded-2xl p-4 border transition ${
                    isUserStop ? "bg-[#17202c] border-[#00f5a0]/50 ring-1 ring-[#00f5a0]/30 shadow-mint-sm" : "bg-[#141723] border-[#222838]"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500">Stop #{stop.stopOrder}</span>
                        <h4 className="font-bold text-white text-sm">{stop.stopName}</h4>
                        {isUserStop && (
                          <span className="rounded-full bg-[#00f5a0]/20 text-[#00f5a0] text-[10px] font-black px-2 py-0.5">
                            YOUR STOP
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-[#00f5a0] bg-[#00f5a0]/10 border border-[#00f5a0]/20 px-2 py-0.5 rounded">
                          AM: {stop.morningTime}
                        </span>
                        <span className="text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                          PM: {stop.eveningTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: HISTORY */}
      {activeTab === "history" && (
        <div className="rounded-3xl border border-[#222838] bg-[#12151e] p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4">Pass Audit & Lifecycle History</h3>
          <div className="space-y-3">
            {pass?.history?.length > 0 ? (
              pass.history.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-2xl bg-[#141723] p-4 border border-[#222838]">
                  <div className="rounded-xl bg-[#00f5a0]/15 p-2 text-[#00f5a0] shrink-0 border border-[#00f5a0]/30">
                    <FileText size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-white">{item.action}</h4>
                      <span className="text-[11px] font-mono text-slate-500">{item.date}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{item.note}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No history records logged yet.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SUPPORT & ISSUES */}
      {activeTab === "support" && (
        <div className="rounded-3xl border border-[#222838] bg-[#12151e] p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Reported Issues & Inquiries</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Report lost passes, damaged physical cards, or request route updates.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowIssueModal(true)}
              className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-500 flex items-center gap-1.5 transition"
            >
              <AlertTriangle size={14} />
              Report Issue / Lost Pass
            </button>
          </div>

          <div className="space-y-3">
            {passData?.reportedIssues?.length > 0 ? (
              passData.reportedIssues.map((issue) => (
                <div key={issue.issueId} className="rounded-2xl border border-[#222838] p-4 bg-[#141723]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase font-mono text-[#00f5a0] bg-[#00f5a0]/15 px-2 py-0.5 rounded border border-[#00f5a0]/30">
                      {issue.issueType.replace("_", " ")}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      issue.status === "resolved" ? "bg-[#00f5a0]/20 text-[#00f5a0]" : "bg-amber-500/20 text-amber-300"
                    }`}>
                      {issue.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">{issue.description}</p>
                  {issue.resolutionNote && (
                    <div className="mt-2 text-xs text-[#00f5a0] bg-[#00f5a0]/10 p-2.5 rounded-xl border border-[#00f5a0]/20">
                      <strong>Admin Resolution:</strong> {issue.resolutionNote}
                    </div>
                  )}
                  <span className="text-[10px] text-slate-500 mt-2 block">
                    Logged on {new Date(issue.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No open issues reported. Everything is in good order!
              </div>
            )}
          </div>
        </div>
      )}

      {/* RENEWAL MODAL */}
      {showRenewalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#12151e] border border-[#222838] p-6 shadow-2xl text-white">
            <h3 className="text-lg font-bold">Request Bus Pass Renewal</h3>
            <p className="text-xs text-slate-400 mt-1">
              Extend validity for pass <code className="text-[#00f5a0]">{pass?.passId}</code>
            </p>

            <form onSubmit={handleRenewalSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Extension Duration
                </label>
                <select
                  value={renewalDays}
                  onChange={(e) => setRenewalDays(e.target.value)}
                  className="w-full rounded-xl border border-[#262d3e] bg-[#0c0e15] px-3.5 py-2 text-xs text-white"
                >
                  <option value={30}>1 Month (30 Days)</option>
                  <option value={90}>3 Months (90 Days)</option>
                  <option value={180}>Full Semester (180 Days)</option>
                  <option value={365}>Annual Academic Year (365 Days)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Institutional Fee Receipt / Ref Number
                </label>
                <input
                  type="text"
                  required
                  value={renewalReceipt}
                  onChange={(e) => setRenewalReceipt(e.target.value)}
                  placeholder="e.g. REC-2026-FEE-8819"
                  className="w-full rounded-xl border border-[#262d3e] bg-[#0c0e15] px-3.5 py-2 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Student Comments / Notes
                </label>
                <textarea
                  rows={2}
                  value={renewalComments}
                  onChange={(e) => setRenewalComments(e.target.value)}
                  placeholder="Transport fee deposited at counter 2."
                  className="w-full rounded-xl border border-[#262d3e] bg-[#0c0e15] px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRenewalModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRenewal}
                  className="rounded-xl bg-[#00f5a0] px-4 py-2 text-xs font-black text-slate-950 shadow-mint hover:bg-[#00d68b] disabled:opacity-50"
                >
                  {submittingRenewal ? "Submitting..." : "Submit Renewal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT ISSUE / LOST PASS MODAL */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#12151e] border border-[#222838] p-6 shadow-2xl text-white">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle size={20} className="text-rose-500" />
              Report Lost Pass or Issue
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Notify transport administration regarding lost card or route discrepancy.
            </p>

            <form onSubmit={handleIssueSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Issue Category
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full rounded-xl border border-[#262d3e] bg-[#0c0e15] px-3.5 py-2 text-xs text-white"
                >
                  <option value="lost_pass">Lost Physical Pass (Safety Risk)</option>
                  <option value="damaged_pass">Damaged / Illegible Card</option>
                  <option value="wrong_route">Incorrect Assigned Route or Stop</option>
                  <option value="other">Other Administrative Inquiry</option>
                </select>
              </div>

              {issueType === "lost_pass" && (
                <div className="rounded-xl bg-rose-500/15 border border-rose-500/30 p-3 text-xs text-rose-300 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="suspend-check"
                      checked={suspendPassToggle}
                      onChange={(e) => setSuspendPassToggle(e.target.checked)}
                      className="rounded text-rose-500 focus:ring-rose-500 h-4 w-4 bg-[#0c0e15]"
                    />
                    <label htmlFor="suspend-check" className="font-bold cursor-pointer text-white">
                      Immediately suspend active pass (Recommended)
                    </label>
                  </div>
                  <p className="text-[11px] text-rose-300 pl-6">
                    This prevents any unauthorized person who finds your physical card from boarding your bus.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Description / Incident Details *
                </label>
                <textarea
                  required
                  rows={3}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Describe where you last had the pass or what needs adjustment..."
                  className="w-full rounded-xl border border-[#262d3e] bg-[#0c0e15] px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingIssue}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-black text-white hover:bg-rose-500 disabled:opacity-50"
                >
                  {submittingIssue ? "Logging..." : "Submit Incident Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
