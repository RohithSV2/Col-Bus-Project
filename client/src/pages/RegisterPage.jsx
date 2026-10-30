import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BusFront,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    email: "",
    password: "",
    institution: "Apex Institute of Technology",
    course: "B.Tech Computer Science & Engineering",
    year: "1st Year",
    phone: "",
    emergencyContact: "",
    routeId: "",
    pickupStop: "",
  });

  useEffect(() => {
    api
      .get("/routes")
      .then((res) => {
        if (res.data.success && res.data.routes.length > 0) {
          setRoutes(res.data.routes);
          const firstRoute = res.data.routes[0];
          setFormData((prev) => ({
            ...prev,
            routeId: firstRoute.routeId,
            pickupStop: firstRoute.stops?.[0]?.stopName || "Depot",
          }));
        }
      })
      .catch((err) => console.error("Could not fetch routes:", err))
      .finally(() => setLoadingRoutes(false));
  }, []);

  const handleRouteChange = (e) => {
    const selectedRouteId = e.target.value;
    const selectedRoute = routes.find((r) => r.routeId === selectedRouteId);
    setFormData((prev) => ({
      ...prev,
      routeId: selectedRouteId,
      pickupStop: selectedRoute?.stops?.[0]?.stopName || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await register(formData);
      navigate("/student");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRouteObj = routes.find((r) => r.routeId === formData.routeId);

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 flex items-center justify-center bg-[#090a0f]">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#00f5a0] to-[#059669] text-slate-950 shadow-mint">
            <BusFront size={26} className="stroke-[2.5]" />
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Register for Digital Bus Pass
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Create your student transit profile and apply for your route
          </p>
        </div>

        <div className="rounded-3xl border border-[#222838] bg-[#12151e] p-8 shadow-2xl">
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-xl bg-rose-500/15 border border-rose-500/30 p-3 text-xs text-rose-300">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Student Institutional ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="e.g. COL2026045"
                  className="w-full rounded-xl border border-[#262d3e] bg-[#0c0e15] px-3.5 py-2.5 text-xs text-white uppercase font-mono focus:border-[#00f5a0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rohith Sharma"
                  className="w-full rounded-xl border border-[#262d3e] bg-[#0c0e15] px-3.5 py-2.5 text-xs text-white focus:border-[#00f5a0] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  College / Institutional Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@college.edu"
                  className="w-full rounded-xl border border-[#262d3e] bg-[#0c0e15] px-3.5 py-2.5 text-xs text-white focus:border-[#00f5a0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Create Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-[#262d3e] bg-[#0c0e15] px-3.5 py-2.5 text-xs text-white focus:border-[#00f5a0] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Course / Department
                </label>
                <input
                  type="text"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  placeholder="e.g. B.Tech Computer Science"
                  className="w-full rounded-xl border border-[#262d3e] bg-[#0c0e15] px-3.5 py-2.5 text-xs text-white focus:border-[#00f5a0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Academic Year
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full rounded-xl border border-[#262d3e] bg-[#0c0e15] px-3.5 py-2.5 text-xs text-white focus:border-[#00f5a0] focus:outline-none"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>
            </div>

            {/* Route Selection (Mint Box) */}
            <div className="rounded-2xl bg-[#161a25] border border-[#00f5a0]/30 p-4 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-[#00f5a0] flex items-center gap-1.5">
                <MapPin size={14} className="text-[#00f5a0]" />
                Select Bus Route & Boarding Stop
              </span>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Assigned Route *
                  </label>
                  <select
                    required
                    value={formData.routeId}
                    onChange={handleRouteChange}
                    disabled={loadingRoutes}
                    className="w-full rounded-xl border border-[#262d3e] bg-[#0c0e15] px-3.5 py-2.5 text-xs text-white font-medium focus:border-[#00f5a0] focus:outline-none"
                  >
                    {routes.map((r) => (
                      <option key={r.routeId} value={r.routeId}>
                        {r.routeName} (Bus: {r.busNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Pickup / Boarding Stop *
                  </label>
                  <select
                    required
                    value={formData.pickupStop}
                    onChange={(e) => setFormData({ ...formData, pickupStop: e.target.value })}
                    className="w-full rounded-xl border border-[#262d3e] bg-[#0c0e15] px-3.5 py-2.5 text-xs text-white font-medium focus:border-[#00f5a0] focus:outline-none"
                  >
                    {selectedRouteObj?.stops?.map((stop, idx) => (
                      <option key={idx} value={stop.stopName}>
                        {stop.stopName} ({stop.morningTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Mobile Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 00000"
                  className="w-full rounded-xl border border-[#262d3e] bg-[#0c0e15] px-3.5 py-2.5 text-xs text-white focus:border-[#00f5a0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Emergency Contact (Parent/Guardian)
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="+91 98765 11111 (Parent)"
                  className="w-full rounded-xl border border-[#262d3e] bg-[#0c0e15] px-3.5 py-2.5 text-xs text-white focus:border-[#00f5a0] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full rounded-xl bg-[#00f5a0] py-3 text-xs font-black text-slate-950 shadow-mint transition hover:bg-[#00d68b] disabled:opacity-50"
            >
              {submitting ? "Submitting Application..." : "Submit Pass Application"}
            </button>
          </form>

          <div className="mt-6 border-t border-[#1f2434] pt-5 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-[#00f5a0] hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
