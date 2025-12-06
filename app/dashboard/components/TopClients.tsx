import React from 'react';
import { TrendingUp, Users } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  revenue: number;
  growth: number;
  avatar: string;
}

export function TopClients() {
  const clients: Client[] = [
    { id: '1', name: 'ABC Ltd', revenue: 12500, growth: 15, avatar: '🏢' },
    { id: '2', name: 'XYZ Corp', revenue: 9800, growth: 8, avatar: '🏭' },
    { id: '3', name: 'Tech Solutions', revenue: 8200, growth: 22, avatar: '💻' },
    { id: '4', name: 'Design Co', revenue: 6500, growth: -5, avatar: '🎨' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Top Clients</h3>
        <Users className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-4">
        {clients.map((client, index) => (
          <div key={client.id} className="flex items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-xl">
                {client.avatar}
              </div>
              <div>
                <p className="font-medium text-gray-900">{client.name}</p>
                <p className="text-sm text-gray-500">£{client.revenue.toLocaleString()} revenue</p>
              </div>
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${client.growth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-4 h-4 ${client.growth < 0 ? 'rotate-180' : ''}`} />
              <span>{Math.abs(client.growth)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
