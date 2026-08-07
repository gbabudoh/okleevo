"use client";

import { useState, useEffect, useCallback } from 'react';
import { sanitizeHtml } from '@/lib/sanitize';
import { jsPDF } from 'jspdf';
import {
  Plus, Search, Mail, PoundSterling,
  Users, TrendingUp, Star, Edit, Trash2, X, Tag, AlertCircle,
  ChevronDown, Sparkles, LayoutGrid, List, Loader2, Kanban,
  Clock, Send as SendIcon, Inbox as InboxIcon, ArrowLeft, Eye, Archive,
  Trophy, Wallet, ArrowUp, ArrowDown, ArrowUpDown, CheckSquare, Square,
  Building2, BarChart3, Contact, Download, ChevronLeft, ChevronRight, CalendarDays, FileText
} from 'lucide-react';
import StatusModal from '@/components/StatusModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import TourProvider from '@/components/tours/TourProvider';
import { ModuleGuideBanner } from '@/components/tours/ModuleGuideBanner';
import { crmTourSteps } from './tour-steps';
import { PipelineBoard } from '@/modules/crm/PipelineBoard';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  clientType: 'business' | 'individual';
  status: 'active' | 'lead' | 'inactive' | 'customer';
  pipelineStage: 'new' | 'contacted' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  revenue: number;
  location?: string;
  lastContact?: string;
  tags?: string[];
  notes?: string;
}

interface PrismaContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  clientType: string;
  status: string;
  pipelineStage: string;
  revenue: number;
  address?: string;
  lastContact?: string;
  tags: string[];
  notes?: string;
}

interface TimelineItem {
  id: string;
  type: 'SENT' | 'RECEIVED';
  source?: 'SYSTEM' | 'MAILBOX';
  subject: string;
  date: string | Date;
  status?: string;
  body: string;
  from: string;
  to: string;
}

interface SentEmail {
  id: string;
  subject: string;
  body: string;
  createdAt: string;
  to: string;
}

interface ReceivedEmail {
  id: string;
  subject: string;
  body?: string;
  html?: string;
  date: string;
  from: string;
  to: string;
  folder?: string;
}

const labelCls = "block text-xs font-semibold text-gray-600 mb-1 sm:mb-1.5";
const inputCls = "w-full px-3 py-1.5 sm:py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm outline-none";
const selectCls = "w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-sm outline-none";
const modalHeaderCls = "px-5 sm:px-6 py-3 sm:py-5 flex items-center justify-between shrink-0 border-b border-gray-100";

