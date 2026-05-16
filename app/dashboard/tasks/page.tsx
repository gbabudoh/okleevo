"use client";

import { useState, useMemo, useEffect, useCallback, type ReactNode } from 'react';
import {
  Plus, Search, Calendar, User, AlertCircle,
  Circle, Trash2, X, ListTodo,
  LayoutGrid, List, Target, Clock3, MoreHorizontal, CheckCircle2,
  TrendingUp, ArrowRight, Copy, Pencil, ArrowDownAZ, Loader2, ChevronDown
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
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
  createdAt: string;
}

const STATUS_COLS = [
  { id: 'todo'        as const, label: 'To Do',       icon: Circle },
  { id: 'in_progress' as const, label: 'In Progress', icon: Clock3 },
  { id: 'review'      as const, label: 'Review',      icon: AlertCircle },
  { id: 'done'        as const, label: 'Done',        icon: CheckCircle2 },
] as const;

const priorityBadge = (p: Task['priority']) => {
  switch (p) {
    case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
    case 'high':   return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
    default:       return 'bg-blue-100 text-blue-700 border-blue-200';
  }
};

const statusCfg = (s: Task['status']) => {
  switch (s) {
    case 'todo':        return { label: 'To Do',       color: 'text-slate-600',   bg: 'bg-slate-100',   icon: Circle };
    case 'in_progress': return { label: 'In Progress', color: 'text-blue-600',    bg: 'bg-blue-100',    icon: Clock3 };
    case 'review':      return { label: 'Review',      color: 'text-purple-600',  bg: 'bg-purple-100',  icon: AlertCircle };
    case 'done':        return { label: 'Done',        color: 'text-emerald-600', bg: 'bg-emerald-100', icon: CheckCircle2 };
  }
};

const calcProgress = (task: Task) => {
  if (!task.subtasks?.length) return task.status === 'done' ? 100 : 0;
  return Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100);
};

const initials = (name?: string) =>
  name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm font-medium bg-white';

const ModalHandle = () => (
  <div className="flex justify-center pt-2 pb-0 sm:hidden shrink-0">
    <div className="w-10 h-1 rounded-full bg-gray-300" />
  </div>
);

const ModalFooter = ({ children }: { children: ReactNode }) => (
  <div className="shrink-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 flex flex-row gap-2.5 pb-[calc(1.25rem+env(safe-area-inset-bottom,12px))] sm:pb-3">
    {children}
  </div>
);

const CancelBtn = ({ onClick }: { onClick: () => void }) => (
  <button type="button" onClick={onClick}
    className="flex-1 py-3 px-5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
    Cancel
  </button>
);

