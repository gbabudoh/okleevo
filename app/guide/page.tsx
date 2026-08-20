'use client';

import { useState } from 'react';
import {
  Search, BookOpen, ChevronRight, Sparkles, Mail,
  ArrowUpRight, Zap, Download, Video, ShieldCheck,
  Grid, CheckCircle2, Layers, ArrowRight, X, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from "next-auth/react";
import { modules, moduleGroups, ModuleCatalogueEntry } from '@/lib/module-catalogue';

export default function PublicUserGuidePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('All');
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && session?.user;

  const handleDownloadPDF = () => {
    window.print();
  };

  const filteredModules = modules.filter(m => {
    const matchesSearch = m.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (m.features && m.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesGroup = activeGroup === 'All' || m.group === activeGroup;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased selection:bg-orange-500 selection:text-white">
      
      {/* ── Universal Navigation (Public) ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 print:hidden transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="shrink-0 flex items-center gap-2">
            <Image src="/logo.png" alt="Okleevo" width={110} height={28} className="h-6 sm:h-7 w-auto" priority />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600 dark:text-slate-400">
            <Link href="/#home" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Platform</Link>
            <Link href="/#benefits" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Pillars</Link>
            <Link href="/pricing" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Pricing</Link>
            <Link href="/guide" className="text-orange-600 dark:text-orange-400 font-extrabold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              User Guide
            </Link>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="text-xs sm:text-sm font-extrabold text-white px-4 py-2 rounded-2xl transition-all shadow-md shadow-orange-500/20 active:scale-95 flex items-center gap-2"
                style={{ backgroundColor: '#fc6813' }}
              >
                <span>Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/access"
                  className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/onboarding"
                  className="text-xs sm:text-sm font-extrabold text-white px-4 py-2 rounded-2xl transition-all shadow-md shadow-orange-500/20 active:scale-95"
                  style={{ backgroundColor: '#fc6813' }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Minimalist Enterprise Hero Shell ── */}
      <div className="relative bg-gradient-to-b from-white via-slate-50/80 to-slate-100/60 dark:from-slate-950 dark:via-slate-900/90 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800 pt-20 sm:pt-28 pb-8 sm:pb-12 overflow-hidden print:bg-white print:pt-4 print:pb-4">
        {/* Subtle Ambient Brand Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-20 print:hidden">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-[140px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 sm:space-y-8">
          {/* Print-only Logo Header */}
          <div className="hidden print:flex items-center justify-between pb-4 border-b border-slate-200">
            <Image src="/logo.png" alt="Okleevo" width={130} height={32} className="h-7 w-auto" />
            <span className="text-xs font-mono font-bold text-slate-400">Enterprise Module Catalogue · 2026 Edition</span>
          </div>

          {/* Hero Header Text & Compact Action Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-8">
            <div className="max-w-3xl space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-200/80 dark:border-orange-900/60 text-orange-700 dark:text-orange-400 text-[11px] font-extrabold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Enterprise Platform Directory</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                The Okleevo{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 dark:from-orange-400 dark:to-amber-300">
                  Module Catalogue
                </span>
              </h1>

              <p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
                A unified architecture of native tools engineered for virtual headquarters, asynchronous team productivity, and frictionless client operations.
              </p>
            </div>

            {/* Streamlined Action Buttons (Side-by-side on mobile) */}
            <div className="flex items-center gap-2.5 shrink-0 print:hidden">
              <button 
                onClick={handleDownloadPDF}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-2xl border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer shadow-xs active:scale-95 text-center"
              >
                <Download className="w-3.5 h-3.5 text-orange-500" />
                <span>Download PDF</span>
              </button>

              <Link 
                href={isLoggedIn ? "/dashboard" : "/onboarding"}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs rounded-2xl transition-all shadow-md shadow-orange-500/20 active:scale-95 whitespace-nowrap text-center"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isLoggedIn ? "Open Dashboard" : "Start Free Trial"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* ── Seamless Integrated Search & Pillar Filter Dock ── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-2.5 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 sm:gap-3.5 print:hidden">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search capabilities (e.g. video, tasks, audit trail)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-950 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Pillar Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 lg:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
              {moduleGroups.map((group) => {
                const active = activeGroup === group;
                const count = group === 'All' ? modules.length : modules.filter(m => m.group === group).length;

                return (
                  <button
                    key={group}
                    onClick={() => setActiveGroup(group)}
                    className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      active 
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-xs' 
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                    }`}
                  >
                    <span>{group}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                      active ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Catalogue Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14 pb-20 print:mt-4 print:pb-0">
        {filteredModules.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-500 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No modules match &ldquo;{searchQuery}&rdquo;</h3>
            <p className="text-xs text-slate-400 font-medium">Try checking your spelling or clear active filters</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveGroup('All'); }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 print:grid-cols-2 print:gap-4">
            {filteredModules.map((module) => {
              const Icon = module.icon;

              return (
                <div
                  key={module.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xs hover:shadow-xl hover:border-orange-400/80 dark:hover:border-orange-500/40 transition-all flex flex-col justify-between space-y-5 group relative overflow-hidden print:rounded-2xl print:border-slate-300 print:break-inside-avoid"
                >
                  <div className="space-y-4">
                    {/* Top Row: Icon & Pillar Badge */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/50 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 group-hover:bg-orange-500 group-hover:text-white transition-all">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-700">
                        {module.group}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {module.label}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mt-1.5">
                        {module.desc}
                      </p>
                    </div>

                    {/* Feature Micro-Pills */}
                    {module.features && module.features.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {module.features.map((feat, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60"
                          >
                            <span className="w-1 h-1 rounded-full bg-orange-500" />
                            <span>{feat}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Action Link */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between print:hidden">
                    <Link
                      href={isLoggedIn && module.route ? module.route : `/dashboard/guides/${module.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-all"
                    >
                      <span>{isLoggedIn ? "Open in Workspace" : "View Documentation"}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>

                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      ID: {module.id}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Value Prop Section: Native Engine Integration ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20 print:hidden">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white via-slate-50/90 to-slate-100/70 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 lg:p-12 shadow-sm">
          {/* Subtle Ambient Brand Glow */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-orange-500/10 dark:bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-3.5 sm:space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-200/80 dark:border-orange-900/60 text-orange-700 dark:text-orange-400 text-[11px] font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>Zero Third-Party Subscriptions</span>
              </div>

              <h2 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Everything your business needs, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 dark:from-orange-400 dark:to-amber-300">
                  natively unified under one roof.
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Eliminate SaaS fragmentation. Okleevo unifies CRM, video calls, email infrastructure, tasks, and e-signatures into a single high-performance workspace with zero external plugin dependencies.
              </p>

              <div className="pt-2">
                <Link
                  href={isLoggedIn ? "/dashboard" : "/onboarding"}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                >
                  <span>{isLoggedIn ? "Open Dashboard" : "Get Started with Okleevo"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-orange-300 dark:hover:border-orange-500/40 transition-all space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/50 flex items-center justify-center">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">Native SMTP Mail Engine</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Send &amp; receive emails directly with internal DNS/SMTP authentication and CRM contact context.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-orange-300 dark:hover:border-orange-500/40 transition-all space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/50 flex items-center justify-center">
                  <Video className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">Instant HD Video Meetings</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Studio-grade team video calls and client meeting rooms without downloading separate apps or paying Zoom licenses.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-orange-300 dark:hover:border-orange-500/40 transition-all space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50 flex items-center justify-center">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">eIDAS E-Signatures</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Cryptographic SHA-256 legal audit trails and multi-recipient signing workflows built-in.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-orange-300 dark:hover:border-orange-500/40 transition-all space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/50 flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">AI Copilot Synthesis</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Automatic meeting transcription, executive summaries, and action point extraction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer (Hidden in Print) ── */}
      <footer className="py-12 px-4 sm:px-6 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-400 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Okleevo" width={90} height={24} className="h-5 w-auto opacity-70 dark:invert-0" />
            <span>· Enterprise Operating System</span>
          </div>
          <p>© 2026 Okleevo Inc. All rights reserved.</p>
        </div>
      </footer>

      {/* ── Print-only CSS ── */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          nav, footer, .print-hidden, button {
            display: none !important;
          }
          .min-h-screen {
            min-height: auto !important;
          }
          h1, h2, h3, h4 {
            color: #0f172a !important;
          }
        }
      `}</style>
    </div>
  );
}
