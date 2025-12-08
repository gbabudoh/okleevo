"use client";

import React, { useState } from 'react';
import { Calendar, Clock, User, Plus, X, Mail, Phone, MapPin, Video, CheckCircle, AlertCircle, Edit, Trash2, Filter, Search, TrendingUp, Users, CalendarCheck } from 'lucide-react';
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

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'in-person': return <MapPin className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Booking System
                </h1>
                <p className="text-gray-600 mt-1 text-lg">Manage appointments and schedules with ease</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <Plus className="w-5 h-5" />
            New Booking
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <CalendarCheck className="w-7 h-7 text-white" />
              </div>
              <span className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent">{totalBookings}</span>
            </div>
            <p className="text-gray-600 font-medium">Total Bookings</p>
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
              <span className="text-4xl font-bold bg-gradient-to-br from-green-600 to-green-700 bg-clip-text text-transparent">{confirmedBookings}</span>
            </div>
            <p className="text-gray-600 font-medium">Confirmed</p>
            <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Ready to go</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <span className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-purple-700 bg-clip-text text-transparent">{upcomingBookings.length}</span>
            </div>
            <p className="text-gray-600 font-medium">Upcoming</p>
            <div className="mt-2 flex items-center gap-1 text-sm text-purple-600">
              <Calendar className="w-4 h-4" />
              <span>Scheduled</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <span className="text-4xl font-bold bg-gradient-to-br from-orange-600 to-orange-700 bg-clip-text text-transparent">{completedBookings}</span>
            </div>
            <p className="text-gray-600 font-medium">Completed</p>
            <div className="mt-2 flex items-center gap-1 text-sm text-orange-600">
              <CheckCircle className="w-4 h-4" />
              <span>Finished</span>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-12 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer appearance-none bg-white shadow-sm font-medium"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Bookings List */}
        <div className="grid gap-6">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] border border-gray-100 overflow-hidden">
              <div className="flex items-start p-6">
                <div className="flex gap-5 flex-1">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-md">
                    {booking.client.split(' ').map(n => n[0]).join('')}
                  </div>

                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{booking.client}</h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                        booking.status === 'confirmed' ? 'bg-green-500 text-white' :
                        booking.status === 'pending' ? 'bg-yellow-500 text-white' :
                        booking.status === 'cancelled' ? 'bg-red-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {booking.status.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 flex items-center gap-1 border border-purple-200">
                        {getTypeIcon(booking.type)}
                        {booking.type}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4 font-medium text-lg">{booking.service}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-blue-600 font-medium">Date</p>
                          <p className="text-sm font-bold text-blue-700">{booking.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-purple-600 font-medium">Time</p>
                          <p className="text-sm font-bold text-purple-700">{booking.time} ({booking.duration}m)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm">
                          <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs text-green-600 font-medium">Email</p>
                          <p className="text-sm font-bold text-green-700 truncate">{booking.email}</p>
                        </div>
                      </div>
                      {booking.phone && (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
                            <Phone className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-orange-600 font-medium">Phone</p>
                            <p className="text-sm font-bold text-orange-700">{booking.phone}</p>
                          </div>
                        </div>
                      )}
                      {booking.location && (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-3 border border-pink-200 col-span-2">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-sm">
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-pink-600 font-medium">Location</p>
                            <p className="text-sm font-bold text-pink-700">{booking.location}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {booking.notes && (
                      <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <p className="text-xs text-gray-600 font-semibold mb-1">Notes:</p>
                        <p className="text-sm text-gray-700">{booking.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  <button 
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowDetailModal(true);
                    }}
                    className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg hover:scale-105 cursor-pointer"
                    title="View Details"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      setEditBooking(booking);
                      setShowEditModal(true);
                    }}
                    className="p-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-md hover:shadow-lg hover:scale-105 cursor-pointer"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleDeleteBooking(booking)}
                    className="p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg hover:scale-105 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Booking Modal */}
        {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary-500 to-accent-500">
              <h2 className="text-xl font-bold text-white">New Booking</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                  <input
                    type="text"
                    value={newBooking.client}
                    onChange={(e) => setNewBooking({...newBooking, client: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newBooking.email}
                    onChange={(e) => setNewBooking({...newBooking, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="john@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={newBooking.phone}
                    onChange={(e) => setNewBooking({...newBooking, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="+44 20 1234 5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                  <input
                    type="text"
                    value={newBooking.service}
                    onChange={(e) => setNewBooking({...newBooking, service: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Consultation"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={newBooking.date}
                    onChange={(e) => setNewBooking({...newBooking, date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={newBooking.time}
                    onChange={(e) => setNewBooking({...newBooking, time: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (min)</label>
                  <select
                    value={newBooking.duration}
                    onChange={(e) => setNewBooking({...newBooking, duration: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                    <option value="120">120 minutes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={newBooking.type}
                    onChange={(e) => setNewBooking({...newBooking, type: e.target.value as 'in-person' | 'video' | 'phone'})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="video">Video Call</option>
                    <option value="phone">Phone Call</option>
                    <option value="in-person">In-Person</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location (if in-person)</label>
                  <input
                    type="text"
                    value={newBooking.location}
                    onChange={(e) => setNewBooking({...newBooking, location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Office - Room 1"
                    disabled={newBooking.type !== 'in-person'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking({...newBooking, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 h-20"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium cursor-pointer"
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
                    setNewBooking({
                      client: '',
                      email: '',
                      phone: '',
                      service: '',
                      date: '',
                      time: '',
                      duration: 60,
                      type: 'video',
                      location: '',
                      notes: ''
                    });
                  }}
                  disabled={!newBooking.client || !newBooking.email || !newBooking.service || !newBooking.date || !newBooking.time}
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                  style={{ backgroundColor: '#fc6813' }}
                >
                  Create Booking
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Edit Booking Modal */}
        {showEditModal && editBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary-500 to-accent-500">
              <h2 className="text-xl font-bold text-white">Edit Booking</h2>
              <button onClick={() => {
                setShowEditModal(false);
                setEditBooking(null);
              }} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                  <input
                    type="text"
                    value={editBooking.client}
                    onChange={(e) => setEditBooking({...editBooking, client: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editBooking.email}
                    onChange={(e) => setEditBooking({...editBooking, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editBooking.phone || ''}
                    onChange={(e) => setEditBooking({...editBooking, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                  <input
                    type="text"
                    value={editBooking.service}
                    onChange={(e) => setEditBooking({...editBooking, service: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={editBooking.date}
                    onChange={(e) => setEditBooking({...editBooking, date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={editBooking.time}
                    onChange={(e) => setEditBooking({...editBooking, time: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (min)</label>
                  <select
                    value={editBooking.duration}
                    onChange={(e) => setEditBooking({...editBooking, duration: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                    <option value="120">120 minutes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={editBooking.type}
                    onChange={(e) => setEditBooking({...editBooking, type: e.target.value as 'in-person' | 'video' | 'phone'})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="video">Video Call</option>
                    <option value="phone">Phone Call</option>
                    <option value="in-person">In-Person</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={editBooking.status}
                    onChange={(e) => setEditBooking({...editBooking, status: e.target.value as 'confirmed' | 'pending' | 'cancelled' | 'completed'})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {editBooking.type === 'in-person' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={editBooking.location || ''}
                    onChange={(e) => setEditBooking({...editBooking, location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Office - Room 1"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={editBooking.notes || ''}
                  onChange={(e) => setEditBooking({...editBooking, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 h-20"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditBooking(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setBookings(bookings.map(b => b.id === editBooking.id ? editBooking : b));
                    setShowEditModal(false);
                    setEditBooking(null);
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

        {/* Booking Detail Modal */}
        {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary-500 to-accent-500">
              <h2 className="text-xl font-bold text-white">Booking Details</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedBooking.client.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedBooking.client}</h3>
                  <p className="text-gray-600">{selectedBooking.service}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                  <p className="font-medium text-gray-900">{selectedBooking.date} at {selectedBooking.time}</p>
                  <p className="text-sm text-gray-500 mt-1">Duration: {selectedBooking.duration} minutes</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Type</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedBooking.type}</p>
                  {selectedBooking.location && <p className="text-sm text-gray-500 mt-1">{selectedBooking.location}</p>}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-gray-900">{selectedBooking.email}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="font-medium text-gray-900">{selectedBooking.phone || 'N/A'}</p>
                </div>
              </div>

              <div className={`rounded-lg p-4 ${getStatusColor(selectedBooking.status)}`}>
                <p className="font-semibold">Status: {selectedBooking.status.toUpperCase()}</p>
              </div>

              {selectedBooking.notes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-1">Notes:</p>
                  <p className="text-sm text-blue-800">{selectedBooking.notes}</p>
                </div>
              )}

              <button 
                onClick={() => setShowDetailModal(false)}
                className="w-full px-4 py-2 rounded-lg text-white font-medium cursor-pointer" 
                style={{ backgroundColor: '#fc6813' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
        )}

      {/* Delete Confirmation Modal */}
      {deletingBooking && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingBooking(null);
          }}
          onConfirm={() => {
            setBookings(bookings.filter(b => b.id !== deletingBooking.id));
            alert('✓ Booking deleted successfully!');
          }}
          title="Delete Booking"
          itemName={deletingBooking.client}
          itemDetails={`${deletingBooking.service} - ${deletingBooking.date} at ${deletingBooking.time}`}
          warningMessage="This will permanently remove this booking and notify the client."
        />
      )}
      </div>
    </div>
  );
}
