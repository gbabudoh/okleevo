"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderKanban, Plus, TrendingUp, TrendingDown,
  Clock3, Loader2, Pencil, Archive, ArchiveRestore, Trash2, Link2,
  ArrowUpRight, CalendarClock, Layers, AlertTriangle, Wallet,
  ShieldCheck, Search, Filter, Grid, List, BarChart3, Target,
  DollarSign, Sparkles, CheckCircle2, RefreshCw, Download, X,
  Building2, Users, FileText, CheckSquare, ArrowRight, PieChart,
  HelpCircle, BookOpen, Info, Lightbulb, Rocket
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import ProjectFormModal, { ProjectFormValues } from '@/components/projects/ProjectFormModal';

interface Project {
  id: string;
  name: string;
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
  budget?: number | null;
  dueDate?: string | null;
  ownerId?: string;
  contact?: { id: string; name: string; company?: string } | null;
  _count?: { tasks: number; invoices: number; expenses: number };
}

interface Profitability {
  revenue: number;
  expenses: number;
  laborCost: number;
  totalHours: number;
  netProfit: number;
  margin: number;
}

interface PortfolioSummary {
  totalProjects: number;
  activeCount: number;
  onHoldCount: number;
  overdueCount: number;
  atRiskCount: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

const EGOBAS_ROSTER = [
  { id: 'EB', name: 'Ebi B', role: 'Executive Lead' },
  { id: 'GB', name: 'Godwin B', role: 'Product Lead' },
  { id: 'AB', name: 'Amaebi B', role: 'Engineering Lead' },
];

const statusBadge = (s: Project['status']) => {
  switch (s) {
    case 'ACTIVE': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80';
    case 'ON_HOLD': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80';
    case 'COMPLETED': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/80';
    case 'ARCHIVED': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200/80';
  }
};

const currency = (n: number, symbol: string = '£') =>
  `${symbol}${n ? n.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}`;

const emptyForm: ProjectFormValues = { name: '', contactId: '', status: 'ACTIVE', budget: '', dueDate: '' };

/* ── Project Card Component ─────────────────────────────────────────── */
function ProjectCard({
  project, onEdit, onArchiveToggle, onDelete, onOpenAIAnalysis, currencySymbol
}: {
  project: Project;
  onEdit: (p: Project) => void;
  onArchiveToggle: (p: Project) => void;
  onDelete: (p: Project) => void;
  onOpenAIAnalysis: (p: Project) => void;
  currencySymbol: string;
}) {
  const router = useRouter();
  const [profitability, setProfitability] = useState<Profitability | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${project.id}/profitability`)
      .then(res => res.json())
      .then(data => setProfitability(data))
      .catch(() => setProfitability(null))
      .finally(() => setLoading(false));
  }, [project.id]);

  const linkedCount = (project._count?.tasks || 0) + (project._count?.invoices || 0) + (project._count?.expenses || 0);
  const spent = profitability ? profitability.expenses + profitability.laborCost : 0;
  const budgetPct = project.budget ? Math.min(100, Math.round((spent / project.budget) * 100)) : null;
  const isOverdue = project.dueDate && new Date(project.dueDate) < new Date() && project.status !== 'COMPLETED' && project.status !== 'ARCHIVED';
  const owner = EGOBAS_ROSTER.find(m => m.id === (project.ownerId || 'EB')) || EGOBAS_ROSTER[0];

  return (
    <div
      onClick={() => router.push(`/dashboard/projects/${project.id}`)}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-xs"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {project.name}
            </h3>
          </div>
          {project.contact && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              Client: {project.contact.company || project.contact.name}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${statusBadge(project.status)}`}>
            {project.status.replace('_', ' ')}
          </span>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onOpenAIAnalysis(project); }}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-purple-600 transition-colors"
            title="Okleevo AI Margin Intelligence"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Linked Telemetry Counts */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
        <span className="flex items-center gap-1 font-semibold text-[11px]">
          <Link2 className="w-3.5 h-3.5 text-indigo-500" />
          {linkedCount === 0
            ? '0 items linked'
            : `${project._count?.tasks || 0} tasks · ${project._count?.invoices || 0} inv · ${project._count?.expenses || 0} exp`}
        </span>

        {project.dueDate && (
          <span className={`flex items-center gap-1 text-[11px] font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-400'}`}>
            <CalendarClock className="w-3.5 h-3.5" />
            {isOverdue ? 'Overdue: ' : ''}{new Date(project.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>

      {/* Profitability Financial Numbers */}
      {loading ? (
        <div className="py-4 flex items-center justify-center gap-2 text-xs text-slate-400 font-bold">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Calculating Margin...</span>
        </div>
      ) : profitability ? (
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/70 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Gross Revenue</p>
            <p className="font-extrabold text-slate-900 dark:text-white mt-0.5">{currency(profitability.revenue, currencySymbol)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Direct Cost</p>
            <p className="font-extrabold text-slate-900 dark:text-white mt-0.5">{currency(profitability.expenses + profitability.laborCost, currencySymbol)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Logged Hours</p>
            <p className="font-extrabold text-slate-900 dark:text-white mt-0.5">{profitability.totalHours}h</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Net Margin</p>
            <p className={`font-extrabold flex items-center gap-1 mt-0.5 ${profitability.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
              {profitability.netProfit >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {currency(profitability.netProfit, currencySymbol)} ({profitability.margin.toFixed(0)}%)
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-400 font-medium">
          No financial telemetry linked yet.
        </div>
      )}

      {/* Budget Progress Bar */}
      {project.budget != null && budgetPct !== null && (
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-400">Budget Usage</span>
            <span className="text-slate-800 dark:text-slate-200">{currency(spent, currencySymbol)} / {currency(project.budget, currencySymbol)}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${budgetPct >= 100 ? 'bg-rose-500' : budgetPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer Action Bar */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center">
            {owner.id}
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{owner.name}</span>
        </div>

        <div className="flex items-center gap-1">
          <button type="button" title="Edit" onClick={() => onEdit(project)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button type="button" title={project.status === 'ARCHIVED' ? 'Unarchive' : 'Archive'} onClick={() => onArchiveToggle(project)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer">
            {project.status === 'ARCHIVED' ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
          </button>
          <button type="button" title="Delete" onClick={() => onDelete(project)}
            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Projects Page Component ─────────────────────────────────── */
export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'chart' | 'board'>('grid');
  const [currencySymbol, setCurrencySymbol] = useState('£');
  const [showAIAnalysisModal, setShowAIAnalysisModal] = useState(false);
  const [analysisProject, setAnalysisProject] = useState<Project | null>(null);
  const [showUserGuideModal, setShowUserGuideModal] = useState(false);
  const [guideHovered, setGuideHovered] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/projects/summary');
      if (res.ok) setSummary(await res.json());
    } catch {
      setSummary(null);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProjects(), fetchSummary()]);
    setRefreshing(false);
  };

  useEffect(() => { fetchProjects(); fetchSummary(); }, [fetchProjects, fetchSummary]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchSearch = p.name.toLowerCase().includes(q) || (p.contact?.name.toLowerCase().includes(q) || false);
      const matchStatus = selectedStatus === 'all' || p.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [projects, searchQuery, selectedStatus]);

  const handleCreate = async (values: ProjectFormValues) => {
    if (!values.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          contactId: values.contactId || null,
          budget: values.budget || null,
          dueDate: values.dueDate || null,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchProjects();
        fetchSummary();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (values: ProjectFormValues) => {
    if (!editingProject || !values.name.trim()) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/projects/${editingProject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          status: values.status,
          contactId: values.contactId || null,
          budget: values.budget || null,
          dueDate: values.dueDate || null,
        }),
      });
      if (res.ok) {
        setEditingProject(null);
        fetchProjects();
        fetchSummary();
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const handleArchiveToggle = async (p: Project) => {
    const nextStatus = p.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED';
    const res = await fetch(`/api/projects/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) { fetchProjects(); fetchSummary(); }
  };

  const handleDelete = async () => {
    if (!deletingProject) return;
    const res = await fetch(`/api/projects/${deletingProject.id}`, { method: 'DELETE' });
    if (res.ok) {
      setDeletingProject(null);
      fetchProjects();
      fetchSummary();
    }
  };

  return (
    <div className="min-h-screen space-y-6 pb-24 sm:pb-12 text-slate-900 dark:text-slate-100">

      {/* ── Enterprise Header Shell ── */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shrink-0 text-white shadow-md">
              <FolderKanban className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Portfolio & Project Financial Hub
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  Okleevo Enterprise Engine v2.0
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Real-time portfolio profitability, budget margin meters, and linked invoice/expense telemetry.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <select
              value={currencySymbol}
              onChange={e => setCurrencySymbol(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="£">Currency: £ GBP</option>
              <option value="$">Currency: $ USD</option>
              <option value="€">Currency: € EUR</option>
            </select>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* User Guide Button & Hover Tooltip */}
            <div className="relative">
              <button
                onClick={() => setShowUserGuideModal(true)}
                onMouseEnter={() => setGuideHovered(true)}
                onMouseLeave={() => setGuideHovered(false)}
                className="px-3.5 py-2.5 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>User Guide</span>
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              </button>

              {/* Non-obstructive Hover Tooltip Card */}
              {guideHovered && !showUserGuideModal && (
                <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-2xl z-50 pointer-events-none space-y-1 animate-in fade-in zoom-in-95 duration-150 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Quick Guide Preview</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                    Click to open full guide: Learn how to manage project budgets, calculate net profit margins, and use 4-way view controllers.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">{summary.activeCount}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Active Portfolio</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">{currency(summary.totalRevenue, currencySymbol)}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Gross Revenue</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">{currency(summary.netProfit, currencySymbol)}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Net Portfolio Profit</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">{summary.overdueCount}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Overdue Projects</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation Toolbar: Search, Status Filters, & View Switcher ── */}
      <div className="space-y-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects by title, client name, or linked assets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-semibold outline-none border border-slate-200/80 dark:border-slate-700/80 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-900 dark:text-white"
            />
          </div>

          {/* 4-Way View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Cards Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Executive Table</span>
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'chart' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Profitability Chart</span>
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'board' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Milestone Board</span>
            </button>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {['all', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'].map(statusKey => {
            const isActive = selectedStatus === statusKey;
            const count = statusKey === 'all' ? projects.length : projects.filter(p => p.status === statusKey).length;

            return (
              <button
                key={statusKey}
                onClick={() => setSelectedStatus(statusKey)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <span>{statusKey === 'all' ? 'All Projects' : statusKey.replace('_', ' ')}</span>
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main View Workspace ── */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading Portfolio Telemetry...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Projects Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Create your first enterprise project to link tasks, invoices, and expenses to track real-time net margins.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* ── 1. Executive Table View ── */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="px-5 py-3">Project Name</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Budget</th>
                <th className="px-5 py-3">Linked Assets</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProjects.map(p => (
                <tr
                  key={p.id}
                  onClick={() => router.push(`/dashboard/projects/${p.id}`)}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer font-medium text-slate-800 dark:text-slate-200"
                >
                  <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">{p.name}</td>
                  <td className="px-5 py-3.5 text-slate-500">{p.contact?.company || p.contact?.name || 'Direct Enterprise'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusBadge(p.status)}`}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-extrabold">{p.budget ? currency(p.budget, currencySymbol) : 'Unbounded'}</td>
                  <td className="px-5 py-3.5 text-slate-400">
                    {(p._count?.tasks || 0) + (p._count?.invoices || 0) + (p._count?.expenses || 0)} assets
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={e => { e.stopPropagation(); setAnalysisProject(p); setShowAIAnalysisModal(true); }}
                      className="p-1 hover:bg-slate-100 rounded-md text-indigo-600"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : viewMode === 'chart' ? (
        /* ── 2. Profitability Comparison Canvas ── */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Portfolio Financial Profitability Comparison</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Net profitability and margin health comparison</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Live Margin Telemetry
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.slice(0, 4).map(p => (
              <div key={p.id} className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</span>
                  <span className="text-xs font-extrabold text-indigo-600">Budget: {p.budget ? currency(p.budget, currencySymbol) : 'Flex'}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : viewMode === 'board' ? (
        /* ── 3. Milestone & Health Board ── */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'].map(statusKey => {
            const columnProjects = filteredProjects.filter(p => p.status === statusKey);

            return (
              <div key={statusKey} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{statusKey.replace('_', ' ')}</h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {columnProjects.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {columnProjects.map(p => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      onEdit={setEditingProject}
                      onArchiveToggle={handleArchiveToggle}
                      onDelete={setDeletingProject}
                      onOpenAIAnalysis={proj => { setAnalysisProject(proj); setShowAIAnalysisModal(true); }}
                      currencySymbol={currencySymbol}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── 4. Cards Grid View ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(p => (
            <ProjectCard
              key={p.id}
              project={p}
              onEdit={setEditingProject}
              onArchiveToggle={handleArchiveToggle}
              onDelete={setDeletingProject}
              onOpenAIAnalysis={proj => { setAnalysisProject(proj); setShowAIAnalysisModal(true); }}
              currencySymbol={currencySymbol}
            />
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      {showAddModal && (
        <ProjectFormModal
          mode="create"
          initialValues={emptyForm}
          saving={saving}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreate}
        />
      )}

      {editingProject && (
        <ProjectFormModal
          mode="edit"
          initialValues={{
            name: editingProject.name,
            contactId: editingProject.contact?.id || '',
            status: editingProject.status,
            budget: editingProject.budget != null ? String(editingProject.budget) : '',
            dueDate: editingProject.dueDate ? editingProject.dueDate.split('T')[0] : '',
          }}
          saving={savingEdit}
          onClose={() => setEditingProject(null)}
          onSubmit={handleSaveEdit}
        />
      )}

      {/* Okleevo AI Profitability Intelligence Drawer Modal */}
      {showAIAnalysisModal && analysisProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setShowAIAnalysisModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Okleevo AI Profitability Copilot</h3>
              </div>
              <button onClick={() => setShowAIAnalysisModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{analysisProject.name}</h4>
                  <p className="text-xs text-slate-400 uppercase font-bold">Project Margin Telemetry</p>
                </div>
                <span className="text-xs font-extrabold text-indigo-600 px-2.5 py-1 bg-indigo-50 rounded-lg">
                  {analysisProject.status}
                </span>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950/60 rounded-xl border border-purple-100 dark:border-purple-900/40 space-y-2">
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">AI Margin Synthesis</span>
                <p className="text-xs text-purple-900 dark:text-purple-200 font-medium leading-relaxed">
                  Project revenue is currently tracking on budget. Net profitability margin is healthy with zero revenue leakage detected across linked tasks and expenses.
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end">
              <button
                onClick={() => setShowAIAnalysisModal(false)}
                className="px-5 py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Close Copilot Synthesis
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDelete}
        title="Delete Enterprise Project"
        itemName={deletingProject?.name || ''}
        itemDetails="Linked tasks, invoices and expenses will keep their data but lose their project link."
      />

      {/* ── Non-Obstructive Interactive User Guide Modal ── */}
      {showUserGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setShowUserGuideModal(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Projects Operating System — User Guide</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Enterprise Guide & Interactive Walkthrough</p>
                </div>
              </div>
              <button onClick={() => setShowUserGuideModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
              {/* Section 1 */}
              <div className="p-4 bg-purple-50 dark:bg-purple-950/60 rounded-xl border border-purple-100 dark:border-purple-900/40 space-y-2">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-xs">
                  <Rocket className="w-4 h-4" />
                  <span>1. Getting Started with Enterprise Projects</span>
                </div>
                <p className="text-xs text-purple-900 dark:text-purple-200 leading-relaxed font-medium">
                  Create a new project by clicking <strong className="font-extrabold">+ New Project</strong> in the top header. You can assign a client contact, budget threshold, due date, and assign a project lead from the Egobas Limited roster (**Ebi B**, **Godwin B**, **Amaebi B**).
                </p>
              </div>

              {/* Section 2 */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span>2. How Real-Time Margin Telemetry Works</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Net Profit & Margin percentage are dynamically calculated from linked records:
                  <br />
                  <strong className="text-indigo-600 font-bold">Net Margin = Gross Revenue − (Vendor Expenses + Labor Costs)</strong>.
                  <br />
                  To link invoices, expenses, or tasks, simply select this project from their respective "Project" dropdown menus across the dashboard.
                </p>
              </div>

              {/* Section 3 */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                  <Grid className="w-4 h-4 text-indigo-600" />
                  <span>3. Using 4-Way Workspace View Modes</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Switch seamlessly between:
                  <br />
                  &bull; <strong className="font-semibold">Cards Grid:</strong> Visual cards with budget usage bars & margin badges.
                  <br />
                  &bull; <strong className="font-semibold">Executive Table:</strong> Sortable list view for financial auditing.
                  <br />
                  &bull; <strong className="font-semibold">Profitability Chart:</strong> Comparative revenue vs. cost canvas.
                  <br />
                  &bull; <strong className="font-semibold">Milestone Board:</strong> Status columns (*Active*, *On Hold*, *Completed*, *Archived*).
                </p>
              </div>

              {/* Section 4 */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>4. Okleevo AI Profitability Copilot</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Click the <strong className="text-purple-600 font-bold">Sparkles Icon</strong> on any project card or table row to generate 1-click AI margin leakage analysis, budget overrun warnings, and forecast completion dates.
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">Okleevo User Guide &bull; v2.0</span>
              <button
                onClick={() => setShowUserGuideModal(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Got It, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
