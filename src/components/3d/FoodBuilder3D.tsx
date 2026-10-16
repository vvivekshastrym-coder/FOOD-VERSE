"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Plus, Check, ShieldAlert, Sparkles, ShoppingBag } from "lucide-react";

interface LayerOption {
  id: string;
  name: string;
  category: "base" | "protein" | "cheese" | "toppings" | "sauce";
  price: number;
  calories: number;
  proteinG: number;
  allergen?: string;
  meshColor: number;
  meshType: "cylinder" | "box" | "sphere";
}

const AVAILABLE_LAYERS: LayerOption[] = [
  { id: "brioche_bun", name: "Toasted Brioche Bun", category: "base", price: 60, calories: 180, proteinG: 4, allergen: "Gluten", meshColor: 0xd97706, meshType: "cylinder" },
  { id: "wagyu_patty", name: "Char-grilled Smashed Patty", category: "protein", price: 180, calories: 310, proteinG: 26, meshColor: 0x451a03, meshType: "cylinder" },
  { id: "plant_patty", name: "Crispy Black Bean & Quinoa Patty", category: "protein", price: 140, calories: 210, proteinG: 18, allergen: "Soy", meshColor: 0x78350f, meshType: "cylinder" },
  { id: "cheddar_melt", name: "Aged English Cheddar", category: "cheese", price: 50, calories: 120, proteinG: 7, allergen: "Dairy", meshColor: 0xf59e0b, meshType: "box" },
  { id: "truffle_mushrooms", name: "Pan-seared Truffle Mushrooms", category: "toppings", price: 65, calories: 45, proteinG: 3, meshColor: 0x57534e, meshType: "cylinder" },
  { id: "haas_avocado", name: "Sliced Hass Avocado", category: "toppings", price: 70, calories: 85, proteinG: 2, meshColor: 0x84cc16, meshType: "sphere" },
  { id: "caramelized_onion", name: "Slow Caramelized Onions", category: "toppings", price: 30, calories: 40, proteinG: 1, meshColor: 0x9a3412, meshType: "box" },
  { id: "smoky_aioli", name: "Smoked Paprika Garlic Aioli", category: "sauce", price: 35, calories: 90, proteinG: 1, allergen: "Egg", meshColor: 0xf97316, meshType: "cylinder" }
];

export default function FoodBuilder3D({ onAddToCart }: { onAddToCart?: (customDish: any) => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([
    "brioche_bun",
    "wagyu_patty",
    "cheddar_melt",
    "caramelized_onion"
  ]);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const stackGroupRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Compute live nutrition & price
  const activeLayers = AVAILABLE_LAYERS.filter(l => selectedLayerIds.includes(l.id));
  const totalPrice = activeLayers.reduce((s, l) => s + l.price, 0);
  const totalCalories = activeLayers.reduce((s, l) => s + l.calories, 0);
  const totalProtein = activeLayers.reduce((s, l) => s + l.proteinG, 0);
  const allergens = Array.from(new Set(activeLayers.map(l => l.allergen).filter(Boolean)));

  const toggleLayer = (layerId: string) => {
    setSelectedLayerIds(prev =>
      prev.includes(layerId) ? prev.filter(id => id !== layerId) : [...prev, layerId]
    );
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 450;
    const height = container.clientHeight || 380;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 6.0);
    camera.lookAt(0, 0.8, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff3e0, 2.0);
    dirLight.position.set(5, 8, 6);
    scene.add(dirLight);

    // Plate Base
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 1.8, 0.15, 36),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 })
    );
    plate.position.y = -0.1;
    scene.add(plate);

    // Dynamic 3D Stack Group
    const stackGroup = new THREE.Group();
    stackGroupRef.current = stackGroup;

    let currentY = 0.1;
    activeLayers.forEach(layer => {
      let geo: THREE.BufferGeometry;
      if (layer.meshType === "cylinder") {
        geo = new THREE.CylinderGeometry(1.4, 1.4, 0.35, 32);
      } else if (layer.meshType === "box") {
        geo = new THREE.BoxGeometry(2.0, 0.12, 2.0);
      } else {
        geo = new THREE.SphereGeometry(0.35, 16, 16);
      }

      const mat = new THREE.MeshStandardMaterial({ color: layer.meshColor, roughness: 0.6 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = currentY + 0.17;
      stackGroup.add(mesh);
      currentY += 0.35;
    });

    // Top Bun automatically capping the burger if base bun is selected
    if (selectedLayerIds.includes("brioche_bun")) {
      const topBunGeo = new THREE.SphereGeometry(1.4, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const topBunMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
      const topBun = new THREE.Mesh(topBunGeo, topBunMat);
      topBun.position.y = currentY + 0.1;
      stackGroup.add(topBun);
    }

    scene.add(stackGroup);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (stackGroupRef.current) {
        stackGroupRef.current.rotation.y += 0.009;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, [selectedLayerIds]);

  return (
    <div className="w-full rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>3D Custom Food Builder</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Feature 4</span>
          </h3>
          <p className="text-xs text-slate-400">Assemble bespoke culinary layers with real-time 3D geometry & macro calculations.</p>
        </div>
        <div className="text-right">
          <span className="text-xl font-extrabold text-amber-400">₹{totalPrice}</span>
          <p className="text-[11px] text-slate-400">{totalCalories} kcal • {totalProtein}g protein</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        {/* 3D Viewport */}
        <div className="lg:col-span-7 h-[360px] rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden">
          <div ref={mountRef} className="w-full h-full cursor-grab" />
          <div className="absolute bottom-3 left-3 text-xs bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-400">
            {activeLayers.length} Layers Assembled
          </div>
        </div>

        {/* Layer Selector & Allergen Guardian */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Select Ingredients:</span>
            {AVAILABLE_LAYERS.map(layer => {
              const isSelected = selectedLayerIds.includes(layer.id);
              return (
                <button
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                    isSelected
                      ? "bg-amber-500/15 border-amber-500/60 text-white"
                      : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${isSelected ? "bg-amber-500 text-slate-950 font-bold" : "border border-slate-600"}`}>
                      {isSelected ? "✓" : "+"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{layer.name}</p>
                      <p className="text-[10px] text-slate-400">{layer.calories} kcal • {layer.proteinG}g protein {layer.allergen && `(${layer.allergen})`}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400">+₹{layer.price}</span>
                </button>
              );
            })}
          </div>

          {/* Allergen Guardian Warning */}
          {allergens.length > 0 && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>Allergen Notice: Contains {allergens.join(", ")}. Prepared in a kitchen handling common allergens.</span>
            </div>
          )}

          <button
            onClick={() => onAddToCart && onAddToCart({
              name: "Custom 3D Masterpiece Burger",
              price: totalPrice,
              layers: activeLayers.map(l => l.name),
              calories: totalCalories,
              proteinG: totalProtein
            })}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-amber-500/20"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add Custom Build to Bag (₹{totalPrice})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
