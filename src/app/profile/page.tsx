"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  MapPin,
  Plus,
  Trash2,
  Dna,
  ShoppingBag,
  Sparkles,
  LogOut,
  CheckCircle2,
  Store,
  Bike,
  ShieldCheck,
  Award,
  ChevronRight,
  Home,
  Briefcase
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [flavorProfile, setFlavorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Add Address Form State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressTitle, setAddressTitle] = useState("Home");
  const [addressLine, setAddressLine] = useState("");
  const [landmark, setLandmark] = useState("");
  const [postalCode, setPostalCode] = useState("560038");
  const [isDefault, setIsDefault] = useState(false);
  const [submittingAddress, setSubmittingAddress] = useState(false);

  const loadUserData = async () => {
    try {
      const [userRes, addrRes, dnaRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/user/addresses"),
        fetch("/api/flavor-dna")
      ]);

      const userData = await userRes.json();
      const addrData = await addrRes.json();
      const dnaData = await dnaRes.json();

      if (userData.user) setCurrentUser(userData.user);
      if (addrData.addresses) setAddresses(addrData.addresses);
      if (dnaData.profile) setFlavorProfile(dnaData.profile);
    } catch (err) {
      console.error("Failed to load user profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine.trim()) return;

    setSubmittingAddress(true);
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: addressTitle,
          addressLine,
          landmark,
          city: "Bengaluru",
          postalCode,
          isDefault
        })
      });

      if (res.ok) {
        setIsAddingAddress(false);
        setAddressLine("");
        setLandmark("");
        loadUserData();
      }
    } catch (err) {
      console.error("Failed to add address", err);
    } finally {
      setSubmittingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await fetch(`/api/user/addresses?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete address", err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      window.location.reload();
    } catch {
      // Fallback
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading customer profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Banner */}
      <section className="bg-slate-900/60 border-b border-slate-800/80 pt-10 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 flex items-center justify-center shadow-xl shadow-amber-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl font-black text-amber-400">
                  {currentUser?.name ? currentUser.name[0] : "A"}
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    {currentUser?.name || "Customer Account"}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold">
                    {currentUser?.role || "CUSTOMER"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{currentUser?.email || "arjun@foodverse.io"}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-rose-400 text-xs font-semibold transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
        {/* Metric Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400">Loyalty Points</span>
              <p className="text-xl font-black text-white mt-0.5">
                {currentUser?.loyaltyPoints || 350} pts
              </p>
              <span className="text-[10px] text-emerald-400">Worth ₹35 on next order</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400">Subscription Status</span>
              <p className="text-xl font-black text-white mt-0.5">FoodVerse Gold</p>
              <span className="text-[10px] text-slate-400">Active • Free Deliveries</span>
            </div>
          </div>

          <Link
            href="/orders"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400">Order History</span>
                <p className="text-base font-bold text-white mt-0.5">View My Orders</p>
                <span className="text-[10px] text-slate-400">Live Kitchen Tracking</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition" />
          </Link>
        </div>

        {/* Section 2: Saved Delivery Addresses */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <span>Saved Delivery Addresses</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Manage your home, office, and guest delivery destinations
              </p>
            </div>

            <button
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingAddress ? "Cancel" : "Add Address"}</span>
            </button>
          </div>

          {/* Inline Add Address Form */}
          {isAddingAddress && (
            <form
              onSubmit={handleAddAddress}
              className="p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-4 animate-in fade-in"
            >
              <h3 className="text-sm font-bold text-amber-400">Add New Destination</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Tag / Title</label>
                  <select
                    value={addressTitle}
                    onChange={(e) => setAddressTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Friends">Friends</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Street Address Line</label>
                  <input
                    type="text"
                    required
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="e.g. Flat 402, Sunshine Apts, 12th Main, HAL 2nd Stage"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near Toit Brewpub"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="isDefaultCheck"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="isDefaultCheck" className="text-xs text-slate-300 cursor-pointer">
                    Set as default address
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submittingAddress}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                >
                  {submittingAddress ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          )}

          {/* Saved Addresses List */}
          {addresses.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No addresses saved yet. Click &quot;Add Address&quot; above to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white flex items-center space-x-1">
                        {addr.title === "Work" ? (
                          <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Home className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span>{addr.title}</span>
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {addr.addressLine}
                    </p>
                    {addr.landmark && (
                      <p className="text-[11px] text-slate-500">Landmark: {addr.landmark}</p>
                    )}
                    <p className="text-[11px] text-slate-400">{addr.city} — {addr.postalCode}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 3: Flavor DNA Taste Profile */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase">
                <Dna className="w-4 h-4" />
                <span>Signature Pillar 4: Flavor DNA</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Your 6-Axis Taste Persona
              </h2>
            </div>

            <Link
              href="/flavor-dna"
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline underline-offset-4"
            >
              Adjust Taste Profile →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase">Spicy</span>
              <p className="text-lg font-black text-rose-400 mt-1">{flavorProfile?.spicy || 75}%</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase">Sweet</span>
              <p className="text-lg font-black text-amber-400 mt-1">{flavorProfile?.sweet || 30}%</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase">Sour</span>
              <p className="text-lg font-black text-yellow-400 mt-1">{flavorProfile?.sour || 45}%</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase">Umami</span>
              <p className="text-lg font-black text-purple-400 mt-1">{flavorProfile?.umami || 85}%</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase">Crunch</span>
              <p className="text-lg font-black text-emerald-400 mt-1">{flavorProfile?.crunch || 60}%</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase">Richness</span>
              <p className="text-lg font-black text-indigo-400 mt-1">{flavorProfile?.richness || 65}%</p>
            </div>
          </div>
        </section>

        {/* Section 4: Role Dashboards Shortcut */}
        {(currentUser?.role === "RESTAURANT_OWNER" || currentUser?.role === "RIDER" || currentUser?.role === "ADMIN") && (
          <section className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Management Portals
            </h3>
            <div className="flex flex-wrap gap-3">
              {currentUser?.role === "RESTAURANT_OWNER" && (
                <Link
                  href="/restaurant-dashboard"
                  className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center space-x-2"
                >
                  <Store className="w-4 h-4" />
                  <span>Open Restaurant Kitchen Portal</span>
                </Link>
              )}
              {currentUser?.role === "RIDER" && (
                <Link
                  href="/rider"
                  className="px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center space-x-2"
                >
                  <Bike className="w-4 h-4" />
                  <span>Open Rider Delivery App</span>
                </Link>
              )}
              {currentUser?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="px-4 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 text-xs font-bold flex items-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Open Platform Control Panel</span>
                </Link>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
