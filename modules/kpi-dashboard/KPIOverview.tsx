import React from 'react';
import { BarChart3, TrendingUp, Target } from 'lucide-react';

export function KPIOverview() {
  const kpis = [
    { name: 'Revenue', value: '£45,230', change: '+12.5%', trend: 'up' },
    { name: 'Customers', value: '1,234', change: '+8.2%', trend: 'up' },
    { name: 'Conversion Rate', value: '3.2%', change: '-1.1%', trend: 'down' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">KPI Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <span className={`text-sm font-semibold ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {kpi.change}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-sm text-gray-600 mt-1">{kpi.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
