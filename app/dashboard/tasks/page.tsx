"use client";

import { useState, useMemo, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Plus, Search, Calendar, User, AlertCircle,
  Circle, Trash2, X, ListTodo,
  LayoutGrid, List, Target, Clock3, MoreHorizontal, CheckCircle2,
  TrendingUp, ArrowRight, Copy, Pencil, ArrowDownAZ, Loader2, ChevronDown,
  Kanban, Filter, AlertTriangle, Layers, MessageSquare, History, Video,
  GripVertical, Check, Zap, Sparkles, ChevronLeft, ChevronRight, BarChart2
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskComment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface ActivityItem {
  id: string;
  action: string;
  user: string;
  timestamp: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  assignedTo?: string;
  tags?: string[];
  subtasks: SubTask[];
  comments?: TaskComment[];
  activity?: ActivityItem[];
  createdAt: string;
  projectId?: string | null;
}

interface ProjectOption {
  id: string;
  name: string;
}

interface TeamMemberOption {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
}

const STATUS_COLS = [
  { id: 'todo'        as const, label: 'To Do',       icon: Circle,       dotColor: 'bg-slate-400',   accentBg: 'bg-slate-50 dark:bg-slate-800/40', badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
  { id: 'in_progress' as const, label: 'In Progress', icon: Clock3,       dotColor: 'bg-indigo-500',  accentBg: 'bg-indigo-50/40 dark:bg-indigo-950/20', badge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/50' },
  { id: 'review'      as const, label: 'Review',      icon: AlertCircle,  dotColor: 'bg-amber-500',   accentBg: 'bg-amber-50/40 dark:bg-amber-950/20', badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/50' },
  { id: 'done'        as const, label: 'Done',        icon: CheckCircle2, dotColor: 'bg-emerald-500', accentBg: 'bg-emerald-50/40 dark:bg-emerald-950/20', badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/50' },
] as const;

const priorityBadge = (p: Task['priority']) => {
  switch (p) {
    case 'urgent': return 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200/60 dark:border-red-900/50';
    case 'high':   return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/50';
    case 'medium': return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-900/50';
    default:       return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/50';
  }
};

const statusCfg = (s: Task['status']) => {
  switch (s) {
    case 'todo':        return { label: 'To Do',       color: 'text-slate-600 dark:text-slate-300',   bg: 'bg-slate-100 dark:bg-slate-800',   icon: Circle };
    case 'in_progress': return { label: 'In Progress', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/60', icon: Clock3 };
    case 'review':      return { label: 'Review',      color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-950/60', icon: AlertCircle };
    case 'done':        return { label: 'Done',        color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60', icon: CheckCircle2 };
  }
};

const calcProgress = (task: Task) => {
  if (!task.subtasks?.length) return task.status === 'done' ? 100 : 0;
  return Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100);
};

const initials = (name?: string) =>
  name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';

const getSLABadge = (dueDate: string, status: Task['status']) => {
  if (!dueDate || status === 'done') return null;
  const due = new Date(dueDate);
  const now = new Date();
  due.setHours(23, 59, 59, 999);
  now.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays);
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md border border-red-200/60 dark:border-red-900/50">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        Overdue {daysAgo}d
      </span>
    );
  } else if (diffDays === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-900/50">
        Due Today
      </span>
    );
  } else if (diffDays === 1) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-900/50">
        Due Tomorrow
      </span>
    );
  } else if (diffDays <= 3) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-900/50">
        Due in {diffDays}d
      </span>
    );
  }
  return null;
};

const inputCls = 'w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-sm font-medium bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white';
const labelCls = 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1';
const modalHeaderCls = 'px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50';

const ModalHandle = () => (
  <div className="flex justify-center pt-2 pb-0 sm:hidden shrink-0">
    <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
  </div>
);

const ModalFooter = ({ children }: { children: ReactNode }) => (
  <div className="shrink-0 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 px-6 pt-3.5 pb-8 sm:pb-5 flex flex-row gap-3 mb-1.5 sm:mb-0">
    {children}
  </div>
);

