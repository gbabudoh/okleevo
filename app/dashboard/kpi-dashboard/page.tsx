"use client";

import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, 
  Target, Activity, BarChart3, PieChart, LineChart, ArrowUpRight,
  ArrowDownRight, Calendar, Filter, Download, RefreshCw, Plus,
  Eye, Settings, Zap, Award, Percent, Clock, MousePointer,
  UserCheck, ShoppingBag, CreditCard, Repeat, Star, AlertCircle,
  CheckCircle, XCircle, MinusCircle, ChevronRight, Minus,
  Gauge, Layers, Grid, List, MoreVertical, Edit3, Trash2, Copy
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
  icon: any;
  color: string;
  gradient: string;
  unit?: string;
  description?: string;
  trend?: number[];
}

interface MetricCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  count: number;
}

const metricCategories: MetricCategory[] = [
  { id: 'all', name: 'All Metrics', icon: Grid, color: 'gray', count: 24 },
  { id: 'financial', name: 'Financial', icon: DollarSign, color: 'green', count: 8 },
  { id: 'sales', name: 'Sales', icon: ShoppingCart, color: 'blue', count: 6 },
  { id: 'marketing', name: 'Marketing', icon: Target, color: 'purple', count: 5 },
  { id: 'customer', name: 'Customer', icon: Users, color: 'orange', count: 5 },
];

