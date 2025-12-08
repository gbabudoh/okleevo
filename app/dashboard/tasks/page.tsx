"use client";

import React, { useState } from 'react';
import { Plus, Search, Calendar, User, Tag, Clock, AlertCircle, CheckCircle, Circle, MoreVertical, Edit, Trash2, X, Flag, TrendingUp, ListTodo, Target } from 'lucide-react';
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
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    dueDate: '',
    assignedTo: '',
    tags: ''
  });

  const statusColumns = [
    { id: 'todo', label: 'To Do', icon: Circle, color: 'blue' },
    { id: 'in_progress', label: 'In Progress', icon: Clock, color: 'purple' },
    { id: 'review', label: 'Review', icon: AlertCircle, color: 'orange' },
    { id: 'done', label: 'Done', icon: CheckCircle, color: 'green' }
  ];

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

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'urgent': return <Flag className="w-3 h-3" />;
      case 'high': return <AlertCircle className="w-3 h-3" />;
      case 'medium': return <Circle className="w-3 h-3" />;
      case 'low': return <Circle className="w-3 h-3" />;
      default: return <Circle className="w-3 h-3" />;
    }
  };

  const handleDeleteTask = (task: Task) => {
    setDeletingTask(task);
    setShowDeleteModal(true);
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                <ListTodo className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent leading-tight pb-1">
                  Task Management
                </h1>
                <p className="text-gray-600 mt-2 text-lg">Organize and track your work efficiently</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-600"
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <ListTodo className="w-7 h-7 text-white" />
              </div>
              <span className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent">{stats.total}</span>
            </div>
            <p className="text-gray-600 font-medium">Total Tasks</p>
            <div className="mt-2 flex items-center gap-1 text-sm text-blue-600">
              <TrendingUp className="w-4 h-4" />
              <span>All tasks</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <span className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-purple-700 bg-clip-text text-transparent">{stats.inProgress}</span>
            </div>
            <p className="text-gray-600 font-medium">In Progress</p>
            <div className="mt-2 flex items-center gap-1 text-sm text-purple-600">
              <Clock className="w-4 h-4" />
              <span>Active now</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                <Target className="w-7 h-7 text-white" />
              </div>
              <span className="text-4xl font-bold bg-gradient-to-br from-orange-600 to-orange-700 bg-clip-text text-transparent">{stats.todo}</span>
            </div>
            <p className="text-gray-600 font-medium">To Do</p>
            <div className="mt-2 flex items-center gap-1 text-sm text-orange-600">
              <Circle className="w-4 h-4" />
              <span>Pending</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <span className="text-4xl font-bold bg-gradient-to-br from-green-600 to-green-700 bg-clip-text text-transparent">{stats.completed}</span>
            </div>
            <p className="text-gray-600 font-medium">Completed</p>
            <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Finished</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm"
          />
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-4 gap-6">
          {statusColumns.map((column) => {
            const StatusIcon = column.icon;
            const columnTasks = filteredTasks.filter(t => t.status === column.id);
            
            return (
              <div key={column.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border-2 border-gray-200 shadow-md">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${column.color}-500 to-${column.color}-600 flex items-center justify-center shadow-md`}>
                      <StatusIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{column.label}</h3>
                      <span className="text-xs text-gray-500">{columnTasks.length} tasks</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {columnTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:shadow-xl hover:border-cyan-300 transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                      onClick={() => {
                        setSelectedTask(task);
                        setShowDetailModal(true);
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 text-sm flex-1 leading-tight">{task.title}</h4>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task);
                          }}
                          className="p-1.5 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">{task.description}</p>
                      )}
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1 ${
                          task.priority === 'urgent' ? 'bg-red-500 text-white' :
                          task.priority === 'high' ? 'bg-orange-500 text-white' :
                          task.priority === 'medium' ? 'bg-yellow-500 text-white' :
                          'bg-blue-500 text-white'
                        }`}>
                          {getPriorityIcon(task.priority)}
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-blue-100 px-2.5 py-1.5 rounded-lg border border-blue-200">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-medium text-blue-700">{task.dueDate}</span>
                        </div>
                        {task.assignedTo && (
                          <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-50 to-purple-100 px-2.5 py-1.5 rounded-lg border border-purple-200">
                            <User className="w-3.5 h-3.5 text-purple-600" />
                            <span className="font-medium text-purple-700">{task.assignedTo.split(' ')[0]}</span>
                          </div>
                        )}
                      </div>
                      
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex gap-1.5 mt-3 flex-wrap">
                          {task.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 text-xs bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg font-medium border border-gray-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {columnTasks.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
                      <StatusIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm font-medium">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary-500 to-accent-500">
              <h2 className="text-xl font-bold text-white">Create New Task</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="What needs to be done?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 h-20"
                  placeholder="Add more details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                <input
                  type="text"
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Team member name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTask.tags}
                  onChange={(e) => setNewTask({...newTask, tags: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Client, Urgent, Marketing"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    const task: Task = {
                      id: String(tasks.length + 1),
                      title: newTask.title,
                      description: newTask.description,
                      status: 'todo',
                      priority: newTask.priority,
                      dueDate: newTask.dueDate,
                      assignedTo: newTask.assignedTo,
                      tags: newTask.tags ? newTask.tags.split(',').map(t => t.trim()) : [],
                      createdAt: new Date().toISOString().split('T')[0]
                    };
                    setTasks([...tasks, task]);
                    setShowAddModal(false);
                    setNewTask({
                      title: '',
                      description: '',
                      priority: 'medium',
                      dueDate: '',
                      assignedTo: '',
                      tags: ''
                    });
                  }}
                  disabled={!newTask.title || !newTask.dueDate}
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                  style={{ backgroundColor: '#fc6813' }}
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {showDetailModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary-500 to-accent-500">
              <h2 className="text-xl font-bold text-white">Task Details</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedTask.title}</h3>
                {selectedTask.description && (
                  <p className="text-gray-600 mt-2">{selectedTask.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => {
                      handleStatusChange(selectedTask.id, e.target.value as Task['status']);
                      setSelectedTask({...selectedTask, status: e.target.value as Task['status']});
                    }}
                    className="w-full px-3 py-1 border border-gray-300 rounded cursor-pointer"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Priority</p>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border inline-flex items-center gap-1 ${getPriorityColor(selectedTask.priority)}`}>
                    {getPriorityIcon(selectedTask.priority)}
                    {selectedTask.priority}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Due Date</p>
                  <p className="font-medium text-gray-900">{selectedTask.dueDate}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Assigned To</p>
                  <p className="font-medium text-gray-900">{selectedTask.assignedTo || 'Unassigned'}</p>
                </div>
              </div>

              {selectedTask.tags && selectedTask.tags.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Tags</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedTask.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={() => setShowDetailModal(false)}
                className="w-full px-4 py-2 rounded-lg text-white font-medium cursor-pointer" 
                style={{ backgroundColor: '#fc6813' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTask && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingTask(null);
          }}
          onConfirm={() => {
            setTasks(tasks.filter(t => t.id !== deletingTask.id));
            alert('✓ Task deleted successfully!');
          }}
          title="Delete Task"
          itemName={deletingTask.title}
          itemDetails={`Priority: ${deletingTask.priority} | Due: ${deletingTask.dueDate}`}
          warningMessage="This will permanently remove this task and all its data."
        />
      )}
    </div>
  );
}
