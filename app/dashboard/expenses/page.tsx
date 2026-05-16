"use client";

import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import {
  Plus, Search, TrendingDown, Download, Receipt, Edit,
  Trash2, X, Upload, BarChart3, PieChart, DollarSign,
  ShoppingBag, Building2, Coffee, Car, Zap, Target,
  Loader2, Tag, Filter, ArrowUpRight,
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import StatusModal from '@/components/StatusModal';

/* ── Interfaces ──────────────────────────────────────────────────── */
interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  receipt?: string;
  vendor?: string;
  paymentMethod?: string;
  status?: string;
  notes?: string;
}

interface PrismaExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

/* ── Shared styles ───────────────────────────────────────────────── */
const inputCls = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2 sm:py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all";
const labelCls = "block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 sm:mb-1.5";

/* ── Modal shell components ──────────────────────────────────────── */
const ModalShell = ({ children, maxW = 'sm:max-w-lg', onClose }: {
  children: ReactNode;
  maxW?: string;
  onClose?: () => void;
}) => (
  <div
    className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-4 sm:p-4 pb-10 sm:pb-4"
    onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
  >
    <div className={`bg-white rounded-t-3xl sm:rounded-2xl w-full ${maxW} max-h-[75dvh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-white/20 transform animate-in slide-in-from-bottom-10 duration-300`}>
      {children}
    </div>
  </div>
);

const ModalHandle = () => (
  <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
    <div className="w-10 h-1 rounded-full bg-gray-200" />
  </div>
);

