"use client";

import React, { useState } from 'react';
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
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

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
    setStatusModal({
      isOpen: true,
      title: 'History Exported',
      message: 'VAT calculation history has been successfully exported to CSV.',
      type: 'success'
    });
  };

  const ukVatRates = [
    { rate: 20, label: 'Standard Rate', description: 'Most goods and services', color: 'from-blue-500 to-cyan-500', icon: CheckCircle },
    { rate: 5, label: 'Reduced Rate', description: 'Some goods and services (e.g., home energy)', color: 'from-green-500 to-emerald-500', icon: Target },
    { rate: 0, label: 'Zero Rate', description: 'Zero-rated goods and services', color: 'from-purple-500 to-pink-500', icon: Sparkles }
  ];

  const totalVATCalculated = vatHistory.reduce((sum, item) => sum + item.vatAmount, 0);
  const avgVATAmount = vatHistory.length > 0 ? totalVATCalculated / vatHistory.length : 0;

  return (
    <div className="relative min-h-screen pb-20 overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-[20%] right-[30%] w-[60%] h-[60%] rounded-full bg-indigo-300/10 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-8 p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-500">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1 text-center md:text-left">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                  VAT <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Tools</span>
                </h1>
                <p className="text-gray-500 font-medium">Precision calculation and VAT management suite</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                type="button"
                onClick={exportHistory}
                disabled={vatHistory.length === 0}
                className="flex-1 md:flex-none px-6 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition-all font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                <Download className="w-5 h-5" />
                <span>Export History</span>
              </button>
              <button 
                type="button"
                onClick={() => setVatHistory([])}
                disabled={vatHistory.length === 0}
                className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 transition-all font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                <Trash2 className="w-5 h-5" />
                <span>Clear History</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group hover:border-blue-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600">Today</div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 opacity-80">Calculations</p>
              <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{vatHistory.length}</h3>
              <p className="text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition-colors">Total operations performed</p>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group hover:border-emerald-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600">Total</div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 opacity-80">Total VAT</p>
              <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">£{totalVATCalculated.toFixed(2)}</h3>
              <p className="text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition-colors">Cumulative VAT calculated</p>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group hover:border-purple-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600">Avg</div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 opacity-80">Average VAT</p>
              <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">£{avgVATAmount.toFixed(2)}</h3>
              <p className="text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition-colors">Per transaction average</p>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group hover:border-amber-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Percent className="w-6 h-6 text-white" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600">Active</div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 opacity-80">Current Rate</p>
              <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{vatRate === 'custom' ? customRate : vatRate}%</h3>
              <p className="text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition-colors">Applied VAT percentage</p>
            </div>
          </div>
        </div>

        {/* Calculator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input & Calculator */}
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/50 shadow-2xl space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Calculator</h3>
              </div>
              
              <div className="flex bg-gray-100/50 p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => setCalculatorMode('add')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    calculatorMode === 'add'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Add VAT
                </button>
                <button
                  onClick={() => setCalculatorMode('remove')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    calculatorMode === 'remove'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                  Remove VAT
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {calculatorMode === 'add' ? 'Net Amount (excl. VAT)' : 'Gross Amount (incl. VAT)'}
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors font-bold text-lg">£</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white text-2xl font-black text-gray-900 placeholder-gray-300 transition-all outline-none shadow-inner" 
                    placeholder="0.00" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">VAT Rate (%)</label>
                <select
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value)}
                  className="w-full px-4 py-4 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white text-lg font-bold text-gray-900 transition-all cursor-pointer outline-none shadow-sm appearance-none"
                >
                  <option value="20">20% - Standard Rate</option>
                  <option value="5">5% - Reduced Rate</option>
                  <option value="0">0% - Zero Rate</option>
                  <option value="custom">Custom Rate</option>
                </select>
                {vatRate === 'custom' && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                    <input 
                      type="number" 
                      value={customRate}
                      onChange={(e) => setCustomRate(e.target.value)}
                      className="w-full px-4 py-4 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white text-lg font-bold text-gray-900 placeholder-gray-300 transition-all outline-none" 
                      placeholder="Enter custom rate %" 
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={calculateVAT}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 hover:-translate-y-0.5"
                >
                  <Zap className="w-5 h-5" />
                  Calculate Result
                </button>
                <button 
                  onClick={clearCalculator}
                  className="px-6 py-4 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer hover:border-gray-300 hover:shadow-md"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/50 shadow-2xl flex flex-col h-full">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Summary</h3>
            </div>
            
            <div className="flex-1 space-y-6">
              <div className="bg-white/60 p-6 rounded-2xl border border-white/60 shadow-sm flex items-center justify-between group hover:border-blue-300 transition-colors">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Net Amount</p>
                  <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg w-fit">
                    <Info className="w-3 h-3" /> Excl. VAT
                  </div>
                </div>
                <span className="text-3xl font-black text-gray-900">£{netAmount.toFixed(2)}</span>
              </div>

              <div className="bg-white/60 p-6 rounded-2xl border border-white/60 shadow-sm flex items-center justify-between group hover:border-purple-300 transition-colors">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">VAT Amount ({vatRate === 'custom' ? customRate : vatRate}%)</p>
                  <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-lg w-fit">
                    <Info className="w-3 h-3" /> Tax Value
                  </div>
                </div>
                <span className="text-3xl font-black text-purple-600">£{vatAmount.toFixed(2)}</span>
              </div>

              <div className="bg-gray-900 p-6 rounded-2xl shadow-xl flex items-center justify-between transform transition-transform group hover:scale-[1.02]">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Gross Amount</p>
                  <div className="flex items-center gap-2 text-xs text-emerald-400 bg-gray-800 px-2 py-1 rounded-lg w-fit">
                    <CheckCircle className="w-3 h-3" /> Total
                  </div>
                </div>
                <span className="text-4xl font-black text-white">£{grossAmount.toFixed(2)}</span>
              </div>

              {(amount && parseFloat(amount) > 0) && (
                <div className={`mt-4 p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 ${
                  calculatorMode === 'add' 
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800' 
                    : 'bg-blue-50/80 border-blue-200 text-blue-800'
                }`}>
                  <div className={`p-2 rounded-full ${calculatorMode === 'add' ? 'bg-emerald-200 text-emerald-700' : 'bg-blue-200 text-blue-700'}`}>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm">
                    {calculatorMode === 'add' 
                      ? `£${amount} + £${vatAmount.toFixed(2)} VAT = £${grossAmount.toFixed(2)}`
                      : `£${amount} - £${vatAmount.toFixed(2)} VAT = £${netAmount.toFixed(2)}`
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* UK VAT Rates Reference */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/50 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
              <Percent className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">Current UK VAT Rates</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ukVatRates.map((rate) => {
              const Icon = rate.icon;
              return (
                <div 
                  key={rate.rate} 
                  className="relative p-8 bg-white/60 rounded-3xl border border-white/50 hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer group overflow-hidden"
                  onClick={() => {
                    setVatRate(rate.rate.toString());
                    setCustomRate('');
                  }}
                >
                  <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${rate.color} opacity-10 rounded-full group-hover:scale-150 transition-transform`} />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${rate.color} shadow-lg group-hover:rotate-12 transition-transform duration-500`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-5xl font-black text-gray-900 tracking-tighter">{rate.rate}%</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-xl mb-2">{rate.label}</h4>
                      <p className="text-sm font-medium text-gray-500 leading-relaxed">{rate.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calculation History */}
        {vatHistory.length > 0 && (
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-gray-100/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Recent Calculations</h3>
              </div>
              <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-wider border border-indigo-100">
                {vatHistory.length} records
              </span>
            </div>
            
            <div className="divide-y divide-gray-100/50">
              {vatHistory.slice(0, 5).map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-6 hover:bg-white/40 transition-colors group cursor-default"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300 ${
                      item.mode === 'add' 
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
                        : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                    }`}>
                      {item.mode === 'add' ? <Plus className="w-6 h-6 text-white" /> : <Minus className="w-6 h-6 text-white" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">
                        {item.mode === 'add' ? 'VAT Added' : 'VAT Removed'} 
                        <span className="text-gray-400 font-normal ml-2">@ {item.vatRate}%</span>
                      </p>
                      <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                          <Calendar className="w-3 h-3" /> {item.date}
                        </span>
                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                          <DollarSign className="w-3 h-3" /> Base: £{item.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-gray-900 tracking-tight">£{item.total.toFixed(2)}</p>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                        VAT: £{item.vatAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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
