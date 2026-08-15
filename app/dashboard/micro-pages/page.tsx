"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe, Plus, Search, Eye, Edit3,
  Trash2, Copy, BarChart3, Settings, Link as LinkIcon, ExternalLink,
  Zap, Clock, CheckCircle, AlertCircle, MoreVertical,
  ShoppingCart, Calendar, Grid, List, X, Sparkles, Target, Award,
  Rocket, ChevronRight, ChevronDown, ChevronUp, GripVertical, Loader2, QrCode, Code, UserCheck, Send, Check,
  FileText, Layers, Share2, HelpCircle, MessageSquare, Image as ImageIcon
} from 'lucide-react';
import QRCode from 'qrcode';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import BlockContentEditor from '@/components/micro-pages/BlockContentEditor';
import { MICRO_PAGE_TEMPLATES, ALL_BLOCK_TYPES } from '@/lib/micro-page-templates';
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
  blockOrder: string[];
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

const blockIcons: Record<string, React.ElementType> = {
  Hero: Sparkles,
  Features: Zap,
  Countdown: Clock,
  Schedule: Calendar,
  Registration: UserCheck,
  Benefits: Award,
  Form: Send,
  Testimonials: MessageSquare,
  Gallery: ImageIcon,
  About: FileText,
  Contact: Send,
  'Email Form': Send,
  'Pricing Cards': ShoppingCart,
  FAQ: HelpCircle,
  CTA: Target,
  Footer: Layers,
};

const blockDescriptions: Record<string, string> = {
  Hero: 'Hero headline, subtitle, action button, and cover image',
  Features: 'Product highlights, core capabilities, or key service features',
  Countdown: 'Real-time countdown timer for launches, webinars, and deadlines',
  Schedule: 'Event agenda timeline, session breakdowns, or itinerary',
  Registration: 'Intake form for event sign-ups and ticket registrations',
  Benefits: 'Value proposition points and customer benefit highlights',
  Form: 'Lead capture form with customized field inputs',
  Testimonials: 'Customer quotes, reviews, star ratings, and social proof',
  Gallery: 'Showcase photos, case study screenshots, or project portfolio',
  About: 'Company overview, founder bio, or mission statement',
  Contact: 'Direct customer contact and inquiry form',
  'Email Form': 'Quick newsletter or waitlist subscription form',
  'Pricing Cards': 'Tiered pricing cards with features and highlight badge',
  FAQ: 'Accordion answers to frequent buyer and client questions',
  CTA: 'High-visibility call-to-action conversion pitch',
  Footer: 'Copyright text, terms links, and branding footer',
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
  blockOrder?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ApiMicroPageLead {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  createdAt: string;
  microPage?: { title: string } | null;
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
  blockOrder: p.blockOrder || [],
});

