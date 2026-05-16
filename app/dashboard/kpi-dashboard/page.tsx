"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart,
  Target, Activity, BarChart3, LineChart, ArrowUpRight,
  ArrowDownRight, Calendar, Download, RefreshCw, Plus,
  Award, Percent, AlertCircle, Eye, Star, UserCheck,
  ShoppingBag, CreditCard, MousePointer,
  ChevronRight, Minus,
  Gauge, Layers, Grid, List, MoreVertical,
  X, Sparkles, Brain, CheckSquare, LucideIcon,
  Edit3, Trash2, ExternalLink
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
  icon?: LucideIcon;
  iconName?: string;
  color: string;
  gradient: string;
  unit?: string;
  description?: string;
  trend?: number[];
}

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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

  const getTrendData = useCallback(() => {
    const kpi = kpis.find(k => {
      if (activeTrendTab === 'Revenue') return k.id === 'rev-1';
      if (activeTrendTab === 'Sales') return k.id === 'sales-1';
      if (activeTrendTab === 'Customers') return k.id === 'cust-1';
      return false;
    });
    return kpi?.trend || [];
  }, [kpis, activeTrendTab]);

  const trendData = getTrendData();

  const fetchKPIs = useCallback(async () => {
    try {
      const res = await fetch('/api/kpis');
      if (res.ok) {
        const { kpis: rawKpis, trendLabels: labels }: { kpis: (Omit<KPI, 'icon'> & { iconName: string })[]; trendLabels: string[] } = await res.json();
        setKpis(rawKpis.map(k => ({ ...k, icon: iconMap[k.iconName] || Activity })));
        setTrendLabels(labels);
      }
    } catch (error) {
      console.error('Error fetching KPIs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchKPIs(); }, [fetchKPIs]);

  const metricCategories: MetricCategory[] = [
    { id: 'all', name: 'All', icon: Grid, color: 'gray', count: kpis.length },
    { id: 'financial', name: 'Financial', icon: DollarSign, color: 'green', count: kpis.filter(k => k.category === 'financial').length, dest: '/dashboard/accounting' },
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
    showNotification(`"${deletingKPI.name}" deleted`, 'success');
    setShowDeleteModal(false);
    setDeletingKPI(null);
  };

  const syncKPIData = (kpi: KPI) => { setActiveMenuKPId(null); showNotification(`Syncing ${kpi.name}…`, 'info'); fetchKPIs(); };

  const saveKPIEdit = () => {
    if (!editingKPI) return;
    setKpis(kpis.map(k => k.id === editingKPI.id ? editingKPI : k));
    setShowEditModal(false);
    setEditingKPI(null);
    showNotification(`"${editingKPI.name}" updated`, 'success');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setActiveMenuKPId(null);
    };
    if (activeMenuKPId) document.addEventListener('mousedown', handleClickOutside);
    else document.removeEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuKPId]);

  const filteredKPIs = selectedCategory === 'all' ? kpis : kpis.filter(kpi => kpi.category === selectedCategory);

  const getChangeIcon = (changeType: string) => {
    if (changeType === 'increase') return ArrowUpRight;
    if (changeType === 'decrease') return ArrowDownRight;
    return Minus;
  };

  const getChangeColor = (changeType: string) => {
    if (changeType === 'increase') return 'text-emerald-600 bg-emerald-50';
    if (changeType === 'decrease') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const calculateOverallPerformance = () => {
    const progressKPIs = kpis.filter(k => k.progress !== undefined);
    if (progressKPIs.length === 0) return '0.0';
    return (progressKPIs.reduce((acc, k) => acc + (k.progress || 0), 0) / progressKPIs.length).toFixed(1);
  };

  const KPIMenu = ({ kpi }: { kpi: KPI }) => (
    <div ref={menuRef} className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
      {[
        { label: 'Edit', icon: Edit3, color: 'blue', action: () => openEditModal(kpi) },
        { label: 'Sync Data', icon: RefreshCw, color: 'emerald', action: () => syncKPIData(kpi) },
        { label: 'Analysis', icon: ExternalLink, color: 'purple', action: () => openAnalysisModal(kpi) },
      ].map(item => (
        <button key={item.label} onClick={(e) => { e.stopPropagation(); item.action(); }}
          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left cursor-pointer">
          <div className={`p-1.5 bg-${item.color}-50 rounded-lg text-${item.color}-600`}><item.icon className="w-3.5 h-3.5" /></div>
          <span className="text-xs font-black text-gray-900 uppercase tracking-wider">{item.label}</span>
        </button>
      ))}
      <div className="my-1 border-t border-gray-100" />
      <button onClick={(e) => { e.stopPropagation(); openDeleteModal(kpi); }}
        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 transition-colors text-left cursor-pointer text-red-600">
        <div className="p-1.5 bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></div>
        <span className="text-xs font-black uppercase tracking-wider">Delete</span>
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-24 md:pb-10">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 via-indigo-700 to-purple-800 p-5 sm:p-7 text-white shadow-xl shadow-blue-200/40">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-36 h-36 bg-purple-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="p-1.5 bg-white/15 rounded-lg"><BarChart3 className="w-4 h-4 text-white" /></div>
              <span className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Business Intelligence</span>
              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-[9px] font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />Live
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-0.5">KPI Dashboard</h1>
            <p className="text-blue-300 text-xs font-medium">Strategic Performance Metrics</p>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex items-center gap-2">
              <div className="relative">
                <select value={timeRange} onChange={e => setTimeRange(e.target.value)}
                  className="pl-3 pr-8 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-xs font-black uppercase tracking-wide appearance-none cursor-pointer outline-none backdrop-blur-sm">
                  <option value="today" className="text-gray-900">Today</option>
                  <option value="week" className="text-gray-900">This Week</option>
                  <option value="month" className="text-gray-900">This Month</option>
                  <option value="quarter" className="text-gray-900">This Quarter</option>
                  <option value="year" className="text-gray-900">This Year</option>
                </select>
                <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/60 pointer-events-none" />
              </div>
              <button onClick={() => fetchKPIs()} className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all active:scale-95">
                <RefreshCw className="w-4 h-4 text-white" />
              </button>
              <button className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all active:scale-95">
                <Download className="w-4 h-4 text-white" />
              </button>
            </div>
            <button onClick={() => setShowAddKPI(true)}
              className="flex items-center justify-center gap-2 bg-white text-indigo-700 font-black text-xs rounded-xl px-5 py-2.5 shadow-lg hover:bg-indigo-50 active:scale-95 transition-all w-full sm:w-auto cursor-pointer">
              <Plus className="w-4 h-4" />
              Add KPI
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Overall Score', value: `${calculateOverallPerformance()}%`, sub: 'Avg target achievement', icon: Gauge, color: 'from-blue-500 to-indigo-600' },
          { label: 'Trending Up', value: kpis.filter(k => k.changeType === 'increase').length, sub: 'Metrics growing', icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
          { label: 'On Target', value: kpis.filter(k => k.progress !== undefined && k.progress >= 90).length, sub: `of ${kpis.filter(k => k.target).length} goals`, icon: Target, color: 'from-purple-500 to-violet-600' },
          { label: 'Active KPIs', value: kpis.length, sub: 'Data streams', icon: Layers, color: 'from-amber-500 to-orange-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all">
            <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${stat.color} flex items-center justify-center mb-3 shadow-sm`}>
              <stat.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">{stat.value}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider leading-tight">{stat.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Category Filter + View Toggle ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar flex-1 pb-0.5">
          {metricCategories.map(category => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <button key={category.id} onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider whitespace-nowrap transition-all border cursor-pointer shrink-0 ${
                  isSelected ? 'bg-gray-900 border-gray-900 text-white shadow-md' : 'bg-white border-gray-100 text-gray-500 hover:border-blue-300 hover:text-blue-600'
                }`}>
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-400' : ''}`} />
                {category.name}
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {category.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 p-1 bg-white border border-gray-100 rounded-xl shadow-sm shrink-0">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}>
            <Grid className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-56">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                <div className="w-14 h-6 bg-gray-100 rounded-lg" />
              </div>
              <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
              <div className="h-7 bg-gray-100 rounded w-1/2 mb-4" />
              <div className="h-2 bg-gray-100 rounded-full w-full" />
            </div>
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredKPIs.map((kpi, index) => {
            const Icon = kpi.icon || Activity;
            const ChangeIcon = getChangeIcon(kpi.changeType);
            return (
              <div key={kpi.id}
                className={`group relative bg-white rounded-2xl border hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-both overflow-hidden ${activeMenuKPId === kpi.id ? 'z-40 border-blue-200' : 'border-gray-100 z-10'}`}
                style={{ animationDelay: `${index * 40}ms` }}>

                <div className={`absolute top-0 right-0 w-24 h-24 bg-linear-to-br ${kpi.gradient} opacity-[0.04] rounded-bl-[3rem] pointer-events-none`} />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-xl bg-linear-to-br ${kpi.gradient} shadow-md`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="relative">
                      <button onClick={(e) => { e.stopPropagation(); setActiveMenuKPId(activeMenuKPId === kpi.id ? null : kpi.id); }}
                        className={`p-1.5 hover:bg-gray-100 rounded-lg transition-all cursor-pointer ${activeMenuKPId === kpi.id ? 'opacity-100 bg-gray-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                      {activeMenuKPId === kpi.id && <KPIMenu kpi={kpi} />}
                    </div>
                  </div>

                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">{kpi.category}</p>
                  <h4 className="text-sm font-black text-gray-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors">{kpi.name}</h4>

                  <div className="flex items-end justify-between mb-3">
                    <p className="text-2xl font-black text-gray-900 tracking-tight">
                      {kpi.value}
                      {kpi.unit && kpi.unit !== 'USD' && kpi.unit !== '%' && (
                        <span className="text-[10px] font-bold text-gray-400 ml-1 uppercase">{kpi.unit}</span>
                      )}
                    </p>
                    <div className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-black ${getChangeColor(kpi.changeType)}`}>
                      <ChangeIcon className="w-3.5 h-3.5" />
                      {Math.abs(kpi.change)}%
                    </div>
                  </div>

                  {kpi.target && kpi.progress !== undefined && (
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                        <span className="text-gray-400">Target <span className="text-gray-600">{kpi.target}</span></span>
                        <span className="text-blue-600">{kpi.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full bg-linear-to-r ${kpi.gradient} rounded-full transition-all duration-700`}
                          style={{ width: `${Math.min(kpi.progress, 100)}%` }} />
                      </div>
                    </div>
                  )}

                  {kpi.trend && (
                    <div className="pt-3 border-t border-gray-50">
                      <div className="flex items-end h-10 gap-0.5">
                        {kpi.trend.map((value, idx) => {
                          const maxValue = Math.max(...kpi.trend!);
                          return (
                            <div key={idx} className={`flex-1 bg-linear-to-t ${kpi.gradient} rounded-t-sm opacity-20 group-hover:opacity-50 transition-opacity`}
                              style={{ height: `${(value / maxValue) * 100}%` }} />
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
        <div className="space-y-2.5">
          {filteredKPIs.map((kpi, index) => {
            const Icon = kpi.icon || Activity;
            const ChangeIcon = getChangeIcon(kpi.changeType);
            return (
              <div key={kpi.id}
                className={`bg-white rounded-2xl border transition-all duration-200 group animate-in fade-in slide-in-from-left-4 fill-mode-both ${activeMenuKPId === kpi.id ? 'z-40 relative border-blue-200 shadow-lg' : 'border-gray-100 hover:shadow-md z-10'}`}
                style={{ animationDelay: `${index * 25}ms` }}>
                <div className="flex items-center gap-3 p-3.5">
                  <div className={`p-2.5 rounded-xl bg-linear-to-br ${kpi.gradient} shadow-md shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-black text-gray-900 text-sm truncate">{kpi.name}</h3>
                      <span className="hidden sm:block px-1.5 py-0.5 bg-gray-100 text-gray-400 text-[9px] font-black uppercase tracking-wider rounded-md shrink-0">{kpi.category}</span>
                    </div>
                    {kpi.description && <p className="text-[10px] text-gray-400 truncate">{kpi.description}</p>}
                  </div>

                  <div className="text-right shrink-0 px-3 sm:px-5 border-x border-gray-100">
                    <p className="text-lg font-black text-gray-900 tracking-tight leading-none">{kpi.value}</p>
                    <div className={`flex items-center justify-end gap-0.5 font-black text-[10px] mt-0.5 ${getChangeColor(kpi.changeType)}`}>
                      <ChangeIcon className="w-3 h-3" />
                      {Math.abs(kpi.change)}%
                    </div>
                  </div>

                  {kpi.target && kpi.progress !== undefined && (
                    <div className="hidden sm:block w-36 shrink-0">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-wider mb-1">
                        <span className="text-gray-400">{kpi.target}</span>
                        <span className="text-blue-600">{kpi.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className={`h-full bg-linear-to-r ${kpi.gradient} rounded-full`}
                          style={{ width: `${Math.min(kpi.progress, 100)}%` }} />
                      </div>
                    </div>
                  )}

                  {kpi.trend && (
                    <div className="hidden md:flex w-20 shrink-0 items-end h-8 gap-px">
                      {kpi.trend.slice(-10).map((value, idx) => {
                        const maxValue = Math.max(...kpi.trend!);
                        return (
                          <div key={idx} className={`flex-1 bg-linear-to-t ${kpi.gradient} rounded-t-sm opacity-30 group-hover:opacity-60 transition-opacity`}
                            style={{ height: `${(value / maxValue) * 100}%` }} />
                        );
                      })}
                    </div>
                  )}

                  <div className="relative shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); setActiveMenuKPId(activeMenuKPId === kpi.id ? null : kpi.id); }}
                      className={`p-2 hover:bg-gray-100 rounded-lg transition-all cursor-pointer ${activeMenuKPId === kpi.id ? 'bg-gray-100' : ''}`}>
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                    {activeMenuKPId === kpi.id && <KPIMenu kpi={kpi} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Insights Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Performers */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 rounded-xl"><Award className="w-4 h-4 text-emerald-600" /></div>
              <div>
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Top Performers</h3>
                <p className="text-[10px] text-gray-400">Highest growth this period</p>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="space-y-2">
            {kpis.filter(k => k.changeType === 'increase').sort((a, b) => b.change - a.change).slice(0, 5).map((kpi, idx) => {
              const Icon = kpi.icon || Activity;
              return (
                <div key={kpi.id} onClick={() => showNotification(`Analysis: ${kpi.name}`, 'info')}
                  className="flex items-center gap-3 p-3 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl border border-emerald-100/50 transition-all cursor-pointer group/item">
                  <span className="w-5 h-5 flex items-center justify-center bg-white border border-emerald-100 rounded-lg text-[10px] font-black text-emerald-600 shrink-0">{idx + 1}</span>
                  <div className={`p-2 rounded-lg bg-linear-to-br ${kpi.gradient} shrink-0`}><Icon className="w-3.5 h-3.5 text-white" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 text-xs truncate">{kpi.name}</p>
                    <p className="text-[10px] text-gray-400">{kpi.value}</p>
                  </div>
                  <div className="flex items-center gap-0.5 text-emerald-600 font-black text-xs shrink-0">
                    <ArrowUpRight className="w-3.5 h-3.5" />{kpi.change}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Needs Attention */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-50 rounded-xl"><AlertCircle className="w-4 h-4 text-rose-600" /></div>
              <div>
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Needs Attention</h3>
                <p className="text-[10px] text-gray-400">Below 90% of target</p>
              </div>
            </div>
            <TrendingDown className="w-5 h-5 text-rose-300" />
          </div>
          <div className="space-y-2">
            {kpis.filter(k => k.progress && k.progress < 90).sort((a, b) => (a.progress || 0) - (b.progress || 0)).slice(0, 5).map(kpi => {
              const Icon = kpi.icon || Activity;
              return (
                <div key={kpi.id} onClick={() => showNotification(`Alert: ${kpi.name} needs attention`, 'info')}
                  className="flex items-center gap-3 p-3 bg-rose-50/50 hover:bg-rose-50 rounded-xl border border-rose-100/50 transition-all cursor-pointer">
                  <div className={`p-2 rounded-lg bg-linear-to-br ${kpi.gradient} shrink-0`}><Icon className="w-3.5 h-3.5 text-white" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 text-xs truncate">{kpi.name}</p>
                    <p className="text-[10px] text-gray-400">{kpi.value} / {kpi.target}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-rose-600 font-black text-sm">{kpi.progress}%</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider">progress</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Trend Chart ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-xl"><LineChart className="w-4 h-4 text-blue-600" /></div>
            <div>
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Performance Trends</h3>
              <p className="text-[10px] text-gray-400">12-month historical data</p>
            </div>
          </div>
          <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-xl border border-gray-100">
            {(['Revenue', 'Sales', 'Customers'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTrendTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTrendTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[360px]">
            <div className="flex items-end h-40 sm:h-56 gap-1.5 px-1 mb-2">
              {trendData.map((value, idx) => {
                const maxValue = Math.max(...(trendData.length ? trendData : [1]));
                const height = (value / (maxValue || 1)) * 100;
                const color = activeTrendTab === 'Revenue' ? 'from-blue-500 to-indigo-600' : activeTrendTab === 'Sales' ? 'from-emerald-500 to-teal-600' : 'from-orange-500 to-red-500';
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group/bar">
                    <div className="relative w-full">
                      <div className={`w-full bg-linear-to-t ${color} rounded-t-lg transition-all duration-500 hover:brightness-110 cursor-pointer relative group-hover/bar:-translate-y-0.5`}
                        style={{ height: `${height * (window?.innerWidth < 640 ? 1.4 : 2.2)}px` }}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-black px-2 py-1 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          {activeTrendTab === 'Revenue' ? `$${(value / 1000).toFixed(1)}K` : value.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-1.5 px-1">
              {trendLabels.map((label, idx) => (
                <span key={idx} className="flex-1 text-center text-[9px] font-black text-gray-400 uppercase tracking-wider">{label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metricCategories.filter(c => c.id !== 'all').map(category => {
          const Icon = category.icon;
          const categoryKPIs = kpis.filter(k => k.category === category.id);
          const avgChange = categoryKPIs.length > 0 ? categoryKPIs.reduce((acc, k) => acc + k.change, 0) / categoryKPIs.length : 0;
          const isPositive = avgChange > 0;
          const gradientMap: Record<string, string> = {
            green: 'from-emerald-500 to-teal-600',
            blue: 'from-blue-500 to-indigo-600',
            purple: 'from-purple-500 to-violet-600',
            orange: 'from-orange-500 to-red-500',
          };

          return (
            <div key={category.id} onClick={() => category.dest ? router.push(category.dest) : setSelectedCategory(category.id)}
              className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all cursor-pointer group/cat">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-linear-to-br ${gradientMap[category.color] || 'from-gray-400 to-gray-600'} shadow-md group-hover/cat:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-black ${isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                  {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(avgChange).toFixed(1)}%
                </div>
              </div>
              <h3 className="text-sm font-black text-gray-900 mb-0.5 group-hover/cat:text-blue-600 transition-colors">{category.name}</h3>
              <p className="text-[10px] text-gray-400 mb-3">{category.count} metrics</p>
              <div className="space-y-1.5 mb-3">
                {categoryKPIs.slice(0, 3).map(kpi => (
                  <div key={kpi.id} className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 truncate max-w-20">{kpi.name}</span>
                    <span className="text-[10px] font-black text-gray-900">{kpi.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={e => { e.stopPropagation(); if (category.dest) router.push(category.dest); }}
                className="w-full py-2 text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-50 hover:bg-gray-900 hover:text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Add KPI Modal ── */}
      {showAddKPI && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 sm:pl-0 md:pl-64">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowAddKPI(false)} />
          <div className="relative w-full sm:max-w-4xl bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92dvh] sm:max-h-[90vh]">
            {/* Sidebar — hidden on mobile */}
            <div className="hidden md:flex w-72 bg-gray-950 p-8 text-white flex-col justify-between shrink-0">
              <div>
                <h2 className="text-3xl font-black tracking-tight mb-4 leading-tight">Add Strategic KPI</h2>
                <p className="text-xs text-gray-400 leading-relaxed mb-8">Define parameters for real-time performance tracking.</p>
                <div className="space-y-3">
                  {[{ icon: Brain, label: 'AI Synthesis', sub: 'Predictive Modeling', color: 'blue' }, { icon: CheckSquare, label: 'Validation', sub: 'Automated Audit', color: 'purple' }].map(item => (
                    <div key={item.label} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className={`w-10 h-10 rounded-xl bg-${item.color}-500/20 flex items-center justify-center`}>
                        <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                      </div>
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-wider text-${item.color}-400`}>{item.label}</p>
                        <p className="text-sm font-bold text-white">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[9px] text-gray-600 uppercase tracking-widest">KPI Node v2.4</p>
            </div>

            {/* Form */}
            <div className="flex-1 p-5 sm:p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">New KPI</p>
                  <h3 className="text-xl font-black text-gray-900">Configuration</h3>
                </div>
                <button onClick={() => setShowAddKPI(false)} className="p-2.5 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  { label: 'KPI Name', placeholder: 'e.g. Monthly Revenue', icon: Layers, type: 'text' },
                  { label: 'Target Value', placeholder: 'e.g. 500,000', icon: Target, type: 'text' },
                ].map(field => (
                  <div key={field.label} className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{field.label}</label>
                    <div className="relative">
                      <input type={field.type} placeholder={field.placeholder}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl transition-all font-bold text-gray-900 outline-none text-sm" />
                      <field.icon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                ))}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Category</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl transition-all font-bold text-gray-900 outline-none cursor-pointer text-sm appearance-none">
                    {metricCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Unit</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl transition-all font-bold text-gray-900 outline-none cursor-pointer text-sm appearance-none">
                    <option value="USD">USD ($)</option>
                    <option value="%">Percentage (%)</option>
                    <option value="number">Integer</option>
                  </select>
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Description</label>
                  <textarea placeholder="Provide context for this KPI…" rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl transition-all font-bold text-gray-900 outline-none resize-none text-sm" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-6 pb-2">
                <button onClick={() => setShowAddKPI(false)}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-600 font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-gray-200 transition-all cursor-pointer">
                  Cancel
                </button>
                <button onClick={() => { showNotification('KPI added successfully', 'success'); setShowAddKPI(false); }}
                  className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-blue-600 transition-all duration-300 cursor-pointer active:scale-95">
                  Add KPI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit KPI Modal ── */}
      {showEditModal && editingKPI && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 sm:pl-0 md:pl-64">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => { setShowEditModal(false); setEditingKPI(null); }} />
          <div className="relative w-full sm:max-w-2xl bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[92dvh] overflow-y-auto">
            <div className="p-5 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {(() => { const Icon = editingKPI.icon || Activity; return (
                    <div className={`p-2.5 rounded-xl bg-linear-to-br ${editingKPI.gradient} shadow-md`}><Icon className="w-5 h-5 text-white" /></div>
                  ); })()}
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Edit KPI</p>
                    <h3 className="text-lg font-black text-gray-900">{editingKPI.name}</h3>
                  </div>
                </div>
                <button onClick={() => { setShowEditModal(false); setEditingKPI(null); }} className="p-2.5 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Current Value', value: String(editingKPI.value), onChange: (v: string) => setEditingKPI({ ...editingKPI, value: v }), type: 'text' },
                  { label: 'Target', value: String(editingKPI.target || ''), onChange: (v: string) => setEditingKPI({ ...editingKPI, target: v }), type: 'text' },
                  { label: 'Progress %', value: String(editingKPI.progress || 0), onChange: (v: string) => setEditingKPI({ ...editingKPI, progress: Number(v) }), type: 'number' },
                  { label: 'Change %', value: String(editingKPI.change), onChange: (v: string) => setEditingKPI({ ...editingKPI, change: Number(v) }), type: 'number' },
                ].map(field => (
                  <div key={field.label} className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{field.label}</label>
                    <input type={field.type} value={field.value} onChange={e => field.onChange(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl transition-all font-bold text-gray-900 outline-none text-sm" />
                  </div>
                ))}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Description</label>
                  <textarea value={editingKPI.description || ''} onChange={e => setEditingKPI({ ...editingKPI, description: e.target.value })} rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl transition-all font-bold text-gray-900 outline-none resize-none text-sm" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-6">
                <button onClick={() => { setShowEditModal(false); setEditingKPI(null); }}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-600 font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-gray-200 transition-all cursor-pointer">
                  Cancel
                </button>
                <button onClick={saveKPIEdit}
                  className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-blue-600 transition-all duration-300 cursor-pointer active:scale-95">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Analysis Modal ── */}
      {showAnalysisModal && analysisKPI && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 sm:pl-0 md:pl-64">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => { setShowAnalysisModal(false); setAnalysisKPI(null); }} />
          <div className="relative w-full sm:max-w-2xl bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[92dvh] overflow-y-auto">
            <div className="p-5 sm:p-7">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  {(() => { const Icon = analysisKPI.icon || Activity; return (
                    <div className={`p-2.5 rounded-xl bg-linear-to-br ${analysisKPI.gradient} shadow-md`}><Icon className="w-4 h-4 text-white" /></div>
                  ); })()}
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Analysis</p>
                    <h3 className="text-lg font-black text-gray-900">{analysisKPI.name}</h3>
                  </div>
                </div>
                <button onClick={() => { setShowAnalysisModal(false); setAnalysisKPI(null); }} className="p-2.5 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-5">
                {[
                  { label: 'Value', value: analysisKPI.value, color: 'text-gray-900' },
                  { label: 'Target', value: analysisKPI.target || 'N/A', color: 'text-gray-900' },
                  { label: 'Progress', value: `${analysisKPI.progress || 0}%`, color: 'text-blue-600' },
                  { label: 'Change', value: `${analysisKPI.changeType === 'increase' ? '+' : ''}${analysisKPI.change}%`, color: analysisKPI.changeType === 'increase' ? 'text-emerald-600' : 'text-red-600' },
                ].map(stat => (
                  <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className={`text-base font-black ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {analysisKPI.trend && (
                <div className="mb-5">
                  <p className="text-[10px] font-black text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <LineChart className="w-3.5 h-3.5 text-blue-600" /> 12-Month Trend
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-end h-20 gap-1">
                      {analysisKPI.trend.map((value, idx) => {
                        const maxValue = Math.max(...analysisKPI.trend!);
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-0.5">
                            <div className={`w-full bg-linear-to-t ${analysisKPI.gradient} rounded-t opacity-60 hover:opacity-100 transition-opacity`}
                              style={{ height: `${(value / (maxValue || 1)) * 80}%` }} />
                            <span className="text-[7px] font-black text-gray-400">{trendLabels[idx]?.charAt(0)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5"><TrendingUp className="w-3 h-3" /> Strengths</h4>
                  <ul className="space-y-1 text-xs font-bold text-emerald-700">
                    <li>• {analysisKPI.progress || 0}% progress toward target</li>
                    <li>• {analysisKPI.change}% change this period</li>
                  </ul>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Target className="w-3 h-3" /> Recommendations</h4>
                  <ul className="space-y-1 text-xs font-bold text-amber-700">
                    <li>• Target remaining {100 - (analysisKPI.progress || 0)}% gap</li>
                    <li>• Review strategy if growth slows</li>
                  </ul>
                </div>
              </div>

              {analysisKPI.description && (
                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                  <p className="text-xs font-bold text-gray-600"><span className="font-black text-gray-900">Description:</span> {analysisKPI.description}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button onClick={() => { setShowAnalysisModal(false); setAnalysisKPI(null); }}
                  className="px-6 py-2.5 bg-gray-900 text-white font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-blue-600 transition-all cursor-pointer">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {showDeleteModal && deletingKPI && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => { setShowDeleteModal(false); setDeletingKPI(null); }} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden p-6">
            <div className="text-center">
              <div className="mx-auto w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-1.5">Delete KPI?</h3>
              <p className="text-sm text-gray-500 mb-5">
                Remove <span className="font-black text-gray-900">&quot;{deletingKPI.name}&quot;</span>? This cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button onClick={() => { setShowDeleteModal(false); setDeletingKPI(null); }}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-gray-200 transition-all cursor-pointer">
                  Cancel
                </button>
                <button onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-600 text-white font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-red-700 transition-all cursor-pointer">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Notification Toast ── */}
      {notification && (
        <div className="fixed bottom-24 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-80 z-200 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-xl border ${
            notification.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-gray-900 border-gray-700 text-white'
          }`}>
            <div className="p-1.5 rounded-lg bg-white/20 shrink-0">
              {notification.type === 'success' ? <CheckSquare className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <p className="text-sm font-bold flex-1">{notification.message}</p>
            <button onClick={() => setNotification(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
