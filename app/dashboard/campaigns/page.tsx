"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, TrendingUp, Eye, Send, Users, MousePointer, DollarSign,
  BarChart3, Calendar, X, Edit, Trash2, Search, Clock,
  Megaphone, Newspaper, Zap, Bell, Loader2, ChevronDown,
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import StatusModal from '@/components/StatusModal';

type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'completed';
type CampaignType   = 'promotional' | 'newsletter' | 'transactional' | 'announcement';

interface Campaign {
  id: string;
  name: string;
  subject?: string;
  content?: string;
  type: CampaignType;
  audience: string;
  status: CampaignStatus;
  sent: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  revenue: number;
  cost: number;
  createdAt: string;
  sentAt?: string;
  scheduledAt?: string;
}

const STATUS_CONFIG: Record<CampaignStatus, { label: string; barColor: string; badgeBg: string; badgeText: string }> = {
  completed: { label: 'Completed',  barColor: 'bg-emerald-500', badgeBg: 'bg-emerald-50',  badgeText: 'text-emerald-700' },
  draft:     { label: 'Draft',      barColor: 'bg-gray-400',    badgeBg: 'bg-gray-100',    badgeText: 'text-gray-600'    },
  scheduled: { label: 'Scheduled',  barColor: 'bg-amber-400',   badgeBg: 'bg-amber-50',    badgeText: 'text-amber-700'   },
  sending:   { label: 'Sending…',   barColor: 'bg-blue-500',    badgeBg: 'bg-blue-50',     badgeText: 'text-blue-700'    },
  sent:      { label: 'Sent',       barColor: 'bg-indigo-500',  badgeBg: 'bg-indigo-50',   badgeText: 'text-indigo-700'  },
};

const TYPE_CONFIG: Record<CampaignType, { label: string; icon: React.ElementType; iconColor: string }> = {
  promotional:   { label: 'Promotional',   icon: Megaphone,  iconColor: 'text-pink-500'    },
  newsletter:    { label: 'Newsletter',    icon: Newspaper,  iconColor: 'text-blue-500'    },
  transactional: { label: 'Transactional', icon: Zap,        iconColor: 'text-amber-500'   },
  announcement:  { label: 'Announcement',  icon: Bell,       iconColor: 'text-purple-500'  },
};

const AUDIENCE_OPTIONS = ['All Subscribers', 'Active Users', 'VIP Customers', 'New Signups', 'Inactive Users'];

const blank = () => ({
  name: '', subject: '', content: '', type: 'promotional' as CampaignType,
  audience: 'All Subscribers', cost: '', scheduledAt: '',
});

function pct(n: number, total: number) {
  return total > 0 ? ((n / total) * 100).toFixed(1) : '0.0';
}

