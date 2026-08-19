"use client";

import { motion } from "framer-motion";
import { UploadCloud, Lock, CalendarCheck } from "lucide-react";
import { externalPortalFixture } from "./fixtures";

/**
 * Mirrors the real public booking page (app/book/[businessId]/[slug]/page.tsx)
 * — same light theme, slot-picker treatment, and upload zone a real guest
 * actually sees, just scaled down for the demo window.
 */
export function ExternalPortalMock() {
  const f = externalPortalFixture;

  return (
    <div className="absolute inset-0 flex items-center justify-center p-6 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm p-5 bg-white rounded-3xl border border-white shadow-xl space-y-4"
      >
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wide border border-indigo-100">
            <CalendarCheck className="w-3 h-3" /> Book a Session
          </div>
          <h3 className="text-sm font-bold text-slate-900">{f.serviceName}</h3>
          <p className="text-xs text-slate-500">with {f.companyName}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
          <div className="p-2.5 bg-indigo-600 rounded-xl font-semibold text-white">{f.slots[0]}</div>
          <div className="p-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-500">{f.slots[1]}</div>
        </div>

        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center bg-slate-50/60">
          <UploadCloud className="w-5 h-5 text-slate-400 mx-auto mb-1" />
          <div className="text-xs font-semibold text-slate-700">{f.uploadHint}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{f.uploadSubtext}</div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 flex items-center gap-1"><Lock className="w-3 h-3" /> Access gate</span>
          <span className="text-emerald-600 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">{f.pinLabel}</span>
        </div>

        <button
          type="button"
          disabled
          className="w-full py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl shadow-sm cursor-default"
        >
          {f.ctaLabel}
        </button>
        <p className="text-center text-[10px] text-slate-400">Preview only — no account or download needed for real guests.</p>
      </motion.div>
    </div>
  );
}
