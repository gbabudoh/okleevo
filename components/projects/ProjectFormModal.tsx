"use client";

import { useState, useEffect } from 'react';
import { X, Loader2, Plus, Pencil } from 'lucide-react';

interface ContactOption {
  id: string;
  name: string;
  company?: string;
}

interface TeamMemberOption {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
}

export type ProjectStatusValue = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';

export interface ProjectFormValues {
  name: string;
  contactId: string;
  status: ProjectStatusValue;
  startDate: string;
  dueDate: string;
  ownerId: string;
}

const STATUS_OPTIONS: ProjectStatusValue[] = ['ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'];

export default function ProjectFormModal({
  mode,
  initialValues,
  onClose,
  onSubmit,
  saving,
}: {
  mode: 'create' | 'edit';
  initialValues: ProjectFormValues;
  onClose: () => void;
  onSubmit: (values: ProjectFormValues) => void;
  saving: boolean;
}) {
  const [values, setValues] = useState<ProjectFormValues>(initialValues);
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberOption[]>([]);

  const dateRangeInvalid = !!(values.startDate && values.dueDate && values.startDate > values.dueDate);
  const canSubmit = !!values.name.trim() && !dateRangeInvalid;

  useEffect(() => {
    fetch('/api/crm')
      .then(res => res.json())
      .then(data => setContacts(Array.isArray(data) ? data : []))
      .catch(() => setContacts([]));

    fetch('/api/presence')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.presence || []);
        if (Array.isArray(list) && list.length > 0) setTeamMembers(list);
      })
      .catch(() => setTeamMembers([]));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-md">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">{mode === 'create' ? 'New Project' : 'Edit Project'}</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Project name</label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Website Redesign"
              value={values.name}
              onChange={e => setValues({ ...values, name: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && canSubmit && onSubmit(values)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Client</label>
            <select
              value={values.contactId}
              onChange={e => setValues({ ...values, contactId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100 transition cursor-pointer"
            >
              <option value="">No client</option>
              {contacts.map(c => (
                <option key={c.id} value={c.id}>{c.company ? `${c.name} — ${c.company}` : c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Project owner</label>
            <select
              value={values.ownerId}
              onChange={e => setValues({ ...values, ownerId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100 transition cursor-pointer"
            >
              <option value="">Unassigned</option>
              {teamMembers.map(m => (
                <option key={m.userId} value={m.userId}>{m.firstName} {m.lastName} ({m.role})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Start date</label>
              <input
                type="date"
                value={values.startDate}
                onChange={e => setValues({ ...values, startDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">End date</label>
              <input
                type="date"
                value={values.dueDate}
                onChange={e => setValues({ ...values, dueDate: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 transition ${
                  dateRangeInvalid ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-gray-200 focus:border-gray-400 focus:ring-gray-100'
                }`}
              />
            </div>
            {dateRangeInvalid && (
              <p className="col-span-2 text-xs text-rose-600 font-medium -mt-1">End date can&apos;t be before the start date.</p>
            )}
          </div>

          {mode === 'edit' && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
              <select
                value={values.status}
                onChange={e => setValues({ ...values, status: e.target.value as ProjectStatusValue })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100 transition cursor-pointer"
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || !canSubmit}
            onClick={() => onSubmit(values)}
            className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'create' ? <Plus className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            {mode === 'create' ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
