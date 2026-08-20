"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import {
  Send, CheckCircle2, AlertCircle, Loader2,
  ArrowLeft, MessageSquare, ShieldCheck, Sparkles,
  Upload, Clock, FileText, Check, AlertTriangle, LifeBuoy,
  CreditCard, Wrench, HelpCircle, User
} from 'lucide-react';
import { motion } from 'framer-motion';

interface BusinessInfo {
  id: string;
  name: string;
}

const CATEGORIES = [
  { id: 'Technical Issue', label: 'Technical Issue', desc: 'System bugs, login or errors', icon: Wrench },
  { id: 'Billing & Invoices', label: 'Billing & Invoices', desc: 'Payments, receipts, accounts', icon: CreditCard },
  { id: 'Account & Services', label: 'Account & Services', desc: 'Contracts, scope, deliverables', icon: FileText },
  { id: 'General Inquiry', label: 'General Inquiry', desc: 'Questions, proposals, info', icon: HelpCircle },
];

const PRIORITIES = [
  { id: 'LOW', label: 'Low', badge: 'Normal queue' },
  { id: 'MEDIUM', label: 'Medium', badge: 'Standard priority' },
  { id: 'HIGH', label: 'High', badge: 'Fast-track priority' },
  { id: 'URGENT', label: 'Urgent', badge: 'Critical attention' },
];

