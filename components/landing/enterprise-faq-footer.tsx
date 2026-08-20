"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

export function EnterpriseFaqFooter() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How much does Okleevo cost?",
      a: "Okleevo offers a $0.00 Free Forever tier (1 seat), with Starter at $39/month (5 seats), Growth (Flagship) at $79/month (12 seats), and Scale at $159/month (25 seats). Annual billing saves ~20%. Custom seat expansions are available for larger teams."
    },
    {
      q: "Do my clients need an Okleevo account to book or upload files?",
      a: "No! Clients book through your branded public booking link, upload files directly into isolated, malware-scanned storage buckets, and join video huddles via a one-time access code — zero signup required."
    },
    {
      q: "Is Okleevo built for distributed, global teams?",
      a: "Yes. Okleevo is a borderless workspace combining real-time WebRTC voice huddles, timezone-aware Kanban boards, AI meeting transcription, and zero-trust file vaults into one unified engine."
    },
    {
      q: "How does the zero-trust malware scanning work?",
      a: "Every file uploaded to your client portal is automatically streamed through an isolated ClamAV malware inspection container before being committed to your encrypted AES-256 cloud bucket."
    }
  ];

  return (
    <footer className="bg-gradient-to-b from-white via-orange-50/30 to-slate-100 text-slate-900 border-t border-slate-200 pt-20 pb-12 relative overflow-hidden">
      {/* Background radial accent glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-orange-200/20 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* FAQ Accordion Section */}
        <div className="max-w-3xl mx-auto mb-24">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-700 bg-orange-100 border border-orange-200 px-3 py-1 rounded-full shadow-sm">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-4 text-slate-900">
              Got Questions? We’ve Got Answers.
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? "bg-white border-2 border-orange-500 shadow-md"
                      : "bg-white border border-slate-200 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between font-bold text-sm text-slate-900 hover:text-orange-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-orange-600" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 font-normal"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-200">
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Okleevo"
                width={110}
                height={30}
                className="h-7 w-auto"
              />
            </Link>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              The borderless enterprise engine for modern remote teams, agencies, and high-velocity SaaS operations.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full w-fit font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </div>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3">Product</h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li><Link href="#demo" className="hover:text-orange-600 transition">Interactive Demo</Link></li>
              <li><Link href="#features" className="hover:text-orange-600 transition">Tools</Link></li>
              <li><Link href="#workflow" className="hover:text-orange-600 transition">Workflow Simulator</Link></li>
              <li><Link href="/pricing" className="hover:text-orange-600 transition">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3">Resources</h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li><Link href="/guide" className="hover:text-orange-600 transition">Documentation</Link></li>
              <li><Link href="/guide" className="hover:text-orange-600 transition">API Reference</Link></li>
              <li><Link href="/guide" className="hover:text-orange-600 transition">Security & Compliance</Link></li>
              <li><Link href="/guide" className="hover:text-orange-600 transition">System Status</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3">Company</h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li><Link href="/pricing" className="hover:text-orange-600 transition">Enterprise Sales</Link></li>
              <li><Link href="/access" className="hover:text-orange-600 transition">Sign In</Link></li>
              <li><Link href="/onboarding" className="hover:text-orange-600 transition">Create Account</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Rights Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium gap-4">
          <p>© {new Date().getFullYear()} Okleevo Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/guide" className="hover:text-slate-900 transition">Privacy Policy</Link>
            <Link href="/guide" className="hover:text-slate-900 transition">Terms of Service</Link>
            <Link href="/guide" className="hover:text-slate-900 transition">SOC2 Security</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
