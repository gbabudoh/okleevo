"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Filter, Download, Eye, Edit, Send, Trash2,
  DollarSign, Clock, CheckCircle, AlertCircle, MoreVertical, X,
  Calendar, Mail, FileText, Copy,
  ChevronDown, Loader2, TableProperties, ArrowUpRight,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Interfaces ──────────────────────────────────────────────────── */
interface Invoice {
  id: string;
  client: string;
  clientEmail: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  date: string;
  dueDate: string;
  items: { description: string; quantity: number; rate: number }[];
}

interface InvoiceResponse {
  id: string;
  number: string | null;
  clientName: string;
  clientEmail: string | null;
  amount: number;
  status: string;
  createdAt: string;
  dueDate: string;
  items: { description: string; quantity: number; rate: number }[] | null;
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

const inputCls = "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

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
    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
    onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
  >
    <div className={`bg-white rounded-t-3xl sm:rounded-2xl w-full ${maxW} max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden`}>
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
  <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-white flex flex-col-reverse sm:flex-row gap-2.5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-4 shrink-0">
    {children}
  </div>
);

const CancelBtn = ({ onClick, label = 'Cancel' }: { onClick: () => void; label?: string }) => (
  <button
    onClick={onClick}
    className="w-full sm:w-auto sm:flex-1 py-3 px-5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
  >
    {label}
  </button>
);

