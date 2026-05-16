"use client";

import { useState } from 'react';
import {
  Calculator, Plus, Minus, TrendingUp, FileText, Download, Calendar,
  Info, ArrowRight, Percent, CheckCircle, DollarSign, BarChart3,
  Activity, Target, Zap, Trash2, Sparkles
} from 'lucide-react';
import StatusModal from '@/components/StatusModal';

export default function VATToolsPage() {
  const [calculatorMode, setCalculatorMode] = useState<'add' | 'remove'>('add');
  const [amount, setAmount] = useState<string>('');
  const [vatRate, setVatRate] = useState<string>('20');
  const [customRate, setCustomRate] = useState<string>('');
  const [netAmount, setNetAmount] = useState<number>(0);
  const [vatAmount, setVatAmount] = useState<number>(0);
  const [grossAmount, setGrossAmount] = useState<number>(0);

  const [vatHistory, setVatHistory] = useState<Array<{
    id: string;
    date: string;
    amount: number;
    vatRate: number;
    vatAmount: number;
    total: number;
    mode: 'add' | 'remove';
  }>>([]);

  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ isOpen: false, title: '', message: '', type: 'success' });

  const calculateVAT = () => {
    const amountNum = parseFloat(amount) || 0;
    const rateNum = vatRate === 'custom' ? parseFloat(customRate) || 0 : parseFloat(vatRate) || 0;
    let net = 0, vat = 0, gross = 0;
    if (calculatorMode === 'add') {
      net = amountNum;
      vat = (amountNum * rateNum) / 100;
      gross = amountNum + vat;
    } else {
      gross = amountNum;
      net = amountNum / (1 + rateNum / 100);
      vat = amountNum - net;
    }
    setNetAmount(net);
    setVatAmount(vat);
    setGrossAmount(gross);
    setVatHistory([{
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      amount: amountNum,
      vatRate: rateNum,
      vatAmount: vat,
      total: gross,
      mode: calculatorMode
    }, ...vatHistory.slice(0, 9)]);
  };

  const clearCalculator = () => {
    setAmount('');
    setNetAmount(0);
    setVatAmount(0);
    setGrossAmount(0);
  };

  const exportHistory = () => {
    const headers = ['Date', 'Mode', 'Amount', 'VAT Rate', 'VAT Amount', 'Total'];
    const rows = vatHistory.map(item => [
      item.date,
      item.mode === 'add' ? 'Add VAT' : 'Remove VAT',
      `£${item.amount.toFixed(2)}`,
      `${item.vatRate}%`,
      `£${item.vatAmount.toFixed(2)}`,
      `£${item.total.toFixed(2)}`
    ]);
    let csvContent = 'VAT Calculation History\n\n' + headers.join(',') + '\n';
    csvContent += rows.map(row => row.join(',')).join('\n');
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vat-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusModal({ isOpen: true, title: 'History Exported', message: 'VAT calculation history has been successfully exported to CSV.', type: 'success' });
  };

  const ukVatRates = [
    { rate: 20, label: 'Standard Rate', description: 'Most goods and services', bg: 'bg-blue-100', text: 'text-blue-600', icon: CheckCircle },
    { rate: 5, label: 'Reduced Rate', description: 'Some goods and services (e.g., home energy)', bg: 'bg-green-100', text: 'text-green-600', icon: Target },
    { rate: 0, label: 'Zero Rate', description: 'Zero-rated goods and services', bg: 'bg-purple-100', text: 'text-purple-600', icon: Sparkles }
  ];

  const totalVATCalculated = vatHistory.reduce((sum, item) => sum + item.vatAmount, 0);
  const avgVATAmount = vatHistory.length > 0 ? totalVATCalculated / vatHistory.length : 0;
  const activeRate = vatRate === 'custom' ? customRate || '0' : vatRate;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8">

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-indigo-600 rounded-xl shrink-0">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">VAT Tools</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Precision VAT calculation suite</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={exportHistory}
              disabled={vatHistory.length === 0}
              className="p-2 sm:px-4 sm:py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-semibold">Export</span>
            </button>
            <button
              type="button"
              onClick={() => setVatHistory([])}
              disabled={vatHistory.length === 0}
              className="p-2 sm:px-4 sm:py-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-semibold">Clear History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 sm:px-6 pt-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Calculations', value: vatHistory.length.toString(), sub: 'Total operations', icon: Calculator, bg: 'bg-blue-100', text: 'text-blue-600', badge: 'Today' },
            { label: 'Total VAT', value: `£${totalVATCalculated.toFixed(2)}`, sub: 'Cumulative VAT', icon: TrendingUp, bg: 'bg-emerald-100', text: 'text-emerald-600', badge: 'Total' },
            { label: 'Average VAT', value: `£${avgVATAmount.toFixed(2)}`, sub: 'Per transaction', icon: BarChart3, bg: 'bg-purple-100', text: 'text-purple-600', badge: 'Avg' },
            { label: 'Current Rate', value: `${activeRate}%`, sub: 'Applied VAT %', icon: Percent, bg: 'bg-amber-100', text: 'text-amber-600', badge: 'Active' },
          ].map(({ label, value, sub, icon: Icon, bg, text, badge }) => (
            <div key={label} className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 ${bg} rounded-xl`}>
                  <Icon className={`w-4 h-4 ${text}`} />
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${bg} ${text}`}>{badge}</span>
              </div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">{value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Calculator + Results */}
      <div className="px-4 sm:px-6 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Input */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 rounded-lg">
                  <Calculator className="w-4 h-4 text-indigo-600" />
                </div>
                Calculator
              </h3>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setCalculatorMode('add')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    calculatorMode === 'add' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" /> Add VAT
                </button>
                <button
                  onClick={() => setCalculatorMode('remove')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    calculatorMode === 'remove' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" /> Remove VAT
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                {calculatorMode === 'add' ? 'Net Amount (excl. VAT)' : 'Gross Amount (incl. VAT)'}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">£</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-xl font-bold text-gray-900 placeholder:text-gray-300 outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">VAT Rate (%)</label>
              <select
                value={vatRate}
                onChange={(e) => setVatRate(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-bold text-gray-900 transition-all cursor-pointer outline-none"
              >
                <option value="20">20% — Standard Rate</option>
                <option value="5">5% — Reduced Rate</option>
                <option value="0">0% — Zero Rate</option>
                <option value="custom">Custom Rate</option>
              </select>
              {vatRate === 'custom' && (
                <input
                  type="number"
                  value={customRate}
                  onChange={(e) => setCustomRate(e.target.value)}
                  className="mt-3 w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-bold text-gray-900 placeholder:text-gray-300 outline-none transition-all"
                  placeholder="Enter custom rate %"
                />
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={calculateVAT}
                className="flex-1 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" /> Calculate
              </button>
              <button
                onClick={clearCalculator}
                className="px-5 py-3.5 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 rounded-lg">
                <FileText className="w-4 h-4 text-emerald-600" />
              </div>
              Summary
            </h3>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Net Amount</p>
                <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                  <Info className="w-3 h-3" /> Excl. VAT
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">£{netAmount.toFixed(2)}</span>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                  VAT Amount ({activeRate}%)
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg">
                  <Info className="w-3 h-3" /> Tax Value
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-purple-600">£{vatAmount.toFixed(2)}</span>
            </div>

            <div className="bg-gray-900 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Gross Amount</p>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-gray-800 px-2 py-0.5 rounded-lg">
                  <CheckCircle className="w-3 h-3" /> Total
                </span>
              </div>
              <span className="text-3xl sm:text-4xl font-bold text-white">£{grossAmount.toFixed(2)}</span>
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                calculatorMode === 'add'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                <div className={`p-1.5 rounded-lg shrink-0 ${calculatorMode === 'add' ? 'bg-emerald-200' : 'bg-blue-200'}`}>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold">
                  {calculatorMode === 'add'
                    ? `£${amount} + £${vatAmount.toFixed(2)} VAT = £${grossAmount.toFixed(2)}`
                    : `£${amount} − £${vatAmount.toFixed(2)} VAT = £${netAmount.toFixed(2)}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* UK VAT Rates Reference */}
      <div className="px-4 sm:px-6 pt-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-amber-100 rounded-lg">
              <Percent className="w-4 h-4 text-amber-600" />
            </div>
            Current UK VAT Rates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ukVatRates.map((rate) => {
              const Icon = rate.icon;
              const isActive = vatRate === rate.rate.toString();
              return (
                <button
                  key={rate.rate}
                  onClick={() => { setVatRate(rate.rate.toString()); setCustomRate(''); }}
                  className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
                    isActive
                      ? `border-indigo-500 ${rate.bg}`
                      : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 ${rate.bg} rounded-xl`}>
                      <Icon className={`w-4 h-4 ${rate.text}`} />
                    </div>
                    <span className="text-3xl font-bold text-gray-900">{rate.rate}%</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{rate.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">{rate.description}</p>
                  {isActive && (
                    <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                      <CheckCircle className="w-2.5 h-2.5" /> Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Calculation History */}
      {vatHistory.length > 0 && (
        <div className="px-4 sm:px-6 pt-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 rounded-lg">
                  <Activity className="w-4 h-4 text-indigo-600" />
                </div>
                Recent Calculations
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                {vatHistory.length} records
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {vatHistory.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.mode === 'add' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {item.mode === 'add' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {item.mode === 'add' ? 'VAT Added' : 'VAT Removed'}
                      <span className="text-gray-400 font-normal ml-1.5">@ {item.vatRate}%</span>
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" /> {item.date}
                      </span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                        <DollarSign className="w-3 h-3" /> Base: £{item.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">£{item.total.toFixed(2)}</p>
                    <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                      VAT £{item.vatAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
      />
    </div>
  );
}
