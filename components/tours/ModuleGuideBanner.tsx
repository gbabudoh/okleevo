"use client";

import React, { useState } from 'react';
import { Sparkles, HelpCircle, X, ChevronRight } from 'lucide-react';
import { REPLAY_TOUR_EVENT } from './TourProvider';
import { motion, AnimatePresence } from 'framer-motion';

interface ModuleGuideBannerProps {
  moduleId: string;
  moduleName: string;
  summary: string;
  tips?: string[];
}

export function ModuleGuideBanner({
  moduleId,
  moduleName,
  summary,
  tips = [],
}: ModuleGuideBannerProps) {
  const [isOpen, setIsOpen] = useState(false);

  function triggerTour() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(REPLAY_TOUR_EVENT, { detail: { moduleId } })
      );
    }
  }

  return (
    <div className="relative inline-flex items-center z-10 shrink-0">
      {/* Sleek Floating Pill Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-gray-200/80 dark:border-slate-700 text-[11px] sm:text-xs font-extrabold text-gray-700 dark:text-slate-200 shadow-xs hover:shadow-md hover:border-orange-300 hover:text-orange-600 transition-all active:scale-95 group shrink-0 whitespace-nowrap cursor-pointer"
        title={`${moduleName} Guide`}
      >
        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500 group-hover:rotate-12 transition-transform shrink-0" />
        <span className="hidden md:inline">{moduleName} Guide</span>
        <span className="md:hidden">Guide</span>
        <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 group-hover:text-orange-500 shrink-0" />
      </button>

      {/* Popover / Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 sm:hidden"
            />

            {/* Popover Card */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="fixed left-4 right-4 top-20 z-50 max-w-sm mx-auto sm:absolute sm:inset-auto sm:left-0 sm:right-auto sm:top-full sm:mt-2 sm:w-96 bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl shadow-2xl p-4 sm:p-5 text-gray-800 overflow-hidden"
            >
              {/* Gradient accent top border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-400" />

              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-600">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>{moduleName} Overview</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                {summary}
              </p>

              {tips.length > 0 && (
                <div className="space-y-1.5 mb-4">
                  {tips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-gray-600 bg-gray-50/80 p-2 rounded-xl border border-gray-100">
                      <span className="shrink-0 text-orange-500 font-bold">•</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-[10px] text-gray-400 font-medium">Non-intrusive guide</span>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    triggerTour();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-semibold shadow-xs hover:bg-orange-700 transition-colors active:scale-95 cursor-pointer"
                >
                  <span>Highlight Features</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
