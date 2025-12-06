import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { Badge } from '@/components/ui';

export function TicketList() {
  const tickets = [
    { id: '1', subject: 'Login Issue', customer: 'John Smith', status: 'open', priority: 'high' },
    { id: '2', subject: 'Feature Request', customer: 'Jane Doe', status: 'in-progress', priority: 'medium' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Helpdesk</h1>
        <button className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-lg" style={{ backgroundColor: '#fc6813' }}>
          <Plus className="w-5 h-5" />
          New Ticket
        </button>
      </div>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <MessageSquare className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                  <p className="text-sm text-gray-600">{ticket.customer}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={ticket.priority === 'high' ? 'error' : 'warning'}>{ticket.priority}</Badge>
                <Badge variant="info">{ticket.status}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
