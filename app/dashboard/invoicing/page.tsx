"use client";

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
  Plus, Search, Filter, Download, Eye, Edit, Send, Trash2,
  DollarSign, PoundSterling, Clock, CheckCircle, AlertCircle, MoreVertical, X,
  Calendar, Mail, FileText, Banknote, Ban, RotateCcw,
  ChevronDown, Loader2, TableProperties, ArrowUpRight,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';
import TourProvider from '@/components/tours/TourProvider';
import { ModuleGuideBanner } from '@/components/tours/ModuleGuideBanner';
import { invoicingTourSteps } from './tour-steps';

/* ── Interfaces ──────────────────────────────────────────────────── */
// vatRate is optional so older invoices created before this field existed
// still parse — treat a missing vatRate as the 20% standard rate (the same
// assumption the app already made everywhere before this field existed).
interface InvoiceLineItem { description: string; quantity: number; rate: number; vatRate?: number }
const DEFAULT_VAT_RATE = 20;

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD ($) — United States Dollar' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) — British Pound' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) — Euro' },
  { code: 'NGN', symbol: '₦', label: 'NGN (₦) — Nigerian Naira' },
  { code: 'GHS', symbol: 'GH₵', label: 'GHS (GH₵) — Ghanaian Cedi' },
  { code: 'KES', symbol: 'KSh', label: 'KES (KSh) — Kenyan Shilling' },
  { code: 'ZAR', symbol: 'R', label: 'ZAR (R) — South African Rand' },
  { code: 'CAD', symbol: 'C$', label: 'CAD (C$) — Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$) — Australian Dollar' },
];

export const getCurrencySymbol = (code?: string): string => {
  if (!code) return '$';
  const found = SUPPORTED_CURRENCIES.find(c => c.code.toUpperCase() === code.toUpperCase());
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

/* ── Constants ───────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  paid:      { label: 'Paid',      bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', ring: 'ring-emerald-200' },
  sent:      { label: 'Sent',      bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-500',    ring: 'ring-blue-200'    },
  overdue:   { label: 'Overdue',   bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500',     ring: 'ring-red-200'     },
  draft:     { label: 'Draft',     bg: 'bg-gray-100',    text: 'text-gray-600',    dot: 'bg-gray-400',    ring: 'ring-gray-200'    },
  cancelled: { label: 'Cancelled', bg: 'bg-gray-100',    text: 'text-gray-500',    dot: 'bg-gray-300',    ring: 'ring-gray-200'    },
} as const;

const getStatus = (s: string) => STATUS_CONFIG[s as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft;

const inputCls = "w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

const avatarGrad = (name: string) => {
  const g = ['from-blue-500 to-indigo-500','from-violet-500 to-purple-500','from-emerald-500 to-teal-500','from-orange-500 to-amber-500','from-cyan-500 to-blue-500'];
  return g[name.charCodeAt(0) % g.length];
};

/* ── Modal shell ─────────────────────────────────────────────────── */
const ModalShell = ({ children, maxW = 'sm:max-w-2xl', onClose }: {
  children: React.ReactNode;
  maxW?: string;
  onClose?: () => void;
}) => (
  <div
    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 pb-6 sm:p-6"
    onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
  >
    <div className={`bg-white rounded-2xl w-full ${maxW} max-h-[85vh] flex flex-col shadow-2xl overflow-y-auto sm:overflow-hidden`}>
      {children}
    </div>
  </div>
);

const ModalHandle = () => (
  <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
    <div className="w-10 h-1 rounded-full bg-gray-200" />
  </div>
);

const ModalFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="px-4 sm:px-6 pt-3.5 pb-8 sm:pb-5 border-t border-gray-100 bg-white flex flex-row gap-2.5 shrink-0 mb-1.5 sm:mb-0">
    {children}
  </div>
);

const CancelBtn = ({ onClick, label = 'Cancel' }: { onClick: () => void; label?: string }) => (
  <button
    onClick={onClick}
    className="flex-1 py-2 px-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer text-center whitespace-nowrap"
  >
    {label}
  </button>
);

