'use client';

import { useState, useEffect, useCallback, type ReactNode, type FormEvent } from 'react';
import {
  Plus, Mail, TrendingUp, Users, MousePointer2, BarChart3,
  Calendar, Search, LayoutGrid, List, Rocket, Clock, Loader2, X,
  CheckCircle, ChevronRight, Trash2, Pencil, Send, AlertTriangle,
  CheckCircle2, CalendarClock
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

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm font-medium bg-white';
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
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8">

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
        className="sm:hidden fixed bottom-24 right-6 w-14 h-14 bg-linear-to-r from-blue-600 to-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-95 transition-transform"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-blue-600 rounded-xl shrink-0">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-gray-900 leading-tight truncate">Mail Campaigns</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Manage email campaigns and track performance</p>
            </div>
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
          </div>
          <button
            id="tour-campaigns-new-button"
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Campaign</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 space-y-5">

        {/* Stats */}
        <div id="tour-campaigns-stats" className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[
            { label: 'Active',      value: activeCount.toString(),                     icon: Rocket,        bgGrad: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
            { label: 'Total Reach', value: (totalSent / 1000).toFixed(1) + 'k',        icon: Users,         bgGrad: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
            { label: 'Avg Open',    value: avgEngagement.toFixed(1) + '%',              icon: MousePointer2, bgGrad: 'bg-gradient-to-br from-amber-500 to-orange-600' },
            { label: 'Revenue',     value: '£' + (totalRevenue / 1000).toFixed(1) + 'k', icon: TrendingUp,  bgGrad: 'bg-gradient-to-br from-rose-500 to-purple-600' },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 ${s.bgGrad} rounded-xl w-fit group-hover:scale-105 transition-transform text-white shadow-xs`}>
                  <s.icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search + view toggle */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-3 flex gap-2 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search campaigns…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-slate-800 dark:text-white rounded-xl text-sm outline-none border border-gray-100 dark:border-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white dark:bg-slate-900 shadow text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 shadow text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Loading campaigns…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-12 text-center">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {searchTerm ? 'No matching campaigns' : 'No campaigns yet'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              {searchTerm ? 'Try a different search term.' : 'Create your first campaign to get started.'}
            </p>
            {!searchTerm && (
              <button type="button" onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-xs transition-all cursor-pointer">
                <Plus className="w-4 h-4" /> New Campaign
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* ── Grid view ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(campaign => {
              const tc = typeConfig(campaign.type);
              const TypeIcon = tc.icon;
              return (
                <div key={campaign.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                  {/* Card header */}
                  <div className="p-4 flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl ${tc.bg} shrink-0`}>
                      <TypeIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-gray-900 leading-snug truncate">{campaign.name}</h3>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${statusStyle(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate italic">&quot;{campaign.subject}&quot;</p>
                    </div>
                  </div>

                  <div className="px-4 pb-4 space-y-3 flex-1 flex flex-col">
                    {/* Audience */}
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Users className="w-3.5 h-3.5 text-blue-400" /> Audience
                      </span>
                      <span className="text-xs font-semibold text-gray-800">{campaign.audience}</span>
                    </div>

                    {campaign.status === 'scheduled' && campaign.scheduledAt && (
                      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-[11px] font-semibold text-amber-700">
                        <CalendarClock className="w-3.5 h-3.5" />
                        Sends {new Date(campaign.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center bg-gray-50 rounded-xl py-2 border border-gray-100">
                        <p className="text-sm font-bold text-gray-800">{campaign.sent.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase">Sent</p>
                      </div>
                      <div className="text-center bg-emerald-50 rounded-xl py-2 border border-emerald-100">
                        <p className="text-sm font-bold text-emerald-700">{openRate(campaign)}</p>
                        <p className="text-[10px] text-emerald-500 font-medium uppercase">Open</p>
                      </div>
                      <div className="text-center bg-blue-50 rounded-xl py-2 border border-blue-100">
                        <p className="text-sm font-bold text-blue-700">{clickRate(campaign)}</p>
                        <p className="text-[10px] text-blue-500 font-medium uppercase">Click</p>
                      </div>
                    </div>

                    {/* Revenue */}
                    {campaign.revenue > 0 && (
                      <div className="bg-emerald-600 rounded-xl px-3 py-2.5 flex items-center justify-between mt-auto">
                        <p className="text-xs text-emerald-100 font-medium">Revenue</p>
                        <p className="text-sm font-bold text-white">£{campaign.revenue.toLocaleString()}</p>
                      </div>
                    )}

                    {/* Footer */}
                      <div className="flex items-center gap-1 pt-2 border-t border-gray-50 mt-auto">
                        <span className="flex items-center gap-1 text-[10px] text-gray-400 flex-1 min-w-0">
                          <Clock className="w-3 h-3 shrink-0" /> {campaign.createdAt}
                        </span>
                        {canSend(campaign) && (
                          <button type="button"
                            onClick={(e) => { e.stopPropagation(); setSendTarget(campaign); }}
                            title="Send campaign"
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer">
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {canEdit(campaign) && (
                          <button type="button"
                            onClick={(e) => { e.stopPropagation(); handleEdit(campaign); }}
                            title="Edit campaign"
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer">
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        <button type="button"
                          onClick={(e) => { e.stopPropagation(); setDeletingCampaign(campaign); setShowDeleteModal(true); }}
                          title="Delete campaign"
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedReport(campaign); setShowReportModal(true); }}
                          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer group shrink-0">
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Campaign</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Audience</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wide text-center">Open</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wide text-center">Click</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wide text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(campaign => {
                    const tc = typeConfig(campaign.type);
                    const TypeIcon = tc.icon;
                    return (
                      <tr key={campaign.id} 
                        onClick={() => { setSelectedReport(campaign); setShowReportModal(true); }}
                        className="hover:bg-gray-50 transition-colors cursor-pointer group">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${tc.bg} shrink-0`}>
                              <TypeIcon className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{campaign.name}</p>
                              <p className="text-[10px] text-gray-400 uppercase font-medium">{campaign.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusStyle(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs text-gray-600 font-medium">{campaign.audience}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="text-sm font-semibold text-emerald-700">{openRate(campaign)}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="text-sm font-semibold text-blue-700">{clickRate(campaign)}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className="text-sm font-semibold text-gray-900">
                              {campaign.revenue > 0 ? `£${campaign.revenue.toLocaleString()}` : '—'}
                            </span>
                            <div className="flex items-center gap-1">
                              {canSend(campaign) && (
                                <button onClick={(e) => { e.stopPropagation(); setSendTarget(campaign); }}
                                  title="Send campaign"
                                  className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer">
                                  <Send className="w-4 h-4" />
                                </button>
                              )}
                              {canEdit(campaign) && (
                                <button onClick={(e) => { e.stopPropagation(); handleEdit(campaign); }}
                                  title="Edit campaign"
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer">
                                  <Pencil className="w-4 h-4" />
                                </button>
                              )}
                              <button onClick={(e) => { e.stopPropagation(); setDeletingCampaign(campaign); setShowDeleteModal(true); }}
                                title="Delete campaign"
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                            </div>
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

      {/* ── Create Campaign Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full sm:max-w-lg flex flex-col overflow-hidden max-h-[92dvh] sm:max-h-[92vh] rounded-2xl shadow-2xl border border-white/20 transform -translate-y-6 sm:translate-y-0 animate-in slide-in-from-bottom-10 duration-300">
            <ModalHandle />
            <div className={modalHeaderCls}>
              <div>
                <h2 className="text-sm sm:text-lg font-bold text-gray-900 tracking-tight">{editingCampaign ? 'Edit campaign' : 'New campaign'}</h2>
                <p className="text-[11px] text-gray-500 font-medium">{editingCampaign ? 'Update the campaign details' : 'Fill in the campaign details'}</p>
              </div>
              <button type="button" onClick={resetModal}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 py-1.5 sm:py-5 space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className={labelCls}>Campaign name *</label>
                    <input type="text" required value={newCampaign.name}
                      onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })}
                      className={inputCls} placeholder="e.g. Summer Sale 2025" />
                  </div>
                  <div>
                    <label className={labelCls}>Type</label>
                    <select value={newCampaign.type}
                      onChange={e => setNewCampaign({ ...newCampaign, type: e.target.value })}
                      className={`${inputCls} appearance-none cursor-pointer`}>
                      <option value="PROMOTIONAL">Promotional</option>
                      <option value="NEWSLETTER">Newsletter</option>
                      <option value="ANNOUNCEMENT">Announcement</option>
                      <option value="TRANSACTIONAL">Transactional</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Email subject *</label>
                  <input type="text" required value={newCampaign.subject}
                    onChange={e => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                    className={inputCls} placeholder="e.g. You don't want to miss this!" />
                </div>

                <div>
                  <label className={labelCls}>Audience</label>
                  <input type="text" value={newCampaign.audience}
                    onChange={e => setNewCampaign({ ...newCampaign, audience: e.target.value })}
                    className={`${inputCls} mb-2`} placeholder="e.g. All Subscribers" />
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {SEGMENTS.map(seg => (
                      <button key={seg} type="button"
                        onClick={() => setNewCampaign({ ...newCampaign, audience: seg })}
                        className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold transition-all border cursor-pointer ${
                          newCampaign.audience === seg
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600'
                        }`}>
                        {seg}
                      </button>
                    ))}
                  </div>
                  {!KNOWN_SEGMENTS.has(newCampaign.audience.trim().toLowerCase()) && (
                    <p className="text-[10px] text-amber-600 font-medium mt-1.5">
                      Custom audience labels are for your reference only — sends will go to All Subscribers unless you pick one of the segments above.
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Content *</label>
                  <div className="relative">
                    <textarea value={newCampaign.content}
                      onChange={e => setNewCampaign({ ...newCampaign, content: e.target.value })}
                      className={`${inputCls} h-20 sm:h-32 resize-none`}
                      placeholder="Hello [Name], we have exciting news…" />
                    <span className="absolute bottom-2.5 right-3 text-[10px] text-gray-400 font-medium">
                      {newCampaign.content.length} chars
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium mt-1">Subject and content are required before a campaign can be sent.</p>
                </div>

                <div>
                  <label className={labelCls}>Schedule send (optional)</label>
                  <div className="relative">
                    <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input type="datetime-local" value={newCampaign.scheduledAt}
                      onChange={e => setNewCampaign({ ...newCampaign, scheduledAt: e.target.value })}
                      className={`${inputCls} pl-9`} />
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium mt-1">Leave blank to save as a draft you send manually. Scheduled sends run hourly.</p>
                </div>

                {editingCampaign && (editingCampaign.status === 'sent' || editingCampaign.status === 'completed') && (
                  <div>
                    <label className={labelCls}>Revenue Generated (£)</label>
                    <input type="number" min="0" step="0.01" value={newCampaign.revenue}
                      onChange={e => setNewCampaign({ ...newCampaign, revenue: e.target.value })}
                      className={inputCls} placeholder="0.00" />
                    <p className="text-[10px] text-gray-400 font-medium mt-1">There&apos;s no automatic sales attribution — enter what this campaign actually generated once you know it.</p>
                  </div>
                )}
              </div>

              <ModalFooter>
                <button type="button" onClick={resetModal}
                  className="flex-1 py-3 px-5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="flex-2 py-3 px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {editingCampaign ? 'Save Changes' : 'Create Campaign'}
                </button>
              </ModalFooter>
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
                  <Users className="w-3.5 h-3.5 text-blue-400" />
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
                  { label: 'Clicked', val: clickRate(selectedReport), color: 'text-blue-600', bg: 'bg-blue-50' },
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
                  { label: 'Successful Delivery', val: selectedReport.sent, total: selectedReport.sent, color: 'bg-blue-500' },
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
              <button onClick={() => setShowReportModal(false)} className="w-full py-3 bg-gray-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all cursor-pointer active:scale-95">
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
