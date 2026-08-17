"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, FolderKanban, Pencil, Archive, ArchiveRestore, Trash2,
  TrendingUp, TrendingDown, Clock3, Loader2, CalendarClock, Link2,
  CheckSquare, Receipt, Wallet, Mail,
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import ProjectFormModal, { ProjectFormValues } from '@/components/projects/ProjectFormModal';

type ProjectStatus = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';

interface Task {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'PAUSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string | null;
  assignedTo?: string | null;
}

interface Invoice {
  id: string;
  number: string;
  clientName: string;
  amount: number;
  status: 'DRAFT' | 'SENT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELED';
  dueDate: string;
  paidAt?: string | null;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface TimeEntry {
  id: string;
  hoursLogged: number;
  date: string;
  notes?: string | null;
  employee: { id: string; firstName: string; lastName: string };
}

interface ProjectDetail {
  id: string;
  name: string;
  status: ProjectStatus;
  budget?: number | null;
  dueDate?: string | null;
  contact?: { id: string; name: string; company?: string; email?: string } | null;
  owner?: { id: string; firstName: string; lastName: string } | null;
  tasks: Task[];
  invoices: Invoice[];
  expenses: Expense[];
  timeEntries: TimeEntry[];
}

interface Profitability {
  revenue: number;
  expenses: number;
  laborCost: number;
  totalHours: number;
  netProfit: number;
  margin: number;
}

const currency = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n || 0);

const projectStatusBadge = (s: ProjectStatus) => {
  switch (s) {
    case 'ACTIVE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'ON_HOLD': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'COMPLETED': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'ARCHIVED': return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const taskStatusBadge = (s: Task['status']) => {
  switch (s) {
    case 'TODO': return 'bg-gray-100 text-gray-600 border-gray-200';
    case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'REVIEW': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'DONE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'PAUSED': return 'bg-rose-100 text-rose-700 border-rose-200';
  }
};

const invoiceStatusBadge = (s: Invoice['status']) => {
  switch (s) {
    case 'DRAFT': return 'bg-gray-100 text-gray-600 border-gray-200';
    case 'SENT': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'PAID': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'OVERDUE': return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'CANCELED': return 'bg-gray-100 text-gray-500 border-gray-200';
  }
};

const TABS = [
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'expenses', label: 'Expenses', icon: Wallet },
  { id: 'time', label: 'Time', icon: Clock3 },
] as const;

