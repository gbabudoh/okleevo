"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Eye, Copy, Edit, Trash2, X, FileText, BarChart3, Users,
  Clock, CheckCircle, Link as LinkIcon, Download,
  MessageSquare, TrendingUp, GripVertical, ToggleLeft, Type,
  Hash, Mail, Phone, Calendar, AlignLeft, ChevronDown, Loader2
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import StatusModal from '@/components/StatusModal';

type FieldType = 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date';

interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
}

interface Form {
  id: string;
  name: string;
  description?: string;
  responses: number;
  status: 'active' | 'draft' | 'closed';
  createdAt: string;
  fields: number;
  fieldList: FormField[];
  category: string;
  webhookUrl?: string;
}

const FIELD_TYPES: { value: FieldType; label: string; icon: React.ElementType }[] = [
  { value: 'text',     label: 'Short Text',  icon: Type },
  { value: 'textarea', label: 'Long Text',   icon: AlignLeft },
  { value: 'email',    label: 'Email',       icon: Mail },
  { value: 'phone',    label: 'Phone',       icon: Phone },
  { value: 'number',   label: 'Number',      icon: Hash },
  { value: 'date',     label: 'Date',        icon: Calendar },
  { value: 'select',   label: 'Dropdown',    icon: ChevronDown },
  { value: 'checkbox', label: 'Checkbox',    icon: ToggleLeft },
];

const CATEGORIES = ['Contact', 'Survey', 'HR', 'Event', 'Sales', 'Support', 'Accounting', 'Contract', 'Other'];

