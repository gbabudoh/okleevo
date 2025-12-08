"use client";

import React, { useState } from 'react';
import { 
  Package, Plus, Search, Filter, Download, Upload, Barcode,
  AlertTriangle, CheckCircle, TrendingUp, TrendingDown, DollarSign,
  ShoppingCart, Truck, Archive, Edit3, Trash2, Eye, MoreVertical,
  Grid, List, RefreshCw, Settings, Bell, Tag, MapPin, Calendar,
  Box, Boxes, PackageCheck, PackageX, PackagePlus, PackageMinus,
  Warehouse, ClipboardList, FileText, Zap, Target, Activity,
  ArrowUpRight, ArrowDownRight, X, Check, ChevronRight, Star,
  QrCode, Scan, Link, Share2, Copy, History, AlertCircle
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

const categories = [
  { id: 'all', name: 'All Items', icon: Grid, count: 48 },
  { id: 'electronics', name: 'Electronics', icon: Zap, count: 12 },
  { id: 'clothing', name: 'Clothing', icon: Tag, count: 18 },
  { id: 'food', name: 'Food & Beverage', icon: Package, count: 8 },
  { id: 'furniture', name: 'Furniture', icon: Box, count: 6 },
  { id: 'supplies', name: 'Supplies', icon: ClipboardList, count: 4 },
];

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      sku: 'WBH-2024-001',
      barcode: '1234567890123',
      category: 'electronics',
      quantity: 145,
      minStock: 20,
      maxStock: 200,
      reorderPoint: 30,
      unitPrice: 79.99,
      totalValue: 11598.55,
      supplier: 'TechSupply Co.',
      location: 'Warehouse A - Shelf 12',
      lastRestocked: new Date('2024-12-01'),
      status: 'in-stock',
      unit: 'pcs',
      weight: 0.25,
      dimensions: '20x15x8 cm',
      tags: ['electronics', 'audio', 'wireless']
    },
    {
      id: '2',
      name: 'Cotton T-Shirt - Blue',
      sku: 'CTS-BLU-M-001',
      barcode: '2345678901234',
      category: 'clothing',
      quantity: 8,
      minStock: 15,
      maxStock: 100,
      reorderPoint: 20,
      unitPrice: 24.99,
      totalValue: 199.92,
      supplier: 'Fashion Wholesale Ltd.',
      location: 'Warehouse B - Rack 5',
      lastRestocked: new Date('2024-11-28'),
      status: 'low-stock',
      unit: 'pcs',
      weight: 0.15,
      dimensions: '30x25x2 cm',
      tags: ['clothing', 'apparel', 'cotton']
    },
    {
      id: '3',
      name: 'Organic Coffee Beans - 1kg',
      sku: 'OCB-1KG-001',
      barcode: '3456789012345',
      category: 'food',
      quantity: 0,
      minStock: 10,
      maxStock: 50,
      reorderPoint: 15,
      unitPrice: 18.50,
      totalValue: 0,
      supplier: 'Global Coffee Imports',
      location: 'Warehouse A - Cold Storage',
      lastRestocked: new Date('2024-11-20'),
      status: 'out-of-stock',
      unit: 'kg',
      weight: 1.0,
      expiryDate: new Date('2025-06-01'),
      tags: ['food', 'beverage', 'organic']
    },
    {
      id: '4',
      name: 'Office Desk Chair - Ergonomic',
      sku: 'ODC-ERG-001',
      barcode: '4567890123456',
      category: 'furniture',
      quantity: 35,
      minStock: 5,
      maxStock: 30,
      reorderPoint: 10,
      unitPrice: 249.99,
      totalValue: 8749.65,
      supplier: 'Office Furniture Direct',
      location: 'Warehouse C - Section 3',
      lastRestocked: new Date('2024-12-03'),
      status: 'overstocked',
      unit: 'pcs',
      weight: 15.5,
      dimensions: '65x65x120 cm',
      tags: ['furniture', 'office', 'ergonomic']
    },
    {
      id: '5',
      name: 'Laptop Stand - Aluminum',
      sku: 'LPS-ALU-001',
      barcode: '5678901234567',
      category: 'electronics',
      quantity: 67,
      minStock: 15,
      maxStock: 80,
      reorderPoint: 20,
      unitPrice: 45.00,
      totalValue: 3015.00,
      supplier: 'TechSupply Co.',
      location: 'Warehouse A - Shelf 15',
      lastRestocked: new Date('2024-12-02'),
      status: 'in-stock',
      unit: 'pcs',
      weight: 0.8,
      dimensions: '28x20x5 cm',
      tags: ['electronics', 'accessories', 'aluminum']
    },
    {
      id: '6',
      name: 'Printer Paper A4 - 500 Sheets',
      sku: 'PPA4-500-001',
      barcode: '6789012345678',
      category: 'supplies',
      quantity: 12,
      minStock: 20,
      maxStock: 100,
      reorderPoint: 25,
      unitPrice: 8.99,
      totalValue: 107.88,
      supplier: 'Office Supplies Plus',
      location: 'Warehouse B - Shelf 8',
      lastRestocked: new Date('2024-11-25'),
      status: 'low-stock',
      unit: 'reams',
      weight: 2.5,
      dimensions: '30x21x5 cm',
      tags: ['supplies', 'paper', 'office']
    }
  ]);

  const [stockMovements] = useState<StockMovement[]>([
    { id: '1', itemId: '1', itemName: 'Wireless Bluetooth Headphones', type: 'in', quantity: 50, date: new Date('2024-12-01'), reason: 'Supplier delivery', user: 'John Smith' },
    { id: '2', itemId: '2', itemName: 'Cotton T-Shirt - Blue', type: 'out', quantity: 12, date: new Date('2024-12-04'), reason: 'Customer order', user: 'Sarah Johnson' },
    { id: '3', itemId: '3', itemName: 'Organic Coffee Beans - 1kg', type: 'out', quantity: 25, date: new Date('2024-12-03'), reason: 'Sales order', user: 'Mike Chen' },
    { id: '4', itemId: '4', itemName: 'Office Desk Chair - Ergonomic', type: 'in', quantity: 20, date: new Date('2024-12-03'), reason: 'Bulk purchase', user: 'John Smith' },
  ]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showStockMovement, setShowStockMovement] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
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

  const totalInventoryValue = items.reduce((acc, item) => acc + item.totalValue, 0);
  const lowStockItems = items.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock').length;
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
              <Warehouse className="w-8 h-8 text-white" />
            </div>
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-2">Track, manage, and optimize your stock levels</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Scan className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Scan Barcode</span>
          </button>
          <button className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Upload className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Import</span>
          </button>
          <button className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Export</span>
          </button>
          <button
            onClick={() => setShowAddItem(true)}
            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-blue-700 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              12.5%
            </div>
          </div>
          <p className="text-sm text-blue-600 font-medium mb-1">Total Value</p>
          <p className="text-3xl font-bold text-blue-900">${totalInventoryValue.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Boxes className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-purple-700 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              8.2%
            </div>
          </div>
          <p className="text-sm text-purple-600 font-medium mb-1">Total Items</p>
          <p className="text-3xl font-bold text-purple-900">{totalItems.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-500 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
              Needs Attention
            </span>
          </div>
          <p className="text-sm text-orange-600 font-medium mb-1">Low Stock Alerts</p>
          <p className="text-3xl font-bold text-orange-900">{lowStockItems}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-500 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-green-700 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              5.3%
            </div>
          </div>
          <p className="text-sm text-green-600 font-medium mb-1">Product Lines</p>
          <p className="text-3xl font-bold text-green-900">{items.length}</p>
        </div>
      </div>

      {/* Quick Actions & Integrations */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Quick Actions & Integrations
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <button className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-all group">
            <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-blue-900">Shopify Sync</span>
          </button>

          <button className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-all group">
            <div className="p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-purple-900">Ship Orders</span>
          </button>

          <button className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:shadow-lg transition-all group">
            <div className="p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-green-900">Generate QR</span>
          </button>

          <button 
            onClick={() => setShowStockMovement(true)}
            className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200 hover:shadow-lg transition-all group"
          >
            <div className="p-2 bg-orange-500 rounded-lg group-hover:scale-110 transition-transform">
              <History className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-orange-900">Stock History</span>
          </button>

          <button className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 hover:shadow-lg transition-all group">
            <div className="p-2 bg-indigo-500 rounded-lg group-hover:scale-110 transition-transform">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-indigo-900">Set Alerts</span>
          </button>

          <button className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border-2 border-pink-200 hover:shadow-lg transition-all group">
            <div className="p-2 bg-pink-500 rounded-lg group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-pink-900">Reports</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, SKU, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Filters</span>
          </button>
          
          <div className="flex items-center gap-1 bg-white border-2 border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.name}
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                selectedCategory === category.id ? 'bg-white bg-opacity-20' : 'bg-gray-100'
              }`}>
                {category.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Inventory Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const statusConfig = getStatusConfig(item.status);
            const StatusIcon = statusConfig.icon;
            const stockPercentage = (item.quantity / item.maxStock) * 100;
            
            return (
              <div
                key={item.id}
                className="group relative bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-indigo-300 hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
                onClick={() => setSelectedItem(item)}
              >
                {/* Status Badge */}
                <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </div>

                {/* Product Image Placeholder */}
                <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>

                {/* Product Info */}
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {item.name}
                </h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    SKU: {item.sku}
                  </span>
                  {item.barcode && (
                    <Barcode className="w-4 h-4 text-gray-400" />
                  )}
                </div>

                {/* Stock Level */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Stock Level</span>
                    <span className="font-bold text-gray-900">{item.quantity} {item.unit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        stockPercentage > 50 ? 'bg-green-500' :
                        stockPercentage > 20 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>Min: {item.minStock}</span>
                    <span>Max: {item.maxStock}</span>
                  </div>
                </div>

                {/* Value & Location */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Unit Price</span>
                    <span className="font-semibold text-gray-900">${item.unitPrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Value</span>
                    <span className="font-bold text-indigo-600">${item.totalValue.toLocaleString()}</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-3 p-2 bg-gray-50 rounded-lg">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{item.location}</span>
                </div>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                    {item.tags.length > 2 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                        +{item.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium">
                    Adjust Stock
                  </button>
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === item.id ? null : item.id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                    {activeMenu === item.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-gray-200 py-2 z-50">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">View Details</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingItem(item);
                              setShowDeleteModal(true);
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="font-medium">Delete</span>
                          </button>
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
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Product</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">SKU</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Value</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Location</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const statusConfig = getStatusConfig(item.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.supplier}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-700">{item.sku}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 capitalize">{item.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{item.quantity} {item.unit}</p>
                        <p className="text-xs text-gray-500">Reorder: {item.reorderPoint}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900">${item.totalValue.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">${item.unitPrice}/unit</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">{item.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedItem(item)}
                          className="p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-indigo-600" />
                        </button>
                        <div className="relative">
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenu(activeMenu === item.id ? null : item.id);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" 
                            title="More options"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                          {activeMenu === item.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-gray-200 py-2 z-50">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingItem(item);
                                    setShowDeleteModal(true);
                                    setActiveMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 cursor-pointer transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span className="font-medium">Delete</span>
                                </button>
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
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">{selectedItem.name}</h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Image */}
                <div className="space-y-4">
                  <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                    <Package className="w-24 h-24 text-gray-400" />
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-xs text-blue-600 mb-1">Current Stock</p>
                      <p className="text-2xl font-bold text-blue-900">{selectedItem.quantity}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <p className="text-xs text-green-600 mb-1">Total Value</p>
                      <p className="text-2xl font-bold text-green-900">${selectedItem.totalValue}</p>
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">SKU</label>
                    <p className="text-gray-900 font-mono">{selectedItem.sku}</p>
                  </div>

                  {selectedItem.barcode && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Barcode</label>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-900 font-mono">{selectedItem.barcode}</p>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Copy className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-semibold text-gray-700">Category</label>
                    <p className="text-gray-900 capitalize">{selectedItem.category}</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700">Supplier</label>
                    <p className="text-gray-900">{selectedItem.supplier}</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700">Location</label>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <p className="text-gray-900">{selectedItem.location}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700">Last Restocked</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <p className="text-gray-900">{selectedItem.lastRestocked.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock Information */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200">
                <h3 className="font-bold text-indigo-900 mb-4">Stock Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-indigo-600 mb-1">Current Stock</p>
                    <p className="text-xl font-bold text-indigo-900">{selectedItem.quantity} {selectedItem.unit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-600 mb-1">Min Stock</p>
                    <p className="text-xl font-bold text-indigo-900">{selectedItem.minStock}</p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-600 mb-1">Max Stock</p>
                    <p className="text-xl font-bold text-indigo-900">{selectedItem.maxStock}</p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-600 mb-1">Reorder Point</p>
                    <p className="text-xl font-bold text-indigo-900">{selectedItem.reorderPoint}</p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                <h3 className="font-bold text-green-900 mb-4">Pricing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-green-600 mb-1">Unit Price</p>
                    <p className="text-2xl font-bold text-green-900">${selectedItem.unitPrice}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-1">Total Value</p>
                    <p className="text-2xl font-bold text-green-900">${selectedItem.totalValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Physical Details */}
              {(selectedItem.weight || selectedItem.dimensions) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedItem.weight && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Weight</p>
                      <p className="text-lg font-bold text-gray-900">{selectedItem.weight} kg</p>
                    </div>
                  )}
                  {selectedItem.dimensions && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Dimensions</p>
                      <p className="text-lg font-bold text-gray-900">{selectedItem.dimensions}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  Edit Item
                </button>
                <button className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Generate QR
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    if (selectedItem) {
                      setDeletingItem(selectedItem);
                      setShowDeleteModal(true);
                    }
                  }}
                  className="px-6 py-3 border-2 border-red-200 text-red-700 font-medium rounded-xl hover:bg-red-50 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Movement History Modal */}
      {showStockMovement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <History className="w-6 h-6 text-indigo-600" />
                Stock Movement History
              </h2>
              <button
                onClick={() => setShowStockMovement(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {stockMovements.map((movement) => {
                  const isInbound = movement.type === 'in';
                  return (
                    <div key={movement.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                      <div className={`p-3 rounded-xl ${isInbound ? 'bg-green-500' : 'bg-red-500'}`}>
                        {isInbound ? (
                          <PackagePlus className="w-6 h-6 text-white" />
                        ) : (
                          <PackageMinus className="w-6 h-6 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{movement.itemName}</h4>
                        <p className="text-sm text-gray-600">{movement.reason}</p>
                      </div>

                      <div className="text-right">
                        <p className={`text-xl font-bold ${isInbound ? 'text-green-600' : 'text-red-600'}`}>
                          {isInbound ? '+' : '-'}{movement.quantity}
                        </p>
                        <p className="text-xs text-gray-500">{movement.date.toLocaleDateString()}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-600">By</p>
                        <p className="text-sm font-semibold text-gray-900">{movement.user}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Add New Item</h2>
              <button
                onClick={() => setShowAddItem(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Wireless Headphones"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">SKU</label>
                  <input
                    type="text"
                    placeholder="e.g., WBH-2024-001"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Barcode</label>
                  <input
                    type="text"
                    placeholder="e.g., 1234567890123"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="">Select category...</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="food">Food & Beverage</option>
                    <option value="furniture">Furniture</option>
                    <option value="supplies">Supplies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="pcs">Pieces</option>
                    <option value="kg">Kilograms</option>
                    <option value="lbs">Pounds</option>
                    <option value="boxes">Boxes</option>
                    <option value="units">Units</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Min Stock Level</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Stock Level</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reorder Point</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Unit Price</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier</label>
                  <input
                    type="text"
                    placeholder="Supplier name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="e.g., Warehouse A - Shelf 12"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    placeholder="Product description..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAddItem(false)}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all">
                  Add Item
                </button>
              </div>
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
            alert('✓ Item deleted successfully!');
          }}
          title="Delete Inventory Item"
          itemName={deletingItem.name}
          itemDetails={`SKU: ${deletingItem.sku} - Qty: ${deletingItem.quantity} ${deletingItem.unit}`}
          warningMessage="This will permanently remove this item from your inventory records."
        />
      )}
    </div>
  );
}
