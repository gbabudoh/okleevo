"use client";

import React, { useState } from 'react';
import { 
  Plus, Search, Mail, Phone, Building2, MapPin, DollarSign, 
  Users, TrendingUp, Star, Edit, Trash2, Eye, X, Tag, AlertCircle, 
  MoreHorizontal, Clock, ChevronDown, Sparkles, LayoutGrid, List
} from 'lucide-react';
import StatusModal from '@/components/StatusModal';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  clientType: 'business' | 'individual';
  status: 'active' | 'lead' | 'inactive';
  pipelineStage: 'new' | 'contacted' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  revenue: number;
  location?: string;
  lastContact?: string;
  tags?: string[];
  notes?: string;
}

export default function CRMPage() {
  const [clients, setClients] = useState<Client[]>([
    { id: '1', name: 'John Smith', email: 'john@acme.com', phone: '+44 20 1234 5678', company: 'Acme Corp', clientType: 'business', status: 'active', pipelineStage: 'negotiation', revenue: 25000, location: 'London, UK', lastContact: '2024-12-01', tags: ['Enterprise', 'Priority'] },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@tech.com', phone: '+44 161 234 5678', company: 'Tech Solutions', clientType: 'business', status: 'active', pipelineStage: 'contacted', revenue: 18000, location: 'Manchester, UK', lastContact: '2024-12-03', tags: ['SMB'] },
    { id: '3', name: 'Mike Brown', email: 'mike@design.com', phone: '+44 131 234 5678', company: 'Design Studio', clientType: 'business', status: 'lead', pipelineStage: 'new', revenue: 0, location: 'Edinburgh, UK', lastContact: '2024-12-05', tags: ['New Lead'] },
    { id: '4', name: 'Emma Wilson', email: 'emma@startup.com', phone: '+44 117 234 5678', company: 'StartupXYZ', clientType: 'business', status: 'active', pipelineStage: 'proposal', revenue: 12000, location: 'Bristol, UK', lastContact: '2024-12-02', tags: ['Startup'] },
    { id: '5', name: 'David Thompson', email: 'david.t@email.com', phone: '+44 20 9876 5432', company: 'Self-Employed', clientType: 'individual', status: 'active', pipelineStage: 'closed-won', revenue: 8500, location: 'London, UK', lastContact: '2024-12-04', tags: ['Freelancer'] },
    { id: '6', name: 'Lisa Anderson', email: 'lisa.a@email.com', phone: '+44 161 8765 4321', company: 'Personal', clientType: 'individual', status: 'lead', pipelineStage: 'closed-lost', revenue: 0, location: 'Manchester, UK', lastContact: '2024-12-05', tags: ['Consultant'] },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
  
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'lead': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'new': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'contacted': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'proposal': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'negotiation': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'closed-won': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'closed-lost': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600';
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
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-500">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1 text-center md:text-left">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                  CRM <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Dashboard</span>
                </h1>
                <p className="text-gray-500 font-medium">Manage relationships and track pipeline performance</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
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
                className="flex-1 md:flex-none px-6 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition-all font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
              >
                <Mail className="w-5 h-5" />
                <span>Bulk Email</span>
              </button>
              <button 
                type="button"
                onClick={() => setShowAddModal(true)}
                className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                Add Client
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
                <DollarSign className="w-6 h-6 text-white" />
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

        {/* Kanban / List View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <div 
                key={client.id} 
                className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg hover:shadow-xl hover:scale-[1.01] hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                      {client.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 leading-tight mb-1">{client.name}</h3>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                        <Building2 className="w-3.5 h-3.5" />
                        {client.company}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); /* Menu logic */ }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-xl transition-colors cursor-pointer"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusColor(client.status)}`}>
                      {client.status.toUpperCase()}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStageColor(client.pipelineStage)}`}>
                      {client.pipelineStage.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    {client.location && (
                      <div className="flex items-center gap-2 text-gray-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {client.location}
                      </div>
                    )}
                    {client.lastContact && (
                      <div className="flex items-center gap-2 text-gray-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {client.lastContact}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-500 font-medium truncate">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {client.email}
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2 text-gray-500 font-medium truncate">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {client.phone}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100/50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Value</p>
                    <p className="text-lg font-black text-gray-900">£{client.revenue.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedClient(client);
                        setShowDetailModal(true);
                      }}
                      className="p-2.5 bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setEditingClient(client);
                        setShowEditModal(true);
                      }}
                      className="p-2.5 bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all cursor-pointer"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setDeletingClient(client);
                        setShowDeleteModal(true);
                      }}
                      className="p-2.5 bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Client / Company</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pipeline Stage</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-sm font-black text-gray-900">{client.name}</div>
                            <div className="text-xs font-medium text-gray-500 flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {client.company}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {client.email}
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Phone className="w-3 h-3 text-gray-400" />
                              {client.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusColor(client.status)}`}>
                          {client.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStageColor(client.pipelineStage)}`}>
                          {client.pipelineStage.replace('-', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-black text-gray-900">£{client.revenue.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">

                          <button 
                            onClick={() => {
                              setSelectedClient(client);
                              setShowDetailModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setEditingClient(client);
                              setShowEditModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setDeletingClient(client);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  onClick={() => {
                    setClients(clients.map(c => c.id === editingClient.id ? editingClient : c));
                    setShowEditModal(false);
                    setEditingClient(null);
                    setStatusModal({
                      isOpen: true,
                      title: 'Client Updated',
                      message: 'Client details have been successfully updated.',
                      type: 'success'
                    });
                  }}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
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
                  rows={10}
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
                    <p className="text-sm font-bold text-gray-900 mb-1">Ready to send</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      This will open your default email client (Outlook, Gmail, etc.) with all the information pre-filled. 
                      You can review and make final changes before sending.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t-2 border-gray-200 px-6 py-4 flex gap-3">
              <button 
                type="button"
                onClick={() => {
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
                  window.location.href = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.message)}`;
                  setStatusModal({
                    isOpen: true,
                    title: 'Email Opened',
                    message: 'The default email client has been opened successfully.',
                    type: 'success'
                  });
                  setShowEmailModal(false);
                }}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-5 h-5" />
                Open in Email Client
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
                    setClients(clients.filter(c => c.id !== deletingClient.id));
                    setShowDeleteModal(false);
                    setDeletingClient(null);
                    setStatusModal({
                      isOpen: true,
                      title: 'Client Deleted',
                      message: 'The client has been successfully deleted from the system.',
                      type: 'success'
                    });
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    placeholder="john@company.com"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Company *</label>
                  <input
                    type="text"
                    placeholder="Acme Corp"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Client Type *</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all cursor-pointer">
                    <option value="business">Business</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Status *</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all cursor-pointer">
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="Enterprise, Priority, VIP"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setStatusModal({
                      isOpen: true,
                      title: 'Client Added',
                      message: 'New client has been successfully added to the CRM.',
                      type: 'success'
                    });
                  }}
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

      {/* Client Detail Modal */}
      {showDetailModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary-500 to-accent-500">
              <h2 className="text-xl font-bold text-white">Client Details</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedClient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedClient.name}</h3>
                  <p className="text-gray-600">{selectedClient.company}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  selectedClient.clientType === 'business' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedClient.clientType === 'business' ? '🏢 Business Client' : '👤 Individual Client'}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  selectedClient.status === 'active' ? 'bg-green-100 text-green-800' : 
                  selectedClient.status === 'lead' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedClient.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-gray-900">{selectedClient.email}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="font-medium text-gray-900">{selectedClient.phone || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <p className="font-medium text-gray-900">{selectedClient.location || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Last Contact</p>
                  <p className="font-medium text-gray-900">{selectedClient.lastContact || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                <p className="text-sm text-green-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-700">£{selectedClient.revenue.toLocaleString()}</p>
              </div>

              <button 
                onClick={() => setShowDetailModal(false)}
                className="w-full px-4 py-2 rounded-lg text-white font-medium cursor-pointer" 
                style={{ backgroundColor: '#fc6813' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
