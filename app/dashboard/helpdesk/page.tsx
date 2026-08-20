"use client";

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  MessageSquare, Clock, Plus, X, AlertCircle, CheckCircle,
  Timer, Search, Send, Eye, Edit, Trash2, TrendingUp,
  Zap, User, Loader2, ChevronDown, Link as LinkIcon, Lock
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import StatusModal from '@/components/StatusModal';
import WritingAssistButton from '@/components/ai/WritingAssistButton';
import TourProvider from '@/components/tours/TourProvider';
import { helpdeskTourSteps } from './tour-steps';

interface TicketComment {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
  isInternal?: boolean;
}

interface TeamMember {
  id: string;
  name: string;
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
  const [replyInternal, setReplyInternal]   = useState(false);
  const [isReplying, setIsReplying]         = useState(false);
  const [newTicket, setNewTicket]           = useState(blankTicket());
  const [teamMembers, setTeamMembers]       = useState<TeamMember[]>([]);
  const [businessId, setBusinessId]         = useState<string | null>(null);
  const [savingTicket, setSavingTicket]     = useState(false);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info';
  }>({ isOpen: false, title: '', message: '', type: 'success' });

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tickets');
      if (res.ok) setTickets(await res.json());
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  useEffect(() => {
    fetch('/api/employees').then(res => res.json()).then(data => {
      if (Array.isArray(data?.users)) {
        setTeamMembers(data.users.map((u: { id: string; firstName: string; lastName: string }) => ({ id: u.id, name: `${u.firstName} ${u.lastName}`.trim() })));
      }
    }).catch(() => {});
    fetch('/api/business').then(res => res.json()).then(data => {
      if (data?.id) setBusinessId(data.id);
    }).catch(() => {});
  }, []);

  const handleCopySupportLink = async () => {
    if (!businessId) return;
    const link = `${window.location.origin}/helpdesk/${businessId}`;
    await navigator.clipboard.writeText(link);
    setStatusModal({ isOpen: true, title: 'Link Copied', message: 'Your public support request link has been copied to your clipboard.', type: 'info' });
  };

  const handleCreateTicket = async () => {
    setSavingTicket(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create ticket');
      setTickets(prev => [data, ...prev]);
      setShowCreateModal(false);
      setNewTicket(blankTicket());
    } catch (error: unknown) {
      setStatusModal({ isOpen: true, title: 'Could Not Create Ticket', message: error instanceof Error ? error.message : 'Failed to create ticket.', type: 'error' });
    } finally {
      setSavingTicket(false);
    }
  };

  const handleUpdateTicket = async () => {
    if (!editTicket) return;
    setSavingTicket(true);
    try {
      const res = await fetch(`/api/tickets/${editTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTicket),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error || 'Failed to update ticket');
      setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
      setShowEditModal(false);
      setEditTicket(null);
    } catch (error: unknown) {
      setStatusModal({ isOpen: true, title: 'Could Not Save Changes', message: error instanceof Error ? error.message : 'Failed to update ticket.', type: 'error' });
    } finally {
      setSavingTicket(false);
    }
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
        setReplyMessage('');
        setReplyInternal(false);
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
        body: JSON.stringify({ content: replyMessage, isInternal: replyInternal }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setSelectedTicket(prev => prev ? {
          ...prev,
          comments: [...(prev.comments ?? []), newComment],
          responses: (prev.responses ?? 0) + 1,
        } : null);
        setReplyMessage('');
        setReplyInternal(false);
        fetchTickets();
      } else {
        const data = await res.json().catch(() => ({}));
        setStatusModal({ isOpen: true, title: 'Could Not Send Reply', message: data.error || 'Failed to add reply.', type: 'error' });
      }
    } catch {
      setStatusModal({ isOpen: true, title: 'Could Not Send Reply', message: 'Failed to add reply.', type: 'error' });
    } finally {
      setIsReplying(false);
    }
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
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-24 sm:pb-8">
      <TourProvider moduleId="helpdesk" steps={helpdeskTourSteps} />

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
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                  Helpdesk Support Hub
                </h1>
                <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/40 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> Active Queue
                </span>
              </div>
              <p className="text-xs font-bold text-slate-400 truncate hidden sm:block mt-0.5">
                Manage support tickets and customer requests
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopySupportLink}
              disabled={!businessId}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer shrink-0 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <LinkIcon className="w-4 h-4 text-orange-500" />
              <span className="hidden sm:inline">Support Link</span>
            </button>
            <button
              id="tour-helpdesk-new-button"
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4.5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl text-xs font-extrabold shadow-sm shadow-orange-500/20 transition-all cursor-pointer shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Ticket</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── High-Performance Telemetry Pods ── */}
        <div id="tour-helpdesk-stats" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Tickets', value: stats.total,      icon: MessageSquare, bgGrad: 'from-orange-500 to-amber-600' },
            { label: 'Open',          value: stats.open,        icon: AlertCircle,   bgGrad: 'from-rose-500 to-red-600' },
            { label: 'Active',        value: stats.inProgress,  icon: Timer,         bgGrad: 'from-amber-500 to-orange-500' },
            { label: 'Resolved',      value: stats.resolved,    icon: CheckCircle,   bgGrad: 'from-emerald-500 to-teal-600' },
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

        {/* ── Search & Filter Dock ── */}
        <div id="tour-helpdesk-search" className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-3.5 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tickets…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-500 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-40">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none appearance-none cursor-pointer pr-9 focus:border-orange-500 transition-all"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative flex-1 sm:w-40">
              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none appearance-none cursor-pointer pr-9 focus:border-orange-500 transition-all"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── Ticket List Cards & Sleek Empty State ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-9 h-9 text-orange-500 animate-spin" />
            <p className="text-xs font-bold text-slate-400">Loading support tickets…</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-12 sm:p-16 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-4 shadow-2xs">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1.5">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' ? 'No matching tickets' : 'No support tickets yet'}
            </h3>
            <p className="text-xs font-bold text-slate-400 max-w-sm mx-auto mb-6">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'Try adjusting your search query or filter options to find support tickets.'
                : 'Create your first support ticket or share your customer portal link to receive requests.'}
            </p>
            {!searchTerm && filterStatus === 'all' && filterPriority === 'all' && (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl text-xs font-extrabold shadow-sm shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" /> New Ticket
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map(ticket => {
              const sc = statusCfg[ticket.status] ?? statusCfg.closed;
              const pc = priorityCfg[ticket.priority] ?? priorityCfg.medium;
              const PIcon = pc.icon;
              return (
                <div key={ticket.id} className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-5 hover:border-orange-300 transition-all group">
                  {/* Top Row */}
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center font-mono font-extrabold text-sm shadow-2xs">
                        {ticket.customer.charAt(0).toUpperCase()}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-950 ${sc.dot}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 justify-between flex-wrap">
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                            {ticket.subject}
                          </h3>
                          <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" /> {ticket.customer}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${sc.badge}`}>{sc.label}</span>
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 ${pc.badge}`}>
                            <PIcon className="w-3 h-3" /> {pc.label}
                          </span>
                        </div>
                      </div>
                      {/* Meta Tags */}
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <span className="text-[10px] font-mono font-extrabold bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-lg border border-orange-200/60 dark:border-orange-900/40">
                          #{ticket.id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                          {ticket.category}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {new Date(ticket.updatedAt).toLocaleDateString()}
                        </span>
                        {(ticket.responses ?? 0) > 0 && (
                          <span className="text-[10px] font-mono font-bold text-slate-400">{ticket.responses} replies</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex gap-2 mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-900">
                    <button
                      type="button"
                      onClick={() => fetchTicketDetails(ticket.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-orange-50/80 dark:bg-orange-950/40 hover:bg-orange-100 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/40 rounded-2xl text-xs font-extrabold transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Ticket
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditTicket(ticket); setShowEditModal(true); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-extrabold transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDeletingTicket(ticket); setShowDeleteModal(true); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-500 border border-rose-100 dark:border-rose-900/40 rounded-2xl text-xs font-extrabold transition-colors cursor-pointer"
                    >
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
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full sm:max-w-lg flex flex-col overflow-hidden max-h-[92dvh] sm:max-h-[92vh] rounded-2xl shadow-2xl border border-white/20 transform -translate-y-6 sm:translate-y-0 animate-in slide-in-from-bottom-10 duration-300">
            <ModalHandle />
            <div className={modalHeaderCls}>
              <div>
                <h2 className="text-sm sm:text-lg font-bold text-gray-900 tracking-tight">New ticket</h2>
                <p className="text-[11px] text-gray-500 font-medium">Log a new support request</p>
              </div>
              <button type="button" onClick={() => { setShowCreateModal(false); setNewTicket(blankTicket()); }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 py-1.5 sm:py-5 space-y-2 sm:space-y-4">
              <div>
                <label className={labelCls}>Subject *</label>
                <input type="text" value={newTicket.subject}
                  onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className={inputCls} placeholder="e.g. Login not working" />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className={labelCls}>Customer *</label>
                  <input type="text" value={newTicket.customer}
                    onChange={e => setNewTicket({ ...newTicket, customer: e.target.value })}
                    className={inputCls} placeholder="Customer name" />
                </div>
                <div>
                  <label className={labelCls}>Email *</label>
                  <input type="email" value={newTicket.email}
                    onChange={e => setNewTicket({ ...newTicket, email: e.target.value })}
                    className={inputCls} placeholder="customer@email.com" />
                </div>
                <div>
                  <label className={labelCls}>Priority</label>
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
                  <label className={labelCls}>Category</label>
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
                <div className="flex items-center justify-between mb-1">
                  <label className={`${labelCls} mb-0`}>Description</label>
                  <WritingAssistButton
                    text={newTicket.description}
                    onResult={(result) => setNewTicket({ ...newTicket, description: result })}
                  />
                </div>
                <textarea value={newTicket.description}
                  onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                  className={`${inputCls} h-16 sm:h-24 resize-none`}
                  placeholder="Describe the issue in detail…" />
              </div>
            </div>

            <ModalFooter>
              <CancelBtn onClick={() => { setShowCreateModal(false); setNewTicket(blankTicket()); }} />
              <button
                type="button"
                onClick={handleCreateTicket}
                disabled={savingTicket || !newTicket.subject || !newTicket.customer || !newTicket.email}
                className="flex-2 py-3 px-5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-95"
              >
                {savingTicket ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {savingTicket ? 'Creating...' : 'Create Ticket'}
              </button>
            </ModalFooter>
          </div>
        </div>
      )}

      {/* ── Ticket Detail Modal ── */}
      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full sm:max-w-2xl flex flex-col overflow-hidden max-h-[92dvh] sm:max-h-[92vh] rounded-2xl shadow-2xl border border-white/20 transform -translate-y-6 sm:translate-y-0 animate-in slide-in-from-bottom-10 duration-300">
            <ModalHandle />

            {/* Header */}
            <div className={`${modalHeaderCls} items-start`}>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full tracking-wide">
                    #{selectedTicket.id.slice(-6).toUpperCase()}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCfg[selectedTicket.status]?.badge ?? 'bg-gray-100 text-gray-600'}`}>
                    {statusCfg[selectedTicket.status]?.label ?? selectedTicket.status}
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-snug tracking-tight">{selectedTicket.subject}</h2>
                <p className="text-gray-500 text-[10px] sm:text-xs mt-0.5">{selectedTicket.customer} · {selectedTicket.email}</p>
              </div>
              <button type="button" onClick={() => { setShowDetailModal(false); setReplyMessage(''); setReplyInternal(false); }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer text-gray-400 hover:text-gray-600 shrink-0">
                <X className="w-5 h-5" />
              </button>
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
                if (comment.isInternal) {
                  return (
                    <div key={comment.id} className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-amber-100">
                        <Lock className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-bold text-gray-700">{comment.authorName}</span>
                          <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">Internal note</span>
                          <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="p-3.5 text-sm leading-relaxed border bg-amber-50 border-amber-200 text-amber-900 rounded-2xl rounded-tl-none">
                          {comment.content}
                        </div>
                      </div>
                    </div>
                  );
                }
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
            <div className="shrink-0 bg-white border-t border-gray-100 p-3 pb-[calc(1.25rem+env(safe-area-inset-bottom,12px))] sm:pb-3 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 cursor-pointer w-fit">
                <input type="checkbox" checked={replyInternal} onChange={e => setReplyInternal(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-amber-500 focus:ring-amber-400 cursor-pointer" />
                <Lock className="w-3 h-3" /> Internal note (not sent to customer)
              </label>
              <div className="flex gap-2 items-end">
                <textarea
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                  placeholder={replyInternal ? "Write an internal note… (Enter to send)" : "Type your reply… (Enter to send)"}
                  className={`flex-1 px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:border-transparent resize-none transition-all h-10 min-h-[40px] sm:h-11 sm:min-h-[44px] ${
                    replyInternal ? 'bg-amber-50 border-amber-200 focus:ring-amber-400' : 'bg-gray-50 border-gray-200 focus:ring-indigo-400'
                  }`}
                />
                <button type="button" onClick={handleReply}
                  disabled={isReplying || !replyMessage.trim()}
                  className={`p-2 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors cursor-pointer shrink-0 h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center ${
                    replyInternal ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}>
                  {isReplying ? <Loader2 className="w-4 h-4 animate-spin" /> : replyInternal ? <Lock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Ticket Modal ── */}
      {showEditModal && editTicket && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full sm:max-w-md flex flex-col overflow-hidden max-h-[92dvh] sm:max-h-[92vh] rounded-2xl shadow-2xl border border-white/20 transform -translate-y-6 sm:translate-y-0 animate-in slide-in-from-bottom-10 duration-300">
            <ModalHandle />
            <div className={modalHeaderCls}>
              <div>
                <h2 className="text-sm sm:text-lg font-bold text-gray-900 tracking-tight">Edit ticket</h2>
                <p className="text-[11px] text-gray-500 font-medium">Update status, priority and assignment</p>
              </div>
              <button type="button" onClick={() => { setShowEditModal(false); setEditTicket(null); }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 py-1.5 sm:py-5 space-y-3 sm:space-y-4">
              <div>
                <label className={labelCls}>Status</label>
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
                <label className={labelCls}>Priority</label>
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
                <label className={labelCls}>Assigned to</label>
                <select value={editTicket.assignedTo || ''}
                  onChange={e => setEditTicket({ ...editTicket, assignedTo: e.target.value })}
                  className={`${inputCls} appearance-none cursor-pointer`}>
                  <option value="">Unassigned</option>
                  {teamMembers.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
              </div>
            </div>

            <ModalFooter>
              <CancelBtn onClick={() => { setShowEditModal(false); setEditTicket(null); }} />
              <button
                type="button"
                onClick={handleUpdateTicket}
                disabled={savingTicket}
                className="flex-2 py-3 px-5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-95"
              >
                {savingTicket ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {savingTicket ? 'Saving...' : 'Save Changes'}
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
