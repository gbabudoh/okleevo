"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";

export function EnterprisePricing() {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: "Starter Workspace",
      priceMonthly: 49,
      priceAnnual: 39,
      seats: "Up to 5 Seats Included",
      description: "Ideal for boutique agencies & small remote teams getting started.",
      features: [
        "Full Team Chat & Instant Huddles",
        "CRM Board (Up to 100 Active Deals)",
        "Zero-Trust Storage (100 GB)",
        "Client Public Booking Link",
        "Standard Email Support",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Growth Workspace",
      priceMonthly: 99,
      priceAnnual: 79,
      seats: "Up to 12 Seats Included",
      description: "Built for scaling B2B teams requiring AI automation & malware scanning.",
      features: [
        "Everything in Starter",
        "Unlimited CRM Pipelines",
        "AI Meeting Intelligence & Transcripts",
        "Zero-Trust Malware Scanning (1 TB)",
        "Stripe Automated Invoicing",
        "Priority 24/7 Support",
      ],
      cta: "Start 14-Day Free Trial",
      popular: true,
    },
    {
      name: "Scale Workspace",
      priceMonthly: 199,
      priceAnnual: 159,
      seats: "Up to 25 Seats Included",
      description: "For high-velocity enterprise teams needing SOC2 compliance & custom SLA.",
      features: [
        "Everything in Growth",
        "Custom Seat Expansion Packs",
        "Zero-Trust Malware Scanning (5 TB)",
        "Dedicated Success Manager",
        "99.99% Guaranteed SLA",
        "Custom SAML / SSO Integration",
      ],
      cta: "Contact Enterprise Sales",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-slate-50 to-white text-slate-900 relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-700 bg-orange-100 border border-orange-200 px-3 py-1 rounded-full">
            Transparent Enterprise Billing
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-4 text-slate-900">
            Simple Plans. Unlimited Growth.
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            No hidden per-seat traps. Flat-rate workspaces designed for borderless performance.
          </p>

          {/* Billing Switch */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-xs font-bold ${!annual ? "text-slate-900" : "text-slate-500"}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative w-14 h-8 rounded-full bg-slate-200 border border-slate-300 p-1 transition duration-300"
            >
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`w-6 h-6 rounded-full ${annual ? "bg-orange-500 ml-6" : "bg-slate-500 ml-0"}`}
              />
            </button>
            <span className={`text-xs font-bold flex items-center gap-1.5 ${annual ? "text-slate-900" : "text-slate-500"}`}>
              Annual
              <span className="bg-orange-100 text-orange-700 border border-orange-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                SAVE 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => {
            const price = annual ? plan.priceAnnual : plan.priceMonthly;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative p-8 rounded-3xl backdrop-blur-xl flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? "bg-white border-2 border-orange-500 shadow-[0_8px_30px_rgba(252,104,19,0.25)] scale-105"
                    : "bg-white border border-slate-200 hover:border-slate-300 shadow-sm"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 min-h-[32px]">{plan.description}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-extrabold font-mono text-slate-900">${price}</span>
                    <span className="text-xs text-slate-500 font-medium">/ month</span>
                  </div>
                  <p className="text-[11px] text-orange-600 font-mono font-bold mt-1">{plan.seats}</p>

                  <ul className="mt-8 space-y-3 border-t border-slate-200 pt-6 text-xs text-slate-700 font-medium">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <Link
                    href="/onboarding"
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                      plan.popular
                        ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg hover:shadow-[0_6px_25px_rgba(252,104,19,0.4)]"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
