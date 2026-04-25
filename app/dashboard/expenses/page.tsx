"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Search, TrendingDown, Filter, Tag, Receipt, Edit, 
  Trash2, X, Upload, Download, BarChart3, PieChart, DollarSign,
  ShoppingBag, Building2, Coffee, Car, Zap, MoreVertical, Target, Loader2
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import StatusModal from '@/components/StatusModal';

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

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: 0,
    category: 'Office',
    date: new Date().toISOString().split('T')[0],
  });

  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
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
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const avgExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;
  
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/expenses');
      const data = await response.json();
      if (Array.isArray(data)) {
        setExpenses(data.map((exp: PrismaExpense) => ({
          ...exp,
          title: exp.description,
        })));
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);



  const handleAddExpense = async () => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense),
      });
      
      if (!response.ok) throw new Error('Failed to save expense');
      
      const savedExpense = await response.json();
      setExpenses([{ ...savedExpense, title: savedExpense.description }, ...expenses]);
      setShowAddModal(false);
      setNewExpense({
        title: '',
        amount: 0,
        category: 'Office',
        date: new Date().toISOString().split('T')[0],
      });
      setStatusModal({
        isOpen: true,
        title: 'Expense Added',
        message: 'Your new expense has been successfully recorded.',
        type: 'success'
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      setStatusModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to add expense. Please try again.',
        type: 'error'
      });
    }
  };

  const handleDeleteExpense = (expense: Expense) => {
    setDeletingExpense(expense);
    setShowDeleteModal(true);
  };

  const handleEditExpense = async () => {
    if (selectedExpense) {
      try {
        const response = await fetch(`/api/expenses/${selectedExpense.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedExpense),
        });

        if (!response.ok) throw new Error('Failed to update expense');

        const updatedExpense = await response.json();
        setExpenses(expenses.map(exp => 
          exp.id === updatedExpense.id ? { ...updatedExpense, title: updatedExpense.description } : exp
        ));
        setShowEditModal(false);
        setSelectedExpense(null);
        setStatusModal({
          isOpen: true,
          title: 'Expense Updated',
          message: 'The expense details have been successfully updated.',
          type: 'success'
        });
      } catch (error) {
        console.error('Error updating expense:', error);
        setStatusModal({
          isOpen: true,
          title: 'Error',
          message: 'Failed to update expense. Please try again.',
          type: 'error'
        });
      }
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

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusModal({
      isOpen: true,
      title: 'Export Complete',
      message: 'Your expenses have been successfully exported to CSV.',
      type: 'success'
    });
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category || categories[categories.length - 1];
  };

  return (
    <div className="relative min-h-screen pb-20 overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-[20%] left-[30%] w-[60%] h-[60%] rounded-full bg-indigo-300/10 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-8 p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-500">
                <Receipt className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1 text-center md:text-left">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                  Expense <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Pulse</span>
                </h1>
                <p className="text-gray-500 font-medium">Track and optimise your business spending</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                type="button"
                onClick={handleExport}
                className="flex-1 md:flex-none px-6 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition-all font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>Export</span>
              </button>
              <button 
                type="button"
                onClick={() => setShowAddModal(true)}
                className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                <span>Add Expense</span>
              </button>
            </div>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: 'Total Expenses', 
            value: `£${totalExpenses.toLocaleString()}`, 
            sub: `${filteredExpenses.length} records processed`, 
            icon: TrendingDown, 
            color: 'from-rose-500 to-red-600',
            bg: 'bg-rose-500/10',
            border: 'group-hover:border-rose-500/50',
            trend: '+8%'
          },
          { 
            title: 'Average Spend', 
            value: `£${Math.round(avgExpense)}`, 
            sub: 'per transaction', 
            icon: BarChart3, 
            color: 'from-blue-500 to-indigo-600',
            bg: 'bg-blue-500/10',
            border: 'group-hover:border-blue-500/50',
            trend: 'Avg'
          },
          { 
            title: 'Active Categories', 
            value: Object.keys(categoryTotals).length, 
            sub: 'spending streams', 
            icon: PieChart, 
            color: 'from-purple-500 to-pink-600',
            bg: 'bg-purple-500/10',
            border: 'group-hover:border-purple-500/50',
            trend: 'Types'
          },
          { 
            title: 'Top Category', 
            value: Object.keys(categoryTotals).length > 0 
                  ? Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0][0]
                  : 'N/A', 
            sub: `£${(Object.keys(categoryTotals).length > 0 
                  ? Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0][1]
                  : 0).toLocaleString()} total`, 
            icon: Tag, 
            color: 'from-amber-500 to-orange-600',
            bg: 'bg-amber-500/10',
            border: 'group-hover:border-amber-500/50',
            trend: 'Max'
          }
        ].map((stat, i) => (
          <div key={i} className={`bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group ${stat.border}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${stat.bg} ${stat.color.replace('from-', 'text-').split(' ')[0]}`}>
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 opacity-80">{stat.title}</p>
              <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{stat.value}</h3>
              <p className="text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition-colors">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search expenses by title, vendor, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-11 pr-4 py-4 bg-white/70 backdrop-blur-xl border border-white/50 text-gray-900 placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-lg hover:shadow-xl font-medium"
          />
        </div>
        <div className="relative">
          <button 
            type="button"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="h-full px-8 bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl hover:bg-white/90 text-gray-700 font-bold flex items-center gap-3 transition-all shadow-lg hover:shadow-xl min-w-[200px] cursor-pointer"
          >
            <Filter className="w-5 h-5 text-gray-500" />
            <span>{filterCategory !== 'all' ? filterCategory : 'All Categories'}</span>
            <MoreVertical className="w-4 h-4 text-gray-400 ml-auto" />
          </button>
          
          {showFilterMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowFilterMenu(false)} />
              <div className="absolute right-0 mt-4 w-64 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  type="button"
                  onClick={() => {
                    setFilterCategory('all');
                    setShowFilterMenu(false);
                  }}
                  className={`w-full px-5 py-3 text-left hover:bg-blue-50/50 transition-colors flex items-center gap-3 font-medium cursor-pointer ${
                    filterCategory === 'all' ? 'text-blue-600 bg-blue-50/80' : 'text-gray-700'
                  }`}
                >
                   <div className={`w-2 h-2 rounded-full ${filterCategory === 'all' ? 'bg-blue-600' : 'bg-gray-300'}`} />
                  <span>All Categories</span>
                </button>
                <div className="h-px bg-gray-100 my-1 mx-4" />
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category.name}
                    onClick={() => {
                      setFilterCategory(category.name);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full px-5 py-3 text-left hover:bg-blue-50/50 transition-colors flex items-center gap-3 font-medium cursor-pointer ${
                      filterCategory === category.name ? 'text-blue-600 bg-blue-50/80' : 'text-gray-700'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${filterCategory === category.name ? 'bg-blue-600' : 'bg-gray-300'}`} />
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/50 shadow-2xl">
        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <PieChart className="w-6 h-6 text-purple-600" />
          </div>
          Expense Breakdown
        </h3>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-gray-500 font-medium italic">Analyzing your spending patterns...</p>
          </div>
        ) : Object.keys(categoryTotals).length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-medium">No expenses recorded yet.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([name, amount]) => {
              const categoryInfo = getCategoryIcon(name);
              const Icon = categoryInfo.icon;
              const percentage = (amount / totalExpenses * 100).toFixed(1);
              
              return (
                <div key={name} className="p-5 bg-white/50 rounded-2xl border border-white/60 hover:bg-white/80 transition-all cursor-pointer group hover:shadow-lg shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${categoryInfo.color} shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-bold text-gray-400 bg-white/80 px-2 py-1 rounded-lg">{percentage}%</span>
                  </div>
                  <h4 className="font-bold text-gray-700 mb-1">{name}</h4>
                  <p className="text-xl font-black text-gray-900">£{amount.toLocaleString()}</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${categoryInfo.color} opacity-80 group-hover:opacity-100 transition-opacity`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expenses List */}
      <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-rose-100 rounded-lg">
            <Receipt className="w-6 h-6 text-rose-600" />
          </div>
          <h3 className="text-xl font-black text-gray-900">Recent Expenses</h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Syncing ledger data...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-20 text-gray-500 font-medium">No expenses found. Start by adding one!</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Expense Details</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExpenses.map((expense) => {
                  const categoryInfo = getCategoryIcon(expense.category);
                  const Icon = categoryInfo.icon;
                  
                  return (
                    <tr key={expense.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${categoryInfo.color} shadow-md group-hover:scale-110 transition-transform`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{expense.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 text-xs font-bold shadow-sm inline-flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${categoryInfo.color}`} />
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-500">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="px-8 py-5">
                        <span className="font-black text-gray-900 text-lg">£{expense.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-2">

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedExpense(expense);
                              setShowEditModal(true);
                            }}
                            className="p-2 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(expense)}
                            className="p-2 bg-white border border-gray-200 hover:border-rose-300 hover:bg-rose-50 text-gray-500 hover:text-rose-600 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
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
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full border border-white/50 relative overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-black text-white">Add New Expense</h2>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6">
              {/* Receipt Upload Banner */}
              <div className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 transition-colors group">
                <div className="p-4 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <p className="font-bold text-gray-900">Upload Receipt</p>
                <p className="text-sm text-gray-500">Drag and drop or click to browse</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Title</label>
                <input
                  type="text"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold text-gray-900 placeholder-gray-400"
                  placeholder="e.g., Office Supplies"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amount (£)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold text-gray-900"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-gray-900 cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4 mt-auto">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-4 border border-gray-200 rounded-xl hover:bg-gray-50 font-bold text-gray-600 cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddExpense}
                  className="flex-1 px-6 py-4 rounded-xl text-white font-bold cursor-pointer transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  Save Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {showEditModal && selectedExpense && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full border border-white/50 relative overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Edit className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-black text-white">Edit Expense</h2>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedExpense(null);
                }}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Title</label>
                <input
                  type="text"
                  value={selectedExpense.title}
                  onChange={(e) => setSelectedExpense({ ...selectedExpense, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amount (£)</label>
                  <input
                    type="number"
                    value={selectedExpense.amount}
                    onChange={(e) => setSelectedExpense({ ...selectedExpense, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                  <input
                    type="date"
                    value={selectedExpense.date}
                    onChange={(e) => setSelectedExpense({ ...selectedExpense, date: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={selectedExpense.category}
                  onChange={(e) => setSelectedExpense({ ...selectedExpense, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-gray-900 cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4 mt-auto">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedExpense(null);
                  }}
                  className="flex-1 px-6 py-4 border border-gray-200 rounded-xl hover:bg-gray-50 font-bold text-gray-600 cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEditExpense}
                  className="flex-1 px-6 py-4 rounded-xl text-white font-bold cursor-pointer transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  Update Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingExpense && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingExpense(null);
          }}
          onConfirm={async () => {
            try {
              const response = await fetch(`/api/expenses/${deletingExpense.id}`, {
                method: 'DELETE',
              });

              if (!response.ok) throw new Error('Failed to delete expense');

              setExpenses(expenses.filter(exp => exp.id !== deletingExpense.id));
              setShowDeleteModal(false);
              setDeletingExpense(null);
              setStatusModal({
                isOpen: true,
                title: 'Expense Deleted',
                message: 'The expense record has been permanently removed.',
                type: 'success'
              });
            } catch (error) {
              console.error('Error deleting expense:', error);
              setStatusModal({
                isOpen: true,
                title: 'Error',
                message: 'Failed to delete expense. Please try again.',
                type: 'error'
              });
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
  </div>
  );
}
