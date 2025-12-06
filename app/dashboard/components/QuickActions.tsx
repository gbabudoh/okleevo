"use client";

import React from 'react';
import { Plus, FileText, Users, CheckSquare, Sparkles, Mail, Calendar, Receipt } from 'lucide-react';

export function QuickActions() {
  const actions = [
    { name: 'Create Invoice', icon: Receipt, color: '#fc6813', href: '#' },
    { name: 'Add Contact', icon: Users, color: '#3b82f6', href: '#' },
    { name: 'New Task', icon: CheckSquare, color: '#8b5cf6', href: '#' },
    { name: 'AI Content', icon: Sparkles, color: '#10b981', href: '#' },
    { name: 'Send Email', icon: Mail, color: '#ec4899', href: '#' },
    { name: 'Book Meeting', icon: Calendar, color: '#f59e0b', href: '#' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
              style={{ backgroundColor: action.color + '20' }}
            >
              <action.icon className="w-6 h-6" style={{ color: action.color }} />
            </div>
            <span className="text-sm font-medium text-gray-700 text-center">{action.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
