"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Store, ArrowRight, Compass, Volume2, VolumeX, Info } from "lucide-react";
import Link from "next/link";

interface WalkableFoodStreet3DProps {
  restaurants: Array<{
    id: string;
    name: string;
    slug: string;
    cuisineType: string;
    rating: number;
    avgPreparationTime: number;
    hygieneRating: number;
    heroImage?: string | null;
  }>;
}

export default function WalkableFoodStreet3D({ restaurants }: WalkableFoodStreet3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(restaurants[0] || null);
  const [cameraPositionZ, setCameraPositionZ] = useState(10);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.035);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 12);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Street Lighting (Neon Night Theme)
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffedd5, 1.5);
    dirLight.position.set(5, 15, 5);
    scene.add(dirLight);

    // Street Road / Cobblestone Surface
    const roadGeo = new THREE.PlaneGeometry(16, 60);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.y = 0;
    scene.add(roadMesh);

    // Sidewalk kerbs
    const sidewalkLeft = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.2, 60),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    sidewalkLeft.position.set(-6, 0.1, 0);
    scene.add(sidewalkLeft);

    const sidewalkRight = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.2, 60),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    sidewalkRight.position.set(6, 0.1, 0);
    scene.add(sidewalkRight);

    // Build Storefronts for each restaurant along the street
    const storefrontMeshes: THREE.Mesh[] = [];
    const colors = [0xd97706, 0xef4444, 0x10b981, 0xec4899];

    restaurants.forEach((restaurant, idx) => {
      const isLeft = idx % 2 === 0;
      const zPos = 8 - idx * 10;
      const xPos = isLeft ? -7.5 : 7.5;
      const themeColor = colors[idx % colors.length];

      // Building facade
      const bldgGeo = new THREE.BoxGeometry(4.5, 5.0, 6.0);
      const bldgMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.6
      });
      const building = new THREE.Mesh(bldgGeo, bldgMat);
      building.position.set(xPos, 2.5, zPos);
      building.userData = { restaurant };
      scene.add(building);
      storefrontMeshes.push(building);

      // Neon Sign Board
      const signGeo = new THREE.BoxGeometry(3.5, 0.8, 0.2);
      const signMat = new THREE.MeshStandardMaterial({
        color: themeColor,
        emissive: themeColor,
        emissiveIntensity: 0.8
      });
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(xPos + (isLeft ? 1.0 : -1.0), 4.2, zPos + 2.0);
      scene.add(sign);

      // Street Lamp post
      const lampGeo = new THREE.CylinderGeometry(0.08, 0.08, 4.0);
      const lampMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(isLeft ? -4.8 : 4.8, 2.0, zPos);
      scene.add(lamp);

      const lightBulb = new THREE.PointLight(themeColor, 1.2, 8);
      lightBulb.position.set(isLeft ? -4.8 : 4.8, 3.8, zPos);
      scene.add(lightBulb);
    });

    // Animation Loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (cameraRef.current) {
        // Smoothly interpolate camera to target position
        cameraRef.current.position.z += (cameraPositionZ - cameraRef.current.position.z) * 0.08;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, [restaurants, cameraPositionZ]);

  const walkStreet = (direction: "forward" | "backward") => {
    setCameraPositionZ(prev => {
      const next = direction === "forward" ? Math.max(-25, prev - 6) : Math.min(14, prev + 6);
      // Auto select nearby restaurant based on Z depth
      const closestIdx = Math.max(0, Math.min(restaurants.length - 1, Math.floor((12 - next) / 8)));
      if (restaurants[closestIdx]) {
        setSelectedRestaurant(restaurants[closestIdx]);
      }
      return next;
    });
  };

  return (
    <div className="relative w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Walkable 3D Food Street</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">Feature 3</span>
            </h3>
            <p className="text-xs text-slate-400">Navigate down the culinary avenue to discover live storefronts in Bengaluru.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => walkStreet("forward")}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
          >
            Walk Forward ↓
          </button>
          <button
            onClick={() => walkStreet("backward")}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-medium text-xs hover:bg-slate-700 transition"
          >
            Step Back ↑
          </button>
        </div>
      </div>

      {/* 3D Viewport */}
      <div className="relative h-[420px] w-full">
        <div ref={mountRef} className="w-full h-full" />

        {/* Selected Storefront Overlay Card */}
        {selectedRestaurant && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md p-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Approaching Storefront</span>
                <h4 className="text-lg font-bold text-white">{selectedRestaurant.name}</h4>
                <p className="text-xs text-slate-300">{selectedRestaurant.cuisineType}</p>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  ★ {selectedRestaurant.rating}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Hygiene: {selectedRestaurant.hygieneRating}/5</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Avg Prep: {selectedRestaurant.avgPreparationTime} mins</span>
              <Link
                href={`/restaurant/${selectedRestaurant.slug}`}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/30"
              >
                <span>Enter Restaurant Menu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
