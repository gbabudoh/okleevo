"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  FolderKanban, Plus, X, PoundSterling, TrendingUp, TrendingDown,
  Clock3, Loader2, Pencil, Archive, ArchiveRestore, Trash2, Link2,
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface Project {
  id: string;
  name: string;
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
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

const STATUS_OPTIONS: Project['status'][] = ['ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'];

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

function ProjectCard({
  project, onEdit, onArchiveToggle, onDelete,
}: {
  project: Project;
  onEdit: (p: Project) => void;
  onArchiveToggle: (p: Project) => void;
  onDelete: (p: Project) => void;
}) {
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

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{project.name}</h3>
          {project.contact && (
            <p className="text-xs text-gray-500 truncate">{project.contact.company || project.contact.name}</p>
          )}
        </div>
        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(project.status)}`}>
          {project.status.replace('_', ' ')}
        </span>
      </div>

      {/* What's linked, so a £0.00 card reads as "nothing attached yet" rather than a bug */}
      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
        <Link2 className="w-3 h-3" />
        {linkedCount === 0
          ? 'Nothing linked yet'
          : `${project._count?.tasks || 0} tasks · ${project._count?.invoices || 0} invoices · ${project._count?.expenses || 0} expenses`}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Calculating profitability…
        </div>
      ) : linkedCount === 0 ? (
        <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
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
            <p className={`font-bold flex items-center gap-1 ${profitability.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {profitability.netProfit >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {currency(profitability.netProfit)} ({profitability.margin.toFixed(0)}%)
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400">Profitability unavailable</p>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
        <button type="button" onClick={() => onEdit(project)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
        <button type="button" onClick={() => onArchiveToggle(project)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
          {project.status === 'ARCHIVED'
            ? <><ArchiveRestore className="w-3.5 h-3.5" /> Unarchive</>
            : <><Archive className="w-3.5 h-3.5" /> Archive</>}
        </button>
        <button type="button" onClick={() => onDelete(project)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<Project['status']>('ACTIVE');
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

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setName('');
        setShowAddModal(false);
        fetchProjects();
      }
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (p: Project) => {
    setEditingProject(p);
    setEditName(p.name);
    setEditStatus(p.status);
  };

  const handleSaveEdit = async () => {
    if (!editingProject || !editName.trim()) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/projects/${editingProject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, status: editStatus }),
      });
      if (res.ok) {
        setEditingProject(null);
        fetchProjects();
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
    if (res.ok) fetchProjects();
  };

  const handleDelete = async () => {
    if (!deletingProject) return;
    const res = await fetch(`/api/projects/${deletingProject.id}`, { method: 'DELETE' });
    if (res.ok) {
      setDeletingProject(null);
      fetchProjects();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl shrink-0">
            <FolderKanban className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Projects</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Real-time profitability across tasks, invoices and expenses</p>
          </div>
          <button type="button" onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
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
                onEdit={openEdit}
                onArchiveToggle={handleArchiveToggle}
                onDelete={setDeletingProject}
              />
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">New Project</h2>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              autoFocus
              placeholder="Project name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-sm font-medium bg-white"
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 px-4 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button type="button" onClick={handleCreate} disabled={saving || !name.trim()}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PoundSterling className="w-4 h-4" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Edit Project</h2>
              <button type="button" onClick={() => setEditingProject(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Project name</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-sm font-medium bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Status</label>
              <select
                value={editStatus}
                onChange={e => setEditStatus(e.target.value as Project['status'])}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer text-sm outline-none"
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditingProject(null)}
                className="flex-1 py-2.5 px-4 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button type="button" onClick={handleSaveEdit} disabled={savingEdit || !editName.trim()}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5">
                {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
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
