"use client";

import React, { useState } from 'react';
import { 
  Plus, Search, TrendingDown, Filter, Calendar, Tag, Receipt, Edit, 
  Trash2, X, Upload, Download, BarChart3, PieChart, DollarSign,
  CreditCard, Wallet, ShoppingBag, Building2, Coffee, Car, Zap,
  ArrowUpRight, ArrowDownRight, Eye, MoreVertical, CheckCircle,
  AlertCircle, TrendingUp, Activity, Target, Sparkles, FileText
} from 'lucide-react';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  vendor: string;
  paymentMethod: string;
  receipt?: string;
  notes?: string;
  status?: 'pending' | 'approved' | 'reimbursed';
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', title: 'Office Supplies', amount: 250, category: 'Office', date: '2024-12-01', vendor: 'Staples', paymentMethod: 'Card', notes: 'Printer paper and pens', status: 'approved' },
    { id: '2', title: 'Software Subscription', amount: 99, category: 'Software', date: '2024-12-02', vendor: 'Adobe', paymentMethod: 'Card', notes: 'Monthly Creative Cloud', status: 'approved' },
    { id: '3', title: 'Client Lunch', amount: 85, category: 'Meals', date: '2024-12-03', vendor: 'Restaurant', paymentMethod: 'Card', notes: 'Meeting with client', status: 'reimbursed' },
    { id: '4', title: 'Travel - Train', amount: 120, category: 'Travel', date: '2024-12-04', vendor: 'Rail Company', paymentMethod: 'Card', status: 'pending' },
    { id: '5', title: 'Marketing Materials', amount: 340, category: 'Marketing', date: '2024-12-05', vendor: 'Print Shop', paymentMethod: 'Bank Transfer', status: 'approved' },
    { id: '6', title: 'Office Rent', amount: 1500, category: 'Rent', date: '2024-12-01', vendor: 'Property Management', paymentMethod: 'Bank Transfer', status: 'approved' },
    { id: '7', title: 'Team Coffee', amount: 45, category: 'Meals', date: '2024-12-06', vendor: 'Starbucks', paymentMethod: 'Card', status: 'pending' },
    { id: '8', title: 'Cloud Storage', amount: 29, category: 'Software', date: '2024-12-07', vendor: 'Dropbox', paymentMethod: 'Card', status: 'approved' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: 0,
    category: 'Office',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    paymentMethod: 'Card',
    notes: '',
    status: 'pending' as 'pending' | 'approved' | 'reimbursed'
  });

  const categories = [
    { name: 'Office', icon: Building2, color: 'from-blue-500 to-cyan-500' },
    { name: 'Software', icon: Zap, color: 'from-purple-500 to-pink-500' },
    { name: 'Meals', icon: Coffee, color: 'from-orange-500 to-red-500' },
    { name: 'Travel', icon: Car, color: 'from-green-500 to-emerald-500' },
    { name: 'Marketing', icon: Target, color: 'from-indigo-500 to-purple-500' },
    { name: 'Rent', icon: Building2, color: 'from-teal-500 to-cyan-500' },
    { name: 'Utilities', icon: Zap, color: 'from-yellow-500 to-orange-500' },
    { name: 'Other', icon: ShoppingBag, color: 'from-gray-500 to-gray-600' },
  ];
  
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         expense.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const avgExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;
  
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const statusCounts = {
    pending: expenses.filter(e => e.status === 'pending').length,
    approved: expenses.filter(e => e.status === 'approved').length,
    reimbursed: expenses.filter(e => e.status === 'reimbursed').length,
  };

  const handleAddExpense = () => {
    const expense: Expense = {
      id: String(expenses.length + 1),
      ...newExpense
    };
    setExpenses([...expenses, expense]);
    setShowAddModal(false);
    setNewExpense({
      title: '',
      amount: 0,
      category: 'Office',
      date: new Date().toISOString().split('T')[0],
      vendor: '',
      paymentMethod: 'Card',
      notes: '',
      status: 'pending'
    });
    alert('✓ Expense added successfully!');
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('⚠️ Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(exp => exp.id !== id));
      alert('✓ Expense deleted successfully!');
    }
  };

  const handleEditExpense = () => {
    if (selectedExpense) {
      setExpenses(expenses.map(exp => 
        exp.id === selectedExpense.id ? selectedExpense : exp
      ));
      setShowEditModal(false);
      setSelectedExpense(null);
      alert('✓ Expense updated successfully!');
    }
  };

  const handleExport = () => {
    const headers = ['Title', 'Category', 'Vendor', 'Payment Method', 'Date', 'Amount', 'Status', 'Notes'];
    const rows = filteredExpenses.map(exp => [
      exp.title,
      exp.category,
      exp.vendor,
      exp.paymentMethod,
      exp.date,
      exp.amount,
      exp.status || 'N/A',
      exp.notes || ''
    ]);
    
    let csv = 'Expense Report\n';
    csv += `Generated: ${new Date().toLocaleDateString()}\n`;
    csv += `Total Expenses: £${totalExpenses.toLocaleString()}\n\n`;
    csv += headers.join(',') + '\n';
    csv += rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('✓ Expenses exported successfully!');
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category || categories[categories.length - 1];
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Receipt className="w-10 h-10" />
              Expense Tracker
            </h1>
            <p className="text-red-100 text-lg">Track and manage your business expenses efficiently</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExport}
              className="px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl hover:bg-opacity-30 transition-all font-semibold flex items-center gap-2 cursor-pointer"
              style={{ color: 'var(--color-purple-600)' }}
            >
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-white rounded-xl hover:shadow-2xl transition-all font-bold flex items-center gap-2 cursor-pointer"
              style={{ color: 'var(--color-purple-600)' }}
            >
              <Plus className="w-5 h-5" />
              Add Expense
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 border-2 border-red-200 hover:shadow-2xl hover:scale-105 transition-all cursor-pointer overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-red-500 to-rose-500 opacity-10 rounded-full group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-100 text-red-700">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-bold">+8%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Total Expenses</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">£{totalExpenses.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{filteredExpenses.length} expenses tracked</p>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 hover:shadow-2xl hover:scale-105 transition-all cursor-pointer overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-500 opacity-10 rounded-full group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-100 text-blue-700">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-bold">Avg</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Average Expense</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">£{Math.round(avgExpense)}</p>
            <p className="text-xs text-gray-500">per transaction</p>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 hover:shadow-2xl hover:scale-105 transition-all cursor-pointer overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 opacity-10 rounded-full group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-100 text-purple-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-bold">{Object.keys(categoryTotals).length}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Categories</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">{Object.keys(categoryTotals).length}</p>
            <p className="text-xs text-gray-500">active categories</p>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200 hover:shadow-2xl hover:scale-105 transition-all cursor-pointer overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-orange-500 to-yellow-500 opacity-10 rounded-full group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-600 shadow-lg">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-orange-100 text-orange-700">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-bold">Top</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Top Category</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {Object.keys(categoryTotals).length > 0 
                ? Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0][0]
                : 'N/A'}
            </p>
            <p className="text-xs text-gray-500">
              £{Object.keys(categoryTotals).length > 0 
                ? Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0][1].toLocaleString()
                : 0} spent
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses by title or vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 font-medium shadow-sm transition-all cursor-pointer"
          >
            <Filter className="w-5 h-5 text-gray-600" />
            {filterCategory !== 'all' ? filterCategory : 'All Categories'}
          </button>
          {showFilterMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowFilterMenu(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-gray-200 py-2 z-50">
                <button
                  onClick={() => {
                    setFilterCategory('all');
                    setShowFilterMenu(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                    filterCategory === 'all' ? 'bg-red-50 text-red-700 font-semibold' : 'text-gray-700'
                  }`}
                >
                  {filterCategory === 'all' && <CheckCircle className="w-4 h-4" />}
                  <span>All Categories</span>
                </button>
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => {
                      setFilterCategory(category.name);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                      filterCategory === category.name ? 'bg-red-50 text-red-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {filterCategory === category.name && <CheckCircle className="w-4 h-4" />}
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <PieChart className="w-6 h-6 text-purple-600" />
          Expense Breakdown by Category
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([name, amount]) => {
            const categoryInfo = getCategoryIcon(name);
            const Icon = categoryInfo.icon;
            const percentage = (amount / totalExpenses * 100).toFixed(1);
            
            return (
              <div key={name} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-lg transition-all cursor-pointer group">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${categoryInfo.color} mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{name}</h4>
                <p className="text-2xl font-bold text-gray-900 mb-1">£{amount.toLocaleString()}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{percentage}% of total</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
