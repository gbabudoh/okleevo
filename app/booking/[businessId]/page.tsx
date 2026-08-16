"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Send, CheckCircle2, AlertCircle, Loader2,
  ArrowLeft, CalendarCheck, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

interface BusinessInfo {
  id: string;
  name: string;
}

const inputCls = "w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900";

export default function PublicBookingPage() {
  const { businessId } = useParams();
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    client: '', email: '', phone: '', service: '',
    date: '', time: '', duration: 60,
    type: 'video' as 'video' | 'phone' | 'in-person',
    notes: '',
  });

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await fetch(`/api/public/bookings/${businessId}`);
        if (!res.ok) { setNotFound(true); return; }
        setBusiness(await res.json());
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [businessId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/bookings/${businessId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit booking request');
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit booking request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
          <p className="text-slate-500 font-medium animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (notFound || !business) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-red-100 text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Booking page not found</h1>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl border border-emerald-100 text-center space-y-8"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-slate-900">Request Sent!</h1>
            <p className="text-slate-500 font-medium">
              {business.name} has received your booking request and will confirm it shortly. A confirmation has been emailed to you.
            </p>
          </div>
          <button
            onClick={() => { setSubmitted(false); setForm({ client: '', email: '', phone: '', service: '', date: '', time: '', duration: 60, type: 'video', notes: '' }); }}
            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Request Another
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 selection:bg-indigo-100">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/30 blur-[120px]" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900">OKLEEVO<span className="text-indigo-600">.</span></span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white p-8 md:p-12"
        >
          <header className="mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest border border-indigo-100/50">
              <CalendarCheck className="w-3.5 h-3.5" /> Request a Booking
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{business.name}</h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Tell us when works for you — we&apos;ll confirm your appointment by email.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">Full Name *</label>
                <input required type="text" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} className={inputCls} placeholder="Jane Smith" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">Email *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="jane@email.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="+44 20 ..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">Service *</label>
                <input required type="text" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className={inputCls} placeholder="Consultation" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">Preferred Date *</label>
                <input required type="date" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">Preferred Time *</label>
                <input required type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">Duration</label>
                <select value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })} className={`${inputCls} cursor-pointer appearance-none`}>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                  <option value={90}>90 min</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">Meeting Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'video' | 'phone' | 'in-person' })} className={`${inputCls} cursor-pointer appearance-none`}>
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2.5">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${inputCls} h-28 resize-none`} placeholder="Anything we should know beforehand?" />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-5 bg-indigo-600 text-white rounded-[1.25rem] font-bold text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {submitting ? (<><Loader2 className="w-6 h-6 animate-spin" /> Sending...</>) : (<>Request Booking <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>)}
              </button>
              <p className="text-center text-xs text-slate-400 mt-3">This confirms a request, not a guaranteed slot — {business.name} will follow up by email.</p>
            </div>
          </form>

          <footer className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-sm font-medium flex items-center justify-center gap-1">
              Powered by <span className="font-bold text-slate-600">OKLEEVO</span>
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
