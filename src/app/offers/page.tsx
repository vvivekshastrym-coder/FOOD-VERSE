"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Tag,
  Sparkles,
  Zap,
  Clock,
  CheckCircle2,
  Copy,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Flame,
  Leaf
} from "lucide-react";

export default function OffersPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [antiWasteDeals, setAntiWasteDeals] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOffers() {
      try {
        const [couponsRes, dealsRes] = await Promise.all([
          fetch("/api/coupons"),
          fetch("/api/anti-waste")
        ]);

        const couponsData = await couponsRes.json();
        const dealsData = await dealsRes.json();

        if (couponsData.coupons) setCoupons(couponsData.coupons);
        if (dealsData.deals) setAntiWasteDeals(dealsData.deals);
      } catch (err) {
        console.error("Failed to load offers", err);
      } finally {
        setLoading(false);
      }
    }
    loadOffers();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleClaimDeal = async (menuItemId: string) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuItemId, quantity: 1 })
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/cart";
      } else if (res.status === 409) {
        alert(`${data.error}. Please clear cart first or complete existing order.`);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 selection:bg-amber-500 selection:text-slate-950">
      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-950 border-b border-slate-800/80 pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Tag className="w-3.5 h-3.5" />
            <span>Official Promo Codes & Surplus Rescues</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Offers & Anti-Waste Deals
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Genuine verified savings with zero hidden catches. Apply discount coupons at checkout or rescue freshly prepared chef specialties before kitchen closure at up to 40% off.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-16">
        {/* Section 1: Active Coupons */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Verified Coupon Codes</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Copy and apply in your cart during checkout. Valid on eligible order values.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-sm text-slate-400">
              No active promo codes right now. Please check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition shadow-xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition" />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono font-black text-sm tracking-wide">
                        {coupon.code}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white pt-1">
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.discountValue}% OFF`
                        : `FLAT ₹${coupon.discountValue} OFF`}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {coupon.description}
                    </p>

                    <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                      <p>• Min. order value: <strong className="text-slate-200">₹{coupon.minOrderValue}</strong></p>
                      {coupon.maxDiscount && (
                        <p>• Max discount cap: <strong className="text-slate-200">₹{coupon.maxDiscount}</strong></p>
                      )}
                    </div>
                  </div>

                  <div className="pt-5 border-t border-slate-800 mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      Expires in 60+ days
                    </span>

                    <button
                      onClick={() => handleCopy(coupon.code)}
                      className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                        copiedCode === coupon.code
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-800 hover:bg-slate-700 text-amber-400"
                      }`}
                    >
                      {copiedCode === coupon.code ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Anti-Waste Flash Deals */}
        <section className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-bold uppercase">
                  <Zap className="w-4 h-4 animate-bounce" />
                  <span>Feature 11: Shift Close Surplus Rescues</span>
                </div>
                <h2 className="text-2xl font-black text-white mt-1">
                  Anti-Waste Flash Deals
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Rescue freshly prepared chef dishes before evening shift closure. Atomic stock-locking prevents duplicate orders and saves food from going to landfill.
                </p>
              </div>

              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span>Zero Food Waste Mission</span>
              </div>
            </div>

            {antiWasteDeals.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 text-center text-xs text-slate-400">
                No active surplus deals right now. Next batch opens around 9:30 PM.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {antiWasteDeals.map((deal) => {
                  const discountPercent = Math.round(
                    ((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100
                  );

                  return (
                    <div
                      key={deal.id}
                      className="rounded-2xl bg-slate-950/90 border border-slate-800 p-4 space-y-3 hover:border-emerald-500/50 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                            Save {discountPercent}%
                          </span>
                          <span className="text-[11px] text-amber-400 font-bold flex items-center space-x-1">
                            <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span>{deal.availableQuantity} left</span>
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white line-clamp-1">
                          {deal.dishName}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {deal.restaurantName}
                        </p>

                        <div className="flex items-baseline space-x-2 mt-2">
                          <span className="text-lg font-black text-emerald-400">
                            ₹{deal.dealPrice}
                          </span>
                          <span className="text-xs text-slate-500 line-through">
                            ₹{deal.originalPrice}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <Link
                          href={`/dish/${deal.menuItemId}`}
                          className="text-[11px] text-slate-400 hover:text-white underline underline-offset-2"
                        >
                          Inspect Portion
                        </Link>

                        <button
                          onClick={() => handleClaimDeal(deal.menuItemId)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Claim Deal</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Section 3: FoodVerse Gold Subscription Perk */}
        <section className="rounded-3xl bg-slate-900 border border-slate-800 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase">Membership Benefit</span>
            <h3 className="text-2xl font-black text-white">FoodVerse Gold Membership</h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Enjoy unlimited ₹0 delivery fees on every single order above ₹199 across all verified restaurants, zero rain surge pricing, and early access to anti-waste deals.
            </p>
          </div>

          <Link
            href="/explore"
            className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs transition shadow-xl shadow-amber-500/20 whitespace-nowrap"
          >
            <span>Explore Restaurants</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
