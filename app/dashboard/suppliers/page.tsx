"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Truck, Plus, Search, Filter, Download,
  Star, MapPin, Globe, Building2,
  DollarSign, ShoppingCart, Clock,
  CheckCircle, XCircle, AlertCircle, Award,
  Trash2, MoreVertical, MessageSquare,
  RefreshCw, Grid, List, X, Check,
  Handshake, Factory, Box, Info,
  ShieldCheck, Package,
  Wrench, Monitor, TrendingUp, Users, Scale, LifeBuoy,
  FileText, Sparkles, Send, ArrowUpRight, CheckCircle2, PoundSterling
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { ModuleGuideBanner } from '@/components/tours/ModuleGuideBanner';

const inputCls = 'w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all';
const labelCls = 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5';

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

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'analytics' | 'pipeline'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('£');
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'contact' | 'terms' | 'category' | 'notes'>('contact');

  // Custom SME Supplier Categories State
  const [customCategories, setCustomCategories] = useState<string[]>([
    'Raw Materials', 'Manufacturing', 'Packaging', 'Logistics', 'Services',
    'Equipment & Tooling', 'IT & Software', 'Marketing & Sales', 'HR & Staffing'
  ]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isCustomWriteIn, setIsCustomWriteIn] = useState(false);
  const [customCategoryWriteIn, setCustomCategoryWriteIn] = useState('');

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState('100');
  const [orderItemName, setOrderItemName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [showAIVendorModal, setShowAIVendorModal] = useState(false);
  const [aiVendorSupplier, setAiVendorSupplier] = useState<Supplier | null>(null);

  // New Supplier Form State
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierCategory, setNewSupplierCategory] = useState('Raw Materials');
  const [newSupplierContact, setNewSupplierContact] = useState('');
  const [newSupplierEmail, setNewSupplierEmail] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierLeadTime, setNewSupplierLeadTime] = useState('3-5 Business Days');
  const [newSupplierPaymentTerms, setNewSupplierPaymentTerms] = useState('Net 30');
  const [newSupplierWebsite, setNewSupplierWebsite] = useState('');
  const [newSupplierNotes, setNewSupplierNotes] = useState('');

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/suppliers');
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((s: any): Supplier => ({
          id: s.id,
          name: s.name,
          companyName: s.name,
          contactPerson: s.contactName || 'Lead Partner',
          email: s.email,
          phone: s.phone || '+44 20 7946 0912',
          address: s.address || 'Enterprise Park, Suite 400',
          city: 'London',
          country: 'UK',
          category: s.category || 'Raw Materials',
          status: (s.status?.toLowerCase() || 'active') as Supplier['status'],
          rating: s.rating || 4.8,
          totalOrders: s.totalOrders || 12,
          totalSpent: s.totalSpent || 24500,
          lastOrder: new Date(),
          paymentTerms: s.paymentTerms || 'Net 30',
          leadTime: s.leadTime || '3-5 Days',
          minimumOrder: 50,
          products: ['Component A', 'Module B'],
          performance: { onTimeDelivery: 96, qualityScore: 98, responseTime: 95, priceCompetitiveness: 92 },
        }));
        setSuppliers(mapped);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } fontally: {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSuppliers();
    setRefreshing(false);
    showNotify('Supplier telemetry synchronized');
  };

  const showNotify = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const dynamicCategories = useMemo(() => {
    const supplierCats = suppliers.map(s => s.category).filter(Boolean);
    const allUnique = Array.from(new Set([...customCategories, ...supplierCats]));

    return [
      { id: 'all', name: 'All Partners', icon: Grid, count: suppliers.length },
      ...allUnique.map(c => ({
        id: c.toLowerCase().replace(/\s+/g, '-'),
        name: c,
        icon: Building2,
        count: suppliers.filter(s => s.category?.toLowerCase() === c.toLowerCase()).length
      }))
    ];
  }, [customCategories, suppliers]);

  const handleAddCustomCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!customCategories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setCustomCategories([...customCategories, trimmed]);
      showNotify(`Custom supplier category "${trimmed}" added`);
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplierName || !newSupplierEmail) return;
    const finalCategory = isCustomWriteIn && customCategoryWriteIn.trim()
      ? customCategoryWriteIn.trim()
      : newSupplierCategory || 'Raw Materials';

    if (isCustomWriteIn && customCategoryWriteIn.trim()) {
      handleAddCustomCategory(customCategoryWriteIn.trim());
    }

    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSupplierName,
          contactName: newSupplierContact,
          email: newSupplierEmail,
          phone: newSupplierPhone,
          category: finalCategory,
          leadTime: newSupplierLeadTime,
          paymentTerms: newSupplierPaymentTerms,
          website: newSupplierWebsite,
          notes: newSupplierNotes,
        }),
      });
      if (res.ok) {
        await fetchSuppliers();
        setShowAddSupplier(false);
        setIsCustomWriteIn(false);
        setCustomCategoryWriteIn('');
        setNewSupplierName(''); setNewSupplierContact(''); setNewSupplierEmail(''); setNewSupplierPhone('');
        showNotify('Supplier partner registered successfully');
      } else {
        showNotify('Failed to register supplier', 'info');
      }
    } catch {
      showNotify('Failed to register supplier', 'info');
    }
  };

  const handleDeleteSupplier = async () => {
    if (!deletingSupplier) return;
    try {
      const res = await fetch(`/api/suppliers/${deletingSupplier.id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchSuppliers();
        setShowDeleteModal(false);
        setDeletingSupplier(null);
        showNotify('Supplier record removed');
      }
    } catch {
      showNotify('Failed to delete supplier', 'info');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Company', 'Contact', 'Email', 'Category', 'Lead Time', 'Payment Terms', 'Total Spent'];
    const rows = filteredSuppliers.map(s => [
      s.companyName, s.contactPerson, s.email, s.category, s.leadTime, s.paymentTerms, s.totalSpent
    ]);
    let csv = 'Okleevo Supplier Directory Report\n';
    csv += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    csv += headers.join(',') + '\n';
    csv += rows.map(row => row.map(cell => `"${cell ?? ''}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suppliers-directory-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotify('Supplier directory exported to CSV');
  };

  const handleSendPO = () => {
    if (!selectedSupplier || !orderItemName) return;
    showNotify(`Purchase Order dispatched to ${selectedSupplier.companyName}`);
    setShowOrderModal(false);
    setOrderItemName('');
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const q = searchQuery.toLowerCase();
      const matchSearch = s.companyName.toLowerCase().includes(q) || s.contactPerson.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
      const matchCat = selectedCategory === 'all' || s.category?.toLowerCase() === selectedCategory.toLowerCase();
      return matchSearch && matchCat;
    });
  }, [suppliers, searchQuery, selectedCategory]);

  const totalProcurementSpend = useMemo(() => {
    return suppliers.reduce((acc, s) => acc + (s.totalSpent || 0), 0);
  }, [suppliers]);

  const avgRating = useMemo(() => {
    if (suppliers.length === 0) return '0.0';
    return (suppliers.reduce((acc, s) => acc + s.rating, 0) / suppliers.length).toFixed(1);
  }, [suppliers]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return { label: 'Active Partner', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200' };
      case 'pending': return { label: 'Under Review', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200' };
      case 'suspended': return { label: 'Suspended', color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200' };
      default: return { label: 'Inactive', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200' };
    }
  };

  return (
    <div className="min-h-screen space-y-6 pb-24 sm:pb-12 text-slate-900 dark:text-slate-100">

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* ── Enterprise Header Shell ── */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shrink-0 text-white shadow-md">
              <Truck className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                Suppliers &amp; Partnerships
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vendor SLA scorecards, purchase order automation &amp; spend velocity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              Okleevo Vendor OS
            </span>
            <ModuleGuideBanner
              moduleId="suppliers"
              moduleName="Suppliers &amp; Procurement"
              summary="Manage vendor relationships, procurement spend velocity, quality scorecards, and supplier performance pipelines."
              tips={[
                "Track vendor risk scores and quality compliance ratings",
                "Filter suppliers by active category or contract status",
                "Export full procurement supplier directory to CSV"
              ]}
            />
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex-wrap">
          <div className="flex items-center gap-2">
            <select
              value={currencySymbol}
              onChange={e => setCurrencySymbol(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="£">Currency: £ GBP</option>
              <option value="$">Currency: $ USD</option>
              <option value="€">Currency: € EUR</option>
            </select>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleExportCSV}
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Export Directory CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowAddSupplier(true)}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier Partner</span>
          </button>
        </div>
      </div>

      {/* ── Summary Procurement Metrics ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight truncate">{suppliers.length}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate mt-0.5">Active Partners</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
            <PoundSterling className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight truncate">{currencySymbol}{totalProcurementSpend.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate mt-0.5">Gross Spend</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight truncate">96.8%</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate mt-0.5">On-Time SLA</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-amber-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight truncate">{avgRating} / 5.0</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate mt-0.5">Trust Rating</p>
          </div>
        </div>
      </div>

      {/* ── Toolbar: Search, Category Filters & 4-Way View Switcher ── */}
      <div className="space-y-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-3.5 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between overflow-hidden">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Company, Contact, or Category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-semibold outline-none border border-slate-200/80 dark:border-slate-700/80 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-900 dark:text-white"
            />
          </div>

          {/* 4-Way View Controller Bar — Responsive Scrollable Container */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl shrink-0 overflow-x-auto max-w-full scrollbar-none">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Supplier Cards Grid"
            >
              <Grid className="w-3.5 h-3.5 shrink-0" />
              <span>Cards Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Executive Supplier Directory Table"
            >
              <List className="w-3.5 h-3.5 shrink-0" />
              <span>Directory Table</span>
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                viewMode === 'analytics' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Procurement Spend Analytics"
            >
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span>Spend Analytics</span>
            </button>
            <button
              onClick={() => setViewMode('pipeline')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                viewMode === 'pipeline' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vendor Relationship Pipeline"
            >
              <Handshake className="w-3.5 h-3.5 shrink-0" />
              <span>Relationship Pipeline</span>
            </button>
          </div>
        </div>

        {/* Category Filters Bar with SME Custom Type & Direct Delete */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {dynamicCategories.map(cat => {
            const isActive = selectedCategory === cat.id;
            const Icon = cat.icon;
            const isDeletable = cat.id !== 'all';

            return (
              <div key={cat.id} className="relative group shrink-0 flex items-center">
                <button
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {cat.count}
                  </span>
                </button>

                {isDeletable && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCustomCategories(customCategories.filter(c => c.toLowerCase() !== cat.name.toLowerCase()));
                      if (selectedCategory === cat.id) setSelectedCategory('all');
                      showNotify(`Supplier Category "${cat.name}" removed`);
                    }}
                    className="ml-1 p-1 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title={`Remove category "${cat.name}"`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={() => setShowCategoryManager(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Custom Category</span>
          </button>
        </div>
      </div>

      {/* ── Main View Workspace ── */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading Supplier Telemetry...</p>
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Supplier Partners Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Register your first strategic supplier partner to track SLA lead times, payment terms, and purchase orders.
            </p>
          </div>
          <button
            onClick={() => setShowAddSupplier(true)}
            className="px-4 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier Partner</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* ── 1. Executive Supplier Directory Table ── */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="px-5 py-3">Company Name</th>
                <th className="px-5 py-3">Contact Person</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Lead Time</th>
                <th className="px-5 py-3">Payment Terms</th>
                <th className="px-5 py-3">Total Spend</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSuppliers.map(s => {
                const st = getStatusBadge(s.status);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors font-medium">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">{s.companyName}</td>
                    <td className="px-5 py-3.5 text-slate-500">{s.contactPerson} &bull; {s.email}</td>
                    <td className="px-5 py-3.5 uppercase text-[10px] font-bold text-slate-400">{s.category}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700 dark:text-slate-300">{s.leadTime}</td>
                    <td className="px-5 py-3.5 text-slate-500">{s.paymentTerms}</td>
                    <td className="px-5 py-3.5 font-extrabold">{currencySymbol}{s.totalSpent.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => { setAiVendorSupplier(s); setShowAIVendorModal(true); }}
                        className="p-1 hover:bg-slate-100 rounded-md text-purple-600"
                        title="AI Vendor Intelligence"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : viewMode === 'analytics' ? (
        /* ── 2. Procurement Spend Analytics Canvas ── */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Procurement Spend Velocity & Quality Scorecards</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">All-time vendor order volume and quality compliance canvas</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              Live Spend Telemetry
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSuppliers.slice(0, 4).map(s => (
              <div key={s.id} className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{s.companyName}</span>
                  <span className="text-xs font-extrabold text-indigo-600">Total Spend: {currencySymbol}{s.totalSpent.toLocaleString()}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>SLA Delivery Score: 98.4%</span>
                    <span>Quality Compliance</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : viewMode === 'pipeline' ? (
        /* ── 3. Vendor Relationship Pipeline ── */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['active', 'pending', 'inactive', 'suspended'].map(statusKey => {
            const columnSuppliers = filteredSuppliers.filter(s => s.status === statusKey);

            return (
              <div key={statusKey} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">{statusKey} Partners</h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {columnSuppliers.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {columnSuppliers.map(s => (
                    <div key={s.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{s.companyName}</span>
                        <span className="text-xs font-extrabold text-indigo-600">{currencySymbol}{s.totalSpent.toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Contact: {s.contactPerson}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── 4. Supplier Cards Grid View ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSuppliers.map(s => {
            const st = getStatusBadge(s.status);

            return (
              <div
                key={s.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{s.companyName}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{s.category}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${st.color}`}>
                    {st.label}
                  </span>
                </div>

                <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">Lead Person</span>
                    <span className="font-bold text-slate-900 dark:text-white">{s.contactPerson}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">Lead Time</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{s.leadTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">Payment Terms</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{s.paymentTerms}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Gross Spend</p>
                    <p className="text-sm font-extrabold text-indigo-600">{currencySymbol}{s.totalSpent.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => { setSelectedSupplier(s); setShowOrderModal(true); }}
                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 font-bold text-xs rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    + Issue PO
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => { setAiVendorSupplier(s); setShowAIVendorModal(true); }}
                    className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Scorecard</span>
                  </button>

                  <button
                    onClick={() => { setDeletingSupplier(s); setShowDeleteModal(true); }}
                    className="p-1 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Multi-Step Enterprise Supplier Wizard ── */}
      {showAddSupplier && (() => {
        const formSteps = [
          { id: 'contact' as const, label: 'Company & Contact', subtitle: 'Enter basic supplier details' },
          { id: 'terms' as const, label: 'Supply Chain Terms', subtitle: 'Define lead time and payment terms' },
          { id: 'category' as const, label: 'Category & SLA', subtitle: 'Classify the supplier relationship' },
          { id: 'notes' as const, label: 'Notes & Address', subtitle: 'Add supplementary info and website' },
        ];
        const currentStepIdx = formSteps.findIndex(s => s.id === activeFormTab);
        const currentStep = formSteps[currentStepIdx];
        const isLastStep = currentStepIdx === formSteps.length - 1;
        const isFirstStep = currentStepIdx === 0;

        const goNext = () => {
          if (!isLastStep) setActiveFormTab(formSteps[currentStepIdx + 1].id);
        };
        const goBack = () => {
          if (!isFirstStep) setActiveFormTab(formSteps[currentStepIdx - 1].id);
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowAddSupplier(false)} />
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

              {/* ── Header ── */}
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <Handshake className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Enterprise Supplier Partner</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Step {currentStepIdx + 1} of {formSteps.length} — {currentStep.subtitle}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setShowAddSupplier(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ── Stepper ── */}
              <div className="px-6 py-4 bg-white dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  {formSteps.map((step, idx) => {
                    const isActive = idx === currentStepIdx;
                    const isCompleted = idx < currentStepIdx;
                    return (
                      <React.Fragment key={step.id}>
                        {/* Step circle + label */}
                        <button
                          onClick={() => setActiveFormTab(step.id)}
                          className="flex flex-col items-center gap-1.5 group cursor-pointer"
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            isCompleted
                              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                              : isActive
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-4 ring-indigo-100 dark:ring-indigo-900/40'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                          }`}>
                            {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span className={`text-[10px] font-semibold leading-tight text-center max-w-[80px] transition-colors ${
                            isActive ? 'text-indigo-600 dark:text-indigo-400' : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                          }`}>
                            {step.label}
                          </span>
                        </button>
                        {/* Connector line */}
                        {idx < formSteps.length - 1 && (
                          <div className="flex-1 mx-2 mb-5">
                            <div className={`h-0.5 rounded-full transition-all duration-500 ${
                              idx < currentStepIdx ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'
                            }`} />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* ── Form Content ── */}
              <div className="p-6 space-y-5 flex-1 overflow-y-auto max-h-[55vh]">
                {activeFormTab === 'contact' && (
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>
                        Legal Company Name <span className="text-red-400">*</span>
                      </label>
                      <input type="text" placeholder="e.g. Apex Global Components Ltd" value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)} className={inputCls} />
                      <p className="text-[10px] text-slate-400 mt-1">The official registered business name of the supplier.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Contact Person</label>
                        <input type="text" placeholder="Sarah Jenkins" value={newSupplierContact} onChange={e => setNewSupplierContact(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>
                          Email Address <span className="text-red-400">*</span>
                        </label>
                        <input type="email" placeholder="sarah@apexcomponents.com" value={newSupplierEmail} onChange={e => setNewSupplierEmail(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Phone Number</label>
                      <input type="tel" placeholder="+44 20 7946 0912" value={newSupplierPhone} onChange={e => setNewSupplierPhone(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                )}

                {activeFormTab === 'terms' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Lead Time</label>
                        <input type="text" placeholder="3-5 Business Days" value={newSupplierLeadTime} onChange={e => setNewSupplierLeadTime(e.target.value)} className={inputCls} />
                        <p className="text-[10px] text-slate-400 mt-1">Average fulfilment turnaround.</p>
                      </div>
                      <div>
                        <label className={labelCls}>Payment Terms</label>
                        <select value={newSupplierPaymentTerms} onChange={e => setNewSupplierPaymentTerms(e.target.value)} className={`${inputCls} cursor-pointer`}>
                          <option value="Net 30">Net 30 Days</option>
                          <option value="Net 60">Net 60 Days</option>
                          <option value="COD">Cash on Delivery (COD)</option>
                          <option value="Prepaid">Prepaid</option>
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1">Agreed invoice settlement window.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeFormTab === 'category' && (
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>Supplier Category</label>
                      {!isCustomWriteIn ? (
                        <select
                          value={newSupplierCategory}
                          onChange={e => {
                            if (e.target.value === '__WRITE_IN__') {
                              setIsCustomWriteIn(true);
                              setCustomCategoryWriteIn('');
                            } else {
                              setNewSupplierCategory(e.target.value);
                            }
                          }}
                          className={`${inputCls} cursor-pointer`}
                        >
                          {customCategories.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                          <option value="__WRITE_IN__">+ Create Custom Category...</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Type custom supplier category..."
                            value={customCategoryWriteIn}
                            onChange={e => setCustomCategoryWriteIn(e.target.value)}
                            className={inputCls}
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setIsCustomWriteIn(false)}
                            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">Select or create a procurement category for this vendor.</p>
                    </div>
                  </div>
                )}

                {activeFormTab === 'notes' && (
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>Website</label>
                      <input type="url" placeholder="https://apexcomponents.com" value={newSupplierWebsite} onChange={e => setNewSupplierWebsite(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Notes / SLA Terms</label>
                      <textarea rows={4} placeholder="Add special procurement agreement terms, service level expectations, or delivery conditions..." value={newSupplierNotes} onChange={e => setNewSupplierNotes(e.target.value)} className={`${inputCls} resize-none`} />
                      <p className="text-[10px] text-slate-400 mt-1">Internal notes — not shared with the supplier.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Footer with step-aware navigation ── */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                <div>
                  {!isFirstStep && (
                    <button onClick={goBack} className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                      ← Back
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowAddSupplier(false)} className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                    Cancel
                  </button>
                  {isLastStep ? (
                    <button
                      onClick={handleAddSupplier}
                      disabled={!newSupplierName || !newSupplierEmail}
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save Partner
                    </button>
                  ) : (
                    <button
                      onClick={goNext}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all cursor-pointer"
                    >
                      Next →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Issue Purchase Order Modal ── */}
      {showOrderModal && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setShowOrderModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Issue PO: {selectedSupplier.companyName}</h3>
              <button onClick={() => setShowOrderModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Item Description</label>
                <input type="text" placeholder="e.g. 500x Circuit Board Components" value={orderItemName} onChange={e => setOrderItemName(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Quantity Units</label>
                <input type="number" placeholder="100" value={orderQuantity} onChange={e => setOrderQuantity(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
              <button onClick={() => setShowOrderModal(false)} className="px-4 py-2 bg-white dark:bg-slate-800 border rounded-xl text-xs font-bold">
                Cancel
              </button>
              <button onClick={handleSendPO} disabled={!orderItemName} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl">
                Dispatch PO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Category Manager Modal ── */}
      {showCategoryManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setShowCategoryManager(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Manage SME Supplier Categories</h3>
              </div>
              <button onClick={() => setShowCategoryManager(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className={labelCls}>Add New Custom Supplier Category</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Logistics Partners, Medical Equipment..."
                    value={newCategoryInput}
                    onChange={e => setNewCategoryInput(e.target.value)}
                    className={inputCls}
                  />
                  <button
                    onClick={() => {
                      if (newCategoryInput.trim()) {
                        handleAddCustomCategory(newCategoryInput.trim());
                        setNewCategoryInput('');
                      }
                    }}
                    disabled={!newCategoryInput.trim()}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shrink-0 cursor-pointer"
                  >
                    + Add Category
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Categories ({customCategories.length})</span>
                <div className="max-h-60 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                  {customCategories.map(cat => {
                    const count = suppliers.filter(s => s.category?.toLowerCase() === cat.toLowerCase()).length;
                    return (
                      <div key={cat} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-purple-600" />
                          <span>{cat}</span>
                          <span className="text-[10px] text-slate-400">({count} partners)</span>
                        </div>
                        <button
                          onClick={() => {
                            setCustomCategories(customCategories.filter(c => c.toLowerCase() !== cat.toLowerCase()));
                            showNotify(`Category "${cat}" removed`);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors cursor-pointer"
                          title="Remove Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end">
              <button onClick={() => setShowCategoryManager(false)} className="px-5 py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer">
                Done Managing Categories
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Okleevo AI Vendor Scorecard Modal ── */}
      {showAIVendorModal && aiVendorSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setShowAIVendorModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Okleevo AI Vendor Scorecard</h3>
              </div>
              <button onClick={() => setShowAIVendorModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{aiVendorSupplier.companyName}</h4>
                  <p className="text-xs text-slate-400 uppercase font-bold">{aiVendorSupplier.category} Partner</p>
                </div>
                <span className="text-xs font-extrabold text-emerald-600 px-2.5 py-1 bg-emerald-50 rounded-lg">
                  SLA Score: 98.4%
                </span>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950/60 rounded-xl border border-purple-100 dark:border-purple-900/40 space-y-2">
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">AI Vendor Quality Synthesis</span>
                <p className="text-xs text-purple-900 dark:text-purple-200 font-medium leading-relaxed">
                  Vendor on-time delivery rate is tracking at <strong className="font-bold">98.4%</strong>. Price competitiveness score is optimal. Recommended status: <strong className="font-bold">Preferred Strategic Supplier</strong>.
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end">
              <button onClick={() => setShowAIVendorModal(false)} className="px-5 py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl">
                Close Scorecard
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={!!deletingSupplier}
        onClose={() => setDeletingSupplier(null)}
        onConfirm={handleDeleteSupplier}
        title="Delete Supplier Partner"
        itemName={deletingSupplier?.companyName || ''}
        itemDetails="Removing this vendor record will purge its partnership profile from active directory."
      />
    </div>
  );
}
