"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
  Plus, Search, Download, Eye, Edit, Send, Trash2,
  Clock, CheckCircle2, AlertCircle, MoreVertical, X,
  Calendar, Mail, FileText, Banknote, Ban, RotateCcw,
  ChevronDown, Loader2, ArrowUpRight, Check,
  Sparkles, Filter, ShieldCheck, Globe, DollarSign,
  TrendingUp, Layers, SlidersHorizontal, ArrowDownAZ,
  Building2, Hash, AlertTriangle, Printer, Copy
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import TourProvider from '@/components/tours/TourProvider';
import { ModuleGuideBanner } from '@/components/tours/ModuleGuideBanner';
import { invoicingTourSteps } from './tour-steps';

/* ── Interfaces ──────────────────────────────────────────────────── */
interface InvoiceLineItem {
  description: string;
  quantity: number;
  rate: number;
  vatRate?: number;
}

const DEFAULT_VAT_RATE = 20;

const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD ($) — US Dollar' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) — British Pound' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) — Euro' },
  { code: 'NGN', symbol: '₦', label: 'NGN (₦) — Nigerian Naira' },
  { code: 'GHS', symbol: 'GH₵', label: 'GHS (GH₵) — Ghanaian Cedi' },
  { code: 'KES', symbol: 'KSh', label: 'KES (KSh) — Kenyan Shilling' },
  { code: 'ZAR', symbol: 'R', label: 'ZAR (R) — South African Rand' },
  { code: 'CAD', symbol: 'C$', label: 'CAD (C$) — Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$) — Australian Dollar' },
];

const getCurrencySymbol = (code?: string): string => {
  if (!code) return '$';
  const found = SUPPORTED_CURRENCIES.find((c) => c.code.toUpperCase() === code.toUpperCase());
  return found ? found.symbol : '$';
};

interface Invoice {
  id: string;
  client: string;
  clientEmail: string;
  amount: number;
  currency?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  date: string;
  dueDate: string;
  items: InvoiceLineItem[];
}

interface InvoiceResponse {
  id: string;
  number: string | null;
  clientName: string;
  clientEmail: string | null;
  amount: number;
  currency?: string | null;
  status: string;
  createdAt: string;
  dueDate: string;
  items: InvoiceLineItem[] | null;
}

/* ── Status Configurations ────────────────────────────────────────── */
const STATUS_CONFIG = {
  paid: {
    label: 'Settled',
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-500 shadow-emerald-500/50',
  },
  sent: {
    label: 'Dispatched',
    badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
    dot: 'bg-blue-500 shadow-blue-500/50',
  },
  overdue: {
    label: 'Overdue SLA',
    badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
    dot: 'bg-rose-500 shadow-rose-500/50 animate-pulse',
  },
  draft: {
    label: 'Drafting',
    badge: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30',
    dot: 'bg-slate-400',
  },
  cancelled: {
    label: 'Voided',
    badge: 'bg-slate-400/10 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-800',
    dot: 'bg-slate-300 dark:bg-slate-700',
  },
} as const;

