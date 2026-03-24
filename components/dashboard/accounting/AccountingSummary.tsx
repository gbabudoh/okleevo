"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
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
    { label: "Total Assets", value: data.totalAssets, color: "blue", icon: TrendingUp },
    { label: "Total Liabilities", value: data.totalLiabilities, color: "red", icon: TrendingDown },
    { label: "Total Equity", value: data.totalEquity, color: "purple", icon: Wallet },
    { label: "Total Revenue", value: data.totalRevenue, color: "green", icon: DollarSign },
    { label: "Total Expenses", value: data.totalExpenses, color: "orange", icon: Receipt },
    { label: "Net Profit", value: data.netProfit, color: "indigo", icon: Target },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="bg-white/60 backdrop-blur-xl rounded-xl p-5 border border-white/50 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 bg-${item.color}-500 rounded-lg shadow-md`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className={`text-sm text-${item.color}-600 font-medium mb-1`}>{item.label}</p>
            <p className={`text-2xl font-bold text-${item.color}-900`}>
              {accounting.formatMoney(item.value, "£")}
            </p>
          </div>
        );
      })}
    </div>
  );
};
