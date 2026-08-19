"use client";

import { useState, useEffect, useCallback, useMemo, type DragEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, FolderKanban, Pencil, Archive, ArchiveRestore, Trash2,
  Clock3, Loader2, CalendarClock, Mail, Users, ListChecks, AlertTriangle, ChartGantt,
  Plus, MessageSquare,
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import ProjectFormModal, { ProjectFormValues } from '@/components/projects/ProjectFormModal';
import ProjectTimeline from '@/components/projects/ProjectTimeline';
import ProjectNotes from '@/components/projects/ProjectNotes';

type ProjectStatus = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';

interface Task {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'PAUSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  startDate?: string | null;
  dueDate?: string | null;
  assignedTo?: string | null;
  dependsOn?: { id: string; title: string; status: string }[];
}

interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

interface Note {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string } | null;
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
  startDate?: string | null;
  dueDate?: string | null;
  contact?: { id: string; name: string; company?: string; email?: string } | null;
  owner?: { id: string; firstName: string; lastName: string } | null;
  tasks: Task[];
  milestones: Milestone[];
  notes: Note[];
  timeEntries: TimeEntry[];
}

const projectStatusBadge = (s: ProjectStatus) => {
  switch (s) {
    case 'ACTIVE': return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    case 'ON_HOLD': return 'bg-amber-50 text-amber-700 border-amber-200/80';
    case 'COMPLETED': return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
    case 'ARCHIVED': return 'bg-slate-100 text-slate-600 border-slate-200/80';
  }
};

const priorityBadge = (p: Task['priority']) => {
  switch (p) {
    case 'URGENT': return 'bg-rose-50 text-rose-700 border-rose-200/80';
    case 'HIGH': return 'bg-orange-50 text-orange-700 border-orange-200/80';
    case 'MEDIUM': return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
    case 'LOW': return 'bg-slate-100 text-slate-500 border-slate-200/80';
  }
};

const TASK_COLUMNS: { id: Task['status']; label: string }[] = [
  { id: 'TODO', label: 'To Do' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'REVIEW', label: 'Review' },
  { id: 'DONE', label: 'Done' },
];

const TABS = [
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
  { id: 'timeline', label: 'Timeline', icon: ChartGantt },
  { id: 'notes', label: 'Notes', icon: MessageSquare },
  { id: 'time', label: 'Time Logged', icon: Clock3 },
] as const;

const QUICK_TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

