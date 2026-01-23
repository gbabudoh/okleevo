"use client";

import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, Download, 
  ArrowUpRight, ArrowDownRight, Plus, BarChart3, PieChart,
  Wallet, Building2, ShoppingCart, Users, Zap,
  ArrowRight, CheckCircle,
  Activity, Target, Sparkles, X, Edit, Trash2, Tag
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

export default function CashflowPage() {
  const [timeRange, setTimeRange] = useState('month');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<typeof recentTransactions[0] | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<typeof recentTransactions[0] | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<typeof recentTransactions[0] | null>(null);
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
  const avgMonthlyIncome = totalIncome / monthlyData.length;
  const avgMonthlyExpenses = totalExpenses / monthlyData.length;

  return (
    <div className="relative min-h-screen pb-20 overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-[20%] left-[30%] w-[60%] h-[60%] rounded-full bg-indigo-300/10 blur-[100px]" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 space-y-8 p-8 max-w-[1600px] mx-auto">

      {/* Header */}
      <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/50 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-black mb-3 flex items-center justify-center md:justify-start gap-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-200">
                <Activity className="w-8 h-8 text-white" />
              </div>
              Cashflow Pulse
            </h1>
            <p className="text-gray-500 text-lg font-medium ml-1">Real-time financial health & tax proximity tracking</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 bg-white/50 p-2 rounded-2xl border border-white/60 shadow-inner">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-6 py-3 bg-white hover:bg-gray-50 rounded-xl transition-all font-bold cursor-pointer border border-gray-200 text-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            
            <div className="h-8 w-[1px] bg-gray-300 mx-2 hidden md:block" />

            <button 
              type="button"
              onClick={() => {
                // Export logic remains same
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
              className="px-6 py-3 bg-white text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-bold flex items-center gap-2 cursor-pointer border border-gray-200 hover:border-indigo-200 shadow-sm"
            >
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
            <button 
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-8 py-3 bg-gray-900 hover:bg-black text-white rounded-xl shadow-lg hover:shadow-xl hover:shadow-gray-400/20 transition-all font-bold flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              New Entry
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: 'Total Income', 
            amount: avgMonthlyIncome, 
            trend: '+12.5%', 
            icon: TrendingUp, 
            color: 'green', 
            desc: 'Monthly average',
            gradient: 'from-emerald-400 to-green-500'
          },
          { 
            title: 'Total Expenses', 
            amount: avgMonthlyExpenses, 
            trend: '+8.3%', 
            icon: TrendingDown, 
            color: 'rose', 
            desc: 'Monthly average',
            gradient: 'from-rose-400 to-red-500'
          },
          { 
            title: 'Net Cashflow', 
            amount: avgMonthlyIncome - avgMonthlyExpenses, 
            trend: '+14.2%', 
            icon: DollarSign, 
            color: 'blue', 
            desc: 'Monthly average',
            gradient: 'from-blue-400 to-indigo-500'
          },
          { 
            title: 'Profit Margin', 
            amount: ((avgMonthlyIncome - avgMonthlyExpenses) / avgMonthlyIncome * 100), 
            isPercent: true,
            trend: 'Healthy', 
            icon: Wallet, 
            color: 'violet', 
            desc: 'Above target',
            gradient: 'from-violet-400 to-purple-500'
          }
        ].map((stat, i) => (
          <div key={i} className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-bl-[100px] transition-transform group-hover:scale-110`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:bg-${stat.color}-100 transition-colors`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold bg-${stat.color}-100 text-${stat.color}-700 flex items-center gap-1`}>
                  {stat.trend === 'Healthy' ? <CheckCircle className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                  {stat.trend}
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">
                  {stat.isPercent 
                    ? `${stat.amount.toFixed(1)}%`
                    : `£${stat.amount.toLocaleString(undefined, {maximumFractionDigits: 0})}`
                  }
                </h3>
                <p className="text-xs font-medium text-gray-400">{stat.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <BarChart3 className="w-5 h-5" />
              </div>
              Income vs Expenses
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Income</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Expenses</span>
              </div>
            </div>
          </div>
          <div className="relative h-80">
            <div className="absolute inset-0 flex items-end justify-around gap-2 px-4">
              {monthlyData.map((data, i) => (
                <div 
                  key={i} 
                  className="flex-1 flex flex-col items-center gap-2 relative group"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {hoveredBar === i && (
                    <div className="absolute -top-32 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-xl text-white text-xs rounded-2xl p-4 shadow-2xl z-20 whitespace-nowrap border border-white/20 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-200">
                      <p className="font-black mb-3 text-center text-lg border-b border-white/10 pb-2">{data.month} 2024</p>
                      <div className="space-y-2">
                        <p className="text-green-400 flex items-center justify-between gap-4 text-sm font-bold">
                          <span className="flex items-center gap-2"><ArrowUpRight className="w-4 h-4" /> Income</span>
                          <span>£{data.income.toLocaleString()}</span>
                        </p>
                        <p className="text-rose-400 flex items-center justify-between gap-4 text-sm font-bold">
                          <span className="flex items-center gap-2"><ArrowDownRight className="w-4 h-4" /> Expenses</span>
                          <span>£{data.expenses.toLocaleString()}</span>
                        </p>
                        <div className="pt-2 border-t border-white/10 mt-2">
                          <p className="text-blue-300 flex items-center justify-between gap-4 font-black">
                            <span>Net Flow</span>
                            <span>£{data.net.toLocaleString()}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="w-full flex gap-1 items-end h-72">
                    <div 
                      className="flex-1 bg-gradient-to-t from-emerald-500 to-green-400 rounded-t-lg group-hover:from-emerald-400 group-hover:to-green-300 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                      style={{ height: `${(data.income / maxValue) * 100}%` }}
                    ></div>
                    <div 
                      className="flex-1 bg-gradient-to-t from-rose-600 to-red-500 rounded-t-lg group-hover:from-rose-500 group-hover:to-red-400 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.3)] group-hover:shadow-[0_0_25px_rgba(244,63,94,0.5)]"
                      style={{ height: `${(data.expenses / maxValue) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 group-hover:text-indigo-600 transition-colors">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Breakdown Sidebar with Tax Insight Integration */}
        <div className="space-y-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-6 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <PieChart className="w-5 h-5" />
              </div>
              Breakdown
            </h3>
            
            <div className="space-y-6 mb-8">
              {incomeBreakdown.map((item, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-900 transition-colors">{item.name}</span>
                    <span className="text-sm font-black text-gray-900">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color.replace('bg-', 'bg-gradient-to-r from-').replace('500', '400')} to-${item.color.replace('bg-', '').replace('500', '600')} rounded-full transition-all duration-1000 ease-out group-hover:scale-x-105 origin-left`} 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-gray-200/50">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Target className="w-4 h-4 text-orange-600" />
                Top Expenses
              </h4>
              <div className="space-y-3">
                {expenseCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl transition-all cursor-pointer group hover:shadow-md hover:border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color} shadow-sm`}>
                          <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-900">{category.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{category.percentage}%</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-900">£{category.amount.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* New Tax Provision Insight */}
          <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-bl-[100px] group-hover:scale-125 transition-transform duration-700" />
            <div className="relative z-10">
               <h4 className="text-sm font-bold text-indigo-200 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Building2 className="w-4 h-4" />
                 Tax Reserve
               </h4>
               <div className="space-y-4">
                 <div className="flex justify-between items-center pb-3 border-b border-white/10">
                   <span className="text-sm font-medium text-indigo-100">Est. Corp Tax (25%)</span>
                   <span className="font-bold">£{((avgMonthlyIncome - avgMonthlyExpenses) * 0.25).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-indigo-100">Est. VAT Liability</span>
                    <span className="font-bold">£{(avgMonthlyIncome * 0.2 - avgMonthlyExpenses * 0.2).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                 </div>
                 <div className="pt-2">
                    <p className="text-[10px] text-indigo-300 italic">*Projections based on current monthly averages. Consult your accountant for exact figures.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Recent Activity</h3>
              <p className="text-sm font-medium text-gray-500">Live transaction feed</p>
            </div>
          </div>
          <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all font-bold flex items-center gap-2 cursor-pointer text-sm">
            View All History
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid gap-3">
          {recentTransactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="bg-white/50 hover:bg-white rounded-xl p-4 transition-all duration-300 group border border-gray-100/50 hover:border-indigo-200 hover:shadow-lg flex items-center justify-between cursor-pointer"
              onClick={() => {
                setViewingTransaction(transaction);
                setShowViewModal(true);
              }}
            >
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 ${
                  transaction.type === 'income' 
                    ? 'bg-green-50 text-green-600 border border-green-100' 
                    : 'bg-rose-50 text-rose-600 border border-rose-100'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowDownRight className="w-6 h-6" />
                  ) : (
                    <ArrowUpRight className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-0.5 group-hover:text-indigo-600 transition-colors">
                    {transaction.description}
                  </h4>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(transaction.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      transaction.category === 'Sales' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {transaction.category}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className={`text-lg font-black ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}£{Math.abs(transaction.amount).toLocaleString()}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${
                    transaction.type === 'income' ? 'text-green-500' : 'text-gray-400'
                  }`}>
                    {transaction.type === 'income' ? 'Received' : 'Paid'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTransaction(transaction);
                      setShowEditModal(true);
                    }}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingTransaction(transaction);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Insights */}
      {/* Financial Insights */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: 'Cash Runway', val: '8.5 months', icon: Calendar, color: 'blue', sub: 'Based on current burn rate', trend: 'Healthy' },
          { title: 'Savings Rate', val: '42.8%', icon: Sparkles, color: 'purple', sub: 'vs last quarter', trend: '+5.2%' },
          { title: 'Burn Rate', val: `£${avgMonthlyExpenses.toLocaleString(undefined, {maximumFractionDigits: 0})}`, icon: Zap, color: 'orange', sub: 'per month', trend: '-2.1%' }
        ].map((item, i) => (
          <div key={i} className={`bg-gradient-to-br from-${item.color}-500 to-${item.color}-700 rounded-2xl p-1 shadow-lg`}>
             <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 h-full text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className={`text-${item.color}-100 text-sm font-medium mb-1`}>{item.title}</p>
                    <p className="text-3xl font-black">{item.val}</p>
                  </div>
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <item.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm pt-2 border-t border-white/10">
                   <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg font-bold">
                      {item.title === 'Burn Rate' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                      {item.trend}
                   </div>
                   <span className={`text-${item.color}-100 opacity-80`}>{item.sub}</span>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-white/50 relative overflow-hidden">
            <div className="bg-gray-900 p-6 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-gray-800 rounded-lg">
                   <Plus className="w-5 h-5 text-white" />
                 </div>
                 <div>
                  <h2 className="text-xl font-black text-white">New Transaction</h2>
                  <p className="text-xs text-gray-400">Add income or expense to cashflow</p>
                 </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

            </div>
            
            <div className="p-8 overflow-y-auto space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setNewTransaction({...newTransaction, type: 'income'})}
                    className={`p-4 rounded-xl font-bold transition-all border-2 flex items-center justify-center gap-2 cursor-pointer ${
                      newTransaction.type === 'income'
                        ? 'bg-green-50 border-green-500 text-green-700 shadow-sm'
                        : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    <ArrowDownRight className="w-5 h-5" />
                    Income
                  </button>
                  <button
                    onClick={() => setNewTransaction({...newTransaction, type: 'expense'})}
                    className={`p-4 rounded-xl font-bold transition-all border-2 flex items-center justify-center gap-2 cursor-pointer ${
                      newTransaction.type === 'expense'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm'
                        : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    <ArrowUpRight className="w-5 h-5" />
                    Expense
                  </button>

                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Details</label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-semibold text-gray-900 placeholder:text-gray-400"
                  placeholder="Transaction description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amount (£)</label>
                  <input
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-bold text-gray-900"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium text-gray-900 cursor-pointer"
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

              <div className="flex gap-4 pt-4 mt-auto">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-4 border border-gray-200 rounded-xl hover:bg-gray-50 font-bold text-gray-600 cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (newTransaction.description && newTransaction.amount) {
                      alert('Transaction added (Simulation)');
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
                  className="flex-1 px-6 py-4 rounded-xl text-white font-black cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 bg-gradient-to-r from-gray-900 to-black"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Transaction Modal */}
      {showViewModal && viewingTransaction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full border border-white/50 relative overflow-hidden flex flex-col max-h-[85vh]">
            <div className={`p-6 flex items-center justify-between sticky top-0 z-10 ${
              viewingTransaction!.type === 'income'
                ? 'bg-gradient-to-r from-emerald-600 to-green-600'
                : 'bg-gradient-to-r from-rose-600 to-red-600'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  {viewingTransaction!.type === 'income' ? (
                    <ArrowDownRight className="w-6 h-6 text-white" />
                  ) : (
                    <ArrowUpRight className="w-6 h-6 text-white" />
                  )}
                </div>
                <h2 className="text-xl font-black text-white">Transaction Details</h2>
              </div>
              <button 
                onClick={() => {
                  setShowViewModal(false);
                  setViewingTransaction(null);
                }} 
                className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

            </div>
            
            <div className="p-8 space-y-8 overflow-y-auto">
              {/* Transaction Header */}
              <div className="text-center pb-8 border-b border-gray-100">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${
                  viewingTransaction!.type === 'income'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-rose-100 text-rose-700'
                }`}>
                  {viewingTransaction!.type === 'income' ? <CheckCircle className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                  {viewingTransaction!.type === 'income' ? 'Income Received' : 'Expense Paid'}
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  {viewingTransaction!.description}
                </h3>
                <div className={`text-5xl font-black tracking-tight ${
                  viewingTransaction!.type === 'income' ? 'text-green-600' : 'text-gray-900'
                }`}>
                  {viewingTransaction!.amount > 0 ? '+' : ''}£{Math.abs(viewingTransaction!.amount).toLocaleString()}
                </div>
              </div>

              {/* Transaction Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-100/50 text-blue-600">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</p>
                      <p className="text-lg font-bold text-gray-900">{new Date(viewingTransaction!.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple-100/50 text-purple-600">
                      <Tag className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category</p>
                      <p className="text-lg font-bold text-gray-900">{viewingTransaction!.category}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingTransaction(null);
                  }}
                  className="flex-1 px-6 py-4 border border-gray-200 rounded-xl hover:bg-gray-50 font-bold text-gray-600 cursor-pointer transition-all"
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
                  className="flex-1 px-6 py-4 rounded-xl text-white font-bold cursor-pointer transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full border border-white/50 relative overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Edit className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-black text-white">Edit Transaction</h2>
              </div>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTransaction(null);
                }} 
                className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

            </div>
            
            <div className="p-8 overflow-y-auto space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setEditingTransaction({...editingTransaction!, type: 'income'})}
                    className={`p-4 rounded-xl font-bold transition-all border-2 flex items-center justify-center gap-2 cursor-pointer ${
                      editingTransaction!.type === 'income'
                        ? 'bg-green-50 border-green-500 text-green-700 shadow-sm'
                        : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    <ArrowDownRight className="w-5 h-5" />
                    Income
                  </button>
                  <button
                    onClick={() => setEditingTransaction({...editingTransaction!, type: 'expense'})}
                    className={`p-4 rounded-xl font-bold transition-all border-2 flex items-center justify-center gap-2 cursor-pointer ${
                      editingTransaction!.type === 'expense'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm'
                        : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    <ArrowUpRight className="w-5 h-5" />
                    Expense
                  </button>

                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                <input
                  type="text"
                  value={editingTransaction!.description}
                  onChange={(e) => setEditingTransaction({...editingTransaction!, description: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-semibold text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amount (£)</label>
                  <input
                    type="number"
                    value={Math.abs(editingTransaction!.amount)}
                    onChange={(e) => setEditingTransaction({
                      ...editingTransaction!, 
                      amount: editingTransaction!.type === 'income' ? Number(e.target.value) : -Number(e.target.value)
                    })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold text-gray-900"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                  <input
                    type="date"
                    value={editingTransaction!.date}
                    onChange={(e) => setEditingTransaction({...editingTransaction!, date: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={editingTransaction!.category}
                  onChange={(e) => setEditingTransaction({...editingTransaction!, category: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-gray-900 cursor-pointer"
                >
                  {editingTransaction!.type === 'income' ? (
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

              <div className="flex gap-4 pt-4 mt-auto">
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTransaction(null);
                  }}
                  className="flex-1 px-6 py-4 border border-gray-200 rounded-xl hover:bg-gray-50 font-bold text-gray-600 cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    alert('Transaction updated (Simulation)');
                    setShowEditModal(false);
                    setEditingTransaction(null);
                  }}
                  className="flex-1 px-6 py-4 rounded-xl text-white font-bold cursor-pointer transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTransaction && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingTransaction(null);
          }}
          onConfirm={() => {
            alert('✓ Transaction deleted successfully!');
            setShowDeleteModal(false);
            setDeletingTransaction(null);
          }}
          title="Delete Transaction"
          itemName={deletingTransaction?.description || 'Transaction'}
          itemDetails={`${deletingTransaction?.type === 'income' ? '+' : '-'}£${Math.abs(deletingTransaction?.amount || 0).toLocaleString()} - ${deletingTransaction?.date}`}
          warningMessage="This will permanently remove this transaction from your cashflow records."
        />
      )}
    </div>
  </div>
  );
}
