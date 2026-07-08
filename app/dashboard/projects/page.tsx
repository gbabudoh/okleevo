"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderKanban, Plus, TrendingUp, TrendingDown,
  Clock3, Loader2, Pencil, Archive, ArchiveRestore, Trash2, Link2,
  ArrowUpRight, CalendarClock, Layers, AlertTriangle, Wallet,
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import ProjectFormModal, { ProjectFormValues } from '@/components/projects/ProjectFormModal';

interface Project {
  id: string;
  name: string;
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
  budget?: number | null;
  dueDate?: string | null;
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

const statusBadge = (s: Project['status']) => {
  switch (s) {
    case 'ACTIVE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'ON_HOLD': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'COMPLETED': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'ARCHIVED': return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const currency = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n || 0);

const emptyForm: ProjectFormValues = { name: '', contactId: '', status: 'ACTIVE', budget: '', dueDate: '' };

function ProjectCard({
  project, onEdit, onArchiveToggle, onDelete,
}: {
  project: Project;
  onEdit: (p: Project) => void;
  onArchiveToggle: (p: Project) => void;
  onDelete: (p: Project) => void;
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

  return (
    <div
      onClick={() => router.push(`/dashboard/projects/${project.id}`)}
      className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors p-5 space-y-4 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
          {project.contact && (
            <p className="text-xs text-gray-500 truncate">{project.contact.company || project.contact.name}</p>
          )}
        </div>
        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(project.status)}`}>
          {project.status.replace('_', ' ')}
        </span>
      </div>

      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-400">
        <span className="flex items-center gap-1.5">
          <Link2 className="w-3 h-3" />
          {linkedCount === 0
            ? 'Nothing linked yet'
            : `${project._count?.tasks || 0} tasks · ${project._count?.invoices || 0} invoices · ${project._count?.expenses || 0} expenses`}
        </span>
        {project.dueDate && (
          <span className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-semibold' : ''}`}>
            <CalendarClock className="w-3 h-3" />
            {isOverdue ? 'Overdue: ' : 'Due '}{new Date(project.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Calculating profitability…
        </div>
      ) : linkedCount === 0 ? (
        <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3 border border-gray-100">
          Link an invoice, expense, or task to this project (from their own &ldquo;Project&rdquo; dropdown) to see real numbers here.
        </p>
      ) : profitability ? (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500 text-xs">Revenue</p>
            <p className="font-semibold text-gray-900">{currency(profitability.revenue)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Expenses + Labor</p>
            <p className="font-semibold text-gray-900">{currency(profitability.expenses + profitability.laborCost)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs flex items-center gap-1"><Clock3 className="w-3 h-3" /> Hours Logged</p>
            <p className="font-semibold text-gray-900">{profitability.totalHours}h</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Net Margin</p>
            <p className={`font-semibold flex items-center gap-1 ${profitability.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {profitability.netProfit >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {currency(profitability.netProfit)} ({profitability.margin.toFixed(0)}%)
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400">Profitability unavailable</p>
      )}

      {project.budget != null && budgetPct !== null && (
        <div>
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
            <span>Budget used</span>
            <span className="font-medium text-gray-700">{currency(spent)} / {currency(project.budget)}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${budgetPct >= 100 ? 'bg-rose-500' : budgetPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-gray-100" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={() => router.push(`/dashboard/projects/${project.id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
          Open <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
        <button type="button" title="Edit" onClick={() => onEdit(project)}
          className="p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-colors cursor-pointer">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button type="button" title={project.status === 'ARCHIVED' ? 'Unarchive' : 'Archive'} onClick={() => onArchiveToggle(project)}
          className="p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-colors cursor-pointer">
          {project.status === 'ARCHIVED' ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
        </button>
        <button type="button" title="Delete" onClick={() => onDelete(project)}
          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

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

  useEffect(() => { fetchProjects(); fetchSummary(); }, [fetchProjects, fetchSummary]);

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
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 shrink-0">
            <FolderKanban className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">Projects</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Real-time profitability across tasks, invoices and expenses</p>
          </div>
          <button type="button" onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        {summary && summary.totalProjects > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-gray-50 rounded-lg border border-gray-200"><Layers className="w-4 h-4 text-gray-500" /></div>
              </div>
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Active Projects</p>
              <p className="text-xl font-semibold text-gray-900 mt-0.5">{summary.activeCount}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{summary.onHoldCount} on hold</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-gray-50 rounded-lg border border-gray-200"><Wallet className="w-4 h-4 text-gray-500" /></div>
              </div>
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Portfolio Revenue</p>
              <p className="text-xl font-semibold text-gray-900 mt-0.5">{currency(summary.totalRevenue)}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Paid invoices, all projects</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg border ${summary.netProfit >= 0 ? 'bg-gray-50 border-gray-200' : 'bg-rose-50 border-rose-200'}`}>
                  {summary.netProfit >= 0 ? <TrendingUp className="w-4 h-4 text-gray-500" /> : <TrendingDown className="w-4 h-4 text-rose-500" />}
                </div>
              </div>
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Portfolio Net Profit</p>
              <p className={`text-xl font-semibold mt-0.5 ${summary.netProfit >= 0 ? 'text-gray-900' : 'text-rose-600'}`}>{currency(summary.netProfit)}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{summary.atRiskCount} project(s) at risk</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg border ${summary.overdueCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                  <AlertTriangle className={`w-4 h-4 ${summary.overdueCount > 0 ? 'text-amber-500' : 'text-gray-500'}`} />
                </div>
              </div>
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Overdue</p>
              <p className="text-xl font-semibold text-gray-900 mt-0.5">{summary.overdueCount}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">of {summary.totalProjects} total</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FolderKanban className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No projects yet</p>
            <p className="text-sm text-gray-400 mt-1">Create a project to link tasks, invoices and expenses, and track real-time margin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                onEdit={(proj) => setEditingProject(proj)}
                onArchiveToggle={handleArchiveToggle}
                onDelete={setDeletingProject}
              />
            ))}
          </div>
        )}
      </div>

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

      <DeleteConfirmationModal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        itemName={deletingProject?.name || ''}
        itemDetails="Linked tasks, invoices and expenses will keep their data but lose their project link."
      />
    </div>
  );
}
