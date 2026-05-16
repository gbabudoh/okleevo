"use client";

import React, { useState } from 'react';
import {
  Package, Plus, Search, Filter, Download, Upload,
  AlertTriangle, CheckCircle, DollarSign,
  Truck, Trash2, Eye, MoreVertical,
  Grid, List, Tag, MapPin,
  Box, Boxes, PackageX, PackagePlus, PackageMinus,
  Warehouse, Zap, Target, Activity,
  X, Check, QrCode, Scan, History, User,
  ClipboardList, ShoppingCart, Bell, FileText, RefreshCw
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

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

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processedItems = data.items.map((item: any) => ({
          ...item,
          lastRestocked: item.lastRestocked ? new Date(item.lastRestocked) : new Date(item.updatedAt || item.createdAt),
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processedMovements = data.movements.map((m: any) => ({
          ...m,
          date: new Date(m.date),
        }));
        setItems(processedItems);
        setStockMovements(processedMovements);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  React.useEffect(() => {
    fetchInventory();
  }, []);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showStockMovement, setShowStockMovement] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showScanOverlay, setShowScanOverlay] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const dynamicCategories = [
    { id: 'all', name: 'All Items', icon: Grid, count: items.length },
    { id: 'electronics', name: 'Electronics', icon: Zap, count: items.filter(i => i.category?.toLowerCase() === 'electronics').length },
    { id: 'clothing', name: 'Clothing', icon: Tag, count: items.filter(i => i.category?.toLowerCase() === 'clothing').length },
    { id: 'food', name: 'Food & Beverage', icon: Package, count: items.filter(i => i.category?.toLowerCase() === 'food').length },
    { id: 'furniture', name: 'Furniture', icon: Box, count: items.filter(i => i.category?.toLowerCase() === 'furniture').length },
    { id: 'supplies', name: 'Supplies', icon: ClipboardList, count: items.filter(i => i.category?.toLowerCase() === 'supplies').length },
  ];

  const showNotify = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.barcode && item.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in-stock':
        return { icon: CheckCircle, label: 'In Stock', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
      case 'low-stock':
        return { icon: AlertTriangle, label: 'Low Stock', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
      case 'out-of-stock':
        return { icon: PackageX, label: 'Out of Stock', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' };
      case 'overstocked':
        return { icon: PackagePlus, label: 'Overstocked', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' };
      default:
        return { icon: Package, label: 'Unknown', bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400' };
    }
  };

  const totalInventoryValue = items.reduce((acc, item) => acc + (item.totalValue || 0), 0);
  const lowStockItems = items.filter(item => ['low-stock', 'out-of-stock'].includes(item.status.toLowerCase())).length;
  const totalUnits = items.reduce((acc, item) => acc + (item.quantity || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-24 md:pb-10">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-600 via-indigo-700 to-purple-800 p-6 sm:p-8 text-white shadow-xl shadow-indigo-200/40">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 left-12 w-40 h-40 bg-purple-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-white/15 rounded-lg">
                <Warehouse className="w-4 h-4 text-white" />
              </div>
              <span className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Stock Manager</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-1">
              Inventory Control
            </h1>
            <p className="text-indigo-300 text-sm font-medium">Real-time stock tracking and management</p>
          </div>

          <div className="flex flex-col gap-2.5 sm:items-end">
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <button
                onClick={() => { setShowScanOverlay(true); setTimeout(() => { setShowScanOverlay(false); showNotify('Barcode scanned'); }, 2000); }}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20 cursor-pointer"
                title="Scan barcode"
              >
                <Scan className="w-4 h-4 text-white" />
              </button>
              <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20 cursor-pointer" title="Import">
                <Upload className="w-4 h-4 text-white" />
              </button>
              <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20 cursor-pointer" title="Export">
                <Download className="w-4 h-4 text-white" />
              </button>
              <button onClick={fetchInventory} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20 cursor-pointer" title="Refresh">
                <RefreshCw className="w-4 h-4 text-white" />
              </button>
            </div>
            <button
              onClick={() => setShowAddItem(true)}
              className="flex items-center justify-center gap-2 bg-white text-indigo-700 font-black text-sm rounded-xl px-5 py-2.5 shadow-lg hover:bg-indigo-50 active:scale-95 transition-all w-full sm:w-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Stock Value', value: `£${totalInventoryValue.toLocaleString()}`, sub: 'Total value', icon: DollarSign, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
          { label: 'Total Units', value: totalUnits.toLocaleString(), sub: 'All products', icon: Boxes, iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
          { label: 'Alerts', value: String(lowStockItems), sub: 'Need attention', icon: AlertTriangle, iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
          { label: 'Products', value: String(items.length), sub: 'All categories', icon: Package, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
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

      {/* ── Quick Actions ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {[
          { label: 'Shopify Sync', icon: ShoppingCart, color: 'text-blue-500' },
          { label: 'Ship Orders', icon: Truck, color: 'text-purple-500' },
          { label: 'Print Labels', icon: QrCode, color: 'text-emerald-500' },
          { label: 'Stock History', icon: History, color: 'text-amber-500', onClick: () => setShowStockMovement(true) },
          { label: 'Low Stock Alerts', icon: Bell, color: 'text-indigo-500' },
          { label: 'Reports', icon: FileText, color: 'text-rose-500' },
        ].map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-gray-100 rounded-xl text-[11px] font-black text-gray-700 whitespace-nowrap hover:shadow-md hover:border-gray-200 transition-all cursor-pointer shrink-0"
          >
            <action.icon className={`w-3.5 h-3.5 ${action.color}`} />
            {action.label}
          </button>
        ))}
      </div>

      {/* ── Search + Controls ── */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, SKU, or barcode…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-[11px] font-black text-gray-600 hover:bg-gray-50 transition-all cursor-pointer shrink-0">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="hidden sm:inline">Filters</span>
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
        {dynamicCategories.map(cat => {
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

      {/* ── Items ── */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-gray-100">
          <Package className="w-10 h-10 text-gray-200" />
          <p className="text-sm font-bold text-gray-400">No items found</p>
          <button
            onClick={() => setShowAddItem(true)}
            className="mt-1 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-black rounded-xl hover:bg-indigo-700 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add First Item
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredItems.map(item => {
            const sc = getStatusConfig(item.status);
            const stockPct = Math.min((item.quantity / Math.max(item.maxStock, 1)) * 100, 100);
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-lg hover:shadow-gray-100 transition-all cursor-pointer group"
              >
                {/* Status + unit */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${sc.bg} ${sc.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {sc.label}
                  </span>
                  <span className="text-[10px] font-black text-gray-400 uppercase">{item.unit}</span>
                </div>

                {/* Name + SKU */}
                <div className="mb-3">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider mb-0.5">{item.sku}</p>
                  <h3 className="text-sm font-black text-gray-900 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {item.name}
                  </h3>
                </div>

                {/* Stock level bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-gray-400 font-bold">Stock</span>
                    <span className="text-xs font-black text-gray-900">
                      {item.quantity} <span className="text-gray-400 font-normal text-[10px]">/ {item.maxStock}</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        stockPct > 50 ? 'bg-emerald-500' : stockPct > 20 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${stockPct}%` }}
                    />
                  </div>
                </div>

                {/* Price + Value */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Unit</p>
                    <p className="text-xs font-black text-gray-900">£{item.unitPrice}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Total</p>
                    <p className="text-xs font-black text-indigo-600">£{item.totalValue.toLocaleString()}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 mb-3 text-[10px] text-gray-400 font-bold">
                  <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                  <button
                    onClick={(e) => { e.stopPropagation(); showNotify('Adjust stock coming soon', 'info'); }}
                    className="flex-1 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wide rounded-xl hover:bg-indigo-700 transition-all cursor-pointer"
                  >
                    Adjust
                  </button>
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.id ? null : item.id); }}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    {activeMenu === item.id && (
                      <>
                        <div className="fixed inset-0 z-60" onClick={() => setActiveMenu(null)} />
                        <div className="absolute right-0 bottom-full mb-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-70 animate-in fade-in zoom-in duration-200">
                          {[
                            { label: 'View Details', icon: Eye, onClick: () => setSelectedItem(item) },
                            { label: 'Stock History', icon: History, onClick: () => setShowStockMovement(true) },
                            { label: 'Print Labels', icon: QrCode, onClick: () => showNotify('Labels sent to printer') },
                            { label: 'Delete Item', icon: Trash2, danger: true, onClick: () => { setDeletingItem(item); setShowDeleteModal(true); } },
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
            );
          })}
        </div>
      ) : (
        /* List view */
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Value</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredItems.map(item => {
                  const sc = getStatusConfig(item.status);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-indigo-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">{item.sku}</p>
                            <p className="text-sm font-black text-gray-900">{item.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-black text-gray-900">{item.quantity} <span className="text-gray-400 text-xs font-normal">{item.unit}</span></p>
                        <p className="text-[10px] text-gray-400">Reorder at {item.reorderPoint}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-black text-indigo-600">£{item.totalValue.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400">£{item.unitPrice}/unit</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          {item.location}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="p-2 bg-gray-100 hover:bg-indigo-100 rounded-xl transition-all cursor-pointer group/eye"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-500 group-hover/eye:text-indigo-600 transition-colors" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.id ? null : item.id); }}
                              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
                            >
                              <MoreVertical className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                            {activeMenu === item.id && (
                              <>
                                <div className="fixed inset-0 z-60" onClick={() => setActiveMenu(null)} />
                                <div className="absolute right-0 bottom-full mb-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-70 animate-in fade-in zoom-in duration-200">
                                  {[
                                    { label: 'View Details', icon: Eye, onClick: () => { setSelectedItem(item); showNotify('Loading item details', 'info'); } },
                                    { label: 'Stock History', icon: History, onClick: () => { setShowStockMovement(true); showNotify('Loading stock history', 'info'); } },
                                    { label: 'Print Labels', icon: QrCode, onClick: () => showNotify('Labels sent to printer') },
                                    { label: 'Delete Item', icon: Trash2, danger: true, onClick: () => { setDeletingItem(item); setShowDeleteModal(true); } },
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

      {/* ── Item Detail Modal ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 sm:pl-0 md:pl-64">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
          <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
            {/* Handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">{selectedItem.sku}</p>
                  <h2 className="text-base font-black text-gray-900 leading-tight">{selectedItem.name}</h2>
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[11px] font-black uppercase tracking-wider rounded-full">
                  {selectedItem.category}
                </span>
                {(() => {
                  const sc = getStatusConfig(selectedItem.status);
                  return (
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  );
                })()}
              </div>

              {selectedItem.description && (
                <p className="text-sm text-gray-500 leading-relaxed">{selectedItem.description}</p>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'In Stock', value: `${selectedItem.quantity} ${selectedItem.unit}`, icon: Boxes, iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
                  { label: 'Total Value', value: `£${selectedItem.totalValue.toLocaleString()}`, icon: DollarSign, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
                  { label: 'Min / Max', value: `${selectedItem.minStock} / ${selectedItem.maxStock}`, icon: Activity, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
                  { label: 'Reorder At', value: String(selectedItem.reorderPoint), icon: Target, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-2xl">
                    <div className={`p-2 rounded-lg ${stat.iconBg} shrink-0`}>
                      <stat.icon className={`w-3.5 h-3.5 ${stat.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{stat.label}</p>
                      <p className="text-sm font-black text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Location + Supplier */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3.5 bg-white border border-gray-100 rounded-2xl">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Location</p>
                  </div>
                  <p className="text-sm font-black text-gray-900">{selectedItem.location}</p>
                </div>
                <div className="p-3.5 bg-white border border-gray-100 rounded-2xl">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Supplier</p>
                  </div>
                  <p className="text-sm font-black text-gray-900">{selectedItem.supplier}</p>
                </div>
              </div>

              {/* Last restocked */}
              <div className="flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-2xl">
                <div className="flex items-center gap-2">
                  <History className="w-3.5 h-3.5 text-indigo-400" />
                  <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Last Restocked</p>
                </div>
                <p className="text-sm font-black text-gray-900">
                  {selectedItem.lastRestocked instanceof Date && !isNaN(selectedItem.lastRestocked.getTime())
                    ? selectedItem.lastRestocked.toLocaleDateString()
                    : 'Never'}
                </p>
              </div>

              {/* Tags */}
              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedItem.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-wider rounded-lg">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Print QR */}
              <button
                onClick={() => showNotify('QR code generated')}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-indigo-600 transition-all cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                Print QR Label
              </button>
            </div>

            {/* Footer */}
            <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex gap-2.5 shrink-0">
              <button
                onClick={() => { showNotify('Item updated successfully'); setSelectedItem(null); }}
                className="flex-1 py-3 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-indigo-700 transition-all cursor-pointer"
              >
                Edit Item
              </button>
              <button
                onClick={() => { setDeletingItem(selectedItem); setShowDeleteModal(true); }}
                className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all cursor-pointer border border-red-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stock History Modal ── */}
      {showStockMovement && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 sm:pl-0 md:pl-64">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowStockMovement(false)} />
          <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider mb-0.5">Activity Log</p>
                <h2 className="text-lg font-black text-gray-900">Stock History</h2>
              </div>
              <button onClick={() => setShowStockMovement(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4">
              {stockMovements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <History className="w-8 h-8 text-gray-200" />
                  <p className="text-sm font-bold text-gray-400">No stock movements yet</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {stockMovements.map(movement => {
                    const isIn = movement.type === 'in';
                    return (
                      <div key={movement.id} className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-2xl">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isIn ? 'bg-emerald-100' : 'bg-red-100'}`}>
                          {isIn
                            ? <PackagePlus className="w-4 h-4 text-emerald-600" />
                            : <PackageMinus className="w-4 h-4 text-red-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-black text-gray-900 truncate">{movement.itemName}</p>
                            <span className={`text-sm font-black shrink-0 ${isIn ? 'text-emerald-600' : 'text-red-600'}`}>
                              {isIn ? '+' : '-'}{movement.quantity}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mb-1">{movement.reason}</p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            <span>
                              {movement.date instanceof Date && !isNaN(movement.date.getTime())
                                ? movement.date.toLocaleDateString()
                                : 'N/A'}
                            </span>
                            <span>·</span>
                            <span>{movement.user}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={() => showNotify('Report downloaded', 'info')}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-indigo-600 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Item Modal ── */}
      {showAddItem && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 sm:pl-0 md:pl-64">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowAddItem(false)} />
          <div className="relative w-full sm:max-w-2xl bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92dvh]">
            {/* Sidebar — desktop only */}
            <div className="hidden md:flex w-64 bg-gray-950 p-7 text-white flex-col justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-3 leading-tight">Add to Inventory</h2>
                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                  Fill in the product details to add it to your stock.
                </p>
                <div className="space-y-2.5">
                  {[
                    { icon: Box, label: 'Product Info', sub: 'Name, SKU, category' },
                    { icon: DollarSign, label: 'Pricing', sub: 'Unit price and value' },
                    { icon: Warehouse, label: 'Storage', sub: 'Location and supplier' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
                      <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-indigo-400" />
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
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  SKU is auto-generated if left blank.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0">
                <div>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider mb-0.5">New Item</p>
                  <h2 className="text-lg font-black text-gray-900">Add to Inventory</h2>
                </div>
                <button onClick={() => setShowAddItem(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1 space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Item Name *</label>
                    <input type="text" placeholder="e.g. Blue T-Shirt (Size M)" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">SKU</label>
                    <input type="text" placeholder="Auto-generated" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold text-indigo-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all uppercase" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Category</label>
                    <select className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all">
                      <option value="">Select</option>
                      {dynamicCategories.filter(c => c.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Quantity *</label>
                    <input type="number" placeholder="0" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Unit</label>
                    <select className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all">
                      <option value="pcs">pcs</option>
                      <option value="kg">kg</option>
                      <option value="units">units</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-gray-900 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-3 h-3" />
                      Unit Price *
                    </p>
                    <p className="text-lg font-black text-white">£0.00</p>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Supplier</label>
                    <input type="text" placeholder="e.g. ABC Supplies Ltd" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Storage Location</label>
                    <input type="text" placeholder="e.g. Shelf A, Row 3" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Min. Stock</label>
                    <input type="number" placeholder="5" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Max. Stock</label>
                    <input type="number" placeholder="100" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
                  </div>
                </div>

                {/* Buttons inside scroll on mobile only — extended scroll space */}
                <div className="flex items-center justify-end gap-3 pt-2 pb-32 sm:hidden">
                  <button
                    onClick={() => setShowAddItem(false)}
                    className="px-5 py-2.5 text-[11px] font-black text-gray-400 uppercase tracking-wider hover:text-gray-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { showNotify('Item added to inventory'); setShowAddItem(false); }}
                    className="px-6 py-2.5 bg-gray-900 text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-indigo-600 transition-all cursor-pointer active:scale-95"
                  >
                    Add Item
                  </button>
                </div>
              </div>

              {/* Sticky footer — desktop only */}
              <div className="hidden sm:flex px-5 sm:px-6 py-4 border-t border-gray-100 items-center justify-end gap-3 shrink-0">
                <button
                  onClick={() => setShowAddItem(false)}
                  className="px-5 py-2.5 text-[11px] font-black text-gray-400 uppercase tracking-wider hover:text-gray-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { showNotify('Item added to inventory'); setShowAddItem(false); }}
                  className="px-6 py-2.5 bg-gray-900 text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-indigo-600 transition-all cursor-pointer active:scale-95"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {deletingItem && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeletingItem(null); }}
          onConfirm={() => {
            setItems(items.filter(item => item.id !== deletingItem.id));
            setSelectedItem(null);
            showNotify('Item deleted successfully');
          }}
          title="Delete Inventory Item"
          itemName={deletingItem.name}
          itemDetails={`SKU: ${deletingItem.sku} - Qty: ${deletingItem.quantity} ${deletingItem.unit}`}
          warningMessage="This will permanently remove this item from your inventory records."
        />
      )}

      {/* ── Toast ── */}
      {notification && (
        <div className="fixed bottom-24 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-80 z-200 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-xl border ${
            notification.type === 'success'
              ? 'bg-emerald-600 border-emerald-500 text-white'
              : 'bg-gray-900 border-gray-700 text-white'
          }`}>
            <div className="p-1.5 rounded-lg bg-white/20 shrink-0">
              {notification.type === 'success' ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
            </div>
            <p className="text-sm font-black">{notification.message}</p>
          </div>
        </div>
      )}

      {/* ── Scan Overlay ── */}
      {showScanOverlay && (
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-gray-900/80 backdrop-blur-md">
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 border-4 border-white/20 rounded-3xl" />
            <div className="absolute inset-8 border-2 border-indigo-500/60 rounded-2xl animate-pulse" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3">
              <QrCode className="w-12 h-12 animate-bounce" />
              <p className="text-[11px] font-black uppercase tracking-widest">Scanning…</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
