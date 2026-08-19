"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Globe2,
  Users,
  Calendar,
  Sparkles,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { InternalHqMock } from "@/components/product-demo/InternalHqMock";

const featureCards = [
  { icon: Calendar,    text: "Frictionless Client Bookings — zero-login for guests", color: "text-orange-500", bg: "bg-orange-50" },
  { icon: ShieldCheck, text: "Secure, Isolated File Uploads",                       color: "text-emerald-500", bg: "bg-emerald-50" },
  { icon: Sparkles,    text: "AI Meeting Transcription & Task Extraction",          color: "text-purple-500", bg: "bg-purple-50" },
  { icon: Globe2,      text: "Built for Distributed Teams, Not One Timezone",       color: "text-blue-500",   bg: "bg-blue-50" },
  { icon: Users,       text: "Team Huddles Included — No Extra Zoom or Slack",      color: "text-indigo-500", bg: "bg-indigo-50" },
];

// A static, non-interactive snapshot of the real dashboard — reuses the same
// InternalHqMock component as the interactive Product Demo Simulator below,
// so the hero preview matches the actual product instead of an invented
// aesthetic. pointer-events-none since this is a passive preview, not a demo.
function HeroPreview() {
  return (
    <div className="relative w-[600px] h-[420px] bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden pointer-events-none">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-100 bg-white">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
      </div>
      <div className="absolute inset-0 top-[41px]">
        <InternalHqMock />
      </div>
    </div>
  );
}

export function HeroAnimation() {
  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">

      {/* ── Text – first on mobile, right column on desktop ── */}
      <motion.div
        className="order-1 lg:order-2 space-y-5 lg:space-y-8 text-center lg:text-left"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <motion.h2
          className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          The Borderless Workspace<br />for Distributed Teams
        </motion.h2>

        <motion.p
          className="text-sm sm:text-base lg:text-xl text-gray-600 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          Bring your global virtual office, async project management, and frictionless client engagement under one single roof. Ditch the costly Slack + Zoom + Asana stack.
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          className="flex flex-col sm:flex-row items-center lg:items-start gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
        >
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-white font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#fc6813' }}
          >
            Start Your Borderless Workspace
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs sm:text-sm text-gray-500">No credit card required · 14-day free trial</p>
        </motion.div>

        {/* Mobile: compact 2-col chips */}
        <motion.div
          className="grid grid-cols-2 gap-2 lg:hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {featureCards.map((f, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className={`p-1.5 ${f.bg} rounded-lg shrink-0`}>
                <f.icon className={`w-3.5 h-3.5 ${f.color}`} />
              </div>
              <span className="text-[11px] font-semibold text-gray-700 leading-tight">{f.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Desktop: full cards */}
        <div className="hidden lg:block space-y-4">
          {featureCards.map((feature, i) => (
            <motion.div key={i}
              className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className={`p-3 ${feature.bg} rounded-lg`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <span className="text-lg font-medium text-gray-800">{feature.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Preview – second on mobile, left column on desktop ── */}
      <div className="order-2 lg:order-1 relative w-full h-[220px] sm:h-[300px] lg:h-[500px] overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="scale-[0.48] sm:scale-[0.65] md:scale-[0.78] lg:scale-100 origin-center transition-transform">
            <HeroPreview />
          </div>
        </motion.div>
      </div>

    </div>
  );
}
