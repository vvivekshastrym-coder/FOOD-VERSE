"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Clock,
  MapPin,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Phone,
  Bike,
  Sparkles,
  Layers,
  ArrowRight
} from "lucide-react";
import OrderTracking3D from "@/components/3d/OrderTracking3D";
import { Suspense } from "react";

function OrdersContent() {
  const searchParams = useSearchParams();
  const activeId = searchParams.get("active");

  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Dispute modal state
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeType, setDisputeType] = useState("TRUE_SIZE_MISMATCH");
  const [disputeDesc, setDisputeDesc] = useState("");
  const [disputeSuccess, setDisputeSuccess] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
        if (activeId) {
          const match = data.orders.find((o: any) => o.id === activeId);
          if (match) setSelectedOrder(match);
          else if (data.orders.length > 0) setSelectedOrder(data.orders[0]);
        } else if (data.orders.length > 0) {
          setSelectedOrder(data.orders[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000); // Polling live order events
    return () => clearInterval(interval);
  }, [activeId]);

  const handleFileDispute = async () => {
    if (!selectedOrder) return;
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: disputeType,
          description: disputeDesc || "Portion size received differs significantly from the 3D verified dimensions & serving weight."
        })
      });
      const data = await res.json();
      if (data.success) {
        setDisputeSuccess("Dispute filed under True-Size Guarantee! Our operations audit team will review the kitchen logs.");
        setTimeout(() => {
          setIsDisputeModalOpen(false);
          setDisputeSuccess(null);
          fetchOrders();
        }, 2000);
      }
    } catch {
      // Fallback
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading Orders...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">Kitchen-To-Door Story</span>
          <h1 className="text-3xl font-black text-white mt-1">Live Order Status &amp; Deliveries</h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative order states verified by restaurant kitchen and delivery fleet. No fabricated coordinates.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
            <p className="text-slate-400 text-sm">No orders found.</p>
            <Link href="/" className="inline-block px-6 py-3 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
              Discover Verified 3D Dishes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Orders Selector Left Column */}
            <div className="lg:col-span-4 space-y-3">
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Your Orders</span>
              {orders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    selectedOrder?.id === o.id
                      ? "bg-slate-900 border-amber-500/80 shadow-lg shadow-amber-500/10"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white">#{o.orderNumber}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 uppercase">
                      {o.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-200 mt-1">{o.restaurant.name}</h4>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                    <span>{o.items?.length} dishes • ₹{o.totalAmount}</span>
                    <span className="text-[10px]">{new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Live 3D Tracking Right Column */}
            <div className="lg:col-span-8 space-y-6">
              {selectedOrder ? (
                <>
                  <OrderTracking3D
                    order={selectedOrder}
                    onFileDispute={() => setIsDisputeModalOpen(true)}
                  />

                  {/* Order Items Summary */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Dishes In This Order</h4>
                    <div className="divide-y divide-slate-800">
                      {selectedOrder.items?.map((item: any) => (
                        <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-amber-400">{item.quantity}x</span>
                            <span className="text-white font-medium">{item.name}</span>
                          </div>
                          <span className="font-semibold text-slate-300">₹{(item.unitPrice * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span>Payment: <strong>{selectedOrder.paymentMethod}</strong> ({selectedOrder.paymentStatus})</span>
                      <span>Total Paid: <strong className="text-white text-sm">₹{selectedOrder.totalAmount}</strong></span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
                  Select an order to view live 3D status and delivery progression.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dispute Modal */}
      {isDisputeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">File True-Size / Quality Dispute</h3>
              </div>
              <button
                onClick={() => setIsDisputeModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Under the FoodVerse True-Size Promise, if your dish serving weight or dimensions deviate materially from verified specifications, you are eligible for an immediate refund.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Dispute Reason:</label>
                <select
                  value={disputeType}
                  onChange={(e) => setDisputeType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="TRUE_SIZE_MISMATCH">True-Size Serving Discrepancy (&gt;15% deficit)</option>
                  <option value="MISSING_ITEM">Missing Item or Variant</option>
                  <option value="QUALITY_DEFECT">Food Safety or Cold Delivery Issue</option>
                  <option value="LATE_DELIVERY">Excessive Preparation Delay</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Details &amp; Observed Measurement:</label>
                <textarea
                  rows={3}
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  placeholder="e.g. Biryani handi portion weighed 320g instead of the 450g verified promise."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                <span>Photo Evidence: Camera upload ready. Will be audited alongside kitchen dispatch photos.</span>
              </div>
            </div>

            {disputeSuccess && (
              <p className="text-xs text-emerald-400 font-semibold">{disputeSuccess}</p>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsDisputeModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleFileDispute}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                Submit Dispute Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading Orders...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
