import React from 'react';
import { UserCheck, Plus } from 'lucide-react';

export function EmployeeList() {
  const employees = [
    { id: '1', name: 'John Smith', role: 'Manager', department: 'Sales', email: 'john@company.com' },
    { id: '2', name: 'Jane Doe', role: 'Developer', department: 'IT', email: 'jane@company.com' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">HR Records</h1>
        <button className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-lg" style={{ backgroundColor: '#fc6813' }}>
          <Plus className="w-5 h-5" />
          Add Employee
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {employees.map((emp) => (
          <div key={emp.id} className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl">
                👤
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{emp.name}</h3>
                <p className="text-sm text-gray-600">{emp.role} • {emp.department}</p>
                <p className="text-sm text-gray-500">{emp.email}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
