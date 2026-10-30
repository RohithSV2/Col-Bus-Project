import React from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertOctagon,
  Clock,
  BusFront,
  MapPin,
  Calendar,
  User,
  ArrowRight,
} from "lucide-react";

export default function VerificationResultModal({ result, onClose }) {
  if (!result) return null;

  const isSuccess = result.result === "VALID";
  const isExpired = result.result === "EXPIRED";
  const isSuspended = result.result === "SUSPENDED";
  const isPending = result.result === "PENDING_APPROVAL";

  const getHeaderConfig = () => {
    if (isSuccess) {
      return {
        bg: "bg-[#00f5a0]",
        headerText: "text-slate-950",
        subText: "text-slate-900/80 font-bold",
        iconColor: "text-slate-950",
        pillBg: "bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30",
        icon: CheckCircle2,
        title: "PASS IS VALID",
        sub: "Authorized for Bus Travel",
      };
    }
    if (isExpired) {
      return {
        bg: "bg-amber-500",
        headerText: "text-slate-950",
        subText: "text-slate-900/80 font-bold",
        iconColor: "text-slate-950",
        pillBg: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
        icon: AlertTriangle,
        title: "PASS HAS EXPIRED",
        sub: "Validity period ended. Renewal required.",
      };
    }
    if (isSuspended) {
      return {
        bg: "bg-rose-600",
        headerText: "text-white",
        subText: "text-rose-100",
        iconColor: "text-white",
        pillBg: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
        icon: AlertOctagon,
        title: "PASS SUSPENDED / BLOCKED",
        sub: "Card flagged as lost, stolen, or blocked.",
      };
    }
    if (isPending) {
      return {
        bg: "bg-sky-500",
        headerText: "text-slate-950",
        subText: "text-slate-900/80 font-bold",
        iconColor: "text-slate-950",
        pillBg: "bg-sky-500/15 text-sky-300 border border-sky-500/30",
        icon: Clock,
        title: "PENDING APPROVAL",
        sub: "Application not yet approved by transport admin.",
      };
    }
    return {
      bg: "bg-slate-800",
      headerText: "text-white",
      subText: "text-slate-300",
      iconColor: "text-rose-400",
      pillBg: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
      icon: XCircle,
      title: "INVALID PASS",
      sub: "Unregistered or forged pass code.",
    };
  };

  const config = getHeaderConfig();
  const HeaderIcon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-[#12151e] border border-[#262c3e] shadow-2xl text-white">
        {/* Status Header Banner */}
        <div className={`${config.bg} p-6 ${config.headerText} text-center relative`}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-black/15 backdrop-blur-md mb-3 shadow-lg">
            <HeaderIcon size={38} className={config.iconColor} />
          </div>
          <h2 className="text-2xl font-black tracking-tight">{config.title}</h2>
          <p className={`mt-1 text-xs ${config.subText}`}>{config.sub}</p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Reason / System explanation banner */}
          {result.reason && (
            <div className={`rounded-xl ${config.pillBg} p-3 text-xs font-semibold`}>
              {result.reason}
            </div>
          )}

          {/* Route Mismatch Warning if any */}
          {result.routeNotice && (
            <div className="rounded-xl bg-amber-500/15 border border-amber-500/30 p-3 text-xs font-medium text-amber-200">
              ⚠️ {result.routeNotice}
            </div>
          )}

          {/* Student Profile Info */}
          {result.student && (
            <div className="flex items-center gap-4 rounded-2xl bg-[#171b26] p-4 border border-[#23293a]">
              {result.student.photoUrl ? (
                <img
                  src={result.student.photoUrl}
                  alt={result.student.name}
                  className="h-16 w-16 rounded-xl object-cover ring-2 ring-[#00f5a0]/40"
                />
              ) : (
                <div className="h-16 w-16 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                  <User size={30} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-white truncate">{result.student.name}</h3>
                <p className="text-xs font-mono font-bold text-[#00f5a0]">ID: {result.student.studentId}</p>
                <p className="text-xs text-slate-300 truncate">{result.student.course}</p>
                <p className="text-[11px] text-slate-400 truncate">{result.student.institution}</p>
              </div>
            </div>
          )}

          {/* Route & Pass Details */}
          {result.pass && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-[#23293a] bg-[#171b26] p-3">
                <span className="text-slate-400 flex items-center gap-1">
                  <BusFront size={13} className="text-[#00f5a0]" /> Assigned Bus
                </span>
                <p className="mt-1 font-mono font-bold text-white text-sm">{result.pass.busNumber || "Fleet"}</p>
              </div>

              <div className="rounded-xl border border-[#23293a] bg-[#171b26] p-3">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar size={13} className="text-[#00f5a0]" /> Valid Until
                </span>
                <p className={`mt-1 font-mono font-bold text-sm ${isExpired ? "text-amber-400" : "text-white"}`}>
                  {result.pass.expiryDate}
                </p>
              </div>

              <div className="col-span-2 rounded-xl border border-[#23293a] bg-[#171b26] p-3">
                <span className="text-slate-400 flex items-center gap-1">
                  <MapPin size={13} className="text-cyan-400" /> Authorized Route & Stop
                </span>
                <p className="mt-1 font-semibold text-white">{result.pass.routeName}</p>
                <p className="text-[11px] text-[#00f5a0] mt-0.5">Boarding Stop: {result.pass.pickupStop}</p>
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          {result.student?.emergencyContact && (
            <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
              <span>Emergency Contact:</span>
              <span className="font-semibold text-slate-200">{result.student.emergencyContact}</span>
            </div>
          )}

          <div className="text-[10px] text-slate-500 text-center font-mono">
            Verified at {new Date(result.verifiedAt).toLocaleTimeString()} • Verified by Conductor
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-[#0b0d13] p-4 border-t border-[#1f2536] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-[#00f5a0] py-3 text-xs font-black text-slate-950 transition hover:bg-[#00d68b] shadow-mint flex items-center justify-center gap-2"
          >
            <span>Scan Next Pass</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