function roi(revenue: number, cost: number) {
  if (cost <= 0) return revenue > 0 ? '—' : '—';
  return ((revenue - cost) / cost * 100).toFixed(0) + '%';
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const [showCreateModal, setShowCreateModal]   = useState(false);
  const [showDetailModal, setShowDetailModal]   = useState(false);
  const [showEditModal, setShowEditModal]       = useState(false);
  const [showDeleteModal, setShowDeleteModal]   = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [editCampaign, setEditCampaign]         = useState<Campaign | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);
  const [newCampaign, setNewCampaign]           = useState(blank());
  const [saving, setSaving]                     = useState(false);

  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info';
  }>({ isOpen: false, title: '', message: '', type: 'success' });

  const showFeedback = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success') =>
    setStatusModal({ isOpen: true, title, message, type });

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/campaigns');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setCampaigns(data);
      }
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const filtered = campaigns.filter(c =>
    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (c.subject ?? '').toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || c.status === filterStatus) &&
    (filterType   === 'all' || c.type   === filterType)
  );

  const totalSent    = campaigns.reduce((s, c) => s + c.sent, 0);
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
  const totalCost    = campaigns.reduce((s, c) => s + c.cost, 0);
  const sentCampaigns = campaigns.filter(c => c.sent > 0);
  const avgOpenRate  = sentCampaigns.length
    ? (sentCampaigns.reduce((s, c) => s + c.opened / c.sent, 0) / sentCampaigns.length * 100).toFixed(1)
    : '0.0';
  const overallRoi = totalCost > 0
    ? ((totalRevenue - totalCost) / totalCost * 100).toFixed(0) + '%'
    : '—';

  const handleCreate = async () => {
    if (!newCampaign.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampaign),
      });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setCampaigns(prev => [saved, ...prev]);
      setShowCreateModal(false);
      setNewCampaign(blank());
      showFeedback('Campaign Created', `"${saved.name}" has been saved as ${saved.status}.`);
    } catch {
      showFeedback('Error', 'Failed to create campaign. Please try again.', 'error');
    } finally { setSaving(false); }
  };

  const handleSaveEdit = async () => {
    if (!editCampaign) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/${editCampaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCampaign),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setCampaigns(prev => prev.map(c => c.id === updated.id ? updated : c));
      setShowEditModal(false);
      setEditCampaign(null);
      showFeedback('Campaign Updated', 'Your changes have been saved.');
    } catch {
      showFeedback('Error', 'Failed to update campaign. Please try again.', 'error');
    } finally { setSaving(false); }
  };

  const handleExportCsv = (c: Campaign) => {
    const rows = [
      ['Campaign', c.name],
      ['Subject', c.subject ?? ''],
      ['Type', c.type],
      ['Audience', c.audience],
      ['Status', c.status],
      ['Sent', c.sent],
      ['Opened', c.opened],
      ['Open Rate', pct(c.opened, c.sent) + '%'],
      ['Clicked', c.clicked],
      ['CTR', pct(c.clicked, c.sent) + '%'],
      ['Bounced', c.bounced],
      ['Unsubscribed', c.unsubscribed],
      ['Revenue (£)', c.revenue],
      ['Cost (£)', c.cost],
      ['ROI', roi(c.revenue, c.cost)],
      ['Sent At', c.sentAt ?? ''],
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${c.name.replace(/\s+/g, '-').toLowerCase()}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showFeedback('Export Complete', `${c.name} data exported to CSV.`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F8FAFC]">
      {/* Background */}
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-200 rounded-full blur-[140px]" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-orange-200 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-rose-100 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 p-8 max-w-[1600px] mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">Campaigns</h1>
              <span className="text-sm font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                {campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length} active
              </span>
            </div>
            <p className="text-gray-500 font-medium text-lg">
              Create, schedule, and track your email marketing campaigns.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-7 py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center gap-3 shadow-xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            New Campaign
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Total Sent',     value: totalSent.toLocaleString(),                             icon: Send,       iconBg: 'bg-pink-100',    iconColor: 'text-pink-600'    },
            { label: 'Avg Open Rate',  value: avgOpenRate + '%',                                       icon: Eye,        iconBg: 'bg-orange-100',  iconColor: 'text-orange-600'  },
            { label: 'Total Revenue',  value: '£' + (totalRevenue >= 1000 ? (totalRevenue/1000).toFixed(1) + 'k' : totalRevenue.toLocaleString()), icon: DollarSign, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
            { label: 'Overall ROI',    value: overallRoi,                                              icon: TrendingUp, iconBg: 'bg-indigo-100',  iconColor: 'text-indigo-600'  },
          ].map((s, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-lg hover:shadow-xl transition-all group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${s.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <s.icon className={`w-6 h-6 ${s.iconColor}`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">{s.label}</p>
                  <p className="text-3xl font-black text-gray-900 tracking-tight">{s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="bg-white/60 backdrop-blur-2xl p-3 rounded-2xl border border-white/60 shadow-md flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns by name or subject…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/70 border border-transparent focus:border-pink-200 rounded-xl outline-none font-medium text-gray-900 transition-all"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none pl-4 pr-9 py-3 bg-white/70 border border-transparent rounded-xl outline-none font-semibold text-gray-700 cursor-pointer hover:bg-white transition-all"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sending">Sending</option>
                <option value="completed">Completed</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none pl-4 pr-9 py-3 bg-white/70 border border-transparent rounded-xl outline-none font-semibold text-gray-700 cursor-pointer hover:bg-white transition-all"
              >
                <option value="all">All Types</option>
                <option value="promotional">Promotional</option>
                <option value="newsletter">Newsletter</option>
                <option value="transactional">Transactional</option>
                <option value="announcement">Announcement</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── Campaign List ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading campaigns…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-16 border border-white/60 shadow-lg text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {campaigns.length === 0 ? 'No campaigns yet' : 'No campaigns match your filters'}
            </h3>
            <p className="text-gray-500 mb-6">
              {campaigns.length === 0
                ? 'Create your first campaign to start reaching your audience.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
            {campaigns.length === 0 && (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg"
              >
                <Plus className="w-4 h-4 inline mr-2" /> Create Campaign
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((c, idx) => {
              const sc  = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.draft;
              const tc  = TYPE_CONFIG[c.type]     ?? TYPE_CONFIG.promotional;
              const TypeIcon = tc.icon;
              const openRate = pct(c.opened, c.sent);
              const ctr      = pct(c.clicked, c.sent);
              const campaignRoi = roi(c.revenue, c.cost);

              return (
                <div
                  key={c.id}
                  className="group relative bg-white/85 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg hover:shadow-2xl transition-all overflow-hidden"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {/* Status bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${sc.barColor} rounded-l-3xl`} />

                  <div className="flex flex-col xl:flex-row items-start xl:items-center gap-6 p-6 pl-8">

                    {/* Identity */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${sc.badgeBg} ${sc.badgeText}`}>
                          {sc.label}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600`}>
                          <TypeIcon className={`w-3 h-3 ${tc.iconColor}`} />
                          {tc.label}
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-gray-900 truncate group-hover:text-pink-600 transition-colors">
                        {c.name}
                      </h2>
                      {c.subject && (
                        <p className="text-gray-500 font-medium text-sm truncate italic">"{c.subject}"</p>
                      )}
                      <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{c.audience}</span>
                        {c.sentAt && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Sent {c.sentAt}</span>}
                        {c.scheduledAt && c.status === 'scheduled' && <span className="flex items-center gap-1 text-amber-500"><Clock className="w-3.5 h-3.5" />Scheduled {c.scheduledAt}</span>}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full xl:w-auto xl:min-w-[480px]">
                      {/* Sent */}
                      <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                        <Send className="w-4 h-4 text-blue-400 mb-2" />
                        <p className="text-xl font-black text-gray-900">{c.sent.toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sent</p>
                      </div>
                      {/* Open Rate */}
                      <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                        <Eye className="w-4 h-4 text-emerald-400 mb-2" />
                        <p className="text-xl font-black text-gray-900">{openRate}%</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Open Rate</p>
                        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${Math.min(parseFloat(openRate), 100)}%` }} />
                        </div>
                      </div>
                      {/* CTR */}
                      <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                        <MousePointer className="w-4 h-4 text-purple-400 mb-2" />
                        <p className="text-xl font-black text-gray-900">{ctr}%</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">CTR</p>
                        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-400 rounded-full transition-all" style={{ width: `${Math.min(parseFloat(ctr), 100)}%` }} />
                        </div>
                      </div>
                      {/* ROI */}
                      <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                        <BarChart3 className="w-4 h-4 text-orange-400 mb-2" />
                        <p className="text-xl font-black text-gray-900">{campaignRoi}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ROI</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 xl:border-l xl:border-gray-100 xl:pl-6">
                      <button
                        type="button"
                        onClick={() => { setSelectedCampaign(c); setShowDetailModal(true); }}
                        className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                        title="View details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditCampaign({ ...c }); setShowEditModal(true); }}
                        className="p-3 bg-gray-50 text-gray-400 hover:text-gray-800 hover:bg-white rounded-xl transition-all cursor-pointer border border-transparent hover:border-gray-200"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDeletingCampaign(c); setShowDeleteModal(true); }}
                        className="p-3 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Create Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-black text-gray-900">New Campaign</h2>
                <p className="text-gray-500 font-medium text-sm">Set up your campaign details and schedule.</p>
              </div>
              <button type="button" onClick={() => setShowCreateModal(false)} className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Campaign Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-transparent focus:border-pink-200 rounded-xl outline-none font-bold text-gray-900 transition-all"
                  placeholder="e.g. Black Friday Sale 2025"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Subject Line</label>
                <input
                  type="text"
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-transparent focus:border-pink-200 rounded-xl outline-none font-medium text-gray-900 transition-all"
                  placeholder="e.g. 🎉 50% off — this weekend only"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Campaign Type</label>
                  <select
                    value={newCampaign.type}
                    onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value as CampaignType })}
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-transparent rounded-xl outline-none font-semibold text-gray-900 cursor-pointer"
                  >
                    <option value="promotional">Promotional</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="transactional">Transactional</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Audience</label>
                  <select
                    value={newCampaign.audience}
                    onChange={(e) => setNewCampaign({ ...newCampaign, audience: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-transparent rounded-xl outline-none font-semibold text-gray-900 cursor-pointer"
                  >
                    {AUDIENCE_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Budget / Cost (£)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newCampaign.cost}
                    onChange={(e) => setNewCampaign({ ...newCampaign, cost: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-transparent focus:border-pink-200 rounded-xl outline-none font-medium text-gray-900 transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Schedule Send <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="datetime-local"
                    value={newCampaign.scheduledAt}
                    onChange={(e) => setNewCampaign({ ...newCampaign, scheduledAt: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-transparent focus:border-pink-200 rounded-xl outline-none font-medium text-gray-900 transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-1">Leave empty to save as draft</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Content / Notes</label>
                <textarea
                  value={newCampaign.content}
                  onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-transparent focus:border-pink-200 rounded-xl outline-none font-medium text-gray-900 resize-none transition-all"
                  placeholder="Email body or internal notes for this campaign…"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-3 shrink-0">
              <button type="button" onClick={() => setShowCreateModal(false)}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all cursor-pointer">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newCampaign.name.trim() || saving}
                className="flex-[2] px-6 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {newCampaign.scheduledAt ? 'Schedule Campaign' : 'Save as Draft'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {showEditModal && editCampaign && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Edit Campaign</h2>
                <p className="text-gray-500 font-medium">Update campaign settings and status.</p>
              </div>
              <button type="button" onClick={() => { setShowEditModal(false); setEditCampaign(null); }}
                className="p-2.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Campaign Name</label>
                <input type="text" value={editCampaign.name}
                  onChange={(e) => setEditCampaign({ ...editCampaign, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-pink-200 rounded-xl outline-none font-bold text-gray-900 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Subject Line</label>
                <input type="text" value={editCampaign.subject ?? ''}
                  onChange={(e) => setEditCampaign({ ...editCampaign, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-pink-200 rounded-xl outline-none font-medium text-gray-900 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Type</label>
                  <select value={editCampaign.type}
                    onChange={(e) => setEditCampaign({ ...editCampaign, type: e.target.value as CampaignType })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none font-semibold text-gray-900 cursor-pointer">
                    <option value="promotional">Promotional</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="transactional">Transactional</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                  <select value={editCampaign.status}
                    onChange={(e) => setEditCampaign({ ...editCampaign, status: e.target.value as CampaignStatus })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none font-semibold text-gray-900 cursor-pointer">
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="sending">Sending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Audience</label>
                  <select value={editCampaign.audience}
                    onChange={(e) => setEditCampaign({ ...editCampaign, audience: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none font-semibold text-gray-900 cursor-pointer">
                    {AUDIENCE_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Budget / Cost (£)</label>
                  <input type="number" min="0" step="0.01" value={editCampaign.cost}
                    onChange={(e) => setEditCampaign({ ...editCampaign, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-pink-200 rounded-xl outline-none font-medium text-gray-900 transition-all" />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 shrink-0">
              <button type="button" onClick={() => { setShowEditModal(false); setEditCampaign(null); }}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={handleSaveEdit} disabled={saving}
                className="flex-[2] px-6 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {showDetailModal && selectedCampaign && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl flex flex-col max-h-[85vh]">
            <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between shrink-0">
              <div>
                <span className={`inline-block text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-2 ${STATUS_CONFIG[selectedCampaign.status]?.badgeBg} ${STATUS_CONFIG[selectedCampaign.status]?.badgeText}`}>
                  {STATUS_CONFIG[selectedCampaign.status]?.label}
                </span>
                <h2 className="text-2xl font-black text-gray-900">{selectedCampaign.name}</h2>
                {selectedCampaign.subject && <p className="text-gray-500 font-medium mt-1 italic">"{selectedCampaign.subject}"</p>}
              </div>
              <button type="button" onClick={() => setShowDetailModal(false)}
                className="p-2.5 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-xl transition-all cursor-pointer shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto">
              {/* Revenue & ROI */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Revenue Attributed</p>
                  <p className="text-3xl font-black text-emerald-900">£{selectedCampaign.revenue.toLocaleString()}</p>
                </div>
                <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">ROI</p>
                  <p className="text-3xl font-black text-indigo-900">{roi(selectedCampaign.revenue, selectedCampaign.cost)}</p>
                </div>
              </div>

              {/* Full metrics */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Sent',        value: selectedCampaign.sent.toLocaleString() },
                  { label: 'Opened',      value: selectedCampaign.opened.toLocaleString() + ` (${pct(selectedCampaign.opened, selectedCampaign.sent)}%)` },
                  { label: 'Clicked',     value: selectedCampaign.clicked.toLocaleString() + ` (${pct(selectedCampaign.clicked, selectedCampaign.sent)}%)` },
                  { label: 'Bounced',     value: selectedCampaign.bounced.toLocaleString() },
                  { label: 'Unsubscribed',value: selectedCampaign.unsubscribed.toLocaleString() },
                  { label: 'Cost',        value: '£' + selectedCampaign.cost.toLocaleString() },
                ].map((m) => (
                  <div key={m.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{m.label}</p>
                    <p className="font-black text-gray-800 text-sm">{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Audience</p><p className="font-bold text-gray-700">{selectedCampaign.audience}</p></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</p><p className="font-bold text-gray-700 capitalize">{selectedCampaign.type}</p></div>
                {selectedCampaign.sentAt && <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sent At</p><p className="font-bold text-gray-700">{selectedCampaign.sentAt}</p></div>}
              </div>

              {/* Progress bars */}
              {selectedCampaign.sent > 0 && (
                <div className="space-y-3">
                  {[
                    { label: 'Open Rate', value: parseFloat(pct(selectedCampaign.opened, selectedCampaign.sent)), color: 'bg-emerald-400' },
                    { label: 'Click-through Rate', value: parseFloat(pct(selectedCampaign.clicked, selectedCampaign.sent)), color: 'bg-purple-400' },
                    { label: 'Bounce Rate', value: parseFloat(pct(selectedCampaign.bounced, selectedCampaign.sent)), color: 'bg-red-400' },
                  ].map((bar) => (
                    <div key={bar.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold text-gray-500">{bar.label}</span>
                        <span className="text-xs font-black text-gray-700">{bar.value.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${bar.color} rounded-full transition-all`} style={{ width: `${Math.min(bar.value, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 shrink-0">
              <button type="button" onClick={() => setShowDetailModal(false)}
                className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-all cursor-pointer text-sm">
                Close
              </button>
              <button type="button" onClick={() => handleExportCsv(selectedCampaign)}
                className="flex-1 px-5 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all cursor-pointer shadow-lg text-sm flex items-center justify-center gap-2">
                <BarChart3 className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete ── */}
      {deletingCampaign && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeletingCampaign(null); }}
          onConfirm={async () => {
            try {
              const res = await fetch(`/api/campaigns/${deletingCampaign.id}`, { method: 'DELETE' });
              if (!res.ok) throw new Error();
              setCampaigns(prev => prev.filter(c => c.id !== deletingCampaign.id));
              setShowDeleteModal(false);
              setDeletingCampaign(null);
              showFeedback('Campaign Deleted', `"${deletingCampaign.name}" has been permanently removed.`);
            } catch {
              showFeedback('Error', 'Failed to delete campaign. Please try again.', 'error');
            }
          }}
          title="Delete Campaign"
          itemName={deletingCampaign.name}
          itemDetails={`${deletingCampaign.sent.toLocaleString()} sent · ${deletingCampaign.audience}`}
          warningMessage="This will permanently remove this campaign and all its performance data."
        />
      )}

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
      />
    </div>
  );
}
