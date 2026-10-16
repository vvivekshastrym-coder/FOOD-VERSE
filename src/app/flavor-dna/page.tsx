"use client";

import React, { useEffect, useState } from "react";
import {
  Dna,
  Save,
  ShieldCheck,
  Sparkles,
  Users,
  Check,
  RotateCcw,
  Info
} from "lucide-react";

export default function FlavorDNAPage() {
  const [profile, setProfile] = useState<any>({
    spicy: 75,
    sweet: 30,
    sour: 40,
    umami: 85,
    crunch: 65,
    richness: 70,
    dietaryTags: "High Protein, Spice Enthusiast"
  });
  const [twins, setTwins] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [consentGranted, setConsentGranted] = useState(true);

  useEffect(() => {
    async function loadDNA() {
      try {
        const [dnaRes, twinsRes] = await Promise.all([
          fetch("/api/flavor-dna"),
          fetch("/api/flavor-dna/twins")
        ]);
        const dnaData = await dnaRes.json();
        const twinsData = await twinsRes.json();

        if (dnaData.profile) setProfile(dnaData.profile);
        if (twinsData.twins) setTwins(twinsData.twins);
      } catch (err) {
        console.error(err);
      }
    }
    loadDNA();
  }, []);

  const handleSliderChange = (key: string, value: number) => {
    setProfile((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/flavor-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      // Fallback
    } finally {
      setSaving(false);
    }
  };

  const resetProfile = () => {
    setProfile({
      spicy: 50,
      sweet: 50,
      sour: 50,
      umami: 50,
      crunch: 50,
      richness: 50,
      dietaryTags: "Balanced Palate"
    });
  };

  const dimensions = [
    { key: "spicy", label: "Spiciness & Heat", desc: "Awadhi mirch, Schezwan, Ghost pepper", color: "from-rose-500 to-red-600", textColor: "text-rose-400" },
    { key: "umami", label: "Savory Umami", desc: "Aged broths, slow caramelized onions, parmesan", color: "from-purple-500 to-indigo-600", textColor: "text-purple-400" },
    { key: "crunch", label: "Crunch & Texture", desc: "Crispy shallots, tempura flakes, charred crust", color: "from-sky-500 to-blue-600", textColor: "text-sky-400" },
    { key: "richness", label: "Richness & Creaminess", desc: "Clarified ghee, truffle butter, whole burrata", color: "from-amber-500 to-orange-600", textColor: "text-amber-400" },
    { key: "sour", label: "Tangy & Zesty", desc: "Kashmiri sour anardana, lemon grass, sumac", color: "from-lime-500 to-emerald-600", textColor: "text-lime-400" },
    { key: "sweet", label: "Subtle Sweetness", desc: "Caramelized jaggery, saffron honey glaze", color: "from-yellow-400 to-amber-500", textColor: "text-yellow-400" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
              <Dna className="w-4 h-4" />
              <span>Signature Pillar 4: Flavor DNA</span>
            </div>
            <h1 className="text-3xl font-black text-white mt-1">Your Sensory Taste Profile</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              An editable multi-dimensional taste profile calibrated by your feedback and order history. Used to personalize menu discovery and match taste twins.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={resetProfile}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 border border-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-rose-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving..." : "Save Flavor DNA"}</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
            <Check className="w-4 h-4" />
            <span>Flavor DNA profile updated and saved securely to your private preferences.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sliders Left Column */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">6 Sensory Dimensions</h3>
              <span className="text-xs text-slate-400">Drag to customize affinity</span>
            </div>

            <div className="space-y-5">
              {dimensions.map((dim) => {
                const val = profile[dim.key] || 50;
                return (
                  <div key={dim.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className={`font-bold ${dim.textColor}`}>{dim.label}</span>
                        <span className="text-[10px] text-slate-400 ml-2">({dim.desc})</span>
                      </div>
                      <span className="font-mono font-bold text-white text-sm">{val}%</span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={val}
                      onChange={(e) => handleSliderChange(dim.key, parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                  </div>
                );
              })}
            </div>

            {/* Dietary Tags Input */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Dietary &amp; Health Focus Tags:</label>
              <input
                type="text"
                value={profile.dietaryTags || ""}
                onChange={(e) => setProfile({ ...profile, dietaryTags: e.target.value })}
                placeholder="e.g. High Protein, Keto, Halal, Nut Allergy"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Consent Controls */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <p className="font-semibold text-white">Private Taste-Twin Matching Consent</p>
                <p className="text-[10px] text-slate-400">Allow anonymized taste matching without sharing personal order history.</p>
              </div>
              <input
                type="checkbox"
                checked={consentGranted}
                onChange={(e) => setConsentGranted(e.target.checked)}
                className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Taste-Twin Matches Right Column (Feature 13) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-900 border border-rose-800/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">Feature 13</span>
                  <h3 className="text-base font-bold text-white flex items-center space-x-1.5 mt-0.5">
                    <Users className="w-4 h-4 text-rose-400" />
                    <span>Taste-Twin Matches</span>
                  </h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                  Bengaluru Diners
                </span>
              </div>

              <p className="text-xs text-slate-300">
                Found diners in Bengaluru with closely correlated flavor profiles. Discover their favorite verified dishes:
              </p>

              <div className="space-y-3">
                {twins.map((twin: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{twin.pseudonym}</span>
                      <span className="font-mono font-extrabold text-emerald-400">{twin.similarityPercent}% Match</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {twin.sharedAffinities?.map((aff: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                          {aff}
                        </span>
                      ))}
                    </div>

                    <div className="pt-1 text-[11px] text-slate-400">
                      <span>Loved Dishes: </span>
                      <strong className="text-amber-400">{twin.recommendedDishes?.join(", ")}</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-[10px] text-slate-500 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero PII exposure. Names and addresses are never shared.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
