"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, 
  Target, Activity, BarChart3, LineChart, ArrowUpRight,
  ArrowDownRight, Calendar, Download, RefreshCw, Plus,
  Zap, Award, Percent, AlertCircle, Eye, Star, UserCheck, 
  ShoppingBag, CreditCard, MousePointer, 
  ChevronRight, Minus,
  Gauge, Layers, Grid, List, MoreVertical,
  X, Sparkles, Brain, CheckSquare, LucideIcon
} from 'lucide-react';

interface KPI {
  id: string;
  name: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  target?: string | number;
  progress?: number;
  category: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
  unit?: string;
  description?: string;
  trend?: number[];
}

interface MetricCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  count: number;
  dest?: string;
}

const metricCategories: MetricCategory[] = [
  { id: 'all', name: 'All Metrics', icon: Grid, color: 'gray', count: 24 },
  { id: 'financial', name: 'Financial', icon: DollarSign, color: 'green', count: 8, dest: '/dashboard/accounting' },
  { id: 'sales', name: 'Sales', icon: ShoppingCart, color: 'blue', count: 6, dest: '/dashboard/crm' },
  { id: 'marketing', name: 'Marketing', icon: Target, color: 'purple', count: 5, dest: '/dashboard/campaigns' },
  { id: 'customer', name: 'Customer', icon: Users, color: 'orange', count: 5, dest: '/dashboard/helpdesk' },
];

