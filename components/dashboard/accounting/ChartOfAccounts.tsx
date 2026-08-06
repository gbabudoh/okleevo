"use client";

import React, { useState } from "react";
import { Plus, Eye, Edit3, Trash2, Search, BookOpen, Sparkles, Layers } from "lucide-react";
import accounting from "accounting";

interface LedgerAccount {
  id: string;
  code: string;
  name: string;
  type: string;
  category: string;
  balance: number;
  isCashAccount?: boolean;
}

const ACCOUNT_TYPE_PILL: Record<string, string> = {
  asset: "bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/80",
  liability: "bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80",
  equity: "bg-purple-50 text-purple-700 border border-purple-200/60 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/80",
  revenue: "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80",
  expense: "bg-amber-50 text-amber-800 border border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80",
};

interface ChartOfAccountsProps {
  accounts: LedgerAccount[];
  onAddAccount: () => void;
  onViewAccount: (account: LedgerAccount) => void;
  onEditAccount: (account: LedgerAccount) => void;
  onDeleteAccount: (id: string) => void;
  onSeedAccounts?: () => void;
}

export const ChartOfAccounts: React.FC<ChartOfAccountsProps> = ({
  accounts,
  onAddAccount,
  onViewAccount,
  onEditAccount,
  onDeleteAccount,
  onSeedAccounts,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || acc.type.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "asset", "liability", "equity", "revenue", "expense"];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header & Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Chart of Accounts
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Manage general ledger codes and balances for UK SME bookkeeping</p>
        </div>

        <div className="flex items-center gap-2.5">
          {accounts.length === 0 && onSeedAccounts && (
            <button
              onClick={onSeedAccounts}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all flex items-center gap-2 shadow-sm font-bold text-xs cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              Setup Defaults
            </button>
          )}
          <button
            onClick={onAddAccount}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all flex items-center gap-2 shadow-sm font-bold text-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        </div>
      </div>

      {/* Search & Category Filter Strip (shown when accounts exist or for quick search) */}
      {accounts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by account code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all text-gray-900 dark:text-white"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => {
              const count =
                cat === "all"
                  ? accounts.length
                  : accounts.filter((a) => a.type.toLowerCase() === cat).length;
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    active
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <span>{cat === "all" ? "All Types" : cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${active ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-slate-700 text-gray-500"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Onboarding Banner when no accounts exist */}
      {accounts.length === 0 ? (
        <div className="bg-gradient-to-br from-indigo-50/90 via-blue-50/50 to-indigo-50/90 dark:from-slate-800/80 dark:to-slate-800/40 border border-indigo-100 dark:border-slate-700 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/60 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
            <Layers className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">Setup Standard UK Chart of Accounts</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Generate UK GAAP compliant ledger codes automatically (1000 Bank, 2000 Accounts Payable, 3000 Share Capital, 4000 Revenue, 5000 Expenses).
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {onSeedAccounts && (
              <button
                onClick={onSeedAccounts}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                Load UK Standard Chart of Accounts (1-Click)
              </button>
            )}
            <button
              onClick={onAddAccount}
              className="w-full sm:w-auto px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-gray-100 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Custom Account
            </button>
          </div>
        </div>
      ) : (
        /* Table */
        <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-slate-800">
          <table className="w-full">
            <thead className="bg-gray-50/80 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Account Name</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-xs text-gray-400 font-medium">
                    No matching accounts found for &quot;{searchTerm}&quot;
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-gray-900 dark:text-white">{account.code}</td>
                    <td className="px-5 py-3.5 font-semibold text-sm text-gray-900 dark:text-white">
                      {account.name}
                      {account.isCashAccount && (
                        <span className="ml-2 px-2 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300 text-[9px] font-bold rounded-full border border-emerald-200/60 align-middle">CASH / BANK</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${ACCOUNT_TYPE_PILL[account.type.toLowerCase()] ?? "bg-gray-100 text-gray-700"}`}>
                        {account.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-extrabold text-sm text-gray-900 dark:text-white tracking-tight">
                      {accounting.formatMoney(account.balance, "£")}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => onViewAccount(account)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors cursor-pointer" title="View Account"><Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" /></button>
                        <button onClick={() => onEditAccount(account)} className="p-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/60 rounded-lg transition-colors cursor-pointer" title="Edit Account"><Edit3 className="w-4 h-4 text-purple-600 dark:text-purple-400" /></button>
                        <button onClick={() => onDeleteAccount(account.id)} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer" title="Delete Account"><Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
