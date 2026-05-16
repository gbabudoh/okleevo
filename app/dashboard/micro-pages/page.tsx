"use client";

import React, { useState, useEffect } from 'react';
import {
  Globe, Plus, Search, Upload, Eye, Edit3,
  Trash2, Copy, BarChart3, Settings, Link, ExternalLink,
  Layout,
  Zap, TrendingUp, Clock,
  CheckCircle, XCircle, AlertCircle, MoreVertical,
  ShoppingCart, Calendar,
  Grid, List, X, Sparkles, Target, Award,
  Rocket, MousePointer, ChevronRight
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface MicroPage {
  id: string;
  title: string;
  slug: string;
  url: string;
  template: string;
  status: 'published' | 'draft' | 'archived';
  views: number;
  conversions: number;
  conversionRate: number;
  createdDate: Date;
  lastModified: Date;
  thumbnail?: string;
  description?: string;
  components: string[];
  seoTitle?: string;
  seoDescription?: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  gradient: string;
  components: string[];
}

const templates: Template[] = [
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Hero section, features, and CTA for new product announcements',
    category: 'Marketing',
    icon: Rocket,
    gradient: 'from-blue-500 to-cyan-500',
    components: ['Hero', 'Features', 'CTA', 'Footer'],
  },
  {
    id: 'event-landing',
    name: 'Event Landing',
    description: 'Countdown timer, schedule, and registration form',
    category: 'Events',
    icon: Calendar,
    gradient: 'from-purple-500 to-pink-500',
    components: ['Hero', 'Countdown', 'Schedule', 'Registration'],
  },
  {
    id: 'lead-capture',
    name: 'Lead Capture',
    description: 'High-converting page focused on collecting leads',
    category: 'Marketing',
    icon: Target,
    gradient: 'from-green-500 to-emerald-500',
    components: ['Hero', 'Benefits', 'Form', 'Testimonials'],
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Elegant gallery and project showcase',
    category: 'Personal',
    icon: Award,
    gradient: 'from-orange-500 to-red-500',
    components: ['Hero', 'Gallery', 'About', 'Contact'],
  },
  {
    id: 'coming-soon',
    name: 'Coming Soon',
    description: 'Build anticipation with countdown and email signup',
    category: 'Marketing',
    icon: Clock,
    gradient: 'from-indigo-500 to-purple-500',
    components: ['Hero', 'Countdown', 'Email Form'],
  },
  {
    id: 'pricing',
    name: 'Pricing Page',
    description: 'Clear pricing tiers with feature comparison',
    category: 'Sales',
    icon: ShoppingCart,
    gradient: 'from-pink-500 to-rose-500',
    components: ['Hero', 'Pricing Cards', 'FAQ', 'CTA'],
  },
];

const categoryConfigs = [
  { id: 'all', name: 'All' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'events', name: 'Events' },
  { id: 'sales', name: 'Sales' },
  { id: 'personal', name: 'Personal' },
];

