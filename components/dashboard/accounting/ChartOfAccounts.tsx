"use client";

import React from "react";
import { Plus, Eye, Edit3, Trash2 } from "lucide-react";
import accounting from "accounting";

interface LedgerAccount {
  id: string;
  code: string;
  name: string;
  type: string;
  category: string;
  balance: number;
}

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
  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Chart of Accounts</h2>
        <div className="flex items-center gap-2">
          {accounts.length === 0 && onSeedAccounts && (
            <button
              onClick={onSeedAccounts}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md font-semibold text-sm"
            >
              Setup Defaults
            </button>
          )}
          <button
            onClick={onAddAccount}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50 border-b border-gray-200/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Code</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Account Name</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Type</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">Balance</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50">
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <p className="text-gray-500 font-medium">No accounts found. Add one or use &quot;Setup Defaults&quot; to begin.</p>
                </td>
              </tr>
            ) : accounts.map((account) => (
              <tr key={account.id} className="hover:bg-white/50 transition-colors group">
                <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-900">{account.code}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">{account.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-gray-100 text-gray-700`}>
                    {account.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">
                  {accounting.formatMoney(account.balance, "£")}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onViewAccount(account)} className="p-2 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4 text-blue-600" /></button>
                    <button onClick={() => onEditAccount(account)} className="p-2 hover:bg-purple-50 rounded-lg"><Edit3 className="w-4 h-4 text-purple-600" /></button>
                    <button onClick={() => onDeleteAccount(account.id)} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-600" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
