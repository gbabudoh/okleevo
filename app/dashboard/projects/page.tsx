"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderKanban, Plus, Clock3, Loader2, Pencil, Archive, ArchiveRestore, Trash2, Link2,
  CalendarClock, Layers, AlertTriangle,
  ShieldCheck, Search, Grid, List, Target,
  CheckCircle2, CheckCheck, RefreshCw, X,
  BookOpen, Rocket
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import ProjectFormModal, { ProjectFormValues } from '@/components/projects/ProjectFormModal';

interface Project {
  id: string;
  name: string;
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
  budget?: number | null;
  startDate?: string | null;
  dueDate?: string | null;
  ownerId?: string | null;
  owner?: { id: string; firstName: string; lastName: string } | null;
  contact?: { id: string; name: string; company?: string } | null;
  tasks?: { status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'PAUSED' }[];
  _count?: { tasks: number; invoices: number; expenses: number };
}

interface PortfolioSummary {
  totalProjects: number;
  activeCount: number;
  onHoldCount: number;
  completedCount: number;
  overdueCount: number;
}

const statusBadge = (s: Project['status']) => {
  switch (s) {
    case 'ACTIVE': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80';
    case 'ON_HOLD': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80';
    case 'COMPLETED': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/80';
    case 'ARCHIVED': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200/80';
  }
};

const emptyForm: ProjectFormValues = { name: '', contactId: '', status: 'ACTIVE', startDate: '', dueDate: '', ownerId: '' };

