"use client";

import React, { useState } from 'react';
import { FileText, Download, Eye, Plus, Search } from 'lucide-react';
import { Badge } from '@/components/ui';

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  dueDate: string;
  createdAt: string;
}

export function InvoiceList() {
  const [invoices] = useState<Invoice[]>([
    { id: '1', number: 'INV-1001', client: 'ABC Ltd', amount: 1250, status: 'paid', dueDate: '2024-12-01', createdAt: '2024-11-15' },
    { id: '2', number: 'INV-1002', client: 'XYZ Corp', amount: 850, status: 'pending', dueDate: '2024-12-08', createdAt: '2024-11-20' },
    { id: '3', number: 'INV-1003', client: 'Tech Solutions', amount: 2100, status: 'pending', dueDate: '2024-12-10', createdAt: '2024-11-22' },
    { id: '4', number: 'INV-1004', client: 'Design Co', amount: 650, status: 'overdue', dueDate: '2024-11-28', createdAt: '2024-11-10' },
  ]);

  const statusVariant = {
    paid: 'success' as const,
    pending: 'warning' as const,
    overdue: 'error' as const,
    draft: 'default' as const,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage your invoices and payments</p>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          style={{ backgroundColor: '#fc6813' }}
        >
          <Plus className="w-5 h-5" />
          Create Invoice
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search invoices..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
          <option>All Status</option>
          <option>Paid</option>
          <option>Pending</option>
          <option>Overdue</option>
        </select>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Invoice</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Client</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Due Date</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="font-semibold text-gray-900">{invoice.number}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-700">{invoice.client}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">£{invoice.amount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <Badge variant={statusVariant[invoice.status]}>
                    {invoice.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-gray-700">{invoice.dueDate}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
