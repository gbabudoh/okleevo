"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { 
  MessageSquare, Clock, Plus, X, AlertCircle, 
  Search, Send, Eye, Loader2, LifeBuoy, 
  ArrowLeft 
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

export default function PlatformSupportPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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
      // We need a way to fetch PLATFORM tickets specifically for this user
      // I should update /api/tickets/route.ts to allow filtering by type
      const res = await fetch('/api/tickets?type=PLATFORM');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.filter((t: Ticket) => t.type === 'PLATFORM'));
      }
    } catch (error) {
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
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const fetchTicketDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/tickets/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data);
      }
    } catch (error) {
      console.error('Error fetching ticket detail:', error);
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
        setSelectedTicket(prev => prev ? {
          ...prev,
          comments: [...(prev.comments || []), newComment]
        } : null);
        setReplyMessage('');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setIsReplying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: 'bg-blue-100 text-blue-700 border-blue-200',
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      'in-progress': 'bg-purple-100 text-purple-700 border-purple-200',
      resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      closed: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.open}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      low: 'text-gray-500',
      medium: 'text-amber-500',
      high: 'text-orange-500',
      urgent: 'text-red-500 font-bold',
    };
    return (
      <span className={`flex items-center gap-1 text-xs uppercase tracking-wider ${styles[priority] || styles.medium}`}>
        <AlertCircle className="w-3 h-3" />
        {priority}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-orange-500" />
            Okleevo Platform Support
          </h1>
          <p className="text-gray-500">Need help with your account or the platform? Our team is here to assist you.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
        >
          <Plus className="w-5 h-5" />
          Submit a New Ticket
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search your tickets..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Showing {tickets.length} support requests</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ticket</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Update</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
                    <p className="mt-2 text-gray-500">Loading support tickets...</p>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <LifeBuoy className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No support tickets found</h3>
                    <p className="text-gray-500 max-w-xs mx-auto">Whenever you have a question or issue, submit a ticket and we&apos;ll help you out.</p>
                  </td>
                </tr>
              ) : (
                tickets
                  .filter(t => t.subject.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{ticket.subject}</span>
                          <span className="text-xs text-gray-500">{ticket.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(ticket.status)}</td>
                      <td className="px-6 py-4">{getPriorityBadge(ticket.priority)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(ticket.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            fetchTicketDetail(ticket.id);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">New Support Request</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="Summarize your issue"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  >
                    <option value="Support">General Support</option>
                    <option value="Billing">Billing & Subscription</option>
                    <option value="Feature">Feature Request</option>
                    <option value="Bug">Bug Report</option>
                    <option value="Account">Account Security</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
                  <select
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as Ticket['priority'] })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  placeholder="Tell us more about what&apos;s happening..."
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTicket}
                className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-semibold shadow-lg shadow-orange-500/20"
              >
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden">
                  <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 line-clamp-1">{selectedTicket.subject}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    {getStatusBadge(selectedTicket.status)}
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">ID: {selectedTicket.id.slice(-8).toUpperCase()}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden md:block">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Original Request</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <LifeBuoy className="w-3 h-3" />
                    {selectedTicket.category}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Submitted on {new Date(selectedTicket.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-orange-500" />
                  Conversation
                </h3>
                
                {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                  <div className="space-y-6">
                    {selectedTicket.comments.map((comment) => (
                      <div 
                        key={comment.id} 
                        className={`flex flex-col ${comment.authorRole === 'agent' ? 'items-start' : 'items-end'}`}
                      >
                        <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                          comment.authorRole === 'agent' 
                            ? 'bg-white border border-gray-100 rounded-tl-none' 
                            : 'bg-orange-500 text-white rounded-tr-none'
                        }`}>
                          <div className={`flex items-center gap-2 mb-1 ${
                            comment.authorRole === 'agent' ? 'text-gray-900' : 'text-orange-50'
                          }`}>
                            <span className="text-xs font-bold">{comment.authorName}</span>
                            {comment.authorRole === 'agent' && (
                              <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded text-[10px] font-bold uppercase">Staff</span>
                            )}
                            <span className="text-[10px] opacity-60">
                              {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm">No responses yet. Our team will get back to you soon.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0">
              <div className="flex items-center gap-3">
                <textarea
                  rows={1}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none bg-gray-50"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim() || isReplying}
                  className="p-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50 disabled:hover:bg-orange-500 shadow-lg shadow-orange-500/20"
                >
                  {isReplying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
