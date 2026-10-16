"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Plus, ArrowRight, ShieldCheck, Sparkles, Check } from "lucide-react";

export default function FoodRoomHubPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [spendingLimit, setSpendingLimit] = useState("");
  const [splitType, setSplitType] = useState("ITEM_BASED");
  const [creating, setCreating] = useState(false);
  const [userRooms, setUserRooms] = useState<any[]>([]);

  useEffect(() => {
    async function loadRooms() {
      try {
        const res = await fetch("/api/food-room");
        const data = await res.json();
        if (data.rooms) setUserRooms(data.rooms);
      } catch (err) {
        console.error(err);
      }
    }
    loadRooms();
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    router.push(`/food-room/${roomCode.trim().toUpperCase()}`);
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/food-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spendingLimit: spendingLimit ? parseFloat(spendingLimit) : null,
          splitType
        })
      });
      const data = await res.json();
      if (data.room) {
        router.push(`/food-room/${data.room.code}`);
      }
    } catch {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-10 space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
            <Users className="w-3.5 h-3.5" />
            <span>Signature Pillar 3: Food Room</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Collaborative Group Ordering</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Order together with friends or coworkers. Add your own dishes in 3D, vote on shared starters, review the group total, and split costs fairly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Join Existing Room Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Join a Food Room</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Have an invite code from your host? Enter the 6-digit code below.</p>
            </div>

            <form onSubmit={handleJoin} className="space-y-3">
              <input
                type="text"
                placeholder="e.g. ROOM42 or FDV882"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono uppercase text-center text-white focus:outline-none focus:border-indigo-500 tracking-widest font-bold"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-indigo-600/30"
              >
                <span>Enter Room</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Create New Room Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-800/40 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Host a New Room</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">Host Mode</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Generate a shareable room code and invite your lunch crew.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Optional Group Spending Limit (₹):</label>
                <input
                  type="number"
                  placeholder="e.g. 1500 (Leave empty for no limit)"
                  value={spendingLimit}
                  onChange={(e) => setSpendingLimit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Cost Split Strategy:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSplitType("ITEM_BASED")}
                    className={`p-2 rounded-xl border text-center transition ${
                      splitType === "ITEM_BASED"
                        ? "bg-indigo-600 border-indigo-500 text-white font-bold"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    Pay What You Pick
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitType("EQUAL")}
                    className={`p-2 rounded-xl border text-center transition ${
                      splitType === "EQUAL"
                        ? "bg-indigo-600 border-indigo-500 text-white font-bold"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    Split Bill Equally
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-amber-500/20"
              >
                <span>{creating ? "Creating..." : "Create & Get Invite Link"}</span>
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Previous Active Rooms */}
        {userRooms.length > 0 && (
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Your Active / Past Rooms</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {userRooms.map((r) => (
                <Link
                  key={r.id}
                  href={`/food-room/${r.code}`}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-mono font-bold text-indigo-400">#{r.code}</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{r.restaurant?.name || "Restaurant"}</h4>
                    <p className="text-[11px] text-slate-400">{r.members?.length || 1} members • {r.status}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
