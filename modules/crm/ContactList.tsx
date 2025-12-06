"use client";

import React, { useState } from 'react';
import { Users, Plus, Search, Mail, Phone, MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'lead' | 'active' | 'inactive';
  avatar: string;
}

export function ContactList() {
  const [contacts] = useState<Contact[]>([
    { id: '1', name: 'John Smith', email: 'john@abc.com', phone: '07123456789', company: 'ABC Ltd', status: 'active', avatar: '👨' },
    { id: '2', name: 'Jane Doe', email: 'jane@xyz.com', phone: '07987654321', company: 'XYZ Corp', status: 'lead', avatar: '👩' },
    { id: '3', name: 'Bob Johnson', email: 'bob@tech.com', phone: '07555123456', company: 'Tech Solutions', status: 'active', avatar: '👨‍💼' },
    { id: '4', name: 'Alice Brown', email: 'alice@design.com', phone: '07444987654', company: 'Design Co', status: 'inactive', avatar: '👩‍💼' },
  ]);

  const statusVariant = {
    lead: 'info' as const,
    active: 'success' as const,
    inactive: 'default' as const,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-1">Manage your customer relationships</p>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          style={{ backgroundColor: '#fc6813' }}
        >
          <Plus className="w-5 h-5" />
          Add Contact
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
          <option>All Status</option>
          <option>Lead</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* Contact Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-3xl">
                {contact.avatar}
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-1">{contact.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{contact.company}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{contact.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{contact.phone}</span>
              </div>
            </div>
            
            <Badge variant={statusVariant[contact.status]}>
              {contact.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