const ModalFooter = ({ children }: { children: ReactNode }) => (
  <div className="px-4 sm:px-6 py-1.5 sm:py-4 border-t border-gray-100 bg-white flex flex-row gap-2.5 pb-[calc(1.25rem+env(safe-area-inset-bottom,8px))] sm:pb-4 shrink-0">
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

/* ════════════════════════════════════════════════════════════════════ */
export default function ExpensesPage() {
  const [expenses, setExpenses]             = useState<Expense[]>([]);
  const [loading, setLoading]               = useState(true);
  const [searchTerm, setSearchTerm]         = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAddModal, setShowAddModal]     = useState(false);
  const [showEditModal, setShowEditModal]   = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense]   = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense]   = useState<Expense | null>(null);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: 0,
    category: 'Office',
    date: new Date().toISOString().split('T')[0],
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info';
  }>({ isOpen: false, title: '', message: '', type: 'success' });

  /* ── Category config ─────────────────────────────────────────── */
  const categories = [
    { name: 'Office',    icon: Building2,  color: 'bg-blue-500'   },
    { name: 'Software',  icon: Zap,        color: 'bg-purple-500' },
    { name: 'Meals',     icon: Coffee,     color: 'bg-orange-500' },
    { name: 'Travel',    icon: Car,        color: 'bg-emerald-500'},
    { name: 'Marketing', icon: Target,     color: 'bg-indigo-500' },
    { name: 'Rent',      icon: Building2,  color: 'bg-teal-500'   },
    { name: 'Utilities', icon: Zap,        color: 'bg-amber-500'  },
    { name: 'Other',     icon: ShoppingBag,color: 'bg-gray-500'   },
  ];

  const getCategoryInfo = (name: string) =>
    categories.find(c => c.name === name) ?? categories[categories.length - 1];

  /* ── Derived values ──────────────────────────────────────────── */
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch   = exp.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || exp.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const avgExpense    = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;

  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  /* ── Data fetching ───────────────────────────────────────────── */
  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/expenses');
      const data = await response.json();
      if (Array.isArray(data)) {
        setExpenses(data.map((exp: PrismaExpense) => ({ ...exp, title: exp.description })));
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  /* ── Handlers ────────────────────────────────────────────────── */
  const resetNewExpense = () => {
    setNewExpense({ title: '', amount: 0, category: 'Office', date: new Date().toISOString().split('T')[0] });
    setSelectedFile(null);
  };

  const handleAddExpense = async () => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense),
      });
      if (!response.ok) throw new Error('Failed to save expense');
      const saved = await response.json();
      setExpenses([{ ...saved, title: saved.description }, ...expenses]);
      setShowAddModal(false);
      resetNewExpense();
      setSelectedFile(null);
      setStatusModal({ isOpen: true, title: 'Expense Added', message: 'Your new expense has been successfully recorded.', type: 'success' });
    } catch (error) {
      console.error('Error adding expense:', error);
      setStatusModal({ isOpen: true, title: 'Error', message: 'Failed to add expense. Please try again.', type: 'error' });
    }
  };

  const handleDeleteExpense = (expense: Expense) => {
    setDeletingExpense(expense);
    setShowDeleteModal(true);
  };

  const handleEditExpense = async () => {
    if (!selectedExpense) return;
    try {
      const response = await fetch(`/api/expenses/${selectedExpense.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedExpense),
      });
      if (!response.ok) throw new Error('Failed to update expense');
      const updated = await response.json();
      setExpenses(expenses.map(exp =>
        exp.id === updated.id ? { ...updated, title: updated.description } : exp
      ));
      setShowEditModal(false);
      setSelectedExpense(null);
      setStatusModal({ isOpen: true, title: 'Expense Updated', message: 'The expense details have been successfully updated.', type: 'success' });
    } catch (error) {
      console.error('Error updating expense:', error);
      setStatusModal({ isOpen: true, title: 'Error', message: 'Failed to update expense. Please try again.', type: 'error' });
    }
  };

  const handleExport = () => {
    const headers = ['Title', 'Category', 'Vendor', 'Payment Method', 'Date', 'Amount', 'Status', 'Notes'];
    const rows = filteredExpenses.map(exp => [
      exp.title, exp.category, exp.vendor, exp.paymentMethod,
      exp.date, exp.amount, exp.status || 'N/A', exp.notes || '',
    ]);
    let csv = 'Expense Report\n';
    csv += `Generated: ${new Date().toLocaleDateString()}\n`;
    csv += `Total Expenses: £${totalExpenses.toLocaleString()}\n\n`;
    csv += headers.join(',') + '\n';
    csv += rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusModal({ isOpen: true, title: 'Export Complete', message: 'Your expenses have been successfully exported to CSV.', type: 'success' });
  };

  /* ══════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8">

      {/* ── Sticky Header ────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-rose-500 rounded-xl shrink-0">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Expenses</h1>
              <p className="text-xs text-gray-400 leading-tight hidden sm:block">Track & manage spending</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Expense</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="sm:hidden fixed bottom-24 right-6 w-14 h-14 bg-rose-500 text-white rounded-full shadow-2xl flex items-center justify-center z-30 active:scale-95 transition-all cursor-pointer hover:bg-rose-600"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-4 space-y-4 max-w-4xl mx-auto">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Total Spent',
              value: `£${totalExpenses.toLocaleString()}`,
              sub:   `${filteredExpenses.length} records`,
              icon:  TrendingDown,
              bg:    'bg-rose-500',
            },
            {
              label: 'Avg per Item',
              value: `£${Math.round(avgExpense).toLocaleString()}`,
              sub:   'per transaction',
              icon:  BarChart3,
              bg:    'bg-blue-500',
            },
            {
              label: 'Categories',
              value: String(Object.keys(categoryTotals).length),
              sub:   'spending types',
              icon:  PieChart,
              bg:    'bg-purple-500',
            },
            {
              label: 'Top Category',
              value: topCategory ? topCategory[0] : '—',
              sub:   topCategory ? `£${topCategory[1].toLocaleString()}` : 'No data',
              icon:  Tag,
              bg:    'bg-amber-500',
            },
          ].map(({ label, value, sub, icon: Icon, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 ${bg} rounded-xl`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-300" />
              </div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 leading-tight truncate">{value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold border rounded-xl transition-colors cursor-pointer ${
                filterCategory !== 'all'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">{filterCategory !== 'all' ? filterCategory : 'Filter'}</span>
            </button>
            {showFilterMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFilterMenu(false)} />
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50">
                  {['all', ...categories.map(c => c.name)].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setFilterCategory(cat); setShowFilterMenu(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2.5 transition-colors cursor-pointer ${
                        filterCategory === cat ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${filterCategory === cat ? 'bg-blue-600' : 'bg-gray-300'}`} />
                      {cat === 'all' ? 'All Categories' : cat}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        {Object.keys(categoryTotals).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="w-4 h-4 text-purple-500" />
              <h2 className="text-sm font-bold text-gray-700">Breakdown by Category</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([name, amount]) => {
                const info = getCategoryInfo(name);
                const Icon = info.icon;
                const pct  = totalExpenses > 0 ? (amount / totalExpenses * 100).toFixed(0) : '0';
                return (
                  <div key={name} className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className={`p-1.5 ${info.color} rounded-lg shrink-0`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-gray-500 truncate">{name}</p>
                      <p className="text-xs font-bold text-gray-900">£{amount.toLocaleString()}</p>
                    </div>
                    <span className="text-[11px] font-bold text-gray-400 shrink-0">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Expenses List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-bold text-gray-700">Recent Expenses</h2>
            </div>
            {filteredExpenses.length > 0 && (
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {filteredExpenses.length}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
              <p className="text-sm text-gray-400 font-medium">Loading expenses...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="p-4 bg-gray-100 rounded-2xl">
                <Receipt className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 font-medium">No expenses found</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add first expense
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredExpenses.map((expense) => {
                const info = getCategoryInfo(expense.category);
                const Icon = info.icon;
                return (
                  <div key={expense.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/80 transition-colors">
                    <div className={`p-2.5 ${info.color} rounded-xl shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{expense.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">
                          {expense.category}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {new Date(expense.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-sm font-bold text-gray-900 mr-1">
                        £{expense.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => { setSelectedExpense(expense); setShowEditModal(true); }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Add Expense Modal ─────────────────────────────────────── */}
      {showAddModal && (
        <ModalShell onClose={() => { setShowAddModal(false); resetNewExpense(); }}>
          <ModalHandle />
          <div className="bg-linear-to-r from-rose-500 to-pink-600 px-4 sm:px-6 py-2.5 sm:py-5 flex items-center justify-between shrink-0 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md border border-white/20">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight">Add Expense</h2>
            </div>
            <button
              onClick={() => { setShowAddModal(false); resetNewExpense(); }}
              className="p-2.5 hover:bg-white/20 rounded-xl transition-all cursor-pointer text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-2 sm:py-4 space-y-2.5 sm:space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="hidden"
              accept="image/*,.pdf"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-2 sm:p-4 flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-2 cursor-pointer transition-all ${
                selectedFile 
                  ? 'border-green-400 bg-green-50/30' 
                  : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/30'
              }`}
            >
              <div className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl shrink-0 ${
                selectedFile ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <Upload className={`w-4 h-4 sm:w-5 sm:h-5 ${selectedFile ? 'text-green-600' : 'text-gray-500'}`} />
              </div>
              <div className="text-left sm:text-center min-w-0 flex-1 sm:flex-none">
                <p className={`text-sm font-semibold leading-tight truncate ${selectedFile ? 'text-green-700' : 'text-gray-600'}`}>
                  {selectedFile ? selectedFile.name : 'Upload Receipt'}
                </p>
                <p className="text-[10px] text-gray-400">
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Drag & drop or click to browse'}
                </p>
              </div>
              {selectedFile && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            <div>
              <label className={labelCls}>Title</label>
              <input
                type="text"
                value={newExpense.title}
                onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                className={inputCls}
                placeholder="e.g., Office Supplies"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={labelCls}>Amount (£)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                    className={`${inputCls} pl-9`}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Date</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Category</label>
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className={`${inputCls} cursor-pointer`}
              >
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <ModalFooter>
            <CancelBtn onClick={() => { setShowAddModal(false); resetNewExpense(); }} />
            <button
              onClick={handleAddExpense}
              className="w-full sm:flex-[2] py-3 px-5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Receipt className="w-4 h-4" /> Save Expense
            </button>
          </ModalFooter>
        </ModalShell>
      )}

      {/* ── Edit Expense Modal ────────────────────────────────────── */}
      {showEditModal && selectedExpense && (
        <ModalShell onClose={() => { setShowEditModal(false); setSelectedExpense(null); }}>
          <ModalHandle />
          <div className="bg-linear-to-r from-blue-500 to-indigo-600 px-4 sm:px-6 py-2.5 sm:py-5 flex items-center justify-between shrink-0 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md border border-white/20">
                <Edit className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight">Edit Expense</h2>
            </div>
            <button
              onClick={() => { setShowEditModal(false); setSelectedExpense(null); }}
              className="p-2.5 hover:bg-white/20 rounded-xl transition-all cursor-pointer text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-2 sm:py-4 space-y-2.5 sm:space-y-4">
            <div>
              <label className={labelCls}>Title</label>
              <input
                type="text"
                value={selectedExpense.title}
                onChange={(e) => setSelectedExpense({ ...selectedExpense, title: e.target.value })}
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={labelCls}>Amount (£)</label>
                <input
                  type="number"
                  value={selectedExpense.amount}
                  onChange={(e) => setSelectedExpense({ ...selectedExpense, amount: parseFloat(e.target.value) || 0 })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Date</label>
                <input
                  type="date"
                  value={selectedExpense.date}
                  onChange={(e) => setSelectedExpense({ ...selectedExpense, date: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Category</label>
              <select
                value={selectedExpense.category}
                onChange={(e) => setSelectedExpense({ ...selectedExpense, category: e.target.value })}
                className={`${inputCls} cursor-pointer`}
              >
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <ModalFooter>
            <CancelBtn onClick={() => { setShowEditModal(false); setSelectedExpense(null); }} />
            <button
              onClick={handleEditExpense}
              className="w-full sm:flex-[2] py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Edit className="w-4 h-4" /> Update Expense
            </button>
          </ModalFooter>
        </ModalShell>
      )}

      {/* ── Delete Modal ──────────────────────────────────────────── */}
      {deletingExpense && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeletingExpense(null); }}
          onConfirm={async () => {
            try {
              const response = await fetch(`/api/expenses/${deletingExpense.id}`, { method: 'DELETE' });
              if (!response.ok) throw new Error('Failed to delete expense');
              setExpenses(expenses.filter(exp => exp.id !== deletingExpense.id));
              setShowDeleteModal(false);
              setDeletingExpense(null);
              setStatusModal({ isOpen: true, title: 'Expense Deleted', message: 'The expense record has been permanently removed.', type: 'success' });
            } catch (error) {
              console.error('Error deleting expense:', error);
              setStatusModal({ isOpen: true, title: 'Error', message: 'Failed to delete expense. Please try again.', type: 'error' });
            }
          }}
          title="Delete Expense"
          itemName={deletingExpense.title}
          itemDetails={`£${deletingExpense.amount} - ${deletingExpense.vendor}`}
          warningMessage="This will permanently remove this expense record."
        />
      )}

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
      />
    </div>
  );
}
