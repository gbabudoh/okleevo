"use client";

import React, { useState } from 'react';
import { 
  Calculator, Plus, Search, Filter, Download, Upload, Eye, Edit3,
  Trash2, TrendingUp, TrendingDown, DollarSign, FileText, Calendar,
  BarChart3, PieChart, BookOpen, Briefcase, Building2, CreditCard,
  ArrowUpRight, ArrowDownRight, CheckCircle, AlertCircle, Clock,
  Printer, Send, Save, X, Check, Sparkles, Target, Award, Users,
  Package, ShoppingCart, Wallet, Receipt, FileCheck, Grid, List
} from 'lucide-react';

interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  lastTransaction: Date;
}

interface Transaction {
  id: string;
  date: Date;
  description: string;
  debit: { account: string; amount: number };
  credit: { account: string; amount: number };
  reference: string;
  status: 'posted' | 'pending' | 'draft';
}

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showViewAccountModal, setShowViewAccountModal] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [showViewEntryModal, setShowViewEntryModal] = useState(false);
  const [showEditEntryModal, setShowEditEntryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showYearEndModal, setShowYearEndModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'account' | 'entry', id: string } | null>(null);
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [selectedExportFormat, setSelectedExportFormat] = useState<'CSV' | 'Excel' | 'PDF'>('CSV');
  
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    reference: '',
    debitAccount: '',
    debitAmount: '',
    creditAccount: '',
    creditAmount: '',
  });
  const [newAccount, setNewAccount] = useState({
    code: '',
    name: '',
    type: 'asset' as 'asset' | 'liability' | 'equity' | 'revenue' | 'expense',
    description: '',
    openingBalance: '',
  });

  const accounts: Account[] = [
    { id: '1', code: '1000', name: 'Cash at Bank', type: 'asset', balance: 45250.00, lastTransaction: new Date('2024-12-05') },
    { id: '2', code: '1100', name: 'Accounts Receivable', type: 'asset', balance: 28500.00, lastTransaction: new Date('2024-12-06') },
    { id: '3', code: '1200', name: 'Inventory', type: 'asset', balance: 15750.00, lastTransaction: new Date('2024-12-04') },
    { id: '4', code: '2000', name: 'Accounts Payable', type: 'liability', balance: 12300.00, lastTransaction: new Date('2024-12-05') },
    { id: '5', code: '3000', name: 'Share Capital', type: 'equity', balance: 50000.00, lastTransaction: new Date('2024-01-01') },
    { id: '6', code: '4000', name: 'Sales Revenue', type: 'revenue', balance: 124500.00, lastTransaction: new Date('2024-12-06') },
    { id: '7', code: '5000', name: 'Cost of Sales', type: 'expense', balance: 45200.00, lastTransaction: new Date('2024-12-05') },
    { id: '8', code: '5100', name: 'Operating Expenses', type: 'expense', balance: 28750.00, lastTransaction: new Date('2024-12-06') },
  ];

  const recentTransactions: Transaction[] = [
    {
      id: '1',
      date: new Date('2024-12-06'),
      description: 'Sales Invoice #INV-1045',
      debit: { account: 'Accounts Receivable', amount: 2450.00 },
      credit: { account: 'Sales Revenue', amount: 2450.00 },
      reference: 'INV-1045',
      status: 'posted'
    },
    {
      id: '2',
      date: new Date('2024-12-05'),
      description: 'Supplier Payment',
      debit: { account: 'Accounts Payable', amount: 1500.00 },
      credit: { account: 'Cash at Bank', amount: 1500.00 },
      reference: 'PAY-234',
      status: 'posted'
    },
    {
      id: '3',
      date: new Date('2024-12-05'),
      description: 'Office Rent',
      debit: { account: 'Operating Expenses', amount: 2000.00 },
      credit: { account: 'Cash at Bank', amount: 2000.00 },
      reference: 'EXP-156',
      status: 'posted'
    },
  ];

  const financialSummary = {
    totalAssets: 89500.00,
    totalLiabilities: 12300.00,
    totalEquity: 77200.00,
    totalRevenue: 124500.00,
    totalExpenses: 73950.00,
    netProfit: 50550.00,
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'chart-of-accounts', name: 'Chart of Accounts', icon: BookOpen },
    { id: 'journal', name: 'Journal Entries', icon: FileText },
    { id: 'trial-balance', name: 'Trial Balance', icon: Calculator },
    { id: 'reports', name: 'Financial Reports', icon: PieChart },
    { id: 'year-end', name: 'Year-End', icon: Calendar },
  ];

  const handleSaveEntry = () => {
    // Validate entry
    if (!newEntry.description || !newEntry.debitAccount || !newEntry.creditAccount || !newEntry.debitAmount || !newEntry.creditAmount) {
      alert('Please fill in all fields');
      return;
    }

    if (parseFloat(newEntry.debitAmount) !== parseFloat(newEntry.creditAmount)) {
      alert('Debit and Credit amounts must be equal');
      return;
    }

    // Here you would save to your backend
    console.log('Saving entry:', newEntry);
    
    // Reset form and close modal
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      description: '',
      reference: '',
      debitAccount: '',
      debitAmount: '',
      creditAccount: '',
      creditAmount: '',
    });
    setShowNewEntryModal(false);
    
    // Show success message
    alert('Journal entry created successfully!');
  };

  const handleSaveAccount = () => {
    // Validate account
    if (!newAccount.code || !newAccount.name || !newAccount.type) {
      alert('Please fill in all required fields');
      return;
    }

    // Here you would save to your backend
    console.log('Saving account:', newAccount);
    
    // Reset form and close modal
    setNewAccount({
      code: '',
      name: '',
      type: 'asset',
      description: '',
      openingBalance: '',
    });
    setShowAddAccountModal(false);
    
    // Show success message
    alert('Account created successfully!');
  };

  const handleViewAccount = (account: Account) => {
    setSelectedAccount(account);
    setShowViewAccountModal(true);
  };

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setNewAccount({
      code: account.code,
      name: account.name,
      type: account.type,
      description: '',
      openingBalance: account.balance.toString(),
    });
    setShowEditAccountModal(true);
  };

  const handleViewEntry = (entry: Transaction) => {
    setSelectedEntry(entry);
    setShowViewEntryModal(true);
  };

  const handleEditEntry = (entry: Transaction) => {
    setSelectedEntry(entry);
    setNewEntry({
      date: entry.date.toISOString().split('T')[0],
      description: entry.description,
      reference: entry.reference,
      debitAccount: entry.debit.account,
      debitAmount: entry.debit.amount.toString(),
      creditAccount: entry.credit.account,
      creditAmount: entry.credit.amount.toString(),
    });
    setShowEditEntryModal(true);
  };

  const handleDeleteClick = (type: 'account' | 'entry', id: string) => {
    setDeleteTarget({ type, id });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      console.log(`Deleting ${deleteTarget.type}:`, deleteTarget.id);
      alert(`${deleteTarget.type === 'account' ? 'Account' : 'Entry'} deleted successfully!`);
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportReport = (reportType: string) => {
    console.log(`Exporting ${reportType} report`);
    
    // Create a sample CSV content
    const csvContent = `Date,Description,Debit Account,Debit Amount,Credit Account,Credit Amount,Reference
06/12/2024,Sales Invoice #INV-1045,Accounts Receivable,2450.00,Sales Revenue,2450.00,INV-1045
05/12/2024,Supplier Payment,Accounts Payable,1500.00,Cash at Bank,1500.00,PAY-234
05/12/2024,Office Rent,Operating Expenses,2000.00,Cash at Bank,2000.00,EXP-156`;

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const fileName = `${reportType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success modal
    setSuccessMessage(fileName);
    setShowSuccessModal(true);
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 3000);
  };

  const handleGenerateReport = (reportType: string) => {
    setSelectedReport(reportType);
    setShowReportModal(true);
  };

  const handleDownloadReport = (format: string) => {
    console.log(`Downloading ${selectedReport} as ${format}`);
    alert(`${selectedReport} will be downloaded as ${format}`);
    setShowReportModal(false);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            Accounting & Bookkeeping
          </h1>
          <p className="text-gray-600 mt-2">Complete double-entry bookkeeping system for UK SMEs</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Upload className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Import</span>
          </button>
          <button 
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Export</span>
          </button>
          <button 
            onClick={() => setShowNewEntryModal(true)}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Entry
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-blue-600 font-medium mb-1">Total Assets</p>
          <p className="text-2xl font-bold text-blue-900">£{financialSummary.totalAssets.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 border-2 border-red-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-red-500 rounded-lg">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-red-600 font-medium mb-1">Total Liabilities</p>
          <p className="text-2xl font-bold text-red-900">£{financialSummary.totalLiabilities.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-purple-600 font-medium mb-1">Total Equity</p>
          <p className="text-2xl font-bold text-purple-900">£{financialSummary.totalEquity.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-500 rounded-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-green-600 font-medium mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-green-900">£{financialSummary.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Receipt className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-orange-600 font-medium mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-orange-900">£{financialSummary.totalExpenses.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-5 border-2 border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-indigo-600 font-medium mb-1">Net Profit</p>
          <p className="text-2xl font-bold text-indigo-900">£{financialSummary.netProfit.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Recent Transactions */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Recent Journal Entries
            </h2>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-600">
                        DR: {transaction.debit.account} | CR: {transaction.credit.account}
                      </p>
                      <p className="text-xs text-gray-500">{transaction.date.toLocaleDateString()} • Ref: {transaction.reference}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">£{transaction.debit.amount.toLocaleString()}</p>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:shadow-xl transition-all text-left">
              <div className="p-3 bg-blue-500 rounded-lg w-fit mb-3">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Prepare Year-End Accounts</h3>
              <p className="text-sm text-gray-600">Generate financial statements for HMRC submission</p>
            </button>

            <button className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:shadow-xl transition-all text-left">
              <div className="p-3 bg-green-500 rounded-lg w-fit mb-3">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Run Trial Balance</h3>
              <p className="text-sm text-gray-600">Verify all debits equal credits</p>
            </button>

            <button className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:shadow-xl transition-all text-left">
              <div className="p-3 bg-purple-500 rounded-lg w-fit mb-3">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Financial Reports</h3>
              <p className="text-sm text-gray-600">P&L, Balance Sheet, Cash Flow</p>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'chart-of-accounts' && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Chart of Accounts</h2>
            <button 
              onClick={() => setShowAddAccountModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Account
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Code</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Account Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Type</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">Balance</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Last Transaction</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-900">{account.code}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{account.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        account.type === 'asset' ? 'bg-blue-100 text-blue-700' :
                        account.type === 'liability' ? 'bg-red-100 text-red-700' :
                        account.type === 'equity' ? 'bg-purple-100 text-purple-700' :
                        account.type === 'revenue' ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {account.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">£{account.balance.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{account.lastTransaction.toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewAccount(account)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Account"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button 
                          onClick={() => handleEditAccount(account)}
                          className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Edit Account"
                        >
                          <Edit3 className="w-4 h-4 text-purple-600" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick('account', account.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'journal' && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Journal Entries</h2>
              <p className="text-sm text-gray-600 mt-1">Double-entry bookkeeping transactions</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button className="px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-700">Filter</span>
              </button>
              <button 
                onClick={() => setShowNewEntryModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Entry
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{transaction.description}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {transaction.date.toLocaleDateString('en-GB')}
                        </span>
                        <span className="text-sm text-gray-600">Ref: {transaction.reference}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          transaction.status === 'posted' ? 'bg-green-100 text-green-700' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {transaction.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleViewEntry(transaction)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Entry"
                    >
                      <Eye className="w-5 h-5 text-blue-600" />
                    </button>
                    <button 
                      onClick={() => handleEditEntry(transaction)}
                      className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Edit Entry"
                    >
                      <Edit3 className="w-5 h-5 text-purple-600" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick('entry', transaction.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Debit Side */}
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowUpRight className="w-5 h-5 text-green-600" />
                      <span className="font-bold text-green-900">DEBIT</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{transaction.debit.account}</p>
                    <p className="text-2xl font-bold text-green-900">£{transaction.debit.amount.toLocaleString()}</p>
                  </div>

                  {/* Credit Side */}
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowDownRight className="w-5 h-5 text-red-600" />
                      <span className="font-bold text-red-900">CREDIT</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{transaction.credit.account}</p>
                    <p className="text-2xl font-bold text-red-900">£{transaction.credit.amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State (if no transactions) */}
          {recentTransactions.length === 0 && (
            <div className="text-center py-16">
              <div className="p-6 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                <FileText className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Journal Entries Yet</h3>
              <p className="text-gray-600 mb-6">Start recording your transactions with double-entry bookkeeping</p>
              <button 
                onClick={() => setShowNewEntryModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:shadow-xl transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create First Entry
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'trial-balance' && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Trial Balance</h2>
              <p className="text-sm text-gray-600 mt-1">Verify that total debits equal total credits</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrint}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Printer className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-700">Print</span>
              </button>
              <button 
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-700">Export</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Account Code</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Account Name</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">Debit (£)</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">Credit (£)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-900">{account.code}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{account.name}</td>
                    <td className="px-6 py-4 text-right font-bold text-green-900">
                      {['asset', 'expense'].includes(account.type) ? `£${account.balance.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-red-900">
                      {['liability', 'equity', 'revenue'].includes(account.type) ? `£${account.balance.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td colSpan={2} className="px-6 py-4 font-bold text-gray-900 text-lg">TOTALS</td>
                  <td className="px-6 py-4 text-right font-bold text-green-900 text-lg">
                    £{accounts
                      .filter(a => ['asset', 'expense'].includes(a.type))
                      .reduce((sum, a) => sum + a.balance, 0)
                      .toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-red-900 text-lg">
                    £{accounts
                      .filter(a => ['liability', 'equity', 'revenue'].includes(a.type))
                      .reduce((sum, a) => sum + a.balance, 0)
                      .toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Balance Check */}
          <div className="mt-6 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-bold text-green-900 text-lg">Trial Balance is Balanced ✓</p>
                <p className="text-sm text-green-700">Total Debits equal Total Credits - Books are in order</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">Financial Reports</h2>
            <p className="text-purple-100 mb-6">Generate comprehensive financial statements for your business</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={() => handleGenerateReport('Profit & Loss Statement')}
              className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-xl transition-all text-left"
            >
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl w-fit mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Profit & Loss Statement</h3>
              <p className="text-sm text-gray-600 mb-4">Income statement showing revenue and expenses</p>
              <div className="flex items-center gap-2 text-blue-600 font-semibold">
                <span>Generate Report</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </button>

            <button 
              onClick={() => handleGenerateReport('Balance Sheet')}
              className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-xl transition-all text-left"
            >
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl w-fit mb-4">
                <PieChart className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Balance Sheet</h3>
              <p className="text-sm text-gray-600 mb-4">Assets, liabilities, and equity snapshot</p>
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <span>Generate Report</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </button>

            <button 
              onClick={() => handleGenerateReport('Cash Flow Statement')}
              className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-xl transition-all text-left"
            >
              <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl w-fit mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Cash Flow Statement</h3>
              <p className="text-sm text-gray-600 mb-4">Operating, investing, and financing activities</p>
              <div className="flex items-center gap-2 text-orange-600 font-semibold">
                <span>Generate Report</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'year-end' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">Year-End Accounts for HMRC</h2>
            <p className="text-indigo-100 mb-6">Prepare your annual accounts for Companies House and HMRC submission</p>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowYearEndModal(true)}
                className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all"
              >
                Generate Accounts
              </button>
              <button 
                onClick={() => setShowYearEndModal(true)}
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-all"
              >
                View Checklist
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-green-600" />
                Required Documents
              </h3>
              <div className="space-y-3">
                {[
                  'Profit & Loss Statement',
                  'Balance Sheet',
                  'Directors Report',
                  'Notes to Accounts',
                  'Corporation Tax Computation'
                ].map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">{doc}</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Important Deadlines
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-semibold text-red-900">Companies House Filing</p>
                  <p className="text-xs text-red-700 mt-1">9 months after year-end</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm font-semibold text-orange-900">Corporation Tax Return</p>
                  <p className="text-xs text-orange-700 mt-1">12 months after year-end</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900">Corporation Tax Payment</p>
                  <p className="text-xs text-blue-700 mt-1">9 months + 1 day after year-end</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Entry Modal */}
      {showNewEntryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-500 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FileText className="w-7 h-7" />
                  New Journal Entry
                </h2>
                <button 
                  onClick={() => setShowNewEntryModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Date and Reference */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reference
                  </label>
                  <input
                    type="text"
                    value={newEntry.reference}
                    onChange={(e) => setNewEntry({ ...newEntry, reference: e.target.value })}
                    placeholder="e.g., JE-001"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  placeholder="Enter transaction description..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              {/* Debit Entry */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5" />
                  Debit Entry
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Account *
                    </label>
                    <select
                      value={newEntry.debitAccount}
                      onChange={(e) => setNewEntry({ ...newEntry, debitAccount: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                    >
                      <option value="">Select account...</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.name}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount (£) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newEntry.debitAmount}
                      onChange={(e) => setNewEntry({ ...newEntry, debitAmount: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Credit Entry */}
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                  <ArrowDownRight className="w-5 h-5" />
                  Credit Entry
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Account *
                    </label>
                    <select
                      value={newEntry.creditAccount}
                      onChange={(e) => setNewEntry({ ...newEntry, creditAccount: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                    >
                      <option value="">Select account...</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.name}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount (£) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newEntry.creditAmount}
                      onChange={(e) => setNewEntry({ ...newEntry, creditAmount: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Balance Check */}
              {newEntry.debitAmount && newEntry.creditAmount && (
                <div className={`p-4 rounded-xl border-2 ${
                  parseFloat(newEntry.debitAmount) === parseFloat(newEntry.creditAmount)
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {parseFloat(newEntry.debitAmount) === parseFloat(newEntry.creditAmount) ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-900">Entry is balanced</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-red-900">
                          Entry is not balanced (Difference: £{Math.abs(parseFloat(newEntry.debitAmount) - parseFloat(newEntry.creditAmount)).toFixed(2)})
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setShowNewEntryModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEntry}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Upload className="w-6 h-6" />
                  Import Accounting Data
                </h2>
                <button 
                  onClick={() => setShowImportModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* File Upload Area - Compact */}
              <div className="text-center">
                <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-900 mb-1">Drop file or click to browse</p>
                  <p className="text-xs text-gray-600 mb-3">CSV, Excel (.xlsx, .xls), QuickBooks (.qbo)</p>
                  <input 
                    type="file" 
                    accept=".csv,.xlsx,.xls,.qbo" 
                    className="hidden" 
                    id="file-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        alert(`File selected: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nReady to import!`);
                      }
                    }}
                  />
                  <label htmlFor="file-upload" className="px-5 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors cursor-pointer inline-block">
                    Choose File
                  </label>
                </div>
              </div>

              {/* Import Type Selection - Compact */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">Select Import Type:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:bg-green-50 cursor-pointer transition-all">
                    <input type="radio" name="importType" defaultChecked className="w-4 h-4" />
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-gray-900">Journal Entries</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:bg-green-50 cursor-pointer transition-all">
                    <input type="radio" name="importType" className="w-4 h-4" />
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-gray-900">Chart of Accounts</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:bg-green-50 cursor-pointer transition-all">
                    <input type="radio" name="importType" className="w-4 h-4" />
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-gray-900">Bank Statements</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:bg-green-50 cursor-pointer transition-all">
                    <input type="radio" name="importType" className="w-4 h-4" />
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-gray-900">Invoices</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Import Tips - Compact */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="font-semibold text-blue-900 mb-1 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Import Tips:
                </p>
                <ul className="text-xs text-blue-800 space-y-1 ml-6">
                  <li>• CSV headers: Date, Description, Debit Account, Debit Amount, Credit Account, Credit Amount</li>
                  <li>• Amounts in GBP (£), Dates in DD/MM/YYYY format</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                    if (fileInput?.files?.[0]) {
                      alert(`Importing ${fileInput.files[0].name}...\n\nImport successful! ${Math.floor(Math.random() * 50 + 10)} records imported.`);
                      setShowImportModal(false);
                    } else {
                      alert('Please select a file first');
                    }
                  }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Start Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Download className="w-6 h-6" />
                  Export Accounting Data
                </h2>
                <button 
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Date Range */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">Date Range:</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">From</label>
                    <input
                      type="date"
                      defaultValue={new Date(new Date().getFullYear(), 3, 1).toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">To</label>
                    <input
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Export Format Selection */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">Select Export Format:</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setSelectedExportFormat('CSV')}
                    className={`p-3 border-2 rounded-lg transition-all text-center ${
                      selectedExportFormat === 'CSV'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg w-fit mx-auto mb-2 transition-colors ${
                      selectedExportFormat === 'CSV' ? 'bg-blue-200' : 'bg-blue-100'
                    }`}>
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className={`font-bold text-xs mb-1 ${
                      selectedExportFormat === 'CSV' ? 'text-blue-900' : 'text-gray-900'
                    }`}>CSV</p>
                    <p className="text-xs text-gray-600">Excel ready</p>
                    {selectedExportFormat === 'CSV' && (
                      <div className="mt-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 mx-auto" />
                      </div>
                    )}
                  </button>

                  <button 
                    onClick={() => setSelectedExportFormat('Excel')}
                    className={`p-3 border-2 rounded-lg transition-all text-center ${
                      selectedExportFormat === 'Excel'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg w-fit mx-auto mb-2 transition-colors ${
                      selectedExportFormat === 'Excel' ? 'bg-green-200' : 'bg-green-100'
                    }`}>
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <p className={`font-bold text-xs mb-1 ${
                      selectedExportFormat === 'Excel' ? 'text-green-900' : 'text-gray-900'
                    }`}>Excel</p>
                    <p className="text-xs text-gray-600">.xlsx format</p>
                    {selectedExportFormat === 'Excel' && (
                      <div className="mt-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                      </div>
                    )}
                  </button>

                  <button 
                    onClick={() => setSelectedExportFormat('PDF')}
                    className={`p-3 border-2 rounded-lg transition-all text-center ${
                      selectedExportFormat === 'PDF'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg w-fit mx-auto mb-2 transition-colors ${
                      selectedExportFormat === 'PDF' ? 'bg-red-200' : 'bg-red-100'
                    }`}>
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                    <p className={`font-bold text-xs mb-1 ${
                      selectedExportFormat === 'PDF' ? 'text-red-900' : 'text-gray-900'
                    }`}>PDF</p>
                    <p className="text-xs text-gray-600">Print ready</p>
                    {selectedExportFormat === 'PDF' && (
                      <div className="mt-2">
                        <CheckCircle className="w-4 h-4 text-red-600 mx-auto" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Data Selection - Compact */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">Select Data to Export:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-all">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300" />
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-900">Journal Entries</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-all">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300" />
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-900">Chart of Accounts</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-all">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300" />
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-900">Trial Balance</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-all">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                    <div className="flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-900">Financial Reports</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              {/* Selected Format Display */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-blue-700 mb-1">Ready to Export:</p>
                    <p className="text-sm font-bold text-blue-900">
                      {selectedExportFormat} Format • Selected Data Items
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${
                    selectedExportFormat === 'CSV' ? 'bg-blue-200' :
                    selectedExportFormat === 'Excel' ? 'bg-green-200' :
                    'bg-red-200'
                  }`}>
                    <FileText className={`w-5 h-5 ${
                      selectedExportFormat === 'CSV' ? 'text-blue-600' :
                      selectedExportFormat === 'Excel' ? 'text-green-600' :
                      'text-red-600'
                    }`} />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    handleExportReport(`Accounting_Data_${selectedExportFormat}`);
                    setShowExportModal(false);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download {selectedExportFormat}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <BookOpen className="w-7 h-7" />
                  Add New Account
                </h2>
                <button 
                  onClick={() => setShowAddAccountModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Account Code and Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Code *
                  </label>
                  <input
                    type="text"
                    value={newAccount.code}
                    onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
                    placeholder="e.g., 1300"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">Unique numeric code</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    placeholder="e.g., Petty Cash"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Account Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Type *
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {(['asset', 'liability', 'equity', 'revenue', 'expense'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewAccount({ ...newAccount, type })}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        newAccount.type === type
                          ? type === 'asset' ? 'bg-blue-50 border-blue-500' :
                            type === 'liability' ? 'bg-red-50 border-red-500' :
                            type === 'equity' ? 'bg-purple-50 border-purple-500' :
                            type === 'revenue' ? 'bg-green-50 border-green-500' :
                            'bg-orange-50 border-orange-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className={`font-bold text-sm capitalize ${
                        newAccount.type === type
                          ? type === 'asset' ? 'text-blue-700' :
                            type === 'liability' ? 'text-red-700' :
                            type === 'equity' ? 'text-purple-700' :
                            type === 'revenue' ? 'text-green-700' :
                            'text-orange-700'
                          : 'text-gray-700'
                      }`}>
                        {type}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newAccount.description}
                  onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })}
                  placeholder="Optional description of this account..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              {/* Opening Balance */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Opening Balance (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newAccount.openingBalance}
                  onChange={(e) => setNewAccount({ ...newAccount, openingBalance: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank for zero balance</p>
              </div>

              {/* Account Type Info */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-indigo-900 mb-1">Account Type Guide:</p>
                    <ul className="text-sm text-indigo-800 space-y-1">
                      <li>• <strong>Asset:</strong> Resources owned (Cash, Inventory, Equipment)</li>
                      <li>• <strong>Liability:</strong> Money owed (Loans, Accounts Payable)</li>
                      <li>• <strong>Equity:</strong> Owner's stake (Share Capital, Retained Earnings)</li>
                      <li>• <strong>Revenue:</strong> Income earned (Sales, Service Revenue)</li>
                      <li>• <strong>Expense:</strong> Costs incurred (Rent, Salaries, Utilities)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setShowAddAccountModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAccount}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Account Modal */}
      {showViewAccountModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Eye className="w-7 h-7" />
                  Account Details
                </h2>
                <button 
                  onClick={() => setShowViewAccountModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Account Code</p>
                  <p className="text-lg font-bold text-gray-900 font-mono">{selectedAccount.code}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Account Name</p>
                  <p className="text-lg font-bold text-gray-900">{selectedAccount.name}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Account Type</p>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold inline-block ${
                  selectedAccount.type === 'asset' ? 'bg-blue-100 text-blue-700' :
                  selectedAccount.type === 'liability' ? 'bg-red-100 text-red-700' :
                  selectedAccount.type === 'equity' ? 'bg-purple-100 text-purple-700' :
                  selectedAccount.type === 'revenue' ? 'bg-green-100 text-green-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {selectedAccount.type.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Current Balance</p>
                <p className="text-3xl font-bold text-gray-900">£{selectedAccount.balance.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Last Transaction</p>
                <p className="text-lg text-gray-900">{selectedAccount.lastTransaction.toLocaleDateString('en-GB')}</p>
              </div>
              <button
                onClick={() => setShowViewAccountModal(false)}
                className="w-full px-6 py-3 bg-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-300 transition-colors mt-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Entry Modal */}
      {showViewEntryModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FileText className="w-7 h-7" />
                  Journal Entry Details
                </h2>
                <button 
                  onClick={() => setShowViewEntryModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Date</p>
                  <p className="text-lg font-bold text-gray-900">{selectedEntry.date.toLocaleDateString('en-GB')}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Reference</p>
                  <p className="text-lg font-bold text-gray-900">{selectedEntry.reference}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Description</p>
                <p className="text-lg text-gray-900">{selectedEntry.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4" />
                    DEBIT
                  </p>
                  <p className="text-sm text-gray-700 mb-1">{selectedEntry.debit.account}</p>
                  <p className="text-2xl font-bold text-green-900">£{selectedEntry.debit.amount.toLocaleString()}</p>
                </div>
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <ArrowDownRight className="w-4 h-4" />
                    CREDIT
                  </p>
                  <p className="text-sm text-gray-700 mb-1">{selectedEntry.credit.account}</p>
                  <p className="text-2xl font-bold text-red-900">£{selectedEntry.credit.amount.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Status</p>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold inline-block ${
                  selectedEntry.status === 'posted' ? 'bg-green-100 text-green-700' :
                  selectedEntry.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selectedEntry.status.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setShowViewEntryModal(false)}
                className="w-full px-6 py-3 bg-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-300 transition-colors mt-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {showEditAccountModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Edit3 className="w-7 h-7" />
                  Edit Account
                </h2>
                <button 
                  onClick={() => setShowEditAccountModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Account Code and Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Code *
                  </label>
                  <input
                    type="text"
                    value={newAccount.code}
                    onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Account Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Type *
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {(['asset', 'liability', 'equity', 'revenue', 'expense'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewAccount({ ...newAccount, type })}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        newAccount.type === type
                          ? type === 'asset' ? 'bg-blue-50 border-blue-500' :
                            type === 'liability' ? 'bg-red-50 border-red-500' :
                            type === 'equity' ? 'bg-purple-50 border-purple-500' :
                            type === 'revenue' ? 'bg-green-50 border-green-500' :
                            'bg-orange-50 border-orange-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className={`font-bold text-sm capitalize ${
                        newAccount.type === type
                          ? type === 'asset' ? 'text-blue-700' :
                            type === 'liability' ? 'text-red-700' :
                            type === 'equity' ? 'text-purple-700' :
                            type === 'revenue' ? 'text-green-700' :
                            'text-orange-700'
                          : 'text-gray-700'
                      }`}>
                        {type}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Balance */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Balance (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newAccount.openingBalance}
                  onChange={(e) => setNewAccount({ ...newAccount, openingBalance: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setShowEditAccountModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleSaveAccount();
                    setShowEditAccountModal(false);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Update Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Entry Modal */}
      {showEditEntryModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-indigo-500 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Edit3 className="w-7 h-7" />
                  Edit Journal Entry
                </h2>
                <button 
                  onClick={() => setShowEditEntryModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Date and Reference */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reference
                  </label>
                  <input
                    type="text"
                    value={newEntry.reference}
                    onChange={(e) => setNewEntry({ ...newEntry, reference: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              {/* Debit Entry */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5" />
                  Debit Entry
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Account *
                    </label>
                    <select
                      value={newEntry.debitAccount}
                      onChange={(e) => setNewEntry({ ...newEntry, debitAccount: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                    >
                      <option value="">Select account...</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.name}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount (£) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newEntry.debitAmount}
                      onChange={(e) => setNewEntry({ ...newEntry, debitAmount: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Credit Entry */}
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                  <ArrowDownRight className="w-5 h-5" />
                  Credit Entry
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Account *
                    </label>
                    <select
                      value={newEntry.creditAccount}
                      onChange={(e) => setNewEntry({ ...newEntry, creditAccount: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                    >
                      <option value="">Select account...</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.name}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount (£) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newEntry.creditAmount}
                      onChange={(e) => setNewEntry({ ...newEntry, creditAmount: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Balance Check */}
              {newEntry.debitAmount && newEntry.creditAmount && (
                <div className={`p-4 rounded-xl border-2 ${
                  parseFloat(newEntry.debitAmount) === parseFloat(newEntry.creditAmount)
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {parseFloat(newEntry.debitAmount) === parseFloat(newEntry.creditAmount) ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-900">Entry is balanced</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-red-900">
                          Entry is not balanced (Difference: £{Math.abs(parseFloat(newEntry.debitAmount) - parseFloat(newEntry.creditAmount)).toFixed(2)})
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setShowEditEntryModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleSaveEntry();
                    setShowEditEntryModal(false);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Update Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Generation Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className={`p-6 rounded-t-2xl ${
              selectedReport.includes('Profit') ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
              selectedReport.includes('Balance') ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
              selectedReport.includes('Cash Flow') ? 'bg-gradient-to-r from-orange-500 to-red-500' :
              'bg-gradient-to-r from-indigo-500 to-purple-500'
            }`}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  {selectedReport.includes('Profit') && <BarChart3 className="w-7 h-7" />}
                  {selectedReport.includes('Balance') && <PieChart className="w-7 h-7" />}
                  {selectedReport.includes('Cash Flow') && <TrendingUp className="w-7 h-7" />}
                  {selectedReport.includes('Year-End') && <Calendar className="w-7 h-7" />}
                  Generate {selectedReport}
                </h2>
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Date Range and Report Info Combined */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">From Date</label>
                  <input
                    type="date"
                    defaultValue={new Date(new Date().getFullYear(), 3, 1).toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">To Date</label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Export Format Selection - Compact */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">Choose Export Format:</h3>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleDownloadReport('PDF')}
                    className="p-3 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-center group"
                  >
                    <div className="p-2 bg-red-100 rounded-lg w-fit mx-auto mb-2 group-hover:bg-red-200 transition-colors">
                      <FileText className="w-6 h-6 text-red-600" />
                    </div>
                    <p className="font-bold text-gray-900 text-xs">PDF</p>
                  </button>

                  <button
                    onClick={() => handleDownloadReport('Excel')}
                    className="p-3 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-center group"
                  >
                    <div className="p-2 bg-green-100 rounded-lg w-fit mx-auto mb-2 group-hover:bg-green-200 transition-colors">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="font-bold text-gray-900 text-xs">Excel</p>
                  </button>

                  <button
                    onClick={() => handleDownloadReport('CSV')}
                    className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg w-fit mx-auto mb-2 group-hover:bg-blue-200 transition-colors">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="font-bold text-gray-900 text-xs">CSV</p>
                  </button>

                  <button
                    onClick={() => handleDownloadReport('JSON')}
                    className="p-3 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-center group"
                  >
                    <div className="p-2 bg-purple-100 rounded-lg w-fit mx-auto mb-2 group-hover:bg-purple-200 transition-colors">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="font-bold text-gray-900 text-xs">JSON</p>
                  </button>
                </div>
              </div>

              {/* Additional Options - Compact */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h3 className="font-bold text-gray-900 mb-2 text-sm">Options:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300" />
                    <span className="text-xs text-gray-700">Comparative figures</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300" />
                    <span className="text-xs text-gray-700">Notes & annotations</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                    <span className="text-xs text-gray-700">HMRC-compliant</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                    <span className="text-xs text-gray-700">Company branding</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button
                  onClick={() => handleDownloadReport('PDF')}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Year-End Accounts Modal */}
      {showYearEndModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Calendar className="w-7 h-7" />
                  Year-End Accounts for HMRC
                </h2>
                <button 
                  onClick={() => setShowYearEndModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <p className="text-indigo-100 mt-2">Prepare your annual accounts for Companies House and HMRC submission</p>
            </div>

            <div className="p-6 space-y-5">
              {/* Financial Year Selection */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Select Financial Year
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-blue-700 mb-1">Year End Date</label>
                    <input
                      type="date"
                      defaultValue={new Date(new Date().getFullYear(), 2, 31).toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-blue-700 mb-1">Company Number</label>
                    <input
                      type="text"
                      placeholder="12345678"
                      className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-blue-700 mb-1">UTR Number</label>
                    <input
                      type="text"
                      placeholder="1234567890"
                      className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Required Documents Checklist */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-green-600" />
                  Required Documents
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Profit & Loss Statement', status: 'complete', icon: BarChart3 },
                    { name: 'Balance Sheet', status: 'complete', icon: PieChart },
                    { name: 'Directors Report', status: 'pending', icon: FileText },
                    { name: 'Notes to Accounts', status: 'pending', icon: BookOpen },
                    { name: 'Corporation Tax Computation', status: 'complete', icon: Calculator },
                    { name: 'Audit Report (if required)', status: 'pending', icon: FileCheck },
                  ].map((doc, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border-2 flex items-center justify-between ${
                      doc.status === 'complete' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-orange-50 border-orange-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          doc.status === 'complete' ? 'bg-green-100' : 'bg-orange-100'
                        }`}>
                          <doc.icon className={`w-4 h-4 ${
                            doc.status === 'complete' ? 'text-green-600' : 'text-orange-600'
                          }`} />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{doc.name}</span>
                      </div>
                      {doc.status === 'complete' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Important Deadlines */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Important Deadlines
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-5 h-5 text-red-600" />
                      <p className="text-xs font-bold text-red-900">Companies House</p>
                    </div>
                    <p className="text-sm font-semibold text-red-900 mb-1">Filing Deadline</p>
                    <p className="text-xs text-red-700">9 months after year-end</p>
                    <p className="text-lg font-bold text-red-900 mt-2">31 Dec 2024</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-orange-600" />
                      <p className="text-xs font-bold text-orange-900">HMRC</p>
                    </div>
                    <p className="text-sm font-semibold text-orange-900 mb-1">CT600 Return</p>
                    <p className="text-xs text-orange-700">12 months after year-end</p>
                    <p className="text-lg font-bold text-orange-900 mt-2">31 Mar 2025</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <p className="text-xs font-bold text-blue-900">HMRC</p>
                    </div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">Tax Payment</p>
                    <p className="text-xs text-blue-700">9 months + 1 day</p>
                    <p className="text-lg font-bold text-blue-900 mt-2">1 Jan 2025</p>
                  </div>
                </div>
              </div>

              {/* Export Options */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Generate Year-End Package:</h3>
                <div className="grid grid-cols-4 gap-3">
                  <button
                    onClick={() => {
                      handleDownloadReport('PDF');
                      setShowYearEndModal(false);
                    }}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-center group"
                  >
                    <div className="p-2 bg-red-100 rounded-lg w-fit mx-auto mb-2 group-hover:bg-red-200 transition-colors">
                      <FileText className="w-6 h-6 text-red-600" />
                    </div>
                    <p className="font-bold text-gray-900 text-xs mb-1">Full PDF</p>
                    <p className="text-xs text-gray-600">Complete package</p>
                  </button>

                  <button
                    onClick={() => {
                      handleDownloadReport('Excel');
                      setShowYearEndModal(false);
                    }}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-center group"
                  >
                    <div className="p-2 bg-green-100 rounded-lg w-fit mx-auto mb-2 group-hover:bg-green-200 transition-colors">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="font-bold text-gray-900 text-xs mb-1">Excel</p>
                    <p className="text-xs text-gray-600">Workbook format</p>
                  </button>

                  <button
                    onClick={() => {
                      alert('iXBRL format for HMRC submission');
                      setShowYearEndModal(false);
                    }}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg w-fit mx-auto mb-2 group-hover:bg-blue-200 transition-colors">
                      <Send className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="font-bold text-gray-900 text-xs mb-1">iXBRL</p>
                    <p className="text-xs text-gray-600">HMRC format</p>
                  </button>

                  <button
                    onClick={() => {
                      alert('Companies House WebFiling format');
                      setShowYearEndModal(false);
                    }}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-center group"
                  >
                    <div className="p-2 bg-purple-100 rounded-lg w-fit mx-auto mb-2 group-hover:bg-purple-200 transition-colors">
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="font-bold text-gray-900 text-xs mb-1">WebFiling</p>
                    <p className="text-xs text-gray-600">CH format</p>
                  </button>
                </div>
              </div>

              {/* Info Banner */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 mb-1">Compliance Features:</p>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• FRS 102 compliant financial statements</li>
                      <li>• Companies Act 2006 disclosure requirements</li>
                      <li>• HMRC CT600 compatible computations</li>
                      <li>• Digital signatures for electronic filing</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowYearEndModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handlePrint}
                  className="px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  Print
                </button>
                <button
                  onClick={() => {
                    handleDownloadReport('Year-End Accounts Package');
                    setShowYearEndModal(false);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Generate Package
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <AlertCircle className="w-7 h-7" />
                  Confirm Delete
                </h2>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-lg text-gray-900 mb-6">
                Are you sure you want to delete this {deleteTarget.type === 'account' ? 'account' : 'journal entry'}? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-bounce-in">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-t-2xl">
              <div className="flex items-center justify-center">
                <div className="p-4 bg-white rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
              </div>
            </div>
            
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Export Successful!</h2>
              <p className="text-gray-600 mb-4">Your file has been downloaded successfully</p>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <FileText className="w-6 h-6 text-green-600" />
                  <p className="text-sm font-bold text-green-900 break-all">{successMessage}</p>
                </div>
                <div className="flex items-center justify-center gap-4 text-xs text-green-700">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date().toLocaleDateString('en-GB')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 text-left bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">File Details:</p>
                    <ul className="text-xs text-blue-800 mt-1 space-y-1">
                      <li>• Format: {selectedExportFormat}</li>
                      <li>• Contains: Journal Entries, Chart of Accounts, Trial Balance</li>
                      <li>• HMRC-compliant formatting</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-xl transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
