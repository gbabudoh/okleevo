"use client";

import React, { useState } from 'react';
import { 
  Calculator, Plus, Minus, TrendingUp, FileText, Download, Calendar, 
  Info, ArrowRight, Percent, CheckCircle, AlertCircle, Sparkles,
  DollarSign, BarChart3, PieChart, Activity, Target, Zap,
  ArrowUpRight, ArrowDownRight, RefreshCw, Eye, Copy
} from 'lucide-react';

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

  const calculateVAT = () => {
    const amountNum = parseFloat(amount) || 0;
    const rateNum = vatRate === 'custom' ? parseFloat(customRate) || 0 : parseFloat(vatRate) || 0;
    
    let net = 0;
    let vat = 0;
    let gross = 0;

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

    const historyItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      amount: amountNum,
      vatRate: rateNum,
      vatAmount: vat,
      total: gross,
      mode: calculatorMode
    };
    setVatHistory([historyItem, ...vatHistory.slice(0, 9)]);
  };

  const clearCalculator = () => {
    setAmount('');
    setNetAmount(0);
    setVatAmount(0);
    setGrossAmount(0);
  };

  const exportHistory = () => {
    const csv = 'VAT Calculation History\n\n';
    const headers = ['Date', 'Mode', 'Amount', 'VAT Rate', 'VAT Amount', 'Total'];
    const rows = vatHistory.map(item => [
      item.date,
      item.mode === 'add' ? 'Add VAT' : 'Remove VAT',
      `£${item.amount.toFixed(2)}`,
      `${item.vatRate}%`,
      `£${item.vatAmount.toFixed(2)}`,
      `£${item.total.toFixed(2)}`
    ]);
    
    let csvContent = csv + headers.join(',') + '\n';
    csvContent += rows.map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vat-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('✓ VAT history exported successfully!');
  };

  const ukVatRates = [
    { rate: 20, label: 'Standard Rate', description: 'Most goods and services', color: 'from-blue-500 to-cyan-500', icon: CheckCircle },
    { rate: 5, label: 'Reduced Rate', description: 'Some goods and services (e.g., home energy)', color: 'from-green-500 to-emerald-500', icon: Target },
    { rate: 0, label: 'Zero Rate', description: 'Zero-rated goods and services', color: 'from-purple-500 to-pink-500', icon: Sparkles }
  ];

  const totalVATCalculated = vatHistory.reduce((sum, item) => sum + item.vatAmount, 0);
  const avgVATAmount = vatHistory.length > 0 ? totalVATCalculated / vatHistory.length : 0;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 text-gray-900">
              <Calculator className="w-10 h-10 text-gray-700" />
              VAT Tools
            </h1>
            <p className="text-gray-600 text-lg">Calculate and manage VAT for your business with ease</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={exportHistory}
              disabled={vatHistory.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-xl rounded-xl transition-all font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              <span>Export History</span>
            </button>
            <button 
              type="button"
              onClick={() => setVatHistory([])}
              disabled={vatHistory.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl transition-all font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-5 h-5" />
              Clear History
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 hover:shadow-2xl hover:scale-105 transition-all overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-500 opacity-10 rounded-full group-hover:scale-150 transition-transform pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-100 text-blue-700">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-bold">Today</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Calculations</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">{vatHistory.length}</p>
            <p className="text-xs text-gray-500">Total calculations made</p>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 hover:shadow-2xl hover:scale-105 transition-all overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-500 opacity-10 rounded-full group-hover:scale-150 transition-transform pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-100 text-green-700">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-bold">Total</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Total VAT</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">£{totalVATCalculated.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Calculated VAT amount</p>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 hover:shadow-2xl hover:scale-105 transition-all overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 opacity-10 rounded-full group-hover:scale-150 transition-transform pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-100 text-purple-700">
                <Target className="w-4 h-4" />
                <span className="text-sm font-bold">Avg</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Average VAT</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">£{avgVATAmount.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Per calculation</p>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200 hover:shadow-2xl hover:scale-105 transition-all overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-orange-500 to-red-500 opacity-10 rounded-full group-hover:scale-150 transition-transform pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                <Percent className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-orange-100 text-orange-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-bold">Active</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Current Rate</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">{vatRate === 'custom' ? customRate : vatRate}%</p>
            <p className="text-xs text-gray-500">VAT rate in use</p>
          </div>
        </div>
      </div>

      {/* Calculator Mode Toggle */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Calculator Mode:</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCalculatorMode('add')}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                calculatorMode === 'add'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Plus className="w-5 h-5" />
              Add VAT
            </button>
            <button
              onClick={() => setCalculatorMode('remove')}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                calculatorMode === 'remove'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Minus className="w-5 h-5" />
              Remove VAT
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VAT Calculator */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">VAT Calculator</h3>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {calculatorMode === 'add' ? 'Net Amount (excluding VAT)' : 'Gross Amount (including VAT)'}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">£</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg font-semibold transition-all" 
                  placeholder="0.00" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">VAT Rate (%)</label>
              <select
                value={vatRate}
                onChange={(e) => setVatRate(e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-semibold transition-all cursor-pointer"
              >
                <option value="20">20% - Standard Rate</option>
                <option value="5">5% - Reduced Rate</option>
                <option value="0">0% - Zero Rate</option>
                <option value="custom">Custom Rate</option>
              </select>
              {vatRate === 'custom' && (
                <input 
                  type="number" 
                  value={customRate}
                  onChange={(e) => setCustomRate(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent mt-3 font-semibold transition-all" 
                  placeholder="Enter custom rate %" 
                />
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={calculateVAT}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Calculate VAT
              </button>
              <button 
                onClick={clearCalculator}
                className="px-6 py-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 font-bold transition-all cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* VAT Summary */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">VAT Summary</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Net Amount:</span>
                <span className="text-2xl font-bold text-gray-900">£{netAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Info className="w-4 h-4" />
                Amount excluding VAT
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">VAT Amount ({vatRate === 'custom' ? customRate : vatRate}%):</span>
                <span className="text-2xl font-bold text-purple-600">£{vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Info className="w-4 h-4" />
                VAT to {calculatorMode === 'add' ? 'add' : 'remove'}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 border-2 border-gray-700 shadow-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-300">Gross Amount:</span>
                <span className="text-3xl font-bold text-white">£{grossAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <CheckCircle className="w-4 h-4" />
                Total amount including VAT
              </div>
            </div>

            {calculatorMode === 'add' && amount && (
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-green-50 p-4 rounded-xl border border-green-200">
                <ArrowRight className="w-5 h-5 text-green-600" />
                <span>£{amount} + £{vatAmount.toFixed(2)} VAT = £{grossAmount.toFixed(2)}</span>
              </div>
            )}
            {calculatorMode === 'remove' && amount && (
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-blue-50 p-4 rounded-xl border border-blue-200">
                <ArrowRight className="w-5 h-5 text-blue-600" />
                <span>£{amount} - £{vatAmount.toFixed(2)} VAT = £{netAmount.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* UK VAT Rates Reference */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
            <Percent className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">UK VAT Rates Reference</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ukVatRates.map((rate) => {
            const Icon = rate.icon;
            return (
              <div 
                key={rate.rate} 
                className="relative p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 hover:shadow-2xl hover:scale-105 transition-all cursor-pointer group overflow-hidden"
                onClick={() => {
                  setVatRate(rate.rate.toString());
                  setCustomRate('');
                }}
              >
                <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${rate.color} opacity-10 rounded-full group-hover:scale-150 transition-transform`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${rate.color} shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-4xl font-bold text-gray-900">{rate.rate}%</span>
                  </div>
                  <p className="font-bold text-gray-900 text-lg mb-2">{rate.label}</p>
                  <p className="text-sm text-gray-600">{rate.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calculation History */}
      {vatHistory.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Recent Calculations</h3>
            </div>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold">
              {vatHistory.length} total
            </span>
          </div>
          <div className="space-y-3">
            {vatHistory.slice(0, 5).map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-lg transition-all border border-gray-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                    item.mode === 'add' 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                      : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                  }`}>
                    {item.mode === 'add' ? <Plus className="w-6 h-6 text-white" /> : <Minus className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {item.mode === 'add' ? 'Added' : 'Removed'} {item.vatRate}% VAT
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {item.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">£{item.total.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">VAT: £{item.vatAmount.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
