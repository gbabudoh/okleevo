"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PoundSterling,
  Receipt,
  Target,
} from "lucide-react";
import accounting from "accounting";

interface FinancialSummaryProps {
  data: {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
  };
}

export const AccountingSummary: React.FC<FinancialSummaryProps> = ({ data }) => {
  const cards = [
    {
      label: "Total Assets",
      value: data.totalAssets,
      labelCls: "text-blue-600 dark:text-blue-400",
      valueCls: "text-slate-900 dark:text-white",
      bgGrad: "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-100 dark:shadow-none",
      icon: TrendingUp,
    },
    {
      label: "Total Liabilities",
      value: data.totalLiabilities,
      labelCls: "text-rose-600 dark:text-rose-400",
      valueCls: "text-rose-700 dark:text-rose-300",
      bgGrad: "bg-gradient-to-br from-rose-500 to-red-600 shadow-md shadow-rose-100 dark:shadow-none",
      icon: TrendingDown,
    },
    {
      label: "Total Equity",
      value: data.totalEquity,
      labelCls: "text-purple-600 dark:text-purple-400",
      valueCls: "text-purple-900 dark:text-purple-200",
      bgGrad: "bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md shadow-purple-100 dark:shadow-none",
      icon: Wallet,
    },
    {
      label: "Total Revenue",
      value: data.totalRevenue,
      labelCls: "text-emerald-600 dark:text-emerald-400",
      valueCls: "text-emerald-700 dark:text-emerald-300",
      bgGrad: "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-100 dark:shadow-none",
      icon: PoundSterling,
    },
    {
      label: "Total Expenses",
      value: data.totalExpenses,
      labelCls: "text-amber-600 dark:text-amber-400",
      valueCls: "text-amber-800 dark:text-amber-300",
      bgGrad: "bg-gradient-to-br from-amber-500 to-orange-600 shadow-md shadow-amber-100 dark:shadow-none",
      icon: Receipt,
    },
    {
      label: "Net Profit",
      value: data.netProfit,
      labelCls: "text-indigo-600 dark:text-indigo-400",
      valueCls: "text-indigo-950 dark:text-indigo-200",
      bgGrad: "bg-gradient-to-br from-indigo-600 to-violet-700 shadow-md shadow-indigo-100 dark:shadow-none",
      icon: Target,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {cards.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-slate-800 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 ${item.bgGrad} rounded-xl`}>
                <Icon className="w-4.5 h-4.5 text-white" />
              </div>
            </div>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${item.labelCls}`}>{item.label}</p>
            <p className={`text-xl sm:text-2xl font-extrabold tracking-tight ${item.valueCls}`}>
              {accounting.formatMoney(item.value, "£")}
            </p>
          </div>
        );
      })}
    </div>
  );
};
