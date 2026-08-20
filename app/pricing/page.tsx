"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Check, Sparkles, Shield, Zap } from "lucide-react";
import { EnterpriseNav } from "@/components/landing/enterprise-nav";
import { EnterpriseFaqFooter } from "@/components/landing/enterprise-faq-footer";
import { PricingFeatures } from "@/components/pricing-features";
import { PricingComparison } from "@/components/pricing-comparison";

const TIERS = [
  {
    id: "FREE",
    label: "Free Forever",
    monthly: 0,
    annual: 0,
    seats: 1,
    seatAddon: 0,
    blurb: "Tasks, Notes, 1 Booking Link, and 1-on-1 Chat for solo founders & micro leads.",
    highlight: false,
    badge: "Freemium",
  },
  {
    id: "STARTER",
    label: "Starter Workspace",
    monthly: 39,
    annual: 29,
    seats: 5,
    seatAddon: 8,
    blurb: "Full Virtual HQ, task boards, and standard CRM for small distributed teams.",
    highlight: false,
  },
  {
    id: "GROWTH",
    label: "Growth Workspace",
    monthly: 79,
    annual: 59,
    seats: 12,
    seatAddon: 10,
    blurb: "Everything in Starter, plus AI transcription, helpdesk, and e-signatures.",
    highlight: true,
    badge: "Flagship",
  },
  {
    id: "SCALE",
    label: "Scale Workspace",
    monthly: 159,
    annual: 129,
    seats: 25,
    seatAddon: 12,
    blurb: "Everything in Growth, plus white-labelling and multi-region campaigns.",
    highlight: false,
  },
] as const;

export default function PricingPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = Boolean(status === "authenticated" && session?.user);
  const [period, setPeriod] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500 selection:text-white">
      {/* Top Header Navigation */}
      <EnterpriseNav isLoggedIn={isLoggedIn} />

      {/* Pricing Hero */}
      <section className="pt-36 sm:pt-44 pb-12 px-4 sm:px-6 relative overflow-hidden">
        {/* Background Radial Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-orange-400/15 via-amber-300/10 to-indigo-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-200/80 dark:border-orange-900/40 text-orange-600 dark:text-orange-400 font-mono font-extrabold text-xs uppercase tracking-wider mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            Borderless, Global Pricing
          </span>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-base sm:text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
            Start for <strong className="text-slate-900 dark:text-white font-mono">$0 Free Forever</strong> or upgrade to unlock all 11 core tools.
            <br className="hidden md:block" /> Replace Slack + Zoom + Calendly + Asana for a fraction of the cost.
          </p>
        </div>
      </section>

      {/* Pricing Grid & Controls */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Main Container */}
          <div className="relative rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl shadow-2xl overflow-hidden p-6 sm:p-10 md:p-12">
            
            {/* Billing period toggle */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-1 text-xs font-extrabold shadow-2xs">
                <button
                  type="button"
                  onClick={() => setPeriod("monthly")}
                  className={`px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
                    period === "monthly"
                      ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-2xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod("annual")}
                  className={`px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
                    period === "annual"
                      ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-2xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Annual <span className="text-emerald-500 dark:text-emerald-400">· save ~20%</span>
                </button>
              </div>
            </div>

            {/* 4 Tier Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {TIERS.map((tier) => {
                const price = period === "monthly" ? tier.monthly : tier.annual;
                return (
                  <div
                    key={tier.id}
                    className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between border transition-all shadow-2xs ${
                      tier.highlight
                        ? "border-orange-400/90 bg-white dark:bg-slate-950 shadow-md ring-1 ring-orange-500/30"
                        : "border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div>
                      {"badge" in tier && tier.badge && (
                        <span className="inline-block px-3 py-0.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-[10px] font-mono font-extrabold uppercase tracking-wide rounded-full mb-4 shadow-2xs">
                          {tier.badge}
                        </span>
                      )}
                      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">{tier.label}</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-2 mb-6 min-h-[44px] leading-relaxed">
                        {tier.blurb}
                      </p>
                      
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-4xl sm:text-5xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
                          ${price}
                        </span>
                        <span className="text-xs font-bold text-slate-400">/mo</span>
                      </div>

                      <p className="text-xs font-mono font-bold text-slate-400 mb-6">
                        {tier.id === "FREE"
                          ? "1 seat included · Free forever"
                          : `${tier.seats} seats included · +$${tier.seatAddon}/seat/mo`}
                      </p>
                    </div>

                    <Link
                      href={isLoggedIn ? "/dashboard" : tier.id === "FREE" ? "/auth/register" : "/auth/register"}
                      className={`w-full inline-flex items-center justify-center px-5 py-3 rounded-2xl font-extrabold text-xs transition-all cursor-pointer active:scale-95 ${
                        tier.highlight
                          ? "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-500/20"
                          : tier.id === "FREE"
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800"
                      }`}
                    >
                      {isLoggedIn ? "Go to Dashboard" : tier.id === "FREE" ? "Get Started Free" : "Start Free Trial"}
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Micro guarantees */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 mb-6 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Cancel anytime</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> No credit card for $0.00 Free plan</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> 14-day free trial on paid plans</span>
            </div>

            {/* Categorized Features */}
            <PricingFeatures />
            
            {/* Comparison Chart */}
            <PricingComparison />

          </div>
        </div>
      </section>

      {/* Footer & FAQ */}
      <EnterpriseFaqFooter />
    </div>
  );
}
