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
  UserCheck,
  Tag,
  Search,
  User as UserIcon,
  Menu,
  X
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(1);
  const [currentLocation, setCurrentLocation] = useState("Indiranagar, Bengaluru");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch current user and cart items
  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) setCurrentUser(data.user);

      const cartRes = await fetch("/api/cart");
      const cartData = await cartRes.json();
      if (cartData.items) {
        setCartCount(cartData.items.reduce((s: number, i: any) => s + i.quantity, 0));
      }
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
    <header className="sticky top-0 z-50 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-5">
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
                  Good food. Better choices.
                </span>
              </div>
            </Link>

            {/* Location Selector */}
            <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-slate-700 transition">
              <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
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

          {/* Primary Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 text-xs font-semibold">
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg transition ${
                pathname === "/" ? "bg-amber-500/10 text-amber-400 font-bold" : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              Home
            </Link>

            <Link
              href="/explore"
              className={`px-3 py-2 rounded-lg transition flex items-center space-x-1.5 ${
                pathname === "/explore" ? "bg-amber-500/10 text-amber-400 font-bold" : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>Explore</span>
            </Link>

            <Link
              href="/offers"
              className={`px-3 py-2 rounded-lg transition flex items-center space-x-1.5 ${
                pathname === "/offers" ? "bg-emerald-500/10 text-emerald-400 font-bold" : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <span>Offers</span>
            </Link>

            <Link
              href="/food-room"
              className={`px-3 py-2 rounded-lg transition flex items-center space-x-1.5 ${
                pathname.startsWith("/food-room") ? "bg-indigo-500/10 text-indigo-400 font-bold" : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Food Room</span>
            </Link>

            <Link
              href="/orders"
              className={`px-3 py-2 rounded-lg transition ${
                pathname === "/orders" ? "bg-sky-500/10 text-sky-400 font-bold" : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              My Orders
            </Link>

            {/* 3D Features Dropdown / Links */}
            <Link
              href="/food-street"
              className={`px-2.5 py-2 rounded-lg transition flex items-center space-x-1 ${
                pathname === "/food-street" ? "bg-amber-500/10 text-amber-400 font-bold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
              title="Interactive 3D Food Street"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Street</span>
            </Link>

            <Link
              href="/food-builder"
              className={`px-2.5 py-2 rounded-lg transition flex items-center space-x-1 ${
                pathname === "/food-builder" ? "bg-emerald-500/10 text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
              title="Custom 3D Food Builder"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Builder</span>
            </Link>

            <Link
              href="/flavor-dna"
              className={`px-2.5 py-2 rounded-lg transition flex items-center space-x-1 ${
                pathname === "/flavor-dna" ? "bg-rose-500/10 text-rose-400 font-bold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
              title="6-Axis Taste Profile"
            >
              <Dna className="w-3.5 h-3.5 text-rose-400" />
              <span>Flavor DNA</span>
            </Link>

            <Link
              href="/ai-companion"
              className={`px-2.5 py-2 rounded-lg transition flex items-center space-x-1 ${
                pathname === "/ai-companion" ? "bg-purple-500/10 text-purple-400 font-bold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
              title="AI Food Companion"
            >
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>AI</span>
            </Link>
          </nav>

          {/* Right Action Buttons & Role Switcher */}
          <div className="flex items-center space-x-2.5">
            {/* Profile / Login Link */}
            <Link
              href={currentUser ? "/profile" : "/login"}
              className={`p-2 rounded-xl border transition flex items-center space-x-1.5 text-xs font-semibold ${
                pathname === "/profile" || pathname === "/login"
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
              }`}
              title={currentUser ? "User Profile" : "Sign In"}
            >
              <UserIcon className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">
                {currentUser?.name ? currentUser.name.split(" ")[0] : "Sign In"}
              </span>
            </Link>

            {/* Multi-Role Switcher Pill for paired testing */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 transition"
                title="Switch active user role"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline font-semibold">
                  {currentUser ? currentUser.role : "CUSTOMER"}
                </span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in">
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

            {/* Cart Button with Live Count Badge */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center space-x-1 shadow-lg shadow-amber-500/20"
              title="View Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="ml-1 text-xs font-black px-1.5 py-0.2 bg-slate-950 text-amber-400 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 lg:hidden"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-2">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-900"
          >
            Home
          </Link>
          <Link
            href="/explore"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-900"
          >
            Explore Restaurants
          </Link>
          <Link
            href="/offers"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-900"
          >
            Offers & Deals
          </Link>
          <Link
            href="/food-room"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-900"
          >
            Food Room (Group)
          </Link>
          <Link
            href="/orders"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-900"
          >
            My Orders
          </Link>
          <Link
            href="/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-900"
          >
            My Profile & Addresses
          </Link>
          <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <Link
              href="/food-street"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-slate-900 text-center font-bold text-amber-400"
            >
              3D Street
            </Link>
            <Link
              href="/food-builder"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-slate-900 text-center font-bold text-emerald-400"
            >
              3D Builder
            </Link>
            <Link
              href="/flavor-dna"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-slate-900 text-center font-bold text-rose-400"
            >
              Flavor DNA
            </Link>
            <Link
              href="/ai-companion"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-slate-900 text-center font-bold text-purple-400"
            >
              AI Companion
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
