"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
import { ModuleGuideBanner } from '@/components/tours/ModuleGuideBanner';

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
  custom?: boolean;
}

interface TeamMemberOption {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
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
  const { data: session } = useSession();
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
  const [insightText, setInsightText] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingKPI, setDeletingKPI] = useState<KPI | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [activeMenuKPId, setActiveMenuKPId] = useState<string | null>(null);
  const [trendLabels, setTrendLabels] = useState<string[]>([]);
  const [activeTrendTab, setActiveTrendTab] = useState<'Revenue' | 'Sales' | 'Customers'>('Revenue');
  const [teamMembers, setTeamMembers] = useState<TeamMemberOption[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  // New KPI Form State
  const [newKpiName, setNewKpiName] = useState('');
  const [newKpiValue, setNewKpiValue] = useState('');
  const [newKpiTarget, setNewKpiTarget] = useState('');
  const [newKpiCategory, setNewKpiCategory] = useState('financial');
  const [newKpiOwner, setNewKpiOwner] = useState('');
  const [creatingKpi, setCreatingKpi] = useState(false);

  const fetchKPIs = useCallback(async () => {
    try {
      const res = await fetch('/api/kpis');
      if (res.ok) {
        const { kpis: rawKpis, trendLabels: labels }: { kpis: (Omit<KPI, 'icon'> & { iconName: string })[]; trendLabels: string[] } = await res.json();
        setKpis(rawKpis.map(k => ({
          ...k,
          icon: iconMap[k.iconName] || Activity,
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

  useEffect(() => {
    fetch('/api/presence')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.presence || []);
        if (Array.isArray(list) && list.length > 0) setTeamMembers(list);
      })
      .catch(() => setTeamMembers([]));
  }, []);

  useEffect(() => {
    if (!newKpiOwner && session?.user?.id) setNewKpiOwner(session.user.id);
  }, [newKpiOwner, session?.user?.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setActiveMenuKPId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const metricCategories: MetricCategory[] = [
    { id: 'all', name: 'All Metrics', icon: Grid, color: 'indigo', count: kpis.length },
    { id: 'financial', name: 'Financial', icon: DollarSign, color: 'emerald', count: kpis.filter(k => k.category === 'financial').length },
    { id: 'sales', name: 'Sales', icon: ShoppingCart, color: 'blue', count: kpis.filter(k => k.category === 'sales').length, dest: '/dashboard/crm' },
    { id: 'marketing', name: 'Marketing', icon: Target, color: 'purple', count: kpis.filter(k => k.category === 'marketing').length, dest: '/dashboard/campaigns' },
    { id: 'customer', name: 'Customer', icon: Users, color: 'orange', count: kpis.filter(k => k.category === 'customer').length, dest: '/dashboard/helpdesk' },
  ];

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const openEditModal = (kpi: KPI) => { setEditingKPI({ ...kpi }); setShowEditModal(true); setActiveMenuKPId(null); };
  const openAnalysisModal = (kpi: KPI) => {
    setAnalysisKPI(kpi);
    setInsightText(null);
    setInsightError(null);
    setShowAnalysisModal(true);
    setActiveMenuKPId(null);
    fetchInsight(kpi);
  };
  const openDeleteModal = (kpi: KPI) => { setDeletingKPI(kpi); setShowDeleteModal(true); setActiveMenuKPId(null); };

  const fetchInsight = async (kpi: KPI) => {
    setInsightLoading(true);
    setInsightError(null);
    try {
      const res = await fetch('/api/kpis/insight', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: kpi.name, value: kpi.value, target: kpi.target, progress: kpi.progress, category: kpi.category }),
      });
      if (res.ok) {
        const data = await res.json();
        setInsightText(data.insight);
      } else {
        const err = await res.json().catch(() => null);
        setInsightError(err?.error || 'Failed to generate insight. Please try again.');
      }
    } catch {
      setInsightError('Failed to generate insight. Please try again.');
    } finally {
      setInsightLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingKPI) return;
    setDeletingBusy(true);
    try {
      const res = await fetch(`/api/kpis/${deletingKPI.id}`, { method: 'DELETE' });
      if (res.ok) {
        setKpis(kpis.filter(k => k.id !== deletingKPI.id));
        showNotification(`"${deletingKPI.name}" removed from target metrics`, 'success');
        setShowDeleteModal(false);
        setDeletingKPI(null);
      } else {
        showNotification('Failed to delete KPI target', 'info');
      }
    } catch {
      showNotification('Failed to delete KPI target', 'info');
    } finally {
      setDeletingBusy(false);
    }
  };

  const saveKPIEdit = async () => {
    if (!editingKPI) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/kpis/${editingKPI.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingKPI.name, value: String(editingKPI.value), target: editingKPI.target ? String(editingKPI.target) : undefined,
          category: editingKPI.category, ownerId: editingKPI.ownerId,
        }),
      });
      if (res.ok) {
        const updated: Omit<KPI, 'icon'> & { iconName: string } = await res.json();
        setKpis(kpis.map(k => k.id === updated.id ? { ...updated, icon: iconMap[updated.iconName] || Activity } : k));
        setShowEditModal(false);
        setEditingKPI(null);
        showNotification(`"${updated.name}" target updated`, 'success');
      } else {
        showNotification('Failed to update KPI target', 'info');
      }
    } catch {
      showNotification('Failed to update KPI target', 'info');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCreateKPI = async () => {
    if (!newKpiName.trim()) return;
    setCreatingKpi(true);
    try {
      const res = await fetch('/api/kpis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKpiName.trim(), value: newKpiValue.trim(), target: newKpiTarget.trim(),
          category: newKpiCategory, ownerId: newKpiOwner || undefined,
        }),
      });
      if (res.ok) {
        const created: Omit<KPI, 'icon'> & { iconName: string } = await res.json();
        setKpis([{ ...created, icon: iconMap[created.iconName] || Activity }, ...kpis]);
        setShowAddKPI(false);
        setNewKpiName(''); setNewKpiValue(''); setNewKpiTarget('');
        showNotification(`KPI "${created.name}" created`, 'success');
      } else {
        showNotification('Failed to create KPI target', 'info');
      }
    } catch {
      showNotification('Failed to create KPI target', 'info');
    } finally {
      setCreatingKpi(false);
    }
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
    if (progress === undefined) return { label: 'Active', dot: 'bg-slate-400', badgeCls: 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200' };
    if (progress >= 85) return { label: 'On Track', dot: 'bg-emerald-500', badgeCls: 'bg-emerald-50/80 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60' };
    if (progress >= 50) return { label: 'At Risk', dot: 'bg-amber-500', badgeCls: 'bg-amber-50/80 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60' };
    return { label: 'Behind Target', dot: 'bg-rose-500', badgeCls: 'bg-rose-50/80 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60' };
  };

  /* Render Mini SVG Sparkline with Area Fill */
  const renderSparkline = (data?: number[], strokeClass: string = 'stroke-orange-500', fillClass: string = 'fill-orange-500/10') => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const pts = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * 100;
      const y = 26 - ((val - min) / (max - min || 1)) * 20;
      return { x, y };
    });
    const pointsStr = pts.map(p => `${p.x},${p.y}`).join(' ');
    const areaStr = `0,28 ${pointsStr} 100,28`;

    return (
      <svg className="w-20 h-7 overflow-hidden shrink-0" viewBox="0 0 100 28" preserveAspectRatio="none">
        <polygon points={areaStr} className={fillClass} />
        <polyline fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pointsStr} className={strokeClass} />
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-50/70 via-white to-amber-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-850 border border-orange-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-orange-500 text-white rounded-2xl shrink-0 shadow-md">
              <BarChart3 className="w-7 h-7 stroke-[2]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  KPI &amp; Strategic Performance
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/80">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                  Okleevo Enterprise Engine
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl font-normal leading-relaxed">
                Real-time target variance tracking, velocity sparklines &amp; growth telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <ModuleGuideBanner
              moduleId="kpi-dashboard"
              moduleName="KPIs &amp; Performance"
              summary="Track target variances, revenue velocity sparklines, departmental goal scorecards, and strategic OKRs."
              tips={[
                "Set target thresholds and warning margins for active metrics",
                "Monitor variance trends across revenue, acquisition, and operational SLAs",
                "Export executive KPI performance reports to CSV"
              ]}
            />
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex-wrap relative z-10">
          <div className="flex items-center gap-2.5">
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer shadow-xs focus:border-orange-500 transition-all"
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
              className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
              title="Synchronize Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleExportCSV}
              className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
              title="Export Report CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowAddKPI(true)}
            className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-95 text-white font-bold text-xs rounded-2xl transition-all cursor-pointer shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Target KPI</span>
          </button>
        </div>
      </div>

      {/* ── Summary Velocity Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Velocity Score', value: `${calculateOverallPerformance()}%`, sub: 'Avg Target Achievement', icon: Gauge, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/60' },
          { label: 'Trending Up', value: kpis.filter(k => k.changeType === 'increase').length, sub: 'Metrics Accelerated', icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60' },
          { label: 'On Target Goals', value: kpis.filter(k => k.progress !== undefined && k.progress >= 85).length, sub: `of ${kpis.length} Targets`, icon: Target, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/60' },
          { label: 'Active Streams', value: kpis.length, sub: 'Live Telemetry', icon: Layers, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/60' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-orange-300 dark:hover:border-orange-900/50 transition-all flex items-center gap-4 min-w-0">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0 shadow-xs`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white leading-tight truncate">{stat.value}</p>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider truncate mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar: Category Filters & View Switcher ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Category Chips Bar — Auto-Wrapping & Scrollbar-Free */}
        <div className="flex flex-wrap items-center gap-2.5 min-w-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {metricCategories.map(cat => {
            const isActive = selectedCategory === cat.id;
            const Icon = cat.icon;

            return (
              <div
                key={cat.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedCategory(cat.id)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedCategory(cat.id); }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm shadow-orange-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-mono font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {cat.count}
                </span>
                {cat.dest && (
                  <button
                    onClick={e => { e.stopPropagation(); router.push(cat.dest!); }}
                    title={`Open ${cat.name} module`}
                    className={`p-0.5 rounded-md transition-colors ${isActive ? 'hover:bg-white/20 text-white/80' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400'}`}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* 4-Way View Switcher Dock */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl shrink-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              viewMode === 'grid' ? 'bg-white dark:bg-slate-950 text-orange-600 dark:text-orange-400 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Scorecard Grid View"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Scorecards</span>
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              viewMode === 'chart' ? 'bg-white dark:bg-slate-950 text-purple-600 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Comparative Analytics Chart"
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              viewMode === 'table' ? 'bg-white dark:bg-slate-950 text-emerald-600 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Structured Data Table"
          >
            <List className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
          <button
            onClick={() => setViewMode('goals')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              viewMode === 'goals' ? 'bg-white dark:bg-slate-950 text-amber-600 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Goal OKR Matrix"
          >
            <Target className="w-3.5 h-3.5" />
            <span>OKR Goals</span>
          </button>
        </div>

      </div>

      {/* ── Main View Workspace ── */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading Executive Telemetry...</p>
        </div>
      ) : filteredKPIs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-950/60 text-orange-500 rounded-2xl flex items-center justify-center mx-auto">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Target KPIs in Selected Category</h3>
          <button
            onClick={() => setShowAddKPI(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-xs rounded-2xl shadow-md"
          >
            + Create KPI Target
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* ── 1. Structured Data Table ── */
        <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-4">Metric Name</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Actual Value</th>
                <th className="px-5 py-4">Change</th>
                <th className="px-5 py-4">Target</th>
                <th className="px-5 py-4">Progress</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {filteredKPIs.map(kpi => {
                const st = getStatusBadge(kpi.progress);
                return (
                  <tr key={kpi.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 font-medium transition-colors">
                    <td className="px-5 py-4 font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <span>{kpi.name}</span>
                    </td>
                    <td className="px-5 py-4 uppercase text-[10px] font-mono font-extrabold text-slate-400">{kpi.category}</td>
                    <td className="px-5 py-4 font-extrabold font-mono text-slate-900 dark:text-white">{kpi.value}</td>
                    <td className="px-5 py-4">
                      {(!kpi.custom || kpi.change !== 0) ? (
                        <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold ${kpi.changeType === 'increase' ? 'text-emerald-600' : kpi.changeType === 'decrease' ? 'text-rose-600' : 'text-slate-400'}`}>
                          {kpi.changeType === 'increase' ? <TrendingUp className="w-3 h-3" /> : kpi.changeType === 'decrease' ? <TrendingDown className="w-3 h-3" /> : null}
                          {kpi.change > 0 ? '+' : ''}{kpi.change}%
                        </span>
                      ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-medium">{kpi.target || 'N/A'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, kpi.progress || 0)}%` }} />
                        </div>
                        <span className="text-[10px] font-mono font-extrabold text-slate-700 dark:text-slate-300">{kpi.progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${st.badgeCls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        <span>{st.label}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openAnalysisModal(kpi)} className="p-1.5 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-xl text-orange-500 transition-colors" title="Okleevo AI Intelligence">
                          <Sparkles className="w-4 h-4" />
                        </button>
                        {kpi.custom && (
                          <>
                            <button onClick={() => openEditModal(kpi)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500" title="Edit">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => openDeleteModal(kpi)} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-rose-500" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : viewMode === 'chart' ? (
        /* ── 2. Comparative Analytics View ── */
        <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Metric Comparative Analytics</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Velocity sparklines &amp; real-time performance telemetry across active KPIs</p>
            </div>
            <span className="text-xs font-extrabold text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-3 py-1 rounded-full border border-orange-200/60">
              Telemetry Synchronized
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredKPIs.map(kpi => (
              <div key={kpi.id} className="bg-slate-50/70 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-850 space-y-4 hover:border-orange-300 dark:hover:border-orange-900/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">{kpi.name}</span>
                  </div>
                  <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">{kpi.value}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 font-mono">7-Day Velocity:</span>
                  {renderSparkline(kpi.trend, 'stroke-orange-500', 'fill-orange-500/10')}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : viewMode === 'goals' ? (
        /* ── 3. Goal Progress OKR Matrix ── */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'On Track (85%+)', min: 85, max: 1000, dot: 'bg-emerald-500' },
            { label: 'At Risk (50-84%)', min: 50, max: 84.9, dot: 'bg-amber-500' },
            { label: 'Behind Target (<50%)', min: 0, max: 49.9, dot: 'bg-rose-500' },
          ].map((col) => {
            const columnKPIs = filteredKPIs.filter(k => (k.progress || 0) >= col.min && (k.progress || 0) <= col.max);

            return (
              <div key={col.label} className="bg-slate-50/70 dark:bg-slate-900/60 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">{col.label}</h4>
                  </div>
                  <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {columnKPIs.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {columnKPIs.length === 0 ? (
                    <div className="py-8 px-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 flex flex-col items-center justify-center gap-1.5">
                      <Target className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-medium text-slate-400">No metrics in this goal tier</p>
                    </div>
                  ) : (
                    columnKPIs.map(kpi => {
                      const Icon = kpi.icon || Activity;
                      return (
                        <div key={kpi.id} className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-850 shadow-2xs space-y-3 hover:border-orange-300 dark:hover:border-orange-900/60 transition-all">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-750 flex items-center justify-center shrink-0">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{kpi.name}</span>
                            </div>
                            <span className="text-xs font-extrabold font-mono text-orange-600 dark:text-orange-400 shrink-0">{kpi.progress}%</span>
                          </div>

                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, kpi.progress || 0)}%` }} />
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                            <span>Target: {kpi.target || 'N/A'}</span>
                            <span className="uppercase font-mono">{kpi.category}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── 4. Scorecard Grid View (Minimalist Masterpiece) ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredKPIs.map(kpi => {
            const Icon = kpi.icon || Activity;
            const st = getStatusBadge(kpi.progress);

            return (
              <div
                key={kpi.id}
                className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 rounded-3xl p-6 shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-5 group"
              >
                {/* Top Row: Micro Icon, Category & Status Dot */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-750 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">
                        {kpi.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                      {kpi.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${st.badgeCls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      <span>{st.label}</span>
                    </span>

                    <button
                      onClick={() => openAnalysisModal(kpi)}
                      className="p-1 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-lg text-slate-400 hover:text-orange-500 transition-colors cursor-pointer"
                      title="Okleevo AI Intelligence"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>

                    {kpi.custom && (
                      <div className="relative" ref={activeMenuKPId === kpi.id ? menuRef : undefined}>
                        <button
                          onClick={() => setActiveMenuKPId(activeMenuKPId === kpi.id ? null : kpi.id)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors cursor-pointer"
                          title="More Actions"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        {activeMenuKPId === kpi.id && (
                          <div className="absolute right-0 top-7 z-10 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden">
                            <button
                              onClick={() => openEditModal(kpi)}
                              className="w-full px-3 py-2 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => openDeleteModal(kpi)}
                              className="w-full px-3 py-2 flex items-center gap-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Middle Row: Large Value & Clean Trend Badge */}
                <div className="space-y-2 py-1">
                  <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight block">
                    {kpi.value}
                  </span>

                  {(!kpi.custom || kpi.change !== 0) && (
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold ${
                        kpi.changeType === 'increase'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : kpi.changeType === 'decrease'
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-400'
                      }`}>
                        {kpi.changeType === 'increase' ? <TrendingUp className="w-3.5 h-3.5" /> : kpi.changeType === 'decrease' ? <TrendingDown className="w-3.5 h-3.5" /> : null}
                        <span>{kpi.change > 0 ? '+' : ''}{kpi.change}% vs last month</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Row: Micro Target Progress Meter */}
                {kpi.target && (
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-850">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <span>Target: {kpi.target}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{kpi.progress}% achieved</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, kpi.progress || 0)}%` }} />
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
                  <label className={labelCls}>Owner</label>
                  <select
                    value={newKpiOwner}
                    onChange={e => setNewKpiOwner(e.target.value)}
                    className={`${inputCls} cursor-pointer`}
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map(m => (
                      <option key={m.userId} value={m.userId}>{m.firstName} {m.lastName} ({m.role})</option>
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
                disabled={!newKpiName.trim() || creatingKpi}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
              >
                {creatingKpi && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Create Target KPI</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit KPI Modal ── */}
      {showEditModal && editingKPI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => { setShowEditModal(false); setEditingKPI(null); }} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Target KPI</h3>
              <button onClick={() => { setShowEditModal(false); setEditingKPI(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>KPI Metric Name</label>
                <input
                  type="text"
                  value={editingKPI.name}
                  onChange={e => setEditingKPI({ ...editingKPI, name: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Actual Value</label>
                  <input
                    type="text"
                    value={String(editingKPI.value)}
                    onChange={e => setEditingKPI({ ...editingKPI, value: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Target Goal</label>
                  <input
                    type="text"
                    value={editingKPI.target !== undefined ? String(editingKPI.target) : ''}
                    onChange={e => setEditingKPI({ ...editingKPI, target: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Category</label>
                  <select
                    value={editingKPI.category}
                    onChange={e => setEditingKPI({ ...editingKPI, category: e.target.value })}
                    className={`${inputCls} cursor-pointer`}
                  >
                    <option value="financial">Financial</option>
                    <option value="sales">Sales</option>
                    <option value="marketing">Marketing</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Owner</label>
                  <select
                    value={editingKPI.ownerId || ''}
                    onChange={e => setEditingKPI({ ...editingKPI, ownerId: e.target.value })}
                    className={`${inputCls} cursor-pointer`}
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map(m => (
                      <option key={m.userId} value={m.userId}>{m.firstName} {m.lastName} ({m.role})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
              <button
                onClick={() => { setShowEditModal(false); setEditingKPI(null); }}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={saveKPIEdit}
                disabled={!editingKPI.name.trim() || savingEdit}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
              >
                {savingEdit && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete KPI Confirmation Modal ── */}
      {showDeleteModal && deletingKPI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => { setShowDeleteModal(false); setDeletingKPI(null); }} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Delete &ldquo;{deletingKPI.name}&rdquo;?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">This target metric will be permanently removed. This cannot be undone.</p>
            </div>
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletingKPI(null); }}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingBusy}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
              >
                {deletingBusy && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete</span>
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

              <div className="p-4 bg-purple-50 dark:bg-purple-950/60 rounded-xl border border-purple-100 dark:border-purple-900/40 space-y-2 min-h-[84px]">
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">AI Growth Synthesis</span>
                {insightLoading ? (
                  <div className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300 font-medium">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing metric...</span>
                  </div>
                ) : insightError ? (
                  <p className="text-xs text-rose-700 dark:text-rose-400 font-medium leading-relaxed">{insightError}</p>
                ) : (
                  <p className="text-xs text-purple-900 dark:text-purple-200 font-medium leading-relaxed">{insightText}</p>
                )}
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
