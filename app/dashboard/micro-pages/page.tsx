"use client";

import React, { useState } from 'react';
import { 
  Globe, Plus, Search, Filter, Download, Upload, Eye, Edit3,
  Trash2, Copy, Share2, BarChart3, Settings, Link, ExternalLink,
  Layout, Type, Image as ImageIcon, Video, Code, Palette,
  Smartphone, Monitor, Tablet, Zap, TrendingUp, Users, Clock,
  CheckCircle, XCircle, AlertCircle, MoreVertical, Star, Heart,
  MessageSquare, ShoppingCart, Calendar, Mail, Phone, MapPin,
  Grid, List, ChevronRight, X, Check, Sparkles, Target, Award
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
  icon: any;
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
    icon: Sparkles,
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
  const [selectedPage, setSelectedPage] = useState<MicroPage | null>(null);
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
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (activeDropdown) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
              <Globe className="w-8 h-8 text-white" />
            </div>
            Micro Pages
          </h1>
          <p className="text-gray-600 mt-2">Create beautiful landing pages in minutes</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Upload className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Import</span>
          </button>
          <button
            onClick={() => setShowTemplates(true)}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Create Page
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-sm text-blue-600 font-medium mb-1">Total Pages</p>
          <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
          <p className="text-xs text-blue-600 mt-1">{stats.published} published</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-sm text-purple-600 font-medium mb-1">Total Views</p>
          <p className="text-3xl font-bold text-purple-900">{stats.totalViews.toLocaleString()}</p>
          <p className="text-xs text-purple-600 mt-1">All time</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-500 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <BarChart3 className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-sm text-green-600 font-medium mb-1">Avg Conversion</p>
          <p className="text-3xl font-bold text-green-900">{stats.avgConversion.toFixed(1)}%</p>
          <p className="text-xs text-green-600 mt-1">Conversion rate</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Layout className="w-6 h-6 text-white" />
            </div>
            <Sparkles className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-sm text-orange-600 font-medium mb-1">Templates</p>
          <p className="text-3xl font-bold text-orange-900">{templates.length}</p>
          <p className="text-xs text-orange-600 mt-1">Available</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search pages by title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          
          <div className="flex items-center gap-1 bg-white border-2 border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Pages Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPages.map((page) => {
            const statusConfig = getStatusConfig(page.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div
                key={page.id}
                className="group relative bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-300 hover:shadow-2xl transition-all cursor-pointer"
                onClick={() => setSelectedPage(page)}
              >
                {/* Status Badge */}
                <div className={`absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </div>

                {/* Page Preview */}
                <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Globe className="w-12 h-12 text-gray-400" />
                </div>

                {/* Page Info */}
                <h3 className="font-bold text-gray-900 mb-1 pr-20 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {page.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-1">{page.slug}</p>

                {page.description && (
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{page.description}</p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                    <p className="text-xs text-blue-600 mb-0.5">Views</p>
                    <p className="text-lg font-bold text-blue-900">{page.views.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                    <p className="text-xs text-green-600 mb-0.5">Conversion</p>
                    <p className="text-lg font-bold text-green-900">{page.conversionRate.toFixed(1)}%</p>
                  </div>
                </div>

                {/* Components */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Components:</p>
                  <div className="flex flex-wrap gap-1">
                    {page.components.slice(0, 3).map((comp, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                        {comp}
                      </span>
                    ))}
                    {page.components.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                        +{page.components.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPage(page);
                      setShowEditModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(page.url, '_blank');
                    }}
                    className="flex-1 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === page.id ? null : page.id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    {activeDropdown === page.id && (
                      <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-[100]">
                        <div className="py-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setCopyingPage(page);
                              setShowCopyModal(true);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4 text-blue-600" />
                            Copy URL
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const newPage: MicroPage = {
                                ...page,
                                id: `${Date.now()}`,
                                title: `${page.title} (Copy)`,
                                slug: `${page.slug}-copy`,
                                url: `${page.url}-copy`,
                                status: 'draft',
                                views: 0,
                                conversions: 0,
                                conversionRate: 0,
                                createdDate: new Date(),
                                lastModified: new Date()
                              };
                              setPages([...pages, newPage]);
                              setActiveDropdown(null);
                              alert('✓ Page duplicated successfully!');
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4 text-green-600" />
                            Duplicate
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setAnalyticsPage(page);
                              setShowAnalyticsModal(true);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2"
                          >
                            <BarChart3 className="w-4 h-4 text-purple-600" />
                            Analytics
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSettingsPage(page);
                              setShowSettingsModal(true);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Settings className="w-4 h-4 text-gray-600" />
                            Settings
                          </button>
                          <div className="border-t border-gray-200 my-1"></div>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingPage(page);
                              setShowDeleteModal(true);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Page</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">URL</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Views</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Conversion</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPages.map((page) => {
                const statusConfig = getStatusConfig(page.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Globe className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{page.title}</p>
                          <p className="text-xs text-gray-500">{page.template}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700 truncate max-w-[200px]">{page.url}</span>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <ExternalLink className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">{page.views.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-green-600">{page.conversionRate.toFixed(1)}%</span>
                        <span className="text-xs text-gray-500">({page.conversions})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPage(page);
                          }}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPage(page);
                            setShowEditModal(true);
                          }}
                          className="p-2 hover:bg-purple-50 rounded-lg transition-colors" 
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4 text-purple-600" />
                        </button>
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === `list-${page.id}` ? null : `list-${page.id}`);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors" 
                            title="More options"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                          
                          {activeDropdown === `list-${page.id}` && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-[100]">
                              <div className="py-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(page.url, '_blank');
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                                >
                                  <ExternalLink className="w-4 h-4 text-blue-600" />
                                  Open Page
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCopyingPage(page);
                                    setShowCopyModal(true);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 flex items-center gap-2"
                                >
                                  <Copy className="w-4 h-4 text-green-600" />
                                  Copy URL
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newPage: MicroPage = {
                                      ...page,
                                      id: `${Date.now()}`,
                                      title: `${page.title} (Copy)`,
                                      slug: `${page.slug}-copy`,
                                      url: `${page.url}-copy`,
                                      status: 'draft',
                                      views: 0,
                                      conversions: 0,
                                      conversionRate: 0,
                                      createdDate: new Date(),
                                      lastModified: new Date()
                                    };
                                    setPages([...pages, newPage]);
                                    setActiveDropdown(null);
                                    alert('✓ Page duplicated successfully!');
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2"
                                >
                                  <Copy className="w-4 h-4 text-purple-600" />
                                  Duplicate
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAnalyticsPage(page);
                                    setShowAnalyticsModal(true);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 flex items-center gap-2"
                                >
                                  <BarChart3 className="w-4 h-4 text-orange-600" />
                                  Analytics
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSettingsPage(page);
                                    setShowSettingsModal(true);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Settings className="w-4 h-4 text-gray-600" />
                                  Settings
                                </button>
                                <div className="border-t border-gray-200 my-1"></div>
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingPage(page);
                                    setShowDeleteModal(true);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Template Selection Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Choose a Template</h2>
                <p className="text-sm text-gray-600 mt-1">Start with a professionally designed template</p>
              </div>
              <button
                onClick={() => setShowTemplates(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Category Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    {cat.name}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                      selectedCategory === cat.id ? 'bg-white bg-opacity-20' : 'bg-gray-100'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <div
                      key={template.id}
                      className="group relative bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-transparent hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
                      onClick={() => {
                        alert(`Creating page with ${template.name} template`);
                        setShowTemplates(false);
                      }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                      
                      <div className="relative">
                        {/* Template Preview */}
                        <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Icon className="w-16 h-16 text-gray-400" />
                        </div>

                        {/* Template Info */}
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold mb-3 bg-gradient-to-r ${template.gradient} text-white`}>
                          {template.category}
                        </div>

                        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600">
                          {template.name}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-4">
                          {template.description}
                        </p>

                        {/* Components */}
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Includes:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.components.map((comp, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                {comp}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Use Template Button */}
                        <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
                          <Plus className="w-4 h-4" />
                          Use Template
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Blank Template Option */}
              <div className="border-t border-gray-200 pt-6">
                <button
                  onClick={() => {
                    alert('Creating blank page');
                    setShowTemplates(false);
                  }}
                  className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className="p-3 bg-gray-100 group-hover:bg-blue-100 rounded-xl transition-colors">
                      <Layout className="w-8 h-8 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600">Start from Scratch</h3>
                      <p className="text-sm text-gray-600">Build your own custom page with our drag-and-drop builder</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Detail Modal */}
      {selectedPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedPage.title}</h2>
                  <p className="text-sm text-gray-600">{selectedPage.slug}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPage(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status & Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Views</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{selectedPage.views.toLocaleString()}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Conversions</span>
                  </div>
                  <p className="text-3xl font-bold text-green-900">{selectedPage.conversions}</p>
                  <p className="text-xs text-green-600 mt-1">{selectedPage.conversionRate.toFixed(1)}% rate</p>
                </div>

                <div className={`rounded-xl p-4 border ${getStatusConfig(selectedPage.status).bg} ${getStatusConfig(selectedPage.status).border}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {React.createElement(getStatusConfig(selectedPage.status).icon, { 
                      className: `w-5 h-5 ${getStatusConfig(selectedPage.status).text}` 
                    })}
                    <span className={`text-sm font-medium ${getStatusConfig(selectedPage.status).text}`}>Status</span>
                  </div>
                  <p className={`text-2xl font-bold ${getStatusConfig(selectedPage.status).text}`}>
                    {getStatusConfig(selectedPage.status).label}
                  </p>
                </div>
              </div>

              {/* URL */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Link className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <span className="text-sm text-gray-900 truncate">{selectedPage.url}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedPage.url);
                        alert('URL copied to clipboard!');
                      }}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                    <button 
                      onClick={() => window.open(selectedPage.url, '_blank')}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedPage.description && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedPage.description}</p>
                </div>
              )}

              {/* Components */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Page Components</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {selectedPage.components.map((comp, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <Layout className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-medium text-indigo-900">{comp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEO */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  SEO Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-purple-600 mb-1">Title</p>
                    <p className="font-semibold text-purple-900">{selectedPage.seoTitle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 mb-1">Description</p>
                    <p className="text-sm text-purple-800">{selectedPage.seoDescription}</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-xs text-blue-600 mb-1">Created</p>
                  <p className="font-semibold text-blue-900">{selectedPage.createdDate.toLocaleDateString()}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-xs text-green-600 mb-1">Last Modified</p>
                  <p className="font-semibold text-green-900">{selectedPage.lastModified.toLocaleDateString()}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setEditingPage(selectedPage);
                    setShowEditModal(true);
                    setSelectedPage(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                  <Edit3 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Edit Page
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Preview button clicked for:', selectedPage.url);
                    const confirmed = confirm(`🔍 Preview Page\n\nOpening: ${selectedPage.title}\nURL: ${selectedPage.url}\n\nThis will open the live page in a new tab.`);
                    if (confirmed) {
                      window.open(selectedPage.url, '_blank');
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                  <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Preview
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Share button clicked');
                    if (navigator.share) {
                      navigator.share({
                        title: selectedPage.title,
                        text: selectedPage.description || selectedPage.title,
                        url: selectedPage.url,
                      }).then(() => {
                        alert('✅ Shared successfully!');
                      }).catch((error) => {
                        if (error.name !== 'AbortError') {
                          navigator.clipboard.writeText(selectedPage.url);
                          alert('📋 Link copied to clipboard!');
                        }
                      });
                    } else {
                      navigator.clipboard.writeText(selectedPage.url);
                      alert('📋 Link copied to clipboard!\n\n' + selectedPage.url);
                    }
                  }}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 group"
                >
                  <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Page Modal */}
      {showEditModal && editingPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Edit3 className="w-6 h-6 text-blue-600" />
                Edit Page
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPage(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Page Title</label>
                  <input
                    type="text"
                    defaultValue={editingPage.title}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                  <input
                    type="text"
                    defaultValue={editingPage.slug}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    defaultValue={editingPage.description}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Template</label>
                  <select
                    defaultValue={editingPage.template}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    defaultValue={editingPage.status}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">SEO Title</label>
                  <input
                    type="text"
                    defaultValue={editingPage.seoTitle}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">SEO Description</label>
                  <textarea
                    defaultValue={editingPage.seoDescription}
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Page Components Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Page Components
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {editingPage.components.map((comp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
                      <span className="text-sm font-medium text-purple-900">{comp}</span>
                      <button className="p-1 hover:bg-purple-100 rounded transition-colors">
                        <X className="w-3 h-3 text-purple-600" />
                      </button>
                    </div>
                  ))}
                  <button className="p-3 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-purple-700 font-medium text-sm">
                    + Add Component
                  </button>
                </div>
              </div>

              {/* Analytics Preview */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-xs text-blue-600 mb-1">Views</p>
                  <p className="text-2xl font-bold text-blue-900">{editingPage.views.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <p className="text-xs text-green-600 mb-1">Conversions</p>
                  <p className="text-2xl font-bold text-green-900">{editingPage.conversions}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <p className="text-xs text-purple-600 mb-1">Rate</p>
                  <p className="text-2xl font-bold text-purple-900">{editingPage.conversionRate.toFixed(1)}%</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPage(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('✅ Page updated successfully!');
                    setShowEditModal(false);
                    setEditingPage(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copy URL Modal */}
      {showCopyModal && copyingPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <Copy className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Copy Page URL</h2>
                  <p className="text-blue-100 text-sm mt-0.5">{copyingPage.title}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowCopyModal(false);
                  setCopyingPage(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Page Info */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-lg">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{copyingPage.title}</p>
                    <p className="text-sm text-gray-600">{copyingPage.slug}</p>
                  </div>
                </div>
              </div>

              {/* URL Display */}
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Page URL:</p>
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-300">
                  <Link className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <p className="text-sm text-gray-900 truncate flex-1">{copyingPage.url}</p>
                </div>
              </div>

              {/* Copy Options */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(copyingPage.url);
                    alert('✓ URL copied to clipboard!');
                    setShowCopyModal(false);
                    setCopyingPage(null);
                  }}
                  className="w-full px-5 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:shadow-xl transition-all flex items-center gap-3 font-semibold"
                >
                  <Copy className="w-6 h-6" />
                  <div className="text-left">
                    <p className="font-bold">Copy URL</p>
                    <p className="text-xs text-blue-100">Copy to clipboard</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const shareText = `Check out this page: ${copyingPage.title}\n${copyingPage.url}`;
                    navigator.clipboard.writeText(shareText);
                    alert('✓ Shareable text copied!');
                    setShowCopyModal(false);
                    setCopyingPage(null);
                  }}
                  className="w-full px-5 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-xl transition-all flex items-center gap-3 font-semibold"
                >
                  <Share2 className="w-6 h-6" />
                  <div className="text-left">
                    <p className="font-bold">Copy with Title</p>
                    <p className="text-xs text-purple-100">Copy formatted text</p>
                  </div>
                </button>
              </div>

              {/* Cancel Button */}
              <button 
                type="button"
                onClick={() => {
                  setShowCopyModal(false);
                  setCopyingPage(null);
                }}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && analyticsPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Page Analytics</h2>
                  <p className="text-purple-100 text-sm mt-0.5">{analyticsPage.title}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowAnalyticsModal(false);
                  setAnalyticsPage(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-6 h-6 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Total Views</span>
                  </div>
                  <p className="text-4xl font-bold text-blue-900">{analyticsPage.views.toLocaleString()}</p>
                  <p className="text-xs text-blue-600 mt-2">All time visitors</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-6 h-6 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Conversions</span>
                  </div>
                  <p className="text-4xl font-bold text-green-900">{analyticsPage.conversions}</p>
                  <p className="text-xs text-green-600 mt-2">Total conversions</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">Conversion Rate</span>
                  </div>
                  <p className="text-4xl font-bold text-purple-900">{analyticsPage.conversionRate.toFixed(1)}%</p>
                  <p className="text-xs text-purple-600 mt-2">Success rate</p>
                </div>
              </div>

              {/* Page Info */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-gray-700" />
                  Page Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Template</p>
                    <p className="font-semibold text-gray-900 capitalize">{analyticsPage.template.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Status</p>
                    <p className="font-semibold text-gray-900 capitalize">{analyticsPage.status}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Created</p>
                    <p className="font-semibold text-gray-900">{analyticsPage.createdDate.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Last Modified</p>
                    <p className="font-semibold text-gray-900">{analyticsPage.lastModified.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Performance Insights */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-5 border-2 border-orange-200">
                <h3 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Performance Insights
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-sm text-gray-700">Average time on page</span>
                    <span className="font-bold text-orange-900">2m 34s</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-sm text-gray-700">Bounce rate</span>
                    <span className="font-bold text-orange-900">32.5%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-sm text-gray-700">Return visitors</span>
                    <span className="font-bold text-orange-900">18.2%</span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button 
                type="button"
                onClick={() => {
                  setShowAnalyticsModal(false);
                  setAnalyticsPage(null);
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl transition-all cursor-pointer"
              >
                Close Analytics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && settingsPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <Settings className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Page Settings</h2>
                  <p className="text-gray-300 text-sm mt-0.5">{settingsPage.title}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  setSettingsPage(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* General Settings */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-gray-700" />
                  General Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Page Title</label>
                    <input
                      type="text"
                      defaultValue={settingsPage.title}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                    <input
                      type="text"
                      defaultValue={settingsPage.slug}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      defaultValue={settingsPage.status}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  SEO Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">SEO Title</label>
                    <input
                      type="text"
                      defaultValue={settingsPage.seoTitle}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">SEO Description</label>
                    <textarea
                      defaultValue={settingsPage.seoDescription}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200">
                <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Advanced Settings
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-purple-50 transition-colors">
                    <span className="text-sm font-medium text-gray-900">Enable Analytics Tracking</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-purple-600 rounded" />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-purple-50 transition-colors">
                    <span className="text-sm font-medium text-gray-900">Allow Search Engine Indexing</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-purple-600 rounded" />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-purple-50 transition-colors">
                    <span className="text-sm font-medium text-gray-900">Enable Social Sharing</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-purple-600 rounded" />
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button 
                  type="button"
                  onClick={() => {
                    setShowSettingsModal(false);
                    setSettingsPage(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    alert('✓ Settings saved successfully!');
                    setShowSettingsModal(false);
                    setSettingsPage(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-bold rounded-xl hover:shadow-xl transition-all cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPage && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingPage(null);
          }}
          onConfirm={() => {
            setPages(pages.filter(page => page.id !== deletingPage.id));
            alert('✓ Page deleted successfully!');
          }}
          title="Delete Micro Page"
          itemName={deletingPage.title}
          itemDetails={`${deletingPage.slug} - ${deletingPage.views.toLocaleString()} views`}
          warningMessage="This will permanently remove this page and all its analytics data."
        />
      )}
    </div>
  );
}
