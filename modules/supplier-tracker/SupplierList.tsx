import React from 'react';
import { Truck, Plus } from 'lucide-react';

export function SupplierList() {
  const suppliers = [
    { id: '1', name: 'Supplier A', contact: 'John Doe', email: 'john@suppliera.com', phone: '07123456789' },
    { id: '2', name: 'Supplier B', contact: 'Jane Smith', email: 'jane@supplierb.com', phone: '07987654321' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Supplier Tracker</h1>
        <button className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-lg" style={{ backgroundColor: '#fc6813' }}>
          <Plus className="w-5 h-5" />
          Add Supplier
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-4 mb-4">
              <Truck className="w-8 h-8 text-orange-600" />
              <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Contact: {supplier.contact}</p>
              <p>Email: {supplier.email}</p>
              <p>Phone: {supplier.phone}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
