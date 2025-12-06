"use client";

import React, { useState } from 'react';
import { CheckSquare, Plus, Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  assignee: string;
}

export function TaskBoard() {
  const [tasks] = useState<Task[]>([
    { id: '1', title: 'Review Q4 reports', description: 'Analyze financial data', status: 'todo', priority: 'high', dueDate: 'Today', assignee: 'John' },
    { id: '2', title: 'Client meeting prep', description: 'Prepare presentation', status: 'in-progress', priority: 'high', dueDate: 'Tomorrow', assignee: 'Jane' },
    { id: '3', title: 'Update website', description: 'Add new content', status: 'in-progress', priority: 'medium', dueDate: 'Dec 10', assignee: 'Bob' },
    { id: '4', title: 'Send invoices', description: 'Monthly billing', status: 'done', priority: 'high', dueDate: 'Dec 1', assignee: 'Alice' },
    { id: '5', title: 'Team standup', description: 'Weekly sync', status: 'todo', priority: 'low', dueDate: 'Dec 8', assignee: 'John' },
  ]);

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
    { id: 'done', title: 'Done', color: 'bg-emerald-100' },
  ];

  const priorityVariant = {
    high: 'error' as const,
    medium: 'warning' as const,
    low: 'info' as const,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Board</h1>
          <p className="text-gray-600 mt-1">Organize and track your tasks</p>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          style={{ backgroundColor: '#fc6813' }}
        >
          <Plus className="w-5 h-5" />
          New Task
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            <div className={`${column.color} rounded-lg p-4`}>
              <h3 className="font-bold text-gray-900 flex items-center justify-between">
                {column.title}
                <span className="text-sm font-normal text-gray-600">
                  {tasks.filter(t => t.status === column.id).length}
                </span>
              </h3>
            </div>
            
            <div className="space-y-3">
              {tasks
                .filter(task => task.status === column.id)
                .map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{task.title}</h4>
                      <Badge variant={priorityVariant[task.priority]} size="sm">
                        {task.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{task.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{task.assignee}</span>
                      </div>
                    </div>
                  </div>
                ))}
              
              <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
                + Add Task
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
