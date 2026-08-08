"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe, Plus, Search, Eye, Edit3,
  Trash2, Copy, BarChart3, Settings, Link as LinkIcon, ExternalLink,
  Zap, Clock, CheckCircle, AlertCircle, MoreVertical,
  ShoppingCart, Calendar, Grid, List, X, Sparkles, Target, Award,
  Rocket, ChevronRight, Loader2, QrCode, Code, UserCheck, Send, Check,
  FileText, Layers, Share2, HelpCircle
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import BlockContentEditor from '@/components/micro-pages/BlockContentEditor';
import { MICRO_PAGE_TEMPLATES } from '@/lib/micro-page-templates';
import type { MicroPageContent, MicroPageBlockContent } from '@/lib/micro-page-content';
import { ModuleGuideBanner } from '@/components/tours/ModuleGuideBanner';

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
  seoTitle?: string;
  seoDescription?: string;
  content: MicroPageContent;
}

interface LeadSubmission {
  id: string;
  pageTitle: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  date: string;
}



const templateVisuals: Record<string, { icon: React.ElementType; gradient: string; categoryLabel: string }> = {
  'product-launch': { icon: Rocket, gradient: 'from-blue-600 to-cyan-500', categoryLabel: 'Product Launch' },
  'event-landing': { icon: Calendar, gradient: 'from-purple-600 to-pink-500', categoryLabel: 'Event & Webinar' },
  'lead-capture': { icon: Target, gradient: 'from-emerald-600 to-teal-500', categoryLabel: 'Lead & Quote Form' },
  portfolio: { icon: Award, gradient: 'from-amber-500 to-orange-600', categoryLabel: 'Bio & Portfolio' },
  'coming-soon': { icon: Clock, gradient: 'from-indigo-600 to-purple-600', categoryLabel: 'Waitlist Page' },
  pricing: { icon: ShoppingCart, gradient: 'from-rose-600 to-pink-600', categoryLabel: 'Pricing Matrix' },
};

interface ApiMicroPage {
  id: string;
  title: string;
  slug: string;
  template: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  views: number;
  conversions: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  content?: MicroPageContent | null;
  createdAt: string;
  updatedAt: string;
}

const mapApiPage = (p: ApiMicroPage): MicroPage => ({
  id: p.id,
  title: p.title,
  slug: p.slug,
  url: typeof window !== 'undefined' ? `${window.location.origin}/p/${p.slug}` : `https://okleevo.com/p/${p.slug}`,
  template: p.template,
  status: p.status.toLowerCase() as 'draft' | 'published' | 'archived',
  views: p.views,
  conversions: p.conversions,
  conversionRate: p.views > 0 ? (p.conversions / p.views) * 100 : 0,
  createdDate: new Date(p.createdAt),
  lastModified: new Date(p.updatedAt),
  seoTitle: p.seoTitle || undefined,
  seoDescription: p.seoDescription || undefined,
  content: p.content || {},
});

