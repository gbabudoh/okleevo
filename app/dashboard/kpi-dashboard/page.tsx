"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart,
  Target, Activity, BarChart3, LineChart, ArrowUpRight,
  ArrowDownRight, Calendar, Download, RefreshCw, Plus,
  Award, Percent, AlertCircle, Eye, Star, UserCheck,
  ShoppingBag, CreditCard, MousePointer,
  ChevronRight, Minus, Gauge, Layers, Grid, List,
  MoreVertical, X, Sparkles, CheckSquare, LucideIcon,
  Edit3, Trash2, ExternalLink, ShieldCheck, Sliders,
  CheckCircle2, AlertTriangle, ArrowRight, PieChart
} from 'lucide-react';

const inputCls = 'w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400';
const labelCls = 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1';

interface KPI {
  id: string;
  name: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  target?: string | number;
  progress?: number;
  category: string;
  icon?: LucideIcon;
  iconName?: string;
  color: string;
  gradient: string;
  unit?: string;
  description?: string;
  trend?: number[];
  ownerId?: string;
}

const EGOBAS_ROSTER = [
  { id: 'EB', name: 'Ebi B', role: 'Executive Lead' },
  { id: 'GB', name: 'Godwin B', role: 'Product Lead' },
  { id: 'AB', name: 'Amaebi B', role: 'Engineering Lead' },
];

const iconMap: Record<string, LucideIcon> = {
  DollarSign, Percent, CreditCard, Activity,
  ShoppingCart, ShoppingBag, MousePointer, TrendingUp,
  Target, Eye, Users, UserCheck, Star, AlertCircle
};

interface MetricCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  count: number;
  dest?: string;
}

