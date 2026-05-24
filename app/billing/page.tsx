"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2, Clock, CreditCard, Shield, Zap,
  ArrowRight, LayoutDashboard, AlertCircle, RefreshCw,
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
  "Invoicing & Accounting",
  "CRM & Customer Management",
  "AI Content & Notes",
  "HR Records & Compliance",
  "Inventory & Suppliers",
  "Helpdesk & Forms",
  "Email Campaigns",
  "E-Signature & Micro Pages",
  "KPI Dashboard & Cashflow",
  "20+ integrated modules",
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
        {/* Logo */}
        <div className="text-center mb-2">
          <Link href="/dashboard">
            <Image src="/logo.png" alt="Okleevo" width={140} height={36} className="h-9 w-auto mx-auto" />
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
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
        >
          {/* Header stripe */}
          <div className="bg-gradient-to-r from-orange-500 to-[#ff8c42] px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-1">Monthly Plan</p>
                <h1 className="text-3xl font-black tracking-tight">£9.99</h1>
                <p className="text-orange-100 text-sm mt-0.5">per month · cancel anytime</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <Zap className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Status pill */}
            {!loading && sub && (
              <div className="mb-6">
                {sub.status === "TRIAL" && sub.isActive && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl w-fit">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold text-blue-700">
                      {sub.daysLeft === 1 ? "1 day left" : `${sub.daysLeft} days`} remaining in free trial
                    </span>
                  </div>
                )}
                {isExpired && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl w-fit">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-semibold text-red-700">Your free trial has ended</span>
                  </div>
                )}
                {isActive && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl w-fit">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-700">
                      Subscription active
                      {sub.cancelAtPeriodEnd && sub.currentPeriodEnd
                        ? ` · cancels ${new Date(sub.currentPeriodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                        : sub.currentPeriodEnd
                        ? ` · renews ${new Date(sub.currentPeriodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                        : ""}
                    </span>
                  </div>
                )}
                {sub.status === "PAST_DUE" && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl w-fit">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-semibold text-red-700">Payment failed — please update your payment method</span>
                  </div>
                )}
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 mb-7">
              {FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{f}</span>
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {/* CTA */}
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
              </div>
            ) : isActive && !sub?.cancelAtPeriodEnd ? (
              <button
                onClick={handleManage}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg border-2 border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-600 transition-all disabled:opacity-50"
              >
                <CreditCard className="w-5 h-5" />
                {actionLoading ? "Opening portal..." : "Manage Subscription"}
              </button>
            ) : isActive && sub?.cancelAtPeriodEnd ? (
              <button
                onClick={handleManage}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-orange-500 to-[#ff8c42] text-white shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                <RefreshCw className="w-5 h-5" />
                {actionLoading ? "Opening portal..." : "Resume Subscription"}
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-orange-500 to-[#ff8c42] text-white shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                <CreditCard className="w-5 h-5" />
                {actionLoading ? "Redirecting to Stripe..." : needsPayment ? "Subscribe for £9.99/month" : "Start Subscription · £9.99/mo"}
                {!actionLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            )}

            {/* Fine print */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secured by Stripe</span>
              <span>·</span>
              <span>Cancel anytime</span>
              <span>·</span>
              <span>No lock-in</span>
            </div>
          </div>
        </motion.div>

        {/* Back to dashboard */}
        {(isActive || (sub?.status === "TRIAL" && sub?.isActive)) && (
          <div className="text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-orange-600 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        )}
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