function TagInput({ value, onChange, placeholder }: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  const commitDraft = () => {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setDraft('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitDraft();
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="w-full min-h-[42px] px-2.5 py-1.5 border border-gray-200 rounded-xl bg-white flex flex-wrap items-center gap-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
      {value.map(tag => (
        <span key={tag} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold pl-2 pr-1 py-1 rounded-lg">
          {tag}
          <button type="button" onClick={() => onChange(value.filter(t => t !== tag))} className="hover:text-blue-900 cursor-pointer">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[80px] outline-none text-sm bg-transparent border-none p-0.5"
      />
    </div>
  );
}

function ReportBar({ label, valueLabel, subLabel, pct, colorClass }: {
  label: string; valueLabel: string; subLabel?: string; pct: number; colorClass: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      tabIndex={0}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 capitalize truncate max-w-[60%]">{label}</span>
        <span className="text-xs font-bold text-gray-900 dark:text-white">
          {valueLabel}{subLabel && <span className="text-gray-400 font-medium"> · {subLabel}</span>}
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden cursor-default">
        <div
          className={`h-full rounded-full ${colorClass} transition-all duration-200 ${hover ? 'brightness-110 shadow-[0_0_0_2px_rgba(0,0,0,0.04)]' : ''}`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
      {hover && (
        <div className="absolute -top-8 left-0 z-20 px-2.5 py-1.5 rounded-lg bg-gray-900 dark:bg-slate-700 text-white text-[11px] font-semibold whitespace-nowrap shadow-lg pointer-events-none animate-in fade-in zoom-in-95 duration-100">
          <span className="capitalize">{label}</span>: {valueLabel}{subLabel ? ` (${subLabel})` : ''}
        </div>
      )}
    </div>
  );
}

function DonutChart({ segments, totalLabel }: {
  segments: { label: string; value: number; colorHex: string; colorClass: string }[];
  totalLabel: string;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const r = 60;
  const circumference = 2 * Math.PI * r;
  let accPct = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-[160px] h-[160px] shrink-0">
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
          <circle cx="80" cy="80" r={r} fill="none" stroke="currentColor" className="text-gray-100 dark:text-slate-800" strokeWidth="20" />
          {total > 0 && segments.map((s, i) => {
            if (s.value === 0) return null;
            const pct = (s.value / total) * 100;
            const dash = (pct / 100) * circumference;
            const offset = -((accPct / 100) * circumference);
            accPct += pct;
            const isHover = hoverIdx === i;
            return (
              <circle
                key={s.label}
                cx="80" cy="80" r={r} fill="none"
                stroke={s.colorHex}
                strokeWidth={isHover ? 24 : 20}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={offset}
                className="transition-all duration-150 cursor-pointer"
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-extrabold text-gray-900 dark:text-white">{total}</span>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{totalLabel}</span>
        </div>
        {hoverIdx !== null && segments[hoverIdx].value > 0 && (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-20 px-2.5 py-1.5 rounded-lg bg-gray-900 dark:bg-slate-700 text-white text-[11px] font-semibold whitespace-nowrap shadow-lg pointer-events-none">
            <span className="capitalize">{segments[hoverIdx].label}</span>: {segments[hoverIdx].value} ({Math.round((segments[hoverIdx].value / total) * 100)}%)
          </div>
        )}
      </div>
      <div className="flex-1 w-full space-y-2">
        {segments.map((s, i) => (
          <div key={s.label}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
            className={`flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors cursor-default ${hoverIdx === i ? 'bg-gray-50 dark:bg-slate-800' : ''}`}
          >
            <span className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 capitalize">
              <span className={`w-2.5 h-2.5 rounded-full ${s.colorClass}`} /> {s.label}
            </span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {s.value} <span className="text-gray-400 font-medium">({total > 0 ? Math.round((s.value / total) * 100) : 0}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CRMPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'board' | 'grid' | 'list'>('board');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commFilter, setCommFilter] = useState<'all' | 'SENT' | 'RECEIVED'>('all');
  const [globalCommFilter, setGlobalCommFilter] = useState<'all' | 'SENT' | 'RECEIVED'>('all');
  const [globalTimeline, setGlobalTimeline] = useState<TimelineItem[]>([]);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [emailTimeline, setEmailTimeline] = useState<TimelineItem[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [viewingEmailItem, setViewingEmailItem] = useState<TimelineItem | null>(null);
  const [showEmailViewModal, setShowEmailViewModal] = useState(false);
  const [deletingEmailItem, setDeletingEmailItem] = useState<TimelineItem | null>(null);
  const [showEmailDeleteModal, setShowEmailDeleteModal] = useState(false);
  const [archivingEmailId, setArchivingEmailId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'communication' | 'notes'>('info');
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info';
  }>({ isOpen: false, title: '', message: '', type: 'success' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<'name' | 'company' | 'pipelineStage' | 'status' | 'revenue'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [bulkWorking, setBulkWorking] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [crmSection, setCrmSection] = useState<'contacts' | 'companies' | 'reports' | 'calendar'>('contacts');
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const [emailData, setEmailData] = useState({ to: '', subject: '', message: '' });

  const [newClient, setNewClient] = useState({
    name: '', email: '', phone: '', company: '',
    clientType: 'business' as 'business' | 'individual',
    status: 'lead' as 'active' | 'lead' | 'inactive',
    pipelineStage: 'new' as 'new' | 'contacted' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost',
    location: '', revenue: 0, tags: [] as string[]
  });

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/crm');
      const data = await response.json();
      if (Array.isArray(data)) {
        setClients(data.map((c: PrismaContact) => ({
          ...c,
          status: c.status.toLowerCase() as 'active' | 'lead' | 'inactive' | 'customer',
          clientType: c.clientType as 'business' | 'individual',
          pipelineStage: c.pipelineStage as 'new' | 'contacted' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost',
          location: c.address,
          company: c.company || 'N/A',
          lastContact: c.lastContact ? new Date(c.lastContact).toISOString().split('T')[0] : undefined
        })));
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmailTimeline = useCallback(async (email: string) => {
    try {
      setLoadingTimeline(true);
      const res = await fetch(`/api/crm/emails?email=${encodeURIComponent(email)}`);
      if (res.ok) setEmailTimeline(await res.json());
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
    } finally {
      setLoadingTimeline(false);
    }
  }, []);

  const fetchGlobalTimeline = useCallback(async () => {
    setLoadingGlobal(true);
    try {
      const [sentRes, receivedRes] = await Promise.all([
        fetch('/api/email/history?limit=20'),
        fetch('/api/email/inbox')
      ]);
      const sentData = await sentRes.json();
      const receivedData = await receivedRes.json();
      const combined: TimelineItem[] = [
        ...(sentData.data || []).map((item: SentEmail) => ({
          id: item.id, type: 'SENT' as const, subject: item.subject,
          body: item.body, date: item.createdAt, from: 'You', to: item.to
        })),
        ...(Array.isArray(receivedData) ? receivedData : []).filter((item: ReceivedEmail) => item.folder !== 'ARCHIVED').map((item: ReceivedEmail) => ({
          id: item.id, type: 'RECEIVED' as const, subject: item.subject,
          body: item.body || item.html || '', date: item.date, from: item.from, to: item.to
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setGlobalTimeline(combined.slice(0, 50));
    } catch (err) {
      console.error('Failed to fetch global timeline:', err);
    } finally {
      setLoadingGlobal(false);
    }
  }, []);

  const handleArchiveEmailItem = async (item: TimelineItem) => {
    setArchivingEmailId(item.id);
    try {
      const endpoint = item.type === 'SENT' ? `/api/email/history/${item.id}` : `/api/email/inbox/${item.id}`;
      const body = item.type === 'SENT' ? { archived: true } : { folder: 'ARCHIVED' };
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to archive email');
      setGlobalTimeline(prev => prev.filter(t => t.id !== item.id));
    } catch (err) {
      console.error('Failed to archive email item:', err);
      setStatusModal({ isOpen: true, title: 'Archive Failed', message: 'Could not archive this item. Please try again.', type: 'error' });
    } finally {
      setArchivingEmailId(null);
    }
  };

  const handleDeleteEmailItem = async () => {
    if (!deletingEmailItem) return;
    try {
      const endpoint = deletingEmailItem.type === 'SENT' ? `/api/email/history/${deletingEmailItem.id}` : `/api/email/inbox/${deletingEmailItem.id}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete email');
      setGlobalTimeline(prev => prev.filter(t => t.id !== deletingEmailItem.id));
    } catch (err) {
      console.error('Failed to delete email item:', err);
      setStatusModal({ isOpen: true, title: 'Delete Failed', message: 'Could not delete this item. Please try again.', type: 'error' });
    } finally {
      setShowEmailDeleteModal(false);
      setDeletingEmailItem(null);
    }
  };

  useEffect(() => { fetchContacts(); fetchGlobalTimeline(); }, [fetchContacts, fetchGlobalTimeline]);
  useEffect(() => { if (selectedClient?.email) fetchEmailTimeline(selectedClient.email); }, [selectedClient, fetchEmailTimeline]);
  useEffect(() => { setNoteDraft(selectedClient?.notes || ''); }, [selectedClient?.id, selectedClient?.notes]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'lead': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'customer': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleAddClient = async () => {
    try {
      const response = await fetch('/api/crm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newClient, address: newClient.location }),
      });
      if (!response.ok) throw new Error('Failed to add client');
      await fetchContacts();
      setShowAddModal(false);
      setNewClient({ name: '', email: '', phone: '', company: '', clientType: 'business', status: 'lead', pipelineStage: 'new', location: '', revenue: 0, tags: [] });
      setStatusModal({ isOpen: true, title: 'Client Added', message: 'New client has been successfully added to the CRM.', type: 'success' });
    } catch (error) {
      console.error('Error adding client:', error);
      setStatusModal({ isOpen: true, title: 'Error', message: 'Failed to add client. Please try again.', type: 'error' });
    }
  };

  const handleEditClient = async () => {
    if (!editingClient) return;
    try {
      const response = await fetch('/api/crm', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingClient, address: editingClient.location }),
      });
      if (!response.ok) throw new Error('Failed to update client');
      await fetchContacts();
      setShowEditModal(false); setEditingClient(null);
      setStatusModal({ isOpen: true, title: 'Client Updated', message: 'Client details have been successfully updated.', type: 'success' });
    } catch (error) {
      console.error('Error updating client:', error);
      setStatusModal({ isOpen: true, title: 'Error', message: 'Failed to update client. Please try again.', type: 'error' });
    }
  };

  const handleDeleteClient = async () => {
    if (!deletingClient) return;
    try {
      const response = await fetch(`/api/crm?id=${deletingClient.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete client');
      setClients(clients.filter(c => c.id !== deletingClient.id));
      setShowDeleteModal(false); setDeletingClient(null);
      setStatusModal({ isOpen: true, title: 'Client Deleted', message: 'The client has been successfully deleted from the system.', type: 'success' });
    } catch (error) {
      console.error('Error deleting client:', error);
      setStatusModal({ isOpen: true, title: 'Error', message: 'Failed to delete client. Please try again.', type: 'error' });
    }
  };

  const handleStageChange = async (clientId: string, pipelineStage: Client['pipelineStage']) => {
    const previous = clients;
    setClients(cs => cs.map(c => c.id === clientId ? { ...c, pipelineStage } : c));
    try {
      const response = await fetch('/api/crm', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: clientId, pipelineStage }),
      });
      if (!response.ok) throw new Error('Failed to update stage');
    } catch (error) {
      console.error('Error updating pipeline stage:', error);
      setClients(previous);
      setStatusModal({ isOpen: true, title: 'Update Failed', message: 'Could not move the deal. Please try again.', type: 'error' });
    }
  };

  const handleAddToStage = (pipelineStage: Client['pipelineStage']) => {
    setNewClient(prev => ({ ...prev, pipelineStage }));
    setShowAddModal(true);
  };

  const handleSaveNote = async (clientId: string) => {
    setSavingNote(true);
    try {
      const response = await fetch('/api/crm', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: clientId, notes: noteDraft }),
      });
      if (!response.ok) throw new Error('Failed to save note');
      setClients(cs => cs.map(c => c.id === clientId ? { ...c, notes: noteDraft } : c));
      setSelectedClient(c => c && c.id === clientId ? { ...c, notes: noteDraft } : c);
      setStatusModal({ isOpen: true, title: 'Note Saved', message: 'Client notes have been updated.', type: 'success' });
    } catch (error) {
      console.error('Error saving note:', error);
      setStatusModal({ isOpen: true, title: 'Save Failed', message: 'Could not save the note. Please try again.', type: 'error' });
    } finally {
      setSavingNote(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const sortedClients = [...filteredClients].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortKey === 'revenue') return (a.revenue - b.revenue) * dir;
    return a[sortKey].localeCompare(b[sortKey]) * dir;
  });

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleSelectAll = () => {
    setSelectedIds(prev =>
      prev.size === filteredClients.length ? new Set() : new Set(filteredClients.map(c => c.id))
    );
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkStatusChange = async (status: 'active' | 'lead' | 'inactive') => {
    setBulkWorking(true);
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(ids.map(id => fetch('/api/crm', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })));
      await fetchContacts();
      setSelectedIds(new Set());
      setStatusModal({ isOpen: true, title: 'Clients Updated', message: `${ids.length} client(s) updated to "${status}".`, type: 'success' });
    } catch (error) {
      console.error('Bulk status update failed:', error);
      setStatusModal({ isOpen: true, title: 'Update Failed', message: 'Some clients could not be updated. Please try again.', type: 'error' });
    } finally {
      setBulkWorking(false);
    }
  };

  const handleBulkDelete = async () => {
    setBulkWorking(true);
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(ids.map(id => fetch(`/api/crm?id=${id}`, { method: 'DELETE' })));
      setClients(prev => prev.filter(c => !selectedIds.has(c.id)));
      setSelectedIds(new Set());
      setStatusModal({ isOpen: true, title: 'Clients Deleted', message: `${ids.length} client(s) removed.`, type: 'success' });
    } catch (error) {
      console.error('Bulk delete failed:', error);
      setStatusModal({ isOpen: true, title: 'Delete Failed', message: 'Some clients could not be deleted. Please try again.', type: 'error' });
    } finally {
      setBulkWorking(false);
    }
  };

  const handleBulkEmail = () => {
    const emails = clients.filter(c => selectedIds.has(c.id)).map(c => c.email).join(', ');
    setEmailData({ to: emails, subject: '', message: '' });
    setShowEmailModal(true);
  };

  const totalRevenue = clients.reduce((sum, client) => sum + client.revenue, 0);
  const activeClients = clients.filter(c => c.status === 'active').length;
  const leadClients = clients.filter(c => c.status === 'lead').length;
  const pipelineValue = clients
    .filter(c => c.pipelineStage !== 'closed-won' && c.pipelineStage !== 'closed-lost')
    .reduce((sum, c) => sum + c.revenue, 0);
  const wonCount = clients.filter(c => c.pipelineStage === 'closed-won').length;
  const lostCount = clients.filter(c => c.pipelineStage === 'closed-lost').length;
  const winRate = wonCount + lostCount === 0 ? 0 : Math.round((wonCount / (wonCount + lostCount)) * 100);

  const companyStats = Object.values(
    clients.reduce((acc, c) => {
      const key = c.company || 'Unknown';
      if (!acc[key]) acc[key] = { company: key, count: 0, revenue: 0 };
      acc[key].count += 1;
      acc[key].revenue += c.revenue;
      return acc;
    }, {} as Record<string, { company: string; count: number; revenue: number }>)
  ).sort((a, b) => b.revenue - a.revenue);

  const STAGE_ORDER: Client['pipelineStage'][] = ['new', 'contacted', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];
  const stageStats = STAGE_ORDER.map(stage => ({
    stage,
    label: stage.replace('-', ' '),
    count: clients.filter(c => c.pipelineStage === stage).length,
    revenue: clients.filter(c => c.pipelineStage === stage).reduce((sum, c) => sum + c.revenue, 0),
  }));

  const STATUS_ORDER: Client['status'][] = ['active', 'lead', 'customer', 'inactive'];
  const statusBarColor: Record<Client['status'], string> = {
    active: 'bg-emerald-500', lead: 'bg-blue-500', customer: 'bg-indigo-500', inactive: 'bg-gray-400',
  };
  const statusHexColor: Record<Client['status'], string> = {
    active: '#10b981', lead: '#3b82f6', customer: '#6366f1', inactive: '#9ca3af',
  };
  const statusStats = STATUS_ORDER.map(status => ({
    status,
    count: clients.filter(c => c.status === status).length,
  }));

  const topCompanies = companyStats.slice(0, 6);
  const maxCompanyRevenue = Math.max(1, ...topCompanies.map(c => c.revenue));
  const maxStageRevenue = Math.max(1, ...stageStats.map(s => s.revenue));

  const calendarCells = (() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const gridStart = new Date(year, month, 1 - firstOfMonth.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
      const dayClients = clients.filter(c => c.lastContact && new Date(c.lastContact).toDateString() === date.toDateString());
      return { date, inMonth: date.getMonth() === month, dayClients };
    });
  })();

  const handleExportReportsCSV = () => {
    let csv = 'CRM Report\n';
    csv += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    csv += 'Pipeline by Stage\n';
    csv += 'Stage,Deal Count,Revenue\n';
    csv += stageStats.map(s => `"${s.label}",${s.count},${s.revenue}`).join('\n');
    csv += '\n\nStatus Breakdown\n';
    csv += 'Status,Count\n';
    csv += statusStats.map(s => `"${s.status}",${s.count}`).join('\n');
    csv += '\n\nCompanies by Revenue\n';
    csv += 'Company,Contacts,Revenue\n';
    csv += companyStats.map(c => `"${c.company}",${c.count},${c.revenue}`).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusModal({ isOpen: true, title: 'Export Complete', message: 'Your CRM report has been exported to CSV.', type: 'success' });
  };

  const handleExportReportsPDF = () => {
    const doc = new jsPDF();

    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Okleevo', 14, 25);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('CRM Performance Report', 14, 33);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Pipeline & Relationship Overview', 14, 55);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 63);
    doc.text(`Total clients: ${clients.length}  ·  Pipeline value: £${pipelineValue.toLocaleString()}  ·  Win rate: ${winRate}%`, 14, 69);

    doc.setDrawColor(230);
    doc.line(14, 76, 196, 76);

    let y = 88;
    const drawSectionTitle = (title: string) => {
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text(title, 14, y);
      y += 8;
    };
    const drawTableHeader = (cols: { label: string; x: number }[]) => {
      doc.setFillColor(245, 247, 250);
      doc.rect(14, y - 6, 182, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0);
      cols.forEach(c => doc.text(c.label, c.x, y));
      y += 9;
      doc.setFont('helvetica', 'normal');
    };
    const ensureSpace = () => { if (y > 265) { doc.addPage(); y = 20; } };

    drawSectionTitle('Pipeline by Stage');
    drawTableHeader([{ label: 'STAGE', x: 16 }, { label: 'DEALS', x: 120 }, { label: 'REVENUE', x: 150 }]);
    stageStats.forEach((s, idx) => {
      ensureSpace();
      if (idx % 2 === 0) { doc.setFillColor(252, 252, 252); doc.rect(14, y - 5, 182, 7, 'F'); }
      doc.text(s.label.replace(/^\w/, c => c.toUpperCase()), 16, y);
      doc.text(String(s.count), 120, y);
      doc.text(`£${s.revenue.toLocaleString()}`, 150, y);
      y += 7;
    });
    y += 8;

    ensureSpace();
    drawSectionTitle('Status Breakdown');
    drawTableHeader([{ label: 'STATUS', x: 16 }, { label: 'COUNT', x: 120 }]);
    statusStats.forEach((s, idx) => {
      ensureSpace();
      if (idx % 2 === 0) { doc.setFillColor(252, 252, 252); doc.rect(14, y - 5, 182, 7, 'F'); }
      doc.text(s.status.replace(/^\w/, c => c.toUpperCase()), 16, y);
      doc.text(String(s.count), 120, y);
      y += 7;
    });
    y += 8;

    ensureSpace();
    drawSectionTitle('Companies by Revenue');
    drawTableHeader([{ label: 'COMPANY', x: 16 }, { label: 'CONTACTS', x: 120 }, { label: 'REVENUE', x: 150 }]);
    companyStats.forEach((co, idx) => {
      ensureSpace();
      if (idx % 2 === 0) { doc.setFillColor(252, 252, 252); doc.rect(14, y - 5, 182, 7, 'F'); }
      doc.text(co.company.substring(0, 40), 16, y);
      doc.text(String(co.count), 120, y);
      doc.text(`£${co.revenue.toLocaleString()}`, 150, y);
      y += 7;
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Okleevo | CRM Report | Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    }

    doc.save(`crm-report-${new Date().toISOString().split('T')[0]}.pdf`);
    setStatusModal({ isOpen: true, title: 'Export Complete', message: 'Your CRM report has been exported to PDF.', type: 'success' });
  };

  const DetailPanel = ({ client }: { client: Client }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-blue-50/50 dark:bg-blue-950/20 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shrink-0">
            {client.name[0]}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate">{client.name}</h3>
            <p className="text-[11px] text-gray-400 truncate">{client.company}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => { setEditingClient(client); setShowEditModal(true); setSelectedClient(null); }}
            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors text-blue-500 cursor-pointer">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => { setDeletingClient(client); setShowDeleteModal(true); setSelectedClient(null); }}
            className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg transition-colors text-rose-400 cursor-pointer">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={() => setSelectedClient(null)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-400 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        {(['communication', 'info', 'notes'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wide transition-colors border-b-2 cursor-pointer ${
              activeTab === tab ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {activeTab === 'communication' && (
          <div className="space-y-3">
            {loadingTimeline ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                <p className="text-[11px] text-gray-400 font-medium">Loading emails...</p>
              </div>
            ) : emailTimeline.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-gray-300 dark:text-slate-600" />
                </div>
                <p className="text-sm font-semibold text-gray-400">No emails found</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl w-fit mb-3">
                  {[{ id: 'all', label: 'All', icon: Clock }, { id: 'RECEIVED', label: 'Inbox', icon: InboxIcon }, { id: 'SENT', label: 'Sent', icon: SendIcon }].map((item) => (
                    <button key={item.id} onClick={() => setCommFilter(item.id as 'all' | 'SENT' | 'RECEIVED')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all cursor-pointer ${
                        commFilter === item.id ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                      }`}>
                      <item.icon className="w-3 h-3" />
                      {item.label}
                      <span className={`px-1 rounded text-[9px] ${commFilter === item.id ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400' : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400'}`}>
                        {item.id === 'all' ? emailTimeline.length : emailTimeline.filter(e => e.type === item.id).length}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="space-y-2.5">
                  {emailTimeline.filter(item => commFilter === 'all' || item.type === commFilter).map((item) => (
                    <div key={item.id} className={`p-3.5 rounded-xl border ${
                      item.type === 'SENT' ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40' : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 shadow-sm'
                    }`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          item.type === 'SENT' ? 'bg-blue-600 text-white' : 'bg-indigo-600 text-white'
                        }`}>
                          {item.type === 'SENT' ? 'Outgoing' : 'Incoming'}
                        </span>
                        <span className="text-[10px] text-gray-400">{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1">{item.subject}</h4>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.body) }} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'info' && (
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Pipeline Stage</p>
              <select
                value={client.pipelineStage}
                onChange={(e) => handleStageChange(client.id, e.target.value as Client['pipelineStage'])}
                className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-gray-900 dark:text-white cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed-won">Closed Won</option>
                <option value="closed-lost">Closed Lost</option>
              </select>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Email</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white break-all">{client.email}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Phone</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{client.phone || 'N/A'}</p>
            </div>
            {client.tags && client.tags.length > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {client.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-[11px] font-semibold">{tag}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="p-4 bg-emerald-600 rounded-xl text-white">
              <p className="text-[10px] font-bold uppercase opacity-80 mb-1">Revenue Value</p>
              <p className="text-2xl font-bold">£{client.revenue.toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="p-1 bg-blue-100 dark:bg-blue-950 rounded"><SendIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" /></div>
                  <span className="text-[9px] font-bold uppercase text-gray-400">Last Sent</span>
                </div>
                {emailTimeline.find(e => e.type === 'SENT')
                  ? <p className="text-xs font-semibold text-gray-900 dark:text-white">{new Date(emailTimeline.find(e => e.type === 'SENT')!.date).toLocaleDateString()}</p>
                  : <p className="text-[11px] text-gray-400 font-medium">None</p>}
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="p-1 bg-indigo-100 dark:bg-indigo-950 rounded"><InboxIcon className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /></div>
                  <span className="text-[9px] font-bold uppercase text-gray-400">Last Rcvd</span>
                </div>
                {emailTimeline.find(e => e.type === 'RECEIVED')
                  ? <p className="text-xs font-semibold text-gray-900 dark:text-white">{new Date(emailTimeline.find(e => e.type === 'RECEIVED')!.date).toLocaleDateString()}</p>
                  : <p className="text-[11px] text-gray-400 font-medium">None</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-3">
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Add notes about this client…"
              rows={10}
              className="w-full px-3.5 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all resize-none"
            />
            <button
              type="button"
              disabled={savingNote || noteDraft === (client.notes || '')}
              onClick={() => handleSaveNote(client.id)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {savingNote ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Notes'}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-800 shrink-0">
        <button
          onClick={() => { setEmailData(prev => ({ ...prev, to: client.email })); setShowEmailModal(true); }}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Mail className="w-4 h-4" /> Email Contact
        </button>
      </div>
    </div>
  );

  const renderContactsList = () => (
    <>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-gray-500">Loading contacts...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center space-y-4">
          <Users className="w-10 h-10 text-gray-200 mx-auto" />
          <h3 className="text-sm sm:text-lg font-bold text-gray-900 tracking-tight">No clients found</h3>
          <button onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center gap-2 text-sm cursor-pointer">
            <Plus className="w-4 h-4" /> Add First Client
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sortedClients.map((client) => (
            <div
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer group ${
                selectedClient?.id === client.id
                  ? 'border-blue-500 shadow-md ring-2 ring-blue-100'
                  : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                    {client.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{client.name}</h3>
                    <p className="text-[11px] text-gray-500 truncate">{client.company}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); setEditingClient(client); setShowEditModal(true); }}
                    className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-400 cursor-pointer">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setDeletingClient(client); setShowDeleteModal(true); }}
                    className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-400 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getStatusColor(client.status)}`}>
                  {client.status.toUpperCase()}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-gray-400 truncate max-w-[55%]">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span className="truncate">{client.email}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Mobile list */}
          <div className="sm:hidden space-y-2">
            {sortedClients.map((client) => (
              <div key={client.id} onClick={() => setSelectedClient(client)}
                className={`bg-white rounded-xl p-3 border flex items-center gap-3 cursor-pointer transition-all ${
                  selectedClient?.id === client.id ? 'border-blue-500 shadow-sm' : 'border-gray-100 shadow-sm'
                }`}>
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                  {client.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{client.name}</p>
                  <p className="text-[11px] text-gray-400 font-medium truncate">{client.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${getStatusColor(client.status)}`}>
                    {client.status.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-700">£{client.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bulk action bar */}
          {selectedIds.size > 0 && (
            <div className="hidden sm:flex items-center justify-between gap-3 bg-blue-600 text-white rounded-2xl px-4 py-2.5 mb-2.5">
              <span className="text-sm font-bold">{selectedIds.size} selected</span>
              <div className="flex items-center gap-2">
                <button type="button" disabled={bulkWorking} onClick={handleBulkEmail}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 transition-colors">
                  <Mail className="w-3.5 h-3.5" /> Email
                </button>
                <select disabled={bulkWorking} onChange={(e) => { if (e.target.value) handleBulkStatusChange(e.target.value as 'active' | 'lead' | 'inactive'); e.target.value = ''; }}
                  defaultValue=""
                  className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 outline-none border-none">
                  <option value="" disabled>Set status…</option>
                  <option value="active" className="text-gray-900">Active</option>
                  <option value="lead" className="text-gray-900">Lead</option>
                  <option value="inactive" className="text-gray-900">Inactive</option>
                </select>
                <button type="button" disabled={bulkWorking} onClick={() => setShowBulkDeleteModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/90 hover:bg-rose-500 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                <button type="button" onClick={() => setSelectedIds(new Set())}
                  className="p-1.5 hover:bg-white/15 rounded-lg cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Desktop table */}
          <div className="hidden sm:block bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/60">
                  <th className="w-10 px-4 py-3">
                    <button type="button" onClick={toggleSelectAll} className="flex items-center cursor-pointer text-gray-400 hover:text-blue-600">
                      {selectedIds.size === filteredClients.length && filteredClients.length > 0
                        ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  {([
                    ['name', 'Client'], ['company', 'Company'], ['pipelineStage', 'Stage'], ['status', 'Status'], ['revenue', 'Revenue'],
                  ] as const).map(([key, label]) => (
                    <th key={key} className={`px-4 py-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide ${key === 'revenue' ? 'text-right' : 'text-left'}`}>
                      <button type="button" onClick={() => handleSort(key)} className="inline-flex items-center gap-1 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300">
                        {label}
                        {sortKey === key ? (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {sortedClients.map((client) => (
                  <tr key={client.id} onClick={() => setSelectedClient(client)}
                    className={`cursor-pointer transition-colors ${selectedClient?.id === client.id ? 'bg-blue-50 dark:bg-blue-950/30' : 'hover:bg-gray-50 dark:hover:bg-slate-800/40'}`}>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => toggleSelectOne(client.id)} className="flex items-center cursor-pointer text-gray-400 hover:text-blue-600">
                        {selectedIds.has(client.id) ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs shrink-0">
                          {client.name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{client.name}</p>
                          <p className="text-[11px] text-gray-400 truncate max-w-[160px]">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-[160px] truncate">{client.company}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 capitalize">
                        {client.pipelineStage.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getStatusColor(client.status)}`}>{client.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">£{client.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );

  const renderCommunicationFeed = () => (
    <>
      <div className="px-5 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Communication Feed</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Live global interaction feed</p>
          </div>
          <div className="p-2 bg-blue-100 rounded-xl">
            <InboxIcon className="w-4 h-4 text-blue-600" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setGlobalCommFilter(prev => prev === 'SENT' ? 'all' : 'SENT')}
            className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
              globalCommFilter === 'SENT' ? 'bg-blue-600 border-blue-600' : 'bg-blue-50 border-blue-100 hover:border-blue-200'
            }`}
          >
            <p className={`text-[10px] font-bold uppercase mb-1 ${globalCommFilter === 'SENT' ? 'text-blue-100' : 'text-blue-600'}`}>Total Sent</p>
            <p className={`text-xl font-bold ${globalCommFilter === 'SENT' ? 'text-white' : 'text-blue-900'}`}>{globalTimeline.filter(e => e.type === 'SENT').length}</p>
          </button>
          <button
            type="button"
            onClick={() => setGlobalCommFilter(prev => prev === 'RECEIVED' ? 'all' : 'RECEIVED')}
            className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
              globalCommFilter === 'RECEIVED' ? 'bg-indigo-600 border-indigo-600' : 'bg-indigo-50 border-indigo-100 hover:border-indigo-200'
            }`}
          >
            <p className={`text-[10px] font-bold uppercase mb-1 ${globalCommFilter === 'RECEIVED' ? 'text-indigo-100' : 'text-indigo-600'}`}>Received</p>
            <p className={`text-xl font-bold ${globalCommFilter === 'RECEIVED' ? 'text-white' : 'text-indigo-900'}`}>{globalTimeline.filter(e => e.type === 'RECEIVED').length}</p>
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        {loadingGlobal ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-400">Loading feed...</p>
          </div>
        ) : globalTimeline.filter(item => globalCommFilter === 'all' || item.type === globalCommFilter).length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-400">
              {globalTimeline.length === 0 ? 'No recent interactions' : `No ${globalCommFilter === 'SENT' ? 'sent' : 'received'} interactions`}
            </p>
          </div>
        ) : globalTimeline.filter(item => globalCommFilter === 'all' || item.type === globalCommFilter).map((item) => (
          <div key={item.id} onClick={() => {
            const clientEmail = item.type === 'RECEIVED' ? item.from.match(/<(.+)>/)?.[1] || item.from : item.to;
            const client = clients.find(c => c.email === clientEmail);
            if (client) setSelectedClient(client);
          }}
            className={`group relative p-3.5 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
              item.type === 'SENT' ? 'bg-blue-50 border-blue-100 hover:border-blue-200' : 'bg-white border-gray-100 hover:border-gray-200'
            }`}>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`p-1 rounded-lg shrink-0 ${item.type === 'SENT' ? 'bg-blue-600' : 'bg-indigo-600'}`}>
                  {item.type === 'SENT' ? <SendIcon className="w-3 h-3 text-white" /> : <InboxIcon className="w-3 h-3 text-white" />}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-gray-700 block truncate">
                    {item.type === 'SENT' ? `To: ${item.to}` : `From: ${item.from.split(' <')[0]}`}
                  </span>
                  <span className="text-[9px] text-gray-400">{new Date(item.date).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  title="View"
                  onClick={(e) => { e.stopPropagation(); setViewingEmailItem(item); setShowEmailViewModal(true); }}
                  className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  title="Archive"
                  disabled={archivingEmailId === item.id}
                  onClick={(e) => { e.stopPropagation(); handleArchiveEmailItem(item); }}
                  className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Archive className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  title="Delete"
                  onClick={(e) => { e.stopPropagation(); setDeletingEmailItem(item); setShowEmailDeleteModal(true); }}
                  className="p-1.5 bg-white border border-gray-200 rounded-lg text-rose-500 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <h4 className="text-xs font-bold text-gray-900 mb-1 truncate">{item.subject}</h4>
            <div className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.body) }} />
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8">
      <TourProvider moduleId="crm" steps={crmTourSteps} />

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-blue-600 rounded-xl shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex items-center gap-3">
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">CRM</h1>
                <p className="text-[11px] text-gray-400 font-medium hidden sm:block">Manage relationships & track pipeline</p>
              </div>
              <ModuleGuideBanner
                moduleId="crm"
                moduleName="CRM & Pipeline"
                summary="Track deals, manage client communications, and build lasting customer relationships."
                tips={[
                  "Toggle between Contacts list and Pipeline Deal stages",
                  "Send individual or bulk emails directly",
                  "Filter by Lead, Active, or Customer status"
                ]}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const emails = clients.filter(c => c.status === 'active').map(c => c.email).join(', ');
                setEmailData({ to: emails, subject: 'Update from Your Company', message: 'Dear valued clients,\n\n\n\nBest regards,\nYour Company' });
                setShowEmailModal(true);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4" /> Bulk Email
            </button>
            <button
              id="tour-crm-add-button"
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Client</span>
              <span className="sm:hidden">Add</span>
            </button>
        </div>
      </div>
    </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="sm:hidden fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-30 active:scale-95 transition-all cursor-pointer hover:bg-blue-700"
      >
        <Plus className="w-8 h-8" />
      </button>

      <div className="px-4 sm:px-6 space-y-4 pt-4">
        {/* CRM Section Tabs */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-1.5 w-fit">
          {([
            ['contacts', 'Contacts', Contact],
            ['companies', 'Companies', Building2],
            ['reports', 'Reports', BarChart3],
            ['calendar', 'Calendar', CalendarDays],
          ] as const).map(([id, label, Icon]) => (
            <button key={id} type="button" onClick={() => setCrmSection(id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                crmSection === id ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        {crmSection === 'contacts' && (<>
        {/* Stats */}
        <div id="tour-crm-stats" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            { label: 'All Clients', value: clients.length, sub: 'Total database', icon: Users, bgGrad: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
            { label: 'Active', value: activeClients, sub: 'Currently engaged', icon: Star, bgGrad: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
            { label: 'New Leads', value: leadClients, sub: 'Opportunities', icon: TrendingUp, bgGrad: 'bg-gradient-to-br from-purple-500 to-indigo-600' },
            { label: 'Pipeline Value', value: `£${(pipelineValue / 1000).toFixed(1)}k`, sub: 'Open deals', icon: Wallet, bgGrad: 'bg-gradient-to-br from-cyan-500 to-blue-600' },
            { label: 'Win Rate', value: `${winRate}%`, sub: `${wonCount} won · ${lostCount} lost`, icon: Trophy, bgGrad: 'bg-gradient-to-br from-rose-500 to-pink-600' },
            { label: 'Total Revenue', value: `£${(totalRevenue / 1000).toFixed(1)}k`, sub: 'Lifetime value', icon: PoundSterling, bgGrad: 'bg-gradient-to-br from-amber-500 to-orange-600' },
          ].map(({ label, value, sub, icon: Icon, bgGrad }) => (
            <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 ${bgGrad} rounded-xl w-fit group-hover:scale-105 transition-transform text-white shadow-xs`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{value}</p>
              <p className="text-[11px] font-medium text-gray-400 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div id="tour-crm-search" className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm text-gray-900 placeholder:text-gray-400 transition-all outline-none"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
              <button onClick={() => setViewMode('board')} title="Pipeline board"
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'board' ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600'}`}>
                <Kanban className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('grid')} title="Card grid"
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600'}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} title="Table"
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
            <div className="relative flex-1 sm:flex-none">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="lead">Lead</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
        {/* Main Content Area */}
        {viewMode === 'board' ? (
          <PipelineBoard
            clients={filteredClients}
            loading={loading}
            onSelect={setSelectedClient}
            onStageChange={handleStageChange}
            onAddToStage={handleAddToStage}
          />
        ) : selectedClient ? (
          <div className="md:flex md:gap-4 md:items-start md:h-[calc(100vh-360px)]">
            {/* Left: Contacts List */}
            <div className="hidden md:block md:flex-[1.2] md:h-full md:overflow-y-auto md:pr-1">
              {renderContactsList()}
            </div>

            {/* Mobile: full-screen detail */}
            <div className="block md:hidden bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-col h-[70dvh]">
              <button onClick={() => setSelectedClient(null)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-blue-600 border-b border-gray-100 bg-blue-50 w-full text-left cursor-pointer shrink-0">
                <ArrowLeft className="w-4 h-4" /> Back to Contacts
              </button>
              <div className="flex-1 min-h-0 overflow-hidden">
                <DetailPanel client={selectedClient} />
              </div>
            </div>

            {/* Desktop right pane: DetailPanel */}
            <div className="hidden md:flex md:flex-[0.8] h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-col">
              <DetailPanel client={selectedClient} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Contacts List (Full Width) */}
            <div className="w-full">
              {renderContactsList()}
            </div>

            {/* Communication Feed (Full Width at the bottom) */}
            <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              {renderCommunicationFeed()}
            </div>
          </div>
        )}
        </>)}

        {crmSection === 'companies' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {companyStats.length === 0 ? (
              <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl p-12 border border-gray-100 dark:border-slate-800 shadow-sm text-center">
                <Building2 className="w-10 h-10 text-gray-200 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-400">No companies yet</p>
              </div>
            ) : companyStats.map((co) => (
              <button
                key={co.company}
                type="button"
                onClick={() => { setSearchTerm(co.company); setCrmSection('contacts'); setViewMode('list'); }}
                className="text-left bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-gray-200 dark:hover:border-slate-700 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-gradient-to-br from-slate-500 to-slate-700 rounded-xl text-white shrink-0 group-hover:scale-105 transition-transform">
                    <Building2 className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{co.company}</h3>
                    <p className="text-[11px] text-gray-400">{co.count} contact{co.count === 1 ? '' : 's'}</p>
                  </div>
                </div>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">£{co.revenue.toLocaleString()}</p>
                <p className="text-[11px] font-medium text-gray-400 mt-0.5">Total revenue</p>
              </button>
            ))}
          </div>
        )}

        {crmSection === 'reports' && (
          <div className="space-y-3.5">
            <div className="flex justify-end gap-2">
              <button type="button" onClick={handleExportReportsCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
              <button type="button" onClick={handleExportReportsPDF}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <FileText className="w-3.5 h-3.5" /> Export PDF
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
              {/* Pipeline by Stage */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-xs">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">Pipeline by Stage</h3>
                <p className="text-[11px] text-gray-400 mb-4">Revenue and deal count per stage</p>
                <div className="space-y-4">
                  {stageStats.map((s) => (
                    <ReportBar key={s.stage} label={s.label} valueLabel={`£${s.revenue.toLocaleString()}`} subLabel={`${s.count} deal${s.count === 1 ? '' : 's'}`}
                      pct={(s.revenue / maxStageRevenue) * 100} colorClass="bg-blue-500" />
                  ))}
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-xs">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">Status Breakdown</h3>
                <p className="text-[11px] text-gray-400 mb-4">Clients by relationship status</p>
                <DonutChart
                  totalLabel="Clients"
                  segments={statusStats.map(s => ({
                    label: s.status, value: s.count, colorHex: statusHexColor[s.status], colorClass: statusBarColor[s.status],
                  }))}
                />
              </div>

              {/* Top Companies by Revenue */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-xs lg:col-span-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">Top Companies by Revenue</h3>
                <p className="text-[11px] text-gray-400 mb-4">Highest-value accounts</p>
                {topCompanies.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No data yet</p>
                ) : (
                  <div className="space-y-4">
                    {topCompanies.map((co) => (
                      <ReportBar key={co.company} label={co.company} valueLabel={`£${co.revenue.toLocaleString()}`} subLabel={`${co.count} contact${co.count === 1 ? '' : 's'}`}
                        pct={(co.revenue / maxCompanyRevenue) * 100} colorClass="bg-indigo-500" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {crmSection === 'calendar' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white w-36 text-center">
                  {calendarMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </h3>
                <button type="button" onClick={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Last contact
                </span>
                <button type="button" onClick={() => setCalendarMonth(new Date())}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 cursor-pointer transition-colors">
                  Today
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-gray-100 dark:border-slate-800">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wide">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarCells.map(({ date, inMonth, dayClients }, i) => {
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <div key={i} className={`min-h-[92px] border-b border-r border-gray-50 dark:border-slate-800/60 p-1.5 ${inMonth ? '' : 'bg-gray-50/50 dark:bg-slate-950/40'}`}>
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold mb-1 ${
                      isToday ? 'bg-blue-600 text-white' : inMonth ? 'text-gray-700 dark:text-gray-300' : 'text-gray-300 dark:text-slate-700'
                    }`}>
                      {date.getDate()}
                    </span>
                    <div className="space-y-0.5">
                      {dayClients.slice(0, 2).map(c => (
                        <button key={c.id} type="button" onClick={() => { setSelectedClient(c); setCrmSection('contacts'); setViewMode('board'); }}
                          className="w-full text-left px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-[10px] font-semibold truncate cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                          {c.name}
                        </button>
                      ))}
                      {dayClients.length > 2 && (
                        <p className="text-[9px] font-bold text-gray-400 px-1.5">+{dayClients.length - 2} more</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Board mode: slide-over detail drawer */}
      {crmSection === 'contacts' && viewMode === 'board' && selectedClient && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setSelectedClient(null)} />
          <div className="relative w-full sm:max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <DetailPanel client={selectedClient} />
          </div>
        </div>
      )}

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
      />

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full sm:max-w-lg shadow-2xl max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden border border-white/20 transform animate-in slide-in-from-bottom-10 duration-300 -translate-y-6 sm:translate-y-0">
            <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0"><div className="w-10 h-1 rounded-full bg-gray-300" /></div>
            <div className={modalHeaderCls}>
              <div>
                <h2 className="text-sm sm:text-lg font-bold text-gray-900 tracking-tight">Add new client</h2>
                <p className="text-[11px] text-gray-500 font-medium">Fill in the client details</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2.5 hover:bg-gray-100 rounded-xl transition-all cursor-pointer text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-1.5 sm:py-6 space-y-2 sm:space-y-5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Full name *</label>
                  <input type="text" placeholder="John Smith" value={newClient.name} onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Email *</label>
                  <input type="email" placeholder="john@company.com" value={newClient.email} onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Phone</label>
                  <input type="tel" placeholder="+44 20 1234 5678" value={newClient.phone} onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Company{newClient.clientType === 'business' ? ' *' : ''}</label>
                  <input type="text" placeholder="Acme Corp" value={newClient.company} onChange={(e) => setNewClient({...newClient, company: e.target.value})}
                    className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Client type</label>
                  <select value={newClient.clientType} onChange={(e) => setNewClient({...newClient, clientType: e.target.value as 'business' | 'individual'})}
                    className={selectCls}>
                    <option value="business">Business</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select value={newClient.status} onChange={(e) => setNewClient({...newClient, status: e.target.value as 'active' | 'lead' | 'inactive'})}
                    className={selectCls}>
                    <option value="lead">Lead</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Location</label>
                <input type="text" placeholder="London, UK" value={newClient.location} onChange={(e) => setNewClient({...newClient, location: e.target.value})}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Tags</label>
                <TagInput value={newClient.tags} onChange={(tags) => setNewClient({...newClient, tags})} placeholder="Type a tag and press Enter" />
              </div>
            </div>
            <div className="shrink-0 bg-white border-t border-gray-100 px-5 py-3 flex flex-row gap-2.5 pb-[calc(1.25rem+env(safe-area-inset-bottom,12px))] sm:pb-3">
              <button type="button" onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer active:scale-[0.98]">
                Cancel
              </button>
              <button type="button" onClick={handleAddClient}
                className="flex-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">
                <Plus className="w-4 h-4" /> Add Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && editingClient && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full sm:max-w-lg shadow-2xl max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden border border-white/20 transform animate-in slide-in-from-bottom-10 duration-300 -translate-y-6 sm:translate-y-0">
            <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0"><div className="w-10 h-1 rounded-full bg-gray-300" /></div>
            <div className={modalHeaderCls}>
              <div>
                <h2 className="text-sm sm:text-lg font-bold text-gray-900 tracking-tight">Edit client</h2>
                <p className="text-[11px] text-gray-500 font-medium">Update client details</p>
              </div>
              <button onClick={() => { setShowEditModal(false); setEditingClient(null); }} className="p-2.5 hover:bg-gray-100 rounded-xl transition-all cursor-pointer text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-1.5 sm:py-6 space-y-2 sm:space-y-5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Full name *</label>
                  <input type="text" value={editingClient.name} onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Email *</label>
                  <input type="email" value={editingClient.email} onChange={(e) => setEditingClient({...editingClient, email: e.target.value})}
                    className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Phone</label>
                  <input type="tel" value={editingClient.phone || ''} onChange={(e) => setEditingClient({...editingClient, phone: e.target.value})}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Company{editingClient.clientType === 'business' ? ' *' : ''}</label>
                  <input type="text" value={editingClient.company} onChange={(e) => setEditingClient({...editingClient, company: e.target.value})}
                    className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Client type</label>
                  <select value={editingClient.clientType} onChange={(e) => setEditingClient({...editingClient, clientType: e.target.value as 'business' | 'individual'})}
                    className={selectCls}>
                    <option value="business">Business</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select value={editingClient.status} onChange={(e) => setEditingClient({...editingClient, status: e.target.value as 'active' | 'lead' | 'inactive'})}
                    className={selectCls}>
                    <option value="lead">Lead</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Location</label>
                <input type="text" value={editingClient.location || ''} onChange={(e) => setEditingClient({...editingClient, location: e.target.value})}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Pipeline stage</label>
                <select value={editingClient.pipelineStage} onChange={(e) => setEditingClient({...editingClient, pipelineStage: e.target.value as Client['pipelineStage']})}
                  className={selectCls}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed-won">Closed Won</option>
                  <option value="closed-lost">Closed Lost</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Revenue (£)</label>
                <input type="number" value={editingClient.revenue} onChange={(e) => setEditingClient({...editingClient, revenue: parseFloat(e.target.value) || 0})}
                  className={inputCls} />
              </div>
            </div>
            <div className="shrink-0 bg-white border-t border-gray-100 px-5 py-3 flex flex-row gap-2.5 pb-[calc(1.25rem+env(safe-area-inset-bottom,12px))] sm:pb-3">
              <button type="button" onClick={() => { setShowEditModal(false); setEditingClient(null); }}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer active:scale-[0.98]">
                Cancel
              </button>
              <button type="button" onClick={handleEditClient}
                className="flex-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">
                <Edit className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Compose Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl w-full sm:max-w-lg shadow-2xl max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden border border-gray-200 transform animate-in slide-in-from-bottom-10 duration-300 -translate-y-6 sm:translate-y-0">
            <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0"><div className="w-10 h-1 rounded-full bg-gray-300" /></div>
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200"><Mail className="w-5 h-5 text-gray-500" /></div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Compose Email</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Send to your clients</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowEmailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-3 sm:py-6 space-y-3 sm:space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">To</label>
                <div className="relative">
                  <input type="text" value={emailData.to} onChange={(e) => setEmailData({...emailData, to: e.target.value})}
                    placeholder="client@email.com, another@email.com"
                    className="w-full px-4 pr-16 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100 transition" />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-md border border-gray-200">
                    {emailData.to.split(',').filter(e => e.trim()).length} rcpt
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5">
                <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gray-400" /> Quick Templates
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Thank You', subject: 'Thank you for your business', message: 'Dear valued client,\n\nThank you for choosing our services.\n\nBest regards,\nYour Company' },
                    { label: 'Update', subject: 'Important Update', message: 'Dear valued client,\n\nWe wanted to inform you about an important update.\n\nBest regards,\nYour Company' },
                    { label: 'Follow-up', subject: 'Follow-up on our conversation', message: 'Dear valued client,\n\nI wanted to follow up on our recent conversation.\n\nBest regards,\nYour Company' },
                  ].map(t => (
                    <button key={t.label} type="button" onClick={() => setEmailData({...emailData, subject: t.subject, message: t.message})}
                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer">
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Subject
                </label>
                <input type="text" value={emailData.subject} onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                  placeholder="Email subject"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100 transition" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Message</label>
                <textarea value={emailData.message} onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                  placeholder="Type your message..." rows={5}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100 transition resize-none" />
                <p className="text-[11px] text-gray-400 mt-1">{emailData.message.length} chars</p>
              </div>
            </div>
            <div className="shrink-0 bg-white border-t border-gray-200 px-5 sm:px-6 py-3 sm:py-4 flex flex-row gap-2.5 pb-[calc(1.25rem+env(safe-area-inset-bottom,12px))] sm:pb-4">
              <button type="button" onClick={() => setShowEmailModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
                Cancel
              </button>
              <button
                type="button"
                disabled={sendingEmail}
                onClick={async () => {
                  if (!emailData.to.trim()) { setStatusModal({ isOpen: true, title: 'Validation Error', message: 'Please enter at least one recipient.', type: 'error' }); return; }
                  if (!emailData.subject.trim()) { setStatusModal({ isOpen: true, title: 'Validation Error', message: 'Please enter an email subject.', type: 'error' }); return; }
                  try {
                    setSendingEmail(true);
                    const response = await fetch('/api/email/send', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ to: emailData.to, subject: emailData.subject, html: emailData.message.replace(/\n/g, '<br/>'), text: emailData.message })
                    });
                    if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to send'); }
                    setStatusModal({ isOpen: true, title: 'Email Sent', message: `Sent to ${emailData.to.split(',').length} recipient(s).`, type: 'success' });
                    setShowEmailModal(false);
                    setEmailData({ to: '', subject: '', message: '' });
                  } catch (error) {
                    setStatusModal({ isOpen: true, title: 'Send Failed', message: error instanceof Error ? error.message : 'Could not send email.', type: 'error' });
                  } finally { setSendingEmail(false); }
                }}
                className="flex-2 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {sendingEmail ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Mail className="w-4 h-4" /> Send Email</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingClient && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full sm:max-w-md shadow-2xl flex flex-col overflow-hidden transform -translate-y-6 sm:translate-y-0">
            <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0"><div className="w-10 h-1 rounded-full bg-gray-300" /></div>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-rose-500 shrink-0">
              <div className="p-2 bg-white/20 rounded-xl shrink-0"><Trash2 className="w-4 h-4 text-white" /></div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-white">Delete Client</h2>
                <p className="text-rose-100 text-xs">This action cannot be undone</p>
              </div>
              <button type="button" onClick={() => { setShowDeleteModal(false); setDeletingClient(null); }} className="p-2 hover:bg-white/20 rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-rose-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {deletingClient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{deletingClient.name}</h3>
                  <p className="text-xs text-gray-500">{deletingClient.company}</p>
                  <p className="text-[11px] text-gray-400 font-medium">{deletingClient.email}</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700">
                  Are you sure? This will permanently remove <span className="font-bold">{deletingClient.name}</span> and all associated records.
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 text-center mb-2">Type <span className="font-bold text-gray-900">DELETE</span> to confirm</p>
                <input type="text" id="delete-confirmation" placeholder="Type DELETE"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white bg-gray-50 text-center text-sm font-semibold outline-none transition-all" />
              </div>
            </div>
            <div className="shrink-0 bg-white border-t border-gray-100 px-5 py-3 flex flex-row gap-2.5 pb-[calc(1.25rem+env(safe-area-inset-bottom,12px))] sm:pb-3">
              <button type="button" onClick={() => { setShowDeleteModal(false); setDeletingClient(null); }}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer active:scale-[0.98]">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('delete-confirmation') as HTMLInputElement;
                  if (input?.value === 'DELETE') { handleDeleteClient(); }
                  else { setStatusModal({ isOpen: true, title: 'Confirmation Failed', message: 'Please type DELETE to confirm.', type: 'error' }); }
                }}
                className="flex-2 py-3 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email View Modal */}
      {showEmailViewModal && viewingEmailItem && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full sm:max-w-lg max-h-[85dvh] flex flex-col border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 shrink-0">
                  {viewingEmailItem.type === 'SENT' ? <SendIcon className="w-5 h-5 text-gray-500" /> : <InboxIcon className="w-5 h-5 text-gray-500" />}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-gray-900 truncate">{viewingEmailItem.subject}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(viewingEmailItem.date).toLocaleString()}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowEmailViewModal(false); setViewingEmailItem(null); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">From</p>
                  <p className="text-gray-900 font-medium truncate">{viewingEmailItem.type === 'SENT' ? 'You' : viewingEmailItem.from}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">To</p>
                  <p className="text-gray-900 font-medium truncate">{viewingEmailItem.to}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(viewingEmailItem.body) }} />
              </div>
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => { setShowEmailViewModal(false); setViewingEmailItem(null); }}
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Delete Confirmation Modal */}
      {deletingEmailItem && (
        <DeleteConfirmationModal
          isOpen={showEmailDeleteModal}
          onClose={() => { setShowEmailDeleteModal(false); setDeletingEmailItem(null); }}
          onConfirm={handleDeleteEmailItem}
          title="Delete Email"
          itemName={deletingEmailItem.subject}
          itemDetails={`${deletingEmailItem.type === 'SENT' ? 'To' : 'From'}: ${deletingEmailItem.type === 'SENT' ? deletingEmailItem.to : deletingEmailItem.from}`}
          warningMessage="This will permanently remove this email from your records."
        />
      )}

      {/* Bulk Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        title="Delete Clients"
        itemName={`${selectedIds.size} client${selectedIds.size === 1 ? '' : 's'}`}
        warningMessage="This will permanently remove all selected clients and their associated records."
      />
    </div>
  );
}
