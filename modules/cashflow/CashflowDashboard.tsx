import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export function CashflowDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Cashflow Snapshot</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <DollarSign className="w-8 h-8 text-emerald-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">£45,230</p>
          <p className="text-sm text-gray-600 mt-1">Current Balance</p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">£12,450</p>
          <p className="text-sm text-gray-600 mt-1">Income This Month</p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <TrendingDown className="w-8 h-8 text-red-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">£8,320</p>
          <p className="text-sm text-gray-600 mt-1">Expenses This Month</p>
        </div>
      </div>
    </div>
  );
}
