"use client";

import React, { useState } from 'react';
import { Plus, Search, Calendar, User, Clock, AlertCircle, CheckCircle, Circle, MoreVertical, Trash2, X, Flag, TrendingUp, ListTodo, Target, Filter, ChevronRight, Kanban, LayoutPanelLeft } from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  assignedTo?: string;
  tags?: string[];
  createdAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Review client proposal', description: 'Review and provide feedback on Q4 proposal', status: 'todo', priority: 'high', dueDate: '2024-12-10', assignedTo: 'John Smith', tags: ['Client', 'Urgent'], createdAt: '2024-12-01' },
    { id: '2', title: 'Update website content', description: 'Update homepage and about page', status: 'in_progress', priority: 'medium', dueDate: '2024-12-12', assignedTo: 'Sarah Johnson', tags: ['Marketing'], createdAt: '2024-12-02' },
    { id: '3', title: 'Send monthly invoices', description: 'Generate and send invoices to all clients', status: 'todo', priority: 'urgent', dueDate: '2024-12-08', assignedTo: 'Mike Brown', tags: ['Finance', 'Monthly'], createdAt: '2024-12-03' },
    { id: '4', title: 'Team meeting preparation', description: 'Prepare agenda and materials', status: 'done', priority: 'low', dueDate: '2024-12-05', assignedTo: 'Emma Wilson', tags: ['Team'], createdAt: '2024-11-28' },
    { id: '5', title: 'Update CRM database', description: 'Clean and update customer records', status: 'review', priority: 'medium', dueDate: '2024-12-15', assignedTo: 'David Lee', tags: ['Data'], createdAt: '2024-12-04' },
    { id: '6', title: 'Prepare quarterly report', description: 'Compile Q4 performance metrics', status: 'in_progress', priority: 'high', dueDate: '2024-12-20', assignedTo: 'John Smith', tags: ['Reports'], createdAt: '2024-12-05' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    priority: Task['priority'];
    dueDate: string;
    assignedTo: string;
    tags: string;
  }>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
    tags: ''
  });

  const statusColumns = [
    { id: 'todo', label: 'To Do', icon: Circle, color: 'sky' },
    { id: 'in_progress', label: 'In Progress', icon: Clock, color: 'indigo' },
    { id: 'review', label: 'Review', icon: AlertCircle, color: 'amber' },
    { id: 'done', label: 'Completed', icon: CheckCircle, color: 'emerald' }
  ] as const;

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'done').length,
  };

  const getPriorityConfig = (priority: string) => {
    switch(priority) {
      case 'urgent': return { color: 'text-rose-600', bg: 'bg-rose-500', label: 'Urgent', icon: Flag };
      case 'high': return { color: 'text-orange-600', bg: 'bg-orange-500', label: 'High', icon: AlertCircle };
      case 'medium': return { color: 'text-amber-600', bg: 'bg-amber-500', label: 'Medium', icon: Circle };
      default: return { color: 'text-blue-600', bg: 'bg-blue-500', label: 'Low', icon: Circle };
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F8FAFC]">
      {/* Mesh Background */}
      <div className="fixed inset-0 z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-300 rounded-full blur-[120px] mix-blend-multiply transition-transform duration-[10s] animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-indigo-300 rounded-full blur-[120px] mix-blend-multiply transition-transform duration-[10s] animate-pulse delay-700" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-blue-200 rounded-full blur-[100px] mix-blend-multiply transition-transform duration-[10s] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 p-8 max-w-[1700px] mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
              Mission Control
              <span className="text-base font-bold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100 uppercase tracking-widest shadow-sm">Operational</span>
            </h1>
            <p className="text-gray-500 font-medium text-xl max-w-2xl leading-relaxed">
              Coordinate high-priority workflows and monitor performance across your entire operational surface.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button className="p-4 bg-white/80 backdrop-blur-xl border border-white hover:bg-white rounded-2xl transition-all shadow-sm group cursor-pointer">
              <LayoutPanelLeft className="w-6 h-6 text-gray-400 group-hover:text-gray-900" />
            </button>
            <button onClick={() => setShowAddModal(true)} className="px-8 py-5 bg-gray-900 text-white rounded-[2rem] font-black flex items-center gap-4 shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95 cursor-pointer text-lg">
              New Initiative <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { l: 'Total Nodes', v: stats.total, i: ListTodo, c: 'blue' },
            { l: 'Active Operations', v: stats.inProgress, i: Clock, c: 'indigo' },
            { l: 'Pending Tasks', v: stats.todo, i: Target, c: 'amber' },
            { l: 'Completion Rate', v: ((stats.completed/stats.total)*100).toFixed(0)+'%', i: CheckCircle, c: 'emerald' }
          ].map((s, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white shadow-xl hover:shadow-2xl transition-all group flex items-center gap-6">
              <div className={`w-16 h-16 rounded-3xl bg-${s.c}-500/10 flex items-center justify-center border border-${s.c}-100 group-hover:scale-110 transition-transform`}>
                <s.i className={`w-8 h-8 text-${s.c}-600`} />
              </div>
              <div>
                <span className="text-4xl font-black text-gray-900 block tracking-tighter">{s.v}</span>
                <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em]">{s.l}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-white/40 backdrop-blur-3xl p-3 rounded-[2rem] border border-white/60 shadow-inner flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <input type="text" placeholder="Scan initiatives..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-16 pr-6 py-5 bg-white/50 border border-transparent focus:border-indigo-200 rounded-2xl outline-none font-bold text-gray-900 text-lg transition-all" />
          </div>
          <div className="flex gap-3">
            <button className="px-8 py-5 bg-white/50 border border-white rounded-2xl font-bold text-gray-700 hover:bg-white transition-all cursor-pointer flex items-center gap-2">
              <Kanban className="w-5 h-5 text-indigo-600" /> Board View
            </button>
            <button className="px-8 py-5 bg-white/50 border border-white rounded-2xl font-bold text-gray-700 hover:bg-white transition-all cursor-pointer flex items-center gap-2">
              <Filter className="w-5 h-5" /> Filters
            </button>
          </div>
        </div>

        {/* Kanban Surface */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {statusColumns.map((column, idx) => {
            const StatusIcon = column.icon;
            const columnTasks = filteredTasks.filter(t => t.status === column.id);
            
            return (
              <div key={column.id} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl bg-${column.color}-500/10 flex items-center justify-center border border-${column.color}-100`}>
                      <StatusIcon className={`w-5 h-5 text-${column.color}-600`} />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 tracking-tight">{column.label}</h3>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{columnTasks.length} Units</span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-200/50 rounded-xl transition-colors cursor-pointer text-gray-400">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-6 flex-1 min-h-[400px]">
                  {columnTasks.map((task, tidx) => {
                    const pc = getPriorityConfig(task.priority);
                    return (
                      <div 
                        key={task.id} 
                        className="group relative bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-bottom-2 h-[280px] flex flex-col justify-between"
                        style={{ animationDelay: `${tidx * 100}ms` }}
                        onClick={() => { setSelectedTask(task); setShowDetailModal(true); }}
                      >
                        <div className={`absolute left-0 top-12 bottom-12 w-1.5 ${pc.bg} rounded-r-full group-hover:h-1/2 transition-all`} />
                        
                        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                          <div className="flex items-start justify-between">
                            <h4 className="font-black text-gray-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight line-clamp-2">{task.title}</h4>
                            <div className="flex gap-1">
                               <button onClick={(e) => { e.stopPropagation(); setDeletingTask(task); setShowDeleteModal(true); }} className="p-2 bg-gray-50 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                          
                          {task.description && (
                            <p className="text-sm font-bold text-gray-500 line-clamp-2 leading-relaxed italic">{"\""}{task.description}{"\""}</p>
                          )}
                          
                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            <span className={`px-4 py-1.5 text-[10px] font-black rounded-full border ${pc.bg} bg-opacity-10 ${pc.color} uppercase tracking-widest flex items-center gap-2 shadow-sm`}>
                              <pc.icon className="w-3 h-3" />
                              {pc.label}
                            </span>
                            {task.tags?.map((tag, tagIdx) => (
                              <span key={tagIdx} className="px-3 py-1 text-[9px] font-black bg-gray-100 text-gray-400 rounded-full border border-gray-200 uppercase tracking-widest">{tag}</span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100/50 mt-4">
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">
                            <Calendar className="w-3.5 h-3.5" />
                            {task.dueDate}
                          </div>
                          {task.assignedTo && (
                            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 truncate max-w-[120px]">
                              <User className="w-3 h-3 shrink-0" />
                              <span className="truncate">{task.assignedTo}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  <button onClick={() => setShowAddModal(true)} className="w-full py-8 border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-indigo-300 hover:bg-indigo-50/30 hover:text-indigo-500 transition-all group cursor-pointer">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-black text-xs uppercase tracking-widest">Deploy Sub-Task</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modern Modals Implementation */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between">
              <div><h2 className="text-3xl font-black text-gray-900 tracking-tight">New Initiative</h2><p className="text-gray-500 font-bold text-lg italic">Provisioning operational resources.</p></div>
              <button onClick={() => setShowAddModal(false)} className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-2xl transition-all cursor-pointer"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-10 space-y-8 overflow-y-auto">
              <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Objective Title</label><input type="text" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-black text-xl text-gray-900 transition-all uppercase tracking-tight" placeholder="MISSION ALPHA..." /></div>
              <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Detailed Briefing</label><textarea value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold text-gray-900 h-24 resize-none italic" placeholder="System logs or mission requirements..." /></div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Priority Tier</label><select value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value as Task['priority']})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none font-black text-gray-900"><option value="low">Tier 3 (Low)</option><option value="medium">Tier 2 (Medium)</option><option value="high">Tier 1 (High)</option><option value="urgent">CRITICAL (Urgent)</option></select></div>
                <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Deadline Date</label><input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none font-black text-gray-900" /></div>
              </div>
              <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Assigned Personnel</label><input type="text" value={newTask.assignedTo} onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-black text-gray-900" placeholder="e.g. Commander Smith" /></div>
            </div>
            <div className="p-8 border-t border-gray-100 flex gap-4 bg-gray-50/50 rounded-b-[3rem]">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-8 py-5 rounded-2xl font-black text-gray-500 hover:bg-white transition-all cursor-pointer">Abort</button>
              <button 
                onClick={() => {
                  const t: Task = { id: Math.random().toString(36).substr(2, 9), ...newTask, status: 'todo', tags: newTask.tags ? newTask.tags.split(',').map(tag => tag.trim()) : [], createdAt: new Date().toISOString() };
                  setTasks([...tasks, t]);
                  setShowAddModal(false);
                }}
                className="flex-[2] px-8 py-5 bg-gray-900 text-white rounded-[2rem] font-black shadow-xl hover:bg-black transition-all cursor-pointer flex items-center justify-center gap-3"
              >
                Launch Operation <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedTask && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-[3rem] max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
             <div className="p-10 border-b border-gray-100 flex justify-between items-start">
               <div><span className="text-xs font-black text-indigo-600 mb-2 block uppercase tracking-widest">Operation Details</span><h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">{selectedTask.title}</h2></div>
               <button onClick={() => setShowDetailModal(false)} className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all cursor-pointer"><X className="w-6 h-6" /></button>
             </div>
             <div className="p-10 overflow-y-auto space-y-10">
               <div className="space-y-4">
                 <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Briefing Context</h4>
                 <p className="text-xl font-bold text-gray-600 leading-relaxed italic border-l-4 border-indigo-100 pl-6 bg-indigo-50/30 py-4 rounded-r-2xl">{"\""}{selectedTask.description || 'No additional briefing data available for this node.'}{"\""}</p>
               </div>
               
               <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                 <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phase Status</p>
                   <select 
                    value={selectedTask.status} 
                    onChange={(e) => {
                      const newStatus = e.target.value as Task['status'];
                      setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, status: newStatus } : t));
                      setSelectedTask({ ...selectedTask, status: newStatus });
                    }}
                    className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-100 rounded-xl font-black text-gray-700 outline-none focus:border-indigo-100"
                   >
                     <option value="todo">To Do</option><option value="in_progress">Active</option><option value="review">Review</option><option value="done">Finalized</option>
                   </select>
                 </div>
                 <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Priority Tier</p>
                   <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${getPriorityConfig(selectedTask.priority).bg}`} /><span className="font-black text-gray-700 uppercase tracking-tight">{selectedTask.priority} Priority</span></div>
                 </div>
                 <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Scheduled Personnel</p><p className="font-black text-indigo-600">{selectedTask.assignedTo || 'Unassigned'}</p></div>
                 <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Completion Target</p><p className="font-black text-gray-700">{selectedTask.dueDate}</p></div>
               </div>

               <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white flex flex-col gap-6">
                 <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center"><TrendingUp className="w-6 h-6" /></div><div><span className="font-black text-lg block uppercase tracking-tight">Performance Boost</span><p className="text-gray-400 text-xs font-bold">Accelerating this operation yields 12% faster deployment.</p></div></div>
                 <div className="flex gap-3"><button className="flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black transition-all cursor-pointer uppercase tracking-widest text-[10px]">Log Event</button><button className="flex-1 py-4 bg-white text-gray-900 rounded-[2rem] font-black hover:bg-indigo-50 transition-all cursor-pointer uppercase tracking-widest text-[10px]">Finalize Mission</button></div>
               </div>
             </div>
           </div>
        </div>
      )}

      {showDeleteModal && deletingTask && (
        <DeleteConfirmationModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeletingTask(null); }} onConfirm={() => { setTasks(tasks.filter(t => t.id !== deletingTask.id)); setShowDeleteModal(false); }} title="Abort Mission" itemName={deletingTask.title} itemDetails={`Phase: ${deletingTask.status} | Personnel: ${deletingTask.assignedTo}`} warningMessage="All operational logs for this initiative will be purged from system memory." />
      )}
    </div>
  );
}
