"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Mail,
  Lock,
  ArrowRight,
  UserCheck,
  ShieldCheck,
  Bike,
  Store,
  AlertCircle
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      if (data.user?.role === "RESTAURANT_OWNER") {
        router.push("/restaurant-dashboard");
      } else if (data.user?.role === "RIDER") {
        router.push("/rider");
      } else if (data.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/profile");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoRole: role })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Demo login failed");
        setLoading(false);
        return;
      }

      if (role === "RESTAURANT_OWNER") {
        router.push("/restaurant-dashboard");
      } else if (role === "RIDER") {
        router.push("/rider");
      } else if (role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/profile");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-amber-500 selection:text-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center space-x-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Box className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <span className="text-2xl font-black tracking-tight text-white flex items-center space-x-1">
            <span>Food</span>
            <span className="text-amber-400">Verse</span>
          </span>
        </Link>

        <h2 className="text-2xl font-black text-white">Sign in to your account</h2>
        <p className="text-xs text-slate-400">
          Access your orders, saved addresses, flavor profile, and group rooms
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Regular Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="arjun@foodverse.io"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? "Authenticating..." : "Sign In"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-3 text-slate-500 font-mono font-semibold">
                Or 1-Click Fast Demo Login
              </span>
            </div>
          </div>

          {/* 1-Click Role Switchers */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleDemoLogin("CUSTOMER")}
              disabled={loading}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition group"
            >
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white group-hover:text-emerald-400">Customer</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Arjun (Foodie)</p>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin("RESTAURANT_OWNER")}
              disabled={loading}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition group"
            >
              <div className="flex items-center space-x-2">
                <Store className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white group-hover:text-amber-400">Restaurant</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Spice Craft Owner</p>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin("RIDER")}
              disabled={loading}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition group"
            >
              <div className="flex items-center space-x-2">
                <Bike className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white group-hover:text-blue-400">Rider</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Delivery Partner PWA</p>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin("ADMIN")}
              disabled={loading}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition group"
            >
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white group-hover:text-purple-400">Admin</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Platform Control</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
