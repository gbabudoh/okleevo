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
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-linear-to-br from-gray-900 via-orange-950 to-gray-900 px-5 py-7 md:px-10 md:py-10">
        <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 md:w-72 md:h-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 w-40 h-40 md:w-60 md:h-60 rounded-full bg-red-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1">
              <LifeBuoy className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">Platform Support</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              Help &amp; <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-amber-400">Support</span>
            </h1>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              Our team is here to assist you
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600 active:scale-95 w-fit"
          >
            <Plus className="h-3.5 w-3.5" />
            New Ticket
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {[
          { label: 'Total Tickets', val: stats.total,      icon: Inbox,          color: 'gray'   },
          { label: 'Open',          val: stats.open,        icon: MessageSquare,  color: 'blue'   },
          { label: 'In Progress',   val: stats.inProgress,  icon: Clock,          color: 'purple' },
          { label: 'Resolved',      val: stats.resolved,    icon: CheckCircle,    color: 'emerald'},
        ].map((s, i) => (
          <div key={i} className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className={`rounded-xl p-2.5 bg-${s.color}-100`}>
                <s.icon className={`h-4 w-4 text-${s.color}-600`} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black tracking-tight text-gray-900">{s.val}</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Search & Filter ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition shadow-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-[11px] font-black uppercase tracking-wider text-gray-700 outline-none cursor-pointer shadow-sm focus:border-orange-500 transition appearance-none"
          style={{ backgroundImage: 'none' }}
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
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-20">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          <p className="mt-3 text-sm text-gray-500 font-medium">Loading tickets…</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 py-16 px-6 text-center">
          <div className="mb-4 rounded-2xl bg-orange-50 p-5">
            <LifeBuoy className="h-8 w-8 text-orange-400" />
          </div>
          <h3 className="text-lg font-black text-gray-900">
            {searchTerm || statusFilter !== 'all' ? 'No tickets match your filters' : 'No tickets yet'}
          </h3>
          <p className="mt-1 max-w-xs text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or status filter.'
              : 'Have a question or issue? Submit a ticket and we\'ll help you out.'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 transition active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" /> Submit First Ticket
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {/* Desktop table header */}
          <div className="hidden md:grid md:grid-cols-[1fr_120px_100px_110px_56px] gap-4 bg-gray-900 px-6 py-4">
            {['Ticket', 'Status', 'Priority', 'Last Update', ''].map((h, i) => (
              <p key={i} className={`text-[10px] font-black uppercase tracking-[0.2em] text-white ${i > 0 ? 'text-center' : ''}`}>{h}</p>
            ))}
          </div>

          <div className="divide-y divide-gray-50">
            {filteredTickets.map(ticket => (
              <div
                key={ticket.id}
                className="group cursor-pointer transition hover:bg-orange-50/30"
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
        <div className="fixed inset-0 z-150 flex items-end sm:items-center justify-center bg-gray-900/70 backdrop-blur-sm animate-in fade-in duration-200 p-0 sm:p-4">
          {/* backdrop close — desktop only, not on mobile so accidental swipe doesn't close */}
          <div className="absolute inset-0 hidden sm:block" onClick={() => setShowCreateModal(false)} />

          {/* On mobile: full-screen. On sm+: centered card */}
          <div className="relative z-10 flex flex-col w-full h-[100dvh] sm:h-auto sm:max-w-lg sm:max-h-[90vh] sm:rounded-3xl bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">

            {/* ── Header ── */}
            <div className="flex items-start justify-between px-6 pt-14 pb-5 sm:pt-7 sm:pb-5">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-gray-900 leading-tight">
                  New Support <span className="text-orange-500">Request</span>
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 mt-1">
                  We typically respond within 24 hours
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 -mt-1 -mr-1 rounded-xl hover:bg-gray-100 transition cursor-pointer shrink-0"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* thin divider */}
            <div className="h-px bg-gray-100 mx-6" />

            {/* ── Form body + buttons (all inside scroll) ── */}
            <div className="flex-1 overflow-y-auto px-6 pt-7 pb-40 custom-scrollbar">
              <div className="space-y-6">

                {/* Subject */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 mb-2.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Summarize your issue…"
                    value={newTicket.subject}
                    onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 transition"
                  />
                </div>

                {/* Category + Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 mb-2.5">
                      Category
                    </label>
                    <select
                      value={newTicket.category}
                      onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm font-medium text-gray-900 outline-none focus:border-orange-400 transition cursor-pointer appearance-none"
                      style={{ backgroundImage: 'none' }}
                    >
                      <option value="Support">General Support</option>
                      <option value="Billing">Billing</option>
                      <option value="Feature">Feature Request</option>
                      <option value="Bug">Bug Report</option>
                      <option value="Account">Account Security</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 mb-2.5">
                      Priority
                    </label>
                    <select
                      value={newTicket.priority}
                      onChange={e => setNewTicket({ ...newTicket, priority: e.target.value as Ticket['priority'] })}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm font-medium text-gray-900 outline-none focus:border-orange-400 transition cursor-pointer appearance-none"
                      style={{ backgroundImage: 'none' }}
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
                  <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 mb-2.5">
                    Description
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Describe what's happening in detail…"
                    value={newTicket.description}
                    onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 transition resize-none leading-relaxed"
                  />
                </div>

              </div>

              {/* ── Action buttons — scroll into view at the bottom ── */}
              <div className="flex items-center gap-3 pt-8 pb-[calc(1.75rem+env(safe-area-inset-bottom,0px))] sm:pb-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-2xl border border-gray-200 bg-white py-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:bg-gray-50 transition cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleCreateTicket}
                  disabled={!newTicket.subject.trim() || !newTicket.description.trim()}
                  className="flex-2 rounded-2xl bg-orange-500 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600 transition active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  SUBMIT TICKET
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ════════════════════════════════════════
          TICKET DETAIL MODAL
      ════════════════════════════════════════ */}
      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 z-150 flex items-end sm:items-center justify-center bg-gray-900/70 backdrop-blur-sm animate-in fade-in duration-200 p-0 sm:p-4">
          <div className="absolute inset-0" onClick={() => setShowDetailModal(false)} />

          <div className="relative z-10 flex flex-col w-full sm:max-w-2xl max-h-[95dvh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">

            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-gray-100 shrink-0">
              <div className="min-w-0">
                <h2 className="text-base font-black text-gray-900 leading-snug line-clamp-2">{selectedTicket.subject}</h2>
                <div className="mt-1.5 flex items-center flex-wrap gap-2">
                  <StatusPill status={selectedTicket.status} />
                  <span className="text-[10px] text-gray-400 font-medium">#{selectedTicket.id.slice(-8).toUpperCase()}</span>
                  <span className="text-[10px] text-gray-400 font-medium">{selectedTicket.category}</span>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="shrink-0 p-2 rounded-xl hover:bg-gray-100 transition cursor-pointer">
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Original request */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 shrink-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Original Request</p>
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{selectedTicket.description}</p>
              <div className="mt-2 flex items-center gap-4 text-[10px] text-gray-400 font-medium">
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
                          ? 'bg-white border border-gray-100 rounded-tl-none shadow-sm'
                          : 'bg-orange-500 text-white rounded-tr-none shadow-sm'
                      }`}>
                        <div className={`flex items-center gap-2 mb-1.5 ${isAgent ? 'text-gray-700' : 'text-orange-50'}`}>
                          <span className="text-[11px] font-black">{comment.authorName}</span>
                          {isAgent && (
                            <span className="rounded-md bg-orange-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-orange-600">Staff</span>
                          )}
                          <span className="text-[10px] opacity-50">
                            {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="rounded-2xl bg-gray-50 p-4 mb-3">
                    <MessageSquare className="h-7 w-7 text-gray-300" />
                  </div>
                  <p className="text-sm font-bold text-gray-500">No responses yet</p>
                  <p className="text-xs text-gray-400 mt-1">Our team will get back to you shortly.</p>
                </div>
              )}
            </div>

            {/* Reply box */}
            {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
              <div className="px-6 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-4 border-t border-gray-100 bg-white shrink-0">
                <div className="flex items-end gap-3">
                  <textarea
                    rows={2}
                    placeholder="Type your message… (Enter to send)"
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); }
                    }}
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition resize-none leading-relaxed"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyMessage.trim() || isReplying}
                    className="shrink-0 p-3 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isReplying ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {(selectedTicket.status === 'closed' || selectedTicket.status === 'resolved') && (
              <div className="px-6 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-4 border-t border-gray-100 bg-gray-50 shrink-0 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
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