export default function TasksPage() {
  const [tasks, setTasks]               = useState<Task[]>([]);
  const [loading, setLoading]           = useState(true);
  const [viewMode, setViewMode]         = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [searchTerm, setSearchTerm]     = useState('');
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

  const [newTask, setNewTask] = useState({
    title: '', description: '', priority: 'medium' as Task['priority'],
    dueDate: '', assignedTo: '', tags: '',
  });

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) setTasks(await res.json());
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      if (res.ok) {
        const created = await res.json();
        setTasks(prev => [created, ...prev]);
        setShowAddModal(false);
        setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '', tags: '' });
      }
    } catch { /* silent */ }
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
    const newSubs = [...selectedTask.subtasks, { id: Date.now().toString(), title: newSubtaskText.trim(), completed: false }];
    handleUpdateTask(selectedTask.id, { subtasks: newSubs });
    setNewSubtaskText('');
  };

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    totalSubtasks: tasks.reduce((a, t) => a + (t.subtasks?.length ?? 0), 0),
    completedSubtasks: tasks.reduce((a, t) => a + (t.subtasks?.filter(s => s.completed).length ?? 0), 0),
    assignees: Array.from(new Set(tasks.map(t => t.assignedTo).filter(Boolean))) as string[],
    progress: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0,
  }), [tasks]);

  const filtered = useMemo(() => tasks.filter(task => {
    const matchSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch &&
      (filterStatus   === 'all' || task.status   === filterStatus) &&
      (filterPriority === 'all' || task.priority === filterPriority) &&
      (filterAssignee === 'all' || task.assignedTo === filterAssignee);
  }), [tasks, searchTerm, filterStatus, filterPriority, filterAssignee]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8">

      {/* Mobile FAB */}
      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        className="sm:hidden fixed bottom-24 right-6 w-14 h-14 bg-linear-to-r from-blue-600 to-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-95 transition-transform"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shrink-0">
            <ListTodo className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Tasks</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Manage tasks and track progress</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Progress pill */}
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
              <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${stats.progress}%` }} />
              </div>
              <span className="text-xs font-semibold text-gray-600">{stats.progress}%</span>
            </div>
            <button type="button" onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Task</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Tasks', value: stats.total,                                   icon: ListTodo,    bg: 'bg-blue-100',    ic: 'text-blue-600',    val: 'text-blue-700' },
            { label: 'Completed',   value: stats.completed,                                icon: CheckCircle2,bg: 'bg-emerald-100', ic: 'text-emerald-600', val: 'text-emerald-700' },
            { label: 'Subtasks',    value: `${stats.completedSubtasks}/${stats.totalSubtasks}`, icon: Target, bg: 'bg-purple-100',  ic: 'text-purple-600',  val: 'text-purple-700' },
            { label: 'Progress',    value: `${stats.progress}%`,                           icon: TrendingUp,  bg: 'bg-orange-100',  ic: 'text-orange-600',  val: 'text-orange-700' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className={`p-2 rounded-lg ${s.bg} w-fit mb-2`}>
                <s.icon className={`w-4 h-4 ${s.ic}`} />
              </div>
              <p className={`text-2xl font-bold ${s.val}`}>{s.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input type="text" placeholder="Search tasks…" value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none border border-gray-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: filterStatus,   onChange: setFilterStatus,   options: [['all','All Status'],['todo','To Do'],['in_progress','In Progress'],['review','Review'],['done','Done']] },
              { value: filterPriority, onChange: setFilterPriority, options: [['all','All Priority'],['urgent','Urgent'],['high','High'],['medium','Medium'],['low','Low']] },
            ].map((f, i) => (
              <div key={i} className="relative">
                <select value={f.value} onChange={e => f.onChange(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-2.5 bg-gray-50 rounded-xl text-xs font-medium outline-none border border-gray-100 cursor-pointer focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all">
                  {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            ))}
            {stats.assignees.length > 0 && (
              <div className="relative">
                <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-2.5 bg-gray-50 rounded-xl text-xs font-medium outline-none border border-gray-100 cursor-pointer focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all">
                  <option value="all">All Assignees</option>
                  {stats.assignees.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            )}
            <div className="flex bg-gray-100 p-1 rounded-xl ml-auto sm:ml-0">
              <button type="button" onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Loading tasks…</p>
          </div>
        )}

        {/* ── Grid View ── */}
        {!loading && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
            {STATUS_COLS.map(col => {
              const colTasks = filtered.filter(t => t.status === col.id);
              const ColIcon = col.icon;
              return (
                <div key={col.id} className="space-y-3">
                  {/* Column header */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                        <ColIcon className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      <span className="text-xs font-bold text-gray-700">{col.label}</span>
                      <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded-full">{colTasks.length}</span>
                    </div>
                    <div className="relative">
                      <button type="button"
                        onClick={e => { e.stopPropagation(); setActiveDropdown(activeDropdown === `col-${col.id}` ? null : `col-${col.id}`); }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all cursor-pointer">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {activeDropdown === `col-${col.id}` && (
                        <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-30 overflow-hidden"
                          onMouseLeave={() => setActiveDropdown(null)}>
                          <div className="p-1.5 space-y-0.5">
                            <button type="button" onClick={() => { setShowAddModal(true); setActiveDropdown(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-all text-left">
                              <Plus className="w-3.5 h-3.5" /> Add Task
                            </button>
                            <button type="button" onClick={() => sortColumn(col.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-all text-left">
                              <ArrowDownAZ className="w-3.5 h-3.5" /> Sort by Priority
                            </button>
                            <button type="button" onClick={() => clearCompleted(col.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all text-left">
                              <Trash2 className="w-3.5 h-3.5" /> Clear Completed
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Task cards */}
                  <div className="space-y-2.5 min-h-32">
                    {colTasks.map(task => {
                      const progress = calcProgress(task);
                      return (
                        <div key={task.id}
                          onClick={() => { setSelectedTask(task); setShowDetailModal(true); }}
                          onMouseLeave={() => activeDropdown === `card-${task.id}` && setActiveDropdown(null)}
                          className="bg-white border border-gray-100 shadow-sm rounded-2xl p-3.5 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group relative">
                          {/* Priority dot for urgent */}
                          {task.priority === 'urgent' && (
                            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          )}

                          <div className="space-y-3">
                            {/* Priority + menu */}
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${priorityBadge(task.priority)}`}>
                                {task.priority}
                              </span>
                              <div className="relative" onClick={e => e.stopPropagation()}>
                                <button type="button"
                                  onClick={e => { e.stopPropagation(); setActiveDropdown(activeDropdown === `card-${task.id}` ? null : `card-${task.id}`); }}
                                  className="p-1 text-gray-300 hover:text-gray-600 rounded-lg transition-all">
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                                {activeDropdown === `card-${task.id}` && (
                                  <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-30 overflow-hidden">
                                    <div className="p-1 space-y-0.5">
                                      <button type="button" onClick={e => { e.stopPropagation(); duplicateTask(task); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-indigo-600 rounded-lg transition-all text-left">
                                        <Copy className="w-3 h-3" /> Duplicate
                                      </button>
                                      <button type="button" onClick={e => { e.stopPropagation(); setDeletingTask(task); setShowDeleteModal(true); setActiveDropdown(null); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all text-left">
                                        <Trash2 className="w-3 h-3" /> Delete
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Title + description */}
                            <div>
                              <h4 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">{task.title}</h4>
                              {task.description && (
                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{task.description}</p>
                              )}
                            </div>

                            {/* Progress */}
                            {(task.subtasks?.length > 0 || task.status === 'done') && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                                  <span>Progress</span><span className="text-blue-600 font-semibold">{progress}%</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full transition-all ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                    style={{ width: `${progress}%` }} />
                                </div>
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                                <Calendar className="w-3 h-3" /> {task.dueDate || '—'}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {task.assignedTo && (
                                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[9px] font-bold text-blue-700">
                                    {initials(task.assignedTo)}
                                  </div>
                                )}
                                {/* Status step buttons */}
                                <div className="flex items-center gap-0.5 border-l border-gray-100 pl-1.5 ml-0.5">
                                  {col.id !== 'todo' && (
                                    <button type="button"
                                      onClick={e => { e.stopPropagation(); const s = STATUS_COLS; applyStatus(task.id, s[s.findIndex(x => x.id === task.status) - 1].id); }}
                                      className="p-1 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all cursor-pointer" title="Move back">
                                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                                    </button>
                                  )}
                                  {col.id !== 'done' && (
                                    <button type="button"
                                      onClick={e => { e.stopPropagation(); const s = STATUS_COLS; applyStatus(task.id, s[s.findIndex(x => x.id === task.status) + 1].id); }}
                                      className="p-1 text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all cursor-pointer" title="Move forward">
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add task placeholder */}
                    <button type="button" onClick={() => setShowAddModal(true)}
                      className="w-full py-5 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-gray-400 hover:border-blue-300 hover:bg-blue-50/30 hover:text-blue-600 transition-all text-xs font-medium cursor-pointer">
                      <Plus className="w-4 h-4" /> Add Task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── List View ── */}
        {!loading && viewMode === 'list' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm text-gray-400 font-medium">No tasks found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[640px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Task', 'Status', 'Priority', 'Assignee', 'Due Date', 'Progress', ''].map((h, i) => (
                        <th key={i} className={`px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wide ${i >= 5 ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map(task => {
                      const sc = statusCfg(task.status);
                      const StatusIcon = sc.icon;
                      const progress = calcProgress(task);
                      return (
                        <tr key={task.id}
                          onClick={() => { setSelectedTask(task); setShowDetailModal(true); }}
                          className="hover:bg-gray-50 transition-colors cursor-pointer group">
                          <td className="px-4 py-3.5">
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-gray-400 truncate max-w-48">{task.description}</p>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${sc.bg} ${sc.color}`}>
                              <StatusIcon className="w-3 h-3" /> {sc.label}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${priorityBadge(task.priority)}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            {task.assignedTo ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[9px] font-bold text-blue-700 shrink-0">
                                  {initials(task.assignedTo)}
                                </div>
                                <span className="text-xs text-gray-600 font-medium">{task.assignedTo}</span>
                              </div>
                            ) : <span className="text-gray-300 text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-xs text-gray-500 font-medium">{task.dueDate || '—'}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2 justify-end">
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }} />
                              </div>
                              <span className="text-xs text-gray-600 font-semibold w-8 text-right">{progress}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button type="button"
                              onClick={e => { e.stopPropagation(); setDeletingTask(task); setShowDeleteModal(true); }}
                              className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Add Task Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 sm:p-4 pb-20 sm:pb-4">
          <div className="bg-white w-full sm:max-w-lg flex flex-col overflow-hidden max-h-[60dvh] sm:max-h-[92vh] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-white/20 transform animate-in slide-in-from-bottom-10 duration-300">
            <ModalHandle />
            <div className="bg-linear-to-r from-blue-600 to-indigo-700 px-5 sm:px-6 py-2 sm:py-5 flex items-center justify-between shrink-0 shadow-lg">
              <h2 className="text-sm sm:text-lg font-bold text-white flex items-center gap-2 tracking-tight">
                <Plus className="w-4 h-4" /> New Task
              </h2>
              <button type="button" onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all cursor-pointer text-white">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 py-1 sm:py-5 space-y-1 sm:space-y-4">
              <div>
                <label className="block text-[9px] sm:text-xs font-bold text-gray-500 uppercase mb-0.5 sm:mb-1">Title *</label>
                <input type="text" value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  className={inputCls} placeholder="e.g. Design new landing page" />
              </div>
              <div>
                <label className="block text-[9px] sm:text-xs font-bold text-gray-500 uppercase mb-0.5 sm:mb-1">Description</label>
                <textarea value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  className={`${inputCls} h-12 sm:h-20 resize-none`} placeholder="What needs to be done?" />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-[9px] sm:text-xs font-bold text-gray-500 uppercase mb-0.5 sm:mb-1">Priority</label>
                  <select value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                    className={`${inputCls} appearance-none cursor-pointer py-2 text-xs`}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] sm:text-xs font-bold text-gray-500 uppercase mb-0.5 sm:mb-1">Due Date</label>
                  <input type="date" value={newTask.dueDate}
                    onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className={`${inputCls} py-2 text-xs`} />
                </div>
              </div>
              <div>
                <label className="block text-[9px] sm:text-xs font-bold text-gray-500 uppercase mb-0.5 sm:mb-1">Assigned To</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                  <input type="text" value={newTask.assignedTo}
                    onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className={`${inputCls} pl-9 py-2 text-xs`} placeholder="Assign to someone..." />
                </div>
              </div>
            </div>

            <ModalFooter>
              <CancelBtn onClick={() => setShowAddModal(false)} />
              <button type="button" onClick={handleCreateTask}
                disabled={!newTask.title.trim()}
                className="flex-2 py-3 px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Create Task
              </button>
            </ModalFooter>
          </div>
        </div>
      )}

      {/* ── Task Detail Modal ── */}
      {showDetailModal && selectedTask && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 sm:p-4 pb-20 sm:pb-4">
          <div className="bg-white w-full sm:max-w-2xl flex flex-col overflow-hidden max-h-[60dvh] sm:max-h-[92vh] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-white/20 transform animate-in slide-in-from-bottom-10 duration-300">
            <ModalHandle />

            {/* Detail header */}
            <div className="bg-linear-to-r from-blue-600 to-indigo-700 px-5 sm:px-6 py-2 sm:py-5 flex items-start justify-between gap-3 shrink-0 shadow-lg">
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input type="text" value={editData.title}
                    onChange={e => setEditData({ ...editData, title: e.target.value })}
                    className="text-sm sm:text-base font-bold text-white w-full border-b border-white/30 outline-none pb-1 bg-transparent" />
                ) : (
                  <h2 className="text-sm sm:text-base font-bold text-white leading-snug tracking-tight">{selectedTask.title}</h2>
                )}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-white/20 bg-white/10 text-white`}>
                    {selectedTask.priority}
                  </span>
                  {selectedTask.assignedTo && (
                    <span className="text-[10px] sm:text-xs text-blue-50 flex items-center gap-1">
                      <User className="w-3 h-3" /> {selectedTask.assignedTo}
                    </span>
                  )}
                  {selectedTask.dueDate && (
                    <span className="text-[10px] sm:text-xs text-blue-50 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {selectedTask.dueDate}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isEditing ? (
                  <button type="button" onClick={saveEdit}
                    className="px-3 py-1.5 bg-white text-blue-600 text-[10px] sm:text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer shadow-sm">
                    Save
                  </button>
                ) : (
                  <button type="button" onClick={() => startEditing(selectedTask)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-all cursor-pointer text-white">
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                <button type="button" onClick={() => { setShowDetailModal(false); setIsEditing(false); }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all cursor-pointer text-white">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Detail body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 py-1 sm:py-5 space-y-2 sm:space-y-5">

              {/* Description */}
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5 sm:mb-2">Description</p>
                {isEditing ? (
                  <textarea value={editData.description}
                    onChange={e => setEditData({ ...editData, description: e.target.value })}
                    className={`${inputCls} h-14 sm:h-20 resize-none`} />
                ) : (
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3 border border-gray-100">
                    {selectedTask.description || 'No description provided.'}
                  </p>
                )}
              </div>

              {/* Status selector */}
              <div>
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wide">Status</p>
                  {pendingStatus && pendingStatus !== selectedTask.status && (
                    <button type="button"
                      onClick={() => applyStatus(selectedTask.id, pendingStatus)}
                      className="px-2 sm:px-3 py-1 bg-emerald-600 text-white text-[10px] sm:text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer">
                      Apply
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {STATUS_COLS.map(col => {
                    const isActive = selectedTask.status === col.id;
                    const isPending = pendingStatus === col.id && !isActive;
                    const Icon = col.icon;
                    return (
                      <button key={col.id} type="button"
                        onClick={() => setPendingStatus(col.id)}
                        className={`flex flex-col items-center gap-1 p-1.5 sm:p-3 rounded-xl border-2 transition-all cursor-pointer ${
                          isActive  ? 'bg-blue-50 border-blue-500 shadow-sm' :
                          isPending ? 'bg-emerald-50 border-emerald-400 border-dashed' :
                                      'bg-white border-gray-100 hover:border-gray-300'
                        }`}>
                        <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-blue-600' : isPending ? 'text-emerald-600' : 'text-gray-400'}`} />
                        <span className={`text-[8px] sm:text-[10px] font-semibold leading-tight text-center ${isActive ? 'text-blue-700' : isPending ? 'text-emerald-700' : 'text-gray-500'}`}>
                          {col.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subtasks */}
              <div>
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wide">Subtasks</p>
                  <span className="text-[9px] sm:text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    {selectedTask.subtasks.filter(s => s.completed).length}/{selectedTask.subtasks.length}
                  </span>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  {selectedTask.subtasks.map(sub => (
                    <div key={sub.id}
                      className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-2 py-1.5 sm:px-3 sm:py-2.5 hover:border-blue-200 transition-colors">
                      <button type="button"
                        onClick={() => {
                          const newSubs = selectedTask.subtasks.map(s => s.id === sub.id ? { ...s, completed: !s.completed } : s);
                          handleUpdateTask(selectedTask.id, { subtasks: newSubs });
                        }}
                        className={`w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${sub.completed ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-300 hover:border-blue-400'}`}>
                        {sub.completed && <CheckCircle2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white" />}
                      </button>
                      <span className={`flex-1 text-[11px] sm:text-sm font-medium transition-all ${sub.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {sub.title}
                      </span>
                      <button type="button"
                        onClick={() => {
                          const newSubs = selectedTask.subtasks.filter(s => s.id !== sub.id);
                          handleUpdateTask(selectedTask.id, { subtasks: newSubs });
                        }}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors cursor-pointer shrink-0">
                        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add subtask inline */}
                  <div className="flex gap-1.5">
                    <input type="text" value={newSubtaskText}
                      onChange={e => setNewSubtaskText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addSubtask(); }}
                      placeholder="Add subtask…"
                      className="flex-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-[11px] sm:text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all" />
                    <button type="button" onClick={addSubtask} disabled={!newSubtaskText.trim()}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-[11px] sm:text-sm font-semibold transition-colors cursor-pointer">
                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail footer */}
            <ModalFooter>
              <button type="button"
                onClick={() => { setDeletingTask(selectedTask); setShowDeleteModal(true); setShowDetailModal(false); }}
                className="px-4 py-3 border border-red-200 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors cursor-pointer">
                <Trash2 className="w-4 h-4" />
              </button>
              <button type="button"
                onClick={() => { handleUpdateTask(selectedTask.id, { status: 'done' }); setShowDetailModal(false); }}
                className="flex-1 py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Mark as Done
              </button>
            </ModalFooter>
          </div>
        </div>
      )}

      {/* ── Delete ── */}
      {deletingTask && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeletingTask(null); }}
          onConfirm={() => handleDeleteTask(deletingTask.id)}
          title="Delete Task"
          itemName={deletingTask.title}
          itemDetails={`Assigned: ${deletingTask.assignedTo ?? '—'} · Status: ${statusCfg(deletingTask.status).label}`}
          warningMessage="This task and all its subtasks will be permanently removed."
        />
      )}
    </div>
  );
}
