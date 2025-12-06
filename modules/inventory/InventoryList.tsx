import React from 'react';
import { Package, Plus } from 'lucide-react';
import { Badge } from '@/components/ui';

export function InventoryList() {
  const items = [
    { id: '1', name: 'Product A', sku: 'SKU-001', quantity: 150, status: 'in-stock' },
    { id: '2', name: 'Product B', sku: 'SKU-002', quantity: 5, status: 'low-stock' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
        <button className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-lg" style={{ backgroundColor: '#fc6813' }}>
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">Product</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">SKU</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Quantity</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold">{item.name}</td>
                <td className="px-6 py-4">{item.sku}</td>
                <td className="px-6 py-4">{item.quantity}</td>
                <td className="px-6 py-4">
                  <Badge variant={item.status === 'in-stock' ? 'success' : 'warning'}>
                    {item.status}
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
