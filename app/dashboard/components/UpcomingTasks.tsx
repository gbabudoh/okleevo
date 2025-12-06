"use client";

import React, { useState } from 'react';
import { CheckSquare, Clock, AlertCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export function UpcomingTasks() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Review Q4 financial reports', dueDate: 'Today', priority: 'high', completed: false },
    { id: '2', title: 'Follow up with ABC Ltd', dueDate: 'Tomorrow', priority: 'medium', completed: false },
    { id: '3', title: 'Update website content', dueDate: 'Dec 10', priority: 'low', completed: false },
    { id: '4', title: 'Prepare client presentation', dueDate: 'Dec 12', priority: 'high', completed: false },
  ]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const priorityColors = {
    high: 'text-red-600 bg-red-50',
    medium: 'text-orange-600 bg-orange-50',
    low: 'text-blue-600 bg-blue-50',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Upcoming Tasks</h3>
        <CheckSquare className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
              task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="w-5 h-5 rounded border-gray-300 cursor-pointer"
              style={{ accentColor: '#fc6813' }}
            />
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                {task.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">{task.dueDate}</span>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 py-2 text-sm font-medium rounded-lg border-2 border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors">
        + Add New Task
      </button>
    </div>
  );
}
