"use client";

import React, { useState, useEffect } from 'react';
import { 
  Globe, Plus, Search, Upload, Eye, Edit3,
  Trash2, Copy, BarChart3, Settings, Link, ExternalLink,
  Layout, 
  Zap, TrendingUp, Clock,
  CheckCircle, XCircle, AlertCircle, MoreVertical, 
  ShoppingCart, Calendar, 
  Grid, List, X, Sparkles, Target, Award,
  Rocket, MousePointer
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface MicroPage {
  id: string;
  title: string;
  slug: string;
  url: string;
  template: string;
  status: 'published' | 'draft' | 'archived';
  views: number;
  conversions: number;
  conversionRate: number;
  createdDate: Date;
  lastModified: Date;
  thumbnail?: string;
  description?: string;
  components: string[];
  seoTitle?: string;
  seoDescription?: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  gradient: string;
  components: string[];
  preview: string;
}

const templates: Template[] = [
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Perfect for announcing new products with hero section, features, and CTA',
    category: 'Marketing',
    icon: Rocket,
    gradient: 'from-blue-500 to-cyan-500',
    components: ['Hero', 'Features', 'CTA', 'Footer'],
    preview: '/previews/product-launch.jpg'
  },
  {
    id: 'event-landing',
    name: 'Event Landing',
    description: 'Promote events with countdown timer, schedule, and registration form',
    category: 'Events',
    icon: Calendar,
    gradient: 'from-purple-500 to-pink-500',
    components: ['Hero', 'Countdown', 'Schedule', 'Registration'],
    preview: '/previews/event.jpg'
  },
  {
    id: 'lead-capture',
    name: 'Lead Capture',
    description: 'High-converting landing page focused on collecting leads',
    category: 'Marketing',
    icon: Target,
    gradient: 'from-green-500 to-emerald-500',
    components: ['Hero', 'Benefits', 'Form', 'Testimonials'],
    preview: '/previews/lead-capture.jpg'
  },
  {
    id: 'portfolio',
    name: 'Portfolio Showcase',
    description: 'Display your work with elegant gallery and project details',
    category: 'Personal',
    icon: Award,
    gradient: 'from-orange-500 to-red-500',
    components: ['Hero', 'Gallery', 'About', 'Contact'],
    preview: '/previews/portfolio.jpg'
  },
  {
    id: 'coming-soon',
    name: 'Coming Soon',
    description: 'Build anticipation with countdown and email signup',
    category: 'Marketing',
    icon: Clock,
    gradient: 'from-indigo-500 to-purple-500',
    components: ['Hero', 'Countdown', 'Email Form'],
    preview: '/previews/coming-soon.jpg'
  },
  {
    id: 'pricing',
    name: 'Pricing Page',
    description: 'Clear pricing tiers with feature comparison',
    category: 'Sales',
    icon: ShoppingCart,
    gradient: 'from-pink-500 to-rose-500',
    components: ['Hero', 'Pricing Cards', 'FAQ', 'CTA'],
    preview: '/previews/pricing.jpg'
  }
];

const categories = [
  { id: 'all', name: 'All Templates', count: 6 },
  { id: 'marketing', name: 'Marketing', count: 3 },
  { id: 'events', name: 'Events', count: 1 },
  { id: 'sales', name: 'Sales', count: 1 },
  { id: 'personal', name: 'Personal', count: 1 },
];

