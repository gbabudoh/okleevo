"use client";

import React, { useState } from 'react';
import { 
  Truck, Plus, Search, Filter, Download, Upload, Star, 
  Phone, Mail, MapPin, Globe, Building2, User, Calendar,
  DollarSign, Package, TrendingUp, TrendingDown, Clock,
  CheckCircle, XCircle, AlertCircle, Award, Target, Activity,
  FileText, Edit3, Trash2, Eye, MoreVertical, MessageSquare,
  ShoppingCart, CreditCard, BarChart3, Users, Zap, Link,
  ThumbsUp, ThumbsDown, AlertTriangle, RefreshCw, Settings,
  Grid, List, ChevronRight, X, Check, ArrowUpRight, ArrowDownRight,
  Handshake, Factory, Store, Box, Boxes, ClipboardList
} from 'lucide-react';

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

interface Order {
  id: string;
  supplierId: string;
  supplierName: string;
  orderDate: Date;
  deliveryDate: Date;
  amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: number;
}

const categories = [
  { id: 'all', name: 'All Suppliers', icon: Grid, count: 24 },
  { id: 'raw-materials', name: 'Raw Materials', icon: Box, count: 8 },
  { id: 'manufacturing', name: 'Manufacturing', icon: Factory, count: 6 },
  { id: 'packaging', name: 'Packaging', icon: Package, count: 4 },
  { id: 'logistics', name: 'Logistics', icon: Truck, count: 3 },
  { id: 'services', name: 'Services', icon: Handshake, count: 3 },
];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: '1',
      name: 'Global Tech Supplies Inc.',
      companyName: 'Global Tech Supplies Inc.',
      contactPerson: 'John Anderson',
      email: 'john.anderson@globaltech.com',
      phone: '+1 (555) 123-4567',
      address: '123 Industrial Park Drive',
      city: 'San Francisco',
      country: 'USA',
      website: 'www.globaltech.com',
      category: 'raw-materials',
      status: 'active',
      rating: 4.8,
      totalOrders: 156,
      totalSpent: 487500,
      lastOrder: new Date('2024-12-03'),
      paymentTerms: 'Net 30',
      leadTime: '7-10 days',
      minimumOrder: 5000,
      products: ['Electronic Components', 'Circuit Boards', 'Semiconductors'],
      certifications: ['ISO 9001', 'RoHS', 'CE'],
      performance: {
        onTimeDelivery: 96,
        qualityScore: 94,
        responseTime: 92,
        priceCompetitiveness: 88
      }
    },
    {
      id: '2',
      name: 'Premium Packaging Solutions',
      companyName: 'Premium Packaging Solutions Ltd.',
      contactPerson: 'Sarah Mitchell',
      email: 'sarah.mitchell@premiumpack.com',
      phone: '+44 20 7123 4567',
      address: '45 Commerce Street',
      city: 'London',
      country: 'UK',
      website: 'www.premiumpack.com',
      category: 'packaging',
      status: 'active',
      rating: 4.6,
      totalOrders: 89,
      totalSpent: 234800,
      lastOrder: new Date('2024-12-01'),
      paymentTerms: 'Net 45',
      leadTime: '14-21 days',
      minimumOrder: 10000,
      products: ['Cardboard Boxes', 'Bubble Wrap', 'Shipping Labels'],
      certifications: ['FSC', 'ISO 14001'],
      performance: {
        onTimeDelivery: 91,
        qualityScore: 95,
        responseTime: 88,
        priceCompetitiveness: 85
      }
    },
    {
      id: '3',
      name: 'Swift Logistics Partners',
      companyName: 'Swift Logistics Partners Co.',
      contactPerson: 'Michael Chen',
      email: 'michael.chen@swiftlogistics.com',
      phone: '+86 21 1234 5678',
      address: '789 Shipping Lane',
      city: 'Shanghai',
      country: 'China',
      website: 'www.swiftlogistics.com',
      category: 'logistics',
      status: 'active',
      rating: 4.9,
      totalOrders: 203,
      totalSpent: 678900,
      lastOrder: new Date('2024-12-04'),
      paymentTerms: 'Net 15',
      leadTime: '3-5 days',
      minimumOrder: 1000,
      products: ['Freight Forwarding', 'Warehousing', 'Last Mile Delivery'],
      certifications: ['ISO 9001', 'IATA', 'C-TPAT'],
      performance: {
        onTimeDelivery: 98,
        qualityScore: 97,
        responseTime: 95,
        priceCompetitiveness: 90
      }
    },
    {
      id: '4',
      name: 'Industrial Manufacturing Corp',
      companyName: 'Industrial Manufacturing Corporation',
      contactPerson: 'Robert Williams',
      email: 'robert.williams@indmfg.com',
      phone: '+49 30 1234 5678',
      address: '321 Factory Road',
      city: 'Berlin',
      country: 'Germany',
      website: 'www.indmfg.com',
      category: 'manufacturing',
      status: 'pending',
      rating: 4.3,
      totalOrders: 45,
      totalSpent: 156700,
      lastOrder: new Date('2024-11-28'),
      paymentTerms: 'Net 60',
      leadTime: '21-30 days',
      minimumOrder: 25000,
      products: ['Metal Parts', 'Plastic Molding', 'Assembly Services'],
      certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001'],
      performance: {
        onTimeDelivery: 87,
        qualityScore: 89,
        responseTime: 84,
        priceCompetitiveness: 82
      }
    },
    {
      id: '5',
      name: 'Quality Raw Materials Ltd',
      companyName: 'Quality Raw Materials Limited',
      contactPerson: 'Emma Thompson',
      email: 'emma.thompson@qualityraw.com',
      phone: '+61 2 1234 5678',
      address: '567 Mining District',
      city: 'Sydney',
      country: 'Australia',
      website: 'www.qualityraw.com',
      category: 'raw-materials',
      status: 'active',
      rating: 4.7,
      totalOrders: 112,
      totalSpent: 389400,
      lastOrder: new Date('2024-12-02'),
      paymentTerms: 'Net 30',
      leadTime: '10-14 days',
      minimumOrder: 15000,
      products: ['Steel', 'Aluminum', 'Copper'],
      certifications: ['ISO 9001', 'ISO 14001'],
      performance: {
        onTimeDelivery: 93,
        qualityScore: 92,
        responseTime: 90,
        priceCompetitiveness: 87
      }
    },
    {
      id: '6',
      name: 'Tech Services Group',
      companyName: 'Tech Services Group Inc.',
      contactPerson: 'David Park',
      email: 'david.park@techservices.com',
      phone: '+82 2 1234 5678',
      address: '890 Business Plaza',
      city: 'Seoul',
      country: 'South Korea',
      status: 'inactive',
      category: 'services',
      rating: 3.9,
      totalOrders: 23,
      totalSpent: 67800,
      lastOrder: new Date('2024-10-15'),
      paymentTerms: 'Net 30',
      leadTime: '5-7 days',
      minimumOrder: 2000,
      products: ['IT Support', 'Consulting', 'Training'],
      performance: {
        onTimeDelivery: 78,
        qualityScore: 81,
        responseTime: 75,
        priceCompetitiveness: 79
      }
    }
  ]);

  const [recentOrders] = useState<Order[]>([
    { id: '1', supplierId: '1', supplierName: 'Global Tech Supplies Inc.', orderDate: new Date('2024-12-03'), deliveryDate: new Date('2024-12-10'), amount: 15600, status: 'shipped', items: 12 },
    { id: '2', supplierId: '3', supplierName: 'Swift Logistics Partners', orderDate: new Date('2024-12-04'), deliveryDate: new Date('2024-12-07'), amount: 8900, status: 'confirmed', items: 5 },
    { id: '3', supplierId: '2', supplierName: 'Premium Packaging Solutions', orderDate: new Date('2024-12-01'), deliveryDate: new Date('2024-12-15'), amount: 12400, status: 'pending', items: 8 },
  ]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messagePriority, setMessagePriority] = useState('normal');

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || supplier.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'green', icon: CheckCircle, label: 'Active', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
      case 'inactive':
        return { color: 'gray', icon: XCircle, label: 'Inactive', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
      case 'pending':
        return { color: 'orange', icon: Clock, label: 'Pending', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
      case 'suspended':
        return { color: 'red', icon: AlertCircle, label: 'Suspended', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
      default:
        return { color: 'gray', icon: AlertCircle, label: 'Unknown', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
  const totalSpent = suppliers.reduce((acc, s) => acc + s.totalSpent, 0);
  const avgRating = suppliers.reduce((acc, s) => acc + s.rating, 0) / suppliers.length;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
              <Handshake className="w-8 h-8 text-white" />
            </div>
            Supplier Management
          </h1>
          <p className="text-gray-600 mt-2">Manage your B2B supplier relationships and partnerships</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Upload className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Import</span>
          </button>
          <button className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Export</span>
          </button>
          <button
            onClick={() => setShowAddSupplier(true)}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Supplier
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-blue-700 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              12%
            </div>
          </div>
          <p className="text-sm text-blue-600 font-medium mb-1">Total Suppliers</p>
          <p className="text-3xl font-bold text-blue-900">{totalSuppliers}</p>
          <p className="text-xs text-blue-600 mt-1">{activeSuppliers} active</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-500 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-green-700 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              18%
            </div>
          </div>
          <p className="text-sm text-green-600 font-medium mb-1">Total Spent</p>
          <p className="text-3xl font-bold text-green-900">${(totalSpent / 1000).toFixed(0)}K</p>
          <p className="text-xs text-green-600 mt-1">This year</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-500 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-purple-700 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              8%
            </div>
          </div>
          <p className="text-sm text-purple-600 font-medium mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-purple-900">{suppliers.reduce((acc, s) => acc + s.totalOrders, 0)}</p>
          <p className="text-xs text-purple-600 mt-1">All time</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 border-2 border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < Math.floor(avgRating) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
              ))}
            </div>
          </div>
          <p className="text-sm text-yellow-600 font-medium mb-1">Avg Rating</p>
          <p className="text-3xl font-bold text-yellow-900">{avgRating.toFixed(1)}</p>
          <p className="text-xs text-yellow-600 mt-1">Out of 5.0</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-500" />
            Recent Orders
          </h3>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentOrders.map((order) => (
            <div key={order.id} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-600">Order #{order.id}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'confirmed' ? 'bg-purple-100 text-purple-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {order.status}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-sm">{order.supplierName}</h4>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Amount:</span>
                  <span className="font-semibold text-gray-900">${order.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Items:</span>
                  <span className="font-semibold text-gray-900">{order.items}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery:</span>
                  <span className="font-semibold text-gray-900">{order.deliveryDate.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search suppliers by name, contact, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
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

      {/* Suppliers Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => {
            const statusConfig = getStatusConfig(supplier.status);
            const StatusIcon = statusConfig.icon;
            const avgPerformance = (supplier.performance.onTimeDelivery + supplier.performance.qualityScore + supplier.performance.responseTime + supplier.performance.priceCompetitiveness) / 4;
            
            return (
              <div
                key={supplier.id}
                className="group relative bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-300 hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
                onClick={() => setSelectedSupplier(supplier)}
              >
                {/* Status Badge */}
                <div className={`absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </div>

                {/* Company Logo Placeholder */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mb-4">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>

                {/* Company Info */}
                <h3 className="font-bold text-gray-900 mb-1 pr-20 group-hover:text-blue-600 transition-colors">
                  {supplier.name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 capitalize">{supplier.category.replace('-', ' ')}</p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(supplier.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-900">{supplier.rating}</span>
                  <span className="text-xs text-gray-500">({supplier.totalOrders} orders)</span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{supplier.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{supplier.city}, {supplier.country}</span>
                  </div>
                </div>

                {/* Performance Indicator */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">Performance Score</span>
                    <span className="font-bold text-gray-900">{avgPerformance.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-full rounded-full ${
                        avgPerformance >= 90 ? 'bg-green-500' :
                        avgPerformance >= 75 ? 'bg-blue-500' :
                        avgPerformance >= 60 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${avgPerformance}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                    <p className="text-xs text-blue-600 mb-0.5">Total Spent</p>
                    <p className="text-sm font-bold text-blue-900">${(supplier.totalSpent / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2 border border-purple-200">
                    <p className="text-xs text-purple-600 mb-0.5">Lead Time</p>
                    <p className="text-sm font-bold text-purple-900">{supplier.leadTime}</p>
                  </div>
                </div>

                {/* Products */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Products:</p>
                  <div className="flex flex-wrap gap-1">
                    {supplier.products.slice(0, 2).map((product, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                        {product}
                      </span>
                    ))}
                    {supplier.products.length > 2 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                        +{supplier.products.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    Contact
                  </button>
                  <button className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center gap-1">
                    <ShoppingCart className="w-4 h-4" />
                    Order
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>
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
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Supplier</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Rating</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Orders</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Total Spent</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSuppliers.map((supplier) => {
                const statusConfig = getStatusConfig(supplier.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{supplier.name}</p>
                          <p className="text-xs text-gray-500">{supplier.city}, {supplier.country}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{supplier.contactPerson}</p>
                        <p className="text-xs text-gray-500">{supplier.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 capitalize">{supplier.category.replace('-', ' ')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold text-gray-900">{supplier.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">{supplier.totalOrders}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">${(supplier.totalSpent / 1000).toFixed(0)}K</span>
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
                          onClick={() => setSelectedSupplier(supplier)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="More options">
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Supplier Detail Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedSupplier.name}</h2>
                  <p className="text-sm text-gray-600">{selectedSupplier.companyName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Rating</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{selectedSupplier.rating}</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < Math.floor(selectedSupplier.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Total Spent</span>
                  </div>
                  <p className="text-3xl font-bold text-green-900">${(selectedSupplier.totalSpent / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-green-600 mt-1">All time</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">Orders</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-900">{selectedSupplier.totalOrders}</p>
                  <p className="text-xs text-purple-600 mt-1">Completed</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-600">Lead Time</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">{selectedSupplier.leadTime}</p>
                  <p className="text-xs text-orange-600 mt-1">Average</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Contact Person</p>
                      <p className="font-semibold text-blue-900">{selectedSupplier.contactPerson}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Email</p>
                      <p className="font-semibold text-blue-900">{selectedSupplier.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Phone</p>
                      <p className="font-semibold text-blue-900">{selectedSupplier.phone}</p>
                    </div>
                  </div>

                  {selectedSupplier.website && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-600">Website</p>
                        <p className="font-semibold text-blue-900">{selectedSupplier.website}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 md:col-span-2">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Address</p>
                      <p className="font-semibold text-blue-900">{selectedSupplier.address}, {selectedSupplier.city}, {selectedSupplier.country}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-purple-700">On-Time Delivery</span>
                      <span className="text-sm font-bold text-purple-900">{selectedSupplier.performance.onTimeDelivery}%</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${selectedSupplier.performance.onTimeDelivery}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-purple-700">Quality Score</span>
                      <span className="text-sm font-bold text-purple-900">{selectedSupplier.performance.qualityScore}%</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${selectedSupplier.performance.qualityScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-purple-700">Response Time</span>
                      <span className="text-sm font-bold text-purple-900">{selectedSupplier.performance.responseTime}%</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${selectedSupplier.performance.responseTime}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-purple-700">Price Competitiveness</span>
                      <span className="text-sm font-bold text-purple-900">{selectedSupplier.performance.priceCompetitiveness}%</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${selectedSupplier.performance.priceCompetitiveness}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Terms */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Payment Terms</span>
                  </div>
                  <p className="text-xl font-bold text-green-900">{selectedSupplier.paymentTerms}</p>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Lead Time</span>
                  </div>
                  <p className="text-xl font-bold text-blue-900">{selectedSupplier.leadTime}</p>
                </div>

                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-600">Min Order</span>
                  </div>
                  <p className="text-xl font-bold text-orange-900">${selectedSupplier.minimumOrder.toLocaleString()}</p>
                </div>
              </div>

              {/* Products & Services */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  Products & Services
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSupplier.products.map((product, idx) => (
                    <span key={idx} className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-200">
                      {product}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              {selectedSupplier.certifications && selectedSupplier.certifications.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Certifications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSupplier.certifications.map((cert, idx) => (
                      <span key={idx} className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium border border-yellow-200 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => setShowMessageModal(true)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Send Message
                </button>
                <button className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Place Order
                </button>
                <button className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">Add New Supplier</h2>
              <button
                onClick={() => setShowAddSupplier(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Global Tech Supplies Inc."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select category...</option>
                    <option value="raw-materials">Raw Materials</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="packaging">Packaging</option>
                    <option value="logistics">Logistics</option>
                    <option value="services">Services</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Person</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="contact@supplier.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    placeholder="www.supplier.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    placeholder="Street address"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    placeholder="City"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    placeholder="Country"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Terms</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lead Time</label>
                  <input
                    type="text"
                    placeholder="e.g., 7-10 days"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Order ($)</label>
                  <input
                    type="number"
                    placeholder="5000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Products/Services</label>
                  <input
                    type="text"
                    placeholder="Comma-separated list"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                  <textarea
                    placeholder="Additional information..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAddSupplier(false)}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl transition-all">
                  Add Supplier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showMessageModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                  Send Message
                </h2>
                <p className="text-sm text-gray-600 mt-1">To: {selectedSupplier.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setMessageSubject('');
                  setMessageBody('');
                  setMessagePriority('normal');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Recipient Info */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900">{selectedSupplier.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-blue-700 mt-1">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {selectedSupplier.contactPerson}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {selectedSupplier.email}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMessagePriority('low')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                        messagePriority === 'low'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Low
                    </button>
                    <button
                      onClick={() => setMessagePriority('normal')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                        messagePriority === 'normal'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      onClick={() => setMessagePriority('high')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                        messagePriority === 'high'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      High
                    </button>
                    <button
                      onClick={() => setMessagePriority('urgent')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                        messagePriority === 'urgent'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Urgent
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    placeholder="Enter message subject..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                  <textarea
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    placeholder="Type your message here..."
                    rows={8}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-2">{messageBody.length} characters</p>
                </div>
              </div>

              {/* Quick Templates */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quick Templates</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMessageSubject('Order Inquiry');
                      setMessageBody(`Dear ${selectedSupplier.contactPerson},\n\nI would like to inquire about placing an order for the following products:\n\n[List products here]\n\nPlease provide pricing and availability information.\n\nBest regards`);
                    }}
                    className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium text-left"
                  >
                    📦 Order Inquiry
                  </button>
                  <button
                    onClick={() => {
                      setMessageSubject('Price Quote Request');
                      setMessageBody(`Dear ${selectedSupplier.contactPerson},\n\nCould you please provide a price quote for:\n\n[Specify items and quantities]\n\nThank you for your assistance.\n\nBest regards`);
                    }}
                    className="px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium text-left"
                  >
                    💰 Price Quote
                  </button>
                  <button
                    onClick={() => {
                      setMessageSubject('Delivery Status Update');
                      setMessageBody(`Dear ${selectedSupplier.contactPerson},\n\nI would like to request an update on the delivery status of order #[ORDER_NUMBER].\n\nPlease confirm the expected delivery date.\n\nThank you`);
                    }}
                    className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium text-left"
                  >
                    🚚 Delivery Update
                  </button>
                  <button
                    onClick={() => {
                      setMessageSubject('Product Information Request');
                      setMessageBody(`Dear ${selectedSupplier.contactPerson},\n\nI would like to request more information about:\n\n[Product name/specifications]\n\nPlease provide technical details and documentation.\n\nBest regards`);
                    }}
                    className="px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium text-left"
                  >
                    📋 Product Info
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageSubject('');
                    setMessageBody('');
                    setMessagePriority('normal');
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Here you would implement the actual send functionality
                    alert(`Message sent to ${selectedSupplier.name}!\n\nSubject: ${messageSubject}\nPriority: ${messagePriority}\n\nMessage will be sent to: ${selectedSupplier.email}`);
                    setShowMessageModal(false);
                    setMessageSubject('');
                    setMessageBody('');
                    setMessagePriority('normal');
                  }}
                  disabled={!messageSubject || !messageBody}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
