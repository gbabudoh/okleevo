'use client';

import { useState, useEffect, useCallback, type ReactNode, type FormEvent } from 'react';
import {
  Plus, Mail, TrendingUp, Users, MousePointer2, BarChart3,
  Calendar, Search, LayoutGrid, List, Rocket, Clock, Loader2, X,
  CheckCircle, ChevronRight, Trash2, Pencil, Send, AlertTriangle,
  CheckCircle2, CalendarClock, Sparkles, Check
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import TourProvider from '@/components/tours/TourProvider';
import { ModuleGuideBanner } from '@/components/tours/ModuleGuideBanner';
import { campaignsTourSteps } from './tour-steps';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  content?: string | null;
  type: string;
  status: string;
  audience: string;
  sent: number;
  opened: number;
  clicked: number;
  revenue: number;
  createdAt: string;
  scheduledAt?: string;
}

function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const KNOWN_SEGMENTS = new Set(['all subscribers', 'vip customers', 'new signups', 'inactive']);

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-sm font-medium bg-white';
const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';
const modalHeaderCls = 'px-5 sm:px-6 py-3 sm:py-5 flex items-center justify-between shrink-0 border-b border-gray-100';

const ModalHandle = () => (
  <div className="flex justify-center pt-2 pb-0 sm:hidden shrink-0">
    <div className="w-10 h-1 rounded-full bg-gray-300" />
  </div>
);

const ModalFooter = ({ children }: { children: ReactNode }) => (
  <div className="shrink-0 bg-white border-t border-gray-100 px-4 sm:px-6 pt-3.5 pb-8 sm:pb-5 flex flex-row gap-2.5 mb-1.5 sm:mb-0">
    {children}
  </div>
);

const typeConfig = (type: string) => {
  switch (type.toUpperCase()) {
    case 'PROMOTIONAL':  return { icon: Rocket,   bg: 'bg-orange-500',  label: 'Promo' };
    case 'NEWSLETTER':   return { icon: Mail,      bg: 'bg-blue-600',    label: 'Newsletter' };
    case 'ANNOUNCEMENT': return { icon: Calendar,  bg: 'bg-emerald-600', label: 'Announce' };
    default:             return { icon: Mail,      bg: 'bg-purple-600',  label: type };
  }
};

const statusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed': case 'sent': return 'bg-emerald-100 text-emerald-700';
    case 'sending':   return 'bg-blue-100 text-blue-700';
    case 'scheduled': return 'bg-amber-100 text-amber-700';
    default:          return 'bg-gray-100 text-gray-600';
  }
};

const SEGMENTS = ['All Subscribers', 'VIP Customers', 'New Signups', 'Inactive'];

