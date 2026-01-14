"use client";

import React, { useState } from 'react';
import { Plus, TrendingUp, Eye, Send, Users, MousePointer, DollarSign, BarChart3, Calendar, Target, Zap, HelpCircle, X, Edit, Trash2, Filter, Search, Clock, Percent } from 'lucide-react';
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
  content?: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    { 
      id: '1', 
      name: 'Holiday Sale 2024', 
      subject: '🎄 50% Off Everything - Limited Time!',
      sent: 1250, opened: 875, clicked: 234, bounced: 15, unsubscribed: 8, revenue: 12500, cost: 250,
      status: 'completed', createdAt: '2024-12-01', sentAt: '2024-12-01 10:00',
      audience: 'All Subscribers', type: 'promotional'
    },
    { 
      id: '2', 
      name: 'Product Launch - New Features', 
      subject: '🚀 Introducing Our Latest Innovation',
      sent: 980, opened: 654, clicked: 189, bounced: 12, unsubscribed: 5, revenue: 8900, cost: 180,
      status: 'completed', createdAt: '2024-11-28', sentAt: '2024-11-28 14:00',
      audience: 'Active Users', type: 'announcement'
    },
    { 
      id: '3', 
      name: 'December Newsletter', 
      subject: '📰 Your Monthly Update',
      sent: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, revenue: 0, cost: 150,
      status: 'draft', createdAt: '2024-12-05', audience: 'All Subscribers', type: 'newsletter'
    },
    { 
      id: '4', 
      name: 'Flash Sale - 24 Hours', 
      subject: '⚡ Flash Sale Ends Tonight!',
      sent: 1500, opened: 1125, clicked: 405, bounced: 18, unsubscribed: 12, revenue: 18750, cost: 300,
      status: 'completed', createdAt: '2024-11-25', sentAt: '2024-11-25 09:00',
      audience: 'VIP Customers', type: 'promotional'
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
  const [newCampaign, setNewCampaign] = useState<{ name: string; subject: string; type: Campaign['type']; audience: string; content: string }>({ name: '', subject: '', type: 'promotional', audience: 'All Subscribers', content: '' });

  const filteredCampaigns = campaigns.filter(c => 
    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     c.subject.toLowerCase().includes(searchTerm.toLowerCase())) && 
    (filterStatus === 'all' || c.status === filterStatus)
  );

  const stats = {
    totalSent: campaigns.reduce((sum, c) => sum + c.sent, 0),
    avgOpen: campaigns.filter(c => c.sent > 0).length ? (campaigns.reduce((sum, c) => sum + (c.sent > 0 ? (c.opened / c.sent) : 0), 0) / campaigns.filter(c => c.sent > 0).length * 100).toFixed(1) : "0.0",
    totalRev: campaigns.reduce((sum, c) => sum + c.revenue, 0),
    roi: "342%"
  };

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'completed': return { color: 'text-emerald-600', bg: 'bg-emerald-500', label: 'Completed' };
      case 'draft': return { color: 'text-gray-600', bg: 'bg-gray-500', label: 'Draft' };
      case 'scheduled': return { color: 'text-amber-600', bg: 'bg-amber-500', label: 'Scheduled' };
      case 'sending': return { color: 'text-purple-600', bg: 'bg-purple-500', label: 'Sending' };
      default: return { color: 'text-blue-600', bg: 'bg-blue-500', label: status };
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F8FAFC]">
      {/* Mesh Background */}
      <div className="fixed inset-0 z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-300 rounded-full blur-[120px] mix-blend-multiply transition-transform duration-[10s] animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-orange-300 rounded-full blur-[120px] mix-blend-multiply transition-transform duration-[10s] animate-pulse delay-700" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-red-200 rounded-full blur-[100px] mix-blend-multiply transition-transform duration-[10s] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 p-8 max-w-[1600px] mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
              Campaigns
              <span className="text-base font-bold text-pink-600 bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100 uppercase tracking-widest shadow-sm">Active</span>
            </h1>
            <p className="text-gray-500 font-medium text-xl max-w-2xl leading-relaxed">
              Orchestrate high-impact marketing strategies with precision analytics.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setShowHelpModal(true)} className="p-4 bg-white/80 backdrop-blur-xl border border-white hover:bg-white rounded-2xl transition-all shadow-sm group cursor-pointer">
              <HelpCircle className="w-6 h-6 text-gray-400 group-hover:text-gray-900" />
            </button>
            <button onClick={() => setShowCreateModal(true)} className="px-8 py-5 bg-gray-900 text-white rounded-[2rem] font-black flex items-center gap-4 shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95 cursor-pointer text-lg">
              Launch Campaign <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Global Stats bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { l: 'Total Reach', v: stats.totalSent.toLocaleString(), i: Users, c: 'pink' },
            { l: 'Avg Open Rate', v: stats.avgOpen + '%', i: Eye, c: 'orange' },
            { l: 'Total Revenue', v: '£'+(stats.totalRev/1000).toFixed(1)+'k', i: DollarSign, c: 'emerald' },
            { l: 'Overall ROI', v: stats.roi, i: TrendingUp, c: 'indigo' }
          ].map((s, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white shadow-xl hover:shadow-2xl transition-all group flex items-center gap-6">
              <div className={`w-16 h-16 rounded-3xl bg-${s.c}-500/10 flex items-center justify-center border border-${s.c}-100 group-hover:scale-110 transition-transform`}>
                <s.i className={`w-8 h-8 text-${s.c}-600`} />
              </div>
              <div>
                <span className="text-4xl font-black text-gray-900 block">{s.v}</span>
                <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em]">{s.l}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-white/40 backdrop-blur-3xl p-3 rounded-[2rem] border border-white/60 shadow-inner flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-pink-600 transition-colors" />
            <input type="text" placeholder="Explore campaigns..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-16 pr-6 py-5 bg-white/50 border border-transparent focus:border-pink-200 rounded-2xl outline-none font-bold text-gray-900 text-lg transition-all" />
          </div>
          <div className="flex gap-3">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-8 py-5 bg-white/50 border border-white rounded-2xl outline-none font-bold text-gray-700 cursor-pointer appearance-none min-w-[180px] hover:bg-white transition-all"><option value="all">Every State</option><option value="draft">Drafts</option><option value="completed">Completed</option></select>
            <button className="px-8 py-5 bg-white/50 border border-white rounded-2xl font-bold text-gray-700 hover:bg-white transition-all cursor-pointer flex items-center gap-2"><Filter className="w-5 h-5" /> More</button>
          </div>
        </div>

        {/* Campaign cards */}
        <div className="grid gap-8">
          {filteredCampaigns.map((c, idx) => {
            const sc = getStatusConfig(c.status);
            return (
              <div key={c.id} className="group relative bg-white/80 backdrop-blur-2xl rounded-[3rem] p-8 border border-white shadow-xl hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] transition-all overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${sc.bg}`} />
                <div className="flex flex-col xl:flex-row items-start xl:items-center gap-10">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${sc.bg} bg-opacity-10 ${sc.color}`}>{sc.label}</span>
                      <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">{c.type}</span>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 group-hover:text-pink-600 transition-colors">{c.name}</h2>
                    <p className="text-gray-500 font-bold text-lg italic leading-relaxed">{"\""}{c.subject}{"\""}</p>
                    <div className="flex items-center gap-6 pt-2">
                       <div className="flex items-center gap-2 text-sm font-bold text-gray-400"><Users className="w-4 h-4" /> {c.audience}</div>
                       {c.sentAt && <div className="flex items-center gap-2 text-sm font-bold text-gray-400"><Calendar className="w-4 h-4" /> Launched on {c.sentAt}</div>}
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full xl:w-auto">
                    {[
                      { l: 'Sent', v: c.sent.toLocaleString(), i: Send, color: 'blue' },
                      { l: 'Opened', v: (c.sent > 0 ? (c.opened/c.sent*100).toFixed(0) : 0)+'%', i: Eye, color: 'emerald' },
                      { l: 'Clicks', v: (c.sent > 0 ? (c.clicked/c.sent*100).toFixed(0) : 0)+'%', i: MousePointer, color: 'purple' },
                      { l: 'ROI', v: (c.cost > 0 ? ((c.revenue - c.cost)/c.cost*100).toFixed(0) : 0)+'%', i: Percent, color: 'orange' }
                    ].map((m, j) => (
                      <div key={j} className="bg-gray-50/50 rounded-3xl p-5 border border-gray-100/50 text-center hover:bg-white transition-all shadow-sm">
                        <m.i className={`w-5 h-5 mx-auto mb-2 text-${m.color}-500`} />
                        <span className="text-2xl font-black text-gray-900 block tracking-tight">{m.v}</span>
                        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-0.5">{m.l}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 w-full xl:w-auto xl:justify-end xl:border-l xl:border-gray-100 xl:pl-10">
                    <button onClick={() => { setSelectedCampaign(c); setShowDetailModal(true); }} className="p-4 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all cursor-pointer"><Eye className="w-6 h-6" /></button>
                    <button onClick={() => { setEditCampaign(c); setShowEditModal(true); }} className="p-4 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-white rounded-2xl transition-all cursor-pointer border border-transparent hover:border-gray-200"><Edit className="w-6 h-6" /></button>
                    <button onClick={() => { setDeletingCampaign(c); setShowDeleteModal(true); }} className="p-4 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all cursor-pointer"><Trash2 className="w-6 h-6" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODALS implementation matches helpdesk and booking premium style */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] max-w-3xl w-full shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between">
              <div><h2 className="text-3xl font-black text-gray-900 tracking-tight">New Strategy</h2><p className="text-gray-500 font-bold text-lg">Define your marketing mission objectives.</p></div>
              <button onClick={() => setShowCreateModal(false)} className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-2xl transition-all cursor-pointer"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-10 space-y-8 overflow-y-auto">
              <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Campaign Title</label><input type="text" value={newCampaign.name} onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-pink-100 rounded-2xl outline-none font-black text-xl text-gray-900 transition-all" placeholder="e.g. Q4 Growth Mission" /></div>
              <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Subject Line</label><input type="text" value={newCampaign.subject} onChange={(e) => setNewCampaign({...newCampaign, subject: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-pink-100 rounded-2xl outline-none font-black text-gray-900 transition-all" placeholder="Attention grabbing text..." /></div>
               <div className="grid grid-cols-2 gap-8"><div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Strategy Type</label><select value={newCampaign.type} onChange={(e) => setNewCampaign({...newCampaign, type: e.target.value as Campaign['type']})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none font-bold text-gray-900"><option value="promotional">Promotional</option><option value="newsletter">Weekly Digest</option><option value="announcement">Global Alert</option></select></div><div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Launch Audience</label><select value={newCampaign.audience} onChange={(e) => setNewCampaign({...newCampaign, audience: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none font-bold text-gray-900"><option value="All Subscribers">All Units</option><option value="VIP Customers">High Value Assets</option></select></div></div>
               <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Brief Content</label><textarea value={newCampaign.content} onChange={(e) => setNewCampaign({...newCampaign, content: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-pink-100 rounded-2xl outline-none font-bold text-gray-900 h-32 resize-none" placeholder="Enter mission context..." /></div>
            </div>
            <div className="p-8 border-t border-gray-100 flex gap-4 bg-gray-50/50 rounded-b-[3rem]">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 px-8 py-5 rounded-2xl font-black text-gray-500 hover:bg-white transition-all cursor-pointer">Abort</button>
              <button onClick={() => { setCampaigns([...campaigns, { ...newCampaign, id: Math.random().toString(36).substr(2, 9), sent: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, revenue: 0, cost: 200, status: 'draft', createdAt: new Date().toISOString().split('T')[0] } as Campaign]); setShowCreateModal(false); }} className="flex-[2] px-8 py-5 bg-gray-900 text-white rounded-[2rem] font-black shadow-xl hover:bg-black transition-all cursor-pointer">Initialize Campaign</button>
            </div>
          </div>
        </div>
      )}

      {showHelpModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-[3rem] max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
             <div className="bg-gray-900 p-10 flex justify-between items-center text-white">
               <div><h2 className="text-3xl font-black tracking-tighter">Campaign Mastery</h2><p className="text-gray-400 font-bold">Optimizing for maximum conversion.</p></div>
               <button onClick={() => setShowHelpModal(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all cursor-pointer"><X className="w-6 h-6" /></button>
             </div>
             <div className="p-10 overflow-y-auto space-y-12">
               <div className="grid md:grid-cols-2 gap-10">
                 {[
                   { t: 'Strategic Timing', d: 'Launch missions between 10am-2pm for primary engagement blocks. Tuesday and Thursday remain king.', i: Clock, c: 'blue' },
                   { t: 'High-Impact Subjects', d: 'Keep intelligence headers under 50 characters. Use emojis to bypass visual fatigue.', i: Zap, c: 'yellow' },
                   { t: 'Revenue Tracking', d: 'Every link within your content is monitored for fiscal contributions to ROI.', i: DollarSign, c: 'emerald' },
                   { t: 'Audience Precision', d: 'segmenting units based on historical behavior yields 3x conversion delta.', i: Target, c: 'rose' }
                 ].map((h, i) => (
                   <div key={i} className="flex gap-6">
                     <div className={`w-14 h-14 shrink-0 rounded-2xl bg-${h.c}-50 flex items-center justify-center border border-${h.c}-100`}><h.i className={`w-7 h-7 text-${h.c}-600`} /></div>
                     <div><h4 className="text-xl font-black text-gray-900 mb-2">{h.t}</h4><p className="text-gray-500 font-medium leading-relaxed">{h.d}</p></div>
                   </div>
                 ))}
               </div>
               <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 flex items-start gap-6">
                 <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0"><BarChart3 className="w-6 h-6 text-white" /></div>
                 <div><h4 className="text-indigo-900 font-black text-xl mb-1">Growth Forecast</h4><p className="text-indigo-700 font-medium">Platform algorithms detect a 24% uplift in engagement when personalized directives are active in campaign headers.</p></div>
               </div>
             </div>
             <div className="p-6 text-center border-t border-gray-100 bg-gray-50"><button onClick={() => setShowHelpModal(false)} className="font-black text-gray-400 hover:text-gray-900 transition-colors cursor-pointer">Exit Briefing</button></div>
           </div>
        </div>
      )}

      {showDetailModal && selectedCampaign && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
             <div className="p-10 border-b border-gray-100 flex justify-between items-start">
               <div><span className="text-xs font-black text-pink-600 mb-2 block uppercase tracking-widest">Intelligence Report</span><h2 className="text-4xl font-black text-gray-900 tracking-tighter">{selectedCampaign.name}</h2></div>
               <button onClick={() => setShowDetailModal(false)} className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all cursor-pointer"><X className="w-6 h-6" /></button>
             </div>
             <div className="p-10 overflow-y-auto space-y-10">
               <div className="grid grid-cols-2 gap-6 pb-10 border-b border-gray-100">
                  <div className="p-6 bg-gray-50 rounded-3xl"><p className="text-xs font-black text-gray-400 uppercase mb-2">Total Conversion</p><p className="text-3xl font-black text-gray-900">£{selectedCampaign.revenue.toLocaleString()}</p></div>
                  <div className="p-6 bg-gray-50 rounded-3xl"><p className="text-xs font-black text-gray-400 uppercase mb-2">Mission ROI</p><p className="text-3xl font-black text-emerald-600">{((selectedCampaign.revenue - selectedCampaign.cost)/selectedCampaign.cost*100).toFixed(0)}%</p></div>
               </div>
               <div className="space-y-6">
                 <h4 className="text-xl font-black text-gray-900">Campaign Logistics</h4>
                 <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                   <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p><p className="font-black text-gray-700">{selectedCampaign.status}</p></div>
                   <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cost Factor</p><p className="font-black text-gray-700">£{selectedCampaign.cost}</p></div>
                   <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Target</p><p className="font-black text-gray-700">{selectedCampaign.audience}</p></div>
                   <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Deliveries</p><p className="font-black text-gray-700">{selectedCampaign.sent.toLocaleString()}</p></div>
                 </div>
               </div>
               <div className="p-6 bg-gray-900 rounded-[2rem] text-white">
                 <div className="flex items-center gap-4 mb-4"><div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Send className="w-5 h-5" /></div><span className="font-black text-lg">Send Intelligence</span></div>
                 <p className="text-gray-400 font-bold text-sm mb-6">Dispatch this report to the board or download as PDF for archival purposes.</p>
                 <div className="flex gap-3"><button className="flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black transition-all cursor-pointer">Download CSV</button><button className="flex-1 py-4 bg-white text-gray-900 rounded-2xl font-black hover:bg-pink-50 transition-all cursor-pointer">Export PDF</button></div>
               </div>
             </div>
          </div>
        </div>
      )}

      {showEditModal && editCampaign && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] max-w-3xl w-full shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between">
              <div><h2 className="text-3xl font-black text-gray-900 tracking-tight">Edit Strategy</h2><p className="text-gray-500 font-bold text-lg">Adjust your marketing mission parameters.</p></div>
              <button onClick={() => { setShowEditModal(false); setEditCampaign(null); }} className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-2xl transition-all cursor-pointer"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-10 space-y-8 overflow-y-auto">
              <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Campaign Title</label><input type="text" value={editCampaign.name} onChange={(e) => setEditCampaign({...editCampaign, name: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-pink-100 rounded-2xl outline-none font-black text-xl text-gray-900 transition-all" /></div>
              <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Subject Line</label><input type="text" value={editCampaign.subject} onChange={(e) => setEditCampaign({...editCampaign, subject: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-pink-100 rounded-2xl outline-none font-black text-gray-900 transition-all" /></div>
               <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Strategy Type</label><select value={editCampaign.type} onChange={(e) => setEditCampaign({...editCampaign, type: e.target.value as Campaign['type']})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none font-bold text-gray-900"><option value="promotional">Promotional</option><option value="newsletter">Weekly Digest</option><option value="announcement">Global Alert</option></select></div>
                <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Status</label><select value={editCampaign.status} onChange={(e) => setEditCampaign({...editCampaign, status: e.target.value as Campaign['status']})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none font-bold text-gray-900"><option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="sending">Sending</option><option value="completed">Completed</option></select></div>
               </div>
            </div>
            <div className="p-8 border-t border-gray-100 flex gap-4 bg-gray-50/50 rounded-b-[3rem]">
              <button onClick={() => { setShowEditModal(false); setEditCampaign(null); }} className="flex-1 px-8 py-5 rounded-2xl font-black text-gray-500 hover:bg-white transition-all cursor-pointer">Cancel</button>
              <button onClick={() => { setCampaigns(campaigns.map(c => c.id === editCampaign.id ? editCampaign : c)); setShowEditModal(false); setEditCampaign(null); }} className="flex-[2] px-8 py-5 bg-gray-900 text-white rounded-[2rem] font-black shadow-xl hover:bg-black transition-all cursor-pointer">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && deletingCampaign && (
        <DeleteConfirmationModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeletingCampaign(null); }} onConfirm={() => { setCampaigns(campaigns.filter(c => c.id !== deletingCampaign!.id)); setShowDeleteModal(false); }} title="Abort Mission" itemName={deletingCampaign.name} itemDetails={`Launched ${deletingCampaign.sentAt || deletingCampaign.createdAt}`} warningMessage="All intelligence data associated with this campaign will be purged." />
      )}
    </div>
  );
}
