"use client";

import { useState, useEffect, useCallback, type ReactNode, type ElementType } from 'react';
import {
  Plus, Eye, Copy, Edit, Trash2, X, FileText, BarChart3,
  Clock, CheckCircle, Link as LinkIcon, Download,
  MessageSquare, GripVertical, Type,
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

const FIELD_TYPES: { value: FieldType; label: string; icon: ElementType }[] = [
  { value: 'text',     label: 'Short Text', icon: Type },
  { value: 'textarea', label: 'Long Text',  icon: AlignLeft },
  { value: 'email',    label: 'Email',      icon: Mail },
  { value: 'phone',    label: 'Phone',      icon: Phone },
  { value: 'number',   label: 'Number',     icon: Hash },
  { value: 'date',     label: 'Date',       icon: Calendar },
  { value: 'select',   label: 'Dropdown',   icon: ChevronDown },
  { value: 'checkbox', label: 'Checkbox',   icon: FileText },
];

const CATEGORIES = ['Contact', 'Survey', 'HR', 'Event', 'Sales', 'Support', 'Accounting', 'Contract', 'Other'];

const blankField = (): FormField => ({
  id: crypto.randomUUID(),
  label: '',
  type: 'text',
  required: false,
  placeholder: '',
});

const inputCls = 'w-full px-3 py-1.5 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-sm font-medium bg-white';

const ModalHandle = () => (
  <div className="flex justify-center pt-2 pb-0 sm:hidden shrink-0">
    <div className="w-10 h-1 rounded-full bg-gray-300" />
  </div>
);

const ModalFooter = ({ children }: { children: ReactNode }) => (
  <div className="shrink-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 flex flex-row gap-2.5 pb-[calc(1.25rem+env(safe-area-inset-bottom,12px))] sm:pb-3">
    {children}
  </div>
);

const CancelBtn = ({ onClick, label = 'Cancel' }: { onClick: () => void; label?: string }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex-1 py-3 px-5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
  >
    {label}
  </button>
);

const statusColor = (s: Form['status']) =>
  s === 'active' ? 'bg-emerald-100 text-emerald-700' :
  s === 'draft'  ? 'bg-gray-100 text-gray-600' :
                   'bg-red-100 text-red-600';

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

  const resetCreate = () => {
    setNewForm({ name: '', description: '', category: 'Contact', status: 'active', webhookUrl: '', fieldList: [] });
    setNewField(blankField());
    setShowCreateModal(false);
  };

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
      resetCreate();
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
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8">

      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-xl shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Form Builder</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Create and manage custom forms</p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Form</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="sm:hidden fixed bottom-24 right-6 w-14 h-14 bg-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center z-30 active:scale-95 transition-all cursor-pointer hover:bg-purple-700"
      >
        <Plus className="w-8 h-8" />
      </button>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Forms',     value: forms.length,   icon: FileText,    bg: 'bg-blue-100',    ic: 'text-blue-600',    val: 'text-blue-700' },
            { label: 'Active Forms',    value: activeForms,    icon: CheckCircle, bg: 'bg-emerald-100', ic: 'text-emerald-600', val: 'text-emerald-700' },
            { label: 'Total Responses', value: totalResponses, icon: MessageSquare, bg: 'bg-purple-100', ic: 'text-purple-600', val: 'text-purple-700' },
            { label: 'Avg / Form',      value: avgResponses,   icon: BarChart3,   bg: 'bg-orange-100',  ic: 'text-orange-600',  val: 'text-orange-700' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${s.bg}`}>
                  <s.icon className={`w-4 h-4 ${s.ic}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${s.val}`}>{s.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Forms list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Loading forms…</p>
          </div>
        ) : forms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No forms yet</h3>
            <p className="text-sm text-gray-500 mb-5">Create your first form to start collecting responses.</p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Your First Form
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms.map((form) => (
              <div key={form.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                {/* Color strip by status */}
                <div className={`h-1 w-full ${form.status === 'active' ? 'bg-emerald-500' : form.status === 'draft' ? 'bg-gray-300' : 'bg-red-400'}`} />

                <div className="p-4 flex-1 flex flex-col gap-3">
                  {/* Form name + status */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl shrink-0">
                      <FileText className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-gray-900 leading-snug truncate">{form.name}</h3>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${statusColor(form.status)}`}>
                          {form.status}
                        </span>
                      </div>
                      {form.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{form.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 rounded-xl p-2.5 border border-blue-100">
                      <p className="text-lg font-bold text-blue-800">{form.responses}</p>
                      <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide">Responses</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-2.5 border border-purple-100">
                      <p className="text-lg font-bold text-purple-800">{form.fields}</p>
                      <p className="text-[10px] font-semibold text-purple-500 uppercase tracking-wide">Fields</p>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {form.createdAt}
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-medium">{form.category}</span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-1.5 mt-auto pt-1 border-t border-gray-50">
                    <button
                      type="button"
                      onClick={() => { setSelectedForm(form); setShowViewModal(true); }}
                      className="flex items-center justify-center gap-1.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(form.id)}
                      className="flex items-center justify-center gap-1.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <LinkIcon className="w-3.5 h-3.5" /> Copy Link
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditForm(form); setShowEditModal(true); }}
                      className="flex items-center justify-center gap-1.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteForm(form)}
                      className="flex items-center justify-center gap-1.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Create Form Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 sm:p-4 pb-10 sm:pb-4">
          <div className="bg-white w-full sm:max-w-lg flex flex-col overflow-hidden max-h-[66dvh] sm:max-h-[92vh] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-white/20 transform animate-in slide-in-from-bottom-10 duration-300">
            <ModalHandle />
            <div className="bg-linear-to-r from-purple-600 to-indigo-700 px-5 sm:px-6 py-2 sm:py-5 flex items-center justify-between shrink-0 shadow-lg">
              <h2 className="text-sm sm:text-lg font-bold text-white flex items-center gap-2 tracking-tight">
                <Plus className="w-4 h-4" /> Create New Form
              </h2>
              <button type="button" onClick={resetCreate} className="p-2 hover:bg-white/20 rounded-xl transition-all cursor-pointer text-white">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 py-1.5 sm:py-5 space-y-2 sm:space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Form Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className={inputCls}
                  placeholder="e.g., Contact Form"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                  <select
                    value={newForm.category}
                    onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                    className={inputCls}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                  <select
                    value={newForm.status}
                    onChange={(e) => setNewForm({ ...newForm, status: e.target.value as Form['status'] })}
                    className={inputCls}
                  >
                    <option value="active">Active (Public)</option>
                    <option value="draft">Draft (Private)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                <textarea
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  className={`${inputCls} h-18 resize-none`}
                  placeholder="What is this form for?"
                />
              </div>

              {/* Field builder */}
              <div className="border border-dashed border-purple-200 rounded-xl p-2.5 space-y-2 bg-purple-50/30">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                    <GripVertical className="w-3.5 h-3.5" /> Form Fields
                  </p>
                  {newForm.fieldList.length > 0 && (
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                      {newForm.fieldList.length} added
                    </span>
                  )}
                </div>

                {/* Added fields */}
                {newForm.fieldList.length > 0 && (
                  <div className="space-y-1.5 max-h-28 overflow-y-auto">
                    {newForm.fieldList.map((field, idx) => {
                      const ft = FIELD_TYPES.find(t => t.value === field.type);
                      return (
                        <div key={field.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
                          <span className="text-[10px] font-bold text-gray-300 w-4 shrink-0">{idx + 1}</span>
                          {ft && <ft.icon className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
                          <span className="flex-1 text-xs font-semibold text-gray-700 truncate">{field.label}</span>
                          <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded font-semibold hidden sm:block">{ft?.label}</span>
                          {field.required && <span className="text-[10px] text-red-500 font-bold shrink-0">Req</span>}
                          <button type="button" onClick={() => removeFieldFromNew(field.id)} className="p-1 hover:bg-red-50 rounded transition-colors shrink-0">
                            <X className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add field row */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Field Label</label>
                    <input
                      type="text"
                      value={newField.label}
                      onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && addFieldToNew()}
                      placeholder="e.g., Full Name"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-xs font-medium bg-white"
                    />
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Type</label>
                      <select
                        value={newField.type}
                        onChange={(e) => setNewField({ ...newField, type: e.target.value as FieldType })}
                        className="w-full px-2.5 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-xs font-medium bg-white cursor-pointer"
                      >
                        {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Req.</label>
                      <button
                        type="button"
                        onClick={() => setNewField(prev => ({ ...prev, required: !prev.required }))}
                        className={`w-9 h-5 rounded-full transition-colors ${newField.required ? 'bg-purple-600' : 'bg-gray-200'}`}
                      >
                        <span className={`block w-3 h-3 bg-white rounded-full shadow transition-transform mx-1 ${newField.required ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={addFieldToNew}
                      disabled={!newField.label.trim()}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <ModalFooter>
              <CancelBtn onClick={resetCreate} />
              <button
                type="button"
                onClick={handleCreateForm}
                disabled={!newForm.name || newForm.fieldList.length === 0}
                className="flex-2 py-2.5 px-5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create Form
              </button>
            </ModalFooter>
          </div>
        </div>
      )}

      {/* ── Edit Form Modal ── */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 sm:p-4 pb-10 sm:pb-4">
          <div className="bg-white w-full sm:max-w-lg flex flex-col overflow-hidden max-h-[66dvh] sm:max-h-[92vh] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-white/20 transform animate-in slide-in-from-bottom-10 duration-300">
            <ModalHandle />
            <div className="bg-linear-to-r from-amber-500 to-orange-600 px-5 sm:px-6 py-2 sm:py-5 flex items-center justify-between shrink-0 shadow-lg">
              <h2 className="text-sm sm:text-lg font-bold text-white flex items-center gap-2 tracking-tight">
                <Edit className="w-4 h-4" /> Edit Form
              </h2>
              <button type="button" onClick={() => { setShowEditModal(false); setEditForm(null); }} className="p-2 hover:bg-white/20 rounded-xl transition-all cursor-pointer text-white">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 py-1.5 sm:py-5 space-y-2 sm:space-y-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Form Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className={`${inputCls} h-20 resize-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className={inputCls}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Form['status'] })}
                    className={inputCls}
                  >
                    <option value="active">Active (Public)</option>
                    <option value="draft">Draft (Private)</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Webhook URL <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="url"
                  value={editForm.webhookUrl || ''}
                  onChange={(e) => setEditForm({ ...editForm, webhookUrl: e.target.value })}
                  placeholder="https://example.com/webhook"
                  className={inputCls}
                />
              </div>
            </div>

            <ModalFooter>
              <CancelBtn onClick={() => { setShowEditModal(false); setEditForm(null); }} />
              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex-2 py-3 px-5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Save Changes
              </button>
            </ModalFooter>
          </div>
        </div>
      )}

      {/* ── View Form Modal ── */}
      {showViewModal && selectedForm && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 sm:p-4 pb-10 sm:pb-4">
          <div className="bg-white w-full sm:max-w-lg flex flex-col overflow-hidden max-h-[66dvh] sm:max-h-[92vh] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-white/20 transform animate-in slide-in-from-bottom-10 duration-300">
            <ModalHandle />
            <div className="bg-linear-to-r from-blue-600 to-indigo-700 px-5 sm:px-6 py-2 sm:py-5 flex items-center justify-between shrink-0 shadow-lg">
              <h2 className="text-sm sm:text-lg font-bold text-white flex items-center gap-2 tracking-tight">
                <Eye className="w-4 h-4" /> Form Details
              </h2>
              <button type="button" onClick={() => setShowViewModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all cursor-pointer text-white">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 py-1.5 sm:py-5 space-y-2 sm:space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedForm.name}</h3>
                {selectedForm.description && (
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{selectedForm.description}</p>
                )}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 text-center">
                  <p className="text-2xl font-bold text-blue-800">{selectedForm.responses}</p>
                  <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide">Responses</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 border border-purple-100 text-center">
                  <p className="text-2xl font-bold text-purple-800">{selectedForm.fields}</p>
                  <p className="text-[10px] font-semibold text-purple-500 uppercase tracking-wide">Fields</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                  <p className={`text-sm font-bold mt-1 uppercase ${
                    selectedForm.status === 'active' ? 'text-emerald-700' :
                    selectedForm.status === 'draft' ? 'text-gray-600' : 'text-red-600'
                  }`}>{selectedForm.status}</p>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Status</p>
                  {selectedForm.status !== 'active' && (
                    <button
                      type="button"
                      onClick={() => handleActivateForm(selectedForm.id)}
                      className="mt-1.5 px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer w-full"
                    >
                      Activate
                    </button>
                  )}
                </div>
              </div>

              {/* Field list */}
              {selectedForm.fieldList?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <GripVertical className="w-3.5 h-3.5" /> Fields in this form
                  </p>
                  <div className="space-y-1.5">
                    {selectedForm.fieldList.map((field, idx) => {
                      const ft = FIELD_TYPES.find(t => t.value === field.type);
                      return (
                        <div key={field.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                          <span className="text-xs font-bold text-gray-300 w-5 shrink-0">{idx + 1}</span>
                          {ft && <ft.icon className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
                          <span className="flex-1 text-sm font-semibold text-gray-800 truncate">{field.label}</span>
                          <span className="text-[10px] text-gray-400 bg-white px-2 py-0.5 rounded-lg border border-gray-200 hidden sm:block">{ft?.label}</span>
                          {field.required && <span className="text-[10px] text-red-500 font-bold shrink-0">Req</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Public link */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
                <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5" /> Public Form Link
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href={formLink(selectedForm.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium break-all flex-1"
                  >
                    {formLink(selectedForm.id)}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(selectedForm.id)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            <ModalFooter>
              <CancelBtn onClick={() => setShowViewModal(false)} label="Close" />
              <button
                type="button"
                onClick={() => {
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
                className="flex-2 py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Export Data
              </button>
            </ModalFooter>
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