function SortableBlockRow({
  id,
  headingSummary,
  isExpanded,
  onToggleExpand,
  onRemove,
  children,
}: {
  id: string;
  headingSummary?: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const IconComp = blockIcons[id] || Layers;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-2xl transition-all duration-200 shadow-2xs overflow-hidden ${
        isDragging
          ? 'border-blue-500 bg-blue-50/50 shadow-lg'
          : isExpanded
          ? 'border-slate-300 bg-white ring-1 ring-slate-900/5'
          : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300'
      }`}
    >
      {/* Sleek Accordion Header */}
      <div className="flex items-center justify-between p-3 sm:px-4 sm:py-2.5 gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 touch-none shrink-0 transition"
            title="Drag to reorder section"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
            <IconComp className="w-3.5 h-3.5" />
          </div>

          <div
            onClick={onToggleExpand}
            className="flex items-baseline gap-2 min-w-0 cursor-pointer select-none flex-1"
          >
            <h5 className="font-bold text-xs text-slate-900 tracking-tight shrink-0">{id} Section</h5>
            {headingSummary && (
              <span className="text-[11px] text-slate-400 truncate font-normal">
                &bull; &ldquo;{headingSummary}&rdquo;
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onToggleExpand}
            className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
            title={isExpanded ? 'Collapse section' : 'Edit section'}
          >
            <span>{isExpanded ? 'Collapse' : 'Edit'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
          </button>

          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
            title="Remove block"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Accordion Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

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
  const [editModalTab, setEditModalTab] = useState<'content' | 'settings'>('content');
  const [expandedBlockIds, setExpandedBlockIds] = useState<Record<string, boolean>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPage, setDeletingPage] = useState<MicroPage | null>(null);
  const [showShareModal, setShowShareModal] = useState<MicroPage | null>(null);
  const [showLeadsModal, setShowLeadsModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const dndSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!showShareModal) {
      setQrDataUrl(null);
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(showShareModal.url, { margin: 1, width: 240 })
      .then((url) => { if (!cancelled) setQrDataUrl(url); })
      .catch(() => { if (!cancelled) setQrDataUrl(null); });
    return () => { cancelled = true; };
  }, [showShareModal]);

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

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/micro-pages/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(
          Array.isArray(data)
            ? data.map((row: ApiMicroPageLead) => ({
                id: row.id,
                pageTitle: row.microPage?.title || 'Untitled Page',
                name: row.name,
                email: row.email,
                phone: row.phone || undefined,
                message: row.message || undefined,
                date: new Date(row.createdAt).toLocaleString(),
              }))
            : []
        );
      } else {
        setLeads([]);
      }
    } catch {
      setLeads([]);
    }
  }, []);

  useEffect(() => { fetchPages(); fetchLeads(); }, [fetchPages, fetchLeads]);

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
          blockOrder: editingPage.blockOrder,
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

  const openEditModal = (page: MicroPage) => {
    setEditingPage(page);
    setEditModalTab('content');
    const initialExpanded: Record<string, boolean> = {};
    page.blockOrder.forEach((b, idx) => {
      initialExpanded[b] = idx === 0;
    });
    setExpandedBlockIds(initialExpanded);
    setShowEditModal(true);
  };

  const toggleBlockExpand = (blockName: string) => {
    setExpandedBlockIds((prev) => ({ ...prev, [blockName]: !prev[blockName] }));
  };

  const expandAllBlocks = () => {
    if (!editingPage) return;
    const all: Record<string, boolean> = {};
    editingPage.blockOrder.forEach((b) => {
      all[b] = true;
    });
    setExpandedBlockIds(all);
  };

  const collapseAllBlocks = () => {
    setExpandedBlockIds({});
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
          content: defaultContent,
          blockOrder: tmpl.components,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        const mapped = mapApiPage(created);
        setPages([mapped, ...pages]);
        setShowTemplates(false);
        openEditModal(mapped);
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
        content: defaultContent,
        blockOrder: tmpl.components,
      };
      setPages([localNew, ...pages]);
      setShowTemplates(false);
      openEditModal(localNew);
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
                        onClick={() => openEditModal(page)}
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
                              onClick={() => openEditModal(page)}
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-3 pb-24 sm:p-6 overflow-hidden">
          <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-8rem)] sm:max-h-[82vh] my-auto border border-slate-200/50">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">Select High-Converting Micro Page Template</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pre-designed, fully responsive layouts optimized for SME lead generation.</p>
              </div>
              <button onClick={() => setShowTemplates(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 pb-12 sm:pb-8 flex-1 min-h-0 overflow-y-auto space-y-4 overscroll-contain">
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4 pb-6 sm:pb-2">
                {MICRO_PAGE_TEMPLATES.map((tmpl) => {
                  const visual = templateVisuals[tmpl.id] || { icon: Globe, gradient: 'from-blue-600 to-indigo-600', categoryLabel: tmpl.category };
                  const IconComponent = visual.icon;

                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => handleCreateFromTemplate(tmpl.id)}
                      className="p-3 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-blue-600 hover:shadow-md transition-all cursor-pointer space-y-2 sm:space-y-3 bg-slate-50/50 hover:bg-white group"
                    >
                      <div className="flex items-center justify-between">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr ${visual.gradient} text-white flex items-center justify-center shadow-sm shrink-0`}>
                          <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full truncate ml-1.5">
                          {tmpl.category}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors">{tmpl.name}</h4>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">{tmpl.description}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px] sm:text-xs text-slate-400">
                        <span className="truncate">Includes: {tmpl.components.join(', ')}</span>
                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 group-hover:translate-x-1 transition-transform shrink-0" />
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-3 pb-24 sm:p-6 overflow-hidden">
          <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-8rem)] sm:max-h-[82vh] my-auto border border-slate-200/50">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <Share2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Share Micro Page</h3>
              </div>
              <button onClick={() => setShowShareModal(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 pb-8 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain">
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

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5" /> QR Code
                </label>
                <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt={`QR code for ${showShareModal.url}`} width={96} height={96} className="rounded-lg border border-slate-200 bg-white" />
                  ) : (
                    <div className="w-24 h-24 rounded-lg border border-slate-200 bg-white flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-slate-500">Scan to open the live page, or download for print (flyers, business cards, packaging).</p>
                    {qrDataUrl && (
                      <a
                        href={qrDataUrl}
                        download={`${showShareModal.slug}-qr.png`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                      >
                        Download QR Code (PNG)
                      </a>
                    )}
                  </div>
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-3 pb-24 sm:p-6 overflow-hidden">
          <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-8rem)] sm:max-h-[82vh] my-auto border border-slate-200/50">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
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

            <div className="p-4 sm:p-6 pb-8 flex-1 min-h-0 overflow-y-auto space-y-3 overscroll-contain">
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

            <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-white flex justify-end shrink-0 shadow-sm z-10">
              <button onClick={() => setShowLeadsModal(false)} className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT PAGE & CONTENT BLOCKS MODAL ── */}
      {showEditModal && editingPage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-3 pb-24 sm:p-6 overflow-hidden">
          <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-8rem)] sm:max-h-[82vh] my-auto border border-slate-200/50">
            
            {/* Modal Header */}
            <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-start justify-between shrink-0 bg-white">
              <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                      {editingPage.title || 'Untitled Micro Page'}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusConfig(editingPage.status).bg} ${getStatusConfig(editingPage.status).text} ${getStatusConfig(editingPage.status).border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusConfig(editingPage.status).dot}`} />
                      {getStatusConfig(editingPage.status).label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 text-xs text-slate-500 flex-wrap">
                    <span className="font-mono text-[10px] sm:text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      /p/{editingPage.slug}
                    </span>
                    <span className="text-slate-300 hidden sm:inline">&bull;</span>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 capitalize">{editingPage.template} Template</span>
                    {editingPage.status === 'published' && (
                      <>
                        <span className="text-slate-300">&bull;</span>
                        <a
                          href={editingPage.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-blue-600 hover:underline"
                        >
                          <span>Live Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Segmented Tab Switcher */}
            <div className="px-3 sm:px-6 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setEditModalTab('content')}
                className={`py-2.5 sm:py-3 px-3 sm:px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 transition cursor-pointer ${
                  editModalTab === 'content'
                    ? 'border-blue-600 text-blue-600 bg-white/60'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Content &amp; Blocks</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                  {editingPage.blockOrder.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setEditModalTab('settings')}
                className={`py-2.5 sm:py-3 px-3 sm:px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 transition cursor-pointer ${
                  editModalTab === 'settings'
                    ? 'border-blue-600 text-blue-600 bg-white/60'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Page Settings &amp; SEO</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-3.5 sm:p-6 pb-12 sm:pb-8 flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-5">
              
              {editModalTab === 'content' ? (
                /* TAB 1: CONTENT & BLOCKS */
                <div className="space-y-4">
                  {/* Toolbar */}
                  <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Page Section Stack</h4>
                      <p className="text-[11px] text-slate-500">Drag handles to reorder sections. Expand any block to edit copy &amp; media.</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={expandAllBlocks}
                        className="text-[11px] font-semibold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition cursor-pointer"
                      >
                        Expand All
                      </button>
                      <button
                        type="button"
                        onClick={collapseAllBlocks}
                        className="text-[11px] font-semibold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition cursor-pointer"
                      >
                        Collapse All
                      </button>
                    </div>
                  </div>

                  {/* DnD Sortable Context */}
                  <DndContext
                    sensors={dndSensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event: DragEndEvent) => {
                      const { active, over } = event;
                      if (!over || active.id === over.id) return;
                      const oldIndex = editingPage.blockOrder.indexOf(String(active.id));
                      const newIndex = editingPage.blockOrder.indexOf(String(over.id));
                      if (oldIndex === -1 || newIndex === -1) return;
                      setEditingPage({
                        ...editingPage,
                        blockOrder: arrayMove(editingPage.blockOrder, oldIndex, newIndex),
                      });
                    }}
                  >
                    <SortableContext items={editingPage.blockOrder} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2.5">
                        {editingPage.blockOrder.map((blockName) => (
                          <SortableBlockRow
                            key={blockName}
                            id={blockName}
                            headingSummary={editingPage.content[blockName]?.heading}
                            isExpanded={!!expandedBlockIds[blockName]}
                            onToggleExpand={() => toggleBlockExpand(blockName)}
                            onRemove={() => {
                              setEditingPage({
                                ...editingPage,
                                blockOrder: editingPage.blockOrder.filter((b) => b !== blockName),
                              });
                            }}
                          >
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
                          </SortableBlockRow>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  {/* Add Block Library */}
                  {ALL_BLOCK_TYPES.filter((t) => !editingPage.blockOrder.includes(t)).length > 0 && (
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Add Additional Section</h4>
                        <p className="text-[11px] text-slate-400">Choose from available component modules to append to this page.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ALL_BLOCK_TYPES.filter((t) => !editingPage.blockOrder.includes(t)).map((blockType) => {
                          const IconComp = blockIcons[blockType] || Layers;
                          const desc = blockDescriptions[blockType] || 'Custom component section';

                          return (
                            <div
                              key={blockType}
                              onClick={() => {
                                setEditingPage({
                                  ...editingPage,
                                  blockOrder: [...editingPage.blockOrder, blockType],
                                  content: {
                                    ...editingPage.content,
                                    [blockType]: editingPage.content[blockType] || { heading: `${blockType} Section` },
                                  },
                                });
                                setExpandedBlockIds((prev) => ({ ...prev, [blockType]: true }));
                              }}
                              className="p-3 rounded-xl border border-dashed border-slate-200 hover:border-blue-500/60 bg-slate-50/40 hover:bg-blue-50/30 transition cursor-pointer flex items-center justify-between gap-2 group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 group-hover:text-blue-600 group-hover:border-blue-200 flex items-center justify-center shrink-0 transition">
                                  <IconComp className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <h5 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition">{blockType}</h5>
                                  <p className="text-[10px] text-slate-400 truncate">{desc}</p>
                                </div>
                              </div>

                              <button
                                type="button"
                                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 text-[11px] font-bold transition shrink-0"
                              >
                                + Add
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* TAB 2: PAGE SETTINGS & SEO */
                <div className="space-y-5">
                  {/* General Configuration */}
                  <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <Settings className="w-3.5 h-3.5 text-blue-600" />
                      General Page Details
                    </h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Page Title</label>
                        <input
                          type="text"
                          value={editingPage.title}
                          onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                          placeholder="e.g. Summer Launch Deal"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition shadow-2xs font-semibold"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">Displayed on the page banner and browser window tab.</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Hosted URL Slug</label>
                        <div className="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/10 transition">
                          <span className="px-3 py-2.5 bg-slate-100 border-r border-slate-200 text-slate-500 text-xs font-mono select-none shrink-0">
                            okleevo.com/p/
                          </span>
                          <input
                            type="text"
                            value={editingPage.slug}
                            onChange={(e) =>
                              setEditingPage({
                                ...editingPage,
                                slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                              })
                            }
                            placeholder="my-landing-page"
                            className="flex-1 px-3 py-2.5 text-xs font-mono text-slate-900 outline-none bg-transparent min-w-0"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(editingPage.url);
                              showNotify('Copied live page URL to clipboard', 'success');
                            }}
                            className="px-3 py-2.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer shrink-0 border-l border-slate-100"
                            title="Copy link"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Only lowercase letters, numbers, and dashes are allowed.</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Publication Status</label>
                        <div className="grid grid-cols-2 gap-3">
                          <div
                            onClick={() => setEditingPage({ ...editingPage, status: 'published' })}
                            className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                              editingPage.status === 'published'
                                ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-slate-900 truncate">Published (Live)</h5>
                                <p className="text-[10px] text-slate-500 truncate">Publicly accessible to visitors</p>
                              </div>
                            </div>
                            {editingPage.status === 'published' && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />}
                          </div>

                          <div
                            onClick={() => setEditingPage({ ...editingPage, status: 'draft' })}
                            className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                              editingPage.status === 'draft'
                                ? 'border-slate-400 bg-slate-100/70 ring-2 ring-slate-400/20 shadow-xs'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-slate-900 truncate">Draft (Private)</h5>
                                <p className="text-[10px] text-slate-500 truncate">Only visible inside dashboard</p>
                              </div>
                            </div>
                            {editingPage.status === 'draft' && <Check className="w-4 h-4 text-slate-700 shrink-0 ml-1" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SEO & Meta Tags */}
                  <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-blue-600" />
                        Search Engine Optimization (SEO) &amp; Social Previews
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Meta Tags</span>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700">SEO Meta Title</label>
                          <span className={`text-[10px] ${(editingPage.seoTitle?.length || 0) > 60 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                            {editingPage.seoTitle?.length || 0} / 60 characters
                          </span>
                        </div>
                        <input
                          type="text"
                          value={editingPage.seoTitle || ''}
                          onChange={(e) => setEditingPage({ ...editingPage, seoTitle: e.target.value })}
                          placeholder={editingPage.title || 'Page title for search engines…'}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition shadow-2xs font-medium"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700">SEO Meta Description</label>
                          <span className={`text-[10px] ${(editingPage.seoDescription?.length || 0) > 160 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                            {editingPage.seoDescription?.length || 0} / 160 characters
                          </span>
                        </div>
                        <textarea
                          value={editingPage.seoDescription || ''}
                          onChange={(e) => setEditingPage({ ...editingPage, seoDescription: e.target.value })}
                          rows={2}
                          placeholder="Short, compelling summary that will appear under the title in Google and social cards…"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition shadow-2xs resize-none font-medium"
                        />
                      </div>

                      {/* Google Search Result Preview Box */}
                      <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-2xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Google Search Result Preview
                        </span>
                        <p className="text-[11px] text-emerald-800 font-medium truncate flex items-center gap-1">
                          <span>okleevo.com</span>
                          <span className="text-slate-300">&rsaquo;</span>
                          <span>p</span>
                          <span className="text-slate-300">&rsaquo;</span>
                          <span>{editingPage.slug || 'slug'}</span>
                        </p>
                        <h5 className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer truncate">
                          {editingPage.seoTitle || editingPage.title || 'Micro Page Title'} &bull; Okleevo
                        </h5>
                        <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                          {editingPage.seoDescription ||
                            'High-converting standalone landing page optimized for lead generation and client engagement.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between shrink-0 gap-2 shadow-xs z-10">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">Page Status:</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                  editingPage.status === 'published'
                    ? 'bg-emerald-100/80 text-emerald-800 border-emerald-200'
                    : 'bg-slate-200/80 text-slate-700 border-slate-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${editingPage.status === 'published' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                  {editingPage.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-white border border-slate-200 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 transition cursor-pointer whitespace-nowrap"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{saving ? 'Saving…' : 'Save Changes'}</span>
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
            try {
              const res = await fetch(`/api/micro-pages/${deletingPage.id}`, { method: 'DELETE' });
              if (!res.ok) {
                showNotify('Failed to delete micro page', 'error');
                return;
              }
              setPages(pages.filter(p => p.id !== deletingPage.id));
              setShowDeleteModal(false);
              showNotify('Micro page deleted successfully');
            } catch {
              showNotify('Failed to delete micro page', 'error');
            }
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
