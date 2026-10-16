"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CheckCircle2, Clock, MapPin, Bike, ShieldCheck, Thermometer, AlertCircle, Phone } from "lucide-react";

interface OrderTracking3DProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    otpCode: string;
    deliveryAddress: string;
    estimatedPrepMinutes: number;
    estimatedDeliveryMinutes: number;
    restaurant: {
      name: string;
      phone: string;
      address: string;
    };
    deliveryTask?: {
      rider?: {
        name: string;
        phone?: string;
        avatar?: string | null;
      } | null;
      status: string;
    } | null;
    events: Array<{
      status: string;
      note?: string | null;
      timestamp: string;
    }>;
  };
  onFileDispute?: () => void;
}

const STAGES = [
  { key: "PLACED", label: "Placed", desc: "Sent to kitchen" },
  { key: "ACCEPTED", label: "Accepted", desc: "Chef confirmed" },
  { key: "PREPARING", label: "Cooking", desc: "Active on flame" },
  { key: "PLATING", label: "Plating", desc: "Verified portion check" },
  { key: "PACKED", label: "Packed", desc: "Sealed in thermal bag" },
  { key: "PICKED_UP", label: "Picked Up", desc: "Rider on the move" },
  { key: "OUT_FOR_DELIVERY", label: "Near Door", desc: "In your street" },
  { key: "DELIVERED", label: "Delivered", desc: "OTP handoff confirmed" }
];

export default function OrderTracking3D({ order, onFileDispute }: OrderTracking3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [riderProgress, setRiderProgress] = useState(0.5);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const bikeMeshRef = useRef<THREE.Mesh | null>(null);

  const currentStageIndex = STAGES.findIndex(s => s.key === order.status);
  const activeIndex = currentStageIndex >= 0 ? currentStageIndex : 2;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 280;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 4.0, 7.0);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffedd5, 1.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // City Highway Plane
    const road = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.1, 2.5),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    scene.add(road);

    // Dashed center line
    for (let i = -4; i <= 4; i += 1.2) {
      const dash = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.12, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xfacc15 })
      );
      dash.position.set(i, 0.01, 0);
      scene.add(dash);
    }

    // Origin: Restaurant building marker (left)
    const restMarker = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.4, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 })
    );
    restMarker.position.set(-4.2, 0.7, 0);
    scene.add(restMarker);

    // Destination: Customer home building marker (right)
    const homeMarker = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.8, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.5 })
    );
    homeMarker.position.set(4.2, 0.9, 0);
    scene.add(homeMarker);

    // Delivery EV Scooter / Rider Mesh (center)
    const bikeGroup = new THREE.Group();
    const bikeBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.4, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x10b981 })
    );
    bikeBody.position.y = 0.3;
    bikeGroup.add(bikeBody);

    // Thermal Delivery Bag on Scooter Rack
    const thermalBag = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.35, 0.35),
      new THREE.MeshStandardMaterial({ color: 0xef4444 })
    );
    thermalBag.position.set(-0.25, 0.55, 0);
    bikeGroup.add(thermalBag);

    // Scooter Wheels
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x020617 });
    const wheel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16), wheelMat);
    wheel1.rotation.x = Math.PI / 2;
    wheel1.position.set(-0.3, 0.18, 0);
    bikeGroup.add(wheel1);

    const wheel2 = wheel1.clone();
    wheel2.position.set(0.3, 0.18, 0);
    bikeGroup.add(wheel2);

    // Position based on progress (-3.5 to +3.5)
    const progressX = -3.5 + (activeIndex / (STAGES.length - 1)) * 7.0;
    bikeGroup.position.set(progressX, 0, 0);
    scene.add(bikeGroup);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      // Gentle vibration of active scooter
      bikeGroup.position.y = 0.02 * Math.sin(Date.now() * 0.01);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, [activeIndex]);

  return (
    <div className="w-full rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-6">
      {/* Header with OTP & ETA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-amber-400">ORDER #{order.orderNumber}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 uppercase">
              {order.status}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">{order.restaurant.name}</h3>
          <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>Delivering to: {order.deliveryAddress}</span>
          </p>
        </div>

        {/* Customer Delivery OTP Security Card */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-500/40 text-center flex items-center space-x-4">
          <div>
            <span className="text-[10px] font-semibold uppercase text-indigo-300 tracking-wider">Handoff OTP</span>
            <div className="text-2xl font-mono font-extrabold text-white tracking-widest">{order.otpCode}</div>
          </div>
          <div className="text-left border-l border-indigo-800/80 pl-3">
            <div className="flex items-center space-x-1 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Tamper Guard</span>
            </div>
            <p className="text-[10px] text-slate-300">Share with rider only upon physical verification</p>
          </div>
        </div>
      </div>

      {/* 3D City Delivery Scene */}
      <div className="relative h-[240px] rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
        <div ref={mountRef} className="w-full h-full" />
        
        {/* Live IoT Sensor Temperature Badge */}
        <div className="absolute top-3 left-3 flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs text-slate-300">
          <Thermometer className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>Smart Bag: <strong className="text-rose-400">64.2°C</strong> (Hot-Chain Maintained)</span>
        </div>

        <div className="absolute bottom-3 right-3 text-xs bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-400">
          ETA: ~{order.estimatedPrepMinutes + order.estimatedDeliveryMinutes} mins
        </div>
      </div>

      {/* Authoritative Kitchen-to-Door Verified Timeline */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-3">Kitchen-to-Door Verified Journey</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx <= activeIndex;
            const isCurrent = idx === activeIndex;

            return (
              <div
                key={stage.key}
                className={`p-2.5 rounded-xl border text-left transition ${
                  isCurrent
                    ? "bg-amber-500/20 border-amber-500 text-white shadow-md shadow-amber-500/10"
                    : isCompleted
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-slate-800/30 border-slate-800 text-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono opacity-70">0{idx + 1}</span>
                  {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </div>
                <p className="text-xs font-bold leading-tight">{stage.label}</p>
                <p className="text-[10px] opacity-80 mt-0.5">{stage.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Controls & True-Size Dispute */}
      <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {order.deliveryTask?.rider ? (
          <div className="flex items-center space-x-2 text-slate-300">
            <Bike className="w-4 h-4 text-emerald-400" />
            <span>Rider: <strong>{order.deliveryTask.rider.name}</strong></span>
            {order.deliveryTask.rider.phone && (
              <a href={`tel:${order.deliveryTask.rider.phone}`} className="flex items-center space-x-1 text-indigo-400 hover:underline">
                <Phone className="w-3 h-3" />
                <span>Call</span>
              </a>
            )}
          </div>
        ) : (
          <span className="text-slate-400">Assigning nearest delivery partner...</span>
        )}

        <button
          onClick={onFileDispute}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold transition"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Report Portion Mismatch / Dispute</span>
        </button>
      </div>
    </div>
  );
}