export default function KPIDashboardPage() {
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
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            KPI Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Track and measure your business performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="p-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Download className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setShowAddKPI(true)}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add KPI
          </button>
        </div>
      </div>

      {/* Overall Performance Summary */}
      <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <Gauge className="w-5 h-5" />
              <span className="text-sm font-medium">Overall Performance</span>
            </div>
            <p className="text-4xl font-bold">{calculateOverallPerformance()}%</p>
            <p className="text-sm opacity-90 mt-1">Target Achievement</p>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Positive Trends</span>
            </div>
            <p className="text-4xl font-bold">{kpis.filter(k => k.changeType === 'increase').length}</p>
            <p className="text-sm opacity-90 mt-1">Metrics Improving</p>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <Target className="w-5 h-5" />
              <span className="text-sm font-medium">Goals Met</span>
            </div>
            <p className="text-4xl font-bold">{kpis.filter(k => k.progress && k.progress >= 90).length}</p>
            <p className="text-sm opacity-90 mt-1">Out of {kpis.filter(k => k.target).length} Targets</p>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <Layers className="w-5 h-5" />
              <span className="text-sm font-medium">Total Metrics</span>
            </div>
            <p className="text-4xl font-bold">{kpis.length}</p>
            <p className="text-sm opacity-90 mt-1">Being Tracked</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {metricCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? `bg-${category.color}-500 text-white shadow-lg`
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                }`}
                style={selectedCategory === category.id ? {
                  backgroundColor: category.color === 'gray' ? '#6b7280' : 
                                   category.color === 'green' ? '#10b981' :
                                   category.color === 'blue' ? '#3b82f6' :
                                   category.color === 'purple' ? '#a855f7' :
                                   category.color === 'orange' ? '#f97316' : '#6b7280'
                } : {}}
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

        <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-xl p-1">
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

      {/* KPI Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredKPIs.map((kpi) => {
            const Icon = kpi.icon;
            const ChangeIcon = getChangeIcon(kpi.changeType);
            return (
              <div
                key={kpi.id}
                className="group relative bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-transparent hover:shadow-2xl transition-all overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                <div className="relative">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${kpi.gradient}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {/* KPI Name */}
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">{kpi.name}</h3>

                  {/* Value */}
                  <div className="flex items-baseline gap-2 mb-3">
                    <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
                    {kpi.unit && kpi.unit !== 'USD' && kpi.unit !== '%' && (
                      <span className="text-sm text-gray-500">{kpi.unit}</span>
                    )}
                  </div>

                  {/* Change Indicator */}
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold mb-3 ${getChangeColor(kpi.changeType)}`}>
                    <ChangeIcon className="w-4 h-4" />
                    {Math.abs(kpi.change)}%
                  </div>

                  {/* Progress Bar (if target exists) */}
                  {kpi.target && kpi.progress && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Target: {kpi.target}</span>
                        <span className="font-semibold text-gray-900">{kpi.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${kpi.gradient} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Mini Trend Chart */}
                  {kpi.trend && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-end justify-between h-12 gap-0.5">
                        {kpi.trend.map((value, idx) => {
                          const maxValue = Math.max(...kpi.trend!);
                          const height = (value / maxValue) * 100;
                          return (
                            <div
                              key={idx}
                              className={`flex-1 bg-gradient-to-t ${kpi.gradient} rounded-t opacity-60 hover:opacity-100 transition-opacity`}
                              style={{ height: `${height}%` }}
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
        <div className="space-y-3">
          {filteredKPIs.map((kpi) => {
            const Icon = kpi.icon;
            const ChangeIcon = getChangeIcon(kpi.changeType);
            return (
              <div
                key={kpi.id}
                className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.gradient} flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Name & Description */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-0.5">{kpi.name}</h3>
                    {kpi.description && (
                      <p className="text-sm text-gray-600 truncate">{kpi.description}</p>
                    )}
                  </div>

                  {/* Value */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold mt-1 ${getChangeColor(kpi.changeType)}`}>
                      <ChangeIcon className="w-3 h-3" />
                      {Math.abs(kpi.change)}%
                    </div>
                  </div>

                  {/* Progress */}
                  {kpi.target && kpi.progress && (
                    <div className="w-32 flex-shrink-0">
                      <div className="text-xs text-gray-600 mb-1">Target: {kpi.target}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-full bg-gradient-to-r ${kpi.gradient} rounded-full`}
                          style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs font-semibold text-gray-900 mt-1">{kpi.progress}%</div>
                    </div>
                  )}

                  {/* Mini Trend */}
                  {kpi.trend && (
                    <div className="w-24 flex-shrink-0">
                      <div className="flex items-end justify-between h-8 gap-0.5">
                        {kpi.trend.slice(-8).map((value, idx) => {
                          const maxValue = Math.max(...kpi.trend!);
                          const height = (value / maxValue) * 100;
                          return (
                            <div
                              key={idx}
                              className={`flex-1 bg-gradient-to-t ${kpi.gradient} rounded-t opacity-60`}
                              style={{ height: `${height}%` }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Top Performers
            </h3>
            <span className="text-sm text-gray-600">Highest Growth</span>
          </div>
          <div className="space-y-3">
            {kpis
              .filter(k => k.changeType === 'increase')
              .sort((a, b) => b.change - a.change)
              .slice(0, 5)
              .map((kpi, idx) => {
                const Icon = kpi.icon;
                return (
                  <div key={kpi.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white font-bold rounded-lg text-sm">
                      #{idx + 1}
                    </div>
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${kpi.gradient}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{kpi.name}</p>
                      <p className="text-xs text-gray-600">{kpi.value}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-green-600 font-bold text-sm">
                        <ArrowUpRight className="w-4 h-4" />
                        {kpi.change}%
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Needs Attention */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Needs Attention
            </h3>
            <span className="text-sm text-gray-600">Below Target</span>
          </div>
          <div className="space-y-3">
            {kpis
              .filter(k => k.progress && k.progress < 90)
              .sort((a, b) => (a.progress || 0) - (b.progress || 0))
              .slice(0, 5)
              .map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <div key={kpi.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${kpi.gradient}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{kpi.name}</p>
                      <p className="text-xs text-gray-600">{kpi.value} / {kpi.target}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-orange-600 font-bold text-sm">{kpi.progress}%</div>
                      <div className="text-xs text-gray-600">of target</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-blue-500" />
            Performance Trends
          </h3>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Revenue
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              Sales
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              Customers
            </button>
          </div>
        </div>
        
        <div className="h-64 flex items-end justify-between gap-2">
          {kpis[0].trend?.map((value, idx) => {
            const maxValue = Math.max(...(kpis[0].trend || []));
            const height = (value / maxValue) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative group">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all hover:from-blue-600 hover:to-purple-600 cursor-pointer"
                    style={{ height: `${height * 2.5}px` }}
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ${(value / 1000).toFixed(1)}K
                  </div>
                </div>
                <span className="text-xs text-gray-500">
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
            <div key={category.id} className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl bg-${category.color}-500`}
                     style={{
                       backgroundColor: category.color === 'green' ? '#10b981' :
                                      category.color === 'blue' ? '#3b82f6' :
                                      category.color === 'purple' ? '#a855f7' :
                                      category.color === 'orange' ? '#f97316' : '#6b7280'
                     }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold ${
                  isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                }`}>
                  {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(avgChange).toFixed(1)}%
                </div>
              </div>
              
              <h3 className="font-bold text-gray-900 mb-1">{category.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{category.count} metrics tracked</p>
              
              <div className="space-y-2">
                {categoryKPIs.slice(0, 3).map((kpi) => (
                  <div key={kpi.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 truncate">{kpi.name}</span>
                    <span className="font-semibold text-gray-900">{kpi.value}</span>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-1">
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add KPI Modal */}
      {showAddKPI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Add New KPI</h2>
              <button
                onClick={() => setShowAddKPI(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">KPI Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Monthly Recurring Revenue"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select category...</option>
                    <option value="financial">Financial</option>
                    <option value="sales">Sales</option>
                    <option value="marketing">Marketing</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Value</label>
                  <input
                    type="text"
                    placeholder="e.g., 45000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Target Value</label>
                  <input
                    type="text"
                    placeholder="e.g., 50000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="USD">USD ($)</option>
                    <option value="%">Percentage (%)</option>
                    <option value="number">Number</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Measurement Frequency</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    placeholder="Describe what this KPI measures..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAddKPI(false)}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all">
                  Add KPI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
