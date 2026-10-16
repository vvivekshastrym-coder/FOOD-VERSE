"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  Flame,
  Scale,
  Maximize,
  Heart
} from "lucide-react";
import Dish3DViewer from "@/components/3d/Dish3DViewer";
import { Suspense } from "react";

function DishDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [dish, setDish] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    async function loadDish() {
      try {
        const res = await fetch(`/api/menu-items/${id}`);
        const data = await res.json();
        if (data.menuItem) {
          setDish(data.menuItem);
          if (data.menuItem.portionVariants?.length > 0) {
            setSelectedVariant(data.menuItem.portionVariants[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load dish", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadDish();
  }, [id]);

  const handleAddToCart = async () => {
    if (!dish) return;
    setAddingToCart(true);
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuItemId: dish.id,
          variantId: selectedVariant?.id,
          selectedAddons: selectedIngredients,
          quantity: 1
        })
      });
      router.push("/cart");
    } catch {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading Dish Details & Verified Portions...
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-white">Dish Not Found</h2>
        <Link href="/" className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl font-bold text-xs">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : (dish.discountedPrice || dish.price);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          href={`/restaurant/${dish.restaurant?.slug || ""}`}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {dish.restaurant?.name || "Restaurant"}</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 3D Dish Viewer */}
          <div className="lg:col-span-7">
            <Dish3DViewer
              dish={dish}
              onPortionChange={(variant) => setSelectedVariant(variant)}
              onIngredientsChange={(ingredients) => setSelectedIngredients(ingredients)}
            />
          </div>

          {/* Right Column: Dish Specs, True-Size Audit, Macros & Cart */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                  {dish.restaurant?.name}
                </span>
                <span className="text-2xl font-black text-amber-400">₹{currentPrice}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{dish.name}</h1>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{dish.description}</p>
            </div>

            {/* Signature Pillar 1: True-Size Audit Guarantee Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>True-Size Guarantee Verified</span>
                </div>
                <span className="text-[10px] text-emerald-300/80 font-mono">STATUS: {dish.verificationStatus}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                    <Scale className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Serving Weight</span>
                  </div>
                  <p className="font-extrabold text-white mt-0.5">{dish.portionWeightG || 450} grams net</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                    <Maximize className="w-3.5 h-3.5 text-amber-400" />
                    <span>Physical Dimensions</span>
                  </div>
                  <p className="font-extrabold text-white mt-0.5">{dish.portionDimensions || "18cm x 7.5cm"}</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 pt-1">
                Audited by <strong>{dish.verifiedBy || "FoodVerse Sensory Audit Team"}</strong>. Eligible for instant dispute refund if portion delivered varies by &gt;15%.
              </p>
            </div>

            {/* Macro Nutrition Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Nutrition &amp; Macros</span>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="block text-[10px] text-slate-400">Calories</span>
                  <span className="font-bold text-white text-xs">{dish.calories} kcal</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="block text-[10px] text-slate-400">Protein</span>
                  <span className="font-bold text-emerald-400 text-xs">{dish.proteinG}g</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="block text-[10px] text-slate-400">Carbs</span>
                  <span className="font-bold text-amber-400 text-xs">{dish.carbsG}g</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="block text-[10px] text-slate-400">Fat</span>
                  <span className="font-bold text-rose-400 text-xs">{dish.fatG}g</span>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-400 flex items-start space-x-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Allergens: {dish.allergenInfo || "None disclosed"}. Prepared in a commercial restaurant facility.</span>
              </div>
            </div>

            {/* Add to Bag Action */}
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 transition shadow-xl shadow-amber-500/20"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>{addingToCart ? "Adding..." : `Add to Bag (₹${currentPrice})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DishDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading Dish...</div>}>
      <DishDetailContent />
    </Suspense>
  );
}

