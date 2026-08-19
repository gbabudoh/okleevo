"use client";

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  Calendar, Clock, Plus, X, Mail, Phone, MapPin, Video,
  CheckCircle, Edit, Trash2, Search, TrendingUp, CalendarCheck,
  ChevronDown, Loader2, User, Link as LinkIcon
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

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-sm font-medium bg-white';
const selectCls = `${inputCls} appearance-none cursor-pointer`;
const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';
const modalHeaderCls = 'px-5 sm:px-6 py-3 sm:py-5 flex items-center justify-between shrink-0 border-b border-gray-100';

const ModalHandle = () => (
  <div className="flex justify-center pt-2 pb-0 sm:hidden shrink-0">
    <div className="w-10 h-1 rounded-full bg-gray-300" />
  </div>
);

const ModalFooter = ({ children }: { children: ReactNode }) => (
  <div className="shrink-0 bg-white border-t border-gray-100 px-4 sm:px-6 pt-3.5 pb-8 sm:pb-5 flex flex-row gap-2.5 mb-1.5 sm:mb-0">
    {children}
  </div>
);

const CancelBtn = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex-1 py-3 px-5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
  >
    Cancel
  </button>
);

const statusConfig = {
  confirmed: { label: 'Confirmed', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
  pending:   { label: 'Pending',   dot: 'bg-amber-400',   badge: 'bg-amber-100 text-amber-700' },
  cancelled: { label: 'Cancelled', dot: 'bg-red-400',     badge: 'bg-red-100 text-red-600' },
  completed: { label: 'Completed', dot: 'bg-blue-500',    badge: 'bg-blue-100 text-blue-700' },
};

const typeIcon = (type: string) => {
  if (type === 'video')     return <Video className="w-3.5 h-3.5" />;
  if (type === 'phone')     return <Phone className="w-3.5 h-3.5" />;
  if (type === 'in-person') return <MapPin className="w-3.5 h-3.5" />;
  return <Calendar className="w-3.5 h-3.5" />;
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
  <div className="space-y-2 sm:space-y-4">
    <div className="grid grid-cols-2 gap-2 sm:gap-3">
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
          <p className="text-[10px] text-gray-400 mt-1">Start typing to pick an existing CRM contact</p>
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
        Location {data.type !== 'in-person' && <span className="text-gray-400 font-normal">(in-person only)</span>}
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
        className={`${inputCls} h-16 sm:h-20 resize-none`} placeholder="Additional details..." />
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
  const [filterStatus, setFilterStatus]       = useState('all');
  const [searchTerm, setSearchTerm]           = useState('');
  const [newBooking, setNewBooking]           = useState(blankBooking());
  const [contacts, setContacts]               = useState<CrmContact[]>([]);
  const [businessId, setBusinessId]           = useState<string | null>(null);
  const [savingBooking, setSavingBooking]     = useState(false);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info';
  }>({ isOpen: false, title: '', message: '', type: 'success' });

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/bookings');
      if (res.ok) setBookings(await res.json());
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  useEffect(() => {
    fetch('/api/crm').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setContacts(data.map((c: { id: string; name: string; email: string; phone?: string }) => ({ id: c.id, name: c.name, email: c.email, phone: c.phone })));
    }).catch(() => {});
    fetch('/api/business').then(res => res.json()).then(data => {
      if (data?.id) setBusinessId(data.id);
    }).catch(() => {});
  }, []);

  const handleCopyBookingLink = async () => {
    if (!businessId) return;
    const link = `${window.location.origin}/booking/${businessId}`;
    await navigator.clipboard.writeText(link);
    setStatusModal({ isOpen: true, title: 'Link Copied', message: 'Your public booking request link has been copied to your clipboard.', type: 'info' });
  };

  const handleCreateBooking = async () => {
    setSavingBooking(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create booking');
      setBookings(prev => [data, ...prev]);
      setShowAddModal(false);
      setNewBooking(blankBooking());
    } catch (error: unknown) {
      setStatusModal({ isOpen: true, title: 'Could Not Create Booking', message: error instanceof Error ? error.message : 'Failed to create booking.', type: 'error' });
    } finally {
      setSavingBooking(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editBooking) return;
    setSavingBooking(true);
    try {
      const res = await fetch(`/api/bookings/${editBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editBooking),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error || 'Failed to update booking');
      setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
      setShowEditModal(false);
      setEditBooking(null);
    } catch (error: unknown) {
      setStatusModal({ isOpen: true, title: 'Could Not Save Changes', message: error instanceof Error ? error.message : 'Failed to update booking.', type: 'error' });
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
        setShowDeleteModal(false);
        setDeletingBooking(null);
      }
    } catch { /* silent */ }
  };

  const filteredBookings = bookings.filter(b => {
    const matchSearch = b.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        b.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterStatus === 'all' || b.status === filterStatus;
    return matchSearch && matchFilter;
  });

  const totalBookings     = bookings.length;
  const confirmedCount    = bookings.filter(b => b.status === 'confirmed').length;
  const upcomingCount     = bookings.filter(b => (b.status === 'confirmed' || b.status === 'pending') && new Date(b.startTime).getTime() >= Date.now()).length;
  const completedCount    = bookings.filter(b => b.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 sm:pb-8">

      {/* Mobile FAB */}
      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        className="sm:hidden fixed bottom-24 right-6 w-14 h-14 bg-linear-to-r from-indigo-600 to-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-95 transition-transform"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl shrink-0">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Bookings</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Manage appointments and schedule</p>
          </div>
          <button
            type="button"
            onClick={handleCopyBookingLink}
            disabled={!businessId}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <LinkIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Booking Link</span>
          </button>
          <button
            id="tour-booking-new"
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Booking</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 space-y-5">

        {/* Stats */}
        <div id="tour-booking-stats" className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[
            { label: 'Total Bookings', value: totalBookings,  icon: CalendarCheck, bgGrad: 'bg-gradient-to-br from-indigo-500 to-indigo-600' },
            { label: 'Confirmed',      value: confirmedCount, icon: CheckCircle,   bgGrad: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
            { label: 'Upcoming',       value: upcomingCount,  icon: Clock,         bgGrad: 'bg-gradient-to-br from-purple-500 to-indigo-600' },
            { label: 'Completed',      value: completedCount, icon: TrendingUp,    bgGrad: 'bg-gradient-to-br from-amber-500 to-orange-600' },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 ${s.bgGrad} rounded-xl w-fit group-hover:scale-105 transition-transform text-white shadow-xs`}>
                  <s.icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-3 flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search clients or services…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-slate-800 dark:text-white rounded-xl text-sm outline-none border border-gray-100 dark:border-slate-700 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <div className="relative sm:w-48">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-800 dark:text-white rounded-xl text-sm outline-none border border-gray-100 dark:border-slate-700 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer pr-8"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Booking list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Loading bookings…</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-12 text-center">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {searchTerm || filterStatus !== 'all' ? 'No matching bookings' : 'No bookings yet'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Create your first booking to get started.'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> New Booking
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredBookings.map(booking => {
              const sc = statusConfig[booking.status] ?? statusConfig.pending;
              return (
                <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                        {initials(booking.client)}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${sc.dot}`} />
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-tight">{booking.client}</p>
                          <p className="text-xs text-gray-500 font-medium">{booking.service}</p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${sc.badge}`}>
                          {sc.label}
                        </span>
                      </div>

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" /> {booking.date}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5 text-gray-400" /> {booking.time} · {booking.duration}m
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400 capitalize">
                          {typeIcon(booking.type)} {booking.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 mt-3 pt-3 border-t border-gray-50">
                    <button
                      type="button"
                      onClick={() => { setSelectedBooking(booking); setShowDetailModal(true); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" /> Details
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditBooking(booking); setShowEditModal(true); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDeletingBooking(booking); setShowDeleteModal(true); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
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
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg flex flex-col overflow-hidden max-h-[92dvh] sm:max-h-[92vh] rounded-2xl shadow-2xl border border-white/20 transform animate-in slide-in-from-bottom-10 duration-300 -translate-y-6 sm:translate-y-0">
            <ModalHandle />
            <div className={modalHeaderCls}>
              <div>
                <h2 className="text-sm sm:text-lg font-bold text-gray-900 tracking-tight">New booking</h2>
                <p className="text-[11px] text-gray-500 font-medium">Fill in the booking details</p>
              </div>
              <button type="button" onClick={() => { setShowAddModal(false); setNewBooking(blankBooking()); }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 py-1.5 sm:py-5">
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
                className="flex-2 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg flex flex-col overflow-hidden max-h-[92dvh] sm:max-h-[92vh] rounded-2xl shadow-2xl border border-white/20 transform animate-in slide-in-from-bottom-10 duration-300 -translate-y-6 sm:translate-y-0">
            <ModalHandle />
            <div className={modalHeaderCls}>
              <div>
                <h2 className="text-sm sm:text-lg font-bold text-gray-900 tracking-tight">Edit booking</h2>
                <p className="text-[11px] text-gray-500 font-medium">Update booking details</p>
              </div>
              <button type="button" onClick={() => { setShowEditModal(false); setEditBooking(null); }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 py-1.5 sm:py-5">
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
                className="flex-2 py-3 px-5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full sm:max-w-md flex flex-col overflow-hidden max-h-[92dvh] sm:max-h-[92vh] rounded-2xl shadow-2xl border border-white/20 transform animate-in slide-in-from-bottom-10 duration-300 -translate-y-6 sm:translate-y-0">
            <ModalHandle />
            <div className={modalHeaderCls}>
              <h2 className="text-sm sm:text-lg font-bold text-gray-900 tracking-tight">Booking details</h2>
              <button type="button" onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 py-1.5 sm:py-5 space-y-3 sm:space-y-4">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold shrink-0">
                  {initials(selectedBooking.client)}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">{selectedBooking.client}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">{selectedBooking.service}</p>
                  <span className={`inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusConfig[selectedBooking.status]?.badge ?? 'bg-gray-100 text-gray-600'}`}>
                    {statusConfig[selectedBooking.status]?.label ?? selectedBooking.status}
                  </span>
                </div>
              </div>

              {/* Date / time / type */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-indigo-50 rounded-xl p-2.5 sm:p-3 border border-indigo-100">
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide mb-1">Date</p>
                  <p className="text-xs sm:text-sm font-bold text-indigo-900">{selectedBooking.date}</p>
                </div>
                <div className="bg-indigo-50 rounded-xl p-2.5 sm:p-3 border border-indigo-100">
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide mb-1">Time</p>
                  <p className="text-xs sm:text-sm font-bold text-indigo-900">{selectedBooking.time} · {selectedBooking.duration}m</p>
                </div>
              </div>

              {/* Contact info */}
              <div className="bg-gray-50 rounded-xl p-3 sm:p-3.5 border border-gray-100 space-y-2 sm:space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-700">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                  <span className="font-medium break-all">{selectedBooking.email}</span>
                </div>
                {selectedBooking.phone && (
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-700">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                    <span className="font-medium">{selectedBooking.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-700 capitalize">
                  {typeIcon(selectedBooking.type)}
                  <span className="font-medium">{selectedBooking.type}</span>
                </div>
                {selectedBooking.location && (
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-700">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                    <span className="font-medium">{selectedBooking.location}</span>
                  </div>
                )}
              </div>

              {selectedBooking.notes && (
                <div className="bg-yellow-50 rounded-xl p-3 sm:p-3.5 border border-yellow-100">
                  <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">{selectedBooking.notes}</p>
                </div>
              )}
            </div>

            <ModalFooter>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="flex-1 py-3 px-5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => { setShowDetailModal(false); setEditBooking(selectedBooking); setShowEditModal(true); }}
                className="flex-2 py-3 px-5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
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
