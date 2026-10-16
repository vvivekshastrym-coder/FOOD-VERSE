"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  Leaf,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Check
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<any>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isEcoDelivery, setIsEcoDelivery] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState("Flat 402, Green Glen Heights, 12th Main, HAL 2nd Stage, Indiranagar, Bengaluru");
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setCart(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (menuItemId: string, quantity: number) => {
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuItemId, quantity })
      });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      await fetch(`/api/cart?id=${cartItemId}`, { method: "DELETE" });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const applyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) return;
    setCouponError(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: cart?.subtotal || 0 })
      });
      const data = await res.json();
      if (data.valid) {
        setCouponApplied(data);
        setCouponCode(code);
      } else {
        setCouponError(data.message || "Invalid coupon");
        setCouponApplied(null);
      }
    } catch {
      setCouponError("Failed to validate coupon");
    }
  };

  const subtotal = cart?.subtotal || 0;
  const discount = couponApplied ? couponApplied.discountAmount : 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const deliveryFee = couponApplied?.code === "GREENEARTH" ? 0 : 35;
  const platformFee = 5.0;
  const gst = Math.round(discountedSubtotal * 0.05 * 100) / 100;
  const total = Math.round((discountedSubtotal + deliveryFee + platformFee + gst) * 100) / 100;

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading Cart...</div>;
  }

  const items = cart?.items || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center space-x-2">
            <ShoppingBag className="w-8 h-8 text-amber-400" />
            <span>Your FoodVerse Basket</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Review server-calculated pricing, verified portion items, and discounts.</p>
        </div>

        {items.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
            <p className="text-slate-400 text-sm">Your basket is currently empty.</p>
            <Link href="/" className="inline-block px-6 py-3 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
              Explore 3D Dishes in Bengaluru
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-3">
                {items.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={item.menuItem?.imageUrl || "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=150"}
                        alt={item.menuItem?.name}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-800"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{item.menuItem?.name}</h4>
                        <p className="text-xs text-amber-400 font-semibold mt-0.5">₹{item.unitPrice}</p>
                        {item.menuItem?.trueSizeVerified && (
                          <span className="text-[10px] text-emerald-400 flex items-center space-x-1 mt-0.5">
                            <ShieldCheck className="w-3 h-3" />
                            <span>True-Size Verified Portion</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-2 py-1 rounded-xl">
                        <button
                          onClick={() => updateQuantity(item.menuItemId, -1)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-white px-1">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menuItemId, 1)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 transition"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Address Selector */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Delivery Destination</span>
                <div className="flex items-start space-x-2 text-xs text-slate-300">
                  <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <input
                    type="text"
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Eco-Delivery Green Choice (Feature 16) */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Leaf className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h5 className="text-xs font-bold text-white">Green Delivery &amp; Compostable Packaging</h5>
                    <p className="text-[11px] text-slate-400">Carbon offset of 0.42 kg CO2e through electric vehicle fleet</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isEcoDelivery}
                  onChange={(e) => setIsEcoDelivery(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 rounded cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            {/* Right Column: Billing Breakdown & Coupons */}
            <div className="lg:col-span-5 space-y-4">
              {/* Coupon Form */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Promo Codes &amp; Coupons</span>
                </span>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. FIRST3D)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs uppercase text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => applyCoupon()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
                  >
                    Apply
                  </button>
                </div>

                {/* Auto Suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["FIRST3D", "FOODVERSE50", "GREENEARTH"].map((c) => (
                    <button
                      key={c}
                      onClick={() => applyCoupon(c)}
                      className="px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono hover:bg-amber-500/20"
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {couponApplied && (
                  <p className="text-xs text-emerald-400 font-semibold">
                    ✓ Code &apos;{couponApplied.code}&apos; applied! You saved ₹{couponApplied.discountAmount}.
                  </p>
                )}
                {couponError && <p className="text-xs text-rose-400">{couponError}</p>}
              </div>

              {/* Authoritative Server Bill Breakdown */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] pb-2 border-b border-slate-800">
                  Bill Summary (INR ₹)
                </h4>

                <div className="flex justify-between text-slate-300">
                  <span>Item Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-300">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? <strong className="text-emerald-400">FREE</strong> : `₹${deliveryFee.toFixed(2)}`}</span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Platform Marketplace Fee</span>
                  <span>₹{platformFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>GST (5% Restaurant Tax in India)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-base font-extrabold text-white">
                  <span>Total Payable</span>
                  <span className="text-xl text-amber-400">₹{total.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => {
                    sessionStorage.setItem("foodverse_checkout_data", JSON.stringify({
                      cartId: cart.cartId,
                      couponCode: couponApplied?.code,
                      deliveryAddress: selectedAddress,
                      isEcoDelivery,
                      totalAmount: total
                    }));
                    router.push("/checkout");
                  }}
                  className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 transition shadow-xl shadow-amber-500/20"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
