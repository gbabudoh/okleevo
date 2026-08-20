"use client";

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import {
  Calendar, Clock, Plus, X, Mail, Phone, MapPin, Video,
  CheckCircle, Edit, Trash2, Search, TrendingUp, CalendarCheck,
  ChevronDown, Loader2, User, Link as LinkIcon, ExternalLink, Copy, Check
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import StatusModal from '@/components/StatusModal';

interface Booking {
  id: string;
  client: string;
  email: string;
  phone?: string;
  service: string;
  date: string;
  time: string;
  startTime: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  type: 'in-person' | 'video' | 'phone';
  location?: string;
  notes?: string;
}

interface CrmContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

const inputCls = 'w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-950 transition-all';
const selectCls = `${inputCls} appearance-none cursor-pointer`;
const labelCls = 'block text-[10px] font-extrabold font-mono uppercase tracking-widest text-slate-400 dark:text-slate-400 mb-1.5';
const modalHeaderCls = 'px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60';

const ModalHandle = () => (
  <div className="flex justify-center pt-2 pb-0 sm:hidden shrink-0">
    <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
  </div>
);

const ModalFooter = ({ children }: { children: ReactNode }) => (
  <div className="shrink-0 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200/80 dark:border-slate-800 p-5 flex flex-row gap-3">
    {children}
  </div>
);

const CancelBtn = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex-1 py-3 px-5 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-extrabold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
  >
    Cancel
  </button>
);

