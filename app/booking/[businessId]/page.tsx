"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Send, CheckCircle2, AlertCircle, Loader2,
  ArrowLeft, Calendar, Clock, Video, Phone, MapPin,
  ShieldCheck, Upload, FileText, Check, Sparkles, Building2,
  Lock, CalendarPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BusinessInfo {
  id: string;
  name: string;
}

export default function PublicBookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const businessId = params?.businessId as string;
  const initialService = searchParams?.get('service') || 'Discovery & Consultation';

  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    client: '',
    email: '',
    phone: '',
    service: initialService,
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '10:00',
    duration: 30,
    type: 'video' as 'video' | 'phone' | 'in-person',
    notes: '',
  });

  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!businessId) return;
    const fetchBusiness = async () => {
      try {
        const res = await fetch(`/api/public/bookings/${businessId}`);
        if (!res.ok) { setNotFound(true); return; }
        const data = await res.json();
        setBusiness(data);
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
      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
          <p className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">Loading booking portal…</p>
        </div>
      </div>
    );
  }

  if (notFound || !business) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 text-center space-y-6">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/40 rounded-2xl flex items-center justify-center mx-auto text-rose-500 border border-rose-200 dark:border-rose-900/60 shadow-2xs">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Booking Portal Unavailable</h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              The requested scheduling link is invalid or has been moved. Please contact the business directly.
            </p>
          </div>
          <div className="pt-2">
            <Image
              src="/logo.png"
              alt="Okleevo"
              width={100}
              height={28}
              className="h-6 w-auto mx-auto opacity-70"
            />
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-7"
        >
          {/* Brand Logo Header */}
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Okleevo"
              width={120}
              height={32}
              className="h-7 w-auto"
              priority
            />
          </div>

          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-900/60 shadow-2xs ring-8 ring-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-widest border border-emerald-200 dark:border-emerald-900/60">
              Appointment Request Confirmed
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Thank you, {form.client}!
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              Your appointment request with <strong className="text-slate-800 dark:text-slate-200">{business.name}</strong> has been received. A calendar invitation has been sent to <strong className="text-slate-800 dark:text-slate-200">{form.email}</strong>.
            </p>
          </div>

          {/* Appointment Recap Card */}
          <div className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 text-left space-y-2.5">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <span className="font-bold text-slate-500">Service</span>
              <span className="font-extrabold text-slate-900 dark:text-white">{form.service}</span>
            </div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <span className="font-bold text-slate-500">Date &amp; Time</span>
              <span className="font-mono font-extrabold text-slate-900 dark:text-white">{form.date} at {form.time}</span>
            </div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <span className="font-bold text-slate-500">Format</span>
              <span className="font-bold capitalize text-slate-900 dark:text-white flex items-center gap-1.5">
                {form.type === 'video' ? <Video className="w-3.5 h-3.5 text-orange-500" /> : form.type === 'phone' ? <Phone className="w-3.5 h-3.5 text-orange-500" /> : <MapPin className="w-3.5 h-3.5 text-orange-500" />}
                {form.type} ({form.duration} min)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500">Meeting Room</span>
              <span className="font-mono font-extrabold text-orange-500">WebRTC Encrypted Room</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setSubmitted(false);
                setForm({
                  client: '', email: '', phone: '', service: initialService,
                  date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                  time: '10:00', duration: 30, type: 'video', notes: ''
                });
              }}
              className="w-full py-3.5 px-5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" /> Book Another Session
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-Bit Encrypted &amp; Protected by Okleevo</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/80 to-slate-100/90 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 sm:py-14 px-4 selection:bg-orange-100">
      
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-orange-500/10 dark:bg-orange-500/5 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/10 dark:bg-amber-500/5 blur-[140px]" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10 space-y-8">
        
        {/* ── Brand Logo Header ── */}
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 mb-1">
            <Image
              src="/logo.png"
              alt="Okleevo"
              width={140}
              height={38}
              className="h-8 sm:h-9 w-auto"
              priority
            />
          </div>
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Enterprise Client Scheduling Portal
          </span>
        </div>

        {/* ── Main Booking Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-slate-950/60 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 space-y-8"
        >
          {/* Company Brand Header */}
          <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-mono font-extrabold text-lg flex items-center justify-center shadow-2xs">
                  {business.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {business.name}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60">
                      <Check className="w-3 h-3" /> Verified
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    Schedule an appointment directly with our team
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            
            {/* ── 1. Meeting Format (Visual Toggle Cards) ── */}
            <div className="space-y-2.5">
              <label className="block text-[11px] font-extrabold font-mono uppercase tracking-widest text-slate-400">
                1. Select Meeting Format *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'video', label: 'Video Call', desc: 'WebRTC Virtual Room', icon: Video },
                  { id: 'phone', label: 'Phone Call', desc: 'Direct phone dial-in', icon: Phone },
                  { id: 'in-person', label: 'In-Person', desc: 'Office consultation', icon: MapPin },
                ].map(fmt => {
                  const Icon = fmt.icon;
                  const isSelected = form.type === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setForm({ ...form, type: fmt.id as any })}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                        isSelected
                          ? 'bg-orange-50/60 dark:bg-orange-950/30 border-orange-500 text-orange-600 dark:text-orange-400 shadow-2xs ring-2 ring-orange-500/20'
                          : 'bg-slate-50/60 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-orange-500" />}
                      </div>
                      <div>
                        <p className="text-xs font-extrabold">{fmt.label}</p>
                        <p className="text-[10px] font-medium text-slate-400">{fmt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── 2. Duration Selector ── */}
            <div className="space-y-2.5">
              <label className="block text-[11px] font-extrabold font-mono uppercase tracking-widest text-slate-400">
                2. Meeting Duration *
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[15, 30, 45, 60, 90].map(dur => {
                  const isSelected = form.duration === dur;
                  return (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setForm({ ...form, duration: dur })}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-orange-500 text-white border-orange-500 shadow-2xs active:scale-95'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {dur} min {dur === 30 && '(Popular)'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── 3. Date & Time Selection ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold font-mono uppercase tracking-widest text-slate-400 mb-1.5">
                  Preferred Date *
                </label>
                <div className="relative">
                  <input
                    required
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold font-mono uppercase tracking-widest text-slate-400 mb-1.5">
                  Preferred Start Time *
                </label>
                <div className="relative">
                  <input
                    required
                    type="time"
                    value={form.time}
                    onChange={e => setForm({ ...form, time: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* ── 4. Contact & Service Information ── */}
            <div className="space-y-4 pt-2">
              <label className="block text-[11px] font-extrabold font-mono uppercase tracking-widest text-slate-400">
                3. Your Information
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1">Full Name *</label>
                  <input
                    required
                    type="text"
                    value={form.client}
                    onChange={e => setForm({ ...form, client: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1">Email Address *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="sarah@company.com"
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+44 20 7946 0912"
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1">Service / Discussion Topic *</label>
                  <input
                    required
                    type="text"
                    value={form.service}
                    onChange={e => setForm({ ...form, service: e.target.value })}
                    placeholder="e.g. Discovery Consultation"
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* ── 5. Pre-Meeting Documents (Safe Storage) ── */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-extrabold font-mono uppercase tracking-widest text-slate-400">
                  4. Pre-Meeting Briefs &amp; Files (Optional)
                </label>
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Anti-Virus Scanned
                </span>
              </div>

              <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 text-center hover:border-orange-400 transition-colors bg-slate-50/50 dark:bg-slate-950/40">
                <input
                  type="file"
                  onChange={e => setAttachedFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl text-orange-500 shadow-2xs border border-slate-200/80 dark:border-slate-800">
                    {attachedFile ? <FileText className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                  </div>
                  {attachedFile ? (
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">{attachedFile.name}</p>
                      <p className="text-[10px] font-mono text-emerald-500">File attached · Safe Storage ready</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Drop briefs, tax files, or project contracts here
                      </p>
                      <p className="text-[10px] font-medium text-slate-400">PDF, Word, or images up to 25MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── 6. Additional Notes ── */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold font-mono uppercase tracking-widest text-slate-400">
                5. Additional Agenda &amp; Notes (Optional)
              </label>
              <textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={3}
                placeholder="Share any background details or specific questions you would like us to cover..."
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2.5 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 shadow-2xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit CTA */}
            <div className="pt-3 space-y-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl font-extrabold text-sm shadow-md shadow-orange-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Confirming Appointment…</span>
                  </>
                ) : (
                  <>
                    <span>Confirm &amp; Request Appointment</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Instant email confirmation · Encrypted WebRTC Meeting</span>
              </div>
            </div>
          </form>

          {/* Footer branding */}
          <footer className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-slate-400 text-xs font-medium flex items-center justify-center gap-1.5">
              Powered by
              <Image
                src="/logo.png"
                alt="Okleevo"
                width={80}
                height={22}
                className="h-4.5 w-auto inline-block ml-1 opacity-90"
              />
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
