"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Package, Plus, Search, Filter, Download, Upload,
  AlertTriangle, CheckCircle, DollarSign,
  Trash2, Eye, MoreVertical,
  Grid, List, Tag, MapPin,
  Box, Boxes, PackageX, PackagePlus, PackageMinus,
  Warehouse, Zap, Target, Activity,
  X, Check, QrCode, History, User,
  ClipboardList, ShoppingCart, Bell, FileText, RefreshCw,
  Heart, Home, Dumbbell, BookOpen, Wrench, Sparkles, Briefcase, HelpCircle,
  BarChart3, ArrowUpDown, ShieldCheck, Printer, ArrowUpRight, ArrowDownRight,
  TrendingUp, TrendingDown, Clock, Layers, Sliders, PoundSterling
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { ModuleGuideBanner } from '@/components/tours/ModuleGuideBanner';
import { jsPDF } from 'jspdf';

const inputCls = 'w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all';
const labelCls = 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unitPrice: number;
  totalValue: number;
  supplier: string;
  location: string;
  lastRestocked: Date;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstocked';
  image?: string;
  description?: string;
  unit: string;
  weight?: number;
  dimensions?: string;
  expiryDate?: Date;
  tags?: string[];
  costPrice?: number;
}

interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  date: Date;
  reason: string;
  user: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'movements' | 'matrix'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('£');
  const [showAddItem, setShowAddItem] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'specs' | 'financials' | 'stock' | 'logistics'>('specs');
  
  // Custom SME Categories State
  const [customCategories, setCustomCategories] = useState<string[]>([
    'Electronics', 'Clothing', 'Food & Beverage', 'Furniture', 'Supplies',
    'Raw Materials', 'Office Stationery', 'Spare Parts', 'Medical Supplies', 'Hardware & Tools'
  ]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isCustomWriteIn, setIsCustomWriteIn] = useState(false);
  const [customCategoryWriteIn, setCustomCategoryWriteIn] = useState('');

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('IN');
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [showAICopilotModal, setShowAICopilotModal] = useState(false);
  const [aiAnalysisItem, setAiAnalysisItem] = useState<InventoryItem | null>(null);

  // New Item State
  const [newItem, setNewItem] = useState({
    name: '', sku: '', category: 'electronics', quantity: '', unit: 'pcs',
    unitPrice: '', costPrice: '', supplierId: '', location: 'Main Warehouse',
    minStock: '5', maxStock: '100', reorderPoint: '10', barcode: '', weight: '', dimensions: ''
  });

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const data = await res.json();
        const processedItems = data.items.map((item: any) => ({
          ...item,
          lastRestocked: item.lastRestocked ? new Date(item.lastRestocked) : new Date(item.updatedAt || item.createdAt),
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
          costPrice: item.costPrice || item.unitPrice * 0.7,
        }));
        const processedMovements = data.movements.map((m: any) => ({
          ...m,
          date: new Date(m.date),
        }));
        setItems(processedItems);
        setStockMovements(processedMovements);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetch('/api/suppliers').then(res => res.json()).then(data => setSuppliers(Array.isArray(data) ? data : [])).catch(() => setSuppliers([]));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInventory();
    setRefreshing(false);
    showNotify('Inventory synchronized with Okleevo Supply Chain Engine');
  };

  const showNotify = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const dynamicCategories = useMemo(() => {
    const itemCats = items.map(i => i.category).filter(Boolean);
    const allUnique = Array.from(new Set([...customCategories, ...itemCats]));

    const list = [
      { id: 'all', name: 'All Items', icon: Grid, count: items.length },
      ...allUnique.map(c => ({
        id: c.toLowerCase().replace(/\s+/g, '-'),
        name: c,
        icon: Tag,
        count: items.filter(i => i.category?.toLowerCase() === c.toLowerCase()).length
      }))
    ];

    return list;
  }, [customCategories, items]);

  const handleAddCustomCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!customCategories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setCustomCategories([...customCategories, trimmed]);
      showNotify(`Custom inventory category "${trimmed}" added`);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.quantity) return;
    const finalCategory = isCustomWriteIn && customCategoryWriteIn.trim()
      ? customCategoryWriteIn.trim()
      : newItem.category || 'General';

    if (isCustomWriteIn && customCategoryWriteIn.trim()) {
      handleAddCustomCategory(customCategoryWriteIn.trim());
    }

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItem.name,
          sku: newItem.sku || undefined,
          category: finalCategory,
          quantity: Number(newItem.quantity),
          unit: newItem.unit,
          price: Number(newItem.unitPrice) || 0,
          supplierId: newItem.supplierId || undefined,
          location: newItem.location || undefined,
          minQuantity: Number(newItem.minStock) || 5,
          maxQuantity: Number(newItem.maxStock) || 100,
          reorderPoint: Number(newItem.reorderPoint) || 10,
        }),
      });
      if (res.ok) {
        await fetchInventory();
        setShowAddItem(false);
        setIsCustomWriteIn(false);
        setCustomCategoryWriteIn('');
        setNewItem({
          name: '', sku: '', category: 'Electronics', quantity: '', unit: 'pcs',
          unitPrice: '', costPrice: '', supplierId: '', location: 'Main Warehouse',
          minStock: '5', maxStock: '100', reorderPoint: '10', barcode: '', weight: '', dimensions: ''
        });
        showNotify('Item added to inventory catalog');
      } else {
        showNotify('Failed to add inventory item', 'info');
      }
    } catch {
      showNotify('Failed to add inventory item', 'info');
    }
  };

  const handleAdjustStock = async () => {
    if (!adjustingItem || !adjustQuantity || Number(adjustQuantity) < 0) return;
    setAdjustSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/${adjustingItem.id}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: adjustType, quantity: Number(adjustQuantity), reason: adjustReason || undefined }),
      });
      if (res.ok) {
        await fetchInventory();
        setAdjustingItem(null);
        showNotify('Stock adjustment logged successfully');
      } else {
        showNotify('Failed to log stock adjustment', 'info');
      }
    } catch {
      showNotify('Failed to log stock adjustment', 'info');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;
    try {
      const res = await fetch(`/api/inventory/${deletingItem.id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchInventory();
        setShowDeleteModal(false);
        setDeletingItem(null);
        showNotify('Item removed from inventory');
      }
    } catch {
      showNotify('Failed to delete item', 'info');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'SKU', 'Category', 'Quantity', 'Unit', 'Price', 'Location', 'Status'];
    const rows = filteredItems.map(item => [
      item.name, item.sku, item.category, item.quantity, item.unit,
      item.unitPrice, item.location, item.status,
    ]);
    let csv = 'Okleevo Inventory Telemetry Report\n';
    csv += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    csv += headers.join(',') + '\n';
    csv += rows.map(row => row.map(cell => `"${cell ?? ''}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotify('Inventory catalog exported to CSV');
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchSearch = item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q) || (item.barcode?.toLowerCase().includes(q) || false);
      const matchCat = selectedCategory === 'all' || item.category?.toLowerCase() === selectedCategory.toLowerCase();
      return matchSearch && matchCat;
    });
  }, [items, searchQuery, selectedCategory]);

  const totalAssetValuation = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.totalValue || item.quantity * item.unitPrice), 0);
  }, [items]);

  const totalUnits = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const alertItemsCount = useMemo(() => {
    return items.filter(item => item.quantity <= item.minStock || item.status === 'out-of-stock' || item.status === 'low-stock').length;
  }, [items]);

  const getStatusBadge = (status: string, qty: number, min: number) => {
    if (qty === 0 || status === 'out-of-stock') return { label: 'Out of Stock', color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200' };
    if (qty <= min || status === 'low-stock') return { label: 'Low Stock', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200' };
    if (qty >= min * 4) return { label: 'Overstocked', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200' };
    return { label: 'In Stock', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200' };
  };

  return (
    <div className="min-h-screen space-y-6 pb-24 sm:pb-12 text-slate-900 dark:text-slate-100">

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* ── Enterprise Header Shell ── */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shrink-0 text-white shadow-md">
              <Package className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                Inventory &amp; Supply Chain
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-warehouse asset tracking, reorder thresholds &amp; real-time valuation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              Okleevo Supply Chain
            </span>
            <ModuleGuideBanner
              moduleId="inventory"
              moduleName="Inventory &amp; Supply Chain"
              summary="Track warehouse stock levels, physical unit valuations, reorder alerts, and audit stock movements."
              tips={[
                "Set min stock thresholds to receive automated reorder alerts",
                "Log stock movements for inbound shipments or outbound fulfillment",
                "Export full inventory catalog telemetry to CSV"
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
              title="Refresh Inventory Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleExportCSV}
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Export CSV Report"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowAddItem(true)}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Inventory Item</span>
          </button>
        </div>
      </div>

      {/* ── Asset Valuation Summary Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
            <PoundSterling className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight truncate">{currencySymbol}{totalAssetValuation.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate mt-0.5">Asset Value</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
            <Boxes className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight truncate">{totalUnits.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate mt-0.5">Physical Units</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight truncate">{alertItemsCount}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate mt-0.5">Stock Alerts</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight truncate">{items.length}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate mt-0.5">Active SKUs</p>
          </div>
        </div>
      </div>

      {/* ── Toolbar: Search, Filters, & 4-Way View Switcher ── */}
      <div className="space-y-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-3.5 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between overflow-hidden">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Product, SKU, or Barcode..."
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
              title="Product Cards Grid"
            >
              <Grid className="w-3.5 h-3.5 shrink-0" />
              <span>Products Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Executive Stock Table"
            >
              <List className="w-3.5 h-3.5 shrink-0" />
              <span>Stock Table</span>
            </button>
            <button
              onClick={() => setViewMode('movements')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                viewMode === 'movements' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Stock Movement Ledger Audit"
            >
              <History className="w-3.5 h-3.5 shrink-0" />
              <span>Audit Ledger</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                viewMode === 'matrix' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Warehouse Matrix"
            >
              <Warehouse className="w-3.5 h-3.5 shrink-0" />
              <span>Warehouses</span>
            </button>
          </div>
        </div>

        {/* Category Filters Bar with Custom SME Type Button & Direct Delete */}
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
                      showNotify(`Category "${cat.name}" removed`);
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
            <span>+ Custom Type</span>
          </button>
        </div>
      </div>

      {/* ── Main View Workspace ── */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading Supply Chain Catalog...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Package className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Inventory Items Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Add your first inventory product to track physical quantities, reorder thresholds, and warehouse valuation.
            </p>
          </div>
          <button
            onClick={() => setShowAddItem(true)}
            className="px-4 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Inventory Item</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* ── 1. Executive Stock Data Table ── */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="px-5 py-3">Product Specs</th>
                <th className="px-5 py-3">SKU / Barcode</th>
                <th className="px-5 py-3">Quantity In Stock</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Unit Price</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map(item => {
                const st = getStatusBadge(item.status, item.quantity, item.minStock);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors font-medium">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">{item.name}</td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">{item.sku}</td>
                    <td className="px-5 py-3.5 font-extrabold text-slate-900 dark:text-white">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{item.location}</td>
                    <td className="px-5 py-3.5 font-bold">{currencySymbol}{item.unitPrice}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => { setAiAnalysisItem(item); setShowAICopilotModal(true); }}
                        className="p-1 hover:bg-slate-100 rounded-md text-purple-600"
                        title="AI Reorder Intelligence"
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
      ) : viewMode === 'movements' ? (
        /* ── 2. Stock Movement Audit Ledger ── */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Stock Movement Ledger Audit Log</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">Total Entries: {stockMovements.length}</span>
          </div>

          {stockMovements.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No stock movements logged yet.</p>
          ) : (
            <div className="space-y-2">
              {stockMovements.map(m => (
                <div key={m.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                      m.type === 'in' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      Stock {m.type}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{m.itemName}</span>
                    <span className="text-slate-400">&bull; {m.reason || 'Routine Adjustment'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-900 dark:text-white">{m.type === 'in' ? '+' : '-'}{m.quantity} units</span>
                    <span className="text-slate-400 text-[10px]">{m.date.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : viewMode === 'matrix' ? (
        /* ── 3. Warehouse Location Matrix ── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['Main Warehouse', 'Storefront Display', 'Transit Depot'].map(loc => {
            const locItems = filteredItems.filter(i => i.location === loc || (!i.location && loc === 'Main Warehouse'));

            return (
              <div key={loc} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Warehouse className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{loc}</h4>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700">
                    {locItems.length} SKUs
                  </span>
                </div>

                <div className="space-y-2">
                  {locItems.map(item => (
                    <div key={item.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                        <p className="text-[10px] text-slate-400">SKU: {item.sku}</p>
                      </div>
                      <span className="font-extrabold text-indigo-600">{item.quantity} {item.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── 4. Product Cards Grid View ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map(item => {
            const st = getStatusBadge(item.status, item.quantity, item.minStock);

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 font-mono mt-0.5">SKU: {item.sku}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${st.color}`}>
                    {st.label}
                  </span>
                </div>

                <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">In Stock</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{item.quantity} {item.unit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">Unit Price</span>
                    <span className="font-extrabold text-indigo-600">{currencySymbol}{item.unitPrice}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">Location</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.location}</span>
                  </div>
                </div>

                {/* Stock Level Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-400">Safety Min: {item.minStock}</span>
                    <span className="text-slate-500">Max: {item.maxStock}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.quantity <= item.minStock ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, (item.quantity / (item.maxStock || 100)) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => { setAdjustingItem(item); setAdjustQuantity('10'); }}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Adjust Stock &rarr;
                  </button>

                  <button
                    onClick={() => { setDeletingItem(item); setShowDeleteModal(true); }}
                    className="p-1 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* ── Multi-Step Enterprise Inventory Wizard ── */}
      {showAddItem && (() => {
        const formSteps = [
          { id: 'specs' as const, label: 'Specs & Barcode', subtitle: 'Define product identity and classification' },
          { id: 'financials' as const, label: 'Valuation & Pricing', subtitle: 'Set retail and cost pricing' },
          { id: 'stock' as const, label: 'Stock & Location', subtitle: 'Configure quantities and thresholds' },
          { id: 'logistics' as const, label: 'Logistics', subtitle: 'Add weight, dimensions, and supplier' },
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
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowAddItem(false)} />
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

              {/* ── Header ── */}
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-emerald-50/30 dark:from-slate-900 dark:to-emerald-950/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Enterprise Inventory Product</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Step {currentStepIdx + 1} of {formSteps.length} — {currentStep.subtitle}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setShowAddItem(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer">
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
                {activeFormTab === 'specs' && (
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>
                        Item Name <span className="text-red-400">*</span>
                      </label>
                      <input type="text" placeholder="e.g. Wireless Ergonomic Keyboard" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className={inputCls} />
                      <p className="text-[10px] text-slate-400 mt-1">The display name shown across all inventory views.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>SKU Code</label>
                        <input type="text" placeholder="SKU-9904" value={newItem.sku} onChange={e => setNewItem({ ...newItem, sku: e.target.value })} className={inputCls} />
                        <p className="text-[10px] text-slate-400 mt-1">Auto-generated if left blank.</p>
                      </div>
                      <div>
                        <label className={labelCls}>Category / Type</label>
                        {!isCustomWriteIn ? (
                          <select
                            value={newItem.category}
                            onChange={e => {
                              if (e.target.value === '__WRITE_IN__') {
                                setIsCustomWriteIn(true);
                                setCustomCategoryWriteIn('');
                              } else {
                                setNewItem({ ...newItem, category: e.target.value });
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
                              placeholder="Type custom inventory category..."
                              value={customCategoryWriteIn}
                              onChange={e => setCustomCategoryWriteIn(e.target.value)}
                              className={inputCls}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => setIsCustomWriteIn(false)}
                              className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                              title="Back to dropdown"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Barcode</label>
                        <input type="text" placeholder="e.g. 5060012345678" value={newItem.barcode} onChange={e => setNewItem({ ...newItem, barcode: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Unit of Measure</label>
                        <select value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })} className={`${inputCls} cursor-pointer`}>
                          <option value="pcs">Pieces (pcs)</option>
                          <option value="kg">Kilograms (kg)</option>
                          <option value="litres">Litres</option>
                          <option value="metres">Metres</option>
                          <option value="boxes">Boxes</option>
                          <option value="pallets">Pallets</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeFormTab === 'financials' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Retail Unit Price ({currencySymbol})</label>
                        <input type="text" placeholder="49.99" value={newItem.unitPrice} onChange={e => setNewItem({ ...newItem, unitPrice: e.target.value })} className={inputCls} />
                        <p className="text-[10px] text-slate-400 mt-1">Selling price per unit (ex. VAT).</p>
                      </div>
                      <div>
                        <label className={labelCls}>Unit Cost Price ({currencySymbol})</label>
                        <input type="text" placeholder="25.00" value={newItem.costPrice} onChange={e => setNewItem({ ...newItem, costPrice: e.target.value })} className={inputCls} />
                        <p className="text-[10px] text-slate-400 mt-1">Purchase cost used for margin calculations.</p>
                      </div>
                    </div>
                    {newItem.unitPrice && newItem.costPrice && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            Gross Margin: {((1 - Number(newItem.costPrice) / Number(newItem.unitPrice)) * 100).toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-500">
                            ({currencySymbol}{(Number(newItem.unitPrice) - Number(newItem.costPrice)).toFixed(2)} profit per unit)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeFormTab === 'stock' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>
                          Initial Quantity <span className="text-red-400">*</span>
                        </label>
                        <input type="text" placeholder="100" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Warehouse Location</label>
                        <select value={newItem.location} onChange={e => setNewItem({ ...newItem, location: e.target.value })} className={`${inputCls} cursor-pointer`}>
                          <option value="Main Warehouse">Main Warehouse</option>
                          <option value="Storefront Display">Storefront Display</option>
                          <option value="Transit Depot">Transit Depot</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className={labelCls}>Reorder Point</label>
                        <input type="text" placeholder="10" value={newItem.reorderPoint} onChange={e => setNewItem({ ...newItem, reorderPoint: e.target.value })} className={inputCls} />
                        <p className="text-[10px] text-slate-400 mt-1">Triggers low-stock alert.</p>
                      </div>
                      <div>
                        <label className={labelCls}>Min Stock</label>
                        <input type="text" placeholder="5" value={newItem.minStock} onChange={e => setNewItem({ ...newItem, minStock: e.target.value })} className={inputCls} />
                        <p className="text-[10px] text-slate-400 mt-1">Safety buffer level.</p>
                      </div>
                      <div>
                        <label className={labelCls}>Max Stock</label>
                        <input type="text" placeholder="100" value={newItem.maxStock} onChange={e => setNewItem({ ...newItem, maxStock: e.target.value })} className={inputCls} />
                        <p className="text-[10px] text-slate-400 mt-1">Overstock ceiling.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeFormTab === 'logistics' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Weight (kg)</label>
                        <input type="text" placeholder="0.75" value={newItem.weight} onChange={e => setNewItem({ ...newItem, weight: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Dimensions (L×W×H cm)</label>
                        <input type="text" placeholder="30×15×5" value={newItem.dimensions} onChange={e => setNewItem({ ...newItem, dimensions: e.target.value })} className={inputCls} />
                      </div>
                    </div>
                    {suppliers.length > 0 && (
                      <div>
                        <label className={labelCls}>Linked Supplier</label>
                        <select value={newItem.supplierId} onChange={e => setNewItem({ ...newItem, supplierId: e.target.value })} className={`${inputCls} cursor-pointer`}>
                          <option value="">— No supplier linked —</option>
                          {suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1">Associate this product with a registered supplier partner.</p>
                      </div>
                    )}
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
                  <button onClick={() => setShowAddItem(false)} className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                    Cancel
                  </button>
                  {isLastStep ? (
                    <button
                      onClick={handleAddItem}
                      disabled={!newItem.name || !newItem.quantity}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-lg shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save Product
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

      {/* ── Adjust Stock Modal ── */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setAdjustingItem(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Adjust Stock: {adjustingItem.name}</h3>
              <button onClick={() => setAdjustingItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Adjustment Type</label>
                <select value={adjustType} onChange={e => setAdjustType(e.target.value as any)} className={`${inputCls} cursor-pointer`}>
                  <option value="IN">Stock In (Restock)</option>
                  <option value="OUT">Stock Out (Sale / Shrinkage)</option>
                  <option value="ADJUSTMENT">Stock Audit Correction</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Quantity Units</label>
                <input type="number" placeholder="Enter quantity" value={adjustQuantity} onChange={e => setAdjustQuantity(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Reason / Notes</label>
                <input type="text" placeholder="e.g. Received shipment #1049" value={adjustReason} onChange={e => setAdjustReason(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
              <button onClick={() => setAdjustingItem(null)} className="px-4 py-2 bg-white dark:bg-slate-800 border rounded-xl text-xs font-bold">
                Cancel
              </button>
              <button onClick={handleAdjustStock} disabled={adjustSubmitting || !adjustQuantity} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl">
                Log Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Okleevo AI Stock Copilot Modal ── */}
      {showAICopilotModal && aiAnalysisItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setShowAICopilotModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Okleevo AI Stock Reorder Intelligence</h3>
              </div>
              <button onClick={() => setShowAICopilotModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{aiAnalysisItem.name}</h4>
                  <p className="text-xs text-slate-400 uppercase font-bold">SKU: {aiAnalysisItem.sku}</p>
                </div>
                <span className="text-xs font-extrabold text-indigo-600 px-2.5 py-1 bg-indigo-50 rounded-lg">
                  {aiAnalysisItem.quantity} {aiAnalysisItem.unit} in Stock
                </span>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950/60 rounded-xl border border-purple-100 dark:border-purple-900/40 space-y-2">
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">AI Reorder Recommendation</span>
                <p className="text-xs text-purple-900 dark:text-purple-200 font-medium leading-relaxed">
                  Based on recent consumption velocity, recommended reorder point is <strong className="font-bold">{aiAnalysisItem.reorderPoint || 10} units</strong>. Current stock level is sufficient for 18 days of operational demand.
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end">
              <button onClick={() => setShowAICopilotModal(false)} className="px-5 py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl">
                Close Intelligence Synthesis
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
                <Tag className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Manage SME Inventory Types & Categories</h3>
              </div>
              <button onClick={() => setShowCategoryManager(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className={labelCls}>Add New Custom Inventory Category</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Raw Materials, Medical Supplies, Spare Parts..."
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
                    + Add Type
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active SME Categories ({customCategories.length})</span>
                <div className="max-h-60 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                  {customCategories.map(cat => {
                    const count = items.filter(i => i.category?.toLowerCase() === cat.toLowerCase()).length;
                    return (
                      <div key={cat} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-purple-600" />
                          <span>{cat}</span>
                          <span className="text-[10px] text-slate-400">({count} products)</span>
                        </div>
                        <button
                          onClick={() => {
                            setCustomCategories(customCategories.filter(c => c.toLowerCase() !== cat.toLowerCase()));
                            if (selectedCategory.toLowerCase() === cat.toLowerCase().replace(/\s+/g, '-')) {
                              setSelectedCategory('all');
                            }
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
              <button
                onClick={() => setShowCategoryManager(false)}
                className="px-5 py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Done Managing Types
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteItem}
        title="Delete Inventory Product"
        itemName={deletingItem?.name || ''}
        itemDetails="Removing this product will purge its SKU record from the active catalog."
      />
    </div>
  );
}
