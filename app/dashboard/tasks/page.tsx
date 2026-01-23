"use client";

import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Calendar, User, AlertCircle, 
  Circle, MoreVertical, Trash2, X, ListTodo, 
  LayoutGrid, List, Kanban, Target,
  ArrowUpRight, Clock3, MoreHorizontal, CheckCircle2,
  TrendingUp, LayoutPanelLeft, ArrowRight,
  Copy, Pencil, Eraser, ArrowDownAZ
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

// Mock ID generator moved outside the component to satisfy React purity rules
const generateId = () => Math.random().toString(36).substr(2, 9);

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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Review client proposal', description: 'Review and provide feedback on Q4 proposal', status: 'todo', priority: 'high', dueDate: '2024-12-10', assignedTo: 'John Smith', tags: ['Client', 'Urgent'], createdAt: '2024-12-01', subtasks: [{ id: 's1', title: 'Read proposal', completed: true }, { id: 's2', title: 'Write feedback', completed: false }] },
    { id: '2', title: 'Update website content', description: 'Update homepage and about page', status: 'in_progress', priority: 'medium', dueDate: '2024-12-12', assignedTo: 'Sarah Johnson', tags: ['Marketing'], createdAt: '2024-12-02', subtasks: [{ id: 's3', title: 'Edit homepage', completed: true }, { id: 's4', title: 'Update contact info', completed: true }, { id: 's5', title: 'Final review', completed: false }] },
    { id: '3', title: 'Send monthly invoices', description: 'Generate and send invoices to all clients', status: 'todo', priority: 'urgent', dueDate: '2024-12-08', assignedTo: 'Mike Brown', tags: ['Finance'], createdAt: '2024-12-03', subtasks: [] },
    { id: '4', title: 'Team meeting preparation', description: 'Prepare agenda and materials', status: 'done', priority: 'low', dueDate: '2024-12-05', assignedTo: 'Emma Wilson', tags: ['Team'], createdAt: '2024-11-28', subtasks: [{ id: 's6', title: 'Book room', completed: true }, { id: 's7', title: 'Send invites', completed: true }] },
    { id: '5', title: 'Update CRM database', description: 'Clean and update customer records', status: 'review', priority: 'medium', dueDate: '2024-12-15', assignedTo: 'David Lee', tags: ['Data'], createdAt: '2024-12-04', subtasks: [{ id: 's8', title: 'Export data', completed: true }, { id: 's9', title: 'Check duplicates', completed: false }] },
  ]);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editingData, setEditingData] = useState<Partial<Task>>({});
  const [pendingStatus, setPendingStatus] = useState<Task['status'] | null>(null);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    dueDate: '',
    assignedTo: '',
    tags: ''
  });

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'done').length,
      totalSubtasks: tasks.reduce((acc, t) => acc + t.subtasks.length, 0),
      completedSubtasks: tasks.reduce((acc, t) => acc + t.subtasks.filter(s => s.completed).length, 0),
      assignees: Array.from(new Set(tasks.map(t => t.assignedTo).filter(Boolean))) as string[],
      progress: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesAssignee = filterAssignee === 'all' || task.assignedTo === filterAssignee;
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchTerm, filterStatus, filterPriority, filterAssignee]);

  const getPriorityStyles = (priority: Task['priority']) => {
    switch(priority) {
      case 'urgent': return "bg-rose-50 text-rose-700 border-rose-100";
      case 'high': return "bg-orange-50 text-orange-700 border-orange-100";
      case 'medium': return "bg-amber-50 text-amber-700 border-amber-100";
      default: return "bg-blue-50 text-blue-700 border-blue-100";
    }
  };

  const getStatusConfig = (status: Task['status']) => {
    switch(status) {
      case 'todo': return { label: 'To Do', color: 'text-slate-600', bg: 'bg-slate-100', icon: Circle };
      case 'in_progress': return { label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-100', icon: Clock3 };
      case 'review': return { label: 'In Review', color: 'text-purple-600', bg: 'bg-purple-100', icon: AlertCircle };
      case 'done': return { label: 'Completed', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: CheckCircle2 };
    }
  };

  const calculateProgress = (task: Task) => {
    if (task.subtasks.length === 0) return task.status === 'done' ? 100 : 0;
    const completed = task.subtasks.filter(s => s.completed).length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    if (selectedTask?.id === taskId) {
      setSelectedTask({ ...selectedTask, status: newStatus });
      setPendingStatus(null);
    }
  };

  const duplicateTask = (task: Task) => {
    const newTask: Task = {
      ...JSON.parse(JSON.stringify(task)),
      id: generateId(),
      title: `${task.title} (Copy)`,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
    setActiveDropdown(null);
  };

  const sortTasksInColumn = (status: Task['status']) => {
    const priorityOrder = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 };
    const relevantTasks = tasks.filter(t => t.status === status);
    const otherTasks = tasks.filter(t => t.status !== status);
    const sorted = [...relevantTasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    setTasks([...otherTasks, ...sorted]);
    setActiveDropdown(null);
  };

  const clearCompletedInColumn = (status: Task['status']) => {
    setTasks(tasks.filter(t => !(t.status === status && calculateProgress(t) === 100)));
    setActiveDropdown(null);
  };

  const startEditing = (task: Task) => {
    setEditingData({ ...task });
    setIsEditingTask(true);
    setActiveDropdown(null);
  };

  const saveTaskEdit = () => {
    if (!selectedTask || !editingData.title) return;
    const updatedTasks = tasks.map(t => t.id === selectedTask.id ? { ...t, ...editingData } as Task : t);
    setTasks(updatedTasks);
    setSelectedTask({ ...selectedTask, ...editingData } as Task);
    setIsEditingTask(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 border-t border-slate-100/50 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-10 relative z-10">
        
        {/* Title Card - Restored & Refined */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/20">
          <div className="space-y-5 flex-1">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-blue-200">
                <Kanban className="w-7 h-7 text-white" />
              </div>
              <div className="space-y-0.5">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 flex items-center gap-4">
                  Mission Control
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-widest shadow-sm">Operational Hub</span>
                </h1>
                <p className="text-slate-500 font-bold text-lg md:text-xl max-w-2xl leading-relaxed italic">
                  Coordinate high-level workflows and monitor deployment lifecycle.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-10 max-w-2xl pt-2">
              <div className="flex-1 space-y-3">
                <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">
                  <span>Overall Mission Progress</span>
                  <span className="text-blue-600">{stats.progress}%</span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5 shadow-inner group relative">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.3)] relative"
                    style={{ width: `${stats.progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col border-l border-slate-100 pl-10">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Status</span>
                <span className="text-lg font-black text-emerald-600 uppercase tracking-tight flex items-center gap-2">
                  On Track <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="p-6 bg-white border border-slate-100 hover:border-blue-200 rounded-[2rem] transition-all shadow-sm group cursor-pointer hover:shadow-md">
              <LayoutPanelLeft className="w-8 h-8 text-slate-400 group-hover:text-slate-900" />
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-10 py-7 bg-slate-900 text-white rounded-[2rem] font-black flex items-center gap-4 shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95 cursor-pointer text-lg tracking-tight"
            >
              Launch Initiative <Plus className="w-6 h-6 stroke-[3px]" />
            </button>
          </div>
        </div>

        {/* Global Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { l: 'Total Nodes', v: stats.total, i: ListTodo, bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600' },
            { l: 'Completed Steps', v: stats.completedSubtasks + '/' + stats.totalSubtasks, i: Target, bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600' },
            { l: 'Timeline Health', v: '98%', i: TrendingUp, bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-600' },
            { l: 'Operational Rate', v: stats.progress + '%', i: CheckCircle2, bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600' }
          ].map((s, i) => (
            <div key={i} className="bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-lg shadow-slate-200/10 group flex items-center gap-6 hover:shadow-xl hover:border-blue-100 transition-all">
              <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center border ${s.border} group-hover:scale-110 transition-transform`}>
                <s.i className={`w-7 h-7 ${s.text}`} />
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 block tracking-tighter">{s.v}</span>
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">{s.l}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters & View Toggles */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-3 rounded-[2rem] border border-slate-200/60 shadow-md">
          <div className="flex flex-1 items-center gap-4 w-full">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Scan all initiatives..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border border-transparent focus:border-blue-200 focus:bg-white rounded-[1.25rem] outline-none font-bold transition-all text-sm tracking-tight" 
              />
            </div>
            <div className="h-10 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-5 py-3 bg-white border border-slate-200 rounded-[1.25rem] text-xs font-black text-slate-600 outline-none cursor-pointer hover:border-blue-300 transition-all uppercase tracking-widest"
              >
                <option value="all">Status: All</option>
                <option value="todo">Backlog</option>
                <option value="in_progress">Execution</option>
                <option value="review">Validation</option>
                <option value="done">Completed</option>
              </select>
              <select 
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-5 py-3 bg-white border border-slate-200 rounded-[1.25rem] text-xs font-black text-slate-600 outline-none cursor-pointer hover:border-blue-300 transition-all uppercase tracking-widest"
              >
                <option value="all">Priority: All</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select 
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="px-5 py-3 bg-white border border-slate-200 rounded-[1.25rem] text-xs font-black text-slate-600 outline-none cursor-pointer hover:border-blue-300 transition-all uppercase tracking-widest"
              >
                <option value="all">Personnel: All</option>
                {stats.assignees.map(a => (
                  <option key={a} value={a}>{a.split(' ').pop()}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-[1.25rem] border border-slate-200/50">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow-md text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white shadow-md text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 items-start">
            {statusColumns.map((col) => {
              const colTasks = filteredTasks.filter(t => t.status === col.id);
              const ColIcon = col.icon;
              return (
                <div key={col.id} className="space-y-6">
                  <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center`}>
                        <ColIcon className={`w-5 h-5 text-slate-600`} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">{col.label}</h3>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{colTasks.length} Units</span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === `col-${col.id}` ? null : `col-${col.id}`); }}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      
                      {activeDropdown === `col-${col.id}` && (
                        <div 
                          className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                          onMouseLeave={() => setActiveDropdown(null)}
                        >
                          <div className="p-2 space-y-1">
                            <button 
                              onClick={() => { setShowAddModal(true); setActiveDropdown(null); }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all uppercase tracking-widest"
                            >
                              <Plus className="w-4 h-4" /> Provision Node
                            </button>
                            <button 
                              onClick={() => clearCompletedInColumn(col.id)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-600 hover:bg-slate-50 hover:text-rose-600 rounded-xl transition-all uppercase tracking-widest"
                            >
                              <Eraser className="w-4 h-4" /> Clear Resolved
                            </button>
                            <div className="h-px bg-slate-100 mx-2" />
                            <button 
                              onClick={() => sortTasksInColumn(col.id)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-600 hover:bg-slate-50 rounded-xl transition-all uppercase tracking-widest"
                            >
                              <ArrowDownAZ className="w-4 h-4" /> Sort Priority
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6 min-h-[400px]">
                    {colTasks.map((task) => {
                      const progress = calculateProgress(task);
                      return (
                        <div 
                          key={task.id} 
                          onMouseLeave={() => activeDropdown === `grid-${task.id}` && setActiveDropdown(null)}
                          onClick={() => { setSelectedTask(task); setShowDetailModal(true); }}
                          className="group bg-white border border-slate-200 p-6 rounded-[2rem] shadow-md hover:shadow-2xl hover:border-blue-200 transition-all cursor-pointer relative"
                        >
                          <div className={`absolute top-6 right-6 w-2 h-2 rounded-full ${task.priority === 'urgent' ? 'bg-rose-500 animate-pulse' : 'bg-transparent'}`} />
                          
                          <div className="space-y-5">
                            <div className="flex justify-between items-start">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest ${getPriorityStyles(task.priority)}`}>
                                {task.priority} Tier
                              </span>
                              <div className="flex items-center gap-1">
                                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 shadow-inner">
                                  {task.assignedTo?.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="relative">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === `grid-${task.id}` ? null : `grid-${task.id}`); }}
                                    className="p-1 px-1.5 hover:bg-slate-50 rounded-lg text-slate-300 hover:text-slate-600 transition-all"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                  {activeDropdown === `grid-${task.id}` && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                      <div className="p-2 space-y-1">
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); duplicateTask(task); }}
                                          className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-black text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all uppercase tracking-widest border-none text-left"
                                        >
                                          <Copy className="w-3.5 h-3.5" /> Clone
                                        </button>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); setDeletingTask(task); setShowDeleteModal(true); setActiveDropdown(null); }}
                                          className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-black text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all uppercase tracking-widest border-none text-left"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" /> Archive
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors tracking-tight leading-none uppercase">{task.title}</h4>
                              <p className="text-sm font-bold text-slate-400 line-clamp-2 leading-relaxed italic border-l-2 border-slate-100 pl-3">&quot;{task.description}&quot;</p>
                            </div>

                            <div className="space-y-2.5">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest px-1">
                                <span className="text-slate-400">Node Completion</span>
                                <span className="text-blue-600">{progress}%</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.2)]'}`}
                                  style={{ width: `${progress}%` }} 
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-slate-400">
                              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                <Calendar className="w-3.5 h-3.5" />
                                {task.dueDate}
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 border-r border-slate-100 pr-3">
                                  {col.id !== 'todo' && (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const statuses: Task['status'][] = ['todo', 'in_progress', 'review', 'done'];
                                        updateTaskStatus(task.id, statuses[statuses.indexOf(task.status) - 1]);
                                      }}
                                      className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                      title="Revert Phase"
                                    >
                                      <ArrowRight className="w-4 h-4 rotate-180" />
                                    </button>
                                  )}
                                  {col.id !== 'done' && (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const statuses: Task['status'][] = ['todo', 'in_progress', 'review', 'done'];
                                        updateTaskStatus(task.id, statuses[statuses.indexOf(task.status) + 1]);
                                      }}
                                      className="p-1.5 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                                      title="Advance Phase"
                                    >
                                      <ArrowRight className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setDeletingTask(task); setShowDeleteModal(true); }}
                                  className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                                  title="Archive Initiative"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-blue-300 hover:bg-blue-50/20 hover:text-blue-600 transition-all font-black text-xs uppercase tracking-[0.2em] cursor-pointer group"
                    >
                      <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform group-hover:bg-blue-50">
                        <Plus className="w-6 h-6" />
                      </div>
                      Provision Initiative
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Initiative Title</th>
                    <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment stage</th>
                    <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Criticality</th>
                    <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personnel</th>
                    <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timeline</th>
                    <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Completion</th>
                    <th className="py-6 px-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTasks.map((task) => {
                    const status = getStatusConfig(task.status);
                    const progress = calculateProgress(task);
                    return (
                      <tr key={task.id} onClick={() => { setSelectedTask(task); setShowDetailModal(true); }} className="group hover:bg-blue-50/30 transition-all cursor-pointer">
                        <td className="py-6 px-8">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 group-hover:text-blue-600 transition-all uppercase tracking-tight">{task.title}</span>
                            <span className="text-xs text-slate-400 font-bold truncate max-w-[250px] italic">&quot;{task.description}&quot;</span>
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-current/20 ${status.bg} ${status.color}`}>
                            <status.icon className="w-3.5 h-3.5" />
                            {status.label}
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest ${getPriorityStyles(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-6 px-8">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 shadow-inner">
                              {task.assignedTo?.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-xs font-black text-slate-600">{task.assignedTo}</span>
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <span className="text-xs font-black text-slate-500 uppercase tracking-tight">{task.dueDate}</span>
                        </td>
                        <td className="py-6 px-8">
                          <div className="flex items-center gap-4">
                            <div className="flex-1 min-w-[120px] h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
                              <div className={`h-full rounded-full transition-all duration-1000 ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-xs font-black text-slate-700">{progress}%</span>
                          </div>
                        </td>
                        <td className="py-6 px-8 text-right relative">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === `task-${task.id}` ? null : `task-${task.id}`); }}
                            className="p-3 text-slate-300 hover:text-slate-600 rounded-2xl hover:bg-white hover:shadow-md transition-all cursor-pointer"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {activeDropdown === `task-${task.id}` && (
                            <div 
                              className="absolute right-8 top-16 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 text-left"
                              onMouseLeave={() => setActiveDropdown(null)}
                            >
                              <div className="p-2 space-y-1">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setSelectedTask(task); setShowDetailModal(true); setActiveDropdown(null); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all uppercase tracking-widest border-none text-left"
                                >
                                  <Pencil className="w-4 h-4" /> Edit Intel
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); duplicateTask(task); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all uppercase tracking-widest border-none text-left"
                                >
                                  <Copy className="w-4 h-4" /> Clone Node
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); sortTasksInColumn(task.status); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-600 hover:bg-slate-50 rounded-xl transition-all uppercase tracking-widest border-none text-left"
                                >
                                  <ArrowDownAZ className="w-4 h-4" /> Sort Column
                                </button>
                                <div className="h-px bg-slate-100 mx-2" />
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setDeletingTask(task); setShowDeleteModal(true); setActiveDropdown(null); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all uppercase tracking-widest border-none text-left"
                                >
                                  <Trash2 className="w-4 h-4" /> Decommission
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredTasks.length === 0 && (
                <div className="p-20 text-center space-y-3">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No operational nodes detected in current buffer.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {showDetailModal && selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] max-w-3xl w-full shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300 overflow-hidden border border-slate-200">
            <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white relative z-10">
              <div className="space-y-1 flex-1">
                {isEditingTask ? (
                  <input 
                    type="text" 
                    value={editingData.title}
                    onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                    className="text-3xl font-black text-slate-900 tracking-tighter uppercase w-full bg-slate-50 border-none outline-none focus:bg-white rounded-xl px-2"
                  />
                ) : (
                  <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{selectedTask.title}</h2>
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${getPriorityStyles(selectedTask.priority)}`}>
                      {selectedTask.priority} Tier
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {isEditingTask ? (
                    <>
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg">
                        <User className="w-3.5 h-3.5 text-blue-500" />
                        <input 
                          value={editingData.assignedTo}
                          onChange={(e) => setEditingData({ ...editingData, assignedTo: e.target.value })}
                          className="bg-transparent border-none outline-none font-black w-32"
                        />
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <input 
                          type="date"
                          value={editingData.dueDate}
                          onChange={(e) => setEditingData({ ...editingData, dueDate: e.target.value })}
                          className="bg-transparent border-none outline-none font-black"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg"><User className="w-3.5 h-3.5 text-blue-500" /> Assigned: {selectedTask.assignedTo}</span>
                      <span className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg"><Calendar className="w-3.5 h-3.5 text-blue-500" /> Target: {selectedTask.dueDate}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isEditingTask ? (
                  <button 
                    onClick={saveTaskEdit}
                    className="px-6 py-3 bg-blue-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                ) : (
                  <button 
                    onClick={() => startEditing(selectedTask)}
                    className="p-3 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-[1.5rem] transition-all cursor-pointer"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                )}
                <button 
                  onClick={() => { setShowDetailModal(false); setIsEditingTask(false); }}
                  className="p-3 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-[1.5rem] transition-all cursor-pointer"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              <div className="space-y-3">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2"><ListTodo className="w-4 h-4 text-blue-500" /> Briefing Manifest</span>
                  {isEditingTask && (
                    <select 
                      value={editingData.priority}
                      onChange={(e) => setEditingData({ ...editingData, priority: e.target.value as Task['priority'] })}
                      className="bg-slate-50 border-none outline-none text-[9px] font-black uppercase tracking-widest rounded-lg px-2 py-1 cursor-pointer"
                    >
                      <option value="low">Low Tier</option>
                      <option value="medium">Medium Tier</option>
                      <option value="high">High Tier</option>
                      <option value="urgent">Urgent Tier</option>
                    </select>
                  )}
                </h4>
                {isEditingTask ? (
                  <textarea 
                    value={editingData.description}
                    onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
                    className="w-full bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 text-slate-600 leading-relaxed font-bold italic text-lg outline-none focus:bg-white transition-all h-32 resize-none"
                  />
                ) : (
                  <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 text-slate-600 leading-relaxed font-bold italic text-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500/20" />
                    &quot;{selectedTask.description || 'System log: No additional briefing data available for this initialization node.'}&quot;
                  </div>
                )}
              </div>

              {/* Advanced Lifecycle selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Phase Lifecycle Selection</h4>
                  {pendingStatus && (
                    <button 
                      onClick={() => updateTaskStatus(selectedTask.id, pendingStatus)}
                      className="px-6 py-2 bg-emerald-600 text-white font-black rounded-xl text-[9px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg animate-pulse"
                    >
                      Execute Transition
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {statusColumns.map((col) => {
                    const isSelected = selectedTask.status === col.id;
                    const isPending = pendingStatus === col.id;
                    const Icon = col.icon;
                    return (
                      <button
                        key={col.id}
                        onClick={() => setPendingStatus(col.id as Task['status'])}
                        className={`flex flex-col items-center gap-2 p-4 rounded-[2rem] border-2 transition-all cursor-pointer ${
                          isSelected 
                           ? 'bg-blue-50 border-blue-500 shadow-lg shadow-blue-100 scale-105' 
                           : isPending
                             ? 'bg-emerald-50 border-emerald-500 border-dashed animate-pulse'
                             : 'bg-white border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className={`p-3 rounded-2xl ${isSelected ? 'bg-blue-600 text-white shadow-lg' : isPending ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-blue-700' : isPending ? 'text-emerald-700' : 'text-slate-500'}`}>
                          {col.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Logic Unit Verification</h4>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 shadow-sm">
                    {selectedTask.subtasks.filter(s => s.completed).length}/{selectedTask.subtasks.length} Resolved Units
                  </span>
                </div>
                
                <div className="space-y-3">
                   {selectedTask.subtasks.map(sub => (
                    <div key={sub.id} className="group flex items-center justify-between p-6 bg-slate-50/50 border border-slate-100 hover:border-blue-200 hover:bg-white rounded-[1.5rem] transition-all relative overflow-hidden">
                      {sub.completed && <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />}
                      <div className="flex items-center gap-4 relative z-10">
                         <button 
                            onClick={() => {
                              const newSubs = selectedTask.subtasks.map(s => s.id === sub.id ? { ...s, completed: !s.completed } : s);
                              setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, subtasks: newSubs } : t));
                              setSelectedTask({ ...selectedTask, subtasks: newSubs });
                            }}
                            className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${sub.completed ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-200' : 'bg-white border-slate-200 hover:border-blue-400'}`}
                         >
                           {sub.completed && <CheckCircle2 className="w-5 h-5 text-white" />}
                         </button>
                         <span className={`font-black text-lg tracking-tight transition-all ${sub.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{sub.title}</span>
                      </div>
                      <button 
                        onClick={() => {
                          const newSubs = selectedTask.subtasks.filter(s => s.id !== sub.id);
                          setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, subtasks: newSubs } : t));
                          setSelectedTask({ ...selectedTask, subtasks: newSubs });
                        }}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer relative z-10"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const title = prompt('Define next operation logic node:');
                      if (title) {
                        const newSubs = [...selectedTask.subtasks, { id: generateId(), title, completed: false }];
                        setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, subtasks: newSubs } : t));
                        setSelectedTask({ ...selectedTask, subtasks: newSubs });
                      }
                    }}
                    className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[1.5rem] flex items-center justify-center gap-3 text-slate-400 hover:border-blue-300 hover:bg-blue-50/20 hover:text-blue-600 transition-all font-black text-xs uppercase tracking-[0.2em] cursor-pointer group"
                  >
                    <Plus className="w-6 h-6 group-hover:scale-125 transition-transform" />
                    Provision Logic Node
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
               <button 
                onClick={() => { setDeletingTask(selectedTask); setShowDeleteModal(true); setShowDetailModal(false); }}
                className="px-8 py-4 font-black text-rose-500 hover:bg-white rounded-[1.5rem] transition-all cursor-pointer text-[10px] uppercase tracking-widest border border-transparent hover:border-rose-100 shadow-sm"
               >
                Archival Protocol
              </button>
              <button 
                onClick={() => {
                  setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, status: 'done' } : t));
                  setShowDetailModal(false);
                }}
                className="px-10 py-5 bg-slate-900 text-white font-black rounded-[1.5rem] shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95 cursor-pointer text-xs uppercase tracking-[0.15em] flex items-center gap-3"
              >
                Finalize Deployment
                <ArrowUpRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] max-w-2xl w-full shadow-2xl flex flex-col max-h-[82vh] animate-in zoom-in-95 duration-300 overflow-hidden border border-slate-200">
             <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
               <div className="space-y-1">
                 <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Project Initiation</h2>
                 <p className="text-slate-400 font-bold text-lg italic">Provisioning new operational parameters.</p>
               </div>
               <button onClick={() => setShowAddModal(false)} className="p-3 bg-slate-50 hover:bg-rose-50 text-slate-400 rounded-2xl transition-all cursor-pointer"><X className="w-7 h-7" /></button>
             </div>
             
             <div className="p-10 space-y-10 overflow-y-auto">
               <div className="space-y-3">
                 <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Initialization Title</label>
                 <input 
                  type="text" 
                  value={newTask.title} 
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})} 
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-[2rem] outline-none font-black text-2xl text-slate-900 transition-all placeholder:text-slate-200 uppercase tracking-tight" 
                  placeholder="e.g. ALPHA_NODES_Q1" 
                 />
               </div>
               
               <div className="space-y-3">
                 <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Scope Manifest</label>
                 <textarea 
                  value={newTask.description} 
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})} 
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-[2rem] outline-none font-bold text-slate-700 h-32 resize-none transition-all placeholder:text-slate-200 italic" 
                  placeholder="Define operational objectives and constraints..." 
                 />
               </div>

               <div className="grid grid-cols-2 gap-10">
                 <div className="space-y-3">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Criticality Tier</label>
                   <select 
                    value={newTask.priority} 
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value as Task['priority']})} 
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-[2rem] outline-none font-black text-slate-900 cursor-pointer appearance-none uppercase tracking-widest text-[11px]"
                   >
                     <option value="low">Tier 3 (Low)</option>
                     <option value="medium">Tier 2 (Medium)</option>
                     <option value="high">Tier 1 (High)</option>
                     <option value="urgent">Critical Tier</option>
                   </select>
                 </div>
                 <div className="space-y-3">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Deployment Target</label>
                   <input 
                    type="date" 
                    value={newTask.dueDate} 
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} 
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-[2rem] outline-none font-black text-slate-900 tracking-widest text-[11px]" 
                   />
                 </div>
               </div>

               <div className="space-y-3">
                 <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Lead Personnel</label>
                 <div className="relative">
                   <User className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                   <input 
                    type="text" 
                    value={newTask.assignedTo} 
                    onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})} 
                    className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-[2rem] outline-none font-black text-slate-900 transition-all placeholder:text-slate-200 tracking-widest text-[11px]" 
                    placeholder="Search personnel manifest..." 
                   />
                 </div>
               </div>
             </div>

             <div className="p-8 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-6 shrink-0">
               <button 
                onClick={() => setShowAddModal(false)}
                className="px-10 py-5 font-black text-slate-400 hover:text-slate-900 transition-all cursor-pointer text-xs uppercase tracking-widest"
               >
                Abort
              </button>
              <button 
                onClick={() => {
                  if (!newTask.title) return;
                  const t: Task = { 
                    id: generateId(), 
                    ...newTask,
                    status: 'todo', 
                    tags: newTask.tags ? newTask.tags.split(',').map(tag => tag.trim()) : [], 
                    subtasks: [],
                    createdAt: new Date().toISOString() 
                  };
                  setTasks([...tasks, t]);
                  setShowAddModal(false);
                  setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '', tags: '' });
                }}
                className="px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[2.5rem] shadow-2xl shadow-blue-200 transition-all cursor-pointer flex items-center gap-3 text-xs uppercase tracking-[0.2em]"
              >
                Execute Initialization
                <ArrowUpRight className="w-5 h-5 flex-shrink-0" />
              </button>
             </div>
           </div>
        </div>
      )}

      {showDeleteModal && deletingTask && (
        <DeleteConfirmationModal 
          isOpen={showDeleteModal} 
          onClose={() => { setShowDeleteModal(false); setDeletingTask(null); }} 
          onConfirm={() => { setTasks(tasks.filter(t => t.id !== deletingTask.id)); setShowDeleteModal(false); }} 
          title="Decommission Node" 
          itemName={deletingTask.title} 
          itemDetails={`Personnel: ${deletingTask.assignedTo} | Phase: ${getStatusConfig(deletingTask.status).label}`} 
          warningMessage="This operational logic and all associated sub-nodes will be permanently erased from active memory." 
        />
      )}
    </div>
  );
}

const statusColumns = [
  { id: 'todo', label: 'Backlog Hub', icon: Circle },
  { id: 'in_progress', label: 'Execution Phase', icon: Clock3 },
  { id: 'review', label: 'Validation Protocol', icon: AlertCircle },
  { id: 'done', label: 'Deployed State', icon: CheckCircle2 }
] as const;
