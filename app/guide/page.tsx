'use client';

import React, { useState } from 'react';

import { 
  Search, BookOpen, Sparkles, ChevronRight,
  Receipt, Calculator, FileText, TrendingUp,
  Users, FormInput, Calendar, MessageSquare, Mail,
  CheckSquare, FileEdit, BarChart3, Package,
  Truck, UserCheck, PenTool, Globe, Shield,
  ArrowUpRight, Zap, Download
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from "next-auth/react";

const modules = [
  // Finance Hub
  { id: 'invoicing', label: 'Invoicing', icon: Receipt, group: 'Finance Hub', color: 'from-emerald-400 to-teal-500', desc: 'Generate professional invoices, track payments, and automate reminders to get paid faster.' },
  { id: 'accounting', label: 'Accounting', icon: Calculator, group: 'Finance Hub', color: 'from-emerald-500 to-emerald-700', desc: 'Full double-entry bookkeeping with automated ledgers and financial statement generation.' },
  { id: 'taxation', label: 'Taxation', icon: FileText, group: 'Finance Hub', color: 'from-teal-400 to-emerald-600', desc: 'Simplify your tax season with automated calculations and MTD-compliant reporting.' },
  { id: 'cashflow', label: 'Cashflow', icon: TrendingUp, group: 'Finance Hub', color: 'from-cyan-500 to-blue-500', desc: 'Predictive liquidity tracking to ensure you always have the capital needed to grow.' },
  { id: 'expenses', label: 'Expenses', icon: FileText, group: 'Finance Hub', color: 'from-emerald-300 to-teal-400', desc: 'Snap receipts and categorize business spending instantly for seamless reconciliation.' },
  { id: 'vat-tools', label: 'VAT Tools', icon: Calculator, group: 'Finance Hub', color: 'from-teal-600 to-emerald-800', desc: 'Specialized tools for managing VAT returns and multi-rate tax structures.' },

  // Growth Engine
  { id: 'crm', label: 'CRM', icon: Users, group: 'Growth Engine', color: 'from-indigo-400 to-blue-500', desc: 'A centralized hub for your leads and customers. Send direct, branded emails via internal SMTP and track every interaction.' },
  { id: 'forms', label: 'Forms', icon: FormInput, group: 'Growth Engine', color: 'from-blue-400 to-indigo-600', desc: 'Drag-and-drop builder for lead intake, feedback surveys, and customer onboarding.' },
  { id: 'booking', label: 'Booking', icon: Calendar, group: 'Growth Engine', color: 'from-indigo-500 to-purple-500', desc: 'Integrated appointment scheduling that syncs directly with your team calendar.' },
  { id: 'helpdesk', label: 'Helpdesk', icon: MessageSquare, group: 'Growth Engine', color: 'from-blue-500 to-cyan-500', desc: 'Provide world-class support with a ticket system that organizes customer requests.' },
  { id: 'campaigns', label: 'Campaigns', icon: Mail, group: 'Growth Engine', color: 'from-indigo-600 to-purple-700', desc: 'Send beautiful bulk email marketing campaigns directly via the Okleevo SMTP engine with performance analytics.' },

  // Command Center
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, group: 'Command Center', color: 'from-purple-400 to-pink-500', desc: 'Collaborative project management. Assign tasks, set deadlines, and track progress in real-time.' },
  { id: 'ai-content', label: 'AI Content', icon: Sparkles, group: 'Command Center', color: 'from-pink-500 to-rose-500', desc: 'Harness AI to generate marketing copy, social posts, and product descriptions in seconds.' },
  { id: 'ai-notes', label: 'AI Notes', icon: FileEdit, group: 'Command Center', color: 'from-rose-400 to-orange-500', desc: 'Smart note-taking that automatically summarizes meetings and identifies action items.' },
  { id: 'kpi-dashboard', label: 'KPI Dashboard', icon: BarChart3, group: 'Command Center', color: 'from-purple-600 to-indigo-800', desc: 'Visual business intelligence with real-time charts showing your most important metrics.' },

  // Operations Hub
  { id: 'inventory', label: 'Inventory', icon: Package, group: 'Operations Hub', color: 'from-amber-400 to-orange-500', desc: 'Track stock levels across multiple locations with automated low-stock alerts.' },
  { id: 'suppliers', label: 'Suppliers', icon: Truck, group: 'Operations Hub', color: 'from-orange-500 to-red-600', desc: 'Manage vendor relationships, purchase orders, and supply chain logistics.' },
  { id: 'hr-records', label: 'HR Records', icon: UserCheck, group: 'Operations Hub', color: 'from-amber-500 to-yellow-600', desc: 'Securely store employee contracts, performance reviews, and sensitive documents.' },
  { id: 'e-signature', label: 'E-Signature', icon: PenTool, group: 'Operations Hub', color: 'from-orange-400 to-rose-500', desc: 'Send and sign legally binding documents electronically without leaving the platform.' },
  { id: 'micro-pages', label: 'Micro Pages', icon: Globe, group: 'Operations Hub', color: 'from-yellow-400 to-orange-500', desc: 'Create stunning mini-websites or digital business cards to showcase your offerings.' },
  { id: 'compliance', label: 'Compliance', icon: Shield, group: 'Operations Hub', color: 'from-amber-600 to-orange-700', desc: 'Keep your business protected with automated regulatory reminders and checklists.' },
];

