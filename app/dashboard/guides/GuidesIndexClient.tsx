"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Search, BookOpen, CheckCircle2 } from 'lucide-react';
import { modules, moduleGroups } from '@/lib/module-catalogue';

export default function GuidesIndexClient({ availableModuleIds }: { availableModuleIds: string[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('All');

  const filteredModules = modules.filter(m => {
    const matchesGroup = activeGroup === 'All' || m.group === activeGroup;
    const matchesSearch = m.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-24 md:pb-10">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-2xs">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200/80 dark:border-orange-900/50 flex items-center justify-center shrink-0 shadow-xs">
            <BookOpen className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">User Guides</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">Step-by-step instructions, tutorials, and FAQs for every tool</p>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search guides…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-orange-500 transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {moduleGroups.map((group) => (
              <button
                key={group}
                onClick={() => setActiveGroup(group)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeGroup === group
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700'
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {filteredModules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <Search className="w-10 h-10 text-slate-300 dark:text-slate-700" />
          <p className="text-sm font-bold text-slate-400">No guides match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredModules.map((mod) => {
            const isAvailable = availableModuleIds.includes(mod.id);
            return (
              <Link
                key={mod.id}
                href={`/dashboard/guides/${mod.id}`}
                className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 hover:border-orange-400/80 transition-all shadow-2xs block"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 group-hover:bg-orange-100 dark:group-hover:bg-orange-950/80 group-hover:text-orange-600 dark:group-hover:text-orange-400 flex items-center justify-center shrink-0 transition-colors">
                    <mod.icon className="w-4.5 h-4.5" />
                  </div>
                  {isAvailable && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-900/50">
                      <CheckCircle2 className="w-3 h-3" />
                      Guide available
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{mod.label}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{mod.desc}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
