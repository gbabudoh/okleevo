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
    <div className="relative inline-block z-20">
      {/* Sleek Floating Pill Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-gray-200/80 text-xs font-semibold text-gray-700 shadow-xs hover:shadow-md hover:border-orange-200 hover:text-orange-600 transition-all active:scale-95 group"
      >
        <Sparkles className="w-3.5 h-3.5 text-orange-500 group-hover:rotate-12 transition-transform" />
        <span>{moduleName} Guide</span>
        <HelpCircle className="w-3.5 h-3.5 text-gray-400 group-hover:text-orange-500" />
      </button>

      {/* Popover Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 sm:right-auto sm:left-0 top-full mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl shadow-2xl p-4 sm:p-5 text-gray-800 z-50 overflow-hidden"
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
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-semibold shadow-xs hover:bg-orange-700 transition-colors active:scale-95"
              >
                <span>Highlight Features</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