export default function KPIDashboardPage() {
  const router = useRouter();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'chart' | 'table' | 'goals'>('grid');
  const [timeRange, setTimeRange] = useState('month');
  const [showAddKPI, setShowAddKPI] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingKPI, setEditingKPI] = useState<KPI | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisKPI, setAnalysisKPI] = useState<KPI | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingKPI, setDeletingKPI] = useState<KPI | null>(null);
  const [activeMenuKPId, setActiveMenuKPId] = useState<string | null>(null);
  const [trendLabels, setTrendLabels] = useState<string[]>([]);
  const [activeTrendTab, setActiveTrendTab] = useState<'Revenue' | 'Sales' | 'Customers'>('Revenue');
  const menuRef = useRef<HTMLDivElement>(null);

  // New KPI Form State
  const [newKpiName, setNewKpiName] = useState('');
  const [newKpiValue, setNewKpiValue] = useState('');
  const [newKpiTarget, setNewKpiTarget] = useState('');
  const [newKpiCategory, setNewKpiCategory] = useState('financial');
  const [newKpiOwner, setNewKpiOwner] = useState('EB');

  const fetchKPIs = useCallback(async () => {
    try {
      const res = await fetch('/api/kpis');
      if (res.ok) {
        const { kpis: rawKpis, trendLabels: labels }: { kpis: (Omit<KPI, 'icon'> & { iconName: string })[]; trendLabels: string[] } = await res.json();
        setKpis(rawKpis.map(k => ({
          ...k,
          icon: iconMap[k.iconName] || Activity,
          ownerId: k.ownerId || 'EB'
        })));
        setTrendLabels(labels);
      }
    } catch (error) {
      console.error('Error fetching KPIs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchKPIs();
    setRefreshing(false);
    showNotification('KPI data synchronized with Okleevo Engine', 'success');
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Category', 'Value', 'Target', 'Change %', 'Progress %'];
    const rows = filteredKPIs.map(kpi => [
      kpi.name, kpi.category, String(kpi.value), String(kpi.target ?? 'N/A'),
      `${kpi.changeType === 'increase' ? '+' : kpi.changeType === 'decrease' ? '-' : ''}${Math.abs(kpi.change)}`,
      String(kpi.progress ?? 'N/A'),
    ]);
    let csv = 'Okleevo Enterprise KPI Report\n';
    csv += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    csv += headers.join(',') + '\n';
    csv += rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `okleevo-kpis-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('KPI report exported successfully', 'success');
  };

  useEffect(() => { fetchKPIs(); }, [fetchKPIs]);

  const metricCategories: MetricCategory[] = [
    { id: 'all', name: 'All Metrics', icon: Grid, color: 'indigo', count: kpis.length },
    { id: 'financial', name: 'Financial', icon: DollarSign, color: 'emerald', count: kpis.filter(k => k.category === 'financial').length, dest: '/dashboard/accounting' },
    { id: 'sales', name: 'Sales', icon: ShoppingCart, color: 'blue', count: kpis.filter(k => k.category === 'sales').length, dest: '/dashboard/crm' },
    { id: 'marketing', name: 'Marketing', icon: Target, color: 'purple', count: kpis.filter(k => k.category === 'marketing').length, dest: '/dashboard/campaigns' },
    { id: 'customer', name: 'Customer', icon: Users, color: 'orange', count: kpis.filter(k => k.category === 'customer').length, dest: '/dashboard/helpdesk' },
  ];

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const openEditModal = (kpi: KPI) => { setEditingKPI({ ...kpi }); setShowEditModal(true); setActiveMenuKPId(null); };
  const openAnalysisModal = (kpi: KPI) => { setAnalysisKPI(kpi); setShowAnalysisModal(true); setActiveMenuKPId(null); };
  const openDeleteModal = (kpi: KPI) => { setDeletingKPI(kpi); setShowDeleteModal(true); setActiveMenuKPId(null); };

  const confirmDelete = () => {
    if (!deletingKPI) return;
    setKpis(kpis.filter(k => k.id !== deletingKPI.id));
    showNotification(`"${deletingKPI.name}" removed from target metrics`, 'success');
    setShowDeleteModal(false);
    setDeletingKPI(null);
  };

  const saveKPIEdit = () => {
    if (!editingKPI) return;
    setKpis(kpis.map(k => k.id === editingKPI.id ? editingKPI : k));
    setShowEditModal(false);
    setEditingKPI(null);
    showNotification(`"${editingKPI.name}" target updated`, 'success');
  };

  const handleCreateKPI = () => {
    if (!newKpiName.trim()) return;
    const newKpi: KPI = {
      id: `custom-${Date.now()}`,
      name: newKpiName.trim(),
      value: newKpiValue.trim() || '0',
      change: 4.5,
      changeType: 'increase',
      target: newKpiTarget.trim() || '100',
      progress: 75,
      category: newKpiCategory,
      iconName: 'Activity',
      icon: Activity,
      color: 'blue',
      gradient: 'from-blue-600 to-indigo-600',
      trend: [20, 35, 50, 65, 75, 80, 90],
      ownerId: newKpiOwner,
    };
    setKpis([newKpi, ...kpis]);
    setShowAddKPI(false);
    setNewKpiName(''); setNewKpiValue(''); setNewKpiTarget('');
    showNotification(`KPI "${newKpi.name}" created`, 'success');
  };

  const filteredKPIs = useMemo(() => {
    return selectedCategory === 'all' ? kpis : kpis.filter(k => k.category === selectedCategory);
  }, [kpis, selectedCategory]);

  const calculateOverallPerformance = () => {
    const progressKPIs = kpis.filter(k => k.progress !== undefined);
    if (progressKPIs.length === 0) return '0.0';
    return (progressKPIs.reduce((acc, k) => acc + (k.progress || 0), 0) / progressKPIs.length).toFixed(1);
  };

  const getStatusBadge = (progress?: number) => {
    if (progress === undefined) return { label: 'Active', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
    if (progress >= 85) return { label: 'On Track', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200' };
    if (progress >= 50) return { label: 'At Risk', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200' };
    return { label: 'Behind Target', color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200' };
  };

  /* Render Mini SVG Sparkline */
  const renderSparkline = (data?: number[], colorClass: string = 'stroke-indigo-500') => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * 100;
      const y = 30 - ((val - min) / (max - min || 1)) * 26;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-24 h-8 overflow-visible" viewBox="0 0 100 30">
        <polyline fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points} className={colorClass} />
      </svg>
    );
  };

  return (
    <div className="min-h-screen space-y-6 pb-24 sm:pb-12 text-slate-900 dark:text-slate-100">

      {/* ── Notification Banner ── */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* ── Enterprise Header Shell ── */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shrink-0 text-white shadow-md">
              <BarChart3 className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  KPI & Strategic Performance Suite
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  Okleevo Enterprise Engine v2.0
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Real-time target variance tracking, velocity sparklines, and Okleevo AI growth insights.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="today">Timeframe: Today</option>
              <option value="week">Timeframe: This Week</option>
              <option value="month">Timeframe: This Month</option>
              <option value="quarter">Timeframe: This Quarter</option>
              <option value="year">Timeframe: YTD</option>
            </select>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Synchronize Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleExportCSV}
              className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Export Report CSV"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowAddKPI(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Target KPI</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary Velocity Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Velocity Score', value: `${calculateOverallPerformance()}%`, sub: 'Avg Target Achievement', icon: Gauge, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/60' },
          { label: 'Trending Up', value: kpis.filter(k => k.changeType === 'increase').length, sub: 'Metrics Accelerated', icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60' },
          { label: 'On Target Goals', value: kpis.filter(k => k.progress !== undefined && k.progress >= 85).length, sub: `of ${kpis.length} Targets`, icon: Target, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/60' },
          { label: 'Active Streams', value: kpis.length, sub: 'Live Telemetry', icon: Layers, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/60' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">{stat.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar: Category Filters & View Switcher ── */}
      <div className="space-y-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {metricCategories.map(cat => {
              const isActive = selectedCategory === cat.id;
              const Icon = cat.icon;

              return (
                <button
                  key={cat.id}
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
              );
            })}
          </div>

          {/* 4-Way View Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-500'
              }`}
              title="Scorecard Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Scorecards</span>
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'chart' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-xs' : 'text-slate-500'
              }`}
              title="Comparative Analytics Chart"
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs' : 'text-slate-500'
              }`}
              title="Structured Data Table"
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('goals')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'goals' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-xs' : 'text-slate-500'
              }`}
              title="Goal OKR Matrix"
            >
              <Target className="w-3.5 h-3.5" />
              <span>OKR Goals</span>
            </button>
          </div>

        </div>
      </div>

      {/* ── Main View Workspace ── */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading Executive Telemetry...</p>
        </div>
      ) : filteredKPIs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Target KPIs in Category</h3>
          <button
            onClick={() => setShowAddKPI(true)}
            className="px-4 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            + Create KPI Target
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* ── 1. Structured Data Table ── */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="px-5 py-3">Metric Name</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Actual Value</th>
                <th className="px-5 py-3">Target</th>
                <th className="px-5 py-3">Progress</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredKPIs.map(kpi => {
                const st = getStatusBadge(kpi.progress);
                return (
                  <tr key={kpi.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 font-medium">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-600" />
                      <span>{kpi.name}</span>
                    </td>
                    <td className="px-5 py-3.5 uppercase text-[10px] font-bold text-slate-400">{kpi.category}</td>
                    <td className="px-5 py-3.5 font-extrabold text-slate-900 dark:text-white">{kpi.value}</td>
                    <td className="px-5 py-3.5 text-slate-500">{kpi.target || 'N/A'}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${Math.min(100, kpi.progress || 0)}%` }} />
                        </div>
                        <span className="text-[10px] font-bold">{kpi.progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => openAnalysisModal(kpi)} className="p-1.5 hover:bg-slate-100 rounded-lg text-indigo-600">
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : viewMode === 'chart' ? (
        /* ── 2. Comparative Analytics View ── */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Metric Comparative Analytics</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">7-day performance velocity across tracked KPIs</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              Telemetry Synchronized
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredKPIs.slice(0, 4).map(kpi => (
              <div key={kpi.id} className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{kpi.name}</span>
                  <span className="text-xs font-extrabold text-indigo-600">{kpi.value}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-bold text-slate-400">Velocity Sparkline:</span>
                  {renderSparkline(kpi.trend, 'stroke-indigo-600')}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : viewMode === 'goals' ? (
        /* ── 3. Goal Progress OKR Matrix ── */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['On Track (85%+)', 'At Risk (50-84%)', 'Behind Target (<50%)'].map((columnLabel, idx) => {
            const minP = idx === 0 ? 85 : idx === 1 ? 50 : 0;
            const maxP = idx === 0 ? 1000 : idx === 1 ? 84.9 : 49.9;
            const columnKPIs = filteredKPIs.filter(k => (k.progress || 0) >= minP && (k.progress || 0) <= maxP);

            return (
              <div key={columnLabel} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{columnLabel}</h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {columnKPIs.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {columnKPIs.map(kpi => (
                    <div key={kpi.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{kpi.name}</span>
                        <span className="text-xs font-extrabold text-indigo-600">{kpi.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${Math.min(100, kpi.progress || 0)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── 4. Scorecard Grid View ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredKPIs.map(kpi => {
            const Icon = kpi.icon || Activity;
            const st = getStatusBadge(kpi.progress);

            return (
              <div
                key={kpi.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between space-y-4 relative group"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center text-white shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${st.color}`}>
                      {st.label}
                    </span>
                    <button
                      onClick={() => openAnalysisModal(kpi)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-indigo-600 transition-colors"
                      title="Okleevo AI Intelligence"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Values & Sparkline */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{kpi.category} &bull; {kpi.name}</p>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{kpi.value}</span>
                    {renderSparkline(kpi.trend, 'stroke-indigo-600')}
                  </div>
                </div>

                {/* Target Progress Bar */}
                {kpi.target && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-400">Target: {kpi.target}</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{kpi.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, kpi.progress || 0)}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add KPI Modal ── */}
      {showAddKPI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setShowAddKPI(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Target KPI Stream</h3>
              <button onClick={() => setShowAddKPI(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>KPI Metric Name</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly Recurring Revenue"
                  value={newKpiName}
                  onChange={e => setNewKpiName(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Actual Value</label>
                  <input
                    type="text"
                    placeholder="e.g. $45,000"
                    value={newKpiValue}
                    onChange={e => setNewKpiValue(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Target Goal</label>
                  <input
                    type="text"
                    placeholder="e.g. $60,000"
                    value={newKpiTarget}
                    onChange={e => setNewKpiTarget(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Category</label>
                  <select
                    value={newKpiCategory}
                    onChange={e => setNewKpiCategory(e.target.value)}
                    className={`${inputCls} cursor-pointer`}
                  >
                    <option value="financial">Financial</option>
                    <option value="sales">Sales</option>
                    <option value="marketing">Marketing</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Owner (Egobas Roster)</label>
                  <select
                    value={newKpiOwner}
                    onChange={e => setNewKpiOwner(e.target.value)}
                    className={`${inputCls} cursor-pointer`}
                  >
                    {EGOBAS_ROSTER.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddKPI(false)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateKPI}
                disabled={!newKpiName.trim()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Create Target KPI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Okleevo AI Performance Insights Drawer Modal ── */}
      {showAnalysisModal && analysisKPI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setShowAnalysisModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Okleevo AI Metric Intelligence</h3>
              </div>
              <button onClick={() => setShowAnalysisModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{analysisKPI.name}</h4>
                  <p className="text-xs text-slate-400 uppercase font-bold">{analysisKPI.category} Target</p>
                </div>
                <span className="text-lg font-extrabold text-indigo-600">{analysisKPI.value}</span>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950/60 rounded-xl border border-purple-100 dark:border-purple-900/40 space-y-2">
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">AI Growth Synthesis</span>
                <p className="text-xs text-purple-900 dark:text-purple-200 font-medium leading-relaxed">
                  Metric target velocity is tracking at <strong className="font-extrabold">{analysisKPI.progress || 75}%</strong>. Growth trajectory shows stable upward acceleration. Recommended focus: increase campaign conversion velocity.
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end">
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="px-5 py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Close Intelligence Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
