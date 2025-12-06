import React from 'react';
import { Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui';

export function ComplianceTracker() {
  const items = [
    { id: '1', title: 'VAT Return Q4', dueDate: 'Dec 31, 2024', status: 'pending' },
    { id: '2', title: 'Annual Accounts', dueDate: 'Jan 15, 2025', status: 'pending' },
    { id: '3', title: 'GDPR Review', dueDate: 'Completed', status: 'completed' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Compliance Reminders</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {item.status === 'completed' ? (
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              ) : (
                <AlertCircle className="w-8 h-8 text-orange-600" />
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.dueDate}</p>
              </div>
            </div>
            <Badge variant={item.status === 'completed' ? 'success' : 'warning'}>
              {item.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
