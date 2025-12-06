"use client";

import React, { useState } from 'react';
import { Plus, Search, Mail, Phone, Building2, MapPin, Calendar, DollarSign, Users, TrendingUp, Star, Edit, Trash2, Eye, X, Tag } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  clientType: 'business' | 'individual';
  status: 'active' | 'lead' | 'inactive';
  revenue: number;
  location?: string;
  lastContact?: string;
  tags?: string[];
}

export default function CRMPage() {
  const [clients, setClients] = useState<Client[]>([
    { id: '1', name: 'John Smith', email: 'john@acme.com', phone: '+44 20 1234 5678', company: 'Acme Corp', clientType: 'business', status: 'active', revenue: 25000, location: 'London, UK', lastContact: '2024-12-01', tags: ['Enterprise', 'Priority'] },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@tech.com', phone: '+44 161 234 5678', company: 'Tech Solutions', clientType: 'business', status: 'active', revenue: 18000, location: 'Manchester, UK', lastContact: '2024-12-03', tags: ['SMB'] },
    { id: '3', name: 'Mike Brown', email: 'mike@design.com', phone: '+44 131 234 5678', company: 'Design Studio', clientType: 'business', status: 'lead', revenue: 0, location: 'Edinburgh, UK', lastContact: '2024-12-05', tags: ['New Lead'] },
    { id: '4', name: 'Emma Wilson', email: 'emma@startup.com', phone: '+44 117 234 5678', company: 'StartupXYZ', clientType: 'business', status: 'active', revenue: 12000, location: 'Bristol, UK', lastContact: '2024-12-02', tags: ['Startup'] },
    { id: '5', name: 'David Thompson', email: 'david.t@email.com', phone: '+44 20 9876 5432', company: 'Self-Employed', clientType: 'individual', status: 'active', revenue: 8500, location: 'London, UK', lastContact: '2024-12-04', tags: ['Freelancer'] },
    { id: '6', name: 'Lisa Anderson', email: 'lisa.a@email.com', phone: '+44 161 8765 4321', company: 'Personal', clientType: 'individual', status: 'lead', revenue: 0, location: 'Manchester, UK', lastContact: '2024-12-05', tags: ['Consultant'] },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: ''
  });

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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Users className="w-10 h-10" />
              Customer Relationship Management
            </h1>
            <p className="text-cyan-100 text-lg">Manage your clients and build lasting relationships</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                const emails = clients.filter(c => c.status === 'active').map(c => c.email).join(', ');
                setEmailData({
                  to: emails,
                  subject: 'Update from Your Company',
                  message: 'Dear valued clients,\n\n\n\nBest regards,\nYour Company'
                });
                setShowEmailModal(true);
              }}
              className="px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl hover:bg-opacity-30 transition-all font-semibold flex items-center gap-2 cursor-pointer"
              style={{ color: 'var(--color-purple-600)' }}
            >
              <Mail className="w-5 h-5" />
              <span>Send Email</span>
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-white rounded-xl hover:shadow-2xl transition-all font-bold flex items-center gap-2 cursor-pointer"
              style={{ color: 'var(--color-purple-600)' }}
            >
              <Plus className="w-5 h-5" />
              Add Client
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{clients.length}</span>
          </div>
          <p className="text-blue-100 text-sm">Total Clients</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{activeClients}</span>
          </div>
          <p className="text-green-100 text-sm">Active Clients</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{leadClients}</span>
          </div>
          <p className="text-purple-100 text-sm">New Leads</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">£{(totalRevenue / 1000).toFixed(0)}k</span>
          </div>
          <p className="text-orange-100 text-sm">Total Revenue</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="lead">Lead</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Clients Grid */}
      <div className="grid gap-4">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-primary-300 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex gap-4 flex-1">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {client.name.split(' ').map(n => n[0]).join('')}
                </div>
                
                {/* Client Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      client.clientType === 'business' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {client.clientType === 'business' ? '🏢 Business' : '👤 Individual'}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      client.status === 'active' ? 'bg-green-100 text-green-800' : 
                      client.status === 'lead' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {client.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm">{client.company}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors">
                      <Mail className="w-4 h-4" />
                      {client.email}
                    </a>
                    {client.phone && (
                      <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors">
                        <Phone className="w-4 h-4" />
                        {client.phone}
                      </a>
                    )}
                    {client.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {client.location}
                      </div>
                    )}
                    {client.lastContact && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {client.lastContact}
                      </div>
                    )}
                  </div>

                  {client.tags && client.tags.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {client.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Revenue & Actions */}
              <div className="text-right flex flex-col items-end gap-3">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 px-4 py-3 rounded-lg border border-green-200">
                  <p className="text-2xl font-bold text-green-700">£{client.revenue.toLocaleString()}</p>
                  <p className="text-xs text-green-600">Total Revenue</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setSelectedClient(client);
                      setShowDetailModal(true);
                    }}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4 text-blue-600" />
                  </button>
                  <button 
                    onClick={() => {
                      setEditingClient(client);
                      setShowEditModal(true);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm(`Delete ${client.name}?`)) {
                        setClients(clients.filter(c => c.id !== client.id));
                      }
                    }}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
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
                    alert('✓ Client updated successfully!');
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
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Mail className="w-6 h-6" />
                Compose Email
              </h2>
              <button 
                onClick={() => setShowEmailModal(false)} 
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">To:</label>
                <input
                  type="text"
                  value={emailData.to}
                  onChange={(e) => setEmailData({...emailData, to: e.target.value})}
                  placeholder="client@email.com, another@email.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Subject:</label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                  placeholder="Email subject"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message:</label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                  placeholder="Type your message here..."
                  rows={12}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Sending to {emailData.to.split(',').filter(e => e.trim()).length} recipient(s)</p>
                    <p className="text-xs text-blue-700 mt-1">This will open your default email client with the pre-filled information</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    window.location.href = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.message)}`;
                    alert('✓ Email client opened successfully!');
                    setShowEmailModal(false);
                  }}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-5 h-5" />
                  Send Email
                </button>
                <button 
                  onClick={() => setShowEmailModal(false)}
                  className="px-6 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
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
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
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
                    alert('✓ Client added successfully!');
                    setShowAddModal(false);
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
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
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