export default function MicroPagesPage() {
  const [pages, setPages] = useState<MicroPage[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPage, setEditingPage] = useState<MicroPage | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPage, setDeletingPage] = useState<MicroPage | null>(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyingPage, setCopyingPage] = useState<MicroPage | null>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsPage, setAnalyticsPage] = useState<MicroPage | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsPage, setSettingsPage] = useState<MicroPage | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  const showNotify = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = () => {
    if (!editingPage) return;
    setPages(prev => prev.map(p => p.id === editingPage.id ? editingPage : p));
    showNotify('Changes saved successfully', 'success');
    setShowEditModal(false);
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch =
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || page.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredTemplates =
    selectedCategory === 'all'
      ? templates
      : templates.filter(t => t.category.toLowerCase() === selectedCategory);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'published':
        return { icon: CheckCircle, label: 'Published', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' };
      case 'draft':
        return { icon: Edit3, label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', border: 'border-gray-200' };
      case 'archived':
        return { icon: AlertCircle, label: 'Archived', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', border: 'border-amber-200' };
      default:
        return { icon: AlertCircle, label: 'Unknown', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', border: 'border-gray-200' };
    }
  };

  const stats = {
    total: pages.length,
    published: pages.filter(p => p.status === 'published').length,
    totalViews: pages.reduce((acc, p) => acc + p.views, 0),
    avgConversion: pages.length > 0 ? pages.reduce((acc, p) => acc + p.conversionRate, 0) / pages.length : 0,
  };

  useEffect(() => {
    const handleClickOutside = () => { if (activeDropdown) setActiveDropdown(null); };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  return (
    <div className="min-h-[calc(100vh-4rem)] space-y-4 md:space-y-6">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-linear-to-br from-gray-900 via-blue-950 to-gray-900 px-5 py-7 md:px-10 md:py-10">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 md:w-72 md:h-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 w-40 h-40 md:w-60 md:h-60 rounded-full bg-purple-500/15 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1">
              <Globe className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-300">Web Presence Hub</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              Micro <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">Pages</span>
            </h1>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              Landing Page Builder & Management
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-white backdrop-blur transition hover:bg-white/10 active:scale-95">
              <Upload className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Import</span>
            </button>
            <button
              onClick={() => setShowTemplates(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-600 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              Create New
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {[
          { label: 'Total Pages', val: stats.total, sub: `${stats.published} published`, icon: Globe, color: 'blue' },
          { label: 'Total Views', val: stats.totalViews.toLocaleString(), sub: 'All time', icon: Eye, color: 'purple' },
          { label: 'Avg Conversion', val: `${stats.avgConversion.toFixed(1)}%`, sub: 'Success rate', icon: Target, color: 'emerald' },
          { label: 'Templates', val: templates.length, sub: 'Available', icon: Layout, color: 'orange' },
        ].map((s, i) => (
          <div key={i} className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className={`rounded-xl p-2.5 bg-${s.color}-100`}>
                <s.icon className={`h-4 w-4 text-${s.color}-600`} />
              </div>
              <TrendingUp className={`h-4 w-4 text-${s.color}-400 opacity-50`} />
            </div>
            <p className="mt-3 text-2xl font-black tracking-tight text-gray-900">{s.val}</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">{s.label}</p>
            <p className={`mt-1 text-[10px] font-bold text-${s.color}-600 flex items-center gap-1`}>
              <Zap className="h-2.5 w-2.5" />{s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* ── Search & Filters ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search pages…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-[11px] font-black uppercase tracking-wider text-gray-700 outline-none cursor-pointer shadow-sm focus:border-blue-500 transition appearance-none"
            style={{ backgroundImage: 'none' }}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Empty State ── */}
      {filteredPages.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 py-16 px-6 text-center">
          <div className="mb-4 rounded-2xl bg-blue-50 p-5">
            <Globe className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-black text-gray-900">No pages yet</h3>
          <p className="mt-1 max-w-xs text-sm text-gray-500">Create your first landing page from one of our high-converting templates.</p>
          <button
            onClick={() => setShowTemplates(true)}
            className="mt-6 flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-md shadow-blue-500/20 hover:bg-blue-600 transition active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            Create First Page
          </button>
        </div>
      )}

      {/* ── Grid View ── */}
      {viewMode === 'grid' && filteredPages.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPages.map((page, idx) => {
            const cfg = getStatusConfig(page.status);
            return (
              <div
                key={page.id}
                onClick={() => { setEditingPage(page); setShowEditModal(true); }}
                className="group relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-in fade-in zoom-in-95 fill-mode-both"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* Status pill */}
                <div className={`absolute top-4 right-4 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </div>

                {/* Browser thumbnail */}
                <div className="mb-4 aspect-video w-full overflow-hidden rounded-xl bg-linear-to-br from-gray-100 to-gray-200 relative border border-gray-100">
                  <div className="absolute top-0 inset-x-0 flex items-center gap-1 bg-white/90 px-3 py-1.5 border-b border-gray-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Globe className="h-10 w-10 text-gray-300 group-hover:text-blue-500 transition-colors duration-300" />
                  </div>
                </div>

                <h3 className="text-sm font-black text-gray-900 leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors pr-16">
                  {page.title}
                </h3>
                <div className="mt-1 flex items-center gap-1.5">
                  <Link className="h-3 w-3 text-blue-400 shrink-0" />
                  <span className="text-[10px] font-medium text-blue-500/70 truncate italic">{page.url}</span>
                </div>

                {/* Mini stats */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-blue-50 px-3 py-2.5">
                    <p className="text-[9px] font-black uppercase tracking-wider text-blue-400">Views</p>
                    <p className="text-lg font-black text-blue-900">{page.views.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 px-3 py-2.5">
                    <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400">Conv.</p>
                    <p className="text-lg font-black text-emerald-900">{page.conversionRate.toFixed(1)}%</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="relative mt-4 flex items-center gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); setEditingPage(page); setShowEditModal(true); }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 py-2.5 text-[10px] font-black uppercase tracking-wider text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                  >
                    <Edit3 className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); window.open(page.url, '_blank'); }}
                    className="rounded-lg bg-blue-500 p-2.5 text-white hover:bg-blue-600 transition shadow-sm shadow-blue-500/20 cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setActiveDropdown(activeDropdown === page.id ? null : page.id); }}
                    className="rounded-lg border border-gray-100 bg-gray-50 p-2.5 text-gray-400 hover:bg-gray-100 transition cursor-pointer"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {activeDropdown === page.id && (
                    <div className="absolute right-0 bottom-full mb-2 w-48 rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-xl shadow-2xl p-2 z-50 flex flex-col gap-0.5 animate-in fade-in slide-in-from-bottom-2">
                      <button onClick={e => { e.stopPropagation(); setCopyingPage(page); setShowCopyModal(true); setActiveDropdown(null); }} className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-bold text-gray-600 hover:bg-blue-50 transition">
                        <Copy className="h-3.5 w-3.5" /> Copy URL
                      </button>
                      <button onClick={e => { e.stopPropagation(); setAnalyticsPage(page); setShowAnalyticsModal(true); setActiveDropdown(null); }} className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-bold text-gray-600 hover:bg-purple-50 transition">
                        <BarChart3 className="h-3.5 w-3.5" /> Analytics
                      </button>
                      <button onClick={e => { e.stopPropagation(); setSettingsPage(page); setShowSettingsModal(true); setActiveDropdown(null); }} className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-bold text-gray-600 hover:bg-gray-50 transition">
                        <Settings className="h-3.5 w-3.5" /> Settings
                      </button>
                      <div className="my-1 h-px bg-gray-100" />
                      <button onClick={e => { e.stopPropagation(); setDeletingPage(page); setShowDeleteModal(true); setActiveDropdown(null); }} className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-bold text-red-500 hover:bg-red-50 transition">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── List View ── */}
      {viewMode === 'list' && filteredPages.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Desktop table header */}
          <div className="hidden md:grid md:grid-cols-[1fr_120px_100px_120px] gap-4 bg-gray-900 px-6 py-4">
            {['Page Information', 'Views', 'Conv. Rate', 'Actions'].map((h, i) => (
              <p key={i} className={`text-[10px] font-black uppercase tracking-[0.2em] text-white ${i > 0 ? 'text-center' : ''}`}>{h}</p>
            ))}
          </div>

          <div className="divide-y divide-gray-50">
            {filteredPages.map(page => {
              const cfg = getStatusConfig(page.status);
              return (
                <div
                  key={page.id}
                  onClick={() => { setEditingPage(page); setShowEditModal(true); }}
                  className="group cursor-pointer transition hover:bg-blue-50/40"
                >
                  {/* Mobile card layout */}
                  <div className="flex items-center gap-4 p-4 md:hidden">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-gray-900 truncate group-hover:text-blue-600 transition-colors">{page.title}</p>
                      <div className="mt-0.5 flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                        <span className="text-[10px] text-gray-400">{page.views.toLocaleString()} views</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                  </div>

                  {/* Desktop row layout */}
                  <div className="hidden md:grid md:grid-cols-[1fr_120px_100px_120px] gap-4 items-center px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 shrink-0 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
                        <Globe className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-sm text-gray-900 truncate group-hover:text-blue-600 transition-colors">{page.title}</p>
                        <p className="text-[10px] text-blue-500/60 flex items-center gap-1 mt-0.5 italic">
                          <Link className="h-2.5 w-2.5" />{page.url}
                        </p>
                      </div>
                    </div>
                    <p className="text-center font-bold text-gray-900 text-sm">{page.views.toLocaleString()}</p>
                    <p className="text-center font-bold text-emerald-600 text-sm">{page.conversionRate.toFixed(1)}%</p>
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={e => { e.stopPropagation(); setEditingPage(page); setShowEditModal(true); }} className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                        <Edit3 className="h-3.5 w-3.5 text-gray-600" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); window.open(page.url, '_blank'); }} className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition shadow-sm cursor-pointer">
                        <ExternalLink className="h-3.5 w-3.5 text-white" />
                      </button>
                      <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* ════════════════════════════════════════
          TEMPLATE CHOOSER MODAL
      ════════════════════════════════════════ */}
      {showTemplates && (
        <div className="fixed inset-0 z-150 flex items-end sm:items-center justify-center bg-gray-900/70 backdrop-blur-sm animate-in fade-in duration-200 p-0 sm:p-4">
          {/* close outside */}
          <div className="absolute inset-0" onClick={() => setShowTemplates(false)} />

          <div className="relative z-10 flex flex-col w-full sm:max-w-2xl max-h-[92dvh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">

            {/* Drag handle (mobile) */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-12 pb-5 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-xl font-black tracking-tight text-gray-900">
                  Choose a <span className="text-blue-600">Template</span>
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">
                  {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
                </p>
              </div>
              <button onClick={() => setShowTemplates(false)} className="p-2 rounded-xl hover:bg-gray-100 transition cursor-pointer">
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto px-6 pt-6 pb-4 border-b border-gray-50 scrollbar-hide">
              {categoryConfigs.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-wider transition shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Template grid */}
            <div className="flex-1 overflow-y-auto px-8 pt-10 pb-5 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                {filteredTemplates.map(template => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => {
                        const newPage: MicroPage = {
                          id: Math.random().toString(36).substring(2, 11),
                          title: `${template.name} Draft`,
                          slug: `${template.id}-${Date.now()}`,
                          url: `https://yourdomain.com/${template.id}-${Date.now()}`,
                          template: template.id,
                          status: 'draft',
                          views: 0,
                          conversions: 0,
                          conversionRate: 0,
                          createdDate: new Date(),
                          lastModified: new Date(),
                          description: template.description,
                          components: template.components,
                          seoTitle: `New ${template.name} Page`,
                          seoDescription: 'Enter your page description here...',
                        };
                        setPages([newPage, ...pages]);
                        setEditingPage(newPage);
                        setShowTemplates(false);
                        setShowEditModal(true);
                        showNotify('New page created from template', 'success');
                      }}
                      className="group flex gap-3 rounded-2xl border border-gray-100 bg-white p-3 text-left shadow-sm hover:shadow-md hover:border-blue-200 transition active:scale-[0.98] cursor-pointer"
                    >
                      <div className={`shrink-0 h-14 w-14 rounded-2xl bg-linear-to-br ${template.gradient} flex items-center justify-center shadow-sm`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{template.name}</p>
                        <p className="mt-0.5 text-[10px] text-gray-500 leading-relaxed line-clamp-2">{template.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {template.components.slice(0, 3).map((c, i) => (
                            <span key={i} className="rounded-lg bg-gray-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-400">{c}</span>
                          ))}
                        </div>
                      </div>
                      <ChevronRight className="shrink-0 h-4 w-4 text-gray-300 self-center group-hover:text-blue-500 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer — extended scroll for mobile */}
            <div className="px-6 pb-32 sm:pb-6 pt-4 border-t border-gray-100 bg-white">
              <button
                onClick={() => setShowTemplates(false)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ════════════════════════════════════════
          EDIT MODAL
      ════════════════════════════════════════ */}
      {showEditModal && editingPage && (
        <div className="fixed inset-0 z-150 flex items-end sm:items-center justify-center bg-gray-900/70 backdrop-blur-sm animate-in fade-in duration-200 p-0 sm:p-4">
          <div className="absolute inset-0" onClick={() => setShowEditModal(false)} />

          <div className="relative z-10 flex flex-col w-full sm:max-w-2xl max-h-[95dvh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">

            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5">
                  <Edit3 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-gray-900">Edit Page</h2>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">{editingPage.slug}</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 rounded-xl hover:bg-gray-100 transition cursor-pointer">
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 pt-12 pb-6 custom-scrollbar space-y-5">

              {/* Core Config */}
              <section className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 space-y-4">
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" /> Core Configuration
                </h3>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Page Title</label>
                  <input
                    type="text"
                    value={editingPage.title}
                    onChange={e => setEditingPage({ ...editingPage, title: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
                    placeholder="Enter page title…"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Slug</label>
                    <input
                      type="text"
                      value={editingPage.slug}
                      onChange={e => setEditingPage({ ...editingPage, slug: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-mono text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Public URL</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={editingPage.url}
                        readOnly
                        className="w-full rounded-xl border border-gray-100 bg-gray-100 px-4 py-3 pr-10 text-xs font-bold text-blue-600 outline-none cursor-not-allowed"
                      />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white rounded-lg transition cursor-pointer">
                        <Copy className="h-3.5 w-3.5 text-blue-400" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Status</label>
                  <select
                    value={editingPage.status}
                    onChange={e => setEditingPage({ ...editingPage, status: e.target.value as 'published' | 'draft' | 'archived' })}
                    className="w-full rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500 transition cursor-pointer appearance-none"
                  >
                    <option value="published">Published (Live)</option>
                    <option value="draft">Draft (Private)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </section>

              {/* SEO */}
              <section className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 space-y-4">
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" /> SEO Optimization
                </h3>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Meta Title</label>
                  <input
                    type="text"
                    value={editingPage.seoTitle || ''}
                    onChange={e => setEditingPage({ ...editingPage, seoTitle: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Meta Description</label>
                  <textarea
                    value={editingPage.seoDescription || ''}
                    onChange={e => setEditingPage({ ...editingPage, seoDescription: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition resize-none leading-relaxed"
                  />
                </div>
              </section>

              {/* Components */}
              <section className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 space-y-3">
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <Layout className="h-4 w-4 text-emerald-500" /> Page Sections
                </h3>
                {editingPage.components.map((comp, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 hover:border-blue-300 transition cursor-move">
                    <span className="text-[11px] font-black uppercase tracking-wider text-gray-700">{comp}</span>
                    <MousePointer className="h-3.5 w-3.5 text-gray-300" />
                  </div>
                ))}
                <button className="w-full rounded-xl border-2 border-dashed border-gray-200 py-3 text-[10px] font-black uppercase tracking-wider text-gray-400 hover:border-blue-500 hover:text-blue-500 transition cursor-pointer">
                  + Add Section
                </button>
              </section>
            </div>

            {/* Footer — extended scroll for mobile */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 px-6 pb-32 sm:pb-6 pt-4 border-t border-gray-100 bg-white shrink-0">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 py-3 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition cursor-pointer"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="flex-2 rounded-xl bg-blue-600 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition active:scale-95 cursor-pointer"
              >
                Save & Deploy
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ════════════════════════════════════════
          ANALYTICS MODAL
      ════════════════════════════════════════ */}
      {showAnalyticsModal && analyticsPage && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-gray-900/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setShowAnalyticsModal(false)} />
          <div className="relative z-10 w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
            <div className="sm:hidden flex justify-center pt-3 pb-2"><div className="h-1 w-10 rounded-full bg-gray-200" /></div>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-black text-gray-900">Performance <span className="text-purple-600">Analytics</span></h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">{analyticsPage.title}</p>
              </div>
              <button onClick={() => setShowAnalyticsModal(false)} className="p-2 rounded-xl hover:bg-gray-100 transition cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 pt-12 grid grid-cols-3 gap-3">
              {[
                { val: analyticsPage.views.toLocaleString(), label: 'Total Views', color: 'blue' },
                { val: analyticsPage.conversions.toString(), label: 'Conversions', color: 'emerald' },
                { val: `${analyticsPage.conversionRate.toFixed(1)}%`, label: 'Conv. Rate', color: 'purple' },
              ].map((m, i) => (
                <div key={i} className={`rounded-2xl bg-${m.color}-50 p-4 text-center border border-${m.color}-100`}>
                  <p className={`text-2xl font-black text-${m.color}-600`}>{m.val}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-1">{m.label}</p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-32 sm:pb-6">
              <div className="flex flex-col items-center justify-center rounded-2xl bg-gray-900 py-10 text-center">
                <BarChart3 className="h-10 w-10 text-gray-700 mb-3" />
                <p className="text-sm font-bold text-gray-500">Advanced Charts Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ════════════════════════════════════════
          SETTINGS MODAL
      ════════════════════════════════════════ */}
      {showSettingsModal && settingsPage && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-gray-900/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setShowSettingsModal(false)} />
          <div className="relative z-10 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
            <div className="sm:hidden flex justify-center pt-3 pb-2"><div className="h-1 w-10 rounded-full bg-gray-200" /></div>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900">Page <span className="text-gray-400">Settings</span></h2>
              <button onClick={() => setShowSettingsModal(false)} className="p-2 rounded-xl hover:bg-gray-100 transition cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 pt-12 pb-5 space-y-3">
              {['Enable Analytics Tracking', 'Search Engine Indexing'].map((label, i) => (
                <label key={i} className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3.5 cursor-pointer hover:border-blue-300 transition">
                  <span className="text-sm font-bold text-gray-700">{label}</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-blue-600" />
                </label>
              ))}
            </div>
            <div className="px-6 pb-32 sm:pb-6 pt-2">
              <button
                onClick={() => { showNotify('Settings saved', 'success'); setShowSettingsModal(false); }}
                className="w-full rounded-xl bg-gray-900 py-3.5 text-[11px] font-black uppercase tracking-widest text-white hover:bg-black transition cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy URL modal */}
      {showCopyModal && copyingPage && (
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setShowCopyModal(false)}>
          <div className="rounded-2xl bg-white p-8 shadow-2xl flex flex-col items-center animate-in zoom-in-95 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="rounded-2xl bg-emerald-50 p-4 mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-black text-gray-900">Link Copied!</h3>
            <p className="mt-2 text-sm font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-xl text-center break-all">{copyingPage.url}</p>
            <button onClick={() => setShowCopyModal(false)} className="mt-5 w-full rounded-xl bg-gray-900 py-3 text-[11px] font-black uppercase tracking-widest text-white hover:bg-black transition cursor-pointer">
              Done
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingPage && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeletingPage(null); }}
          onConfirm={() => {
            setPages(pages.filter(p => p.id !== deletingPage.id));
            showNotify('Page deleted permanently', 'info');
          }}
          title="Delete Page"
          itemName={deletingPage.title}
          itemDetails={deletingPage.slug}
          warningMessage="This will unpublish the page and remove it from all servers."
        />
      )}

      {/* Toast */}
      {notification && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-200 animate-in slide-in-from-bottom-4 duration-300">
          <div className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-xl backdrop-blur border ${
            notification.type === 'success' ? 'bg-emerald-500/95 border-emerald-400/40 text-white' :
            notification.type === 'error' ? 'bg-rose-500/95 border-rose-400/40 text-white' :
            'bg-gray-900/95 border-gray-700 text-white'
          }`}>
            <div className="rounded-lg bg-white/20 p-1.5">
              {notification.type === 'success' ? <CheckCircle className="h-4 w-4" /> :
               notification.type === 'error' ? <XCircle className="h-4 w-4" /> :
               <Zap className="h-4 w-4" />}
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest">{notification.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