/* ══════════════════════════════════════════════════════════════════ */
export default function InvoicingPage() {
  const { data: session } = useSession();
  const businessName = (session?.user as any)?.businessName || 'Okleevo Workspace';

  /* ── PDF / export helpers ──────────────────────────────────────── */
  const downloadAsPDF = (invoice: Invoice) => {
    const sym = getCurrencySymbol(invoice.currency);
    const doc = new jsPDF();
    doc.setFillColor(59, 130, 246); doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(24); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
    doc.text('INVOICE', 105, 20, { align: 'center' });
    doc.setFontSize(14); doc.text(invoice.id, 105, 30, { align: 'center' });
    doc.setTextColor(0, 0, 0); doc.setFillColor(249, 250, 251);
    doc.roundedRect(20, 50, 80, 25, 3, 3, 'F');
    doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 25, 58); doc.setFont('helvetica', 'normal');
    doc.text(invoice.client, 25, 65); doc.setFontSize(9); doc.text(invoice.clientEmail, 25, 71);
    doc.setFillColor(249, 250, 251); doc.roundedRect(110, 50, 80, 25, 3, 3, 'F');
    doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.text('Invoice Details:', 115, 58); doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.text(`Issue Date: ${invoice.date}`, 115, 65);
    doc.text(`Due Date: ${invoice.dueDate}`, 115, 71);
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.setFillColor(59, 130, 246); doc.setTextColor(255, 255, 255);
    doc.rect(20, 85, 170, 8, 'F');
    doc.text('Description', 25, 90); doc.text('Qty', 125, 90);
    doc.text(`Rate (${sym})`, 145, 90); doc.text(`Amount (${sym})`, 170, 90);
    doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'normal');
    let yPos = 100;
    invoice.items.forEach((item, i) => {
      if (i % 2 === 0) { doc.setFillColor(249, 250, 251); doc.rect(20, yPos - 5, 170, 8, 'F'); }
      doc.text(item.description, 25, yPos); doc.text(item.quantity.toString(), 125, yPos);
      doc.text(`${sym}${item.rate}`, 145, yPos); doc.text(`${sym}${(item.quantity * item.rate).toLocaleString()}`, 170, yPos);
      yPos += 8;
    });
    yPos += 10;
    doc.setFillColor(59, 130, 246); doc.rect(20, yPos - 5, 170, 12, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(255, 255, 255);
    doc.text('TOTAL:', 145, yPos + 3); doc.text(`${sym}${invoice.amount.toLocaleString()} ${invoice.currency || 'USD'}`, 170, yPos + 3);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(128, 128, 128);
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });
    doc.save(`${invoice.id}.pdf`);
  };

  const downloadAsExcel = (invoice: Invoice) => {
    const sym = getCurrencySymbol(invoice.currency);
    const headers = ['Description', 'Quantity', 'Rate', 'Amount'];
    const rows = invoice.items.map(item => [item.description, item.quantity, item.rate, item.quantity * item.rate]);
    let csv = `Invoice: ${invoice.id}\nClient: ${invoice.client}\nEmail: ${invoice.clientEmail}\nCurrency: ${invoice.currency || 'USD'}\nIssue: ${invoice.date}\nDue: ${invoice.dueDate}\nStatus: ${invoice.status}\n\n`;
    csv += headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');
    csv += `\n\nTotal,,,${sym}${invoice.amount}`;
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${invoice.id}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAllAsPDF = (list: Invoice[]) => {
    const doc = new jsPDF();
    doc.setFillColor(59, 130, 246); doc.rect(0, 0, 210, 35, 'F');
    doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
    doc.text('INVOICE REPORT', 105, 15, { align: 'center' });
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()} · Total: ${list.length}`, 105, 26, { align: 'center' });
    doc.setTextColor(0, 0, 0); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.setFillColor(239, 246, 255); doc.rect(15, 40, 180, 14, 'F');
    const tot = list.reduce((s, i) => s + i.amount, 0);
    const paid = list.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
    const over = list.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
    doc.setTextColor(0, 0, 0); doc.text(`Total: $${tot.toLocaleString()}`, 20, 49);
    doc.setTextColor(34, 197, 94); doc.text(`Paid: $${paid.toLocaleString()}`, 80, 49);
    doc.setTextColor(239, 68, 68); doc.text(`Overdue: $${over.toLocaleString()}`, 140, 49);
    doc.setTextColor(255, 255, 255); doc.setFillColor(59, 130, 246); doc.rect(15, 60, 180, 8, 'F');
    doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    ['Invoice', 'Client', 'Amount', 'Status', 'Issue', 'Due'].forEach((h, i) => {
      doc.text(h, [18, 45, 105, 135, 158, 178][i], 65);
    });
    doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 0);
    const sc: Record<string, [number, number, number]> = { paid: [34, 197, 94], sent: [59, 130, 246], overdue: [239, 68, 68], draft: [107, 114, 128], cancelled: [107, 114, 128] };
    let y = 75;
    list.forEach((inv, idx) => {
      if (y > 270) { doc.addPage(); y = 20; }
      if (idx % 2 === 0) { doc.setFillColor(249, 250, 251); doc.rect(15, y - 5, 180, 8, 'F'); }
      doc.setTextColor(0, 0, 0);
      const sym = getCurrencySymbol(inv.currency);
      doc.text(inv.id.slice(0, 12), 18, y); doc.text(inv.client.slice(0, 22), 45, y);
      doc.text(`${sym}${inv.amount.toLocaleString()}`, 105, y);
      const c = sc[inv.status] || [107, 114, 128];
      doc.setTextColor(c[0], c[1], c[2]); doc.text(inv.status.toUpperCase(), 135, y);
      doc.setTextColor(0, 0, 0); doc.text(inv.date, 158, y); doc.text(inv.dueDate, 178, y);
      y += 8;
    });
    doc.save(`invoices-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  /* ── State ─────────────────────────────────────────────────────── */
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [emailInvoice, setEmailInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [emailData, setEmailData] = useState({ to: '', subject: '', message: '' });
  const [downloadMenuOpen, setDownloadMenuOpen] = useState<string | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top?: number; bottom?: number; right: number } | null>(null);
  const [newInvoice, setNewInvoice] = useState({
    clientType: 'business' as 'business' | 'individual',
    client: '', clientEmail: '',
    currency: 'USD',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{ description: '', quantity: 1, rate: 0, vatRate: DEFAULT_VAT_RATE }],
    projectId: '',
  });
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [creatingProject, setCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [savingInvoice, setSavingInvoice] = useState(false);
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
  // Same status an invoice would naturally have if it had never been paid/cancelled —
  // matches how the overdue cron re-derives status from dueDate.
  const reopenedStatus = (invoice: Invoice): 'SENT' | 'OVERDUE' =>
    new Date(invoice.dueDate) < new Date() ? 'OVERDUE' : 'SENT';
  const [savingNewProject, setSavingNewProject] = useState(false);

  const fetchProjects = () => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]));
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
        setProjects(prev => [...prev, { id: created.id, name: created.name }]);
        setNewInvoice(prev => ({ ...prev, projectId: created.id }));
        setNewProjectName('');
        setCreatingProject(false);
      }
    } finally {
      setSavingNewProject(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  /* ── Data ──────────────────────────────────────────────────────── */
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/invoices');
      const data = await res.json();
      if (data.data) {
        setInvoices(data.data.map((inv: InvoiceResponse) => {
          // Prisma's InvoiceStatus enum spells it "CANCELED" (US); the rest of
          // this page uses "cancelled" (UK) throughout — normalize here.
          const rawStatus = inv.status.toLowerCase();
          return {
            id: inv.number || inv.id,
            client: inv.clientName,
            clientEmail: inv.clientEmail || '',
            amount: inv.amount,
            currency: inv.currency || 'USD',
            status: (rawStatus === 'canceled' ? 'cancelled' : rawStatus) as Invoice['status'],
            date: new Date(inv.createdAt).toISOString().split('T')[0],
            dueDate: new Date(inv.dueDate).toISOString().split('T')[0],
            items: Array.isArray(inv.items) ? inv.items : [],
          };
        }));
      }
    } catch {
      showToast('Failed to load invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const stats = useMemo(() => ({
    total:   invoices.reduce((s, i) => s + i.amount, 0),
    paid:    invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0),
    pending: invoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.amount, 0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0),
  }), [invoices]);

  const filteredInvoices = invoices.filter(inv => {
    const matchSearch = inv.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        inv.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const newInvoiceTotal = newInvoice.items.reduce((s, i) => s + i.quantity * i.rate, 0);
  const newInvoiceVAT = newInvoice.items.reduce((s, i) => s + i.quantity * i.rate * ((i.vatRate ?? DEFAULT_VAT_RATE) / 100), 0);

  /* ── Handlers ──────────────────────────────────────────────────── */
  const closeNewModal = () => {
    setShowNewInvoiceModal(false);
    setEditingInvoiceId(null);
    setNewInvoice({ clientType: 'business', client: '', clientEmail: '', currency: 'USD', date: new Date().toISOString().split('T')[0], dueDate: '', items: [{ description: '', quantity: 1, rate: 0, vatRate: DEFAULT_VAT_RATE }], projectId: '' });
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice); setShowInvoiceModal(true); setActiveMenu(null);
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
      items: invoice.items.length > 0
        ? invoice.items.map(i => ({ ...i, vatRate: i.vatRate ?? DEFAULT_VAT_RATE }))
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
  };

  const sendInvoiceEmail = async () => {
    if (!emailInvoice) return;
    try {
      const res = await fetch(`/api/invoices/${emailInvoice.id}/send-email`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: emailData.to, subject: emailData.subject, message: emailData.message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send email');
      await fetchInvoices();
      showToast(`Invoice sent to ${emailData.to}!`);
      setShowEmailModal(false); setEmailInvoice(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to send invoice', 'error');
    }
  };

  const handleSaveInvoice = async () => {
    setSavingInvoice(true);
    try {
      const payload = {
        clientName: newInvoice.client,
        clientEmail: newInvoice.clientEmail,
        amount: newInvoiceTotal,
        currency: newInvoice.currency || 'USD',
        items: newInvoice.items,
        dueDate: newInvoice.dueDate,
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
      closeNewModal();
      showToast(editingInvoiceId ? 'Invoice updated successfully!' : 'Invoice created successfully!');
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
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID', paidAt: paymentDate }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to mark invoice as paid');
      await fetchInvoices();
      showToast(data.warning || `${markPaidTarget.id} marked as paid.`, data.warning ? 'error' : 'success');
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
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELED' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to cancel invoice');
      await fetchInvoices();
      showToast(`${cancelTarget.id} has been cancelled.`);
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
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: reopenedStatus(reopenTarget) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to reopen invoice');
      await fetchInvoices();
      showToast(data.warning || `${reopenTarget.id} has been reopened.`, data.warning ? 'error' : 'success');
      setReopenTarget(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to reopen invoice', 'error');
    } finally {
      setReopening(false);
    }
  };

  const handleExportAllCSV = () => {
    const headers = ['Invoice ID', 'Client', 'Email', 'Amount', 'Status', 'Issue Date', 'Due Date'];
    const rows = invoices.map(inv => [inv.id, inv.client, inv.clientEmail, inv.amount, inv.status, inv.date, inv.dueDate]);
    let csv = `Invoice Report\nGenerated: ${new Date().toLocaleDateString()}\nTotal: $${stats.total.toLocaleString()}\n\n`;
    csv += headers.join(',') + '\n' + rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
    showToast('Exported as CSV!');
  };

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8 font-sans text-gray-900">
      <TourProvider moduleId="invoicing" steps={invoicingTourSteps} />

      {/* ── STICKY HEADER ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0 flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="min-w-0 shrink-0">
                <h1 className="text-sm sm:text-lg font-extrabold text-gray-900 leading-tight whitespace-nowrap">Invoice Engine</h1>
                <p className="text-[11px] font-bold text-gray-400 hidden sm:block">Client pricing, itemized invoice generation, PDF exports, and direct email dispatch</p>
              </div>
              <ModuleGuideBanner
                moduleId="invoicing"
                moduleName="Invoice Engine"
                summary="Price SME services, generate itemized invoices, and dispatch PDF invoices with direct payment links directly to client email."
                tips={[
                  "1-Click 'Send Email' dispatches formatted HTML invoices with PDF/CSV attachments",
                  "Real-time payment tracking ($ USD, Stripe & Paystack links)",
                  "Automatic sync with accounting journal and team activity stream"
                ]}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Export dropdown */}
            <div id="tour-invoicing-export" className="relative">
              <button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="h-9 w-9 sm:w-auto sm:px-3 flex items-center justify-center sm:gap-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-gray-600" />
                <span className="hidden sm:inline text-sm font-medium text-gray-700">Export</span>
                <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
              </button>
              {exportMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setExportMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 overflow-hidden">
                    <button
                      onClick={() => { exportAllAsPDF(invoices); setExportMenuOpen(false); showToast('Exported as PDF!'); }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                    >
                      <FileText className="w-4 h-4 text-red-500" />
                      <span className="font-medium text-gray-700">Export PDF</span>
                    </button>
                    <button
                      onClick={handleExportAllCSV}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                    >
                      <TableProperties className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-700">Export CSV</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              id="tour-invoicing-new-button"
              onClick={() => setShowNewInvoiceModal(true)}
              className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Invoice</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 space-y-4 sm:space-y-5">

        {/* ── STATS ─────────────────────────────────────────────────── */}
        <div id="tour-invoicing-stats" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[
            { label: 'Total Revenue', value: stats.total,   sub: `${invoices.length} invoices`,                                              Icon: PoundSterling, iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md shadow-indigo-100',    valCls: 'text-slate-900'     },
            { label: 'Paid',          value: stats.paid,    sub: `${invoices.filter(i => i.status === 'paid').length} paid`,                  Icon: CheckCircle, iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-100', valCls: 'text-emerald-600'  },
            { label: 'Pending',       value: stats.pending, sub: `${invoices.filter(i => i.status === 'sent').length} awaiting`,              Icon: Clock,       iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-md shadow-amber-100',   valCls: 'text-amber-600'    },
            { label: 'Overdue',       value: stats.overdue, sub: `${invoices.filter(i => i.status === 'overdue').length} need attention`,     Icon: AlertCircle, iconBg: 'bg-gradient-to-br from-rose-500 to-red-600 shadow-md shadow-rose-100',     valCls: 'text-rose-600'      },
          ].map(({ label, value, sub, Icon, iconBg, valCls }) => (
            <div key={label} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
              </div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">{label}</p>
              <p className={`text-2xl sm:text-3xl font-extrabold ${valCls} mb-1 leading-tight tracking-tight`}>${value.toLocaleString()}</p>
              <p className="text-[11px] text-gray-400 font-medium">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── SEARCH + FILTER ───────────────────────────────────────── */}
        <div id="tour-invoicing-search" className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client or invoice ID…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="h-10 px-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline capitalize">{filterStatus === 'all' ? 'Filter' : filterStatus}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            {showFilterMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFilterMenu(false)} />
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 overflow-hidden">
                  {['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled'].map(s => (
                    <button
                      key={s}
                      onClick={() => { setFilterStatus(s); setShowFilterMenu(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 cursor-pointer transition-colors ${filterStatus === s ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      {filterStatus === s && <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
                      <span className="capitalize">{s === 'all' ? 'All Invoices' : s}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── STATUS CHIPS ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mt-1 pb-0.5">
          {['all', 'paid', 'sent', 'overdue', 'draft', 'cancelled'].map(s => {
            const active = filterStatus === s;
            const cfg = s !== 'all' ? getStatus(s) : null;
            const count = s === 'all' ? invoices.length : invoices.filter(i => i.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  active
                    ? cfg ? `${cfg.bg} ${cfg.text}` : 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {cfg && <span className={`w-1.5 h-1.5 rounded-full ${active ? cfg.dot : 'bg-gray-300'}`} />}
                <span className="capitalize">{s === 'all' ? 'All' : s}</span>
                <span className={`${active ? 'opacity-60' : 'text-gray-400'}`}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* ── INVOICE LIST ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-400">Loading invoices…</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-4">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-200" />
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">No invoices found</p>
                <p className="text-sm text-gray-400">Adjust your search or filter, or create a new invoice</p>
              </div>
              <button
                onClick={() => setShowNewInvoiceModal(true)}
                className="mt-1 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> New Invoice
              </button>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Invoice', 'Client', 'Amount', 'Status', 'Issue Date', 'Due Date', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredInvoices.map(invoice => {
                      const sc = getStatus(invoice.status);
                      return (
                        <tr key={invoice.id} className="hover:bg-blue-50/20 transition-colors group">
                          <td className="px-5 py-3.5">
                            <span className="font-semibold text-sm text-gray-800 group-hover:text-blue-600 transition-colors">{invoice.id}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg bg-linear-to-br ${avatarGrad(invoice.client)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                                {invoice.client.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">{invoice.client}</p>
                                <p className="text-xs text-gray-400 truncate">{invoice.clientEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-bold text-gray-900">{getCurrencySymbol(invoice.currency)}{invoice.amount.toLocaleString()}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${sc.bg} ${sc.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-gray-500">{invoice.date}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-500">{invoice.dueDate}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-0.5">
                              <button onClick={() => handleViewInvoice(invoice)} title="View"
                                className="w-8 h-8 flex items-center justify-center hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                                <Eye className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                              </button>
                              <div className="relative">
                                <button onClick={(e) => {
                                  if (downloadMenuOpen === invoice.id) { setDownloadMenuOpen(null); setMenuPosition(null); }
                                  else { const r = e.currentTarget.getBoundingClientRect(); const right = window.innerWidth - r.right; const pos = window.innerHeight - r.bottom > 120 ? { top: r.bottom + 4, right } : { bottom: window.innerHeight - r.top + 4, right }; setMenuPosition(pos); setDownloadMenuOpen(invoice.id); }
                                }} title="Download"
                                  className="w-8 h-8 flex items-center justify-center hover:bg-green-50 rounded-lg transition-colors cursor-pointer">
                                  <Download className="w-4 h-4 text-gray-400 hover:text-green-600" />
                                </button>
                                {downloadMenuOpen === invoice.id && menuPosition && (
                                  <>
                                    <div className="fixed inset-0 z-40" onClick={() => { setDownloadMenuOpen(null); setMenuPosition(null); }} />
                                    <div className="fixed w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50" style={{ top: menuPosition.top, bottom: menuPosition.bottom, right: menuPosition.right }}>
                                      <button onClick={() => { downloadAsPDF(invoice); setDownloadMenuOpen(null); setMenuPosition(null); }}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 cursor-pointer">
                                        <FileText className="w-4 h-4 text-red-500" /><span className="font-medium">PDF</span>
                                      </button>
                                      <button onClick={() => { downloadAsExcel(invoice); setDownloadMenuOpen(null); setMenuPosition(null); }}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 cursor-pointer">
                                        <FileText className="w-4 h-4 text-green-600" /><span className="font-medium">CSV / Excel</span>
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                              <button onClick={() => handleSendEmail(invoice)} title="Send email"
                                className="w-8 h-8 flex items-center justify-center hover:bg-purple-50 rounded-lg transition-colors cursor-pointer">
                                <Send className="w-4 h-4 text-gray-400 hover:text-purple-600" />
                              </button>
                              <div className="relative">
                                <button onClick={(e) => {
                                  if (activeMenu === invoice.id) { setActiveMenu(null); setMenuPosition(null); }
                                  else { const r = e.currentTarget.getBoundingClientRect(); const right = window.innerWidth - r.right; const pos = window.innerHeight - r.bottom > 180 ? { top: r.bottom + 4, right } : { bottom: window.innerHeight - r.top + 4, right }; setMenuPosition(pos); setActiveMenu(invoice.id); }
                                }}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                                  <MoreVertical className="w-4 h-4 text-gray-400" />
                                </button>
                                {activeMenu === invoice.id && menuPosition && (
                                  <>
                                    <div className="fixed inset-0 z-40" onClick={() => { setActiveMenu(null); setMenuPosition(null); }} />
                                    <div className="fixed w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50" style={{ top: menuPosition.top, bottom: menuPosition.bottom, right: menuPosition.right }}>
                                      {canModify(invoice) && (
                                        <button onClick={() => handleEditInvoice(invoice)}
                                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex items-center gap-2 cursor-pointer">
                                          <Edit className="w-4 h-4 text-blue-600" /><span className="font-medium">Edit</span>
                                        </button>
                                      )}
                                      <button onClick={() => { handleSendEmail(invoice); setActiveMenu(null); setMenuPosition(null); }}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-purple-50 flex items-center gap-2 cursor-pointer">
                                        <Mail className="w-4 h-4 text-purple-600" /><span className="font-medium">Email</span>
                                      </button>
                                      {canModify(invoice) && (
                                        <button onClick={() => { setPaymentDate(new Date().toISOString().split('T')[0]); setMarkPaidTarget(invoice); setActiveMenu(null); setMenuPosition(null); }}
                                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-emerald-50 flex items-center gap-2 cursor-pointer">
                                          <Banknote className="w-4 h-4 text-emerald-600" /><span className="font-medium">Mark as Paid</span>
                                        </button>
                                      )}
                                      {canModify(invoice) && (
                                        <button onClick={() => { setCancelTarget(invoice); setActiveMenu(null); setMenuPosition(null); }}
                                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-amber-50 flex items-center gap-2 cursor-pointer">
                                          <Ban className="w-4 h-4 text-amber-600" /><span className="font-medium">Cancel Invoice</span>
                                        </button>
                                      )}
                                      {canReopen(invoice) && (
                                        <button onClick={() => { setReopenTarget(invoice); setActiveMenu(null); setMenuPosition(null); }}
                                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-indigo-50 flex items-center gap-2 cursor-pointer">
                                          <RotateCcw className="w-4 h-4 text-indigo-600" /><span className="font-medium">Reopen Invoice</span>
                                        </button>
                                      )}
                                      <div className="border-t border-gray-100 my-1" />
                                      <button onClick={() => { setDeletingInvoice(invoice); setShowDeleteModal(true); setActiveMenu(null); setMenuPosition(null); }}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 cursor-pointer">
                                        <Trash2 className="w-4 h-4" /><span className="font-medium">Delete</span>
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-gray-50">
                {filteredInvoices.map(invoice => {
                  const sc = getStatus(invoice.status);
                  return (
                    <div key={invoice.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${avatarGrad(invoice.client)} flex items-center justify-center text-white font-bold shrink-0`}>
                            {invoice.client.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{invoice.client}</p>
                            <p className="text-xs text-gray-400">{invoice.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${sc.bg} ${sc.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {sc.label}
                          </span>
                          <div className="relative">
                            <button
                              onClick={() => setActiveMenu(activeMenu === invoice.id ? null : invoice.id)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-500" />
                            </button>
                            {activeMenu === invoice.id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                                <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                                  <button onClick={() => { handleViewInvoice(invoice); setActiveMenu(null); }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex items-center gap-2 cursor-pointer">
                                    <Eye className="w-4 h-4 text-blue-600" /><span className="font-medium">View</span>
                                  </button>
                                  {canModify(invoice) && (
                                    <button onClick={() => handleEditInvoice(invoice)}
                                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex items-center gap-2 cursor-pointer">
                                      <Edit className="w-4 h-4 text-blue-600" /><span className="font-medium">Edit</span>
                                    </button>
                                  )}
                                  <button onClick={() => { downloadAsPDF(invoice); setActiveMenu(null); }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 cursor-pointer">
                                    <Download className="w-4 h-4 text-red-500" /><span className="font-medium">Download PDF</span>
                                  </button>
                                  <button onClick={() => { handleSendEmail(invoice); setActiveMenu(null); }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-purple-50 flex items-center gap-2 cursor-pointer">
                                    <Send className="w-4 h-4 text-purple-600" /><span className="font-medium">Send Email</span>
                                  </button>
                                  {canModify(invoice) && (
                                    <button onClick={() => { setPaymentDate(new Date().toISOString().split('T')[0]); setMarkPaidTarget(invoice); setActiveMenu(null); }}
                                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-emerald-50 flex items-center gap-2 cursor-pointer">
                                      <Banknote className="w-4 h-4 text-emerald-600" /><span className="font-medium">Mark as Paid</span>
                                    </button>
                                  )}
                                  {canModify(invoice) && (
                                    <button onClick={() => { setCancelTarget(invoice); setActiveMenu(null); }}
                                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-amber-50 flex items-center gap-2 cursor-pointer">
                                      <Ban className="w-4 h-4 text-amber-600" /><span className="font-medium">Cancel Invoice</span>
                                    </button>
                                  )}
                                  {canReopen(invoice) && (
                                    <button onClick={() => { setReopenTarget(invoice); setActiveMenu(null); }}
                                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-indigo-50 flex items-center gap-2 cursor-pointer">
                                      <RotateCcw className="w-4 h-4 text-indigo-600" /><span className="font-medium">Reopen Invoice</span>
                                    </button>
                                  )}
                                  <div className="border-t border-gray-100 my-1" />
                                  <button onClick={() => { setDeletingInvoice(invoice); setShowDeleteModal(true); setActiveMenu(null); }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 cursor-pointer">
                                    <Trash2 className="w-4 h-4" /><span className="font-medium">Delete</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Bottom row */}
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-gray-900">{getCurrencySymbol(invoice.currency)}{invoice.amount.toLocaleString()}</span>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{invoice.date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due {invoice.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          NEW INVOICE MODAL
      ══════════════════════════════════════════════════════════════ */}
      {showNewInvoiceModal && (
        <ModalShell onClose={closeNewModal}>
          <ModalHandle />
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-gray-900 text-base">{editingInvoiceId ? `Edit Invoice ${editingInvoiceId}` : 'New Invoice'}</h2>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-wider">{editingInvoiceId ? 'Editing' : 'Drafting'}</span>
                </div>
                <p className="text-xs text-gray-400">Fill in client details and line items below</p>
              </div>
            </div>
            <button onClick={closeNewModal} className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-visible sm:overflow-y-auto sm:flex-1 p-4 sm:p-6 space-y-4 bg-gray-50/40">
            {/* Client details */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 space-y-4 shadow-2xs">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Client &amp; Date Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Client Name *</label>
                  <input type="text" value={newInvoice.client}
                    onChange={e => setNewInvoice({ ...newInvoice, client: e.target.value })}
                    className={inputCls} placeholder="e.g. Acme Corp or John Doe" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Client Email</label>
                  <input type="email" value={newInvoice.clientEmail}
                    onChange={e => setNewInvoice({ ...newInvoice, clientEmail: e.target.value })}
                    className={inputCls} placeholder="client@example.com" />
                </div>
                <div className="col-span-2 sm:col-span-2">
                  <label className={labelCls}>Issue Date</label>
                  <input type="date" value={newInvoice.date}
                    onChange={e => setNewInvoice({ ...newInvoice, date: e.target.value })}
                    className={inputCls} />
                </div>
                <div className="col-span-2 sm:col-span-2">
                  <label className={labelCls}>Due Date</label>
                  <input type="date" value={newInvoice.dueDate}
                    onChange={e => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                    className={inputCls} />
                </div>
                <div className="col-span-2 sm:col-span-4">
                  <label className={labelCls}>Billing Currency (Location-Based Pricing)</label>
                  <select
                    value={newInvoice.currency}
                    onChange={e => setNewInvoice({ ...newInvoice, currency: e.target.value })}
                    className={`${inputCls} appearance-none cursor-pointer font-bold text-slate-800`}
                  >
                    {SUPPORTED_CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-4">
                  <label className={labelCls}>Associated Project</label>
                  {creatingProject ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={newProjectName}
                        onChange={e => setNewProjectName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateProject(); } if (e.key === 'Escape') { setCreatingProject(false); setNewProjectName(''); } }}
                        placeholder="New project name"
                        className={inputCls}
                      />
                      <button type="button" onClick={handleCreateProject} disabled={savingNewProject || !newProjectName.trim()}
                        className="shrink-0 h-[38px] px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold cursor-pointer transition-colors flex items-center justify-center">
                        {savingNewProject ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                      </button>
                      <button type="button" onClick={() => { setCreatingProject(false); setNewProjectName(''); }}
                        className="shrink-0 h-[38px] w-[38px] rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 cursor-pointer transition-colors flex items-center justify-center">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <select value={newInvoice.projectId}
                      onChange={e => {
                        if (e.target.value === '__new__') { setCreatingProject(true); return; }
                        setNewInvoice({ ...newInvoice, projectId: e.target.value });
                      }}
                      className={`${inputCls} appearance-none cursor-pointer`}>
                      <option value="">No project (General Invoice)</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      <option value="__new__">+ Create new project…</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Line Items</p>
                <button
                  onClick={() => setNewInvoice({ ...newInvoice, items: [...newInvoice.items, { description: '', quantity: 1, rate: 0, vatRate: DEFAULT_VAT_RATE }] })}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </button>
              </div>

              <div className="space-y-3">
                {newInvoice.items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-2.5 sm:space-y-0 sm:flex sm:items-end sm:gap-3">
                    {/* Description */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={e => { const items = [...newInvoice.items]; items[idx].description = e.target.value; setNewInvoice({ ...newInvoice, items }); }}
                        className={inputCls}
                        placeholder="Service or product description"
                      />
                    </div>
                    {/* Qty / Rate / VAT / Total / Remove */}
                    <div className="grid grid-cols-2 sm:grid-cols-none gap-2 items-end sm:flex sm:items-end sm:gap-3 sm:flex-initial">
                      <div className="sm:w-16">
                        <label className="block text-xs font-medium text-gray-400 mb-1">Qty</label>
                        <input
                          type="number" min="1"
                          value={item.quantity}
                          onChange={e => { const items = [...newInvoice.items]; items[idx].quantity = parseInt(e.target.value) || 0; setNewInvoice({ ...newInvoice, items }); }}
                          className={inputCls}
                        />
                      </div>
                      <div className="sm:w-24">
                        <label className="block text-xs font-medium text-gray-400 mb-1">Rate ({getCurrencySymbol(newInvoice.currency)})</label>
                        <input
                          type="number" min="0" step="0.01"
                          value={item.rate}
                          onChange={e => { const items = [...newInvoice.items]; items[idx].rate = parseFloat(e.target.value) || 0; setNewInvoice({ ...newInvoice, items }); }}
                          className={inputCls}
                        />
                      </div>
                      <div className="sm:w-24">
                        <label className="block text-xs font-medium text-gray-400 mb-1">VAT</label>
                        <select
                          value={item.vatRate ?? DEFAULT_VAT_RATE}
                          onChange={e => { const items = [...newInvoice.items]; items[idx].vatRate = parseFloat(e.target.value); setNewInvoice({ ...newInvoice, items }); }}
                          className={`${inputCls} appearance-none cursor-pointer`}
                        >
                          <option value={20}>20%</option>
                          <option value={5}>5%</option>
                          <option value={0}>0%</option>
                        </select>
                      </div>
                      <div className="flex items-end gap-2 col-span-2 sm:col-auto sm:w-36">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-400 mb-1">Subtotal</label>
                          <div className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-800 h-[38px] flex items-center">
                            {getCurrencySymbol(newInvoice.currency)}{(item.quantity * item.rate).toFixed(2)}
                          </div>
                        </div>
                        {newInvoice.items.length > 1 && (
                          <button
                            onClick={() => setNewInvoice({ ...newInvoice, items: newInvoice.items.filter((_, i) => i !== idx) })}
                            className="w-9 h-9 flex items-center justify-center bg-rose-50 hover:bg-rose-100 rounded-xl text-rose-500 transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 px-4 py-3 bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-indigo-50/80 border border-indigo-100 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-xs text-indigo-700/80">
                  <span>VAT</span>
                  <span className="font-semibold">{getCurrencySymbol(newInvoice.currency)}{newInvoiceVAT.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Invoice Total ({newInvoice.currency || 'USD'})</span>
                  <span className="text-2xl font-black text-indigo-600 tracking-tight">{getCurrencySymbol(newInvoice.currency)}{newInvoiceTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer — Cancel always visible on mobile */}
          <ModalFooter>
            <CancelBtn onClick={closeNewModal} />
            <button
              onClick={handleSaveInvoice}
              disabled={savingInvoice || !newInvoice.client.trim() || newInvoiceTotal <= 0}
              className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {savingInvoice ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              <span>{editingInvoiceId ? 'Update Invoice' : 'Create Invoice'}</span>
            </button>
          </ModalFooter>
        </ModalShell>
      )}

      {/* ══════════════════════════════════════════════════════════════
          VIEW INVOICE MODAL
      ══════════════════════════════════════════════════════════════ */}
      {showInvoiceModal && selectedInvoice && (
        <ModalShell onClose={() => { setShowInvoiceModal(false); setSelectedInvoice(null); }}>
          <ModalHandle />
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-gray-900 text-base truncate">{selectedInvoice.id}</h2>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${getStatus(selectedInvoice.status).bg} ${getStatus(selectedInvoice.status).text}`}>
                  <span className={`w-1 h-1 rounded-full ${getStatus(selectedInvoice.status).dot}`} />
                  {getStatus(selectedInvoice.status).label}
                </span>
              </div>
            </div>
            <button
              onClick={() => { setShowInvoiceModal(false); setSelectedInvoice(null); }}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-visible sm:overflow-y-auto sm:flex-1 p-4 pb-12 sm:p-6 space-y-4 bg-gray-50/40">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Bill To</p>
                <p className="font-semibold text-gray-900">{selectedInvoice.client}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                  <Mail className="w-3 h-3 shrink-0" />{selectedInvoice.clientEmail}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Invoice Details</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Issue Date</span>
                    <span className="font-semibold text-gray-800">{selectedInvoice.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Due Date</span>
                    <span className="font-semibold text-gray-800">{selectedInvoice.dueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Currency</span>
                    <span className="font-bold text-blue-600">{selectedInvoice.currency || 'USD'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Line Items</p>
              </div>
              {/* Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Description', 'Qty', `Rate (${getCurrencySymbol(selectedInvoice.currency)})`, 'VAT', `Amount (${getCurrencySymbol(selectedInvoice.currency)})`].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selectedInvoice.items.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm text-gray-800">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{getCurrencySymbol(selectedInvoice.currency)}{item.rate}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.vatRate ?? DEFAULT_VAT_RATE}%</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{getCurrencySymbol(selectedInvoice.currency)}{(item.quantity * item.rate).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile */}
              <div className="sm:hidden divide-y divide-gray-50">
                {selectedInvoice.items.map((item, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.quantity} × {getCurrencySymbol(selectedInvoice.currency)}{item.rate} · VAT {item.vatRate ?? DEFAULT_VAT_RATE}%</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{getCurrencySymbol(selectedInvoice.currency)}{(item.quantity * item.rate).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              {/* Total */}
              <div className="px-4 py-3 bg-blue-50 border-t border-blue-100 space-y-1">
                <div className="flex items-center justify-between text-xs text-blue-700">
                  <span>VAT</span>
                  <span className="font-semibold">{getCurrencySymbol(selectedInvoice.currency)}{selectedInvoice.items.reduce((s, i) => s + i.quantity * i.rate * ((i.vatRate ?? DEFAULT_VAT_RATE) / 100), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Total (excl. VAT)</span>
                  <span className="text-2xl font-bold text-blue-600">{getCurrencySymbol(selectedInvoice.currency)}{selectedInvoice.amount.toLocaleString()} {selectedInvoice.currency || 'USD'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer — Cancel always visible on mobile */}
          <ModalFooter>
            <CancelBtn onClick={() => { setShowInvoiceModal(false); setSelectedInvoice(null); }} label="Close" />
            <button
              onClick={() => downloadAsPDF(selectedInvoice)}
              className="flex-1 py-2 px-3 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Download className="w-4 h-4" /> <span className="hidden xs:inline">PDF</span>
            </button>
            <button
              onClick={() => { handleSendEmail(selectedInvoice); setShowInvoiceModal(false); }}
              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Send className="w-4 h-4" /> <span className="hidden xs:inline">Send</span>
            </button>
            {canModify(selectedInvoice) && (
              <button
                onClick={() => { setPaymentDate(new Date().toISOString().split('T')[0]); setMarkPaidTarget(selectedInvoice); setShowInvoiceModal(false); }}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Banknote className="w-4 h-4" /> <span className="hidden xs:inline">Mark Paid</span>
              </button>
            )}
            {canReopen(selectedInvoice) && (
              <button
                onClick={() => { setReopenTarget(selectedInvoice); setShowInvoiceModal(false); }}
                className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" /> <span className="hidden xs:inline">Reopen</span>
              </button>
            )}
          </ModalFooter>
        </ModalShell>
      )}

      {/* ══════════════════════════════════════════════════════════════
          EMAIL MODAL
      ══════════════════════════════════════════════════════════════ */}
      {showEmailModal && emailInvoice && (
        <ModalShell maxW="sm:max-w-xl" onClose={() => { setShowEmailModal(false); setEmailInvoice(null); }}>
          <ModalHandle />
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 text-base">
              <Mail className="w-5 h-5 text-violet-600" /> Send Invoice
            </h2>
            <button
              onClick={() => { setShowEmailModal(false); setEmailInvoice(null); }}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="overflow-y-visible sm:overflow-y-auto sm:flex-1 p-4 pb-12 sm:p-6 space-y-4 bg-gray-50/40">
            {/* Invoice summary chip */}
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
              <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-violet-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{emailInvoice.id}</p>
                <p className="text-xs text-gray-400">{emailInvoice.client} · ${emailInvoice.amount.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 space-y-4">
              <div>
                <label className={labelCls}>To</label>
                <input type="email" value={emailData.to}
                  onChange={e => setEmailData({ ...emailData, to: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Subject</label>
                <input type="text" value={emailData.subject}
                  onChange={e => setEmailData({ ...emailData, subject: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Message</label>
                <textarea
                  rows={7}
                  value={emailData.message}
                  onChange={e => setEmailData({ ...emailData, message: e.target.value })}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          </div>

          <ModalFooter>
            <CancelBtn onClick={() => { setShowEmailModal(false); setEmailInvoice(null); }} />
            <button
              onClick={sendInvoiceEmail}
              className="flex-[2] py-2 px-4 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
            >
              <Send className="w-4 h-4" /> Send Invoice
            </button>
          </ModalFooter>
        </ModalShell>
      )}

      {/* ── DELETE MODAL ─────────────────────────────────────────────── */}
      {deletingInvoice && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeletingInvoice(null); }}
          onConfirm={async () => {
            try {
              const res = await fetch(`/api/invoices/${deletingInvoice.id}`, { method: 'DELETE' });
              if (!res.ok) throw new Error();
              await fetchInvoices();
              showToast('Invoice deleted');
              setShowDeleteModal(false); setDeletingInvoice(null);
            } catch {
              showToast('Failed to delete invoice', 'error');
            }
          }}
          title="Delete Invoice"
          itemName={deletingInvoice.id}
          itemDetails={`${deletingInvoice.client} · $${deletingInvoice.amount.toLocaleString()}`}
          warningMessage="This will permanently remove the invoice and all associated records."
        />
      )}

      {/* ── MARK AS PAID MODAL ──────────────────────────────────────── */}
      {markPaidTarget && (
        <ModalShell maxW="sm:max-w-sm" onClose={() => !markingPaid && setMarkPaidTarget(null)}>
          <ModalHandle />
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-gray-900 text-base">Mark as Paid</h2>
              <p className="text-xs text-gray-400">{markPaidTarget.id} · ${markPaidTarget.amount.toLocaleString()}</p>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-3">
            <p className="text-sm text-gray-600">
              This records the payment and posts a journal entry (Dr Cash, Cr Sales Revenue) to the Accounting ledger.
            </p>
            <div>
              <label className={labelCls}>Payment Date</label>
              <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className={inputCls} />
            </div>
          </div>
          <ModalFooter>
            <CancelBtn onClick={() => setMarkPaidTarget(null)} />
            <button
              onClick={handleMarkPaid}
              disabled={markingPaid}
              className="flex-[2] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-extrabold rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
            >
              {markingPaid ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
              Confirm Payment
            </button>
          </ModalFooter>
        </ModalShell>
      )}

      {/* ── CANCEL INVOICE MODAL ────────────────────────────────────── */}
      {cancelTarget && (
        <ModalShell maxW="sm:max-w-sm" onClose={() => !cancelling && setCancelTarget(null)}>
          <ModalHandle />
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-gray-900 text-base">Cancel Invoice</h2>
              <p className="text-xs text-gray-400">{cancelTarget.id} · ${cancelTarget.amount.toLocaleString()}</p>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <p className="text-sm text-gray-600">
              This marks the invoice as cancelled. It stays in your records for reference but is excluded from pending/overdue totals. This won&apos;t delete it — use Delete for that.
            </p>
          </div>
          <ModalFooter>
            <CancelBtn onClick={() => setCancelTarget(null)} label="Keep Invoice" />
            <button
              onClick={handleCancelInvoice}
              disabled={cancelling}
              className="flex-[2] py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-extrabold rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
            >
              {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
              Cancel Invoice
            </button>
          </ModalFooter>
        </ModalShell>
      )}

      {/* ── REOPEN INVOICE MODAL ────────────────────────────────────── */}
      {reopenTarget && (
        <ModalShell maxW="sm:max-w-sm" onClose={() => !reopening && setReopenTarget(null)}>
          <ModalHandle />
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-gray-900 text-base">Reopen Invoice</h2>
              <p className="text-xs text-gray-400">{reopenTarget.id} · ${reopenTarget.amount.toLocaleString()}</p>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <p className="text-sm text-gray-600">
              {reopenTarget.status === 'paid'
                ? 'This undoes the paid status and voids the linked accounting journal entry (the original entry is kept for audit purposes, not deleted). '
                : 'This restores the invoice to active status. '}
              It will move back to <span className="font-semibold text-gray-800">{getStatus(reopenedStatus(reopenTarget).toLowerCase()).label}</span> based on its due date.
            </p>
          </div>
          <ModalFooter>
            <CancelBtn onClick={() => setReopenTarget(null)} />
            <button
              onClick={handleReopenInvoice}
              disabled={reopening}
              className="flex-[2] py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-extrabold rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
            >
              {reopening ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Reopen Invoice
            </button>
          </ModalFooter>
        </ModalShell>
      )}

      {/* ── TOAST ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 80, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 80, x: '-50%' }}
            className="fixed bottom-24 sm:bottom-6 left-1/2 z-[200] w-[calc(100%-2rem)] sm:w-auto max-w-sm"
          >
            <div className={`bg-white border rounded-2xl p-4 flex items-center gap-3 shadow-2xl ${toast.type === 'success' ? 'border-emerald-100' : 'border-red-100'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <p className="text-sm font-medium text-gray-900 flex-1">{toast.message}</p>
              <button onClick={() => setToast(null)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-lg cursor-pointer shrink-0">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
            <motion.div
              initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: 3, ease: 'linear' }}
              style={{ transformOrigin: 'left' }}
              className={`h-1 rounded-full mx-4 mt-1 ${toast.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