export default function PublicHelpdeskPage() {
  const { businessId } = useParams();
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    subject: '',
    customer: '',
    email: '',
    category: 'Technical Issue',
    priority: 'MEDIUM',
    description: '',
  });

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await fetch(`/api/public/tickets/${businessId}`);
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
      const res = await fetch(`/api/public/tickets/${businessId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          description: attachedFile
            ? `${form.description}\n\n[Attached File: ${attachedFile.name} (${(attachedFile.size / 1024).toFixed(1)} KB)]`
            : form.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit your request');
      setTicketNumber(data.ticketNumber || `TKT-${data.id?.slice(-6)?.toUpperCase() || 'REF'}`);
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit your request');
    } finally {
      setSubmitting(false);
    }
  };

  const initials = (name?: string) => {
    if (!name) return 'OK';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
          <p className="text-xs font-mono font-extrabold uppercase tracking-widest text-slate-400">Loading Support Desk...</p>
        </div>
      </div>
    );
  }

  if (notFound || !business) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-950 rounded-3xl p-8 shadow-2xl border border-rose-900/40 text-center space-y-5">
          <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
            <AlertCircle className="w-7 h-7 text-rose-500" />
          </div>
          <h1 className="text-xl font-black text-white">Support Desk Not Found</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The support desk you are trying to reach does not exist or has been relocated.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-slate-950 rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-800 text-center space-y-6"
        >
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Okleevo"
              width={140}
              height={38}
              className="h-8 w-auto object-contain"
              priority
            />
          </div>

          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Ticket Reference: {ticketNumber}
            </span>
            <h1 className="text-2xl font-black text-white pt-2">Request Received!</h1>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Thank you, <strong className="text-white">{form.customer}</strong>. <strong className="text-white">{business.name}</strong> has received your support inquiry. A confirmation receipt has been emailed to <span className="text-orange-400 font-mono">{form.email}</span>.
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 text-left space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Category</span>
              <span className="font-bold text-white">{form.category}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Target Response</span>
              <span className="font-bold text-emerald-400">Within 2 Hours</span>
            </div>
          </div>

          <button
            onClick={() => {
              setSubmitted(false);
              setAttachedFile(null);
              setForm({
                subject: '',
                customer: '',
                email: '',
                category: 'Technical Issue',
                priority: 'MEDIUM',
                description: '',
              });
            }}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-orange-500/20 transition-all cursor-pointer hover:opacity-95"
          >
            Submit Another Request
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-10 px-4 sm:px-6 relative overflow-hidden flex flex-col justify-between">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[130px]" />
      </div>

      <div className="max-w-2xl mx-auto w-full relative z-10 space-y-6">
        
        {/* Top Official Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl mb-1">
            <Image
              src="/logo.png"
              alt="Okleevo"
              width={150}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </div>
          <p className="text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase">
            Client Support &amp; Helpdesk Portal
          </p>
        </div>

        {/* Business Verified Header Card */}
        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-black text-base sm:text-lg flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
              {initials(business.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-extrabold text-white truncate">
                  {business.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <ShieldCheck className="w-3 h-3" /> Verified Desk
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>Typical response time: &lt; 2 hours</span>
              </p>
            </div>
          </div>
        </div>

        {/* Support Request Form Card */}
        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          <div className="border-b border-slate-800/80 pb-4">
            <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-orange-500" />
              Submit a Support Request
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Please provide the details below — our dedicated team will reply directly to your email.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-xs text-rose-400 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* 1. Client Identity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold font-mono uppercase tracking-widest text-slate-400 mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.customer}
                  onChange={e => setForm({ ...form, customer: e.target.value })}
                  placeholder="e.g. Jane Smith"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder:text-slate-500 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold font-mono uppercase tracking-widest text-slate-400 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="jane@client.com"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder:text-slate-500 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                />
              </div>
            </div>

            {/* 2. Issue Subject */}
            <div>
              <label className="block text-[11px] font-extrabold font-mono uppercase tracking-widest text-slate-400 mb-1.5">
                Inquiry Subject *
              </label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Need assistance with invoice #INV-2049"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder:text-slate-500 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
              />
            </div>

            {/* 3. Category Selector Cards */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold font-mono uppercase tracking-widest text-slate-400">
                Select Category *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CATEGORIES.map(cat => {
                  const isSelected = form.category === cat.id;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat.id })}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'bg-orange-500/10 border-orange-500 text-white shadow-lg ring-1 ring-orange-500/30'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-extrabold">{cat.label}</p>
                          {isSelected && <Check className="w-3.5 h-3.5 text-orange-500" />}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{cat.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Priority / Urgency Picker */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold font-mono uppercase tracking-widest text-slate-400">
                Urgency Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRIORITIES.map(p => {
                  const isSelected = form.priority === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setForm({ ...form, priority: p.id })}
                      className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                        isSelected
                          ? 'bg-orange-500/10 border-orange-500 text-orange-400 ring-1 ring-orange-500/20'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Issue Description */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold font-mono uppercase tracking-widest text-slate-400">
                Describe Your Issue *
              </label>
              <textarea
                required
                rows={5}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Please include as much detail as possible to help us resolve this promptly..."
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-medium text-white placeholder:text-slate-500 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* 6. Safe Storage Drag & Drop Attachment */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold font-mono uppercase tracking-widest text-slate-400">
                Attach File or Screenshot (Optional)
              </label>
              <label className="block p-4 bg-slate-900/60 border-2 border-dashed border-slate-800 hover:border-orange-500/50 rounded-2xl cursor-pointer transition-all text-center">
                <input
                  type="file"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setAttachedFile(file);
                  }}
                />
                <div className="flex flex-col items-center justify-center gap-1.5 text-xs">
                  <Upload className="w-5 h-5 text-orange-500" />
                  {attachedFile ? (
                    <p className="font-bold text-orange-400 truncate max-w-xs">
                      {attachedFile.name} ({(attachedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  ) : (
                    <>
                      <p className="font-bold text-slate-300">Click to upload or drag &amp; drop</p>
                      <p className="text-[10px] text-slate-500">PDF, PNG, JPG, DOCX (Max 25MB)</p>
                    </>
                  )}
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-black tracking-wide uppercase transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{submitting ? 'Submitting Request...' : 'Submit Support Request →'}</span>
            </button>

            {/* Trust Footer Notice */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 pt-2 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Protected by Okleevo 256-bit Secure Support Pipeline</span>
            </div>
          </form>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="relative z-10 text-center py-6 border-t border-slate-800/60 mt-10 text-xs text-slate-500">
        <p>Powered by <strong className="text-slate-300">Okleevo</strong> Business Operating Platform</p>
      </div>
    </div>
  );
}
