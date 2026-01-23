"use client";

import React, { useState } from 'react';
import { Calendar, Clock, Plus, X, Mail, Phone, MapPin, Video, CheckCircle, Edit, Trash2, Filter, Search, TrendingUp, CalendarCheck, ChevronRight } from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface Booking {
  id: string;
  client: string;
  email: string;
  phone?: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  type: 'in-person' | 'video' | 'phone';
  location?: string;
  notes?: string;
}

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([
    { id: '1', client: 'John Smith', email: 'john@email.com', phone: '+44 20 1234 5678', service: 'Consultation', date: '2024-12-10', time: '10:00 AM', duration: 60, status: 'confirmed', type: 'video', notes: 'First time client' },
    { id: '2', client: 'Sarah Johnson', email: 'sarah@email.com', phone: '+44 161 234 5678', service: 'Strategy Session', date: '2024-12-11', time: '2:00 PM', duration: 90, status: 'confirmed', type: 'in-person', location: 'Office - Room 3' },
    { id: '3', client: 'Mike Brown', email: 'mike@email.com', service: 'Follow-up', date: '2024-12-12', time: '11:30 AM', duration: 30, status: 'pending', type: 'phone' },
    { id: '4', client: 'Emma Wilson', email: 'emma@email.com', phone: '+44 117 234 5678', service: 'Initial Meeting', date: '2024-12-13', time: '3:00 PM', duration: 45, status: 'confirmed', type: 'video' },
    { id: '5', client: 'David Lee', email: 'david@email.com', service: 'Review Session', date: '2024-12-09', time: '9:00 AM', duration: 60, status: 'completed', type: 'in-person', location: 'Office - Room 1' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newBooking, setNewBooking] = useState({
    client: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    duration: 60,
    type: 'video' as 'in-person' | 'video' | 'phone',
    location: '',
    notes: ''
  });

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         booking.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const upcomingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;

  const handleDeleteBooking = (booking: Booking) => {
    setDeletingBooking(booking);
    setShowDeleteModal(true);
  };

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'confirmed': return { color: 'text-emerald-600', bg: 'bg-emerald-500', label: 'Confirmed' };
      case 'pending': return { color: 'text-amber-600', bg: 'bg-amber-500', label: 'Pending' };
      case 'cancelled': return { color: 'text-rose-600', bg: 'bg-rose-500', label: 'Cancelled' };
      case 'completed': return { color: 'text-blue-600', bg: 'bg-blue-500', label: 'Completed' };
      default: return { color: 'text-gray-600', bg: 'bg-gray-500', label: status };
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'video': return <Video className="w-3.5 h-3.5" />;
      case 'phone': return <Phone className="w-3.5 h-3.5" />;
      case 'in-person': return <MapPin className="w-3.5 h-3.5" />;
      default: return <Calendar className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F8FAFC]">
      {/* Enhanced Background */}
      <div className="fixed inset-0 z-0">
         <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-purple-200/20 rounded-full blur-[120px] mix-blend-multiply" />
         <div className="absolute top-[20%] right-[-20%] w-[60%] h-[60%] bg-blue-200/20 rounded-full blur-[120px] mix-blend-multiply" />
         <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-amber-100/30 rounded-full blur-[100px] mix-blend-multiply" />
      </div>

      <div className="relative z-10 p-8 max-w-[1600px] mx-auto space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              Bookings
              <span className="text-lg font-medium text-gray-400 bg-white/50 px-3 py-1 rounded-full border border-gray-100 backdrop-blur-sm">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </h1>
            <p className="text-gray-500 font-medium text-lg max-w-xl">
              Manage your upcoming schedule and appointments efficiently.
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="group px-6 py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-gray-200 hover:shadow-2xl hover:bg-black hover:-translate-y-1 transition-all duration-300 cursor-pointer text-sm"
          >
            <span>New Booking</span>
            <div className="p-1 rounded-lg bg-white/20 group-hover:rotate-90 transition-transform duration-300">
              <Plus className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Improved Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            { label: 'Total Bookings', value: totalBookings, icon: CalendarCheck, color: 'blue', sub: 'All time' },
            { label: 'Confirmed', value: confirmedBookings, icon: CheckCircle, color: 'emerald', sub: 'Active' },
            { label: 'Upcoming', value: upcomingBookings.length, icon: Clock, color: 'purple', sub: 'Scheduled' },
            { label: 'Completed', value: completedBookings, icon: TrendingUp, color: 'orange', sub: 'Archive' },
          ].map((stat, i) => (
            <div key={i} className="relative overflow-hidden bg-white/70 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/80 shadow-sm transition-all duration-300">
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center mb-4 border border-${stat.color}-100`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-4xl font-black text-gray-900 tracking-tight block">{stat.value}</span>
                  <p className="text-gray-900 font-bold text-sm tracking-tight">{stat.label}</p>
                  <p className="text-gray-400 font-semibold text-xs">{stat.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Filters & Search */}
        <div className="bg-white/60 backdrop-blur-2xl p-2 rounded-[1.5rem] border border-white/60 shadow-sm flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Search clients, services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-4 py-4 bg-transparent rounded-2xl outline-none font-medium placeholder-gray-400 focus:bg-white/50 transition-colors text-gray-900"
            />
          </div>
          <div className="h-auto w-px bg-gray-200 hidden md:block my-2" />
          <div className="relative group min-w-[240px]">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-14 pr-10 py-4 bg-transparent rounded-2xl outline-none font-medium text-gray-700 cursor-pointer appearance-none focus:bg-white/50 transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
          </div>
        </div>

        {/* Modern List View */}
        <div className="grid gap-4">
          {filteredBookings.map((booking, index) => {
            const status = getStatusConfig(booking.status);
            return (
              <div 
                key={booking.id} 
                className="group relative bg-white/70 backdrop-blur-xl rounded-[20px] p-1 shadow-sm border border-white/60 hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-6 bg-white/40 rounded-[16px] p-5 transition-colors group-hover:bg-white/60">
                  {/* Avatar & Name */}
                  <div className="flex items-center gap-5 xl:w-[25%] min-w-[240px]">
                    <div className="relative">
                       <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-gray-200">
                        {booking.client.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center`}>
                        <div className={`w-3 h-3 rounded-full ${status.bg}`} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{booking.client}</h3>
                      <p className="text-sm font-medium text-gray-500">{booking.service}</p>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="xl:w-[20%] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{booking.date}</p>
                      <p className="text-xs font-semibold text-gray-500">{booking.time} • {booking.duration}m</p>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="xl:w-[15%]">
                    <div className="flex items-center gap-2">
                       <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                         {getTypeIcon(booking.type)}
                       </span>
                       <span className="text-sm font-semibold text-gray-700 capitalize">{booking.type}</span>
                    </div>
                  </div>

                   {/* Status */}
                  <div className="xl:w-[15%]">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-100 shadow-sm`}>
                       <span className={`w-2 h-2 rounded-full ${status.bg}`} />
                       <span className={`text-xs font-bold uppercase tracking-wide ${status.color}`}>{status.label}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="xl:ml-auto flex items-center gap-2 opacity-100 transition-all duration-200">

                     <button 
                      onClick={() => { setSelectedBooking(booking); setShowDetailModal(true); }}
                      className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                      title="View Details"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-gray-200" />
                    <button 
                      onClick={() => { setEditBooking(booking); setShowEditModal(true); }}
                      className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteBooking(booking)}
                      className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compact Modals */}
        
        {/* ADD MODAL */}
        {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-3xl w-full shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">New Booking</h2>
                <p className="text-gray-500 font-medium text-sm">Fill in the details below to schedule.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Client Name</label>
                  <input
                    type="text"
                    value={newBooking.client}
                    onChange={(e) => setNewBooking({...newBooking, client: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-gray-900"
                    placeholder="e.g. John Smith"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Email</label>
                  <input
                    type="email"
                    value={newBooking.email}
                    onChange={(e) => setNewBooking({...newBooking, email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-gray-900"
                    placeholder="john@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Phone</label>
                  <input
                    type="tel"
                    value={newBooking.phone}
                    onChange={(e) => setNewBooking({...newBooking, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-gray-900"
                    placeholder="+44 20 ..."
                  />
                </div>
                 <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Service</label>
                  <input
                    type="text"
                    value={newBooking.service}
                    onChange={(e) => setNewBooking({...newBooking, service: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-gray-900"
                    placeholder="e.g. Consultation"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Date</label>
                  <input
                    type="date"
                    value={newBooking.date}
                    onChange={(e) => setNewBooking({...newBooking, date: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-gray-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Time</label>
                  <input
                    type="time"
                    value={newBooking.time}
                    onChange={(e) => setNewBooking({...newBooking, time: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-gray-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Duration</label>
                  <div className="relative">
                    <select
                      value={newBooking.duration}
                      onChange={(e) => setNewBooking({...newBooking, duration: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-gray-900 appearance-none cursor-pointer"
                    >
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">60 min</option>
                      <option value="90">90 min</option>
                      <option value="120">2 hours</option>
                    </select>
                     <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Type</label>
                   <div className="relative">
                    <select
                      value={newBooking.type}
                      onChange={(e) => setNewBooking({...newBooking, type: e.target.value as 'in-person' | 'video' | 'phone'})}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-gray-900 appearance-none cursor-pointer"
                    >
                      <option value="video">Video Call</option>
                      <option value="phone">Phone Call</option>
                      <option value="in-person">In-Person</option>
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Location</label>
                  <input
                    type="text"
                    value={newBooking.location}
                    onChange={(e) => setNewBooking({...newBooking, location: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-gray-900 disabled:opacity-50"
                    placeholder="e.g. Room 1"
                    disabled={newBooking.type !== 'in-person'}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Notes</label>
                <textarea
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking({...newBooking, notes: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium h-24 resize-none"
                  placeholder="Additional details..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-4 shrink-0 bg-gray-50/50 rounded-b-[2rem]">
               <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-4 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const booking: Booking = {
                    id: String(bookings.length + 1),
                    ...newBooking,
                    status: 'pending'
                  };
                  setBookings([...bookings, booking]);
                  setShowAddModal(false);
                  setNewBooking({ client: '', email: '', phone: '', service: '', date: '', time: '', duration: 60, type: 'video', location: '', notes: '' });
                }}
                disabled={!newBooking.client || !newBooking.email || !newBooking.service || !newBooking.date || !newBooking.time}
                className="flex-[2] px-6 py-4 bg-gray-900 text-white rounded-xl font-bold shadow-lg shadow-gray-200 hover:shadow-xl hover:scale-[1.02] hover:bg-black transition-all cursor-pointer disabled:opacity-50 disabled:hover:scale-100" 
              >
                Create Booking
              </button>
            </div>
          </div>
        </div>
        )}

        {/* EDIT MODAL */}
        {showEditModal && editBooking && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-3xl w-full shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Edit Booking</h2>
                <p className="text-gray-500 font-medium text-sm">Modify booking details.</p>
              </div>
              <button onClick={() => { setShowEditModal(false); setEditBooking(null); }} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 space-y-6 overflow-y-auto">
              {/* Same grid layout as Create ... reusing styles */}
               <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Client Name</label>
                  <input
                    type="text"
                    value={editBooking.client}
                    onChange={(e) => setEditBooking({...editBooking, client: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-gray-900/10 focus:bg-white rounded-xl focus:ring-4 focus:ring-gray-100 transition-all outline-none font-bold text-gray-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Email</label>
                  <input
                    type="email"
                    value={editBooking.email}
                    onChange={(e) => setEditBooking({...editBooking, email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-gray-900/10 focus:bg-white rounded-xl focus:ring-4 focus:ring-gray-100 transition-all outline-none font-bold text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Phone</label>
                  <input
                    type="tel"
                    value={editBooking.phone || ''}
                    onChange={(e) => setEditBooking({...editBooking, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-gray-900/10 focus:bg-white rounded-xl focus:ring-4 focus:ring-gray-100 transition-all outline-none font-bold text-gray-900"
                  />
                </div>
                 <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Service</label>
                  <input
                    type="text"
                    value={editBooking.service}
                    onChange={(e) => setEditBooking({...editBooking, service: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-gray-900/10 focus:bg-white rounded-xl focus:ring-4 focus:ring-gray-100 transition-all outline-none font-bold text-gray-900"
                  />
                </div>
              </div>

               <div className="grid grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Date</label>
                  <input
                    type="date"
                    value={editBooking.date}
                    onChange={(e) => setEditBooking({...editBooking, date: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-gray-900/10 focus:bg-white rounded-xl focus:ring-4 focus:ring-gray-100 transition-all outline-none font-bold text-gray-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Time</label>
                  <input
                    type="time"
                    value={editBooking.time}
                    onChange={(e) => setEditBooking({...editBooking, time: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-gray-900/10 focus:bg-white rounded-xl focus:ring-4 focus:ring-gray-100 transition-all outline-none font-bold text-gray-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Duration</label>
                  <div className="relative">
                    <select
                      value={editBooking.duration}
                      onChange={(e) => setEditBooking({...editBooking, duration: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-gray-900/10 focus:bg-white rounded-xl focus:ring-4 focus:ring-gray-100 transition-all outline-none font-bold text-gray-900 appearance-none cursor-pointer"
                    >
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">60 min</option>
                      <option value="90">90 min</option>
                      <option value="120">2 hours</option>
                    </select>
                     <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Status</label>
                  <div className="relative">
                    <select
                      value={editBooking.status}
                      onChange={(e) => setEditBooking({...editBooking, status: e.target.value as 'confirmed' | 'pending' | 'cancelled' | 'completed'})}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-gray-900/10 focus:bg-white rounded-xl focus:ring-4 focus:ring-gray-100 transition-all outline-none font-bold text-gray-900 appearance-none cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                     <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Type</label>
                   <div className="relative">
                    <select
                      value={editBooking.type}
                      onChange={(e) => setEditBooking({...editBooking, type: e.target.value as 'in-person' | 'video' | 'phone'})}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-gray-900/10 focus:bg-white rounded-xl focus:ring-4 focus:ring-gray-100 transition-all outline-none font-bold text-gray-900 appearance-none cursor-pointer"
                    >
                      <option value="video">Video Call</option>
                      <option value="phone">Phone Call</option>
                      <option value="in-person">In-Person</option>
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                  </div>
                </div>
              </div>

               {editBooking.type === 'in-person' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Location</label>
                  <input
                    type="text"
                    value={editBooking.location || ''}
                    onChange={(e) => setEditBooking({...editBooking, location: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-gray-900/10 focus:bg-white rounded-xl focus:ring-4 focus:ring-gray-100 transition-all outline-none font-bold text-gray-900"
                  />
                </div>
              )}

             <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Notes</label>
                <textarea
                  value={editBooking.notes || ''}
                  onChange={(e) => setEditBooking({...editBooking, notes: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-gray-900/10 focus:bg-white rounded-xl focus:ring-4 focus:ring-gray-100 transition-all outline-none font-medium h-24 resize-none"
                />
              </div>

            </div>

             <div className="p-6 border-t border-gray-100 flex gap-4 shrink-0 bg-gray-50/50 rounded-b-[2rem]">
               <button 
                onClick={() => { setShowEditModal(false); setEditBooking(null); }}
                className="flex-1 px-6 py-4 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                   setBookings(bookings.map(b => b.id === editBooking.id ? editBooking : b));
                   setShowEditModal(false);
                   setEditBooking(null);
                }}
                className="flex-[2] px-6 py-4 bg-gray-900 text-white rounded-xl font-bold shadow-lg shadow-gray-200 hover:shadow-xl hover:scale-[1.02] hover:bg-black transition-all cursor-pointer" 
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
        )}

        {/* DETAIL MODAL */}
        {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-[2rem] max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
             <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-6 flex items-center justify-between shrink-0 mb-[-2rem] pb-12 rounded-t-[2rem]">
                <h2 className="text-xl font-bold text-white/90 uppercase tracking-widest flex items-center gap-2">
                  Booking Receipt
                </h2>
                 <button onClick={() => setShowDetailModal(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

               <div className="px-8 pb-8 pt-4 flex flex-col h-full overflow-hidden">
                 <div className="bg-white rounded-[1.5rem] p-6 shadow-xl border border-gray-100 overflow-y-auto space-y-8 h-full">
                    {/* Header receipt style */}
                    <div className="text-center space-y-2 border-b border-dashed border-gray-200 pb-6">
                       <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mx-auto flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-200 mb-4">
                        {selectedBooking.client.split(' ').map(n => n[0]).join('')}
                      </div>
                      <h3 className="text-2xl font-black text-gray-900">{selectedBooking.client}</h3>
                      <p className="text-gray-500 font-medium">{selectedBooking.service}</p>
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gray-100 text-gray-600 mt-2`}>
                        ID: #{selectedBooking.id.padStart(4, '0')}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date</p>
                        <p className="text-lg font-bold text-gray-900">{selectedBooking.date}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Time</p>
                        <p className="text-lg font-bold text-gray-900">{selectedBooking.time}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Type</p>
                        <p className="text-lg font-bold text-gray-900 capitalize flex items-center gap-2">
                           {getTypeIcon(selectedBooking.type)} {selectedBooking.type}
                        </p>
                      </div>
                       <div className="space-y-1 text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-md text-sm font-bold capitalize ${getStatusConfig(selectedBooking.status).bg} bg-opacity-10 ${getStatusConfig(selectedBooking.status).color}`}>
                          {selectedBooking.status}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                       <div className="flex items-center gap-3">
                         <Mail className="w-5 h-5 text-gray-400" />
                         <span className="font-medium text-gray-700">{selectedBooking.email}</span>
                       </div>
                       {selectedBooking.phone && (
                         <div className="flex items-center gap-3">
                           <Phone className="w-5 h-5 text-gray-400" />
                           <span className="font-medium text-gray-700">{selectedBooking.phone}</span>
                         </div>
                       )}
                       {selectedBooking.location && (
                         <div className="flex items-center gap-3">
                           <MapPin className="w-5 h-5 text-gray-400" />
                           <span className="font-medium text-gray-700">{selectedBooking.location}</span>
                         </div>
                       )}
                    </div>

                    {selectedBooking.notes && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Notes</p>
                        <p className="text-sm font-medium text-gray-600 leading-relaxed bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
                          {selectedBooking.notes}
                        </p>
                      </div>
                    )}
                 </div>
                 
                 <div className="mt-6 text-center">
                    <button 
                      onClick={() => setShowDetailModal(false)}
                      className="text-gray-400 hover:text-gray-900 font-bold text-sm transition-colors cursor-pointer"
                    >
                      Close Receipt
                    </button>
                 </div>
               </div>
           </div>
        </div>
        )}

      {/* Delete Confirmation Modal */}
      {deletingBooking && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeletingBooking(null); }}
          onConfirm={() => {
            setBookings(bookings.filter(b => b.id !== deletingBooking.id));
            alert('✓ Booking deleted successfully!');
          }}
          title="Delete Booking"
          itemName={deletingBooking.client}
          itemDetails={`${deletingBooking.service} - ${deletingBooking.date}`}
          warningMessage="This action cannot be undone."
        />
      )}
      </div>
    </div>
  );
}
