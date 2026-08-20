"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2, Clock, CreditCard, Shield, Zap,
  ArrowRight, LayoutDashboard, AlertCircle, RefreshCw, X, ArrowLeft,
} from "lucide-react";

type SubInfo = {
  status: string;
  isActive: boolean;
  daysLeft: number | null;
  trialEnd: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  amount: number;
};

const FEATURES = [
  "Team Chat & Huddles",
  "Tasks",
  "Notes",
  "KPI Dashboard",
  "Projects",
  "CRM Pipeline",
  "Booking Pages",
  "Mail Engine",
  "Helpdesk",
  "E-Signatures",
  "Campaigns",
];

function BillingContent() {
  const searchParams = useSearchParams();
  const [sub, setSub] = useState<SubInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const success = searchParams.get("success") === "true";
  const cancelled = searchParams.get("cancelled") === "true";

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      setLoading(true);
      const res = await fetch("/api/billing/status");
      if (res.ok) setSub(await res.json());
    } catch {
      setError("Failed to load subscription status.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe() {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create checkout");
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleManage() {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to open portal");
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  const isExpired =
    sub &&
    sub.status === "TRIAL" &&
    (sub.daysLeft === 0 || !sub.isActive);

  const needsPayment =
    sub &&
    (isExpired || sub.status === "CANCELED" || sub.status === "PAST_DUE");

  const isActive = sub?.status === "ACTIVE";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[100px] animate-blob mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-400/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply" />
      </div>

      <div className="w-full max-w-lg relative z-10 space-y-4">
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between px-1">
          <Link
            href="/dashboard/settings?tab=billing"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 hover:text-orange-600 transition-colors bg-white/60 hover:bg-white px-3.5 py-2 rounded-2xl border border-slate-200/80 shadow-2xs backdrop-blur-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
          <Link href="/dashboard/settings?tab=billing" className="shrink-0">
            <Image src="/logo.png" alt="Okleevo" width={130} height={34} className="h-8 w-auto" />
          </Link>
        </div>

        {/* Success banner */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-800 text-sm">Subscription activated!</p>
              <p className="text-emerald-600 text-xs mt-0.5">Welcome aboard. You now have full access to Okleevo.</p>
            </div>
          </motion.div>
        )}

        {/* Cancelled banner */}
        {cancelled && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl"
          >
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm font-medium text-amber-700">Payment cancelled. You can subscribe anytime below.</p>
          </motion.div>
        )}

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden relative"
        >
          {/* Header stripe */}
          <div className="bg-gradient-to-r from-orange-500 to-[#ff8c42] px-8 py-6 text-white relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs font-mono font-extrabold uppercase tracking-widest mb-1">Monthly Plan</p>
                <h1 className="text-4xl font-black font-mono tracking-tight">£9.99</h1>
                <p className="text-orange-100 text-xs font-bold mt-1">per month · cancel anytime</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xs">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <Link
                  href="/dashboard/settings?tab=billing"
                  title="Return to Subscription Settings"
                  aria-label="Return to Subscription Settings"
                  className="w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all shadow-2xs backdrop-blur-sm cursor-pointer active:scale-95 border border-white/30"
                >
                  <X className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Status pill */}
            {!loading && sub && (
              <div className="mb-6">
                {sub.status === "TRIAL" && sub.isActive && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200/60 text-amber-700 rounded-full w-fit text-xs font-mono font-extrabold uppercase">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>
                      {sub.daysLeft === 1 ? "1 day left" : `${sub.daysLeft} days`} remaining in free trial
                    </span>
                  </div>
                )}
                {isExpired && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200/60 text-rose-700 rounded-full w-fit text-xs font-mono font-extrabold uppercase">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    <span>Your free trial has ended</span>
                  </div>
                )}
                {isActive && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200/60 text-emerald-700 rounded-full w-fit text-xs font-mono font-extrabold uppercase">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>
                      Subscription Active
                      {sub.cancelAtPeriodEnd && sub.currentPeriodEnd
                        ? ` · cancels ${new Date(sub.currentPeriodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                        : sub.currentPeriodEnd
                        ? ` · renews ${new Date(sub.currentPeriodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                        : ""}
                    </span>
                  </div>
                )}
                {sub.status === "PAST_DUE" && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200/60 text-rose-700 rounded-full w-fit text-xs font-mono font-extrabold uppercase">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    <span>Payment failed — please update your payment method</span>
                  </div>
                )}
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-7">
              {FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2 p-2 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                  <div className="w-4 h-4 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs text-slate-800 font-extrabold truncate">{f}</span>
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200/60 rounded-2xl text-xs font-bold text-rose-700">
                {error}
              </div>
            )}

            {/* CTA */}
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="w-5 h-5 text-orange-500 animate-spin" />
              </div>
            ) : isActive && !sub?.cancelAtPeriodEnd ? (
              <button
                onClick={handleManage}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-extrabold text-base border-2 border-slate-200 text-slate-700 hover:border-orange-400 hover:text-orange-600 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                <CreditCard className="w-5 h-5" />
                {actionLoading ? "Opening portal..." : "Manage Subscription"}
              </button>
            ) : isActive && sub?.cancelAtPeriodEnd ? (
              <button
                onClick={handleManage}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-extrabold text-base bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-5 h-5" />
                {actionLoading ? "Opening portal..." : "Resume Subscription"}
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-extrabold text-base bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg shadow-orange-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <CreditCard className="w-5 h-5" />
                {actionLoading ? "Redirecting to Stripe..." : needsPayment ? "Subscribe for $39/month" : "Start Subscription · $39/mo"}
                {!actionLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            )}

            {/* Fine print */}
            <div className="mt-4 flex items-center justify-center gap-3 text-xs font-mono font-bold text-slate-400">
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-orange-500" /> Secured by Stripe</span>
              <span>·</span>
              <span>Cancel anytime</span>
              <span>·</span>
              <span>No lock-in</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense>
      <BillingContent />
    </Suspense>
  );
}
