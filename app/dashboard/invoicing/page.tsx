"use client";

import React, { useState } from 'react';
import { 
  Plus, Search, Filter, Download, Eye, Edit, Send, Trash2, 
  DollarSign, Clock, CheckCircle, AlertCircle, MoreVertical, X, 
  Calendar, Mail, FileText, TrendingUp, Users, CreditCard,
  ArrowUpRight, ArrowDownRight, Sparkles, Share2, Copy,
  ChevronDown, ChevronRight, Printer, RefreshCw
} from 'lucide-react';
import { jsPDF } from 'jspdf';

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
  const [emailInvoice, setEmailInvoice] = useState<Invoice | null>(null);
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
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <FileText className="w-10 h-10" />
              Invoicing
            </h1>
            <p className="text-blue-100 text-lg">Create, manage and track all your invoices</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl hover:bg-opacity-30 transition-all font-semibold flex items-center gap-2 cursor-pointer"
              style={{ color: 'var(--color-purple-600)' }}
            >
              <Download className="w-5 h-5" />
              <span>Export All</span>
            </button>
            <button 
              onClick={() => setShowNewInvoiceModal(true)}
              className="px-6 py-3 bg-white rounded-xl hover:shadow-2xl transition-all font-bold flex items-center gap-2 cursor-pointer"
              style={{ color: 'var(--color-purple-600)' }}
            >
              <Plus className="w-5 h-5" />
              New Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 hover:shadow-2xl hover:scale-105 transition-all cursor-pointer overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-500 opacity-10 rounded-full group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-100 text-blue-700">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-bold">+12%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Total Revenue</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">£{stats.total.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{invoices.length} total invoices</p>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 hover:shadow-2xl hover:scale-105 transition-all cursor-pointer overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-500 opacity-10 rounded-full group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-100 text-green-700">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-bold">+8%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Paid</p>
            <p className="text-4xl font-bold text-green-600 mb-2">£{stats.paid.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{invoices.filter(i => i.status === 'paid').length} invoices paid</p>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200 hover:shadow-2xl hover:scale-105 transition-all cursor-pointer overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-yellow-500 to-orange-500 opacity-10 rounded-full group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-yellow-100 text-yellow-700">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-bold">Pending</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Pending</p>
            <p className="text-4xl font-bold text-yellow-600 mb-2">£{stats.pending.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{invoices.filter(i => i.status === 'sent').length} awaiting payment</p>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 border-2 border-red-200 hover:shadow-2xl hover:scale-105 transition-all cursor-pointer overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-red-500 to-rose-500 opacity-10 rounded-full group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-100 text-red-700">
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
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 font-medium shadow-sm transition-all cursor-pointer"
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
      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
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
          <tbody className="divide-y divide-gray-200">
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
                      onClick={() => handleViewInvoice(invoice)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors group/btn cursor-pointer"
                      title="View"
                    >
                      <Eye className="w-5 h-5 text-gray-600 group-hover/btn:text-blue-600" />
                    </button>
                    <div className="relative">
                      <button 
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
                      onClick={() => handleSendEmail(invoice)}
                      className="p-2 hover:bg-purple-50 rounded-lg transition-colors group/btn cursor-pointer" 
                      title="Send"
                    >
                      <Send className="w-5 h-5 text-gray-600 group-hover/btn:text-purple-600" />
                    </button>
                    <div className="relative">
                      <button 
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
                              onClick={() => {
                                if (confirm(`⚠️ Are you sure you want to delete invoice ${invoice.id}?`)) {
                                  setInvoices(invoices.filter(inv => inv.id !== invoice.id));
                                  setActiveMenu(null);
                                  alert('✓ Invoice deleted successfully');
                                }
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
    </div>
  );
}
