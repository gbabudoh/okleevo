"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, Clock, User, Plus, Sparkles, 
  ChevronRight, ArrowUpRight, Flame, ShieldCheck,
  CheckSquare, X, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DTCItem {
  id: string;
  title: string;
  description?: string | null;
  completedBy: string;
  completedAt: string | Date;
  priority?: string;
  isDailyTask?: boolean;
}

interface DailyTaskCompletionBoxProps {
  onTaskLogged?: () => void;
  className?: string;
}

export function DailyTaskCompletionBox({ onTaskLogged, className = '' }: DailyTaskCompletionBoxProps) {
  const [completions, setCompletions] = useState<DTCItem[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  const fetchDTC = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks/dtc');
      if (res.ok) {
        const data = await res.json();
        setTodayCount(data.todayCount || 0);
        setCompletions(data.todayCompletions || data.recentCompletions || []);
      }
    } catch {
      // silent fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDTC();
    const interval = setInterval(fetchDTC, 20000); // Live poll every 20s
    return () => clearInterval(interval);
  }, [fetchDTC]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/tasks/dtc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority }),
      });
      if (res.ok) {
        setTitle('');
        setDescription('');
        setShowSubmitModal(false);
        await fetchDTC();
        if (onTaskLogged) onTaskLogged();
      }
    } catch (err) {
      console.error('Failed to log daily task', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCompletionTime = (timestamp: string | Date) => {
    const d = new Date(timestamp);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
      return `Today at ${timeStr}`;
    }
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
  };

  return (
    <div className={`bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 dark:from-emerald-950/50 dark:via-slate-900 dark:to-slate-950 border-2 border-emerald-500/40 dark:border-emerald-700/50 rounded-3xl p-5 sm:p-7 shadow-lg shadow-emerald-500/5 relative overflow-hidden ${className}`}>
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Strip */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-emerald-500/20 dark:border-emerald-800/50">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 shrink-0">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Daily Task Completion [DTC]-Box
              </h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 shadow-2xs">
                <Flame className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-500 animate-pulse" />
                {todayCount} Completed Today
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-bold mt-0.5">
              Live daily sprint submissions, team accountability, and verified completion audit log
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSubmitModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-black shadow-md shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Submit Daily Task Deliverable</span>
        </button>
      </div>

      {/* Live Completions Stream */}
      <div className="mt-4">
        {loading ? (
          <div className="py-8 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
            <span>Syncing Daily Task Ledger...</span>
          </div>
        ) : completions.length === 0 ? (
          <div className="py-6 text-center space-y-1 text-xs text-slate-500 dark:text-slate-400">
            <p className="font-bold text-slate-700 dark:text-slate-300">No daily tasks completed yet today.</p>
            <p className="text-[11px]">Be the first to submit your deliverable or complete an assigned task!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {completions.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs border border-emerald-500/20 dark:border-emerald-800/30 rounded-2xl p-3.5 flex flex-col justify-between hover:border-emerald-400 dark:hover:border-emerald-700 transition-all shadow-2xs group"
              >
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 shrink-0">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Done
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 truncate">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 flex items-center justify-center text-[8px] font-black shrink-0">
                      {item.completedBy.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{item.completedBy}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 font-mono text-[9px] shrink-0">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{formatCompletionTime(item.completedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={() => setShowSubmitModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-emerald-500/30 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-600 text-white rounded-xl">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Submit Completed Daily Task</h3>
                  <p className="text-[11px] text-slate-500">Sign off your deliverable to team activity stream</p>
                </div>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deliverable / Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Finalized Q3 Client Marketing Deck"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deliverable Summary / Key Highlights (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe what was completed or link key outcomes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-emerald-500 resize-none transition-all"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-2xl text-xs font-black shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Sign-off Deliverable</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
