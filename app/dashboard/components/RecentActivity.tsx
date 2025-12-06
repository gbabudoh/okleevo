import React from 'react';
import { Clock } from 'lucide-react';

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  icon: string;
}

export function RecentActivity() {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'invoice',
      description: 'Invoice #INV-1001 created for ABC Ltd',
      timestamp: '2 hours ago',
      icon: '💰',
    },
    {
      id: '2',
      type: 'contact',
      description: 'New contact added: John Smith',
      timestamp: '4 hours ago',
      icon: '👥',
    },
    {
      id: '3',
      type: 'task',
      description: 'Task "Review proposal" completed',
      timestamp: '5 hours ago',
      icon: '✅',
    },
    {
      id: '4',
      type: 'payment',
      description: 'Payment received: £1,250',
      timestamp: '1 day ago',
      icon: '💳',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">{activity.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
