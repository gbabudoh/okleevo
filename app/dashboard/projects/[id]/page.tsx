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
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-24 sm:pb-8">
      {/* ── Sticky Glass Top Bar & Header ── */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => router.push('/dashboard/projects')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              title="Back to Projects"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-500 border border-orange-200/60 dark:border-orange-900/40 flex items-center justify-center shrink-0">
              <FolderKanban className="w-5 h-5" />
            </div>

            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">{project.name}</h1>
                <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${projectStatusBadge(project.status)}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    project.status === 'ACTIVE' ? 'bg-emerald-500' : project.status === 'ON_HOLD' ? 'bg-amber-500' : project.status === 'COMPLETED' ? 'bg-indigo-500' : 'bg-slate-400'
                  }`} />
                  <span>{project.status.replace('_', ' ')}</span>
                </span>
              </div>
              {project.contact && (
                <p className="text-xs font-bold text-slate-400 truncate">Client: {project.contact.company || project.contact.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              title="Edit Project"
              onClick={() => setShowEditModal(true)}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              type="button"
              title={project.status === 'ARCHIVED' ? 'Unarchive' : 'Archive'}
              onClick={handleArchiveToggle}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer"
            >
              {project.status === 'ARCHIVED' ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            </button>
            <button
              type="button"
              title="Delete Project"
              onClick={() => setShowDeleteModal(true)}
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* ── Metadata Strip ── */}
        <div className="flex items-center flex-wrap gap-2.5 text-xs text-slate-500 font-medium">
          {project.startDate && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs font-mono font-bold text-slate-700 dark:text-slate-300">
              <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
              Started {new Date(project.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
          {project.dueDate && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border shadow-2xs font-mono font-extrabold ${
              isOverdue ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/40' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800'
            }`}>
              <CalendarClock className="w-3.5 h-3.5 text-orange-500" />
              {isOverdue ? 'Overdue: ' : 'Due '}{new Date(project.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
          {project.contact?.email && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs font-mono font-bold text-slate-700 dark:text-slate-300">
              <Mail className="w-3.5 h-3.5 text-orange-500" />
              {project.contact.email}
            </span>
          )}
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs font-mono font-bold text-slate-700 dark:text-slate-300">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 text-white font-extrabold text-[9px] flex items-center justify-center">
              {project.owner ? `${project.owner.firstName[0]}${project.owner.lastName[0]}` : 'U'}
            </div>
            <span>{project.owner ? `Owner: ${project.owner.firstName} ${project.owner.lastName}` : 'Unassigned'}</span>
          </span>
        </div>

        {/* ── High-Performance Telemetry Pods ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-orange-300 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Task Progress</p>
              <ListChecks className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white leading-none">{stats.done}/{stats.total}</p>
              {stats.total > 0 ? (
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3 flex">
                  {stats.todo > 0 && <div className="h-full bg-slate-300 dark:bg-slate-600" style={{ width: `${(stats.todo / stats.total) * 100}%` }} />}
                  {stats.inProgress > 0 && <div className="h-full bg-orange-500" style={{ width: `${(stats.inProgress / stats.total) * 100}%` }} />}
                  {stats.review > 0 && <div className="h-full bg-yellow-400" style={{ width: `${(stats.review / stats.total) * 100}%` }} />}
                  {stats.done > 0 && <div className="h-full bg-emerald-500" style={{ width: `${(stats.done / stats.total) * 100}%` }} />}
                </div>
              ) : (
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3" />
              )}
            </div>
            <p className="text-[11px] font-bold font-mono text-slate-400">
              {stats.progressPct}% complete{stats.inProgress > 0 ? ` · ${stats.inProgress} active` : ''}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-rose-300 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Overdue Tasks</p>
              <AlertTriangle className={`w-4 h-4 ${stats.overdue > 0 ? 'text-rose-500 animate-bounce' : 'text-slate-300'}`} />
            </div>
            <div>
              <p className={`text-3xl font-extrabold font-mono leading-none ${stats.overdue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                {stats.overdue}
              </p>
            </div>
            <p className="text-[11px] font-bold text-slate-400">Past due, not done</p>
          </div>

          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-indigo-300 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Team Assignees</p>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <p className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white leading-none">{stats.team}</p>
            </div>
            <p className="text-[11px] font-bold text-slate-400">Assignees on project</p>
          </div>

          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Due In</p>
              <Clock3 className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white leading-none">
                {daysToDue === null ? '—' : daysToDue < 0 ? `${Math.abs(daysToDue)}d late` : `${daysToDue}d`}
              </p>
            </div>
            <p className="text-[11px] font-bold font-mono text-slate-400">{stats.totalHours}h logged total</p>
          </div>
        </div>

        {/* ── Tabs Dock & Content Workspace ── */}
        <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          
          {/* Segmented Tab Switcher */}
          <div className="flex items-center gap-1.5 p-3 border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm shadow-orange-500/20'
                      : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {count !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-5 sm:p-7">
            {activeTab === 'tasks' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-400 font-mono">
                    {project.tasks.length === 0 ? 'No tasks linked yet.' : `${project.tasks.length} task${project.tasks.length === 1 ? '' : 's'} linked to project`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddTask(v => !v)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-extrabold rounded-2xl shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </button>
                </div>

                {/* Quick Add Task Dock */}
                {showQuickAddTask && (
                  <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Task title..."
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && newTaskTitle.trim() && handleAddTask()}
                      className="flex-1 min-w-48 px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/10 transition"
                    />
                    <select
                      value={newTaskPriority}
                      onChange={e => setNewTaskPriority(e.target.value as typeof QUICK_TASK_PRIORITIES[number])}
                      className="px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:border-orange-500 focus:outline-none cursor-pointer"
                    >
                      {QUICK_TASK_PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)} Priority</option>)}
                    </select>
                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={e => setNewTaskDueDate(e.target.value)}
                      className="px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:border-orange-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={addingTask || !newTaskTitle.trim()}
                      onClick={handleAddTask}
                      className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 text-white text-xs font-extrabold rounded-2xl shadow-xs transition-all cursor-pointer"
                    >
                      {addingTask ? 'Adding…' : 'Add Task'}
                    </button>
                  </div>
                )}

                {/* ── Drag & Drop Kanban Matrix ── */}
                {project.tasks.length === 0 ? (
                  <div className="py-12 px-4 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center gap-2">
                    <ListChecks className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-bold text-slate-400">Link existing tasks to this project or add one above.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {TASK_COLUMNS.map(col => {
                      const colTasks = project.tasks.filter(t => t.status === col.id);
                      const isDragOver = dragOverColumnId === col.id;
                      
                      const colDot = col.id === 'TODO' ? 'bg-slate-400'
                        : col.id === 'IN_PROGRESS' ? 'bg-orange-500'
                        : col.id === 'REVIEW' ? 'bg-yellow-400'
                        : 'bg-emerald-500';

                      const colDragStyle = !isDragOver
                        ? 'bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800'
                        : col.id === 'TODO'
                        ? 'bg-slate-100/90 dark:bg-slate-800/80 border-2 border-dashed border-slate-400 dark:border-slate-500 shadow-md shadow-slate-400/10 scale-[1.01]'
                        : col.id === 'IN_PROGRESS'
                        ? 'bg-orange-50/90 dark:bg-orange-950/50 border-2 border-dashed border-orange-500 shadow-md shadow-orange-500/15 scale-[1.01]'
                        : col.id === 'REVIEW'
                        ? 'bg-yellow-50/90 dark:bg-yellow-950/50 border-2 border-dashed border-yellow-400 dark:border-yellow-500 shadow-md shadow-yellow-400/20 scale-[1.01]'
                        : 'bg-emerald-50/90 dark:bg-emerald-950/50 border-2 border-dashed border-emerald-500 shadow-md shadow-emerald-500/15 scale-[1.01]';

                      const cardBorder = col.id === 'TODO'
                        ? 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                        : col.id === 'IN_PROGRESS'
                        ? 'border-orange-200 dark:border-orange-900/60 hover:border-orange-400'
                        : col.id === 'REVIEW'
                        ? 'border-yellow-300 dark:border-yellow-900/60 hover:border-yellow-400'
                        : 'border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-400';

                      return (
                        <div
                          key={col.id}
                          onDragOver={e => handleTaskDragOver(e, col.id)}
                          onDragLeave={() => setDragOverColumnId(null)}
                          onDrop={e => handleTaskDrop(e, col.id)}
                          className={`rounded-3xl p-4 space-y-3 min-h-[12rem] transition-all duration-200 flex flex-col justify-between ${colDragStyle}`}
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${colDot}`} />
                              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">{col.label}</h4>
                            </div>
                            <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {colTasks.length}
                            </span>
                          </div>

                          <div className="space-y-3 flex-1">
                            {colTasks.length === 0 ? (
                              <div className="py-6 px-3 text-center rounded-2xl border border-dashed border-slate-200/60 dark:border-slate-800/60">
                                <p className="text-[11px] font-medium text-slate-400">Empty stage</p>
                              </div>
                            ) : (
                              colTasks.map(t => (
                                <div
                                  key={t.id}
                                  draggable
                                  onDragStart={e => handleTaskDragStart(e, t.id)}
                                  className={`bg-white dark:bg-slate-950 rounded-2xl border ${cardBorder} p-4 space-y-2.5 cursor-grab active:cursor-grabbing hover:shadow-xs transition-all ${
                                    draggedTaskId === t.id ? 'opacity-40 scale-95' : ''
                                  }`}
                                >
                                  <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">{t.title}</p>
                                  <div className="flex items-center justify-between gap-1">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${priorityBadge(t.priority)}`}>
                                      {t.priority}
                                    </span>
                                    {t.dueDate && (
                                      <span className="text-[10px] font-mono font-bold text-slate-400">
                                        {new Date(t.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                      </span>
                                    )}
                                  </div>
                                  {t.assignedTo && <p className="text-[10px] font-bold text-slate-400 truncate">👤 {t.assignedTo}</p>}
                                </div>
                              ))
                            )}
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
                <div className="py-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center gap-2">
                  <Clock3 className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-bold text-slate-400">No time logged against this project yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {project.timeEntries.map(te => (
                    <div key={te.id} className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 hover:border-orange-300 transition-all">
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{te.employee.firstName} {te.employee.lastName}</p>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5 font-mono">
                          {new Date(te.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          {te.notes ? ` · ${te.notes}` : ''}
                        </p>
                      </div>
                      <span className="text-xs font-extrabold font-mono text-orange-600 dark:text-orange-400 shrink-0 flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/60 px-3 py-1 rounded-full border border-orange-200/60">
                        <Clock3 className="w-3.5 h-3.5 text-orange-500" /> {te.hoursLogged}h
                      </span>
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
