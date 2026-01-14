"use client";

import React, { useState } from 'react';
import { 
  Plus, Search, Filter, Download, Eye, Edit, Send, Trash2, 
  DollarSign, Clock, CheckCircle, AlertCircle, MoreVertical, X, 
  Calendar, Mail, FileText, TrendingUp, ArrowUpRight, ArrowDownRight, Copy,
  ChevronDown, RefreshCw
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

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

export default function InvoicingPage() {
  // Download functions
  const downloadAsPDF = (invoice: Invoice) => {
    const doc = new jsPDF();
    
    // Header with gradient effect
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('INVOICE', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text(invoice.id, 105, 30, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Status badge
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const statusColors: Record<string, [number, number, number]> = {
      paid: [34, 197, 94],
      sent: [59, 130, 246],
      overdue: [239, 68, 68],
      draft: [156, 163, 175],
      cancelled: [107, 114, 128]
    };
    const color = statusColors[invoice.status] || [156, 163, 175];
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(invoice.status.toUpperCase(), 105, 37, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // Client details box
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(20, 50, 80, 25, 3, 3, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 25, 58);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.client, 25, 65);
    doc.setFontSize(9);
    doc.text(invoice.clientEmail, 25, 71);
    
    // Invoice details box
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(110, 50, 80, 25, 3, 3, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Details:', 115, 58);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Issue Date: ${invoice.date}`, 115, 65);
    doc.text(`Due Date: ${invoice.dueDate}`, 115, 71);
    
    // Items table
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, 85, 170, 8, 'F');
    doc.text('Description', 25, 90);
    doc.text('Qty', 125, 90);
    doc.text('Rate', 145, 90);
    doc.text('Amount', 170, 90);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    let yPos = 100;
    invoice.items.forEach((item, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(20, yPos - 5, 170, 8, 'F');
      }
      doc.text(item.description, 25, yPos);
      doc.text(item.quantity.toString(), 125, yPos);
      doc.text(`£${item.rate}`, 145, yPos);
      doc.text(`£${(item.quantity * item.rate).toLocaleString()}`, 170, yPos);
      yPos += 8;
    });
    
    // Total section
    yPos += 10;
    doc.setFillColor(59, 130, 246);
    doc.rect(20, yPos - 5, 170, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL:', 145, yPos + 3);
    doc.text(`£${invoice.amount.toLocaleString()}`, 170, yPos + 3);
    
    // Footer
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });
    doc.text('For any questions, please contact us.', 105, 285, { align: 'center' });
    
    doc.save(`${invoice.id}.pdf`);
  };

  const downloadAsExcel = (invoice: Invoice) => {
    const headers = ['Description', 'Quantity', 'Rate', 'Amount'];
    const rows = invoice.items.map(item => [
      item.description,
      item.quantity,
      item.rate,
      item.quantity * item.rate
    ]);
    
    let csv = `Invoice: ${invoice.id}\n`;
    csv += `Client: ${invoice.client}\n`;
    csv += `Email: ${invoice.clientEmail}\n`;
    csv += `Issue Date: ${invoice.date}\n`;
    csv += `Due Date: ${invoice.dueDate}\n`;
    csv += `Status: ${invoice.status}\n\n`;
    csv += headers.join(',') + '\n';
    csv += rows.map(row => row.join(',')).join('\n');
    csv += `\n\nTotal,,,£${invoice.amount}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const [invoices, setInvoices] = useState<Invoice[]>([
    { 
      id: 'INV-001', 
      client: 'Acme Corp', 
      clientEmail: 'billing@acme.com',
      amount: 2500, 
      status: 'paid', 
      date: '2024-12-01',
      dueDate: '2024-12-15',
      items: [{ description: 'Web Development', quantity: 20, rate: 125 }]
    },
    { 
      id: 'INV-002', 
      client: 'Tech Solutions', 
      clientEmail: 'accounts@tech.com',
      amount: 1800, 
      status: 'sent', 
      date: '2024-12-03',
      dueDate: '2024-12-17',
      items: [{ description: 'Consulting Services', quantity: 12, rate: 150 }]
    },
    { 
      id: 'INV-003', 
      client: 'Design Studio', 
      clientEmail: 'finance@design.com',
      amount: 3200, 
      status: 'overdue', 
      date: '2024-11-28',
      dueDate: '2024-12-12',
      items: [{ description: 'UI/UX Design', quantity: 16, rate: 200 }]
    },
    { 
      id: 'INV-004', 
      client: 'Marketing Pro', 
      clientEmail: 'pay@marketing.com',
      amount: 4500, 
      status: 'sent', 
      date: '2024-12-04',
      dueDate: '2024-12-18',
      items: [{ description: 'Marketing Campaign', quantity: 30, rate: 150 }]
    },
    { 
      id: 'INV-005', 
      client: 'StartupXYZ', 
      clientEmail: 'admin@startup.com',
      amount: 1200, 
      status: 'draft', 
      date: '2024-12-05',
      dueDate: '2024-12-19',
      items: [{ description: 'Logo Design', quantity: 8, rate: 150 }]
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [emailInvoice, setEmailInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: ''
  });
  const [downloadMenuOpen, setDownloadMenuOpen] = useState<string | null>(null);
  const [newInvoice, setNewInvoice] = useState({
    clientType: 'business' as 'business' | 'individual',
    client: '',
    clientEmail: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{ description: '', quantity: 1, rate: 0 }]
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    paid: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
    pending: invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.amount, 0),
    overdue: invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0),
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      case 'sent': return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
    setActiveMenu(null);
  };

  const handleSendEmail = (invoice: Invoice) => {
    setEmailInvoice(invoice);
    setEmailData({
      to: invoice.clientEmail,
      subject: `Invoice ${invoice.id} from Your Company`,
      message: `Dear ${invoice.client},\n\nPlease find attached invoice ${invoice.id} for £${invoice.amount.toLocaleString()}.\n\nDue Date: ${invoice.dueDate}\n\nThank you for your business!\n\nBest regards,\nYour Company`
    });
    setShowEmailModal(true);
  };

  const sendInvoiceEmail = async () => {
    if (emailInvoice) {
      setInvoices(invoices.map(inv => 
        inv.id === emailInvoice.id ? { ...inv, status: 'sent' as const } : inv
      ));
    }
    
    alert(`✓ Invoice sent successfully to ${emailData.to}!`);
    setShowEmailModal(false);
    setEmailInvoice(null);
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 text-gray-900">
              <FileText className="w-10 h-10 text-gray-700" />
              Invoicing
            </h1>
            <p className="text-gray-600 text-lg">Create, manage and track all your invoices</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => {
                const headers = ['Invoice ID', 'Client', 'Email', 'Amount', 'Status', 'Issue Date', 'Due Date'];
                const rows = invoices.map(inv => [
                  inv.id,
                  inv.client,
                  inv.clientEmail,
                  inv.amount,
                  inv.status,
                  inv.date,
                  inv.dueDate
                ]);
                
                let csv = 'Invoice Report\n';
                csv += `Generated: ${new Date().toLocaleDateString()}\n`;
                csv += `Total Invoices: ${invoices.length}\n`;
                csv += `Total Amount: £${stats.total.toLocaleString()}\n\n`;
                csv += headers.join(',') + '\n';
                csv += rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                alert('✓ All invoices exported successfully!');
              }}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-xl rounded-xl transition-all font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Export All</span>
            </button>
            <button 
              type="button"
              onClick={() => setShowNewInvoiceModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl transition-all font-bold flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              New Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 hover:shadow-xl hover:scale-105 transition-all cursor-pointer overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-500 opacity-10 rounded-full group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-100 text-blue-700 backdrop-blur-sm bg-opacity-50">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-bold">+12%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Total Revenue</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">£{stats.total.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{invoices.length} total invoices</p>
          </div>
        </div>

        <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 hover:shadow-xl hover:scale-105 transition-all cursor-pointer overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-500 opacity-10 rounded-full group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-100 text-green-700 backdrop-blur-sm bg-opacity-50">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-bold">+8%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Paid</p>
            <p className="text-4xl font-bold text-green-600 mb-2">£{stats.paid.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{invoices.filter(i => i.status === 'paid').length} invoices paid</p>
          </div>
        </div>

        <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 hover:shadow-xl hover:scale-105 transition-all cursor-pointer overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-yellow-500 to-orange-500 opacity-10 rounded-full group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-yellow-100 text-yellow-700 backdrop-blur-sm bg-opacity-50">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-bold">Pending</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Pending</p>
            <p className="text-4xl font-bold text-yellow-600 mb-2">£{stats.pending.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{invoices.filter(i => i.status === 'sent').length} awaiting payment</p>
          </div>
        </div>

        <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 hover:shadow-xl hover:scale-105 transition-all cursor-pointer overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-red-500 to-rose-500 opacity-10 rounded-full group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-100 text-red-700 backdrop-blur-sm bg-opacity-50">
                <ArrowDownRight className="w-4 h-4" />
                <span className="text-sm font-bold">Urgent</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Overdue</p>
            <p className="text-4xl font-bold text-red-600 mb-2">£{stats.overdue.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{invoices.filter(i => i.status === 'overdue').length} need attention</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by client name or invoice number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/40 border border-white/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white/60 transition-all shadow-sm backdrop-blur-sm"
          />
        </div>
        <div className="relative">
          <button 
            type="button"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="px-6 py-3 bg-white/40 border border-white/50 rounded-xl hover:bg-white/60 flex items-center gap-2 font-medium shadow-sm transition-all cursor-pointer backdrop-blur-sm"
          >
            <Filter className="w-5 h-5 text-gray-600" />
            Filter {filterStatus !== 'all' && `(${filterStatus})`}
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {showFilterMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowFilterMenu(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-gray-200 py-2 z-50">
                {['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled'].map((status) => (
                  <button
                    type="button"
                    key={status}
                    onClick={() => {
                      setFilterStatus(status);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                      filterStatus === status ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {filterStatus === status && <CheckCircle className="w-4 h-4" />}
                    <span className="capitalize">{status === 'all' ? 'All Invoices' : status}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 overflow-hidden shadow-lg">
        <table className="w-full">
          <thead className="bg-slate-50/50 border-b border-white/20">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Invoice</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Client</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Issue Date</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all group">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{invoice.id}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                      {invoice.client.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{invoice.client}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {invoice.clientEmail}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-xl text-gray-900">£{invoice.amount.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border-2 shadow-sm ${
                    invoice.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' :
                    invoice.status === 'sent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    invoice.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-200' :
                    invoice.status === 'draft' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                    'bg-gray-50 text-gray-700 border-gray-200'
                  }`}>
                    {getStatusIcon(invoice.status)}
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {invoice.date}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {invoice.dueDate}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => handleViewInvoice(invoice)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors group/btn cursor-pointer"
                      title="View"
                    >
                      <Eye className="w-5 h-5 text-gray-600 group-hover/btn:text-blue-600" />
                    </button>
                    <div className="relative">
                      <button 
                        type="button"
                        onClick={() => setDownloadMenuOpen(downloadMenuOpen === invoice.id ? null : invoice.id)}
                        className="p-2 hover:bg-green-50 rounded-lg transition-colors group/btn cursor-pointer" 
                        title="Download"
                      >
                        <Download className="w-5 h-5 text-gray-600 group-hover/btn:text-green-600" />
                      </button>
                      {downloadMenuOpen === invoice.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setDownloadMenuOpen(null)} />
                          <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-gray-200 py-2 z-50">
                            <button 
                              type="button"
                              onClick={() => {
                                downloadAsPDF(invoice);
                                setDownloadMenuOpen(null);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <FileText className="w-4 h-4 text-red-600" />
                              <span className="font-medium">Download PDF</span>
                            </button>
                            <button 
                              type="button"
                              onClick={() => {
                                downloadAsExcel(invoice);
                                setDownloadMenuOpen(null);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <FileText className="w-4 h-4 text-green-600" />
                              <span className="font-medium">Download Excel</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleSendEmail(invoice)}
                      className="p-2 hover:bg-purple-50 rounded-lg transition-colors group/btn cursor-pointer" 
                      title="Send"
                    >
                      <Send className="w-5 h-5 text-gray-600 group-hover/btn:text-purple-600" />
                    </button>
                    <div className="relative">
                      <button 
                        type="button"
                        onClick={() => setActiveMenu(activeMenu === invoice.id ? null : invoice.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                      {activeMenu === invoice.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-gray-200 py-2 z-50">
                            <button 
                              type="button"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowInvoiceModal(true);
                                setActiveMenu(null);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Edit className="w-4 h-4 text-blue-600" /> 
                              <span className="font-medium">Edit</span>
                            </button>
                            <button 
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/invoice/${invoice.id}`);
                                alert('✓ Invoice link copied!');
                                setActiveMenu(null);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Copy className="w-4 h-4 text-green-600" /> 
                              <span className="font-medium">Copy Link</span>
                            </button>
                            <button 
                              type="button"
                              onClick={() => {
                                handleSendEmail(invoice);
                                setActiveMenu(null);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-purple-50 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Mail className="w-4 h-4 text-purple-600" /> 
                              <span className="font-medium">Email</span>
                            </button>
                            <div className="border-t border-gray-200 my-1" />
                            <button 
                              type="button"
                              onClick={() => {
                                setDeletingInvoice(invoice);
                                setShowDeleteModal(true);
                                setActiveMenu(null);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-4 h-4" /> 
                              <span className="font-medium">Delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Invoice Modal */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50">
            <div className="p-6 border-b-2 border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-6 h-6 text-blue-600" />
                Create New Invoice
              </h2>
              <button
                type="button"
                onClick={() => setShowNewInvoiceModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Client Name</label>
                  <input
                    type="text"
                    value={newInvoice.client}
                    onChange={(e) => setNewInvoice({ ...newInvoice, client: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Client Email</label>
                  <input
                    type="email"
                    value={newInvoice.clientEmail}
                    onChange={(e) => setNewInvoice({ ...newInvoice, clientEmail: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="client@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Issue Date</label>
                  <input
                    type="date"
                    value={newInvoice.date}
                    onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700">Invoice Items</label>
                  <button
                    type="button"
                    onClick={() => setNewInvoice({
                      ...newInvoice,
                      items: [...newInvoice.items, { description: '', quantity: 1, rate: 0 }]
                    })}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {newInvoice.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-5">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const items = [...newInvoice.items];
                            items[index].description = e.target.value;
                            setNewInvoice({ ...newInvoice, items });
                          }}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Service or product"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const items = [...newInvoice.items];
                            items[index].quantity = parseInt(e.target.value) || 0;
                            setNewInvoice({ ...newInvoice, items });
                          }}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          min="1"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Rate (£)</label>
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => {
                            const items = [...newInvoice.items];
                            items[index].rate = parseFloat(e.target.value) || 0;
                            setNewInvoice({ ...newInvoice, items });
                          }}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Total</label>
                        <div className="px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg text-sm font-bold text-gray-900">
                          £{(item.quantity * item.rate).toFixed(2)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        {newInvoice.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const items = newInvoice.items.filter((_, i) => i !== index);
                              setNewInvoice({ ...newInvoice, items });
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                  <span className="text-3xl font-bold text-blue-600">
                    £{newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    const totalAmount = newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
                    const newInv: Invoice = {
                      id: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
                      client: newInvoice.client,
                      clientEmail: newInvoice.clientEmail,
                      amount: totalAmount,
                      status: 'draft',
                      date: newInvoice.date,
                      dueDate: newInvoice.dueDate,
                      items: newInvoice.items
                    };
                    setInvoices([...invoices, newInv]);
                    setShowNewInvoiceModal(false);
                    setNewInvoice({
                      clientType: 'business',
                      client: '',
                      clientEmail: '',
                      date: new Date().toISOString().split('T')[0],
                      dueDate: '',
                      items: [{ description: '', quantity: 1, rate: 0 }]
                    });
                    alert('✓ Invoice created successfully!');
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-bold"
                >
                  Create Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewInvoiceModal(false)}
                  className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Invoice {selectedInvoice.id}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowInvoiceModal(false);
                  setSelectedInvoice(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">{selectedInvoice.id}</h3>
                  <p className="text-gray-600 mt-1">Invoice Details</p>
                </div>
                <span className={`px-4 py-2 rounded-xl font-bold text-sm ${
                  selectedInvoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                  selectedInvoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                  selectedInvoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selectedInvoice.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 mb-2">Bill To:</h4>
                  <p className="text-gray-900 font-semibold">{selectedInvoice.client}</p>
                  <p className="text-gray-600 text-sm">{selectedInvoice.clientEmail}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 mb-2">Invoice Details:</h4>
                  <p className="text-gray-700 text-sm">Issue Date: {selectedInvoice.date}</p>
                  <p className="text-gray-700 text-sm">Due Date: {selectedInvoice.dueDate}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">Items:</h4>
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Description</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Qty</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Rate</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedInvoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-gray-900">{item.description}</td>
                        <td className="px-4 py-3 text-gray-700">{item.quantity}</td>
                        <td className="px-4 py-3 text-gray-700">£{item.rate}</td>
                        <td className="px-4 py-3 font-bold text-gray-900">£{(item.quantity * item.rate).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">Total Amount:</span>
                  <span className="text-4xl font-bold text-blue-600">£{selectedInvoice.amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => downloadAsPDF(selectedInvoice)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSendEmail(selectedInvoice);
                    setShowInvoiceModal(false);
                  }}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && emailInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-2xl max-w-2xl w-full shadow-2xl border border-white/50">
            <div className="p-6 border-b-2 border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Mail className="w-6 h-6 text-purple-600" />
                Send Invoice via Email
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailInvoice(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">To:</label>
                <input
                  type="email"
                  value={emailData.to}
                  onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject:</label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message:</label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={8}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={sendInvoiceEmail}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Invoice
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailInvoice(null);
                  }}
                  className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingInvoice && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingInvoice(null);
          }}
          onConfirm={() => {
            setInvoices(invoices.filter(inv => inv.id !== deletingInvoice.id));
            alert('✓ Invoice deleted successfully');
          }}
          title="Delete Invoice"
          itemName={deletingInvoice.id}
          itemDetails={`${deletingInvoice.client} - £${deletingInvoice.amount.toLocaleString()}`}
          warningMessage="This will permanently remove this invoice and all associated records."
        />
      )}
    </div>
  );
}
