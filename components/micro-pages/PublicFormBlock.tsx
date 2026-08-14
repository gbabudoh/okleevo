"use client";

import { useState } from 'react';
import { CheckCircle2, Send, Loader2, Mail, Phone, User, FileText, Sparkles } from 'lucide-react';

interface PublicFormBlockProps {
  heading?: string | null;
  body?: string | null;
  pageTitle?: string | null;
  slug?: string | null;
}

export function PublicFormBlock({ heading, body, pageTitle, slug }: PublicFormBlockProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Please enter your full name and email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/micro-pages/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message, slug, pageTitle }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => null);
        setErrorMsg(data?.error || 'Something went wrong submitting your details. Please try again.');
      }
    } catch {
      setErrorMsg('Something went wrong submitting your details. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section id="form" className="py-16 px-6 max-w-xl mx-auto">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Form Request Received!</h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              Thank you, <strong className="text-slate-900">{name}</strong>! Your details have been received and sent directly to our team. We&apos;ll get back to you at <strong className="text-blue-600 font-mono">{email}</strong> shortly.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>Submission Receipt</span>
              <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3" /> Auto-Routed to CRM
              </span>
            </div>
            <div className="space-y-1 text-slate-700 font-medium">
              <p><strong className="text-slate-900">Applicant:</strong> {name}</p>
              <p><strong className="text-slate-900">Email:</strong> {email}</p>
              {phone && <p><strong className="text-slate-900">Phone:</strong> {phone}</p>}
              {message && <p className="text-slate-500 italic mt-1 bg-white p-2 rounded-lg border border-slate-100">&quot;{message}&quot;</p>}
            </div>
          </div>

          <button
            onClick={() => {
              setSubmitted(false);
              setName('');
              setEmail('');
              setPhone('');
              setMessage('');
            }}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Submit Another Request
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="form" className="py-16 px-6 max-w-xl mx-auto">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-slate-900">{heading || 'Submit Your Details'}</h2>
          {body && <p className="text-xs text-slate-500 leading-relaxed">{body}</p>}
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sarah@company.com"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +44 7700 900123"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Project Brief / Notes
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide turnover, team size, or briefing notes..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Request...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Form Request</span>
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
