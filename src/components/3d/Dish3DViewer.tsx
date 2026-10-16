"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, Sparkles, ZoomIn, ZoomOut, Maximize2, Scale } from "lucide-react";

interface DishViewerProps {
  dish: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string | null;
    servingSize?: string;
    trueSizeVerified?: boolean;
    verificationStatus?: string;
    portionWeightG?: number | null;
    portionDimensions?: string | null;
    verifiedBy?: string | null;
    assets?: Array<{
      foodShapeType?: string;
      primaryColor?: string;
      secondaryColor?: string;
      scaleRatio?: number;
    }>;
    ingredientToggles?: Array<{
      id: string;
      name: string;
      extraPrice: number;
      isDefault: boolean;
      meshName?: string | null;
    }>;
    portionVariants?: Array<{
      id: string;
      name: string;
      scaleFactor: number;
      price: number;
      weightG?: number | null;
      dimensions?: string | null;
    }>;
  };
  onPortionChange?: (variant: any) => void;
  onIngredientsChange?: (ingredients: string[]) => void;
}

export default function Dish3DViewer({ dish, onPortionChange, onIngredientsChange }: DishViewerProps) {
  const [selectedVariant, setSelectedVariant] = useState<any>(dish.portionVariants?.[0] || null);
  const [activeToggles, setActiveToggles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    dish.ingredientToggles?.forEach(t => { initial[t.name] = t.isDefault; });
    return initial;
  });
  const [isZoomed, setIsZoomed] = useState(false);

  const handleVariantSelect = (variant: any) => {
    setSelectedVariant(variant);
    if (onPortionChange) onPortionChange(variant);
  };

  const toggleIngredient = (name: string) => {
    const updated = { ...activeToggles, [name]: !activeToggles[name] };
    setActiveToggles(updated);
    if (onIngredientsChange) {
      const activeList = Object.entries(updated).filter(([, val]) => val).map(([key]) => key);
      onIngredientsChange(activeList);
    }
  };

  // Default high-resolution food image fallback if dish.imageUrl is not provided
  const fallbackImage = "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1000&auto=format&fit=crop&q=80";
  const displayImage = dish.imageUrl || fallbackImage;

  return (
    <div className="relative w-full rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 overflow-hidden shadow-2xl p-4 sm:p-5">
      {/* Top Bar: True-Size Verification Status */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          {dish.trueSizeVerified ? (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>True-Size Verified ({selectedVariant?.weightG || dish.portionWeightG || 450}g)</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Standard Portion</span>
            </div>
          )}
          <span className="text-xs text-slate-400 hidden sm:inline">
            Physical Scale: {selectedVariant?.dimensions || dish.portionDimensions || "18cm x 7.5cm"}
          </span>
        </div>

        <button
          onClick={() => setIsZoomed(!isZoomed)}
          className="flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          title={isZoomed ? "Reset View" : "Zoom Photo"}
        >
          {isZoomed ? <ZoomOut className="w-3.5 h-3.5 text-amber-400" /> : <ZoomIn className="w-3.5 h-3.5 text-amber-400" />}
          <span>{isZoomed ? "Standard View" : "Inspect Closer"}</span>
        </button>
      </div>

      {/* Main Authentic Food Image Viewport */}
      <div className="relative h-[340px] sm:h-[400px] w-full rounded-2xl overflow-hidden mt-3 bg-slate-950 flex items-center justify-center group">
        <img
          src={displayImage}
          alt={dish.name}
          className={`w-full h-full object-cover rounded-2xl transition duration-500 ${
            isZoomed ? "scale-125 cursor-zoom-out" : "hover:scale-105 cursor-zoom-in"
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        />

        {/* Gradient Overlay for Aesthetics & Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

        {/* Bottom Left Serving Dimensions Badge */}
        <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-white text-xs flex items-center space-x-2">
          <Scale className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold">
            {selectedVariant?.name || "Regular Portion"}: {selectedVariant?.weightG || dish.portionWeightG || 450}g
          </span>
          <span className="text-slate-400 text-[11px]">
            ({selectedVariant?.dimensions || dish.portionDimensions || "18cm diameter"})
          </span>
        </div>

        {/* Bottom Right Verified Indicator */}
        <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Authentic Kitchen Serving</span>
        </div>
      </div>

      {/* Portion Size Selection */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 space-y-3">
        {dish.portionVariants && dish.portionVariants.length > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-200">Select Serving Size &amp; Portion:</span>
              <span className="text-amber-400 font-extrabold text-sm">₹{selectedVariant?.price || dish.price}</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {dish.portionVariants.map((variant) => (
                <button
                  key={variant.name}
                  onClick={() => handleVariantSelect(variant)}
                  className={`px-3.5 py-2.5 rounded-2xl text-left text-xs transition border ${
                    selectedVariant?.name === variant.name
                      ? "bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <p className="font-bold text-white text-xs">{variant.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {variant.dimensions || "Physical Handi"} • {variant.weightG}g
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ingredient Customization Addons */}
        {dish.ingredientToggles && dish.ingredientToggles.length > 0 && (
          <div>
            <span className="block text-xs font-bold text-slate-200 mb-2">Custom Ingredient Choices:</span>
            <div className="flex flex-wrap gap-2">
              {dish.ingredientToggles.map((toggle) => (
                <button
                  key={toggle.name}
                  onClick={() => toggleIngredient(toggle.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center space-x-1.5 ${
                    activeToggles[toggle.name]
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <span className="font-bold">{activeToggles[toggle.name] ? "✓" : "+"}</span>
                  <span>{toggle.name}</span>
                  {toggle.extraPrice > 0 && <span className="text-[11px] opacity-75">(+₹{toggle.extraPrice})</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* True-Size Audit Guarantee Footer */}
      <div className="mt-4 pt-2.5 text-xs text-slate-500 flex items-center justify-between border-t border-slate-900">
        <span>Audited by: {dish.verifiedBy || "FoodVerse Sensory Audit Team"}</span>
        <span className="text-emerald-500/90 font-medium">True-Size Guarantee: 100% Refund on Portioned Deficit</span>
      </div>
    </div>
  );
}
