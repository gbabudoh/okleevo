"use client";

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  MessageSquare, Clock, Plus, X, AlertCircle, CheckCircle,
  Timer, Search, Send, Eye, Edit, Trash2, TrendingUp,
  Zap, User, Loader2, ChevronDown
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

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
}

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-sm font-medium bg-white';

const ModalHandle = () => (
  <div className="flex justify-center pt-2 pb-0 sm:hidden shrink-0">
    <div className="w-10 h-1 rounded-full bg-gray-300" />
  </div>
);

const ModalFooter = ({ children }: { children: ReactNode }) => (
  <div className="shrink-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 flex flex-row gap-2.5 pb-[calc(1.25rem+env(safe-area-inset-bottom,12px))] sm:pb-3">
    {children}
  </div>
);

const CancelBtn = ({ onClick }: { onClick: () => void }) => (
  <button type="button" onClick={onClick}
    className="flex-1 py-3 px-5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer">
    Cancel
  </button>
);

const statusCfg = {
  open:        { label: 'Open',       dot: 'bg-blue-500',    badge: 'bg-blue-100 text-blue-700' },
  pending:     { label: 'Waiting',    dot: 'bg-amber-400',   badge: 'bg-amber-100 text-amber-700' },
  'in-progress':{ label: 'Working',  dot: 'bg-purple-500',  badge: 'bg-purple-100 text-purple-700' },
  resolved:    { label: 'Resolved',   dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
  closed:      { label: 'Closed',     dot: 'bg-gray-400',    badge: 'bg-gray-100 text-gray-600' },
} as const;

const priorityCfg = {
  urgent: { label: 'Urgent', badge: 'bg-red-100 text-red-700',    icon: Zap },
  high:   { label: 'High',   badge: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  medium: { label: 'Medium', badge: 'bg-amber-100 text-amber-700', icon: Timer },
  low:    { label: 'Low',    badge: 'bg-blue-100 text-blue-700',   icon: Clock },
} as const;

const blankTicket = () => ({
  subject: '', customer: '', email: '',
  priority: 'medium' as Ticket['priority'],
  category: 'Support', description: '',
});

export default function HelpdeskPage() {
  const [tickets, setTickets]               = useState<Ticket[]>([]);
  const [loading, setLoading]               = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal]   = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [editTicket, setEditTicket]         = useState<Ticket | null>(null);
  const [deletingTicket, setDeletingTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm]         = useState('');
  const [filterStatus, setFilterStatus]     = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [replyMessage, setReplyMessage]     = useState('');
  const [isReplying, setIsReplying]         = useState(false);
  const [newTicket, setNewTicket]           = useState(blankTicket());

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tickets');
      if (res.ok) setTickets(await res.json());
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleCreateTicket = async () => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket),
      });
      if (res.ok) {
        const saved = await res.json();
        setTickets(prev => [saved, ...prev]);
        setShowCreateModal(false);
        setNewTicket(blankTicket());
      }
    } catch { /* silent */ }
  };

  const handleUpdateTicket = async () => {
    if (!editTicket) return;
    try {
      const res = await fetch(`/api/tickets/${editTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTicket),
      });
      if (res.ok) {
        const updated = await res.json();
        setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
        setShowEditModal(false);
        setEditTicket(null);
      }
    } catch { /* silent */ }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTicket) return;
    try {
      const res = await fetch(`/api/tickets/${deletingTicket.id}`, { method: 'DELETE' });
      if (res.ok) {
        setTickets(prev => prev.filter(t => t.id !== deletingTicket.id));
        setShowDeleteModal(false);
        setDeletingTicket(null);
      }
    } catch { /* silent */ }
  };

  const fetchTicketDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/tickets/${id}`);
      if (res.ok) {
        setSelectedTicket(await res.json());
        setShowDetailModal(true);
      }
    } catch { /* silent */ }
  };

  const handleReply = async () => {
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
        setSelectedTicket(prev => prev ? {
          ...prev,
          comments: [...(prev.comments ?? []), newComment],
          responses: (prev.responses ?? 0) + 1,
        } : null);
        setReplyMessage('');
        fetchTickets();
      }
    } catch { /* silent */ } finally { setIsReplying(false); }
  };

  const filteredTickets = tickets.filter(t =>
    (t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus   === 'all' || t.status   === filterStatus) &&
    (filterPriority === 'all' || t.priority === filterPriority)
  );

  const stats = {
    total:      tickets.length,
    open:       tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress' || t.status === 'pending').length,
    resolved:   tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8">

      {/* Mobile FAB */}
      <button
        type="button"
        onClick={() => setShowCreateModal(true)}
        className="sm:hidden fixed bottom-24 right-6 w-14 h-14 bg-linear-to-r from-indigo-600 to-violet-700 text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-95 transition-transform"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl shrink-0">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Helpdesk</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Manage support tickets and customer requests</p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Ticket</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Tickets', value: stats.total,      icon: MessageSquare, bg: 'bg-indigo-100', ic: 'text-indigo-600', val: 'text-indigo-700' },
            { label: 'Open',          value: stats.open,        icon: AlertCircle,   bg: 'bg-blue-100',   ic: 'text-blue-600',   val: 'text-blue-700' },
            { label: 'Active',        value: stats.inProgress,  icon: Timer,         bg: 'bg-purple-100', ic: 'text-purple-600', val: 'text-purple-700' },
            { label: 'Resolved',      value: stats.resolved,    icon: CheckCircle,   bg: 'bg-emerald-100',ic: 'text-emerald-600',val: 'text-emerald-700' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className={`p-2 rounded-lg ${s.bg} w-fit mb-2`}>
                <s.icon className={`w-4 h-4 ${s.ic}`} />
              </div>
              <p className={`text-2xl font-bold ${s.val}`}>{s.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tickets…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none border border-gray-100 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-36">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none border border-gray-100 appearance-none cursor-pointer pr-8 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all">
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative flex-1 sm:w-36">
              <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none border border-gray-100 appearance-none cursor-pointer pr-8 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all">
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Ticket list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Loading tickets…</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' ? 'No matching tickets' : 'No tickets yet'}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Create your first support ticket to get started.'}
            </p>
            {!searchTerm && filterStatus === 'all' && filterPriority === 'all' && (
              <button type="button" onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer">
                <Plus className="w-4 h-4" /> New Ticket
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTickets.map(ticket => {
              const sc = statusCfg[ticket.status] ?? statusCfg.closed;
              const pc = priorityCfg[ticket.priority] ?? priorityCfg.medium;
              const PIcon = pc.icon;
              return (
                <div key={ticket.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  {/* Top row */}
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${sc.dot}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 justify-between flex-wrap">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 leading-tight truncate">{ticket.subject}</p>
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <User className="w-3 h-3" /> {ticket.customer}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${sc.badge}`}>{sc.label}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${pc.badge}`}>
                            <PIcon className="w-3 h-3" /> {pc.label}
                          </span>
                        </div>
                      </div>
                      {/* Meta */}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md">
                          #{ticket.id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md font-medium">{ticket.category}</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(ticket.updatedAt).toLocaleDateString()}
                        </span>
                        {(ticket.responses ?? 0) > 0 && (
                          <span className="text-[10px] text-gray-400">{ticket.responses} replies</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 mt-3 pt-3 border-t border-gray-50">
                    <button type="button"
                      onClick={() => fetchTicketDetails(ticket.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer">
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    <button type="button"
                      onClick={() => { setEditTicket(ticket); setShowEditModal(true); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button type="button"
                      onClick={() => { setDeletingTicket(ticket); setShowDeleteModal(true); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Create Ticket Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 sm:p-4 pb-10 sm:pb-4">
          <div className="bg-white w-full sm:max-w-lg flex flex-col overflow-hidden max-h-[66dvh] sm:max-h-[92vh] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-white/20 transform animate-in slide-in-from-bottom-10 duration-300">
            <ModalHandle />
            <div className="bg-linear-to-r from-indigo-600 to-violet-700 px-5 sm:px-6 py-2 sm:py-5 flex items-center justify-between shrink-0 shadow-lg">
              <h2 className="text-sm sm:text-lg font-bold text-white flex items-center gap-2 tracking-tight">
                <Plus className="w-4 h-4" /> New Ticket
              </h2>
              <button type="button" onClick={() => { setShowCreateModal(false); setNewTicket(blankTicket()); }}
                className="p-2 hover:bg-white/20 rounded-xl transition-all cursor-pointer text-white">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 py-1.5 sm:py-5 space-y-2 sm:space-y-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Subject *</label>
                <input type="text" value={newTicket.subject}
                  onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className={inputCls} placeholder="e.g. Login not working" />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Customer *</label>
                  <input type="text" value={newTicket.customer}
                    onChange={e => setNewTicket({ ...newTicket, customer: e.target.value })}
                    className={inputCls} placeholder="Customer name" />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Email *</label>
                  <input type="email" value={newTicket.email}
                    onChange={e => setNewTicket({ ...newTicket, email: e.target.value })}
                    className={inputCls} placeholder="customer@email.com" />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Priority</label>
                  <select value={newTicket.priority}
                    onChange={e => setNewTicket({ ...newTicket, priority: e.target.value as Ticket['priority'] })}
                    className={`${inputCls} appearance-none cursor-pointer`}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                  <select value={newTicket.category}
                    onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}
                    className={`${inputCls} appearance-none cursor-pointer`}>
                    <option value="Support">General Support</option>
                    <option value="Technical">Technical Issue</option>
                    <option value="Billing">Billing</option>
                    <option value="Feature">Feature Request</option>
                    <option value="Bug">Bug Report</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                <textarea value={newTicket.description}
                  onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                  className={`${inputCls} h-16 sm:h-24 resize-none`}
                  placeholder="Describe the issue in detail…" />
              </div>
            </div>

            <ModalFooter>
              <CancelBtn onClick={() => { setShowCreateModal(false); setNewTicket(blankTicket()); }} />
              <button type="button" onClick={handleCreateTicket}
                disabled={!newTicket.subject || !newTicket.customer || !newTicket.email}
                className="flex-2 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Create Ticket
              </button>
            </ModalFooter>
          </div>
        </div>
      )}

      {/* ── Ticket Detail Modal ── */}
      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 sm:p-4 pb-10 sm:pb-4">
          <div className="bg-white w-full sm:max-w-2xl flex flex-col overflow-hidden max-h-[66dvh] sm:max-h-[92vh] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-white/20 transform animate-in slide-in-from-bottom-10 duration-300">
            <ModalHandle />

            {/* Header */}
            <div className="bg-linear-to-r from-indigo-600 to-violet-700 px-5 sm:px-6 py-2 sm:py-5 shrink-0 shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                      #{selectedTicket.id.slice(-6).toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCfg[selectedTicket.status]?.badge ?? 'bg-gray-100 text-gray-600'}`}>
                      {statusCfg[selectedTicket.status]?.label ?? selectedTicket.status}
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-white leading-snug tracking-tight">{selectedTicket.subject}</h2>
                  <p className="text-indigo-100 text-[10px] sm:text-xs mt-0.5">{selectedTicket.customer} · {selectedTicket.email}</p>
                </div>
                <button type="button" onClick={() => { setShowDetailModal(false); setReplyMessage(''); }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all cursor-pointer text-white shrink-0">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Conversation thread */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gray-50">
              {/* Initial description */}
              {selectedTicket.description && (
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-gray-700">{selectedTicket.customer}</span>
                      <span className="text-[10px] text-gray-400">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-none p-3.5 border border-gray-200 text-sm text-gray-700 leading-relaxed">
                      {selectedTicket.description}
                    </div>
                  </div>
                </div>
              )}

              {/* Comments */}
              {selectedTicket.comments?.map(comment => {
                const isAgent = comment.authorRole === 'agent';
                return (
                  <div key={comment.id} className={`flex gap-3 items-start ${isAgent ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isAgent ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                      {isAgent
                        ? <Zap className="w-4 h-4 text-white" />
                        : <User className="w-4 h-4 text-gray-500" />}
                    </div>
                    <div className={`flex-1 min-w-0 ${isAgent ? 'text-right' : ''}`}>
                      <div className={`flex items-center gap-2 mb-1.5 ${isAgent ? 'flex-row-reverse' : ''}`}>
                        <span className="text-xs font-bold text-gray-700">{comment.authorName}</span>
                        <span className={`text-[10px] font-semibold uppercase ${isAgent ? 'text-indigo-600' : 'text-gray-400'}`}>{comment.authorRole}</span>
                        <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <div className={`p-3.5 text-sm leading-relaxed border ${isAgent
                        ? 'bg-indigo-50 border-indigo-100 text-indigo-900 rounded-2xl rounded-tr-none'
                        : 'bg-white border-gray-200 text-gray-700 rounded-2xl rounded-tl-none'}`}>
                        {comment.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply footer */}
            <div className="shrink-0 bg-white border-t border-gray-100 p-3 pb-[calc(1.25rem+env(safe-area-inset-bottom,12px))] sm:pb-3">
              <div className="flex gap-2 items-end">
                <textarea
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                  placeholder="Type your reply… (Enter to send)"
                  className="flex-1 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none transition-all h-10 min-h-[40px] sm:h-11 sm:min-h-[44px]"
                />
                <button type="button" onClick={handleReply}
                  disabled={isReplying || !replyMessage.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors cursor-pointer shrink-0 h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center">
                  {isReplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Ticket Modal ── */}
      {showEditModal && editTicket && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 sm:p-4 pb-10 sm:pb-4">
          <div className="bg-white w-full sm:max-w-md flex flex-col overflow-hidden max-h-[66dvh] sm:max-h-[92vh] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-white/20 transform animate-in slide-in-from-bottom-10 duration-300">
            <ModalHandle />
            <div className="bg-linear-to-r from-amber-500 to-orange-600 px-5 sm:px-6 py-2 sm:py-5 flex items-center justify-between shrink-0 shadow-lg">
              <h2 className="text-sm sm:text-lg font-bold text-white flex items-center gap-2 tracking-tight">
                <Edit className="w-4 h-4" /> Edit Ticket
              </h2>
              <button type="button" onClick={() => { setShowEditModal(false); setEditTicket(null); }}
                className="p-2 hover:bg-white/20 rounded-xl transition-all cursor-pointer text-white">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 py-1.5 sm:py-5 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                <select value={editTicket.status}
                  onChange={e => setEditTicket({ ...editTicket, status: e.target.value as Ticket['status'] })}
                  className={`${inputCls} appearance-none cursor-pointer`}>
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Priority</label>
                <select value={editTicket.priority}
                  onChange={e => setEditTicket({ ...editTicket, priority: e.target.value as Ticket['priority'] })}
                  className={`${inputCls} appearance-none cursor-pointer`}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Assigned To</label>
                <input type="text" value={editTicket.assignedTo || ''}
                  onChange={e => setEditTicket({ ...editTicket, assignedTo: e.target.value })}
                  className={inputCls} placeholder="Agent name" />
              </div>
            </div>

            <ModalFooter>
              <CancelBtn onClick={() => { setShowEditModal(false); setEditTicket(null); }} />
              <button type="button" onClick={handleUpdateTicket}
                className="flex-2 py-3 px-5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> Save Changes
              </button>
            </ModalFooter>
          </div>
        </div>
      )}

      {/* ── Delete ── */}
      {deletingTicket && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeletingTicket(null); }}
          onConfirm={handleDeleteConfirm}
          title="Delete Ticket"
          itemName={`#${deletingTicket.id.slice(-6).toUpperCase()}`}
          itemDetails={deletingTicket.subject}
          warningMessage="This will permanently remove the ticket and all its replies."
        />
      )}
    </div>
  );
}
