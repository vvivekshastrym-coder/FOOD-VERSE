"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Box,
  Users,
  Dna,
  Bot,
  ShoppingBag,
  MapPin,
  ShieldCheck,
  ChevronDown,
  Layers,
  Bike,
  Store,
  UserCheck
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(1);
  const [currentLocation, setCurrentLocation] = useState("Indiranagar, Bengaluru");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Fetch current user and cart items
  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) setCurrentUser(data.user);

      const cartRes = await fetch("/api/cart");
      const cartData = await cartRes.json();
      if (cartData.items) setCartCount(cartData.items.reduce((s: number, i: any) => s + i.quantity, 0));
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchSession();
  }, [pathname]);

  const switchDemoRole = async (role: string) => {
    try {
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoRole: role })
      });
      setIsRoleDropdownOpen(false);
      window.location.reload();
    } catch {
      // Fallback
    }
  };

  const LOCATIONS = [
    "Indiranagar, Bengaluru",
    "Koramangala, Bengaluru",
    "Lavelle Road, Bengaluru",
    "HSR Layout, Bengaluru"
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Slogan */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Box className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition duration-300" />
                </div>
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white flex items-center space-x-1">
                  <span>Food</span>
                  <span className="text-amber-400">Verse</span>
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:block -mt-1 font-medium">
                  See your food before you order it
                </span>
              </div>
            </Link>

            {/* Location Selector */}
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-slate-700 transition">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-300 focus:outline-none cursor-pointer pr-1"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} className="bg-slate-900 text-white">
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 text-xs font-semibold">
            <Link
              href="/food-street"
              className={`px-3 py-2 rounded-lg transition flex items-center space-x-1.5 ${
                pathname === "/food-street" ? "bg-amber-500/10 text-amber-400 font-bold" : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>3D Street</span>
            </Link>

            <Link
              href="/food-builder"
              className={`px-3 py-2 rounded-lg transition flex items-center space-x-1.5 ${
                pathname === "/food-builder" ? "bg-emerald-500/10 text-emerald-400 font-bold" : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>3D Builder</span>
            </Link>

            <Link
              href="/food-room"
              className={`px-3 py-2 rounded-lg transition flex items-center space-x-1.5 ${
                pathname.startsWith("/food-room") ? "bg-indigo-500/10 text-indigo-400 font-bold" : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Food Room</span>
            </Link>

            <Link
              href="/flavor-dna"
              className={`px-3 py-2 rounded-lg transition flex items-center space-x-1.5 ${
                pathname === "/flavor-dna" ? "bg-rose-500/10 text-rose-400 font-bold" : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Dna className="w-4 h-4 text-rose-400" />
              <span>Flavor DNA</span>
            </Link>

            <Link
              href="/ai-companion"
              className={`px-3 py-2 rounded-lg transition flex items-center space-x-1.5 ${
                pathname === "/ai-companion" ? "bg-purple-500/10 text-purple-400 font-bold" : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Bot className="w-4 h-4 text-purple-400" />
              <span>AI Companion</span>
            </Link>

            <Link
              href="/orders"
              className={`px-3 py-2 rounded-lg transition flex items-center space-x-1.5 ${
                pathname === "/orders" ? "bg-sky-500/10 text-sky-400 font-bold" : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <span>Track Orders</span>
            </Link>
          </nav>

          {/* Right Action Buttons & Role Switcher */}
          <div className="flex items-center space-x-3">
            {/* Multi-Role Switcher Pill for paired testing */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 transition"
                title="Switch active user role"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline font-semibold">
                  {currentUser ? currentUser.role : "CUSTOMER"}
                </span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in">
                  <div className="px-2 py-1.5 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Fast Role Switcher
                  </div>
                  <button
                    onClick={() => switchDemoRole("CUSTOMER")}
                    className="w-full px-3 py-2 rounded-lg text-left text-xs hover:bg-slate-800 flex items-center space-x-2 text-slate-200"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div>
                      <p className="font-semibold">Customer (Arjun)</p>
                      <p className="text-[10px] text-slate-400">3D food, cart, Food Room</p>
                    </div>
                  </button>

                  <button
                    onClick={() => switchDemoRole("RESTAURANT_OWNER")}
                    className="w-full px-3 py-2 rounded-lg text-left text-xs hover:bg-slate-800 flex items-center space-x-2 text-slate-200"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <div>
                      <p className="font-semibold">Restaurant Partner</p>
                      <p className="text-[10px] text-slate-400">Live kitchen queue & 3D audit</p>
                    </div>
                  </button>

                  <button
                    onClick={() => switchDemoRole("RIDER")}
                    className="w-full px-3 py-2 rounded-lg text-left text-xs hover:bg-slate-800 flex items-center space-x-2 text-slate-200"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <div>
                      <p className="font-semibold">Delivery Partner PWA</p>
                      <p className="text-[10px] text-slate-400">Pickup & Customer OTP</p>
                    </div>
                  </button>

                  <button
                    onClick={() => switchDemoRole("ADMIN")}
                    className="w-full px-3 py-2 rounded-lg text-left text-xs hover:bg-slate-800 flex items-center space-x-2 text-slate-200"
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <div>
                      <p className="font-semibold">Admin Control Panel</p>
                      <p className="text-[10px] text-slate-400">Disputes, 22 Feature flags</p>
                    </div>
                  </button>

                  <div className="pt-2 border-t border-slate-800 mt-1 flex flex-col space-y-1">
                    <Link
                      href="/restaurant-dashboard"
                      onClick={() => setIsRoleDropdownOpen(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-amber-400 hover:bg-slate-800 flex items-center space-x-1.5"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Open Restaurant Dashboard</span>
                    </Link>
                    <Link
                      href="/rider"
                      onClick={() => setIsRoleDropdownOpen(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-blue-400 hover:bg-slate-800 flex items-center space-x-1.5"
                    >
                      <Bike className="w-3.5 h-3.5" />
                      <span>Open Rider PWA</span>
                    </Link>
                    <Link
                      href="/admin"
                      onClick={() => setIsRoleDropdownOpen(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-purple-400 hover:bg-slate-800 flex items-center space-x-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Open Admin Control</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Button with Live Item Badge */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center space-x-1 shadow-lg shadow-amber-500/20"
              title="View Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="ml-1 text-xs font-black px-1.5 py-0.2 bg-slate-950 text-amber-400 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
