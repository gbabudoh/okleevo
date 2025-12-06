import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor: string;
}

export function StatsCard({ title, value, change, changeType = 'neutral', icon: Icon, iconColor }: StatsCardProps) {
  const changeColors = {
    positive: 'text-emerald-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${changeColors[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: iconColor + '20' }}
        >
          <Icon className="w-7 h-7" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}
