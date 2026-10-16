"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Building,
  Banknote,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("arjun@okhdfcbank");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("foodverse_checkout_data");
    if (raw) {
      setCheckoutData(JSON.parse(raw));
    }
  }, []);

  const handlePay = async () => {
    setProcessing(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: checkoutData?.cartId,
          couponCode: checkoutData?.couponCode,
          deliveryAddress: checkoutData?.deliveryAddress,
          paymentMethod,
          isEcoDelivery: checkoutData?.isEcoDelivery ?? true
        })
      });

      const data = await res.json();
      if (data.success && data.order) {
        sessionStorage.removeItem("foodverse_checkout_data");
        router.push(`/orders?active=${data.order.id}`);
      } else {
        setError(data.error || "Payment verification failed");
        setProcessing(false);
      }
    } catch {
      setError("Payment gateway network error");
      setProcessing(false);
    }
  };

  const totalAmount = checkoutData?.totalAmount || 596.5;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-10 space-y-6">
        <div>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">Secure Payment Gateway</span>
          <h1 className="text-3xl font-black text-white mt-1">Complete Your FoodVerse Order</h1>
          <p className="text-xs text-slate-400 mt-1">
            Official India-ready payments with Razorpay sandbox simulation. 100% encrypted and verified.
          </p>
        </div>

        {/* Amount to Pay Banner */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase">Authoritative Final Payable</span>
            <div className="text-2xl font-black text-amber-400">₹{totalAmount.toFixed(2)}</div>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Select Payment Method:</span>

          {/* UPI (Google Pay, PhonePe, Paytm) */}
          <div
            onClick={() => setPaymentMethod("UPI")}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              paymentMethod === "UPI"
                ? "bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10"
                : "bg-slate-900 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Instant UPI (Recommended)</h4>
                  <p className="text-xs text-slate-400">Google Pay, PhonePe, Paytm, BHIM</p>
                </div>
              </div>
              <input
                type="radio"
                name="pay"
                checked={paymentMethod === "UPI"}
                onChange={() => setPaymentMethod("UPI")}
                className="w-4 h-4 accent-amber-500"
              />
            </div>

            {paymentMethod === "UPI" && (
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                <label className="text-xs text-slate-300 font-medium">Your UPI VPA ID:</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            )}
          </div>

          {/* Credit / Debit Cards */}
          <div
            onClick={() => setPaymentMethod("CARD")}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              paymentMethod === "CARD"
                ? "bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10"
                : "bg-slate-900 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Credit / Debit Card</h4>
                  <p className="text-xs text-slate-400">Visa, Mastercard, RuPay, Amex</p>
                </div>
              </div>
              <input
                type="radio"
                name="pay"
                checked={paymentMethod === "CARD"}
                onChange={() => setPaymentMethod("CARD")}
                className="w-4 h-4 accent-amber-500"
              />
            </div>
          </div>

          {/* NetBanking */}
          <div
            onClick={() => setPaymentMethod("NETBANKING")}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              paymentMethod === "NETBANKING"
                ? "bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10"
                : "bg-slate-900 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">NetBanking</h4>
                  <p className="text-xs text-slate-400">HDFC, ICICI, SBI, Axis &amp; 50+ Banks</p>
                </div>
              </div>
              <input
                type="radio"
                name="pay"
                checked={paymentMethod === "NETBANKING"}
                onChange={() => setPaymentMethod("NETBANKING")}
                className="w-4 h-4 accent-amber-500"
              />
            </div>
          </div>

          {/* Cash on Delivery */}
          <div
            onClick={() => setPaymentMethod("COD")}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              paymentMethod === "COD"
                ? "bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10"
                : "bg-slate-900 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Cash / UPI on Delivery</h4>
                  <p className="text-xs text-slate-400">Pay when order arrives with verified OTP</p>
                </div>
              </div>
              <input
                type="radio"
                name="pay"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
                className="w-4 h-4 accent-amber-500"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={processing}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 transition shadow-xl shadow-amber-500/20"
        >
          {processing ? (
            <span>Authorizing Payment &amp; Alerting Kitchen...</span>
          ) : (
            <>
              <span>Authorize &amp; Place Order (₹{totalAmount.toFixed(2)})</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-slate-500">
          Sandbox Test Mode active. Simulated payment triggers authoritative order state machine and rider allocation.
        </p>
      </div>
    </div>
  );
}
