"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Search, Mail, PoundSterling, 
  Users, TrendingUp, Star, Edit, Trash2, X, Tag, AlertCircle, 
  ChevronDown, Sparkles, LayoutGrid, List, Loader2,
  Clock, Send as SendIcon, Inbox as InboxIcon
} from 'lucide-react';
import StatusModal from '@/components/StatusModal';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  clientType: 'business' | 'individual';
  status: 'active' | 'lead' | 'inactive' | 'customer';
  pipelineStage: 'new' | 'contacted' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  revenue: number;
  location?: string;
  lastContact?: string;
  tags?: string[];
  notes?: string;
}

interface PrismaContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  clientType: string;
  status: string;
  pipelineStage: string;
  revenue: number;
  address?: string;
  lastContact?: string;
  tags: string[];
  notes?: string;
}

export default function CRMPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commFilter, setCommFilter] = useState<'all' | 'SENT' | 'RECEIVED'>('all');
  const [globalTimeline, setGlobalTimeline] = useState<TimelineItem[]>([]);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });
  
  interface TimelineItem {
    id: string;
    type: 'SENT' | 'RECEIVED';
    source?: 'SYSTEM' | 'MAILBOX';
    subject: string;
    date: string | Date;
    status?: string;
    body: string;
    from: string;
    to: string;
  }

  interface SentEmail {
    id: string;
    subject: string;
    body: string;
    createdAt: string;
    to: string;
  }

  interface ReceivedEmail {
    id: string;
    subject: string;
    body?: string;
    html?: string;
    date: string;
    from: string;
    to: string;
  }

  const [emailTimeline, setEmailTimeline] = useState<TimelineItem[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'communication' | 'notes'>('info');

  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: ''
  });

  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    clientType: 'business' as 'business' | 'individual',
    status: 'lead' as 'active' | 'lead' | 'inactive',
    pipelineStage: 'new' as 'new' | 'contacted' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost',
    location: '',
    revenue: 0,
    tags: [] as string[]
  });

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/crm');
      const data = await response.json();
      if (Array.isArray(data)) {
        setClients(data.map((c: PrismaContact) => ({
          ...c,
          status: c.status.toLowerCase() as 'active' | 'lead' | 'inactive' | 'customer',
          clientType: c.clientType as 'business' | 'individual',
          pipelineStage: c.pipelineStage as 'new' | 'contacted' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost',
          location: c.address,
          company: c.company || 'N/A',
          lastContact: c.lastContact ? new Date(c.lastContact).toISOString().split('T')[0] : undefined
        })));
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmailTimeline = useCallback(async (email: string) => {
    try {
      setLoadingTimeline(true);
      const res = await fetch(`/api/crm/emails?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setEmailTimeline(data);
      }
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
    } finally {
      setLoadingTimeline(false);
    }
  }, []);

  const fetchGlobalTimeline = useCallback(async () => {
    setLoadingGlobal(true);
    try {
      // Fetch both Sent (history) and Received (inbox)
      const [sentRes, receivedRes] = await Promise.all([
        fetch('/api/email/history?limit=20'),
        fetch('/api/email/inbox')
      ]);

      const sentData = await sentRes.json();
      const receivedData = await receivedRes.json();

      const combined: TimelineItem[] = [
        ...(sentData.data || []).map((item: SentEmail) => ({
          id: item.id,
          type: 'SENT',
          subject: item.subject,
          body: item.body,
          date: item.createdAt,
          from: 'You',
          to: item.to
        })),
        ...(Array.isArray(receivedData) ? receivedData : []).map((item: ReceivedEmail) => ({
          id: item.id,
          type: 'RECEIVED',
          subject: item.subject,
          body: item.body || item.html || '',
          date: item.date,
          from: item.from,
          to: item.to
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setGlobalTimeline(combined.slice(0, 50));
    } catch (err) {
      console.error('Failed to fetch global timeline:', err);
    } finally {
      setLoadingGlobal(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
    fetchGlobalTimeline();
  }, [fetchContacts, fetchGlobalTimeline]);

  useEffect(() => {
    if (selectedClient?.email) {
      fetchEmailTimeline(selectedClient.email);
    }
  }, [selectedClient, fetchEmailTimeline]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'lead': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'customer': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };



  const handleAddClient = async () => {
    try {
      const response = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newClient,
          address: newClient.location
        }),
      });

      if (!response.ok) throw new Error('Failed to add client');

      await fetchContacts();
      setShowAddModal(false);
      setNewClient({
        name: '',
        email: '',
        phone: '',
        company: '',
        clientType: 'business',
        status: 'lead',
        pipelineStage: 'new',
        location: '',
        revenue: 0,
        tags: []
      });

      setStatusModal({
        isOpen: true,
        title: 'Client Added',
        message: 'New client has been successfully added to the CRM.',
        type: 'success'
      });
    } catch (error) {
      console.error('Error adding client:', error);
      setStatusModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to add client. Please try again.',
        type: 'error'
      });
    }
  };

  const handleEditClient = async () => {
    if (!editingClient) return;
    try {
      const response = await fetch('/api/crm', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingClient,
          address: editingClient.location
        }),
      });

      if (!response.ok) throw new Error('Failed to update client');

      await fetchContacts();
      setShowEditModal(false);
      setEditingClient(null);

      setStatusModal({
        isOpen: true,
        title: 'Client Updated',
        message: 'Client details have been successfully updated.',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating client:', error);
      setStatusModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to update client. Please try again.',
        type: 'error'
      });
    }
  };

  const handleDeleteClient = async () => {
    if (!deletingClient) return;
    try {
      const response = await fetch(`/api/crm?id=${deletingClient.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete client');

      setClients(clients.filter(c => c.id !== deletingClient.id));
      setShowDeleteModal(false);
      setDeletingClient(null);

      setStatusModal({
        isOpen: true,
        title: 'Client Deleted',
        message: 'The client has been successfully deleted from the system.',
        type: 'success'
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      setStatusModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to delete client. Please try again.',
        type: 'error'
      });
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         client.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalRevenue = clients.reduce((sum, client) => sum + client.revenue, 0);
  const activeClients = clients.filter(c => c.status === 'active').length;
  const leadClients = clients.filter(c => c.status === 'lead').length;

  return (
    <div className="relative min-h-screen pb-20 overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-[20%] right-[30%] w-[60%] h-[60%] rounded-full bg-purple-300/10 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-8 p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-5 md:p-8 shadow-2xl border border-white/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left w-full md:w-auto">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-500 shrink-0">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-none">
                  CRM <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 whitespace-nowrap">Dashboard</span>
                </h1>
                <p className="text-sm md:text-base text-gray-500 font-medium">Manage relationships and track pipeline performance</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:flex md:items-center gap-3 w-full md:w-auto">
              <button 
                type="button"
                onClick={() => {
                  const emails = clients.filter(c => c.status === 'active').map(c => c.email).join(', ');
                  setEmailData({
                    to: emails,
                    subject: 'Update from Your Company',
                    message: 'Dear valued clients,\n\n\n\nBest regards,\nYour Company'
                  });
                  setShowEmailModal(true);
                }}
                className="w-full md:w-auto px-4 md:px-6 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition-all font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
              >
                <Mail className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                <span className="text-sm md:text-base">Bulk Email</span>
              </button>
              <button 
                type="button"
                onClick={() => setShowAddModal(true)}
                className="w-full md:w-auto px-4 md:px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                <span className="text-sm md:text-base">Add Client</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group hover:border-blue-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600">Total</div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 opacity-80">All Clients</p>
              <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{clients.length}</h3>
              <p className="text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition-colors">Total database size</p>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group hover:border-emerald-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600">Active</div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 opacity-80">Active Clients</p>
              <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{activeClients}</h3>
              <p className="text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition-colors">Currently engaged</p>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group hover:border-purple-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600">Pipeline</div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 opacity-80">New Leads</p>
              <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{leadClients}</h3>
              <p className="text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition-colors">Potential opportunities</p>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group hover:border-amber-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <PoundSterling className="w-6 h-6 text-white" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600">Revenue</div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 opacity-80">Total Revenue</p>
              <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">£{(totalRevenue / 1000).toFixed(1)}k</h3>
              <p className="text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition-colors">Lifetime value</p>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-2xl p-4 border border-white/50 shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients, companies, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white text-gray-900 placeholder-gray-400 transition-all outline-none font-medium"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="flex bg-white/50 border border-gray-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative group">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white text-gray-700 font-bold cursor-pointer transition-all hover:bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="lead">Lead</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
        </div>

        {/* Main Content Area: Split Pane */}
        <div className="flex gap-8 items-start h-[calc(100vh-320px)]">
          {/* Left Pane: Contacts List */}
          <div className={`${selectedClient ? 'flex-[1.2]' : 'flex-1'} h-full transition-all duration-500 overflow-y-auto custom-scrollbar pr-2`}>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white/40 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                <p className="text-xl font-black text-gray-900 tracking-tight">Syncing Relationship Data</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-20 border border-white/50 shadow-lg text-center space-y-4">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-black text-gray-900">No clients found</h3>
                <button onClick={() => setShowAddModal(true)} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all cursor-pointer inline-flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Add First Client
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {filteredClients.map((client) => (
                  <div 
                    key={client.id} 
                    onClick={() => {
                      setSelectedClient(client);
                      // Automatic fetch is handled by useEffect
                    }}
                    className={`bg-white/70 backdrop-blur-xl rounded-3xl p-6 border transition-all duration-300 group cursor-pointer ${
                      selectedClient?.id === client.id 
                      ? 'border-blue-600 shadow-xl shadow-blue-100 ring-2 ring-blue-500/20 translate-x-2' 
                      : 'border-white/50 shadow-lg hover:shadow-xl hover:-translate-y-1'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-gray-900 leading-tight">{client.name}</h3>
                          <p className="text-xs font-semibold text-gray-500">{client.company}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${getStatusColor(client.status)}`}>
                        {client.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                      <Mail className="w-3.5 h-3.5 text-blue-500" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Email / Phone</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredClients.map((client) => (
                      <tr 
                        key={client.id} 
                        onClick={() => setSelectedClient(client)}
                        className={`cursor-pointer transition-colors ${selectedClient?.id === client.id ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                              {client.name[0]}
                            </div>
                            <span className="text-sm font-black text-gray-900">{client.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                           {client.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black text-gray-900">
                           £{client.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Pane: Communication & Details Sidebar */}
          {selectedClient ? (
            <div className="flex-[0.8] h-full bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right-8 duration-500">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-600/5 to-indigo-600/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-blue-600 font-black text-xl border border-blue-50">
                    {selectedClient.name[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">{selectedClient.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Profile</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex px-4 bg-gray-50/50 border-b border-gray-100">
                {['communication', 'info', 'notes'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as 'communication' | 'info' | 'notes')}
                    className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 cursor-pointer ${
                      activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {activeTab === 'communication' && (
                  <div className="space-y-6">
                    {loadingTimeline ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Fetching Inbox...</p>
                      </div>
                    ) : emailTimeline.length === 0 ? (
                      <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                          <Mail className="w-8 h-8 text-gray-200" />
                        </div>
                        <p className="text-gray-400 font-bold text-sm">No emails found for this contact</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Sub-Navigation for Communication */}
                        <div className="flex items-center gap-2 mb-6 p-1 bg-gray-100/50 rounded-xl w-fit">
                          {[
                            { id: 'all', label: 'Timeline', icon: Clock },
                            { id: 'RECEIVED', label: 'Inbox', icon: InboxIcon },
                            { id: 'SENT', label: 'Sent', icon: SendIcon }
                          ].map((item) => (
                            <button
                              key={item.id}
                              onClick={() => setCommFilter(item.id as 'all' | 'SENT' | 'RECEIVED')}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                                commFilter === item.id 
                                  ? 'bg-white text-blue-600 shadow-sm border border-gray-100' 
                                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'
                              }`}
                            >
                              <item.icon className="w-3.5 h-3.5" />
                              {item.label}
                              <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] ${
                                commFilter === item.id ? 'bg-blue-50 text-blue-600' : 'bg-gray-200 text-gray-500'
                              }`}>
                                {item.id === 'all' 
                                  ? emailTimeline.length 
                                  : emailTimeline.filter(e => e.type === item.id).length}
                              </span>
                            </button>
                          ))}
                        </div>

                        {emailTimeline
                          .filter(item => commFilter === 'all' || item.type === commFilter)
                          .map((item) => (
                            <div key={item.id} className={`group p-5 rounded-3xl border transition-all duration-300 ${
                              item.type === 'SENT' 
                                ? 'bg-gradient-to-br from-blue-50/50 to-indigo-50/30 border-blue-100/50 hover:shadow-lg hover:shadow-blue-500/5' 
                                : 'bg-white border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 hover:scale-[1.01]'
                            }`}>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter shadow-sm ${
                                    item.type === 'SENT' ? 'bg-blue-600 text-white' : 'bg-indigo-600 text-white'
                                  }`}>
                                    {item.type === 'SENT' ? 'Outgoing' : 'Incoming'}
                                  </span>
                                  <span className="text-[10px] font-bold text-gray-400">
                                    {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black text-gray-900 bg-gray-50 px-2 py-1 rounded-md">
                                    {new Date(item.date).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <h4 className="text-sm font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {item.subject}
                              </h4>
                              <div 
                                className="text-xs text-gray-500 line-clamp-3 leading-relaxed font-medium" 
                                dangerouslySetInnerHTML={{ __html: item.body }} 
                              />
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                       <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Email Address</p>
                          <p className="text-sm font-bold text-gray-900">{selectedClient.email}</p>
                       </div>
                       <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Phone</p>
                          <p className="text-sm font-bold text-gray-900">{selectedClient.phone || 'N/A'}</p>
                       </div>
                       <div className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white shadow-lg">
                          <p className="text-[10px] font-black uppercase opacity-80 mb-1">Revenue Value</p>
                          <p className="text-3xl font-black">£{selectedClient.revenue.toLocaleString()}</p>
                       </div>
                    </div>

                     {/* Last Interaction Quick-glance Boxes */}
                     <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm group hover:border-blue-500/30 transition-all">
                           <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-blue-100 rounded-lg">
                                 <SendIcon className="w-3.5 h-3.5 text-blue-600" />
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Last Sent</span>
                           </div>
                           {emailTimeline.find(e => e.type === 'SENT') ? (
                              <p className="text-xs font-bold text-gray-900 line-clamp-1">
                                 {new Date(emailTimeline.find(e => e.type === 'SENT')!.date).toLocaleDateString()}
                              </p>
                           ) : (
                              <p className="text-xs font-medium text-gray-400">No sent emails</p>
                           )}
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm group hover:border-indigo-500/30 transition-all">
                           <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-indigo-100 rounded-lg">
                                 <InboxIcon className="w-3.5 h-3.5 text-indigo-600" />
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Last Received</span>
                           </div>
                           {emailTimeline.find(e => e.type === 'RECEIVED') ? (
                              <p className="text-xs font-bold text-gray-900 line-clamp-1">
                                 {new Date(emailTimeline.find(e => e.type === 'RECEIVED')!.date).toLocaleDateString()}
                              </p>
                           ) : (
                              <p className="text-xs font-medium text-gray-400">No received emails</p>
                           )}
                        </div>
                     </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <button 
                  onClick={() => {
                    setEmailData(prev => ({ ...prev, to: selectedClient.email }));
                    setShowEmailModal(true);
                  }}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Mail className="w-5 h-5" />
                  Reply to Contact
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-[0.8] h-full flex flex-col">
              <div className="p-5 md:p-8 border-b border-gray-100 bg-white/70 backdrop-blur-2xl rounded-t-3xl">
                <div className="flex items-start md:items-center justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">Communication Engine</h2>
                    <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1.5 leading-tight">Live Global Interaction Feed</p>
                  </div>
                  <div className="p-2.5 md:p-3 bg-blue-50 rounded-2xl shrink-0 mt-1 md:mt-0">
                    <InboxIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 md:gap-4 mt-5 md:mt-6">
                  <div className="p-3 md:p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col justify-center">
                    <p className="text-[9px] md:text-[10px] font-black text-blue-600 uppercase mb-1 truncate">Total Sent</p>
                    <p className="text-xl md:text-2xl font-black text-blue-900 leading-none">{globalTimeline.filter(e => e.type === 'SENT').length}</p>
                  </div>
                  <div className="p-3 md:p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex flex-col justify-center">
                    <p className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase mb-1 truncate">Total Received</p>
                    <p className="text-xl md:text-2xl font-black text-indigo-900 leading-none">{globalTimeline.filter(e => e.type === 'RECEIVED').length}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar space-y-6 bg-white/40 backdrop-blur-xl rounded-b-3xl">
                {loadingGlobal ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-sm font-bold text-gray-400">Loading Global Feed...</p>
                  </div>
                ) : globalTimeline.length === 0 ? (
                  <div className="text-center py-20 opacity-40">
                    <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-black text-gray-900">No recent interactions</p>
                    <p className="text-sm font-medium text-gray-400">Your communication engine is ready to sync.</p>
                  </div>
                ) : (
                  globalTimeline.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => {
                        // Find and select the client associated with this email
                        const clientEmail = item.type === 'RECEIVED' ? item.from.match(/<(.+)>/)?.[1] || item.from : item.to;
                        const client = clients.find(c => c.email === clientEmail);
                        if (client) setSelectedClient(client);
                      }}
                      className={`group p-6 rounded-3xl border transition-all duration-300 cursor-pointer ${
                        item.type === 'SENT' 
                          ? 'bg-gradient-to-br from-blue-50/50 to-indigo-50/30 border-blue-100/50 hover:shadow-lg hover:shadow-blue-500/5' 
                          : 'bg-white border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${item.type === 'SENT' ? 'bg-blue-600' : 'bg-indigo-600'} shadow-lg`}>
                            {item.type === 'SENT' ? <SendIcon className="w-4 h-4 text-white" /> : <InboxIcon className="w-4 h-4 text-white" />}
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-gray-900 block mb-0.5">
                              {item.type === 'SENT' ? `To: ${item.to}` : `From: ${item.from.split(' <')[0]}`}
                            </span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                              {new Date(item.date).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <h4 className="text-sm font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {item.subject}
                      </h4>
                      <div 
                        className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-medium" 
                        dangerouslySetInnerHTML={{ __html: item.body }} 
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>


      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
      />

      {/* Edit Client Modal */}
      {showEditModal && editingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Edit className="w-6 h-6" />
                Edit Client
              </h2>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditingClient(null);
                }} 
                className="p-2 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={editingClient.name}
                    onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={editingClient.email}
                    onChange={(e) => setEditingClient({...editingClient, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editingClient.phone || ''}
                    onChange={(e) => setEditingClient({...editingClient, phone: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Company *</label>
                  <input
                    type="text"
                    value={editingClient.company}
                    onChange={(e) => setEditingClient({...editingClient, company: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Client Type *</label>
                  <select 
                    value={editingClient.clientType}
                    onChange={(e) => setEditingClient({...editingClient, clientType: e.target.value as 'business' | 'individual'})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="business">Business</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Status *</label>
                  <select 
                    value={editingClient.status}
                    onChange={(e) => setEditingClient({...editingClient, status: e.target.value as 'active' | 'lead' | 'inactive'})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="lead">Lead</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={editingClient.location || ''}
                  onChange={(e) => setEditingClient({...editingClient, location: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Revenue (£)</label>
                <input
                  type="number"
                  value={editingClient.revenue}
                  onChange={(e) => setEditingClient({...editingClient, revenue: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleEditClient}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Edit className="w-5 h-5" />
                  Save Changes
                </button>
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingClient(null);
                  }}
                  className="px-6 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Compose Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Compose Email</h2>
                  <p className="text-orange-100 text-sm">Send email to your clients</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowEmailModal(false)} 
                className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Recipients */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  To:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={emailData.to}
                    onChange={(e) => setEmailData({...emailData, to: e.target.value})}
                    placeholder="client@email.com, another@email.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg">
                      {emailData.to.split(',').filter(e => e.trim()).length} recipient(s)
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  Separate multiple emails with commas
                </p>
              </div>

              {/* Quick Templates */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Quick Templates
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEmailData({
                      ...emailData,
                      subject: 'Thank you for your business',
                      message: 'Dear valued client,\n\nThank you for choosing our services. We appreciate your continued trust and partnership.\n\nBest regards,\nYour Company'
                    })}
                    className="px-3 py-2 bg-white border border-blue-300 text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    Thank You
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailData({
                      ...emailData,
                      subject: 'Important Update',
                      message: 'Dear valued client,\n\nWe wanted to inform you about an important update regarding our services.\n\nPlease let us know if you have any questions.\n\nBest regards,\nYour Company'
                    })}
                    className="px-3 py-2 bg-white border border-blue-300 text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailData({
                      ...emailData,
                      subject: 'Follow-up on our conversation',
                      message: 'Dear valued client,\n\nI wanted to follow up on our recent conversation and see if you have any questions.\n\nLooking forward to hearing from you.\n\nBest regards,\nYour Company'
                    })}
                    className="px-3 py-2 bg-white border border-blue-300 text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    Follow-up
                  </button>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Subject:
                </label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                  placeholder="Enter email subject"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-medium"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Message:
                </label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                  placeholder="Type your message here..."
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none font-normal"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">{emailData.message.length} characters</p>
                  <button
                    type="button"
                    onClick={() => setEmailData({...emailData, message: ''})}
                    className="text-xs text-gray-500 hover:text-gray-700 underline cursor-pointer"
                  >
                    Clear message
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Mail className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 mb-1">Direct Secure Send</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      This email will be sent directly through the Okleevo SMTP engine. 
                      It will arrive in a professional branded template with your business name.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t-2 border-gray-200 px-6 py-4 flex gap-3">
              <button 
                type="button"
                disabled={sendingEmail}
                onClick={async () => {
                  if (!emailData.to.trim()) {
                    setStatusModal({
                      isOpen: true,
                      title: 'Validation Error',
                      message: 'Please enter at least one recipient email address.',
                      type: 'error'
                    });
                    return;
                  }
                  if (!emailData.subject.trim()) {
                    setStatusModal({
                      isOpen: true,
                      title: 'Validation Error',
                      message: 'Please enter an email subject.',
                      type: 'error'
                    });
                    return;
                  }

                  try {
                    setSendingEmail(true);
                    const response = await fetch('/api/email/send', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        to: emailData.to,
                        subject: emailData.subject,
                        html: emailData.message.replace(/\n/g, '<br/>'), // Basic text to HTML conversion
                        text: emailData.message
                      })
                    });

                    if (!response.ok) {
                      const err = await response.json();
                      throw new Error(err.error || 'Failed to send email');
                    }

                    setStatusModal({
                      isOpen: true,
                      title: 'Email Sent',
                      message: `The email has been successfully sent to ${emailData.to.split(',').length} recipient(s) via the Okleevo SMTP engine.`,
                      type: 'success'
                    });
                    setShowEmailModal(false);
                    setEmailData({ to: '', subject: '', message: '' });
                  } catch (error) {
                    console.error('Email direct send error:', error);
                    setStatusModal({
                      isOpen: true,
                      title: 'Sending Failed',
                      message: error instanceof Error ? error.message : 'Could not send email. Please check your SMTP settings.',
                      type: 'error'
                    });
                  } finally {
                    setSendingEmail(false);
                  }
                }}
                className={`flex-1 px-6 py-3.5 ${sendingEmail ? 'bg-orange-400' : 'bg-gradient-to-r from-orange-500 to-orange-600'} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed`}
              >
                {sendingEmail ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>Send via Internal SMTP</span>
                  </>
                )}
              </button>
              <button 
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="px-6 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5 flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">Delete Client</h2>
                <p className="text-red-100 text-sm">This action cannot be undone</p>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingClient(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Client Info */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {deletingClient.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{deletingClient.name}</h3>
                    <p className="text-gray-600">{deletingClient.company}</p>
                    <p className="text-sm text-gray-500">{deletingClient.email}</p>
                  </div>
                </div>
              </div>

              {/* Warning Message */}
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 mb-1">Warning</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Are you sure you want to delete <span className="font-bold">{deletingClient.name}</span>? 
                      This will permanently remove all client data, history, and associated records.
                    </p>
                  </div>
                </div>
              </div>

              {/* Confirmation Text */}
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  Type <span className="font-bold text-gray-900">DELETE</span> to confirm
                </p>
                <input
                  type="text"
                  id="delete-confirmation"
                  placeholder="Type DELETE"
                  className="mt-2 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-center font-semibold"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t-2 border-gray-200 px-6 py-4 flex gap-3">
              <button 
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingClient(null);
                }}
                className="flex-1 px-6 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => {
                  const input = document.getElementById('delete-confirmation') as HTMLInputElement;
                  if (input && input.value === 'DELETE') {
                    handleDeleteClient();
                  } else {
                    setStatusModal({
                      isOpen: true,
                      title: 'Confirmation Failed',
                      message: 'Please type DELETE to confirm this action.',
                      type: 'error'
                    });
                  }
                }}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-5 h-5" />
                Delete Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Plus className="w-6 h-6" />
                Add New Client
              </h2>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-2 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    placeholder="John Smith"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    placeholder="john@company.com"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    placeholder="+44 20 1234 5678"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Company *</label>
                  <input
                    type="text"
                    placeholder="Acme Corp"
                    value={newClient.company}
                    onChange={(e) => setNewClient({...newClient, company: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Client Type *</label>
                  <select 
                    value={newClient.clientType}
                    onChange={(e) => setNewClient({...newClient, clientType: e.target.value as 'business' | 'individual'})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="business">Business</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Status *</label>
                  <select 
                    value={newClient.status}
                    onChange={(e) => setNewClient({...newClient, status: e.target.value as 'active' | 'lead' | 'inactive'})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="lead">Lead</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="London, UK"
                  value={newClient.location}
                  onChange={(e) => setNewClient({...newClient, location: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="Enterprise, Priority, VIP"
                  value={newClient.tags.join(', ')}
                  onChange={(e) => setNewClient({...newClient, tags: e.target.value.split(',').map(t => t.trim())})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleAddClient}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  Add Client
                </button>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal is now integrated into the Sidebar */}
      </div>
    </div>
  );
}