const CancelBtn = ({ onClick }: { onClick: () => void }) => (
  <button type="button" onClick={onClick}
    className="flex-1 py-2.5 px-4 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer">
    Cancel
  </button>
);

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks]               = useState<Task[]>([]);
  const [loading, setLoading]           = useState(true);
  const [viewMode, setViewMode]         = useState<'grid' | 'list' | 'calendar' | 'timeline'>('grid');

  // Filters State
  const [presetFilter, setPresetFilter] = useState<'all' | 'my_tasks' | 'overdue' | 'high_priority'>('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [searchTerm, setSearchTerm]     = useState('');

  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  // Inline Task Add input per column
  const [inlineInputMap, setInlineInputMap] = useState<Record<string, string>>({});

  // Modals & Task Detail State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isEditing, setIsEditing]       = useState(false);
  const [editData, setEditData]         = useState<Partial<Task>>({});
  const [pendingStatus, setPendingStatus] = useState<Task['status'] | null>(null);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [detailTab, setDetailTab]       = useState<'overview' | 'comments' | 'history'>('overview');

  const [newTask, setNewTask] = useState({
    title: '', description: '', priority: 'medium' as Task['priority'],
    dueDate: '', assignedTo: '', tags: '', projectId: '', status: 'todo' as Task['status']
  });
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberOption[]>([]);
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const currentTeamMember = teamMembers.find(m => m.userId === currentUserId);
  const currentUserName = currentTeamMember ? `${currentTeamMember.firstName} ${currentTeamMember.lastName}` : null;

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) setTasks(await res.json());
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]));

    fetch('/api/presence')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.presence || []);
        if (Array.isArray(list) && list.length > 0) setTeamMembers(list);
      })
      .catch(() => setTeamMembers([]));
  }, []);


  const handleCreateTask = async (customData?: Partial<Task>) => {
    const payload = customData || newTask;
    if (!payload.title || !payload.title.trim()) return;
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        setTasks(prev => [created, ...prev]);
        setShowAddModal(false);
        setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '', tags: '', projectId: '', status: 'todo' });
      }
    } catch { /* silent */ }
  };

  const handleInlineCreate = async (status: Task['status']) => {
    const title = inlineInputMap[status]?.trim();
    if (!title) return;
    setInlineInputMap(prev => ({ ...prev, [status]: '' }));
    await handleCreateTask({ title, status, priority: 'medium' });
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
        if (selectedTask?.id === taskId) setSelectedTask(updated);
      }
    } catch { /* silent */ }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        setShowDeleteModal(false);
        setDeletingTask(null);
      }
    } catch { /* silent */ }
  };

  const duplicateTask = async (task: Task) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, title: `${task.title} (Copy)` }),
      });
      if (res.ok) { const newTask = await res.json(); setTasks(prev => [newTask, ...prev]); }
    } catch { /* silent */ }
    setActiveDropdown(null);
  };

  // ── Drag & Drop Handlers ──
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (dragOverColumnId !== columnId) {
      setDragOverColumnId(columnId);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault();
    setDragOverColumnId(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedTaskId(null);
    if (!taskId) return;

    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== targetStatus) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: targetStatus } : t));
      await handleUpdateTask(taskId, { status: targetStatus });
    }
  };

  const sortColumn = (status: Task['status']) => {
    const order = { urgent: 0, high: 1, medium: 2, low: 3 };
    setTasks(prev => {
      const col = [...prev.filter(t => t.status === status)].sort((a, b) => order[a.priority] - order[b.priority]);
      return [...prev.filter(t => t.status !== status), ...col];
    });
    setActiveDropdown(null);
  };

  const clearCompleted = (status: Task['status']) => {
    setTasks(prev => prev.filter(t => !(t.status === status && calcProgress(t) === 100)));
    setActiveDropdown(null);
  };

  const startEditing = (task: Task) => { setEditData({ ...task }); setIsEditing(true); setActiveDropdown(null); };
  const saveEdit = () => {
    if (!selectedTask || !editData.title) return;
    handleUpdateTask(selectedTask.id, editData);
    setIsEditing(false);
  };

  const applyStatus = (taskId: string, status: Task['status']) => {
    handleUpdateTask(taskId, { status });
    setPendingStatus(null);
  };

  const addSubtask = () => {
    if (!newSubtaskText.trim() || !selectedTask) return;
    const newSubs = [...(selectedTask.subtasks || []), { id: Date.now().toString(), title: newSubtaskText.trim(), completed: false }];
    handleUpdateTask(selectedTask.id, { subtasks: newSubs });
    setNewSubtaskText('');
  };

  const addComment = () => {
    if (!newCommentText.trim() || !selectedTask) return;
    const commentObj: TaskComment = {
      id: Date.now().toString(),
      authorName: 'You',
      content: newCommentText.trim(),
      createdAt: new Date().toISOString()
    };
    const updatedComments = [...(selectedTask.comments || []), commentObj];
    handleUpdateTask(selectedTask.id, { comments: updatedComments });
    setNewCommentText('');
  };

  const launchHuddleForTask = (taskId: string) => {
    router.push(`/dashboard/collaboration?room=task_${taskId}`);
  };

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    urgentCount: tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length,
    totalSubtasks: tasks.reduce((a, t) => a + (t.subtasks?.length ?? 0), 0),
    completedSubtasks: tasks.reduce((a, t) => a + (t.subtasks?.filter(s => s.completed).length ?? 0), 0),
    assignees: Array.from(new Set(tasks.map(t => t.assignedTo).filter(Boolean))) as string[],
    progress: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0,
  }), [tasks]);

  const filtered = useMemo(() => tasks.filter(task => {
    const matchSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchPreset = true;
    if (presetFilter === 'my_tasks') matchPreset = !!currentUserName && task.assignedTo === currentUserName;
    if (presetFilter === 'high_priority') matchPreset = task.priority === 'urgent' || task.priority === 'high';
    if (presetFilter === 'overdue') {
      if (task.status === 'done' || !task.dueDate) matchPreset = false;
      else matchPreset = new Date(task.dueDate) < new Date();
    }

    return matchSearch && matchPreset &&
      (filterStatus   === 'all' || task.status   === filterStatus) &&
      (filterPriority === 'all' || task.priority === filterPriority) &&
      (filterAssignee === 'all' || task.assignedTo === filterAssignee);
  }), [tasks, searchTerm, presetFilter, filterStatus, filterPriority, filterAssignee, currentUserName]);

  // ── Calendar View Calculations ──
  // calendarCursor holds the year/month currently being viewed — previously
  // hardcoded to new Date(), so a task due in any month but the current one
  // was invisible in this view with no way to navigate to it.
  const [calendarCursor, setCalendarCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const calendarDays = useMemo(() => {
    const today = new Date();
    const { year, month } = calendarCursor;
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
      days.push({ day: d, dateStr, isToday });
    }
    return days;
  }, [calendarCursor]);
  const shiftCalendarMonth = (delta: number) => setCalendarCursor(prev => {
    const d = new Date(prev.year, prev.month + delta, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const goToCurrentCalendarMonth = () => {
    const now = new Date();
    setCalendarCursor({ year: now.getFullYear(), month: now.getMonth() });
  };

  // ── Timeline Roadmap 14-Day Window ──
  // timelineOffsetDays shifts the window's start date — previously hardcoded
  // to today-3, so a task due more than ~10 days out never appeared here.
  const [timelineOffsetDays, setTimelineOffsetDays] = useState(0);
  const timelineDays = useMemo(() => {
    const days = [];
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 3 + timelineOffsetDays);

    for (let i = 0; i < 14; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      const dateStr = current.toISOString().split('T')[0];
      const dayName = current.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = current.getDate();
      const isToday = current.toDateString() === today.toDateString();
      days.push({ dateStr, dayName, dayNum, isToday });
    }
    return days;
  }, [timelineOffsetDays]);

  return (
    <div className="min-h-screen space-y-6 pb-24 sm:pb-12 text-slate-900 dark:text-slate-100">

      {/* Mobile FAB */}
      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        className="sm:hidden fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-95 transition-transform cursor-pointer"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* ── Enterprise Workspace Header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-50/70 via-white to-amber-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-850 border border-orange-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-orange-500 text-white rounded-2xl shrink-0 shadow-md">
              <Kanban className="w-7 h-7 stroke-[1.75]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Tasks & Workflow Board
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/80">
                  <Zap className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                  Multi-View Roadmap Active
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl font-normal leading-relaxed">
                Track deliverables across Kanban lanes, Data Grid, Month Calendar, and Timeline Gantt Roadmap.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Progress pill */}
            <div className="hidden md:flex items-center gap-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 gap-4">
                  <span>Sprint Completion</span>
                  <span className="text-orange-600 dark:text-orange-400 font-mono font-extrabold">{stats.progress}%</span>
                </div>
                <div className="w-32 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all" style={{ width: `${stats.progress}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Deliverables', value: stats.total, icon: ListTodo, bg: 'bg-orange-50 dark:bg-orange-950/60', ic: 'text-orange-600 dark:text-orange-400', val: 'text-slate-900 dark:text-white' },
          { label: 'Completed Tasks', value: stats.completed, icon: CheckCircle2, bg: 'bg-emerald-50 dark:bg-emerald-950/60', ic: 'text-emerald-600 dark:text-emerald-400', val: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'High Priority', value: stats.urgentCount, icon: AlertTriangle, bg: 'bg-amber-50 dark:bg-amber-950/60', ic: 'text-amber-600 dark:text-amber-400', val: 'text-amber-600 dark:text-amber-400' },
          { label: 'Subtasks Done', value: `${stats.completedSubtasks}/${stats.totalSubtasks}`, icon: Target, bg: 'bg-violet-50 dark:bg-violet-950/60', ic: 'text-violet-600 dark:text-violet-400', val: 'text-slate-900 dark:text-white' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-orange-300 dark:hover:border-orange-900/50 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</span>
              <div className={`p-2.5 rounded-xl ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.ic}`} />
              </div>
            </div>
            <p className={`text-3xl font-extrabold font-mono ${s.val}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Control & Filter Toolbar ── */}
      <div className="space-y-3">
        {/* Preset Filter Chips */}
        <div className="w-full overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 min-w-full sm:min-w-0">
            {[
              { id: 'all', label: 'All Tasks' },
              { id: 'my_tasks', label: 'Assigned to Me' },
              { id: 'overdue', label: 'Overdue & Urgents' },
              { id: 'high_priority', label: 'High Priority' },
            ].map(chip => (
              <button
                key={chip.id}
                onClick={() => setPresetFilter(chip.id as typeof presetFilter)}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer text-center ${
                  presetFilter === chip.id
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-2xs font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search & View Switcher Toolbar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks, descriptions..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-16 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-medium outline-none border border-slate-200/80 dark:border-slate-700/80 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-900 dark:text-white"
            />
            <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
              Ctrl K
            </kbd>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none border border-slate-200/80 dark:border-slate-700/80 cursor-pointer focus:border-orange-500 transition-all"
              >
                <option value="all">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none border border-slate-200/80 dark:border-slate-700/80 cursor-pointer focus:border-orange-500 transition-all"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {stats.assignees.length > 0 && (
              <div className="relative">
                <select
                  value={filterAssignee}
                  onChange={e => setFilterAssignee(e.target.value)}
                  className="appearance-none pl-3.5 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none border border-slate-200/80 dark:border-slate-700/80 cursor-pointer focus:border-orange-500 transition-all"
                >
                  <option value="all">All Assignees</option>
                  {stats.assignees.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            )}

            {/* 4-Way View Controller Bar */}
            <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl ml-auto border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 shadow-xs text-orange-600 dark:text-orange-400 font-bold'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="Kanban Board View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 shadow-xs text-orange-600 dark:text-orange-400 font-bold'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="List Table View"
              >
                <List className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-white dark:bg-slate-900 shadow-xs text-orange-600 dark:text-orange-400 font-bold'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="Month Calendar View"
              >
                <Calendar className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'timeline'
                    ? 'bg-white dark:bg-slate-900 shadow-xs text-orange-600 dark:text-orange-400 font-bold'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="Timeline Gantt Roadmap View"
              >
                <BarChart2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Syncing board tasks...</p>
        </div>
      )}

      {/* ── 1. Grid / Kanban Board View ── */}
      {!loading && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          {STATUS_COLS.map(col => {
            const colTasks = filtered.filter(t => t.status === col.id);
            const ColIcon = col.icon;
            const isDragOver = dragOverColumnId === col.id;

            return (
              <div
                key={col.id}
                onDragOver={e => handleDragOver(e, col.id)}
                onDragLeave={() => setDragOverColumnId(null)}
                onDrop={e => handleDrop(e, col.id)}
                className={`rounded-3xl p-4.5 min-h-[600px] flex flex-col justify-between transition-all duration-200 shadow-xs ${
                  isDragOver
                    ? 'bg-orange-50/80 dark:bg-orange-950/40 border-2 border-dashed border-orange-400 dark:border-orange-600 scale-[1.01]'
                    : 'bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80'
                }`}
              >
                <div>
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                      <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-200 tracking-tight uppercase">
                        {col.label}
                      </h3>
                      <span className={`text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full border ${col.badge}`}>
                        {colTasks.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => { setShowAddModal(true); setNewTask(prev => ({ ...prev, status: col.id, priority: 'medium' })); }}
                        className="p-1 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
                        title="Add Task to column"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setActiveDropdown(activeDropdown === `col-${col.id}` ? null : `col-${col.id}`); }}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {activeDropdown === `col-${col.id}` && (
                          <div
                            className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 overflow-hidden"
                            onMouseLeave={() => setActiveDropdown(null)}
                          >
                            <div className="p-1 space-y-0.5">
                              <button
                                type="button"
                                onClick={() => { setShowAddModal(true); setNewTask(prev => ({ ...prev, status: col.id })); setActiveDropdown(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left"
                              >
                                <Plus className="w-3.5 h-3.5 text-indigo-500" /> Add Task
                              </button>
                              <button
                                type="button"
                                onClick={() => sortColumn(col.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left"
                              >
                                <ArrowDownAZ className="w-3.5 h-3.5 text-slate-400" /> Sort by Priority
                              </button>
                              <button
                                type="button"
                                onClick={() => clearCompleted(col.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-slate-400" /> Clear Completed
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Task Cards Stack */}
                  <div className="space-y-3">
                    {colTasks.map(task => {
                      const isDragging = draggedTaskId === task.id;
                      const progress = calcProgress(task);
                      const slaBadge = getSLABadge(task.dueDate, task.status);

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={e => handleDragStart(e, task.id)}
                          onClick={() => { setSelectedTask(task); setShowDetailModal(true); }}
                          className={`group bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-2xs hover:shadow-md hover:border-orange-400/80 transition-all duration-200 cursor-pointer relative space-y-3 ${
                            isDragging ? 'opacity-40 scale-95' : ''
                          }`}
                        >
                          {/* Top Row: Tags & Menu */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${priorityBadge(task.priority)}`}>
                                {task.priority}
                              </span>
                              {slaBadge}
                            </div>

                            <div className="flex items-center gap-1">
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={e => { e.stopPropagation(); setActiveDropdown(activeDropdown === `task-${task.id}` ? null : `task-${task.id}`); }}
                                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5" />
                                </button>

                                {activeDropdown === `task-${task.id}` && (
                                  <div
                                    className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 overflow-hidden"
                                    onMouseLeave={() => setActiveDropdown(null)}
                                  >
                                    <div className="p-1 space-y-0.5">
                                      <button
                                        type="button"
                                        onClick={e => { e.stopPropagation(); launchHuddleForTask(task.id); setActiveDropdown(null); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-lg text-left"
                                      >
                                        <Video className="w-3.5 h-3.5" /> Start Huddle
                                      </button>
                                      <button
                                        type="button"
                                        onClick={e => { e.stopPropagation(); duplicateTask(task); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left"
                                      >
                                        <Copy className="w-3.5 h-3.5 text-slate-400" /> Duplicate
                                      </button>
                                      <button
                                        type="button"
                                        onClick={e => { e.stopPropagation(); setDeletingTask(task); setShowDeleteModal(true); setActiveDropdown(null); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg text-left"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Title & Description */}
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed font-normal">
                                {task.description}
                              </p>
                            )}
                          </div>

                          {/* Subtask Progress */}
                          {(task.subtasks?.length > 0 || task.status === 'done') && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                                <span>Progress</span>
                                <span className="text-orange-600 dark:text-orange-400 font-mono font-bold">{progress}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${progress === 100 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Footer: Date & Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                              <Calendar className="w-3.5 h-3.5" />
                              {task.dueDate || 'No due date'}
                            </span>

                            <div className="flex items-center gap-2">
                              {task.assignedTo && (
                                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                  {initials(task.assignedTo)}
                                </div>
                              )}

                              {/* Column move quick buttons */}
                              <div className="flex items-center gap-0.5 border-l border-slate-200 dark:border-slate-800 pl-1.5">
                                {col.id !== 'todo' && (
                                  <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); const s = STATUS_COLS; applyStatus(task.id, s[s.findIndex(x => x.id === task.status) - 1].id); }}
                                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-md transition-all cursor-pointer"
                                    title="Move back"
                                  >
                                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                                  </button>
                                )}
                                {col.id !== 'done' && (
                                  <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); const s = STATUS_COLS; applyStatus(task.id, s[s.findIndex(x => x.id === task.status) + 1].id); }}
                                    className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-md transition-all cursor-pointer"
                                    title="Move forward"
                                  >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {colTasks.length === 0 && (
                      <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/20">
                        <p className="text-xs text-slate-400 font-medium">No tasks in {col.label}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Fast Inline Add Box */}
                <div className="pt-3">
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-2xs">
                    <input
                      type="text"
                      placeholder={`+ Fast add to ${col.label}...`}
                      value={inlineInputMap[col.id] || ''}
                      onChange={e => setInlineInputMap(prev => ({ ...prev, [col.id]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') handleInlineCreate(col.id); }}
                      className="flex-1 bg-transparent px-2 text-xs font-medium outline-none text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleInlineCreate(col.id)}
                      disabled={!inlineInputMap[col.id]?.trim()}
                      className="p-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white rounded-lg transition-all cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 2. List View Table & Mobile Task Cards ── */}
      {!loading && viewMode === 'list' && (
        <div className="space-y-4">
          {/* Mobile Task Cards View (< sm) */}
          <div className="sm:hidden space-y-3">
            {filtered.length === 0 ? (
              <div className="p-10 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
                <ListTodo className="w-8 h-8 mx-auto stroke-[1.5] mb-2 text-slate-300" />
                <p className="text-xs font-semibold">No tasks matching filters.</p>
              </div>
            ) : (
              filtered.map(task => {
                const sc = statusCfg(task.status);
                const StatusIcon = sc.icon;
                return (
                  <div
                    key={task.id}
                    onClick={() => { setSelectedTask(task); setShowDetailModal(true); }}
                    className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3 cursor-pointer hover:border-orange-400/80 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
                        {task.title}
                      </h4>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full shrink-0 ${sc.bg} ${sc.color}`}>
                        <StatusIcon className="w-3 h-3" /> {sc.label}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{task.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono font-extrabold text-slate-400">
                      <span className={`px-2 py-0.5 rounded-full border ${priorityBadge(task.priority)}`}>{task.priority}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {task.dueDate || 'No due date'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View (>= sm) */}
          <div className="hidden sm:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                <ListTodo className="w-10 h-10 mx-auto stroke-[1.5] mb-2 text-slate-300" />
                <p className="text-sm font-semibold">No tasks matching your filter parameters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-left">
                      <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Task Title</th>
                      <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                      <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assignee</th>
                      <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Due Date</th>
                      <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Progress</th>
                      <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filtered.map(task => {
                      const sc = statusCfg(task.status);
                      const StatusIcon = sc.icon;
                      const progress = calcProgress(task);

                      return (
                        <tr
                          key={task.id}
                          onClick={() => { setSelectedTask(task); setShowDetailModal(true); }}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                        >
                          <td className="px-5 py-4">
                            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-slate-400 truncate max-w-xs mt-0.5">{task.description}</p>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${sc.bg} ${sc.color}`}>
                              <StatusIcon className="w-3 h-3" /> {sc.label}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${priorityBadge(task.priority)}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {task.assignedTo ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                  {initials(task.assignedTo)}
                                </div>
                                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{task.assignedTo}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300">
                              {task.dueDate || 'Unscheduled'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                              {progress}%
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); launchHuddleForTask(task.id); }}
                                className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-lg transition-all cursor-pointer"
                                title="Start Huddle"
                              >
                                <Video className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); setDeletingTask(task); setShowDeleteModal(true); }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 3. Month Calendar View ── */}
      {!loading && viewMode === 'calendar' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                {new Date(calendarCursor.year, calendarCursor.month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline text-xs font-semibold text-slate-400 mr-2">Click any day to schedule a task</span>
              <button type="button" onClick={() => shiftCalendarMonth(-1)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </button>
              <button type="button" onClick={goToCurrentCalendarMonth}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                Today
              </button>
              <button type="button" onClick={() => shiftCalendarMonth(1)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Calendar Header Row */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Calendar Month Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="h-20 sm:h-28 bg-slate-50/40 dark:bg-slate-900/20 rounded-2xl" />;
              }

              const dayTasks = filtered.filter(t => t.dueDate === cell.dateStr);

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => {
                    setNewTask(prev => ({ ...prev, dueDate: cell.dateStr }));
                    setShowAddModal(true);
                  }}
                  className={`h-20 sm:h-28 p-1.5 sm:p-2 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer group ${
                    cell.isToday
                      ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-800'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 hover:border-orange-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] sm:text-xs font-extrabold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 ${
                      cell.isToday ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-2xs' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {cell.day}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="hidden sm:inline text-[10px] font-mono font-extrabold text-slate-400">
                        {dayTasks.length}
                      </span>
                    )}
                    {dayTasks.length > 0 && (
                      <span className="sm:hidden w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                    )}
                  </div>

                  {/* Task Pills (Desktop text, mobile dot) */}
                  <div className="hidden sm:block space-y-1 overflow-y-auto max-h-16 custom-scrollbar">
                    {dayTasks.map(t => (
                      <div
                        key={t.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedTask(t); setShowDetailModal(true); }}
                        className="px-1.5 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-800 dark:text-slate-200 truncate hover:border-orange-400 flex items-center gap-1 shadow-2xs"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg(t.status).color.replace('text', 'bg')}`} />
                        <span className="truncate">{t.title}</span>
                      </div>
                    ))}
                  </div>

                  {/* Mobile Task Indicator bar */}
                  {dayTasks.length > 0 && (
                    <div className="sm:hidden flex items-center justify-center gap-0.5 pt-1">
                      {dayTasks.slice(0, 3).map(t => (
                        <span key={t.id} className={`w-1 h-1 rounded-full ${statusCfg(t.status).color.replace('text', 'bg')}`} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 4. Timeline Gantt Roadmap View ── */}
      {!loading && viewMode === 'timeline' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-orange-500" />
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Sprint Deliverables Roadmap Timeline
                </h2>
              </div>
              <span className="sm:hidden text-[10px] font-mono font-extrabold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-2.5 py-1 rounded-full border border-orange-200/80 shrink-0">
                Swipe Timeline →
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              <span className="hidden sm:inline text-xs font-semibold text-slate-400 mr-2">14-Day Rolling Execution View</span>
              <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                <button type="button" onClick={() => setTimelineOffsetDays(d => d - 7)}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  <ChevronLeft className="w-4 h-4 text-slate-500" />
                </button>
                <button type="button" onClick={() => setTimelineOffsetDays(0)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  Today
                </button>
                <button type="button" onClick={() => setTimelineOffsetDays(d => d + 7)}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Unified Timeline Matrix with Date Header on ALL screens */}
          <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="min-w-[680px] sm:min-w-[850px] space-y-3">
              {/* Timeline Day Header Columns */}
              <div className="grid grid-cols-[160px_repeat(14,minmax(0,1fr))] sm:grid-cols-[224px_repeat(14,minmax(0,1fr))] gap-1 text-center border-b border-slate-100 dark:border-slate-800 pb-2.5 items-center">
                <div className="text-left text-[11px] font-extrabold text-slate-400 uppercase tracking-wider pl-2">
                  Deliverable
                </div>
                {timelineDays.map(d => (
                  <div
                    key={d.dateStr}
                    className={`py-1.5 rounded-xl text-xs transition-all ${
                      d.isToday
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-extrabold shadow-2xs'
                        : 'bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold'
                    }`}
                  >
                    <p className="text-[9px] sm:text-[10px] uppercase font-mono">{d.dayName}</p>
                    <p className="text-xs font-extrabold">{d.dayNum}</p>
                  </div>
                ))}
              </div>

              {/* Timeline Task Bars Stack */}
              {filtered.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <p className="text-xs font-semibold">No tasks available for timeline mapping.</p>
                </div>
              ) : (
                filtered.map(t => {
                  const sc = statusCfg(t.status);
                  const progress = calcProgress(t);

                  return (
                    <div
                      key={t.id}
                      onClick={() => { setSelectedTask(t); setShowDetailModal(true); }}
                      className="group bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-2.5 flex items-center justify-between gap-3 cursor-pointer hover:border-orange-400/80 transition-all"
                    >
                      <div className="w-40 sm:w-56 shrink-0 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${sc.color.replace('text', 'bg')}`} />
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-orange-600 transition-colors">
                            {t.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-mono">Due: {t.dueDate || 'Unscheduled'}</span>
                        </div>
                      </div>

                      {/* Timeline Bar Span */}
                      <div className="flex-1 relative h-6 bg-slate-200/60 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center px-2">
                        <div
                          className={`h-4.5 rounded-lg transition-all flex items-center justify-between px-2 text-[10px] font-mono font-extrabold text-white shadow-2xs ${
                            t.status === 'done' ? 'bg-emerald-500' : 'bg-gradient-to-r from-orange-500 to-amber-600'
                          }`}
                          style={{ width: `${Math.max(progress, 35)}%` }}
                        >
                          <span className="truncate mr-1">{t.priority.toUpperCase()}</span>
                          <span>{progress}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Add Task Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 w-full sm:max-w-lg flex flex-col overflow-hidden max-h-[92dvh] sm:max-h-[92vh] -translate-y-6 sm:translate-y-0 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 transform animate-in slide-in-from-bottom-10 duration-300">
            <ModalHandle />
            <div className={modalHeaderCls}>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Create New Task</h2>
                <p className="text-xs text-slate-500">Add deliverables to your project board</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
              <div>
                <label className={labelCls}>Task Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. Design enterprise navigation framework"
                />
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  className={`${inputCls} h-20 resize-none`}
                  placeholder="Provide scope details, requirements, or links..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                    className={`${inputCls} cursor-pointer py-2 text-xs`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className={`${inputCls} py-2 text-xs`}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Assigned To</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    value={newTask.assignedTo}
                    onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className={`${inputCls} pl-10 pr-8 py-2.5 text-xs cursor-pointer appearance-none`}
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map(m => (
                      <option key={m.userId} value={`${m.firstName} ${m.lastName}`}>
                        {m.firstName} {m.lastName} ({m.role})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Linked Project</label>
                <div className="relative">
                  <select
                    value={newTask.projectId || ''}
                    onChange={e => setNewTask({ ...newTask, projectId: e.target.value })}
                    className={`${inputCls} pr-8 cursor-pointer py-2.5 text-xs appearance-none`}
                  >
                    <option value="">Independent Task (No linked project)</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <Target className="w-3 h-3 text-indigo-500 shrink-0" />
                  Links deliverable to milestone & syncs completion metrics to Projects Dashboard.
                </p>
              </div>

            </div>

            <ModalFooter>
              <CancelBtn onClick={() => setShowAddModal(false)} />
              <button
                type="button"
                onClick={() => handleCreateTask()}
                disabled={!newTask.title.trim()}
                className="flex-2 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4" /> Create Task
              </button>
            </ModalFooter>
          </div>
        </div>
      )}

      {/* ── Task Detail Modal ── */}
      {showDetailModal && selectedTask && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 w-full sm:max-w-2xl flex flex-col overflow-hidden max-h-[92dvh] sm:max-h-[92vh] -translate-y-4 sm:translate-y-0 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 transform animate-in slide-in-from-bottom-10 duration-300">
            <ModalHandle />

            {/* Detail Header */}
            <div className="shrink-0 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-5 sm:px-6 py-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.title}
                      onChange={e => setEditData({ ...editData, title: e.target.value })}
                      className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white w-full border-b-2 border-orange-500 outline-none pb-1 bg-transparent"
                    />
                  ) : (
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug tracking-tight">
                      {selectedTask.title}
                    </h2>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={saveEdit}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-extrabold rounded-xl hover:from-orange-600 hover:to-amber-700 transition-all cursor-pointer shadow-2xs"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEditing(selectedTask)}
                      className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      title="Edit deliverable"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { setShowDetailModal(false); setIsEditing(false); }}
                    className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tags & Action Bar Row */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${priorityBadge(selectedTask.priority)}`}>
                    {selectedTask.priority}
                  </span>
                  {selectedTask.assignedTo && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-semibold bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                      <User className="w-3.5 h-3.5 text-orange-500" /> {selectedTask.assignedTo}
                    </span>
                  )}
                  {selectedTask.dueDate && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono font-semibold bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-orange-500" /> {selectedTask.dueDate}
                    </span>
                  )}
                  {getSLABadge(selectedTask.dueDate, selectedTask.status)}
                </div>

                <button
                  type="button"
                  onClick={() => launchHuddleForTask(selectedTask.id)}
                  className="px-3 py-1.5 bg-orange-50 dark:bg-orange-950/60 hover:bg-orange-500 hover:text-white text-orange-600 dark:text-orange-400 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-orange-200/80 dark:border-orange-800 shadow-2xs shrink-0"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Discuss Huddle</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 px-3">
              <div className="inline-flex items-center gap-1 min-w-full sm:min-w-0">
                {[
                  { id: 'overview', label: 'Overview & Subtasks', icon: Target },
                  { id: 'comments', label: `Discussion (${selectedTask.comments?.length || 0})`, icon: MessageSquare },
                  { id: 'history', label: 'Activity Log', icon: History },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id as typeof detailTab)}
                    className={`flex-1 sm:flex-initial py-3 px-3.5 flex items-center justify-center gap-2 border-b-2 text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                      detailTab === tab.id
                        ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Detail Body Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
              {detailTab === 'overview' && (
                <>
                  {/* Description */}
                  <div>
                    <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Description</p>
                    {isEditing ? (
                      <textarea
                        value={editData.description}
                        onChange={e => setEditData({ ...editData, description: e.target.value })}
                        className={`${inputCls} h-24 resize-none text-xs`}
                      />
                    ) : (
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200/70 dark:border-slate-800">
                        {selectedTask.description || 'No description provided.'}
                      </p>
                    )}
                  </div>

                  {/* Assignee & Project Edit Controls */}
                  {isEditing && (
                    <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/70 dark:border-slate-800">
                      <div>
                        <label className={labelCls}>Assigned To</label>
                        <select
                          value={editData.assignedTo || ''}
                          onChange={e => setEditData({ ...editData, assignedTo: e.target.value })}
                          className={`${inputCls} py-2 text-xs cursor-pointer`}
                        >
                          <option value="">Unassigned</option>
                          {teamMembers.map(m => (
                            <option key={m.userId} value={`${m.firstName} ${m.lastName}`}>
                              {m.firstName} {m.lastName} ({m.role})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelCls}>Linked Project</label>
                        <select
                          value={editData.projectId || ''}
                          onChange={e => setEditData({ ...editData, projectId: e.target.value })}
                          className={`${inputCls} py-2 text-xs cursor-pointer`}
                        >
                          <option value="">No linked project</option>
                          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Status Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Status Lane</p>
                      {pendingStatus && pendingStatus !== selectedTask.status && (
                        <button
                          type="button"
                          onClick={() => applyStatus(selectedTask.id, pendingStatus)}
                          className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
                        >
                          Apply Status
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100/70 dark:bg-slate-900/60 p-2 rounded-2xl border border-slate-200/70 dark:border-slate-800">
                      {STATUS_COLS.map(col => {
                        const isActive = selectedTask.status === col.id;
                        const isPending = pendingStatus === col.id && !isActive;
                        const Icon = col.icon;
                        return (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => setPendingStatus(col.id)}
                            className={`flex flex-col items-center justify-center gap-1.5 p-2.5 min-h-[64px] rounded-xl border transition-all cursor-pointer ${
                              isActive  ? 'bg-white dark:bg-slate-800 border-orange-500 text-orange-600 dark:text-orange-400 shadow-2xs font-extrabold' :
                              isPending ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 border-dashed text-emerald-600 font-extrabold' :
                                          'bg-transparent border-transparent hover:bg-white/60 dark:hover:bg-slate-800/60 text-slate-500 font-bold'
                            }`}
                          >
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-orange-500' : isPending ? 'text-emerald-500' : 'text-slate-400'}`} />
                            <span className="text-[10px] uppercase font-mono font-extrabold tracking-tight text-center leading-none">
                              {col.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Subtasks */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Subtasks Checklist</p>
                      <span className="text-[11px] font-extrabold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-3 py-1 rounded-full border border-orange-200/80 dark:border-orange-900/60 font-mono">
                        {selectedTask.subtasks?.filter(s => s.completed).length || 0}/{selectedTask.subtasks?.length || 0} Completed
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {selectedTask.subtasks?.map(sub => (
                        <div
                          key={sub.id}
                          className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl px-4 py-3 hover:border-orange-300 dark:hover:border-orange-900/60 transition-all shadow-xs"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              const newSubs = selectedTask.subtasks.map(s => s.id === sub.id ? { ...s, completed: !s.completed } : s);
                              handleUpdateTask(selectedTask.id, { subtasks: newSubs });
                            }}
                            className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                              sub.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-orange-400'
                            }`}
                          >
                            {sub.completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </button>
                          <span className={`flex-1 text-xs font-semibold transition-all ${sub.completed ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                            {sub.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newSubs = selectedTask.subtasks.filter(s => s.id !== sub.id);
                              handleUpdateTask(selectedTask.id, { subtasks: newSubs });
                            }}
                            className="p-1 text-slate-300 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {/* Add subtask inline */}
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          value={newSubtaskText}
                          onChange={e => setNewSubtaskText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') addSubtask(); }}
                          placeholder="Add subtask item..."
                          className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={addSubtask}
                          disabled={!newSubtaskText.trim()}
                          className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {detailTab === 'comments' && (
                <div className="space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                    {(!selectedTask.comments || selectedTask.comments.length === 0) ? (
                      <div className="text-center py-10 text-slate-400">
                        <MessageSquare className="w-8 h-8 mx-auto stroke-[1.5] mb-2" />
                        <p className="text-xs font-semibold">No comments yet on this deliverable.</p>
                        <p className="text-[10px]">Start team discussion below.</p>
                      </div>
                    ) : (
                      selectedTask.comments.map(c => (
                        <div key={c.id} className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900 dark:text-white">{c.authorName}</span>
                            <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{c.content}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <input
                      type="text"
                      placeholder="Add a comment or update..."
                      value={newCommentText}
                      onChange={e => setNewCommentText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addComment(); }}
                      className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs outline-none focus:border-orange-500 text-slate-900 dark:text-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={addComment}
                      disabled={!newCommentText.trim()}
                      className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}

              {detailTab === 'history' && (
                <div className="space-y-3">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Activity Timeline</p>
                  <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-4 pl-4 py-2 text-xs">
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-orange-50 dark:ring-orange-950" />
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Created task deliverable</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{new Date(selectedTask.createdAt || Date.now()).toLocaleString()}</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-950" />
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Status synced to {statusCfg(selectedTask.status).label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Just now</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Detail Footer */}
            <ModalFooter>
              <button
                type="button"
                onClick={() => { setDeletingTask(selectedTask); setShowDeleteModal(true); setShowDetailModal(false); }}
                className="px-4 py-2.5 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer flex items-center justify-center shadow-xs"
                title="Delete deliverable"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => { handleUpdateTask(selectedTask.id, { status: 'done' }); setShowDetailModal(false); }}
                className="flex-1 py-3 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95"
              >
                <CheckCircle2 className="w-4.5 h-4.5" /> Mark as Done
              </button>
            </ModalFooter>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deletingTask && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeletingTask(null); }}
          onConfirm={() => handleDeleteTask(deletingTask.id)}
          title="Delete Task"
          itemName={deletingTask.title}
          itemDetails={`Assigned: ${deletingTask.assignedTo ?? 'Unassigned'} · Status: ${statusCfg(deletingTask.status).label}`}
          warningMessage="This task and all associated subtasks will be permanently removed."
        />
      )}
    </div>
  );
}

