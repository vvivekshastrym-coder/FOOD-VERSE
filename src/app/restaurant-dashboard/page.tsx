"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Store,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Package,
  Layers,
  Thermometer,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  RefreshCw
} from "lucide-react";

export default function RestaurantDashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/restaurant/dashboard");
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nextStatus,
          note: `Kitchen advanced status to ${nextStatus}`
        })
      });
      fetchDashboard();
    } catch {
      // Fallback
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleToggleStock = async (menuItemId: string, currentAvailable: boolean) => {
    try {
      await fetch("/api/restaurant/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuItemId,
          isAvailable: !currentAvailable
        })
      });
      fetchDashboard();
    } catch {
      // Fallback
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading Restaurant Partner Dashboard...</div>;
  }

  const restaurant = dashboardData?.restaurant;
  const metrics = dashboardData?.metrics || {};
  const activeOrders = dashboardData?.activeOrders || [];
  const menuItems = restaurant?.menuItems || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Store className="w-4 h-4" />
              <span>Restaurant Partner Portal</span>
            </div>
            <h1 className="text-3xl font-black text-white mt-1">{restaurant?.name || "Kitchen Dashboard"}</h1>
            <p className="text-xs text-slate-400">
              FSSAI: {restaurant?.fssaiNumber} • Hygiene Score: {restaurant?.hygieneRating}/5.0 • Live Kitchen Queue
            </p>
          </div>

          <button
            onClick={fetchDashboard}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 border border-slate-800 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Live Queue</span>
          </button>
        </div>

        {/* Analytics Top Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase">Active Kitchen Orders</span>
            <p className="text-2xl font-black text-amber-400 mt-1">{metrics.activeOrdersCount || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase">Gross Sales (Settled)</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">₹{metrics.grossRevenue?.toFixed(0) || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase">True-Size 3D Verified</span>
            <p className="text-2xl font-black text-white mt-1">{metrics.verifiedAssetsCount} / {metrics.totalDishes}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase">Avg Prep Duration</span>
            <p className="text-2xl font-black text-sky-400 mt-1">{metrics.avgPrepMinutes} mins</p>
          </div>
        </div>

        {/* Live Kitchen Order Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <span>Live Kitchen Order Inbox &amp; State Controls</span>
            </h3>
            <span className="text-xs text-slate-400">Enforcing authorized state machine</span>
          </div>

          {activeOrders.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-xs">
              Kitchen queue is currently clear. Awaiting new orders.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-400">#{order.orderNumber}</span>
                      <p className="text-xs text-slate-400 mt-0.5">OTP: <strong className="text-white font-mono">{order.otpCode}</strong></p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 uppercase border border-amber-500/40">
                      {order.status}
                    </span>
                  </div>

                  {/* Order items */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-slate-200">
                        <span><strong>{item.quantity}x</strong> {item.name}</span>
                        <span className="text-slate-400">₹{item.unitPrice * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Kitchen State Controls */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <span className="text-[11px] text-slate-400 block font-semibold">Advance Kitchen Stage:</span>
                    <div className="flex flex-wrap gap-2">
                      {order.status === "PLACED" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "ACCEPTED")}
                          disabled={updatingOrderId === order.id}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold"
                        >
                          Accept Order
                        </button>
                      )}
                      {order.status === "ACCEPTED" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "PREPARING")}
                          disabled={updatingOrderId === order.id}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold"
                        >
                          Start Cooking
                        </button>
                      )}
                      {order.status === "PREPARING" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "PLATING")}
                          disabled={updatingOrderId === order.id}
                          className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-400 text-slate-950 rounded-lg text-xs font-bold"
                        >
                          Plating &amp; Portion Check
                        </button>
                      )}
                      {order.status === "PLATING" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "PACKED")}
                          disabled={updatingOrderId === order.id}
                          className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold"
                        >
                          Seal in Thermal Bag
                        </button>
                      )}
                      {order.status === "PACKED" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "READY_FOR_PICKUP")}
                          disabled={updatingOrderId === order.id}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                        >
                          Ready for Rider Pickup
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Menu Inventory Management */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Menu Availability &amp; True-Size Status</h3>
              <p className="text-xs text-slate-400">Toggle real-time item stock to prevent overselling.</p>
            </div>
          </div>

          <div className="divide-y divide-slate-800">
            {menuItems.map((item: any) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center space-x-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.isAvailable ? "bg-emerald-400" : "bg-rose-500"}`} />
                  <div>
                    <h5 className="font-bold text-white">{item.name}</h5>
                    <p className="text-[11px] text-slate-400">
                      ₹{item.price} • {item.servingSize} • Stock: {item.inventory?.currentStock ?? 50}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {item.trueSizeVerified ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                      3D Verified
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-semibold">
                      Unverified
                    </span>
                  )}

                  <button
                    onClick={() => handleToggleStock(item.id, item.isAvailable)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      item.isAvailable
                        ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40"
                        : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40"
                    }`}
                  >
                    {item.isAvailable ? "Mark Sold Out" : "Mark Available"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
