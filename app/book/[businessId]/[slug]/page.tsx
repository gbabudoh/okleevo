"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Send, CheckCircle2, AlertCircle, Loader2,
  ArrowLeft, CalendarCheck, Sparkles, Paperclip, X,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface BookingPageConfig {
  booking_page_id: string;
  company_name: string;
  page_name: string;
  allowed_mime_types: string[];
  max_file_size_bytes: number;
  branding?: { primaryColor?: string; logoUrl?: string } | null;
}

const inputCls = "w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
}

export default function GuestBookingPage() {
  const { businessId, slug } = useParams<{ businessId: string; slug: string }>();
  const [pageConfig, setPageConfig] = useState<BookingPageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: '', email: '', date: '', time: '', duration: 30,
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`/api/public/booking-pages/${businessId}/${slug}`);
        if (!res.ok) { setNotFound(true); return; }
        setPageConfig(await res.json());
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [businessId, slug]);

  const handleFileSelect = (selected: File | null) => {
    setError(null);
    if (!selected || !pageConfig) { setFile(selected); return; }
    if (!pageConfig.allowed_mime_types.includes(selected.type)) {
      setError(`File type "${selected.type || 'unknown'}" isn't accepted here.`);
      return;
    }
    if (selected.size > pageConfig.max_file_size_bytes) {
      setError(`File is too large — max ${formatBytes(pageConfig.max_file_size_bytes)}.`);
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const reserveRes = await fetch(`/api/public/booking-pages/${businessId}/${slug}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_name: form.name,
          guest_email: form.email,
          selected_slot: new Date(`${form.date}T${form.time}`).toISOString(),
          duration_minutes: form.duration,
          ...(file && {
            file_metadata: { file_name: file.name, file_size_bytes: file.size, mime_type: file.type },
          }),
        }),
      });
      const reserveData = await reserveRes.json();
      if (!reserveRes.ok) throw new Error(reserveData.error || 'Failed to reserve this slot');

      if (file && reserveData.upload_instructions?.upload_url) {
        const uploadRes = await fetch(reserveData.upload_instructions.upload_url, {
          method: reserveData.upload_instructions.method || 'PUT',
          body: file,
        });
        if (!uploadRes.ok) throw new Error('Booking was reserved, but the file upload failed. You can still attend without it.');
      }

      const confirmRes = await fetch(`/api/public/appointments/${reserveData.appointment_id}/confirm`, {
        method: 'POST',
      });
      if (!confirmRes.ok) {
        const confirmData = await confirmRes.json().catch(() => ({}));
        throw new Error(confirmData.error || 'Booking was reserved, but confirmation failed. Check your email — it may still have gone through.');
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit booking');
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

  if (notFound || !pageConfig) {
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
            <h1 className="text-3xl font-black text-slate-900">You&apos;re booked!</h1>
            <p className="text-slate-500 font-medium">
              Check your email — we&apos;ve sent a confirmation with a calendar invite and your one-time access code for the meeting.
            </p>
          </div>
          <button
            onClick={() => { setSubmitted(false); setFile(null); setForm({ name: '', email: '', date: '', time: '', duration: 30 }); }}
            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Book Another Slot
          </button>
        </motion.div>
      </div>
    );
  }

  const accent = pageConfig.branding?.primaryColor;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 selection:bg-indigo-100">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/30 blur-[120px]" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="flex items-center justify-center gap-3 mb-12">
          {pageConfig.branding?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pageConfig.branding.logoUrl} alt={pageConfig.company_name} className="h-9" />
          ) : (
            <>
              <div className="p-3 rounded-2xl shadow-xl shadow-indigo-200" style={accent ? { backgroundColor: accent } : undefined}>
                <Sparkles className={`w-6 h-6 text-white ${accent ? '' : ''}`} />
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900">{pageConfig.company_name}</span>
            </>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white p-8 md:p-12"
        >
          <header className="mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest border border-indigo-100/50">
              <CalendarCheck className="w-3.5 h-3.5" /> {pageConfig.page_name}
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{pageConfig.company_name}</h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Pick a time, add anything we should see beforehand, and you&apos;re in — no account needed.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">Full Name *</label>
                <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Jane Smith" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">Email *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="jane@email.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">Date *</label>
                <input required type="date" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">Time *</label>
                <input required type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2.5">Duration</label>
                <select value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })} className={`${inputCls} cursor-pointer appearance-none`}>
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                </select>
              </div>
            </div>

            {pageConfig.allowed_mime_types.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">
                  Attach a file <span className="font-normal text-slate-400">(optional, max {formatBytes(pageConfig.max_file_size_bytes)})</span>
                </label>
                {file ? (
                  <div className="flex items-center justify-between gap-3 px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-700 truncate">
                      <Paperclip className="w-4 h-4 shrink-0 text-slate-400" /> {file.name}
                    </span>
                    <button type="button" onClick={() => setFile(null)} className="text-slate-400 hover:text-slate-700 shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className={`${inputCls} flex items-center justify-center gap-2 cursor-pointer text-slate-400`}>
                    <Paperclip className="w-4 h-4" /> Choose a file
                    <input
                      type="file"
                      className="hidden"
                      accept={pageConfig.allowed_mime_types.join(',')}
                      onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                    />
                  </label>
                )}
              </div>
            )}

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
                style={accent ? { backgroundColor: accent } : undefined}
              >
                {submitting ? (<><Loader2 className="w-6 h-6 animate-spin" /> Booking...</>) : (<>Confirm Booking <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>)}
              </button>
              <p className="text-center text-xs text-slate-400 mt-3">Your meeting link and one-time access code will be emailed to you.</p>
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
