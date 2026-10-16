"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Plus,
  ThumbsUp,
  ThumbsDown,
  ShoppingBag,
  ShieldCheck,
  Lock,
  Share2,
  Check,
  AlertCircle
} from "lucide-react";
import { Suspense } from "react";

function SingleFoodRoomContent() {
  const params = useParams();
  const router = useRouter();
  const code = (params?.code as string)?.toUpperCase();

  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoom = async () => {
    try {
      const res = await fetch(`/api/food-room/${code}`);
      const data = await res.json();
      if (data.room) {
        setRoomData(data);
      } else {
        setError(data.error || "Room not found");
      }
    } catch {
      setError("Failed to load room");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      fetchRoom();
      const interval = setInterval(fetchRoom, 4000); // Live synchronization interval
      return () => clearInterval(interval);
    }
  }, [code]);

  const handleAddItem = async (menuItemId: string) => {
    try {
      const res = await fetch(`/api/food-room/${code}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuItemId, quantity: 1 })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setTimeout(() => setError(null), 4000);
      } else {
        fetchRoom();
      }
    } catch {
      // Fallback
    }
  };

  const handleVote = async (roomItemId: string, vote: number) => {
    try {
      await fetch(`/api/food-room/${code}/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomItemId, vote })
      });
      fetchRoom();
    } catch {
      // Fallback
    }
  };

  const handleHostCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch(`/api/food-room/${code}/checkout`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/orders?active=${data.orderId}`);
      } else {
        setError(data.error || "Checkout failed");
        setCheckingOut(false);
      }
    } catch {
      setError("Network error on checkout");
      setCheckingOut(false);
    }
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Synchronizing Food Room...</div>;
  }

  if (!roomData || !roomData.room) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-white">Food Room Not Found</h2>
        <Link href="/food-room" className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          Return to Food Room Hub
        </Link>
      </div>
    );
  }

  const room = roomData.room;
  const isHost = roomData.isHost;
  const items = room.items || [];
  const members = room.members || [];
  const memberShares = roomData.memberShares || {};
  const totalAmount = roomData.totalGroupAmount || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Top Header Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 font-mono text-xs font-black tracking-widest border border-indigo-500/40">
                ROOM #{room.code}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                ● Live Synchronized
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1.5">{room.restaurant.name} Feast</h1>
            <p className="text-xs text-slate-400">
              Host: <strong>{members.find((m: any) => m.isHost)?.name || "Host"}</strong> • Split Type: {room.splitType === "EQUAL" ? "Equal Split" : "Item-Based (Pay what you pick)"}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={copyInvite}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? "Link Copied!" : "Share Invite Link"}</span>
            </button>

            {isHost && (
              <button
                onClick={handleHostCheckout}
                disabled={checkingOut || items.length === 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center space-x-2 transition shadow-lg shadow-amber-500/20"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{checkingOut ? "Checking out..." : `Host Checkout (₹${totalAmount})`}</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Shared Basket & Voting Left Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>Shared Food Room Cart</span>
                  <span className="text-xs text-slate-400">({items.length} items)</span>
                </h3>
                <span className="text-lg font-black text-amber-400">Total: ₹{totalAmount}</span>
              </div>

              {items.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No dishes added yet! Select an item below to propose to the room.
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item: any) => {
                    const upvotes = item.votes?.filter((v: any) => v.vote > 0).length || 0;
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4"
                      >
                        <div>
                          <h4 className="text-sm font-bold text-white">{item.name}</h4>
                          <p className="text-[11px] text-slate-400">
                            Added by <strong className="text-indigo-300">{item.member?.name}</strong> • ₹{item.price} x {item.quantity}
                          </p>
                        </div>

                        <div className="flex items-center space-x-3">
                          {/* Voting Pill */}
                          <div className="flex items-center space-x-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                            <button
                              onClick={() => handleVote(item.id, 1)}
                              className="p-1 text-slate-400 hover:text-emerald-400 transition"
                              title="Upvote"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-mono font-bold text-slate-200">{upvotes}</span>
                            <button
                              onClick={() => handleVote(item.id, -1)}
                              className="p-1 text-slate-400 hover:text-rose-400 transition"
                              title="Downvote"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="text-xs font-black text-amber-400">₹{(item.price * item.quantity).toFixed(0)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Menu Proposer: Quick Add dishes from Restaurant */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Add Dishes from {room.restaurant.name}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {room.restaurant.menuItems?.map((dish: any) => (
                  <div
                    key={dish.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{dish.name}</p>
                      <p className="text-amber-400 font-semibold">₹{dish.price}</p>
                    </div>
                    <button
                      onClick={() => handleAddItem(dish.id)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center space-x-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Members List & Cost Split Breakdown Right Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Live Room Members */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Room Members ({members.length})</span>
              </h4>

              <div className="space-y-2">
                {members.map((m: any) => (
                  <div key={m.id} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${m.isHost ? "bg-amber-400" : "bg-emerald-400"}`} />
                      <span className="font-bold text-white">{m.name}</span>
                    </div>
                    {m.isHost && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                        Host
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Split Cost Breakdown */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Fair Share Allocation
              </h4>

              <div className="divide-y divide-slate-800 text-xs">
                {Object.entries(memberShares).map(([mId, share]: [string, any]) => (
                  <div key={mId} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{share.memberName}</p>
                      <p className="text-[10px] text-slate-400">{share.itemCount} items ordered</p>
                    </div>
                    <span className="text-sm font-extrabold text-amber-400">₹{share.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
                Host initiates unified payment. Individual UPI payment collection links will be sent to members upon delivery.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SingleFoodRoomPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading Food Room...</div>}>
      <SingleFoodRoomContent />
    </Suspense>
  );
}

