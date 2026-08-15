"use client";

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Calendar, Download,
  ArrowUpRight, ArrowDownRight, Plus, BarChart3, PieChart,
  Wallet, Building2, ShoppingCart, Users, Zap,
  ArrowRight, CheckCircle,
  Activity, Target, Sparkles, X, Edit, Trash2, Tag, Loader2, PoundSterling
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import TourProvider from '@/components/tours/TourProvider';
import { ModuleGuideBanner } from '@/components/tours/ModuleGuideBanner';
import { cashflowTourSteps } from './tour-steps';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

interface ExpenseCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: LucideIcon;
}

interface CashflowResponse {
  monthlyData: MonthlyData[];
  recentTransactions: Transaction[];
  expenseCategories: {
    name: string;
    amount: number;
    percentage: number;
    color: string;
  }[];
  summary: {
    totalIncome: number;
    totalExpenses: number;
    avgMonthlyIncome: number;
    avgMonthlyExpenses: number;
    cashBalance: number;
    hasCashAccount: boolean;
    corporationTaxEstimate: number;
    vatLiabilityEstimate: number;
    savingsRateChangePct: number | null;
    burnRateChangePct: number | null;
  };
}

const ModalHandle = () => (
  <div className="flex justify-center pt-2 pb-0 sm:hidden shrink-0">
    <div className="w-10 h-1 rounded-full bg-gray-300" />
  </div>
);

const ModalFooter = ({ children }: { children: ReactNode }) => (
  <div className="shrink-0 bg-white border-t border-gray-100 px-4 sm:px-6 pt-3.5 pb-8 sm:pb-5 flex flex-row gap-2.5 mb-1.5 sm:mb-0">
    {children}
  </div>
);

const CancelBtn = ({ onClick, label = 'Cancel' }: { onClick: () => void; label?: string }) => (
  <button
    onClick={onClick}
    className="flex-1 py-3 px-5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
  >
    {label}
  </button>
);

