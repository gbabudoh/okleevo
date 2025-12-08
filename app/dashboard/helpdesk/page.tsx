"use client";

import React, { useState } from 'react';
import { MessageSquare, Clock, User, Plus, X, Mail, AlertCircle, CheckCircle, Timer, Search, Filter, Send, Paperclip, Tag, Eye, Edit, Trash2, MessageCircle, TrendingUp, Users, BarChart3, Zap } from 'lucide-react';
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
  const [newTicket, setNewTicket] = useState({
    subject: '',
    customer: '',
    email: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    category: 'Support',
    description: ''
  });

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    avgResponseTime: '2.5 hrs',
    satisfaction: '94%'
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'urgent': return <Zap className="w-4 h-4" />;
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <Timer className="w-4 h-4" />;
      case 'low': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleDeleteTicket = (ticket: Ticket) => {
    setDeletingTicket(ticket);
    setShowDeleteModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Support Helpdesk
                </h1>
                <p className="text-gray-600 mt-1 text-lg">Manage customer support tickets and inquiries</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            <Plus className="w-5 h-5" />
            New Ticket
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-6 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent">{stats.total}</span>
            </div>
            <p className="text-gray-600 font-medium text-sm">Total Tickets</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-green-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-br from-green-600 to-green-700 bg-clip-text text-transparent">{stats.open}</span>
            </div>
            <p className="text-gray-600 font-medium text-sm">Open</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-purple-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                <Timer className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-br from-purple-600 to-purple-700 bg-clip-text text-transparent">{stats.inProgress}</span>
            </div>
            <p className="text-gray-600 font-medium text-sm">In Progress</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-teal-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-br from-teal-600 to-teal-700 bg-clip-text text-transparent">{stats.resolved}</span>
            </div>
            <p className="text-gray-600 font-medium text-sm">Resolved</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-orange-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-br from-orange-600 to-orange-700 bg-clip-text text-transparent">{stats.avgResponseTime}</span>
            </div>
            <p className="text-gray-600 font-medium text-sm">Avg Response</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-pink-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-md">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-br from-pink-600 to-pink-700 bg-clip-text text-transparent">{stats.satisfaction}</span>
            </div>
            <p className="text-gray-600 font-medium text-sm">Satisfaction</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets by ID, subject, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-12 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer appearance-none bg-white shadow-sm font-medium"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="relative">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="pl-12 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer appearance-none bg-white shadow-sm font-medium"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Tickets List */}
        <div className="grid gap-6">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] border border-gray-100 overflow-hidden">
              <div className="flex items-start p-6">
                <div className="flex gap-5 flex-1">
                  {/* Ticket Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                    <MessageSquare className="w-8 h-8" />
                  </div>

                  {/* Ticket Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{ticket.id}</span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                        ticket.status === 'open' ? 'bg-blue-500 text-white' :
                        ticket.status === 'pending' ? 'bg-yellow-500 text-white' :
                        ticket.status === 'in-progress' ? 'bg-purple-500 text-white' :
                        ticket.status === 'resolved' ? 'bg-green-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {ticket.status.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm flex items-center gap-1 ${
                        ticket.priority === 'urgent' ? 'bg-red-500 text-white' :
                        ticket.priority === 'high' ? 'bg-orange-500 text-white' :
                        ticket.priority === 'medium' ? 'bg-yellow-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {getPriorityIcon(ticket.priority)}
                        {ticket.priority.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full border border-gray-300">
                        {ticket.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">{ticket.subject}</h3>

                    {ticket.description && (
                      <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-200">{ticket.description}</p>
                    )}

                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs text-blue-600 font-medium">Customer</p>
                          <p className="text-sm font-bold text-blue-700 truncate">{ticket.customer}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm">
                          <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs text-green-600 font-medium">Email</p>
                          <p className="text-sm font-bold text-green-700 truncate">{ticket.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-purple-600 font-medium">Created</p>
                          <p className="text-sm font-bold text-purple-700">{ticket.createdAt}</p>
                        </div>
                      </div>
                    </div>

                    {ticket.assignedTo && (
                      <div className="mt-4 flex items-center gap-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
                        <Tag className="w-5 h-5 text-orange-600" />
                        <span className="text-sm text-orange-700">Assigned to: <strong>{ticket.assignedTo}</strong></span>
                      </div>
                    )}

                    {ticket.responses !== undefined && ticket.responses > 0 && (
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 px-3 py-1.5 rounded-full border border-indigo-200">
                          <MessageCircle className="w-4 h-4 text-indigo-600" />
                          <span className="font-semibold text-indigo-700">{ticket.responses} response{ticket.responses !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  <button 
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setShowDetailModal(true);
                    }}
                    className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg hover:scale-105 cursor-pointer"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      setEditTicket(ticket);
                      setShowEditModal(true);
                    }}
                    className="p-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-md hover:shadow-lg hover:scale-105 cursor-pointer"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleDeleteTicket(ticket)}
                    className="p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg hover:scale-105 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary-500 to-accent-500">
              <h2 className="text-xl font-bold text-white">Create New Ticket</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Brief description of the issue"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={newTicket.customer}
                    onChange={(e) => setNewTicket({...newTicket, customer: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newTicket.email}
                    onChange={(e) => setNewTicket({...newTicket, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="john@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({...newTicket, priority: e.target.value as any})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Support">Support</option>
                    <option value="Technical">Technical</option>
                    <option value="Billing">Billing</option>
                    <option value="Feature">Feature Request</option>
                    <option value="Bug">Bug Report</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 h-24"
                  placeholder="Detailed description of the issue..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
                    const ticket: Ticket = {
                      id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
                      ...newTicket,
                      status: 'open',
                      createdAt: now,
                      updatedAt: now,
                      responses: 0
                    };
                    setTickets([ticket, ...tickets]);
                    setShowCreateModal(false);
                    setNewTicket({
                      subject: '',
                      customer: '',
                      email: '',
                      priority: 'medium',
                      category: 'Support',
                      description: ''
                    });
                  }}
                  disabled={!newTicket.subject || !newTicket.customer || !newTicket.email}
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                  style={{ backgroundColor: '#fc6813' }}
                >
                  Create Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Ticket Modal */}
      {showEditModal && editTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary-500 to-accent-500">
              <h2 className="text-xl font-bold text-white">Edit Ticket</h2>
              <button onClick={() => {
                setShowEditModal(false);
                setEditTicket(null);
              }} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={editTicket.subject}
                  onChange={(e) => setEditTicket({...editTicket, subject: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={editTicket.status}
                    onChange={(e) => setEditTicket({...editTicket, status: e.target.value as any})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={editTicket.priority}
                    onChange={(e) => setEditTicket({...editTicket, priority: e.target.value as any})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={editTicket.category}
                    onChange={(e) => setEditTicket({...editTicket, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Support">Support</option>
                    <option value="Technical">Technical</option>
                    <option value="Billing">Billing</option>
                    <option value="Feature">Feature Request</option>
                    <option value="Bug">Bug Report</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                  <input
                    type="text"
                    value={editTicket.assignedTo || ''}
                    onChange={(e) => setEditTicket({...editTicket, assignedTo: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Team or person"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editTicket.description || ''}
                  onChange={(e) => setEditTicket({...editTicket, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 h-24"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditTicket(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setTickets(tickets.map(t => t.id === editTicket.id ? {
                      ...editTicket,
                      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
                    } : t));
                    setShowEditModal(false);
                    setEditTicket(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium cursor-pointer" 
                  style={{ backgroundColor: '#fc6813' }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary-500 to-accent-500">
              <h2 className="text-xl font-bold text-white">Reply to Ticket</h2>
              <button onClick={() => {
                setShowReplyModal(false);
                setReplyMessage('');
              }} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Ticket Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-mono text-gray-500">{selectedTicket.id}</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{selectedTicket.subject}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {selectedTicket.customer}
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {selectedTicket.email}
                  </div>
                </div>
              </div>

              {/* Reply Form */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Reply</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 h-48"
                  placeholder={`Hi ${selectedTicket.customer},\n\nThank you for contacting us. I'm here to help you with "${selectedTicket.subject}".\n\n[Your response here]\n\nBest regards,\nSupport Team`}
                />
                <p className="text-xs text-gray-500 mt-2">This message will be sent to {selectedTicket.email}</p>
              </div>

              {/* Email Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">Email Preview:</p>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>To:</strong> {selectedTicket.email}</p>
                  <p><strong>Subject:</strong> Re: {selectedTicket.subject} [{selectedTicket.id}]</p>
                  <p><strong>From:</strong> support@yourcompany.com</p>
                </div>
              </div>

              {/* Quick Templates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Templates</label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setReplyMessage(`Hi ${selectedTicket.customer},\n\nThank you for reaching out. I've reviewed your ticket and I'm working on a solution. I'll update you shortly.\n\nBest regards,\nSupport Team`)}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full cursor-pointer"
                  >
                    Working on it
                  </button>
                  <button
                    onClick={() => setReplyMessage(`Hi ${selectedTicket.customer},\n\nI'm happy to inform you that your issue has been resolved. Please let me know if you need any further assistance.\n\nBest regards,\nSupport Team`)}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full cursor-pointer"
                  >
                    Issue Resolved
                  </button>
                  <button
                    onClick={() => setReplyMessage(`Hi ${selectedTicket.customer},\n\nTo better assist you, could you please provide more details about the issue you're experiencing?\n\nBest regards,\nSupport Team`)}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full cursor-pointer"
                  >
                    Need More Info
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyMessage('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    // Update ticket with response count
                    setTickets(tickets.map(t => 
                      t.id === selectedTicket.id 
                        ? { ...t, responses: (t.responses || 0) + 1, status: 'in-progress' as const, updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') }
                        : t
                    ));
                    setShowReplyModal(false);
                    setReplyMessage('');
                    alert(`Reply sent successfully to ${selectedTicket.email}!\n\nIn production, this would:\n- Send an email to the customer\n- Log the response in the ticket history\n- Update the ticket status`);
                  }}
                  disabled={!replyMessage.trim()}
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                  style={{ backgroundColor: '#fc6813' }}
                >
                  <Send className="w-4 h-4" />
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary-500 to-accent-500">
              <h2 className="text-xl font-bold text-white">Ticket Details</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-mono text-gray-500">{selectedTicket.id}</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status.replace('-', ' ')}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border flex items-center gap-1 ${getPriorityColor(selectedTicket.priority)}`}>
                    {getPriorityIcon(selectedTicket.priority)}
                    {selectedTicket.priority}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedTicket.subject}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Customer</p>
                  <p className="font-medium text-gray-900">{selectedTicket.customer}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedTicket.email}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <p className="font-medium text-gray-900">{selectedTicket.category}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Created</p>
                  <p className="font-medium text-gray-900">{selectedTicket.createdAt}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                  <p className="font-medium text-gray-900">{selectedTicket.updatedAt}</p>
                </div>
              </div>

              {selectedTicket.assignedTo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900">Assigned to: {selectedTicket.assignedTo}</p>
                </div>
              )}

              {selectedTicket.description && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">Description:</p>
                  <p className="text-gray-700">{selectedTicket.description}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setTickets(tickets.map(t => 
                        t.id === selectedTicket.id ? { ...t, status: 'resolved' as const } : t
                      ));
                      setShowDetailModal(false);
                      alert('Ticket marked as resolved!');
                    }}
                    className="flex-1 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Resolved
                  </button>
                  <button 
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowReplyModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Reply
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setShowDetailModal(false)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTicket && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingTicket(null);
          }}
          onConfirm={() => {
            setTickets(tickets.filter(t => t.id !== deletingTicket.id));
            alert('✓ Ticket deleted successfully!');
          }}
          title="Delete Ticket"
          itemName={deletingTicket.subject}
          itemDetails={`${deletingTicket.customer} - Priority: ${deletingTicket.priority}`}
          warningMessage="This will permanently remove this support ticket and all its messages."
        />
      )}
    </div>
  );
}
