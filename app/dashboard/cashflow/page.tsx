"use client";

import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, Download, Filter, 
  ArrowUpRight, ArrowDownRight, Plus, Eye, BarChart3, PieChart,
  Wallet, CreditCard, Building2, ShoppingCart, Users, Zap,
  ArrowRight, ChevronDown, RefreshCw, AlertCircle, CheckCircle,
  Activity, Target, Sparkles, TrendingDown as TrendDown
} from 'lucide-react';

export default function CashflowPage() {
  const [timeRange, setTimeRange] = useState('month');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<'chart' | 'breakdown'>('chart');

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
              className="px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl hover:bg-opacity-30 transition-all font-semibold flex items-center gap-2 cursor-pointer"
              style={{ color: 'var(--color-purple-600)' }}
            >
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
            <button 
              className="px-6 py-3 bg-white rounded-xl hover:shadow-2xl transition-all font-bold flex items-center gap-2 cursor-pointer"
              style={{ color: 'var(--color-purple-600)' }}
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
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Recent Transactions
          </h3>
          <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer">
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all cursor-pointer group border border-transparent hover:border-blue-200"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                  transaction.type === 'income' 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                    : 'bg-gradient-to-br from-red-500 to-rose-500'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowDownRight className="w-6 h-6 text-white" />
                  ) : (
                    <ArrowUpRight className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{transaction.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{transaction.date}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {transaction.category}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xl font-bold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}£{Math.abs(transaction.amount).toLocaleString()}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {transaction.type === 'income' ? 'Received' : 'Paid'}
                </p>
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
              <CheckCircle className="w-4 h-4" />
              <span>Healthy</span>
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
              <TrendingUp className="w-4 h-4" />
              <span>+5.2%</span>
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
              <TrendingDown className="w-4 h-4" />
              <span>-2.1%</span>
            </div>
            <span className="text-orange-100">per month</span>
          </div>
        </div>
      </div>
    </div>
  );
}
