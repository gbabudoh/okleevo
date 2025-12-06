"use client";

import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, Download, Filter, 
  ArrowUpRight, ArrowDownRight, Plus, Eye, BarChart3, PieChart,
  Wallet, CreditCard, Building2, ShoppingCart, Users, Zap,
  ArrowRight, ChevronDown, RefreshCw, AlertCircle, CheckCircle,
  Activity, Target, Sparkles, TrendingDown as TrendDown, X, Edit, Trash2, Tag
} from 'lucide-react';

export default function CashflowPage() {
  const [timeRange, setTimeRange] = useState('month');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<'chart' | 'breakdown'>('chart');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<typeof recentTransactions[0] | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<typeof recentTransactions[0] | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    type: 'income' as 'income' | 'expense',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Sales'
  });

  const monthlyData = [
    { month: 'Jan', income: 42000, expenses: 18000, net: 24000 },
    { month: 'Feb', income: 38000, expenses: 15000, net: 23000 },
    { month: 'Mar', income: 52000, expenses: 22000, net: 30000 },
    { month: 'Apr', income: 45000, expenses: 19000, net: 26000 },
    { month: 'May', income: 48000, expenses: 20000, net: 28000 },
    { month: 'Jun', income: 55000, expenses: 23000, net: 32000 },
    { month: 'Jul', income: 50000, expenses: 21000, net: 29000 },
    { month: 'Aug', income: 58000, expenses: 24000, net: 34000 },
    { month: 'Sep', income: 47000, expenses: 18000, net: 29000 },
    { month: 'Oct', income: 51000, expenses: 20000, net: 31000 },
    { month: 'Nov', income: 54000, expenses: 22000, net: 32000 },
    { month: 'Dec', income: 60000, expenses: 25000, net: 35000 },
  ];

  const recentTransactions = [
    { id: '1', type: 'income', description: 'Invoice Payment - Acme Corp', amount: 5000, date: '2024-12-05', category: 'Sales' },
    { id: '2', type: 'expense', description: 'Office Rent', amount: -2500, date: '2024-12-04', category: 'Operations' },
    { id: '3', type: 'income', description: 'Consulting Fee', amount: 3200, date: '2024-12-03', category: 'Services' },
    { id: '4', type: 'expense', description: 'Software Subscriptions', amount: -450, date: '2024-12-02', category: 'Technology' },
    { id: '5', type: 'income', description: 'Product Sales', amount: 1800, date: '2024-12-01', category: 'Sales' },
    { id: '6', type: 'expense', description: 'Marketing Campaign', amount: -1200, date: '2024-11-30', category: 'Marketing' },
  ];

  const expenseCategories = [
    { name: 'Operations', amount: 5200, percentage: 42, color: 'from-blue-500 to-cyan-500', icon: Building2 },
    { name: 'Salaries', amount: 4800, percentage: 38, color: 'from-purple-500 to-pink-500', icon: Users },
    { name: 'Marketing', amount: 1450, percentage: 12, color: 'from-orange-500 to-red-500', icon: Target },
    { name: 'Other', amount: 1000, percentage: 8, color: 'from-green-500 to-emerald-500', icon: ShoppingCart },
  ];

  const incomeBreakdown = [
    { name: 'Operating Income', percentage: 72, color: 'bg-green-500' },
    { name: 'Investments', percentage: 18, color: 'bg-blue-500' },
    { name: 'Other Sources', percentage: 10, color: 'bg-purple-500' },
  ];

  const maxValue = Math.max(...monthlyData.map(d => Math.max(d.income, d.expenses)));
  const totalIncome = monthlyData.reduce((sum, d) => sum + d.income, 0);
  const totalExpenses = monthlyData.reduce((sum, d) => sum + d.expenses, 0);
  const netCashflow = totalIncome - totalExpenses;
  const avgMonthlyIncome = totalIncome / monthlyData.length;
  const avgMonthlyExpenses = totalExpenses / monthlyData.length;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Activity className="w-10 h-10" />
              Cashflow Management
            </h1>
            <p className="text-green-100 text-lg">Track your income, expenses and financial health</p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl hover:bg-opacity-30 transition-all font-semibold cursor-pointer border-2 border-white border-opacity-30"
              style={{ color: 'var(--color-purple-600)' }}
            >
              <option value="week" className="text-gray-900">This Week</option>
              <option value="month" className="text-gray-900">This Month</option>
              <option value="quarter" className="text-gray-900">This Quarter</option>
              <option value="year" className="text-gray-900">This Year</option>
            </select>
            <button 
              onClick={() => {
                // Export cashflow data as CSV
                const csvData = [
                  ['Month', 'Income', 'Expenses', 'Net Cashflow'],
                  ...monthlyData.map(d => [d.month, d.income, d.expenses, d.net])
                ];
                const csv = csvData.map(row => row.join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `cashflow-report-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl hover:bg-opacity-30 transition-all font-semibold flex items-center gap-2 cursor-pointer"
              style={{ color: '#10b981' }}
            >
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-white rounded-xl hover:shadow-2xl transition-all font-bold flex items-center gap-2 cursor-pointer"
              style={{ color: '#10b981' }}
            >
              <Plus className="w-5 h-5" />
              Add Transaction
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 hover:shadow-2xl hover:scale-105 transition-all cursor-pointer overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-500 opacity-10 rounded-full group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-100 text-green-700">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-bold">+12.5%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Total Income</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">£{avgMonthlyIncome.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <p className="text-xs text-gray-500">Monthly average</p>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 border-2 border-red-200 hover:shadow-2xl hover:scale-105 transition-all cursor-pointer overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-red-500 to-rose-500 opacity-10 rounded-full group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-100 text-red-700">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-bold">+8.3%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Total Expenses</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">£{avgMonthlyExpenses.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <p className="text-xs text-gray-500">Monthly average</p>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 hover:shadow-2xl hover:scale-105 transition-all cursor-pointer overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-500 opacity-10 rounded-full group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-100 text-green-700">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-bold">+14.2%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Net Cashflow</p>
            <p className="text-4xl font-bold text-green-600 mb-2">£{(avgMonthlyIncome - avgMonthlyExpenses).toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <p className="text-xs text-gray-500">Monthly average</p>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 hover:shadow-2xl hover:scale-105 transition-all cursor-pointer overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 opacity-10 rounded-full group-hover:scale-150 transition-transform" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-100 text-purple-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-bold">Healthy</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Profit Margin</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">{((avgMonthlyIncome - avgMonthlyExpenses) / avgMonthlyIncome * 100).toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Above target</p>
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Income vs Expenses
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-semibold text-green-700">Income</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm font-semibold text-red-700">Expenses</span>
              </div>
            </div>
          </div>
          <div className="relative h-80">
            <div className="absolute inset-0 flex items-end justify-around gap-1">
              {monthlyData.map((data, i) => (
                <div 
                  key={i} 
                  className="flex-1 flex flex-col items-center gap-2 relative"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {hoveredBar === i && (
                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-xl p-4 shadow-2xl z-10 whitespace-nowrap border border-gray-700">
                      <p className="font-bold mb-2 text-center">{data.month} 2024</p>
                      <div className="space-y-1">
                        <p className="text-green-400 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-400"></span>
                          Income: £{data.income.toLocaleString()}
                        </p>
                        <p className="text-red-400 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-400"></span>
                          Expenses: £{data.expenses.toLocaleString()}
                        </p>
                        <p className="text-blue-400 flex items-center gap-2 pt-1 border-t border-gray-700">
                          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                          Net: £{data.net.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="w-full flex gap-1 items-end h-64">
                    <div 
                      className="flex-1 bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg hover:from-green-600 hover:to-green-500 transition-all cursor-pointer shadow-lg"
                      style={{ height: `${(data.income / maxValue) * 100}%` }}
                    ></div>
                    <div 
                      className="flex-1 bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg hover:from-red-600 hover:to-red-500 transition-all cursor-pointer shadow-lg"
                      style={{ height: `${(data.expenses / maxValue) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 font-semibold">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Breakdown Sidebar */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <PieChart className="w-6 h-6 text-purple-600" />
            Cashflow Breakdown
          </h3>
          
          <div className="space-y-4 mb-6">
            {incomeBreakdown.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  <span className="text-sm font-bold text-gray-900">{item.percentage}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all`} 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t-2 border-gray-200">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              Expense Categories
            </h4>
            <div className="space-y-3">
              {expenseCategories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{category.name}</p>
                        <p className="text-xs text-gray-500">{category.percentage}% of total</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900">£{category.amount.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border-2 border-gray-200 p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Recent Transactions</h3>
              <p className="text-sm text-gray-500">Latest financial activity</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center gap-2 cursor-pointer">
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid gap-4">
          {recentTransactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="bg-white rounded-2xl p-5 hover:shadow-xl transition-all duration-300 group border-2 border-gray-100 hover:border-blue-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                    transaction.type === 'income' 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                      : 'bg-gradient-to-br from-red-500 to-rose-600'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowDownRight className="w-7 h-7 text-white" />
                    ) : (
                      <ArrowUpRight className="w-7 h-7 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors mb-1">
                      {transaction.description}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">{transaction.date}</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className={`text-sm font-bold px-3 py-1 rounded-lg ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {transaction.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right">
                    <div className={`text-2xl font-bold mb-1 ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}£{Math.abs(transaction.amount).toLocaleString()}
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {transaction.type === 'income' ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      )}
                      {transaction.type === 'income' ? 'Received' : 'Paid'}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingTransaction(transaction);
                        setShowViewModal(true);
                      }}
                      className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTransaction(transaction);
                        setShowEditModal(true);
                      }}
                      className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Transaction"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete transaction:\n\n${transaction.description}\n\nAre you sure?`)) {
                          alert('Transaction deleted successfully!');
                        }
                      }}
                      className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                      title="Delete Transaction"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Insights */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm mb-1">Cash Runway</p>
              <p className="text-3xl font-bold">8.5 months</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 bg-white bg-opacity-20 px-2 py-1 rounded-lg">
              <CheckCircle className="w-4 h-4 text-gray-900" />
              <span className="text-gray-900 font-semibold">Healthy</span>
            </div>
            <span className="text-blue-100">Based on current burn rate</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-purple-100 text-sm mb-1">Savings Rate</p>
              <p className="text-3xl font-bold">42.8%</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 bg-white bg-opacity-20 px-2 py-1 rounded-lg">
              <TrendingUp className="w-4 h-4 text-gray-900" />
              <span className="text-gray-900 font-semibold">+5.2%</span>
            </div>
            <span className="text-purple-100">vs last quarter</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-orange-100 text-sm mb-1">Burn Rate</p>
              <p className="text-3xl font-bold">£{avgMonthlyExpenses.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl">
              <Zap className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 bg-white bg-opacity-20 px-2 py-1 rounded-lg">
              <TrendingDown className="w-4 h-4 text-gray-900" />
              <span className="text-gray-900 font-semibold">-2.1%</span>
            </div>
            <span className="text-orange-100">per month</span>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-green-600 to-emerald-600">
              <h2 className="text-xl font-bold text-white">Add New Transaction</h2>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setNewTransaction({...newTransaction, type: 'income'})}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      newTransaction.type === 'income'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ArrowUpRight className="w-5 h-5 inline mr-2" />
                    Income
                  </button>
                  <button
                    onClick={() => setNewTransaction({...newTransaction, type: 'expense'})}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      newTransaction.type === 'expense'
                        ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ArrowDownRight className="w-5 h-5 inline mr-2" />
                    Expense
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Invoice Payment, Office Rent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (£)</label>
                  <input
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {newTransaction.type === 'income' ? (
                    <>
                      <option value="Sales">Sales</option>
                      <option value="Services">Services</option>
                      <option value="Investments">Investments</option>
                      <option value="Other Income">Other Income</option>
                    </>
                  ) : (
                    <>
                      <option value="Operations">Operations</option>
                      <option value="Salaries">Salaries</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Technology">Technology</option>
                      <option value="Other">Other</option>
                    </>
                  )}
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Transaction Preview</h4>
                    <p className="text-sm text-blue-800">
                      {newTransaction.type === 'income' ? 'Adding' : 'Deducting'} £{newTransaction.amount || '0.00'} 
                      {newTransaction.type === 'income' ? ' to' : ' from'} your cashflow
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (newTransaction.description && newTransaction.amount) {
                      alert(`Transaction added successfully!\n\nType: ${newTransaction.type}\nDescription: ${newTransaction.description}\nAmount: £${newTransaction.amount}\nDate: ${newTransaction.date}\nCategory: ${newTransaction.category}\n\nIn production, this would update your cashflow data and sync with your accounting system.`);
                      setShowAddModal(false);
                      setNewTransaction({
                        type: 'income',
                        description: '',
                        amount: '',
                        date: new Date().toISOString().split('T')[0],
                        category: 'Sales'
                      });
                    }
                  }}
                  disabled={!newTransaction.description || !newTransaction.amount}
                  className="flex-1 px-4 py-3 rounded-xl text-white font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  Add Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Transaction Modal */}
      {showViewModal && viewingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className={`border-b border-gray-200 px-6 py-4 flex items-center justify-between ${
              viewingTransaction.type === 'income'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                : 'bg-gradient-to-r from-red-600 to-rose-600'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center">
                  {viewingTransaction.type === 'income' ? (
                    <ArrowDownRight className="w-6 h-6 text-white" />
                  ) : (
                    <ArrowUpRight className="w-6 h-6 text-white" />
                  )}
                </div>
                <h2 className="text-xl font-bold text-white">Transaction Details</h2>
              </div>
              <button 
                onClick={() => {
                  setShowViewModal(false);
                  setViewingTransaction(null);
                }} 
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Transaction Header */}
              <div className="text-center pb-6 border-b border-gray-200">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-3 ${
                  viewingTransaction.type === 'income'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {viewingTransaction.type === 'income' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                  {viewingTransaction.type === 'income' ? 'Income Received' : 'Expense Paid'}
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {viewingTransaction.description}
                </h3>
                <div className={`text-5xl font-bold ${
                  viewingTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {viewingTransaction.amount > 0 ? '+' : ''}£{Math.abs(viewingTransaction.amount).toLocaleString()}
                </div>
              </div>

              {/* Transaction Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Transaction Date</p>
                      <p className="text-lg font-bold text-blue-700">{viewingTransaction.date}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-600 font-medium">Category</p>
                      <p className="text-lg font-bold text-purple-700">{viewingTransaction.category}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-orange-600 font-medium">Transaction Type</p>
                      <p className="text-lg font-bold text-orange-700 capitalize">{viewingTransaction.type}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 border border-teal-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-teal-600 font-medium">Status</p>
                      <p className="text-lg font-bold text-teal-700">
                        {viewingTransaction.type === 'income' ? 'Received' : 'Paid'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingTransaction(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold cursor-pointer transition-all"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    setEditingTransaction(viewingTransaction);
                    setViewingTransaction(null);
                    setShowEditModal(true);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl text-white font-bold cursor-pointer transition-all shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center gap-2"
                >
                  <Edit className="w-5 h-5" />
                  Edit Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditModal && editingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600">
              <h2 className="text-xl font-bold text-white">Edit Transaction</h2>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTransaction(null);
                }} 
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setEditingTransaction({...editingTransaction, type: 'income'})}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      editingTransaction.type === 'income'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ArrowUpRight className="w-5 h-5 inline mr-2" />
                    Income
                  </button>
                  <button
                    onClick={() => setEditingTransaction({...editingTransaction, type: 'expense'})}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      editingTransaction.type === 'expense'
                        ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ArrowDownRight className="w-5 h-5 inline mr-2" />
                    Expense
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={editingTransaction.description}
                  onChange={(e) => setEditingTransaction({...editingTransaction, description: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Invoice Payment, Office Rent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (£)</label>
                  <input
                    type="number"
                    value={Math.abs(editingTransaction.amount)}
                    onChange={(e) => setEditingTransaction({
                      ...editingTransaction, 
                      amount: editingTransaction.type === 'income' ? Number(e.target.value) : -Number(e.target.value)
                    })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={editingTransaction.date}
                    onChange={(e) => setEditingTransaction({...editingTransaction, date: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={editingTransaction.category}
                  onChange={(e) => setEditingTransaction({...editingTransaction, category: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {editingTransaction.type === 'income' ? (
                    <>
                      <option value="Sales">Sales</option>
                      <option value="Services">Services</option>
                      <option value="Investments">Investments</option>
                      <option value="Other Income">Other Income</option>
                    </>
                  ) : (
                    <>
                      <option value="Operations">Operations</option>
                      <option value="Salaries">Salaries</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Technology">Technology</option>
                      <option value="Other">Other</option>
                    </>
                  )}
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Update Preview</h4>
                    <p className="text-sm text-blue-800">
                      This will update the transaction to: {editingTransaction.type === 'income' ? '+' : '-'}£{Math.abs(editingTransaction.amount).toLocaleString()} on {editingTransaction.date}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTransaction(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    alert(`Transaction updated successfully!\n\nDescription: ${editingTransaction.description}\nAmount: £${Math.abs(editingTransaction.amount)}\nDate: ${editingTransaction.date}\nCategory: ${editingTransaction.category}\n\nIn production, this would update your cashflow data.`);
                    setShowEditModal(false);
                    setEditingTransaction(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl text-white font-bold cursor-pointer transition-all shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  Update Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
