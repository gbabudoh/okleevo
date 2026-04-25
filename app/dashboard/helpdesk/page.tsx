"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Clock, Plus, X, AlertCircle, CheckCircle, Timer, Search, Send, Eye, Edit, Trash2, TrendingUp, Zap, User, Loader2, Filter } from 'lucide-react';
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

export default function HelpdeskPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [editTicket, setEditTicket] = useState<Ticket | null>(null);
  const [deletingTicket, setDeletingTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const [newTicket, setNewTicket] = useState<{
    subject: string;
    customer: string;
    email: string;
    priority: Ticket['priority'];
    category: string;
    description: string;
  }>({ subject: '', customer: '', email: '', priority: 'medium', category: 'Support', description: '' });

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (error: unknown) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

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
        setNewTicket({ subject: '', customer: '', email: '', priority: 'medium', category: 'Support', description: '' });
      }
    } catch (error: unknown) {
      console.error('Error creating ticket:', error);
    }
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
    } catch (error: unknown) {
      console.error('Error updating ticket:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTicket) return;
    try {
      const res = await fetch(`/api/tickets/${deletingTicket.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTickets(prev => prev.filter(t => t.id !== deletingTicket.id));
        setShowDeleteModal(false);
        setDeletingTicket(null);
      }
    } catch (error: unknown) {
      console.error('Error deleting ticket:', error);
    }
  };

  const fetchTicketDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/tickets/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data);
        setShowDetailModal(true);
      }
    } catch (error: unknown) {
      console.error('Error fetching ticket details:', error);
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage) return;
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
          comments: [...(prev.comments || []), newComment],
          responses: (prev.responses || 0) + 1
        } : null);
        setReplyMessage('');
        // Refresh ticket list in background to reflect status change
        fetchTickets();
      }
    } catch (error: unknown) {
      console.error('Error sending reply:', error);
    } finally {
      setIsReplying(false);
    }
  };

  const filteredTickets = tickets.filter(t => 
    (t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase())) && 
    (filterStatus === 'all' || t.status === filterStatus) && 
    (filterPriority === 'all' || t.priority === filterPriority)
  );

  const stats = { 
    total: tickets.length, 
    open: tickets.filter(t => t.status === 'open').length, 
    inProgress: tickets.filter(t => t.status === 'in-progress' || t.status === 'pending').length, 
    resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length, 
    avgTime: '1.8h', 
    satisfaction: '98%' 
  };

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'open': return { color: 'text-blue-600', bg: 'bg-blue-500', label: 'Open' };
      case 'pending': return { color: 'text-amber-600', bg: 'bg-amber-500', label: 'Waiting' };
      case 'in-progress': return { color: 'text-purple-600', bg: 'bg-purple-500', label: 'Working' };
      case 'resolved': return { color: 'text-emerald-600', bg: 'bg-emerald-500', label: 'Resolved' };
      default: return { color: 'text-gray-600', bg: 'bg-gray-500', label: 'Closed' };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch(priority) {
      case 'urgent': return { color: 'text-rose-600', bg: 'bg-rose-500', icon: Zap };
      case 'high': return { color: 'text-orange-600', bg: 'bg-orange-500', icon: AlertCircle };
      case 'medium': return { color: 'text-amber-600', bg: 'bg-amber-500', icon: Timer };
      default: return { color: 'text-blue-600', bg: 'bg-blue-500', icon: Clock };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-gray-500 font-bold animate-pulse text-lg">Loading Enterprise Support Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F8FAFC]">
      <div className="fixed inset-0 z-0">
         <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-200/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse" />
         <div className="absolute top-[20%] right-[-20%] w-[60%] h-[60%] bg-purple-200/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse delay-1000" />
         <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-blue-100/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse delay-700" />
      </div>

      <div className="relative z-10 p-8 max-w-[1600px] mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              Helpdesk
              <span className="text-lg font-medium text-gray-400 bg-white/50 px-3 py-1 rounded-full border border-gray-100 backdrop-blur-sm">Support Node</span>
            </h1>
            <p className="text-gray-500 font-medium text-lg max-w-2xl">Manage enterprise support workflows and track customer resolution cycles.</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="group px-8 py-5 bg-gray-900 text-white rounded-[20px] font-bold flex items-center gap-3 shadow-2xl hover:bg-black hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
            New Service Ticket<Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
           {[ 
             { l: 'Tickets', v: stats.total, i: MessageSquare, c: 'indigo' }, 
             { l: 'New/Open', v: stats.open, i: AlertCircle, c: 'blue' }, 
             { l: 'Active', v: stats.inProgress, i: Timer, c: 'purple' }, 
             { l: 'Resolved', v: stats.resolved, i: CheckCircle, c: 'emerald' }, 
             { l: 'Avg SLA', v: stats.avgTime, i: Clock, c: 'orange' }, 
             { l: 'KPI Rate', v: stats.satisfaction, i: TrendingUp, c: 'pink' } 
           ].map((s, i) => (
            <div key={i} className="relative overflow-hidden bg-white/60 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/80 shadow-sm hover:shadow-xl transition-all group cursor-default">
              <div className={`absolute -right-6 -top-6 w-32 h-32 bg-${s.c}-500/10 rounded-full blur-3xl group-hover:bg-${s.c}-500/20 transition-colors`} />
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-${s.c}-50 flex items-center justify-center mb-4 border border-${s.c}-100`}><s.i className={`w-6 h-6 text-${s.c}-600`} /></div>
                <span className="text-3xl font-black text-gray-900 block tracking-tight">{s.v}</span>
                <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">{s.l}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-white/60 backdrop-blur-3xl p-3 rounded-[1.5rem] border border-white/60 shadow-sm flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <input type="text" placeholder="Search by ID, subject, or customer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-16 pr-6 py-4 bg-transparent outline-none font-bold text-gray-900 text-lg placeholder:text-gray-400" />
          </div>
          <div className="h-full w-px bg-gray-200 hidden lg:block my-2 mx-1" />
          <div className="flex gap-3">
            <div className="relative">
               <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
               <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="pl-12 pr-10 py-4 bg-white/50 rounded-xl outline-none font-bold text-gray-700 appearance-none cursor-pointer border border-transparent focus:border-indigo-100 min-w-[160px]">
                 <option value="all">All Statuses</option>
                 <option value="open">Open</option>
                 <option value="pending">Pending</option>
                 <option value="in-progress">In Progress</option>
                 <option value="resolved">Resolved</option>
                 <option value="closed">Closed</option>
               </select>
            </div>
            <div className="relative">
               <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
               <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="pl-12 pr-10 py-4 bg-white/50 rounded-xl outline-none font-bold text-gray-700 appearance-none cursor-pointer border border-transparent focus:border-indigo-100 min-w-[160px]">
                 <option value="all">All Priorities</option>
                 <option value="urgent">Urgent</option>
                 <option value="high">High</option>
                 <option value="medium">Medium</option>
                 <option value="low">Low</option>
               </select>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="grid gap-4 pb-20">
          {filteredTickets.map((t, idx) => {
            const sc = getStatusConfig(t.status);
            const pc = getPriorityConfig(t.priority);
            return (
              <div 
                key={t.id} 
                className="group relative bg-white/70 backdrop-blur-xl rounded-[24px] p-1 shadow-sm border border-white/60 hover:shadow-2xl transition-all duration-300" 
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-6 bg-white/40 rounded-[20px] p-6 transition-colors group-hover:bg-white/80">
                  {/* Subject & Customer */}
                  <div className="flex items-center gap-6 xl:w-[40%]">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-indigo-900 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-8 h-8" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm`}>
                        <div className={`w-3.5 h-3.5 rounded-full ${sc.bg} animate-pulse`} />
                      </div>
                    </div>
                    <div className="overflow-hidden space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 uppercase tracking-widest">#{t.id.slice(-6).toUpperCase()}</span>
                        <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg border border-gray-200 uppercase tracking-widest">{t.category}</span>
                      </div>
                      <h3 className="text-xl font-black text-gray-900 truncate tracking-tight">{t.subject}</h3>
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                        <User className="w-3.5 h-3.5" />
                        <span className="truncate">{t.customer}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-[10px] font-black uppercase text-indigo-400">{t.responses} RESPONSES</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Priority */}
                  <div className="xl:w-[25%] flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center gap-2`}>
                      <span className={`w-2 h-2 rounded-full ${sc.bg}`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${sc.color}`}>{sc.label}</span>
                    </div>
                    <div className={`px-4 py-2 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center gap-2`}>
                      <pc.icon className={`w-3 h-3 ${pc.color}`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${pc.color}`}>{t.priority}</span>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="xl:w-[15%] flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[10px] font-black text-gray-300 uppercase mt-0.5 tracking-tighter">Last Activity</p>
                  </div>

                  {/* Actions */}
                  <div className="xl:ml-auto flex items-center gap-3">
                    <button onClick={() => fetchTicketDetails(t.id)} className="p-3 bg-white/50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl shadow-sm transition-all cursor-pointer border border-white/80" title="View Terminal">
                      <Eye className="w-5 h-5" />
                    </button>
                    <div className="h-8 w-px bg-gray-100 mx-1" />
                    <button onClick={() => { setEditTicket(t); setShowEditModal(true); }} className="p-3 text-gray-400 hover:text-gray-900 hover:bg-white rounded-xl transition-all cursor-pointer" title="Edit Metadata">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setDeletingTicket(t); setShowDeleteModal(true); }} className="p-3 text-gray-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all cursor-pointer" title="Delete Archive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] max-w-2xl w-full shadow-2xl flex flex-col max-h-[95vh] animate-in zoom-in-95 slide-in-from-bottom-10">
            <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between shrink-0">
              <div className="space-y-0.5">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Initiate Ticket</h2>
                <p className="text-gray-500 font-bold text-xs tracking-wide">Enter resolution parameters below.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-5 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Ticket Subject</label>
                <input type="text" value={newTicket.subject} onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})} className="w-full px-5 py-3 bg-gray-50 rounded-[15px] outline-none font-bold text-gray-900 text-base border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all shadow-inner" placeholder="e.g. Critical System Access Failure" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Customer Identifier</label>
                  <input type="text" value={newTicket.customer} onChange={(e) => setNewTicket({...newTicket, customer: e.target.value})} className="w-full px-5 py-3 bg-gray-50 rounded-[15px] outline-none font-bold text-gray-900 border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all" placeholder="Customer Name" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Contact Channel (Email)</label>
                  <input type="email" value={newTicket.email} onChange={(e) => setNewTicket({...newTicket, email: e.target.value})} className="w-full px-5 py-3 bg-gray-50 rounded-[15px] outline-none font-bold text-gray-900 border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all" placeholder="customer@node.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Priority Matrix</label>
                  <select value={newTicket.priority} onChange={(e) => setNewTicket({...newTicket, priority: e.target.value as Ticket['priority']})} className="w-full px-5 py-3 bg-gray-50 rounded-[15px] outline-none font-bold text-gray-900 border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all appearance-none cursor-pointer">
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Resolution</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Service Category</label>
                  <select value={newTicket.category} onChange={(e) => setNewTicket({...newTicket, category: e.target.value})} className="w-full px-5 py-3 bg-gray-50 rounded-[15px] outline-none font-bold text-gray-900 border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all appearance-none cursor-pointer">
                    <option value="Support">General Support</option>
                    <option value="Technical">Technical Issue</option>
                    <option value="Billing">Billing & Finance</option>
                    <option value="Feature">Feature Request</option>
                    <option value="Bug">Bug Report</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Detailed Log / Description</label>
                <textarea value={newTicket.description} onChange={(e) => setNewTicket({...newTicket, description: e.target.value})} className="w-full px-5 py-3 bg-gray-50 rounded-[15px] outline-none font-medium text-gray-900 h-28 resize-none border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all" placeholder="Describe the issue in detail..." />
              </div>
            </div>
            <div className="p-6 border-t border-gray-50 flex gap-4 bg-gray-50/50 rounded-b-[2rem]">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 px-6 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all cursor-pointer text-base">Abort</button>
              <button onClick={handleCreateTicket} className="flex-[2] px-6 py-3.5 bg-gray-900 text-white rounded-xl font-black shadow-2xl hover:bg-black hover:scale-[1.02] active:scale-95 transition-all cursor-pointer text-base tracking-tight">Deploy Ticket</button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL TERMINAL MODAL */}
      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-2xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] max-w-5xl w-full shadow-2xl flex flex-col h-[90vh] overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 p-10 flex justify-between items-center text-white shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full tracking-widest border border-white/10 uppercase italic">Ticket Terminal</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 ${getStatusConfig(selectedTicket.status).bg} bg-opacity-20`}>{selectedTicket.status}</span>
                </div>
                <h2 className="text-3xl font-black tracking-tight">{selectedTicket.subject}</h2>
                <p className="text-indigo-300 font-bold text-sm">Managed for {selectedTicket.customer} ({selectedTicket.email})</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-4 bg-white/10 hover:bg-white/20 rounded-[24px] transition-all cursor-pointer border border-white/10"><X className="w-7 h-7" /></button>
            </div>

            {/* Conversation Flow */}
            <div className="flex-1 overflow-y-auto p-10 space-y-10 bg-[#FBFDFF] scroll-smooth">
              {/* Initial Log */}
              <div className="flex gap-6 items-start max-w-[85%] animate-in slide-in-from-left-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200"><User className="w-6 h-6 text-gray-400" /></div>
                <div className="space-y-3">
                   <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                     <span>{selectedTicket.customer}</span>
                     <span className="w-1 h-1 rounded-full bg-gray-200" />
                     <span>INITIAL LOG</span>
                     <span className="w-1 h-1 rounded-full bg-gray-200" />
                     <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                   </div>
                   <div className="bg-white p-6 rounded-[24px] rounded-tl-none border border-gray-100 shadow-sm text-gray-700 font-medium leading-relaxed leading-extra text-lg">
                     {selectedTicket.description}
                   </div>
                </div>
              </div>

              {/* Threaded Comments */}
              {selectedTicket.comments?.map((comment) => (
                <div key={comment.id} className={`flex gap-6 items-start ${comment.authorRole === 'agent' ? 'flex-row-reverse ml-auto' : 'mr-auto'} max-w-[85%] animate-in slide-in-from-bottom-2`}>
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${comment.authorRole === 'agent' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-100' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                     {comment.authorRole === 'agent' ? <Zap className="w-6 h-6" /> : <User className="w-6 h-6" />}
                   </div>
                   <div className={`space-y-3 ${comment.authorRole === 'agent' ? 'text-right' : 'text-left'}`}>
                      <div className={`flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest ${comment.authorRole === 'agent' ? 'flex-row-reverse' : ''}`}>
                        <span>{comment.authorName}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-200" />
                        <span className={comment.authorRole === 'agent' ? 'text-indigo-600' : ''}>{comment.authorRole.toUpperCase()}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-200" />
                        <span>{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <div className={`p-6 rounded-[24px] shadow-sm text-lg font-medium leading-relaxed ${comment.authorRole === 'agent' ? 'bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-tr-none' : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'}`}>
                        {comment.content}
                      </div>
                   </div>
                </div>
              ))}
            </div>

            {/* Quick Response Terminal */}
            <div className="p-8 border-t border-gray-100 bg-white shrink-0">
              <div className="relative group">
                <textarea 
                  value={replyMessage} 
                  onChange={(e) => setReplyMessage(e.target.value)} 
                  className="w-full h-32 px-8 py-6 bg-gray-50 rounded-[32px] outline-none font-bold text-gray-900 text-lg border-2 border-transparent focus:border-indigo-200 focus:bg-white transition-all resize-none shadow-inner pr-32" 
                  placeholder="Initiate terminal response..." 
                />
                <div className="absolute bottom-4 right-4">
                  <button 
                    onClick={handleReply} 
                    disabled={isReplying || !replyMessage}
                    className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[24px] font-black shadow-xl hover:bg-indigo-700 hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 cursor-pointer text-sm uppercase tracking-widest"
                  >
                    {isReplying ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Deploy Response</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editTicket && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95">
            <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Modify Metadata</h2>
                <p className="text-gray-500 font-bold text-sm tracking-wide">Update ticket lifecycle status.</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-3 hover:bg-gray-100 rounded-2xl cursor-pointer transition-colors text-gray-400"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-10 space-y-8 overflow-y-auto">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Resolution Status</label>
                 <select value={editTicket.status} onChange={(e) => setEditTicket({...editTicket, status: e.target.value as Ticket['status']})} className="w-full px-6 py-4 bg-gray-50 rounded-[20px] outline-none font-bold text-gray-900 border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all appearance-none cursor-pointer text-lg">
                   <option value="open">Open Terminal</option>
                   <option value="pending">Waiting on Customer</option>
                   <option value="in-progress">In Resolution Process</option>
                   <option value="resolved">Resolved Successfully</option>
                   <option value="closed">Archived / Closed</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Assigned Support Agent</label>
                 <input type="text" value={editTicket.assignedTo || ''} onChange={(e) => setEditTicket({...editTicket, assignedTo: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-[20px] outline-none font-bold text-gray-900 border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all text-lg" placeholder="Support Name" />
               </div>
            </div>
            <div className="p-8 border-t border-gray-50 flex gap-6 bg-gray-50/50 rounded-b-[2.5rem]">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-5 font-bold text-gray-500 hover:bg-gray-100 transition-all cursor-pointer text-lg">Cancel</button>
              <button onClick={handleUpdateTicket} className="flex-[2] py-5 bg-gray-900 text-white rounded-[20px] font-black shadow-2xl hover:bg-black hover:scale-[1.02] active:scale-95 transition-all cursor-pointer text-lg tracking-tight">Commit Changes</button>
            </div>
          </div>
        </div>
      )}

      {deletingTicket && (
        <DeleteConfirmationModal 
          isOpen={showDeleteModal} 
          onClose={() => { setShowDeleteModal(false); setDeletingTicket(null); }} 
          onConfirm={handleDeleteConfirm} 
          title="Archive Support Ticket" 
          itemName={`#${deletingTicket.id.slice(-6).toUpperCase()}`} 
          itemDetails={deletingTicket.subject} 
          warningMessage="This will permanently remove the ticket archive from the database." 
        />
      )}
    </div>
  );
}
