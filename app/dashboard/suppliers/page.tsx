"use client";

import React, { useState, useEffect } from 'react';
import {
  Truck, Plus, Search, Filter, Download,
  Star, MapPin, Globe, Building2,
  DollarSign, ShoppingCart, Clock,
  CheckCircle, XCircle, AlertCircle, Award,
  Trash2, MoreVertical, MessageSquare,
  RefreshCw, Grid, List, X, Check,
  Handshake, Factory, Box, Info,
  ShieldCheck, Package,
  Wrench, Monitor, TrendingUp, Users, Scale, LifeBuoy
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

const labelCls = "block text-xs font-semibold text-gray-600 mb-1.5";
const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm outline-none placeholder:text-gray-400";
const selectCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-sm outline-none";
const modalHeaderCls = "px-5 sm:px-6 py-4 flex items-center justify-between shrink-0 border-b border-gray-100";

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
  { id: 'equipment-tooling', name: 'Equipment & Tooling', icon: Wrench },
  { id: 'facilities-utilities', name: 'Facilities & Utilities', icon: Building2 },
  { id: 'it-software', name: 'IT & Software', icon: Monitor },
  { id: 'marketing-sales', name: 'Marketing & Sales', icon: TrendingUp },
  { id: 'quality-compliance', name: 'Quality & Compliance', icon: ShieldCheck },
  { id: 'hr-staffing', name: 'HR & Staffing', icon: Users },
  { id: 'finance-legal', name: 'Finance & Legal', icon: Scale },
  { id: 'aftersales-support', name: 'After-sales & Support', icon: LifeBuoy },
];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messagePriority, setMessagePriority] = useState('normal');
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | Supplier['status']>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierCategory, setNewSupplierCategory] = useState('');
  const [newSupplierContact, setNewSupplierContact] = useState('');
  const [newSupplierEmail, setNewSupplierEmail] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierLeadTime, setNewSupplierLeadTime] = useState('');
  const [newSupplierPaymentTerms, setNewSupplierPaymentTerms] = useState('net30');
  const [newSupplierWebsite, setNewSupplierWebsite] = useState('');
  const [newSupplierNotes, setNewSupplierNotes] = useState('');

  const fetchSuppliers = React.useCallback(async () => {
    try {
      const res = await fetch('/api/suppliers');
      if (res.ok) {
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = data.map((s: any): Supplier => ({
          id: s.id,
          name: s.name,
          companyName: s.name,
          contactPerson: s.contactName || '',
          email: s.email,
          phone: s.phone || '',
          address: s.address || '',
          city: '',
          country: '',
          category: s.category || 'services',
          status: (s.status?.toLowerCase() || 'active') as Supplier['status'],
          rating: s.rating || 0,
          totalOrders: s.totalOrders || 0,
          totalSpent: s.totalSpent || 0,
          lastOrder: new Date(),
          paymentTerms: s.paymentTerms || 'N/A',
          leadTime: s.leadTime || 'N/A',
          minimumOrder: 0,
          products: [],
          performance: { onTimeDelivery: 0, qualityScore: 0, responseTime: 0, priceCompetitiveness: 0 },
        }));
        setSuppliers(mapped);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  }, []);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handleAddSupplier = async () => {
    if (!newSupplierName || !newSupplierEmail) return;
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSupplierName,
          contactName: newSupplierContact,
          email: newSupplierEmail,
          phone: newSupplierPhone,
          category: newSupplierCategory,
          leadTime: newSupplierLeadTime,
          paymentTerms: newSupplierPaymentTerms,
          website: newSupplierWebsite,
          notes: newSupplierNotes,
        }),
      });
      if (res.ok) {
        await fetchSuppliers();
        setShowAddSupplier(false);
        setNewSupplierName(''); setNewSupplierCategory(''); setNewSupplierContact('');
        setNewSupplierEmail(''); setNewSupplierPhone(''); setNewSupplierLeadTime('');
        setNewSupplierPaymentTerms('net30'); setNewSupplierWebsite(''); setNewSupplierNotes('');
        showNotify('Supplier added successfully');
      } else {
        const err = await res.json();
        showNotify(err.error || 'Failed to add supplier', 'error');
      }
    } catch {
      showNotify('Failed to add supplier', 'error');
    }
  };

  const handleDeleteSupplier = async () => {
    if (!deletingSupplier) return;
    try {
      const res = await fetch(`/api/suppliers/${deletingSupplier.id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchSuppliers();
        setShowDetailModal(false);
        setSelectedSupplier(null);
        showNotify('Supplier removed');
      } else {
        showNotify('Failed to remove supplier', 'error');
      }
    } catch {
      showNotify('Failed to remove supplier', 'error');
    }
    setShowDeleteModal(false);
    setDeletingSupplier(null);
  };

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
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
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
      <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-600 flex items-center justify-center">
              <Handshake className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-none">
                Suppliers
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm font-medium mt-1.5">Strategic partnership management</p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:items-end">
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <button onClick={handleExport} className="p-2.5 bg-white hover:bg-gray-50 rounded-xl transition-all border border-gray-200 cursor-pointer" title="Export">
                <Download className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <button
              onClick={() => setShowAddSupplier(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl px-5 py-2.5 active:scale-95 transition-all w-full sm:w-auto cursor-pointer"
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
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider truncate">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900 leading-tight">{stat.value}</p>
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
        <div className="relative shrink-0">
          <button
            onClick={() => setShowFilterMenu(v => !v)}
            className={`flex items-center gap-2 px-3.5 py-2.5 border rounded-xl text-[11px] font-black transition-all cursor-pointer ${
              statusFilter !== 'all' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className={`w-4 h-4 ${statusFilter !== 'all' ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className="hidden sm:inline">{statusFilter === 'all' ? 'Filter' : getStatusConfig(statusFilter).label}</span>
          </button>
          {showFilterMenu && (
            <>
              <div className="fixed inset-0 z-60" onClick={() => setShowFilterMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-70 animate-in fade-in zoom-in duration-200">
                {(['all', 'active', 'inactive', 'pending', 'suspended'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setShowFilterMenu(false); }}
                    className={`w-full px-3.5 py-2.5 text-left text-[11px] font-black flex items-center gap-2.5 hover:bg-gray-50 transition-colors cursor-pointer ${statusFilter === s ? 'text-blue-600' : 'text-gray-700'}`}
                  >
                    {s === 'all' ? 'All statuses' : getStatusConfig(s).label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
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
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar-x">
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
        {/* Right fade to indicate more content */}
        <div className="pointer-events-none absolute right-0 top-0 h-[calc(100%-8px)] w-16 bg-linear-to-l from-slate-50 to-transparent" />
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
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Rating</p>
                  <p className="text-[10px] text-gray-400">{selectedSupplier.totalOrders} order{selectedSupplier.totalOrders !== 1 ? 's' : ''} placed</p>
                </div>
                {/* Clickable star rating */}
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} onClick={async () => {
                      await fetch(`/api/suppliers/${selectedSupplier.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ rating: star }),
                      });
                      await fetchSuppliers();
                      showNotify('Rating updated');
                    }} className="cursor-pointer transition-transform hover:scale-110">
                      <Star className={`w-6 h-6 ${star <= selectedSupplier.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                  <span className="text-sm font-black text-gray-700 ml-1">{selectedSupplier.rating > 0 ? `${selectedSupplier.rating}/5` : 'Not rated'}</span>
                </div>
                {selectedSupplier.totalOrders === 0 ? (
                  <p className="text-[11px] text-gray-400 italic">Performance metrics build up as you place orders with this supplier.</p>
                ) : (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-600">Orders Placed</span>
                      <span className="text-[11px] font-black text-gray-900">{selectedSupplier.totalOrders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-600">Total Spent</span>
                      <span className="text-[11px] font-black text-gray-900">£{selectedSupplier.totalSpent.toLocaleString()}</span>
                    </div>
                  </div>
                )}
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
          <div className="relative w-full sm:max-w-lg bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className={modalHeaderCls}>
              <div>
                <h2 className="text-sm sm:text-lg font-bold text-gray-900 tracking-tight">Add supplier</h2>
                <p className="text-[11px] text-gray-500 font-medium">Register a new supplier in your network</p>
              </div>
              <button onClick={() => setShowAddSupplier(false)} className="p-2.5 hover:bg-gray-100 rounded-xl transition-all cursor-pointer text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
              <div>
                <label className={labelCls}>Company name *</label>
                <input type="text" value={newSupplierName} onChange={(e) => setNewSupplierName(e.target.value)} placeholder="e.g. Acme Supplies Ltd" className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Category</label>
                  <select value={newSupplierCategory} onChange={(e) => setNewSupplierCategory(e.target.value)} className={selectCls}>
                    <option value="">Select</option>
                    {categoryConfigs.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Contact person *</label>
                  <input type="text" value={newSupplierContact} onChange={(e) => setNewSupplierContact(e.target.value)} placeholder="Full name" className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Email *</label>
                <input type="email" value={newSupplierEmail} onChange={(e) => setNewSupplierEmail(e.target.value)} placeholder="contact@supplier.com" className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Phone</label>
                  <input type="tel" value={newSupplierPhone} onChange={(e) => setNewSupplierPhone(e.target.value)} placeholder="+44 7000 000000" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Website</label>
                  <input type="url" value={newSupplierWebsite} onChange={(e) => setNewSupplierWebsite(e.target.value)} placeholder="https://" className={inputCls} />
                </div>
              </div>

              <div className="pt-1">
                <p className="text-xs font-semibold text-gray-600 mb-2.5 flex items-center gap-1.5">
                  <ShoppingCart className="w-3.5 h-3.5 text-gray-400" /> Order terms
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Payment terms</label>
                    <select value={newSupplierPaymentTerms} onChange={(e) => setNewSupplierPaymentTerms(e.target.value)} className={selectCls}>
                      <option value="net30">Net 30</option>
                      <option value="net60">Net 60</option>
                      <option value="net90">Net 90</option>
                      <option value="prepay">Prepayment</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Lead time</label>
                    <input type="text" value={newSupplierLeadTime} onChange={(e) => setNewSupplierLeadTime(e.target.value)} placeholder="e.g. 7-10 days" className={inputCls} />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-gray-400">Fields marked * are required.</p>
            </div>

            <div className="shrink-0 bg-white border-t border-gray-100 px-5 sm:px-6 py-3 flex flex-row gap-2.5 pb-[calc(1.25rem+env(safe-area-inset-bottom,12px))] sm:pb-3">
              <button type="button" onClick={() => setShowAddSupplier(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer active:scale-[0.98]">
                Cancel
              </button>
              <button type="button" onClick={handleAddSupplier}
                className="flex-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">
                <Plus className="w-4 h-4" /> Add supplier
              </button>
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
                disabled={!messageSubject || !messageBody || isOrdering}
                onClick={async () => {
                  setIsOrdering(true);
                  try {
                    const priorityLabel = messagePriority.charAt(0).toUpperCase() + messagePriority.slice(1);
                    const html = `
                      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
                        <div style="background:#2563eb;padding:20px 24px;border-radius:8px 8px 0 0">
                          <h2 style="color:#fff;margin:0;font-size:18px">Message from Okleevo</h2>
                          <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px">Priority: ${priorityLabel}</p>
                        </div>
                        <div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
                          <p style="margin:0 0 16px">Dear <strong>${selectedSupplier.contactPerson || selectedSupplier.name}</strong>,</p>
                          <div style="white-space:pre-wrap;font-size:14px;color:#1e293b;line-height:1.6">${messageBody}</div>
                          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>
                          <p style="margin:0;color:#94a3b8;font-size:12px">Sent via Okleevo Supplier Management</p>
                        </div>
                      </div>`;
                    const res = await fetch('/api/email/send', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        to: selectedSupplier.email,
                        subject: messageSubject,
                        html,
                        text: messageBody,
                      }),
                    });
                    if (res.ok) {
                      setShowMessageModal(false);
                      setMessageSubject('');
                      setMessageBody('');
                      showNotify(`Message sent to ${selectedSupplier.email}`);
                    } else {
                      showNotify('Failed to send message', 'error');
                    }
                  } catch {
                    showNotify('Failed to send message', 'error');
                  } finally {
                    setIsOrdering(false);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isOrdering ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                {isOrdering ? 'Sending…' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Place Order Modal ── */}
      {showOrderModal && selectedSupplier && (
        <div className="fixed inset-0 z-110 flex items-end sm:items-center justify-center p-0 sm:p-4 sm:pl-0 md:pl-64">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => { setShowOrderModal(false); setOrderQuantity(''); }} />
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
                  <input type="number" min="1" value={orderQuantity} onChange={e => setOrderQuantity(e.target.value)} placeholder="0" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
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
                disabled={isOrdering || !orderQuantity || parseInt(orderQuantity) < 1}
                onClick={async () => {
                  if (!orderQuantity || parseInt(orderQuantity) < 1) {
                    showNotify('Please enter a quantity', 'warning');
                    return;
                  }
                  setIsOrdering(true);
                  const poRef = `PO-${Date.now().toString(36).toUpperCase()}`;
                  const priority = messagePriority || 'standard';
                  const poHtml = `
                    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
                      <div style="background:#1d4ed8;padding:24px;border-radius:8px 8px 0 0">
                        <h1 style="color:#fff;margin:0;font-size:22px">Purchase Order</h1>
                        <p style="color:#bfdbfe;margin:4px 0 0">Ref: ${poRef}</p>
                      </div>
                      <div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
                        <p style="margin:0 0 16px">Dear <strong>${selectedSupplier.contactPerson || selectedSupplier.name}</strong>,</p>
                        <p style="margin:0 0 16px">We would like to place the following order:</p>
                        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
                          <tr style="background:#e0f2fe">
                            <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#0369a1">Field</th>
                            <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#0369a1">Detail</th>
                          </tr>
                          <tr style="border-bottom:1px solid #e2e8f0"><td style="padding:8px 12px;font-weight:600">Supplier</td><td style="padding:8px 12px">${selectedSupplier.name}</td></tr>
                          <tr style="border-bottom:1px solid #e2e8f0;background:#f8fafc"><td style="padding:8px 12px;font-weight:600">Quantity</td><td style="padding:8px 12px">${orderQuantity} units</td></tr>
                          <tr style="border-bottom:1px solid #e2e8f0"><td style="padding:8px 12px;font-weight:600">Priority</td><td style="padding:8px 12px;text-transform:capitalize">${priority}</td></tr>
                          <tr style="border-bottom:1px solid #e2e8f0;background:#f8fafc"><td style="padding:8px 12px;font-weight:600">Est. Delivery</td><td style="padding:8px 12px">${selectedSupplier.leadTime}</td></tr>
                          <tr><td style="padding:8px 12px;font-weight:600">PO Reference</td><td style="padding:8px 12px;font-family:monospace">${poRef}</td></tr>
                        </table>
                        <p style="margin:0 0 8px">Please confirm receipt of this order and provide an expected delivery date.</p>
                        <p style="margin:0;color:#64748b;font-size:13px">This purchase order was generated via Okleevo.</p>
                      </div>
                    </div>`;
                  try {
                    const res = await fetch('/api/email/send', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        to: selectedSupplier.email,
                        subject: `Purchase Order ${poRef} — Qty: ${orderQuantity} units`,
                        html: poHtml,
                        text: `Purchase Order ${poRef}\nSupplier: ${selectedSupplier.name}\nQuantity: ${orderQuantity} units\nPriority: ${priority}\nEst. Delivery: ${selectedSupplier.leadTime}`,
                      }),
                    });
                    if (res.ok) {
                      // Increment order count in DB
                      await fetch(`/api/suppliers/${selectedSupplier.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ incrementOrders: true, spentAmount: 0 }),
                      });
                      await fetchSuppliers();
                      setShowOrderModal(false);
                      setOrderQuantity('');
                      showNotify(`Purchase order ${poRef} emailed to ${selectedSupplier.email}`);
                    } else {
                      showNotify('Failed to send order email', 'error');
                    }
                  } catch {
                    showNotify('Failed to send order email', 'error');
                  } finally {
                    setIsOrdering(false);
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-50"
              >
                {isOrdering ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {isOrdering ? 'Sending PO…' : 'Place Order'}
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
          onConfirm={handleDeleteSupplier}
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