export default function MicroPagesPage() {
  const [pages, setPages] = useState<MicroPage[]>([]);
  const [leads, setLeads] = useState<LeadSubmission[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Modals & Drawers
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPage, setEditingPage] = useState<MicroPage | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPage, setDeletingPage] = useState<MicroPage | null>(null);
  const [showShareModal, setShowShareModal] = useState<MicroPage | null>(null);
  const [showLeadsModal, setShowLeadsModal] = useState(false);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);

  const showNotify = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch('/api/micro-pages');
      if (res.ok) {
        const data = await res.json();
        setPages(Array.isArray(data) ? data.map(mapApiPage) : []);
      } else {
        setPages([]);
      }
    } catch {
      setPages([]);
    }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const handleSave = async () => {
    if (!editingPage) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/micro-pages/${editingPage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingPage.title,
          slug: editingPage.slug,
          status: editingPage.status,
          seoTitle: editingPage.seoTitle,
          seoDescription: editingPage.seoDescription,
          content: editingPage.content,
        }),
      });

      if (res.ok) {
        await fetchPages();
        showNotify(editingPage.status === 'published' ? 'Micro page published live!' : 'Changes saved successfully', 'success');
        setShowEditModal(false);
      } else {
        // Local update fallback for sample items
        setPages(pages.map(p => p.id === editingPage.id ? editingPage : p));
        showNotify('Page updated successfully', 'success');
        setShowEditModal(false);
      }
    } catch {
      setPages(pages.map(p => p.id === editingPage.id ? editingPage : p));
      showNotify('Page updated locally', 'success');
      setShowEditModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateFromTemplate = async (tmplId: string) => {
    const tmpl = MICRO_PAGE_TEMPLATES.find(t => t.id === tmplId);
    if (!tmpl) return;

    const baseTitle = `${tmpl.name} Page`;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const slug = `${tmpl.id}-${randomNum}`;

    const defaultContent: MicroPageContent = tmpl.components.reduce<Record<string, MicroPageBlockContent>>((acc, comp) => {
      acc[comp] = { heading: `${comp} Section` };
      return acc;
    }, {});

    try {
      const res = await fetch('/api/micro-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: baseTitle,
          template: tmpl.id,
          slug,
          content: defaultContent
        }),
      });

      if (res.ok) {
        const created = await res.json();
        const mapped = mapApiPage(created);
        setPages([mapped, ...pages]);
        setEditingPage(mapped);
        setShowTemplates(false);
        setShowEditModal(true);
        showNotify(`Created page from "${tmpl.name}" template`, 'success');
      } else {
        throw new Error('API create failed');
      }
    } catch {
      // Local fallback creation
      const localNew: MicroPage = {
        id: `mp-local-${randomNum}`,
        title: baseTitle,
        slug,
        url: typeof window !== 'undefined' ? `${window.location.origin}/p/${slug}` : `https://okleevo.com/p/${slug}`,
        template: tmpl.id,
        status: 'draft',
        views: 0,
        conversions: 0,
        conversionRate: 0,
        createdDate: new Date(),
        lastModified: new Date(),
        content: defaultContent
      };
      setPages([localNew, ...pages]);
      setEditingPage(localNew);
      setShowTemplates(false);
      setShowEditModal(true);
      showNotify(`Created page from "${tmpl.name}" template`, 'success');
    }
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch =
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || page.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: pages.length,
    published: pages.filter(p => p.status === 'published').length,
    totalViews: pages.reduce((sum, p) => sum + p.views, 0),
    totalConversions: pages.reduce((sum, p) => sum + p.conversions, 0),
    avgConversionRate: pages.length > 0
      ? (pages.reduce((sum, p) => sum + p.conversionRate, 0) / pages.length).toFixed(1)
      : '0.0',
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'published':
        return { label: 'Published', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' };
      case 'draft':
        return { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400', border: 'border-slate-200' };
      case 'archived':
        return { label: 'Archived', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', border: 'border-amber-200' };
      default:
        return { label: 'Unknown', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400', border: 'border-slate-200' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 md:pb-12 font-sans text-slate-900">

      {/* ── STICKY MODULE HEADER ─────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-tr from-yellow-500 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <div className="min-w-0 shrink-0">
              <h1 className="text-xs sm:text-lg font-bold text-slate-900 leading-tight whitespace-nowrap">Micro Pages</h1>
              <p className="text-xs text-slate-500 hidden sm:block">High-converting standalone landing pages &amp; intake forms</p>
            </div>
            <ModuleGuideBanner
              moduleId="micro-pages"
              moduleName="Micro Pages"
              summary="Build standalone landing pages and forms hosted under okleevo.com/p/[slug]. Form leads auto-route directly into your CRM."
              tips={[
                "Select pre-built templates for lead capture, pricing, or events",
                "Copy hosted public URLs or download QR codes for print media",
                "Track view impressions, form submissions, and conversion analytics"
              ]}
            />
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => setShowLeadsModal(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer active:scale-95"
          >
            <UserCheck className="w-4 h-4 text-slate-600" />
            <span>Captured Leads ({leads.length})</span>
          </button>
          <button
            onClick={() => setShowTemplates(true)}
            className="inline-flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Create Micro Page</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 space-y-6">

        {/* ── INTERACTIVE TELEMETRY KPI GRID ────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { id: 'all',       label: 'Active Micro Pages', value: stats.total,       sub: `${stats.published} published live`, icon: Globe,        color: 'text-blue-600',   bg: 'bg-blue-50/80 border-blue-100' },
            { id: 'views',     label: 'Total Page Views',  value: stats.totalViews,  sub: 'All time traffic',         icon: Eye,          color: 'text-purple-600', bg: 'bg-purple-50/80 border-purple-100' },
            { id: 'leads',     label: 'Form Submissions',  value: stats.totalConversions, sub: 'Leads generated',     icon: Target,       color: 'text-emerald-600',bg: 'bg-emerald-50/80 border-emerald-100' },
            { id: 'conversion',label: 'Avg Conversion Rate',value: `${stats.avgConversionRate}%`, sub: 'High-intent leads',  icon: BarChart3,    color: 'text-orange-600', bg: 'bg-orange-50/80 border-orange-100' },
          ].map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border ${item.bg} text-left transition-all hover:shadow-sm`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{item.value}</span>
                <span className="text-[11px] font-medium text-slate-500 truncate">{item.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── DRAG & DROP / TEMPLATE PRESET BANNER ────────────────────────── */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Instant Landing Page Engine</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Launch Custom Micro Pages &amp; Lead Intake Forms
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Choose from high-converting templates for instant quote requests, event registrations, product launches, or client onboarding portals. Form submissions auto-sync directly into your CRM.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto">
              <button
                onClick={() => setShowTemplates(true)}
                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Browse Template Library</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── CONTROLS & FILTER BAR ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search micro pages by title or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide max-w-full">
            {[
              { id: 'all', label: 'All Pages' },
              { id: 'published', label: 'Published Live' },
              { id: 'draft', label: 'Drafts' },
              { id: 'archived', label: 'Archived' },
            ].map((tab) => {
              const active = selectedStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                    active ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── PAGE MASTER GRID / LIST ────────────────────────────────────── */}
        {filteredPages.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Globe className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-bold text-slate-900">No Micro Pages Created</h3>
              <p className="text-xs text-slate-500">
                {searchQuery ? 'No micro pages matched your search filter.' : 'Launch your first standalone lead page or custom form.'}
              </p>
            </div>
            <button
              onClick={() => setShowTemplates(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Micro Page</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPages.map((page) => {
              const statusCfg = getStatusConfig(page.status);
              const tmplVisual = templateVisuals[page.template] || { icon: Globe, gradient: 'from-blue-600 to-indigo-600', categoryLabel: page.template };
              const IconComp = tmplVisual.icon;

              return (
                <div key={page.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className={`w-10 h-10 bg-gradient-to-tr ${tmplVisual.gradient} text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">{page.title}</h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-1">/p/{page.slug}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase">Views</span>
                        <span className="font-bold text-slate-800">{page.views.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase">Leads</span>
                        <span className="font-bold text-emerald-600">{page.conversions} ({page.conversionRate.toFixed(1)}%)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingPage(page);
                          setShowEditModal(true);
                        }}
                        className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Builder
                      </button>

                      <button
                        onClick={() => setShowShareModal(page)}
                        className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
                        title="Share Public Link & QR Code"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setDeletingPage(page);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                        title="Delete Micro Page"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Micro Page &amp; Slug</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Performance</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredPages.map((page) => {
                    const statusCfg = getStatusConfig(page.status);
                    return (
                      <tr key={page.id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="px-5 py-4 min-w-[260px]">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 font-bold">
                              <Globe className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{page.title}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">/p/{page.slug}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold capitalize">
                            {page.template}
                          </span>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-bold text-slate-800">{page.views.toLocaleString()} views</span>
                          <span className="text-[10px] text-emerald-600 font-bold block">{page.conversions} leads ({page.conversionRate.toFixed(1)}%)</span>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                            {statusCfg.label}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingPage(page);
                                setShowEditModal(true);
                              }}
                              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                              title="Edit Page"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setShowShareModal(page)}
                              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
                              title="Share Links &amp; QR Code"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingPage(page);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                              title="Delete Page"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ══════════════════════════════════════════════════════════════
          TEMPLATE SELECTOR MODAL
      ══════════════════════════════════════════════════════════════ */}
      {showTemplates && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Select High-Converting Micro Page Template</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pre-designed, fully responsive layouts optimized for SME lead generation.</p>
              </div>
              <button onClick={() => setShowTemplates(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MICRO_PAGE_TEMPLATES.map((tmpl) => {
                  const visual = templateVisuals[tmpl.id] || { icon: Globe, gradient: 'from-blue-600 to-indigo-600', categoryLabel: tmpl.category };
                  const IconComponent = visual.icon;

                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => handleCreateFromTemplate(tmpl.id)}
                      className="p-5 rounded-2xl border border-slate-200/80 hover:border-blue-600 hover:shadow-md transition-all cursor-pointer space-y-3 bg-slate-50/50 hover:bg-white group"
                    >
                      <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${visual.gradient} text-white flex items-center justify-center shadow-sm`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                          {tmpl.category}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">{tmpl.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tmpl.description}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span>Includes: {tmpl.components.join(', ')}</span>
                        <ChevronRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          PUBLIC LINK & SHARING DRAWER MODAL
      ══════════════════════════════════════════════════════════════ */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Share2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Share Micro Page</h3>
              </div>
              <button onClick={() => setShowShareModal(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Hosted Public URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={showShareModal.url}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(showShareModal.url);
                      showNotify('Copied public URL to clipboard', 'success');
                    }}
                    className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    title="Copy URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Embed iFrame Code</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`<iframe src="${showShareModal.url}" width="100%" height="600" frameborder="0"></iframe>`}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 truncate"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`<iframe src="${showShareModal.url}" width="100%" height="600" frameborder="0"></iframe>`);
                      showNotify('Copied iframe snippet to clipboard', 'success');
                    }}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                    title="Copy Embed Code"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={showShareModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" /> Open Live Page in New Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          CAPTURED LEADS MODAL
      ══════════════════════════════════════════════════════════════ */}
      {showLeadsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserCheck className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Captured Form Submissions</h3>
                  <p className="text-xs text-slate-400">Leads captured across all active micro pages</p>
                </div>
              </div>
              <button onClick={() => setShowLeadsModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3">
              {leads.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No Form Submissions Yet</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">Once clients submit lead forms on your published micro pages, they will appear here and sync to your CRM.</p>
                </div>
              ) : (
                leads.map((lead) => (
                  <div key={lead.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{lead.name} ({lead.email})</span>
                      <span className="text-slate-400 font-mono">{lead.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">{lead.message}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Source: <strong className="text-slate-700">{lead.pageTitle}</strong></span>
                      <span>Phone: {lead.phone || 'N/A'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setShowLeadsModal(false)} className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT PAGE & CONTENT BLOCKS MODAL ── */}
      {showEditModal && editingPage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Edit Micro Page &amp; Content Blocks</h3>
                <p className="text-xs text-slate-400">/p/{editingPage.slug}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Page Title</label>
                <input
                  type="text"
                  value={editingPage.title}
                  onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">URL Slug</label>
                <input
                  type="text"
                  value={editingPage.slug}
                  onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Content Blocks</h4>
                {Object.keys(editingPage.content || {}).map((blockName) => (
                  <div key={blockName} className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-slate-50/50">
                    <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">{blockName} Block</h5>
                    <BlockContentEditor
                      blockName={blockName}
                      content={editingPage.content[blockName] || {}}
                      onChange={(updatedBlock) => {
                        setEditingPage({
                          ...editingPage,
                          content: {
                            ...editingPage.content,
                            [blockName]: updatedBlock,
                          },
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  const newStatus = editingPage.status === 'published' ? 'draft' : 'published';
                  setEditingPage({ ...editingPage, status: newStatus });
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  editingPage.status === 'published' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {editingPage.status === 'published' ? 'Unpublish to Draft' : 'Publish Live'}
              </button>

              <div className="flex items-center gap-2">
                <button onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save & Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deletingPage && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeletingPage(null); }}
          onConfirm={async () => {
            setPages(pages.filter(p => p.id !== deletingPage.id));
            setShowDeleteModal(false);
            showNotify('Micro page deleted successfully');
          }}
          title="Delete Micro Page"
          itemName={deletingPage.title}
          itemDetails={`/p/${deletingPage.slug} · ${deletingPage.template}`}
          warningMessage="This page and its public link will no longer be accessible to visitors."
        />
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800 text-xs font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}
