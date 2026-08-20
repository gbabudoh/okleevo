"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LifeBuoy, Mail, Clock, ShieldCheck, BookOpen, Send,
  CheckCircle2, AlertCircle, Sparkles, ChevronDown, MessageSquare,
  Copy, Check, Wrench, CreditCard, Users, Globe, Lightbulb,
  HelpCircle, ArrowRight, Shield
} from 'lucide-react';

interface CategoryOption {
  id: string;
  label: string;
  icon: React.ElementType;
  placeholder: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'technical',
    label: 'Technical & Bug',
    icon: Wrench,
    placeholder: 'Describe the technical issue, what steps caused it, or any error messages you see...',
  },
  {
    id: 'billing',
    label: 'Billing & Plans',
    icon: CreditCard,
    placeholder: 'Ask questions regarding your subscription, invoices, payment method, or tier changes...',
  },
  {
    id: 'seats',
    label: 'Team & Seats',
    icon: Users,
    placeholder: 'Need help inviting team members, managing seat allocations, or setting up role permissions?...',
  },
  {
    id: 'domain',
    label: 'Domain & Email',
    icon: Globe,
    placeholder: 'Need assistance verifying DNS records (SPF, DKIM, DMARC) or custom booking links?...',
  },
  {
    id: 'feature',
    label: 'Feature Request',
    icon: Lightbulb,
    placeholder: 'Tell us what feature or workflow enhancement would make Okleevo even better for your business...',
  },
  {
    id: 'general',
    label: 'General Inquiry',
    icon: HelpCircle,
    placeholder: 'How can our platform support team assist your organization today?...',
  },
];

const FAQ_ITEMS = [
  {
    question: 'How do I add or manage team seats?',
    answer: 'Navigate to Settings → Team tab. Enter the email address of your team member and assign their role (Admin, Manager, or Member). Your Starter Plan includes 5 team seats out of the box.'
  },
  {
    question: 'How do I set up Email OTP Two-Factor Authentication?',
    answer: 'Go to Settings → Security tab. Click "Enable 2FA" to receive a 6-digit confirmation PIN on your registered email. Once verified, 2FA will be enforced on every sign-in.'
  },
  {
    question: 'How do I verify custom domain sending for Mail Engine?',
    answer: 'Under Settings → Organization, configure your business domain SPF and DKIM records. Once verified, all transactional and client emails will dispatch directly under your brand.'
  },
  {
    question: 'Where can I access step-by-step module tutorials?',
    answer: 'Visit the User Guides section in your sidebar or click the "Browse Knowledge Base" button on this page to explore interactive documentation for all 11+ Okleevo modules.'
  },
];