const getStatus = (s: string) => STATUS_CONFIG[s as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft;

const avatarGrad = (name: string) => {
  const g = [
    'from-blue-600 to-indigo-600',
    'from-indigo-600 to-purple-600',
    'from-emerald-600 to-teal-600',
    'from-orange-500 to-amber-600',
    'from-cyan-600 to-blue-600',
    'from-purple-600 to-pink-600',
  ];
  return g[(name?.charCodeAt(0) || 0) % g.length];
};

export default function InvoicingPage() {
  const { data: session } = useSession();
  const businessName = (session?.user as any)?.businessName || (session?.user as any)?.business?.name || 'Okleevo Workspace';
  const businessEmail = session?.user?.email || 'billing@okleevo.com';

  /* ── State ──────────────────────────────────────────────────────── */
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [defaultCurrency, setDefaultCurrency] = useState('GBP');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCurrency, setFilterCurrency] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals & Drawers
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [emailInvoice, setEmailInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [emailData, setEmailData] = useState({ to: '', subject: '', message: '' });
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Invoice Form State
  const [newInvoice, setNewInvoice] = useState({
    clientType: 'business' as 'business' | 'individual',
    client: '',
    clientEmail: '',
    currency: 'GBP',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{ description: '', quantity: 1, rate: 0, vatRate: DEFAULT_VAT_RATE }],
    projectId: '',
  });

  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [creatingProject, setCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [savingNewProject, setSavingNewProject] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [savingInvoice, setSavingInvoice] = useState(false);

  // Quick Action Targets
  const [markPaidTarget, setMarkPaidTarget] = useState<Invoice | null>(null);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Invoice | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [reopenTarget, setReopenTarget] = useState<Invoice | null>(null);
  const [reopening, setReopening] = useState(false);

  const EDITABLE_STATUSES: Invoice['status'][] = ['draft', 'sent', 'overdue'];
  const canModify = (invoice: Invoice) => EDITABLE_STATUSES.includes(invoice.status);
  const REOPENABLE_STATUSES: Invoice['status'][] = ['paid', 'cancelled'];
  const canReopen = (invoice: Invoice) => REOPENABLE_STATUSES.includes(invoice.status);
  const reopenedStatus = (invoice: Invoice): 'SENT' | 'OVERDUE' =>
    new Date(invoice.dueDate) < new Date() ? 'OVERDUE' : 'SENT';

  const [mounted, setMounted] = useState(false);

  /* ── Fetching Data ──────────────────────────────────────────────── */
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/invoices');
      const data = await res.json();
      if (data.data) {
        setInvoices(
          data.data.map((inv: InvoiceResponse) => {
            const rawStatus = inv.status.toLowerCase();
            return {
              id: inv.number || inv.id,
              client: inv.clientName,
              clientEmail: inv.clientEmail || '',
              amount: inv.amount,
              currency: inv.currency || defaultCurrency || 'GBP',
              status: (rawStatus === 'canceled' ? 'cancelled' : rawStatus) as Invoice['status'],
              date: new Date(inv.createdAt).toISOString().split('T')[0],
              dueDate: new Date(inv.dueDate).toISOString().split('T')[0],
              items: Array.isArray(inv.items) ? inv.items : [],
            };
          })
        );
      }
    } catch {
      showToast('Failed to load invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = () => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]));
  };

  useEffect(() => {
    setMounted(true);
    fetchInvoices();
    fetchProjects();

    // Fetch workspace default currency from business profile
    fetch('/api/user/profile')
      .then((res) => res.json())
      .then((data) => {
        const cur = data?.business?.currency || (data?.business?.country === 'UK' ? 'GBP' : 'GBP');
        if (cur) {
          setDefaultCurrency(cur);
          setNewInvoice((prev) => ({ ...prev, currency: cur }));
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Calculations & Metrics ─────────────────────────────────────── */
  const stats = useMemo(() => {
    const total = invoices.reduce((s, i) => s + i.amount, 0);
    const paid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
    const pending = invoices.filter((i) => i.status === 'sent').reduce((s, i) => s + i.amount, 0);
    const overdue = invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
    const paidCount = invoices.filter((i) => i.status === 'paid').length;
    const rate = invoices.length > 0 ? Math.round((paidCount / invoices.length) * 100) : 100;

    return { total, paid, pending, overdue, rate };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        inv.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.amount.toString().includes(searchTerm);
      const matchStatus = filterStatus === 'all' || inv.status === filterStatus;
      const matchCurrency = filterCurrency === 'all' || (inv.currency || 'USD') === filterCurrency;
      return matchSearch && matchStatus && matchCurrency;
    });
  }, [invoices, searchTerm, filterStatus, filterCurrency]);

  const newInvoiceTotal = useMemo(() => {
    return newInvoice.items.reduce((s, i) => s + (i.quantity || 0) * (i.rate || 0), 0);
  }, [newInvoice.items]);

  const newInvoiceVAT = useMemo(() => {
    return newInvoice.items.reduce(
      (s, i) => s + (i.quantity || 0) * (i.rate || 0) * ((i.vatRate ?? DEFAULT_VAT_RATE) / 100),
      0
    );
  }, [newInvoice.items]);

  /* ── PDF & CSV Generators ───────────────────────────────────────── */
  const downloadAsPDF = (invoice: Invoice) => {
    const invCurrency = (invoice.currency && invoice.currency.trim()) || defaultCurrency || 'GBP';
    const sym = getCurrencySymbol(invCurrency);
    const doc = new jsPDF();

    // Modern Branded Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 42, 'F');
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(businessName.toUpperCase(), 20, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL INVOICE & PROOF OF SERVICE', 20, 28);
    doc.text(`REF: ${invoice.id}`, 190, 20, { align: 'right' });
    doc.text(`STATUS: ${invoice.status.toUpperCase()}`, 190, 28, { align: 'right' });

    // Client & Metadata Card
    doc.setTextColor(15, 23, 42);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, 50, 80, 26, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLED TO (CLIENT):', 25, 57);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(invoice.client, 25, 64);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(invoice.clientEmail || 'No email specified', 25, 70);

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(110, 50, 80, 26, 3, 3, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT DETAILS:', 115, 57);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Issue Date: ${invoice.date}`, 115, 64);
    doc.text(`Due Date: ${invoice.dueDate}`, 115, 70);
    doc.text(`Currency: ${invCurrency}`, 160, 64);

    // Line Items Header
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(20, 84, 170, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('ITEM DELIVERABLE', 24, 89);
    doc.text('QTY', 120, 89);
    doc.text(`UNIT RATE (${sym})`, 140, 89);
    doc.text(`SUBTOTAL (${sym})`, 168, 89);

    // Table Content
    let yPos = 99;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    invoice.items.forEach((item, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(20, yPos - 5, 170, 8, 'F');
      }
      doc.text(item.description, 24, yPos);
      doc.text(item.quantity.toString(), 120, yPos);
      doc.text(`${sym}${item.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 140, yPos);
      doc.text(`${sym}${(item.quantity * item.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 168, yPos);
      yPos += 8;
    });

    // Summary Box
    yPos += 8;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(120, yPos, 70, 24, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('TOTAL BILLED:', 125, yPos + 8);
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229);
    doc.text(`${sym}${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${invCurrency}`, 125, yPos + 18);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated securely by Okleevo Invoicing Engine · ${businessName}`, 105, 280, { align: 'center' });

    doc.save(`${invoice.id}.pdf`);
  };

  const downloadAsExcel = (invoice: Invoice) => {
    const invCurrency = (invoice.currency && invoice.currency.trim()) || defaultCurrency || 'GBP';
    const sym = getCurrencySymbol(invCurrency);
    const headers = ['Description', 'Quantity', 'Rate', 'Amount'];
    const rows = invoice.items.map((item) => [
      item.description,
      item.quantity,
      item.rate,
      item.quantity * item.rate,
    ]);
    let csv = `Invoice: ${invoice.id}\nClient: ${invoice.client}\nEmail: ${invoice.clientEmail}\nCurrency: ${invCurrency}\nIssue Date: ${invoice.date}\nDue Date: ${invoice.dueDate}\nStatus: ${invoice.status}\n\n`;
    csv += headers.join(',') + '\n' + rows.map((r) => r.join(',')).join('\n');
    csv += `\n\nTotal Due,,,${sym}${invoice.amount}`;

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportAllCSV = () => {
    const headers = ['Invoice ID', 'Client', 'Email', 'Amount', 'Currency', 'Status', 'Issue Date', 'Due Date'];
    const rows = invoices.map((inv) => [
      inv.id,
      inv.client,
      inv.clientEmail,
      inv.amount,
      inv.currency || defaultCurrency || 'GBP',
      inv.status,
      inv.date,
      inv.dueDate,
    ]);
    let csv = `Okleevo Invoice Engine Ledger Report\nGenerated: ${new Date().toLocaleDateString()}\nTotal Volume: ${getCurrencySymbol(defaultCurrency)}${stats.total.toLocaleString()}\n\n`;
    csv += headers.join(',') + '\n' + rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
    showToast('Exported full ledger as CSV!');
  };

  /* ── Action Handlers ────────────────────────────────────────────── */
  const closeNewModal = () => {
    setShowNewInvoiceModal(false);
    setEditingInvoiceId(null);
    setNewInvoice({
      clientType: 'business',
      client: '',
      clientEmail: '',
      currency: defaultCurrency || 'GBP',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      items: [{ description: '', quantity: 1, rate: 0, vatRate: DEFAULT_VAT_RATE }],
      projectId: '',
    });
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    setSavingNewProject(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName.trim() }),
      });
      if (res.ok) {
        const created = await res.json();
        setProjects((prev) => [...prev, { id: created.id, name: created.name }]);
        setNewInvoice((prev) => ({ ...prev, projectId: created.id }));
        setNewProjectName('');
        setCreatingProject(false);
      }
    } finally {
      setSavingNewProject(false);
    }
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoiceId(invoice.id);
    setNewInvoice({
      clientType: 'business',
      client: invoice.client,
      clientEmail: invoice.clientEmail,
      currency: invoice.currency || 'USD',
      date: invoice.date,
      dueDate: invoice.dueDate,
      items:
        invoice.items.length > 0
          ? invoice.items.map((i) => ({ ...i, vatRate: i.vatRate ?? DEFAULT_VAT_RATE }))
          : [{ description: '', quantity: 1, rate: 0, vatRate: DEFAULT_VAT_RATE }],
      projectId: '',
    });
    setShowNewInvoiceModal(true);
    setActiveMenu(null);
  };

  const handleSendEmail = (invoice: Invoice) => {
    const sym = getCurrencySymbol(invoice.currency);
    setEmailInvoice(invoice);
    setEmailData({
      to: invoice.clientEmail,
      subject: `Invoice ${invoice.id} from ${businessName}`,
      message: `Dear ${invoice.client},\n\nPlease find attached invoice ${invoice.id} for ${sym}${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${invoice.currency || 'USD'}).\n\nPayment Due Date: ${invoice.dueDate}\n\nThank you for your valued business!\n\nBest regards,\n${businessName}`,
    });
    setShowEmailModal(true);
    setActiveMenu(null);
  };

  const sendInvoiceEmail = async () => {
    if (!emailInvoice) return;
    try {
      const res = await fetch(`/api/invoices/${emailInvoice.id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: emailData.to, subject: emailData.subject, message: emailData.message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send email');
      await fetchInvoices();
      showToast(`Invoice dispatched directly to ${emailData.to}!`);
      setShowEmailModal(false);
      setEmailInvoice(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to send invoice', 'error');
    }
  };

  const handleSaveInvoice = async () => {
    if (!newInvoice.client.trim() || newInvoiceTotal <= 0) return;
    setSavingInvoice(true);
    try {
      const payload = {
        clientName: newInvoice.client,
        clientEmail: newInvoice.clientEmail,
        amount: newInvoiceTotal,
        currency: newInvoice.currency || 'USD',
        items: newInvoice.items,
        dueDate: newInvoice.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        projectId: newInvoice.projectId || undefined,
      };
      const res = await fetch(
        editingInvoiceId ? `/api/invoices/${editingInvoiceId}` : '/api/invoices',
        {
          method: editingInvoiceId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to save invoice');
      await fetchInvoices();
      showToast(editingInvoiceId ? 'Invoice updated!' : 'Invoice created & queued!');
      closeNewModal();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save invoice', 'error');
    } finally {
      setSavingInvoice(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!markPaidTarget) return;
    setMarkingPaid(true);
    try {
      const res = await fetch(`/api/invoices/${markPaidTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID', paidAt: paymentDate }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to mark invoice as paid');
      await fetchInvoices();
      showToast(`${markPaidTarget.id} marked as settled.`);
      setMarkPaidTarget(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to mark invoice as paid', 'error');
    } finally {
      setMarkingPaid(false);
    }
  };

  const handleCancelInvoice = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/invoices/${cancelTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELED' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to cancel invoice');
      await fetchInvoices();
      showToast(`${cancelTarget.id} has been voided.`);
      setCancelTarget(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to cancel invoice', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleReopenInvoice = async () => {
    if (!reopenTarget) return;
    setReopening(true);
    try {
      const res = await fetch(`/api/invoices/${reopenTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: reopenedStatus(reopenTarget) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to reopen invoice');
      await fetchInvoices();
      showToast(`${reopenTarget.id} has been reopened.`);
      setReopenTarget(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to reopen invoice', 'error');
    } finally {
      setReopening(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredInvoices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInvoices.map((i) => i.id));
    }
  };

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  /* ── Keyboard Shortcuts ─────────────────────────────────────────── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('invoice-search-input')?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setShowNewInvoiceModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-24 font-sans text-slate-900 dark:text-slate-100">
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
                <FileText className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  Invoice Engine
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                  Client pricing, itemized invoice generation, PDF exports, and 1-click email dispatch
                </p>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6 pt-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-xs font-bold text-slate-400">Loading Invoice Engine workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-24 font-sans text-slate-900 dark:text-slate-100">
      <TourProvider moduleId="invoicing" steps={invoicingTourSteps} />

      {/* ── Toast Notification ─────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-[300] px-5 py-3 rounded-2xl shadow-xl border text-xs font-black flex items-center gap-2.5 backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-500/90 text-white border-rose-600 shadow-rose-500/20'
                : 'bg-emerald-600/90 text-white border-emerald-500 shadow-emerald-500/20'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── COMMAND HEADER (Glassmorphic Strip) ────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Top Row / Left Info */}
          <div className="flex items-center justify-between sm:justify-start gap-3 min-w-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    Invoice Engine
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                  Client pricing, itemized invoice generation, PDF exports, and 1-click email dispatch
                </p>
              </div>
            </div>
          </div>

          {/* Action Hub - nicely structured on mobile */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <ModuleGuideBanner
                moduleId="invoicing"
                moduleName="Invoice Engine"
                summary="Price SME deliverables, generate itemized VAT invoices, and dispatch PDF invoices directly to client email."
                tips={[
                  "1-Click 'Send Email' dispatches formatted HTML invoices with PDF & CSV attachments",
                  "Supports multi-currency billing ($ USD, £ GBP, € EUR, ₦ NGN, etc.)",
                  "Automatic synchronization with accounting ledgers and team audit stream",
                ]}
              />

              {/* Export Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setExportMenuOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Export</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {exportMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setExportMenuOpen(false)} />
                    <div className="absolute left-0 sm:left-auto sm:right-0 mt-1.5 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <button
                        onClick={handleExportAllCSV}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/50 flex items-center gap-2.5 cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-emerald-500" />
                        <span>Export Full CSV Ledger</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Primary Action Button — Okleevo Brand Gradient */}
            <button
              type="button"
              onClick={() => setShowNewInvoiceModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-extrabold shadow-md shadow-orange-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Invoice</span>
              <kbd className="hidden lg:inline-flex px-1.5 py-0.5 rounded-md bg-white/20 text-[9px] font-mono font-bold">
                ⌘N
              </kbd>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
        {/* ── HORIZON KPI TELEMETRY RIBBON (Linear / Mercury Aesthetic) ── */}
        <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-5 lg:p-6 shadow-xs relative overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
            {/* Total Billed Volume */}
            <div className="lg:px-5 first:pl-0 p-3 sm:p-0 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 sm:bg-transparent sm:dark:bg-transparent space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Total Billed Volume
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 shrink-0">
                  {invoices.length} inv
                </span>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                {getCurrencySymbol(defaultCurrency)}{stats.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-slate-400 font-bold truncate">Gross invoice volume</p>
            </div>

            {/* Collected Inflow */}
            <div className="lg:px-5 p-3 sm:p-0 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 sm:bg-transparent sm:dark:bg-transparent space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Settled Inflow
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                  <TrendingUp className="w-3 h-3" /> {stats.rate}% Rate
                </span>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                {getCurrencySymbol(defaultCurrency)}{stats.paid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${stats.rate}%` }} />
              </div>
            </div>

            {/* Pending Escrow */}
            <div className="lg:px-5 p-3 sm:p-0 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 sm:bg-transparent sm:dark:bg-transparent space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Pending Escrow
                </span>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 shrink-0">
                  {invoices.filter((i) => i.status === 'sent').length} awaiting
                </span>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-blue-600 dark:text-blue-400 tracking-tight">
                {getCurrencySymbol(defaultCurrency)}{stats.pending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-slate-400 font-bold truncate">Awaiting client payment</p>
            </div>

            {/* Overdue SLA */}
            <div className="lg:px-5 p-3 sm:p-0 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 sm:bg-transparent sm:dark:bg-transparent space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Overdue SLA
                </span>
                {stats.overdue > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 animate-pulse shrink-0">
                    <AlertTriangle className="w-3 h-3" /> SLA
                  </span>
                )}
              </div>
              <p className={`text-xl sm:text-2xl lg:text-3xl font-black font-mono tracking-tight ${stats.overdue > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                {getCurrencySymbol(defaultCurrency)}{stats.overdue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-slate-400 font-bold truncate">
                {invoices.filter((i) => i.status === 'overdue').length} requiring follow-up
              </p>
            </div>

            {/* Global Multi-Currency Support */}
            <div className="col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-1 lg:pl-5 p-3 sm:p-0 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 sm:bg-transparent sm:dark:bg-transparent space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Location Engine
                </span>
                <Globe className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {['USD', 'GBP', 'EUR', 'NGN', 'GHS'].map((cur) => (
                  <span
                    key={cur}
                    onClick={() => setFilterCurrency(filterCurrency === cur ? 'all' : cur)}
                    className={`px-2 py-0.5 rounded-md text-[9px] font-black cursor-pointer transition-all ${
                      filterCurrency === cur
                        ? 'bg-orange-500 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-950/50 border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    {cur}
                  </span>
                ))}
              </div>
              <p className="text-[9px] text-slate-400 font-medium">Click currency to filter</p>
            </div>
          </div>
        </section>

        {/* ── SMART CONTROL & FILTER STRIP ───────────────────────────────── */}
        <section className="space-y-3">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 shadow-xs flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
            {/* Search Box */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="invoice-search-input"
                type="text"
                placeholder="Search client, invoice #, or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-12 sm:pr-20 py-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl sm:rounded-2xl text-xs font-semibold outline-none border border-slate-200/70 dark:border-slate-700/70 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white transition-all placeholder:text-slate-400"
              />
              <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs">
                ⌘K
              </kbd>
            </div>

            {/* Currency Filter Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={filterCurrency}
                onChange={(e) => setFilterCurrency(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl sm:rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700/70 outline-none cursor-pointer"
              >
                <option value="all">🌍 All Currencies</option>
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>

              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 rounded-2xl animate-in fade-in">
                  <span className="text-xs font-black text-orange-700 dark:text-orange-300">
                    {selectedIds.length} Selected
                  </span>
                  <button
                    onClick={() => {
                      const selected = invoices.filter((i) => selectedIds.includes(i.id));
                      selected.forEach(downloadAsPDF);
                      showToast(`Exported ${selected.length} PDFs!`);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-orange-500 text-white text-[10px] font-black hover:bg-orange-600 transition-colors cursor-pointer"
                  >
                    Batch PDF
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Segmented Status Filter Tabs */}
          <div className="w-full overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 min-w-full sm:min-w-0">
              {[
                { id: 'all', label: 'All', count: invoices.length },
                { id: 'paid', label: 'Settled', count: invoices.filter((i) => i.status === 'paid').length },
                { id: 'sent', label: 'Dispatched', count: invoices.filter((i) => i.status === 'sent').length },
                { id: 'overdue', label: 'Overdue SLA', count: invoices.filter((i) => i.status === 'overdue').length },
                { id: 'draft', label: 'Drafts', count: invoices.filter((i) => i.status === 'draft').length },
                { id: 'cancelled', label: 'Voided', count: invoices.filter((i) => i.status === 'cancelled').length },
              ].map((tab) => {
                const active = filterStatus === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilterStatus(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                      active
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-700'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        active
                          ? 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-300 font-black'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── HIGH-DENSITY ENTERPRISE LEDGER TABLE ───────────────────────── */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              <p className="text-xs font-bold text-slate-400">Synchronizing invoice ledger…</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center text-orange-500 border border-orange-200/60 dark:border-orange-900/40 shadow-xs">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">No invoices matched your criteria</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Try adjusting your search terms or create a new invoice for immediate dispatch.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewInvoiceModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
              >
                + Draft First Invoice
              </button>
            </div>
          ) : (
            <>
              {/* Desktop High-Density Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800">
                    <tr>
                      <th className="w-12 px-5 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredInvoices.length && filteredInvoices.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      <th className="px-4 py-3.5 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Invoice ID</th>
                      <th className="px-4 py-3.5 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Client Entity</th>
                      <th className="px-4 py-3.5 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Amount Due</th>
                      <th className="px-4 py-3.5 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Status SLA</th>
                      <th className="px-4 py-3.5 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Issue Date</th>
                      <th className="px-4 py-3.5 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Due Date</th>
                      <th className="px-5 py-3.5 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredInvoices.map((inv) => {
                      const sc = getStatus(inv.status);
                      const sym = getCurrencySymbol(inv.currency);
                      const isSelected = selectedIds.includes(inv.id);

                      return (
                        <tr
                          key={inv.id}
                          className={`hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-colors group ${
                            isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/30' : ''
                          }`}
                        >
                          <td className="px-5 py-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectId(inv.id)}
                              className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-mono text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {inv.id}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${avatarGrad(inv.client)} text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0`}
                              >
                                {inv.client?.charAt(0).toUpperCase() || 'C'}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-black text-slate-900 dark:text-white truncate">{inv.client}</p>
                                <p className="text-[11px] text-slate-400 font-medium truncate">{inv.clientEmail || 'No email attached'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                              {sym}{inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="ml-1 text-[10px] font-mono font-bold text-slate-400 uppercase">
                              {inv.currency || 'USD'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black border uppercase tracking-wider ${sc.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">{inv.date}</td>
                          <td className="px-4 py-4 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{inv.dueDate}</td>
                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  setShowInvoiceModal(true);
                                }}
                                title="View details"
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSendEmail(inv)}
                                title="Send email to client"
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 rounded-xl transition-colors cursor-pointer"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadAsPDF(inv)}
                                title="Download PDF"
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-600 rounded-xl transition-colors cursor-pointer"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              {canModify(inv) && (
                                <button
                                  type="button"
                                  onClick={() => handleEditInvoice(inv)}
                                  title="Edit invoice"
                                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-amber-600 rounded-xl transition-colors cursor-pointer"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingInvoice(inv);
                                  setShowDeleteModal(true);
                                }}
                                title="Delete invoice"
                                className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Compact Responsive Card View */}
              <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInvoices.map((inv) => {
                  const sc = getStatus(inv.status);
                  const sym = getCurrencySymbol(inv.currency);

                  return (
                    <div key={inv.id} className="p-4 space-y-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${avatarGrad(inv.client)} text-white font-black text-xs flex items-center justify-center shrink-0`}>
                            {inv.client?.charAt(0).toUpperCase() || 'C'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate">{inv.client}</p>
                            <p className="text-[10px] font-mono font-bold text-slate-400 truncate">{inv.id}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase shrink-0 ${sc.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Amount Due</p>
                          <p className="text-base font-black font-mono text-slate-900 dark:text-white">
                            {sym}{inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            <span className="ml-1 text-[10px] font-bold text-slate-400">{inv.currency || 'USD'}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Due Date</p>
                          <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{inv.dueDate}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setShowInvoiceModal(true);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => downloadAsPDF(inv)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          >
                            PDF
                          </button>
                          {canModify(inv) && (
                            <button
                              onClick={() => handleEditInvoice(inv)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 text-xs font-bold hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                            >
                              Edit
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleSendEmail(inv)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white text-xs font-extrabold flex items-center gap-1 shadow-sm shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
                          >
                            <Send className="w-3 h-3" /> Email
                          </button>
                          <button
                            onClick={() => {
                              setDeletingInvoice(inv);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>

      {/* ══════════════════════════════════════════════════════════════
          SPLIT-SCREEN LIVE INVOICE STUDIO MODAL (Create / Edit)
      ══════════════════════════════════════════════════════════════ */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-5 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={closeNewModal} />
          
          <div className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Studio Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {editingInvoiceId ? `Invoice Studio — ${editingInvoiceId}` : 'Invoice Studio — Create & Price'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Itemized line billing, VAT calculations, and dynamic currency dispatch
                  </p>
                </div>
              </div>
              <button
                onClick={closeNewModal}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Studio Content: Two-Column split on large screens */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/40 dark:bg-slate-950/30">
              {/* Left Column: Form Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Client & Metadata Card */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Client &amp; Currency Settings
                    </p>
                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">Step 1 of 2</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Client Entity / Business Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Egobas Services"
                        value={newInvoice.client}
                        onChange={(e) => setNewInvoice({ ...newInvoice, client: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Client Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="client@company.com"
                        value={newInvoice.clientEmail}
                        onChange={(e) => setNewInvoice({ ...newInvoice, clientEmail: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Issue Date
                      </label>
                      <input
                        type="date"
                        value={newInvoice.date}
                        onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Payment Due Date
                      </label>
                      <input
                        type="date"
                        value={newInvoice.dueDate}
                        onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-orange-500"
                      />
                    </div>

                    {/* Location-Based Currency Selector */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Billing Currency (Location-Based)
                      </label>
                      <select
                        value={newInvoice.currency}
                        onChange={(e) => setNewInvoice({ ...newInvoice, currency: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-orange-50/50 dark:bg-slate-800 border border-orange-200 dark:border-orange-900/60 rounded-xl text-xs font-black text-orange-900 dark:text-orange-200 outline-none focus:border-orange-500 cursor-pointer"
                      >
                        {SUPPORTED_CURRENCIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Line Items Card */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Itemized Deliverables
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setNewInvoice({
                          ...newInvoice,
                          items: [...newInvoice.items, { description: '', quantity: 1, rate: 0, vatRate: DEFAULT_VAT_RATE }],
                        })
                      }
                      className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs font-bold rounded-xl hover:bg-orange-100 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {newInvoice.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-3"
                      >
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Service / Deliverable Description
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Monthly Enterprise IT Maintenance"
                            value={item.description}
                            onChange={(e) => {
                              const items = [...newInvoice.items];
                              items[idx].description = e.target.value;
                              setNewInvoice({ ...newInvoice, items });
                            }}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2.5 items-center">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Qty</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const items = [...newInvoice.items];
                                items[idx].quantity = parseInt(e.target.value) || 0;
                                setNewInvoice({ ...newInvoice, items });
                              }}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                              Rate ({getCurrencySymbol(newInvoice.currency)})
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.rate}
                              onChange={(e) => {
                                const items = [...newInvoice.items];
                                items[idx].rate = parseFloat(e.target.value) || 0;
                                setNewInvoice({ ...newInvoice, items });
                              }}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                            />
                          </div>

                          <div className="flex items-end justify-between gap-2">
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Subtotal</label>
                              <div className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black font-mono text-slate-900 dark:text-white truncate">
                                {getCurrencySymbol(newInvoice.currency)}
                                {(item.quantity * item.rate).toFixed(2)}
                              </div>
                            </div>
                            {newInvoice.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setNewInvoice({
                                    ...newInvoice,
                                    items: newInvoice.items.filter((_, i) => i !== idx),
                                  })
                                }
                                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Real-Time Document Preview (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-5 sticky top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Live Document Preview</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-3 h-3" /> Real-time
                    </span>
                  </div>

                  {/* Simulated Paper Invoice */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 font-sans">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">{businessName}</h4>
                        <p className="text-[10px] text-slate-400">{businessEmail}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-mono text-[9px] font-bold">
                          DRAFT
                        </span>
                        <p className="text-[10px] font-mono text-slate-400 mt-1">{newInvoice.currency}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[11px] space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Billed Entity</p>
                      <p className="font-black text-slate-800 dark:text-slate-200">{newInvoice.client || 'Client Entity'}</p>
                      <p className="text-slate-400 text-[10px]">{newInvoice.clientEmail || 'client@email.com'}</p>
                    </div>

                    {/* Preview Line Items */}
                    <div className="space-y-1.5 text-xs">
                      {newInvoice.items.map((it, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-100 dark:border-slate-800">
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                            {it.description || `Item #${i + 1}`}
                          </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {getCurrencySymbol(newInvoice.currency)}
                            {(it.quantity * it.rate).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Preview Grand Total */}
                    <div className="pt-3 border-t-2 border-indigo-600/30 flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase">Total Billed</span>
                      <span className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">
                        {getCurrencySymbol(newInvoice.currency)}
                        {newInvoiceTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Studio Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={closeNewModal}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveInvoice}
                disabled={savingInvoice || !newInvoice.client.trim() || newInvoiceTotal <= 0}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white text-xs font-black shadow-md shadow-orange-500/25 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                {savingInvoice ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{editingInvoiceId ? 'Save & Update Invoice' : 'Generate & Queue Invoice'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          VIEW INVOICE DETAIL MODAL
      ══════════════════════════════════════════════════════════════ */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-5 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setShowInvoiceModal(false)} />

          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">{selectedInvoice.id}</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border uppercase ${getStatus(selectedInvoice.status).badge}`}>
                    {getStatus(selectedInvoice.status).label}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Client</p>
                  <p className="font-black text-slate-900 dark:text-white">{selectedInvoice.client}</p>
                  <p className="text-slate-500">{selectedInvoice.clientEmail}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Dates &amp; Currency</p>
                  <p className="text-slate-700 dark:text-slate-300">Issued: {selectedInvoice.date}</p>
                  <p className="font-bold text-orange-600 dark:text-orange-400">Due: {selectedInvoice.dueDate}</p>
                  <p className="font-mono text-[10px] text-slate-400">Currency: {selectedInvoice.currency || 'USD'}</p>
                </div>
              </div>

              {/* Items */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase pb-1 border-b border-slate-200 dark:border-slate-700">Line Items</p>
                {selectedInvoice.items.map((it, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-xs">
                    <span>{it.description} ({it.quantity} × {getCurrencySymbol(selectedInvoice.currency)}{it.rate})</span>
                    <span className="font-mono font-black">
                      {getCurrencySymbol(selectedInvoice.currency)}{(it.quantity * it.rate).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="pt-2 flex justify-between font-black text-sm text-orange-600 dark:text-orange-400">
                  <span>Grand Total</span>
                  <span className="font-mono">{getCurrencySymbol(selectedInvoice.currency)}{selectedInvoice.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
              <button
                onClick={() => downloadAsPDF(selectedInvoice)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  handleSendEmail(selectedInvoice);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer"
              >
                <Send className="w-4 h-4" /> Dispatch to Client Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          EMAIL DISPATCH MODAL
      ══════════════════════════════════════════════════════════════ */}
      {showEmailModal && emailInvoice && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-5 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setShowEmailModal(false)} />

          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Email Dispatch Engine</h3>
                  <p className="text-[11px] text-slate-400">Direct branded email with official PDF attached</p>
                </div>
              </div>
              <button onClick={() => setShowEmailModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">To (Client Email) *</label>
                <input
                  type="email"
                  value={emailData.to}
                  onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Message</label>
                <textarea
                  rows={4}
                  value={emailData.message}
                  onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={sendInvoiceEmail}
                disabled={!emailData.to.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Dispatch Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ──────────────────────────────────── */}
      {showDeleteModal && deletingInvoice && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            try {
              const res = await fetch(`/api/invoices/${deletingInvoice.id}`, { method: 'DELETE' });
              if (!res.ok) throw new Error('Failed to delete invoice');
              await fetchInvoices();
              showToast(`${deletingInvoice.id} deleted.`);
              setShowDeleteModal(false);
              setDeletingInvoice(null);
            } catch (err) {
              showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
            }
          }}
          title="Delete Invoice Record"
          itemName={deletingInvoice.id}
          itemDetails={`Client: ${deletingInvoice.client} · Amount: $${deletingInvoice.amount}`}
        />
      )}
    </div>
  );
}
