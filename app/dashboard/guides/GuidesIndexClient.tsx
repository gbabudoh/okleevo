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
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-8">
        <div className="flex items-center gap-4 mb-5">
          <div className="p-3 bg-indigo-50 rounded-xl shrink-0">
            <BookOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">User Guides</h1>
            <p className="text-gray-500 text-sm">Step-by-step instructions, tutorials, and FAQs for every module</p>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search guides…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {moduleGroups.map((group) => (
              <button
                key={group}
                onClick={() => setActiveGroup(group)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeGroup === group
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
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
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-gray-200">
          <Search className="w-10 h-10 text-gray-200" />
          <p className="text-sm font-semibold text-gray-400">No guides match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredModules.map((mod) => {
            const isAvailable = availableModuleIds.includes(mod.id);
            return (
              <Link
                key={mod.id}
                href={`/dashboard/guides/${mod.id}`}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-colors block"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 bg-linear-to-br ${mod.color} rounded-xl`}>
                    <mod.icon className="w-5 h-5 text-white" />
                  </div>
                  {isAvailable && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Guide available
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{mod.label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{mod.desc}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