export default function PlatformSupportPage() {
  const { data: session } = useSession();

  const [selectedCategory, setSelectedCategory] = useState<CategoryOption>(CATEGORIES[0]);
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
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
      setErrorMessage('Please enter both a subject and a description of your inquiry.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory.label,
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
        setErrorMessage(data.error || 'Failed to submit request. Please try again or email support@okleevo.com directly.');
      }
    } catch (err) {
      console.error('Support submission error:', err);
      setErrorMessage('A network error occurred. Please contact support@okleevo.com directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentPlaceholder = selectedCategory.placeholder;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* ─── 1. Minimalist Ambient Studio Header ─── */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-48 bg-orange-400/10 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/3 w-80 h-36 bg-amber-400/10 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            {/* Live Operational Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Support Engineers Online</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-slate-500 font-mono text-[10px]">Avg. Response &lt; 2h</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Enterprise Concierge &amp; Support
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Direct, human assistance from our engineering and product team for your workspace.
            </p>
          </div>

          {/* Quick SLA Stat Capsule */}
          <div className="flex items-center gap-3 bg-slate-50/80 dark:bg-slate-800/50 p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="pr-2">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Priority Support</div>
              <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Active · Direct Engineer Access</div>
            </div>
          </div>
        </div>

        {/* Category Chips Bar */}
        <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            Select Inquiry Type:
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory.id === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/25 scale-[1.02]'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:border-orange-300 hover:text-orange-600'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── 2. Main 2-Column Bento Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Fluid Concierge Composer (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    Submit Inquiry
                  </h2>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Topic: <span className="font-semibold text-orange-600 dark:text-orange-400">{selectedCategory.label}</span>
                  </div>
                </div>
              </div>

              {/* Priority Segmented Toggle */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setPriority('NORMAL')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    priority === 'NORMAL'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('HIGH')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    priority === 'HIGH'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  High
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('URGENT')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    priority === 'URGENT'
                      ? 'bg-rose-500 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Urgent
                </button>
              </div>
            </div>

            {/* Submission Confirmation Banner */}
            <AnimatePresence>
              {submittedRef && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-4"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <div className="font-extrabold text-emerald-900 dark:text-emerald-300">
                      Inquiry #{submittedRef} Dispatched Successfully
                    </div>
                    <p className="text-emerald-700 dark:text-emerald-400 leading-relaxed">
                      A confirmation email has been dispatched to <strong>{session?.user?.email}</strong>. Our engineers have been alerted and will follow up directly on your email thread.
                    </p>
                    <button
                      onClick={() => setSubmittedRef(null)}
                      className="font-bold text-emerald-800 dark:text-emerald-300 hover:underline pt-2 cursor-pointer block"
                    >
                      + Submit another inquiry
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3 text-rose-700 dark:text-rose-400 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Subject Line */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  placeholder="e.g. Assistance configuring custom email domain DNS"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all shadow-2xs"
                  required
                />
              </div>

              {/* Message Details */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Message Details
                </label>
                <textarea
                  rows={6}
                  placeholder={currentPlaceholder}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-4 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all shadow-2xs resize-y leading-relaxed"
                  required
                />
              </div>

              {/* Sender Verified Capsule */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                    {(session?.user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">
                    Authenticated: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{session?.user?.name || 'Workspace Admin'}</strong> ({session?.user?.email})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
                  <Shield className="w-3 h-3 text-emerald-500" /> SSL Encrypted
                </span>
              </div>

              {/* Submit Action Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-extrabold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-sm shadow-orange-500/25 active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Dispatching to Support Engineers…
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Dispatch Request to Engineers →
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Integrated Channels & Instant FAQ Bento (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Direct Support Channels Bento Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              Direct Support Channels
            </div>

            <div className="space-y-3">
              {/* Direct Mail Channel */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direct Email Desk</div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">support@okleevo.com</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-2 bg-white dark:bg-slate-700 hover:bg-slate-100 rounded-xl text-slate-500 border border-slate-200 dark:border-slate-600 text-xs font-bold transition-all cursor-pointer shrink-0"
                  title="Copy email"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* SLA Guarantee Channel */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200/60">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Response SLA</div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white">&lt; 2–4 Business Hours</div>
                </div>
              </div>
            </div>

            {/* Self-Service Guides Shortcut */}
            <Link
              href="/dashboard/guides"
              className="group w-full p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-950 text-white flex items-center justify-between gap-3 transition-all hover:scale-[1.01] cursor-pointer shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-orange-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-white">Video &amp; Product Guides</div>
                  <div className="text-[10px] text-slate-300">11+ interactive module walkthroughs</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          </div>

          {/* Frequently Asked Questions Bento */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-orange-500" />
                Quick Answers &amp; FAQs
              </h3>
            </div>

            <div className="space-y-2">
              {FAQ_ITEMS.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200/70 dark:border-slate-800 rounded-2xl overflow-hidden transition-all bg-slate-50/40 dark:bg-slate-800/20 hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full p-3.5 text-left text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <span className="leading-snug">{faq.question}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-orange-500' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-3.5 pb-3.5 pt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80"
                      >
                        {faq.answer}
                      </motion.div>
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