export default function MicroPagesPage() {
  const [pages, setPages] = useState<MicroPage[]>([
    {
      id: '1',
      title: 'Product Launch 2024',
      slug: 'product-launch-2024',
      url: 'https://yourdomain.com/product-launch-2024',
      template: 'product-launch',
      status: 'published',
      views: 2847,
      conversions: 142,
      conversionRate: 4.99,
      createdDate: new Date('2024-11-15'),
      lastModified: new Date('2024-12-01'),
      description: 'Landing page for our new product launch campaign',
      components: ['Hero', 'Features', 'Pricing', 'CTA'],
      seoTitle: 'Revolutionary Product Launch 2024',
      seoDescription: 'Discover our latest innovation that will transform your workflow'
    },
    {
      id: '2',
      title: 'Annual Conference 2025',
      slug: 'conference-2025',
      url: 'https://yourdomain.com/conference-2025',
      template: 'event-landing',
      status: 'published',
      views: 1563,
      conversions: 89,
      conversionRate: 5.69,
      createdDate: new Date('2024-11-20'),
      lastModified: new Date('2024-11-28'),
      description: 'Event registration page for annual conference',
      components: ['Hero', 'Schedule', 'Speakers', 'Registration'],
      seoTitle: 'Annual Tech Conference 2025',
      seoDescription: 'Join industry leaders for three days of innovation and networking'
    },
    {
      id: '3',
      title: 'Free eBook Download',
      slug: 'free-ebook',
      url: 'https://yourdomain.com/free-ebook',
      template: 'lead-capture',
      status: 'published',
      views: 4521,
      conversions: 678,
      conversionRate: 15.0,
      createdDate: new Date('2024-10-10'),
      lastModified: new Date('2024-11-15'),
      description: 'Lead magnet page for eBook download',
      components: ['Hero', 'Benefits', 'Form', 'Social Proof'],
      seoTitle: 'Free eBook: Master Digital Marketing',
      seoDescription: 'Download our comprehensive guide to digital marketing success'
    },
    {
      id: '4',
      title: 'Portfolio - John Doe',
      slug: 'portfolio-john',
      url: 'https://yourdomain.com/portfolio-john',
      template: 'portfolio',
      status: 'draft',
      views: 0,
      conversions: 0,
      conversionRate: 0,
      createdDate: new Date('2024-12-03'),
      lastModified: new Date('2024-12-04'),
      description: 'Personal portfolio website',
      components: ['Hero', 'Projects', 'Skills', 'Contact'],
      seoTitle: 'John Doe - Creative Designer',
      seoDescription: 'View my portfolio of design work and creative projects'
    }
  ]);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPage, setEditingPage] = useState<MicroPage | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPage, setDeletingPage] = useState<MicroPage | null>(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyingPage, setCopyingPage] = useState<MicroPage | null>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsPage, setAnalyticsPage] = useState<MicroPage | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsPage, setSettingsPage] = useState<MicroPage | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  const showNotify = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         page.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || page.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category.toLowerCase() === selectedCategory);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'published':
        return { color: 'green', icon: CheckCircle, label: 'Published', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
      case 'draft':
        return { color: 'gray', icon: Edit3, label: 'Draft', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
      case 'archived':
        return { color: 'orange', icon: AlertCircle, label: 'Archived', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
      default:
        return { color: 'gray', icon: AlertCircle, label: 'Unknown', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const stats = {
    total: pages.length,
    published: pages.filter(p => p.status === 'published').length,
    totalViews: pages.reduce((acc, p) => acc + p.views, 0),
    avgConversion: pages.reduce((acc, p) => acc + p.conversionRate, 0) / pages.length,
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (activeDropdown) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] p-4 md:p-8 overflow-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px] animate-mesh" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[140px] animate-mesh-delayed" />
      </div>

      <div className="relative z-10 space-y-8 max-w-[1600px] mx-auto">
        {/* Header / Command Center */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border-2 border-white shadow-2xl flex flex-col items-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-6 relative z-10">
            <Globe className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Web Presence Hub</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight mb-4 relative z-10">
            Micro <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500">Pages</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl mb-10 leading-relaxed uppercase text-[10px] tracking-[0.1em] relative z-10">
            High-Performance Landing Page Builder & Management System
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <button
               className="px-8 py-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-blue-600 active:scale-95 transition-all duration-500 flex items-center gap-3 cursor-pointer shadow-xl shadow-gray-900/20"
            >
               <Upload className="w-4 h-4" />
               Import Page
            </button>
            <button
               onClick={() => setShowTemplates(true)}
               className="px-8 py-4 bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-blue-600 active:scale-95 transition-all duration-500 flex items-center gap-3 cursor-pointer shadow-xl shadow-blue-500/20"
            >
               <Plus className="w-4 h-4" />
               Create New
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
             { label: 'Total Pages', val: stats.total, sub: `${stats.published} Published`, icon: Globe, color: 'blue' },
             { label: 'Total Views', val: stats.totalViews.toLocaleString(), sub: 'All Time Traffic', icon: Eye, color: 'purple' },
             { label: 'Avg Conversion', val: `${stats.avgConversion.toFixed(1)}%`, sub: 'Success Rate', icon: Target, color: 'green' },
             { label: 'Templates', val: templates.length, sub: 'Available Design', icon: Layout, color: 'orange' },
          ].map((stat, idx) => (
             <div key={idx} className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 border-2 border-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
                <div className="flex items-center justify-between mb-4">
                   <div className={`p-4 bg-${stat.color}-500 rounded-2xl shadow-lg shadow-${stat.color}-500/20`}>
                      <stat.icon className="w-6 h-6 text-white" />
                   </div>
                   <TrendingUp className={`w-5 h-5 text-${stat.color}-500 opacity-50`} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.val}</p>
                <p className={`text-[9px] font-bold text-${stat.color}-600 mt-2 flex items-center gap-1`}>
                   <Zap className="w-3 h-3" />
                   {stat.sub}
                </p>
             </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-6">
           <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-blue-500/5 rounded-3xl blur-xl group-focus-within:bg-blue-500/10 transition-all opacity-0 group-focus-within:opacity-100" />
              <div className="relative flex items-center bg-white/60 backdrop-blur-xl border-2 border-white shadow-xl rounded-3xl p-2 pl-6 focus-within:border-blue-500/50 transition-all">
                 <Search className="w-5 h-5 text-gray-400" />
                 <input
                    type="text"
                    placeholder="Search pages by title or slug..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-3 bg-transparent text-sm font-bold text-gray-900 outline-none placeholder:text-gray-400"
                 />
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <select
                 value={selectedStatus}
                 onChange={(e) => setSelectedStatus(e.target.value)}
                 className="px-8 py-5 bg-white/60 backdrop-blur-xl border-2 border-white rounded-3xl shadow-xl outline-none text-[10px] font-black uppercase tracking-[0.2em] text-gray-700 cursor-pointer hover:border-blue-500/50 transition-all appearance-none"
                 style={{ backgroundImage: 'none' }}
              >
                 <option value="all">All Status</option>
                 <option value="published">Published</option>
                 <option value="draft">Draft</option>
                 <option value="archived">Archived</option>
              </select>
              
              <div className="flex items-center gap-1 bg-white/60 backdrop-blur-xl border-2 border-white shadow-xl rounded-2xl p-1.5">
                 <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}>
                    <Grid className="w-5 h-5" />
                 </button>
                 <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all cursor-pointer ${viewMode === 'list' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}>
                    <List className="w-5 h-5" />
                 </button>
              </div>
           </div>
        </div>

        {/* Pages Content */}
        {viewMode === 'grid' ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPages.map((page, idx) => {
                 const config = getStatusConfig(page.status);
                 const StatusIcon = config.icon;
                 
                 return (
                    <div
                       key={page.id}
                       onClick={() => { setEditingPage(page); setShowEditModal(true); }}
                       className="group relative bg-white/60 backdrop-blur-xl rounded-[3rem] border-2 border-white p-8 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 cursor-pointer animate-in fade-in zoom-in-95 fill-mode-both"
                       style={{ animationDelay: `${idx * 100}ms` }}
                    >
                       {/* Status Badge */}
                       <div className={`absolute top-6 right-6 flex items-center gap-2 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${config.bg} ${config.text} border ${config.border} shadow-sm z-10`}>
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                       </div>
                       
                       {/* Preview Window */}
                       <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-[2rem] mb-6 relative overflow-hidden group-hover:shadow-lg transition-all border-4 border-white">
                          <div className="absolute inset-0 flex items-center justify-center">
                             <Globe className="w-12 h-12 text-gray-300 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-500" />
                          </div>
                          {/* Mock Browser UI */}
                          <div className="absolute top-0 left-0 right-0 h-6 bg-white/80 backdrop-blur-sm border-b border-white px-4 flex items-center gap-1.5">
                             <div className="w-2 h-2 rounded-full bg-red-400" />
                             <div className="w-2 h-2 rounded-full bg-yellow-400" />
                             <div className="w-2 h-2 rounded-full bg-green-400" />
                          </div>
                       </div>
                       
                       <h3 className="text-lg font-black text-gray-900 tracking-tight leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {page.title}
                       </h3>
                       <div className="flex items-center gap-2 mb-6">
                           <Link className="w-3 h-3 text-gray-400" />
                           <p className="text-[10px] font-bold text-gray-400 truncate">{page.slug}</p>
                       </div>
                       
                       {/* Mini Stats */}
                       <div className="grid grid-cols-2 gap-3 mb-6">
                          <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
                             <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Views</p>
                             <p className="text-xl font-black text-blue-900">{page.views.toLocaleString()}</p>
                          </div>
                          <div className="bg-green-50/50 rounded-2xl p-4 border border-green-100">
                             <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-1">Conv.</p>
                             <p className="text-xl font-black text-green-900">{page.conversionRate.toFixed(1)}%</p>
                          </div>
                       </div>

                       {/* Actions */}
                       <div className="flex items-center gap-2">
                          <button 
                             onClick={(e) => { e.stopPropagation(); setEditingPage(page); setShowEditModal(true); }}
                             className="flex-1 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                             <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button 
                             onClick={(e) => { e.stopPropagation(); window.open(page.url, '_blank'); }}
                             className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all cursor-pointer shadow-lg shadow-blue-500/20"
                          >
                             <ExternalLink className="w-4 h-4" />
                          </button>
                          <button 
                             onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === page.id ? null : page.id); }}
                             className="p-3 bg-white border border-gray-100 text-gray-400 rounded-xl hover:bg-gray-50 transition-all cursor-pointer relative"
                          >
                             <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {activeDropdown === page.id && (
                            <div className="absolute right-8 bottom-20 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white p-2 z-50 flex flex-col gap-1 anime-in fade-in slide-in-from-bottom-2">
                               <button onClick={(e) => { e.stopPropagation(); setCopyingPage(page); setShowCopyModal(true); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 rounded-xl hover:bg-blue-50 text-[10px] font-bold text-gray-600 flex items-center gap-2">
                                  <Copy className="w-3 h-3" /> Copy URL
                               </button>
                               <button onClick={(e) => { e.stopPropagation(); setAnalyticsPage(page); setShowAnalyticsModal(true); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 rounded-xl hover:bg-purple-50 text-[10px] font-bold text-gray-600 flex items-center gap-2">
                                  <BarChart3 className="w-3 h-3" /> Analytics
                               </button>
                               <button onClick={(e) => { e.stopPropagation(); setSettingsPage(page); setShowSettingsModal(true); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 rounded-xl hover:bg-gray-50 text-[10px] font-bold text-gray-600 flex items-center gap-2">
                                  <Settings className="w-3 h-3" /> Settings
                               </button>
                               <div className="h-px bg-gray-100 my-1" />
                               <button onClick={(e) => { e.stopPropagation(); setDeletingPage(page); setShowDeleteModal(true); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 rounded-xl hover:bg-red-50 text-[10px] font-bold text-red-500 flex items-center gap-2">
                                  <Trash2 className="w-3 h-3" /> Delete
                               </button>
                            </div>
                          )}
                       </div>
                    </div>
                 );
              })}
           </div>
        ) : (
           <div className="bg-white/60 backdrop-blur-xl rounded-[3rem] border-2 border-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
              <table className="w-full">
                 <thead className="bg-gray-900">
                    <tr>
                       <th className="px-8 py-6 text-left text-[10px] font-black text-white uppercase tracking-[0.2em]">Page Information</th>
                       <th className="px-8 py-6 text-left text-[10px] font-black text-white uppercase tracking-[0.2em]">Performance</th>
                       <th className="px-8 py-6 text-left text-[10px] font-black text-white uppercase tracking-[0.2em]">Status</th>
                       <th className="px-8 py-6 text-right text-[10px] font-black text-white uppercase tracking-[0.2em]">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 bg-white/40">
                    {filteredPages.map(page => (
                       <tr key={page.id} className="group hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => { setEditingPage(page); setShowEditModal(true); }}>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                   <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                   <p className="font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">{page.title}</p>
                                   <p className="text-[10px] font-bold text-gray-400 mt-1 flex items-center gap-1">
                                      <Link className="w-3 h-3" /> /{page.slug}
                                   </p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-6">
                                <div>
                                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Views</p>
                                   <p className="font-bold text-gray-900">{page.views.toLocaleString()}</p>
                                </div>
                                <div>
                                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Conv.</p>
                                   <p className="font-bold text-green-600">{page.conversionRate.toFixed(1)}%</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${getStatusConfig(page.status).bg} ${getStatusConfig(page.status).text} border ${getStatusConfig(page.status).border}`}>
                                {page.status}
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <button onClick={(e) => { e.stopPropagation(); setEditingPage(page); setShowEditModal(true); }} className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors">
                                   <Edit3 className="w-4 h-4 text-gray-600" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); window.open(page.url, '_blank'); }} className="p-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
                                   <ExternalLink className="w-4 h-4 text-white" />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}
      </div>

      {/* Template Modal - Compact & Centered */}
      {showTemplates && (
         <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-300 border-4 border-white/20 relative">
               
               <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
                  <div>
                     <h2 className="text-2xl font-black text-gray-900 tracking-tight">Design <span className="text-blue-600">Library</span></h2>
                     <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">Select a framework</p>
                  </div>
                  <button onClick={() => setShowTemplates(false)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                     <X className="w-5 h-5 text-gray-500" />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/50">
                  {/* Categories */}
                  <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                     {categories.map((cat) => (
                        <button
                           key={cat.id}
                           onClick={() => setSelectedCategory(cat.id)}
                           className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${
                              selectedCategory === cat.id
                                 ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                 : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                           }`}
                        >
                           {cat.name}
                        </button>
                     ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {filteredTemplates.map((template) => {
                        const Icon = template.icon;
                        return (
                           <button
                              key={template.id}
                              onClick={() => {
                                 const newPage: MicroPage = {
                                    id: Math.random().toString(36).substr(2, 9),
                                    title: `${template.name} Draft`,
                                    slug: `${template.id}-${new Date().getTime()}`,
                                    url: `https://yourdomain.com/${template.id}-${new Date().getTime()}`,
                                    template: template.id,
                                    status: 'draft',
                                    views: 0,
                                    conversions: 0,
                                    conversionRate: 0,
                                    createdDate: new Date(),
                                    lastModified: new Date(),
                                    description: template.description,
                                    components: template.components,
                                    seoTitle: `New ${template.name} Page`,
                                    seoDescription: 'Enter your page description here...'
                                 };
                                 setPages([newPage, ...pages]);
                                 setEditingPage(newPage);
                                 setShowTemplates(false);
                                 setShowEditModal(true);
                                 showNotify('New Page Created from Template', 'success');
                              }}
                              className="group relative bg-white border border-gray-100 rounded-[2rem] p-5 hover:border-blue-200 hover:shadow-xl transition-all duration-300 text-left flex flex-col h-full active:scale-95"
                           >
                              <div className={`w-full aspect-[2/1] rounded-2xl bg-gradient-to-br ${template.gradient} mb-4 flex items-center justify-center relative overflow-hidden shadow-sm`}>
                                 <Icon className="w-10 h-10 text-white drop-shadow-md group-hover:scale-110 transition-transform duration-500" />
                              </div>
                              <div className="mt-auto">
                                 <h3 className="text-sm font-black text-gray-900 mb-1">{template.name}</h3>
                                 <p className="text-[10px] font-medium text-gray-500 mb-3 line-clamp-2 leading-relaxed">{template.description}</p>
                                 <div className="flex flex-wrap gap-1">
                                    {template.components.slice(0, 3).map((comp, i) => (
                                       <span key={i} className="px-2 py-0.5 rounded-md bg-gray-50 text-[8px] font-bold text-gray-400 uppercase tracking-wider border border-gray-100">
                                          {comp}
                                       </span>
                                    ))}
                                 </div>
                              </div>
                           </button>
                        );
                     })}
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Edit Modal - Command Center Style */}
      {showEditModal && editingPage && (
         <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in zoom-in-95 duration-300">
            <div className="bg-white border border-gray-100 rounded-[2rem] w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
               <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-blue-50 rounded-xl">
                        <Edit3 className="w-6 h-6 text-blue-600" />
                     </div>
                     <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Editor Console</h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Modifying: {editingPage.slug}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <button onClick={() => setShowEditModal(false)} className="px-6 py-3 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 font-bold transition-all text-sm cursor-pointer">Cancel</button>
                     <button onClick={() => { showNotify('Changes Saved Successfully', 'success'); setShowEditModal(false); }} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-95 cursor-pointer">Save Changes</button>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 gap-6 custom-scrollbar bg-gray-50/50">
                  <div className="space-y-6">
                     <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500" /> Core Configuration</h3>
                        <div className="space-y-6">
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Page Title</label>
                              <input type="text" defaultValue={editingPage.title} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-900 font-bold focus:border-blue-500 focus:outline-none transition-colors" />
                           </div>
                           <div className="grid grid-cols-2 gap-6">
                              <div>
                                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Slug</label>
                                 <input type="text" defaultValue={editingPage.slug} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-900 font-mono text-sm focus:border-blue-500 focus:outline-none transition-colors" />
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Status</label>
                                 <select defaultValue={editingPage.status} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-4 text-white font-bold focus:border-blue-500 focus:outline-none transition-colors appearance-none">
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                    <option value="archived">Archived</option>
                                 </select>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-500" /> SEO Optimization</h3>
                        <div className="space-y-6">
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Meta Title</label>
                              <input type="text" defaultValue={editingPage.seoTitle} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-900 font-bold focus:border-purple-500 focus:outline-none transition-colors" />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Meta Description</label>
                              <textarea defaultValue={editingPage.seoDescription} rows={3} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-900 font-medium focus:border-purple-500 focus:outline-none transition-colors resize-none" />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="bg-white p-8 rounded-[2rem] border border-gray-100 h-full shadow-sm">
                        <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2"><Layout className="w-5 h-5 text-green-500" /> Components</h3>
                        <div className="space-y-3">
                           {editingPage.components.map((comp, idx) => (
                              <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between group hover:border-blue-500/50 hover:bg-white transition-all cursor-move">
                                 <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">{comp}</span>
                                 <MousePointer className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                              </div>
                           ))}
                           <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-xs font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-500 transition-all mt-4 cursor-pointer">
                              + Add Section
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && analyticsPage && (
         <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-300 border-4 border-white/20">
               <div className="p-10 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div>
                     <h2 className="text-2xl font-black text-gray-900 tracking-tight">Performance <span className="text-purple-600">Analytics</span></h2>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time Insights for: {analyticsPage.title}</p>
                  </div>
                  <button onClick={() => setShowAnalyticsModal(false)} className="p-3 bg-white rounded-xl hover:bg-gray-200 transition-colors">
                     <X className="w-6 h-6 text-gray-900" />
                  </button>
               </div>
               <div className="p-10 grid grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-[2rem] p-8 text-center border-2 border-white shadow-lg">
                     <p className="text-4xl font-black text-blue-600 mb-2">{analyticsPage.views.toLocaleString()}</p>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Views</p>
                  </div>
                  <div className="bg-green-50 rounded-[2rem] p-8 text-center border-2 border-white shadow-lg">
                     <p className="text-4xl font-black text-green-600 mb-2">{analyticsPage.conversions}</p>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Conversions</p>
                  </div>
                  <div className="bg-purple-50 rounded-[2rem] p-8 text-center border-2 border-white shadow-lg">
                     <p className="text-4xl font-black text-purple-600 mb-2">{analyticsPage.conversionRate.toFixed(1)}%</p>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Conv. Rate</p>
                  </div>
               </div>
               <div className="px-10 pb-10">
                  <div className="bg-gray-900 rounded-[2rem] p-6 flex flex-col items-center justify-center min-h-[200px] text-white">
                     <BarChart3 className="w-12 h-12 text-gray-700 mb-4" />
                     <p className="font-bold text-gray-500">Advanced Charts & Heatmaps Coming Soon</p>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && settingsPage && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
           <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                 <h2 className="text-2xl font-black text-gray-900">Page <span className="text-gray-400">Settings</span></h2>
                 <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl cursor-pointer hover:border-blue-500 transition-colors">
                       <span className="font-bold text-gray-700">Enable Analytics Tracking</span>
                       <input type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600" />
                    </label>
                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl cursor-pointer hover:border-blue-500 transition-colors">
                       <span className="font-bold text-gray-700">Search Engine Indexing</span>
                       <input type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600" />
                    </label>
                 </div>
                 <button onClick={() => { showNotify('Settings Saved', 'success'); setShowSettingsModal(false); }} className="w-full py-4 bg-gray-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-colors">
                    Save Configuration
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Copy URL Modal using Notification for simplicity */}
      {showCopyModal && copyingPage && (
          // This logic is handled by the immediate action in the dropdown, 
          // but if we needed a modal it would go here.
          // For now, let's auto-close and notify.
          (() => {
             // Side-effect to copy and close would ideally be in the handler, 
             // but if we want a UI confirmation:
             return (
               <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setShowCopyModal(false)}>
                  <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                     <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                     <h3 className="text-xl font-black text-gray-900 mb-2">Link Copied!</h3>
                     <p className="text-gray-500 font-bold bg-gray-100 px-4 py-2 rounded-lg">{copyingPage.url}</p>
                  </div>
               </div>
             )
          })()
      )}

      {/* Delete Modal */}
      {deletingPage && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingPage(null);
          }}
          onConfirm={() => {
            setPages(pages.filter(p => p.id !== deletingPage.id));
            showNotify('Page Deleted Permanently', 'info');
          }}
          title="Delete Page"
          itemName={deletingPage.title}
          itemDetails={deletingPage.slug}
          warningMessage="This action will unpublish the page and remove it from all servers."
        />
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-8 duration-500">
          <div className={`px-8 py-4 rounded-[2rem] shadow-2xl backdrop-blur-2xl border-2 flex items-center gap-4 ${
            notification.type === 'success' ? 'bg-emerald-500/90 border-emerald-400/50 text-white' :
            notification.type === 'error' ? 'bg-rose-500/90 border-rose-400/50 text-white' :
            'bg-gray-900/90 border-gray-700 text-white'
          }`}>
            <div className={`p-2 rounded-xl bg-white/20`}>
              {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : 
               notification.type === 'error' ? <XCircle className="w-5 h-5" /> : 
               <Zap className="w-5 h-5" />}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">{notification.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
