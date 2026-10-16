"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Layers, Sparkles } from "lucide-react";
import FoodBuilder3D from "@/components/3d/FoodBuilder3D";

export default function FoodBuilderPage() {
  const router = useRouter();

  const handleAddToCart = async (customDish: any) => {
    try {
      // Find a burger or bowl item from db to attach custom instructions
      const res = await fetch("/api/restaurants");
      const data = await res.json();
      const firstDishId = data.restaurants?.[0]?.menuItems?.[0]?.id;

      if (firstDishId) {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            menuItemId: firstDishId,
            quantity: 1,
            customInstructions: `Custom 3D Stack: ${customDish.layers?.join(", ")} (${customDish.calories} kcal)`
          })
        });
        router.push("/cart");
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">Feature 4</span>
          <h1 className="text-3xl font-black text-white mt-1">3D Custom Food Builder</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Engineer your own artisanal dish in 3D. Add or remove grilled smashed patties, brioche buns, aged cheeses, and toppings with live nutrition and allergen re-calculation.
          </p>
        </div>

        <FoodBuilder3D onAddToCart={handleAddToCart} />
      </div>
    </div>
  );
}
