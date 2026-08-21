"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PoundSterling,
  Receipt,
  Target,
  ArrowUpRight,
  ArrowDownRight,
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
  const isProfitPositive = data.netProfit >= 0;

  const cards = [
    {
      label: "Total Assets",
      badge: "Debit Balance",
      value: data.totalAssets,
      icon: TrendingUp,
      iconCls: "bg-blue-50 text-blue-600 border-blue-100",
      accentDot: "bg-blue-500",
    },
    {
      label: "Total Liabilities",
      badge: "Credit Balance",
      value: data.totalLiabilities,
      icon: TrendingDown,
      iconCls: "bg-rose-50 text-rose-600 border-rose-100",
      accentDot: "bg-rose-500",
    },
    {
      label: "Total Equity",
      badge: "Capital & Retained",
      value: data.totalEquity,
      icon: Wallet,
      iconCls: "bg-purple-50 text-purple-600 border-purple-100",
      accentDot: "bg-purple-500",
    },
    {
      label: "Total Revenue",
      badge: "Income Captured",
      value: data.totalRevenue,
      icon: PoundSterling,
      iconCls: "bg-emerald-50 text-emerald-600 border-emerald-100",
      accentDot: "bg-emerald-500",
    },
    {
      label: "Total Expenses",
      badge: "Operating Outflow",
      value: data.totalExpenses,
      icon: Receipt,
      iconCls: "bg-amber-50 text-amber-600 border-amber-100",
      accentDot: "bg-amber-500",
    },
    {
      label: "Net Profit",
      badge: isProfitPositive ? "Net Surplus" : "Net Deficit",
      value: data.netProfit,
      icon: isProfitPositive ? ArrowUpRight : ArrowDownRight,
      iconCls: isProfitPositive
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-rose-50 text-rose-700 border-rose-200",
      accentDot: isProfitPositive ? "bg-emerald-500" : "bg-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((item, idx) => {
        const Icon = item.icon;
        const formattedValue = accounting.formatMoney(item.value, "$");

        return (
          <div
            key={idx}
            className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center justify-between gap-1.5">
              <div className={`p-2 rounded-xl border ${item.iconCls} transition-transform group-hover:scale-105 shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 truncate max-w-[100px]">
                {item.badge}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">
                {item.label}
              </p>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mt-0.5 truncate font-mono sm:font-sans">
                {formattedValue}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};
