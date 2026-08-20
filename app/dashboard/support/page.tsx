"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  MessageSquare, Clock, Plus, X, AlertCircle,
  Search, Send, Eye, Loader2, LifeBuoy,
  CheckCircle, ChevronRight, Inbox, Tag
} from 'lucide-react';

interface TicketComment {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  customer: string;
  email: string;
  status: 'open' | 'pending' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  description?: string;
  responses?: number;
  comments?: TicketComment[];
  type?: string;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
  open:         { label: 'Open',        bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500',   border: 'border-blue-200' },
  pending:      { label: 'Pending',     bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400',  border: 'border-amber-200' },
  'in-progress':{ label: 'In Progress', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', border: 'border-purple-200' },
  resolved:     { label: 'Resolved',    bg: 'bg-emerald-50',text: 'text-emerald-700',dot: 'bg-emerald-500',border: 'border-emerald-200' },
  closed:       { label: 'Closed',      bg: 'bg-gray-100',  text: 'text-gray-600',   dot: 'bg-gray-400',   border: 'border-gray-200' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low:    { label: 'Low',    color: 'text-gray-500' },
  medium: { label: 'Medium', color: 'text-amber-500' },
  high:   { label: 'High',   color: 'text-orange-500' },
  urgent: { label: 'Urgent', color: 'text-red-600' },
};

function StatusPill({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] ?? STATUS_CONFIG.open;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function PriorityTag({ priority }: { priority: string }) {
  const p = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.medium;
  return (
    <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${p.color}`}>
      <AlertCircle className="h-3 w-3" /> {p.label}
    </span>
  );
}

export default function PlatformSupportPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [newTicket, setNewTicket] = useState({
    subject: '',
    priority: 'medium' as Ticket['priority'],
    category: 'Support',
    description: '',
  });

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tickets?type=PLATFORM');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.filter((t: Ticket) => t.type === 'PLATFORM'));
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleCreateTicket = async () => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTicket,
          type: 'PLATFORM',
          customer: session?.user?.name || 'User',
          email: session?.user?.email || '',
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setTickets(prev => [saved, ...prev]);
        setShowCreateModal(false);
        setNewTicket({ subject: '', priority: 'medium', category: 'Support', description: '' });
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
    }
  };

  const fetchTicketDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/tickets/${id}`);
      if (res.ok) setSelectedTicket(await res.json());
    } catch (err) {
      console.error('Error fetching ticket detail:', err);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    try {
      setIsReplying(true);
      const res = await fetch(`/api/tickets/${selectedTicket.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyMessage }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setSelectedTicket(prev => prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : null);
        setReplyMessage('');
      }
    } catch (err) {
      console.error('Error sending reply:', err);
    } finally {
      setIsReplying(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    total: tickets.length,
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] space-y-4 md:space-y-6">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600 text-white p-7 sm:p-9 shadow-lg shadow-orange-500/20">
        <div className="pointer-events-none absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-amber-400/20 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 backdrop-blur-md px-3 py-1 text-white">
              <LifeBuoy className="h-3.5 w-3.5" />
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider">Platform Support</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Help &amp; Support Center
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-medium text-orange-100/90 max-w-md">
              Our support team and automated AI assistant are standing by to help your organization scale smoothly.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 px-5 py-3 text-xs font-extrabold shadow-md transition-all active:scale-95 w-fit cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4 text-orange-600" />
            <span>New Support Ticket</span>
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {[
          { label: 'Total Tickets', val: stats.total,      icon: Inbox },
          { label: 'Open',          val: stats.open,        icon: MessageSquare },
          { label: 'In Progress',   val: stats.inProgress,  icon: Clock },
          { label: 'Resolved',      val: stats.resolved,    icon: CheckCircle },
        ].map((s, i) => (
          <div key={i} className="group relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:p-5 shadow-2xs hover:border-orange-400/80 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-orange-100 dark:group-hover:bg-orange-950/80 group-hover:text-orange-600 dark:group-hover:text-orange-400 flex items-center justify-center shrink-0 transition-colors">
                <s.icon className="h-4.5 w-4.5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{s.val}</p>
            <p className="mt-0.5 text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Search & Filter ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets by subject..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-orange-500 transition shadow-2xs"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-slate-700 dark:text-slate-200 outline-none cursor-pointer shadow-2xs focus:border-orange-500 transition"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* ── Ticket List ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-20">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          <p className="mt-3 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Syncing support tickets…</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-16 px-6 text-center shadow-2xs">
          <div className="mb-4 rounded-2xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200/80 dark:border-orange-900/50 p-5">
            <LifeBuoy className="h-8 w-8 text-orange-500" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {searchTerm || statusFilter !== 'all' ? 'No tickets match your filters' : 'No tickets yet'}
          </h3>
          <p className="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400 font-medium">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or status filter.'
              : 'Have a question or issue? Submit a ticket and we\'ll help you out.'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 px-6 py-3 text-xs font-extrabold text-white shadow-md shadow-orange-500/20 transition active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Submit First Ticket
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
          {/* Desktop table header */}
          <div className="hidden md:grid md:grid-cols-[1fr_120px_100px_110px_56px] gap-4 bg-slate-50 dark:bg-slate-800/80 px-6 py-3.5 border-b border-slate-100 dark:border-slate-800">
            {['Ticket Subject', 'Status', 'Priority', 'Last Update', ''].map((h, i) => (
              <p key={i} className={`text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 ${i > 0 ? 'text-center' : ''}`}>{h}</p>
            ))}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredTickets.map(ticket => (
              <div
                key={ticket.id}
                className="group cursor-pointer transition hover:bg-orange-50/40 dark:hover:bg-slate-800/40"
                onClick={() => { fetchTicketDetail(ticket.id); setShowDetailModal(true); }}
              >
                {/* Mobile card */}
                <div className="flex items-center gap-4 p-4 md:hidden">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-gray-900 truncate group-hover:text-orange-600 transition-colors">{ticket.subject}</p>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <StatusPill status={ticket.status} />
                      <PriorityTag priority={ticket.priority} />
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                </div>

                {/* Desktop row */}
                <div className="hidden md:grid md:grid-cols-[1fr_120px_100px_110px_56px] gap-4 items-center px-6 py-4">
                  <div className="min-w-0">
                    <p className="font-black text-sm text-gray-900 truncate group-hover:text-orange-600 transition-colors">{ticket.subject}</p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <Tag className="h-2.5 w-2.5 text-gray-400" />
                      <span className="text-[10px] text-gray-400 font-medium">{ticket.category}</span>
                    </div>
                  </div>
                  <div className="flex justify-center"><StatusPill status={ticket.status} /></div>
                  <div className="flex justify-center"><PriorityTag priority={ticket.priority} /></div>
                  <p className="text-center text-xs text-gray-500 font-medium">
                    {new Date(ticket.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={e => { e.stopPropagation(); fetchTicketDetail(ticket.id); setShowDetailModal(true); }}
                      className="p-2 rounded-xl hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* ════════════════════════════════════════
          CREATE TICKET MODAL
      ════════════════════════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-150 flex items-center justify-center bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 p-4">
          {/* backdrop close */}
          <div className="absolute inset-0 hidden sm:block" onClick={() => setShowCreateModal(false)} />

          <div className="relative z-10 flex flex-col w-full max-h-[92dvh] sm:max-h-[90vh] sm:max-w-lg rounded-3xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden transform -translate-y-4 sm:translate-y-0 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">

            {/* ── Header ── */}
            <div className="flex items-start justify-between px-6 py-5 shrink-0 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  New Support <span className="bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">Ticket</span>
                </h2>
                <p className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 mt-1">
                  Average SLA Response Time: &lt; 24 Hours
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer text-slate-400 hover:text-slate-700 dark:hover:text-white shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ── Form body ── */}
            <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
              <div className="space-y-5">

                {/* Subject */}
                <div>
                  <label className="block text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Summarize your inquiry or issue…"
                    value={newTicket.subject}
                    onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-orange-500 transition"
                  />
                </div>

                {/* Category + Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                      Category
                    </label>
                    <select
                      value={newTicket.category}
                      onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-orange-500 transition cursor-pointer"
                    >
                      <option value="Support">General Support</option>
                      <option value="Billing">Billing & Subscription</option>
                      <option value="Feature">Feature Request</option>
                      <option value="Bug">Bug Report</option>
                      <option value="Account">Account Security</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                      Priority
                    </label>
                    <select
                      value={newTicket.priority}
                      onChange={e => setNewTicket({ ...newTicket, priority: e.target.value as Ticket['priority'] })}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-orange-500 transition cursor-pointer"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Describe what's happening in detail…"
                    value={newTicket.description}
                    onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-orange-500 transition resize-none leading-relaxed"
                  />
                </div>

              </div>
            </div>

            {/* ── Sticky Footer ── */}
            <div className="shrink-0 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3.5 text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleCreateTicket}
                disabled={!newTicket.subject.trim() || !newTicket.description.trim()}
                className="flex-1 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 py-3.5 text-xs font-extrabold text-white shadow-md shadow-orange-500/20 transition active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                SUBMIT TICKET
              </button>
            </div>

          </div>
        </div>
      )}


      {/* ════════════════════════════════════════
          TICKET DETAIL MODAL
      ════════════════════════════════════════ */}
      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 z-150 flex items-center justify-center bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 p-4">
          <div className="absolute inset-0 hidden sm:block" onClick={() => setShowDetailModal(false)} />

          <div className="relative z-10 flex flex-col w-full sm:max-w-2xl max-h-[92dvh] sm:max-h-[90vh] rounded-3xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden transform -translate-y-4 sm:translate-y-0 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">

            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="min-w-0">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2">{selectedTicket.subject}</h2>
                <div className="mt-1.5 flex items-center flex-wrap gap-2">
                  <StatusPill status={selectedTicket.status} />
                  <span className="text-[10px] font-mono text-slate-400 font-bold">#{selectedTicket.id.slice(-8).toUpperCase()}</span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{selectedTicket.category}</span>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="shrink-0 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Original request */}
            <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <p className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Original Request</p>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium line-clamp-3">{selectedTicket.description}</p>
              <div className="mt-2 flex items-center gap-4 text-[10px] text-slate-400 font-medium">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(selectedTicket.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                <PriorityTag priority={selectedTicket.priority} />
              </div>
            </div>

            {/* Conversation thread */}
            <div className="flex-1 overflow-y-auto px-6 pt-5 pb-32 space-y-4 custom-scrollbar">
              {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                selectedTicket.comments.map(comment => {
                  const isAgent = comment.authorRole === 'agent';
                  return (
                    <div key={comment.id} className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}>
                      <div className={`max-w-[85%] rounded-2xl p-4 ${
                        isAgent
                          ? 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-tl-none shadow-2xs'
                          : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-tr-none shadow-2xs font-medium'
                      }`}>
                        <div className={`flex items-center gap-2 mb-1.5 ${isAgent ? 'text-slate-700 dark:text-slate-300' : 'text-orange-50'}`}>
                          <span className="text-[11px] font-extrabold">{comment.authorName}</span>
                          {isAgent && (
                            <span className="rounded-md bg-orange-100 dark:bg-orange-950/80 px-1.5 py-0.5 text-[9px] font-mono font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400">Staff</span>
                          )}
                          <span className="text-[10px] opacity-60">
                            {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-4 mb-3">
                    <MessageSquare className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No responses yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Our support team will get back to you shortly.</p>
                </div>
              )}
            </div>

            {/* Reply box */}
            {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
              <div className="px-6 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
                <div className="flex items-end gap-3">
                  <textarea
                    rows={2}
                    placeholder="Type your reply… (Shift+Enter for line break)"
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); }
                    }}
                    className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-xs text-slate-900 dark:text-white outline-none focus:border-orange-500 transition resize-none leading-relaxed"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyMessage.trim() || isReplying}
                    className="shrink-0 p-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white transition shadow-xs disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    {isReplying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {(selectedTicket.status === 'closed' || selectedTicket.status === 'resolved') && (
              <div className="px-6 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  This ticket is {selectedTicket.status}. <button onClick={() => setShowCreateModal(true)} className="text-orange-500 cursor-pointer hover:underline">Open a new ticket</button> for further assistance.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
