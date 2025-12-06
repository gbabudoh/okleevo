"use client";

import React from 'react';
import { Calendar, Clock, User, Plus } from 'lucide-react';
import { Badge } from '@/components/ui';

export function AppointmentCalendar() {
  const appointments = [
    { id: '1', title: 'Client Meeting', time: '09:00 AM', client: 'John Smith', status: 'confirmed' },
    { id: '2', title: 'Team Standup', time: '11:00 AM', client: 'Internal', status: 'confirmed' },
    { id: '3', title: 'Sales Call', time: '02:00 PM', client: 'Jane Doe', status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        <button className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-lg" style={{ backgroundColor: '#fc6813' }}>
          <Plus className="w-5 h-5" />
          Book Appointment
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
          </div>
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-orange-300 transition-all">
                <div className="w-16 text-center">
                  <Clock className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                  <p className="text-sm font-semibold text-gray-900">{apt.time}</p>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{apt.title}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <User className="w-4 h-4" />
                    {apt.client}
                  </p>
                </div>
                <Badge variant={apt.status === 'confirmed' ? 'success' : 'warning'}>
                  {apt.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Calendar</h3>
          <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
