"use client";

import React, { useState } from 'react';
import { 
  Truck, Plus, Search, Filter, Download, Star, 
  MapPin, Globe, Building2,
  DollarSign, Package, TrendingUp, Clock,
  CheckCircle, XCircle, AlertCircle, Award, Activity,
  Trash2, MoreVertical, MessageSquare,
  ShoppingCart, Zap, 
  RefreshCw, Settings, Grid, List, ChevronRight, X,
  Handshake, Factory, Box, Info, ShieldCheck
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

  const showNotify = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

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

  const handleExport = () => {
    showNotify('Generating Holistic Manifest...');
    
    // Create CSV content
    const headers = ['ID', 'Name', 'Company', 'Contact', 'Email', 'Phone', 'Address', 'City', 'Country', 'Category', 'Status', 'Rating', 'Total Orders', 'Total Spent', 'Payment Terms', 'Lead Time'];
    const rows = suppliers.map(s => [
      s.id,
      `"${s.name}"`,
      `"${s.companyName}"`,
      `"${s.contactPerson}"`,
      s.email,
      s.phone,
      `"${s.address}"`,
      s.city,
      s.country,
      s.category,
      s.status,
      s.rating,
      s.totalOrders,
      s.totalSpent,
      s.paymentTerms,
      s.leadTime
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `suppliers_manifest_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => showNotify('Manifest Export Successfully Archived'), 1000);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] p-4 md:p-8 overflow-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-mesh" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[140px] animate-mesh-delayed" />
        <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px] animate-mesh" />
      </div>

      <div className="relative z-10 space-y-8 max-w-[1600px] mx-auto">
      {/* Header / Command Center */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border-2 border-white shadow-2xl flex flex-col items-center text-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-6">
          <Handshake className="w-4 h-4 text-blue-600" />
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Global Logistics Network</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight mb-4">
          Supplier <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Intelligence</span>
        </h1>
        <p className="text-gray-500 font-bold max-w-2xl mb-10 leading-relaxed uppercase text-[10px] tracking-[0.1em]">
          Strategic Partnership Management & B2B Inventory Orchestration
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button 
            onClick={() => {
              setIsSyncing(true);
              showNotify('Syncing with Logistics Hub...');
              setTimeout(() => setIsSyncing(false), 2000);
            }}
            className="px-8 py-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-blue-600 active:scale-95 transition-all duration-500 flex items-center gap-3 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Relations
          </button>
          <button
            onClick={() => setShowAddSupplier(true)}
            className="px-8 py-4 bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-blue-600 active:scale-95 transition-all duration-500 flex items-center gap-3 cursor-pointer shadow-xl shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            Registry New Node
          </button>
          <div className="h-10 w-px bg-gray-200 mx-2 hidden md:block" />
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExport}
              className="p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:text-blue-500 active:scale-95 transition-all cursor-pointer group/btn" 
              title="Export Manifest"
            >
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowConfigModal(true)}
              className="p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:text-blue-500 active:scale-95 transition-all cursor-pointer group/btn" 
              title="Configuration"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Network Capacity', val: totalSuppliers, sub: `${activeSuppliers} Active Nodes`, icon: Building2, color: 'blue' },
          { label: 'Capital Outflow', val: `$${(totalSpent / 1000).toFixed(0)}K`, sub: 'Annual Manifest', icon: DollarSign, color: 'emerald' },
          { label: 'Procurement Flow', val: suppliers.reduce((acc, s) => acc + s.totalOrders, 0), sub: 'Historical Orders', icon: ShoppingCart, color: 'indigo' },
          { label: 'Trust Index', val: avgRating.toFixed(1), sub: 'Node Reliability', icon: Award, color: 'amber' },
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

      {/* Recent Activity / Temporal Log */}
      <div className="bg-white/40 backdrop-blur-xl rounded-[3rem] border-2 border-white shadow-xl p-8 overflow-hidden relative group">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-500" />
              Strategic Temporal Log
            </h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time procurement velocity</p>
          </div>
          <button className="px-6 py-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 rounded-full transition-all flex items-center gap-2 cursor-pointer">
            View Holistic Manifest
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentOrders.map((order, idx) => (
            <div key={order.id} className="relative group/card animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${idx * 150}ms` }}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-[2rem] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
              <div className="relative p-6 bg-white border-2 border-gray-50 rounded-[2rem] shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-500">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Manifest #{order.id}</span>
                  <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    order.status === 'shipped' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                    'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {order.status}
                  </div>
                </div>
                <h4 className="font-black text-gray-900 mb-4 border-l-4 border-blue-500 pl-3 leading-tight">{order.supplierName}</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Valuation</span>
                    <span className="text-sm font-black text-gray-900">${order.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-black text-gray-500 uppercase tracking-widest px-1">
                    <span>ETA Alignment</span>
                    <span className="text-gray-900">{order.deliveryDate.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters Hub */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative group">
          <div className="absolute inset-0 bg-blue-500/5 rounded-3xl blur-xl group-focus-within:bg-blue-500/10 transition-all opacity-0 group-focus-within:opacity-100" />
          <div className="relative flex items-center bg-white/60 backdrop-blur-xl border-2 border-white shadow-xl rounded-3xl p-2 pl-6 focus-within:border-blue-500/50 transition-all">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Query specialized nodes, personnel, or identifiers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 bg-transparent text-sm font-bold text-gray-900 outline-none placeholder:text-gray-400"
            />
            <div className="hidden md:flex items-center gap-2 pr-4">
              <span className="px-2 py-1 bg-gray-100 text-[10px] font-black text-gray-400 rounded-lg">CMD</span>
              <span className="px-2 py-1 bg-gray-100 text-[10px] font-black text-gray-400 rounded-lg">K</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-8 py-5 bg-white/60 backdrop-blur-xl border-2 border-white rounded-3xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3 cursor-pointer group">
            <Filter className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-colors" />
            <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em] group-hover:text-blue-500">Advanced Matrix</span>
          </button>
          
          <div className="flex items-center gap-1 bg-white/60 backdrop-blur-xl border-2 border-white shadow-xl rounded-2xl p-1.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-all cursor-pointer ${viewMode === 'list' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-500 whitespace-nowrap cursor-pointer border-2 ${
                isActive
                  ? 'bg-gray-900 border-gray-900 text-white shadow-xl shadow-gray-900/10 scale-105'
                  : 'bg-white/60 backdrop-blur-md border-white text-gray-500 hover:border-blue-500/30 hover:text-blue-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.name}
              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black ${
                isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {category.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSuppliers.map((supplier, idx) => {
            const statusConfig = getStatusConfig(supplier.status);
            const StatusIcon = statusConfig.icon;
            const avgPerf = (supplier.performance.onTimeDelivery + supplier.performance.qualityScore + supplier.performance.responseTime + supplier.performance.priceCompetitiveness) / 4;
            
            return (
              <div
                key={supplier.id}
                onClick={() => {
                  setSelectedSupplier(supplier);
                  setShowDetailModal(true);
                }}
                className="group relative bg-white/60 backdrop-blur-xl rounded-[3rem] border-2 border-white p-8 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 cursor-pointer animate-in fade-in zoom-in-95 fill-mode-both"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Status Float */}
                <div className={`absolute top-6 right-6 flex items-center gap-2 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} shadow-sm`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </div>

                {/* Identity Block */}
                <div className="flex items-center gap-5 mb-8">
                   <div className="w-16 h-16 bg-gradient-to-br from-blue-500/10 to-transparent rounded-[1.5rem] flex items-center justify-center border-2 border-white shadow-inner group-hover:scale-110 transition-transform duration-500">
                     <Building2 className="w-8 h-8 text-blue-600" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">{supplier.name}</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{supplier.category.replace('-', ' ')}</p>
                   </div>
                </div>

                {/* Performance Radar Bar */}
                <div className="mb-8 p-5 bg-gray-50/50 rounded-[2rem] border border-white/50">
                  <div className="flex items-center justify-between mb-3 text-[9px] font-black uppercase tracking-widest">
                    <span className="text-gray-400">Node Trust Matrix</span>
                    <span className="text-gray-900">{avgPerf.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-white rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        avgPerf >= 90 ? 'bg-emerald-500' : avgPerf >= 75 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${avgPerf}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-1 mt-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`h-1 rounded-full ${i < Math.floor(avgPerf/25) ? 'bg-blue-500/20' : 'bg-gray-100'}`} />
                    ))}
                  </div>
                </div>

                {/* Logistics Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="p-4 bg-white rounded-2xl border border-gray-50 shadow-sm group-hover:shadow-md transition-all">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Capital Load</p>
                      <p className="text-lg font-black text-gray-900">${(supplier.totalSpent / 1000).toFixed(0)}K</p>
                   </div>
                   <div className="p-4 bg-white rounded-2xl border border-gray-50 shadow-sm group-hover:shadow-md transition-all">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Latency</p>
                      <p className="text-lg font-black text-gray-900">{supplier.leadTime}</p>
                   </div>
                </div>

                {/* Contact Interface */}
                 <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-black text-gray-500 uppercase">
                      {supplier.contactPerson.charAt(0)}
                    </div>
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      {supplier.contactPerson}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setSelectedSupplier(supplier);
                        setShowMessageModal(true); 
                        showNotify(`Contacting ${supplier.name}...`); 
                      }}
                      className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setActiveMenu(activeMenu === supplier.id ? null : supplier.id);
                        }}
                        className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-900 hover:text-white transition-all cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {activeMenu === supplier.id && (
                        <>
                          <div className="fixed inset-0 z-[60]" onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }} />
                          <div className="absolute right-0 bottom-full mb-4 w-48 bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl border-2 border-white py-2 z-[70] animate-in fade-in zoom-in duration-300">
                            {[
                              { 
                                label: 'Registry Order', 
                                icon: ShoppingCart, 
                                onClick: () => {
                                  setSelectedSupplier(supplier);
                                  setShowOrderModal(true);
                                }
                              },
                              { 
                                label: 'Direct Comms', 
                                icon: MessageSquare, 
                                onClick: () => {
                                  setSelectedSupplier(supplier);
                                  setShowMessageModal(true);
                                }
                              },
                              { 
                                label: 'Terminate Node', 
                                icon: Trash2, 
                                danger: true, 
                                onClick: () => {
                                  setDeletingSupplier(supplier);
                                  setShowDeleteModal(true);
                                }
                              }
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
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-xl rounded-[3rem] border-2 border-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-8 py-6 text-left text-[10px] font-black text-white uppercase tracking-[0.2em]">Node / Catalyst</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-white uppercase tracking-[0.2em]">Classification</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-white uppercase tracking-[0.2em]">Trust Score</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-white uppercase tracking-[0.2em]">Procurement</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-white uppercase tracking-[0.2em]">Capital Load</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-white uppercase tracking-[0.2em]">Efficiency</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-white uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white/40">
              {filteredSuppliers.map((supplier) => {
                const isActiveRow = activeMenu === supplier.id;
                return (
                  <tr 
                    key={supplier.id} 
                    className={`group hover:bg-blue-50/50 transition-colors cursor-pointer ${isActiveRow ? 'relative z-50 bg-blue-50/50' : ''}`} 
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setShowDetailModal(true);
                    }}
                  >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-200 group-hover:bg-white transition-colors">
                        <Building2 className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <div>
                        <p className="font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">{supplier.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{supplier.contactPerson}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-lg">
                      {supplier.category.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                       <span className="font-black text-gray-900">{supplier.rating}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-black text-gray-900 text-sm">
                    {supplier.totalOrders} <span className="text-[10px] text-gray-400 uppercase ml-1">Orders</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-black text-gray-900">${(supplier.totalSpent / 1000).toFixed(0)}K</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${getStatusConfig(supplier.status).bg} ${getStatusConfig(supplier.status).text} border ${getStatusConfig(supplier.status).border}`}>
                       {supplier.status}
                    </div>
                  </td>
                   <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setSelectedSupplier(supplier);
                          setShowMessageModal(true); 
                        }}
                        className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
                      >
                         <MessageSquare className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setActiveMenu(activeMenu === supplier.id ? null : supplier.id);
                          }}
                          className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-900 hover:text-white transition-all cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {activeMenu === supplier.id && (
                          <>
                            <div className="fixed inset-0 z-[60]" onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }} />
                            <div className="absolute right-full top-0 mr-2 w-48 bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl border-2 border-white py-2 z-[70] animate-in fade-in zoom-in slide-in-from-right-2 duration-300">
                              {[
                                { 
                                  label: 'Registry Order', 
                                  icon: ShoppingCart, 
                                  onClick: () => {
                                    setSelectedSupplier(supplier);
                                    setShowOrderModal(true);
                                  }
                                },
                                { 
                                  label: 'Direct Comms', 
                                  icon: MessageSquare, 
                                  onClick: () => {
                                    setSelectedSupplier(supplier);
                                    setShowMessageModal(true);
                                  }
                                },
                                { 
                                  label: 'Terminate Node', 
                                  icon: Trash2, 
                                  danger: true, 
                                  onClick: () => {
                                    setDeletingSupplier(supplier);
                                    setShowDeleteModal(true);
                                  }
                                }
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
      )}

       {/* Supplier Detail Modal */}
      {showDetailModal && selectedSupplier && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-500">
          <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] max-w-lg w-full max-h-[85vh] overflow-hidden border-2 border-white shadow-2xl flex flex-col relative text-gray-900">
            {/* Header Interface */}
             <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/40 sticky top-0 z-10 text-gray-900">
               <div className="flex items-center gap-4 text-gray-900">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-gray-900">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">{selectedSupplier.name}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusConfig(selectedSupplier.status).bg} ${getStatusConfig(selectedSupplier.status).text} border ${getStatusConfig(selectedSupplier.status).border}`}>
                        {selectedSupplier.status}
                      </span>
                      <div className="flex items-center gap-1 ml-1.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-black text-gray-900">{selectedSupplier.rating}</span>
                      </div>
                    </div>
                  </div>
               </div>
               <button
                 onClick={() => {
                  setShowDetailModal(false);
                  setSelectedSupplier(null);
                 }}
                 className="p-3 bg-gray-100/50 hover:bg-gray-200/50 rounded-xl transition-all cursor-pointer group text-gray-900"
               >
                 <X className="w-5 h-5 text-gray-500 group-hover:rotate-90 transition-transform duration-500" />
               </button>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Visual Identity / Description */}
                <div className="grid grid-cols-2 gap-3">
                   <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-100">
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1.5">Total Managed Capital</p>
                      <p className="text-2xl font-black text-blue-900">${(selectedSupplier.totalSpent / 1000).toFixed(0)}K</p>
                   </div>
                   <div className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl border border-indigo-100">
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1.5">Historical Orders</p>
                      <p className="text-2xl font-black text-indigo-900">{selectedSupplier.totalOrders}</p>
                   </div>
                </div>

                {/* Performance Matrix */}
                <div>
                   <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-3">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Performance Efficiency Matrix
                   </h3>
                   <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      {[
                        { label: 'On-Time delivery', val: selectedSupplier.performance.onTimeDelivery, color: 'emerald' },
                        { label: 'Quality Assurance', val: selectedSupplier.performance.qualityScore, color: 'blue' },
                        { label: 'response velocity', val: selectedSupplier.performance.responseTime, color: 'indigo' },
                        { label: 'Price Index', val: selectedSupplier.performance.priceCompetitiveness, color: 'amber' },
                      ].map((perf, idx) => (
                        <div key={idx}>
                           <div className="flex items-center justify-between mb-1.5">
                             <span className="text-[10px] font-bold text-gray-500 capitalize">{perf.label}</span>
                             <span className="text-[10px] font-black text-gray-900">{perf.val}%</span>
                           </div>
                           <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                             <div className={`h-full bg-${perf.color === 'emerald' ? 'emerald-500' : perf.color === 'blue' ? 'blue-500' : perf.color === 'indigo' ? 'indigo-500' : 'amber-500'} rounded-full`} style={{ width: `${perf.val}%` }} />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Contact Hub */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-5 bg-white border-2 border-gray-50 rounded-2xl shadow-sm">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Direct Personnel</p>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-[11px] font-black text-gray-400">
                            {selectedSupplier.contactPerson.charAt(0)}
                         </div>
                         <div>
                            <p className="text-sm font-black text-gray-900">{selectedSupplier.contactPerson}</p>
                            <p className="text-[10px] font-bold text-gray-400">{selectedSupplier.email}</p>
                         </div>
                      </div>
                   </div>
                   <div className="p-5 bg-white border-2 border-gray-200/50 rounded-2xl shadow-sm">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Node Coordinates</p>
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <p className="text-[10px] font-black text-gray-700">{selectedSupplier.address}, {selectedSupplier.city}</p>
                      </div>
                      <div className="flex items-center gap-2.5 mt-2.5">
                        <Globe className="w-3.5 h-3.5 text-blue-500" />
                        <p className="text-[10px] font-black text-gray-700">{selectedSupplier.website}</p>
                      </div>
                   </div>
                </div>

                {/* Operations */}
                <div className="bg-gray-900 rounded-[2rem] p-6 text-white">
                   <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                         <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Lead Latency</p>
                         <p className="text-lg font-black">{selectedSupplier.leadTime}</p>
                      </div>
                      <div className="text-center border-x border-white/10">
                         <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Pay Terms</p>
                         <p className="text-lg font-black">{selectedSupplier.paymentTerms}</p>
                      </div>
                      <div className="text-center">
                         <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Min Threshold</p>
                         <p className="text-lg font-black">${selectedSupplier.minimumOrder.toLocaleString()}</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Footer Actions */}
             <div className="p-6 bg-white/60 border-t border-gray-100 flex items-center gap-3 sticky bottom-0">
                <button 
                  onClick={() => setShowMessageModal(true)}
                  className="flex-1 px-4 py-4 bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Initiate Comms
                </button>
                 <button 
                  onClick={() => setShowOrderModal(true)}
                  className="flex-1 px-4 py-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Registry Order
                </button>
                <button 
                  onClick={() => {
                     setDeletingSupplier(selectedSupplier);
                     setShowDeleteModal(true);
                  }}
                  className="p-4 border-2 border-rose-100 text-rose-500 rounded-xl hover:bg-rose-50 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplier && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-500">
          <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-hidden border-2 border-white shadow-2xl flex flex-col relative text-gray-900">
             <div className="p-8 md:p-10 border-b border-gray-100 flex items-center justify-between bg-white/40 sticky top-0 z-10">
               <h2 className="text-2xl font-black tracking-tight">Registry <span className="text-blue-600">New Node</span></h2>
               <button onClick={() => setShowAddSupplier(false)} className="p-4 bg-gray-100/50 hover:bg-gray-200/50 rounded-2xl transition-all cursor-pointer">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Enterprise Designation</label>
                      <input type="text" placeholder="Legal Entity Name" className="w-full px-6 py-4 bg-white/50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold placeholder:text-gray-300" />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Classification</label>
                      <select className="w-full px-6 py-4 bg-white/50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold">
                        <option>Raw Materials</option>
                        <option>Manufacturing</option>
                        <option>Logistics</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Primary Contact</label>
                      <input type="text" placeholder="Personnel Name" className="w-full px-6 py-4 bg-white/50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold placeholder:text-gray-300" />
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Communication Channel (Email)</label>
                      <input type="email" placeholder="secure@entity.com" className="w-full px-6 py-4 bg-white/50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold placeholder:text-gray-300" />
                   </div>
                </div>

                <div className="bg-blue-50/50 rounded-[2.5rem] p-8 border border-blue-100">
                   <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Factory className="w-4 h-4" />
                      Operational Parameters
                   </h3>
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                         <label className="block text-[9px] font-black text-blue-400 uppercase mb-2">Payment Cycle</label>
                         <select className="w-full px-5 py-4 bg-white border-2 border-blue-100 rounded-xl focus:border-blue-500 outline-none transition-all font-bold">
                            <option>Net 30</option>
                            <option>Net 60</option>
                         </select>
                      </div>
                      <div>
                         <label className="block text-[9px] font-black text-blue-400 uppercase mb-2">Lead Latency</label>
                         <input type="text" placeholder="7-10 Days" className="w-full px-5 py-4 bg-white border-2 border-blue-100 rounded-xl focus:border-blue-500 outline-none transition-all font-bold placeholder:text-blue-200" />
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-8 md:p-10 bg-white/60 border-t border-gray-100 flex items-center gap-3 underline-offset-4">
                <button onClick={() => setShowAddSupplier(false)} className="flex-1 px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-all cursor-pointer">
                  Cancel Manifest
                </button>
                <button 
                  onClick={() => {
                     showNotify('Node Successfully Integrated into Registry');
                     setShowAddSupplier(false);
                  }}
                  className="flex-[2] px-8 py-5 bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 cursor-pointer"
                >
                  Registry Supplier Node
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showMessageModal && selectedSupplier && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-in fade-in duration-500">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] max-w-xl w-full max-h-[90vh] overflow-hidden border-2 border-white shadow-2xl flex flex-col relative text-gray-900">
             <div className="p-8 border-b border-gray-100 bg-white/40 sticky top-0 z-10 flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                      Dispatch Comms
                   </h2>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Recipient: {selectedSupplier.name}</p>
                </div>
                <button onClick={() => setShowMessageModal(false)} className="p-4 bg-gray-100/50 rounded-2xl cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Priority Protocol</label>
                   <div className="grid grid-cols-4 gap-2">
                      {['low', 'normal', 'high', 'urgent'].map((p) => (
                        <button
                          key={p}
                          onClick={() => setMessagePriority(p)}
                          className={`py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                            messagePriority === p 
                            ? (p === 'urgent' ? 'bg-rose-500 text-white' : 'bg-blue-500 text-white')
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                   </div>
                </div>

                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Manifest Subject</label>
                   <input 
                      type="text" 
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                      placeholder="Define communication vector..." 
                      className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-blue-500" 
                   />
                </div>

                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Intelligence Body</label>
                   <textarea 
                      rows={6}
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      placeholder="Transcribe manifest details..." 
                      className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-blue-500 resize-none" 
                   />
                </div>
             </div>

             <div className="p-8 bg-white/60 border-t border-gray-100">
                <button 
                  disabled={!messageSubject || !messageBody}
                  onClick={() => {
                    showNotify(`Communications Dispatched to ${selectedSupplier.name}`);
                    setShowMessageModal(false);
                  }}
                  className="w-full py-5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-blue-600 transition-all shadow-xl disabled:opacity-30 cursor-pointer"
                >
                  Confirm Dispatch
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Registry Order Modal */}
      {showOrderModal && selectedSupplier && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-in fade-in duration-500">
          <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] max-w-xl w-full max-h-[90vh] overflow-hidden border-2 border-white shadow-2xl flex flex-col relative text-gray-900">
             <div className="p-8 border-b border-gray-100 bg-white/40 flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                      <ShoppingCart className="w-6 h-6 text-blue-600" />
                      Registry Order
                   </h2>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Provider: {selectedSupplier.name}</p>
                </div>
                <button onClick={() => setShowOrderModal(false)} className="p-4 bg-gray-100/50 rounded-2xl cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Product/Service Context */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-[2rem] p-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                         <Building2 className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Classification</p>
                         <p className="text-sm font-bold text-gray-900">{selectedSupplier.category.replace('-', ' ')}</p>
                      </div>
                   </div>
                </div>

                {/* Magnitude Selector */}
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Procurement Magnitude</label>
                   <div className="grid grid-cols-2 gap-4">
                      <input 
                         type="number" 
                         placeholder="Quantity / Volume" 
                         className="px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all"
                      />
                      <div className="px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-400 flex items-center justify-center text-sm">
                         MIN: ${selectedSupplier.minimumOrder.toLocaleString()}
                      </div>
                   </div>
                </div>

                {/* Priority Selection */}
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Urgency Vector</label>
                   <div className="grid grid-cols-3 gap-3">
                      {['Standard', 'Expedited', 'Critical'].map((p) => (
                        <button
                          key={p}
                          onClick={() => setMessagePriority(p.toLowerCase())}
                          className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-2 ${
                            messagePriority === p.toLowerCase()
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Temporal Projection */}
                <div className="flex items-center gap-4 text-emerald-600 bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                   <Clock className="w-5 h-5" />
                   <p className="text-[10px] font-bold uppercase tracking-widest">
                      Estimated Fulfillment Latency: <span className="font-black underline">{selectedSupplier.leadTime}</span>
                   </p>
                </div>
             </div>

             <div className="p-8 bg-white/60 border-t border-gray-100 flex gap-4">
                <button 
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  disabled={isOrdering}
                  onClick={() => {
                    setIsOrdering(true);
                    setTimeout(() => {
                      setIsOrdering(false);
                      setShowOrderModal(false);
                      showNotify(`✓ Order Node Registered: Procurement Manifest #ORD-${Math.floor(Math.random() * 10000)} Synchronized`);
                    }, 2500);
                  }}
                  className="flex-[2] py-5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                >
                  {isOrdering ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  {isOrdering ? 'Registering...' : 'Registry Node Order'}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSupplier && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingSupplier(null);
          }}
          onConfirm={() => {
            setSuppliers(suppliers.filter(s => s.id !== deletingSupplier.id));
            showNotify('✓ Relationship Manifest Permanently Cleared');
          }}
          title="Delete Supplier"
          itemName={deletingSupplier.name}
          itemDetails={`${deletingSupplier.contactPerson} - ${deletingSupplier.email}`}
          warningMessage="This will permanently remove this supplier and all associated records."
        />
      )}


      {/* Configuration Matrix Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-in fade-in duration-500">
          <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-hidden border-2 border-white shadow-2xl flex flex-col relative">
             <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white/40 sticky top-0 z-10">
               <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Configuration <span className="text-blue-600">Matrix</span></h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">System Parameters & Protocol Adjustments</p>
               </div>
               <button onClick={() => setShowConfigModal(false)} className="p-4 bg-gray-100/50 hover:bg-gray-200/50 rounded-2xl transition-all cursor-pointer">
                 <X className="w-5 h-5" />
               </button>
             </div>

             <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Auto-Sync Protocols */}
                <div>
                  <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Auto-Sync Protocols
                  </h3>
                  <div className="bg-white/50 border-2 border-gray-100 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="font-bold text-gray-900 text-sm">Real-time Inventory Link</p>
                          <p className="text-[10px] text-gray-500 font-medium">Synchronize stock levels every 15 minutes</p>
                       </div>
                       <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                       </div>
                    </div>
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="font-bold text-gray-900 text-sm">Price Index Monitor</p>
                          <p className="text-[10px] text-gray-500 font-medium">Alert on &gt;5% deviation on contracted rates</p>
                       </div>
                       <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                       </div>
                    </div>
                  </div>
                </div>

                {/* Notification Vectors */}
                <div>
                  <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Notification Vectors
                  </h3>
                  <div className="bg-white/50 border-2 border-gray-100 rounded-2xl p-6 space-y-4">
                    {[
                      'Inbound Shipment Delays',
                      'Quality Assurance Flags',
                      'Contract Renewal Alerts',
                      'New Product Catalogues'
                    ].map((item, idx) => (
                      <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-5 h-5 rounded-md border-2 border-gray-300 group-hover:border-blue-500 flex items-center justify-center transition-all bg-white">
                           <CheckCircle className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                        <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-all">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* API & Integration */}
                <div>
                  <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    External Node Integration
                  </h3>
                  <div className="bg-gray-900 text-white rounded-2xl p-6">
                     <p className="text-[10px] font-bold text-gray-400 mb-2">API Endpoint Key</p>
                     <div className="flex items-center gap-2 bg-gray-800 rounded-xl p-3 border border-gray-700">
                        <code className="text-xs font-mono text-emerald-400 flex-1">sk_live_51Msz...92xS</code>
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-all" title="Copy Key">
                           <Download className="w-4 h-4 text-gray-400" />
                        </button>
                     </div>
                     <p className="text-[9px] text-gray-500 mt-3">* Access restricted to Admin protocols only.</p>
                  </div>
                </div>
             </div>

             <div className="p-8 bg-white/60 border-t border-gray-100">
                <button 
                  onClick={() => {
                    showNotify('System Configuration Updated Successfully');
                    setShowConfigModal(false);
                  }}
                  className="w-full py-5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Save Parameters
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
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
               <Info className="w-5 h-5" />}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">{notification.message}</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
