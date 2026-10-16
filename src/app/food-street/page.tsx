"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, Store, ArrowRight, ShieldCheck } from "lucide-react";
import WalkableFoodStreet3D from "@/components/3d/WalkableFoodStreet3D";

export default function FoodStreetPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/restaurants");
        const data = await res.json();
        if (data.restaurants) setRestaurants(data.restaurants);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">Feature 3</span>
          <h1 className="text-3xl font-black text-white mt-1">Walkable 3D Food Street</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Stroll through a virtual 3D rendering of Bengaluru&apos;s finest dining storefronts. Approach each facade to inspect its verified hygiene score, average prep speed, and digital menus.
          </p>
        </div>

        {loading ? (
          <div className="h-[400px] rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
            Rendering 3D Street Architecture...
          </div>
        ) : (
          <WalkableFoodStreet3D restaurants={restaurants} />
        )}

        {/* Accessible Alternative List View (WCAG 2.2 AA Compliance) */}
        <div className="pt-6 space-y-4">
          <h3 className="text-sm font-semibold uppercase text-slate-400 tracking-wider">
            Accessible Storefront Directory:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {restaurants.map((rest) => (
              <div key={rest.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{rest.name}</h4>
                  <p className="text-xs text-slate-400">{rest.cuisineType}</p>
                  <p className="text-[11px] text-amber-400 mt-1">★ {rest.rating} • {rest.avgPreparationTime}m prep</p>
                </div>
                <Link
                  href={`/restaurant/${rest.slug}`}
                  className="mt-3 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs text-center flex items-center justify-center space-x-1"
                >
                  <span>Open Menu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
