"use client";

import React from 'react';
import { TrendingUp } from 'lucide-react';

export function RevenueChart() {
  const data = [
    { month: 'Jan', revenue: 4500 },
    { month: 'Feb', revenue: 5200 },
    { month: 'Mar', revenue: 4800 },
    { month: 'Apr', revenue: 6100 },
    { month: 'May', revenue: 7200 },
    { month: 'Jun', revenue: 8500 },
  ];

  const maxRevenue = Math.max(...data.map(d => d.revenue));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Revenue Overview</h3>
          <p className="text-sm text-gray-500 mt-1">Last 6 months</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-600">+24.5%</span>
        </div>
      </div>
      
      <div className="flex items-end justify-between h-64 gap-4">
        {data.map((item, index) => {
          const height = (item.revenue / maxRevenue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center h-48">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t transition-all hover:opacity-80 cursor-pointer relative group"
                  style={{
                    height: `${height}%`,
                    background: 'linear-gradient(to top, #fc6813, #ff8c42)',
                  }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    £{item.revenue.toLocaleString()}
                  </div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-600">{item.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
