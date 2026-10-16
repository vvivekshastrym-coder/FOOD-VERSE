"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Store,
  Bike,
  ShieldCheck,
  Users,
  Compass,
  Layers,
  ChevronUp,
  ChevronDown
} from "lucide-react";

export default function UnifiedAppDock() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);

  const VIEWS = [
    { label: "Customer App", href: "/", icon: ShoppingBag, color: "text-amber-400", activeBg: "bg-amber-500/20 border-amber-500/40 text-amber-300" },
    { label: "Explore", href: "/explore", icon: Compass, color: "text-amber-400", activeBg: "bg-amber-500/20 border-amber-500/40 text-amber-300" },
    { label: "Food Room", href: "/food-room", icon: Users, color: "text-indigo-400", activeBg: "bg-indigo-500/20 border-indigo-500/40 text-indigo-300" },
    { label: "Kitchen Portal", href: "/restaurant-dashboard", icon: Store, color: "text-amber-400", activeBg: "bg-amber-500/20 border-amber-500/40 text-amber-300" },
    { label: "Rider PWA", href: "/rider", icon: Bike, color: "text-blue-400", activeBg: "bg-blue-500/20 border-blue-500/40 text-blue-300" },
    { label: "Admin Console", href: "/admin", icon: ShieldCheck, color: "text-purple-400", activeBg: "bg-purple-500/20 border-purple-500/40 text-purple-300" }
  ];

  return (
    <aside aria-label="One App View Switcher" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300">
      <div className="bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-1.5 flex items-center space-x-1 ring-1 ring-white/10">
        
        {/* Toggle Collapse */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title={isExpanded ? "Collapse Switcher" : "Expand One-App Switcher"}
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        <span className="text-[11px] font-black uppercase text-slate-500 px-2 hidden sm:inline tracking-wider border-r border-slate-800">
          One App
        </span>

        {isExpanded && (
          <div className="flex items-center space-x-1">
            {VIEWS.map((view) => {
              const Icon = view.icon;
              const isActive = pathname === view.href || (view.href !== "/" && pathname.startsWith(view.href));

              return (
                <Link
                  key={view.href}
                  href={view.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    isActive
                      ? view.activeBg
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                  title={`Switch to ${view.label}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${view.color}`} />
                  <span className="hidden md:inline">{view.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {!isExpanded && (
          <span className="text-xs font-bold text-amber-400 px-2 py-1">
            Switch View
          </span>
        )}
      </div>
    </aside>
  );
}
