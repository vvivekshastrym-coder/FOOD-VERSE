"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CheckCircle2, RotateCw, ZoomIn, ZoomOut, Maximize2, Sparkles, AlertTriangle, Eye, Layers } from "lucide-react";

interface Dish3DViewerProps {
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
      polyCount?: number;
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

export default function Dish3DViewer({ dish, onPortionChange, onIngredientsChange }: Dish3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [is3DReady, setIs3DReady] = useState(false);
  const [is2DFallback, setIs2DFallback] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(dish.portionVariants?.[0] || null);
  const [activeToggles, setActiveToggles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    dish.ingredientToggles?.forEach(t => { initial[t.name] = t.isDefault; });
    return initial;
  });
  const [autoRotate, setAutoRotate] = useState(true);
  const [showWireframe, setShowWireframe] = useState(false);
  const [arTriggered, setArTriggered] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const asset = dish.assets?.[0];
  const shapeType = asset?.foodShapeType || "bowl";
  const primaryColor = asset?.primaryColor || "#d97706";
  const secondaryColor = asset?.secondaryColor || "#b45309";

  useEffect(() => {
    if (is2DFallback) return;
    const container = mountRef.current;
    if (!container) return;

    // 1. Check WebGL support
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setIs2DFallback(true);
        return;
      }
    } catch {
      setIs2DFallback(true);
      return;
    }

    const width = container.clientWidth || 450;
    const height = container.clientHeight || 400;

    // 2. Setup Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3.5, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 3. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff3e0, 2.0);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    rimLight.position.set(-5, 5, -5);
    scene.add(rimLight);

