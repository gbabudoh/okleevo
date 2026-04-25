"use client";

import React, { useState } from 'react';
import {
  Package, Plus, Search, Filter, Download, Upload,
  AlertTriangle, CheckCircle, DollarSign,
  Truck, Trash2, Eye, MoreVertical,
  Grid, List, Settings, Tag, MapPin,
  Box, Boxes, PackageX, PackagePlus, PackageMinus,
  Warehouse, Zap, Target, Activity,
  X, Check, QrCode, Scan, History, User,
  ClipboardList, ShoppingCart, Bell, FileText
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
        // Convert date strings to Date objects
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processedItems = data.items.map((item: any) => ({
          ...item,
          lastRestocked: item.lastRestocked ? new Date(item.lastRestocked) : new Date(item.updatedAt || item.createdAt),
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processedMovements = data.movements.map((m: any) => ({
          ...m,
          date: new Date(m.date)
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
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);

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
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.barcode && item.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in-stock':
        return { color: 'green', icon: CheckCircle, label: 'In Stock', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
      case 'low-stock':
        return { color: 'orange', icon: AlertTriangle, label: 'Low Stock', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
      case 'out-of-stock':
        return { color: 'red', icon: PackageX, label: 'Out of Stock', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
      case 'overstocked':
        return { color: 'blue', icon: PackagePlus, label: 'Overstocked', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      default:
        return { color: 'gray', icon: Package, label: 'Unknown', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const totalInventoryValue = items.reduce((acc, item) => acc + (item.totalValue || 0), 0);
  const lowStockItems = items.filter(item => ['low-stock', 'out-of-stock'].includes(item.status.toLowerCase())).length;
  const totalItems = items.reduce((acc, item) => acc + (item.quantity || 0), 0);

  return (
    <div className="relative min-h-screen">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[5%] left-[10%] w-[45%] h-[45%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-bounce duration-[12s]" />
        <div className="absolute top-[50%] left-[25%] w-[30%] h-[30%] bg-blue-600/5 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="relative z-10 space-y-8 pb-12">
        {/* Page Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border-2 border-white shadow-2xl shadow-indigo-500/5">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
              <div className="relative p-5 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                <Warehouse className="w-10 h-10 text-indigo-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-100">
                  Inventory
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-100">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Live
                </span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
                Stock <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600">Manager</span>
              </h1>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Track and manage your stock in real time</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 p-2 bg-white/80 backdrop-blur-md rounded-2xl border-2 border-gray-100 shadow-sm">
              <button
                onClick={() => {
                  setShowScanOverlay(true);
                  setTimeout(() => {
                    setShowScanOverlay(false);
                    showNotify('Barcode scanned successfully');
                  }, 3000);
                }}
                className="p-3 hover:bg-indigo-50 rounded-xl transition-all duration-300 group cursor-pointer"
                title="Scan Barcode"
              >
                <Scan className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
              </button>
              <div className="w-px h-6 bg-gray-100" />
              <button
                onClick={() => showNotify('Ready to import — choose a file to upload', 'info')}
                className="p-3 hover:bg-gray-50 rounded-xl transition-all duration-300 group cursor-pointer"
                title="Bulk Import"
              >
                <Upload className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
              </button>
              <button
                onClick={() => showNotify('Inventory exported successfully')}
                className="p-3 hover:bg-gray-50 rounded-xl transition-all duration-300 group cursor-pointer"
                title="Export"
              >
                <Download className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
              </button>
              <div className="w-px h-6 bg-gray-100" />
              <button
                onClick={() => showNotify('Stock settings opened', 'info')}
                className="p-3 hover:bg-gray-50 rounded-xl transition-all duration-300 group cursor-pointer"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:rotate-90" />
              </button>
            </div>

            <button
              onClick={() => setShowAddItem(true)}
              className="px-8 py-4 bg-gray-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-500 cursor-pointer flex items-center gap-3 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Add Item
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Stock Value', value: `£${totalInventoryValue.toLocaleString()}`, change: '+12.5%', icon: DollarSign, color: 'emerald', detail: 'Total value of all stock' },
            { label: 'Total Units', value: totalItems.toLocaleString(), change: '+8.2%', icon: Boxes, color: 'indigo', detail: 'Units across all products' },
            { label: 'Needs Attention', value: lowStockItems, change: 'REVIEW NOW', icon: AlertTriangle, color: 'rose', detail: 'Low stock & out of stock' },
            { label: 'Products', value: items.length, change: '+5.3%', icon: Package, color: 'blue', detail: 'Across all categories' }
          ].map((stat, i) => (
            <div key={i} className="group relative bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border-2 border-white shadow-xl shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-500 overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-full blur-3xl group-hover:bg-${stat.color}-500/10 transition-all duration-500`} />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-4 bg-${stat.color}-500 rounded-2xl shadow-lg shadow-${stat.color}-500/20 group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`px-3 py-1 bg-${stat.color}-50 text-${stat.color}-600 text-[10px] font-black tracking-widest uppercase rounded-full border border-${stat.color}-100`}>
                  {stat.change}
                </div>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 relative z-10">{stat.label}</p>
              <h3 className="text-3xl font-black text-gray-900 mb-1 relative z-10">{stat.value}</h3>
              <p className="text-xs font-bold text-gray-500 relative z-10">{stat.detail}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] border-2 border-white p-8 shadow-2xl shadow-indigo-500/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 italic uppercase tracking-tighter">
                <Zap className="w-6 h-6 text-indigo-600 animate-pulse" />
                Quick Actions
              </h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Tools and shortcuts</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
            {[
              { label: 'Shopify Sync', icon: ShoppingCart, color: 'blue', desc: 'Sync products' },
              { label: 'Ship Orders', icon: Truck, color: 'purple', desc: 'Manage shipments' },
              { label: 'Print Labels', icon: QrCode, color: 'emerald', desc: 'Print QR labels' },
              { label: 'Stock History', icon: History, color: 'orange', desc: 'View movements', onClick: () => setShowStockMovement(true) },
              { label: 'Low Stock Alerts', icon: Bell, color: 'indigo', desc: 'Set thresholds' },
              { label: 'Reports', icon: FileText, color: 'rose', desc: 'Detailed reports' }
            ].map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                className="group p-5 bg-white/80 hover:bg-white rounded-3xl border-2 border-white shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-500 text-center relative overflow-hidden cursor-pointer"
              >
                <div className={`absolute top-0 right-0 w-16 h-16 bg-${action.color}-500/5 rounded-full blur-2xl group-hover:bg-${action.color}-500/10 transition-all duration-500`} />
                <div className={`w-12 h-12 bg-${action.color}-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-${action.color}-500/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs font-black text-gray-900 mb-1 relative z-10">{action.label}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider relative z-10">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by name, SKU, or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white/60 backdrop-blur-xl border-2 border-white rounded-[2rem] shadow-xl shadow-indigo-500/5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-gray-900 placeholder:text-gray-400"
            />
            <div className="absolute inset-y-0 right-5 flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-gray-200">
                <kbd className="font-sans">CMD</kbd> K
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="px-8 py-5 bg-white/60 backdrop-blur-xl border-2 border-white rounded-[2rem] shadow-xl shadow-indigo-500/5 hover:bg-white hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] text-gray-600 cursor-pointer group">
              <Filter className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
              Filters
            </button>

            <div className="flex items-center gap-1 bg-white/60 backdrop-blur-xl border-2 border-white rounded-[2rem] p-1.5 shadow-xl shadow-indigo-500/5">
              {[
                { id: 'grid', icon: Grid },
                { id: 'list', icon: List }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as 'grid' | 'list')}
                  className={`p-3.5 rounded-2xl transition-all duration-500 cursor-pointer ${
                    viewMode === mode.id
                      ? 'bg-gray-900 text-white shadow-lg'
                      : 'text-gray-400 hover:bg-white hover:text-gray-900'
                  }`}
                >
                  <mode.icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {dynamicCategories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-500 cursor-pointer border-2 ${
                  isActive
                    ? 'bg-gray-900 text-white border-gray-900 shadow-2xl shadow-gray-900/20 -translate-y-1'
                    : 'bg-white/60 backdrop-blur-xl text-gray-400 border-white hover:border-gray-200 hover:text-gray-600 hover:-translate-y-0.5'
                }`}
              >
                <div className={`p-2 rounded-lg transition-colors duration-500 ${isActive ? 'bg-white/10' : 'bg-gray-50'}`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                </div>
                {category.name}
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                  isActive ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {category.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Inventory Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, idx) => {
              const statusConfig = getStatusConfig(item.status);
              const StatusIcon = statusConfig.icon;
              const stockPercentage = (item.quantity / item.maxStock) * 100;

              return (
                <div
                  key={item.id}
                  className="group relative bg-white/40 backdrop-blur-xl rounded-[2.5rem] border-2 border-white p-6 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-700 cursor-pointer overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both"
                  style={{ animationDelay: `${idx * 100}ms` }}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/60 rounded-full border border-white text-[10px] font-black text-gray-400">
                      <Box className="w-3 h-3" />
                      {item.unit}
                    </div>
                  </div>

                  <div className="relative mb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 italic">SKU: {item.sku}</p>
                        <h3 className="text-lg font-black text-gray-900 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors duration-500">
                          {item.name}
                        </h3>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-700" />
                        <div className="relative p-3 bg-white rounded-2xl shadow-lg shadow-indigo-500/5 group-hover:rotate-12 transition-transform duration-500">
                          <Package className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/40 rounded-3xl p-4 border border-white mb-6 relative overflow-hidden">
                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">In Stock</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-gray-900">{item.quantity}</span>
                          <span className="text-[10px] font-bold text-gray-400">/ {item.maxStock}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Capacity Used</p>
                        <span className={`text-sm font-black ${stockPercentage > 50 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {stockPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-white">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          stockPercentage > 50 ? 'bg-linear-to-r from-emerald-400 to-emerald-600' :
                          stockPercentage > 20 ? 'bg-linear-to-r from-orange-400 to-orange-600' : 'bg-linear-to-r from-rose-400 to-rose-600'
                        }`}
                        style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-white/40 rounded-2xl border border-white">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Unit Price</p>
                      <p className="text-sm font-black text-gray-900">£{item.unitPrice}</p>
                    </div>
                    <div className="p-3 bg-white/40 rounded-2xl border border-white">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Value</p>
                      <p className="text-sm font-black text-indigo-600 italic">£{item.totalValue.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 bg-gray-50/50 px-3 py-2 rounded-xl border border-gray-100">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="truncate max-w-[120px]">{item.location}</span>
                    </div>
                    <div className="flex items-center -space-x-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                          <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300" />
                        </div>
                      ))}
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-900 flex items-center justify-center text-[8px] font-black text-white">
                        +4
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-5 border-t border-white">
                    <button className="flex-1 py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300 group/btn cursor-pointer">
                      Adjust Stock
                    </button>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === item.id ? null : item.id);
                        }}
                        className="p-3 bg-white hover:bg-gray-50 rounded-xl border-2 border-white shadow-sm transition-all duration-300 group/ctx cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400 group-hover/ctx:text-indigo-600" />
                      </button>
                      {activeMenu === item.id && (
                        <>
                          <div className="fixed inset-0 z-[60]" onClick={() => setActiveMenu(null)} />
                          <div className="absolute right-0 bottom-full mb-4 w-48 bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl border-2 border-white py-2 z-[70] animate-in fade-in zoom-in duration-300">
                            {[
                              { label: 'View Details', icon: Eye, color: 'blue', onClick: () => setSelectedItem(item) },
                              { label: 'Stock History', icon: History, color: 'orange', onClick: () => setShowStockMovement(true) },
                              { label: 'Print Labels', icon: QrCode, color: 'emerald' },
                              { label: 'Delete Item', icon: Trash2, color: 'rose', danger: true, onClick: () => { setDeletingItem(item); setShowDeleteModal(true); } }
                            ].map((opt, i) => (
                              <button
                                key={i}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  opt.onClick?.();
                                  setActiveMenu(null);
                                }}
                                className={`w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest hover:bg-white flex items-center gap-3 transition-colors cursor-pointer ${opt.danger ? 'text-rose-500' : 'text-gray-600'}`}
                              >
                                <opt.icon className="w-4 h-4" />
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
          <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] border-2 border-white shadow-2xl shadow-indigo-500/5 overflow-hidden">
            <div className="overflow-auto max-h-[70vh] custom-scrollbar">
              <table className="min-w-[1200px] w-full text-left border-collapse">
                <thead className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl">
                  <tr className="border-b-2 border-gray-100">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Item</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Quantity</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Value</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Location</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/60">
                    {filteredItems.map((item) => {
                      const statusConfig = getStatusConfig(item.status);
                      const StatusIcon = statusConfig.icon;
                      const isActive = activeMenu === item.id;
                      return (
                        <tr key={item.id} className={`group hover:bg-white/40 transition-all duration-500 ${isActive ? 'relative z-50 bg-white/40' : ''}`}>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                              <Package className="w-6 h-6 text-gray-400 group-hover:text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-0.5">SKU: {item.sku}</p>
                              <p className="font-black text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors duration-500">{item.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div>
                            <p className="text-sm font-black text-gray-900">{item.quantity} <span className="text-[10px] font-bold text-gray-400 uppercase">{item.unit}</span></p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reorder at {item.reorderPoint}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div>
                            <p className="text-sm font-black text-indigo-600 italic">£{item.totalValue.toLocaleString()}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">£{item.unitPrice}/unit</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            <MapPin className="w-4 h-4 text-indigo-400" />
                            {item.location}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedItem(item)}
                              className="p-3 bg-white/60 hover:bg-white rounded-xl border border-white shadow-sm transition-all duration-300 group/btn cursor-pointer"
                            >
                              <Eye className="w-4 h-4 text-gray-400 group-hover/btn:text-indigo-600" />
                            </button>
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenu(activeMenu === item.id ? null : item.id);
                                }}
                                className="p-3 bg-white/60 hover:bg-white rounded-xl border border-white shadow-sm transition-all duration-300 group/btn cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-400 group-hover/btn:text-indigo-600" />
                              </button>
                              {activeMenu === item.id && (
                                <>
                                  <div className="fixed inset-0 z-[60]" onClick={() => setActiveMenu(null)} />
                                  <div className="absolute right-full top-0 mr-2 w-48 bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl border-2 border-white py-2 z-[70] animate-in fade-in zoom-in slide-in-from-right-2 duration-300">
                                    {[
                                      { label: 'View Details', icon: Eye, color: 'blue', onClick: () => { setSelectedItem(item); showNotify('Loading item details', 'info'); } },
                                      { label: 'Stock History', icon: History, color: 'orange', onClick: () => { setShowStockMovement(true); showNotify('Loading stock history', 'info'); } },
                                      { label: 'Print Labels', icon: QrCode, color: 'emerald', onClick: () => showNotify('Labels sent to printer') },
                                      { label: 'Delete Item', icon: Trash2, color: 'rose', danger: true, onClick: () => { setDeletingItem(item); setShowDeleteModal(true); } }
                                    ].map((opt, i) => (
                                      <button
                                        key={i}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          opt.onClick?.();
                                          setActiveMenu(null);
                                        }}
                                        className={`w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest hover:bg-white flex items-center gap-3 transition-colors cursor-pointer ${opt.danger ? 'text-rose-500' : 'text-gray-600'}`}
                                      >
                                        <opt.icon className="w-4 h-4" />
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

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-500">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] max-w-lg w-full max-h-[85vh] overflow-hidden border-2 border-white shadow-2xl flex flex-col relative">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-2 bg-white hover:bg-gray-50 rounded-xl shadow-lg border-2 border-gray-100 transition-all z-20 cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="p-5 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col items-center mb-6">
                <div className="mb-3">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-[11px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-200">
                    {selectedItem.category}
                  </span>
                </div>

                <div className="w-20 h-20 bg-white rounded-2xl shadow-xl shadow-indigo-500/10 flex items-center justify-center mb-4 group overflow-hidden border-2 border-white">
                  <Package className="w-10 h-10 text-gray-200 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700" />
                </div>

                <div className="text-center mb-5">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-1">Item details</p>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight mb-1">
                    {selectedItem.name}
                  </h2>
                  <p className="text-sm font-bold text-gray-400 max-w-sm mx-auto">
                    {selectedItem.description || "No description available."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <div className="p-3 bg-white/60 rounded-2xl border-2 border-white shadow-sm flex flex-col items-center text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Item Info</p>
                    <p className="text-xs font-black text-gray-900 font-mono italic">ID: {selectedItem.id}</p>
                    <p className="text-xs font-black text-indigo-600 font-mono uppercase tracking-tighter">SKU: {selectedItem.sku}</p>
                  </div>
                  <button
                    onClick={() => showNotify('QR code generated')}
                    className="p-3 bg-gray-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-0.5"
                  >
                    <QrCode className="w-4 h-4 mb-0.5" />
                    <span className="text-[10px]">Print QR</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'In Stock', value: `${selectedItem.quantity} ${selectedItem.unit}`, icon: Boxes, color: 'indigo' },
                  { label: 'Total Value', value: `£${selectedItem.totalValue.toLocaleString()}`, icon: DollarSign, color: 'emerald' },
                  { label: 'Min / Max Stock', value: `${selectedItem.minStock} / ${selectedItem.maxStock}`, icon: Activity, color: 'blue' },
                  { label: 'Reorder At', value: selectedItem.reorderPoint, icon: Target, color: 'orange' }
                ].map((stat, i) => (
                  <div key={i} className="p-3.5 bg-gray-50/50 rounded-2xl border-2 border-white shadow-sm flex items-center gap-3">
                    <div className={`w-8 h-8 bg-${stat.color}-500 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-${stat.color}-500/20`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                      <p className="text-sm font-black text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-white rounded-2xl border-2 border-gray-100 shadow-sm">
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      Storage Location
                    </h4>
                    <p className="text-sm font-black text-gray-900 mb-0.5">{selectedItem.location}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Shelf / Zone</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border-2 border-gray-100 shadow-sm">
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <User className="w-3 h-3" />
                      Supplier
                    </h4>
                    <p className="text-sm font-black text-gray-900 mb-0.5">{selectedItem.supplier}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Primary supplier</p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border-2 border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                     <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <History className="w-3 h-3" />
                       Last Restocked
                    </h4>
                    <span className="text-xs font-black text-indigo-600 tracking-tighter">
                      {selectedItem.lastRestocked instanceof Date && !isNaN(selectedItem.lastRestocked.getTime()) 
                        ? selectedItem.lastRestocked.toLocaleDateString() 
                        : "Never"}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-500 leading-relaxed italic">
                    No stock issues reported in the last 30 days.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedItem.tags?.map((tag, i) => (
                    <span key={i} className="px-3 py-1.5 bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-gray-100">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="pt-4 flex gap-2">
                  <button
                    onClick={() => {
                      showNotify('Item updated successfully');
                      setSelectedItem(null);
                    }}
                    className="flex-1 py-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-black transition-all duration-500 cursor-pointer active:scale-95 shadow-xl shadow-indigo-500/10"
                  >
                    Edit Item
                  </button>
                  <button
                    onClick={() => {
                      setDeletingItem(selectedItem);
                      setShowDeleteModal(true);
                    }}
                    className="p-4 bg-white text-rose-500 rounded-xl border-2 border-white shadow-lg hover:bg-rose-50 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Movement History Modal */}
      {showStockMovement && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-500">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] max-w-xl w-full max-h-[80vh] overflow-hidden border-2 border-white shadow-2xl flex flex-col">
            <div className="p-8 border-b-2 border-gray-50 flex items-center justify-between sticky top-0 bg-white/50 backdrop-blur-xl z-20">
              <div>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Activity Log
                </p>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Stock History</h2>
              </div>
              <button
                onClick={() => setShowStockMovement(false)}
                className="p-3 hover:bg-gray-100 rounded-2xl transition-all cursor-pointer border-2 border-transparent hover:border-gray-200"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-gray-50/30">
              <div className="relative space-y-6 before:absolute before:inset-0 before:ml-4 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {stockMovements.map((movement, idx) => {
                  const isInbound = movement.type === 'in';
                  return (
                    <div key={movement.id} className="relative flex items-center group animate-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shadow-lg z-10 shrink-0 ${isInbound ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                        {isInbound ? <PackagePlus className="w-3 h-3 text-white" /> : <PackageMinus className="w-3 h-3 text-white" />}
                      </div>

                      <div className="ml-6 flex-1 bg-white p-5 rounded-[1.5rem] border-2 border-white shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <time className="text-[8px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md">
                            {movement.date instanceof Date && !isNaN(movement.date.getTime()) 
                              ? movement.date.toLocaleDateString() 
                              : "N/A"}
                          </time>
                          <div className={`text-[12px] font-black ${isInbound ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isInbound ? '+' : '-'}{movement.quantity}
                          </div>
                        </div>

                        <h4 className="text-xs font-black text-gray-900 leading-tight mb-1">{movement.itemName}</h4>
                        <p className="text-[10px] font-bold text-gray-400 italic mb-2">{movement.reason}</p>

                        <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                          <div className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center text-[8px] font-black">
                            {movement.user.charAt(0)}
                          </div>
                          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{movement.user}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 border-t-2 border-gray-50 bg-white/50 backdrop-blur-xl">
              <button
                onClick={() => showNotify('Report downloaded', 'info')}
                className="w-full py-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-indigo-600 transition-all duration-500 cursor-pointer flex items-center justify-center gap-3"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-500">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] max-w-2xl w-full max-h-[85vh] overflow-hidden border-2 border-white shadow-2xl flex flex-col relative">
            <div className="p-8 border-b-2 border-gray-50 flex items-center justify-between bg-white/50 backdrop-blur-xl z-20">
              <div>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-1 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Item
                </p>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Add Item to Inventory</h2>
              </div>
              <button
                onClick={() => setShowAddItem(false)}
                className="p-3 hover:bg-gray-100 rounded-2xl transition-all cursor-pointer border-2 border-transparent hover:border-gray-200"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Item Name</label>
                    <input type="text" placeholder="e.g. Blue T-Shirt (Size M)" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 transition-all font-bold text-gray-900 text-xs outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">SKU</label>
                    <input type="text" placeholder="Auto-generated" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 transition-all font-mono font-bold text-indigo-600 text-xs outline-none uppercase" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 transition-all font-bold text-gray-700 text-xs outline-none">
                      <option value="">Select Category</option>
                      {dynamicCategories.filter(c => c.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantity</label>
                    <input type="number" placeholder="0" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 transition-all font-bold text-gray-900 text-xs outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Unit</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 transition-all font-bold text-gray-700 text-xs outline-none">
                      <option value="pcs">pcs</option>
                      <option value="kg">kg</option>
                      <option value="units">units</option>
                    </select>
                  </div>
                </div>

                {/* Pricing */}
                <div className="p-6 bg-gray-900 rounded-[2rem] shadow-xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />
                   <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                        <DollarSign className="w-3 h-3" />
                        Pricing
                      </h4>
                      <p className="text-xl font-black text-white">£0.00</p>
                   </div>
                   <input type="number" step="0.01" placeholder="Unit price" className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:border-indigo-500 transition-all font-bold text-white text-xs outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Supplier</label>
                    <input type="text" placeholder="e.g. ABC Supplies Ltd" className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:border-indigo-500 text-xs font-bold text-gray-900 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Storage Location</label>
                    <input type="text" placeholder="e.g. Shelf A, Row 3" className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:border-indigo-500 text-xs font-bold text-gray-900 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Min. Stock Level</label>
                    <input type="number" placeholder="5" className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:border-indigo-500 text-xs font-bold text-gray-900 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Max. Stock Level</label>
                    <input type="number" placeholder="100" className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:border-indigo-500 text-xs font-bold text-gray-900 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t-2 border-gray-50 flex items-center justify-end bg-white/50 backdrop-blur-xl">
              <button
                onClick={() => setShowAddItem(false)}
                className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors mr-6 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showNotify('Item added to inventory');
                  setShowAddItem(false);
                }}
                className="px-8 py-4 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all duration-500 cursor-pointer active:scale-95"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingItem(null);
          }}
          onConfirm={() => {
            setItems(items.filter(item => item.id !== deletingItem.id));
            setSelectedItem(null);
            alert('Item deleted successfully');
          }}
          title="Delete Inventory Item"
          itemName={deletingItem.name}
          itemDetails={`SKU: ${deletingItem.sku} - Qty: ${deletingItem.quantity} ${deletingItem.unit}`}
          warningMessage="This will permanently remove this item from your inventory records."
        />
      )}

      {/* Notifications */}
      {notification && (
        <div className="fixed bottom-8 right-8 z-[100] animate-in fade-in slide-in-from-right-8 duration-500">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border-2 ${
            notification.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-indigo-600 border-indigo-500 text-white'
          }`}>
            {notification.type === 'success' ? <Check className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
            <p className="text-xs font-black uppercase tracking-[0.2em]">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Scan Overlay */}
      {showScanOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-md animate-in fade-in duration-500">
          <div className="relative w-80 h-80">
            <div className="absolute inset-0 border-4 border-white/20 rounded-[3rem]" />
            <div className="absolute inset-10 border-2 border-indigo-500/50 rounded-[2rem] animate-pulse" />
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.8)] animate-scan-y" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <QrCode className="w-16 h-16 mb-4 animate-bounce" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Scanning barcode...</p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
