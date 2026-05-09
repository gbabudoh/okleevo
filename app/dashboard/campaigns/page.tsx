'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Mail, 
  TrendingUp, 
  Users, 
  MousePointer2, 
  BarChart3, 
  Calendar, 
  MoreHorizontal, 
  Search,
  LayoutGrid,
  List,
  ChevronRight,
  Sparkles,
  Rocket,
  Clock,
  Loader2
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  type: string;
  status: string;
  audience: string;
  sent: number;
  opened: number;
  clicked: number;
  revenue: number;
  createdAt: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    type: 'PROMOTIONAL',
    audience: 'All Subscribers',
    content: ''
  });

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCampaigns(data);
      }
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampaign),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewCampaign({ name: '', subject: '', type: 'PROMOTIONAL', audience: 'All Subscribers', content: '' });
        fetchCampaigns();
      }
    } catch (err) {
      console.error('Failed to create campaign:', err);
    } finally {
      setCreating(false);
    }
  };

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.audience.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSent = campaigns.reduce((acc, c) => acc + c.sent, 0);
  const totalRevenue = campaigns.reduce((acc, c) => acc + c.revenue, 0);
  const activeCount = campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length;
  const avgEngagement = campaigns.length > 0 ? (campaigns.reduce((acc, c) => acc + (c.sent > 0 ? (c.opened / c.sent) : 0), 0) / campaigns.length) * 100 : 0;

  const stats = [
    { label: 'Active Campaigns', value: activeCount.toString(), icon: Rocket, color: 'from-blue-500 to-indigo-600', trend: 'Live now' },
    { label: 'Total Reach', value: (totalSent / 1000).toFixed(1) + 'k', icon: Users, color: 'from-emerald-500 to-teal-600', trend: 'Across all time' },
    { label: 'Avg. Engagement', value: avgEngagement.toFixed(1) + '%', icon: MousePointer2, color: 'from-amber-500 to-orange-600', trend: 'Open rate' },
    { label: 'Campaign Revenue', value: '£' + (totalRevenue / 1000).toFixed(1) + 'k', icon: TrendingUp, color: 'from-rose-500 to-pink-600', trend: 'Attributed' },
  ];

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': case 'sent': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'sending': return 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse';
      case 'scheduled': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="relative min-h-screen pb-20 overflow-hidden bg-gray-50/30">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/10 blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 space-y-8 p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-500">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Campaign Manager</h1>
                <p className="text-gray-500 font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  Orchestrate high-impact communication strategies
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 cursor-pointer group hover:-translate-y-1"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Create New Campaign
            </button>
          </div>
        </div>

        {/* Stats Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  {stat.trend}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 opacity-80">{stat.label}</p>
                <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search campaigns, subjects, or audience..."
              className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
            <button className="px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-sm text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all cursor-pointer shadow-sm">
              Filters
            </button>
          </div>
        </div>

        {/* Campaigns View */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xl font-black text-gray-900 animate-pulse">Syncing Campaign Engine...</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCampaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/50 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group relative overflow-hidden flex flex-col h-full">
                <div className="absolute top-0 right-0 p-4">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(campaign.status)}`}>
                    {campaign.status}
                  </div>
                </div>

                <div className="mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${
                    campaign.type.toUpperCase() === 'PROMOTIONAL' ? 'from-orange-500 to-rose-600' : 
                    campaign.type.toUpperCase() === 'NEWSLETTER' ? 'from-blue-500 to-indigo-600' : 
                    'from-emerald-500 to-teal-600'
                  } flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500`}>
                    {campaign.type.toUpperCase() === 'PROMOTIONAL' ? <Rocket className="w-7 h-7" /> : 
                     campaign.type.toUpperCase() === 'NEWSLETTER' ? <Mail className="w-7 h-7" /> : 
                     <Calendar className="w-7 h-7" />}
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{campaign.name}</h3>
                  <p className="text-sm font-bold text-gray-400 line-clamp-1 italic">&quot;{campaign.subject}&quot;</p>
                </div>

                <div className="space-y-6 flex-1">
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-black text-gray-500 uppercase tracking-tighter">Audience</span>
                    </div>
                    <span className="text-sm font-black text-gray-900">{campaign.audience}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-500/30 transition-colors">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Sent</p>
                      <p className="text-base font-black text-gray-900">{campaign.sent.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 hover:border-emerald-500/30 transition-colors">
                      <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">Open</p>
                      <p className="text-base font-black text-gray-900">{campaign.sent > 0 ? ((campaign.opened / campaign.sent) * 100).toFixed(0) : 0}%</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50/50 rounded-2xl border border-blue-100 hover:border-blue-500/30 transition-colors">
                      <p className="text-[9px] font-black text-blue-600 uppercase mb-1">Click</p>
                      <p className="text-base font-black text-gray-900">{campaign.sent > 0 ? ((campaign.clicked / campaign.sent) * 100).toFixed(0) : 0}%</p>
                    </div>
                  </div>

                  {campaign.status === 'sending' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase text-blue-600">
                        <span>Progress</span>
                        <span>{((campaign.sent / 1500) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full animate-pulse transition-all duration-500" 
                          style={{ width: `${(campaign.sent / 1500) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {campaign.revenue > 0 && (
                    <div className="p-4 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black uppercase opacity-80">Campaign Revenue</p>
                        <TrendingUp className="w-4 h-4 opacity-80" />
                      </div>
                      <p className="text-2xl font-black mt-1">£{campaign.revenue.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase">{campaign.createdAt}</span>
                  </div>
                  <button className="flex items-center gap-1 text-blue-600 font-black text-xs hover:gap-2 transition-all cursor-pointer group">
                    View Reports
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Campaign</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Audience</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Performance</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Revenue</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${
                          campaign.type.toUpperCase() === 'PROMOTIONAL' ? 'from-orange-500 to-rose-600' : 'from-blue-500 to-indigo-600'
                        } text-white shadow-lg`}>
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 leading-tight">{campaign.name}</p>
                          <p className="text-xs font-bold text-gray-400 uppercase">{campaign.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${getStatusStyle(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        {campaign.audience}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center justify-center gap-6">
                        <div className="text-center">
                          <p className="text-[10px] font-black text-emerald-600">{campaign.sent > 0 ? ((campaign.opened / campaign.sent) * 100).toFixed(0) : 0}%</p>
                          <p className="text-[8px] font-black text-gray-400 uppercase">Open</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-black text-blue-600">{campaign.sent > 0 ? ((campaign.clicked / campaign.sent) * 100).toFixed(0) : 0}%</p>
                          <p className="text-[8px] font-black text-gray-400 uppercase">Click</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <span className="text-sm font-black text-gray-900">£{campaign.revenue.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer text-gray-400 hover:text-blue-600">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Create Campaign Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowCreateModal(false)} />
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-300">
              <div className="p-8">
                <div className="flex items-center gap-6 mb-6">
                  <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
                    <Rocket className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">New Strategy</h2>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Configure your next campaign</p>
                  </div>
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Campaign Name</label>
                      <input 
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold text-gray-900"
                        placeholder="e.g. Summer Sale 2024"
                        value={newCampaign.name}
                        onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Campaign Type</label>
                      <select 
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold text-gray-900 appearance-none"
                        value={newCampaign.type}
                        onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value })}
                      >
                        <option value="PROMOTIONAL">PROMOTIONAL</option>
                        <option value="NEWSLETTER">NEWSLETTER</option>
                        <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
                        <option value="TRANSACTIONAL">TRANSACTIONAL</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Subject</label>
                    <input 
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold text-gray-900"
                      placeholder="Catchy subject line..."
                      value={newCampaign.subject}
                      onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Audience</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold text-gray-900"
                      placeholder="e.g. All Subscribers, VIPs..."
                      value={newCampaign.audience}
                      onChange={(e) => setNewCampaign({ ...newCampaign, audience: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Content (HTML or Plain Text)</label>
                    <textarea 
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-gray-900 min-h-[100px] resize-none"
                      placeholder="Hello [Name], ..."
                      value={newCampaign.content}
                      onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <button 
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={creating}
                      className="flex-[2] px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                    >
                      {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
                      Launch Campaign
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
