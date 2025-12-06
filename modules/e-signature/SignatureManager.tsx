import React from 'react';
import { PenTool, Plus, Download } from 'lucide-react';
import { Badge } from '@/components/ui';

export function SignatureManager() {
  const documents = [
    { id: '1', name: 'Contract - ABC Ltd', status: 'signed', date: '2024-12-01' },
    { id: '2', name: 'NDA - XYZ Corp', status: 'pending', date: '2024-12-05' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">E-Signature</h1>
        <button className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-lg" style={{ backgroundColor: '#fc6813' }}>
          <Plus className="w-5 h-5" />
          New Document
        </button>
      </div>
      <div className="space-y-4">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white rounded-xl border p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <PenTool className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                <p className="text-sm text-gray-600">{doc.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={doc.status === 'signed' ? 'success' : 'warning'}>
                {doc.status}
              </Badge>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Download className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
