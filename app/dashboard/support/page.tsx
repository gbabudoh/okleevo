"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  LifeBuoy, Mail, Clock, ShieldCheck, BookOpen, Send,
  CheckCircle2, AlertCircle, Sparkles, ChevronDown, MessageSquare,
  HelpCircle, ExternalLink, Copy, Check
} from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'How do I invite team members and manage seats?',
    answer: 'Navigate to Settings → Team tab. Enter the email address of your team member and assign their role (Admin, Manager, or Member). Your Starter Plan includes 5 team seats out of the box.'
  },
  {
    question: 'How do I configure Email OTP Two-Factor Authentication?',
    answer: 'Go to Settings → Security tab. Click "Enable 2FA" to receive a 6-digit confirmation PIN on your registered email. Once verified, 2FA will be enforced on every sign-in.'
  },
  {
    question: 'How do I set up custom domain sending for Mail Engine?',
    answer: 'Under Settings → Organization, you can verify your business domain SPF and DKIM records. Once verified, all client emails and booking notifications will dispatch directly under your brand name.'
  },
  {
    question: 'Where can I access all platform walkthroughs and tutorials?',
    answer: 'Visit the User Guides section in your sidebar or click the "View Knowledge Base" button on this page to explore step-by-step documentation for all 11+ Okleevo modules.'
  },
  {
    question: 'What is Okleevo’s support response SLA?',
    answer: 'Standard inquiries are answered within 2–4 business hours. Urgent blocking issues submitted through this portal are prioritized by our engineering on-call rotation within 1 hour.'
  },
];

export default function PlatformSupportPage() {
  const { data: session } = useSession();

  const [category, setCategory] = useState('Technical Issue / Bug');
  const [priority, setPriority] = useState('NORMAL');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('support@okleevo.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setErrorMessage('Please enter both a subject and a description of your query.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          priority,
          subject,
          message,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedRef(data.refNumber);
        setSubject('');
        setMessage('');
      } else {
        setErrorMessage(data.error || 'Failed to send support request. Please try again.');
      }
    } catch (err) {
      console.error('Support submission error:', err);
      setErrorMessage('A network error occurred. Please contact support@okleevo.com directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-8 md:p-10 text-white shadow-xl shadow-orange-500/10">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-extrabold uppercase tracking-widest">
            <LifeBuoy className="w-3.5 h-3.5" />
            Okleevo Dedicated Support Desk
          </div>
          
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            How can we help your business today?
          </h1>
          
          <p className="text-orange-100 text-sm md:text-base leading-relaxed">
            Contact the Okleevo platform engineers directly for account assistance, technical troubleshooting, billing queries, or feature inquiries.
          </p>
        </div>
      </div>

      {/* Quick SLA & Support Channels Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200/60">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Response SLA</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">&lt; 2–4 Business Hours</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Support Tier</div>
            <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">Direct Engineer Access</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60">
            <Mail className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Direct Email</div>
            <button
              onClick={handleCopyEmail}
              className="text-xs font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer truncate"
              title="Click to copy support email"
            >
              support@okleevo.com
              {copiedEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
            </button>
          </div>
        </div>

        <Link
          href="/dashboard/guides"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-orange-300 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200/60 group-hover:scale-105 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Self-Service</div>
            <div className="text-xs font-extrabold text-purple-600 flex items-center gap-1">
              User Guides &amp; Docs <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        </Link>
      </div>

      {/* Main Support Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Direct Support Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-500" />
                Submit a Query to Okleevo Admin
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Fill out the form below. Your request will be immediately dispatched to our engineering &amp; support desk.
              </p>
            </div>

            {submittedRef && (
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-extrabold text-emerald-900 dark:text-emerald-300">
                    Request #{submittedRef} Dispatched Successfully!
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                    We have sent a confirmation email to <strong>{session?.user?.email}</strong>. Our support team is reviewing your query and will reply directly to your email thread.
                  </p>
                  <button
                    onClick={() => setSubmittedRef(null)}
                    className="text-xs font-bold text-emerald-800 hover:underline pt-2 cursor-pointer"
                  >
                    Submit another inquiry
                  </button>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3 text-rose-700 dark:text-rose-400 text-xs font-medium">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Support Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  >
                    <option value="Technical Issue / Bug">Technical Issue / Bug</option>
                    <option value="Billing, Invoices & Subscriptions">Billing, Invoices &amp; Subscriptions</option>
                    <option value="Account Setup & Team Seats">Account Setup &amp; Team Seats</option>
                    <option value="Domain & Email Verification">Domain &amp; Email Verification</option>
                    <option value="Feature Request & Suggestions">Feature Request &amp; Suggestions</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>

                {/* Priority Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Urgency / Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  >
                    <option value="NORMAL">Standard Priority (&lt; 4 hrs)</option>
                    <option value="HIGH">High Priority (&lt; 2 hrs)</option>
                    <option value="URGENT">Critical / Blocking Issue (&lt; 1 hr)</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  placeholder="e.g. Need assistance setting up custom email domain"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  required
                />
              </div>

              {/* Detailed Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Detailed Description
                </label>
                <textarea
                  rows={5}
                  placeholder="Please describe what you are trying to do, any error messages you see, or steps we can take to assist you..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-y"
                  required
                />
              </div>

              {/* Sender Metadata Readout */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 flex items-center justify-between">
                <span>
                  Sending as: <strong className="text-slate-800 dark:text-slate-200">{session?.user?.name || 'Workspace Admin'}</strong> ({session?.user?.email})
                </span>
                <span className="text-slate-400">Encrypted transmission 🔒</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20 active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending Request to Okleevo…
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send Request to Okleevo Admin
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: FAQ & Direct Channels */}
        <div className="space-y-6">
          {/* Quick Contact Card */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-lg">
            <div className="flex items-center gap-2 text-orange-400 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Direct Support Desk
            </div>
            <h3 className="text-lg font-extrabold text-white">Need an instant answer?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Email our support team directly from your email client or explore our video tutorials.
            </p>
            <div className="pt-2 space-y-2.5">
              <a
                href="mailto:support@okleevo.com"
                className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-orange-400" />
                Email support@okleevo.com
              </a>
              <Link
                href="/dashboard/guides"
                className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm shadow-orange-500/30"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Open User Guides
              </Link>
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-orange-500" />
              Common Questions (FAQs)
            </h3>

            <div className="space-y-2">
              {FAQ_ITEMS.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200/70 dark:border-slate-800 rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full p-3 text-left text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-orange-500' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/30">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