export default function CashflowPage() {
  const [timeRange, setTimeRange] = useState('month');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    type: 'income' as 'income' | 'expense',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Sales'
  });

  const [savingTransaction, setSavingTransaction] = useState(false);
  const [originalTransactionType, setOriginalTransactionType] = useState<'income' | 'expense' | null>(null);
  const [updatingTransaction, setUpdatingTransaction] = useState(false);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    avgMonthlyIncome: 0,
    avgMonthlyExpenses: 0,
    cashBalance: 0,
    hasCashAccount: false,
    corporationTaxEstimate: 0,
    vatLiabilityEstimate: 0,
    savingsRateChangePct: null as number | null,
    burnRateChangePct: null as number | null,
  });
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const getIcon = (name: string): LucideIcon => {
    switch (name) {
      case 'Operations': return Building2;
      case 'Salaries': return Users;
      case 'Marketing': return Target;
      default: return ShoppingCart;
    }
  };

  const fetchCashflowData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cashflow');
      const data: CashflowResponse = await response.json();
      if (data.monthlyData) setMonthlyData(data.monthlyData);
      if (data.recentTransactions) setRecentTransactions(data.recentTransactions);
      if (data.expenseCategories) {
        setExpenseCategories(data.expenseCategories.map((c) => ({ ...c, icon: getIcon(c.name) })));
      }
      if (data.summary) setSummary(data.summary);
    } catch (error) {
      console.error('Error fetching cashflow data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCashflowData();
  }, [fetchCashflowData]);

  const rawMax = monthlyData.length > 0
    ? Math.max(...monthlyData.map(d => Math.max(d.income, d.expenses)))
    : 0;
  const maxValue = rawMax > 0 ? rawMax : 1000;
  const avgMonthlyIncome = summary.avgMonthlyIncome;
  const avgMonthlyExpenses = summary.avgMonthlyExpenses;
  const netCashflow = avgMonthlyIncome - avgMonthlyExpenses;
  const profitMargin = avgMonthlyIncome > 0 ? (netCashflow / avgMonthlyIncome) * 100 : 0;
  const hasData = summary.totalIncome > 0 || summary.totalExpenses > 0;

  // Cash Runway: real cash balance (posted ledger entries on accounts flagged
  // as a bank/cash account) ÷ average monthly burn. No cash account posted to
  // yet -> genuinely unknown, shown as "N/A" rather than a guessed figure.
  const cashRunwayMonths = summary.hasCashAccount && avgMonthlyExpenses > 0
    ? Math.min(12, Math.max(0, Math.floor(summary.cashBalance / avgMonthlyExpenses)))
    : null;
  const cashRunwayTrend = cashRunwayMonths === null ? '—'
    : cashRunwayMonths >= 6 ? 'Healthy'
    : cashRunwayMonths >= 3 ? 'Watch'
    : 'Low';

  const formatTrendPct = (pct: number | null) => pct === null ? '—' : `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;

  const resetNewTransaction = () => setNewTransaction({
    type: 'income',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Sales'
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8">
      <TourProvider moduleId="cashflow" steps={cashflowTourSteps} />

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 shrink-0">
              <Activity className="w-5 h-5 text-gray-500" />
            </div>
            <div className="min-w-0 flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="min-w-0 shrink-0">
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight whitespace-nowrap">Cashflow</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Real-time financial health tracking</p>
              </div>
              <ModuleGuideBanner
                moduleId="cashflow"
                moduleName="Cashflow Telemetry"
                summary="Monitor operating cash inflows, expense burn rates, net liquidity position, and statutory tax reserves."
                tips={[
                  "Real-time liquidity tracking derived from approved invoices and expense logs",
                  "Auto-calculated Corporation Tax & VAT reserves",
                  "Export complete cashflow statement logs to CSV"
                ]}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <select
              id="tour-cashflow-time-range"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="hidden sm:block px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100 transition cursor-pointer"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button
              type="button"
              onClick={() => {
                const csvData = [
                  ['Month', 'Income', 'Expenses', 'Net Cashflow'],
                  ...monthlyData.map(d => [d.month, d.income, d.expenses, d.net])
                ];
                const csv = csvData.map(row => row.join(',')).join('\n');
                const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `cashflow-report-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="p-2 sm:px-3 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer text-sm font-medium text-gray-700"
            >
              <Download className="w-4 h-4 cursor-pointer" />
              <span className="hidden sm:inline cursor-pointer">Export</span>
            </button>
            <button
              id="tour-cashflow-new-entry"
              type="button"
              onClick={() => { resetNewTransaction(); setShowAddModal(true); }}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 cursor-pointer" />
              <span className="hidden sm:inline cursor-pointer">Add Transaction</span>
              <span className="sm:hidden cursor-pointer">Add</span>
            </button>
          </div>
        </div>

      {/* Mobile Floating Action Button */}
      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        className="sm:hidden fixed bottom-24 right-6 w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center z-30 active:scale-95 transition-all cursor-pointer hover:bg-gray-800"
      >
        <Plus className="w-8 h-8" />
      </button>
      </div>

      {/* Stats Cards */}
      <div className="px-4 sm:px-6 pt-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[
            { label: 'Total Income', value: `£${avgMonthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, sub: 'Monthly Average', icon: TrendingUp, badge: 'Inflow', up: true, iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600', badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300' },
            { label: 'Total Expenses', value: `£${avgMonthlyExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, sub: 'Monthly Average', icon: TrendingDown, badge: 'Outflow', up: false, iconBg: 'bg-gradient-to-br from-rose-500 to-red-600', badgeStyle: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300' },
            { label: 'Net Cashflow', value: `£${netCashflow.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, sub: 'Net Position', icon: PoundSterling, badge: netCashflow >= 0 ? 'Surplus' : 'Deficit', up: netCashflow >= 0, iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-600', badgeStyle: netCashflow >= 0 ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/60 dark:text-indigo-300' : 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300' },
            { label: 'Profit Margin', value: `${isNaN(profitMargin) ? '0.0' : profitMargin.toFixed(1)}%`, sub: 'Operating Margin', icon: Wallet, badge: profitMargin > 0 ? 'Positive' : '0.0%', up: true, iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-600', badgeStyle: 'bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/60 dark:text-purple-300' },
          ].map(({ label, value, sub, icon: Icon, badge, iconBg, badgeStyle }) => (
            <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 ${iconBg} rounded-xl w-fit group-hover:scale-105 transition-transform text-white shadow-xs`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${badgeStyle}`}>
                  {badge}
                </span>
              </div>
              <p className="text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{loading ? '—' : value}</p>
              <p className="text-[11px] font-medium text-gray-400 mt-1">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart + Breakdown */}
      <div className="px-4 sm:px-6 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-200">
                  <BarChart3 className="w-4 h-4 text-gray-500" />
                </div>
                Income vs Expenses
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-medium text-gray-500">Income</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-[11px] font-medium text-gray-500">Expenses</span>
                </div>
              </div>
            </div>
            <div className="relative h-48 sm:h-64">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                  <p className="text-sm text-gray-400">Loading cashflow data...</p>
                </div>
              ) : monthlyData.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm text-gray-400">No data available for this period.</p>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-end justify-around gap-1 px-2">
                  {monthlyData.map((data, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1 relative group"
                      onMouseEnter={() => setHoveredBar(i)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {hoveredBar === i && (
                        <div className="absolute -top-28 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-20 whitespace-nowrap">
                          <p className="font-semibold mb-1.5 text-center border-b border-white/10 pb-1.5">{data.month}</p>
                          <p className="text-emerald-400 flex justify-between gap-3">
                            <span>Income</span><span>£{data.income.toLocaleString()}</span>
                          </p>
                          <p className="text-rose-400 flex justify-between gap-3">
                            <span>Expenses</span><span>£{data.expenses.toLocaleString()}</span>
                          </p>
                          <p className="text-gray-300 flex justify-between gap-3 font-semibold pt-1 border-t border-white/10 mt-1">
                            <span>Net</span><span>£{data.net.toLocaleString()}</span>
                          </p>
                        </div>
                      )}
                      <div className="w-full flex gap-0.5 items-end h-40 sm:h-56">
                        <div
                          className="flex-1 bg-emerald-500 hover:bg-emerald-400 rounded-t-md transition-colors cursor-pointer"
                          style={{ height: `${(data.income / maxValue) * 100}%` }}
                        />
                        <div
                          className="flex-1 bg-rose-500 hover:bg-rose-400 rounded-t-md transition-colors cursor-pointer"
                          style={{ height: `${(data.expenses / maxValue) * 100}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-medium text-gray-400 uppercase">{data.month.slice(0, 3)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Breakdown Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-200">
                  <PieChart className="w-4 h-4 text-gray-500" />
                </div>
                Top Expenses
              </h3>
              <div className="space-y-2.5">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  </div>
                ) : expenseCategories.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No expense data available</p>
                ) : expenseCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-white rounded-lg border border-gray-200">
                          <Icon className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{category.name}</p>
                          <p className="text-[10px] text-gray-400">{category.percentage}%</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">£{category.amount.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tax Reserve */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Tax Reserve
              </h4>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center pb-2.5 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Est. Corp Tax</span>
                  <span className="font-semibold text-gray-900">£{summary.corporationTaxEstimate.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Est. VAT Liability</span>
                  <span className="font-semibold text-gray-900">£{summary.vatLiabilityEstimate.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <p className="text-[10px] text-gray-400 pt-1">*Based on the last 12 months of recorded activity. Consult your accountant.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-4 sm:px-6 pt-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-200">
                <Activity className="w-4 h-4 text-gray-500" />
              </div>
              Recent Activity
            </h3>
            {recentTransactions.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllTransactions(v => !v)}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer"
              >
                {showAllTransactions ? 'Show Less' : 'View All'} <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            ) : recentTransactions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No transactions yet</p>
            ) : (showAllTransactions ? recentTransactions : recentTransactions.slice(0, 5)).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all cursor-pointer group"
                onClick={() => { setViewingTransaction(transaction); setShowViewModal(true); }}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                  transaction.type === 'income' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                }`}>
                  {transaction.type === 'income' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{transaction.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(transaction.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                      {transaction.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {transaction.type === 'income' ? '+' : '-'}£{Math.abs(transaction.amount).toLocaleString()}
                    </p>
                    <p className={`text-[10px] font-medium uppercase ${transaction.type === 'income' ? 'text-emerald-500' : 'text-gray-400'}`}>
                      {transaction.type === 'income' ? 'Received' : 'Paid'}
                    </p>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingTransaction({ ...transaction, date: transaction.date.split('T')[0] }); setOriginalTransactionType(transaction.type); setShowEditModal(true); }}
                      className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeletingTransaction(transaction); setShowDeleteModal(true); }}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Insights */}
      <div id="tour-cashflow-insights" className="px-4 sm:px-6 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { title: 'Cash Runway', val: loading ? '—' : (cashRunwayMonths === null ? 'N/A' : `${cashRunwayMonths} mo`), icon: Calendar, sub: 'Est. from cash reserves', trend: loading ? '—' : cashRunwayTrend },
            { title: 'Savings Rate', val: loading ? '—' : (avgMonthlyIncome > 0 ? `${Math.round(((avgMonthlyIncome - avgMonthlyExpenses) / avgMonthlyIncome) * 100)}%` : '0%'), icon: Sparkles, sub: 'vs last period', trend: loading ? '—' : formatTrendPct(summary.savingsRateChangePct) },
            { title: 'Burn Rate', val: loading ? '—' : `£${avgMonthlyExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: Zap, sub: 'per month', trend: loading ? '—' : formatTrendPct(summary.burnRateChangePct) }
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <item.icon className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-xs font-medium text-gray-500">{item.trend}</span>
              </div>
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">{item.title}</p>
              <p className="text-xl font-semibold text-gray-900 mt-0.5">{item.val}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full sm:max-w-xl max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-xl border border-gray-200 transform -translate-y-6 sm:translate-y-0 animate-in slide-in-from-bottom-10 duration-300">
            <ModalHandle />
            <div className="px-4 sm:px-6 py-3 sm:py-5 flex items-center justify-between shrink-0 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 rounded-xl">
                  <Plus className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">New Transaction</h2>
                  <p className="text-[11px] text-gray-500 font-medium">Add your income or expenses</p>
                </div>
              </div>
              <button onClick={() => { setShowAddModal(false); resetNewTransaction(); }} className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-2 sm:py-6 space-y-2.5 sm:space-y-5">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 sm:gap-4">
                  {(['income', 'expense'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewTransaction({ ...newTransaction, type: t, category: t === 'income' ? 'Sales' : 'Operations' })}
                      className={`p-2 sm:p-3 rounded-xl font-semibold text-sm border-2 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                        newTransaction.type === t
                          ? t === 'income' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-rose-50 border-rose-500 text-rose-700'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {t === 'income' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      {t === 'income' ? 'Income' : 'Expense'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  className="w-full px-4 py-2 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
                  placeholder="Transaction description..."
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 sm:gap-4">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Amount (£)</label>
                  <input
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                    className="w-full px-4 py-2 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium text-gray-900"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Date</label>
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    className="w-full px-4 py-2 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm text-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Category</label>
                <select
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                  className="w-full px-4 py-2 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm text-gray-900 cursor-pointer"
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
            </div>
            <ModalFooter>
              <CancelBtn onClick={() => { setShowAddModal(false); resetNewTransaction(); }} />
              <button
                type="button"
                onClick={async () => {
                  if (!newTransaction.description || !newTransaction.amount) return;
                  setSavingTransaction(true);
                  try {
                    const res = await fetch('/api/cashflow/transactions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: newTransaction.type,
                        description: newTransaction.description,
                        amount: parseFloat(newTransaction.amount),
                        date: newTransaction.date,
                        category: newTransaction.category,
                      }),
                    });
                    if (!res.ok) throw new Error('Failed to save transaction');
                    setShowAddModal(false);
                    resetNewTransaction();
                    await fetchCashflowData();
                  } catch (error) {
                    console.error('Error saving transaction:', error);
                    alert('Failed to save transaction. Please try again.');
                  } finally {
                    setSavingTransaction(false);
                  }
                }}
                disabled={!newTransaction.description || !newTransaction.amount || savingTransaction}
                className="flex-2 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {savingTransaction ? 'Saving...' : 'Save Entry'}
              </button>
            </ModalFooter>
          </div>
        </div>
      )}

      {/* View Transaction Modal */}
      {showViewModal && viewingTransaction && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full sm:max-w-lg max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-white/20 transform -translate-y-6 sm:translate-y-0 animate-in slide-in-from-bottom-10 duration-300">
            <ModalHandle />
            <div className={`px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 ${
              viewingTransaction.type === 'income' ? 'bg-green-600' : 'bg-rose-600'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl">
                  {viewingTransaction.type === 'income'
                    ? <ArrowDownRight className="w-5 h-5 text-white" />
                    : <ArrowUpRight className="w-5 h-5 text-white" />}
                </div>
                <h2 className="text-base font-bold text-white">Transaction Details</h2>
              </div>
              <button onClick={() => { setShowViewModal(false); setViewingTransaction(null); }} className="p-2 hover:bg-white/20 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
              <div className="text-center pb-4 border-b border-gray-100">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-3 ${
                  viewingTransaction.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {viewingTransaction.type === 'income' ? <CheckCircle className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                  {viewingTransaction.type === 'income' ? 'Income Received' : 'Expense Paid'}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-1.5">{viewingTransaction.description}</h3>
                <p className={`text-3xl font-bold ${viewingTransaction.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                  {viewingTransaction.amount > 0 ? '+' : ''}£{Math.abs(viewingTransaction.amount).toLocaleString()}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 sm:gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg"><Calendar className="w-4 h-4 text-blue-600" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Date</p>
                      <p className="text-sm font-bold text-gray-900">{new Date(viewingTransaction.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg"><Tag className="w-4 h-4 text-purple-600" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Category</p>
                      <p className="text-sm font-bold text-gray-900">{viewingTransaction.category}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <ModalFooter>
              <CancelBtn onClick={() => { setShowViewModal(false); setViewingTransaction(null); }} label="Close" />
              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  setEditingTransaction({ ...viewingTransaction, date: viewingTransaction.date.split('T')[0] });
                  setOriginalTransactionType(viewingTransaction.type);
                  setViewingTransaction(null);
                  setShowEditModal(true);
                }}
                className="flex-2 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" /> Edit Transaction
              </button>
            </ModalFooter>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditModal && editingTransaction && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full sm:max-w-xl max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-white/20 transform -translate-y-6 sm:translate-y-0 animate-in slide-in-from-bottom-10 duration-300">
            <ModalHandle />
            <div className="px-4 sm:px-6 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 rounded-xl"><Edit className="w-4 h-4 text-blue-600" /></div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Edit Transaction</h2>
                  <p className="text-xs text-gray-400">Update transaction details</p>
                </div>
              </div>
              <button onClick={() => { setShowEditModal(false); setEditingTransaction(null); }} className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-2 sm:py-6 space-y-2.5 sm:space-y-5">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 sm:gap-4">
                  {(['income', 'expense'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setEditingTransaction({ ...editingTransaction, type: t })}
                      className={`p-2 sm:p-3 rounded-xl font-semibold text-sm border-2 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                        editingTransaction.type === t
                          ? t === 'income' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-rose-50 border-rose-500 text-rose-700'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {t === 'income' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      {t === 'income' ? 'Income' : 'Expense'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                <input
                  type="text"
                  value={editingTransaction.description}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, description: e.target.value })}
                  className="w-full px-4 py-2 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium text-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 sm:gap-4">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Amount (£)</label>
                  <input
                    type="number"
                    value={Math.abs(editingTransaction.amount)}
                    onChange={(e) => setEditingTransaction({
                      ...editingTransaction,
                      amount: editingTransaction.type === 'income' ? Number(e.target.value) : -Number(e.target.value)
                    })}
                    className="w-full px-4 py-2 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium text-gray-900"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Date</label>
                  <input
                    type="date"
                    value={editingTransaction.date}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, date: e.target.value })}
                    className="w-full px-4 py-2 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm text-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Category</label>
                <select
                  value={editingTransaction.category}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, category: e.target.value })}
                  className="w-full px-4 py-2 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm text-gray-900 cursor-pointer"
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
            </div>
            <ModalFooter>
              <CancelBtn onClick={() => { setShowEditModal(false); setEditingTransaction(null); }} />
              <button
                type="button"
                onClick={async () => {
                  if (!editingTransaction || !originalTransactionType) return;
                  setUpdatingTransaction(true);
                  try {
                    const res = await fetch(`/api/cashflow/transactions/${editingTransaction.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        originalType: originalTransactionType,
                        type: editingTransaction.type,
                        description: editingTransaction.description,
                        amount: editingTransaction.amount,
                        date: editingTransaction.date,
                        category: editingTransaction.category,
                      }),
                    });
                    if (!res.ok) throw new Error('Failed to update transaction');
                    setShowEditModal(false);
                    setEditingTransaction(null);
                    setOriginalTransactionType(null);
                    await fetchCashflowData();
                  } catch (error) {
                    console.error('Error updating transaction:', error);
                    alert('Failed to update transaction. Please try again.');
                  } finally {
                    setUpdatingTransaction(false);
                  }
                }}
                disabled={updatingTransaction}
                className="flex-2 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {updatingTransaction ? 'Updating...' : 'Update'}
              </button>
            </ModalFooter>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTransaction && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeletingTransaction(null); }}
          onConfirm={async () => {
            if (!deletingTransaction) return;
            try {
              const res = await fetch(`/api/cashflow/transactions/${deletingTransaction.id}?type=${deletingTransaction.type}`, {
                method: 'DELETE',
              });
              if (!res.ok) throw new Error('Failed to delete transaction');
              await fetchCashflowData();
            } catch (error) {
              console.error('Error deleting transaction:', error);
              alert('Failed to delete transaction. Please try again.');
            } finally {
              setShowDeleteModal(false);
              setDeletingTransaction(null);
            }
          }}
          title="Delete Transaction"
          itemName={deletingTransaction.description || 'Transaction'}
          itemDetails={`${deletingTransaction.type === 'income' ? '+' : '-'}£${Math.abs(deletingTransaction.amount || 0).toLocaleString()} - ${deletingTransaction.date}`}
          warningMessage="This will permanently remove this transaction from your cashflow records."
        />
      )}
    </div>
  );
}
