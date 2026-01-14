"use client";

import React, { useState } from 'react';
import { MessageSquare, Clock, Plus, X, AlertCircle, CheckCircle, Timer, Search, Send, Eye, Edit, Trash2, TrendingUp, Zap } from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

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
}

export default function HelpdeskPage() {
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: 'TKT-001', subject: 'Login Issue - Cannot access account', customer: 'John Smith', email: 'john@email.com', status: 'open', priority: 'high', category: 'Technical', createdAt: '2024-12-05 09:30', updatedAt: '2024-12-05 09:30', assignedTo: 'Support Team', description: 'User unable to login after password reset', responses: 2 },
    { id: 'TKT-002', subject: 'Billing Question - Invoice discrepancy', customer: 'Sarah Johnson', email: 'sarah@email.com', status: 'in-progress', priority: 'medium', category: 'Billing', createdAt: '2024-12-04 14:20', updatedAt: '2024-12-05 10:15', assignedTo: 'Finance Team', description: 'Customer questioning charges on latest invoice', responses: 5 },
    { id: 'TKT-003', subject: 'Feature Request - Dark mode', customer: 'Mike Brown', email: 'mike@email.com', status: 'pending', priority: 'low', category: 'Feature', createdAt: '2024-12-03 16:45', updatedAt: '2024-12-04 11:00', responses: 1 },
    { id: 'TKT-004', subject: 'Bug Report - Export not working', customer: 'Emma Wilson', email: 'emma@email.com', status: 'resolved', priority: 'high', category: 'Bug', createdAt: '2024-12-02 11:00', updatedAt: '2024-12-05 08:30', assignedTo: 'Dev Team', description: 'CSV export functionality broken', responses: 8 },
    { id: 'TKT-005', subject: 'Account Setup Help', customer: 'David Lee', email: 'david@email.com', status: 'open', priority: 'urgent', category: 'Support', createdAt: '2024-12-05 11:00', updatedAt: '2024-12-05 11:00', description: 'New customer needs onboarding assistance', responses: 0 },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [editTicket, setEditTicket] = useState<Ticket | null>(null);
  const [deletingTicket, setDeletingTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [replyMessage, setReplyMessage] = useState('');
  const [newTicket, setNewTicket] = useState<{
    subject: string;
    customer: string;
    email: string;
    priority: Ticket['priority'];
    category: string;
    description: string;
  }>({ subject: '', customer: '', email: '', priority: 'medium', category: 'Support', description: '' });

  const filteredTickets = tickets.filter(t => (t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase())) && (filterStatus === 'all' || t.status === filterStatus) && (filterPriority === 'all' || t.priority === filterPriority));

  const stats = { total: tickets.length, open: tickets.filter(t => t.status === 'open').length, inProgress: tickets.filter(t => t.status === 'in-progress').length, resolved: tickets.filter(t => t.status === 'resolved').length, avgTime: '2.5h', satisfaction: '94%' };

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'open': return { color: 'text-blue-600', bg: 'bg-blue-500', label: 'Open' };
      case 'pending': return { color: 'text-amber-600', bg: 'bg-amber-500', label: 'Pending' };
      case 'in-progress': return { color: 'text-purple-600', bg: 'bg-purple-500', label: 'In Progress' };
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
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">Helpdesk<span className="text-lg font-medium text-gray-400 bg-white/50 px-3 py-1 rounded-full border border-gray-100 backdrop-blur-sm">Support</span></h1>
            <p className="text-gray-500 font-medium text-lg">Manage and track customer support tickets properly.</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="group px-6 py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center gap-3 shadow-xl hover:bg-black transition-all cursor-pointer">
            New Ticket<Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
           {[ { l: 'Total', v: stats.total, i: MessageSquare, c: 'indigo' }, { l: 'Open', v: stats.open, i: AlertCircle, c: 'blue' }, { l: 'Working', v: stats.inProgress, i: Timer, c: 'purple' }, { l: 'Success', v: stats.resolved, i: CheckCircle, c: 'emerald' }, { l: 'Avg Time', v: stats.avgTime, i: Clock, c: 'orange' }, { l: 'Rating', v: stats.satisfaction, i: TrendingUp, c: 'pink' } ].map((s, i) => (
            <div key={i} className="relative overflow-hidden bg-white/60 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/80 shadow-sm hover:shadow-xl transition-all group">
              <div className={`absolute -right-6 -top-6 w-32 h-32 bg-${s.c}-500/10 rounded-full blur-3xl`} />
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-${s.c}-50 flex items-center justify-center mb-4 border border-${s.c}-100`}><s.i className={`w-6 h-6 text-${s.c}-600`} /></div>
                <span className="text-3xl font-black text-gray-900 block">{s.v}</span>
                <p className="text-gray-500 font-bold text-xs uppercase tracking-wide mt-1">{s.l}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/60 backdrop-blur-2xl p-2 rounded-[1.5rem] border border-white/60 shadow-sm flex flex-col lg:flex-row gap-2">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search tickets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-4 py-4 bg-transparent outline-none font-medium text-gray-900" />
          </div>
          <div className="flex gap-2">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-6 py-4 bg-transparent outline-none font-medium text-gray-700 appearance-none cursor-pointer"><option value="all">Status</option><option value="open">Open</option><option value="in-progress">In Progress</option><option value="resolved">Resolved</option></select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="px-6 py-4 bg-transparent outline-none font-medium text-gray-700 appearance-none cursor-pointer"><option value="all">Priority</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredTickets.map((t, idx) => {
            const sc = getStatusConfig(t.status);
            const pc = getPriorityConfig(t.priority);
            return (
              <div key={t.id} className="group bg-white/70 backdrop-blur-xl rounded-[20px] p-5 shadow-sm border border-white/60 hover:shadow-xl transition-all animate-in slide-in-from-bottom-2 fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="flex flex-col xl:flex-row items-center gap-6">
                  <div className="flex items-center gap-5 xl:w-[35%]">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white"><MessageSquare className="w-7 h-7" /></div>
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center`}><div className={`w-3 h-3 rounded-full ${sc.bg}`} /></div>
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2 mb-1"><span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">{t.id}</span><span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{t.category}</span></div>
                      <h3 className="text-lg font-bold text-gray-900 truncate">{t.subject}</h3>
                      <p className="text-sm font-medium text-gray-500 truncate">{t.customer}</p>
                    </div>
                  </div>
                  <div className="xl:w-[25%] flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border border-gray-100 ${pc.color}`}><pc.icon className="w-3 h-3" />{t.priority.toUpperCase()}</span>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white border border-gray-100 ${sc.color}`}>{sc.label.toUpperCase()}</span>
                  </div>
                  <div className="xl:w-[20%] text-xs text-gray-400 flex items-center gap-2"><Clock className="w-3 h-3" />Updated {t.updatedAt}</div>
                  <div className="xl:ml-auto flex items-center gap-2">
                    <button onClick={() => { setSelectedTicket(t); setShowDetailModal(true); }} className="p-2 text-gray-400 hover:text-blue-600 transition-all cursor-pointer"><Eye className="w-5 h-5" /></button>
                    <button onClick={() => { setSelectedTicket(t); setShowReplyModal(true); }} className="p-2 text-gray-400 hover:text-purple-600 transition-all cursor-pointer"><Send className="w-4 h-4" /></button>
                    <button onClick={() => { setEditTicket(t); setShowEditModal(true); }} className="p-2 text-gray-400 hover:text-gray-900 transition-all cursor-pointer"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => { setDeletingTicket(t); setShowDeleteModal(true); }} className="p-2 text-gray-400 hover:text-red-600 transition-all cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 bounce-in duration-300">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div><h2 className="text-2xl font-black text-gray-900 tracking-tight">New Ticket</h2><p className="text-gray-500 text-sm font-medium">Create support ticket.</p></div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto">
              <div className="space-y-1.5"><label className="text-xs font-bold text-gray-500 uppercase">Subject</label><input type="text" value={newTicket.subject} onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none font-bold text-gray-900 border-2 border-transparent focus:border-indigo-100 transition-all" /></div>
              <div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-xs font-bold text-gray-500 uppercase">Customer</label><input type="text" value={newTicket.customer} onChange={(e) => setNewTicket({...newTicket, customer: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none font-bold text-gray-900" /></div><div className="space-y-1.5"><label className="text-xs font-bold text-gray-500 uppercase">Email</label><input type="email" value={newTicket.email} onChange={(e) => setNewTicket({...newTicket, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none font-bold text-gray-900" /></div></div>
              <div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-xs font-bold text-gray-500 uppercase">Priority</label><select value={newTicket.priority} onChange={(e) => setNewTicket({...newTicket, priority: e.target.value as Ticket['priority']})} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none font-bold text-gray-900"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div><div className="space-y-1.5"><label className="text-xs font-bold text-gray-500 uppercase">Category</label><select value={newTicket.category} onChange={(e) => setNewTicket({...newTicket, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none font-bold text-gray-900"><option value="Support">Support</option><option value="Billing">Billing</option></select></div></div>
              <div className="space-y-1.5"><label className="text-xs font-bold text-gray-500 uppercase">Description</label><textarea value={newTicket.description} onChange={(e) => setNewTicket({...newTicket, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none font-medium text-gray-900 h-32" /></div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-4 bg-gray-50 rounded-b-[2rem]">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 px-6 py-4 rounded-xl font-bold text-gray-600 hover:bg-white transition-all cursor-pointer">Cancel</button>
              <button onClick={() => { const now = new Date().toISOString(); setTickets([{...newTicket, id: `TKT-${tickets.length+1}`, status: 'open', createdAt: now, updatedAt: now}, ...tickets]); setShowCreateModal(false); }} className="flex-[2] px-6 py-4 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all cursor-pointer">Create</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editTicket && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh]">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900">Edit Ticket</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto">
               <div className="space-y-1.5"><label className="text-xs font-bold text-gray-500 uppercase">Status</label><select value={editTicket.status} onChange={(e) => setEditTicket({...editTicket, status: e.target.value as Ticket['status']})} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold text-gray-900"><option value="open">Open</option><option value="in-progress">In Progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></div>
               <div className="space-y-1.5"><label className="text-xs font-bold text-gray-500 uppercase">Assigned To</label><input type="text" value={editTicket.assignedTo || ''} onChange={(e) => setEditTicket({...editTicket, assignedTo: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold text-gray-900" /></div>
            </div>
            <div className="p-6 border-t flex gap-4 bg-gray-50 rounded-b-[2rem]">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-4 font-bold text-gray-600 cursor-pointer">Cancel</button>
              <button onClick={() => { setTickets(tickets.map(t => t.id === editTicket.id ? editTicket : t)); setShowEditModal(false); }} className="flex-[2] py-4 bg-gray-900 text-white rounded-xl font-bold cursor-pointer">Save</button>
            </div>
          </div>
        </div>
      )}

      {showReplyModal && selectedTicket && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh]">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900">Reply</h2>
              <button onClick={() => setShowReplyModal(false)} className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto">
               <textarea value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} className="w-full h-48 px-4 py-3 bg-gray-50 rounded-xl outline-none font-medium text-gray-900 border-2 border-transparent focus:border-indigo-100" placeholder="Type message..." />
            </div>
            <div className="p-6 border-t flex gap-4 bg-gray-50 rounded-b-[2rem]">
              <button onClick={() => setShowReplyModal(false)} className="flex-1 py-4 font-bold text-gray-600 cursor-pointer">Cancel</button>
              <button onClick={() => { alert('Reply sent!'); setShowReplyModal(false); setReplyMessage(''); }} className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl font-bold cursor-pointer transition-all hover:bg-indigo-700">Send</button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold tracking-widest uppercase">Ticket Details</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 overflow-y-auto bg-gray-50/50">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6 text-gray-900 font-bold">
                <div className="flex justify-between items-start"><div><p className="text-3xl font-black">{selectedTicket.id}</p><h3 className="text-xl text-gray-500">{selectedTicket.subject}</h3></div><span className={`${getStatusConfig(selectedTicket.status).bg} text-white px-3 py-1 rounded-full text-xs`}>{selectedTicket.status}</span></div>
                <div className="grid grid-cols-2 gap-4 text-sm font-bold border-t pt-4"><div><p className="text-gray-400">Customer</p><p>{selectedTicket.customer}</p></div><div><p className="text-gray-400">Category</p><p>{selectedTicket.category}</p></div></div>
                <div className="border-t pt-4 p-4 bg-gray-50 rounded-xl font-medium text-gray-600 leading-relaxed italic">{"\""}{selectedTicket.description}{"\""}</div>
                <button onClick={() => setShowDetailModal(false)} className="w-full py-4 bg-gray-900 text-white rounded-xl hover:bg-black transition-all cursor-pointer">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deletingTicket && (
        <DeleteConfirmationModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeletingTicket(null); }} onConfirm={() => { setTickets(tickets.filter(t => t.id !== deletingTicket.id)); setShowDeleteModal(false); }} title="Delete Ticket" itemName={deletingTicket.id} itemDetails={deletingTicket.subject} warningMessage="This action cannot be undone." />
      )}
    </div>
  );
}