const groups = ['All', 'Finance Hub', 'Growth Engine', 'Command Center', 'Operations Hub'];

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
                         m.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = activeGroup === 'All' || m.group === activeGroup;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Universal Navigation (Public) */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Okleevo" width={150} height={40} className="h-10 w-auto" />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/#home" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Home</Link>
              <Link href="/#benefits" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Benefits</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Pricing</Link>
              <Link href="/guide" className="text-indigo-600 font-bold">User Guide</Link>
            </div>
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <Link href="/dashboard" className="px-6 py-2.5 bg-gray-900 text-white rounded-full font-bold hover:shadow-lg transition-all">Go to Dashboard</Link>
              ) : (
                <Link href="/onboarding" className="px-6 py-2.5 bg-[#fc6813] text-white rounded-full font-bold hover:shadow-lg transition-all">Get Started</Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="relative bg-gray-900 pt-32 pb-32 overflow-hidden print:bg-white print:pt-10 print:pb-10">
        {/* Abstract Background Shapes (Hidden in Print) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none print:hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full blur-[100px]"></div>
          <div className="absolute top-1/2 -right-24 w-80 h-80 bg-purple-500 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Print-only Logo */}
          <div className="hidden print:block mb-10">
            <Image src="/logo.png" alt="Okleevo" width={200} height={50} className="h-12 w-auto" />
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6 print:text-indigo-600 print:bg-gray-100">
                <BookOpen className="w-4 h-4" />
                Product Documentation
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6 print:text-gray-900 print:text-4xl">
                The Okleevo <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 print:text-indigo-600 print:bg-none">
                  Module Catalog
                </span>
              </h1>
              <p className="text-xl text-gray-400 font-medium leading-relaxed print:text-gray-600">
                A comprehensive overview of every tool designed to transform your business operations. Download this guide for offline reference.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 print:hidden">
              <button 
                onClick={handleDownloadPDF}
                className="group flex items-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-lg border border-white/20 text-white font-black rounded-2xl hover:bg-white/20 transition-all cursor-pointer shadow-xl"
              >
                <Download className="w-5 h-5 text-indigo-400 group-hover:animate-bounce" />
                Download PDF Guide
              </button>
              <Link 
                href="/onboarding"
                className="group flex items-center gap-3 px-6 py-4 bg-[#fc6813] text-white font-black rounded-2xl hover:shadow-2xl transition-all hover:scale-105"
              >
                <Zap className="w-5 h-5" />
                Start Free Trial
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar (Hidden in Print) */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 print:hidden">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 md:p-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="relative w-full lg:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {groups.map((group) => (
                <button
                  key={group}
                  onClick={() => setActiveGroup(group)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    activeGroup === group 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pb-20 print:mt-4 print:pb-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 print:grid-cols-2 print:gap-4">
          {filteredModules.map((module) => (
            <div
              key={module.id}
              className="group relative bg-white rounded-[2.5rem] border border-gray-100 p-8 transition-all overflow-hidden print:rounded-2xl print:border-gray-200 print:break-inside-avoid"
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-8 print:mb-4">
                  <div className={`p-4 bg-gradient-to-br ${module.color} rounded-2xl shadow-lg print:shadow-none print:p-2`}>
                    <module.icon className="w-8 h-8 text-white print:w-6 print:h-6" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 bg-gray-50 px-3 py-1 rounded-full print:border print:border-gray-200">
                    {module.group}
                  </div>
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-4 print:text-lg print:mb-2">
                  {module.label}
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed print:text-xs print:leading-normal">
                  {module.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer (Hidden in Print) */}
      <footer className="py-20 px-6 bg-gray-900 text-gray-400 print:hidden">
        <div className="max-w-7xl mx-auto text-center">
          <Image src="/logo.png" alt="Okleevo" width={120} height={30} className="mx-auto mb-8 opacity-50 grayscale" />
          <p className="mb-8">© 2025 Okleevo. Empowering SMEs with world-class tools.</p>
          <Link 
            href="/onboarding"
            className="inline-flex items-center gap-2 text-white font-bold hover:text-indigo-400 transition-colors"
          >
            Create Your Account Today
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </footer>

      {/* Print-only CSS */}
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
            color: #111827 !important;
          }
          .bg-gray-900 {
            background: white !important;
          }
          .text-gray-400 {
            color: #4B5563 !important;
          }
          .grid {
            gap: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}