type TabId = typeof TABS[number]['id'];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('tasks');

  const [showEditModal, setShowEditModal] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showQuickAddTask, setShowQuickAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<typeof QUICK_TASK_PRIORITIES[number]>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) setProject(await res.json());
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
          startDate: values.startDate || null,
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

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    setAddingTask(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          priority: newTaskPriority,
          dueDate: newTaskDueDate || null,
          projectId,
        }),
      });
      if (res.ok) {
        setNewTaskTitle('');
        setNewTaskDueDate('');
        setNewTaskPriority('medium');
        setShowQuickAddTask(false);
        fetchProject();
      }
    } finally {
      setAddingTask(false);
    }
  };

  // ── Task board drag & drop (same pattern as the main Tasks page) ──
  const handleTaskDragStart = (e: DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleTaskDragOver = (e: DragEvent, columnId: string) => {
    e.preventDefault();
    if (dragOverColumnId !== columnId) setDragOverColumnId(columnId);
  };

  const handleTaskDrop = async (e: DragEvent, targetStatus: Task['status']) => {
    e.preventDefault();
    setDragOverColumnId(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedTaskId(null);
    if (!taskId || !project) return;

    const task = project.tasks.find(t => t.id === taskId);
    if (!task || task.status === targetStatus) return;

    setProject({ ...project, tasks: project.tasks.map(t => t.id === taskId ? { ...t, status: targetStatus } : t) });

    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: targetStatus.toLowerCase() }),
    });
    fetchProject();
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

  const stats = useMemo(() => {
    if (!project) return null;
    const total = project.tasks.length;
    const todo = project.tasks.filter(t => t.status === 'TODO' || t.status === 'PAUSED').length;
    const inProgress = project.tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const review = project.tasks.filter(t => t.status === 'REVIEW').length;
    const done = project.tasks.filter(t => t.status === 'DONE').length;
    const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
    const overdue = project.tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length;
    const team = new Set(project.tasks.map(t => t.assignedTo).filter(Boolean)).size;
    const totalHours = project.timeEntries.reduce((sum, te) => sum + te.hoursLogged, 0);
    return { total, todo, inProgress, review, done, progressPct, overdue, team, totalHours };
  }, [project]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!project || !stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <FolderKanban className="w-10 h-10 text-slate-300" />
        <p className="text-slate-500 font-medium">Project not found</p>
        <button type="button" onClick={() => router.push('/dashboard/projects')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold cursor-pointer">
          Back to Projects
        </button>
      </div>
    );
  }

  const isOverdue = project.dueDate && new Date(project.dueDate) < new Date() && project.status !== 'COMPLETED' && project.status !== 'ARCHIVED';
  const daysToDue = project.dueDate ? Math.ceil((new Date(project.dueDate).getTime() - Date.now()) / 86400000) : null;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 sm:pb-8">
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button type="button" onClick={() => router.push('/dashboard/projects')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-100 shrink-0">
            <FolderKanban className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">{project.name}</h1>
              <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${projectStatusBadge(project.status)}`}>
                {project.status.replace('_', ' ')}
              </span>
            </div>
            {project.contact && (
              <p className="text-xs text-slate-500 truncate">{project.contact.company || project.contact.name}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button type="button" title="Edit" onClick={() => setShowEditModal(true)}
              className="p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-lg border border-slate-200/80 transition-colors cursor-pointer">
              <Pencil className="w-4 h-4" />
            </button>
            <button type="button" title={project.status === 'ARCHIVED' ? 'Unarchive' : 'Archive'} onClick={handleArchiveToggle}
              className="p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-lg border border-slate-200/80 transition-colors cursor-pointer">
              {project.status === 'ARCHIVED' ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            </button>
            <button type="button" title="Delete" onClick={() => setShowDeleteModal(true)}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg border border-slate-200/80 transition-colors cursor-pointer">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Meta strip */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          {project.startDate && (
            <span className="flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5" />
              Started {new Date(project.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
          {project.dueDate && (
            <span className={`flex items-center gap-1.5 ${isOverdue ? 'text-rose-600 font-bold' : ''}`}>
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

        {/* Delivery KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Task Progress</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.done}/{stats.total}</p>
            {stats.total > 0 ? (
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2 flex">
                {stats.todo > 0 && <div className="h-full bg-slate-300" style={{ width: `${(stats.todo / stats.total) * 100}%` }} />}
                {stats.inProgress > 0 && <div className="h-full bg-indigo-500" style={{ width: `${(stats.inProgress / stats.total) * 100}%` }} />}
                {stats.review > 0 && <div className="h-full bg-amber-500" style={{ width: `${(stats.review / stats.total) * 100}%` }} />}
                {stats.done > 0 && <div className="h-full bg-emerald-500" style={{ width: `${(stats.done / stats.total) * 100}%` }} />}
              </div>
            ) : (
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2" />
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              {stats.progressPct}% complete{stats.inProgress > 0 ? ` · ${stats.inProgress} in progress` : ''}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Overdue Tasks</p>
            <p className={`text-xl font-extrabold mt-0.5 flex items-center gap-1.5 ${stats.overdue > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {stats.overdue > 0 && <AlertTriangle className="w-4 h-4" />}
              {stats.overdue}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Past due, not done</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Team</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-500" />
              {stats.team}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Assignees on this project</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Due In</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">
              {daysToDue === null ? '—' : daysToDue < 0 ? `${Math.abs(daysToDue)}d late` : `${daysToDue}d`}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{stats.totalHours}h logged total</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-1 p-1.5 border-b border-slate-200/80 overflow-x-auto">
            {TABS.map(tab => {
              const count = tab.id === 'tasks' ? project.tasks.length
                : tab.id === 'timeline' ? project.milestones.length
                : tab.id === 'notes' ? project.notes.length
                : tab.id === 'time' ? project.timeEntries.length
                : null;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {count !== null && (
                    <span className={`px-1.5 rounded text-[10px] ${isActive ? 'bg-white text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-4 sm:p-5">
            {activeTab === 'tasks' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">{project.tasks.length === 0 ? 'No tasks linked yet.' : `${project.tasks.length} task${project.tasks.length === 1 ? '' : 's'} linked`}</p>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddTask(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Task
                  </button>
                </div>

                {showQuickAddTask && (
                  <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Task title"
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && newTaskTitle.trim() && handleAddTask()}
                      className="flex-1 min-w-40 px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
                    />
                    <select
                      value={newTaskPriority}
                      onChange={e => setNewTaskPriority(e.target.value as typeof QUICK_TASK_PRIORITIES[number])}
                      className="px-2.5 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:border-indigo-400 focus:outline-none cursor-pointer"
                    >
                      {QUICK_TASK_PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                    </select>
                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={e => setNewTaskDueDate(e.target.value)}
                      className="px-2.5 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:border-indigo-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={addingTask || !newTaskTitle.trim()}
                      onClick={handleAddTask}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      {addingTask ? 'Adding…' : 'Add'}
                    </button>
                  </div>
                )}

                {project.tasks.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">Link existing tasks to this project from the Tasks page, or add one above.</p>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {TASK_COLUMNS.map(col => {
                    const colTasks = project.tasks.filter(t => t.status === col.id);
                    const isDragOver = dragOverColumnId === col.id;
                    return (
                      <div
                        key={col.id}
                        onDragOver={e => handleTaskDragOver(e, col.id)}
                        onDragLeave={() => setDragOverColumnId(null)}
                        onDrop={e => handleTaskDrop(e, col.id)}
                        className={`rounded-xl p-3 space-y-2 min-h-[8rem] transition-all duration-150 ${
                          isDragOver
                            ? 'bg-indigo-50/80 border-2 border-dashed border-indigo-400'
                            : 'bg-slate-50 border border-slate-200/60'
                        }`}
                      >
                        <div className="flex items-center justify-between px-1">
                          <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">{col.label}</h4>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600">{colTasks.length}</span>
                        </div>
                        <div className="space-y-2">
                          {colTasks.map(t => (
                            <div
                              key={t.id}
                              draggable
                              onDragStart={e => handleTaskDragStart(e, t.id)}
                              className={`bg-white rounded-lg border border-slate-200/80 p-2.5 space-y-1.5 cursor-grab active:cursor-grabbing transition-opacity ${
                                draggedTaskId === t.id ? 'opacity-40' : ''
                              }`}
                            >
                              <p className="text-xs font-semibold text-slate-900 leading-snug">{t.title}</p>
                              <div className="flex items-center justify-between gap-1">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold border ${priorityBadge(t.priority)}`}>
                                  {t.priority}
                                </span>
                                {t.dueDate && (
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(t.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                  </span>
                                )}
                              </div>
                              {t.assignedTo && <p className="text-[10px] text-slate-400 truncate">{t.assignedTo}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                )}
              </div>
            )}

            {activeTab === 'timeline' && (
              <ProjectTimeline
                project={{ id: project.id, startDate: project.startDate, dueDate: project.dueDate, tasks: project.tasks, milestones: project.milestones }}
                onRefresh={fetchProject}
              />
            )}

            {activeTab === 'notes' && <ProjectNotes projectId={project.id} notes={project.notes} onRefresh={fetchProject} />}

            {activeTab === 'time' && (
              project.timeEntries.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No time logged against this project yet.</p>
              ) : (
                <div className="space-y-2">
                  {project.timeEntries.map(te => (
                    <div key={te.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{te.employee.firstName} {te.employee.lastName}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(te.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          {te.notes ? ` · ${te.notes}` : ''}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-slate-900 shrink-0 flex items-center gap-1"><Clock3 className="w-3.5 h-3.5 text-indigo-500" /> {te.hoursLogged}h</span>
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
            startDate: project.startDate ? project.startDate.split('T')[0] : '',
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
        itemDetails="Linked tasks will keep their data but lose their project link."
      />
    </div>
  );
}
