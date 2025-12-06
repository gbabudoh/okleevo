"use client";

import React from 'react';
import { Mail, TrendingUp, Users, Plus } from 'lucide-react';
import { Badge } from '@/components/ui';

export function CampaignManager() {
  const campaigns = [
    { id: '1', name: 'Summer Sale 2024', sent: 1250, opened: 850, clicked: 320, status: 'active' },
    { id: '2', name: 'Newsletter Dec', sent: 980, opened: 620, clicked: 180, status: 'active' },
    { id: '3', name: 'Product Launch', sent: 2100, opened: 1400, clicked: 560, status: 'completed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
        <button className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-lg" style={{ backgroundColor: '#fc6813' }}>
          <Plus className="w-5 h-5" />
          New Campaign
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Mail className="w-8 h-8 text-blue-600" />
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">4,330</p>
          <p className="text-sm text-gray-600 mt-1">Total Sent</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-semibold text-emerald-600">68%</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">2,870</p>
          <p className="text-sm text-gray-600 mt-1">Opened</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <span className="text-sm font-semibold text-emerald-600">24%</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">1,060</p>
          <p className="text-sm text-gray-600 mt-1">Clicked</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Campaign</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sent</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Opened</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Clicked</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">{campaign.name}</td>
                <td className="px-6 py-4 text-gray-700">{campaign.sent.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-700">{campaign.opened.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-700">{campaign.clicked.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <Badge variant={campaign.status === 'active' ? 'success' : 'default'}>
                    {campaign.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
