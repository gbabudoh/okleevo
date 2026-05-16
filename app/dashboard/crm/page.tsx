"use client";

import { useState, useEffect, useCallback } from 'react';
import { sanitizeHtml } from '@/lib/sanitize';
import {
  Plus, Search, Mail, PoundSterling,
  Users, TrendingUp, Star, Edit, Trash2, X, Tag, AlertCircle,
  ChevronDown, Sparkles, LayoutGrid, List, Loader2,
  Clock, Send as SendIcon, Inbox as InboxIcon, ArrowLeft
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
  const [emailTimeline, setEmailTimeline] = useState<TimelineItem[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'communication' | 'notes'>('info');
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info';
  }>({ isOpen: false, title: '', message: '', type: 'success' });

  const [emailData, setEmailData] = useState({ to: '', subject: '', message: '' });

  const [newClient, setNewClient] = useState({
    name: '', email: '', phone: '', company: '',
    clientType: 'business' as 'business' | 'individual',
    status: 'lead' as 'active' | 'lead' | 'inactive',
    pipelineStage: 'new' as 'new' | 'contacted' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost',
    location: '', revenue: 0, tags: [] as string[]
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
      if (res.ok) setEmailTimeline(await res.json());
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
    } finally {
      setLoadingTimeline(false);
    }
  }, []);

  const fetchGlobalTimeline = useCallback(async () => {
    setLoadingGlobal(true);
    try {
      const [sentRes, receivedRes] = await Promise.all([
        fetch('/api/email/history?limit=20'),
        fetch('/api/email/inbox')
      ]);
      const sentData = await sentRes.json();
      const receivedData = await receivedRes.json();
      const combined: TimelineItem[] = [
        ...(sentData.data || []).map((item: SentEmail) => ({
          id: item.id, type: 'SENT' as const, subject: item.subject,
          body: item.body, date: item.createdAt, from: 'You', to: item.to
        })),
        ...(Array.isArray(receivedData) ? receivedData : []).map((item: ReceivedEmail) => ({
          id: item.id, type: 'RECEIVED' as const, subject: item.subject,
          body: item.body || item.html || '', date: item.date, from: item.from, to: item.to
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setGlobalTimeline(combined.slice(0, 50));
    } catch (err) {
      console.error('Failed to fetch global timeline:', err);
    } finally {
      setLoadingGlobal(false);
    }
  }, []);

  useEffect(() => { fetchContacts(); fetchGlobalTimeline(); }, [fetchContacts, fetchGlobalTimeline]);
  useEffect(() => { if (selectedClient?.email) fetchEmailTimeline(selectedClient.email); }, [selectedClient, fetchEmailTimeline]);

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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newClient, address: newClient.location }),
      });
      if (!response.ok) throw new Error('Failed to add client');
      await fetchContacts();
      setShowAddModal(false);
      setNewClient({ name: '', email: '', phone: '', company: '', clientType: 'business', status: 'lead', pipelineStage: 'new', location: '', revenue: 0, tags: [] });
      setStatusModal({ isOpen: true, title: 'Client Added', message: 'New client has been successfully added to the CRM.', type: 'success' });
    } catch (error) {
      console.error('Error adding client:', error);
      setStatusModal({ isOpen: true, title: 'Error', message: 'Failed to add client. Please try again.', type: 'error' });
    }
  };

  const handleEditClient = async () => {
    if (!editingClient) return;
    try {
      const response = await fetch('/api/crm', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingClient, address: editingClient.location }),
      });
      if (!response.ok) throw new Error('Failed to update client');
      await fetchContacts();
      setShowEditModal(false); setEditingClient(null);
      setStatusModal({ isOpen: true, title: 'Client Updated', message: 'Client details have been successfully updated.', type: 'success' });
    } catch (error) {
      console.error('Error updating client:', error);
      setStatusModal({ isOpen: true, title: 'Error', message: 'Failed to update client. Please try again.', type: 'error' });
    }
  };

  const handleDeleteClient = async () => {
    if (!deletingClient) return;
    try {
      const response = await fetch(`/api/crm?id=${deletingClient.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete client');
      setClients(clients.filter(c => c.id !== deletingClient.id));
      setShowDeleteModal(false); setDeletingClient(null);
      setStatusModal({ isOpen: true, title: 'Client Deleted', message: 'The client has been successfully deleted from the system.', type: 'success' });
    } catch (error) {
      console.error('Error deleting client:', error);
      setStatusModal({ isOpen: true, title: 'Error', message: 'Failed to delete client. Please try again.', type: 'error' });
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

  const DetailPanel = ({ client }: { client: Client }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-blue-50/50 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shrink-0">
            {client.name[0]}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 leading-tight truncate">{client.name}</h3>
            <p className="text-[11px] text-gray-400 truncate">{client.company}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => { setEditingClient(client); setShowEditModal(true); setSelectedClient(null); }}
            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-500 cursor-pointer">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => { setDeletingClient(client); setShowDeleteModal(true); setSelectedClient(null); }}
            className="p-2 hover:bg-rose-100 rounded-lg transition-colors text-rose-400 cursor-pointer">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={() => setSelectedClient(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-white shrink-0">
        {(['communication', 'info', 'notes'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wide transition-colors border-b-2 cursor-pointer ${
              activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {activeTab === 'communication' && (
          <div className="space-y-3">
            {loadingTimeline ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                <p className="text-[11px] text-blue-100 font-medium opacity-90">Loading emails...</p>
              </div>
            ) : emailTimeline.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-400">No emails found</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-3">
                  {[{ id: 'all', label: 'All', icon: Clock }, { id: 'RECEIVED', label: 'Inbox', icon: InboxIcon }, { id: 'SENT', label: 'Sent', icon: SendIcon }].map((item) => (
                    <button key={item.id} onClick={() => setCommFilter(item.id as 'all' | 'SENT' | 'RECEIVED')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all cursor-pointer ${
                        commFilter === item.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                      }`}>
                      <item.icon className="w-3 h-3" />
                      {item.label}
                      <span className={`px-1 rounded text-[9px] ${commFilter === item.id ? 'bg-blue-50 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                        {item.id === 'all' ? emailTimeline.length : emailTimeline.filter(e => e.type === item.id).length}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="space-y-2.5">
                  {emailTimeline.filter(item => commFilter === 'all' || item.type === commFilter).map((item) => (
                    <div key={item.id} className={`p-3.5 rounded-xl border ${
                      item.type === 'SENT' ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-100 shadow-sm'
                    }`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          item.type === 'SENT' ? 'bg-blue-600 text-white' : 'bg-indigo-600 text-white'
                        }`}>
                          {item.type === 'SENT' ? 'Outgoing' : 'Incoming'}
                        </span>
                        <span className="text-[10px] text-gray-400">{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 mb-1">{item.subject}</h4>
                      <div className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.body) }} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'info' && (
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Email</p>
              <p className="text-sm font-semibold text-gray-900 break-all">{client.email}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Phone</p>
              <p className="text-sm font-semibold text-gray-900">{client.phone || 'N/A'}</p>
            </div>
            <div className="p-4 bg-emerald-600 rounded-xl text-white">
              <p className="text-[10px] font-bold uppercase opacity-80 mb-1">Revenue Value</p>
              <p className="text-2xl font-bold">£{client.revenue.toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-white rounded-xl border border-gray-100">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="p-1 bg-blue-100 rounded"><SendIcon className="w-3 h-3 text-blue-600" /></div>
                  <span className="text-[9px] font-bold uppercase text-gray-400">Last Sent</span>
                </div>
                {emailTimeline.find(e => e.type === 'SENT')
                  ? <p className="text-xs font-semibold text-gray-900">{new Date(emailTimeline.find(e => e.type === 'SENT')!.date).toLocaleDateString()}</p>
                  : <p className="text-[11px] text-blue-100 font-medium opacity-90">None</p>}
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-100">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="p-1 bg-indigo-100 rounded"><InboxIcon className="w-3 h-3 text-indigo-600" /></div>
                  <span className="text-[9px] font-bold uppercase text-gray-400">Last Rcvd</span>
                </div>
                {emailTimeline.find(e => e.type === 'RECEIVED')
                  ? <p className="text-xs font-semibold text-gray-900">{new Date(emailTimeline.find(e => e.type === 'RECEIVED')!.date).toLocaleDateString()}</p>
                  : <p className="text-[11px] text-blue-100 font-medium opacity-90">None</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="py-12 text-center">
            <Edit className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-400">No notes yet</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 shrink-0">
        <button
          onClick={() => { setEmailData(prev => ({ ...prev, to: client.email })); setShowEmailModal(true); }}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Mail className="w-4 h-4" /> Email Contact
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8">

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-blue-600 rounded-xl shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">CRM</h1>
              <p className="text-[11px] text-blue-100 font-medium opacity-90 hidden sm:block">Manage relationships & track pipeline</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const emails = clients.filter(c => c.status === 'active').map(c => c.email).join(', ');
                setEmailData({ to: emails, subject: 'Update from Your Company', message: 'Dear valued clients,\n\n\n\nBest regards,\nYour Company' });
                setShowEmailModal(true);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4" /> Bulk Email
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Client</span>
              <span className="sm:hidden">Add</span>
            </button>
        </div>
      </div>
    </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="sm:hidden fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-30 active:scale-95 transition-all cursor-pointer hover:bg-blue-700"
      >
        <Plus className="w-8 h-8" />
      </button>

      <div className="px-4 sm:px-6 space-y-4 pt-4">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'All Clients', value: clients.length, sub: 'Total database', icon: Users, bg: 'bg-blue-100', text: 'text-blue-600' },
            { label: 'Active', value: activeClients, sub: 'Currently engaged', icon: Star, bg: 'bg-emerald-100', text: 'text-emerald-600' },
            { label: 'New Leads', value: leadClients, sub: 'Opportunities', icon: TrendingUp, bg: 'bg-purple-100', text: 'text-purple-600' },
            { label: 'Total Revenue', value: `£${(totalRevenue / 1000).toFixed(1)}k`, sub: 'Lifetime value', icon: PoundSterling, bg: 'bg-amber-100', text: 'text-amber-600' },
          ].map(({ label, value, sub, icon: Icon, bg, text }) => (
            <div key={label} className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm">
              <div className="mb-2">
                <div className={`p-2 ${bg} rounded-xl w-fit`}>
                  <Icon className={`w-4 h-4 ${text}`} />
                </div>
              </div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 hidden sm:block">{sub}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm text-gray-900 placeholder:text-gray-400 transition-all outline-none"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
            <div className="relative flex-1 sm:flex-none">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="lead">Lead</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Main Split Pane */}
        <div className="md:flex md:gap-4 md:items-start md:h-[calc(100vh-360px)]">

          {/* Left: Contacts List */}
          <div className={`${selectedClient ? 'hidden md:block' : 'block'} md:flex-[1.2] md:h-full md:overflow-y-auto md:pr-1`}>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-sm font-semibold text-gray-500">Loading contacts...</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center space-y-4">
                <Users className="w-10 h-10 text-gray-200 mx-auto" />
                <h3 className="text-sm sm:text-lg font-bold text-white tracking-tight">No clients found</h3>
                <button onClick={() => setShowAddModal(true)}
                  className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center gap-2 text-sm cursor-pointer">
                  <Plus className="w-4 h-4" /> Add First Client
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer group ${
                      selectedClient?.id === client.id
                        ? 'border-blue-500 shadow-md ring-2 ring-blue-100'
                        : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 truncate">{client.name}</h3>
                          <p className="text-[11px] text-gray-500 truncate">{client.company}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); setEditingClient(client); setShowEditModal(true); }}
                          className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-400 cursor-pointer">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setDeletingClient(client); setShowDeleteModal(true); }}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-400 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getStatusColor(client.status)}`}>
                        {client.status.toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-gray-400 truncate max-w-[55%]">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Mobile list */}
                <div className="sm:hidden space-y-2">
                  {filteredClients.map((client) => (
                    <div key={client.id} onClick={() => setSelectedClient(client)}
                      className={`bg-white rounded-xl p-3 border flex items-center gap-3 cursor-pointer transition-all ${
                        selectedClient?.id === client.id ? 'border-blue-500 shadow-sm' : 'border-gray-100 shadow-sm'
                      }`}>
                      <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                        {client.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{client.name}</p>
                        <p className="text-[11px] text-blue-100 font-medium opacity-90 truncate">{client.email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${getStatusColor(client.status)}`}>
                          {client.status.toUpperCase()}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-700">£{client.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop table */}
                <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wide">Client</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wide">Email</th>
                        <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wide">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredClients.map((client) => (
                        <tr key={client.id} onClick={() => setSelectedClient(client)}
                          className={`cursor-pointer transition-colors ${selectedClient?.id === client.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                                {client.name[0]}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">{client.name}</p>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getStatusColor(client.status)}`}>{client.status}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 max-w-[180px] truncate">{client.email}</td>
                          <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">£{client.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Mobile: full-screen detail */}
          {selectedClient && (
            <div className="block md:hidden bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[70dvh]">
              <button onClick={() => setSelectedClient(null)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-blue-600 border-b border-gray-100 bg-blue-50 w-full text-left cursor-pointer shrink-0">
                <ArrowLeft className="w-4 h-4" /> Back to Contacts
              </button>
              <div className="flex-1 min-h-0 overflow-hidden">
                <DetailPanel client={selectedClient} />
              </div>
            </div>
          )}

          {/* Desktop right pane */}
          {selectedClient ? (
            <div className="hidden md:flex md:flex-[0.8] h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-col">
              <DetailPanel client={selectedClient} />
            </div>
          ) : (
            <div className="hidden md:flex md:flex-[0.8] h-full flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Communication Feed</h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">Live global interaction feed</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <InboxIcon className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Total Sent</p>
                    <p className="text-xl font-bold text-blue-900">{globalTimeline.filter(e => e.type === 'SENT').length}</p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                    <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Received</p>
                    <p className="text-xl font-bold text-indigo-900">{globalTimeline.filter(e => e.type === 'RECEIVED').length}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
                {loadingGlobal ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-sm text-gray-400">Loading feed...</p>
                  </div>
                ) : globalTimeline.length === 0 ? (
                  <div className="text-center py-12">
                    <Sparkles className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-400">No recent interactions</p>
                  </div>
                ) : globalTimeline.map((item) => (
                  <div key={item.id} onClick={() => {
                    const clientEmail = item.type === 'RECEIVED' ? item.from.match(/<(.+)>/)?.[1] || item.from : item.to;
                    const client = clients.find(c => c.email === clientEmail);
                    if (client) setSelectedClient(client);
                  }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
                      item.type === 'SENT' ? 'bg-blue-50 border-blue-100 hover:border-blue-200' : 'bg-white border-gray-100 hover:border-gray-200'
                    }`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`p-1 rounded-lg ${item.type === 'SENT' ? 'bg-blue-600' : 'bg-indigo-600'}`}>
                        {item.type === 'SENT' ? <SendIcon className="w-3 h-3 text-white" /> : <InboxIcon className="w-3 h-3 text-white" />}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-gray-700 block truncate">
                          {item.type === 'SENT' ? `To: ${item.to}` : `From: ${item.from.split(' <')[0]}`}
                        </span>
                        <span className="text-[9px] text-gray-400">{new Date(item.date).toLocaleString()}</span>
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 mb-1 truncate">{item.subject}</h4>
                    <div className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.body) }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
      />

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-4 sm:p-4 pb-10 sm:pb-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl max-h-[70dvh] sm:max-h-[88vh] flex flex-col overflow-hidden border border-white/20 transform animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0"><div className="w-10 h-1 rounded-full bg-gray-300" /></div>
            <div className="bg-linear-to-r from-blue-600 to-indigo-700 px-5 sm:px-6 py-1.5 sm:py-5 flex items-center justify-between shrink-0 shadow-lg">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/20"><Plus className="w-5 h-5 text-white" /></div>
                <div>
                  <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight">Add New Client</h2>
                  <p className="text-[11px] text-blue-100 font-medium opacity-90">Fill in the client details</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2.5 hover:bg-white/20 rounded-xl transition-all cursor-pointer text-white">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-1.5 sm:py-6 space-y-2 sm:space-y-5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1.5">Full Name *</label>
                  <input type="text" placeholder="John Smith" value={newClient.name} onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    className="w-full px-3 py-1.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white bg-gray-50 transition-all text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1.5">Email *</label>
                  <input type="email" placeholder="john@company.com" value={newClient.email} onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className="w-full px-3 py-1.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white bg-gray-50 transition-all text-sm outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1.5">Phone</label>
                  <input type="tel" placeholder="+44 20 1234 5678" value={newClient.phone} onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="w-full px-3 py-1.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white bg-gray-50 transition-all text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1.5">Company *</label>
                  <input type="text" placeholder="Acme Corp" value={newClient.company} onChange={(e) => setNewClient({...newClient, company: e.target.value})}
                    className="w-full px-3 py-1.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white bg-gray-50 transition-all text-sm outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1.5">Client Type</label>
                  <select value={newClient.clientType} onChange={(e) => setNewClient({...newClient, clientType: e.target.value as 'business' | 'individual'})}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-all cursor-pointer text-sm outline-none">
                    <option value="business">Business</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1.5">Status</label>
                  <select value={newClient.status} onChange={(e) => setNewClient({...newClient, status: e.target.value as 'active' | 'lead' | 'inactive'})}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-all cursor-pointer text-sm outline-none">
                    <option value="lead">Lead</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1.5">Location</label>
                <input type="text" placeholder="London, UK" value={newClient.location} onChange={(e) => setNewClient({...newClient, location: e.target.value})}
                  className="w-full px-3 py-1.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white bg-gray-50 transition-all text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1.5">Tags (comma separated)</label>
                <input type="text" placeholder="Enterprise, Priority, VIP" value={newClient.tags.join(', ')} onChange={(e) => setNewClient({...newClient, tags: e.target.value.split(',').map(t => t.trim())})}
                  className="w-full px-3 py-1.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white bg-gray-50 transition-all text-sm outline-none" />
              </div>
            </div>
            <div className="shrink-0 bg-white border-t border-gray-100 px-5 py-3 flex flex-row gap-2.5 pb-[calc(1.25rem+env(safe-area-inset-bottom,12px))] sm:pb-3">
              <button onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer active:scale-[0.98]">
                Cancel
              </button>
              <button onClick={handleAddClient}
                className="flex-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">
                <Plus className="w-4 h-4" /> Add Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && editingClient && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-4 sm:p-4 pb-10 sm:pb-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl max-h-[70dvh] sm:max-h-[88vh] flex flex-col overflow-hidden border border-white/20 transform animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0"><div className="w-10 h-1 rounded-full bg-gray-300" /></div>
            <div className="bg-linear-to-r from-blue-600 to-indigo-700 px-5 sm:px-6 py-1.5 sm:py-5 flex items-center justify-between shrink-0 shadow-lg">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/20"><Edit className="w-5 h-5 text-white" /></div>
                <div>
                  <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight">Edit Client</h2>
                  <p className="text-[11px] text-blue-100 font-medium opacity-90">Update client details</p>
                </div>
              </div>
              <button onClick={() => { setShowEditModal(false); setEditingClient(null); }} className="p-2.5 hover:bg-white/20 rounded-xl transition-all cursor-pointer text-white">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-1.5 sm:py-6 space-y-2 sm:space-y-5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1.5">Full Name *</label>
                  <input type="text" value={editingClient.name} onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                    className="w-full px-3 py-1.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white bg-gray-50 transition-all text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1.5">Email *</label>
                  <input type="email" value={editingClient.email} onChange={(e) => setEditingClient({...editingClient, email: e.target.value})}
                    className="w-full px-3 py-1.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white bg-gray-50 transition-all text-sm outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1.5">Phone</label>
                  <input type="tel" value={editingClient.phone || ''} onChange={(e) => setEditingClient({...editingClient, phone: e.target.value})}
                    className="w-full px-3 py-1.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white bg-gray-50 transition-all text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1.5">Company *</label>
                  <input type="text" value={editingClient.company} onChange={(e) => setEditingClient({...editingClient, company: e.target.value})}
                    className="w-full px-3 py-1.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white bg-gray-50 transition-all text-sm outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1.5">Client Type</label>
                  <select value={editingClient.clientType} onChange={(e) => setEditingClient({...editingClient, clientType: e.target.value as 'business' | 'individual'})}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 cursor-pointer text-sm outline-none">
                    <option value="business">Business</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1.5">Status</label>
                  <select value={editingClient.status} onChange={(e) => setEditingClient({...editingClient, status: e.target.value as 'active' | 'lead' | 'inactive'})}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 cursor-pointer text-sm outline-none">
                    <option value="lead">Lead</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1.5">Location</label>
                <input type="text" value={editingClient.location || ''} onChange={(e) => setEditingClient({...editingClient, location: e.target.value})}
                  className="w-full px-3 py-1.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white bg-gray-50 transition-all text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1.5">Revenue (£)</label>
                <input type="number" value={editingClient.revenue} onChange={(e) => setEditingClient({...editingClient, revenue: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-1.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white bg-gray-50 transition-all text-sm outline-none" />
              </div>
            </div>
            <div className="shrink-0 bg-white border-t border-gray-100 px-5 py-3 flex flex-row gap-2.5 pb-[calc(1.25rem+env(safe-area-inset-bottom,12px))] sm:pb-3">
              <button onClick={() => { setShowEditModal(false); setEditingClient(null); }}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer active:scale-[0.98]">
                Cancel
              </button>
              <button onClick={handleEditClient}
                className="flex-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">
                <Edit className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Compose Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-4 sm:p-4 pb-10 sm:pb-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl max-h-[70dvh] sm:max-h-[88vh] flex flex-col overflow-hidden border border-white/20 transform animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0"><div className="w-10 h-1 rounded-full bg-gray-300" /></div>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-orange-500 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl"><Mail className="w-4 h-4 text-white" /></div>
                <div>
                  <h2 className="text-base font-bold text-white">Compose Email</h2>
                  <p className="text-orange-100 text-xs">Send to your clients</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowEmailModal(false)} className="p-2 hover:bg-white/20 rounded-xl cursor-pointer">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-1.5 sm:py-6 space-y-2 sm:space-y-5">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1.5">To:</label>
                <div className="relative">
                  <input type="text" value={emailData.to} onChange={(e) => setEmailData({...emailData, to: e.target.value})}
                    placeholder="client@email.com, another@email.com"
                    className="w-full px-3 pr-20 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white bg-gray-50 transition-all text-sm outline-none" />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg">
                    {emailData.to.split(',').filter(e => e.trim()).length} rcpt
                  </span>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Quick Templates
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Thank You', subject: 'Thank you for your business', message: 'Dear valued client,\n\nThank you for choosing our services.\n\nBest regards,\nYour Company' },
                    { label: 'Update', subject: 'Important Update', message: 'Dear valued client,\n\nWe wanted to inform you about an important update.\n\nBest regards,\nYour Company' },
                    { label: 'Follow-up', subject: 'Follow-up on our conversation', message: 'Dear valued client,\n\nI wanted to follow up on our recent conversation.\n\nBest regards,\nYour Company' },
                  ].map(t => (
                    <button key={t.label} type="button" onClick={() => setEmailData({...emailData, subject: t.subject, message: t.message})}
                      className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Subject:
                </label>
                <input type="text" value={emailData.subject} onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                  placeholder="Email subject"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white bg-gray-50 transition-all text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1.5">Message:</label>
                <textarea value={emailData.message} onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                  placeholder="Type your message..." rows={5}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white bg-gray-50 transition-all resize-none text-sm outline-none" />
                <p className="text-[11px] text-blue-100 font-medium opacity-90 mt-1">{emailData.message.length} chars</p>
              </div>
            </div>
            <div className="shrink-0 bg-white border-t border-gray-100 px-5 py-3 flex flex-row gap-2.5 pb-[calc(1.25rem+env(safe-area-inset-bottom,12px))] sm:pb-3">
              <button type="button" onClick={() => setShowEmailModal(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer active:scale-[0.98]">
                Cancel
              </button>
              <button
                type="button"
                disabled={sendingEmail}
                onClick={async () => {
                  if (!emailData.to.trim()) { setStatusModal({ isOpen: true, title: 'Validation Error', message: 'Please enter at least one recipient.', type: 'error' }); return; }
                  if (!emailData.subject.trim()) { setStatusModal({ isOpen: true, title: 'Validation Error', message: 'Please enter an email subject.', type: 'error' }); return; }
                  try {
                    setSendingEmail(true);
                    const response = await fetch('/api/email/send', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ to: emailData.to, subject: emailData.subject, html: emailData.message.replace(/\n/g, '<br/>'), text: emailData.message })
                    });
                    if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to send'); }
                    setStatusModal({ isOpen: true, title: 'Email Sent', message: `Sent to ${emailData.to.split(',').length} recipient(s).`, type: 'success' });
                    setShowEmailModal(false);
                    setEmailData({ to: '', subject: '', message: '' });
                  } catch (error) {
                    setStatusModal({ isOpen: true, title: 'Send Failed', message: error instanceof Error ? error.message : 'Could not send email.', type: 'error' });
                  } finally { setSendingEmail(false); }
                }}
                className="flex-2 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {sendingEmail ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Mail className="w-4 h-4" /> Send Email</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingClient && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-4 sm:p-4 pb-10 sm:pb-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl flex flex-col overflow-hidden">
            <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0"><div className="w-10 h-1 rounded-full bg-gray-300" /></div>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-rose-500 shrink-0">
              <div className="p-2 bg-white/20 rounded-xl shrink-0"><Trash2 className="w-4 h-4 text-white" /></div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-white">Delete Client</h2>
                <p className="text-rose-100 text-xs">This action cannot be undone</p>
              </div>
              <button type="button" onClick={() => { setShowDeleteModal(false); setDeletingClient(null); }} className="p-2 hover:bg-white/20 rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-rose-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {deletingClient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{deletingClient.name}</h3>
                  <p className="text-xs text-gray-500">{deletingClient.company}</p>
                  <p className="text-[11px] text-blue-100 font-medium opacity-90">{deletingClient.email}</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700">
                  Are you sure? This will permanently remove <span className="font-bold">{deletingClient.name}</span> and all associated records.
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 text-center mb-2">Type <span className="font-bold text-gray-900">DELETE</span> to confirm</p>
                <input type="text" id="delete-confirmation" placeholder="Type DELETE"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white bg-gray-50 text-center text-sm font-semibold outline-none transition-all" />
              </div>
            </div>
            <div className="shrink-0 bg-white border-t border-gray-100 px-5 py-3 flex flex-row gap-2.5 pb-[calc(1.25rem+env(safe-area-inset-bottom,12px))] sm:pb-3">
              <button type="button" onClick={() => { setShowDeleteModal(false); setDeletingClient(null); }}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer active:scale-[0.98]">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('delete-confirmation') as HTMLInputElement;
                  if (input?.value === 'DELETE') { handleDeleteClient(); }
                  else { setStatusModal({ isOpen: true, title: 'Confirmation Failed', message: 'Please type DELETE to confirm.', type: 'error' }); }
                }}
                className="flex-2 py-3 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
