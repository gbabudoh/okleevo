"use client";

import { useState } from 'react';
import {
  Truck, Plus, Search, Filter, Download,
  Star, MapPin, Globe, Building2,
  DollarSign, ShoppingCart, Clock,
  CheckCircle, XCircle, AlertCircle, Award,
  Trash2, MoreVertical, MessageSquare,
  RefreshCw, Grid, List, X, Check,
  Handshake, Factory, Box, Info,
  ShieldCheck, Package, Zap, Settings
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface Supplier {
  id: string;
  name: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  website?: string;
  category: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  rating: number;
  totalOrders: number;
  totalSpent: number;
  lastOrder: Date;
  paymentTerms: string;
  leadTime: string;
  minimumOrder: number;
  products: string[];
  certifications?: string[];
  notes?: string;
  performance: {
    onTimeDelivery: number;
    qualityScore: number;
    responseTime: number;
    priceCompetitiveness: number;
  };
}


const categoryConfigs = [
  { id: 'all', name: 'All', icon: Grid },
  { id: 'raw-materials', name: 'Raw Materials', icon: Box },
  { id: 'manufacturing', name: 'Manufacturing', icon: Factory },
  { id: 'packaging', name: 'Packaging', icon: Package },
  { id: 'logistics', name: 'Logistics', icon: Truck },
  { id: 'services', name: 'Services', icon: Handshake },
];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messagePriority, setMessagePriority] = useState('normal');
  const [isOrdering, setIsOrdering] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  const categories = categoryConfigs.map(cat => ({
    ...cat,
    count: cat.id === 'all' ? suppliers.length : suppliers.filter(s => s.category === cat.id).length,
  }));

  const showNotify = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || supplier.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { icon: CheckCircle, label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
      case 'inactive':
        return { icon: XCircle, label: 'Inactive', bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' };
      case 'pending':
        return { icon: Clock, label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
      case 'suspended':
        return { icon: AlertCircle, label: 'Suspended', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' };
      default:
        return { icon: AlertCircle, label: 'Unknown', bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' };
    }
  };

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
  const totalSpent = suppliers.reduce((acc, s) => acc + s.totalSpent, 0);
  const avgRating = suppliers.length > 0 ? suppliers.reduce((acc, s) => acc + s.rating, 0) / suppliers.length : 0;

  const handleExport = () => {
    showNotify('Generating export…');
    const headers = ['ID', 'Name', 'Company', 'Contact', 'Email', 'Phone', 'Address', 'City', 'Country', 'Category', 'Status', 'Rating', 'Total Orders', 'Total Spent', 'Payment Terms', 'Lead Time'];
    const rows = suppliers.map(s => [s.id, `"${s.name}"`, `"${s.companyName}"`, `"${s.contactPerson}"`, s.email, s.phone, `"${s.address}"`, s.city, s.country, s.category, s.status, s.rating, s.totalOrders, s.totalSpent, s.paymentTerms, s.leadTime]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `suppliers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => showNotify('Export downloaded'), 1000);
  };

  const AVATAR_COLORS = [
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-cyan-500 to-blue-600',
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-24 md:pb-10">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 via-blue-700 to-teal-700 p-6 sm:p-8 text-white shadow-xl shadow-blue-200/40">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 left-12 w-40 h-40 bg-teal-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-white/15 rounded-lg">
                <Handshake className="w-4 h-4 text-white" />
              </div>
              <span className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Supplier Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-1">
              Suppliers
            </h1>
            <p className="text-blue-300 text-sm font-medium">Strategic partnership management</p>
          </div>

          <div className="flex flex-col gap-2.5 sm:items-end">
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <button
                onClick={() => { setIsSyncing(true); showNotify('Syncing suppliers…'); setTimeout(() => setIsSyncing(false), 2000); }}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20 cursor-pointer"
                title="Sync"
              >
                <RefreshCw className={`w-4 h-4 text-white ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={handleExport} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20 cursor-pointer" title="Export">
                <Download className="w-4 h-4 text-white" />
              </button>
              <button onClick={() => setShowConfigModal(true)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20 cursor-pointer" title="Settings">
                <Settings className="w-4 h-4 text-white" />
              </button>
            </div>
            <button
              onClick={() => setShowAddSupplier(true)}
              className="flex items-center justify-center gap-2 bg-white text-blue-700 font-black text-sm rounded-xl px-5 py-2.5 shadow-lg hover:bg-blue-50 active:scale-95 transition-all w-full sm:w-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Supplier
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Suppliers', value: String(totalSuppliers), sub: `${activeSuppliers} active`, icon: Building2, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
          { label: 'Total Spent', value: `£${(totalSpent / 1000).toFixed(0)}K`, sub: 'All time', icon: DollarSign, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
          { label: 'Orders', value: String(suppliers.reduce((acc, s) => acc + s.totalOrders, 0)), sub: 'Historical', icon: ShoppingCart, iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
          { label: 'Avg Rating', value: avgRating > 0 ? avgRating.toFixed(1) : '—', sub: 'Trust score', icon: Award, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className={`shrink-0 p-2.5 rounded-xl ${stat.iconBg}`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider truncate">{stat.label}</p>
              <p className="text-xl font-black text-gray-900 leading-tight">{stat.value}</p>
              <p className="text-[10px] text-gray-400 truncate">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search + Controls ── */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, contact, or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-[11px] font-black text-gray-600 hover:bg-gray-50 transition-all cursor-pointer shrink-0">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="hidden sm:inline">Filter</span>
        </button>
        <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shrink-0">
          {[{ id: 'grid', icon: Grid }, { id: 'list', icon: List }].map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as 'grid' | 'list')}
              className={`p-2.5 transition-all cursor-pointer ${
                viewMode === mode.id ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <mode.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Category Pills ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {categories.map(cat => {
          const Icon = cat.icon;
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                active
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white border border-gray-100 text-gray-500 hover:border-gray-200 hover:text-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.name}
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Supplier Grid / List ── */}
      {filteredSuppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-gray-100">
          <Building2 className="w-10 h-10 text-gray-200" />
          <p className="text-sm font-bold text-gray-400">No suppliers yet</p>
          <button
            onClick={() => setShowAddSupplier(true)}
            className="mt-1 flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add First Supplier
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredSuppliers.map((supplier, idx) => {
            const sc = getStatusConfig(supplier.status);
            const avgPerf = (supplier.performance.onTimeDelivery + supplier.performance.qualityScore + supplier.performance.responseTime + supplier.performance.priceCompetitiveness) / 4;
            const gradient = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            return (
              <div
                key={supplier.id}
                onClick={() => { setSelectedSupplier(supplier); setShowDetailModal(true); }}
                className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-lg hover:shadow-gray-100 transition-all cursor-pointer group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl bg-linear-to-br ${gradient} flex items-center justify-center text-white text-base font-black shadow-sm shrink-0`}>
                      {supplier.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-gray-900 leading-tight truncate group-hover:text-blue-600 transition-colors">
                        {supplier.name}
                      </h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider truncate">
                        {supplier.category.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${sc.bg} ${sc.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {sc.label}
                  </span>
                </div>

                {/* Performance bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-gray-400 font-bold">Performance</span>
                    <span className="text-xs font-black text-gray-900">{avgPerf.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        avgPerf >= 90 ? 'bg-emerald-500' : avgPerf >= 75 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${avgPerf}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Spent</p>
                    <p className="text-xs font-black text-gray-900">£{(supplier.totalSpent / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Lead Time</p>
                    <p className="text-xs font-black text-gray-900">{supplier.leadTime}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(supplier.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                  ))}
                  <span className="text-[11px] font-black text-gray-500 ml-1">{supplier.rating}</span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-[9px] font-black text-gray-500 uppercase shrink-0">
                      {supplier.contactPerson.charAt(0)}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 truncate">{supplier.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedSupplier(supplier); setShowMessageModal(true); }}
                      className="p-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === supplier.id ? null : supplier.id); }}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
                      >
                        <MoreVertical className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                      {activeMenu === supplier.id && (
                        <>
                          <div className="fixed inset-0 z-60" onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }} />
                          <div className="absolute right-0 bottom-full mb-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-70 animate-in fade-in zoom-in duration-200">
                            {[
                              { label: 'Place Order', icon: ShoppingCart, onClick: () => { setSelectedSupplier(supplier); setShowOrderModal(true); } },
                              { label: 'Send Message', icon: MessageSquare, onClick: () => { setSelectedSupplier(supplier); setShowMessageModal(true); } },
                              { label: 'Delete', icon: Trash2, danger: true, onClick: () => { setDeletingSupplier(supplier); setShowDeleteModal(true); } },
                            ].map((opt, i) => (
                              <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); opt.onClick?.(); setActiveMenu(null); }}
                                className={`w-full px-3.5 py-2.5 text-left text-[11px] font-black flex items-center gap-2.5 hover:bg-gray-50 transition-colors cursor-pointer ${opt.danger ? 'text-red-500' : 'text-gray-700'}`}
                              >
                                <opt.icon className="w-3.5 h-3.5" />
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Supplier</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Rating</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Orders</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Spent</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredSuppliers.map((supplier, idx) => {
                  const sc = getStatusConfig(supplier.status);
                  const gradient = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  return (
                    <tr
                      key={supplier.id}
                      onClick={() => { setSelectedSupplier(supplier); setShowDetailModal(true); }}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${gradient} flex items-center justify-center text-white text-sm font-black shrink-0`}>
                            {supplier.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900">{supplier.name}</p>
                            <p className="text-[10px] text-gray-400">{supplier.contactPerson}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-wider rounded-lg">
                          {supplier.category.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-black text-gray-900">{supplier.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-black text-gray-900">{supplier.totalOrders}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-black text-blue-600">£{(supplier.totalSpent / 1000).toFixed(0)}K</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedSupplier(supplier); setShowMessageModal(true); }}
                            className="p-2 bg-gray-100 hover:bg-blue-100 rounded-xl transition-all cursor-pointer group/msg"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-gray-500 group-hover/msg:text-blue-600 transition-colors" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === supplier.id ? null : supplier.id); }}
                              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
                            >
                              <MoreVertical className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                            {activeMenu === supplier.id && (
                              <>
                                <div className="fixed inset-0 z-60" onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }} />
                                <div className="absolute right-0 bottom-full mb-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-70 animate-in fade-in zoom-in duration-200">
                                  {[
                                    { label: 'Place Order', icon: ShoppingCart, onClick: () => { setSelectedSupplier(supplier); setShowOrderModal(true); } },
                                    { label: 'Send Message', icon: MessageSquare, onClick: () => { setSelectedSupplier(supplier); setShowMessageModal(true); } },
                                    { label: 'Delete', icon: Trash2, danger: true, onClick: () => { setDeletingSupplier(supplier); setShowDeleteModal(true); } },
                                  ].map((opt, i) => (
                                    <button
                                      key={i}
                                      onClick={(e) => { e.stopPropagation(); opt.onClick?.(); setActiveMenu(null); }}
                                      className={`w-full px-3.5 py-2.5 text-left text-[11px] font-black flex items-center gap-2.5 hover:bg-gray-50 transition-colors cursor-pointer ${opt.danger ? 'text-red-500' : 'text-gray-700'}`}
                                    >
                                      <opt.icon className="w-3.5 h-3.5" />
                                      {opt.label}
                                    </button>
                                  ))}
                                </div>
                              </>
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
        </div>
      )}

      {/* ── Supplier Detail Modal ── */}
      {showDetailModal && selectedSupplier && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 sm:pl-0 md:pl-64">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => { setShowDetailModal(false); setSelectedSupplier(null); }} />
          <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-base font-black shadow-sm">
                  {selectedSupplier.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900 leading-tight">{selectedSupplier.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    {(() => { const sc = getStatusConfig(selectedSupplier.status); return (
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${sc.bg} ${sc.text}`}>
                        <span className={`w-1 h-1 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                    ); })()}
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-[11px] font-black text-gray-600">{selectedSupplier.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => { setShowDetailModal(false); setSelectedSupplier(null); }} className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
              {/* Capital + Orders */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3.5 bg-blue-50 rounded-2xl">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider mb-1">Total Spent</p>
                  <p className="text-xl font-black text-blue-900">£{(selectedSupplier.totalSpent / 1000).toFixed(0)}K</p>
                </div>
                <div className="p-3.5 bg-indigo-50 rounded-2xl">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider mb-1">Total Orders</p>
                  <p className="text-xl font-black text-indigo-900">{selectedSupplier.totalOrders}</p>
                </div>
              </div>

              {/* Performance */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Performance</p>
                {[
                  { label: 'On-Time Delivery', value: selectedSupplier.performance.onTimeDelivery, color: 'bg-emerald-500' },
                  { label: 'Quality Score', value: selectedSupplier.performance.qualityScore, color: 'bg-blue-500' },
                  { label: 'Response Time', value: selectedSupplier.performance.responseTime, color: 'bg-indigo-500' },
                  { label: 'Price Index', value: selectedSupplier.performance.priceCompetitiveness, color: 'bg-amber-500' },
                ].map((perf, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-gray-600">{perf.label}</span>
                      <span className="text-[11px] font-black text-gray-900">{perf.value}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${perf.color} rounded-full`} style={{ width: `${perf.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3.5 bg-white border border-gray-100 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Contact</p>
                  <p className="text-sm font-black text-gray-900">{selectedSupplier.contactPerson}</p>
                  <p className="text-[11px] text-gray-500 truncate">{selectedSupplier.email}</p>
                </div>
                <div className="p-3.5 bg-white border border-gray-100 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Location</p>
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-[11px] font-bold text-gray-700 leading-tight">{selectedSupplier.city}, {selectedSupplier.country}</p>
                  </div>
                  {selectedSupplier.website && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <p className="text-[10px] text-gray-500 truncate">{selectedSupplier.website}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Operations */}
              <div className="bg-gray-900 rounded-2xl p-4">
                <div className="grid grid-cols-3 gap-3 text-white text-center">
                  <div>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-wider mb-1">Lead Time</p>
                    <p className="text-sm font-black">{selectedSupplier.leadTime}</p>
                  </div>
                  <div className="border-x border-white/10">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-wider mb-1">Payment</p>
                    <p className="text-sm font-black">{selectedSupplier.paymentTerms}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-wider mb-1">Min Order</p>
                    <p className="text-sm font-black">£{selectedSupplier.minimumOrder.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex gap-2.5 shrink-0">
              <button
                onClick={() => setShowMessageModal(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                Message
              </button>
              <button
                onClick={() => setShowOrderModal(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-gray-800 transition-all cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                Order
              </button>
              <button
                onClick={() => { setDeletingSupplier(selectedSupplier); setShowDeleteModal(true); }}
                className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all cursor-pointer border border-red-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Supplier Modal ── */}
      {showAddSupplier && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 sm:pl-0 md:pl-64">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowAddSupplier(false)} />
          <div className="relative w-full sm:max-w-2xl bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92dvh]">
            {/* Sidebar — desktop only */}
            <div className="hidden md:flex w-64 bg-gray-950 p-7 text-white flex-col justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-3 leading-tight">Add Supplier</h2>
                <p className="text-xs text-gray-400 leading-relaxed mb-6">Register a new supplier in your network.</p>
                <div className="space-y-2.5">
                  {[
                    { icon: Building2, label: 'Company Info', sub: 'Name and category' },
                    { icon: MessageSquare, label: 'Contact Details', sub: 'Person and email' },
                    { icon: ShoppingCart, label: 'Terms', sub: 'Payment and lead time' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
                      <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">{item.label}</p>
                        <p className="text-[10px] text-gray-500">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl">
                <p className="text-[10px] text-gray-400 leading-relaxed">All starred fields are required.</p>
              </div>
            </div>

            {/* Form */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0">
                <div>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider mb-0.5">New Supplier</p>
                  <h2 className="text-lg font-black text-gray-900">Add Supplier</h2>
                </div>
                <button onClick={() => setShowAddSupplier(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Company Name *</label>
                  <input type="text" placeholder="e.g. Acme Supplies Ltd" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Category</label>
                    <select className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all">
                      <option value="">Select</option>
                      {categoryConfigs.filter(c => c.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Contact Person *</label>
                    <input type="text" placeholder="Full name" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Email *</label>
                  <input type="email" placeholder="contact@supplier.com" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Phone</label>
                    <input type="tel" placeholder="+44 7000 000000" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Website</label>
                    <input type="url" placeholder="https://" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                  </div>
                </div>

                <div className="p-4 bg-gray-900 rounded-2xl">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <ShoppingCart className="w-3 h-3" /> Order Terms
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Payment Terms</label>
                      <select className="w-full px-3.5 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-blue-500 transition-all">
                        <option value="net30">Net 30</option>
                        <option value="net60">Net 60</option>
                        <option value="net90">Net 90</option>
                        <option value="prepay">Prepayment</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Lead Time</label>
                      <input type="text" placeholder="e.g. 7-10 days" className="w-full px-3.5 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-all" />
                    </div>
                  </div>
                </div>

                {/* Mobile-only buttons inside scroll — extended scroll space */}
                <div className="flex items-center justify-end gap-3 pt-2 pb-32 sm:hidden">
                  <button onClick={() => setShowAddSupplier(false)} className="px-5 py-2.5 text-[11px] font-black text-gray-400 uppercase tracking-wider hover:text-gray-700 transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button
                    onClick={() => { showNotify('Supplier added successfully'); setShowAddSupplier(false); }}
                    className="px-6 py-2.5 bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all cursor-pointer active:scale-95"
                  >
                    Add Supplier
                  </button>
                </div>
              </div>

              {/* Desktop sticky footer */}
              <div className="hidden sm:flex px-5 sm:px-6 py-4 border-t border-gray-100 items-center justify-end gap-3 shrink-0">
                <button onClick={() => setShowAddSupplier(false)} className="px-5 py-2.5 text-[11px] font-black text-gray-400 uppercase tracking-wider hover:text-gray-700 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button
                  onClick={() => { showNotify('Supplier added successfully'); setShowAddSupplier(false); }}
                  className="px-6 py-2.5 bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all cursor-pointer active:scale-95"
                >
                  Add Supplier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Message Modal ── */}
      {showMessageModal && selectedSupplier && (
        <div className="fixed inset-0 z-110 flex items-end sm:items-center justify-center p-0 sm:p-4 sm:pl-0 md:pl-64">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowMessageModal(false)} />
          <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider mb-0.5">To: {selectedSupplier.name}</p>
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  Send Message
                </h2>
              </div>
              <button onClick={() => setShowMessageModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Priority</label>
                <div className="grid grid-cols-4 gap-2">
                  {['low', 'normal', 'high', 'urgent'].map(p => (
                    <button
                      key={p}
                      onClick={() => setMessagePriority(p)}
                      className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        messagePriority === p
                          ? (p === 'urgent' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white')
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Subject</label>
                <input
                  type="text"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="Message subject…"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Message</label>
                <textarea
                  rows={5}
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Write your message…"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                />
              </div>
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                disabled={!messageSubject || !messageBody}
                onClick={() => { showNotify(`Message sent to ${selectedSupplier.name}`); setShowMessageModal(false); setMessageSubject(''); setMessageBody(''); }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <MessageSquare className="w-4 h-4" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Place Order Modal ── */}
      {showOrderModal && selectedSupplier && (
        <div className="fixed inset-0 z-110 flex items-end sm:items-center justify-center p-0 sm:p-4 sm:pl-0 md:pl-64">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowOrderModal(false)} />
          <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider mb-0.5">From: {selectedSupplier.name}</p>
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-500" />
                  Place Order
                </h2>
              </div>
              <button onClick={() => setShowOrderModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
              {/* Supplier info banner */}
              <div className="flex items-center gap-3 p-3.5 bg-blue-50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider">{selectedSupplier.category.replace('-', ' ')}</p>
                  <p className="text-sm font-black text-blue-900">{selectedSupplier.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Quantity *</label>
                  <input type="number" placeholder="0" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Min. Order</label>
                  <div className="px-3.5 py-2.5 bg-gray-100 rounded-xl text-sm font-black text-gray-500">
                    £{selectedSupplier.minimumOrder.toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Standard', 'Expedited', 'Critical'].map(p => (
                    <button
                      key={p}
                      onClick={() => setMessagePriority(p.toLowerCase())}
                      className={`py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                        messagePriority === p.toLowerCase()
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-[11px] font-bold text-emerald-700">
                  Estimated delivery: <span className="font-black">{selectedSupplier.leadTime}</span>
                </p>
              </div>
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex gap-2.5 shrink-0">
              <button onClick={() => setShowOrderModal(false)} className="px-5 py-3 text-[11px] font-black text-gray-400 uppercase tracking-wider hover:text-gray-700 transition-colors cursor-pointer">
                Cancel
              </button>
              <button
                disabled={isOrdering}
                onClick={() => {
                  setIsOrdering(true);
                  setTimeout(() => {
                    setIsOrdering(false);
                    setShowOrderModal(false);
                    showNotify(`Order placed with ${selectedSupplier.name}`);
                  }, 2000);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-50"
              >
                {isOrdering ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {isOrdering ? 'Placing…' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Config Modal ── */}
      {showConfigModal && (
        <div className="fixed inset-0 z-110 flex items-end sm:items-center justify-center p-0 sm:p-4 sm:pl-0 md:pl-64">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowConfigModal(false)} />
          <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider mb-0.5">Preferences</p>
                <h2 className="text-lg font-black text-gray-900">Settings</h2>
              </div>
              <button onClick={() => setShowConfigModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-5">
              {/* Auto-Sync */}
              <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5" /> Auto-Sync
                </p>
                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  {[
                    { label: 'Real-time Inventory Sync', sub: 'Update stock every 15 minutes', enabled: true },
                    { label: 'Price Monitor', sub: 'Alert on >5% rate deviation', enabled: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-gray-900">{item.label}</p>
                        <p className="text-[10px] text-gray-500">{item.sub}</p>
                      </div>
                      <div className={`w-11 h-6 rounded-full relative cursor-pointer shrink-0 transition-colors ${item.enabled ? 'bg-blue-500' : 'bg-gray-200'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${item.enabled ? 'right-1' : 'left-1'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5" /> Notifications
                </p>
                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  {['Shipment Delays', 'Quality Flags', 'Contract Renewals', 'New Catalogues'].map((item, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer">
                      <div className="w-5 h-5 rounded-md border-2 border-blue-400 bg-blue-50 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-sm font-bold text-gray-700">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* API */}
              <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" /> API Integration
                </p>
                <div className="bg-gray-900 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-gray-400 mb-2">API Key</p>
                  <div className="flex items-center gap-2 bg-gray-800 rounded-xl p-3 border border-gray-700">
                    <code className="text-xs font-mono text-emerald-400 flex-1 truncate">sk_live_51Msz…92xS</code>
                    <button className="p-1.5 hover:bg-gray-700 rounded-lg transition-all cursor-pointer shrink-0" title="Copy">
                      <Download className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                  <p className="text-[9px] text-gray-500 mt-2">Admin access only.</p>
                </div>
              </div>
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={() => { showNotify('Settings saved'); setShowConfigModal(false); }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {deletingSupplier && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeletingSupplier(null); }}
          onConfirm={() => {
            setSuppliers(suppliers.filter(s => s.id !== deletingSupplier.id));
            setShowDetailModal(false);
            setSelectedSupplier(null);
            showNotify('Supplier removed');
          }}
          title="Delete Supplier"
          itemName={deletingSupplier.name}
          itemDetails={`${deletingSupplier.contactPerson} · ${deletingSupplier.email}`}
          warningMessage="This will permanently remove this supplier and all associated records."
        />
      )}

      {/* ── Toast ── */}
      {notification && (
        <div className="fixed bottom-24 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-80 z-200 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-xl border ${
            notification.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' :
            notification.type === 'error' ? 'bg-red-600 border-red-500 text-white' :
            'bg-gray-900 border-gray-700 text-white'
          }`}>
            <div className="p-1.5 rounded-lg bg-white/20 shrink-0">
              {notification.type === 'success' ? <Check className="w-4 h-4" /> :
               notification.type === 'error' ? <XCircle className="w-4 h-4" /> :
               <Info className="w-4 h-4" />}
            </div>
            <p className="text-sm font-black">{notification.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
