"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Check } from "lucide-react";

export default function PricingPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && session?.user;
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Okleevo" className="h-10 w-auto" />
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
            </div>
          </div>
        </div>
      </nav>

      {/* Pricing Hero */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            One price. All features. No hidden fees. Cancel anytime.
          </p>
          <p className="text-lg text-primary-600 font-semibold">
            Save up to £500/month by replacing multiple tools
          </p>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-accent-600 px-8 py-6 text-center">
              <h2 className="text-3xl font-bold text-white mb-2">All-in-One Plan</h2>
              <p className="text-white/90">Everything your SME needs</p>
            </div>

            <div className="p-12">
              {/* Price */}
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-6xl font-bold text-gray-900">£19.99</span>
                  <span className="text-2xl text-gray-600">/month</span>
                </div>
                <p className="text-gray-600 mb-8">Billed monthly • Cancel anytime</p>
                
                <Link
                  href="/auth"
                  className="inline-block px-12 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  style={{ backgroundColor: '#fc6813' }}
                >
                  Start 14-Day Free Trial
                </Link>
                <p className="text-sm text-gray-500 mt-4">No credit card required</p>
              </div>

              {/* Features */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What's Included:</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "20 Integrated Business Modules",
                    "Unlimited Users",
                    "Unlimited Storage",
                    "AI-Powered Tools",
                    "Mini Invoicing System",
                    "Cashflow Snapshot",
                    "Expense Tracker",
                    "VAT Calculator",
                    "Lite CRM",
                    "Lead Forms Builder",
                    "Appointment Booking",
                    "Helpdesk System",
                    "Email Campaigns",
                    "Task Board",
                    "AI Content Generator",
                    "AI Note Taking",
                    "KPI Dashboard",
                    "Inventory Management",
                    "Supplier Tracker",
                    "HR Records",
                    "Employee Onboarding",
                    "E-Signature",
                    "Micro Pages",
                    "Compliance Reminders",
                    "Priority Support",
                    "Regular Updates",
                    "GDPR Compliant",
                    "UK Data Centers",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                        <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison */}
              <div className="mt-12 pt-12 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                  Compare: Traditional Approach vs Okleevo
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="p-6 bg-red-50 rounded-xl border border-red-200">
                    <h4 className="font-bold text-red-900 mb-4">Multiple Tools</h4>
                    <ul className="space-y-2 text-sm text-red-800">
                      <li>• Invoicing: £15/month</li>
                      <li>• CRM: £25/month</li>
                      <li>• Project Management: £12/month</li>
                      <li>• Email Marketing: £20/month</li>
                      <li>• Accounting: £30/month</li>
                      <li>• HR Software: £18/month</li>
                      <li className="pt-2 border-t border-red-300 font-bold">Total: £120+/month</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200">
                    <h4 className="font-bold text-emerald-900 mb-4">Okleevo</h4>
                    <ul className="space-y-2 text-sm text-emerald-800">
                      <li>• All 20 Modules Included</li>
                      <li>• One Simple Login</li>
                      <li>• Unified Dashboard</li>
                      <li>• Seamless Integration</li>
                      <li>• No Data Silos</li>
                      <li>• Single Support Team</li>
                      <li className="pt-2 border-t border-emerald-300 font-bold text-lg">Total: £19.99/month</li>
                    </ul>
                  </div>
                </div>
                <p className="text-center mt-6 text-lg font-semibold text-emerald-600">
                  Save £100+/month with Okleevo
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
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
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-primary-600 to-accent-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Simplify Your Business?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join hundreds of UK SMEs already saving time and money with Okleevo
          </p>
          <Link
            href="/auth"
            className="inline-block px-12 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            style={{ backgroundColor: '#fc6813' }}
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.png" alt="Okleevo" className="h-10 w-auto" />
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