const statusConfig: Record<Booking['status'], { label: string; dot: string; badge: string }> = {
  confirmed: { label: 'Confirmed', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60' },
  pending:   { label: 'Pending',   dot: 'bg-yellow-400',   badge: 'bg-yellow-50 text-amber-700 dark:bg-yellow-950/40 dark:text-yellow-400 border border-yellow-200/60' },
  cancelled: { label: 'Cancelled', dot: 'bg-rose-500',     badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60' },
  completed: { label: 'Completed', dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/60' },
};

const typeIcon = (type: string) => {
  if (type === 'video')     return <Video className="w-3.5 h-3.5 text-orange-500" />;
  if (type === 'phone')     return <Phone className="w-3.5 h-3.5 text-orange-500" />;
  if (type === 'in-person') return <MapPin className="w-3.5 h-3.5 text-orange-500" />;
  return <Calendar className="w-3.5 h-3.5 text-orange-500" />;
};

const initials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

const blankBooking = () => ({
  client: '', email: '', phone: '', service: '',
  date: '', time: '', duration: 60,
  type: 'video' as 'in-person' | 'video' | 'phone',
  location: '', notes: '',
});

const BookingFormFields = ({
  data, onChange, contacts = [],
}: {
  data: ReturnType<typeof blankBooking> | Booking;
  onChange: (patch: Partial<Booking>) => void;
  contacts?: CrmContact[];
}) => (
  <div className="space-y-3 sm:space-y-4">
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className={labelCls}>Client name *</label>
        <input type="text" list="crm-contacts" value={data.client}
          onChange={e => {
            const name = e.target.value;
            const match = contacts.find(c => c.name.toLowerCase() === name.toLowerCase());
            if (match) {
              onChange({ client: match.name, email: match.email, phone: match.phone || data.phone });
            } else {
              onChange({ client: name });
            }
          }}
          className={inputCls} placeholder="e.g. John Smith" />
        {contacts.length > 0 && (
          <datalist id="crm-contacts">
            {contacts.map(c => <option key={c.id} value={c.name} />)}
          </datalist>
        )}
        {contacts.length > 0 && (
          <p className="text-[10px] font-mono font-bold text-slate-400 mt-1">Start typing to pick an existing CRM contact</p>
        )}
      </div>
      <div>
        <label className={labelCls}>Email *</label>
        <input type="email" value={data.email} onChange={e => onChange({ email: e.target.value })}
          className={inputCls} placeholder="john@email.com" />
      </div>
      <div>
        <label className={labelCls}>Phone</label>
        <input type="tel" value={data.phone || ''} onChange={e => onChange({ phone: e.target.value })}
          className={inputCls} placeholder="+44 20 ..." />
      </div>
      <div>
        <label className={labelCls}>Service *</label>
        <input type="text" value={data.service} onChange={e => onChange({ service: e.target.value })}
          className={inputCls} placeholder="e.g. Consultation" />
      </div>
      <div>
        <label className={labelCls}>Date *</label>
        <input type="date" value={data.date} onChange={e => onChange({ date: e.target.value })}
          className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Time *</label>
        <input type="time" value={data.time} onChange={e => onChange({ time: e.target.value })}
          className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Duration</label>
        <select value={data.duration} onChange={e => onChange({ duration: parseInt(e.target.value) })}
          className={selectCls}>
          <option value="30">30 min</option>
          <option value="45">45 min</option>
          <option value="60">60 min</option>
          <option value="90">90 min</option>
          <option value="120">2 hours</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Type</label>
        <select value={data.type} onChange={e => onChange({ type: e.target.value as 'in-person' | 'video' | 'phone' })}
          className={selectCls}>
          <option value="video">Video Call</option>
          <option value="phone">Phone Call</option>
          <option value="in-person">In-Person</option>
        </select>
      </div>
    </div>
    {'status' in data && (
      <div>
        <label className={labelCls}>Status</label>
        <select value={(data as Booking).status}
          onChange={e => onChange({ status: e.target.value as Booking['status'] })}
          className={selectCls}>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    )}
    <div>
      <label className={labelCls}>
        Location {data.type !== 'in-person' && <span className="text-slate-400 font-normal">(in-person only)</span>}
      </label>
      <input type="text" value={data.location || ''}
        onChange={e => onChange({ location: e.target.value })}
        disabled={data.type !== 'in-person'}
        className={`${inputCls} disabled:opacity-40 disabled:cursor-not-allowed`}
        placeholder="e.g. Room 1" />
    </div>
    <div>
      <label className={labelCls}>Notes</label>
      <textarea value={data.notes || ''} onChange={e => onChange({ notes: e.target.value })}
        className={`${inputCls} h-20 resize-none`} placeholder="Additional details..." />
    </div>
  </div>
);

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal]       = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal]     = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editBooking, setEditBooking]         = useState<Booking | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);

  const [newBooking, setNewBooking] = useState(blankBooking());
  const [savingBooking, setSavingBooking] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: session } = useSession();
  const [statusModal, setStatusModal] = useState({ isOpen: false, title: '', message: '', type: 'success' as 'success' | 'error' });
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // 1. Check session user businessId
    const sessBizId = (session?.user as any)?.businessId;
    if (sessBizId) {
      setBusinessId(sessBizId);
      return;
    }

    // 2. Fallback to /api/user/profile
    fetch('/api/user/profile')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.business?.id) setBusinessId(data.business.id);
        else if (data?.businessId) setBusinessId(data.businessId);
      })
      .catch(() => {});
  }, [session]);

  const getPublicBookingUrl = () => {
    if (!businessId) return '';
    return `${window.location.origin}/booking/${businessId}`;
  };

  const handleCopyBookingLink = () => {
    const url = getPublicBookingUrl();
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
    setStatusModal({
      isOpen: true,
      title: 'Public Booking Link Copied!',
      message: `Your client booking link is:\n${url}\n\nClients can use this link to schedule video, phone, or in-person appointments with you.`,
      type: 'success',
    });
  };

  const handleOpenBookingPage = () => {
    const url = getPublicBookingUrl();
    if (url) window.open(url, '_blank');
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) setBookings(await res.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  useEffect(() => {
    fetch('/api/crm/clients')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setContacts(data.map((c: { id: string; name: string; email: string; phone?: string }) => ({
            id: c.id, name: c.name, email: c.email, phone: c.phone,
          })));
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateBooking = async () => {
    if (!newBooking.client || !newBooking.email || !newBooking.service || !newBooking.date || !newBooking.time) return;
    setSavingBooking(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(prev => [data, ...prev]);
        setShowAddModal(false);
        setNewBooking(blankBooking());
        setStatusModal({ isOpen: true, title: 'Booking Created', message: `Appointment for ${data.client} has been booked.`, type: 'success' });
      } else {
        const err = await res.json();
        setStatusModal({ isOpen: true, title: 'Booking Failed', message: err.error || 'Failed to create booking', type: 'error' });
      }
    } catch {
      setStatusModal({ isOpen: true, title: 'Error', message: 'Something went wrong', type: 'error' });
    } finally {
      setSavingBooking(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editBooking) return;
    setSavingBooking(true);
    try {
      const res = await fetch(`/api/bookings/${editBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editBooking),
      });
      if (res.ok) {
        const updated = await res.json();
        setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
        setShowEditModal(false);
        setEditBooking(null);
        setStatusModal({ isOpen: true, title: 'Booking Updated', message: `Booking for ${updated.client} was updated.`, type: 'success' });
      }
    } catch {
      setStatusModal({ isOpen: true, title: 'Error', message: 'Failed to update booking', type: 'error' });
    } finally {
      setSavingBooking(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBooking) return;
    try {
      const res = await fetch(`/api/bookings/${deletingBooking.id}`, { method: 'DELETE' });
      if (res.ok) {
        setBookings(prev => prev.filter(b => b.id !== deletingBooking.id));
        setStatusModal({ isOpen: true, title: 'Booking Deleted', message: 'The booking was deleted successfully.', type: 'success' });
      }
    } catch {
      setStatusModal({ isOpen: true, title: 'Error', message: 'Failed to delete booking', type: 'error' });
    } finally {
      setShowDeleteModal(false);
      setDeletingBooking(null);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const q = searchTerm.toLowerCase();
    const matchQ = b.client.toLowerCase().includes(q) || b.service.toLowerCase().includes(q) || b.email.toLowerCase().includes(q);
    const matchS = filterStatus === 'all' || b.status === filterStatus;
    return matchQ && matchS;
  });

  const totalBookings     = bookings.length;
  const confirmedCount    = bookings.filter(b => b.status === 'confirmed').length;
  const upcomingCount     = bookings.filter(b => (b.status === 'confirmed' || b.status === 'pending') && new Date(b.startTime).getTime() >= Date.now()).length;
  const completedCount    = bookings.filter(b => b.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-24 sm:pb-8">

      {/* Mobile FAB */}
      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        className="sm:hidden fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-95 transition-transform"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* ── Glassmorphic Sticky Header ── */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center justify-between sm:justify-start gap-3 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 sm:p-2.5 bg-orange-50 dark:bg-orange-950/60 border border-orange-200/60 dark:border-orange-800/60 text-orange-500 rounded-2xl shrink-0 shadow-2xs">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight">Bookings & Appointments</h1>
                <p className="text-xs font-bold text-slate-400 truncate hidden sm:block">Manage client schedules, automated bookings, and service appointments.</p>
              </div>
            </div>

            {/* Desktop Action Buttons (< sm hidden) */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyBookingLink}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:border-orange-400 hover:text-orange-600 transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Copy client booking link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <LinkIcon className="w-4 h-4 text-orange-500" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Booking Link'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenBookingPage}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:border-orange-400 hover:text-orange-600 transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Preview public client booking page in new tab"
              >
                <ExternalLink className="w-4 h-4 text-slate-400" />
                <span>Preview Page</span>
              </button>

              <button
                id="tour-booking-new"
                type="button"
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl text-xs font-extrabold shadow-sm shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>New Booking</span>
              </button>
            </div>
          </div>

          {/* Mobile Toolbar Actions (sm:hidden) */}
          <div className="flex sm:hidden items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleCopyBookingLink}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-extrabold text-slate-700 dark:text-slate-300 active:bg-slate-100 shadow-2xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <LinkIcon className="w-3.5 h-3.5 text-orange-500" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>
            <button
              type="button"
              onClick={handleOpenBookingPage}
              className="p-2.5 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-300 active:bg-slate-100 shadow-2xs shrink-0"
              title="Preview public booking page"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl text-xs font-extrabold shadow-2xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Booking</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── High-Performance Telemetry Pods ── */}
        <div id="tour-booking-stats" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Bookings', value: totalBookings,  icon: CalendarCheck, color: 'text-orange-500' },
            { label: 'Confirmed',      value: confirmedCount, icon: CheckCircle,   color: 'text-emerald-500' },
            { label: 'Upcoming',       value: upcomingCount,  icon: Clock,         color: 'text-blue-500' },
            { label: 'Completed',      value: completedCount, icon: TrendingUp,    color: 'text-amber-500' },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-slate-950 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-orange-400 dark:hover:border-orange-500 transition-all group flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-extrabold font-mono text-slate-400 uppercase tracking-widest">{s.label}</p>
                <div className={`p-2 bg-slate-50 dark:bg-slate-900 rounded-xl ${s.color} group-hover:scale-110 transition-transform`}>
                  <s.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white leading-none">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Search + Filter Dock ── */}
        <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-3.5 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search clients or services…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl text-xs font-bold outline-none border border-slate-200/80 dark:border-slate-800 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-950 transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="relative sm:w-52">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl text-xs font-bold outline-none border border-slate-200/80 dark:border-slate-800 focus:border-orange-500 transition-all appearance-none cursor-pointer pr-9"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* ── Booking List / Empty State Workspace ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-xs font-bold text-slate-400">Loading bookings…</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-12 text-center space-y-4">
            <div className="w-14 h-14 bg-orange-50 dark:bg-orange-950/60 border border-orange-200/60 text-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xs">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {searchTerm || filterStatus !== 'all' ? 'No matching bookings' : 'No bookings yet'}
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-1">
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter.'
                  : 'Create your first booking to get started.'}
              </p>
            </div>
            {!searchTerm && filterStatus === 'all' && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl text-xs font-extrabold shadow-sm shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" /> New Booking
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBookings.map(booking => {
              const sc = statusConfig[booking.status] ?? statusConfig.pending;
              return (
                <div key={booking.id} className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 hover:border-orange-400 transition-all flex flex-col justify-between space-y-4 group">
                  <div className="flex items-start gap-3.5">
                    {/* Avatar Badge */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-mono font-extrabold text-sm flex items-center justify-center shadow-2xs">
                        {initials(booking.client)}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-950 ${sc.dot}`} />
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate group-hover:text-orange-500 transition-colors">{booking.client}</p>
                          <p className="text-xs font-bold text-slate-400 truncate mt-0.5">{booking.service}</p>
                        </div>
                        <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${sc.badge}`}>
                          {sc.label}
                        </span>
                      </div>

                      {/* Meta Row */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-900">
                        <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-orange-500" /> {booking.date}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-orange-500" /> {booking.time} · {booking.duration}m
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 capitalize">
                          {typeIcon(booking.type)} <span>{booking.type}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-900">
                    <button
                      type="button"
                      onClick={() => { setSelectedBooking(booking); setShowDetailModal(true); }}
                      className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-extrabold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <User className="w-3.5 h-3.5" /> Details
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditBooking(booking); setShowEditModal(true); }}
                      className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-extrabold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDeletingBooking(booking); setShowDeleteModal(true); }}
                      className="flex-1 py-2 px-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-500 rounded-xl text-xs font-extrabold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add Booking Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-950 w-full sm:max-w-lg flex flex-col overflow-hidden max-h-[92dvh] sm:max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 transform animate-in slide-in-from-bottom-10 duration-300 -translate-y-6 sm:translate-y-0">
            <ModalHandle />
            <div className={modalHeaderCls}>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">New booking</h2>
                <p className="text-xs font-bold text-slate-400">Fill in the booking details</p>
              </div>
              <button type="button" onClick={() => { setShowAddModal(false); setNewBooking(blankBooking()); }}
                className="p-2 rounded-xl hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-all cursor-pointer text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <BookingFormFields
                data={newBooking}
                onChange={patch => setNewBooking(prev => ({ ...prev, ...patch }))}
                contacts={contacts}
              />
            </div>

            <ModalFooter>
              <CancelBtn onClick={() => { setShowAddModal(false); setNewBooking(blankBooking()); }} />
              <button
                type="button"
                onClick={handleCreateBooking}
                disabled={savingBooking || !newBooking.client || !newBooking.email || !newBooking.service || !newBooking.date || !newBooking.time}
                className="flex-2 py-3 px-5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-95"
              >
                {savingBooking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {savingBooking ? 'Creating...' : 'Create Booking'}
              </button>
            </ModalFooter>
          </div>
        </div>
      )}

      {/* ── Edit Booking Modal ── */}
      {showEditModal && editBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-950 w-full sm:max-w-lg flex flex-col overflow-hidden max-h-[92dvh] sm:max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 transform animate-in slide-in-from-bottom-10 duration-300 -translate-y-6 sm:translate-y-0">
            <ModalHandle />
            <div className={modalHeaderCls}>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Edit booking</h2>
                <p className="text-xs font-bold text-slate-400">Update booking details</p>
              </div>
              <button type="button" onClick={() => { setShowEditModal(false); setEditBooking(null); }}
                className="p-2 rounded-xl hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-all cursor-pointer text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <BookingFormFields
                data={editBooking}
                onChange={patch => setEditBooking(prev => prev ? { ...prev, ...patch } : prev)}
                contacts={contacts}
              />
            </div>

            <ModalFooter>
              <CancelBtn onClick={() => { setShowEditModal(false); setEditBooking(null); }} />
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingBooking}
                className="flex-2 py-3 px-5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-95"
              >
                {savingBooking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {savingBooking ? 'Saving...' : 'Save Changes'}
              </button>
            </ModalFooter>
          </div>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-950 w-full sm:max-w-md flex flex-col overflow-hidden max-h-[92dvh] sm:max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 transform animate-in slide-in-from-bottom-10 duration-300 -translate-y-6 sm:translate-y-0">
            <ModalHandle />
            <div className={modalHeaderCls}>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Booking details</h2>
              <button type="button" onClick={() => setShowDetailModal(false)}
                className="p-2 rounded-xl hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-all cursor-pointer text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {/* Avatar + Name */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-base font-mono font-extrabold flex items-center justify-center shrink-0 shadow-2xs">
                  {initials(selectedBooking.client)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">{selectedBooking.client}</h3>
                  <p className="text-xs font-bold text-slate-400 truncate mt-0.5">{selectedBooking.service}</p>
                  <span className={`inline-block mt-1.5 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusConfig[selectedBooking.status]?.badge ?? 'bg-slate-100 text-slate-600'}`}>
                    {statusConfig[selectedBooking.status]?.label ?? selectedBooking.status}
                  </span>
                </div>
              </div>

              {/* Date / Time / Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800">
                  <p className="text-[10px] font-extrabold font-mono text-slate-400 uppercase tracking-widest mb-1">Date</p>
                  <p className="text-xs font-extrabold font-mono text-slate-900 dark:text-white">{selectedBooking.date}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800">
                  <p className="text-[10px] font-extrabold font-mono text-slate-400 uppercase tracking-widest mb-1">Time</p>
                  <p className="text-xs font-extrabold font-mono text-slate-900 dark:text-white">{selectedBooking.time} · {selectedBooking.duration}m</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="font-mono font-bold break-all">{selectedBooking.email}</span>
                </div>
                {selectedBooking.phone && (
                  <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                    <span className="font-mono font-bold">{selectedBooking.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 capitalize">
                  {typeIcon(selectedBooking.type)}
                  <span className="font-bold">{selectedBooking.type}</span>
                </div>
                {selectedBooking.location && (
                  <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                    <span className="font-bold">{selectedBooking.location}</span>
                  </div>
                )}
              </div>

              {selectedBooking.notes && (
                <div className="bg-orange-50 dark:bg-orange-950/40 rounded-2xl p-4 border border-orange-200/60 dark:border-orange-900/40">
                  <p className="text-[10px] font-extrabold font-mono text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-1">Notes</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-bold leading-relaxed">{selectedBooking.notes}</p>
                </div>
              )}
            </div>

            <ModalFooter>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="flex-1 py-3 px-5 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-extrabold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => { setShowDetailModal(false); setEditBooking(selectedBooking); setShowEditModal(true); }}
                className="flex-2 py-3 px-5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-95"
              >
                <Edit className="w-4 h-4" /> Edit Booking
              </button>
            </ModalFooter>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deletingBooking && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeletingBooking(null); }}
          onConfirm={handleDeleteConfirm}
          title="Delete Booking"
          itemName={deletingBooking.client}
          itemDetails={`${deletingBooking.service} · ${deletingBooking.date}`}
          warningMessage="This action cannot be undone."
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