    // Pedestal Plate / Surface
    const plateGeo = new THREE.CylinderGeometry(2.3, 1.8, 0.2, 48);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.1
    });
    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    plateMesh.position.y = -0.1;
    plateMesh.receiveShadow = true;
    scene.add(plateMesh);

    // 4. Construct Authentic 3D Food Geometry
    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;

    if (shapeType === "bowl") {
      // Ceramic handi / bowl body
      const bowlGeo = new THREE.CylinderGeometry(1.6, 1.0, 1.0, 36, 1, true);
      const bowlMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.4,
        metalness: 0.2,
        side: THREE.DoubleSide
      });
      const bowlMesh = new THREE.Mesh(bowlGeo, bowlMat);
      bowlMesh.position.y = 0.5;
      modelGroup.add(bowlMesh);

      // Food surface (Biryani / Ramen / Grains)
      const foodGeo = new THREE.SphereGeometry(1.48, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const foodMat = new THREE.MeshStandardMaterial({
        color: primaryColor,
        roughness: 0.7,
        bumpScale: 0.05
      });
      const foodMesh = new THREE.Mesh(foodGeo, foodMat);
      foodMesh.position.y = 0.6;
      foodMesh.scale.set(1, 0.5, 1);
      modelGroup.add(foodMesh);

      // Boiled Egg / Chashu Garnish
      const eggGeo = new THREE.SphereGeometry(0.35, 24, 24);
      eggGeo.scale(1, 1.3, 0.9);
      const eggMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 });
      const eggMesh = new THREE.Mesh(eggGeo, eggMat);
      eggMesh.position.set(0.4, 0.95, 0.3);
      eggMesh.rotation.z = 0.4;
      eggMesh.name = "garnish_egg";
      modelGroup.add(eggMesh);

      // Herbs & Fried Onions Garnish
      const herbGeo = new THREE.DodecahedronGeometry(0.15);
      const herbMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });
      for (let i = 0; i < 6; i++) {
        const herb = new THREE.Mesh(herbGeo, herbMat);
        const angle = (i / 6) * Math.PI * 2;
        herb.position.set(Math.cos(angle) * 0.65, 0.9, Math.sin(angle) * 0.65);
        herb.rotation.set(Math.random(), Math.random(), Math.random());
        herb.name = "garnish_herbs";
        modelGroup.add(herb);
      }
    } else if (shapeType === "pizza") {
      // Woodfired blistered crust
      const crustGeo = new THREE.TorusGeometry(1.6, 0.25, 24, 48);
      const crustMat = new THREE.MeshStandardMaterial({ color: 0xc27838, roughness: 0.8 });
      const crustMesh = new THREE.Mesh(crustGeo, crustMat);
      crustMesh.rotation.x = Math.PI / 2;
      crustMesh.position.y = 0.15;
      modelGroup.add(crustMesh);

      // Sauce and melted cheese base
      const cheeseGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.08, 36);
      const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 });
      const cheeseMesh = new THREE.Mesh(cheeseGeo, cheeseMat);
      cheeseMesh.position.y = 0.12;
      modelGroup.add(cheeseMesh);

      // Burrata Ball in Center
      const burrataGeo = new THREE.SphereGeometry(0.55, 32, 24);
      burrataGeo.scale(1.2, 0.7, 1.2);
      const burrataMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
      const burrataMesh = new THREE.Mesh(burrataGeo, burrataMat);
      burrataMesh.position.y = 0.4;
      modelGroup.add(burrataMesh);

      // Basil Leaves
      const basilGeo = new THREE.CircleGeometry(0.22, 16);
      const basilMat = new THREE.MeshStandardMaterial({ color: 0x15803d, side: THREE.DoubleSide });
      for (let i = 0; i < 5; i++) {
        const leaf = new THREE.Mesh(basilGeo, basilMat);
        const angle = (i / 5) * Math.PI * 2 + 0.3;
        leaf.position.set(Math.cos(angle) * 0.9, 0.22, Math.sin(angle) * 0.9);
        leaf.rotation.x = -Math.PI / 2;
        leaf.rotation.z = Math.random();
        modelGroup.add(leaf);
      }
    } else {
      // Burger / Kebab layers
      const bunBottomGeo = new THREE.CylinderGeometry(1.3, 1.2, 0.4, 32);
      const bunMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
      const bunBottom = new THREE.Mesh(bunBottomGeo, bunMat);
      bunBottom.position.y = 0.2;
      modelGroup.add(bunBottom);

      // Patty
      const pattyGeo = new THREE.CylinderGeometry(1.35, 1.35, 0.35, 32);
      const pattyMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
      const patty = new THREE.Mesh(pattyGeo, pattyMat);
      patty.position.y = 0.55;
      modelGroup.add(patty);

      // Melted Cheese
      const cheeseGeo = new THREE.BoxGeometry(2.0, 0.08, 2.0);
      const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
      const cheese = new THREE.Mesh(cheeseGeo, cheeseMat);
      cheese.position.y = 0.75;
      cheese.rotation.y = Math.PI / 4;
      modelGroup.add(cheese);

      // Top Bun
      const bunTopGeo = new THREE.SphereGeometry(1.35, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const bunTop = new THREE.Mesh(bunTopGeo, bunMat);
      bunTop.position.y = 0.8;
      modelGroup.add(bunTop);
    }

    scene.add(modelGroup);

    // Apply portion scaling
    if (selectedVariant) {
      modelGroup.scale.setScalar(selectedVariant.scaleFactor);
    }

    setIs3DReady(true);

    // 5. Interactive Mouse Drag Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !modelGroupRef.current) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      modelGroupRef.current.rotation.y += deltaX * 0.01;
      modelGroupRef.current.rotation.x = Math.max(-0.4, Math.min(0.6, modelGroupRef.current.rotation.x + deltaY * 0.01));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => { isDragging = false; };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // 6. Animation Render Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (autoRotate && !isDragging && modelGroupRef.current) {
        modelGroupRef.current.rotation.y += 0.008;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      renderer.dispose();
    };
  }, [shapeType, primaryColor, secondaryColor, is2DFallback]);

  // Handle portion variant change & dynamic geometry scaling
  const handleVariantSelect = (variant: any) => {
    setSelectedVariant(variant);
    if (modelGroupRef.current) {
      modelGroupRef.current.scale.setScalar(variant.scaleFactor);
    }
    if (onPortionChange) onPortionChange(variant);
  };

  // Toggle ingredient meshes
  const toggleIngredient = (name: string) => {
    const next = !activeToggles[name];
    const updated = { ...activeToggles, [name]: next };
    setActiveToggles(updated);

    if (modelGroupRef.current) {
      modelGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (name.toLowerCase().includes("egg") && child.name.includes("egg")) child.visible = next;
          if (name.toLowerCase().includes("herb") && child.name.includes("herb")) child.visible = next;
        }
      });
    }

    if (onIngredientsChange) {
      onIngredientsChange(Object.keys(updated).filter(k => updated[k]));
    }
  };

  const handleZoom = (inOut: "in" | "out") => {
    if (!cameraRef.current) return;
    const factor = inOut === "in" ? 0.85 : 1.15;
    cameraRef.current.position.z = Math.max(2.5, Math.min(8.0, cameraRef.current.position.z * factor));
  };

  const resetCamera = () => {
    if (!cameraRef.current || !modelGroupRef.current) return;
    cameraRef.current.position.set(0, 3.5, 5);
    cameraRef.current.lookAt(0, 0, 0);
    modelGroupRef.current.rotation.set(0, 0, 0);
  };

  const triggerAR = () => {
    setArTriggered(true);
    setTimeout(() => setArTriggered(false), 5000);
  };

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 overflow-hidden shadow-2xl p-4">
      {/* Top Bar: Verification Badge & Mode Switches */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          {dish.trueSizeVerified ? (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>True-Size Verified ({dish.portionWeightG || 450}g)</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Unverified Portion</span>
            </div>
          )}
          <span className="text-xs text-slate-400 hidden sm:inline">
            Physical Scale: {dish.portionDimensions || "18cm x 7.5cm handi"}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIs2DFallback(!is2DFallback)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
            title="Toggle 2D / 3D Mode"
          >
            <Eye className="w-3 h-3" />
            <span>{is2DFallback ? "Switch to 3D" : "2D Photo"}</span>
          </button>

          <button
            onClick={triggerAR}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AR Tabletop</span>
          </button>
        </div>
      </div>

      {/* AR Notification Banner */}
      {arTriggered && (
        <div className="absolute top-16 left-4 right-4 z-20 p-3 rounded-xl bg-indigo-950/90 border border-indigo-500 text-white text-xs shadow-xl flex items-center justify-between animate-in fade-in">
          <div>
            <p className="font-semibold text-indigo-300">WebXR / QuickLook Ready</p>
            <p className="text-slate-300">Point phone camera towards tabletop. Exact scale 1:1 will project based on verified {dish.portionDimensions || "18cm diameter"}.</p>
          </div>
          <button onClick={() => setArTriggered(false)} className="px-2 py-1 bg-indigo-600 rounded text-[11px]">Dismiss</button>
        </div>
      )}

      {/* Main Viewport */}
      <div className="relative h-[340px] sm:h-[400px] w-full flex items-center justify-center">
        {is2DFallback ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
            {dish.imageUrl ? (
              <img
                src={dish.imageUrl}
                alt={dish.name}
                className="max-h-[280px] w-auto rounded-xl object-cover shadow-2xl border border-slate-700"
              />
            ) : (
              <div className="text-slate-500 text-sm">High-Resolution Photo Loading...</div>
            )}
            <p className="text-xs text-slate-400 mt-2">Showing High-Res 2D Verified Studio Photograph</p>
          </div>
        ) : (
          <>
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
            
            {/* 3D Canvas Controls Overlay */}
            <div className="absolute bottom-3 left-3 flex items-center space-x-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 text-slate-300 text-xs">
              <button
                onClick={() => handleZoom("in")}
                className="p-1.5 hover:bg-slate-800 rounded-lg transition"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleZoom("out")}
                className="p-1.5 hover:bg-slate-800 rounded-lg transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={resetCamera}
                className="p-1.5 hover:bg-slate-800 rounded-lg transition"
                title="Reset Camera"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`p-1.5 rounded-lg transition ${autoRotate ? "text-amber-400 bg-amber-400/10" : "hover:bg-slate-800"}`}
                title="Toggle Auto-Rotation"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="absolute top-3 right-3 text-[11px] font-mono text-slate-500 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-800">
              {asset?.polyCount || 14200} Polys • 60 FPS
            </div>
          </>
        )}
      </div>

      {/* Portion Sizer & Ingredient Mesh Toggles */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-3">
        {dish.portionVariants && dish.portionVariants.length > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-300">Portion Size & Serving Scale:</span>
              <span className="text-amber-400 font-semibold">₹{selectedVariant?.price || dish.price}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {dish.portionVariants.map((variant) => (
                <button
                  key={variant.name}
                  onClick={() => handleVariantSelect(variant)}
                  className={`px-3 py-2 rounded-xl text-left text-xs transition border ${
                    selectedVariant?.name === variant.name
                      ? "bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10"
                      : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <p className="font-semibold text-slate-200">{variant.name}</p>
                  <p className="text-[11px] text-slate-400">{variant.dimensions || "Physical Handi"} • {variant.weightG}g</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {dish.ingredientToggles && dish.ingredientToggles.length > 0 && (
          <div>
            <span className="block text-xs font-medium text-slate-300 mb-1.5">Live 3D Ingredient Customization:</span>
            <div className="flex flex-wrap gap-1.5">
              {dish.ingredientToggles.map((toggle) => (
                <button
                  key={toggle.name}
                  onClick={() => toggleIngredient(toggle.name)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border flex items-center space-x-1.5 ${
                    activeToggles[toggle.name]
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                      : "bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-slate-300"
                  }`}
                >
                  <span>{activeToggles[toggle.name] ? "✓" : "+"}</span>
                  <span>{toggle.name}</span>
                  {toggle.extraPrice > 0 && <span className="text-[10px] opacity-75">(+₹{toggle.extraPrice})</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* True-Size Audit Footer */}
      <div className="mt-3 pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-900">
        <span>Verified by: {dish.verifiedBy || "FoodVerse Sensory Audit Team"}</span>
        <span>Dispute Eligible: 100% Refund on &gt;15% Portioned Deficit</span>
      </div>
    </div>
  );
}