/* ── Project Card Component ─────────────────────────────────────────── */
function ProjectCard({
  project, onEdit, onArchiveToggle, onDelete,
}: {
  project: Project;
  onEdit: (p: Project) => void;
  onArchiveToggle: (p: Project) => void;
  onDelete: (p: Project) => void;
}) {
  const router = useRouter();
  const taskCount = project._count?.tasks || 0;
  const isOverdue = project.dueDate && new Date(project.dueDate) < new Date() && project.status !== 'COMPLETED' && project.status !== 'ARCHIVED';

  const tasks = project.tasks || [];
  const todoCount = tasks.filter(t => t.status === 'TODO' || t.status === 'PAUSED').length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const reviewCount = tasks.filter(t => t.status === 'REVIEW').length;
  const doneCount = tasks.filter(t => t.status === 'DONE').length;

  const getStatusDot = (s: Project['status']) => {
    switch (s) {
      case 'ACTIVE': return 'bg-emerald-500';
      case 'ON_HOLD': return 'bg-amber-500';
      case 'COMPLETED': return 'bg-indigo-500';
      case 'ARCHIVED': return 'bg-slate-400';
    }
  };

  return (
    <div
      onClick={() => router.push(`/dashboard/projects/${project.id}`)}
      className="group relative bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 rounded-3xl p-6 hover:border-orange-300 dark:hover:border-orange-900/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-5 shadow-2xs"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-500 border border-orange-200/60 dark:border-orange-900/40 flex items-center justify-center shrink-0">
              <FolderKanban className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              {project.name}
            </h3>
          </div>
          {project.contact && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              Client: {project.contact.company || project.contact.name}
            </p>
          )}
        </div>

        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border shrink-0 ${statusBadge(project.status)}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(project.status)}`} />
          <span>{project.status.replace('_', ' ')}</span>
        </span>
      </div>

      {/* Task Count & Due Date */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 font-mono">
        <span className="flex items-center gap-1.5 font-bold text-[11px]">
          <Link2 className="w-3.5 h-3.5 text-orange-500" />
          {taskCount === 0 ? 'No tasks linked' : `${taskCount} task${taskCount === 1 ? '' : 's'} linked`}
        </span>

        {project.dueDate && (
          <span className={`flex items-center gap-1 text-[11px] font-bold ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
            <CalendarClock className="w-3.5 h-3.5" />
            {isOverdue ? 'Overdue: ' : ''}{new Date(project.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>

      {/* Task status breakdown */}
      {taskCount > 0 && (
        <div className="space-y-1.5">
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            {todoCount > 0 && <div className="h-full bg-slate-300 dark:bg-slate-600" style={{ width: `${(todoCount / taskCount) * 100}%` }} />}
            {inProgressCount > 0 && <div className="h-full bg-orange-500" style={{ width: `${(inProgressCount / taskCount) * 100}%` }} />}
            {reviewCount > 0 && <div className="h-full bg-amber-500" style={{ width: `${(reviewCount / taskCount) * 100}%` }} />}
            {doneCount > 0 && <div className="h-full bg-emerald-500" style={{ width: `${(doneCount / taskCount) * 100}%` }} />}
          </div>
          {inProgressCount > 0 && (
            <p className="text-[10px] font-bold font-mono text-orange-600 dark:text-orange-400">{inProgressCount} in progress</p>
          )}
        </div>
      )}

      {/* Footer Action Bar */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 text-white font-extrabold text-[10px] font-mono flex items-center justify-center shadow-xs">
            {project.owner ? `${project.owner.firstName[0]}${project.owner.lastName[0]}` : '—'}
          </div>
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
            {project.owner ? `${project.owner.firstName} ${project.owner.lastName}` : 'Unassigned'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button type="button" title="Edit" onClick={() => onEdit(project)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button type="button" title={project.status === 'ARCHIVED' ? 'Unarchive' : 'Archive'} onClick={() => onArchiveToggle(project)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">
            {project.status === 'ARCHIVED' ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
          </button>
          <button type="button" title="Delete" onClick={() => onDelete(project)}
            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer">
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
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'board'>('grid');
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
          ownerId: values.ownerId || null,
          startDate: values.startDate || null,
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
          ownerId: values.ownerId || null,
          startDate: values.startDate || null,
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

      {/* ── Header ── */}
      <div className="rounded-3xl bg-gradient-to-r from-orange-50/70 via-white to-amber-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-850 border border-orange-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shrink-0 text-white shadow-md shadow-orange-500/20">
              <FolderKanban className="w-6 h-6 stroke-2" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Projects &amp; Delivery Tracking
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200/60 dark:border-orange-900/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                  Okleevo Enterprise Engine v2.0
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                Track project timelines, milestones, and task delivery across your distributed team.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shadow-2xs"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-orange-500' : ''}`} />
            </button>

            {/* User Guide Button & Hover Tooltip */}
            <div className="relative">
              <button
                onClick={() => setShowUserGuideModal(true)}
                onMouseEnter={() => setGuideHovered(true)}
                onMouseLeave={() => setGuideHovered(false)}
                className="px-4 py-2.5 bg-orange-50 dark:bg-orange-950/60 hover:bg-orange-100 border border-orange-200 dark:border-orange-900/60 text-orange-700 dark:text-orange-300 font-extrabold text-xs rounded-2xl transition-all cursor-pointer shadow-2xs flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-orange-500" />
                <span>User Guide</span>
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              </button>

              {guideHovered && !showUserGuideModal && (
                <div className="absolute right-0 top-full mt-2 w-72 p-3.5 bg-slate-900 text-white text-xs rounded-2xl shadow-2xl z-50 pointer-events-none space-y-1 animate-in fade-in zoom-in-95 duration-150 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-orange-400 font-bold">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Quick Guide Preview</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                    Click to open full guide: learn how to link tasks, track deadlines, and switch between view modes.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-2xl transition-all cursor-pointer shadow-md shadow-orange-500/20 flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary Telemetry Pods ── */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center gap-4 hover:border-orange-300 dark:hover:border-orange-900/50 transition-all">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-500 flex items-center justify-center shrink-0 border border-orange-200/60 dark:border-orange-900/40">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white leading-none">{summary.totalProjects}</p>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-1 truncate">Total Projects</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center gap-4 hover:border-emerald-300 dark:hover:border-emerald-900/50 transition-all">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/60">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white leading-none">{summary.activeCount}</p>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-1 truncate">Active</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center gap-4 hover:border-amber-300 dark:hover:border-amber-900/50 transition-all">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shrink-0 border border-amber-200/60">
              <Clock3 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white leading-none">{summary.onHoldCount}</p>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-1 truncate">On Hold</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center gap-4 hover:border-indigo-300 dark:hover:border-indigo-900/50 transition-all">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/60">
              <CheckCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white leading-none">{summary.completedCount}</p>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-1 truncate">Completed</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center gap-4 hover:border-rose-300 dark:hover:border-rose-900/50 transition-all">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shrink-0 border border-rose-200/60">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white leading-none">{summary.overdueCount}</p>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-1 truncate">Overdue</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation Toolbar: Search, Status Filters, & View Switcher ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Search Input */}
        <div className="flex-1 relative min-w-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects by title, client name, or linked tasks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs font-bold outline-none border border-slate-200/80 dark:border-slate-700/80 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-orange-500/10 transition-all text-slate-900 dark:text-white"
          />
        </div>

        {/* Status Filter Chips — Scrollbar-Free */}
        <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
          {['all', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'].map(statusKey => {
            const isActive = selectedStatus === statusKey;
            const count = statusKey === 'all' ? projects.length : projects.filter(p => p.status === statusKey).length;

            return (
              <button
                key={statusKey}
                onClick={() => setSelectedStatus(statusKey)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm shadow-orange-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{statusKey === 'all' ? 'All Projects' : statusKey.replace('_', ' ')}</span>
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-mono font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher Dock */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              viewMode === 'grid' ? 'bg-white dark:bg-slate-950 text-orange-600 dark:text-orange-400 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Cards Grid"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Cards Grid</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              viewMode === 'table' ? 'bg-white dark:bg-slate-950 text-purple-600 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Structured Table"
          >
            <List className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              viewMode === 'board' ? 'bg-white dark:bg-slate-950 text-amber-600 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Milestone Board"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Milestone Board</span>
          </button>
        </div>
      </div>

      {/* ── Main View Workspace ── */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading Projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-950/60 text-orange-500 rounded-2xl flex items-center justify-center mx-auto">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Projects Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Create your first project to track tasks, deadlines, and delivery progress.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-xs rounded-2xl transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* ── Table View ── */
        <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-4">Project Name</th>
                <th className="px-5 py-4">Client</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Due Date</th>
                <th className="px-5 py-4">Tasks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {filteredProjects.map(p => (
                <tr
                  key={p.id}
                  onClick={() => router.push(`/dashboard/projects/${p.id}`)}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors cursor-pointer font-medium text-slate-800 dark:text-slate-200"
                >
                  <td className="px-5 py-4 font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>{p.name}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 font-medium">{p.contact?.company || p.contact?.name || 'Direct Enterprise'}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${statusBadge(p.status)}`}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 font-mono font-medium">{p.dueDate ? new Date(p.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td className="px-5 py-4 text-slate-500 font-mono font-bold">
                    {p._count?.tasks || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : viewMode === 'board' ? (
        /* ── Milestone & Status Board ── */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            { label: 'ACTIVE', dot: 'bg-emerald-500' },
            { label: 'ON_HOLD', dot: 'bg-amber-500' },
            { label: 'COMPLETED', dot: 'bg-indigo-500' },
            { label: 'ARCHIVED', dot: 'bg-slate-400' },
          ].map(col => {
            const columnProjects = filteredProjects.filter(p => p.status === col.label);

            return (
              <div key={col.label} className="bg-slate-50/70 dark:bg-slate-900/60 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">{col.label.replace('_', ' ')}</h4>
                  </div>
                  <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {columnProjects.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {columnProjects.length === 0 ? (
                    <div className="py-8 px-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 flex flex-col items-center justify-center gap-1.5">
                      <FolderKanban className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-medium text-slate-400">No projects in this stage</p>
                    </div>
                  ) : (
                    columnProjects.map(p => (
                      <ProjectCard
                        key={p.id}
                        project={p}
                        onEdit={setEditingProject}
                        onArchiveToggle={handleArchiveToggle}
                        onDelete={setDeletingProject}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Cards Grid View ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(p => (
            <ProjectCard
              key={p.id}
              project={p}
              onEdit={setEditingProject}
              onArchiveToggle={handleArchiveToggle}
              onDelete={setDeletingProject}
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
            startDate: editingProject.startDate ? editingProject.startDate.split('T')[0] : '',
            dueDate: editingProject.dueDate ? editingProject.dueDate.split('T')[0] : '',
            ownerId: editingProject.owner?.id || editingProject.ownerId || '',
          }}
          saving={savingEdit}
          onClose={() => setEditingProject(null)}
          onSubmit={handleSaveEdit}
        />
      )}

      <DeleteConfirmationModal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        itemName={deletingProject?.name || ''}
        itemDetails="Linked tasks will keep their data but lose their project link."
      />

      {/* ── User Guide Modal ── */}
      {showUserGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setShowUserGuideModal(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Projects — User Guide</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Quick Walkthrough</p>
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
                  <span>1. Getting Started</span>
                </div>
                <p className="text-xs text-purple-900 dark:text-purple-200 leading-relaxed font-medium">
                  Create a new project by clicking <strong className="font-extrabold">+ New Project</strong> in the top header. You can assign a client contact, due date, and a project owner from your team.
                </p>
              </div>

              {/* Section 2 */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                  <Link2 className="w-4 h-4 text-indigo-600" />
                  <span>2. Linking Tasks</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Select a project from the &ldquo;Project&rdquo; dropdown on any task to link it — linked task counts and overdue status appear right on the project card.
                </p>
              </div>

              {/* Section 3 */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                  <Grid className="w-4 h-4 text-indigo-600" />
                  <span>3. View Modes</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Switch seamlessly between:
                  <br />
                  &bull; <strong className="font-semibold">Cards Grid:</strong> Visual cards with owner, due date, and linked tasks.
                  <br />
                  &bull; <strong className="font-semibold">Table:</strong> Sortable list view for quick scanning.
                  <br />
                  &bull; <strong className="font-semibold">Milestone Board:</strong> Status columns (*Active*, *On Hold*, *Completed*, *Archived*).
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
