"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Star,
  Clock,
  ShieldCheck,
  MapPin,
  Eye,
  Plus,
  ShoppingBag,
  Thermometer,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import Dish3DViewer from "@/components/3d/Dish3DViewer";
import { Suspense } from "react";

function RestaurantContent() {
  const params = useParams();
  const slug = params?.slug as string;

  const [restaurant, setRestaurant] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeDishFor3D, setActiveDishFor3D] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const res = await fetch(`/api/restaurants/${slug}`);
        const data = await res.json();
        if (data.restaurant) {
          setRestaurant(data.restaurant);
          // Set first dish with 3D as default for modal
          const firstDish = data.restaurant.menus?.[0]?.categories?.[0]?.items?.[0];
          if (firstDish) setActiveDishFor3D(firstDish);
        }
      } catch (err) {
        console.error("Failed to fetch restaurant", err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchRestaurant();
  }, [slug]);

  const handleAddToCart = async (menuItemId: string) => {
    setAddingId(menuItemId);
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuItemId, quantity: 1 })
      });
      // Visual feedback
      setTimeout(() => {
        setAddingId(null);
        window.location.href = "/cart";
      }, 500);
    } catch {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading Restaurant & 3D Assets...
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-white">Restaurant Not Found</h2>
        <Link href="/" className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl font-bold text-xs">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const allCategories = restaurant.menus?.[0]?.categories || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Restaurant Header Banner */}
      <div className="relative h-64 sm:h-80 w-full bg-slate-900 border-b border-slate-800">
        <img
          src={restaurant.heroImage || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200"}
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="absolute bottom-6 left-4 right-4 sm:left-8 sm:right-8 max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/40 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Kitchen (FSSAI #{restaurant.fssaiNumber})</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900/80 text-slate-300 text-xs border border-slate-700">
                Hygiene: {restaurant.hygieneRating}/5.0
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-2">{restaurant.name}</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{restaurant.address}, {restaurant.city}</span>
              <span>•</span>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>~{restaurant.avgPreparationTime} mins prep</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {restaurant.ioTDevices?.[0] && (
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-300 flex items-center space-x-2">
                <Thermometer className="w-4 h-4 text-rose-400 animate-pulse" />
                <div>
                  <p className="text-[10px] text-slate-400">IoT Cold/Hot Chain</p>
                  <p className="font-bold text-white">{restaurant.ioTDevices[0].lastTemperature}°C Active</p>
                </div>
              </div>
            )}
            <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-right">
              <div className="flex items-center justify-end space-x-1 font-black text-lg">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{restaurant.rating}</span>
              </div>
              <p className="text-[10px] text-slate-400">{restaurant.reviewCount || 120}+ reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Category Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 border-b border-slate-800">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedCategory === "ALL"
                ? "bg-amber-500 text-slate-950"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            All Specialties
          </button>
          {allCategories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat.name
                  ? "bg-amber-500 text-slate-950"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="mt-8 space-y-10">
          {allCategories
            .filter((cat: any) => selectedCategory === "ALL" || selectedCategory === cat.name)
            .map((cat: any) => (
              <div key={cat.id} className="space-y-4">
                <h3 className="text-xl font-extrabold text-white flex items-center space-x-2">
                  <span>{cat.name}</span>
                  <span className="text-xs font-mono font-normal text-slate-500">({cat.items?.length || 0})</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cat.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
                    >
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            {item.isVeg ? (
                              <span className="w-3.5 h-3.5 rounded-sm border border-emerald-500 flex items-center justify-center">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              </span>
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-sm border border-rose-500 flex items-center justify-center">
                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                              </span>
                            )}
                            <h4 className="text-base font-bold text-white">{item.name}</h4>
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>

                          <div className="flex items-center space-x-2 text-xs">
                            <span className="font-extrabold text-amber-400 text-sm">₹{item.price}</span>
                            {item.portionWeightG && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-medium text-slate-300">
                                {item.portionWeightG}g Portion
                              </span>
                            )}
                            {item.trueSizeVerified && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                                3D Verified
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Image / 3D Trigger */}
                        <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800">
                          <img
                            src={item.imageUrl || "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => setActiveDishFor3D(item)}
                            className="absolute bottom-1 right-1 px-2 py-1 bg-slate-950/80 backdrop-blur-md rounded-lg text-[10px] font-bold text-amber-400 flex items-center space-x-1 border border-slate-700"
                            title="Inspect in 3D"
                          >
                            <Eye className="w-3 h-3" />
                            <span>3D</span>
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <Link
                          href={`/dish/${item.id}`}
                          className="text-xs text-indigo-400 hover:underline font-medium"
                        >
                          View 3D Portions &amp; Nutrition →
                        </Link>

                        <button
                          onClick={() => handleAddToCart(item.id)}
                          disabled={addingId === item.id}
                          className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow-md shadow-amber-500/10"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{addingId === item.id ? "Adding..." : "Add to Bag"}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Floating 3D Modal Quick Inspector */}
      {activeDishFor3D && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">{activeDishFor3D.name}</h3>
                <p className="text-xs text-slate-400">Interactive 3D True-Size Inspection</p>
              </div>
              <button
                onClick={() => setActiveDishFor3D(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <Dish3DViewer dish={activeDishFor3D} />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xl font-extrabold text-amber-400">₹{activeDishFor3D.price}</span>
              <button
                onClick={() => {
                  handleAddToCart(activeDishFor3D.id);
                  setActiveDishFor3D(null);
                }}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add Verified Portion to Bag</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RestaurantPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading Restaurant Menu...</div>}>
      <RestaurantContent />
    </Suspense>
  );
}

