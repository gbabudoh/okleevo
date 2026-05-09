"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, MessageSquare, Shield, 
  CheckCircle2, Send, Loader2, Building2, 
  User, Mail, LifeBuoy, 
  RefreshCw
} from 'lucide-react';

interface TicketComment {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  businessId: string;
  business: { name: string };
  user: { firstName: string, lastName: string, email: string };
  customerName: string;
  customerEmail: string;
  status: 'OPEN' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  comments: TicketComment[];
}

export default function AdminTicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/tickets/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTicket(data);
      } else {
        router.push('/admin/tickets');
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleUpdateStatus = async (status: string) => {
    try {
      setUpdating(true);
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchTicket();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;
    try {
      setIsReplying(true);
      const res = await fetch(`/api/admin/tickets/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyMessage, isInternal }),
      });
      if (res.ok) {
        setReplyMessage('');
        setIsInternal(false);
        fetchTicket();
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setIsReplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
              <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                'bg-amber-100 text-amber-700 border-amber-200'
              }`}>
                {ticket.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
              Ticket ID: <span className="font-mono text-gray-900">{ticket.id.toUpperCase()}</span>
              • Created {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {ticket.status !== 'RESOLVED' ? (
            <button
              onClick={() => handleUpdateStatus('RESOLVED')}
              disabled={updating}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-semibold shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-5 h-5" />
              Mark as Resolved
            </button>
          ) : (
            <button
              onClick={() => handleUpdateStatus('OPEN')}
              disabled={updating}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
            >
              <RefreshCw className="w-5 h-5" />
              Reopen Ticket
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Conversation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-orange-500" />
                History & Conversation
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Original Message */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{ticket.customerName || `${ticket.user.firstName} ${ticket.user.lastName}`}</span>
                    <span className="text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-gray-700 whitespace-pre-wrap">
                    {ticket.description}
                  </div>
                </div>
              </div>

              {/* Comments */}
              {ticket.comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    comment.authorRole === 'agent' ? 'bg-orange-100' : 'bg-gray-100'
                  }`}>
                    {comment.authorRole === 'agent' ? (
                      <Shield className="w-6 h-6 text-orange-500" />
                    ) : (
                      <User className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{comment.authorName}</span>
                        {comment.authorRole === 'agent' && (
                          <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded text-[10px] font-bold uppercase">Staff</span>
                        )}
                        {comment.isInternal && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                            <Shield className="w-2.5 h-2.5" />
                            Internal Note
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <div className={`rounded-2xl p-4 border text-gray-700 whitespace-pre-wrap ${
                      comment.isInternal ? 'bg-amber-50/50 border-amber-100 italic' : 
                      comment.authorRole === 'agent' ? 'bg-orange-50/30 border-orange-100' : 
                      'bg-slate-50 border-slate-100'
                    }`}>
                      {comment.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="mb-4 flex items-center gap-4">
                <button
                  onClick={() => setIsInternal(false)}
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors ${
                    !isInternal ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Public Reply
                </button>
                <button
                  onClick={() => setIsInternal(true)}
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                    isInternal ? 'bg-amber-100 text-amber-900' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  Internal Note
                </button>
              </div>
              <div className="flex items-start gap-3">
                <textarea
                  rows={3}
                  placeholder={isInternal ? "Add an internal note only visible to staff..." : "Type your reply to the SME..."}
                  className={`flex-1 px-4 py-3 rounded-xl border focus:ring-2 focus:border-transparent resize-none transition-all ${
                    isInternal ? 'bg-amber-50/30 border-amber-200 focus:ring-amber-500' : 'bg-gray-50 border-gray-200 focus:ring-orange-500'
                  }`}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim() || isReplying}
                  className={`p-4 rounded-xl text-white transition-all shadow-lg disabled:opacity-50 flex items-center justify-center ${
                    isInternal ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
                  }`}
                >
                  {isReplying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Metadata */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Requestor Info</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{ticket.business.name}</p>
                    <p className="text-xs text-gray-500">Business Client</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{ticket.customerName || `${ticket.user.firstName} ${ticket.user.lastName}`}</p>
                    <p className="text-xs text-gray-500">Contact Person</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-gray-900 truncate">{ticket.customerEmail || ticket.user.email}</p>
                    <p className="text-xs text-gray-500">Email Address</p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Ticket Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Priority</span>
                  <span className={`font-bold ${
                    ticket.priority === 'URGENT' ? 'text-red-600' : 
                    ticket.priority === 'HIGH' ? 'text-orange-600' : 
                    'text-gray-900'
                  }`}>{ticket.priority}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Category</span>
                  <span className="font-bold text-gray-900">{ticket.category}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Assigned To</span>
                  <span className="font-bold text-gray-900">{ticket.assignedTo || 'Unassigned'}</span>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Internal Actions</h3>
              <div className="grid grid-cols-1 gap-2">
                <button className="w-full py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors text-sm font-semibold flex items-center justify-center gap-2">
                  <User className="w-4 h-4" />
                  Assign to Me
                </button>
                <button className="w-full py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors text-sm font-semibold flex items-center justify-center gap-2">
                  <LifeBuoy className="w-4 h-4" />
                  Transfer Category
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
