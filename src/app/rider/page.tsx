"use client";

import React, { useEffect, useState } from "react";
import {
  Bike,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  Navigation,
  ShieldCheck,
  TrendingUp,
  Package
} from "lucide-react";

export default function RiderPWAPage() {
  const [riderData, setRiderData] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRiderData = async () => {
    try {
      const res = await fetch("/api/rider/tasks");
      const data = await res.json();
      setRiderData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiderData();
    const interval = setInterval(fetchRiderData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action: "PICKUP" | "DELIVER") => {
    if (!riderData?.activeTask) return;
    setUpdating(true);
    setOtpError(null);

    try {
      const res = await fetch("/api/rider/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: riderData.activeTask.id,
          action,
          otpCode: action === "DELIVER" ? otpInput.trim() : undefined
        })
      });
      const data = await res.json();
      if (data.error) {
        setOtpError(data.error);
      } else {
        setOtpInput("");
        fetchRiderData();
      }
    } catch {
      setOtpError("Network error updating task");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading Rider App...</div>;
  }

  const rider = riderData?.rider;
  const activeTask = riderData?.activeTask;
  const order = activeTask?.order;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* Rider Top Profile & Online Toggle */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h2 className="text-base font-bold text-white">{rider?.name || "Suresh Kumar"}</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-400">EV Fleet Partner • Bengaluru</p>
            </div>
          </div>

          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              isOnline
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
          >
            {isOnline ? "Online" : "Offline"}
          </button>
        </div>

        {/* Daily Earnings & Completed Trips */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Today&apos;s Earnings</span>
            <p className="text-xl font-black text-emerald-400 mt-0.5">₹{riderData?.totalEarnings?.toFixed(0) || 195}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Completed Trips</span>
            <p className="text-xl font-black text-amber-400 mt-0.5">{riderData?.completedTrips || 3}</p>
          </div>
        </div>

        {/* Active Delivery Task Card */}
        {activeTask && order ? (
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-blue-500/40 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-blue-400">TASK #{order.orderNumber}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 uppercase">
                {activeTask.status}
              </span>
            </div>

            {/* Pickup Stage */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">1. Pickup Restaurant:</span>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="text-sm font-bold text-white">{order.restaurant.name}</p>
                <p className="text-xs text-slate-400 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>{order.restaurant.address}</span>
                </p>
              </div>

              {activeTask.status !== "PICKED_UP" && activeTask.status !== "DELIVERED" && (
                <button
                  onClick={() => handleAction("PICKUP")}
                  disabled={updating}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition"
                >
                  <Package className="w-4 h-4" />
                  <span>Confirm Pickup from Kitchen</span>
                </button>
              )}
            </div>

            {/* Delivery Stage */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">2. Customer Destination:</span>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="text-xs text-slate-300">{order.deliveryAddress}</p>
                <p className="text-[10px] text-emerald-400 font-semibold">Trip Earning: ₹{activeTask.earningsAmount}</p>
              </div>

              {activeTask.status === "PICKED_UP" && (
                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-slate-300">
                    <p className="font-semibold text-indigo-300 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Customer Verification Handoff</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Ask the customer for their 4-digit FoodVerse delivery OTP before handing over the parcel.
                    </p>
                  </div>

                  <input
                    type="text"
                    maxLength={4}
                    placeholder="Enter 4-Digit OTP"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 text-center text-lg font-mono font-bold tracking-widest text-white focus:outline-none focus:border-emerald-500"
                  />

                  {otpError && <p className="text-xs text-rose-400 font-semibold">{otpError}</p>}

                  <button
                    onClick={() => handleAction("DELIVER")}
                    disabled={updating || otpInput.length < 4}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify OTP &amp; Complete Order</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <Bike className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-bold text-slate-300">No Active Tasks Assigned</p>
            <p className="text-xs text-slate-500">Stay online in Indiranagar/Koramangala to receive instant delivery offers.</p>
          </div>
        )}
      </div>
    </div>
  );
}
