"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  Users,
  Store,
  Layers
} from "lucide-react";

export default function AdminPage() {
  const [metricsData, setMetricsData] = useState<any>(null);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [flags, setFlags] = useState<any[]>([]);
  const [ledgerSummary, setLedgerSummary] = useState<any>(null);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"METRICS" | "DISPUTES" | "FLAGS" | "LEDGER">("DISPUTES");
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [mRes, dRes, fRes, lRes] = await Promise.all([
        fetch("/api/admin/metrics"),
        fetch("/api/admin/disputes"),
        fetch("/api/admin/feature-flags"),
        fetch("/api/admin/ledger")
      ]);

      const mData = await mRes.json();
      const dData = await dRes.json();
      const fData = await fRes.json();
      const lData = await lRes.json();

      setMetricsData(mData);
      if (dData.disputes) setDisputes(dData.disputes);
      if (fData.flags) setFlags(fData.flags);
      if (lData.summary) {
        setLedgerSummary(lData.summary);
        setLedgerEntries(lData.entries || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleResolveDispute = async (disputeId: string, decision: "APPROVED" | "REJECTED") => {
    try {
      await fetch("/api/admin/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disputeId,
          decision,
          resolutionNote: decision === "APPROVED" ? "Audit passed: Portion verified deficient against 3D specifications. Refund debited." : "Dispute rejected: Kitchen photo verification aligned with specs."
        })
      });
      fetchAdminData();
    } catch {
      // Fallback
    }
  };

  const handleToggleFlag = async (key: string, currentEnabled: boolean) => {
    try {
      await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          isEnabled: !currentEnabled
        })
      });
      fetchAdminData();
    } catch {
      // Fallback
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading Admin Control HQ...</div>;
  }

  const metrics = metricsData?.metrics || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Administrative Control Panel</span>
            </div>
            <h1 className="text-3xl font-black text-white mt-1">Platform Operations &amp; Moderation</h1>
            <p className="text-xs text-slate-400">
              Server-enforced RBAC • Dispute Resolution • All 22 Feature Flags • Financial Ledger Audit
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab("DISPUTES")}
              className={`px-3 py-1.5 rounded-xl transition ${activeTab === "DISPUTES" ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-white"}`}
            >
              Dispute Queue ({disputes.filter(d => d.status === "OPEN").length})
            </button>
            <button
              onClick={() => setActiveTab("FLAGS")}
              className={`px-3 py-1.5 rounded-xl transition ${activeTab === "FLAGS" ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-white"}`}
            >
              22 Feature Flags
            </button>
            <button
              onClick={() => setActiveTab("LEDGER")}
              className={`px-3 py-1.5 rounded-xl transition ${activeTab === "LEDGER" ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-white"}`}
            >
              Financial Ledger
            </button>
          </div>
        </div>

        {/* Top Operational Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase">Gross Merchandise Value</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">₹{metrics.gmv?.toFixed(2) || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase">Platform Revenue</span>
            <p className="text-2xl font-black text-amber-400 mt-1">₹{metrics.platformRevenue?.toFixed(2) || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase">Total Orders</span>
            <p className="text-2xl font-black text-white mt-1">{metrics.totalOrders || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase">Open True-Size Claims</span>
            <p className="text-2xl font-black text-rose-400 mt-1">{metrics.openDisputesCount || 0}</p>
          </div>
        </div>

        {/* Tab 1: Dispute Resolution Queue */}
        {activeTab === "DISPUTES" && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <span>True-Size Guarantee &amp; Quality Dispute Cases</span>
                </h3>
                <p className="text-xs text-slate-400">Audit portion discrepancy claims and execute legitimate ledger refunds.</p>
              </div>
            </div>

            {disputes.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">No customer dispute tickets filed.</div>
            ) : (
              <div className="divide-y divide-slate-800">
                {disputes.map((d: any) => (
                  <div key={d.id} className="py-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-purple-400">CASE #{d.id.slice(0, 8)}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            d.status === "OPEN" ? "bg-rose-500/20 text-rose-300" : d.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400"
                          }`}>
                            {d.status}
                          </span>
                          <span className="text-xs text-slate-400">Order #{d.order?.orderNumber}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1">{d.type.replace(/_/g, " ")}</h4>
                      </div>

                      <div className="flex items-center space-x-2">
                        {d.status === "OPEN" && (
                          <>
                            <button
                              onClick={() => handleResolveDispute(d.id, "APPROVED")}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve Refund (₹{d.refundAmount})</span>
                            </button>
                            <button
                              onClick={() => handleResolveDispute(d.id, "REJECTED")}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center space-x-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject Claim</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                      &quot;{d.description}&quot;
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Customer: {d.user?.name} ({d.user?.email})</span>
                      <span>Filed: {new Date(d.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: 22 Feature Flags Manager */}
        {activeTab === "FLAGS" && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  <span>Centralized 22 PRD Feature Flags Manager</span>
                </h3>
                <p className="text-xs text-slate-400">Enable or disable advanced modules with immediate runtime reflection and audit logging.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {flags.map((flag: any) => (
                <div
                  key={flag.key}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-white">{flag.name}</h4>
                      <span className="text-[10px] font-mono text-slate-500">{flag.key}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{flag.description}</p>
                    <span className="text-[10px] text-purple-300 font-semibold mt-1 inline-block">
                      Rollout: {flag.rolloutPercent}%
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleFlag(flag.key, flag.isEnabled)}
                    className={`p-1.5 rounded-xl transition ${
                      flag.isEnabled ? "text-emerald-400 hover:text-emerald-300" : "text-slate-600 hover:text-slate-500"
                    }`}
                    title={flag.isEnabled ? "Disable Feature" : "Enable Feature"}
                  >
                    {flag.isEnabled ? (
                      <ToggleRight className="w-8 h-8 fill-emerald-500/20" />
                    ) : (
                      <ToggleLeft className="w-8 h-8" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Financial Ledger Audit */}
        {activeTab === "LEDGER" && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <span>Financial Ledger &amp; Marketplace Reconciliation</span>
                </h3>
                <p className="text-xs text-slate-400">Double-entry monetary entries for payments, partner settlements, commissions, and refunds.</p>
              </div>
            </div>

            {ledgerSummary && (
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Gross Settlement Inflow</span>
                  <p className="text-lg font-black text-white mt-0.5">₹{ledgerSummary.totalInflow}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Platform Commissions</span>
                  <p className="text-lg font-black text-amber-400 mt-0.5">₹{ledgerSummary.platformCommission}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Dispute Refunds Debited</span>
                  <p className="text-lg font-black text-rose-400 mt-0.5">₹{ledgerSummary.refundsDebited}</p>
                </div>
              </div>
            )}

            <div className="divide-y divide-slate-800 max-h-[400px] overflow-y-auto">
              {ledgerEntries.map((e: any) => (
                <div key={e.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-300">{e.type}</span>
                    <p className="text-[10px] text-slate-500">{e.reference}</p>
                  </div>
                  <span className={`font-mono font-bold ${e.amount >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {e.amount >= 0 ? `+₹${e.amount}` : `-₹${Math.abs(e.amount)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
