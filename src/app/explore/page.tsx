"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Star,
  ShieldCheck,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
  X,
  Store,
  DollarSign
} from "lucide-react";

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get("q") || "";
  const initialCuisine = searchParams.get("cuisine") || "ALL";

  const [query, setQuery] = useState(initialQuery);
  const [selectedCuisine, setSelectedCuisine] = useState(initialCuisine);
  const [vegOnly, setVegOnly] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("honest_ranking");
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const CUISINES = ["ALL", "Biryani", "North Indian", "Japanese", "Healthy", "Pizza", "Mughlai"];

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append("q", query.trim());
      if (selectedCuisine && selectedCuisine !== "ALL") params.append("cuisine", selectedCuisine);
      if (vegOnly) params.append("veg", "true");
      if (minRating) params.append("minRating", minRating.toString());
      if (sortBy) params.append("sort", sortBy);

      const res = await fetch(`/api/restaurants?${params.toString()}`);
      const data = await res.json();
      if (data.restaurants) {
        setRestaurants(data.restaurants);
      }
    } catch (err) {
      console.error("Failed to fetch restaurants", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [selectedCuisine, vegOnly, minRating, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRestaurants();
  };

  const handleResetFilters = () => {
    setQuery("");
    setSelectedCuisine("ALL");
    setVegOnly(false);
    setMinRating(null);
    setSortBy("honest_ranking");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      {/* Top Banner & Header */}
      <section className="bg-slate-900/60 border-b border-slate-800/80 pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
                <Store className="w-3.5 h-3.5" />
                <span>Verified Restaurant Directory</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Explore Restaurants
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                Browse verified dining partners in Bengaluru with true-size portion verification and honest, un-bought ranking.
              </p>
            </div>

            {/* Location Pill */}
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Delivering to: <strong className="text-white">Indiranagar & nearby</strong></span>
            </div>
          </div>

          {/* Search Bar Input */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-3xl">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by restaurant name, dish (e.g. Biryani, Ramen, Kebab), or cuisine..."
                className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500 transition shadow-lg"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20"
              >
                Search
              </button>
            </div>
          </form>

          {/* Cuisine Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {CUISINES.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => setSelectedCuisine(cuisine)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedCuisine === cuisine
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-slate-800 hover:bg-slate-700/80 text-slate-300 border border-slate-700/50"
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Filter & Results Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Controls Bar: Toggles, Sort, Reset */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            {/* Veg Only Toggle */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                vegOnly
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${vegOnly ? "bg-emerald-400" : "bg-slate-500"}`} />
              <span>Veg Only</span>
            </button>

            {/* Rating 4.5+ Toggle */}
            <button
              onClick={() => setMinRating(minRating === 4.5 ? null : 4.5)}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                minRating === 4.5
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>4.5+ Rating</span>
            </button>

            {/* Active filters reset */}
            {(selectedCuisine !== "ALL" || vegOnly || minRating !== null || query) && (
              <button
                onClick={handleResetFilters}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <label className="text-xs text-slate-400">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="honest_ranking">Honest Ranking (Disclosed Factors)</option>
              <option value="rating">Highest Rated</option>
              <option value="prep_time">Fastest Preparation</option>
              <option value="hygiene">Top Hygiene Score</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results Counter & Honest Disclosure */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-6">
          <span>
            Showing <strong className="text-white">{restaurants.length}</strong> verified restaurant{restaurants.length !== 1 ? "s" : ""}
          </span>
          <span className="text-[11px] text-emerald-400 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Honest Ranking: 0 Paid Organic Boosts</span>
          </span>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800/60 animate-pulse" />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-3xl bg-slate-900/30 border border-slate-800/60">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500">
              <Store className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No matching restaurants found</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mt-1 mb-6">
              We couldn&apos;t find any verified partners matching your filters. Try clearing some filters or searching for different dishes.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {restaurants.map((rest) => (
              <div
                key={rest.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl hover:border-slate-700 transition flex flex-col justify-between group"
              >
                <div>
                  {/* Hero Image Header */}
                  <div className="relative h-52 w-full bg-slate-950 overflow-hidden">
                    <img
                      src={rest.heroImage || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"}
                      alt={rest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />

                    {/* Badge */}
                    {rest.isSponsored ? (
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-amber-500/95 text-slate-950 text-[10px] font-bold shadow-md">
                        {rest.sponsoredLabel || "Sponsored Partner"}
                      </span>
                    ) : (
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-emerald-500/95 text-slate-950 text-[10px] font-bold shadow-md">
                        Honest Rank #{rest.honestScore}%
                      </span>
                    )}

                    <div className="absolute top-3 right-3 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-xs font-bold text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{rest.rating}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({rest.reviewCount})</span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-xl font-black text-white drop-shadow-md">{rest.name}</h3>
                      <p className="text-xs text-amber-300 font-medium drop-shadow">{rest.cuisineType}</p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    {/* Disclosed ranking badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {rest.rankingExplanation?.map((exp: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 font-medium"
                        >
                          ✓ {exp}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {rest.description}
                    </p>

                    {/* Operational metrics */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Avg Prep Time</span>
                        <span className="font-bold text-white flex items-center justify-center space-x-1 mt-0.5">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{rest.avgPreparationTime} mins</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">FSSAI Hygiene</span>
                        <span className="font-bold text-emerald-400 flex items-center justify-center space-x-1 mt-0.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>{rest.hygieneRating} / 5.0</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Approx Cost</span>
                        <span className="font-bold text-white mt-0.5 block">
                          ₹{rest.avgDishPrice || 350} for one
                        </span>
                      </div>
                    </div>

                    {/* Dishes preview */}
                    {rest.menuItems && rest.menuItems.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Available 3D Dishes ({rest.menuItems.length})
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {rest.menuItems.slice(0, 2).map((item: any) => (
                            <div
                              key={item.id}
                              className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs flex items-center justify-between"
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center space-x-1">
                                  <span className={`w-2 h-2 rounded-full ${item.isVeg ? "bg-emerald-400" : "bg-rose-500"}`} />
                                  <p className="font-semibold text-white truncate text-[11px]">{item.name}</p>
                                </div>
                                <p className="text-[11px] text-amber-400 font-bold mt-0.5">₹{item.price}</p>
                              </div>
                              <Link
                                href={`/dish/${item.id}`}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex-shrink-0"
                                title="Inspect 3D True-Size"
                              >
                                <Eye className="w-3.5 h-3.5 text-amber-400" />
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Lic: {rest.fssaiNumber || "11221334000188"}
                  </span>
                  <Link
                    href={`/restaurant/${rest.slug}`}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20"
                  >
                    <span>View Menu & 3D Dishes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
          Loading Explore Directory...
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