type TabId = typeof TABS[number]['id'];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [profitability, setProfitability] = useState<Profitability | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('tasks');

  const [showEditModal, setShowEditModal] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    try {
      const [projRes, profitRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/profitability`),
      ]);
      if (projRes.ok) setProject(await projRes.json());
      if (profitRes.ok) setProfitability(await profitRes.json());
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  const handleSaveEdit = async (values: ProjectFormValues) => {
    if (!values.name.trim()) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          status: values.status,
          contactId: values.contactId || null,
          ownerId: values.ownerId || null,
          budget: values.budget || null,
          dueDate: values.dueDate || null,
        }),
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchProject();
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const handleArchiveToggle = async () => {
    if (!project) return;
    const nextStatus = project.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED';
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) fetchProject();
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
    if (res.ok) router.push('/dashboard/projects');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <FolderKanban className="w-10 h-10 text-gray-300" />
        <p className="text-gray-500 font-medium">Project not found</p>
        <button type="button" onClick={() => router.push('/dashboard/projects')}
          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium cursor-pointer">
          Back to Projects
        </button>
      </div>
    );
  }

  const spent = profitability ? profitability.expenses + profitability.laborCost : 0;
  const budgetPct = project.budget ? Math.min(100, Math.round((spent / project.budget) * 100)) : null;
  const isOverdue = project.dueDate && new Date(project.dueDate) < new Date() && project.status !== 'COMPLETED' && project.status !== 'ARCHIVED';
  const linkedCount = project.tasks.length + project.invoices.length + project.expenses.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button type="button" onClick={() => router.push('/dashboard/projects')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 shrink-0">
            <FolderKanban className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight truncate">{project.name}</h1>
              <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${projectStatusBadge(project.status)}`}>
                {project.status.replace('_', ' ')}
              </span>
            </div>
            {project.contact && (
              <p className="text-xs text-gray-500 truncate">{project.contact.company || project.contact.name}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button type="button" title="Edit" onClick={() => setShowEditModal(true)}
              className="p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-lg border border-gray-200 transition-colors cursor-pointer">
              <Pencil className="w-4 h-4" />
            </button>
            <button type="button" title={project.status === 'ARCHIVED' ? 'Unarchive' : 'Archive'} onClick={handleArchiveToggle}
              className="p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-lg border border-gray-200 transition-colors cursor-pointer">
              {project.status === 'ARCHIVED' ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            </button>
            <button type="button" title="Delete" onClick={() => setShowDeleteModal(true)}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg border border-gray-200 transition-colors cursor-pointer">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Meta strip */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5" />
            {linkedCount === 0 ? 'Nothing linked yet' : `${project.tasks.length} tasks · ${project.invoices.length} invoices · ${project.expenses.length} expenses`}
          </span>
          {project.dueDate && (
            <span className={`flex items-center gap-1.5 ${isOverdue ? 'text-rose-600 font-semibold' : ''}`}>
              <CalendarClock className="w-3.5 h-3.5" />
              {isOverdue ? 'Overdue: ' : 'Due '}{new Date(project.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
          {project.contact?.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {project.contact.email}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            {project.owner ? `Owner: ${project.owner.firstName} ${project.owner.lastName}` : 'Unassigned'}
          </span>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Revenue</p>
            <p className="text-xl font-semibold text-gray-900 mt-0.5">{profitability ? currency(profitability.revenue) : '—'}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Paid invoices</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Expenses + Labor</p>
            <p className="text-xl font-semibold text-gray-900 mt-0.5">{profitability ? currency(profitability.expenses + profitability.laborCost) : '—'}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{profitability ? `${profitability.totalHours}h logged` : ''}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Net Margin</p>
            <p className={`text-xl font-semibold mt-0.5 flex items-center gap-1 ${profitability && profitability.netProfit >= 0 ? 'text-gray-900' : 'text-rose-600'}`}>
              {profitability ? (profitability.netProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />) : null}
              {profitability ? currency(profitability.netProfit) : '—'}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">{profitability ? `${profitability.margin.toFixed(0)}% margin` : ''}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Budget</p>
            {project.budget != null ? (
              <>
                <p className="text-xl font-semibold text-gray-900 mt-0.5">{currency(project.budget)}</p>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full ${budgetPct !== null && budgetPct >= 100 ? 'bg-rose-500' : budgetPct !== null && budgetPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${budgetPct || 0}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">{budgetPct}% used ({currency(spent)})</p>
              </>
            ) : (
              <p className="text-sm text-gray-400 mt-1">Not set</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center gap-1 p-1.5 border-b border-gray-200 overflow-x-auto">
            {TABS.map(tab => {
              const count = tab.id === 'tasks' ? project.tasks.length
                : tab.id === 'invoices' ? project.invoices.length
                : tab.id === 'expenses' ? project.expenses.length
                : project.timeEntries.length;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                  <span className={`px-1.5 rounded text-[10px] ${isActive ? 'bg-white text-gray-600' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 sm:p-5">
            {activeTab === 'tasks' && (
              project.tasks.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No tasks linked yet. Link tasks to this project from the Tasks page.</p>
              ) : (
                <div className="space-y-2">
                  {project.tasks.map(t => (
                    <div key={t.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {t.assignedTo ? `Assigned to ${t.assignedTo}` : 'Unassigned'}
                          {t.dueDate ? ` · Due ${new Date(t.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}
                        </p>
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${taskStatusBadge(t.status)}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'invoices' && (
              project.invoices.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No invoices linked yet. Link invoices to this project from the Invoicing page.</p>
              ) : (
                <div className="space-y-2">
                  {project.invoices.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{inv.number}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {inv.status === 'PAID' && inv.paidAt
                            ? `Paid ${new Date(inv.paidAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                            : `Due ${new Date(inv.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold text-gray-900">{currency(inv.amount)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${invoiceStatusBadge(inv.status)}`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'expenses' && (
              project.expenses.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No expenses linked yet. Link expenses to this project from the Expenses page.</p>
              ) : (
                <div className="space-y-2">
                  {project.expenses.map(exp => (
                    <div key={exp.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{exp.description}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{exp.category} · {new Date(exp.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 shrink-0">{currency(exp.amount)}</span>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'time' && (
              project.timeEntries.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No time logged against this project yet.</p>
              ) : (
                <div className="space-y-2">
                  {project.timeEntries.map(te => (
                    <div key={te.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{te.employee.firstName} {te.employee.lastName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(te.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          {te.notes ? ` · ${te.notes}` : ''}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 shrink-0 flex items-center gap-1"><Clock3 className="w-3.5 h-3.5 text-gray-400" /> {te.hoursLogged}h</span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <ProjectFormModal
          mode="edit"
          initialValues={{
            name: project.name,
            contactId: project.contact?.id || '',
            status: project.status,
            budget: project.budget != null ? String(project.budget) : '',
            dueDate: project.dueDate ? project.dueDate.split('T')[0] : '',
            ownerId: project.owner?.id || '',
          }}
          saving={savingEdit}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleSaveEdit}
        />
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        itemName={project.name}
        itemDetails="Linked tasks, invoices and expenses will keep their data but lose their project link."
      />
    </div>
  );
}