/* ══════════════════════════════════════════════════════════════════ */
export default function InvoicingPage() {

  /* ── PDF / export helpers ──────────────────────────────────────── */
  const downloadAsPDF = (invoice: Invoice) => {
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
    doc.text('Rate', 145, 90); doc.text('Amount', 170, 90);
    doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'normal');
    let yPos = 100;
    invoice.items.forEach((item, i) => {
      if (i % 2 === 0) { doc.setFillColor(249, 250, 251); doc.rect(20, yPos - 5, 170, 8, 'F'); }
      doc.text(item.description, 25, yPos); doc.text(item.quantity.toString(), 125, yPos);
      doc.text(`£${item.rate}`, 145, yPos); doc.text(`£${(item.quantity * item.rate).toLocaleString()}`, 170, yPos);
      yPos += 8;
    });
    yPos += 10;
    doc.setFillColor(59, 130, 246); doc.rect(20, yPos - 5, 170, 12, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(255, 255, 255);
    doc.text('TOTAL:', 145, yPos + 3); doc.text(`£${invoice.amount.toLocaleString()}`, 170, yPos + 3);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(128, 128, 128);
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });
    doc.save(`${invoice.id}.pdf`);
  };

  const downloadAsExcel = (invoice: Invoice) => {
    const headers = ['Description', 'Quantity', 'Rate', 'Amount'];
    const rows = invoice.items.map(item => [item.description, item.quantity, item.rate, item.quantity * item.rate]);
    let csv = `Invoice: ${invoice.id}\nClient: ${invoice.client}\nEmail: ${invoice.clientEmail}\nIssue: ${invoice.date}\nDue: ${invoice.dueDate}\nStatus: ${invoice.status}\n\n`;
    csv += headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');
    csv += `\n\nTotal,,,£${invoice.amount}`;
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
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
    doc.setTextColor(0, 0, 0); doc.text(`Total: £${tot.toLocaleString()}`, 20, 49);
    doc.setTextColor(34, 197, 94); doc.text(`Paid: £${paid.toLocaleString()}`, 80, 49);
    doc.setTextColor(239, 68, 68); doc.text(`Overdue: £${over.toLocaleString()}`, 140, 49);
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
      doc.text(inv.id.slice(0, 12), 18, y); doc.text(inv.client.slice(0, 22), 45, y);
      doc.text(`£${inv.amount.toLocaleString()}`, 105, y);
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
  const [newInvoice, setNewInvoice] = useState({
    clientType: 'business' as 'business' | 'individual',
    client: '', clientEmail: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{ description: '', quantity: 1, rate: 0 }],
  });

  /* ── Data ──────────────────────────────────────────────────────── */
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/invoices');
      const data = await res.json();
      if (data.data) {
        setInvoices(data.data.map((inv: InvoiceResponse) => ({
          id: inv.number || inv.id,
          client: inv.clientName,
          clientEmail: inv.clientEmail || '',
          amount: inv.amount,
          status: inv.status.toLowerCase() as Invoice['status'],
          date: new Date(inv.createdAt).toISOString().split('T')[0],
          dueDate: new Date(inv.dueDate).toISOString().split('T')[0],
          items: Array.isArray(inv.items) ? inv.items : [],
        })));
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

  /* ── Handlers ──────────────────────────────────────────────────── */
  const closeNewModal = () => {
    setShowNewInvoiceModal(false);
    setNewInvoice({ clientType: 'business', client: '', clientEmail: '', date: new Date().toISOString().split('T')[0], dueDate: '', items: [{ description: '', quantity: 1, rate: 0 }] });
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice); setShowInvoiceModal(true); setActiveMenu(null);
  };

  const handleSendEmail = (invoice: Invoice) => {
    setEmailInvoice(invoice);
    setEmailData({
      to: invoice.clientEmail,
      subject: `Invoice ${invoice.id} from Your Company`,
      message: `Dear ${invoice.client},\n\nPlease find attached invoice ${invoice.id} for £${invoice.amount.toLocaleString()}.\n\nDue Date: ${invoice.dueDate}\n\nThank you for your business!\n\nBest regards,\nYour Company`,
    });
    setShowEmailModal(true);
  };

  const sendInvoiceEmail = async () => {
    try {
      if (emailInvoice) {
        const res = await fetch(`/api/invoices/${emailInvoice.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'SENT' }),
        });
        if (!res.ok) throw new Error();
        await fetchInvoices();
      }
      showToast(`Invoice sent to ${emailData.to}!`);
      setShowEmailModal(false); setEmailInvoice(null);
    } catch {
      showToast('Failed to send invoice', 'error');
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName: newInvoice.client, clientEmail: newInvoice.clientEmail, amount: newInvoiceTotal, items: newInvoice.items, dueDate: newInvoice.dueDate }),
      });
      if (!res.ok) throw new Error();
      await fetchInvoices();
      closeNewModal();
      showToast('Invoice created successfully!');
    } catch {
      showToast('Failed to create invoice', 'error');
    }
  };

  const handleExportAllCSV = () => {
    const headers = ['Invoice ID', 'Client', 'Email', 'Amount', 'Status', 'Issue Date', 'Due Date'];
    const rows = invoices.map(inv => [inv.id, inv.client, inv.clientEmail, inv.amount, inv.status, inv.date, inv.dueDate]);
    let csv = `Invoice Report\nGenerated: ${new Date().toLocaleDateString()}\nTotal: £${stats.total.toLocaleString()}\n\n`;
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

      {/* ── STICKY HEADER ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Invoicing</h1>
              <p className="text-[11px] text-gray-400 hidden sm:block">Create, manage and track invoices</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Export dropdown */}
            <div className="relative">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Revenue', value: stats.total,   sub: `${invoices.length} invoices`,                                              Icon: DollarSign,  iconBg: 'bg-blue-600',    valCls: 'text-gray-900'     },
            { label: 'Paid',          value: stats.paid,    sub: `${invoices.filter(i => i.status === 'paid').length} paid`,                  Icon: CheckCircle, iconBg: 'bg-emerald-500', valCls: 'text-emerald-600'  },
            { label: 'Pending',       value: stats.pending, sub: `${invoices.filter(i => i.status === 'sent').length} awaiting`,              Icon: Clock,       iconBg: 'bg-amber-500',   valCls: 'text-amber-600'    },
            { label: 'Overdue',       value: stats.overdue, sub: `${invoices.filter(i => i.status === 'overdue').length} need attention`,     Icon: AlertCircle, iconBg: 'bg-red-500',     valCls: 'text-red-600'      },
          ].map(({ label, value, sub, Icon, iconBg, valCls }) => (
            <div key={label} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300" />
              </div>
              <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
              <p className={`text-xl sm:text-2xl font-bold ${valCls} mb-0.5 leading-tight`}>£{value.toLocaleString()}</p>
              <p className="text-[11px] text-gray-400">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── SEARCH + FILTER ───────────────────────────────────────── */}
        <div className="flex gap-2">
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
                            <span className="font-bold text-gray-900">£{invoice.amount.toLocaleString()}</span>
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
                                <button onClick={() => setDownloadMenuOpen(downloadMenuOpen === invoice.id ? null : invoice.id)} title="Download"
                                  className="w-8 h-8 flex items-center justify-center hover:bg-green-50 rounded-lg transition-colors cursor-pointer">
                                  <Download className="w-4 h-4 text-gray-400 hover:text-green-600" />
                                </button>
                                {downloadMenuOpen === invoice.id && (
                                  <>
                                    <div className="fixed inset-0 z-40" onClick={() => setDownloadMenuOpen(null)} />
                                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                                      <button onClick={() => { downloadAsPDF(invoice); setDownloadMenuOpen(null); }}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 cursor-pointer">
                                        <FileText className="w-4 h-4 text-red-500" /><span className="font-medium">PDF</span>
                                      </button>
                                      <button onClick={() => { downloadAsExcel(invoice); setDownloadMenuOpen(null); }}
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
                                <button onClick={() => setActiveMenu(activeMenu === invoice.id ? null : invoice.id)}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                                  <MoreVertical className="w-4 h-4 text-gray-400" />
                                </button>
                                {activeMenu === invoice.id && (
                                  <>
                                    <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                                    <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                                      <button onClick={() => { handleViewInvoice(invoice); setActiveMenu(null); }}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex items-center gap-2 cursor-pointer">
                                        <Edit className="w-4 h-4 text-blue-600" /><span className="font-medium">Edit</span>
                                      </button>
                                      <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/invoice/${invoice.id}`); showToast('Link copied!'); setActiveMenu(null); }}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 cursor-pointer">
                                        <Copy className="w-4 h-4 text-green-600" /><span className="font-medium">Copy Link</span>
                                      </button>
                                      <button onClick={() => { handleSendEmail(invoice); setActiveMenu(null); }}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-purple-50 flex items-center gap-2 cursor-pointer">
                                        <Mail className="w-4 h-4 text-purple-600" /><span className="font-medium">Email</span>
                                      </button>
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
                                  <button onClick={() => { downloadAsPDF(invoice); setActiveMenu(null); }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 cursor-pointer">
                                    <Download className="w-4 h-4 text-red-500" /><span className="font-medium">Download PDF</span>
                                  </button>
                                  <button onClick={() => { handleSendEmail(invoice); setActiveMenu(null); }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-purple-50 flex items-center gap-2 cursor-pointer">
                                    <Send className="w-4 h-4 text-purple-600" /><span className="font-medium">Send Email</span>
                                  </button>
                                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/invoice/${invoice.id}`); showToast('Link copied!'); setActiveMenu(null); }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 cursor-pointer">
                                    <Copy className="w-4 h-4 text-green-600" /><span className="font-medium">Copy Link</span>
                                  </button>
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
                        <span className="text-xl font-bold text-gray-900">£{invoice.amount.toLocaleString()}</span>
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
            <div>
              <h2 className="font-bold text-gray-900 flex items-center gap-2 text-base">
                <Plus className="w-5 h-5 text-blue-600" /> New Invoice
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Fill in the details below</p>
            </div>
            <button onClick={closeNewModal} className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/40">
            {/* Client details */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 space-y-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Client Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Client Name *</label>
                  <input type="text" value={newInvoice.client}
                    onChange={e => setNewInvoice({ ...newInvoice, client: e.target.value })}
                    className={inputCls} placeholder="Acme Corp" />
                </div>
                <div>
                  <label className={labelCls}>Client Email</label>
                  <input type="email" value={newInvoice.clientEmail}
                    onChange={e => setNewInvoice({ ...newInvoice, clientEmail: e.target.value })}
                    className={inputCls} placeholder="client@example.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Issue Date</label>
                  <input type="date" value={newInvoice.date}
                    onChange={e => setNewInvoice({ ...newInvoice, date: e.target.value })}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Due Date</label>
                  <input type="date" value={newInvoice.dueDate}
                    onChange={e => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                    className={inputCls} />
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Line Items</p>
                <button
                  onClick={() => setNewInvoice({ ...newInvoice, items: [...newInvoice.items, { description: '', quantity: 1, rate: 0 }] })}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </button>
              </div>

              <div className="space-y-3">
                {newInvoice.items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2.5">
                    {/* Description */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={e => { const items = [...newInvoice.items]; items[idx].description = e.target.value; setNewInvoice({ ...newInvoice, items }); }}
                        className={inputCls}
                        placeholder="Service or product description"
                      />
                    </div>
                    {/* Qty / Rate / Total / Remove */}
                    <div className="grid grid-cols-3 gap-2 items-end">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Qty</label>
                        <input
                          type="number" min="1"
                          value={item.quantity}
                          onChange={e => { const items = [...newInvoice.items]; items[idx].quantity = parseInt(e.target.value) || 0; setNewInvoice({ ...newInvoice, items }); }}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Rate (£)</label>
                        <input
                          type="number" min="0" step="0.01"
                          value={item.rate}
                          onChange={e => { const items = [...newInvoice.items]; items[idx].rate = parseFloat(e.target.value) || 0; setNewInvoice({ ...newInvoice, items }); }}
                          className={inputCls}
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">Total</label>
                          <div className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700">
                            £{(item.quantity * item.rate).toFixed(2)}
                          </div>
                        </div>
                        {newInvoice.items.length > 1 && (
                          <button
                            onClick={() => setNewInvoice({ ...newInvoice, items: newInvoice.items.filter((_, i) => i !== idx) })}
                            className="w-10 h-10 mb-0.5 flex items-center justify-center hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                <span className="text-sm font-semibold text-gray-700">Invoice Total</span>
                <span className="text-2xl font-bold text-blue-600">£{newInvoiceTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer — Cancel always visible on mobile */}
          <ModalFooter>
            <CancelBtn onClick={closeNewModal} />
            <button
              onClick={handleCreateInvoice}
              className="w-full sm:flex-[2] py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" /> Create Invoice
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
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/40">
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
                      {['Description', 'Qty', 'Rate', 'Amount'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selectedInvoice.items.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm text-gray-800">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">£{item.rate}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">£{(item.quantity * item.rate).toLocaleString()}</td>
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
                      <p className="text-xs text-gray-400 mt-0.5">{item.quantity} × £{item.rate}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">£{(item.quantity * item.rate).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              {/* Total */}
              <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-t border-blue-100">
                <span className="text-sm font-semibold text-gray-700">Total</span>
                <span className="text-2xl font-bold text-blue-600">£{selectedInvoice.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer — Cancel always visible on mobile */}
          <ModalFooter>
            <CancelBtn onClick={() => { setShowInvoiceModal(false); setSelectedInvoice(null); }} label="Close" />
            <button
              onClick={() => downloadAsPDF(selectedInvoice)}
              className="w-full sm:flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button
              onClick={() => { handleSendEmail(selectedInvoice); setShowInvoiceModal(false); }}
              className="w-full sm:flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Send Invoice
            </button>
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

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/40">
            {/* Invoice summary chip */}
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
              <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-violet-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{emailInvoice.id}</p>
                <p className="text-xs text-gray-400">{emailInvoice.client} · £{emailInvoice.amount.toLocaleString()}</p>
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
              className="w-full sm:flex-[2] py-3 px-5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 active:scale-95"
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
          itemDetails={`${deletingInvoice.client} · £${deletingInvoice.amount.toLocaleString()}`}
          warningMessage="This will permanently remove the invoice and all associated records."
        />
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
