"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Check } from "lucide-react";
import { PricingFeatures } from "@/components/pricing-features";
import { PricingComparison } from "@/components/pricing-comparison";

export default function PricingPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && session?.user;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl -z-10 animate-blob" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-400/10 rounded-full blur-3xl -z-10 animate-blob animation-delay-2000" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Okleevo" width={150} height={40} className="h-10 w-auto" />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/#home" className="text-gray-700 hover:text-primary-600 transition-colors">
                Home
              </Link>
              <Link href="/#benefits" className="text-gray-700 hover:text-primary-600 transition-colors">
                Benefits
              </Link>
              <Link href="/pricing" className="text-primary-600 font-medium">
                Pricing
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                 <Link 
                    href="/dashboard" 
                    className="px-6 py-2.5 rounded-full text-white font-medium hover:shadow-lg transition-all hover-lift"
                    style={{ backgroundColor: '#fc6813' }}
                  >
                    Go to Dashboard
                  </Link>
              ) : (
                <>
                  <Link 
                    href="/access" 
                    className="px-4 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/onboarding" 
                    className="px-6 py-2.5 rounded-full text-white font-medium hover:shadow-lg transition-all hover-lift"
                    style={{ backgroundColor: '#fc6813' }}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Pricing Hero */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 font-medium text-sm mb-6 border border-primary-200">
             For UK SMEs
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            One price. All features. No hidden fees. <br className="hidden md:block"/>
            Replace your entire tech stack for less than the cost of a team lunch.
          </p>
        </div>
      </section>

      {/* Pricing Card & Features */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Main Glass Card */}
          <div className="relative rounded-[2.5rem] border border-white/60 bg-white/40 backdrop-blur-2xl shadow-2xl overflow-hidden p-8 md:p-12">
             <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-50" />
             
             {/* Price Header */}
             <div className="text-center mb-12">
               <h2 className="text-3xl font-bold text-gray-900 mb-2">PRO All-In-One</h2>
               <p className="text-gray-500 mb-8">Everything included. Unlimited Users.</p>
               
               <div className="flex items-center justify-center gap-1 mb-6">
                  <span className="text-4xl text-gray-400 font-light line-through decoration-red-500/50 decoration-2 mr-4">£120+</span>
                  <span className="text-7xl font-bold text-gray-900 tracking-tighter">£19.99</span>
                  <span className="text-xl text-gray-500 self-end mb-2">/mo</span>
               </div>
               
               <Link
                  href="/onboarding"
                  className="inline-block px-12 py-5 rounded-full text-white font-bold text-lg shadow-xl shadow-orange-500/20 hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  style={{ backgroundColor: '#fc6813' }}
                >
                  Start 14-Day Free Trial
                </Link>
                <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
                   <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-500" /> Cancel anytime</span>
                   <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-500" /> No credit card required</span>
                </div>
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
                a: "Yes, we offer a 14-day free trial with full access to all features. No credit card required to start."
              },
              {
                q: "How many users can I add?",
                a: "Unlimited! Add as many team members as you need at no extra cost."
              },
              {
                q: "Is my data secure?",
                a: "Absolutely. We use enterprise-grade security, UK-based data centers, and are fully GDPR compliant."
              },
              {
                q: "Can I upgrade or downgrade?",
                a: "We have one simple plan that includes everything. No need to worry about upgrades or feature limitations."
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
          <p className="text-gray-400 mb-6">
            The all-in-one business platform designed specifically for UK SMEs
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
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
