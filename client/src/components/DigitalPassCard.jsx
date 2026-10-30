import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  BusFront,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Printer,
  Copy,
  Check,
  MapPin,
  Calendar,
  AlertOctagon,
} from "lucide-react";

export default function DigitalPassCard({ pass, student, onRenew, onReportIssue }) {
  const [copied, setCopied] = useState(false);
  const [liveTime, setLiveTime] = useState(new Date().toLocaleTimeString());

  // Second-by-second ticker for screenshot tamper-resistance proof
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!pass) {
    return (
      <div className="rounded-3xl border border-[#222838] bg-[#12151e] p-10 text-center shadow-xl">
        <BusFront className="mx-auto h-12 w-12 text-[#00f5a0]" />
        <h3 className="mt-3 text-lg font-bold text-white">No Bus Pass Issued Yet</h3>
        <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
          You do not have an active digital bus pass. Apply for your route pass below or wait for transport admin approval.
        </p>
      </div>
    );
  }

  const handleCopyToken = () => {
    navigator.clipboard.writeText(pass.qrVerificationToken || pass.passId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Status badge config
  const getStatusBadge = () => {
    switch (pass.status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00f5a0]/20 border border-[#00f5a0]/60 px-3 py-1 text-xs font-black text-[#00f5a0] shadow-mint-sm">
            <span className="h-2 w-2 rounded-full bg-[#00f5a0] animate-ping"></span>
            ACTIVE PASS
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-1 text-xs font-bold text-amber-300">
            <AlertTriangle size={13} className="text-amber-400" />
            EXPIRED
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-400/40 px-3 py-1 text-xs font-bold text-rose-300">
            <AlertOctagon size={13} className="text-rose-400" />
            SUSPENDED
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 border border-sky-400/40 px-3 py-1 text-xs font-bold text-sky-300">
            <Clock size={13} className="text-sky-400" />
            PENDING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-700 px-3 py-1 text-xs font-bold text-slate-300">
            {pass.status?.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* The Printable / Viewable Pass Card (Carbon Black & Electric Mint) */}
      <div
        id="digital-bus-pass"
        className="w-full max-w-md overflow-hidden rounded-3xl bg-[#0d0f17] text-white shadow-2xl ring-1 ring-[#00f5a0]/30 border border-[#1f2434] relative shadow-mint"
      >
        {/* Holographic Watermark / Top Band in Electric Mint */}
        <div className="bg-gradient-to-r from-[#00f5a0] via-[#059669] to-[#00f5a0] px-5 py-3 text-slate-950 flex items-center justify-between border-b border-[#00f5a0]/40">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950 text-[#00f5a0] shadow-sm">
              <BusFront size={17} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-950">
                Apex Institute of Technology
              </p>
              <p className="text-[9px] font-bold text-slate-900/90 tracking-wide">Smart Transit Digital Bus Pass</p>
            </div>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* Live Security Pulse Bar (Anti-screenshot feature) */}
        <div className="bg-[#121622] px-4 py-1.5 flex items-center justify-between text-[10px] border-b border-[#1c2232] font-mono text-[#00f5a0]">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00f5a0] animate-pulse"></span>
            <span>LIVE SECURE TOKEN: {liveTime}</span>
          </div>
          <span className="text-white font-bold">{pass.passId}</span>
        </div>

        {/* Card Body */}
        <div className="p-6">
          {/* Student Profile Row */}
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <img
                src={pass.photoUrl || student?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
                alt={pass.studentName}
                className="h-20 w-20 rounded-2xl object-cover ring-2 ring-[#00f5a0]/60 shadow-mint-sm"
              />
              <div className="absolute -bottom-2 -right-2 rounded-full bg-[#00f5a0] p-1 text-slate-950 shadow">
                <ShieldCheck size={14} className="stroke-[2.5]" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black tracking-tight text-white truncate">{pass.studentName}</h2>
              <p className="text-xs font-mono font-bold text-[#00f5a0] mt-0.5">
                ID: {pass.studentId}
              </p>
              <p className="text-xs text-slate-300 mt-1 truncate">
                {pass.course || "B.Tech Undergraduate"}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {pass.institution || "Apex Institute of Technology"}
              </p>
            </div>
          </div>

          {/* High-Contrast QR Code Verification Section */}
          <div className="mt-5 rounded-2xl bg-white p-4 text-slate-900 shadow-inner flex flex-col items-center justify-center relative group">
            <div className="p-2 bg-white rounded-xl">
              <QRCodeSVG
                value={pass.qrVerificationToken || pass.passId}
                size={170}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="text-[10px] font-black tracking-wider text-slate-700 uppercase mt-2">
              Scan with Bus Conductor Terminal
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              <span>{pass.qrVerificationToken || pass.passId}</span>
              <button
                type="button"
                onClick={handleCopyToken}
                className="text-slate-600 hover:text-black focus:outline-none"
                title="Copy token"
              >
                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          {/* Route & Bus Details Card (Carbon Slate + Mint Accents) */}
          <div className="mt-5 rounded-2xl bg-[#131622] border border-[#22283a] p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <BusFront size={14} className="text-[#00f5a0]" /> Assigned Bus:
              </span>
              <span className="font-black text-white font-mono bg-[#1c2233] px-2.5 py-0.5 rounded border border-[#2d364d]">
                {pass.busNumber || "Bus Fleet"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <MapPin size={14} className="text-[#00f5a0]" /> Route:
              </span>
              <span className="font-semibold text-slate-200 truncate max-w-[200px]" title={pass.routeName}>
                {pass.routeName}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <MapPin size={14} className="text-cyan-400" /> Boarding Stop:
              </span>
              <span className="font-bold text-[#00f5a0]">
                {pass.pickupStop}
              </span>
            </div>

            <div className="border-t border-[#1f2536] pt-2 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar size={14} className="text-[#00f5a0]" /> Valid Until:
              </span>
              <span className={`font-black font-mono ${pass.status === 'expired' ? 'text-amber-400' : 'text-white'}`}>
                {pass.expiryDate}
              </span>
            </div>
          </div>

          {/* Suspension / Expiry Notice banner inside card */}
          {pass.status === "suspended" && (
            <div className="mt-4 rounded-xl bg-rose-950/80 border border-rose-500/50 p-3 text-center">
              <p className="text-xs font-bold text-rose-200">Pass Suspended by Institution</p>
              <p className="text-[11px] text-rose-300 mt-0.5">{pass.rejectionReason || "Reported lost or stolen."}</p>
            </div>
          )}

          {pass.status === "expired" && (
            <div className="mt-4 rounded-xl bg-amber-950/80 border border-amber-500/50 p-3 text-center">
              <p className="text-xs font-bold text-amber-200">Validity Period Concluded</p>
              <p className="text-[11px] text-amber-300 mt-0.5">Please request renewal to continue traveling.</p>
            </div>
          )}
        </div>

        {/* Card Footer Microtext */}
        <div className="bg-[#08090e] px-6 py-2.5 text-center text-[10px] text-slate-500 border-t border-[#1b202e]">
          Non-transferable • Must be presented upon request • Transport Authority ID: APEX-BUS-2026
        </div>
      </div>

      {/* Action Buttons underneath Card */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-xl border border-[#282f42] bg-[#141824] px-4 py-2.5 text-xs font-bold text-slate-200 shadow-sm transition hover:bg-[#1e2333] hover:text-[#00f5a0]"
        >
          <Printer size={15} />
          Print / Save PDF
        </button>

        {onRenew && (pass.status === "expired" || pass.status === "active") && (
          <button
            type="button"
            onClick={onRenew}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00f5a0] px-4 py-2.5 text-xs font-black text-slate-950 shadow-mint transition hover:bg-[#00d68b]"
          >
            <Clock size={15} />
            Request Renewal
          </button>
        )}

        {onReportIssue && (
          <button
            type="button"
            onClick={onReportIssue}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20"
          >
            <AlertTriangle size={15} />
            Report Lost / Issue
          </button>
        )}
      </div>
    </div>
  );
}
