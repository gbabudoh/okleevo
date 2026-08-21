"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, Flame, ArrowLeft, Users, Calendar, 
  Clock, ShieldCheck, Sparkles, Filter, Plus, ChevronRight,
  TrendingUp, Layers, CheckSquare
} from 'lucide-react';
import { DailyTaskCompletionBox } from '@/components/tasks/DailyTaskCompletionBox';

export default function DailyTaskCompletionDedicatedPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20 sm:pb-12">
      {/* ── Glassmorphic Sticky Header ── */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/collaboration"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              title="Back to Virtual HQ"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/25">
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                    Daily Task Completion [DTC] Hub
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Live Sprints
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-400 hidden sm:block">
                  Organization-wide deliverable sign-offs, daily sprints, and accountability audit ledger
                </p>
              </div>
            </div>
          </div>

          {/* Quick Context Switchers */}
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/collaboration"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <Users className="w-3.5 h-3.5 text-orange-500" />
              <span>Virtual HQ</span>
            </Link>
            <Link
              href="/dashboard/tasks"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
              <span>Task Boards</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Content Body ── */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6 py-5 sm:py-7 space-y-6">
        {/* Full-Feature DTC Engine Box */}
        <DailyTaskCompletionBox />
      </div>
    </div>
  );
}
