"use client";

import React, { useState } from 'react';
import { 
  FileText, Plus, Search, Filter, Download, Upload, Eye, Edit3,
  Calculator, Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle,
  Clock, Building2, User, Users, Briefcase, PieChart, BarChart3,
  Target, Award, Shield, Bell, Send, Save, X, Check, Sparkles,
  Receipt, Wallet, CreditCard, Package, ShoppingCart, Home, Car
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
  const [activeTab, setActiveTab] = useState('overview');
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedDownloadFormat, setSelectedDownloadFormat] = useState<'TXT' | 'CSV' | 'PDF' | 'JSON'>('PDF');
  const [calculatedTax, setCalculatedTax] = useState(0);
  const [taxableIncome, setTaxableIncome] = useState('');

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

  const tabs = [
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            UK Taxation Management
          </h1>
          <p className="text-gray-600 mt-2">Complete tax management system for UK businesses</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Export</span>
          </button>
          <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Return
          </button>
        </div>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200 cursor-pointer hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-blue-600 font-medium mb-1">Corporation Tax</p>
          <p className="text-2xl font-bold text-blue-900">£{taxSummary.corporationTax.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200 cursor-pointer hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Receipt className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-purple-600 font-medium mb-1">VAT Liability</p>
          <p className="text-2xl font-bold text-purple-900">£{taxSummary.vatLiability.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200 cursor-pointer hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-500 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-green-600 font-medium mb-1">PAYE & NI</p>
          <p className="text-2xl font-bold text-green-900">£{taxSummary.payeNI.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border-2 border-orange-200 cursor-pointer hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-500 rounded-lg">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-orange-600 font-medium mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-orange-900">£{taxSummary.taxOutstanding.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
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
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-green-600" />
              Upcoming Tax Obligations
            </h2>
            <div className="space-y-3">
              {taxObligations.map((obligation) => (
                <div key={obligation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:shadow-lg transition-all">
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
            <button className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:shadow-xl transition-all text-left cursor-pointer">
              <div className="p-3 bg-blue-500 rounded-lg w-fit mb-3">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Calculate Corporation Tax</h3>
              <p className="text-sm text-gray-600">Estimate your CT liability for the year</p>
            </button>

            <button className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:shadow-xl transition-all text-left cursor-pointer">
              <div className="p-3 bg-green-500 rounded-lg w-fit mb-3">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Submit VAT Return</h3>
              <p className="text-sm text-gray-600">File your VAT return to HMRC</p>
            </button>

            <button className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:shadow-xl transition-all text-left cursor-pointer">
              <div className="p-3 bg-purple-500 rounded-lg w-fit mb-3">
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
              <button className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all">
                View Compliance Status
              </button>
              <button className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-all">
                Learn More
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'corporation-tax' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Corporation Tax Calculator</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Accounting Period</label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option>Year ending 31/03/2024</option>
                  <option>Year ending 31/03/2025</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Taxable Profit</label>
                <input
                  type="number"
                  placeholder="50000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium mb-1">Estimated Corporation Tax</p>
                  <p className="text-4xl font-bold text-green-900">£9,500</p>
                  <p className="text-xs text-green-600 mt-1">At 19% rate</p>
                </div>
                <button className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all">
                  Generate CT600
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Corporation Tax Rates 2024/25</h3>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-blue-900">Small Profits Rate</p>
                    <p className="text-sm text-blue-700">Profits up to £50,000</p>
                  </div>
                  <span className="text-2xl font-bold text-blue-900">19%</span>
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-purple-900">Marginal Relief</p>
                    <p className="text-sm text-purple-700">Profits £50,001 - £250,000</p>
                  </div>
                  <span className="text-2xl font-bold text-purple-900">19-25%</span>
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
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
              <button className="px-6 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition-all">
                Start New Return
              </button>
              <button className="px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-all">
                View Previous Returns
              </button>
            </div>
          </div>

          {/* Tax Year Selection */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Select Tax Year
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <button className="p-4 border-2 border-purple-500 bg-purple-50 rounded-xl text-center">
                <p className="font-bold text-purple-900">2023/24</p>
                <p className="text-xs text-purple-700 mt-1">Current year</p>
              </button>
              <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all text-center">
                <p className="font-bold text-gray-900">2022/23</p>
                <p className="text-xs text-gray-600 mt-1">Previous year</p>
              </button>
              <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all text-center">
                <p className="font-bold text-gray-900">2021/22</p>
                <p className="text-xs text-gray-600 mt-1">Earlier year</p>
              </button>
            </div>
          </div>

          {/* Income Sources */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Income Sources</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Self-Employment</p>
                    <p className="text-xs text-blue-700">Sole trader income</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-900">£45,000</p>
                <button className="mt-3 w-full px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors">
                  Edit Details
                </button>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">Employment Income</p>
                    <p className="text-xs text-green-700">PAYE salary</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-900">£25,000</p>
                <button className="mt-3 w-full px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors">
                  Edit Details
                </button>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-purple-900">Property Income</p>
                    <p className="text-xs text-purple-700">Rental income</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-purple-900">£12,000</p>
                <button className="mt-3 w-full px-4 py-2 bg-purple-500 text-white text-sm font-semibold rounded-lg hover:bg-purple-600 transition-colors">
                  Edit Details
                </button>
              </div>

              <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-orange-900">Dividends & Interest</p>
                    <p className="text-xs text-orange-700">Investment income</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-orange-900">£3,500</p>
                <button className="mt-3 w-full px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">
                  Edit Details
                </button>
              </div>
            </div>
          </div>

          {/* Tax Calculation */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-purple-600" />
              Tax Calculation Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Total Income</span>
                <span className="font-bold text-gray-900">£85,500</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Personal Allowance</span>
                <span className="font-bold text-gray-900">-£12,570</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Allowable Expenses</span>
                <span className="font-bold text-gray-900">-£8,200</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                <span className="font-semibold text-blue-900">Taxable Income</span>
                <span className="font-bold text-blue-900 text-xl">£64,730</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                <div>
                  <p className="font-semibold text-purple-900">Total Tax Due</p>
                  <p className="text-xs text-purple-700">Including NI contributions</p>
                </div>
                <span className="font-bold text-purple-900 text-3xl">£18,450</span>
              </div>
            </div>
          </div>

          {/* Important Deadlines */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
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

            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="font-bold text-green-900">Return Status</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-800">Progress</span>
                  <span className="font-bold text-green-900">75% Complete</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2 mb-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <button className="w-full px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors">
                  Continue Return
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4">
            <button 
              onClick={() => setShowCalculatorModal(true)}
              className="p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-center cursor-pointer"
            >
              <Calculator className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 text-sm">Tax Calculator</p>
            </button>
            <button 
              onClick={() => setShowDownloadModal(true)}
              className="p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-center cursor-pointer"
            >
              <Download className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 text-sm">Download SA100</p>
            </button>
            <button 
              onClick={() => setShowSubmitModal(true)}
              className="p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-center cursor-pointer"
            >
              <Send className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 text-sm">Submit to HMRC</p>
            </button>
          </div>
        </div>
      )}

      {/* Tax Calculator Modal */}
      {showCalculatorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calculator className="w-6 h-6" />
                  Self Assessment Tax Calculator
                </h2>
                <button 
                  onClick={() => setShowCalculatorModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
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
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-xl transition-all"
              >
                Calculate Tax
              </button>

              {calculatedTax > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                  <h3 className="font-bold text-purple-900 mb-4 text-center">Your Tax Calculation</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-gray-700">Taxable Income</span>
                      <span className="font-bold text-gray-900">£{parseFloat(taxableIncome).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-purple-100 rounded-lg">
                      <div>
                        <p className="font-bold text-purple-900">Total Tax & NI Due</p>
                        <p className="text-xs text-purple-700">Income Tax + Class 4 NI</p>
                      </div>
                      <span className="font-bold text-purple-900 text-3xl">£{calculatedTax.toLocaleString()}</span>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
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
                className="w-full px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download SA100 Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Download className="w-6 h-6" />
                  Download SA100 Tax Return
                </h2>
                <button 
                  onClick={() => setShowDownloadModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
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
                    <p className="text-blue-900">2023/24</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-semibold">Total Tax Due:</p>
                    <p className="text-blue-900">£18,450</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-semibold">Status:</p>
                    <p className="text-blue-900">75% Complete</p>
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
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedDownloadFormat === 'TXT') {
                      const sa100Content = `SELF ASSESSMENT TAX RETURN (SA100)
Tax Year: 2023/24

PERSONAL DETAILS
Name: [Your Name]
UTR: [Your UTR Number]
NINO: [Your National Insurance Number]

INCOME SUMMARY
Self-Employment Income: £45,000
Employment Income: £25,000
Property Income: £12,000
Dividends & Interest: £3,500
Total Income: £85,500

ALLOWANCES & DEDUCTIONS
Personal Allowance: £12,570
Allowable Expenses: £8,200
Taxable Income: £64,730

TAX CALCULATION
Basic Rate (20%): £37,700 @ 20% = £7,540
Higher Rate (40%): £27,030 @ 40% = £10,812
National Insurance: £98
Total Tax Due: £18,450

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
                      alert('✓ SA100 Tax Return (TXT) downloaded successfully!');
                    } else if (selectedDownloadFormat === 'CSV') {
                      const csvContent = `Field,Value
Tax Year,2023/24
Self-Employment Income,£45000
Employment Income,£25000
Property Income,£12000
Dividends & Interest,£3500
Total Income,£85500
Personal Allowance,£12570
Allowable Expenses,£8200
Taxable Income,£64730
Basic Rate Tax,£7540
Higher Rate Tax,£10812
National Insurance,£98
Total Tax Due,£18450`;

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
                      alert('✓ SA100 Tax Return (CSV) downloaded successfully!');
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
                      doc.text('Tax Year: 2023/24', 105, 28, { align: 'center' });
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
                      doc.text('£45,000.00', 150, y, { align: 'right' });
                      y += 7;
                      doc.text('Employment Income:', 20, y);
                      doc.text('£25,000.00', 150, y, { align: 'right' });
                      y += 7;
                      doc.text('Property Income:', 20, y);
                      doc.text('£12,000.00', 150, y, { align: 'right' });
                      y += 7;
                      doc.text('Dividends & Interest:', 20, y);
                      doc.text('£3,500.00', 150, y, { align: 'right' });
                      y += 7;
                      doc.line(20, y, 150, y);
                      y += 5;
                      doc.setFont('helvetica', 'bold');
                      doc.text('Total Income:', 20, y);
                      doc.text('£85,500.00', 150, y, { align: 'right' });
                      
                      // Allowances & Deductions
                      y += 15;
                      doc.setFontSize(14);
                      doc.text('ALLOWANCES & DEDUCTIONS', 20, y);
                      doc.line(20, y + 2, 190, y + 2);
                      
                      y += 10;
                      doc.setFontSize(11);
                      doc.setFont('helvetica', 'normal');
                      doc.text('Personal Allowance:', 20, y);
                      doc.text('£12,570.00', 150, y, { align: 'right' });
                      y += 7;
                      doc.text('Allowable Expenses:', 20, y);
                      doc.text('£8,200.00', 150, y, { align: 'right' });
                      y += 7;
                      doc.line(20, y, 150, y);
                      y += 5;
                      doc.setFont('helvetica', 'bold');
                      doc.text('Taxable Income:', 20, y);
                      doc.text('£64,730.00', 150, y, { align: 'right' });
                      
                      // Tax Calculation
                      y += 15;
                      doc.setFontSize(14);
                      doc.text('TAX CALCULATION', 20, y);
                      doc.line(20, y + 2, 190, y + 2);
                      
                      y += 10;
                      doc.setFontSize(11);
                      doc.setFont('helvetica', 'normal');
                      doc.text('Basic Rate (20%):', 20, y);
                      y += 7;
                      doc.text('  £37,700 @ 20%', 25, y);
                      doc.text('£7,540.00', 150, y, { align: 'right' });
                      y += 7;
                      doc.text('Higher Rate (40%):', 20, y);
                      y += 7;
                      doc.text('  £27,030 @ 40%', 25, y);
                      doc.text('£10,812.00', 150, y, { align: 'right' });
                      y += 7;
                      doc.text('National Insurance:', 20, y);
                      doc.text('£98.00', 150, y, { align: 'right' });
                      y += 7;
                      doc.line(20, y, 150, y);
                      y += 5;
                      doc.setFont('helvetica', 'bold');
                      doc.setFontSize(12);
                      doc.text('TOTAL TAX DUE:', 20, y);
                      doc.text('£18,450.00', 150, y, { align: 'right' });
                      
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
                      doc.text('£9,225.00', 150, y, { align: 'right' });
                      y += 7;
                      doc.text('Payment on Account 2:', 20, y);
                      doc.text('31 July 2025', 100, y);
                      doc.text('£9,225.00', 150, y, { align: 'right' });
                      
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
                      doc.save(`SA100_Tax_Return_2023-24_${new Date().toISOString().split('T')[0]}.pdf`);
                      
                      setShowDownloadModal(false);
                      alert('✓ SA100 Tax Return (PDF) downloaded successfully!');
                    } else if (selectedDownloadFormat === 'JSON') {
                      const jsonContent = JSON.stringify({
                        taxYear: "2023/24",
                        personalDetails: {
                          name: "[Your Name]",
                          utr: "[Your UTR Number]",
                          nino: "[Your National Insurance Number]"
                        },
                        income: {
                          selfEmployment: 45000,
                          employment: 25000,
                          property: 12000,
                          dividendsInterest: 3500,
                          total: 85500
                        },
                        allowances: {
                          personalAllowance: 12570,
                          allowableExpenses: 8200,
                          taxableIncome: 64730
                        },
                        tax: {
                          basicRate: 7540,
                          higherRate: 10812,
                          nationalInsurance: 98,
                          totalDue: 18450
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
                      link.setAttribute('download', `SA100_Tax_Return_2023-24_${new Date().toISOString().split('T')[0]}.json`);
                      link.style.visibility = 'hidden';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      
                      setShowDownloadModal(false);
                      alert('✓ SA100 Tax Return (JSON) downloaded successfully!');
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Send className="w-6 h-6" />
                  Submit to HMRC
                </h2>
                <button 
                  onClick={() => setShowSubmitModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
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
                  <li>• Tax Year: 2023/24</li>
                  <li>• Total Tax Due: £18,450</li>
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
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowSubmitModal(false);
                    alert('✓ Self Assessment submitted successfully to HMRC!\n\nSubmission Reference: SA-2024-' + Math.random().toString(36).substr(2, 9).toUpperCase() + '\n\nYou will receive a confirmation email shortly.');
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
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
                <p className="text-green-100">Manage employee payroll taxes and RTI submissions</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-6 py-3 bg-white text-green-600 font-bold rounded-xl hover:bg-green-50 transition-all">
                Submit RTI Return
              </button>
              <button className="px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-all">
                View Payment History
              </button>
            </div>
          </div>

          {/* Employee Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Employees</p>
                  <p className="text-3xl font-bold text-gray-900">12</p>
                </div>
              </div>
              <p className="text-xs text-gray-600">Active on payroll</p>
            </div>

            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly PAYE</p>
                  <p className="text-3xl font-bold text-gray-900">£2,450</p>
                </div>
              </div>
              <p className="text-xs text-gray-600">Current month liability</p>
            </div>

            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Receipt className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly NI</p>
                  <p className="text-3xl font-bold text-gray-900">£750</p>
                </div>
              </div>
              <p className="text-xs text-gray-600">Employer & Employee NI</p>
            </div>
          </div>

          {/* RTI Submissions */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-green-600" />
              Recent RTI Submissions
            </h3>
            <div className="space-y-3">
              {[
                { month: 'December 2024', submitted: '19 Dec 2024', amount: 3200, status: 'submitted' },
                { month: 'November 2024', submitted: '19 Nov 2024', amount: 3150, status: 'submitted' },
                { month: 'October 2024', submitted: '19 Oct 2024', amount: 3100, status: 'submitted' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
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
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Current Month Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Employee Income Tax</span>
                <span className="font-bold text-gray-900">£2,450.00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Employee NI (Class 1)</span>
                <span className="font-bold text-gray-900">£450.00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Employer NI (Class 1)</span>
                <span className="font-bold text-gray-900">£300.00</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                <div>
                  <p className="font-semibold text-green-900">Total Payment Due</p>
                  <p className="text-xs text-green-700">Due: 22 January 2025</p>
                </div>
                <span className="font-bold text-green-900 text-3xl">£3,200</span>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h3 className="font-bold text-blue-900">Payment Deadline</h3>
              </div>
              <p className="text-sm text-blue-800 mb-2">PAYE/NI must be paid by:</p>
              <p className="text-2xl font-bold text-blue-900">22nd of each month</p>
              <p className="text-xs text-blue-700 mt-2">For previous month's deductions</p>
            </div>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5">
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
            <button className="p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-center cursor-pointer">
              <Send className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 text-sm">Submit FPS</p>
            </button>
            <button className="p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-center cursor-pointer">
              <Calculator className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 text-sm">Calculate PAYE</p>
            </button>
            <button className="p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-center cursor-pointer">
              <Download className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 text-sm">Download P60s</p>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'vat' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">VAT Management</h2>
            <p className="text-purple-100 mb-6">Manage your VAT returns and submissions</p>
            <div className="flex items-center gap-4">
              <button className="px-6 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition-all">
                Submit VAT Return
              </button>
              <button className="px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-all">
                View Returns
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Current Quarter (Q4 2024)</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">VAT on Sales</span>
                <span className="font-bold text-gray-900">£8,500.00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">VAT on Purchases</span>
                <span className="font-bold text-gray-900">£4,250.00</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                <span className="font-semibold text-purple-900">VAT Payable</span>
                <span className="font-bold text-purple-900 text-2xl">£4,250.00</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'capital-gains' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Capital Gains Tax</h2>
            <p className="text-orange-100 mb-6">Calculate and report capital gains on asset disposals</p>
            <button className="px-6 py-3 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-all">
              Calculate CGT
            </button>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">CGT Allowance 2023/24</h3>
            <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200">
              <p className="text-sm text-orange-700 mb-2">Annual Exempt Amount</p>
              <p className="text-4xl font-bold text-orange-900">£6,000</p>
              <p className="text-xs text-orange-700 mt-2">Per individual for 2023/24 tax year</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">UK Tax Calendar 2024/25</h2>
          <div className="space-y-4">
            {[
              { date: '19th of each month', task: 'PAYE/NI payment due', type: 'monthly', color: 'blue' },
              { date: '22nd of each month', task: 'CIS return and payment due', type: 'monthly', color: 'purple' },
              { date: 'Quarterly', task: 'VAT return due (1 month + 7 days after period end)', type: 'quarterly', color: 'green' },
              { date: '31 January', task: 'Self Assessment tax return and payment', type: 'annual', color: 'red' },
              { date: '31 July', task: 'Self Assessment payment on account', type: 'annual', color: 'orange' },
              { date: '9 months after year-end', task: 'Corporation Tax payment due', type: 'annual', color: 'indigo' },
              { date: '12 months after year-end', task: 'Corporation Tax return (CT600) due', type: 'annual', color: 'pink' },
            ].map((item, idx) => (
              <div key={idx} className={`p-4 bg-${item.color}-50 rounded-lg border border-${item.color}-200 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <Calendar className={`w-5 h-5 text-${item.color}-600`} />
                  <div>
                    <p className={`font-semibold text-${item.color}-900`}>{item.task}</p>
                    <p className={`text-sm text-${item.color}-700`}>{item.date}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 bg-${item.color}-100 text-${item.color}-700 rounded-full text-xs font-semibold`}>
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