export default function CampaignsPage() {
  const [campaigns, setCampaigns]         = useState<Campaign[]>([]);
  const [loading, setLoading]             = useState(true);
  const [viewMode, setViewMode]           = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm]       = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating]           = useState(false);
  const emptyCampaignForm = { name: '', subject: '', type: 'PROMOTIONAL', audience: 'All Subscribers', content: '', scheduledAt: '', revenue: '' };
  const [newCampaign, setNewCampaign]     = useState(emptyCampaignForm);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [selectedReport, setSelectedReport] = useState<Campaign | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);
  const [sendTarget, setSendTarget]       = useState<Campaign | null>(null);
  const [sendingId, setSendingId]         = useState<string | null>(null);
  const [toast, setToast]                 = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const notify = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(current => (current?.message === message ? null : current)), 5000);
  }, []);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      if (Array.isArray(data)) setCampaigns(data);
    } catch { notify('error', 'Could not load campaigns. Check your connection and try again.'); } finally { setLoading(false); }
  }, [notify]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        ...newCampaign,
        scheduledAt: newCampaign.scheduledAt ? new Date(newCampaign.scheduledAt).toISOString() : null,
        revenue: newCampaign.revenue !== '' ? Number(newCampaign.revenue) : undefined,
      };
      const res = await fetch(
        editingCampaign ? `/api/campaigns/${editingCampaign.id}` : '/api/campaigns',
        {
          method: editingCampaign ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        resetModal();
        notify('success', editingCampaign ? 'Campaign updated.' : 'Campaign created.');
        fetchCampaigns();
      } else {
        const data = await res.json().catch(() => ({}));
        notify('error', data.error || 'Something went wrong. Please try again.');
      }
    } catch { notify('error', 'Network error — please try again.'); } finally { setCreating(false); }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setNewCampaign({
      name: campaign.name,
      subject: campaign.subject || '',
      type: campaign.type.toUpperCase(),
      audience: campaign.audience,
      content: campaign.content || '',
      scheduledAt: campaign.scheduledAt ? toLocalInputValue(campaign.scheduledAt) : '',
      revenue: campaign.revenue ? String(campaign.revenue) : '',
    });
    setShowCreateModal(true);
  };

  const handleDelete = async () => {
    if (!deletingCampaign) return;
    try {
      const res = await fetch(`/api/campaigns?id=${deletingCampaign.id}`, { method: 'DELETE' });
      if (res.ok) {
        setShowDeleteModal(false);
        setDeletingCampaign(null);
        notify('success', 'Campaign deleted.');
        fetchCampaigns();
      } else {
        notify('error', 'Failed to delete campaign.');
      }
    } catch { notify('error', 'Network error — please try again.'); }
  };

  const handleSend = async (campaign: Campaign) => {
    setSendingId(campaign.id);
    try {
      const res = await fetch('/api/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        notify('success', data.message || 'Campaign sent.');
        fetchCampaigns();
      } else {
        notify('error', data.error || 'Failed to send campaign.');
      }
    } catch { notify('error', 'Network error — please try again.'); } finally {
      setSendingId(null);
      setSendTarget(null);
    }
  };

  const resetModal = () => {
    setShowCreateModal(false);
    setEditingCampaign(null);
    setNewCampaign(emptyCampaignForm);
  };

  const filtered = campaigns.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.audience.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSent      = campaigns.reduce((a, c) => a + c.sent, 0);
  const totalRevenue   = campaigns.reduce((a, c) => a + c.revenue, 0);
  const activeCount    = campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length;
  const avgEngagement  = campaigns.length > 0
    ? (campaigns.reduce((a, c) => a + (c.sent > 0 ? c.opened / c.sent : 0), 0) / campaigns.length) * 100
    : 0;

  const canEdit = (c: Campaign) => c.status === 'draft' || c.status === 'scheduled';
  const canSend = (c: Campaign) => (c.status === 'draft' || c.status === 'scheduled') && !!c.subject && !!c.content;

  const openRate = (c: Campaign) =>
    c.sent > 0 ? ((c.opened / c.sent) * 100).toFixed(0) + '%' : '0%';
  const clickRate = (c: Campaign) =>
    c.sent > 0 ? ((c.clicked / c.sent) * 100).toFixed(0) + '%' : '0%';

  return (
    <div className="min-h-screen bg-slate-50 pb-24 sm:pb-8">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <div className={`flex items-start gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold ${
            toast.type === 'success'
              ? 'bg-emerald-600 border-emerald-500 text-white'
              : 'bg-red-600 border-red-500 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />}
            <span className="flex-1">{toast.message}</span>
            <button type="button" onClick={() => setToast(null)} className="shrink-0 hover:opacity-75 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile FAB */}
      <button
        type="button"
        onClick={() => setShowCreateModal(true)}
        className="sm:hidden fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center z-40 active:scale-95 transition-transform"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* ── Glassmorphic Sticky Header ── */}
      <div className="sticky top-0 z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                  Mail Campaigns
                </h1>
                <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/40 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> Live Engine
                </span>
              </div>
              <p className="text-xs font-bold text-slate-400 truncate hidden sm:block mt-0.5">
                Manage email campaigns and track performance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ModuleGuideBanner
              moduleId="campaigns"
              moduleName="Mail Engine"
              summary="Compose, schedule, and send broadcast email campaigns to your audience lists."
              tips={[
                "Track open rates, click engagement, and reach",
                "Segment contacts by promotional, newsletter, or announcements",
                "Automate email delivery with real-time tracking"
              ]}
            />
            <button
              id="tour-campaigns-new-button"
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4.5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl text-xs font-extrabold shadow-sm shadow-orange-500/20 transition-all cursor-pointer shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Campaign</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── High-Performance Telemetry Pods ── */}
        <div id="tour-campaigns-stats" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Active',      value: activeCount.toString(),                     icon: Rocket,        bgGrad: 'from-orange-500 to-amber-600' },
            { label: 'Total Reach', value: (totalSent / 1000).toFixed(1) + 'k',        icon: Users,         bgGrad: 'from-emerald-500 to-teal-600' },
            { label: 'Avg Open',    value: avgEngagement.toFixed(1) + '%',              icon: MousePointer2, bgGrad: 'from-amber-500 to-orange-500' },
            { label: 'Revenue',     value: '£' + (totalRevenue / 1000).toFixed(1) + 'k', icon: TrendingUp,  bgGrad: 'from-purple-500 to-indigo-600' },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-slate-950 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-orange-300 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-r ${s.bgGrad} flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform`}>
                  <s.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Search & View Dock ── */}
        <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-3.5 flex gap-3 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search campaigns…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-500 transition-all"
            />
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl shrink-0 border border-slate-200/60 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white dark:bg-slate-950 text-orange-500 shadow-2xs' : 'text-slate-400'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-white dark:bg-slate-950 text-orange-500 shadow-2xs' : 'text-slate-400'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Content & Sleek Empty State ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-9 h-9 text-orange-500 animate-spin" />
            <p className="text-xs font-bold text-slate-400">Loading campaigns…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-12 sm:p-16 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-4 shadow-2xs">
              <BarChart3 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1.5">
              {searchTerm ? 'No matching campaigns' : 'No campaigns yet'}
            </h3>
            <p className="text-xs font-bold text-slate-400 max-w-sm mx-auto mb-6">
              {searchTerm ? 'Try adjusting your search query to find broadcast campaigns.' : 'Create your first campaign to broadcast announcements, newsletters, and promotional updates.'}
            </p>
            {!searchTerm && (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl text-xs font-extrabold shadow-sm shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" /> New Campaign
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* ── Grid View ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(campaign => {
              const tc = typeConfig(campaign.type);
              const TypeIcon = tc.icon;
              return (
                <div key={campaign.id} className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col hover:border-orange-300 transition-all group">
                  {/* Card header */}
                  <div className="p-5 flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug truncate group-hover:text-orange-500 transition-colors">{campaign.name}</h3>
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shrink-0 ${statusStyle(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-400 mt-1 truncate italic">&quot;{campaign.subject}&quot;</p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 space-y-3.5 flex-1 flex flex-col">
                    {/* Audience */}
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 rounded-2xl px-3.5 py-2 border border-slate-200/60 dark:border-slate-800">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <Users className="w-3.5 h-3.5 text-orange-500" /> Audience
                      </span>
                      <span className="text-xs font-mono font-extrabold text-slate-800 dark:text-slate-200">{campaign.audience}</span>
                    </div>

                    {campaign.status === 'scheduled' && campaign.scheduledAt && (
                      <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl px-3.5 py-2 text-[11px] font-mono font-extrabold text-amber-700 dark:text-amber-400">
                        <CalendarClock className="w-3.5 h-3.5 text-amber-500" />
                        Sends {new Date(campaign.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    )}

                    {/* Engagement Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center bg-slate-50 dark:bg-slate-900 rounded-2xl py-2.5 border border-slate-200/60 dark:border-slate-800">
                        <p className="text-xs sm:text-sm font-mono font-extrabold text-slate-900 dark:text-white">{campaign.sent.toLocaleString()}</p>
                        <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Sent</p>
                      </div>
                      <div className="text-center bg-emerald-50/60 dark:bg-emerald-950/40 rounded-2xl py-2.5 border border-emerald-200/60 dark:border-emerald-900/40">
                        <p className="text-xs sm:text-sm font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{openRate(campaign)}</p>
                        <p className="text-[10px] font-mono font-bold text-emerald-500 uppercase">Open</p>
                      </div>
                      <div className="text-center bg-orange-50/60 dark:bg-orange-950/40 rounded-2xl py-2.5 border border-orange-200/60 dark:border-orange-900/40">
                        <p className="text-xs sm:text-sm font-mono font-extrabold text-orange-600 dark:text-orange-400">{clickRate(campaign)}</p>
                        <p className="text-[10px] font-mono font-bold text-orange-500 uppercase">Click</p>
                      </div>
                    </div>

                    {/* Revenue */}
                    {campaign.revenue > 0 && (
                      <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl px-4 py-2.5 flex items-center justify-between mt-auto shadow-2xs">
                        <p className="text-xs text-white/90 font-bold">Revenue</p>
                        <p className="text-sm font-mono font-extrabold text-white">£{campaign.revenue.toLocaleString()}</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center gap-1 pt-3 border-t border-slate-100 dark:border-slate-900 mt-auto">
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400 flex-1 min-w-0">
                        <Clock className="w-3.5 h-3.5 shrink-0" /> {campaign.createdAt}
                      </span>
                      {canSend(campaign) && (
                        <button type="button"
                          onClick={(e) => { e.stopPropagation(); setSendTarget(campaign); }}
                          title="Send campaign"
                          className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-all cursor-pointer">
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      {canEdit(campaign) && (
                        <button type="button"
                          onClick={(e) => { e.stopPropagation(); handleEdit(campaign); }}
                          title="Edit campaign"
                          className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-xl transition-all cursor-pointer">
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      <button type="button"
                        onClick={(e) => { e.stopPropagation(); setDeletingCampaign(campaign); setShowDeleteModal(true); }}
                        title="Delete campaign"
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedReport(campaign); setShowReportModal(true); }}
                        className="flex items-center gap-1 text-xs font-extrabold text-orange-500 hover:text-orange-600 transition-colors cursor-pointer group shrink-0">
                        Reports <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── List view ── */
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-widest">
                    <th className="px-5 py-4">Campaign &amp; Subject</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Audience</th>
                    <th className="px-4 py-4 text-center">Open Rate</th>
                    <th className="px-4 py-4 text-center">Click Rate</th>
                    <th className="px-4 py-4 text-right">Revenue</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-xs">
                  {filtered.map(campaign => {
                    const tc = typeConfig(campaign.type);
                    const TypeIcon = tc.icon;
                    return (
                      <tr key={campaign.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-colors group">
                        <td className="px-5 py-4 min-w-[220px]">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs font-extrabold">
                              <TypeIcon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-extrabold text-slate-900 dark:text-white truncate group-hover:text-orange-500 transition-colors">{campaign.name}</p>
                              <p className="text-[10px] font-mono font-bold text-slate-400 truncate mt-0.5">&quot;{campaign.subject}&quot;</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${statusStyle(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-xs font-mono font-extrabold text-slate-700 dark:text-slate-300">{campaign.audience}</span>
                        </td>
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{openRate(campaign)}</span>
                        </td>
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          <span className="text-xs font-mono font-extrabold text-orange-600 dark:text-orange-400">{clickRate(campaign)}</span>
                        </td>
                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          <span className="text-xs font-mono font-extrabold text-slate-900 dark:text-white">
                            {campaign.revenue > 0 ? `£${campaign.revenue.toLocaleString()}` : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {canSend(campaign) && (
                              <button
                                onClick={() => setSendTarget(campaign)}
                                className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors cursor-pointer"
                                title="Send Campaign"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => { setSelectedReport(campaign); setShowReportModal(true); }}
                              className="px-3 py-1.5 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 text-xs font-extrabold border border-orange-200/60 dark:border-orange-900/40 hover:bg-orange-100 transition-colors cursor-pointer"
                            >
                              Report
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

      {/* ── Create / Edit Campaign Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full sm:max-w-2xl flex flex-col overflow-hidden max-h-[92dvh] sm:max-h-[92vh] rounded-[2rem] shadow-2xl border border-slate-200/80 dark:border-slate-800 transform -translate-y-4 sm:translate-y-0 animate-in slide-in-from-bottom-6 duration-200">
            <ModalHandle />
            
            {/* Modal Header with Compose / Preview Toggle */}
            <div className="px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
                </h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {editingCampaign ? 'Update campaign details & target audience' : 'Design and broadcast email campaigns to your audience'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetModal}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
                
                {/* ── 1. Campaign Identity & Type ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                      Campaign Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCampaign.name}
                      onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                      placeholder="e.g. Q4 Executive Product Launch"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                      Campaign Type *
                    </label>
                    <select
                      value={newCampaign.type}
                      onChange={e => setNewCampaign({ ...newCampaign, type: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all appearance-none cursor-pointer"
                    >
                      <option value="PROMOTIONAL">🚀 Promotional / Special Offer</option>
                      <option value="NEWSLETTER">📰 Newsletter &amp; Updates</option>
                      <option value="ANNOUNCEMENT">📢 Announcement &amp; Press</option>
                      <option value="TRANSACTIONAL">⚡ Transactional &amp; Notice</option>
                    </select>
                  </div>
                </div>

                {/* ── 2. Target Audience Segment Selector ── */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-extrabold font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Target Audience Segment *
                    </label>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      GDPR &amp; Consent Filtered
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'All Subscribers', desc: 'All active contacts', icon: Users },
                      { id: 'VIP Customers', desc: 'High-value accounts', icon: Rocket },
                      { id: 'New Signups', desc: 'Joined in last 30d', icon: Sparkles },
                      { id: 'Inactive', desc: 'Re-engagement target', icon: Clock },
                    ].map(seg => {
                      const isSelected = newCampaign.audience === seg.id;
                      return (
                        <button
                          key={seg.id}
                          type="button"
                          onClick={() => setNewCampaign({ ...newCampaign, audience: seg.id })}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                            isSelected
                              ? 'bg-orange-50/60 dark:bg-orange-950/30 border-orange-500 text-orange-600 dark:text-orange-400 shadow-2xs ring-2 ring-orange-500/20'
                              : 'bg-slate-50/60 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold truncate">{seg.id}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                          </div>
                          <p className="text-[10px] font-medium text-slate-400 leading-tight">{seg.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── 3. Email Subject Line ── */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-extrabold font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Email Subject Line *
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {newCampaign.subject.length}/100 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={newCampaign.subject}
                    onChange={e => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                    placeholder="e.g. Exclusive Update: New Services Available for You"
                  />
                </div>

                {/* ── 4. Email Body & Merge Tags ── */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="block text-[11px] font-extrabold font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Email Content *
                    </label>

                    {/* Quick Insert Merge Tags */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400">Insert tag:</span>
                      {['[Name]', '[Email]', '[Company]'].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setNewCampaign({ ...newCampaign, content: (newCampaign.content ? newCampaign.content + ' ' : '') + tag })}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-orange-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-orange-600 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700"
                        >
                          +{tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      required
                      value={newCampaign.content}
                      onChange={e => setNewCampaign({ ...newCampaign, content: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all resize-none leading-relaxed"
                      placeholder="Hi [Name],&#10;&#10;We are delighted to share our latest updates with you..."
                    />
                    <span className="absolute bottom-3 right-3 text-[10px] font-mono font-bold text-slate-400">
                      {newCampaign.content.length} chars
                    </span>
                  </div>
                  <p className="text-[10px] font-medium text-slate-400">
                    URLs typed in the content will automatically receive click-tracking and analytics redirection.
                  </p>
                </div>

                {/* ── 5. Schedule Send ── */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Schedule Send (Optional)
                  </label>
                  <div className="relative">
                    <CalendarClock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 pointer-events-none" />
                    <input
                      type="datetime-local"
                      value={newCampaign.scheduledAt}
                      onChange={e => setNewCampaign({ ...newCampaign, scheduledAt: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Leave blank to save as a draft that you can broadcast immediately.
                  </p>
                </div>

                {editingCampaign && (editingCampaign.status === 'sent' || editingCampaign.status === 'completed') && (
                  <div>
                    <label className="block text-[11px] font-extrabold font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                      Revenue Generated (£)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newCampaign.revenue}
                      onChange={e => setNewCampaign({ ...newCampaign, revenue: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={resetModal}
                  className="py-3 px-5 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-extrabold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-95"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>{editingCampaign ? 'Save Changes' : 'Create Campaign'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── Send Confirmation Modal ── */}
      {sendTarget && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full sm:max-w-md flex flex-col overflow-hidden rounded-2xl shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 flex items-center gap-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white shadow-xs">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-extrabold text-white tracking-tight">Send campaign now?</h2>
                <p className="text-emerald-100/90 text-xs font-medium mt-0.5">This will email real contacts immediately</p>
              </div>
              {sendingId !== sendTarget.id && (
                <button type="button" onClick={() => setSendTarget(null)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors cursor-pointer text-white">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <p className="text-sm font-bold text-gray-900">{sendTarget.name}</p>
                <p className="text-xs text-gray-500 italic mt-0.5">&quot;{sendTarget.subject}&quot;</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-2">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  Audience: <span className="font-semibold">{sendTarget.audience}</span>
                </div>
              </div>
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  Emails send immediately to every consenting, subscribed contact in this audience (capped at 100 recipients). This cannot be undone.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex gap-3">
              <button type="button" onClick={() => setSendTarget(null)} disabled={sendingId === sendTarget.id}
                className="flex-1 px-5 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors cursor-pointer text-sm disabled:opacity-50">
                Cancel
              </button>
              <button type="button" onClick={() => handleSend(sendTarget)} disabled={sendingId === sendTarget.id}
                className="flex-1 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-70">
                {sendingId === sendTarget.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sendingId === sendTarget.id ? 'Sending…' : 'Send Now'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Campaign Report Modal ── */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full sm:max-w-xl flex flex-col overflow-hidden max-h-[92dvh] sm:max-h-[92vh] rounded-2xl shadow-2xl border border-white/20 transform -translate-y-6 sm:translate-y-0 animate-in slide-in-from-bottom-10 duration-300">
            <ModalHandle />
            <div className="px-5 sm:px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <div>
                <h2 className="text-lg font-black text-gray-900">Campaign Report</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{selectedReport.name}</p>
              </div>
              <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
              {/* Top Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Opened', val: openRate(selectedReport), color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Clicked', val: clickRate(selectedReport), color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'Revenue', val: `£${selectedReport.revenue.toLocaleString()}`, color: 'text-rose-600', bg: 'bg-rose-50' }
                ].map((s, i) => (
                  <div key={i} className={`${s.bg} rounded-2xl p-4 text-center border border-white/50 shadow-sm`}>
                    <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Engagement Bar */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Engagement Overview</h3>
                {[
                  { label: 'Successful Delivery', val: selectedReport.sent, total: selectedReport.sent, color: 'bg-indigo-500' },
                  { label: 'Unique Opens', val: selectedReport.opened, total: selectedReport.sent, color: 'bg-emerald-500' },
                  { label: 'Link Clicks', val: selectedReport.clicked, total: selectedReport.opened, color: 'bg-indigo-500' }
                ].map((b, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{b.label}</p>
                      <p className="text-xs font-black text-gray-900">{b.val.toLocaleString()} <span className="text-gray-400 font-bold">/ {b.total.toLocaleString()}</span></p>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${b.color} rounded-full transition-all duration-1000`} style={{ width: `${(b.val / b.total) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Details List */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Campaign Type</p>
                    <p className="text-sm font-bold text-gray-900 capitalize">{selectedReport.type.toLowerCase()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Audience</p>
                    <p className="text-sm font-bold text-gray-900">{selectedReport.audience}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Created On</p>
                    <p className="text-sm font-bold text-gray-900">{selectedReport.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Status</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${statusStyle(selectedReport.status)}`}>
                      {selectedReport.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <ModalFooter>
              <button onClick={() => setShowReportModal(false)} className="w-full py-3 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all cursor-pointer active:scale-95">
                Close Report
              </button>
            </ModalFooter>
          </div>
        </div>
      )}
      {/* ── Delete Confirmation ── */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Campaign"
        itemName={deletingCampaign?.name || ''}
        itemDetails={deletingCampaign?.subject}
        warningMessage={`Are you sure you want to delete "${deletingCampaign?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
