import React from 'react';
import { Globe, Plus } from 'lucide-react';

export function PageBuilder() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Micro Pages</h1>
        <button className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-lg" style={{ backgroundColor: '#fc6813' }}>
          <Plus className="w-5 h-5" />
          Create Page
        </button>
      </div>
      <div className="bg-white rounded-xl border p-8 text-center">
        <Globe className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Build Landing Pages</h3>
        <p className="text-gray-600">Create custom micro-pages for your campaigns</p>
      </div>
    </div>
  );
}
