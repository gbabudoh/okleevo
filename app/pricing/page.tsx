"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Check } from "lucide-react";
import { PricingFeatures } from "@/components/pricing-features";
import { PricingComparison } from "@/components/pricing-comparison";

const TIERS = [
  {
    id: "STARTER",
    label: "Starter Workspace",
    monthly: 49,
    annual: 39,
    seats: 5,
    seatAddon: 8,
    blurb: "Full Virtual HQ, task boards, and basic CRM for small distributed teams.",
    highlight: false,
  },
  {
    id: "GROWTH",
    label: "Growth Workspace",
    monthly: 99,
    annual: 79,
    seats: 12,
    seatAddon: 10,
    blurb: "Everything in Starter, plus AI transcription, helpdesk, and e-signatures.",
    highlight: true,
  },
  {
    id: "SCALE",
    label: "Scale Workspace",
    monthly: 199,
    annual: 159,
    seats: 25,
    seatAddon: 12,
    blurb: "Everything in Growth, plus white-labelling and multi-region campaigns.",
    highlight: false,
  },
] as const;

export default function PricingPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && session?.user;
  const [period, setPeriod] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl -z-10 animate-blob" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-400/10 rounded-full blur-3xl -z-10 animate-blob animation-delay-2000" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-12 sm:h-16">
          <Link href="/" className="shrink-0 flex items-center">
            <Image src="/logo.png" alt="Okleevo" width={100} height={28} className="h-6 sm:h-8 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-500">
            <Link href="/#home" className="hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/#benefits" className="hover:text-gray-900 transition-colors">
              Benefits
            </Link>
            <Link href="/pricing" className="text-indigo-600 font-semibold">
              Pricing
            </Link>
            <Link href="/guide" className="hover:text-gray-900 transition-colors">
              User Guide
            </Link>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isLoggedIn ? (
               <Link
                  href="/dashboard"
                  className="text-xs sm:text-sm font-semibold text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all active:scale-95"
                  style={{ backgroundColor: '#fc6813' }}
                >
                  <span className="sm:hidden">Dashboard</span>
                  <span className="hidden sm:inline">Go to Dashboard</span>
                </Link>
            ) : (
              <>
                <Link
                  href="/access"
                  className="text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-900 px-2 sm:px-3 py-1.5 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/onboarding"
                  className="text-xs sm:text-sm font-semibold text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all active:scale-95"
                  style={{ backgroundColor: '#fc6813' }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Pricing Hero */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 font-medium text-sm mb-6 border border-primary-200">
             Borderless, Global Pricing
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Three plans. Every plan includes the full Virtual HQ. <br className="hidden md:block"/>
            Replace Slack + Zoom + Calendly + Asana for a fraction of the cost.
          </p>
        </div>
      </section>

      {/* Pricing Card & Features */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Main Glass Card */}
          <div className="relative rounded-[2.5rem] border border-white/60 bg-white/40 backdrop-blur-2xl shadow-2xl overflow-hidden p-8 md:p-12">
             <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-50" />

             {/* Billing period toggle */}
             <div className="flex justify-center mb-10">
               <div className="inline-flex items-center bg-white/80 border border-gray-200 rounded-full p-1 text-sm font-semibold">
                 <button
                   type="button"
                   onClick={() => setPeriod("monthly")}
                   className={`px-5 py-2 rounded-full transition-colors ${period === "monthly" ? "bg-gray-900 text-white" : "text-gray-500"}`}
                 >
                   Monthly
                 </button>
                 <button
                   type="button"
                   onClick={() => setPeriod("annual")}
                   className={`px-5 py-2 rounded-full transition-colors ${period === "annual" ? "bg-gray-900 text-white" : "text-gray-500"}`}
                 >
                   Annual <span className="text-emerald-600">· save ~20%</span>
                 </button>
               </div>
             </div>

             {/* Three tiers */}
             <div className="grid md:grid-cols-3 gap-6 mb-4">
               {TIERS.map((tier) => {
                 const price = period === "monthly" ? tier.monthly : tier.annual;
                 return (
                   <div
                     key={tier.id}
                     className={`relative rounded-3xl p-8 flex flex-col border ${
                       tier.highlight
                         ? "border-orange-300 bg-white shadow-xl scale-[1.02]"
                         : "border-gray-200 bg-white/70"
                     }`}
                   >
                     {tier.highlight && (
                       <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-orange-500 text-white text-xs font-bold uppercase tracking-wide rounded-full shadow">
                         Flagship
                       </span>
                     )}
                     <h2 className="text-xl font-bold text-gray-900">{tier.label}</h2>
                     <p className="text-gray-500 text-sm mt-2 mb-6 min-h-[40px]">{tier.blurb}</p>
                     <div className="flex items-end gap-1 mb-1">
                       <span className="text-5xl font-bold text-gray-900 tracking-tighter">${price}</span>
                       <span className="text-gray-500 mb-1.5">/mo</span>
                     </div>
                     <p className="text-xs text-gray-500 mb-6">
                       {tier.seats} seats included · +${tier.seatAddon}/seat/mo after that
                     </p>
                     <Link
                       href="/onboarding"
                       className={`mt-auto inline-flex items-center justify-center px-6 py-3.5 rounded-full font-bold text-sm transition-all duration-300 ${
                         tier.highlight
                           ? "text-white shadow-lg shadow-orange-500/20 hover:shadow-xl hover:scale-105"
                           : "text-gray-900 bg-gray-100 hover:bg-gray-200"
                       }`}
                       style={tier.highlight ? { backgroundColor: '#fc6813' } : undefined}
                     >
                       Start Free Trial
                     </Link>
                   </div>
                 );
               })}
             </div>

             <div className="flex items-center justify-center gap-6 mt-6 mb-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-500" /> Cancel anytime</span>
                <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-500" /> No credit card required</span>
                <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-500" /> 14-day free trial</span>
             </div>

             {/* Categorized Features */}
             <PricingFeatures />
             
             {/* Comparison Chart */}
             <PricingComparison />

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-24 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto pt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes! You can cancel your subscription at any time. No long-term contracts or cancellation fees."
              },
              {
                q: "Is there a free trial?",
                a: "Yes, we offer a 14-day free trial with full access to your chosen plan. No credit card required to start."
              },
              {
                q: "What happens if my team grows past my plan's seat count?",
                a: "Extra seats beyond your plan's allotment are billed per seat, per month — you're never blocked from adding a new team member."
              },
              {
                q: "Do my clients need an account to book or join a call?",
                a: "No. Clients book through your branded public page, upload files to an isolated, malware-scanned bucket, and join with a one-time access code — zero login required."
              },
              {
                q: "Can I upgrade or downgrade?",
                a: "Yes, switch between Starter, Growth, and Scale at any time from your billing settings — your seat count carries over automatically."
              },
              {
                q: "Do you offer refunds?",
                a: "Yes, if you're not satisfied within the first 30 days, we'll provide a full refund, no questions asked."
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
             <Image src="/logo.png" alt="Okleevo" width={150} height={40} className="h-10 w-auto" />
          </Link>
          <p className="text-gray-500 mb-4">Starter, Growth, and Scale — plans that grow with your distributed team.</p>
          <p className="text-sm text-indigo-400 font-bold mb-8">
            Starts at 5 seats – add seats one at a time as your team grows, on any plan.
          </p>
          <p className="text-gray-400 mb-6">
            The borderless workspace for distributed teams and global agencies
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/guide" className="hover:text-white transition-colors">User Guide</Link>
            <Link 
              href={isLoggedIn ? "/dashboard/helpdesk" : "/support"} 
              className="hover:text-white transition-colors"
            >
              Support
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            © 2024 Okleevo. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