export default function KPIDashboardPage() {
  const router = useRouter();
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const [kpis, setKpis] = useState<KPI[]>([
    {
      id: '1',
      name: 'Total Revenue',
      value: '$124,580',
      change: 12.5,
      changeType: 'increase',
      target: '$150,000',
      progress: 83,
      category: 'financial',
      icon: DollarSign,
      color: 'green',
      gradient: 'from-green-500 to-emerald-500',
      unit: 'USD',
      description: 'Total revenue generated this month',
      trend: [45000, 52000, 48000, 65000, 58000, 72000, 68000, 80000, 75000, 85000, 82000, 90000]
    },
    {
      id: '2',
      name: 'Net Profit Margin',
      value: '28.4%',
      change: 3.2,
      changeType: 'increase',
      target: '30%',
      progress: 94.6,
      category: 'financial',
      icon: Percent,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-500',
      unit: '%',
      description: 'Profit as percentage of revenue',
      trend: [22, 24, 23, 26, 25, 27, 26, 28, 27, 29, 28, 30]
    },
    {
      id: '3',
      name: 'Operating Expenses',
      value: '$45,230',
      change: -5.8,
      changeType: 'decrease',
      target: '$40,000',
      progress: 88,
      category: 'financial',
      icon: CreditCard,
      color: 'red',
      gradient: 'from-red-500 to-rose-500',
      unit: 'USD',
      description: 'Monthly operational costs',
      trend: [50000, 48000, 49000, 47000, 46000, 45000, 44000, 46000, 45000, 44000, 45230, 43000]
    },
    {
      id: '4',
      name: 'Cash Flow',
      value: '$89,350',
      change: 18.3,
      changeType: 'increase',
      category: 'financial',
      icon: Activity,
      color: 'cyan',
      gradient: 'from-cyan-500 to-blue-500',
      unit: 'USD',
      description: 'Net cash flow this period',
      trend: [60000, 65000, 62000, 70000, 68000, 75000, 72000, 80000, 78000, 85000, 83000, 89350]
    },
    {
      id: '5',
      name: 'Total Sales',
      value: '1,847',
      change: 15.7,
      changeType: 'increase',
      target: '2,000',
      progress: 92.3,
      category: 'sales',
      icon: ShoppingCart,
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-500',
      unit: 'orders',
      description: 'Number of completed sales',
      trend: [1200, 1300, 1250, 1400, 1350, 1500, 1450, 1600, 1550, 1700, 1650, 1847]
    },
    {
      id: '6',
      name: 'Average Order Value',
      value: '$67.45',
      change: 8.2,
      changeType: 'increase',
      target: '$75',
      progress: 89.9,
      category: 'sales',
      icon: ShoppingBag,
      color: 'indigo',
      gradient: 'from-indigo-500 to-purple-500',
      unit: 'USD',
      description: 'Average value per order',
      trend: [55, 58, 57, 60, 59, 62, 61, 64, 63, 66, 65, 67.45]
    },
    {
      id: '7',
      name: 'Conversion Rate',
      value: '4.8%',
      change: 0.5,
      changeType: 'increase',
      target: '5.5%',
      progress: 87.2,
      category: 'sales',
      icon: MousePointer,
      color: 'violet',
      gradient: 'from-violet-500 to-purple-500',
      unit: '%',
      description: 'Visitor to customer conversion',
      trend: [3.5, 3.8, 3.7, 4.0, 3.9, 4.2, 4.1, 4.4, 4.3, 4.6, 4.5, 4.8]
    },
    {
      id: '8',
      name: 'Sales Growth Rate',
      value: '23.4%',
      change: 3.1,
      changeType: 'increase',
      category: 'sales',
      icon: TrendingUp,
      color: 'sky',
      gradient: 'from-sky-500 to-blue-500',
      unit: '%',
      description: 'Month-over-month growth',
      trend: [15, 16, 15.5, 18, 17, 19, 18.5, 21, 20, 22, 21.5, 23.4]
    },
    {
      id: '9',
      name: 'Website Traffic',
      value: '45,892',
      change: 22.8,
      changeType: 'increase',
      target: '50,000',
      progress: 91.7,
      category: 'marketing',
      icon: Activity,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500',
      unit: 'visits',
      description: 'Total website visitors',
      trend: [30000, 32000, 31000, 35000, 34000, 38000, 37000, 41000, 40000, 44000, 43000, 45892]
    },
    {
      id: '10',
      name: 'Lead Generation',
      value: '892',
      change: 18.5,
      changeType: 'increase',
      target: '1,000',
      progress: 89.2,
      category: 'marketing',
      icon: Target,
      color: 'fuchsia',
      gradient: 'from-fuchsia-500 to-pink-500',
      unit: 'leads',
      description: 'New leads captured',
      trend: [600, 650, 620, 700, 680, 750, 730, 800, 780, 850, 830, 892]
    },
    {
      id: '11',
      name: 'Email Open Rate',
      value: '28.7%',
      change: 4.3,
      changeType: 'increase',
      target: '30%',
      progress: 95.6,
      category: 'marketing',
      icon: Eye,
      color: 'rose',
      gradient: 'from-rose-500 to-red-500',
      unit: '%',
      description: 'Email campaign engagement',
      trend: [22, 23, 22.5, 24, 23.5, 25, 24.5, 26, 25.5, 27, 26.5, 28.7]
    },
    {
      id: '12',
      name: 'Social Media Reach',
      value: '124.5K',
      change: 31.2,
      changeType: 'increase',
      category: 'marketing',
      icon: Users,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-500',
      unit: 'impressions',
      description: 'Total social media impressions',
      trend: [80000, 85000, 82000, 90000, 88000, 95000, 93000, 100000, 98000, 110000, 115000, 124500]
    },
    {
      id: '13',
      name: 'Total Customers',
      value: '3,456',
      change: 12.3,
      changeType: 'increase',
      target: '4,000',
      progress: 86.4,
      category: 'customer',
      icon: Users,
      color: 'orange',
      gradient: 'from-orange-500 to-red-500',
      unit: 'customers',
      description: 'Active customer base',
      trend: [2500, 2600, 2550, 2700, 2650, 2800, 2750, 2900, 2850, 3000, 3200, 3456]
    },
    {
      id: '14',
      name: 'Customer Retention',
      value: '94.2%',
      change: 2.1,
      changeType: 'increase',
      target: '95%',
      progress: 99.1,
      category: 'customer',
      icon: UserCheck,
      color: 'teal',
      gradient: 'from-teal-500 to-cyan-500',
      unit: '%',
      description: 'Customer retention rate',
      trend: [88, 89, 88.5, 90, 89.5, 91, 90.5, 92, 91.5, 93, 92.5, 94.2]
    },
    {
      id: '15',
      name: 'Customer Satisfaction',
      value: '4.7/5',
      change: 0.3,
      changeType: 'increase',
      target: '4.8/5',
      progress: 97.9,
      category: 'customer',
      icon: Star,
      color: 'yellow',
      gradient: 'from-yellow-500 to-amber-500',
      unit: 'rating',
      description: 'Average customer rating',
      trend: [4.2, 4.3, 4.25, 4.35, 4.3, 4.4, 4.35, 4.5, 4.45, 4.6, 4.55, 4.7]
    },
    {
      id: '16',
      name: 'Churn Rate',
      value: '2.3%',
      change: -0.8,
      changeType: 'decrease',
      target: '2%',
      progress: 87,
      category: 'customer',
      icon: AlertCircle,
      color: 'red',
      gradient: 'from-red-500 to-pink-500',
      unit: '%',
      description: 'Customer churn rate',
      trend: [4.5, 4.2, 4.3, 4.0, 3.8, 3.5, 3.3, 3.0, 2.8, 2.5, 2.4, 2.3]
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [timeRange, setTimeRange] = useState('month');
  const [showAddKPI, setShowAddKPI] = useState(false);

  const filteredKPIs = selectedCategory === 'all' 
    ? kpis 
    : kpis.filter(kpi => kpi.category === selectedCategory);

  const getChangeIcon = (changeType: string) => {
    if (changeType === 'increase') return ArrowUpRight;
    if (changeType === 'decrease') return ArrowDownRight;
    return Minus;
  };

  const getChangeColor = (changeType: string) => {
    if (changeType === 'increase') return 'text-green-600 bg-green-50';
    if (changeType === 'decrease') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const calculateOverallPerformance = () => {
    const avgProgress = kpis.filter(k => k.progress).reduce((acc, k) => acc + (k.progress || 0), 0) / kpis.filter(k => k.progress).length;
    return avgProgress.toFixed(1);
  };

  return (
    <div className="relative min-h-screen">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[5%] w-[35%] h-[35%] bg-purple-600/10 rounded-full blur-[120px] animate-bounce duration-[10s]" />
        <div className="absolute top-[40%] right-[20%] w-[25%] h-[25%] bg-pink-600/5 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="relative z-10 space-y-6 pb-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border-2 border-white shadow-2xl shadow-blue-500/5">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative p-5 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-blue-100">
                  Business Intelligence
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-100">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Live Sync
                </span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
                KPI <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Dashboard</span>
              </h1>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Strategic Asset Performance Metrics</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="pl-6 pr-12 py-4 bg-white/80 backdrop-blur-md border-2 border-gray-100 rounded-2xl focus:border-blue-500 transition-all duration-300 font-bold text-gray-900 shadow-sm appearance-none cursor-pointer outline-none"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
            </div>

            <div className="flex items-center gap-2 p-2 bg-white/80 backdrop-blur-md rounded-2xl border-2 border-gray-100 shadow-sm">
              <button 
                onClick={() => {
                  const shuffled = [...kpis].sort(() => 0.5 - Math.random());
                  setKpis(shuffled);
                }}
                className="p-3 hover:bg-gray-50 rounded-xl transition-all duration-300 group cursor-pointer" 
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:rotate-180 transition-all duration-700" />
              </button>
              <div className="w-px h-6 bg-gray-100" />
              <button 
                onClick={() => showNotification('KPI Analytics Export Initiated. Compiling data streams...', 'info')}
                className="p-3 hover:bg-gray-50 rounded-xl transition-all duration-300 group cursor-pointer" 
                title="Export Analytics"
              >
                <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:-translate-y-1 transition-all duration-300" />
              </button>
            </div>

            <button
              onClick={() => setShowAddKPI(true)}
              className="px-8 py-4 bg-gray-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-500 cursor-pointer flex items-center gap-3 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Provision KPI
            </button>
          </div>
        </div>

      {/* Overall Performance Summary */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-blue-500/20 cursor-help">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-700">
          <Zap className="w-48 h-48" />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 opacity-80 uppercase tracking-[0.2em] text-[10px] font-black">
              <Gauge className="w-4 h-4" />
              Strategic Index
            </div>
            <div>
              <p className="text-5xl font-black tracking-tighter mb-1">{calculateOverallPerformance()}%</p>
              <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Aggregate Target Achievement</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 opacity-80 uppercase tracking-[0.2em] text-[10px] font-black">
              <TrendingUp className="w-4 h-4" />
              Growth Velocity
            </div>
            <div>
              <p className="text-5xl font-black tracking-tighter mb-1">{kpis.filter(k => k.changeType === 'increase').length}</p>
              <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Metrics Trending Upward</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 opacity-80 uppercase tracking-[0.2em] text-[10px] font-black">
              <Target className="w-4 h-4" />
              Precision Goals
            </div>
            <div>
              <p className="text-5xl font-black tracking-tighter mb-1">{kpis.filter(k => k.progress && k.progress >= 90).length}</p>
              <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Targets Secured / {kpis.filter(k => k.target).length} Total</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 opacity-80 uppercase tracking-[0.2em] text-[10px] font-black">
              <Layers className="w-4 h-4" />
              Observed Nodes
            </div>
            <div>
              <p className="text-5xl font-black tracking-tighter mb-1">{kpis.length}</p>
              <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Active Data Streams</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter & View Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {metricCategories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all duration-300 border-2 cursor-pointer ${
                  isSelected
                    ? 'bg-gray-900 border-gray-900 text-white shadow-xl shadow-gray-900/20 scale-105'
                    : 'bg-white/60 backdrop-blur-md border-gray-100 text-gray-500 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : ''}`} />
                {category.name}
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                  isSelected ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {category.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 p-2 bg-white/60 backdrop-blur-md border-2 border-gray-100 rounded-[2rem] shadow-sm flex-shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-3 rounded-[1.25rem] transition-all duration-300 group cursor-pointer ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-3 rounded-[1.25rem] transition-all duration-300 group cursor-pointer ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* KPI Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredKPIs.map((kpi, index) => {
            const Icon = kpi.icon;
            const ChangeIcon = getChangeIcon(kpi.changeType);
            return (
              <div
                key={kpi.id}
                className="group relative bg-white/60 backdrop-blur-md rounded-[2rem] border-2 border-white p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${kpi.gradient} opacity-[0.03] rounded-bl-[4rem] group-hover:scale-110 transition-transform duration-700`} />
                
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${kpi.gradient} shadow-lg shadow-blue-500/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <button 
                      onClick={() => showNotification(`Context Menu: ${kpi.name}`, 'info')}
                      className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* KPI Identity */}
                  <div className="mb-6">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{kpi.category}</h3>
                    <h4 className="text-lg font-black text-gray-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">{kpi.name}</h4>
                  </div>

                  {/* Value Matrix */}
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <p className="text-3xl font-black text-gray-900 tracking-tighter">
                        {kpi.value}
                        {kpi.unit && kpi.unit !== 'USD' && kpi.unit !== '%' && (
                          <span className="text-xs font-bold text-gray-400 ml-1 uppercase">{kpi.unit}</span>
                        )}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getChangeColor(kpi.changeType)}`}>
                      <ChangeIcon className="w-4 h-4" />
                      {Math.abs(kpi.change)}%
                    </div>
                  </div>

                  {/* Operational Precision */}
                  {kpi.target && kpi.progress && (
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.15em]">
                        <span className="text-gray-400">Precision Target: <span className="text-gray-600">{kpi.target}</span></span>
                        <span className="text-blue-600">{kpi.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-50 shadow-inner">
                        <div
                          className={`h-full bg-gradient-to-r ${kpi.gradient} rounded-full transition-all duration-1000 ease-out shadow-lg`}
                          style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Micro Trends */}
                  {kpi.trend && (
                    <div className="pt-6 border-t border-gray-100/50">
                      <div className="flex items-end justify-between h-14 gap-1">
                        {kpi.trend.map((value, idx) => {
                          const maxValue = Math.max(...kpi.trend!);
                          const height = (value / maxValue) * 100;
                          return (
                            <div
                              key={idx}
                              className={`flex-1 bg-gradient-to-t ${kpi.gradient} rounded-t-md opacity-20 group-hover:opacity-60 transition-all duration-500 hover:!opacity-100 cursor-help`}
                              style={{ height: `${height}%` }}
                              title={`${value}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredKPIs.map((kpi, index) => {
            const Icon = kpi.icon;
            const ChangeIcon = getChangeIcon(kpi.changeType);
            return (
              <div
                key={kpi.id}
                className="bg-white/60 backdrop-blur-md rounded-3xl border-2 border-white p-5 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group animate-in fade-in slide-in-from-left-4 fill-mode-both"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-center gap-6">
                  {/* Icon Identity */}
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${kpi.gradient} shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform duration-500 flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Operational Narrative */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-gray-900 truncate tracking-tight">{kpi.name}</h3>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[8px] font-black uppercase tracking-widest rounded-md">
                        {kpi.category}
                      </span>
                    </div>
                    {kpi.description && (
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate">{kpi.description}</p>
                    )}
                  </div>

                  {/* Magnitude Matrix */}
                  <div className="text-right flex-shrink-0 px-8 border-x border-gray-100/50">
                    <p className="text-2xl font-black text-gray-900 tracking-tighter">{kpi.value}</p>
                    <div className={`flex items-center justify-end gap-1 font-black text-[10px] uppercase tracking-widest mt-1 ${getChangeColor(kpi.changeType)}`}>
                      <ChangeIcon className="w-3 h-3" />
                      {Math.abs(kpi.change)}%
                    </div>
                  </div>

                  {/* Precision Index */}
                  {kpi.target && kpi.progress && (
                    <div className="w-48 flex-shrink-0">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                        <span className="text-gray-400">Target: {kpi.target}</span>
                        <span className="text-blue-600">{kpi.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-50 shadow-inner">
                        <div
                          className={`h-full bg-gradient-to-r ${kpi.gradient} rounded-full`}
                          style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Micro Trends Panel */}
                  {kpi.trend && (
                    <div className="w-32 flex-shrink-0 pl-6 h-10">
                      <div className="flex items-end justify-between h-full gap-0.5">
                        {kpi.trend.slice(-12).map((value, idx) => {
                          const maxValue = Math.max(...kpi.trend!);
                          const height = (value / maxValue) * 100;
                          return (
                            <div
                              key={idx}
                              className={`flex-1 bg-gradient-to-t ${kpi.gradient} rounded-t-sm opacity-20 group-hover:opacity-60 transition-all duration-500`}
                              style={{ height: `${height}%` }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Control Node */}
                  <button 
                    onClick={() => showNotification(`Context Menu: ${kpi.name}`, 'info')}
                    className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-300 flex-shrink-0 group/btn cursor-pointer"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400 group-hover/btn:text-blue-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Performance Insights Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performers: The Vanguard */}
        <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] border-2 border-white p-8 shadow-2xl shadow-emerald-500/5 group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Award className="w-5 h-5 text-emerald-600" />
                </div>
                The Vanguard
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Highest Operational Velocity</p>
            </div>
            <TrendingUp className="w-6 h-6 text-emerald-400 opacity-20 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div className="space-y-4">
            {kpis
              .filter(k => k.changeType === 'increase')
              .sort((a, b) => b.change - a.change)
              .slice(0, 5)
              .map((kpi, idx) => {
                const Icon = kpi.icon;
                return (
                  <div 
                    key={kpi.id} 
                    className="flex items-center gap-4 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/50 group/item hover:bg-emerald-50 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                    onClick={() => showNotification(`Deep Analysis: ${kpi.name}`, 'info')}
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-white shadow-sm border border-emerald-100 rounded-xl font-black text-emerald-600 text-xs group-hover/item:scale-110 transition-transform">
                      {idx + 1}
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.gradient} shadow-lg shadow-blue-500/10`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-900 text-sm tracking-tight truncate">{kpi.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.value}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-emerald-600 font-black text-sm">
                        <ArrowUpRight className="w-4 h-4" />
                        {kpi.change}%
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Needs Attention: Critical Nodes */}
        <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] border-2 border-white p-8 shadow-2xl shadow-rose-500/5 group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                </div>
                Critical Nodes
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Below Targeted Precision</p>
            </div>
            <TrendingDown className="w-6 h-6 text-rose-400 opacity-20 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="space-y-4">
            {kpis
              .filter(k => k.progress && k.progress < 90)
              .sort((a, b) => (a.progress || 0) - (b.progress || 0))
              .slice(0, 5)
              .map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <div 
                    key={kpi.id} 
                    className="flex items-center gap-4 p-4 bg-rose-50/30 rounded-2xl border border-rose-100/50 group/item hover:bg-rose-50 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                    onClick={() => showNotification(`Strategic Alert: ${kpi.name} requires attention`, 'info')}
                  >
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.gradient} shadow-lg shadow-blue-500/10`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-900 text-sm tracking-tight truncate">{kpi.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.value} / {kpi.target}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-rose-600 font-black text-sm">{kpi.progress}%</div>
                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Precision</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Detailed Analytics: Performance Trends */}
      <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] border-2 border-white p-10 shadow-2xl shadow-blue-500/5 group">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <LineChart className="w-5 h-5 text-blue-600" />
              </div>
              Temporal Analytics
            </h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Cross-sectional performance trends</p>
          </div>
          <div className="flex items-center gap-3 p-2 bg-gray-50/50 rounded-2xl border border-gray-100">
            {['Revenue', 'Sales', 'Customers'].map((tab) => (
              <button
                key={tab}
                onClick={() => showNotification(`Viewing ${tab} Analytics`, 'info')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                  tab === 'Revenue' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-72 flex items-end justify-between gap-3 px-4">
          {kpis[0].trend?.map((value, idx) => {
            const maxValue = Math.max(...(kpis[0].trend || []));
            const height = (value / maxValue) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-4 group/bar">
                <div className="w-full relative">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-xl transition-all duration-500 group-hover/bar:from-blue-700 group-hover/bar:to-purple-700 cursor-pointer relative shadow-lg shadow-blue-500/10 group-hover/bar:-translate-y-1"
                    style={{ height: `${height * 2.8}px` }}
                  >
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-0 group-hover/bar:opacity-100 transition-opacity rounded-t-xl" />
                  </div>
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all duration-300 pointer-events-none shadow-xl scale-90 group-hover/bar:scale-100">
                    ${(value / 1000).toFixed(1)}K
                  </div>
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest transition-colors group-hover/bar:text-blue-600">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCategories.filter(c => c.id !== 'all').map((category) => {
          const Icon = category.icon;
          const categoryKPIs = kpis.filter(k => k.category === category.id);
          const avgChange = categoryKPIs.reduce((acc, k) => acc + k.change, 0) / categoryKPIs.length;
          const isPositive = avgChange > 0;
          
          return (
            <div 
              key={category.id} 
              className="bg-white rounded-[2rem] border-2 border-gray-100 p-6 hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-500 cursor-pointer group/cat"
              onClick={() => category.dest ? router.push(category.dest) : setSelectedCategory(category.id)}
            >
              <div className="flex items-center justify-between mb-5">
                <div className={`p-3 rounded-2xl bg-gradient-to-br transition-transform duration-500 group-hover/cat:scale-110 shadow-lg`}
                     style={{
                       background: category.color === 'green' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                                  category.color === 'blue' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' :
                                  category.color === 'purple' ? 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)' :
                                  category.color === 'orange' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                       boxShadow: `0 10px 15px -3px ${category.color === 'green' ? 'rgba(16, 185, 129, 0.2)' : category.color === 'blue' ? 'rgba(59, 130, 246, 0.2)' : category.color === 'purple' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(249, 115, 22, 0.2)'}`
                     }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                  isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                }`}>
                  {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {Math.abs(avgChange).toFixed(1)}%
                </div>
              </div>
              
              <h3 className="text-sm font-black text-gray-900 mb-1 uppercase tracking-wider group-hover/cat:text-blue-600 transition-colors">{category.name}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">{category.count} metrics tracked</p>
              
              <div className="space-y-2.5 mb-6">
                {categoryKPIs.slice(0, 3).map((kpi) => (
                  <div key={kpi.id} className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate max-w-[100px]">{kpi.name}</span>
                    <span className="text-xs font-black text-gray-900 tracking-tighter">{kpi.value}</span>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (category.dest) router.push(category.dest);
                }}
                className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 bg-gray-50 hover:bg-gray-900 hover:text-white rounded-xl transition-all duration-500 flex items-center justify-center gap-2 cursor-pointer group/btn overflow-hidden relative"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Analyze All <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Add KPI Modal */}
      {showAddKPI && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowAddKPI(false)} />
          
          <div className="relative w-full max-w-5xl bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl border-2 border-white overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-500 max-h-[90vh]">
            {/* Left Sidebar: Context & Vision */}
            <div className="w-full md:w-[320px] bg-gray-900 p-10 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                <BarChart3 className="w-48 h-48" />
              </div>
              
              <div className="relative z-10">
                <div className="p-4 bg-white/10 rounded-2xl w-fit mb-8 backdrop-blur-xl border border-white/10">
                  <Sparkles className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-3xl font-black tracking-tight mb-4 leading-tight">Provision <br />Strategic Node</h2>
                <p className="text-sm font-bold text-gray-400 leading-relaxed uppercase tracking-widest">Define new parameters for real-time asset performance tracking and neural synthesis.</p>
              </div>

              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">AI Synthesis</p>
                    <p className="text-xs font-bold text-white/80">Predictive Modeling</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <CheckSquare className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-purple-400">Validation</p>
                    <p className="text-xs font-bold text-white/80">Automated Audit</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Pane: Configuration Form */}
            <div className="flex-1 p-10 overflow-y-auto">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Operational Logic</h3>
                  <p className="text-2xl font-black text-gray-900 tracking-tight">Configuration Parameters</p>
                </div>
                <button
                  onClick={() => setShowAddKPI(false)}
                  className="p-4 hover:bg-gray-100 rounded-2xl transition-all duration-300 group cursor-pointer"
                >
                  <X className="w-6 h-6 text-gray-400 group-hover:text-gray-900 group-hover:rotate-90 transition-all duration-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Identity</label>
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="e.g., Gross Net Utility"
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all duration-300 font-bold text-gray-900 shadow-sm outline-none"
                    />
                    <Layers className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Data Category</label>
                  <div className="relative group">
                    <select className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all duration-300 font-bold text-gray-900 shadow-sm appearance-none outline-none cursor-pointer">
                      {metricCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none group-focus-within:text-blue-500 rotate-90" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Threshold</label>
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="e.g., 500,000"
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all duration-300 font-bold text-gray-900 shadow-sm outline-none"
                    />
                    <Target className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unit Specification</label>
                  <div className="relative group">
                    <select className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all duration-300 font-bold text-gray-900 shadow-sm appearance-none outline-none cursor-pointer">
                      <option value="USD">USD ($)</option>
                      <option value="%">Percentage (%)</option>
                      <option value="number">Integer</option>
                    </select>
                    <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none group-focus-within:text-blue-500 rotate-90" />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Operational Description</label>
                  <textarea
                    placeholder="Provide context for this strategic node..."
                    rows={4}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all duration-300 font-bold text-gray-900 shadow-sm outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-12 pb-4">
                <button
                  onClick={() => setShowAddKPI(false)}
                  className="w-full sm:w-auto px-8 py-4 bg-gray-100 text-gray-600 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-200 transition-all duration-300 cursor-pointer"
                >
                  Abort Provision
                </button>
                <button 
                  onClick={() => {
                    showNotification('Strategic Node successfully provisioned to the network.', 'success');
                    setShowAddKPI(false);
                  }}
                  className="w-full sm:w-auto px-10 py-4 bg-gray-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-500 cursor-pointer active:scale-95"
                >
                  Confirm Provisioning
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-8 right-8 z-[200] animate-in slide-in-from-right-8 fade-in-0 duration-500">
          <div className={`flex items-center gap-4 px-8 py-5 rounded-[2rem] shadow-2xl backdrop-blur-2xl border-2 ${
            notification.type === 'success' 
              ? 'bg-emerald-500/90 border-emerald-400/50 text-white' 
              : 'bg-blue-900/90 border-blue-400/50 text-white'
          }`}>
            <div className={`p-2 rounded-xl ${notification.type === 'success' ? 'bg-white/20' : 'bg-white/10'}`}>
              {notification.type === 'success' ? <CheckSquare className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                {notification.type === 'success' ? 'Operation Success' : 'System Insight'}
              </p>
              <p className="text-sm font-bold tracking-tight">{notification.message}</p>
            </div>
            <button onClick={() => setNotification(null)} className="ml-4 p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