const blankField = (): FormField => ({
  id: crypto.randomUUID(),
  label: '',
  type: 'text',
  required: false,
  placeholder: '',
});

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [editForm, setEditForm] = useState<Form | null>(null);
  const [deletingForm, setDeletingForm] = useState<Form | null>(null);

  const [newForm, setNewForm] = useState<{
    name: string;
    description: string;
    category: string;
    status: Form['status'];
    webhookUrl: string;
    fieldList: FormField[];
  }>({
    name: '',
    description: '',
    category: 'Contact',
    status: 'active',
    webhookUrl: '',
    fieldList: [],
  });
  const [newField, setNewField] = useState<FormField>(blankField());

  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info';
  }>({ isOpen: false, title: '', message: '', type: 'success' });

  const showStatus = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success') =>
    setStatusModal({ isOpen: true, title, message, type });

  const totalResponses = forms.reduce((sum, f) => sum + f.responses, 0);
  const activeForms = forms.filter(f => f.status === 'active').length;
  const avgResponses = forms.length > 0 ? Math.round(totalResponses / forms.length) : 0;

  const fetchForms = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/forms');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setForms(data);
      }
    } catch {
      // silently fall back to empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchForms(); }, [fetchForms]);

  const addFieldToNew = () => {
    if (!newField.label.trim()) return;
    setNewForm(prev => ({ ...prev, fieldList: [...prev.fieldList, { ...newField }] }));
    setNewField(blankField());
  };

  const removeFieldFromNew = (id: string) =>
    setNewForm(prev => ({ ...prev, fieldList: prev.fieldList.filter(f => f.id !== id) }));

  const handleCreateForm = async () => {
    const payload = {
      name: newForm.name,
      description: newForm.description,
      category: newForm.category,
      webhookUrl: newForm.webhookUrl || undefined,
      fieldList: newForm.fieldList,
      status: newForm.status,
    };
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || 'Failed to create form');
      }
      const saved = await res.json();
      setForms(prev => [saved, ...prev]);
      setShowCreateModal(false);
      setNewForm({ name: '', description: '', category: 'Contact', status: 'active', webhookUrl: '', fieldList: [] });
      setNewField(blankField());
      showStatus('Form Created', `"${saved.name}" was created with ${saved.fieldList?.length ?? 0} fields.`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create form. Please try again.';
      showStatus('Error', message, 'error');
    }
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;
    try {
      const res = await fetch(`/api/forms/${editForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setForms(prev => prev.map(f => f.id === updated.id ? updated : f));
      setShowEditModal(false);
      setEditForm(null);
      showStatus('Form Updated', 'Your changes have been saved.');
    } catch {
      showStatus('Error', 'Failed to update form. Please try again.', 'error');
    }
  };

  const handleActivateForm = async (formId: string) => {
    try {
      const res = await fetch(`/api/forms/${formId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setForms(prev => prev.map(f => f.id === updated.id ? updated : f));
      setSelectedForm(updated);
      showStatus('Form Activated', 'Your form is now live and public.');
    } catch {
      showStatus('Error', 'Failed to activate form.', 'error');
    }
  };

  const handleCopyLink = async (formId: string) => {
    const link = `${window.location.origin}/forms/${formId}`;
    await navigator.clipboard.writeText(link);
    showStatus('Link Copied', 'The public form link has been copied to your clipboard.', 'info');
  };

  const handleDeleteForm = (form: Form) => {
    setDeletingForm(form);
    setShowDeleteModal(true);
  };

  const formLink = (id: string) =>
    typeof window !== 'undefined' ? `${window.location.origin}/forms/${id}` : `/forms/${id}`;

  return (
    <div className="relative min-h-screen pb-20 overflow-hidden">
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
              <div className="p-4 bg-linear-to-br from-purple-600 to-blue-600 rounded-2xl shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-500">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1 text-center md:text-left">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                  Form <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600">Builder</span>
                </h1>
                <p className="text-gray-500 font-medium">Create and manage custom forms with ease</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Create New Form
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Forms',     value: forms.length,   sub: 'All time',    icon: FileText,    color: 'from-blue-500 to-blue-600',    bg: 'bg-blue-500/10',    text: 'text-blue-600',    border: 'hover:border-blue-500/50',    badge: 'Total' },
            { label: 'Active Forms',    value: activeForms,    sub: 'Live now',    icon: CheckCircle, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'hover:border-emerald-500/50', badge: 'Active' },
            { label: 'Total Responses', value: totalResponses, sub: 'Submissions', icon: Users,       color: 'from-purple-500 to-purple-600', bg: 'bg-purple-500/10',  text: 'text-purple-600',  border: 'hover:border-purple-500/50',  badge: 'Volume' },
            { label: 'Avg per Form',    value: avgResponses,   sub: 'Average',     icon: BarChart3,   color: 'from-orange-500 to-orange-600', bg: 'bg-orange-500/10',  text: 'text-orange-600',  border: 'hover:border-orange-500/50',  badge: 'Rate' },
          ].map((s, i) => (
            <div key={i} className={`bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group ${s.border}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3.5 rounded-2xl bg-linear-to-br ${s.color} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${s.bg} ${s.text}`}>{s.badge}</div>
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 opacity-80">{s.label}</p>
              <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{s.value}</h3>
              <p className="text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition-colors flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {s.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Forms Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
            <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Loading forms...</p>
          </div>
        ) : forms.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-16 border border-white/50 shadow-xl text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No forms yet</h3>
            <p className="text-gray-500 mb-6">Create your first form to start collecting responses.</p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Your First Form
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {forms.map((form) => (
              <div key={form.id} className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-lg hover:shadow-xl hover:scale-[1.01] hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col">
                <div className="bg-linear-to-r from-purple-600 via-blue-600 to-indigo-600 p-6 relative">
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-50" />
                  <div className="relative flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white tracking-tight">{form.name}</h3>
                      </div>
                      <p className="text-blue-50 text-sm font-medium leading-relaxed opacity-90">{form.description}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border border-white/20 ${
                      form.status === 'active' ? 'bg-emerald-500 text-white' :
                      form.status === 'draft'  ? 'bg-gray-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6 flex-1 flex flex-col">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
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
                    <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100">
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

                  <div className="grid grid-cols-2 gap-3 pt-2 mt-auto">
                    <button type="button" onClick={() => { setSelectedForm(form); setShowViewModal(true); }}
                      className="px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer font-bold text-sm">
                      <Eye className="w-4 h-4" /> Details
                    </button>
                    <button type="button" onClick={() => handleCopyLink(form.id)}
                      className="px-4 py-2.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer font-bold text-sm">
                      <LinkIcon className="w-4 h-4" /> Copy Link
                    </button>
                    <button type="button" onClick={() => { setEditForm(form); setShowEditModal(true); }}
                      className="px-4 py-2.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer font-bold text-sm">
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button type="button" onClick={() => handleDeleteForm(form)}
                      className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer font-bold text-sm">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] max-w-xl w-full shadow-2xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-300">
            <div className="bg-linear-to-r from-purple-600 via-blue-600 to-indigo-600 px-6 py-3.5 flex items-center justify-between shrink-0 rounded-t-[2rem]">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create New Form
              </h2>
              <button type="button" onClick={() => setShowCreateModal(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 overflow-y-auto">
              {/* Name */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Form Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none font-medium text-sm"
                  placeholder="e.g., Contact Form"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {/* Category */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Category</label>
                  <select
                    value={newForm.category}
                    onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none font-medium appearance-none cursor-pointer text-sm"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Status</label>
                  <select
                    value={newForm.status}
                    onChange={(e) => setNewForm({ ...newForm, status: e.target.value as Form['status'] })}
                    className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none font-medium appearance-none cursor-pointer text-sm"
                  >
                    <option value="active">Active (Public)</option>
                    <option value="draft">Draft (Private)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Description</label>
                <textarea
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none h-16 resize-none text-sm"
                  placeholder="What is this form for?"
                />
              </div>

              {/* ── Field Builder ── */}
              <div className="border-2 border-dashed border-purple-100 rounded-xl p-4 space-y-3 bg-purple-50/20">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <GripVertical className="w-3 h-3" />
                  Form Fields
                  {newForm.fieldList.length > 0 && (
                    <span className="ml-auto text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-black">
                      {newForm.fieldList.length} ADDED
                    </span>
                  )}
                </p>

                {/* Added fields list */}
                {newForm.fieldList.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {newForm.fieldList.map((field, idx) => {
                      const ft = FIELD_TYPES.find(t => t.value === field.type);
                      return (
                        <div key={field.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-gray-100 shadow-sm">
                          <span className="text-[10px] font-black text-gray-300 w-4">{idx + 1}</span>
                          {ft && <ft.icon className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
                          <span className="flex-1 text-xs font-semibold text-gray-700 truncate">{field.label}</span>
                          <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded uppercase font-black">{ft?.label}</span>
                          <button type="button" onClick={() => removeFieldFromNew(field.id)} className="p-1 hover:bg-red-50 rounded transition-colors">
                            <X className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add field row */}
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-end">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-1">Field Label</label>
                    <input
                      type="text"
                      value={newField.label}
                      onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && addFieldToNew()}
                      placeholder="e.g., Full Name"
                      className="w-full px-3 py-1.5 border-2 border-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-1">Type</label>
                    <select
                      value={newField.type}
                      onChange={(e) => setNewField({ ...newField, type: e.target.value as FieldType })}
                      className="px-2 py-1.5 border-2 border-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-xs font-medium cursor-pointer"
                    >
                      {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Req.</label>
                    <button
                      type="button"
                      onClick={() => setNewField(prev => ({ ...prev, required: !prev.required }))}
                      className={`w-8 h-5 rounded-full transition-colors ${newField.required ? 'bg-purple-600' : 'bg-gray-200'}`}
                    >
                      <span className={`block w-3 h-3 bg-white rounded-full shadow transition-transform mx-1 ${newField.required ? 'translate-x-3' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={addFieldToNew}
                    disabled={!newField.label.trim()}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-black transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> ADD
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-100 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-all cursor-pointer text-sm">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateForm}
                  disabled={!newForm.name || newForm.fieldList.length === 0}
                  className="flex-2 px-4 py-2.5 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl font-black cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm tracking-tight"
                >
                  <Plus className="w-4 h-4" />
                  CREATE FORM
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Form Modal ── */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh]">
            <div className="bg-linear-to-r from-amber-500 via-orange-500 to-red-500 px-6 py-4 flex items-center justify-between shrink-0 rounded-t-3xl">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <Edit className="w-5 h-5" /> Edit Form
              </h2>
              <button type="button" onClick={() => { setShowEditModal(false); setEditForm(null); }}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Form Name</label>
                  <input type="text" value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none font-medium text-sm" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                  <textarea value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none h-20 resize-none text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Category</label>
                  <select value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none font-medium cursor-pointer text-sm">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Status</label>
                  <select value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Form['status'] })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none font-medium cursor-pointer text-sm">
                    <option value="active">Active (Public)</option>
                    <option value="draft">Draft (Private)</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Webhook URL <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="url" value={editForm.webhookUrl || ''}
                    onChange={(e) => setEditForm({ ...editForm, webhookUrl: e.target.value })}
                    placeholder="https://example.com/webhook"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none font-medium text-sm" />
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => { setShowEditModal(false); setEditForm(null); }}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-all cursor-pointer text-sm">
                  Cancel
                </button>
                <button type="button" onClick={handleSaveEdit}
                  className="flex-1 px-4 py-3 bg-linear-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl font-bold cursor-pointer hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── View Form Modal ── */}
      {showViewModal && selectedForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] shadow-2xl flex flex-col">
            <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between shrink-0 rounded-t-3xl">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <Eye className="w-5 h-5" /> Form Details
              </h2>
              <button type="button" onClick={() => setShowViewModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-gray-900">{selectedForm.name}</h3>
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
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">Status</p>
                    <p className="text-xl font-black text-emerald-800 uppercase">{selectedForm.status}</p>
                  </div>
                  {selectedForm.status !== 'active' && (
                    <button
                      type="button"
                      onClick={() => handleActivateForm(selectedForm.id)}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all cursor-pointer shadow-sm"
                    >
                      ACTIVATE FORM
                    </button>
                  )}
                </div>
              </div>

              {/* Field list preview */}
              {selectedForm.fieldList?.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400" /> Fields in this form
                  </p>
                  <div className="space-y-2">
                    {selectedForm.fieldList.map((field, idx) => {
                      const ft = FIELD_TYPES.find(t => t.value === field.type);
                      return (
                        <div key={field.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200">
                          <span className="text-xs font-bold text-gray-400 w-5">{idx + 1}</span>
                          {ft && <ft.icon className="w-4 h-4 text-purple-500" />}
                          <span className="flex-1 text-sm font-semibold text-gray-800">{field.label}</span>
                          <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-lg border border-gray-200">{ft?.label}</span>
                          {field.required && <span className="text-xs text-red-500 font-bold">Required</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                  <LinkIcon className="w-3.5 h-3.5" /> Public Form Link
                </p>
                <div className="flex items-center gap-2">
                  <a 
                    href={formLink(selectedForm.id)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-bold break-all flex-1"
                  >
                    {formLink(selectedForm.id)}
                  </a>
                  <button type="button" onClick={() => handleCopyLink(selectedForm.id)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer shrink-0">
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowViewModal(false)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-all cursor-pointer text-sm">
                  Close
                </button>
                <button type="button" onClick={() => {
                  const csv = `Form: ${selectedForm.name}\nTotal Responses: ${selectedForm.responses}\nFields: ${selectedForm.fields}\n\nExported: ${new Date().toLocaleString()}`;
                  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedForm.name.replace(/\s+/g, '-').toLowerCase()}-responses.csv`;
                  document.body.appendChild(a); a.click(); document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  showStatus('Export Complete', `${selectedForm.name} responses exported to CSV.`);
                }}
                  className="px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold cursor-pointer shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm">
                  <Download className="w-4 h-4" /> Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deletingForm && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeletingForm(null); }}
          onConfirm={async () => {
            try {
              const res = await fetch(`/api/forms/${deletingForm.id}`, { method: 'DELETE' });
              if (!res.ok) throw new Error();
              setForms(prev => prev.filter(f => f.id !== deletingForm.id));
              setShowDeleteModal(false);
              setDeletingForm(null);
              showStatus('Form Deleted', `"${deletingForm.name}" has been permanently removed.`);
            } catch {
              showStatus('Error', 'Failed to delete form. Please try again.', 'error');
            }
          }}
          title="Delete Form"
          itemName={deletingForm.name}
          itemDetails={`${deletingForm.responses} responses · ${deletingForm.category}`}
          warningMessage="This will permanently remove this form and all its responses."
        />
      )}

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
      />
    </div>
  );
}
