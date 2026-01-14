"use client";

import React, { useState } from 'react';
import { Plus, Eye, Copy, Edit, Trash2, X, FileText, BarChart3, Users, Clock, CheckCircle, Link as LinkIcon, Download, Settings, MessageSquare, TrendingUp } from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [editForm, setEditForm] = useState<Form | null>(null);
  const [deletingForm, setDeletingForm] = useState<Form | null>(null);
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

  const handleDeleteForm = (form: Form) => {
    setDeletingForm(form);
    setShowDeleteModal(true);
  };

  const categories = ['Contact', 'Survey', 'HR', 'Event', 'Sales', 'Support', 'Accounting', 'Contract', 'Other'];

  return (
    <div className="relative min-h-screen pb-20 overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-[20%] right-[30%] w-[60%] h-[60%] rounded-full bg-indigo-300/10 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-8 p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-500">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1 text-center md:text-left">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                  Form <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Builder</span>
                </h1>
                <p className="text-gray-500 font-medium">Create and manage custom forms with ease</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Create New Form
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group hover:border-blue-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600">Total</div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 opacity-80">Total Forms</p>
              <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{forms.length}</h3>
              <p className="text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition-colors flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> All time
              </p>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group hover:border-emerald-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600">Active</div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 opacity-80">Active Forms</p>
              <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{activeForms}</h3>
              <p className="text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition-colors flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Live now
              </p>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group hover:border-purple-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600">Volume</div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 opacity-80">Total Responses</p>
              <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{totalResponses}</h3>
              <p className="text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition-colors flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> Submissions
              </p>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group hover:border-orange-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600">Rate</div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 opacity-80">Avg per Form</p>
              <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{avgResponses}</h3>
              <p className="text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition-colors flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Average
              </p>
            </div>
          </div>
        </div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {forms.map((form) => (
            <div key={form.id} className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-lg hover:shadow-xl hover:scale-[1.01] hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col">
              {/* Form Header with Gradient */}
              <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6 relative">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-50"></div>
                <div className="relative flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-tight">{form.name}</h3>
                    </div>
                    <p className="text-blue-50 text-sm font-medium leading-relaxed opacity-90">{form.description}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg border border-white/20 ${
                    form.status === 'active' ? 'bg-emerald-500 text-white' : 
                    form.status === 'draft' ? 'bg-gray-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {form.status}
                  </span>
                </div>
              </div>

              {/* Form Body */}
              <div className="p-6 space-y-6 flex-1 flex flex-col">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 group-hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-blue-900">{form.responses}</p>
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-wide">Responses</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100 group-hover:border-purple-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-purple-900">{form.fields}</p>
                        <p className="text-xs font-bold text-purple-400 uppercase tracking-wide">Fields</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{form.createdAt}</span>
                  </div>
                  <span className="px-3 py-1 text-xs bg-white text-gray-700 rounded-lg font-bold border border-gray-200 shadow-sm">
                    {form.category}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2 mt-auto">
                  <button 
                    onClick={() => {
                      setSelectedForm(form);
                      setShowViewModal(true);
                    }}
                    className="px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer font-bold text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Details
                  </button>
                  <button 
                    onClick={() => handleCopyLink(form.id)}
                    className="px-4 py-2.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer font-bold text-sm"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Copy
                  </button>
                  <button 
                    onClick={() => {
                      setEditForm(form);
                      setShowEditModal(true);
                    }}
                    className="px-4 py-2.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer font-bold text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleDeleteForm(form)}
                    className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer font-bold text-sm"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh]">
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <Plus className="w-5 h-5" />
                Create New Form
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Form Name</label>
                  <input
                    type="text"
                    value={newForm.name}
                    onChange={(e) => setNewForm({...newForm, name: e.target.value})}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium text-sm"
                    placeholder="e.g., Contact Form"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={newForm.description}
                    onChange={(e) => setNewForm({...newForm, description: e.target.value})}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-normal h-20 resize-none text-sm"
                    placeholder="Brief description of the form purpose..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Category</label>
                  <div className="relative">
                    <select
                      value={newForm.category}
                      onChange={(e) => setNewForm({...newForm, category: e.target.value})}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium appearance-none cursor-pointer text-sm"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <TrendingUp className="w-4 h-4 rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <div className="flex gap-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg h-fit">
                    <Settings className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900 mb-0.5">Next Steps</p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      You will be redirected to the Form Builder to drag & drop fields and customize styling.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-all cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateForm}
                  disabled={!newForm.name}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in zoom-in-95 duration-200">
           <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh]">
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-6 py-4 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <Edit className="w-5 h-5" />
                Edit Form
              </h2>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditForm(null);
                }} 
                className="p-2 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Form Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none font-medium text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none font-normal h-20 resize-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none font-medium cursor-pointer text-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value as 'active' | 'draft' | 'closed'})}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none font-medium cursor-pointer text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditForm(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-all cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setForms(forms.map(f => f.id === editForm.id ? editForm : f));
                    setShowEditModal(false);
                    setEditForm(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl font-bold cursor-pointer hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Form Modal */}
      {showViewModal && selectedForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] shadow-2xl flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <Eye className="w-5 h-5" />
                Form Details
              </h2>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-gray-900 leading-tight">{selectedForm.name}</h3>
                <p className="text-base text-gray-600 font-medium">{selectedForm.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Total Responses</p>
                  <p className="text-3xl font-black text-blue-900">{selectedForm.responses}</p>
                </div>
                <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1">Form Fields</p>
                  <p className="text-3xl font-black text-purple-900">{selectedForm.fields}</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">Current Status</p>
                  <p className="text-xl font-black text-emerald-800 uppercase">{selectedForm.status}</p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                  <LinkIcon className="w-3.5 h-3.5" />
                  Public Form Link
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/forms/${selectedForm.id}`}
                    readOnly
                    className="flex-1 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-xs font-medium text-gray-600 font-mono"
                  />
                  <button 
                    onClick={() => handleCopyLink(selectedForm.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all cursor-pointer font-bold shadow-lg hover:-translate-y-0.5"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="col-span-1 md:col-span-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-all cursor-pointer text-sm"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                     // Export logic matches existing
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
                  className="col-span-1 md:col-span-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold cursor-pointer shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
                <button 
                  onClick={() => alert('Form settings coming soon!')}
                  className="col-span-1 md:col-span-1 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-black font-bold cursor-pointer shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingForm && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingForm(null);
          }}
          onConfirm={() => {
            setForms(forms.filter(f => f.id !== deletingForm.id));
            alert('✓ Form deleted successfully!');
          }}
          title="Delete Form"
          itemName={deletingForm.name}
          itemDetails={`${deletingForm.responses} responses - ${deletingForm.category}`}
          warningMessage="This will permanently remove this form and all its responses."
        />
      )}
    </div>
  );
}
