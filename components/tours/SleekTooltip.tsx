"use client";

import React from 'react';
import type { TooltipRenderProps } from 'react-joyride';
import { Sparkles, X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SleekTooltip({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  isLastStep,
  size,
}: TooltipRenderProps) {
  return (
    <div
      {...tooltipProps}
      className="max-w-sm w-full bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl shadow-2xl p-4 sm:p-5 relative overflow-hidden text-gray-800 transition-all z-[10000]"
    >
      {/* Top accent gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-indigo-600" />

      {/* Header with badge & close button */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-100 text-[11px] font-bold text-orange-600 tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          <span>Module Guide</span>
        </div>

        <div className="flex items-center gap-2">
          {size > 1 && (
            <span className="text-[11px] font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
              {index + 1} / {size}
            </span>
          )}
          <button
            {...closeProps}
            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close Guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {step.title && (
        <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1.5">
          {step.title}
        </h3>
      )}
      <div className="text-xs text-gray-600 leading-relaxed font-normal mb-4">
        {step.content}
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100/80 mt-1">
        <div>
          {index > 0 && (
            <button
              {...backProps}
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {continuous && (
            <button
              {...primaryProps}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm transition-all active:scale-95 hover:opacity-95"
              style={{ backgroundColor: '#fc6813' }}
            >
              <span>{isLastStep ? 'Got it' : 'Next'}</span>
              {isLastStep ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
