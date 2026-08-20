"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, Shield, Zap, Sparkles, CheckCircle2, Lock } from "lucide-react";

export function EnterpriseHero() {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-gradient-to-b from-orange-50/60 via-white to-slate-50/40 text-slate-900">
      {/* Background ambient radial orange lighting glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[450px] bg-gradient-to-tr from-orange-400/25 via-amber-300/15 to-orange-200/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      
      {/* Fine light dot matrix background */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Category Pill */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
          <span>Next-Gen Enterprise B2B Engine</span>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.08]"
        >
          <span className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-700 bg-clip-text text-transparent">
            One Unified Workspace for Modern Remote Teams
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed"
        >
          Okleevo consolidates high-speed team chat, instant video huddles, async CRM pipeline management, 
          AI meeting summaries, and malware-scanned client storage into one borderless enterprise interface.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none"
        >
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-semibold text-sm shadow-[0_6px_25px_rgba(252,104,19,0.35)] hover:shadow-[0_8px_35px_rgba(252,104,19,0.5)] transition-all duration-300 active:scale-95 group"
          >
            <span>Start 14-Day Free Trial</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#demo"
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 rounded-full bg-white border border-slate-200 text-slate-800 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm active:scale-95 group"
          >
            <Play className="w-4 h-4 mr-2 text-orange-500 fill-orange-500 group-hover:scale-110 transition-transform" />
            <span>Interactive Demo Flow</span>
          </a>
        </motion.div>

        {/* Micro Trust Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 font-semibold"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>SOC2 Type II Certified</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>Zero-Trust Encrypted Storage</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-600" />
            <span>5-Minute Onboarding</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
