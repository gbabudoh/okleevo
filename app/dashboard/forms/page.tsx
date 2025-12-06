"use client";

import React, { useState } from 'react';
import { Plus, Eye, Copy, Edit, Trash2, X, FileText, BarChart3, Users, Clock, CheckCircle, Link as LinkIcon, Download, Settings, MessageSquare, Star, TrendingUp } from 'lucide-react';

interface Form {
  id: string;
  name: string;
  description?: string;
  responses: number;
  status: 'active' | 'draft' | 'closed';
  createdAt: string;
  fields: number;
  category: string;
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([
    { id: '1', name: 'Contact Form', description: 'General contact inquiries', responses: 45, status: 'active', createdAt: '2024-11-15', fields: 5, category: 'Contact' },
    { id: '2', name: 'Feedback Survey', description: 'Customer satisfaction survey', responses: 23, status: 'active', createdAt: '2024-11-20', fields: 8, category: 'Survey' },
    { id: '3', name: 'Job Application', description: 'Career opportunities form', responses: 12, status: 'draft', createdAt: '2024-12-01', fields: 12, category: 'HR' },
    { id: '4', name: 'Event Registration', description: 'Webinar sign-up form', responses: 67, status: 'active', createdAt: '2024-11-10', fields: 6, category: 'Event' },
    { id: '5', name: 'Product Inquiry', description: 'Product information requests', responses: 34, status: 'active', createdAt: '2024-11-25', fields: 7, category: 'Sales' },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [editForm, setEditForm] = useState<Form | null>(null);
  const [newForm, setNewForm] = useState({
    name: '',
    description: '',
    category: 'Contact'
  });

  const totalResponses = forms.reduce((sum, form) => sum + form.responses, 0);
  const activeForms = forms.filter(f => f.status === 'active').length;
  const avgResponses = forms.length > 0 ? Math.round(totalResponses / forms.length) : 0;

  const handleCreateForm = () => {
    const form: Form = {
      id: String(forms.length + 1),
      name: newForm.name,
      description: newForm.description,
      responses: 0,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      fields: 0,
      category: newForm.category
    };
    setForms([...forms, form]);
    setShowCreateModal(false);
    setNewForm({ name: '', description: '', category: 'Contact' });
  };

  const handleCopyLink = (formId: string) => {
    const link = `${window.location.origin}/forms/${formId}`;
    navigator.clipboard.writeText(link);
    alert('Form link copied to clipboard!');
  };

  const handleDeleteForm = (id: string) => {
    if (confirm('Are you sure you want to delete this form?')) {
      setForms(forms.filter(f => f.id !== id));
    }
  };

  const categories = ['Contact', 'Survey', 'HR', 'Event', 'Sales', 'Support', 'Other'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Form Builder
                </h1>
                <p className="text-gray-600 mt-1 text-lg">Create and manage custom forms with ease</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600"
          >
            <Plus className="w-5 h-5" />
            Create New Form
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <span className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent">{forms.length}</span>
            </div>
            <p className="text-gray-600 font-medium">Total Forms</p>
            <div className="mt-2 flex items-center gap-1 text-sm text-blue-600">
              <TrendingUp className="w-4 h-4" />
              <span>All time</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <span className="text-4xl font-bold bg-gradient-to-br from-green-600 to-green-700 bg-clip-text text-transparent">{activeForms}</span>
            </div>
            <p className="text-gray-600 font-medium">Active Forms</p>
            <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Live now</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                <Users className="w-7 h-7 text-white" />
              </div>
              <span className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-purple-700 bg-clip-text text-transparent">{totalResponses}</span>
            </div>
            <p className="text-gray-600 font-medium">Total Responses</p>
            <div className="mt-2 flex items-center gap-1 text-sm text-purple-600">
              <MessageSquare className="w-4 h-4" />
              <span>Submissions</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <span className="text-4xl font-bold bg-gradient-to-br from-orange-600 to-orange-700 bg-clip-text text-transparent">{avgResponses}</span>
            </div>
            <p className="text-gray-600 font-medium">Avg per Form</p>
            <div className="mt-2 flex items-center gap-1 text-sm text-orange-600">
              <TrendingUp className="w-4 h-4" />
              <span>Average rate</span>
            </div>
          </div>
        </div>

        {/* Forms Grid */}
        <div className="grid grid-cols-2 gap-6">
          {forms.map((form) => (
            <div key={form.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden border border-gray-100">
              {/* Form Header with Gradient */}
              <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                <div className="relative flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{form.name}</h3>
                    </div>
                    <p className="text-white/90 text-sm">{form.description}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-md ${
                    form.status === 'active' ? 'bg-green-500 text-white' : 
                    form.status === 'draft' ? 'bg-gray-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {form.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Form Body */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-700">{form.responses}</p>
                        <p className="text-xs text-blue-600 font-medium">Responses</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-700">{form.fields}</p>
                        <p className="text-xs text-purple-600 font-medium">Fields</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 font-medium">Created {form.createdAt}</span>
                  </div>
                  <span className="px-3 py-1 text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full font-semibold border border-purple-200">
                    {form.category}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => {
                      setSelectedForm(form);
                      setShowViewModal(true);
                    }}
                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer font-semibold shadow-md hover:shadow-lg hover:scale-105"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button 
                    onClick={() => handleCopyLink(form.id)}
                    className="px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer font-semibold shadow-md hover:shadow-lg hover:scale-105"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Copy Link
                  </button>
                  <button 
                    onClick={() => {
                      setEditForm(form);
                      setShowEditModal(true);
                    }}
                    className="px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer font-semibold shadow-md hover:shadow-lg hover:scale-105"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Form
                  </button>
                  <button 
                    onClick={() => handleDeleteForm(form.id)}
                    className="px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer font-semibold shadow-md hover:shadow-lg hover:scale-105"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary-500 to-accent-500">
              <h2 className="text-xl font-bold text-white">Create New Form</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Form Name</label>
                <input
                  type="text"
                  value={newForm.name}
                  onChange={(e) => setNewForm({...newForm, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Contact Form"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newForm.description}
                  onChange={(e) => setNewForm({...newForm, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 h-20"
                  placeholder="Brief description of the form"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newForm.category}
                  onChange={(e) => setNewForm({...newForm, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Next steps:</strong> After creating the form, you can add fields, customize styling, and configure submission settings.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateForm}
                  disabled={!newForm.name}
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                  style={{ backgroundColor: '#fc6813' }}
                >
                  Create Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary-500 to-accent-500">
              <h2 className="text-xl font-bold text-white">Edit Form</h2>
              <button onClick={() => {
                setShowEditModal(false);
                setEditForm(null);
              }} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Form Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Contact Form"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 h-20"
                  placeholder="Brief description of the form"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value as 'active' | 'draft' | 'closed'})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Form Builder:</strong> Use the form builder to add fields, customize styling, set validation rules, and configure notifications.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditForm(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setForms(forms.map(f => f.id === editForm.id ? editForm : f));
                    setShowEditModal(false);
                    setEditForm(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium cursor-pointer" 
                  style={{ backgroundColor: '#fc6813' }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Form Modal */}
      {showViewModal && selectedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary-500 to-accent-500">
              <h2 className="text-xl font-bold text-white">Form Details</h2>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedForm.name}</h3>
                <p className="text-gray-600 mt-1">{selectedForm.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-600 mb-1">Responses</p>
                  <p className="text-3xl font-bold text-blue-700">{selectedForm.responses}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-purple-600 mb-1">Fields</p>
                  <p className="text-3xl font-bold text-purple-700">{selectedForm.fields}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-600 mb-1">Status</p>
                  <p className="text-lg font-bold text-green-700">{selectedForm.status.toUpperCase()}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Form Link:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/forms/${selectedForm.id}`}
                    readOnly
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                  />
                  <button 
                    onClick={() => handleCopyLink(selectedForm.id)}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                    style={{ backgroundColor: '#fc6813' }}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    // Export responses as CSV
                    const csv = `Form: ${selectedForm.name}\nTotal Responses: ${selectedForm.responses}\n\nExported: ${new Date().toLocaleString()}`;
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${selectedForm.name.replace(/\s+/g, '-').toLowerCase()}-responses.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Responses
                </button>
                <button 
                  onClick={() => {
                    alert('Form settings coming soon! Configure submission emails, notifications, and more.');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium cursor-pointer flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Form Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
