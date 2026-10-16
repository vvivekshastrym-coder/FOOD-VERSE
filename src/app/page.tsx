"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Compass,
  Layers,
  Users,
  Dna,
  ShieldCheck,
  Star,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShoppingBag,
  Zap
} from "lucide-react";
import Dish3DViewer from "@/components/3d/Dish3DViewer";

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [antiWasteDeals, setAntiWasteDeals] = useState<any[]>([]);
  const [creatorMenus, setCreatorMenus] = useState<any[]>([]);
  const [featuredDish, setFeaturedDish] = useState<any>(null);
  const [selectedCuisine, setSelectedCuisine] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [resRes, dealRes, creatorRes] = await Promise.all([
          fetch("/api/restaurants?sort=honest_ranking"),
          fetch("/api/anti-waste"),
          fetch("/api/creator-menus")
        ]);

        const resData = await resRes.json();
        const dealData = await dealRes.json();
        const creatorData = await creatorRes.json();

        if (resData.restaurants) {
          setRestaurants(resData.restaurants);
          // Set first verified dish with 3D asset as featured
          const firstDish = resData.restaurants[0]?.menuItems?.[0];
          if (firstDish) setFeaturedDish(firstDish);
        }
        if (dealData.deals) setAntiWasteDeals(dealData.deals);
        if (creatorData.creatorMenus) setCreatorMenus(creatorData.creatorMenus);
      } catch (err) {
        console.error("Failed to load marketplace data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleQuickAddToCart = async (menuItemId: string) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuItemId, quantity: 1 })
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/cart";
      }
    } catch {
      // Fallback
    }
  };

  const CUISINES = ["ALL", "Biryani", "North Indian", "Japanese", "Healthy", "Pizza"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-amber-500 selection:text-slate-950">
      {/* Hero Section with Signature Promise */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,119,6,0.15),rgba(255,255,255,0))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>India&apos;s First 3D Food Ordering Marketplace</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                See your food <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">
                  before you order it.
                </span>
              </h1>

              <p className="text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
                Know what you are ordering. Understand what you are paying. Follow your food from kitchen to door with true-size verified serving dimensions and honest ranking.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/food-street"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm flex items-center space-x-2 transition shadow-xl shadow-amber-500/20"
                >
                  <Compass className="w-4 h-4" />
                  <span>Enter 3D Food Street</span>
                </Link>

                <Link
                  href="/food-builder"
                  className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-sm flex items-center space-x-2 transition"
                >
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>3D Food Builder</span>
                </Link>

                <Link
                  href="/food-room"
                  className="px-5 py-3.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/60 text-indigo-300 font-semibold text-sm flex items-center space-x-2 transition"
                >
                  <Users className="w-4 h-4" />
                  <span>Food Room (Group)</span>
                </Link>
              </div>

              {/* 5 Signature Pillars Badges */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="font-bold text-amber-400">1. True-Size</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Verified portions</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="font-bold text-emerald-400">2. Honest Rank</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Zero paid inflation</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="font-bold text-indigo-400">3. Food Room</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Live shared cart</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="font-bold text-rose-400">4. Flavor DNA</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Taste-twin affinity</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 col-span-2 sm:col-span-1">
                  <p className="font-bold text-sky-400">5. Kitchen-Door</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Verified live stages</p>
                </div>
              </div>
            </div>

            {/* Interactive 3D Dish Hero Spotlight */}
            <div className="lg:col-span-5">
              {featuredDish ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="font-bold text-slate-300">Featured 3D Dish Inspection:</span>
                    <span className="text-amber-400 font-semibold">{featuredDish.name}</span>
                  </div>
                  <Dish3DViewer dish={featuredDish} />
                </div>
              ) : (
                <div className="h-[400px] rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  Loading 3D Visual Assets...
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature 11: Anti-Waste Deals Banner */}
      {antiWasteDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold uppercase text-emerald-400">Anti-Waste Flash Deals</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">Surplus Rescues</span>
                </div>
                <h4 className="text-base font-bold text-white mt-0.5">
                  Save pristine chef dishes before shift close at 35%-40% discount!
                </h4>
                <p className="text-xs text-slate-400">Atomic inventory locking prevents overselling. Freshness guaranteed.</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              {antiWasteDeals.slice(0, 2).map((deal) => (
                <div key={deal.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center space-x-3">
                  <div>
                    <p className="font-bold text-white">{deal.dishName}</p>
                    <p className="text-[10px] text-slate-400">{deal.restaurantName} • {deal.availableQuantity} left</p>
                  </div>
                  <div className="text-right">
                    <span className="line-through text-slate-500 text-[10px]">₹{deal.originalPrice}</span>
                    <span className="block text-emerald-400 font-extrabold text-sm">₹{deal.dealPrice}</span>
                  </div>
                  <button
                    onClick={() => handleQuickAddToCart(deal.menuItemId)}
                    className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold"
                    title="Claim deal"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Restaurant Discovery Section with Honest Ranking */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Signature Pillar 2: Honest Ranking</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Top Verified Bengaluru Restaurants
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Ranked with disclosed factors: 40% Diner Rating, 30% Official FSSAI Hygiene Audit, 20% Preparation Speed, and 10% True-Size 3D verification. No hidden ad boosts.
            </p>
          </div>

          {/* Cuisine Filters */}
          <div className="flex flex-wrap gap-1.5">
            {CUISINES.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCuisine(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedCuisine === c
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Restaurant Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {restaurants
            .filter((r) => selectedCuisine === "ALL" || r.cuisineType.toLowerCase().includes(selectedCuisine.toLowerCase()))
            .map((rest) => (
              <div
                key={rest.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  {/* Hero image header */}
                  <div className="relative h-48 w-full bg-slate-950">
                    <img
                      src={rest.heroImage || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"}
                      alt={rest.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                    {/* Sponsored badge if applicable */}
                    {rest.isSponsored ? (
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-amber-500/90 text-slate-950 text-[10px] font-bold">
                        {rest.sponsoredLabel || "Sponsored Partner (Disclosed)"}
                      </span>
                    ) : (
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-emerald-500/90 text-slate-950 text-[10px] font-bold">
                        Honest Rank #{rest.honestScore}%
                      </span>
                    )}

                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white drop-shadow-md">{rest.name}</h3>
                        <p className="text-xs text-slate-200 drop-shadow">{rest.cuisineType}</p>
                      </div>
                      <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-700 text-xs font-bold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rest.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Disclosed ranking explanation tags */}
                  <div className="p-4 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {rest.rankingExplanation?.map((exp: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[11px] text-slate-300 font-medium">
                          ✓ {exp}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">{rest.description}</p>

                    {/* Menu items preview */}
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-2">Available 3D Dishes:</span>
                      <div className="grid grid-cols-2 gap-2">
                        {rest.menuItems?.slice(0, 2).map((item: any) => (
                          <div
                            key={item.id}
                            className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between"
                          >
                            <div>
                              <p className="font-semibold text-white truncate max-w-[130px]">{item.name}</p>
                              <p className="text-[11px] text-amber-400">₹{item.price}</p>
                            </div>
                            <Link
                              href={`/dish/${item.id}`}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                              title="Inspect in 3D"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="p-4 bg-slate-950/50 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">FSSAI: {rest.fssaiNumber}</span>
                  <Link
                    href={`/restaurant/${rest.slug}`}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                  >
                    <span>View Menu & 3D Dishes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Creator Curations Section (Feature 14) */}
      {creatorMenus.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-800/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-purple-400 uppercase">Feature 14: Creator Menus</span>
                <h3 className="text-xl font-bold text-white mt-0.5">{creatorMenus[0].title}</h3>
                <p className="text-xs text-slate-300">Curated by {creatorMenus[0].creatorName} ({creatorMenus[0].badge})</p>
              </div>
              <span className="text-xs text-purple-300 bg-purple-900/40 px-3 py-1 rounded-full border border-purple-700/50">
                ❤️ {creatorMenus[0].likesCount} Foodies Saved
              </span>
            </div>

            <p className="text-xs text-slate-400 max-w-2xl">{creatorMenus[0].description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {creatorMenus[0].items?.map((itemRel: any) => (
                <div key={itemRel.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">{itemRel.menuItem.name}</h5>
                    <p className="text-[11px] text-amber-400 font-semibold">₹{itemRel.menuItem.price}</p>
                  </div>
                  <Link
                    href={`/dish/${itemRel.menuItem.id}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                  >
                    View in 3D
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
