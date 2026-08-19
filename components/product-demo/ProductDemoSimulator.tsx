"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ShieldCheck, Globe2 } from "lucide-react";
import { InternalHqMock } from "./InternalHqMock";
import { ExternalPortalMock } from "./ExternalPortalMock";

type Layer = "internal" | "external";

/**
 * Public homepage product simulator — entirely scripted/fixture-driven (see
 * ./fixtures.ts). No API calls, no auth, no real workspace data: this sits
 * on the fully public homepage, so it must never touch a real
 * business/appointment/chat row.
 *
 * Deliberately matches the real dashboard's actual light theme and real
 * component styling (chat bubbles, Kanban cards, the real booking page) —
 * this is meant to look like the product, not an invented mockup aesthetic.
 */
export function ProductDemoSimulator() {
  const [activeLayer, setActiveLayer] = useState<Layer>("internal");
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Toggle controls */}
      <div className="flex justify-center gap-3 mb-6 px-4">
        <button
          type="button"
          onClick={() => setActiveLayer("internal")}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
            activeLayer === "internal"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
              : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Layer 1: Private HQ
        </button>
        <button
          type="button"
          onClick={() => setActiveLayer("external")}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
            activeLayer === "external"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
              : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <Globe2 className="w-4 h-4" />
          Layer 2: Client Portal
        </button>
      </div>

      {/* Demo container — an app window in the same light theme as the real dashboard */}
      <div className="relative w-full h-[480px] sm:h-[520px] bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-100 bg-white">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>

        <div className="absolute inset-0 top-[41px]">
          <AnimatePresence mode="wait">
            {activeLayer === "internal" ? (
              <motion.div
                key="internal"
                initial={shouldReduceMotion ? undefined : { opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, x: 16 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <InternalHqMock />
              </motion.div>
            ) : (
              <motion.div
                key="external"
                initial={shouldReduceMotion ? undefined : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, x: -16 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <ExternalPortalMock />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        A live look at what your team sees vs. what your clients see — completely separate, by design.
      </p>
    </div>
  );
}
