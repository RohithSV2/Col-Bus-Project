import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Camera,
  Upload,
  Keyboard,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function QRScannerComponent({ onScanSuccess, isVerifying }) {
  const [scanMode, setScanMode] = useState("camera"); // 'camera' | 'upload' | 'manual'
  const [manualInput, setManualInput] = useState("");
  const [cameraError, setCameraError] = useState(null);
  const scannerRef = useRef(null);

  // Initialize camera scanner
  useEffect(() => {
    let html5QrCode = null;

    if (scanMode === "camera") {
      setCameraError(null);
      const elementId = "reader";

      const timer = setTimeout(() => {
        try {
          html5QrCode = new Html5Qrcode(elementId);
          scannerRef.current = html5QrCode;

          const config = {
            fps: 10,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1.0,
          };

          html5QrCode
            .start(
              { facingMode: "environment" },
              config,
              (decodedText) => {
                try {
                  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                  const osc = audioCtx.createOscillator();
                  osc.frequency.setValueAtTime(800, audioCtx.currentTime);
                  osc.connect(audioCtx.destination);
                  osc.start();
                  osc.stop(audioCtx.currentTime + 0.12);
                } catch (e) {
                  // ignore
                }

                onScanSuccess(decodedText, "qr_camera");
              },
              () => {}
            )
            .catch((err) => {
              console.warn("Camera start failed:", err);
              setCameraError(
                "Camera access was blocked or not detected. You can switch to Image Upload or Manual Input mode below."
              );
            });
        } catch (e) {
          setCameraError("Scanner initialization error: " + e.message);
        }
      }, 200);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current && scannerRef.current.isScanning) {
          scannerRef.current
            .stop()
            .then(() => scannerRef.current.clear())
            .catch(() => {});
        }
      };
    }
  }, [scanMode]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode("reader-hidden");
      const decodedText = await html5QrCode.scanFile(file, true);
      onScanSuccess(decodedText, "qr_file");
    } catch (err) {
      alert("Could not detect a valid QR code in this image. Please ensure the image is clear.");
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    onScanSuccess(manualInput.trim(), "manual_id");
  };

  const handleSimulate = (token) => {
    onScanSuccess(token, "simulated_demo");
  };

  return (
    <div className="rounded-3xl border border-[#0e428a] bg-[#042a59] p-6 shadow-2xl text-white">
      {/* Mode Selector Tabs (Oxford & Vista) */}
      <div className="flex rounded-2xl bg-[#001733] p-1.5 mb-6 border border-[#0d3b78]">
        <button
          type="button"
          onClick={() => setScanMode("camera")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
            scanMode === "camera"
              ? "bg-[#7C9ED9] text-[#001733] shadow-vista-sm"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <Camera size={16} />
          Live Camera
        </button>
        <button
          type="button"
          onClick={() => setScanMode("upload")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
            scanMode === "upload"
              ? "bg-[#7C9ED9] text-[#001733] shadow-vista-sm"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <Upload size={16} />
          Upload Image
        </button>
        <button
          type="button"
          onClick={() => setScanMode("manual")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
            scanMode === "manual"
              ? "bg-[#7C9ED9] text-[#001733] shadow-vista-sm"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <Keyboard size={16} />
          Manual Code
        </button>
      </div>

      {/* Camera Mode */}
      {scanMode === "camera" && (
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-[#001530] border-2 border-[#7C9ED9]/50 shadow-vista">
            <div id="reader" className="w-full"></div>
            {isVerifying && (
              <div className="absolute inset-0 bg-[#001733]/90 backdrop-blur-sm flex items-center justify-center text-white">
                <RefreshCw size={30} className="animate-spin text-[#7C9ED9]" />
                <span className="ml-3 font-bold text-xs text-[#7C9ED9]">Verifying with Database...</span>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="mt-4 rounded-xl bg-amber-500/15 border border-amber-500/30 p-4 text-xs text-amber-200 flex items-start gap-2 max-w-sm">
              <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Camera Access Note:</p>
                <p className="mt-0.5">{cameraError}</p>
              </div>
            </div>
          )}

          <p className="mt-3 text-xs text-slate-300 text-center">
            Point camera at the student's digital bus pass QR code.
          </p>
        </div>
      )}

      {/* Upload Mode */}
      {scanMode === "upload" && (
        <div className="flex flex-col items-center py-6">
          <div id="reader-hidden" className="hidden"></div>
          <label className="flex flex-col items-center justify-center w-full max-w-sm h-48 border-2 border-dashed border-[#114b99] rounded-2xl cursor-pointer bg-[#021836] hover:bg-[#072852] hover:border-[#7C9ED9]/70 transition p-6 text-center">
            <Upload size={36} className="text-[#7C9ED9] mb-2" />
            <span className="text-xs font-bold text-white">Select Pass QR Screenshot or Photo</span>
            <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, or WEBP images</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      )}

      {/* Manual Input Mode */}
      {scanMode === "manual" && (
        <form onSubmit={handleManualSubmit} className="max-w-sm mx-auto space-y-3 py-4">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              Enter Pass ID or QR Token
            </label>
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="e.g. PASS-A8X72K or TOK-SEC-A8X72K-9918"
              className="w-full rounded-xl border border-[#114b99] bg-[#021836] px-4 py-2.5 text-xs text-white font-mono focus:border-[#7C9ED9] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isVerifying || !manualInput.trim()}
            className="w-full rounded-xl bg-[#7C9ED9] px-4 py-2.5 text-xs font-black text-[#001733] shadow-vista transition hover:bg-[#688ed0] disabled:opacity-50"
          >
            {isVerifying ? "Verifying..." : "Verify Pass Now"}
          </button>
        </form>
      )}

      {/* Quick Test / Simulator Bar in Vista Blue & Oxford Theme */}
      <div className="mt-6 border-t border-[#0e3b79] pt-4">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-300 mb-2.5">
          <Sparkles size={13} className="text-[#7C9ED9]" />
          <span>Quick Conductor Test Simulator (1-Click QR Scans)</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => handleSimulate("TOK-SEC-A8X72K-9918")}
            className="rounded-xl border border-[#7C9ED9]/50 bg-[#7C9ED9]/20 p-2 text-left text-xs text-white hover:bg-[#7C9ED9]/30 transition shadow-vista-sm"
          >
            <div className="font-bold text-xs text-[#7C9ED9]">Rahul (Active)</div>
            <div className="text-[10px] text-[#A5C2F6] font-black">VALID PASS</div>
          </button>
          <button
            type="button"
            onClick={() => handleSimulate("TOK-SEC-C5Q31T-7721")}
            className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-2 text-left text-xs text-white hover:bg-amber-500/20 transition"
          >
            <div className="font-bold text-xs text-amber-300">Arjun (Expired)</div>
            <div className="text-[10px] text-amber-400 font-bold">EXPIRED PASS</div>
          </button>
          <button
            type="button"
            onClick={() => handleSimulate("TOK-SEC-D9L82Z-1109")}
            className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-2 text-left text-xs text-white hover:bg-rose-500/20 transition"
          >
            <div className="font-bold text-xs text-rose-300">Priya (Lost Card)</div>
            <div className="text-[10px] text-rose-400 font-bold">SUSPENDED</div>
          </button>
          <button
            type="button"
            onClick={() => handleSimulate("FAKE-FORGED-TOKEN-9999")}
            className="rounded-xl border border-slate-700 bg-slate-800/60 p-2 text-left text-xs text-white hover:bg-slate-700/60 transition"
          >
            <div className="font-bold text-xs text-slate-300">Fake QR Code</div>
            <div className="text-[10px] text-slate-400 font-bold">INVALID</div>
          </button>
        </div>
      </div>
    </div>
  );
}
