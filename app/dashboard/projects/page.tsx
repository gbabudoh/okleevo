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

        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border shrink-0 ${statusBadge(project.status)}`}>
          {project.status.replace('_', ' ')}
        </span>
      </div>

      {/* Task Count & Due Date */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
        <span className="flex items-center gap-1 font-semibold text-[11px]">
          <Link2 className="w-3.5 h-3.5 text-indigo-500" />
          {taskCount === 0 ? 'No tasks linked' : `${taskCount} task${taskCount === 1 ? '' : 's'} linked`}
        </span>

        {project.dueDate && (
          <span className={`flex items-center gap-1 text-[11px] font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-400'}`}>
            <CalendarClock className="w-3.5 h-3.5" />
            {isOverdue ? 'Overdue: ' : ''}{new Date(project.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>

      {/* Task status breakdown */}
      {taskCount > 0 && (
        <div className="space-y-1">
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            {todoCount > 0 && <div className="h-full bg-slate-300 dark:bg-slate-600" style={{ width: `${(todoCount / taskCount) * 100}%` }} />}
            {inProgressCount > 0 && <div className="h-full bg-indigo-500" style={{ width: `${(inProgressCount / taskCount) * 100}%` }} />}
            {reviewCount > 0 && <div className="h-full bg-amber-500" style={{ width: `${(reviewCount / taskCount) * 100}%` }} />}
            {doneCount > 0 && <div className="h-full bg-emerald-500" style={{ width: `${(doneCount / taskCount) * 100}%` }} />}
          </div>
          {inProgressCount > 0 && (
            <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">{inProgressCount} in progress</p>
          )}
        </div>
      )}

      {/* Footer Action Bar */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center">
            {project.owner ? `${project.owner.firstName[0]}${project.owner.lastName[0]}` : '—'}
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {project.owner ? `${project.owner.firstName} ${project.owner.lastName}` : 'Unassigned'}
          </span>
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
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl shrink-0 text-white shadow-md">
              <FolderKanban className="w-6 h-6 stroke-2" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Projects & Delivery Tracking
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  Okleevo Enterprise Engine v2.0
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Track project timelines, milestones, and task delivery across your distributed team.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Refresh"
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

              {guideHovered && !showUserGuideModal && (
                <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-2xl z-50 pointer-events-none space-y-1 animate-in fade-in zoom-in-95 duration-150 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-purple-400 font-bold">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">{summary.totalProjects}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Projects</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">{summary.activeCount}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Active</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
              <Clock3 className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">{summary.onHoldCount}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">On Hold</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
              <CheckCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">{summary.completedCount}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Completed</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">{summary.overdueCount}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Overdue</p>
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
              placeholder="Search projects by title, client name, or linked tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-semibold outline-none border border-slate-200/80 dark:border-slate-700/80 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-900 dark:text-white"
            />
          </div>

          {/* View Mode Switcher */}
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
              <span>Table</span>
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
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading Projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
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
            className="px-4 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* ── Table View ── */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="px-5 py-3">Project Name</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Due Date</th>
                <th className="px-5 py-3">Tasks</th>
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
                  <td className="px-5 py-3.5 text-slate-500">{p.dueDate ? new Date(p.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td className="px-5 py-3.5 text-slate-400">
                    {p._count?.tasks || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : viewMode === 'board' ? (
        /* ── Milestone & Status Board ── */
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
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Cards Grid View ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
