"use client";

import React, { useState } from 'react';
import { 
  FileText, Plus, Download, Calculator, Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle,
  Clock, Building2, User, Users, Briefcase, BarChart3, Shield, Send, X, Receipt, Home, History
} from 'lucide-react';
import jsPDF from 'jspdf';

interface TaxObligation {
  id: string;
  type: string;
  description: string;
  dueDate: Date;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  period: string;
}

export default function TaxationPage() {
  // Calculate current UK tax year (runs April 6 to April 5)
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed
  const day = today.getDate();
  
  // UK tax year starts April 6
  // If we're before April 6, we're in the previous tax year
  const currentTaxYear = (month < 3 || (month === 3 && day < 6))
    ? `${year - 1}/${String(year).slice(-2)}`
    : `${year}/${String(year + 1).slice(-2)}`;

  // Parse the start year from current tax year
  const [startYear] = currentTaxYear.split('/');
  const baseYear = parseInt(startYear);

  // Tax year options
  const taxYearOptions = [
    { year: `${baseYear}/${String(baseYear + 1).slice(-2)}`, label: 'Current year' },
    { year: `${baseYear - 1}/${String(baseYear).slice(-2)}`, label: 'Previous year' },
    { year: `${baseYear - 2}/${String(baseYear - 1).slice(-2)}`, label: 'Earlier year' },
  ];

  // Get tax deadlines for a specific month
  const getTaxEventsForMonth = (year: number, month: number) => {
    const events: Record<string, { label: string, color: string, fullTask: string, type: string }> = {};
    
    // Monthly deadlines
    events['7'] = { label: 'VAT', color: 'purple', fullTask: 'VAT Return & Payment Due', type: 'VAT' };
    events['19'] = { label: 'PAYE/NI/CIS', color: 'blue', fullTask: 'PAYE/NI/CIS Monthly Return Due', type: 'PAYROLL' };
    events['22'] = { label: 'Payment', color: 'emerald', fullTask: 'PAYE/NI/CIS Monthly Payment Due (Electronic)', type: 'PAYMENT' };

    // Annual/Special deadlines
    if (month === 0) { // January
      events['31'] = { label: 'Self Assessment', color: 'red', fullTask: 'Self Assessment Deadline & Balance Payment', type: 'SA' };
    }
    if (month === 3) { // April
      events['5'] = { label: 'Year End', color: 'orange', fullTask: 'End of Tax Year 2024/25', type: 'ANNUAL' };
      events['6'] = { label: 'New Year', color: 'green', fullTask: 'Start of Tax Year 2025/26', type: 'ANNUAL' };
    }
    if (month === 4) { // May
      events['31'] = { label: 'P60', color: 'indigo', fullTask: 'Deadline to Give Employees P60s', type: 'ANNUAL' };
    }
    if (month === 6) { // July
      events['6'] = { label: 'P11D', color: 'cyan', fullTask: 'Deadline for P11D & P11D(b) Submissions', type: 'ANNUAL' };
      events['31'] = { label: 'SA Payment', color: 'red', fullTask: 'Second Self Assessment Payment on Account', type: 'SA' };
    }
    if (month === 9) { // October
      events['5'] = { label: 'SA Reg', color: 'amber', fullTask: 'Deadline to Register for Self Assessment', type: 'SA' };
      events['31'] = { label: 'Paper SA', color: 'rose', fullTask: 'Deadline for Paper Self Assessment Returns', type: 'SA' };
    }
    if (month === 11) { // December
      events['30'] = { label: 'Online SA', color: 'pink', fullTask: 'Deadline for Online SA (to collect tax via code)', type: 'SA' };
    }

    return events;
  };

  // Get upcoming tax deadlines list (next 3 months)
  const getUpcomingDeadlines = () => {
    const deadlines: { date: Date, task: string, type: string, color: string }[] = [];
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // Look at current and next 2 months
    for (let i = 0; i < 4; i++) {
      const targetDate = new Date(currentYear, currentMonth + i, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      const events = getTaxEventsForMonth(year, month);
      
      Object.entries(events).forEach(([day, info]) => {
        const d = new Date(year, month, parseInt(day));
        if (d >= new Date(today.setHours(0,0,0,0))) {
          deadlines.push({
            date: d,
            task: info.fullTask,
            type: info.type,
            color: info.color
          });
        }
      });
    }

    return deadlines.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 6);
  };

  const [activeTab, setActiveTab] = useState('overview');
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedDownloadFormat, setSelectedDownloadFormat] = useState<'TXT' | 'CSV' | 'PDF' | 'JSON'>('PDF');
  const [calculatedTax, setCalculatedTax] = useState(0);
  const [taxableIncome, setTaxableIncome] = useState('');
  const [showNewReturnModal, setShowNewReturnModal] = useState(false);
  const [newReturnStep, setNewReturnStep] = useState(1);
  const [newReturnData, setNewReturnData] = useState({
    type: '',
    period: 'Q1 2025',
    reference: '',
    turnover: '',
    expenses: '',
    notes: ''
  });
  const [ctProfit, setCtProfit] = useState('50000');
  const [ctPeriod, setCtPeriod] = useState('Year ending 31/03/2024');
  const [showCT600Modal, setShowCT600Modal] = useState(false);

  // Self Assessment States - Initialize with current tax year
  const [saTaxYear, setSaTaxYear] = useState(currentTaxYear);
  const [isSwitchingYear, setIsSwitchingYear] = useState(false);

  // Initial year data (generated once)
  const initialYearData: Record<string, { selfEmployment: number, employment: number, property: number, dividends: number, expenses: number }> = {};
  taxYearOptions.forEach((option, index) => {
    const multiplier = 1 - (index * 0.08);
    initialYearData[option.year] = {
      selfEmployment: Math.round(45000 * multiplier),
      employment: Math.round(25000 * multiplier),
      property: Math.round(12000 * multiplier),
      dividends: Math.round(3500 * multiplier),
      expenses: Math.round(8200 * multiplier)
    };
  });

  const [saYearData, setSaYearData] = useState<Record<string, {
    selfEmployment: number,
    employment: number,
    property: number,
    dividends: number,
    expenses: number
  }>>(initialYearData);

  const currentYearData = saYearData[saTaxYear] || initialYearData[currentTaxYear] || { selfEmployment: 0, employment: 0, property: 0, dividends: 0, expenses: 0 };
  const saSelfEmployment = currentYearData.selfEmployment;
  const saEmployment = currentYearData.employment;
  const saProperty = currentYearData.property;
  const saDividends = currentYearData.dividends;
  const saExpenses = currentYearData.expenses;

  const [showEditIncomeModal, setShowEditIncomeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successContent, setSuccessContent] = useState({ title: '', message: '' });
  const [editingSource, setEditingSource] = useState<{ id: string, name: string, value: number } | null>(null);
  
  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(today.getDate());
  
  // PAYE & NI States
  const [showPAYECalculatorModal, setShowPAYECalculatorModal] = useState(false);
  const [showRTIModal, setShowRTIModal] = useState(false);
  const [payeGrossSalary, setPayeGrossSalary] = useState('3500');
  const [payeTaxCode, setPayeTaxCode] = useState('1257L');
  
  // VAT States
  const [showVATReturnModal, setShowVATReturnModal] = useState(false);
  const [showVATHistoryModal, setShowVATHistoryModal] = useState(false);
  const [vatOutputSales, setVatOutputSales] = useState('12500');
  const [vatInputPurchases, setVatInputPurchases] = useState('8250');
  const [vatRate] = useState(0.20);
  const [showCGTCalculatorModal, setShowCGTCalculatorModal] = useState(false);
  const [cgtDisposalValue, setCgtDisposalValue] = useState('50000');
  const [cgtAcquisitionCost, setCgtAcquisitionCost] = useState('35000');
  const [cgtAllowableExpenses, setCgtAllowableExpenses] = useState('2000');
  const [cgtAssetType, setCgtAssetType] = useState<'standard' | 'badr'>('standard');
  
  // UK 2025/26 Tax Rates & Thresholds
  const UK_TAX_RATES = {
    personalAllowance: 12570,
    basicRateLimit: 37700,
    higherRateLimit: 125140,
    basicRate: 0.20,
    higherRate: 0.40,
    additionalRate: 0.45,
    // Employee NI Class 1 (2025/26)
    niPrimaryThreshold: 12570, // Annual
    niUpperLimit: 50270, // Annual
    niEmployeeRate: 0.08, // 8% (reduced from 10% in April 2024)
    niEmployeeUpperRate: 0.02, // 2%
    // Employer NI Class 1 (2025/26)
    niSecondaryThreshold: 9100, // Annual (from April 2025)
    niEmployerRate: 0.15, // 15% (increased from 13.8% in April 2025)
  };

  // Calculate PAYE for a monthly salary
  const calculateMonthlyPAYE = (annualSalary: number) => {
    let annualTax = 0;
    const taxable = Math.max(0, annualSalary - UK_TAX_RATES.personalAllowance);
    
    if (taxable <= UK_TAX_RATES.basicRateLimit) {
      annualTax = taxable * UK_TAX_RATES.basicRate;
    } else if (taxable <= UK_TAX_RATES.higherRateLimit) {
      annualTax = (UK_TAX_RATES.basicRateLimit * UK_TAX_RATES.basicRate) + 
                  ((taxable - UK_TAX_RATES.basicRateLimit) * UK_TAX_RATES.higherRate);
    } else {
      annualTax = (UK_TAX_RATES.basicRateLimit * UK_TAX_RATES.basicRate) + 
                  ((UK_TAX_RATES.higherRateLimit - UK_TAX_RATES.basicRateLimit) * UK_TAX_RATES.higherRate) +
                  ((taxable - UK_TAX_RATES.higherRateLimit) * UK_TAX_RATES.additionalRate);
    }
    return Math.round(annualTax / 12 * 100) / 100;
  };

  // Calculate Employee NI
  const calculateEmployeeNI = (annualSalary: number) => {
    let annualNI = 0;
    if (annualSalary > UK_TAX_RATES.niPrimaryThreshold) {
      const upperEarnings = Math.min(annualSalary, UK_TAX_RATES.niUpperLimit);
      annualNI = (upperEarnings - UK_TAX_RATES.niPrimaryThreshold) * UK_TAX_RATES.niEmployeeRate;
      
      if (annualSalary > UK_TAX_RATES.niUpperLimit) {
        annualNI += (annualSalary - UK_TAX_RATES.niUpperLimit) * UK_TAX_RATES.niEmployeeUpperRate;
      }
    }
    return Math.round(annualNI / 12 * 100) / 100;
  };

  // Calculate Employer NI
  const calculateEmployerNI = (annualSalary: number) => {
    let annualNI = 0;
    if (annualSalary > UK_TAX_RATES.niSecondaryThreshold) {
      annualNI = (annualSalary - UK_TAX_RATES.niSecondaryThreshold) * UK_TAX_RATES.niEmployerRate;
    }
    return Math.round(annualNI / 12 * 100) / 100;
  };
  
  const personalAllowance = 12570;

  const totalIncome = saSelfEmployment + saEmployment + saProperty + saDividends;
  const taxableIncomeValue = Math.max(0, totalIncome - personalAllowance - saExpenses);

  // Calculate Tax Due (Simplified HMRC brackets for 2023/24)
  const calculateTotalTaxDue = (income: number) => {
    let tax = 0;
    if (income <= 37700) {
      tax = income * 0.20;
    } else if (income <= 125140) {
      tax = (37700 * 0.20) + ((income - 37700) * 0.40);
    } else {
      tax = (37700 * 0.20) + (87440 * 0.40) + ((income - 125140) * 0.45);
    }
    // Simple NI Class 4 estimate
    const ni = income > 12570 ? (Math.min(income, 50270) - 12570) * 0.09 : 0;
    return Math.round(tax + ni);
  };

  const totalTaxDueValue = calculateTotalTaxDue(taxableIncomeValue);

  // Dynamic Progress Calculation
  const calculateProgress = () => {
    let steps = 0;
    if (saSelfEmployment > 0) steps += 25;
    if (saEmployment > 0) steps += 25;
    if (saProperty > 0 || saDividends > 0) steps += 25;
    if (saExpenses > 0) steps += 25;
    return steps;
  };

  const saProgress = calculateProgress();

  const taxObligations: TaxObligation[] = [
    {
      id: '1',
      type: 'Corporation Tax',
      description: 'CT600 Return for year ending 31/03/2024',
      dueDate: new Date('2025-01-01'),
      amount: 9500.00,
      status: 'pending',
      period: 'FY 2023/24'
    },
    {
      id: '2',
      type: 'VAT Return',
      description: 'VAT Return Q4 2024',
      dueDate: new Date('2025-02-07'),
      amount: 4250.00,
      status: 'pending',
      period: 'Q4 2024'
    },
    {
      id: '3',
      type: 'PAYE',
      description: 'PAYE/NI Payment December 2024',
      dueDate: new Date('2025-01-22'),
      amount: 3200.00,
      status: 'pending',
      period: 'Dec 2024'
    },
  ];

  const taxSummary = {
    corporationTax: 9500.00,
    vatLiability: 4250.00,
    payeNI: 3200.00,
    totalTaxLiability: 16950.00,
    taxPaid: 12500.00,
    taxOutstanding: 4450.00,
  };

  const tabs: { id: string; name: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'corporation-tax', name: 'Corporation Tax', icon: Building2 },
    { id: 'self-assessment', name: 'Self Assessment', icon: User },
    { id: 'paye', name: 'PAYE & NI', icon: Users },
    { id: 'vat', name: 'VAT', icon: Receipt },
    { id: 'capital-gains', name: 'Capital Gains', icon: TrendingUp },
    { id: 'calendar', name: 'Tax Calendar', icon: Calendar },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg shadow-green-500/20">
              <FileText className="w-8 h-8 text-white" />
            </div>
            UK Taxation Management
          </h1>
          <p className="text-gray-600 mt-2">Complete tax management system for UK businesses</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white/40 border border-white/50 rounded-xl hover:bg-white/60 transition-colors flex items-center gap-2 backdrop-blur-sm shadow-sm cursor-pointer">
            <Download className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Export</span>
          </button>
          <button 
            onClick={() => setShowNewReturnModal(true)}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            New Return
          </button>
        </div>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-xl rounded-xl p-5 border border-white/50 cursor-pointer hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-md">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-blue-600 font-medium mb-1">Corporation Tax</p>
          <p className="text-2xl font-bold text-blue-900">£{taxSummary.corporationTax.toLocaleString()}</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-xl p-5 border border-white/50 cursor-pointer hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md">
              <Receipt className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-purple-600 font-medium mb-1">VAT Liability</p>
          <p className="text-2xl font-bold text-purple-900">£{taxSummary.vatLiability.toLocaleString()}</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-xl p-5 border border-white/50 cursor-pointer hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-green-600 font-medium mb-1">PAYE & NI</p>
          <p className="text-2xl font-bold text-green-900">£{taxSummary.payeNI.toLocaleString()}</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-xl p-5 border border-white/50 cursor-pointer hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow-md">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-orange-600 font-medium mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-orange-900">£{taxSummary.taxOutstanding.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/40 backdrop-blur-xl rounded-xl border border-white/50 p-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white shadow-md text-green-600'
                    : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Upcoming Tax Obligations */}
          <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-green-600" />
              Upcoming Tax Obligations
            </h2>
            <div className="space-y-3">
              {taxObligations.map((obligation) => (
                <div key={obligation.id} className="flex items-center justify-between p-4 bg-white/40 border border-white/30 rounded-xl hover:bg-white/60 hover:shadow-lg transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      obligation.status === 'paid' ? 'bg-green-100' :
                      obligation.status === 'overdue' ? 'bg-red-100' : 'bg-orange-100'
                    }`}>
                      <FileText className={`w-5 h-5 ${
                        obligation.status === 'paid' ? 'text-green-600' :
                        obligation.status === 'overdue' ? 'text-red-600' : 'text-orange-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{obligation.type}</p>
                      <p className="text-sm text-gray-600">{obligation.description}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        Due: {obligation.dueDate.toLocaleDateString()} • {obligation.period}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">£{obligation.amount.toLocaleString()}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      obligation.status === 'paid' ? 'bg-green-100 text-green-700' :
                      obligation.status === 'overdue' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {obligation.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-6 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 hover:bg-white/80 hover:shadow-xl transition-all text-left cursor-pointer group">
              <div className="p-3 bg-blue-500 rounded-lg w-fit mb-3 shadow-lg group-hover:scale-110 transition-transform">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Calculate Corporation Tax</h3>
              <p className="text-sm text-gray-600">Estimate your CT liability for the year</p>
            </button>

            <button className="p-6 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 hover:bg-white/80 hover:shadow-xl transition-all text-left cursor-pointer group">
              <div className="p-3 bg-green-500 rounded-lg w-fit mb-3 shadow-lg group-hover:scale-110 transition-transform">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Submit VAT Return</h3>
              <p className="text-sm text-gray-600">File your VAT return to HMRC</p>
            </button>

            <button className="p-6 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 hover:bg-white/80 hover:shadow-xl transition-all text-left cursor-pointer group">
              <div className="p-3 bg-purple-500 rounded-lg w-fit mb-3 shadow-lg group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">PAYE Submission</h3>
              <p className="text-sm text-gray-600">Submit RTI and pay PAYE/NI</p>
            </button>
          </div>

          {/* MTD Compliance */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Making Tax Digital (MTD) Compliant</h2>
                <p className="text-indigo-100">Your system is fully compliant with HMRC MTD requirements</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 hover:shadow-lg transition-all cursor-pointer">
                View Compliance Status
              </button>
              <button className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 hover:shadow-lg transition-all cursor-pointer">
                Learn More
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'corporation-tax' && (
        <div className="space-y-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Corporation Tax Calculator</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Accounting Period</label>
                <select 
                  value={ctPeriod}
                  onChange={(e) => setCtPeriod(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                >
                  <option>Year ending 31/03/2024</option>
                  <option>Year ending 31/03/2025</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Taxable Profit (£)</label>
                <input
                  type="number"
                  placeholder="50000"
                  value={ctProfit}
                  onChange={(e) => setCtProfit(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium mb-1">Estimated Corporation Tax</p>
                  <p className="text-4xl font-bold text-green-900">£{(Number(ctProfit) * 0.19).toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">At 19% rate</p>
                </div>
                <button 
                  onClick={() => setShowCT600Modal(true)}
                  className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all cursor-pointer"
                >
                  Generate CT600
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Corporation Tax Rates 2024/25</h3>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50/50 backdrop-blur-sm rounded-lg border border-blue-200/50 hover:bg-blue-50 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-blue-900">Small Profits Rate</p>
                    <p className="text-sm text-blue-700">Profits up to £50,000</p>
                  </div>
                  <span className="text-2xl font-bold text-blue-900">19%</span>
                </div>
              </div>
              <div className="p-4 bg-purple-50/50 backdrop-blur-sm rounded-lg border border-purple-200/50 hover:bg-purple-50 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-purple-900">Marginal Relief</p>
                    <p className="text-sm text-purple-700">Profits £50,001 - £250,000</p>
                  </div>
                  <span className="text-2xl font-bold text-purple-900">19-25%</span>
                </div>
              </div>
              <div className="p-4 bg-red-50/50 backdrop-blur-sm rounded-lg border border-red-200/50 hover:bg-red-50 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-red-900">Main Rate</p>
                    <p className="text-sm text-red-700">Profits over £250,000</p>
                  </div>
                  <span className="text-2xl font-bold text-red-900">25%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'self-assessment' && (
        <div className="space-y-6">
          {/* Self Assessment Overview */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Self Assessment Tax Return</h2>
                <p className="text-purple-100">Individual tax return for sole traders, partners, and directors</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  setNewReturnData({ ...newReturnData, type: 'Self Assessment' });
                  setNewReturnStep(2);
                  setShowNewReturnModal(true);
                }}
                className="px-6 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 hover:shadow-lg transition-all cursor-pointer"
              >
                Start New Return
              </button>
              <button 
                onClick={() => setShowHistoryModal(true)}
                className="px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 hover:shadow-lg transition-all cursor-pointer"
              >
                View Previous Returns
              </button>
            </div>
          </div>

          {/* Tax Year Selection */}
          <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Mini Calendar */}
              <div className="lg:w-72 flex-shrink-0">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-4">
                    <button 
                      onClick={() => {
                        if (calendarMonth === 0) {
                          setCalendarMonth(11);
                          setCalendarYear(calendarYear - 1);
                        } else {
                          setCalendarMonth(calendarMonth - 1);
                        }
                      }}
                      className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="font-bold text-gray-900">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][calendarMonth]} {calendarYear}
                    </span>
                    <button 
                      onClick={() => {
                        if (calendarMonth === 11) {
                          setCalendarMonth(0);
                          setCalendarYear(calendarYear + 1);
                        } else {
                          setCalendarMonth(calendarMonth + 1);
                        }
                      }}
                      className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Day Names */}
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <div key={i} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
                    ))}
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells */}
                    {Array.from({ length: new Date(calendarYear, calendarMonth, 1).getDay() }, (_, i) => (
                      <div key={`e-${i}`} className="h-7"></div>
                    ))}
                    {/* Days */}
                    {Array.from({ length: new Date(calendarYear, calendarMonth + 1, 0).getDate() }, (_, i) => {
                      const dayNum = i + 1;
                      const isToday = dayNum === today.getDate() && calendarMonth === today.getMonth() && calendarYear === today.getFullYear();
                      const isTaxDay = dayNum === 19 || dayNum === 22 || (dayNum === 31 && (calendarMonth === 0 || calendarMonth === 6));
                      
                      return (
                        <div 
                          key={dayNum}
                          className={`h-7 flex items-center justify-center text-xs rounded cursor-pointer transition-colors ${
                            isToday 
                              ? 'bg-purple-500 text-white font-bold' 
                              : isTaxDay 
                                ? 'bg-red-100 text-red-700 font-semibold hover:bg-red-200' 
                                : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {dayNum}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Today button */}
                  <button 
                    onClick={() => {
                      setCalendarMonth(today.getMonth());
                      setCalendarYear(today.getFullYear());
                    }}
                    className="w-full mt-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded transition-colors cursor-pointer"
                  >
                    Today
                  </button>
                </div>
              </div>
              
              {/* Tax Year Selection */}
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-4">Select Tax Year</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {taxYearOptions.map((item) => (
                    <button 
                      key={item.year}
                      onClick={() => {
                        if (saTaxYear !== item.year) {
                          setIsSwitchingYear(true);
                          setSaTaxYear(item.year);
                          setTimeout(() => setIsSwitchingYear(false), 400);
                        }
                      }}
                      className={`p-4 border rounded-xl text-center shadow-sm cursor-pointer transition-all relative overflow-hidden ${
                        saTaxYear === item.year 
                          ? 'border-purple-500 bg-purple-50 hover:shadow-md' 
                          : 'border-white/50 bg-white/40 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <p className={`font-bold ${saTaxYear === item.year ? 'text-purple-900' : 'text-gray-900'}`}>{item.year}</p>
                      <p className={`text-xs mt-1 ${saTaxYear === item.year ? 'text-purple-700' : 'text-gray-600'}`}>{item.label}</p>
                      {saTaxYear === item.year && (
                        <div className="absolute top-1 right-1">
                          <CheckCircle className="w-3 h-3 text-purple-500" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Tax Year Info */}
                <div className="mt-4 p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                  <p className="text-sm text-purple-800">
                    <strong>Tax Year {saTaxYear}</strong>: 6 April {saTaxYear.split('/')[0]} - 5 April 20{saTaxYear.split('/')[1]}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Income Sources */}
          <div className={`transition-all duration-300 ${isSwitchingYear ? 'opacity-30 blur-sm translate-y-2' : 'opacity-100 translate-y-0'}`}>
            <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Income Sources</h3>
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => { setEditingSource({ id: 'self-employment', name: 'Self-Employment', value: saSelfEmployment }); setShowEditIncomeModal(true); }}
                className="p-4 bg-white/40 border border-white/50 rounded-xl hover:bg-blue-50/50 hover:border-blue-200 hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Self-Employment</p>
                    <p className="text-xs text-blue-700">Sole trader income</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-900">£{saSelfEmployment.toLocaleString()}</p>
                <button className="mt-3 w-full px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm cursor-pointer">
                  Edit Details
                </button>
              </div>

              <div 
                onClick={() => { setEditingSource({ id: 'employment', name: 'Employment Income', value: saEmployment }); setShowEditIncomeModal(true); }}
                className="p-4 bg-white/40 border border-white/50 rounded-xl hover:bg-green-50/50 hover:border-green-200 hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">Employment Income</p>
                    <p className="text-xs text-green-700">PAYE salary</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-900">£{saEmployment.toLocaleString()}</p>
                <button className="mt-3 w-full px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors shadow-sm cursor-pointer">
                  Edit Details
                </button>
              </div>

              <div 
                onClick={() => { setEditingSource({ id: 'property', name: 'Property Income', value: saProperty }); setShowEditIncomeModal(true); }}
                className="p-4 bg-white/40 border border-white/50 rounded-xl hover:bg-purple-50/50 hover:border-purple-200 hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-500 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-purple-900">Property Income</p>
                    <p className="text-xs text-purple-700">Rental income</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-purple-900">£{saProperty.toLocaleString()}</p>
                <button className="mt-3 w-full px-4 py-2 bg-purple-500 text-white text-sm font-semibold rounded-lg hover:bg-purple-600 transition-colors shadow-sm cursor-pointer">
                  Edit Details
                </button>
              </div>

              <div 
                onClick={() => { setEditingSource({ id: 'dividends', name: 'Dividends & Interest', value: saDividends }); setShowEditIncomeModal(true); }}
                className="p-4 bg-white/40 border border-white/50 rounded-xl hover:bg-orange-50/50 hover:border-orange-200 hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-500 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-orange-900">Dividends & Interest</p>
                    <p className="text-xs text-orange-700">Investment income</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-orange-900">£{saDividends.toLocaleString()}</p>
                <button className="mt-3 w-full px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm cursor-pointer">
                  Edit Details
                </button>
              </div>
            </div>
          </div>
          </div>

          {/* Tax Calculation */}
          <div className={`transition-all duration-300 delay-75 ${isSwitchingYear ? 'opacity-30 blur-sm translate-y-2' : 'opacity-100 translate-y-0'}`}>
            <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-purple-600" />
              Tax Calculation Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/40 border border-white/50 rounded-lg hover:bg-white/60 hover:shadow-sm transition-all cursor-pointer">
                <span className="text-gray-700">Total Income</span>
                <span className="font-bold text-gray-900">£{totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/40 border border-white/50 rounded-lg hover:bg-white/60 hover:shadow-sm transition-all cursor-pointer">
                <span className="text-gray-700">Personal Allowance</span>
                <span className="font-bold text-gray-900">-£{personalAllowance.toLocaleString()}</span>
              </div>
              <div 
                onClick={() => { setEditingSource({ id: 'expenses', name: 'Allowable Expenses', value: saExpenses }); setShowEditIncomeModal(true); }}
                className="flex items-center justify-between p-3 bg-white/40 border border-white/50 rounded-lg hover:bg-white/60 hover:shadow-sm transition-all cursor-pointer"
              >
                <span className="text-gray-700">Allowable Expenses</span>
                <span className="font-bold text-gray-900">-£{saExpenses.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50/50 backdrop-blur-sm rounded-lg border border-blue-200/50 hover:bg-blue-50 hover:shadow-md transition-all cursor-pointer">
                <span className="font-semibold text-blue-900">Taxable Income</span>
                <span className="font-bold text-blue-900 text-xl">£{taxableIncomeValue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-lg border border-purple-200/50 hover:from-purple-500/20 hover:to-pink-500/20 transition-all cursor-pointer">
                <div>
                  <p className="font-semibold text-purple-900">Total Tax Due</p>
                  <p className="text-xs text-purple-700">Including NI contributions</p>
                </div>
                <span className="font-bold text-purple-900 text-3xl">£{totalTaxDueValue.toLocaleString()}</span>
              </div>
            </div>
          </div>
          </div>

          {/* Important Deadlines */}
          <div className={`transition-all duration-300 delay-150 ${isSwitchingYear ? 'opacity-30 blur-sm translate-y-2' : 'opacity-100 translate-y-0'}`}>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50/50 backdrop-blur-sm border border-red-200/50 rounded-xl p-5 hover:bg-red-50/80 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h3 className="font-bold text-red-900">Key Deadlines</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-800">Paper return</span>
                  <span className="font-bold text-red-900">31 Oct 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-800">Online return</span>
                  <span className="font-bold text-red-900">31 Jan 2025</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-800">Payment due</span>
                  <span className="font-bold text-red-900">31 Jan 2025</span>
                </div>
              </div>
            </div>

            <div className={`backdrop-blur-sm border rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer ${
              saProgress === 100 ? 'bg-green-50/50 border-green-200/50 hover:bg-green-50/80' : 'bg-amber-50/50 border-amber-200/50 hover:bg-amber-50/80'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {saProgress === 100 ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Clock className="w-6 h-6 text-amber-600" />
                )}
                <h3 className={`font-bold ${saProgress === 100 ? 'text-green-900' : 'text-amber-900'}`}>Return Status</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${saProgress === 100 ? 'text-green-800' : 'text-amber-800'}`}>Progress</span>
                  <span className={`font-bold ${saProgress === 100 ? 'text-green-900' : 'text-amber-900'}`}>{saProgress}% Complete</span>
                </div>
                <div className={`w-full rounded-full h-2 mb-2 ${saProgress === 100 ? 'bg-green-200' : 'bg-amber-200'}`}>
                  <div
                    className={`${saProgress === 100 ? 'bg-green-600' : 'bg-amber-500'} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${saProgress}%` }}
                  ></div>
                </div>
                <button
                  onClick={() => {
                    if (saProgress < 100) {
                      // Open edit modal for first incomplete section or just general edit
                      const incompleteSource = saSelfEmployment === 0 ? { id: 'self-employment', name: 'Self-Employment', value: saSelfEmployment } :
                                              saEmployment === 0 ? { id: 'employment', name: 'Employment Income', value: saEmployment } :
                                              saExpenses === 0 ? { id: 'expenses', name: 'Allowable Expenses', value: saExpenses } :
                                              { id: 'self-employment', name: 'Self-Employment', value: saSelfEmployment };
                      setEditingSource(incompleteSource);
                      setShowEditIncomeModal(true);
                    } else {
                      setShowSubmitModal(true);
                    }
                  }}
                  className={`w-full px-4 py-2 text-white font-semibold rounded-lg transition-colors shadow-sm cursor-pointer ${
                    saProgress === 100 ? 'bg-green-500 hover:bg-green-600' : 'bg-amber-500 hover:bg-amber-600'
                  }`}
                >
                  {saProgress === 100 ? 'Review & Submit' : 'Continue Return'}
                </button>
              </div>
            </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setShowCalculatorModal(true)}
              className="p-5 bg-white/60 backdrop-blur-xl border border-white/50 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-center cursor-pointer group"
            >
              <Calculator className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 text-sm">Tax Calculator</p>
            </button>
            <button 
              onClick={() => setShowDownloadModal(true)}
              className="p-5 bg-white/60 backdrop-blur-xl border border-white/50 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-center cursor-pointer group"
            >
              <Download className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 text-sm">Download SA100</p>
            </button>
            <button 
              onClick={() => setShowSubmitModal(true)}
              className="p-5 bg-white/60 backdrop-blur-xl border border-white/50 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-center cursor-pointer group"
            >
              <Send className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 text-sm">Submit to HMRC</p>
            </button>
          </div>
        </div>
      )}

      {/* Tax Calculator Modal */}
      {showCalculatorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/50">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calculator className="w-6 h-6" />
                  Self Assessment Tax Calculator
                </h2>
                <button 
                  onClick={() => setShowCalculatorModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter Your Taxable Income (£)
                </label>
                <input
                  type="number"
                  value={taxableIncome}
                  onChange={(e) => setTaxableIncome(e.target.value)}
                  placeholder="e.g., 50000"
                  className="w-full px-4 py-3 bg-white/50 border border-white/50 rounded-xl focus:border-purple-500 focus:outline-none text-lg backdrop-blur-sm"
                />
                <p className="text-xs text-gray-600 mt-1">After personal allowance and expenses</p>
              </div>

              <button
                onClick={() => {
                  const income = parseFloat(taxableIncome);
                  if (isNaN(income) || income <= 0) {
                    alert('Please enter a valid income amount');
                    return;
                  }

                  let tax = 0;
                  let ni = 0;

                  // Income Tax calculation (2023/24 rates)
                  if (income <= 37700) {
                    tax = income * 0.20; // Basic rate
                  } else if (income <= 125140) {
                    tax = (37700 * 0.20) + ((income - 37700) * 0.40); // Higher rate
                  } else {
                    tax = (37700 * 0.20) + (87440 * 0.40) + ((income - 125140) * 0.45); // Additional rate
                  }

                  // Class 4 NI (simplified)
                  if (income > 12570) {
                    ni = (Math.min(income, 50270) - 12570) * 0.09;
                    if (income > 50270) {
                      ni += (income - 50270) * 0.02;
                    }
                  }

                  setCalculatedTax(Math.round(tax + ni));
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-xl transition-all cursor-pointer shadow-lg"
              >
                Calculate Tax
              </button>

              {calculatedTax > 0 && (
                <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 border border-purple-200/50 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="font-bold text-purple-900 mb-4 text-center">Your Tax Calculation</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                      <span className="text-gray-700">Taxable Income</span>
                      <span className="font-bold text-gray-900">£{parseFloat(taxableIncome).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-purple-100/50 rounded-lg">
                      <div>
                        <p className="font-bold text-purple-900">Total Tax & NI Due</p>
                        <p className="text-xs text-purple-700">Income Tax + Class 4 NI</p>
                      </div>
                      <span className="font-bold text-purple-900 text-3xl">£{calculatedTax.toLocaleString()}</span>
                    </div>
                    <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-3">
                      <p className="text-xs text-blue-800">
                        <strong>Payment Schedule:</strong><br/>
                        • 1st Payment on Account: 31 Jan 2025 (£{Math.round(calculatedTax / 2).toLocaleString()})<br/>
                        • 2nd Payment on Account: 31 Jul 2025 (£{Math.round(calculatedTax / 2).toLocaleString()})
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setShowCalculatorModal(false);
                  setCalculatedTax(0);
                  setTaxableIncome('');
                }}
                className="w-full px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download SA100 Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/50">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Download className="w-6 h-6" />
                  Download SA100 Tax Return
                </h2>
                <button 
                  onClick={() => setShowDownloadModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                <h3 className="font-bold text-blue-900 mb-2">Tax Return Details:</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-blue-700 font-semibold">Tax Year:</p>
                    <p className="text-blue-900">{saTaxYear}</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-semibold">Total Tax Due:</p>
                    <p className="text-blue-900">£{totalTaxDueValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-semibold">Status:</p>
                    <p className="text-blue-900">{saProgress}% Complete</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-semibold">Deadline:</p>
                    <p className="text-blue-900">31 Jan 2025</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">Select Download Format:</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setSelectedDownloadFormat('TXT')}
                    className={`p-5 border-2 rounded-xl transition-all text-center cursor-pointer ${
                      selectedDownloadFormat === 'TXT'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className={`p-3 rounded-lg w-fit mx-auto mb-3 transition-colors ${
                      selectedDownloadFormat === 'TXT' ? 'bg-blue-200' : 'bg-blue-100'
                    }`}>
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className={`font-bold mb-1 ${
                      selectedDownloadFormat === 'TXT' ? 'text-blue-900' : 'text-gray-900'
                    }`}>Text File</p>
                    <p className="text-xs text-gray-600">Plain text format</p>
                    {selectedDownloadFormat === 'TXT' && (
                      <div className="mt-2">
                        <CheckCircle className="w-5 h-5 text-blue-600 mx-auto" />
                      </div>
                    )}
                  </button>

                  <button 
                    onClick={() => setSelectedDownloadFormat('CSV')}
                    className={`p-5 border-2 rounded-xl transition-all text-center cursor-pointer ${
                      selectedDownloadFormat === 'CSV'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <div className={`p-3 rounded-lg w-fit mx-auto mb-3 transition-colors ${
                      selectedDownloadFormat === 'CSV' ? 'bg-green-200' : 'bg-green-100'
                    }`}>
                      <FileText className="w-8 h-8 text-green-600" />
                    </div>
                    <p className={`font-bold mb-1 ${
                      selectedDownloadFormat === 'CSV' ? 'text-green-900' : 'text-gray-900'
                    }`}>CSV / Excel</p>
                    <p className="text-xs text-gray-600">Spreadsheet format</p>
                    {selectedDownloadFormat === 'CSV' && (
                      <div className="mt-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      </div>
                    )}
                  </button>

                  <button 
                    onClick={() => setSelectedDownloadFormat('PDF')}
                    className={`p-5 border-2 rounded-xl transition-all text-center cursor-pointer ${
                      selectedDownloadFormat === 'PDF'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <div className={`p-3 rounded-lg w-fit mx-auto mb-3 transition-colors ${
                      selectedDownloadFormat === 'PDF' ? 'bg-red-200' : 'bg-red-100'
                    }`}>
                      <FileText className="w-8 h-8 text-red-600" />
                    </div>
                    <p className={`font-bold mb-1 ${
                      selectedDownloadFormat === 'PDF' ? 'text-red-900' : 'text-gray-900'
                    }`}>PDF</p>
                    <p className="text-xs text-gray-600">Print-ready format</p>
                    {selectedDownloadFormat === 'PDF' && (
                      <div className="mt-2">
                        <CheckCircle className="w-5 h-5 text-red-600 mx-auto" />
                      </div>
                    )}
                  </button>

                  <button 
                    onClick={() => setSelectedDownloadFormat('JSON')}
                    className={`p-5 border-2 rounded-xl transition-all text-center cursor-pointer ${
                      selectedDownloadFormat === 'JSON'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    <div className={`p-3 rounded-lg w-fit mx-auto mb-3 transition-colors ${
                      selectedDownloadFormat === 'JSON' ? 'bg-purple-200' : 'bg-purple-100'
                    }`}>
                      <FileText className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className={`font-bold mb-1 ${
                      selectedDownloadFormat === 'JSON' ? 'text-purple-900' : 'text-gray-900'
                    }`}>JSON</p>
                    <p className="text-xs text-gray-600">API/Data format</p>
                    {selectedDownloadFormat === 'JSON' && (
                      <div className="mt-2">
                        <CheckCircle className="w-5 h-5 text-purple-600 mx-auto" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Selected Format Display */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-blue-700 mb-1">Ready to Download:</p>
                    <p className="text-sm font-bold text-blue-900">
                      SA100 Tax Return • {selectedDownloadFormat} Format
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${
                    selectedDownloadFormat === 'TXT' ? 'bg-blue-200' :
                    selectedDownloadFormat === 'CSV' ? 'bg-green-200' :
                    selectedDownloadFormat === 'PDF' ? 'bg-red-200' :
                    'bg-purple-200'
                  }`}>
                    <FileText className={`w-5 h-5 ${
                      selectedDownloadFormat === 'TXT' ? 'text-blue-600' :
                      selectedDownloadFormat === 'CSV' ? 'text-green-600' :
                      selectedDownloadFormat === 'PDF' ? 'text-red-600' :
                      'text-purple-600'
                    }`} />
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-900 mb-1">Download Features:</p>
                    <ul className="text-xs text-green-800 space-y-1">
                      <li>• HMRC-compliant formatting</li>
                      <li>• Complete income and tax breakdown</li>
                      <li>• Payment schedule included</li>
                      <li>• Ready for submission or record-keeping</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedDownloadFormat === 'TXT') {
                      const sa100Content = `SELF ASSESSMENT TAX RETURN (SA100)
Tax Year: ${saTaxYear}

PERSONAL DETAILS
Name: [Your Name]
UTR: [Your UTR Number]
NINO: [Your National Insurance Number]

INCOME SUMMARY
Self-Employment Income: £${saSelfEmployment.toLocaleString()}
Employment Income: £${saEmployment.toLocaleString()}
Property Income: £${saProperty.toLocaleString()}
Dividends & Interest: £${saDividends.toLocaleString()}
Total Income: £${totalIncome.toLocaleString()}

ALLOWANCES & DEDUCTIONS
Personal Allowance: £${personalAllowance.toLocaleString()}
Allowable Expenses: £${saExpenses.toLocaleString()}
Taxable Income: £${taxableIncomeValue.toLocaleString()}

TAX CALCULATION
Total Tax & NI Due: £${totalTaxDueValue.toLocaleString()}

PAYMENT DEADLINES
Payment on Account 1: 31 January 2025
Payment on Account 2: 31 July 2025
Balancing Payment: 31 January 2025

Generated: ${new Date().toLocaleDateString('en-GB')}`;

                      const blob = new Blob([sa100Content], { type: 'text/plain;charset=utf-8;' });
                      const link = document.createElement('a');
                      const url = URL.createObjectURL(blob);
                      
                      link.setAttribute('href', url);
                      link.setAttribute('download', `SA100_Tax_Return_2023-24_${new Date().toISOString().split('T')[0]}.txt`);
                      link.style.visibility = 'hidden';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      
                      setShowDownloadModal(false);
                      setSuccessContent({
                        title: 'Download Successful',
                        message: 'SA100 Tax Return (TXT) has been downloaded to your device.'
                      });
                      setShowSuccessModal(true);
                    } else if (selectedDownloadFormat === 'CSV') {
                      const csvContent = `Field,Value
Tax Year,${saTaxYear}
Self-Employment Income,£${saSelfEmployment}
Employment Income,£${saEmployment}
Property Income,£${saProperty}
Dividends & Interest,£${saDividends}
Total Income,£${totalIncome}
Personal Allowance,£${personalAllowance}
Allowable Expenses,£${saExpenses}
Taxable Income,£${taxableIncomeValue}
Total Tax Due,£${totalTaxDueValue}`;

                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                      const link = document.createElement('a');
                      const url = URL.createObjectURL(blob);
                      
                      link.setAttribute('href', url);
                      link.setAttribute('download', `SA100_Tax_Return_2023-24_${new Date().toISOString().split('T')[0]}.csv`);
                      link.style.visibility = 'hidden';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      
                      setShowDownloadModal(false);
                      setSuccessContent({
                        title: 'Download Successful',
                        message: 'SA100 Tax Return (CSV) has been downloaded to your device.'
                      });
                      setShowSuccessModal(true);
                    } else if (selectedDownloadFormat === 'PDF') {
                      // Create PDF using jsPDF
                      const doc = new jsPDF();
                      
                      // Set font
                      doc.setFont('helvetica');
                      
                      // Title
                      doc.setFontSize(18);
                      doc.setFont('helvetica', 'bold');
                      doc.text('SELF ASSESSMENT TAX RETURN (SA100)', 105, 20, { align: 'center' });
                      
                      doc.setFontSize(12);
                      doc.setFont('helvetica', 'normal');
                      doc.text(`Tax Year: ${saTaxYear}`, 105, 28, { align: 'center' });
                      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 105, 34, { align: 'center' });
                      
                      // Personal Details
                      let y = 50;
                      doc.setFontSize(14);
                      doc.setFont('helvetica', 'bold');
                      doc.text('PERSONAL DETAILS', 20, y);
                      doc.line(20, y + 2, 190, y + 2);
                      
                      y += 10;
                      doc.setFontSize(11);
                      doc.setFont('helvetica', 'normal');
                      doc.text('Name:', 20, y);
                      doc.text('[Your Name]', 80, y);
                      y += 7;
                      doc.text('UTR Number:', 20, y);
                      doc.text('[Your UTR Number]', 80, y);
                      y += 7;
                      doc.text('National Insurance:', 20, y);
                      doc.text('[Your National Insurance Number]', 80, y);
                      
                      // Income Summary
                      y += 15;
                      doc.setFontSize(14);
                      doc.setFont('helvetica', 'bold');
                      doc.text('INCOME SUMMARY', 20, y);
                      doc.line(20, y + 2, 190, y + 2);
                      
                      y += 10;
                      doc.setFontSize(11);
                      doc.setFont('helvetica', 'normal');
                      doc.text('Self-Employment Income:', 20, y);
                      doc.text(`£${saSelfEmployment.toLocaleString()}`, 150, y, { align: 'right' });
                      y += 7;
                      doc.text('Employment Income:', 20, y);
                      doc.text(`£${saEmployment.toLocaleString()}`, 150, y, { align: 'right' });
                      y += 7;
                      doc.text('Property Income:', 20, y);
                      doc.text(`£${saProperty.toLocaleString()}`, 150, y, { align: 'right' });
                      y += 7;
                      doc.text('Dividends & Interest:', 20, y);
                      doc.text(`£${saDividends.toLocaleString()}`, 150, y, { align: 'right' });
                      y += 7;
                      doc.line(20, y, 150, y);
                      y += 5;
                      doc.setFont('helvetica', 'bold');
                      doc.text('Total Income:', 20, y);
                      doc.text(`£${totalIncome.toLocaleString()}`, 150, y, { align: 'right' });
                      
                      // Allowances & Deductions
                      y += 15;
                      doc.setFontSize(14);
                      doc.text('ALLOWANCES & DEDUCTIONS', 20, y);
                      doc.line(20, y + 2, 190, y + 2);
                      
                      y += 10;
                      doc.setFontSize(11);
                      doc.setFont('helvetica', 'normal');
                      doc.text('Personal Allowance:', 20, y);
                      doc.text(`£${personalAllowance.toLocaleString()}`, 150, y, { align: 'right' });
                      y += 7;
                      doc.text('Allowable Expenses:', 20, y);
                      doc.text(`£${saExpenses.toLocaleString()}`, 150, y, { align: 'right' });
                      y += 7;
                      doc.line(20, y, 150, y);
                      y += 5;
                      doc.setFont('helvetica', 'bold');
                      doc.text('Taxable Income:', 20, y);
                      doc.text(`£${taxableIncomeValue.toLocaleString()}`, 150, y, { align: 'right' });
                      
                      // Tax Calculation
                      y += 15;
                      doc.setFontSize(14);
                      doc.text('TAX CALCULATION', 20, y);
                      doc.line(20, y + 2, 190, y + 2);
                      
                      y += 10;
                      doc.setFontSize(11);
                      doc.setFont('helvetica', 'normal');
                      doc.text('Total Tax & NI Due:', 20, y);
                      doc.text(`£${totalTaxDueValue.toLocaleString()}`, 150, y, { align: 'right' });
                      
                      // Payment Schedule
                      y += 15;
                      doc.setFontSize(14);
                      doc.text('PAYMENT SCHEDULE', 20, y);
                      doc.line(20, y + 2, 190, y + 2);
                      
                      y += 10;
                      doc.setFontSize(11);
                      doc.setFont('helvetica', 'normal');
                      doc.text('Payment on Account 1:', 20, y);
                      doc.text('31 January 2025', 100, y);
                      doc.text(`£${Math.round(totalTaxDueValue / 2).toLocaleString()}`, 150, y, { align: 'right' });
                      y += 7;
                      doc.text('Payment on Account 2:', 20, y);
                      doc.text('31 July 2025', 100, y);
                      doc.text(`£${Math.round(totalTaxDueValue / 2).toLocaleString()}`, 150, y, { align: 'right' });
                      
                      // Important Deadlines
                      y += 15;
                      doc.setFontSize(14);
                      doc.setFont('helvetica', 'bold');
                      doc.text('IMPORTANT DEADLINES', 20, y);
                      doc.line(20, y + 2, 190, y + 2);
                      
                      y += 10;
                      doc.setFontSize(11);
                      doc.setFont('helvetica', 'normal');
                      doc.text('Paper Return Deadline:', 20, y);
                      doc.text('31 October 2024', 100, y);
                      y += 7;
                      doc.text('Online Return Deadline:', 20, y);
                      doc.text('31 January 2025', 100, y);
                      y += 7;
                      doc.text('Payment Deadline:', 20, y);
                      doc.text('31 January 2025', 100, y);
                      
                      // Footer
                      doc.setFontSize(9);
                      doc.setFont('helvetica', 'italic');
                      doc.text('This is a summary document. For official HMRC submission, please use the online Self Assessment service.', 105, 280, { align: 'center' });
                      doc.text('Document generated by Okleevo Tax Management System • HMRC-compliant • Making Tax Digital ready', 105, 285, { align: 'center' });
                      
                      // Save the PDF
                      doc.save(`SA100_Tax_Return_${saTaxYear.replace('/', '-')}_${new Date().toISOString().split('T')[0]}.pdf`);
                      
                      setShowDownloadModal(false);
                      setSuccessContent({
                        title: 'Download Successful',
                        message: 'SA100 Tax Return (PDF) has been downloaded to your device.'
                      });
                      setShowSuccessModal(true);
                    } else if (selectedDownloadFormat === 'JSON') {
                      const jsonContent = JSON.stringify({
                        taxYear: saTaxYear,
                        personalDetails: {
                          name: "[Your Name]",
                          utr: "[Your UTR Number]",
                          nino: "[Your National Insurance Number]"
                        },
                        income: {
                          selfEmployment: saSelfEmployment,
                          employment: saEmployment,
                          property: saProperty,
                          dividendsInterest: saDividends,
                          total: totalIncome
                        },
                        allowances: {
                          personalAllowance: personalAllowance,
                          allowableExpenses: saExpenses,
                          taxableIncome: taxableIncomeValue
                        },
                        tax: {
                          totalDue: totalTaxDueValue
                        },
                        deadlines: {
                          paymentOnAccount1: "2025-01-31",
                          paymentOnAccount2: "2025-07-31",
                          balancingPayment: "2025-01-31"
                        }
                      }, null, 2);

                      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
                      const link = document.createElement('a');
                      const url = URL.createObjectURL(blob);
                      
                      link.setAttribute('href', url);
                      link.setAttribute('download', `SA100_Tax_Return_${saTaxYear.replace('/', '-')}_${new Date().toISOString().split('T')[0]}.json`);
                      link.style.visibility = 'hidden';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      
                      setShowDownloadModal(false);
                      setSuccessContent({
                        title: 'Download Successful',
                        message: 'SA100 Tax Return (JSON) has been downloaded to your device.'
                      });
                      setShowSuccessModal(true);
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  Download {selectedDownloadFormat}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit to HMRC Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl max-w-md w-full border border-white/50">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Send className="w-6 h-6" />
                  Submit to HMRC
                </h2>
                <button 
                  onClick={() => setShowSubmitModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4">
                  <Shield className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Submit?</h3>
                <p className="text-gray-600">Your Self Assessment return will be submitted to HMRC</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">Submission Details:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Tax Year: {saTaxYear}</li>
                  <li>• Total Tax Due: £{totalTaxDueValue.toLocaleString()}</li>
                  <li>• Deadline: 31 January 2025</li>
                  <li>• Status: Ready for submission</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-900 mb-1">Before Submitting:</p>
                    <ul className="text-xs text-yellow-800 space-y-1">
                      <li>✓ Check all income sources are included</li>
                      <li>✓ Verify all expenses are claimed</li>
                      <li>✓ Ensure bank details are correct</li>
                      <li>✓ Review tax calculation</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowSubmitModal(false);
                    const ref = 'SA-2024-' + Math.random().toString(36).substr(2, 9).toUpperCase();
                    setSuccessContent({
                      title: 'Submission Successful',
                      message: `Self Assessment submitted successfully to HMRC.\n\nReference: ${ref}\n\nYou will receive a confirmation email shortly.`
                    });
                    setShowSuccessModal(true);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-5 h-5" />
                  Submit Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'paye' && (
        <div className="space-y-6">
          {/* PAYE Overview */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">PAYE & National Insurance</h2>
                <p className="text-green-100">Manage employee payroll taxes and RTI submissions (2025/26 Rates)</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowRTIModal(true)}
                className="px-6 py-3 bg-white text-green-600 font-bold rounded-xl hover:bg-green-50 hover:shadow-lg transition-all cursor-pointer"
              >
                Submit RTI Return
              </button>
              <button 
                onClick={() => setShowPAYECalculatorModal(true)}
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 hover:shadow-lg transition-all cursor-pointer"
              >
                PAYE Calculator
              </button>
            </div>
          </div>

          {/* UK 2025/26 Tax Rates */}
          <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              UK 2025/26 Tax Rates & Thresholds
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/50">
                <p className="text-xs text-blue-600 font-medium mb-1">Personal Allowance</p>
                <p className="text-xl font-bold text-blue-900">£12,570</p>
                <p className="text-xs text-blue-700 mt-1">Tax-free income</p>
              </div>
              <div className="p-4 bg-green-50/50 rounded-xl border border-green-200/50">
                <p className="text-xs text-green-600 font-medium mb-1">Basic Rate (20%)</p>
                <p className="text-xl font-bold text-green-900">£12,571 - £50,270</p>
                <p className="text-xs text-green-700 mt-1">Standard tax band</p>
              </div>
              <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-200/50">
                <p className="text-xs text-orange-600 font-medium mb-1">Higher Rate (40%)</p>
                <p className="text-xl font-bold text-orange-900">£50,271 - £125,140</p>
                <p className="text-xs text-orange-700 mt-1">Higher earners</p>
              </div>
              <div className="p-4 bg-red-50/50 rounded-xl border border-red-200/50">
                <p className="text-xs text-red-600 font-medium mb-1">Additional Rate (45%)</p>
                <p className="text-xl font-bold text-red-900">Over £125,140</p>
                <p className="text-xs text-red-700 mt-1">Top earners</p>
              </div>
            </div>

            {/* NI Rates */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">National Insurance 2025/26</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200/50">
                  <p className="text-xs text-purple-600 font-medium">Employee NI (Class 1)</p>
                  <p className="font-bold text-purple-900">8%</p>
                  <p className="text-xs text-purple-700">£12,570 - £50,270</p>
                </div>
                <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200/50">
                  <p className="text-xs text-purple-600 font-medium">Employee NI (Upper)</p>
                  <p className="font-bold text-purple-900">2%</p>
                  <p className="text-xs text-purple-700">Over £50,270</p>
                </div>
                <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-200/50">
                  <p className="text-xs text-indigo-600 font-medium">Employer NI</p>
                  <p className="font-bold text-indigo-900">15%</p>
                  <p className="text-xs text-indigo-700">Over £9,100 (from Apr 2025)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 p-6 cursor-pointer hover:shadow-lg transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Employees</p>
                  <p className="text-3xl font-bold text-gray-900">12</p>
                </div>
              </div>
              <p className="text-xs text-gray-600">Active on payroll</p>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 p-6 cursor-pointer hover:shadow-lg transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly PAYE</p>
                  <p className="text-3xl font-bold text-gray-900">£2,450</p>
                </div>
              </div>
              <p className="text-xs text-gray-600">Current month liability</p>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 p-6 cursor-pointer hover:shadow-lg transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Receipt className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly NI</p>
                  <p className="text-3xl font-bold text-gray-900">£1,850</p>
                </div>
              </div>
              <p className="text-xs text-gray-600">Employer & Employee NI</p>
            </div>
          </div>

          {/* RTI Submissions */}
          <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-green-600" />
              Recent RTI Submissions
            </h3>
            <div className="space-y-3">
              {[
                { month: 'December 2025', submitted: '19 Dec 2025', amount: 4300, status: 'submitted' },
                { month: 'November 2025', submitted: '19 Nov 2025', amount: 4250, status: 'submitted' },
                { month: 'October 2025', submitted: '19 Oct 2025', amount: 4200, status: 'submitted' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white/40 border border-white/30 rounded-xl hover:bg-white/60 transition-all cursor-pointer hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100/50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.month}</p>
                      <p className="text-sm text-gray-600">Submitted: {item.submitted}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">£{item.amount.toLocaleString()}</p>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PAYE Calculation */}
          <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Current Month Breakdown (January 2026)</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/40 border border-white/30 rounded-lg hover:bg-white/60 hover:shadow-sm transition-all cursor-pointer">
                <span className="text-gray-700">Employee Income Tax (PAYE)</span>
                <span className="font-bold text-gray-900">£2,450.00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/40 border border-white/30 rounded-lg hover:bg-white/60 hover:shadow-sm transition-all cursor-pointer">
                <span className="text-gray-700">Employee NI (8% of £12,570-£50,270)</span>
                <span className="font-bold text-gray-900">£850.00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/40 border border-white/30 rounded-lg hover:bg-white/60 hover:shadow-sm transition-all cursor-pointer">
                <span className="text-gray-700">Employer NI (15% over £9,100)</span>
                <span className="font-bold text-gray-900">£1,000.00</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-50/50 to-emerald-50/50 backdrop-blur-sm rounded-lg border border-green-200/50 hover:from-green-50/80 hover:to-emerald-50/80 transition-all cursor-pointer">
                <div>
                  <p className="font-semibold text-green-900">Total Payment Due to HMRC</p>
                  <p className="text-xs text-green-700">Due: 22 February 2026</p>
                </div>
                <span className="font-bold text-green-900 text-3xl">£4,300</span>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50/50 backdrop-blur-sm border border-blue-200/50 rounded-xl p-5 hover:bg-blue-50/80 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h3 className="font-bold text-blue-900">Payment Deadline</h3>
              </div>
              <p className="text-sm text-blue-800 mb-2">PAYE/NI must be paid by:</p>
              <p className="text-2xl font-bold text-blue-900">22nd of each month</p>
              <p className="text-xs text-blue-700 mt-2">For previous month&apos;s deductions</p>
            </div>

            <div className="bg-orange-50/50 backdrop-blur-sm border border-orange-200/50 rounded-xl p-5 hover:bg-orange-50/80 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-6 h-6 text-orange-600" />
                <h3 className="font-bold text-orange-900">RTI Deadline</h3>
              </div>
              <p className="text-sm text-orange-800 mb-2">FPS must be submitted:</p>
              <p className="text-2xl font-bold text-orange-900">On or before payday</p>
              <p className="text-xs text-orange-700 mt-2">Real Time Information requirement</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4">
            <button 
              onClick={() => setShowRTIModal(true)}
              className="p-5 bg-white/60 backdrop-blur-xl border border-white/50 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-center cursor-pointer group"
            >
              <Send className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 text-sm">Submit FPS</p>
            </button>
            <button 
              onClick={() => setShowPAYECalculatorModal(true)}
              className="p-5 bg-white/60 backdrop-blur-xl border border-white/50 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-center cursor-pointer group"
            >
              <Calculator className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 text-sm">Calculate PAYE</p>
            </button>
            <button 
              onClick={() => {
                setSuccessContent({
                  title: 'P60 Download Ready',
                  message: 'P60 certificates for all employees are being generated.\n\nTax Year: 2025/26\nEmployees: 12\n\nDownload will begin shortly.'
                });
                setShowSuccessModal(true);
              }}
              className="p-5 bg-white/60 backdrop-blur-xl border border-white/50 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-center cursor-pointer group"
            >
              <Download className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 text-sm">Download P60s</p>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'vat' && (
        <div className="space-y-6">
          {/* VAT Header */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Receipt className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">VAT Management</h2>
                <p className="text-purple-100">Making Tax Digital compliant VAT returns</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowVATReturnModal(true)}
                className="px-6 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 hover:shadow-lg transition-all cursor-pointer"
              >
                Submit VAT Return
              </button>
              <button 
                onClick={() => setShowVATHistoryModal(true)}
                className="px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 hover:shadow-lg transition-all cursor-pointer"
              >
                View Returns
              </button>
            </div>
          </div>

          {/* UK VAT Rates 2025/26 */}
          <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              UK VAT Rates 2025/26
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200/50">
                <p className="text-xs text-purple-600 font-medium mb-1">Standard Rate</p>
                <p className="text-3xl font-bold text-purple-900">20%</p>
                <p className="text-xs text-purple-700 mt-1">Most goods & services</p>
              </div>
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/50">
                <p className="text-xs text-blue-600 font-medium mb-1">Reduced Rate</p>
                <p className="text-3xl font-bold text-blue-900">5%</p>
                <p className="text-xs text-blue-700 mt-1">Home energy, child car seats</p>
              </div>
              <div className="p-4 bg-green-50/50 rounded-xl border border-green-200/50">
                <p className="text-xs text-green-600 font-medium mb-1">Zero Rate</p>
                <p className="text-3xl font-bold text-green-900">0%</p>
                <p className="text-xs text-green-700 mt-1">Food, books, children&apos;s clothes</p>
              </div>
            </div>
            
            {/* VAT Thresholds */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-red-50/50 rounded-lg border border-red-200/50">
                  <p className="text-xs text-red-600 font-medium">Registration Threshold</p>
                  <p className="font-bold text-red-900 text-xl">£90,000</p>
                  <p className="text-xs text-red-700">Taxable turnover in 12 months</p>
                </div>
                <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/50">
                  <p className="text-xs text-amber-600 font-medium">Deregistration Threshold</p>
                  <p className="font-bold text-amber-900 text-xl">£88,000</p>
                  <p className="text-xs text-amber-700">Below this, can deregister</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Quarter */}
          <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Current Quarter (Q3 {currentTaxYear}: Oct - Dec 2025)</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/40 border border-white/30 rounded-lg hover:bg-white/60 hover:shadow-sm transition-all cursor-pointer">
                <span className="text-gray-700">Output VAT (Sales)</span>
                <span className="font-bold text-gray-900">£{parseFloat(vatOutputSales).toLocaleString('en-GB', {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/40 border border-white/30 rounded-lg hover:bg-white/60 hover:shadow-sm transition-all cursor-pointer">
                <span className="text-gray-700">Input VAT (Purchases)</span>
                <span className="font-bold text-gray-900">-£{parseFloat(vatInputPurchases).toLocaleString('en-GB', {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50/50 backdrop-blur-sm rounded-lg border border-purple-200/50">
                <div>
                  <p className="font-semibold text-purple-900">Net VAT Due to HMRC</p>
                  <p className="text-xs text-purple-700">Due: 7 February 2026 (MTD)</p>
                </div>
                <span className="font-bold text-purple-900 text-3xl">£{(parseFloat(vatOutputSales) * vatRate - parseFloat(vatInputPurchases) * vatRate / 2).toLocaleString('en-GB', {minimumFractionDigits: 0})}*</span>
              </div>
              <p className="text-[10px] text-gray-500 italic">* Estimated based on current figures and standard 20% rate minus expenses.</p>
            </div>
          </div>

          {/* MTD Information */}
          <div className="bg-blue-50/50 backdrop-blur-sm border border-blue-200/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-blue-900">Making Tax Digital (MTD)</h3>
            </div>
            <p className="text-sm text-blue-800 mb-3">
              All VAT-registered businesses must keep digital records and submit returns using MTD-compatible software.
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Returns due 1 month + 7 days after quarter end</li>
              <li>• Digital links required between records and submissions</li>
              <li>• Penalties for late submissions under new points system</li>
            </ul>
          </div>

          {/* VAT Scheme Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 p-5 text-center cursor-pointer hover:shadow-lg transition-all">
              <p className="text-xs text-gray-600 mb-1">Your Scheme</p>
              <p className="font-bold text-gray-900">Standard VAT</p>
            </div>
            <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 p-5 text-center cursor-pointer hover:shadow-lg transition-all">
              <p className="text-xs text-gray-600 mb-1">Return Frequency</p>
              <p className="font-bold text-gray-900">Quarterly</p>
            </div>
            <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 p-5 text-center cursor-pointer hover:shadow-lg transition-all">
              <p className="text-xs text-gray-600 mb-1">Next Deadline</p>
              <p className="font-bold text-purple-600">7 Feb 2026</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'capital-gains' && (
        <div className="space-y-6">
          {/* CGT Header */}
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Capital Gains Tax</h2>
                <p className="text-orange-100">Calculate and report capital gains on asset disposals (2025/26)</p>
              </div>
            </div>
            <button 
              onClick={() => setShowCGTCalculatorModal(true)}
              className="px-6 py-3 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 hover:shadow-lg transition-all cursor-pointer"
            >
              Calculate CGT
            </button>
          </div>

          {/* UK CGT Rates 2025/26 */}
          <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-600" />
              UK CGT Rates 2025/26
            </h3>
            
            {/* Annual Exempt Amount */}
            <div className="mb-6 p-6 bg-gradient-to-br from-orange-50/50 to-red-50/50 backdrop-blur-sm rounded-xl border border-orange-200/50">
              <p className="text-sm text-orange-700 mb-2">Annual Exempt Amount (AEA)</p>
              <p className="text-4xl font-bold text-orange-900">£3,000</p>
              <p className="text-xs text-orange-700 mt-2">Reduced from £6,000 in 2024/25</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Rate Taxpayer */}
              <div className="p-4 bg-green-50/50 rounded-xl border border-green-200/50">
                <p className="text-sm font-semibold text-green-800 mb-3">Basic Rate Taxpayers</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Most assets</span>
                    <span className="font-bold text-green-900">18%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Residential property</span>
                    <span className="font-bold text-green-900">18%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Carried interest</span>
                    <span className="font-bold text-green-900">18%</span>
                  </div>
                </div>
              </div>

              {/* Higher Rate Taxpayer */}
              <div className="p-4 bg-red-50/50 rounded-xl border border-red-200/50">
                <p className="text-sm font-semibold text-red-800 mb-3">Higher/Additional Rate Taxpayers</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-red-700">Most assets</span>
                    <span className="font-bold text-red-900">24%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-red-700">Residential property</span>
                    <span className="font-bold text-red-900">24%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-red-700">Carried interest</span>
                    <span className="font-bold text-red-900">32%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Special Rates */}
          <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Special CGT Rates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200/50">
                <p className="text-sm font-semibold text-purple-800 mb-2">Business Asset Disposal Relief (BADR)</p>
                <p className="text-3xl font-bold text-purple-900">14%</p>
                <p className="text-xs text-purple-700 mt-2">Lifetime limit: £1 million</p>
              </div>
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200/50">
                <p className="text-sm font-semibold text-indigo-800 mb-2">Investors&apos; Relief</p>
                <p className="text-3xl font-bold text-indigo-900">10%</p>
                <p className="text-xs text-indigo-700 mt-2">Lifetime limit: £10 million</p>
              </div>
            </div>
          </div>

          {/* Reporting Deadlines */}
          <div className="bg-yellow-50/50 backdrop-blur-sm border border-yellow-200/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <h3 className="font-bold text-yellow-900">Reporting Requirements</h3>
            </div>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• UK property sales: Report within <strong>60 days</strong> of completion</li>
              <li>• Other disposals: Include in Self Assessment return</li>
              <li>• Losses can be carried forward to offset future gains</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (() => {
        const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Use the refined logic for highlights
        const taxDates = getTaxEventsForMonth(calendarYear, calendarMonth);
        
        const prevMonth = () => {
          if (calendarMonth === 0) {
            setCalendarMonth(11);
            setCalendarYear(calendarYear - 1);
          } else {
            setCalendarMonth(calendarMonth - 1);
          }
          setSelectedCalendarDay(null);
        };
        
        const nextMonth = () => {
          if (calendarMonth === 11) {
            setCalendarMonth(0);
            setCalendarYear(calendarYear + 1);
          } else {
            setCalendarMonth(calendarMonth + 1);
          }
          setSelectedCalendarDay(null);
        };
        
        const goToToday = () => {
          setCalendarMonth(today.getMonth());
          setCalendarYear(today.getFullYear());
          setSelectedCalendarDay(today.getDate());
        };
        
        const isToday = (dayNum: number) => 
          dayNum === today.getDate() && 
          calendarMonth === today.getMonth() && 
          calendarYear === today.getFullYear();
        
        const selectedEvent = selectedCalendarDay ? taxDates[String(selectedCalendarDay)] : null;
        
        return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Calendar Grid */}
            <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                  <X className="w-5 h-5 text-gray-400 rotate-45" /> {/* Using X as a placeholder or Chevron if re-imported */}
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="text-center">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">{monthNames[calendarMonth]} {calendarYear}</h2>
                  <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1">Tax Year {currentTaxYear}</p>
                </div>
                
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: firstDayOfMonth }, (_, i) => (
                  <div key={`empty-${i}`} className="h-20 bg-gray-50/30 rounded-xl"></div>
                ))}
                
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const dayNum = i + 1;
                  const dayStr = String(dayNum);
                  const event = taxDates[dayStr];
                  const isTodayCell = isToday(dayNum);
                  const isSelected = selectedCalendarDay === dayNum;
                  
                  return (
                    <div 
                      key={dayNum}
                      onClick={() => setSelectedCalendarDay(dayNum)}
                      className={`h-20 rounded-xl p-2 transition-all cursor-pointer relative group ${
                        isSelected 
                          ? 'ring-2 ring-indigo-500 bg-white shadow-lg z-10' 
                          : isTodayCell
                            ? 'bg-indigo-50 border-2 border-indigo-200'
                            : event 
                              ? `bg-${event.color}-50 border border-${event.color}-100 hover:shadow-md`
                              : 'bg-white hover:bg-gray-50 border border-gray-100'
                      }`}
                    >
                      <div className={`text-sm font-black ${isTodayCell ? 'text-indigo-600' : 'text-gray-900'}`}>
                        {dayNum}
                      </div>
                      
                      {event && (
                        <div className={`w-1.5 h-1.5 rounded-full bg-${event.color}-500 mt-1 shadow-sm`}></div>
                      )}
                      
                      {isTodayCell && (
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-indigo-500 text-[8px] font-black text-white rounded uppercase">
                          Today
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-8 flex justify-center">
                <button 
                  onClick={goToToday}
                  className="px-6 py-2.5 bg-gray-900 text-white text-xs font-black rounded-xl hover:bg-black transition-all cursor-pointer shadow-lg shadow-gray-200 uppercase tracking-widest"
                >
                  Return to Today
                </button>
              </div>
            </div>

            {/* Day Details Sidebar */}
            <div className="space-y-6">
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-6 shadow-sm h-full">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Day Details</h3>
                
                {selectedCalendarDay ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200">
                      <p className="text-sm font-bold text-gray-500">{monthNames[calendarMonth]}</p>
                      <h4 className="text-4xl font-black text-gray-900 mt-1">{selectedCalendarDay}</h4>
                      <p className="text-xs font-bold text-gray-400 uppercase mt-1">2026 Tax Insight</p>
                    </div>

                    {selectedEvent ? (
                      <div className={`p-5 rounded-2xl border-2 bg-${selectedEvent.color}-50 border-${selectedEvent.color}-100`}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 bg-${selectedEvent.color}-500 rounded-lg text-white shadow-lg`}>
                            <AlertCircle className="w-5 h-5" />
                          </div>
                          <span className={`text-xs font-black text-${selectedEvent.color}-700 uppercase`}>{selectedEvent.type}</span>
                        </div>
                        <h5 className={`text-lg font-black text-${selectedEvent.color}-900 leading-tight`}>
                          {selectedEvent.fullTask}
                        </h5>
                        <div className="mt-4 pt-4 border-t border-white/20">
                          <p className={`text-xs text-${selectedEvent.color}-700 font-medium leading-relaxed`}>
                            Mandatory compliance requirement for UK limited companies and sole traders. Failure to meet this deadline may result in automated penalties.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <CheckCircle className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                        <p className="text-sm font-bold text-gray-400">No major tax deadlines for this date.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <div className="p-4 bg-gray-50 rounded-full mb-4">
                      <Calendar className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-400">Select a date to view tax obligations.</p>
                  </div>
                )}
                
                {/* Legend in Details panel */}
                <div className="mt-10 pt-6 border-t border-gray-100 grid grid-cols-2 gap-3">
                  {[
                    { color: 'purple', label: 'VAT' },
                    { color: 'blue', label: 'Payroll' },
                    { color: 'emerald', label: 'Payment' },
                    { color: 'red', label: 'SA/Tax' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-${item.color}-500`}></div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming List Section */}
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-6 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <Clock className="w-6 h-6 text-red-500" />
              Priority Deadline Watch
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getUpcomingDeadlines().map((item, idx) => {
                const daysUntil = Math.ceil((item.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={idx} className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-indigo-300 hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        daysUntil <= 7 ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {daysUntil === 0 ? 'Today' : `${daysUntil} Days Left`}
                      </div>
                      <div className={`p-2 rounded-xl group-hover:scale-110 transition-transform bg-${item.color}-50 text-${item.color}-600`}>
                        <Calendar className="w-5 h-5" />
                      </div>
                    </div>
                    <h4 className="font-black text-gray-900 leading-tight mb-2">{item.task}</h4>
                    <p className="text-xs font-bold text-gray-400">
                      {item.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Annual Tax Calendar Reference */}
          <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">UK Tax Calendar Reference</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/50">
                <h4 className="font-bold text-blue-900 mb-2">Monthly Deadlines</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 19th - PAYE/NI payment due</li>
                  <li>• 22nd - CIS return and payment</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50/50 rounded-xl border border-green-200/50">
                <h4 className="font-bold text-green-900 mb-2">Quarterly Deadlines</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• VAT return (1 month + 7 days after period)</li>
                  <li>• Making Tax Digital submissions</li>
                </ul>
              </div>
              <div className="p-4 bg-red-50/50 rounded-xl border border-red-200/50">
                <h4 className="font-bold text-red-900 mb-2">Annual - Self Assessment</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• 31 January - Tax return & payment</li>
                  <li>• 31 July - Payment on account</li>
                </ul>
              </div>
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200/50">
                <h4 className="font-bold text-purple-900 mb-2">Annual - Corporation Tax</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• 9 months after year-end - Payment</li>
                  <li>• 12 months after year-end - CT600</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        );
      })()}
      {/* New Return Modal */}
      {showNewReturnModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/50 relative">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Plus className="w-6 h-6" />
                    Create New Tax Return
                  </h2>
                  <p className="text-green-100 text-sm mt-1">Step {newReturnStep} of 4: {
                    newReturnStep === 1 ? 'Select Return Type' :
                    newReturnStep === 2 ? 'Period & Reference' :
                    newReturnStep === 3 ? 'Financial Details' :
                    'Review & Submit'
                  }</p>
                </div>
                <button 
                  onClick={() => {
                    setShowNewReturnModal(false);
                    setNewReturnStep(1);
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-white h-full transition-all duration-500 ease-out"
                  style={{ width: `${(newReturnStep / 4) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-8">
              {/* Step 1: Select Type */}
              {newReturnStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 'corporation', name: 'Corporation Tax', icon: Building2, desc: 'Annual CT600 return', color: 'blue' },
                      { id: 'vat', name: 'VAT Return', icon: Receipt, desc: 'Quarterly VAT submission', color: 'purple' },
                      { id: 'paye', name: 'PAYE & NI', icon: Users, desc: 'Monthly employer taxes', color: 'green' },
                      { id: 'self-assessment', name: 'Self Assessment', icon: User, desc: 'Individual tax return', color: 'orange' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setNewReturnData({ ...newReturnData, type: item.name });
                          setNewReturnStep(2);
                        }}
                        className={`p-6 border-2 rounded-2xl text-left transition-all cursor-pointer group flex items-start gap-4 ${
                          newReturnData.type === item.name 
                            ? `border-${item.color}-500 bg-${item.color}-50/50` 
                            : 'border-white/50 bg-white/40 hover:border-gray-300 hover:bg-white'
                        }`}
                      >
                        <div className={`p-3 rounded-xl bg-${item.color}-100 group-hover:scale-110 transition-transform`}>
                          <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                        </div>
                        <div>
                          <p className={`font-bold text-gray-900 ${newReturnData.type === item.name ? `text-${item.color}-900` : ''}`}>{item.name}</p>
                          <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Period & Reference */}
              {newReturnStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Selected Tax Type</label>
                      <div className="px-4 py-3 bg-gray-100 rounded-xl font-medium text-gray-900 border border-gray-200">
                        {newReturnData.type}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Accounting Period</label>
                      <select 
                        value={newReturnData.period}
                        onChange={(e) => setNewReturnData({ ...newReturnData, period: e.target.value })}
                        className="w-full px-4 py-3 bg-white/50 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                      >
                        <option>Q1 2025</option>
                        <option>Q4 2024</option>
                        <option>FY 2024/25</option>
                        <option>FY 2023/24</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Reference Number</label>
                      <input
                        type="text"
                        placeholder="e.g. TAX-2025-001"
                        value={newReturnData.reference}
                        onChange={(e) => setNewReturnData({ ...newReturnData, reference: e.target.value })}
                        className="w-full px-4 py-3 bg-white/50 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Financials */}
              {newReturnStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Total Turnover (£)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={newReturnData.turnover}
                        onChange={(e) => setNewReturnData({ ...newReturnData, turnover: e.target.value })}
                        className="w-full px-4 py-3 bg-white/50 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Total Expenses (£)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={newReturnData.expenses}
                        onChange={(e) => setNewReturnData({ ...newReturnData, expenses: e.target.value })}
                        className="w-full px-4 py-3 bg-white/50 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-semibold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notes / Comments</label>
                    <textarea
                      placeholder="Enter any additional information..."
                      rows={3}
                      value={newReturnData.notes}
                      onChange={(e) => setNewReturnData({ ...newReturnData, notes: e.target.value })}
                      className="w-full px-4 py-3 bg-white/50 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    ></textarea>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center justify-between">
                      <span className="text-green-800 font-medium">Estimated Taxable Profit:</span>
                      <span className="text-xl font-bold text-green-900">
                        £{(Number(newReturnData.turnover) - Number(newReturnData.expenses)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {newReturnStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="bg-white/40 border border-white/50 rounded-2xl overflow-hidden backdrop-blur-sm">
                    <div className="bg-gray-50 border-b border-gray-100 px-6 py-4">
                      <h3 className="font-bold text-gray-900">Submission Summary</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Tax Type</span>
                        <span className="font-bold text-gray-900">{newReturnData.type}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Period</span>
                        <span className="font-bold text-gray-900">{newReturnData.period}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Reference</span>
                        <span className="font-bold text-gray-900">{newReturnData.reference || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Turnover</span>
                        <span className="font-bold text-gray-900">£{Number(newReturnData.turnover).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Expenses</span>
                        <span className="font-bold text-gray-900">£{Number(newReturnData.expenses).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-green-50 -mx-6 px-6">
                        <span className="text-green-800 font-bold">Total Liability (Estimated)</span>
                        <span className="text-2xl font-black text-green-900">
                          £{(Math.max(0, Number(newReturnData.turnover) - Number(newReturnData.expenses)) * 0.19).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <p className="text-xs text-blue-800">
                      By submitting this return, you confirm that all figures provided are accurate to the best of your knowledge and comply with HMRC guidelines.
                    </p>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={() => {
                    if (newReturnStep === 1) {
                      setShowNewReturnModal(false);
                    } else {
                      setNewReturnStep(newReturnStep - 1);
                    }
                  }}
                  className="px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {newReturnStep === 1 ? 'Cancel' : 'Back'}
                </button>
                <button
                  onClick={() => {
                    if (newReturnStep < 4) {
                      setNewReturnStep(newReturnStep + 1);
                    } else {
                      // Final Submission
                      setShowNewReturnModal(false);
                      setNewReturnStep(1);
                      setSuccessContent({
                        title: 'Return Submitted',
                        message: `Tax Return Submitted Successfully!\n\nYour return for ${newReturnData.period} has been recorded and scheduled for HMRC filing.`
                      });
                      setShowSuccessModal(true);
                    }
                  }}
                  className={`px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
                    newReturnStep === 1 && !newReturnData.type ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  {newReturnStep === 4 ? 'Confirm & Submit' : 'Continue'}
                  <TrendingUp className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Corporation Tax (CT600) Modal */}
      {showCT600Modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/50 relative">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Building2 className="w-6 h-6" />
                    Corporation Tax Return (CT600)
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">{ctPeriod}</p>
                </div>
                <button 
                  onClick={() => setShowCT600Modal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Tax Calculation Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-blue-100">
                    <span className="text-blue-800">Taxable Profit</span>
                    <span className="font-bold text-blue-900">£{Number(ctProfit).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-100">
                    <span className="text-blue-800">Effective Tax Rate</span>
                    <span className="font-bold text-blue-900">{Number(ctProfit) <= 50000 ? '19%' : Number(ctProfit) >= 250000 ? '25%' : 'Marginal Rate'}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 bg-white/60 -mx-6 px-6 mt-4">
                    <span className="text-blue-900 font-bold">Estimated Tax Liability</span>
                    <span className="text-3xl font-black text-blue-600">
                      £{(Number(ctProfit) * (Number(ctProfit) <= 50000 ? 0.19 : 0.25)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                  <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Accounting Period End</p>
                  <p className="font-bold text-gray-900">{ctPeriod.split('ending ')[1] || ctPeriod}</p>
                </div>
                <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                  <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Payment Deadline</p>
                  <p className="font-bold text-gray-900">1 January 2025</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                  <strong>Important:</strong> This is an estimate based on your taxable profit. The final CT600 may include adjustments for capital allowances, specialized tax reliefs (like R&D), and non-deductible expenses.
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={() => setShowCT600Modal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const doc = new jsPDF();
                    doc.setFont('helvetica');
                    doc.setFontSize(20);
                    doc.setFont('helvetica', 'bold');
                    doc.text('CORPORATION TAX RETURN (CT600) SUMMARY', 105, 20, { align: 'center' });
                    
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'normal');
                    doc.text(`Period: ${ctPeriod}`, 105, 30, { align: 'center' });
                    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 105, 38, { align: 'center' });
                    
                    let y = 60;
                    doc.setFontSize(14);
                    doc.setFont('helvetica', 'bold');
                    doc.text('FINANCIAL SUMMARY', 20, y);
                    doc.line(20, y + 2, 190, y + 2);
                    
                    y += 15;
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'normal');
                    doc.text('Taxable Profit:', 20, y);
                    doc.text(`£${Number(ctProfit).toLocaleString()}`, 150, y, { align: 'right' });
                    
                    y += 10;
                    doc.text('Applicable Tax Rate:', 20, y);
                    doc.text(Number(ctProfit) <= 50000 ? '19%' : '25%', 150, y, { align: 'right' });
                    
                    y += 15;
                    doc.setFont('helvetica', 'bold');
                    doc.text('TOTAL CORPORATION TAX PAYABLE:', 20, y);
                    doc.text(`£${(Number(ctProfit) * (Number(ctProfit) <= 50000 ? 0.19 : 0.25)).toLocaleString()}`, 150, y, { align: 'right' });
                    
                    y += 30;
                    doc.setFontSize(14);
                    doc.text('FILING INFORMATION', 20, y);
                    doc.line(20, y + 2, 190, y + 2);
                    
                    y += 15;
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'normal');
                    doc.text('Filing Deadline:', 20, y);
                    doc.text('31 March 2025', 100, y);
                    
                    y += 10;
                    doc.text('Payment Deadline:', 20, y);
                    doc.text('1 January 2025', 100, y);
                    
                    y += 40;
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'italic');
                    doc.text('This document is a computer-generated summary of your Corporation Tax obligations.', 105, y, { align: 'center' });
                    doc.text('For official submission, please log in to HMRC Online Services.', 105, y + 7, { align: 'center' });

                    doc.save(`CT600_Summary_${ctProfit}_${new Date().toISOString().split('T')[0]}.pdf`);
                    setShowCT600Modal(false);
                    setSuccessContent({
                      title: 'Report Generated',
                      message: `CT600 Summary (PDF) for profits of £${Number(ctProfit).toLocaleString()} generated successfully.`
                    });
                    setShowSuccessModal(true);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Generate & Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Income Source Modal */}
      {showEditIncomeModal && editingSource && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl max-w-md w-full border border-white/50">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-6 h-6" />
                  Edit {editingSource.name}
                </h2>
                <button 
                  onClick={() => setShowEditIncomeModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount (£)
                </label>
                <input
                  type="number"
                  defaultValue={editingSource.value}
                  onChange={(e) => setEditingSource({ ...editingSource, value: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/50 border border-white/50 rounded-xl focus:border-purple-500 focus:outline-none text-lg backdrop-blur-sm font-semibold"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowEditIncomeModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const newYearData = { ...saYearData };
                    newYearData[saTaxYear] = {
                      ...newYearData[saTaxYear],
                      [editingSource.id.replace('self-employment', 'selfEmployment').replace('employment', 'employment').replace('property', 'property').replace('dividends', 'dividends').replace('expenses', 'expenses')]: editingSource.value
                    };
                    setSaYearData(newYearData);
                    setShowEditIncomeModal(false);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-xl transition-all cursor-pointer shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Previous Returns History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl max-w-2xl w-full border border-white/50">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  Self Assessment History
                </h2>
                <button 
                  onClick={() => setShowHistoryModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {[
                  { year: '2022/23', submitted: '24 Jan 2024', status: 'Submitted', amount: 16420, ref: 'SA-2324-XJ92' },
                  { year: '2021/22', submitted: '15 Jan 2023', status: 'Submitted', amount: 14850, ref: 'SA-2223-BK45' },
                  { year: '2020/21', submitted: '31 Jan 2022', status: 'Submitted', amount: 12300, ref: 'SA-2122-PL11' },
                ].map((ret, idx) => (
                  <div key={idx} className="p-4 bg-white/50 border border-gray-100 rounded-xl hover:bg-purple-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 rounded-lg group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Tax Year {ret.year}</p>
                        <p className="text-xs text-gray-500">Ref: {ret.ref} • Submitted {ret.submitted}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-900">£{ret.amount.toLocaleString()}</p>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {ret.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => setShowHistoryModal(false)}
                className="mt-6 w-full px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-sm w-full border border-white/50 overflow-hidden transform animate-in zoom-in-95 duration-300">
            <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500" />
            <div className="p-8 text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25" />
                <div className="relative flex items-center justify-center w-full h-full bg-green-50 rounded-full border-4 border-white shadow-inner">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
              </div>
              
              <h2 className="text-2xl font-black text-gray-900 mb-2">{successContent.title}</h2>
              <div className="text-gray-600 mb-8 whitespace-pre-wrap leading-relaxed">
                {successContent.message}
              </div>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black hover:shadow-xl active:scale-95 transition-all cursor-pointer shadow-lg"
              >
                Great, thanks!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYE Calculator Modal */}
      {showPAYECalculatorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden border border-white/50 transform animate-in zoom-in-95 duration-300 flex flex-col">

            {/* Header with gradient and pattern */}
            <div className="relative bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white rounded-full"></div>
                <div className="absolute -left-5 -bottom-5 w-24 h-24 bg-white rounded-full"></div>
              </div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                    <Calculator className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">PAYE Calculator</h2>
                    <p className="text-emerald-100 text-sm font-medium">UK Tax Year 2025/26</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPAYECalculatorModal(false)}
                  className="p-2.5 bg-white/10 hover:bg-white/30 rounded-xl transition-all cursor-pointer backdrop-blur-sm"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* Input Section */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 border border-gray-200/50">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Enter Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Gross Salary</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">£</span>
                      <input
                        type="number"
                        value={payeGrossSalary}
                        onChange={(e) => setPayeGrossSalary(e.target.value)}
                        className="w-full pl-8 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-lg font-semibold text-gray-900"
                        placeholder="3,500"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tax Code</label>
                    <input
                      type="text"
                      value={payeTaxCode}
                      onChange={(e) => setPayeTaxCode(e.target.value)}
                      className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-lg font-semibold text-gray-900 text-center"
                      placeholder="1257L"
                    />
                  </div>
                </div>
              </div>

              {/* Results Section */}
              {(() => {
                const salary = parseFloat(payeGrossSalary) * 12 || 0;
                const monthlyPAYE = calculateMonthlyPAYE(salary);
                const monthlyEmployeeNI = calculateEmployeeNI(salary);
                const monthlyEmployerNI = calculateEmployerNI(salary);
                const monthlyNet = (salary / 12) - monthlyPAYE - monthlyEmployeeNI;
                
                return (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Monthly Breakdown</h3>
                    
                    {/* Visual breakdown bars */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          <span className="text-gray-700 font-medium">Gross Salary</span>
                        </div>
                        <span className="text-xl font-black text-gray-900">£{(salary / 12).toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                      
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div>
                            <span className="text-red-800 font-medium">Income Tax</span>
                            <span className="ml-2 text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">PAYE</span>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-red-700">-£{monthlyPAYE.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                      
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-purple-50/50">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <div>
                            <span className="text-purple-800 font-medium">National Insurance</span>
                            <span className="ml-2 text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">8%</span>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-purple-700">-£{monthlyEmployeeNI.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                      
                      <div className="p-5 bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <span className="text-white font-bold text-lg">Take Home Pay</span>
                            <p className="text-emerald-100 text-xs">After deductions</p>
                          </div>
                        </div>
                        <span className="text-3xl font-black text-white">£{monthlyNet.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    </div>

                    {/* Employer Cost Card */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-4 border border-indigo-200/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <Users className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-indigo-900 font-bold">Employer NI Cost</p>
                            <p className="text-indigo-600 text-xs">15% over £9,100 threshold</p>
                          </div>
                        </div>
                        <span className="text-2xl font-black text-indigo-700">£{monthlyEmployerNI.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    </div>

                    {/* Annual Summary */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                        <p className="text-xs text-gray-500 font-medium mb-1">Annual Tax</p>
                        <p className="text-lg font-black text-gray-900">£{(monthlyPAYE * 12).toLocaleString('en-GB', {maximumFractionDigits: 0})}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                        <p className="text-xs text-gray-500 font-medium mb-1">Annual NI</p>
                        <p className="text-lg font-black text-gray-900">£{(monthlyEmployeeNI * 12).toLocaleString('en-GB', {maximumFractionDigits: 0})}</p>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-200">
                        <p className="text-xs text-emerald-600 font-medium mb-1">Annual Net</p>
                        <p className="text-lg font-black text-emerald-700">£{(monthlyNet * 12).toLocaleString('en-GB', {maximumFractionDigits: 0})}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Info Banner */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  <strong>2025/26 Rates:</strong> Employee NI reduced to 8%. Employer NI increased to 15% with £9,100 threshold.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setShowPAYECalculatorModal(false)}
                className="w-full py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold rounded-xl hover:from-gray-900 hover:to-black hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer"
              >
                Close Calculator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RTI Submission Modal */}
      {showRTIModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
                    <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden border border-white/50 transform animate-in zoom-in-95 duration-300 flex flex-col">

            {/* Header with HMRC-style gradient */}
            <div className="relative bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white rounded-full"></div>
                <div className="absolute -left-5 -bottom-5 w-24 h-24 bg-white rounded-full"></div>
              </div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                    <Send className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">RTI Submission</h2>
                    <p className="text-cyan-100 text-sm font-medium">Full Payment Submission (FPS)</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowRTIModal(false)}
                  className="p-2.5 bg-white/10 hover:bg-white/30 rounded-xl transition-all cursor-pointer backdrop-blur-sm"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-5 flex-1 overflow-y-auto">
              {/* Status Banner */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl border border-cyan-200">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-20"></div>
                  <div className="relative p-3 bg-cyan-100 rounded-full">
                    <Shield className="w-6 h-6 text-cyan-700" />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-cyan-900">Ready for HMRC Submission</p>
                  <p className="text-sm text-cyan-700">Review details below before submitting</p>
                </div>
              </div>

              {/* Submission Details Card */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Submission Details</h3>
                </div>
                
                <div className="divide-y divide-gray-100">
                  <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium">Pay Period</span>
                    </div>
                    <span className="font-bold text-gray-900">January 2026 <span className="text-gray-500 text-sm font-normal">(Month 10)</span></span>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium">Employees Included</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span className="font-bold text-gray-900">12</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Financial Summary</h3>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-red-800 font-medium">PAYE Income Tax</span>
                    </div>
                    <span className="font-bold text-red-900 text-lg">£2,450.00</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-purple-800 font-medium">Employee NI (8%)</span>
                    </div>
                    <span className="font-bold text-purple-900 text-lg">£850.00</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                      <span className="text-indigo-800 font-medium">Employer NI (15%)</span>
                    </div>
                    <span className="font-bold text-indigo-900 text-lg">£1,000.00</span>
                  </div>
                </div>

                {/* Total */}
                <div className="p-5 bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Receipt className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-white font-bold text-lg">Total to HMRC</span>
                      <p className="text-cyan-100 text-xs">Due: 22 February 2026</p>
                    </div>
                  </div>
                  <span className="text-3xl font-black text-white">£4,300.00</span>
                </div>
              </div>

              {/* Checklist */}
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <h4 className="font-bold text-amber-900">Pre-submission Checklist</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Employee details verified', 'Pay dates accurate', 'Tax codes checked', 'NI categories confirmed'].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-amber-800">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowRTIModal(false)}
                className="flex-1 py-4 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-100 hover:border-gray-300 active:scale-[0.98] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowRTIModal(false);
                  const ref = 'RTI-' + today.getFullYear() + '-' + Math.random().toString(36).substr(2, 8).toUpperCase();
                  setSuccessContent({
                    title: 'RTI Submitted Successfully',
                    message: `Full Payment Submission sent to HMRC.\n\nReference: ${ref}\nPeriod: January 2026\nAmount: £4,300.00\n\nPayment due by 22 February 2026.`
                  });
                  setShowSuccessModal(true);
                }}
                className="flex-1 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-cyan-600 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-5 h-5" />
                Submit to HMRC
              </button>
            </div>
          </div>
        </div>
      )}
      {/* VAT Return Modal */}
      {showVATReturnModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden border border-white/50 transform animate-in zoom-in-95 duration-300 flex flex-col">

            {/* Header with HMRC-style VAT branding */}
            <div className="relative bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-800 p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-white rounded-full"></div>
                <div className="absolute -left-5 -bottom-5 w-32 h-32 bg-white rounded-full"></div>
              </div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg ring-1 ring-white/50">
                    <Receipt className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">VAT Return Submission</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold text-white uppercase tracking-wider">MTD Compliant</span>
                      <p className="text-purple-100 text-sm font-medium">Q3: Oct - Dec 2025</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowVATReturnModal(false)}
                  className="p-2.5 bg-white/10 hover:bg-white/30 rounded-xl transition-all cursor-pointer backdrop-blur-sm group"
                >
                  <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
              {/* Submission Information Banner */}
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 shadow-sm">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <p className="font-bold text-purple-900">Making Tax Digital Status: Active</p>
                  <p className="text-xs text-purple-700 mt-0.5 leading-relaxed">
                    This return will be filed directly with HMRC via their secure MTD gateway. Ensure all figures align with your accounting software.
                  </p>
                </div>
              </div>

              {/* Input Cards */}
              <div className="grid grid-cols-1 gap-4">
                <div className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-purple-200 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-gray-400 group-hover:text-purple-600 transition-colors">
                      <TrendingUp className="w-4 h-4" />
                      <label className="text-xs font-bold uppercase tracking-widest">Total Sales (Box 6)</label>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">Excl. VAT</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">£</span>
                    <input
                      type="number"
                      value={vatOutputSales}
                      onChange={(e) => setVatOutputSales(e.target.value)}
                      className="w-full pl-9 pr-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-xl focus:bg-white focus:border-purple-500 transition-all text-xl font-black text-gray-900 placeholder-gray-300"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-gray-400 group-hover:text-blue-600 transition-colors">
                      <DollarSign className="w-4 h-4" />
                      <label className="text-xs font-bold uppercase tracking-widest">Total Purchases (Box 7)</label>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">Excl. VAT</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">£</span>
                    <input
                      type="number"
                      value={vatInputPurchases}
                      onChange={(e) => setVatInputPurchases(e.target.value)}
                      className="w-full pl-9 pr-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all text-xl font-black text-gray-900 placeholder-gray-300"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Calculation Preview */}
              <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-xl border border-white/10">
                <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">VAT Breakdown (20%)</h3>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                  </div>
                </div>
                
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between text-gray-300">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium opacity-60">Box 1</span>
                      <span className="text-sm font-bold">VAT due on sales</span>
                    </div>
                    <span className="text-lg font-black text-white">£{(parseFloat(vatOutputSales || '0') * 0.2).toLocaleString('en-GB', {minimumFractionDigits: 2})}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-gray-300">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium opacity-60">Box 4</span>
                      <span className="text-sm font-bold">VAT reclaimed</span>
                    </div>
                    <span className="text-lg font-black text-white">£{(parseFloat(vatInputPurchases || '0') * 0.2).toLocaleString('en-GB', {minimumFractionDigits: 2})}</span>
                  </div>
                  
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-tighter">Box 5</span>
                      <span className="text-lg font-black text-white">Net VAT Payable</span>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                        £{Math.max(0, (parseFloat(vatOutputSales || '0') * 0.2) - (parseFloat(vatInputPurchases || '0') * 0.2)).toLocaleString('en-GB', {minimumFractionDigits: 2})}
                      </span>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Due to HMRC</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Footer Actions */}
            <div className="p-5 bg-gray-50 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => setShowVATReturnModal(false)}
                className="flex-1 py-4 bg-white border-2 border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-100 hover:border-gray-300 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              >
                Save Draft
              </button>
              <button
                onClick={() => {
                  setShowVATReturnModal(false);
                  const ref = 'VAT-' + today.getFullYear() + '-' + Math.random().toString(36).substr(2, 8).toUpperCase();
                  setSuccessContent({
                    title: 'VAT Return Submitted',
                    message: `Your return for Q3 2025/26 has been successfully submitted to HMRC via MTD.\n\nReference: ${ref}\nNet Amount: £${Math.max(0, (parseFloat(vatOutputSales || '0') * 0.2) - (parseFloat(vatInputPurchases || '0') * 0.2)).toLocaleString('en-GB', {minimumFractionDigits: 2})}\n\nDeadline for payment: 7 February 2026.`
                  });
                  setShowSuccessModal(true);
                }}
                className="flex-[1.5] py-4 bg-gradient-to-r from-purple-600 to-blue-700 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-purple-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Submit to HMRC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VAT History Modal */}
      {showVATHistoryModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden border border-white/50 transform animate-in zoom-in-95 duration-300 flex flex-col">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-700 p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-white rounded-full"></div>
              </div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg ring-1 ring-white/50">
                    <History className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">VAT Return History</h2>
                    <p className="text-indigo-100 text-sm font-medium">Archived MTD Submissions</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowVATHistoryModal(false)}
                  className="p-2.5 bg-white/10 hover:bg-white/30 rounded-xl transition-all cursor-pointer backdrop-blur-sm group"
                >
                  <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
              {[
                { period: 'Q2 2025/26', range: 'Jul - Sep', date: '07 Nov 2025', amount: '£3,840.00', status: 'Submitted', ref: 'X8D2F1' },
                { period: 'Q1 2025/26', range: 'Apr - Jun', date: '07 Aug 2025', amount: '£4,120.00', status: 'Submitted', ref: 'A2B9C8' },
                { period: 'Q4 2024/25', range: 'Jan - Mar', date: '07 May 2025', amount: '£3,650.00', status: 'Submitted', ref: 'L9K4M2' },
                { period: 'Q3 2024/25', range: 'Oct - Dec', date: '07 Feb 2025', amount: '£4,200.00', status: 'Submitted', ref: 'P3Q7R5' },
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10 group-hover:scale-110 transition-transform"></div>
                  
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                          <Calendar className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="w-0.5 h-full bg-indigo-50 mt-2"></div>
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 text-lg leading-tight">{item.period}</h3>
                        <p className="text-sm text-indigo-600 font-bold">{item.range}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submitted on</span>
                          <span className="text-xs font-bold text-gray-700">{item.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-gray-900 tracking-tight">{item.amount}</p>
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">{item.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 px-2 bg-gray-50 rounded text-[9px] font-mono font-bold text-gray-500">
                        REF: {item.ref}
                      </div>
                    </div>
                    <button className="flex items-center gap-2 text-indigo-600 font-bold text-xs hover:text-indigo-800 transition-colors">
                      <div className="p-1.5 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                        <Download className="w-3 h-3" />
                      </div>
                      VAT Certificate (PDF)
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setShowVATHistoryModal(false)}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CGT Calculator Modal */}
      {showCGTCalculatorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden border border-white/50 transform animate-in zoom-in-95 duration-300 flex flex-col">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-orange-600 via-red-600 to-rose-700 p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white rounded-full"></div>
              </div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">CGT Calculator</h2>
                    <p className="text-orange-100 text-sm font-medium">UK Tax Year 2025/26</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCGTCalculatorModal(false)}
                  className="p-2.5 bg-white/10 hover:bg-white/30 rounded-xl transition-all cursor-pointer backdrop-blur-sm"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* Asset Type Selection */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200 shadow-sm">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Asset Classification</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setCgtAssetType('standard')}
                    className={`p-3 rounded-xl border-2 transition-all font-bold text-sm flex items-center justify-center gap-2 ${cgtAssetType === 'standard' ? 'bg-orange-600 border-orange-600 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'}`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Standard Asset
                  </button>
                  <button 
                    onClick={() => setCgtAssetType('badr')}
                    className={`p-3 rounded-xl border-2 transition-all font-bold text-sm flex items-center justify-center gap-2 ${cgtAssetType === 'badr' ? 'bg-purple-600 border-purple-600 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300'}`}
                  >
                    <Shield className="w-4 h-4" />
                    BADR Relieved
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-200/50">
                  <label className="block text-sm font-bold text-orange-900 mb-2">Disposal Value</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 font-bold">£</span>
                    <input 
                      type="number" 
                      value={cgtDisposalValue}
                      onChange={(e) => setCgtDisposalValue(e.target.value)}
                      className="w-full pl-7 pr-4 py-3 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 font-bold text-orange-900" 
                    />
                  </div>
                </div>
                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-200/50">
                  <label className="block text-sm font-bold text-blue-900 mb-2">Acquisition Cost</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold">£</span>
                    <input 
                      type="number" 
                      value={cgtAcquisitionCost}
                      onChange={(e) => setCgtAcquisitionCost(e.target.value)}
                      className="w-full pl-7 pr-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-blue-900" 
                    />
                  </div>
                </div>
                <div className="col-span-full bg-gray-50 rounded-2xl p-4 border border-gray-200">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Allowable Expenses (Legal, etc.)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">£</span>
                    <input 
                      type="number" 
                      value={cgtAllowableExpenses}
                      onChange={(e) => setCgtAllowableExpenses(e.target.value)}
                      className="w-full pl-7 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 font-bold text-gray-900" 
                    />
                  </div>
                </div>
              </div>

              {/* Calculation Summary */}
              {(() => {
                const disposal = parseFloat(cgtDisposalValue || '0');
                const cost = parseFloat(cgtAcquisitionCost || '0');
                const expenses = parseFloat(cgtAllowableExpenses || '0');
                const totalGain = Math.max(0, disposal - cost - expenses);
                const aeAmount = 3000;
                const taxableGain = Math.max(0, totalGain - aeAmount);
                const rate = cgtAssetType === 'badr' ? 0.14 : (taxableGain > 0 ? 0.24 : 0.24); // Assuming higher rate for conservative estimate
                const taxDue = taxableGain * rate;

                return (
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Estimated Gain Breakdown</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${cgtAssetType === 'badr' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                        {cgtAssetType === 'badr' ? 'BADR Applied (14%)' : 'Standard Rate (24%)'}
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Gain</span>
                        <span className="font-bold text-gray-900">£{totalGain.toLocaleString('en-GB', {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-orange-600">Annual Exempt Amount (2025/26)</span>
                        <span className="font-bold text-orange-600">-£{aeAmount.toLocaleString('en-GB', {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Taxable Gain</span>
                        <span className="text-xl font-black text-gray-900">£{taxableGain.toLocaleString('en-GB', {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className={`p-4 rounded-xl border mt-2 ${cgtAssetType === 'badr' ? 'bg-purple-50 border-purple-100' : 'bg-orange-50 border-orange-100'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-sm font-medium ${cgtAssetType === 'badr' ? 'text-purple-800' : 'text-orange-800'}`}>
                            Estimated Tax ({rate * 100}%)
                          </span>
                          <span className={`text-lg font-black ${cgtAssetType === 'badr' ? 'text-purple-900' : 'text-orange-900'}`}>
                            £{taxDue.toLocaleString('en-GB', {minimumFractionDigits: 2})}
                          </span>
                        </div>
                        <p className={`text-[10px] italic ${cgtAssetType === 'badr' ? 'text-purple-700' : 'text-orange-700'}`}>
                          * {cgtAssetType === 'badr' ? 'BADR relief applied (Lifetime limit £1m).' : 'Based on 2025/26 higher rates (24%).'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Important Update:</strong> Following Autumn Budget 2024, standard CGT rates are now aligned at <strong>18% and 24%</strong> for the 2025/26 tax year. BADR rate has increased to <strong>14%</strong>.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setShowCGTCalculatorModal(false)}
                className="w-full py-4 bg-gradient-to-r from-orange-600 to-rose-600 text-white font-bold rounded-xl hover:shadow-xl transition-all cursor-pointer"
              >
                Close Calculator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

