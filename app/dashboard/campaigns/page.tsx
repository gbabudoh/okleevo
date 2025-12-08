"use client";

import React, { useState } from 'react';
import { Plus, Mail, TrendingUp, Eye, Send, Users, MousePointer, DollarSign, BarChart3, Calendar, Target, Zap, HelpCircle, X, Edit, Trash2, Copy, Download, Filter, Search, CheckCircle, Clock, AlertCircle, TrendingDown, Percent, Award, Info } from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  sent: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  revenue: number;
  cost: number;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'completed';
  createdAt: string;
  sentAt?: string;
  audience: string;
  type: 'promotional' | 'newsletter' | 'transactional' | 'announcement';
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    { 
      id: '1', 
      name: 'Holiday Sale 2024', 
      subject: '🎄 50% Off Everything - Limited Time!',
      sent: 1250, 
      opened: 875, 
      clicked: 234, 
      bounced: 15,
      unsubscribed: 8,
      revenue: 12500,
      cost: 250,
      status: 'completed', 
      createdAt: '2024-12-01',
      sentAt: '2024-12-01 10:00',
      audience: 'All Subscribers',
      type: 'promotional'
    },
    { 
      id: '2', 
      name: 'Product Launch - New Features', 
      subject: '🚀 Introducing Our Latest Innovation',
      sent: 980, 
      opened: 654, 
      clicked: 189, 
      bounced: 12,
      unsubscribed: 5,
      revenue: 8900,
      cost: 180,
      status: 'completed', 
      createdAt: '2024-11-28',
      sentAt: '2024-11-28 14:00',
      audience: 'Active Users',
      type: 'announcement'
    },
    { 
      id: '3', 
      name: 'December Newsletter', 
      subject: '📰 Your Monthly Update',
      sent: 0, 
      opened: 0, 
      clicked: 0, 
      bounced: 0,
      unsubscribed: 0,
      revenue: 0,
      cost: 150,
      status: 'draft', 
      createdAt: '2024-12-05',
      audience: 'All Subscribers',
      type: 'newsletter'
    },
    { 
      id: '4', 
      name: 'Flash Sale - 24 Hours', 
      subject: '⚡ Flash Sale Ends Tonight!',
      sent: 1500, 
      opened: 1125, 
      clicked: 405, 
      bounced: 18,
      unsubscribed: 12,
      revenue: 18750,
      cost: 300,
      status: 'completed', 
      createdAt: '2024-11-25',
      sentAt: '2024-11-25 09:00',
      audience: 'VIP Customers',
      type: 'promotional'
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || campaign.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Calculate overall stats
  const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0);
  const totalOpened = campaigns.reduce((sum, c) => sum + c.opened, 0);
  const totalClicked = campaigns.reduce((sum, c) => sum + c.clicked, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalCost = campaigns.reduce((sum, c) => sum + c.cost, 0);
  const totalROI = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost * 100) : 0;
  const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent * 100) : 0;
  const avgClickRate = totalSent > 0 ? (totalClicked / totalSent * 100) : 0;

  const calculateROI = (campaign: Campaign) => {
    if (campaign.cost === 0) return 0;
    return ((campaign.revenue - campaign.cost) / campaign.cost * 100);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sending': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDeleteCampaign = (campaign: Campaign) => {
    setDeletingCampaign(campaign);
    setShowDeleteModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent leading-tight pb-1">
                  Email Marketing Campaigns
                </h1>
                <p className="text-gray-600 mt-2 text-lg">Create, manage, and track your marketing campaigns</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowHelpModal(true)}
              className="px-5 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold flex items-center gap-2 cursor-pointer transition-all hover:scale-105 shadow-sm"
            >
              <HelpCircle className="w-5 h-5" />
              Help Guide
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer bg-gradient-to-r from-pink-600 to-orange-600"
            >
              <Plus className="w-5 h-5" />
              New Campaign
            </button>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="bg-gradient-to-br from-pink-500 via-orange-500 to-red-500 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold">Campaign Performance Overview</h2>
              <p className="text-white/90 mt-2 text-lg">Track your marketing success and ROI</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Award className="w-10 h-10" />
            </div>
          </div>
          <div className="grid grid-cols-6 gap-4">
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-5 border border-white/30 hover:bg-white/30 transition-all">
              <p className="text-white/90 text-sm mb-2 font-medium">Total Sent</p>
              <p className="text-3xl font-bold">{totalSent.toLocaleString()}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-5 border border-white/30 hover:bg-white/30 transition-all">
              <p className="text-white/90 text-sm mb-2 font-medium">Open Rate</p>
              <p className="text-3xl font-bold">{avgOpenRate.toFixed(1)}%</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-5 border border-white/30 hover:bg-white/30 transition-all">
              <p className="text-white/90 text-sm mb-2 font-medium">Click Rate</p>
              <p className="text-3xl font-bold">{avgClickRate.toFixed(1)}%</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-5 border border-white/30 hover:bg-white/30 transition-all">
              <p className="text-white/90 text-sm mb-2 font-medium">Revenue</p>
              <p className="text-3xl font-bold">£{(totalRevenue / 1000).toFixed(1)}k</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-5 border border-white/30 hover:bg-white/30 transition-all">
              <p className="text-white/90 text-sm mb-2 font-medium">Cost</p>
              <p className="text-3xl font-bold">£{(totalCost / 1000).toFixed(1)}k</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-5 border border-white/30 hover:bg-white/30 transition-all">
              <p className="text-white/90 text-sm mb-2 font-medium">ROI</p>
              <p className="text-3xl font-bold flex items-center gap-1">
                {totalROI > 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                {totalROI.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-12 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 cursor-pointer appearance-none bg-white shadow-sm font-medium"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sending">Sending</option>
              <option value="sent">Sent</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="grid gap-6">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] border border-gray-100 overflow-hidden">
              {/* Campaign Header */}
              <div className="bg-gradient-to-r from-pink-500 via-orange-500 to-red-500 p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                <div className="relative flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">{campaign.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-md ${
                            campaign.status === 'completed' ? 'bg-green-500 text-white' :
                            campaign.status === 'sent' ? 'bg-blue-500 text-white' :
                            campaign.status === 'sending' ? 'bg-purple-500 text-white' :
                            campaign.status === 'scheduled' ? 'bg-yellow-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {campaign.status.toUpperCase()}
                          </span>
                          <span className="px-3 py-1 text-xs font-semibold bg-white/30 text-white rounded-full backdrop-blur-sm">
                            {campaign.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-white/95 text-sm font-medium">{campaign.subject}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button 
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setShowDetailModal(true);
                      }}
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur-sm cursor-pointer shadow-md hover:scale-105"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5 text-white" />
                    </button>
                    <button 
                      onClick={() => {
                        setEditCampaign(campaign);
                        setShowEditModal(true);
                      }}
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur-sm cursor-pointer shadow-md hover:scale-105"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5 text-white" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDeleteCampaign(campaign)}
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur-sm cursor-pointer shadow-md hover:scale-105"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Campaign Body */}
              <div className="p-6">
                {campaign.status !== 'draft' && campaign.sent > 0 ? (
                  <>
                    {/* Key Metrics */}
                    <div className="grid grid-cols-5 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 text-center">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-md">
                          <Send className="w-7 h-7 text-white" />
                        </div>
                        <p className="text-3xl font-bold text-blue-700">{campaign.sent.toLocaleString()}</p>
                        <p className="text-xs text-blue-600 font-medium mt-1">Sent</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 text-center">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-3 shadow-md">
                          <Mail className="w-7 h-7 text-white" />
                        </div>
                        <p className="text-3xl font-bold text-green-700">{campaign.opened.toLocaleString()}</p>
                        <p className="text-xs text-green-600 font-medium mt-1">Opened ({((campaign.opened / campaign.sent) * 100).toFixed(1)}%)</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 text-center">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-md">
                          <MousePointer className="w-7 h-7 text-white" />
                        </div>
                        <p className="text-3xl font-bold text-purple-700">{campaign.clicked.toLocaleString()}</p>
                        <p className="text-xs text-purple-600 font-medium mt-1">Clicked ({((campaign.clicked / campaign.sent) * 100).toFixed(1)}%)</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 text-center">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-3 shadow-md">
                          <DollarSign className="w-7 h-7 text-white" />
                        </div>
                        <p className="text-3xl font-bold text-orange-700">£{campaign.revenue.toLocaleString()}</p>
                        <p className="text-xs text-orange-600 font-medium mt-1">Revenue</p>
                      </div>
                      <div className={`bg-gradient-to-br rounded-xl p-4 border text-center ${
                        calculateROI(campaign) > 0 
                          ? 'from-green-50 to-green-100 border-green-200' 
                          : 'from-red-50 to-red-100 border-red-200'
                      }`}>
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mx-auto mb-3 shadow-md ${
                          calculateROI(campaign) > 0 
                            ? 'from-green-500 to-green-600' 
                            : 'from-red-500 to-red-600'
                        }`}>
                          <Percent className="w-7 h-7 text-white" />
                        </div>
                        <p className={`text-3xl font-bold ${calculateROI(campaign) > 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {calculateROI(campaign).toFixed(0)}%
                        </p>
                        <p className={`text-xs font-medium mt-1 ${calculateROI(campaign) > 0 ? 'text-green-600' : 'text-red-600'}`}>ROI</p>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-gray-100">
                      <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-700">{campaign.audience}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-semibold text-purple-700">Sent: {campaign.sentAt}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
                        <Target className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-semibold text-orange-700">Cost: £{campaign.cost}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-700 font-bold text-lg">Campaign in Draft</p>
                    <p className="text-sm text-gray-500 mt-2">Complete and send to see performance metrics</p>
                    <button 
                      onClick={() => {
                        setEditCampaign(campaign);
                        setShowEditModal(true);
                      }}
                      className="mt-6 px-6 py-3 bg-gradient-to-r from-pink-600 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105 cursor-pointer font-semibold"
                    >
                      Continue Editing
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Campaign Modal */}
      {showEditModal && editCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary-500 to-accent-500">
              <h2 className="text-xl font-bold text-white">Edit Campaign</h2>
              <button onClick={() => {
                setShowEditModal(false);
                setEditCampaign(null);
              }} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                <input
                  type="text"
                  value={editCampaign.name}
                  onChange={(e) => setEditCampaign({...editCampaign, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject</label>
                <input
                  type="text"
                  value={editCampaign.subject}
                  onChange={(e) => setEditCampaign({...editCampaign, subject: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Type</label>
                  <select 
                    value={editCampaign.type}
                    onChange={(e) => setEditCampaign({...editCampaign, type: e.target.value as any})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="promotional">Promotional</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="announcement">Announcement</option>
                    <option value="transactional">Transactional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                  <select 
                    value={editCampaign.audience}
                    onChange={(e) => setEditCampaign({...editCampaign, audience: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="All Subscribers">All Subscribers</option>
                    <option value="Active Users">Active Users</option>
                    <option value="VIP Customers">VIP Customers</option>
                    <option value="Inactive Users">Inactive Users</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select 
                  value={editCampaign.status}
                  onChange={(e) => setEditCampaign({...editCampaign, status: e.target.value as any})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="sending">Sending</option>
                  <option value="sent">Sent</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Content Preview</label>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[200px]">
                  <div className="bg-white rounded p-4 shadow-sm">
                    <h3 className="font-bold text-lg mb-2">{editCampaign.subject}</h3>
                    <p className="text-gray-600 text-sm">
                      This is where your email content will appear. Use the full editor to design your campaign with images, buttons, and formatted text.
                    </p>
                    <button className="mt-4 px-4 py-2 bg-primary-500 text-white rounded cursor-pointer" style={{ backgroundColor: '#fc6813' }}>
                      Call to Action
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Click "Open Full Editor" to design your email</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Ready to Send?</h4>
                    <p className="text-sm text-blue-800">Make sure to preview your email on different devices before sending to your audience.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditCampaign(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    alert('Opening full email editor...\n\nIn production, this would open a drag-and-drop email builder with:\n- Pre-designed templates\n- Image uploads\n- Text formatting\n- Button customization\n- Mobile preview');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium cursor-pointer"
                >
                  Open Full Editor
                </button>
                <button 
                  onClick={() => {
                    setCampaigns(campaigns.map(c => c.id === editCampaign.id ? editCampaign : c));
                    setShowEditModal(false);
                    setEditCampaign(null);
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

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary-500 to-accent-500">
              <h2 className="text-xl font-bold text-white">Create New Campaign</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Summer Sale 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 🎉 50% Off Everything - Limited Time!"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Type</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                    <option value="promotional">Promotional</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="announcement">Announcement</option>
                    <option value="transactional">Transactional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                    <option value="all">All Subscribers</option>
                    <option value="active">Active Users</option>
                    <option value="vip">VIP Customers</option>
                    <option value="inactive">Inactive Users</option>
                  </select>
                </div>
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Content</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 h-32"
                  placeholder="Write your email content here..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Campaign Tips</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Use emojis in subject lines to increase open rates</li>
                      <li>• Keep subject lines under 50 characters</li>
                      <li>• Include a clear call-to-action</li>
                      <li>• Test on mobile devices before sending</li>
                    </ul>
                  </div>
                </div>
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
                    alert('Campaign created successfully!\n\nIn production, this would:\n- Save the campaign as draft\n- Open the email editor\n- Allow you to design and send');
                    setShowCreateModal(false);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium cursor-pointer" 
                  style={{ backgroundColor: '#fc6813' }}
                >
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Guide Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary-500 to-accent-500">
              <h2 className="text-xl font-bold text-white">Campaign Success Guide</h2>
              <button onClick={() => setShowHelpModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Welcome to Email Marketing!</h3>
                    <p className="text-sm text-blue-800">Follow these best practices to maximize your campaign success and ROI.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary-600" />
                  1. Define Your Goals
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 ml-7">
                  <li>• Set clear objectives (sales, engagement, awareness)</li>
                  <li>• Define target audience segments</li>
                  <li>• Establish success metrics (open rate, click rate, ROI)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary-600" />
                  2. Craft Compelling Content
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 ml-7">
                  <li>• Write attention-grabbing subject lines (keep under 50 characters)</li>
                  <li>• Personalize content with recipient names and preferences</li>
                  <li>• Include clear call-to-action buttons</li>
                  <li>• Use responsive design for mobile devices</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary-600" />
                  3. Optimize Send Times
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 ml-7">
                  <li>• Best days: Tuesday-Thursday</li>
                  <li>• Best times: 10 AM - 2 PM local time</li>
                  <li>• Test different times for your audience</li>
                  <li>• Avoid weekends and holidays</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                  4. Track & Improve
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 ml-7">
                  <li>• Monitor open rates (aim for 20-30%)</li>
                  <li>• Track click-through rates (aim for 2-5%)</li>
                  <li>• Calculate ROI: (Revenue - Cost) / Cost × 100</li>
                  <li>• A/B test subject lines and content</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Pro Tips for Success</h3>
                <ul className="space-y-1 text-sm text-green-800">
                  <li>✓ Segment your audience for better targeting</li>
                  <li>✓ Clean your email list regularly</li>
                  <li>✓ Provide value in every email</li>
                  <li>✓ Make unsubscribe easy (builds trust)</li>
                  <li>✓ Follow email marketing laws (GDPR, CAN-SPAM)</li>
                </ul>
              </div>

              <button 
                onClick={() => setShowHelpModal(false)}
                className="w-full px-4 py-2 rounded-lg text-white font-medium cursor-pointer" 
                style={{ backgroundColor: '#fc6813' }}
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Detail Modal */}
      {showDetailModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary-500 to-accent-500">
              <h2 className="text-xl font-bold text-white">Campaign Analytics</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedCampaign.name}</h3>
                <p className="text-gray-600 mt-1">{selectedCampaign.subject}</p>
              </div>

              {selectedCampaign.sent > 0 && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-blue-600 mb-1">Total Sent</p>
                      <p className="text-3xl font-bold text-blue-700">{selectedCampaign.sent.toLocaleString()}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                      <p className="text-sm text-green-600 mb-1">Open Rate</p>
                      <p className="text-3xl font-bold text-green-700">
                        {((selectedCampaign.opened / selectedCampaign.sent) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <p className="text-sm text-purple-600 mb-1">Click Rate</p>
                      <p className="text-3xl font-bold text-purple-700">
                        {((selectedCampaign.clicked / selectedCampaign.sent) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
                    <h4 className="font-semibold text-orange-900 mb-4">ROI Analysis</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-orange-600 mb-1">Revenue</p>
                        <p className="text-2xl font-bold text-orange-700">£{selectedCampaign.revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-orange-600 mb-1">Cost</p>
                        <p className="text-2xl font-bold text-orange-700">£{selectedCampaign.cost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-orange-600 mb-1">Profit</p>
                        <p className="text-2xl font-bold text-orange-700">
                          £{(selectedCampaign.revenue - selectedCampaign.cost).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-orange-600 mb-1">ROI</p>
                        <p className="text-2xl font-bold text-orange-700">
                          {calculateROI(selectedCampaign).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Bounced</p>
                      <p className="font-medium text-gray-900">{selectedCampaign.bounced} ({((selectedCampaign.bounced / selectedCampaign.sent) * 100).toFixed(2)}%)</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Unsubscribed</p>
                      <p className="font-medium text-gray-900">{selectedCampaign.unsubscribed} ({((selectedCampaign.unsubscribed / selectedCampaign.sent) * 100).toFixed(2)}%)</p>
                    </div>
                  </div>
                </>
              )}

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
      {deletingCampaign && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingCampaign(null);
          }}
          onConfirm={() => {
            setCampaigns(campaigns.filter(c => c.id !== deletingCampaign.id));
            alert('✓ Campaign deleted successfully!');
          }}
          title="Delete Campaign"
          itemName={deletingCampaign.name}
          itemDetails={`${deletingCampaign.sent} sent - ${deletingCampaign.status}`}
          warningMessage="This will permanently remove this campaign and all its analytics data."
        />
      )}
    </div>
  );
}
