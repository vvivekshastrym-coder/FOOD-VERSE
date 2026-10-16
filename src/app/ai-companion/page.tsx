"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Sparkles,
  ShoppingBag,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight
} from "lucide-react";

export default function AICompanionPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      content: "Hello! I am your FoodVerse AI Companion. I execute real server tools to search verified 3D dishes, calculate high-protein or dietary meals, track your live kitchen order, and check allergen safety.",
      suggestions: [
        "Find a spicy meal under ₹400 with high protein",
        "Where is my order?",
        "Healthy low-calorie superbowls",
        "Woodfired Truffle Pizza allergens"
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const sendMessage = async (queryText?: string) => {
    const text = (queryText || query).trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text })
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          actionTaken: data.actionTaken,
          dishes: data.dishes,
          orderStatus: data.orderStatus,
          suggestions: data.suggestions
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered a temporary network issue connecting to the menu database. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser. Please type your query.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        sendMessage(transcript);
      }
    };

    recognition.start();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">AI Food Companion</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                  Feature 6 &amp; 18
                </span>
              </div>
              <p className="text-xs text-slate-400">Validated tool execution on structured menus, macros, and live kitchen events.</p>
            </div>
          </div>
          <span className="text-xs text-emerald-400 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Strict Zero-Hallucination Policy</span>
          </span>
        </div>

        {/* Chat History Container */}
        <div className="space-y-4 min-h-[420px]">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-2xl rounded-2xl p-4 space-y-3 ${
                  msg.role === "user"
                    ? "bg-amber-500 text-slate-950 font-semibold text-sm"
                    : "bg-slate-900 border border-slate-800 text-slate-200 text-xs"
                }`}
              >
                <p className="leading-relaxed">{msg.content}</p>

                {/* Structured Dishes Results Card */}
                {msg.dishes && msg.dishes.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {msg.dishes.map((dish: any) => (
                      <div
                        key={dish.id}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-amber-400 font-semibold">{dish.restaurantName}</span>
                            <span className="text-xs font-black text-white">₹{dish.price}</span>
                          </div>
                          <h5 className="text-xs font-bold text-white mt-0.5">{dish.name}</h5>
                          {dish.proteinG && (
                            <p className="text-[10px] text-emerald-400">{dish.proteinG}g protein • {dish.calories} kcal</p>
                          )}
                          <p className="text-[10px] text-slate-400 mt-0.5">{dish.servingSize}</p>
                        </div>

                        <div className="flex items-center space-x-2 pt-1 border-t border-slate-900">
                          <Link
                            href={`/dish/${dish.id}`}
                            className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold text-center flex items-center justify-center space-x-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View 3D</span>
                          </Link>
                          <button
                            onClick={async () => {
                              await fetch("/api/cart", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ menuItemId: dish.id, quantity: 1 })
                              });
                              window.location.href = "/cart";
                            }}
                            className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                            title="Add to Bag"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Live Order Tracking Card */}
                {msg.orderStatus && (
                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-indigo-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400 text-xs">#{msg.orderStatus.orderNumber}</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">
                        {msg.orderStatus.status}
                      </span>
                    </div>
                    <p className="text-xs text-white font-semibold">{msg.orderStatus.restaurantName}</p>
                    <p className="text-[11px] text-slate-400">Last event: {msg.orderStatus.lastEvent}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-300">OTP: <strong className="text-white font-mono">{msg.orderStatus.otpCode}</strong></span>
                      <Link
                        href={`/orders?active=${msg.orderStatus.id}`}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px]"
                      >
                        Open 3D Tracker
                      </Link>
                    </div>
                  </div>
                )}

                {/* Suggestions Pills */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {msg.suggestions.map((sug: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(sug)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                <span>Executing validated server tools...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar with Voice Support (Feature 18) */}
        <div className="sticky bottom-4 p-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 flex items-center space-x-2 shadow-2xl">
          <button
            onClick={toggleVoice}
            className={`p-3 rounded-xl transition ${
              isListening
                ? "bg-rose-500 text-white animate-pulse"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
            title="Voice Search (Web Speech API)"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            placeholder={isListening ? "Listening to your voice..." : "Ask AI Companion: 'Find spicy meal under ₹400'..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 bg-transparent border-none text-xs text-white focus:outline-none px-2"
          />

          <button
            onClick={() => sendMessage()}
            disabled={!query.trim() || loading}
            className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
