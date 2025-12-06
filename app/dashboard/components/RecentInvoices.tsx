import React from 'react';
import { FileText, Download, Eye } from 'lucide-react';

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
}

export function RecentInvoices() {
  const invoices: Invoice[] = [
    { id: '1', number: 'INV-1001', client: 'ABC Ltd', amount: 1250, status: 'paid', dueDate: 'Dec 1' },
    { id: '2', number: 'INV-1002', client: 'XYZ Corp', amount: 850, status: 'pending', dueDate: 'Dec 8' },
    { id: '3', number: 'INV-1003', client: 'Tech Solutions', amount: 2100, status: 'pending', dueDate: 'Dec 10' },
    { id: '4', number: 'INV-1004', client: 'Design Co', amount: 650, status: 'overdue', dueDate: 'Nov 28' },
  ];

  const statusStyles = {
    paid: 'bg-emerald-50 text-emerald-700',
    pending: 'bg-orange-50 text-orange-700',
    overdue: 'bg-red-50 text-red-700',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Recent Invoices</h3>
        <FileText className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-3">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <p className="font-semibold text-gray-900">{invoice.number}</p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyles[invoice.status]}`}>
                  {invoice.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{invoice.client} • Due {invoice.dueDate}</p>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-bold text-gray-900">£{invoice.amount.toLocaleString()}</p>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        className="w-full mt-4 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
        style={{ backgroundColor: '#fc6813' }}
      >
        View All Invoices
      </button>
    </div>
  );
}
