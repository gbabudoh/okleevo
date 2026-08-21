"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, Plus, Download, Calculator, Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle,
  Clock, Building2, User, Users, Briefcase, BarChart3, Shield, Send, X, Receipt, Home, History,
  ShieldCheck, Globe, Loader2, ArrowUpRight, FileCheck, PoundSterling, Info
} from 'lucide-react';

import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import TourProvider from '@/components/tours/TourProvider';
import { ModuleGuideBanner } from '@/components/tours/ModuleGuideBanner';
import { taxationTourSteps } from './tour-steps';
import {
  calculateCorporationTax, calculateMonthlyPAYE, calculateEmployeeNI,
  calculateEmployerNI, calculateSelfAssessmentTaxDue, taperedPersonalAllowance,
} from '@/lib/tax/uk-tax';

interface TaxObligation {
  id: string;
  type: string;
  description: string;
  dueDate: Date;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  period: string;
}

interface TaxObligationResponse {
  id: string;
  type: string;
  description: string;
  dueDate: string;
  amount: number;
  status: string;
  period: string;
}

// calculateCorporationTax now lives in @/lib/tax/uk-tax — shared with the API
// route so the dashboard stat card and this tab's calculator never disagree.

// Parses the trailing "DD/MM/YYYY" out of a "Year ending DD/MM/YYYY" label.
function parsePeriodEndDate(period: string): Date | null {
  const match = period.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
}

function addMonthsToDate(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatUkDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// UK VAT/PAYE quarters run in tax-year blocks: Apr-Jun (Q1), Jul-Sep (Q2), Oct-Dec (Q3), Jan-Mar (Q4).
// Returns the block containing `now`, its due date (quarter end + 1 month + 7 days), and display labels.
function getCurrentTaxQuarter(now: Date, taxYearLabel: string) {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = now.getMonth();
  let index: number, startMonth: number;
  if (month >= 3 && month <= 5) { index = 1; startMonth = 3; }
  else if (month >= 6 && month <= 8) { index = 2; startMonth = 6; }
  else if (month >= 9 && month <= 11) { index = 3; startMonth = 9; }
  else { index = 4; startMonth = 0; }
  const year = now.getFullYear();
  const quarterEnd = new Date(year, startMonth + 3, 0);
  const dueDate = addMonthsToDate(quarterEnd, 1);
  dueDate.setDate(dueDate.getDate() + 7);
  return {
    label: `Q${index} ${taxYearLabel}`,
    rangeLabel: `${monthNames[startMonth]} - ${monthNames[startMonth + 2]} ${year}`,
    dueDate,
  };
}

// Clamps the day to the last real day of the month (e.g. day 31 in a 30-day month)
// so an invalid configured date can't silently roll into the next month.
function makeYearEndDate(year: number, monthIndex: number, day: number): Date {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return new Date(year, monthIndex, Math.min(day, lastDay));
}

// Builds a small set of accounting-period options (previous, most recently
// completed, and next) around today's date, based on the business's configured
// fiscal year end — replacing what used to be two permanently-fixed years.
function buildAccountingPeriodOptions(now: Date, fyMonth: number, fyDay: number): string[] {
  const monthIndex = fyMonth - 1;
  const thisYearEnd = makeYearEndDate(now.getFullYear(), monthIndex, fyDay);
  const mostRecentCompleted = thisYearEnd > now ? makeYearEndDate(now.getFullYear() - 1, monthIndex, fyDay) : thisYearEnd;
  const options = [
    new Date(mostRecentCompleted.getFullYear() - 1, monthIndex, mostRecentCompleted.getDate()),
    mostRecentCompleted,
    new Date(mostRecentCompleted.getFullYear() + 1, monthIndex, mostRecentCompleted.getDate()),
  ];
  return options
    .sort((a, b) => b.getTime() - a.getTime())
    .map((d) => `Year ending ${d.toLocaleDateString('en-GB')}`);
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

  // Corporation Tax financial year runs 1 April to 31 March
  const currentCtFinancialYear = month < 3
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

  // Current UK VAT/PAYE quarter and pay period, computed from today rather than fixed dates
  const vatQuarter = getCurrentTaxQuarter(today, currentTaxYear);
  const vatQuarterFullLabel = `${vatQuarter.label} (${vatQuarter.rangeLabel})`;
  const vatQuarterDueLabel = formatUkDate(vatQuarter.dueDate);

  const payePeriodDate = new Date(year, month - 1, 1);
  const payeMonthLabel = payePeriodDate.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
  const payeDueDate = new Date(year, month, 22);
  if (payeDueDate < today) payeDueDate.setMonth(payeDueDate.getMonth() + 1);
  const payeDueLabel = formatUkDate(payeDueDate);
  const payeTaxMonthNumber = ((payePeriodDate.getMonth() - 3 + 12) % 12) + 1;

  // Generic calendar-quarter labels for the "new return" period picker (current + previous quarter)
  const calQuarterLabel = `Q${Math.floor(month / 3) + 1} ${year}`;
  const prevCalQuarterDate = new Date(year, month - 3, 1);
  const prevCalQuarterLabel = `Q${Math.floor(prevCalQuarterDate.getMonth() / 3) + 1} ${prevCalQuarterDate.getFullYear()}`;

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
      const endingTaxYear = `${year - 1}/${String(year).slice(-2)}`;
      const startingTaxYear = `${year}/${String(year + 1).slice(-2)}`;
      events['5'] = { label: 'Year End', color: 'orange', fullTask: `End of Tax Year ${endingTaxYear}`, type: 'ANNUAL' };
      events['6'] = { label: 'New Year', color: 'green', fullTask: `Start of Tax Year ${startingTaxYear}`, type: 'ANNUAL' };
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  const makeQuickPDF = (title: string, rows: [string, string][], note?: string) => {
    const doc = new jsPDF();
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 38, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20); doc.setFont('helvetica', 'bold');
    doc.text('Okleevo', 14, 18);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text('Tax Report — For Accountant Submission to HMRC', 14, 28);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 52);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 14, 60);
    doc.setDrawColor(220); doc.line(14, 64, 196, 64);
    doc.setTextColor(0); doc.setFontSize(10);
    let y = 74;
    rows.forEach(([label, value], i) => {
      if (i % 2 === 0) { doc.setFillColor(248, 249, 250); doc.rect(14, y - 5, 182, 9, 'F'); }
      doc.setFont('helvetica', 'bold'); doc.text(label, 16, y);
      doc.setFont('helvetica', 'normal'); doc.text(value, 110, y);
      y += 10;
    });
    if (note) { doc.setFontSize(8); doc.setTextColor(130); doc.text(note, 14, y + 6); }
    doc.setFontSize(8); doc.setTextColor(130);
    doc.text('Okleevo | For accountant use only. Not an official HMRC submission.', 105, 285, { align: 'center' });
    doc.save(`Okleevo_${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const makeQuickExcel = (title: string, rows: [string, string][]) => {
    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [
      esc('Okleevo Tax Report'),
      esc(title),
      `${esc('Generated')},${esc(new Date().toLocaleDateString('en-GB'))}`,
      '',
      `${esc('Field')},${esc('Value')}`,
      ...rows.map(([label, value]) => `${esc(label)},${esc(value)}`),
      '',
      `${esc('Note')},${esc('For accountant use only. Not an official HMRC submission.')}`,
    ].join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Okleevo_${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedDownloadFormat, setSelectedDownloadFormat] = useState<'PDF' | 'Excel'>('PDF');
  const [selectedReportType, setSelectedReportType] = useState<'Self Assessment' | 'Corporation Tax' | 'VAT' | 'PAYE'>('Self Assessment');

  const [calculatedTax, setCalculatedTax] = useState(0);
  const [taxableIncome, setTaxableIncome] = useState('');
  const [showNewReturnModal, setShowNewReturnModal] = useState(false);
  const [newReturnStep, setNewReturnStep] = useState(1);
  const [newReturnData, setNewReturnData] = useState({
    type: '',
    period: vatQuarter.label,
    reference: '',
    turnover: '',
    expenses: '',
    notes: ''
  });
  const [ctProfit, setCtProfit] = useState('50000');
  const [ctPeriodOptions, setCtPeriodOptions] = useState<string[]>(() => buildAccountingPeriodOptions(new Date(), 3, 31));
  const [ctPeriod, setCtPeriod] = useState(() => buildAccountingPeriodOptions(new Date(), 3, 31)[1]);
  const [showCT600Modal, setShowCT600Modal] = useState(false);

  const ctProfitNumber = Number(ctProfit) || 0;
  const { tax: ctTax, rateLabel: ctRateLabel } = calculateCorporationTax(ctProfitNumber);
  const ctPeriodEndDate = parsePeriodEndDate(ctPeriod);
  const ctFilingDeadline = ctPeriodEndDate ? formatUkDate(addMonthsToDate(ctPeriodEndDate, 12)) : '—';
  const ctPaymentDeadlineDate = ctPeriodEndDate ? (() => {
    const d = addMonthsToDate(ctPeriodEndDate, 9);
    d.setDate(d.getDate() + 1);
    return d;
  })() : null;
  const ctPaymentDeadline = ctPaymentDeadlineDate ? formatUkDate(ctPaymentDeadlineDate) : '—';

  // Self Assessment States - Initialize with current tax year
  const [saTaxYear, setSaTaxYear] = useState(currentTaxYear);
  const [isSwitchingYear, setIsSwitchingYear] = useState(false);

  // Initial year data (generated once)
  const initialYearData: Record<string, { selfEmployment: number, employment: number, property: number, dividends: number, expenses: number }> = {};
  taxYearOptions.forEach((option) => {
    initialYearData[option.year] = {
      selfEmployment: 0,
      employment: 0,
      property: 0,
      dividends: 0,
      expenses: 0
    };
  });

  const [saYearData, setSaYearData] = useState<Record<string, {
    selfEmployment: number,
    employment: number,
    property: number,
    dividends: number,
    expenses: number
  }>>(initialYearData);

  const [taxSummary, setTaxSummary] = useState({
    corporationTax: 0,
    vatLiability: 0,
    payeNI: 0,
    totalTaxLiability: 0,
    taxPaid: 0,
    taxOutstanding: 0,
  });

  const [taxObligations, setTaxObligations] = useState<TaxObligation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaxData();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/business');
        if (!res.ok) return;
        const data = await res.json();
        const options = buildAccountingPeriodOptions(new Date(), data.fiscalYearEndMonth, data.fiscalYearEndDay);
        setCtPeriodOptions(options);
        setCtPeriod(options[1]);
      } catch { /* keep the UK-default period options */ }
    })();
  }, []);

  const fetchTaxData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/taxation');
      const data = await response.json();
      
      if (data.summary) {
        setTaxSummary(data.summary);
      }
      if (data.obligations) {
        setTaxObligations(data.obligations.map((o: TaxObligationResponse) => ({
          ...o,
          status: o.status as TaxObligation['status'],
          dueDate: new Date(o.dueDate)
        })));
      }
      if (data.selfAssessment) {
        setSaYearData(prev => ({
          ...prev,
          [currentTaxYear]: data.selfAssessment
        }));
      }
      if (data.details) {
        setCtProfit(data.details.profit.toString());
        // Net sales/purchases are already real (ex-VAT) figures from the API —
        // no need to reverse-derive them from a flat-rate guess anymore.
        setVatOutputSales(data.details.totalRevenue.toFixed(2));
        setVatInputPurchases(data.details.totalExpenses.toFixed(2));
        setRealOutputVAT(data.details.vatOutput);
        setRealInputVAT(data.details.vatInput);
        // details.totalAnnualSalary is a YEARLY figure (Employee.salary is annual);
        // payeGrossSalary feeds the monthly PAYE calculator below, so divide by 12.
        setPayeGrossSalary((data.details.totalAnnualSalary / 12).toFixed(2));
        setEmployeeCount(data.details.employeeCount || 0);
      }
    } catch (error) {
      console.error('Error fetching tax data:', error);
      showToast('Failed to load taxation data', 'error');
    } finally {
      setLoading(false);
    }
  };

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
  const [successDownloadFns, setSuccessDownloadFns] = useState<{ pdf?: () => void; excel?: () => void } | null>(null);
  const [pendingReportLog, setPendingReportLog] = useState<{ reportType: string; period: string; amount: number } | null>(null);
  const [editingSource, setEditingSource] = useState<{ id: string, name: string, value: number } | null>(null);

  interface TaxReportDownloadRecord { id: string; reportType: string; format: string; period: string; amount: number; createdAt: string }
  const [rtiReports, setRtiReports] = useState<TaxReportDownloadRecord[]>([]);
  const [vatReports, setVatReports] = useState<TaxReportDownloadRecord[]>([]);
  const [saReports, setSaReports] = useState<TaxReportDownloadRecord[]>([]);
  const [ctReports, setCtReports] = useState<TaxReportDownloadRecord[]>([]);

  const fetchReportsByType = async (reportType: string, setter: (records: TaxReportDownloadRecord[]) => void) => {
    try {
      const res = await fetch(`/api/taxation/reports?type=${reportType}`);
      if (!res.ok) return;
      setter(await res.json());
    } catch { /* leave existing list on failure */ }
  };
  const fetchRtiReports = () => fetchReportsByType('PAYE_RTI', setRtiReports);
  const fetchVatReports = () => fetchReportsByType('VAT', setVatReports);
  const fetchSaReports = () => fetchReportsByType('SELF_ASSESSMENT', setSaReports);
  const fetchCtReports = () => fetchReportsByType('CORPORATION_TAX', setCtReports);

  useEffect(() => {
    fetchRtiReports();
    fetchVatReports();
    fetchSaReports();
    fetchCtReports();
  }, []);

  const logReportDownload = async (format: 'PDF' | 'Excel') => {
    if (!pendingReportLog) return;
    try {
      await fetch('/api/taxation/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pendingReportLog, format }),
      });
      if (pendingReportLog.reportType === 'PAYE_RTI') fetchRtiReports();
      if (pendingReportLog.reportType === 'VAT') fetchVatReports();
      if (pendingReportLog.reportType === 'SELF_ASSESSMENT') fetchSaReports();
      if (pendingReportLog.reportType === 'CORPORATION_TAX') fetchCtReports();
    } catch { /* download already happened locally; logging is best-effort */ }
    setPendingReportLog(null);
  };
  
  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(today.getDate());
  
  // PAYE & NI States
  const [showPAYECalculatorModal, setShowPAYECalculatorModal] = useState(false);
  const [showRTIModal, setShowRTIModal] = useState(false);
  const [payeGrossSalary, setPayeGrossSalary] = useState('3500');
  const [payeTaxCode, setPayeTaxCode] = useState('1257L');
  const [employeeCount, setEmployeeCount] = useState(0);
  
  // VAT States
  const [showVATReturnModal, setShowVATReturnModal] = useState(false);
  const [showVATHistoryModal, setShowVATHistoryModal] = useState(false);
  // vatOutputSales/vatInputPurchases are net sales/purchases (ex-VAT), always
  // fetched from real invoice/expense data — read-only, no manual entry, so
  // there's no gap between what's recorded and what's shown here.
  const [vatOutputSales, setVatOutputSales] = useState('0');
  const [vatInputPurchases, setVatInputPurchases] = useState('0');
  // The real VAT amounts (not net-sales * flat rate) — each invoice/expense
  // may use a different rate (20%/5%/0%), so this can't be derived by
  // multiplying the net totals above by a single rate.
  const [realOutputVAT, setRealOutputVAT] = useState(0);
  const [realInputVAT, setRealInputVAT] = useState(0);
  const [showCGTCalculatorModal, setShowCGTCalculatorModal] = useState(false);
  const [cgtDisposalValue, setCgtDisposalValue] = useState('50000');
  const [cgtAcquisitionCost, setCgtAcquisitionCost] = useState('35000');
  const [cgtAllowableExpenses, setCgtAllowableExpenses] = useState('2000');
  const [cgtAssetType, setCgtAssetType] = useState<'standard' | 'badr'>('standard');
  // Standard-rate CGT depends on whether the gain falls in the basic or higher/additional
  // rate band — this tool doesn't know the user's other income, so it must ask rather
  // than silently assume higher rate for everyone.
  const [cgtIncomeBand, setCgtIncomeBand] = useState<'basic' | 'higher'>('higher');
  
  // MTD States
  const [showMTDLearnMoreModal, setShowMTDLearnMoreModal] = useState(false);
  const [showFilingGuideModal, setShowFilingGuideModal] = useState(false);

  
  // UK_TAX_RATES, calculateMonthlyPAYE, calculateEmployeeNI, calculateEmployerNI,
  // and calculateSelfAssessmentTaxDue now live in @/lib/tax/uk-tax — shared with
  // the API route so these figures agree everywhere they're shown.

  // Real PAYE/NI figures for the current month, derived from actual payroll data
  // (payeGrossSalary is the aggregate monthly salary across active employees, fetched from the API)
  const payeAnnualSalary = parseFloat(payeGrossSalary) * 12 || 0;
  const currentMonthlyPAYE = calculateMonthlyPAYE(payeAnnualSalary);
  const currentMonthlyEmployeeNI = calculateEmployeeNI(payeAnnualSalary);
  const currentMonthlyEmployerNI = calculateEmployerNI(payeAnnualSalary);
  const currentMonthlyNIDue = currentMonthlyEmployeeNI + currentMonthlyEmployerNI;
  const currentMonthlyTotalDue = currentMonthlyPAYE + currentMonthlyNIDue;

  const totalIncome = saSelfEmployment + saEmployment + saProperty + saDividends;
  // Personal Allowance tapers to $0 for income over $100k — applies here too, not just PAYE.
  const personalAllowance = taperedPersonalAllowance(totalIncome);
  const taxableIncomeValue = Math.max(0, totalIncome - personalAllowance - saExpenses);
  const totalTaxDueValue = calculateSelfAssessmentTaxDue(taxableIncomeValue);

  // Next upcoming Self Assessment statutory deadlines, computed relative to
  // today rather than hardcoded — these must never show a date already in the past.
  const nextAnnualDeadline = (month: number, day: number) => {
    const candidate = new Date(today.getFullYear(), month, day);
    return candidate >= today ? candidate : new Date(today.getFullYear() + 1, month, day);
  };
  const saPaperReturnDeadline = nextAnnualDeadline(9, 31); // 31 October
  const saOnlineReturnDeadline = nextAnnualDeadline(0, 31); // 31 January
  const saPaymentDeadline = saOnlineReturnDeadline; // Balancing payment is due the same date as the online return

  // "New Return" wizard's Step 4 liability estimate — type-aware. Turnover/Expenses
  // only make sense as a profit base for Corporation Tax and VAT; PAYE and Self
  // Assessment liability come from the real calculators/data already on their tabs.
  const newReturnEstimatedLiability = (type: string, turnover: string, expenses: string): number => {
    const netProfit = Math.max(0, Number(turnover) - Number(expenses));
    if (type === 'PAYE & NI') return currentMonthlyTotalDue;
    if (type === 'Self Assessment') return totalTaxDueValue;
    if (type === 'VAT Return') return netProfit * 0.20;
    return calculateCorporationTax(netProfit).tax; // Corporation Tax (default)
  };

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

  // Data is now handled by state and fetched from API

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
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8">
      <TourProvider moduleId="taxation" steps={taxationTourSteps} />
      {/* ── Sticky Header ────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-2xs">
        <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
              <FileText className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 leading-tight truncate">
                  UK Taxation &amp; HMRC Compliance
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                  Digital Record-Keeping
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                Corporation tax (CT600), VAT, Self Assessment &amp; PAYE records
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
            <ModuleGuideBanner
              moduleId="taxation"
              moduleName="UK Taxation"
              summary="Manage Corporation Tax, Self Assessment, PAYE & NI, VAT, and Tax Deadlines."
              tips={[
                "Export Self Assessment & Corporation Tax computation reports",
                "Track HMRC filing deadlines in the Tax Calendar",
                "Prepare digital records for Making Tax Digital (MTD)"
              ]}
            />
            <button
              id="tour-taxation-export"
              onClick={() => { setSelectedReportType('Self Assessment'); setShowDownloadModal(true); }}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0"
            >
              <Download className="w-4 h-4 cursor-pointer" />
              <span className="hidden sm:inline cursor-pointer">Export</span>
            </button>
            <button
              id="tour-taxation-new-return"
              onClick={() => setShowNewReturnModal(true)}
              className="px-3 sm:px-3.5 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/20 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 cursor-pointer" />
              <span>New Return</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 pt-4">
        <div id="tour-taxation-stats" className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: 'Corporation Tax',
              badge: 'CT600 Estimate',
              value: taxSummary.corporationTax.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              icon: Building2,
              iconCls: 'bg-indigo-50 text-indigo-600 border-indigo-100',
            },
            {
              label: 'VAT Liability',
              badge: 'MTD Return',
              value: taxSummary.vatLiability.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              icon: Receipt,
              iconCls: 'bg-purple-50 text-purple-600 border-purple-100',
            },
            {
              label: 'PAYE & NI',
              badge: 'Payroll Tax',
              value: taxSummary.payeNI.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              icon: Users,
              iconCls: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            },
            {
              label: 'Outstanding',
              badge: taxSummary.taxOutstanding > 0 ? 'Action Required' : 'Up to Date',
              value: taxSummary.taxOutstanding.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              icon: AlertCircle,
              iconCls: taxSummary.taxOutstanding > 0 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-600 border-slate-100',
            },
          ].map(({ label, badge, value, icon: Icon, iconCls }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className={`p-2 rounded-xl border ${iconCls} transition-transform group-hover:scale-105 shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 truncate max-w-[100px]">
                  {badge}
                </span>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">{label}</p>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mt-0.5 truncate font-mono sm:font-sans">{value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* ── Zero-State Onboarding Context Banner ── */}
        {taxSummary.corporationTax === 0 && taxSummary.vatLiability === 0 && taxSummary.payeNI === 0 && taxSummary.taxOutstanding === 0 && (
          <div className="mt-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100/80 text-emerald-700 rounded-xl shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950">No tax liabilities recorded yet</p>
                <p className="text-xs text-emerald-800/90 mt-0.5">
                  Figures compute automatically as you issue invoices, log business expenses, or record staff payroll.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/dashboard/invoicing"
                className="px-3 py-1.5 bg-white border border-emerald-200 hover:border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold transition-all shadow-2xs hover:shadow-xs"
              >
                + Create Invoice
              </Link>
              <Link
                href="/dashboard/hr-records"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs hover:shadow-xs"
              >
                Run Payroll →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── HMRC Disclaimer Banner ── */}
      <div id="tour-taxation-disclaimer" className="mx-4 sm:mx-6 mt-3.5 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <p className="text-xs font-bold text-slate-900">UK HMRC Compliance &amp; Computation Notice</p>
              <span className="px-2 py-0.5 bg-emerald-100/70 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200/70">
                Accountant &amp; HMRC Ready
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Okleevo calculates statutory tax figures for your UK SME. Download your generated tax computation packs and share with your chartered accountant for official HMRC submission.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowFilingGuideModal(true)}
          className="shrink-0 px-3.5 py-2 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Info className="w-3.5 h-3.5" /> How do I actually file this?
        </button>
      </div>

      {/* ── Tab Bar ──────────────────────────────────────────────────── */}
      <div id="tour-taxation-tabs" className="sticky top-[57px] sm:top-[65px] z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 shadow-2xs mt-3">
        <div className="flex overflow-x-auto scrollbar-none px-4 sm:px-6 gap-1">
          {tabs.map(({ id, name, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer shrink-0 ${
                  active
                    ? "border-emerald-600 text-emerald-700 bg-emerald-50/60 shadow-2xs"
                    : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                <Icon className={`w-4 h-4 cursor-pointer transition-colors ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="cursor-pointer">{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ──────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="min-h-[400px]"
        >
          {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Upcoming Tax Obligations */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-5 flex items-center gap-2 tracking-tight">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              {loading ? 'Loading Obligations...' : 'Upcoming UK Statutory Tax Obligations'}
            </h2>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-gray-500 font-medium text-xs">Calculating your tax position...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {taxObligations.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                    <p className="text-gray-500 text-xs font-medium">No upcoming tax obligations found.</p>
                  </div>
                ) : (
                  taxObligations.map((obligation) => {
                    const isCT = obligation.type.toLowerCase().includes('corporation');
                    const isVAT = obligation.type.toLowerCase().includes('vat');
                    const Icon = isCT ? Building2 : isVAT ? Receipt : Users;
                    const iconBg = isCT ? 'from-blue-500 to-indigo-600' : isVAT ? 'from-purple-500 to-indigo-600' : 'from-emerald-500 to-teal-600';
                    const targetTab = isCT ? 'corporation-tax' : isVAT ? 'vat' : 'paye';

                    return (
                      <div
                        key={obligation.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50/80 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 rounded-2xl hover:bg-gray-100/80 dark:hover:bg-slate-800 transition-all group"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`p-3 bg-gradient-to-br ${iconBg} rounded-xl text-white shadow-xs group-hover:scale-105 transition-transform`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-extrabold text-sm text-gray-900 dark:text-white tracking-tight">{obligation.type}</p>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                obligation.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300' :
                                obligation.status === 'overdue' ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300' :
                                'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}>
                                {obligation.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{obligation.description}</p>
                            <p className="text-[11px] font-medium text-gray-400 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3 text-indigo-500" />
                              Due: <span className="font-semibold text-gray-700 dark:text-gray-300">{obligation.dueDate.toLocaleDateString('en-GB')}</span> • {obligation.period}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200/60 dark:border-slate-700">
                          <p className="text-lg font-black text-gray-900 dark:text-white tracking-tight">${obligation.amount.toLocaleString()}</p>
                          <button
                            onClick={() => setActiveTab(targetTab)}
                            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-all shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95 whitespace-nowrap"
                          >
                            <span>Manage</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <button className="p-5 sm:p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 transition-colors text-left cursor-pointer">
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 w-fit mb-3">
                <Calculator className="w-5 h-5 text-gray-500" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Calculate Corporation Tax</h3>
              <p className="text-xs text-gray-500">Estimate your CT liability for the year</p>
            </button>

            <button onClick={() => setActiveTab('vat')} className="p-5 sm:p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 transition-colors text-left cursor-pointer">
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 w-fit mb-3">
                <Receipt className="w-5 h-5 text-gray-500" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Prepare VAT Return</h3>
              <p className="text-xs text-gray-500">Calculate &amp; download for your accountant</p>
            </button>

            <button onClick={() => setActiveTab('paye')} className="p-5 sm:p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 transition-colors text-left cursor-pointer">
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 w-fit mb-3">
                <Users className="w-5 h-5 text-gray-500" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Prepare PAYE Report</h3>
              <p className="text-xs text-gray-500">Calculate PAYE/NI &amp; download for accountant</p>
            </button>
          </div>

          {/* Accountant Handoff Banner */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <Download className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Download &amp; Share with Your Accountant</h2>
                <p className="text-sm text-gray-500">Okleevo prepares your figures — your accountant files them with HMRC</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowDownloadModal(true)}
                className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Download Tax Reports
              </button>
              <button
                onClick={() => setShowMTDLearnMoreModal(true)}
                className="px-5 py-2.5 bg-gray-100 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                About MTD Requirements
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'corporation-tax' && (
        <div className="space-y-5">
          {/* Executive Calculator Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  UK Corporation Tax (CT600) Calculator
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Calculate UK limited company tax liability and marginal relief post-April 2023</p>
              </div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-extrabold rounded-full border border-indigo-200/60 w-fit">
                FY {currentCtFinancialYear} Rules
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Accounting Period</label>
                  <select
                    value={ctPeriod}
                    onChange={(e) => setCtPeriod(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    {ctPeriodOptions.map((opt) => <option key={opt}>{opt}</option>)}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Taxable Company Profit ($)</label>
                    <div className="flex items-center gap-1">
                      {[10000, 50000, 100000, 250000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setCtProfit(preset.toString())}
                          className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                        >
                          ${(preset / 1000).toFixed(0)}k
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="number"
                    placeholder="50000"
                    value={ctProfit}
                    onChange={(e) => setCtProfit(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-extrabold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Statutory Deadlines Summary */}
              <div className="bg-gray-50/90 dark:bg-slate-800/60 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 mb-2">
                    <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Statutory UK CT Deadlines
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">HMRC Tax Payment Due (9m + 1d):</span>
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{ctPaymentDeadline}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">CT600 Return Filing Due (12m):</span>
                      <span className="font-extrabold text-gray-900 dark:text-white">{ctFilingDeadline}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 leading-tight">
                  Rate applied: <strong className="text-gray-700 dark:text-gray-200">{ctRateLabel}</strong>
                </p>
              </div>
            </div>

            {/* Estimated Tax Result Banner */}
            <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-indigo-100 uppercase tracking-wider mb-1">Estimated Corporation Tax Liability</p>
                <p className="text-3xl sm:text-4xl font-black tracking-tight">${ctTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-indigo-200 mt-1">Effective Rate: {ctRateLabel}</p>
              </div>

              <button
                onClick={() => setShowCT600Modal(true)}
                className="px-6 py-3 bg-white hover:bg-gray-100 text-indigo-950 font-extrabold text-xs rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
              >
                <FileCheck className="w-4 h-4 text-indigo-600" />
                Generate CT600 Computation (PDF)
              </button>
            </div>
          </div>

          {/* Dynamic HMRC Tax Bracket Visualizer */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              UK Corporation Tax Rate Brackets ({currentCtFinancialYear})
            </h3>

            <div className="space-y-3">
              {/* Small Profits Rate */}
              {(() => {
                const isMatch = ctProfitNumber > 0 && ctProfitNumber <= 50000;
                return (
                  <div className={`p-4 rounded-2xl border transition-all ${
                    isMatch
                      ? "bg-emerald-50/90 border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-700 shadow-xs"
                      : "bg-blue-50/50 border-blue-100/80 dark:bg-slate-800/40 dark:border-slate-800"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-sm text-gray-900 dark:text-white">Small Profits Rate</p>
                          {isMatch && (
                            <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-extrabold rounded-full">
                              YOUR BRACKET ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Profits up to $50,000</p>
                      </div>
                      <span className="text-2xl font-black text-blue-600 dark:text-blue-400">19%</span>
                    </div>
                  </div>
                );
              })()}

              {/* Marginal Relief */}
              {(() => {
                const isMatch = ctProfitNumber > 50000 && ctProfitNumber < 250000;
                return (
                  <div className={`p-4 rounded-2xl border transition-all ${
                    isMatch
                      ? "bg-purple-50/90 border-purple-300 dark:bg-purple-950/60 dark:border-purple-700 shadow-xs"
                      : "bg-purple-50/40 border-purple-100/80 dark:bg-slate-800/40 dark:border-slate-800"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-sm text-gray-900 dark:text-white">Marginal Relief Taper</p>
                          {isMatch && (
                            <span className="px-2 py-0.5 bg-purple-600 text-white text-[10px] font-extrabold rounded-full">
                              YOUR BRACKET ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Profits between $50,001 and $250,000 (Tapered 19% - 25%)</p>
                      </div>
                      <span className="text-2xl font-black text-purple-600 dark:text-purple-400">19-25%</span>
                    </div>
                  </div>
                );
              })()}

              {/* Main Rate */}
              {(() => {
                const isMatch = ctProfitNumber >= 250000;
                return (
                  <div className={`p-4 rounded-2xl border transition-all ${
                    isMatch
                      ? "bg-rose-50/90 border-rose-300 dark:bg-rose-950/60 dark:border-rose-700 shadow-xs"
                      : "bg-rose-50/40 border-rose-100/80 dark:bg-slate-800/40 dark:border-slate-800"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-sm text-gray-900 dark:text-white">Main Rate</p>
                          {isMatch && (
                            <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-extrabold rounded-full">
                              YOUR BRACKET ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Profits over $250,000</p>
                      </div>
                      <span className="text-2xl font-black text-rose-600 dark:text-rose-400">25%</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'self-assessment' && (
        <div className="space-y-5">
          {/* Executive Self Assessment Header */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  UK Self Assessment (SA100) Tax Portal
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Individual tax computation for UK sole traders, company directors, and property landlords</p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    setNewReturnData({ ...newReturnData, type: 'Self Assessment' });
                    setNewReturnStep(2);
                    setShowNewReturnModal(true);
                  }}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Start New Return
                </button>
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  View Previous Returns
                </button>
              </div>
            </div>

            {/* Live Personal Tax Summary Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-purple-50/80 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300">Tax-Free Personal Allowance</p>
                  <p className="text-xl font-black text-purple-950 dark:text-white tracking-tight">$12,570</p>
                </div>
                <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>

              <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300">Total Taxable Income</p>
                  <p className="text-xl font-black text-blue-950 dark:text-white tracking-tight">${totalIncome.toLocaleString()}</p>
                </div>
                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Est. Tax &amp; Class 4 NI</p>
                  <p className="text-xl font-black text-emerald-950 dark:text-white tracking-tight">
                    ${totalTaxDueValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Tax Year Selection, Calendar & HMRC Thresholds Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Column 1: Mini Datepicker Calendar */}
              <div className="bg-gray-50/80 dark:bg-slate-800/60 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Tax Calendar
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        if (calendarMonth === 0) {
                          setCalendarMonth(11);
                          setCalendarYear(calendarYear - 1);
                        } else {
                          setCalendarMonth(calendarMonth - 1);
                        }
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
                    >
                      ‹
                    </button>
                    <span className="text-xs font-extrabold text-gray-900 dark:text-white">
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
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
                    >
                      ›
                    </button>
                  </div>
                </div>

                {/* Day Names */}
                <div className="grid grid-cols-7 gap-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="text-center text-[10px] font-bold text-gray-400 py-0.5">{d}</div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: new Date(calendarYear, calendarMonth, 1).getDay() }, (_, i) => (
                    <div key={`e-${i}`} className="h-6"></div>
                  ))}
                  {Array.from({ length: new Date(calendarYear, calendarMonth + 1, 0).getDate() }, (_, i) => {
                    const dayNum = i + 1;
                    const isToday = dayNum === today.getDate() && calendarMonth === today.getMonth() && calendarYear === today.getFullYear();
                    const isTaxDay = dayNum === 19 || dayNum === 22 || (dayNum === 31 && (calendarMonth === 0 || calendarMonth === 6));

                    return (
                      <div
                        key={dayNum}
                        onClick={() => setSelectedCalendarDay(dayNum)}
                        className={`h-6 flex items-center justify-center text-[11px] rounded-lg cursor-pointer transition-colors ${
                          isToday
                            ? 'bg-purple-600 text-white font-black shadow-xs'
                            : isTaxDay
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 font-extrabold'
                              : selectedCalendarDay === dayNum
                                ? 'bg-purple-100 text-purple-900 dark:bg-purple-900/60 dark:text-purple-200 font-bold'
                                : 'hover:bg-gray-200/60 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium'
                        }`}
                      >
                        {dayNum}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    setCalendarMonth(today.getMonth());
                    setCalendarYear(today.getFullYear());
                    setSelectedCalendarDay(today.getDate());
                  }}
                  className="w-full py-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-center"
                >
                  Reset to Today
                </button>
              </div>

              {/* Column 2: UK Statutory Allowances & Bands */}
              <div className="bg-gray-50/80 dark:bg-slate-800/60 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                <h3 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Tax Rates &amp; Thresholds (2025/26)
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Personal Allowance:</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">Up to $12,570 (0%)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Basic Rate (20%):</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">$12,571 - $50,270</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Higher Rate (40%):</span>
                    <span className="font-extrabold text-amber-600 dark:text-amber-400">$50,271 - $125,140</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Additional Rate (45%):</span>
                    <span className="font-extrabold text-rose-600 dark:text-rose-400">Over $125,140</span>
                  </div>
                </div>
              </div>

              {/* Column 3: Tax Year Selector */}
              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Select Active Tax Year
                  </h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    {taxYearOptions.map((item) => {
                      const active = saTaxYear === item.year;
                      return (
                        <button
                          key={item.year}
                          onClick={() => {
                            if (saTaxYear !== item.year) {
                              setIsSwitchingYear(true);
                              setSaTaxYear(item.year);
                              setTimeout(() => setIsSwitchingYear(false), 400);
                            }
                          }}
                          className={`p-3 border rounded-2xl text-left cursor-pointer transition-all flex items-center justify-between ${
                            active
                              ? 'border-purple-500 bg-purple-50/90 dark:bg-purple-950/60 shadow-xs'
                              : 'border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 hover:border-purple-300'
                          }`}
                        >
                          <div>
                            <p className={`font-black text-xs ${active ? 'text-purple-950 dark:text-white' : 'text-gray-900 dark:text-gray-200'}`}>{item.year}</p>
                            <p className={`text-[10px] ${active ? 'text-purple-700 dark:text-purple-300 font-extrabold' : 'text-gray-400'}`}>{item.label}</p>
                          </div>
                          {active && (
                            <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 bg-purple-50/60 dark:bg-slate-800/60 rounded-2xl border border-purple-100 dark:border-slate-800 text-[11px]">
                  <p className="text-purple-900 dark:text-purple-200 font-bold">
                    Period ({saTaxYear}): <span className="font-normal text-purple-700 dark:text-purple-300">6 Apr {saTaxYear.split('/')[0]} – 5 Apr 20{saTaxYear.split('/')[1]}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Income Sources */}
          <div className={`transition-all duration-300 ${isSwitchingYear ? 'opacity-30 blur-sm translate-y-2' : 'opacity-100 translate-y-0'}`}>
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Income Sources</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                onClick={() => { setEditingSource({ id: 'self-employment', name: 'Self-Employment', value: saSelfEmployment }); setShowEditIncomeModal(true); }}
                className="p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-blue-50/50 hover:border-blue-200 hover:shadow-lg transition-all group cursor-pointer"
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
                <p className="text-2xl font-bold text-blue-900">${saSelfEmployment.toLocaleString()}</p>
                <button className="mt-3 w-full px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm cursor-pointer">
                  Edit Details
                </button>
              </div>

              <div 
                onClick={() => { setEditingSource({ id: 'employment', name: 'Employment Income', value: saEmployment }); setShowEditIncomeModal(true); }}
                className="p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-green-50/50 hover:border-green-200 hover:shadow-lg transition-all group cursor-pointer"
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
                <p className="text-2xl font-bold text-green-900">${saEmployment.toLocaleString()}</p>
                <button className="mt-3 w-full px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors shadow-sm cursor-pointer">
                  Edit Details
                </button>
              </div>

              <div 
                onClick={() => { setEditingSource({ id: 'property', name: 'Property Income', value: saProperty }); setShowEditIncomeModal(true); }}
                className="p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-purple-50/50 hover:border-purple-200 hover:shadow-lg transition-all group cursor-pointer"
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
                <p className="text-2xl font-bold text-purple-900">${saProperty.toLocaleString()}</p>
                <button className="mt-3 w-full px-4 py-2 bg-purple-500 text-white text-sm font-semibold rounded-lg hover:bg-purple-600 transition-colors shadow-sm cursor-pointer">
                  Edit Details
                </button>
              </div>

              <div 
                onClick={() => { setEditingSource({ id: 'dividends', name: 'Dividends & Interest', value: saDividends }); setShowEditIncomeModal(true); }}
                className="p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-orange-50/50 hover:border-orange-200 hover:shadow-lg transition-all group cursor-pointer"
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
                <p className="text-2xl font-bold text-orange-900">${saDividends.toLocaleString()}</p>
                <button className="mt-3 w-full px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm cursor-pointer">
                  Edit Details
                </button>
              </div>
            </div>
          </div>
          </div>

          {/* Tax Calculation */}
          <div className={`transition-all duration-300 delay-75 ${isSwitchingYear ? 'opacity-30 blur-sm translate-y-2' : 'opacity-100 translate-y-0'}`}>
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-purple-600" />
              Tax Calculation Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all cursor-pointer">
                <span className="text-gray-700">Total Income</span>
                <span className="font-bold text-gray-900">${totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all cursor-pointer">
                <span className="text-gray-700">Personal Allowance</span>
                <span className="font-bold text-gray-900">-${personalAllowance.toLocaleString()}</span>
              </div>
              <div 
                onClick={() => { setEditingSource({ id: 'expenses', name: 'Allowable Expenses', value: saExpenses }); setShowEditIncomeModal(true); }}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all cursor-pointer"
              >
                <span className="text-gray-700">Allowable Expenses</span>
                <span className="font-bold text-gray-900">-${saExpenses.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors cursor-pointer">
                <span className="font-semibold text-blue-900">Taxable Income</span>
                <span className="font-bold text-blue-900 text-xl">${taxableIncomeValue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-100 hover:border-purple-200 transition-colors cursor-pointer">
                <div>
                  <p className="font-semibold text-purple-900">Total Tax Due</p>
                  <p className="text-xs text-purple-700">Including NI contributions</p>
                </div>
                <span className="font-bold text-purple-900 text-3xl">${totalTaxDueValue.toLocaleString()}</span>
              </div>
            </div>
          </div>
          </div>

          {/* Important Deadlines */}
          <div className={`transition-all duration-300 delay-150 ${isSwitchingYear ? 'opacity-30 blur-sm translate-y-2' : 'opacity-100 translate-y-0'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-100 rounded-xl p-5 hover:border-red-200 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h3 className="font-bold text-red-900">Key Deadlines</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-800">Paper return</span>
                  <span className="font-bold text-red-900">{saPaperReturnDeadline.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-800">Online return</span>
                  <span className="font-bold text-red-900">{saOnlineReturnDeadline.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-800">Payment due</span>
                  <span className="font-bold text-red-900">{saPaymentDeadline.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            <div className={`border rounded-xl p-5 transition-colors cursor-pointer ${
              saProgress === 100 ? 'bg-green-50 border-green-100 hover:border-green-200' : 'bg-amber-50 border-amber-100 hover:border-amber-200'
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
                  {saProgress === 100 ? 'Review & Download' : 'Continue Return'}
                </button>
              </div>
            </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setShowCalculatorModal(true)}
              className="p-5 bg-white border border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-center cursor-pointer group"
            >
              <Calculator className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 text-sm">Tax Calculator</p>
            </button>
            <button 
              onClick={() => setShowDownloadModal(true)}
              className="p-5 bg-white border border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-center cursor-pointer group"
            >
              <Download className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 text-sm">Download SA100</p>
            </button>
            <button
              onClick={() => setShowDownloadModal(true)}
              className="p-5 bg-white border border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-center cursor-pointer group"
            >
              <Download className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 text-sm">Download for Accountant</p>
            </button>
          </div>
        </div>
      )}

      {/* Tax Calculator Modal */}
      {showCalculatorModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 sm:p-4 pb-12 sm:pb-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85dvh] flex flex-col border border-white/50 transform animate-in slide-in-from-bottom-10 duration-300">
            <div className="bg-linear-to-r from-purple-600 to-pink-600 p-5 rounded-t-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Calculator className="w-6 h-6" />
                  </div>
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
                  Enter Your Taxable Income ($)
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
                    showToast('Please enter a valid income amount', 'error');
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
                className="w-full px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-xl transition-all cursor-pointer shadow-lg"
              >
                Calculate Tax
              </button>

              {calculatedTax > 0 && (
                <div className="bg-linear-to-br from-purple-50/50 to-pink-50/50 border border-purple-200/50 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="font-bold text-purple-900 mb-4 text-center">Your Tax Calculation</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                      <span className="text-gray-700">Taxable Income</span>
                      <span className="font-bold text-gray-900">${parseFloat(taxableIncome).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-purple-100/50 rounded-lg">
                      <div>
                        <p className="font-bold text-purple-900">Total Tax & NI Due</p>
                        <p className="text-xs text-purple-700">Income Tax + Class 4 NI</p>
                      </div>
                      <span className="font-bold text-purple-900 text-3xl">${calculatedTax.toLocaleString()}</span>
                    </div>
                    <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-3">
                      <p className="text-xs text-blue-800">
                        <strong>Payment Schedule:</strong><br/>
                        • 1st Payment on Account: 31 Jan 2025 (${Math.round(calculatedTax / 2).toLocaleString()})<br/>
                        • 2nd Payment on Account: 31 Jul 2025 (${Math.round(calculatedTax / 2).toLocaleString()})
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

      {showDownloadModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-xl max-h-[85dvh] flex flex-col border border-gray-200 transform animate-in slide-in-from-bottom-10 duration-300">

            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Download className="w-4 h-4 text-blue-600" />
                </div>
                Export Tax Reports
              </h2>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>


            <div className="p-5 space-y-4 overflow-y-auto">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Select Report Type</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Self Assessment', 'Corporation Tax', 'VAT', 'PAYE'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedReportType(type)}
                      className={`px-3 py-2.5 border rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        selectedReportType === type
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-500 mb-2.5 text-xs uppercase tracking-wide">{selectedReportType} Details</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {selectedReportType === 'Self Assessment' ? (
                    <>
                      <div className="flex justify-between border-b border-gray-200 pb-1.5">
                        <span className="text-gray-500">Tax Year</span>
                        <span className="font-semibold text-gray-900">{saTaxYear}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1.5">
                        <span className="text-gray-500">Total Tax</span>
                        <span className="font-semibold text-gray-900">${totalTaxDueValue.toLocaleString()}</span>
                      </div>
                    </>
                  ) : selectedReportType === 'Corporation Tax' ? (
                    <>
                      <div className="flex justify-between border-b border-gray-200 pb-1.5">
                        <span className="text-gray-500">Period</span>
                        <span className="font-semibold text-gray-900">{ctPeriod}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1.5">
                        <span className="text-gray-500">Est. Tax</span>
                        <span className="font-semibold text-gray-900">${ctTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                    </>
                  ) : selectedReportType === 'VAT' ? (
                    <>
                      <div className="flex justify-between border-b border-gray-200 pb-1.5">
                        <span className="text-gray-500">VAT Period</span>
                        <span className="font-semibold text-gray-900">{vatQuarter.label}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1.5">
                        <span className="text-gray-500">Payable</span>
                        <span className="font-semibold text-gray-900">${Math.max(0, realOutputVAT - realInputVAT).toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between border-b border-gray-200 pb-1.5">
                        <span className="text-gray-500">Month</span>
                        <span className="font-semibold text-gray-900">{payeMonthLabel}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1.5">
                        <span className="text-gray-500">HMRC Total</span>
                        <span className="font-semibold text-gray-900">${currentMonthlyTotalDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-500 mb-2.5 text-xs uppercase tracking-wide">Select Download Format</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(['PDF', 'Excel'] as const).map((format) => (
                    <button
                      key={format}
                      onClick={() => setSelectedDownloadFormat(format)}
                      className={`p-3.5 border rounded-lg transition-colors cursor-pointer flex items-center gap-3 ${
                        selectedDownloadFormat === format
                          ? 'border-blue-500 bg-blue-50/60'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${format === 'PDF' ? 'bg-red-50' : 'bg-green-50'}`}>
                        <FileText className={`w-5 h-5 ${format === 'PDF' ? 'text-red-600' : 'text-green-600'}`} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm text-gray-900">{format}</p>
                        <p className="text-xs text-gray-400">{format === 'PDF' ? 'Formatted report' : 'Opens in Excel (.csv)'}</p>
                      </div>
                      {selectedDownloadFormat === format && <CheckCircle className="w-4 h-4 text-blue-600 ml-auto shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ready to Download Display */}
              <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide mb-0.5">Ready to Download</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedReportType} • {selectedDownloadFormat}
                    </p>
                  </div>
                  <FileText className={`w-5 h-5 ${selectedDownloadFormat === 'PDF' ? 'text-red-600' : 'text-green-600'}`} />
                </div>
              </div>

              {/* Download Features List */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5">
                <div className="flex gap-3">
                  <CheckCircle className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-500 mb-1 text-xs uppercase tracking-wide">Features</p>
                    <ul className="text-xs text-gray-600 grid grid-cols-2 gap-x-4 gap-y-1">
                      <li>HMRC-compliant</li>
                      <li>Income breakdown</li>
                      <li>Payment schedule</li>
                      <li>Record-keeping</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="flex-1 px-5 py-2.5 border border-gray-200 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const reportName = selectedReportType.split(' ').join('_');
                    const date = new Date().toISOString().split('T')[0];
                    const filename = `Okleevo_${reportName}_${date}`;

                    if (selectedDownloadFormat === 'PDF') {
                      const doc = new jsPDF();
                      doc.setFillColor(37, 99, 235);
                      doc.rect(0, 0, 210, 38, 'F');
                      doc.setTextColor(255, 255, 255);
                      doc.setFontSize(20); doc.setFont('helvetica', 'bold');
                      doc.text('Okleevo', 14, 18);
                      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
                      doc.text('Tax Report — For Accountant Submission to HMRC', 14, 28);
                      doc.setTextColor(0, 0, 0);
                      doc.setFontSize(15); doc.setFont('helvetica', 'bold');
                      doc.text(`${selectedReportType.toUpperCase()} REPORT`, 14, 52);
                      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100);
                      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}  |  Prepared for accountant review and HMRC filing.`, 14, 60);
                      doc.setDrawColor(220); doc.line(14, 64, 196, 64);
                      doc.setTextColor(0);
                      let y = 76;
                      const row = (label: string, value: string) => { doc.setFont('helvetica', 'bold'); doc.text(label, 14, y); doc.setFont('helvetica', 'normal'); doc.text(value, 110, y); y += 9; };
                      doc.setFontSize(10);
                      if (selectedReportType === 'Self Assessment') {
                        row('Tax Year:', saTaxYear);
                        row('Self-Employment Income (SA103):', `GBP ${saSelfEmployment.toLocaleString()}`);
                        row('Employment Income (SA102):', `GBP ${saEmployment.toLocaleString()}`);
                        row('UK Property Income (SA105):', `GBP ${saProperty.toLocaleString()}`);
                        row('Dividends & Interest (SA100):', `GBP ${saDividends.toLocaleString()}`);
                        row('Total Income:', `GBP ${totalIncome.toLocaleString()}`);
                        row('Personal Allowance:', `GBP ${personalAllowance.toLocaleString()}`);
                        row('Allowable Expenses (SA103):', `GBP ${saExpenses.toLocaleString()}`);
                        row('Taxable Income:', `GBP ${taxableIncomeValue.toLocaleString()}`);
                        doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
                        doc.text(`Total Tax & NI Due: GBP ${totalTaxDueValue.toLocaleString()}`, 14, y + 4);
                      } else if (selectedReportType === 'Corporation Tax') {
                        const tax = ctTax;
                        row('Accounting Period:', ctPeriod);
                        row('Taxable Profit:', `GBP ${Number(ctProfit).toLocaleString()}`);
                        row('CT Rate:', ctRateLabel);
                        doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
                        doc.text(`Corporation Tax Due: GBP ${tax.toLocaleString()}`, 14, y + 4);
                      } else if (selectedReportType === 'VAT') {
                        const box3 = realOutputVAT; // Box 2 (EU acquisitions) not tracked, so Box 3 = Box 1
                        const netDue = box3 - realInputVAT;
                        row('VAT Period:', vatQuarter.label);
                        row('Box 1 — VAT due on sales:', `GBP ${realOutputVAT.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
                        row('Box 2 — VAT due on EU acquisitions:', 'GBP 0.00 (not tracked)');
                        row('Box 3 — Total VAT due:', `GBP ${box3.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
                        row('Box 4 — VAT reclaimed on purchases:', `GBP ${realInputVAT.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
                        row('Box 6 — Total sales excl. VAT:', `GBP ${parseFloat(vatOutputSales || '0').toLocaleString()}`);
                        row('Box 7 — Total purchases excl. VAT:', `GBP ${parseFloat(vatInputPurchases || '0').toLocaleString()}`);
                        row('Box 8 — EU supplies excl. VAT:', 'GBP 0.00 (not tracked)');
                        row('Box 9 — EU acquisitions excl. VAT:', 'GBP 0.00 (not tracked)');
                        doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
                        doc.text(`Box 5 — Net VAT ${netDue >= 0 ? 'to pay HMRC' : 'to reclaim'}: GBP ${Math.abs(netDue).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 14, y + 4);
                      } else {
                        row('Pay Period:', payeMonthLabel);
                        row('Employees:', String(employeeCount));
                        row('PAYE Income Tax:', `GBP ${currentMonthlyPAYE.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
                        row('Employee NI:', `GBP ${currentMonthlyEmployeeNI.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
                        row('Employer NI:', `GBP ${currentMonthlyEmployerNI.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
                        doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
                        doc.text(`Total Due to HMRC: GBP ${currentMonthlyTotalDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, y + 4);
                      }
                      doc.setFontSize(8); doc.setTextColor(130);
                      doc.text('Okleevo | For accountant use only. Not an official HMRC submission.', 105, 285, { align: 'center' });
                      doc.save(`${filename}.pdf`);
                    } else {
                      // CSV — opens in Excel without format warnings
                      const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
                      let csvRows: string[] = [`${esc('Field')},${esc('Value')}`];
                      if (selectedReportType === 'Self Assessment') {
                        csvRows = csvRows.concat([
                          `${esc('Tax Year')},${esc(saTaxYear)}`,
                          `${esc('Self-Employment Income (SA103)')},${esc(saSelfEmployment)}`,
                          `${esc('Employment Income (SA102)')},${esc(saEmployment)}`,
                          `${esc('UK Property Income (SA105)')},${esc(saProperty)}`,
                          `${esc('Dividends & Interest (SA100)')},${esc(saDividends)}`,
                          `${esc('Total Income')},${esc(totalIncome)}`,
                          `${esc('Personal Allowance')},${esc(personalAllowance)}`,
                          `${esc('Allowable Expenses (SA103)')},${esc(saExpenses)}`,
                          `${esc('Taxable Income')},${esc(taxableIncomeValue)}`,
                          `${esc('Total Tax & NI Due')},${esc(totalTaxDueValue)}`,
                          `${esc('Note')},${esc('Form/box references are indicative — confirm exact box numbers with your accountant or the current SA return before filing.')}`,
                        ]);
                      } else if (selectedReportType === 'Corporation Tax') {
                        const tax = ctTax.toFixed(2);
                        csvRows = csvRows.concat([
                          `${esc('Accounting Period')},${esc(ctPeriod)}`,
                          `${esc('Taxable Profit')},${esc(ctProfit)}`,
                          `${esc('CT Rate')},${esc(ctRateLabel)}`,
                          `${esc('Corporation Tax Due')},${esc(tax)}`,
                        ]);
                      } else if (selectedReportType === 'VAT') {
                        const box3 = realOutputVAT.toFixed(2);
                        const netDue = realOutputVAT - realInputVAT;
                        csvRows = csvRows.concat([
                          `${esc('VAT Period')},${esc(vatQuarter.label)}`,
                          `${esc('Box 1 - VAT due on sales')},${esc(realOutputVAT.toFixed(2))}`,
                          `${esc('Box 2 - VAT due on EU acquisitions (not tracked)')},${esc('0.00')}`,
                          `${esc('Box 3 - Total VAT due')},${esc(box3)}`,
                          `${esc('Box 4 - VAT reclaimed on purchases')},${esc(realInputVAT.toFixed(2))}`,
                          `${esc('Box 5 - Net VAT ' + (netDue >= 0 ? 'to pay HMRC' : 'to reclaim'))},${esc(Math.abs(netDue).toFixed(2))}`,
                          `${esc('Box 6 - Total sales excl. VAT')},${esc(vatOutputSales)}`,
                          `${esc('Box 7 - Total purchases excl. VAT')},${esc(vatInputPurchases)}`,
                          `${esc('Box 8 - EU supplies excl. VAT (not tracked)')},${esc('0.00')}`,
                          `${esc('Box 9 - EU acquisitions excl. VAT (not tracked)')},${esc('0.00')}`,
                        ]);
                      } else {
                        csvRows = csvRows.concat([
                          `${esc('Month')},${esc(payeMonthLabel)}`,
                          `${esc('Employees')},${esc(employeeCount)}`,
                          `${esc('PAYE Income Tax')},${esc(currentMonthlyPAYE.toFixed(2))}`,
                          `${esc('Employee NI')},${esc(currentMonthlyEmployeeNI.toFixed(2))}`,
                          `${esc('Employer NI')},${esc(currentMonthlyEmployerNI.toFixed(2))}`,
                          `${esc('Total Due to HMRC')},${esc(currentMonthlyTotalDue.toFixed(2))}`,
                        ]);
                      }
                      csvRows.push('', `${esc('Note')},${esc('For accountant use only. Not an official HMRC submission.')}`);
                      const blob = new Blob(['﻿' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = `${filename}.csv`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                    setShowDownloadModal(false);
                    showToast(`${selectedReportType} ${selectedDownloadFormat} downloaded`);
                    const reportTypeKey = selectedReportType === 'Self Assessment' ? 'SELF_ASSESSMENT'
                      : selectedReportType === 'Corporation Tax' ? 'CORPORATION_TAX'
                      : selectedReportType === 'VAT' ? 'VAT' : 'PAYE_RTI';
                    const reportAmount = selectedReportType === 'Self Assessment' ? totalTaxDueValue
                      : selectedReportType === 'Corporation Tax' ? ctTax
                      : selectedReportType === 'VAT' ? Math.max(0, realOutputVAT - realInputVAT)
                      : currentMonthlyTotalDue;
                    const reportPeriod = selectedReportType === 'Self Assessment' ? saTaxYear
                      : selectedReportType === 'Corporation Tax' ? ctPeriod
                      : selectedReportType === 'VAT' ? vatQuarter.label : payeMonthLabel;
                    fetch('/api/taxation/reports', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ reportType: reportTypeKey, format: selectedDownloadFormat, period: reportPeriod, amount: reportAmount }),
                    }).then(() => {
                      if (reportTypeKey === 'SELF_ASSESSMENT') fetchSaReports();
                      if (reportTypeKey === 'CORPORATION_TAX') fetchCtReports();
                      if (reportTypeKey === 'VAT') fetchVatReports();
                      if (reportTypeKey === 'PAYE_RTI') fetchRtiReports();
                    }).catch(() => { /* download already happened locally; logging is best-effort */ });
                  }}
                  className="flex-[1.5] px-5 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download {selectedDownloadFormat}
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download for Accountant Modal (replaces Submit to HMRC) */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 sm:p-4 pb-12 sm:pb-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full flex flex-col border border-white/50 transform animate-in slide-in-from-bottom-10 duration-300">
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Download className="w-6 h-6" />
                  </div>
                  Download for Accountant
                </h2>
                <button onClick={() => setShowSubmitModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center mb-5">
                <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-3">
                  <Download className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Ready to Download</h3>
                <p className="text-gray-500 text-sm">Your tax summary is ready to share with your accountant for HMRC filing.</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm">Return Details:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Tax Year: {saTaxYear}</li>
                  <li>• Total Tax Due: ${totalTaxDueValue.toLocaleString()}</li>
                  <li>• HMRC Deadline: {saOnlineReturnDeadline.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-1">Next Steps:</p>
                    <ul className="text-xs text-amber-800 space-y-1">
                      <li>1. Download this report</li>
                      <li>2. Send it to your accountant</li>
                      <li>3. Your accountant submits to HMRC on your behalf</li>
                      <li>4. Or log in to HMRC Online Services to file yourself</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => setShowSubmitModal(false)} className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowSubmitModal(false);
                    setSelectedReportType('Self Assessment');
                    setShowDownloadModal(true);
                  }}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'paye' && (
        <div className="space-y-6">
          {/* PAYE Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-8">
            <div className="flex items-center gap-4 mb-5">
              <div className="p-3 bg-green-50 rounded-xl shrink-0">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">PAYE & National Insurance</h2>
                <p className="text-gray-500 text-sm">Calculate payroll taxes &amp; download reports for your accountant ({currentTaxYear} Rates)</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              <button
                onClick={() => setShowRTIModal(true)}
                className="px-5 py-2.5 bg-green-600 text-white font-medium text-sm rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
              >
                Download RTI Report
              </button>
              <button
                onClick={() => setShowPAYECalculatorModal(true)}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                PAYE Calculator
              </button>
            </div>
          </div>

          {/* UK 2025/26 Tax Rates & Thresholds Container */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              UK {currentTaxYear} Payroll Tax &amp; National Insurance Thresholds
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 bg-blue-50/80 dark:bg-slate-800/60 rounded-2xl border border-blue-100 dark:border-slate-800">
                <p className="text-[11px] font-extrabold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">Personal Allowance</p>
                <p className="text-xl font-black text-blue-950 dark:text-white tracking-tight">$12,570</p>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">Tax code 1257L standard</p>
              </div>
              <div className="p-4 bg-emerald-50/80 dark:bg-slate-800/60 rounded-2xl border border-emerald-100 dark:border-slate-800">
                <p className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Basic Rate (20%)</p>
                <p className="text-xl font-black text-emerald-950 dark:text-white tracking-tight">$12,571 - $50,270</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Standard payroll tax band</p>
              </div>
              <div className="p-4 bg-amber-50/80 dark:bg-slate-800/60 rounded-2xl border border-amber-100 dark:border-slate-800">
                <p className="text-[11px] font-extrabold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-1">Higher Rate (40%)</p>
                <p className="text-xl font-black text-amber-950 dark:text-white tracking-tight">$50,271 - $125,140</p>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">Higher earners threshold</p>
              </div>
              <div className="p-4 bg-rose-50/80 dark:bg-slate-800/60 rounded-2xl border border-rose-100 dark:border-slate-800">
                <p className="text-[11px] font-extrabold text-rose-700 dark:text-rose-300 uppercase tracking-wider mb-1">Additional Rate (45%)</p>
                <p className="text-xl font-black text-rose-950 dark:text-white tracking-tight">Over $125,140</p>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">Top earners tax band</p>
              </div>
            </div>

            {/* NI Rates */}
            <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">Class 1 National Insurance ({currentTaxYear})</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-3.5 bg-purple-50/70 dark:bg-slate-800/60 rounded-2xl border border-purple-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-extrabold text-purple-800 dark:text-purple-300">Employee Primary NI</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">$12,570 – $50,270</p>
                  </div>
                  <span className="text-2xl font-black text-purple-900 dark:text-white">8%</span>
                </div>
                <div className="p-3.5 bg-purple-50/70 dark:bg-slate-800/60 rounded-2xl border border-purple-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-extrabold text-purple-800 dark:text-purple-300">Employee Upper NI</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">Over $50,270</p>
                  </div>
                  <span className="text-2xl font-black text-purple-900 dark:text-white">2%</span>
                </div>
                <div className="p-3.5 bg-indigo-50/70 dark:bg-slate-800/60 rounded-2xl border border-indigo-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-extrabold text-indigo-800 dark:text-indigo-300">Employer Secondary NI</p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">Over $9,100 (April 2025 rule)</p>
                  </div>
                  <span className="text-2xl font-black text-indigo-900 dark:text-white">15%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Executive Payroll KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-xs hover:shadow-md transition-all group">
              <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl w-fit mb-3 group-hover:scale-105 transition-transform text-white shadow-xs">
                <Users className="w-4.5 h-4.5" />
              </div>
              <p className="text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Active Payroll Headcount</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{employeeCount} Employees</p>
              <p className="text-[11px] font-medium text-gray-400 mt-1">Active on monthly RTI payroll</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-xs hover:shadow-md transition-all group">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl w-fit mb-3 group-hover:scale-105 transition-transform text-white shadow-xs">
                <PoundSterling className="w-4.5 h-4.5" />
              </div>
              <p className="text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Monthly PAYE Liability</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">${currentMonthlyPAYE.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-[11px] font-medium text-gray-400 mt-1">Income tax deducted under PAYE</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-xs hover:shadow-md transition-all group">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl w-fit mb-3 group-hover:scale-105 transition-transform text-white shadow-xs">
                <Receipt className="w-4.5 h-4.5" />
              </div>
              <p className="text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Monthly National Insurance</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">${currentMonthlyNIDue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-[11px] font-medium text-gray-400 mt-1">Combined Employer &amp; Employee Class 1 NI</p>
            </div>
          </div>

          {/* RTI Reports */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-green-600" />
              Recent RTI Reports
            </h3>
            {rtiReports.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No RTI reports downloaded yet.</p>
                <p className="text-xs text-gray-400 mt-1">Reports you download below will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rtiReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all cursor-pointer hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100/50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{report.period}</p>
                        <p className="text-sm text-gray-600">Downloaded: {new Date(report.createdAt).toLocaleDateString('en-GB')} • {report.format}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">${report.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        downloaded
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PAYE Calculation */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Current Month Breakdown ({payeMonthLabel})</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all cursor-pointer">
                <span className="text-gray-700">Employee Income Tax (PAYE)</span>
                <span className="font-bold text-gray-900">${currentMonthlyPAYE.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all cursor-pointer">
                <span className="text-gray-700">Employee NI (8% of $12,570-$50,270)</span>
                <span className="font-bold text-gray-900">${currentMonthlyEmployeeNI.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all cursor-pointer">
                <span className="text-gray-700">Employer NI (15% over $9,100)</span>
                <span className="font-bold text-gray-900">${currentMonthlyEmployerNI.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100 hover:border-green-200 transition-colors cursor-pointer">
                <div>
                  <p className="font-semibold text-green-900">Total Payment Due to HMRC</p>
                  <p className="text-xs text-green-700">Due: {payeDueLabel}</p>
                </div>
                <span className="font-bold text-green-900 text-3xl">${currentMonthlyTotalDue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 hover:border-blue-200 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h3 className="font-bold text-blue-900">Payment Deadline</h3>
              </div>
              <p className="text-sm text-blue-800 mb-2">PAYE/NI must be paid by:</p>
              <p className="text-2xl font-bold text-blue-900">22nd of each month</p>
              <p className="text-xs text-blue-700 mt-2">For previous month&apos;s deductions</p>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 hover:border-orange-200 transition-colors cursor-pointer">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={() => setShowRTIModal(true)}
              className="p-5 bg-white border border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-center cursor-pointer group"
            >
              <Download className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 text-sm">Download FPS Report</p>
            </button>
            <button 
              onClick={() => setShowPAYECalculatorModal(true)}
              className="p-5 bg-white border border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-center cursor-pointer group"
            >
              <Calculator className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 text-sm">Calculate PAYE</p>
            </button>
            <button 
              onClick={() => {
                setSuccessContent({
                  title: 'P60 Download Ready',
                  message: `P60 certificates for all employees are being generated.\n\nTax Year: ${currentTaxYear}\nEmployees: ${employeeCount}\n\nDownload will begin shortly.`
                });
                setShowSuccessModal(true);
              }}
              className="p-5 bg-white border border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-center cursor-pointer group"
            >
              <Download className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 text-sm">Download P60s</p>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'vat' && (
        <div className="space-y-5">
          {/* Executive MTD VAT Header */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    UK Making Tax Digital (MTD) VAT Portal
                  </h2>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-extrabold rounded-full border border-emerald-200/60">
                    MTD Audit Ready ✓
                  </span>
                </div>
                <p className="text-xs text-gray-400">Quarterly VAT return preparation and statutory digital record keeping for HMRC</p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setShowVATReturnModal(true)}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Prepare VAT Return
                </button>
                <button
                  onClick={() => setShowVATHistoryModal(true)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  View Returns History
                </button>
              </div>
            </div>

            {/* Live Quarterly VAT Summary Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-purple-50/80 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300">Net VAT Payable / (Reclaim)</p>
                  <p className="text-xl font-black text-purple-950 dark:text-white tracking-tight">
                    ${Math.max(0, realOutputVAT - realInputVAT).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <Receipt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>

              <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">Output VAT on Sales</p>
                  <p className="text-xl font-black text-indigo-950 dark:text-white tracking-tight">
                    ${realOutputVAT.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>

              <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Input VAT on Purchases</p>
                  <p className="text-xl font-black text-emerald-950 dark:text-white tracking-tight">
                    ${realInputVAT.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          {/* UK Statutory VAT Rates & Thresholds Container */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              UK Statutory VAT Rates &amp; HMRC Registration Thresholds ({currentTaxYear})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="p-4 bg-purple-50/80 dark:bg-slate-800/60 rounded-2xl border border-purple-100 dark:border-slate-800">
                <p className="text-[11px] font-extrabold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-1">Standard Rate</p>
                <p className="text-2xl font-black text-purple-950 dark:text-white tracking-tight">20%</p>
                <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-1">Applies to most commercial goods &amp; services</p>
              </div>

              <div className="p-4 bg-blue-50/80 dark:bg-slate-800/60 rounded-2xl border border-blue-100 dark:border-slate-800">
                <p className="text-[11px] font-extrabold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">Reduced Rate</p>
                <p className="text-2xl font-black text-blue-950 dark:text-white tracking-tight">5%</p>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">Home energy, heating oil, child safety seats</p>
              </div>

              <div className="p-4 bg-emerald-50/80 dark:bg-slate-800/60 rounded-2xl border border-emerald-100 dark:border-slate-800">
                <p className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Zero Rate</p>
                <p className="text-2xl font-black text-emerald-950 dark:text-white tracking-tight">0%</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Most human food, books, children&apos;s clothes</p>
              </div>
            </div>

            {/* Threshold Cards */}
            <div className="pt-3 border-t border-gray-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 bg-rose-50/70 dark:bg-slate-800/60 rounded-2xl border border-rose-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-extrabold text-rose-800 dark:text-rose-300">Mandatory Registration Threshold</p>
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">Taxable turnover in rolling 12 months</p>
                </div>
                <span className="text-xl font-black text-rose-900 dark:text-white">$90,000</span>
              </div>

              <div className="p-3.5 bg-amber-50/70 dark:bg-slate-800/60 rounded-2xl border border-amber-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-extrabold text-amber-800 dark:text-amber-300">Deregistration Threshold</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Below this figure, eligible to deregister</p>
                </div>
                <span className="text-xl font-black text-amber-900 dark:text-white">$88,000</span>
              </div>
            </div>

            {parseFloat(vatOutputSales || '0') < 90000 && (
              <div className="flex items-start gap-2.5 p-3.5 bg-blue-50/70 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-800 rounded-2xl">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Estimated turnover (${parseFloat(vatOutputSales || '0').toLocaleString()}) is below the $90,000 mandatory registration threshold — VAT registration may not be required unless you&apos;ve registered voluntarily.
                </p>
              </div>
            )}
          </div>

          {/* Current Quarter */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Current Quarter ({vatQuarterFullLabel})</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all cursor-pointer">
                <span className="text-gray-700">Output VAT (on Sales)</span>
                <span className="font-bold text-gray-900">${realOutputVAT.toLocaleString('en-GB', {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all cursor-pointer">
                <span className="text-gray-700">Input VAT (on Purchases)</span>
                <span className="font-bold text-gray-900">-${realInputVAT.toLocaleString('en-GB', {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div>
                  <p className="font-semibold text-purple-900">Net VAT Due to HMRC</p>
                  <p className="text-xs text-purple-700">Due: {vatQuarterDueLabel} — share with accountant</p>
                </div>
                <span className="font-bold text-purple-900 text-3xl">${Math.max(0, realOutputVAT - realInputVAT).toLocaleString('en-GB', {minimumFractionDigits: 0})}</span>
              </div>
              <p className="text-[10px] text-gray-500 italic">Computed from your recorded invoices and validated expense receipts — not a flat-rate guess.</p>
            </div>
          </div>

          {/* MTD Information */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center cursor-pointer hover:shadow-lg transition-all">
              <p className="text-xs text-gray-600 mb-1">Your Scheme</p>
              <p className="font-bold text-gray-900">Standard VAT</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center cursor-pointer hover:shadow-lg transition-all">
              <p className="text-xs text-gray-600 mb-1">Return Frequency</p>
              <p className="font-bold text-gray-900">Quarterly</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center cursor-pointer hover:shadow-lg transition-all">
              <p className="text-xs text-gray-600 mb-1">Next Deadline</p>
              <p className="font-bold text-purple-600">{vatQuarter.dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'capital-gains' && (
        <div className="space-y-5">
          {/* Executive Capital Gains Header */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    UK Capital Gains Tax (CGT) Calculator
                  </h2>
                  <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-extrabold rounded-full border border-amber-200/60">
                    FY {currentTaxYear} Rules
                  </span>
                </div>
                <p className="text-xs text-gray-400">Calculate taxable capital gains on asset disposals, business shares, and UK property</p>
              </div>

              <button
                onClick={() => setShowCGTCalculatorModal(true)}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Calculator className="w-4 h-4" />
                Calculate CGT Liability
              </button>
            </div>

            {/* Live CGT Snapshot Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">Annual Exempt Amount (AEA)</p>
                  <p className="text-xl font-black text-amber-950 dark:text-white tracking-tight">$3,000</p>
                </div>
                <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>

              <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300">Sample Asset Disposal Gain</p>
                  <p className="text-xl font-black text-blue-950 dark:text-white tracking-tight">
                    ${Math.max(0, parseFloat(cgtDisposalValue || '0') - parseFloat(cgtAcquisitionCost || '0') - parseFloat(cgtAllowableExpenses || '0')).toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">BADR Business Rate</p>
                  <p className="text-xl font-black text-emerald-950 dark:text-white tracking-tight">10% / 14%</p>
                </div>
                <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Statutory CGT Rates & Exemptions Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              UK Capital Gains Tax Rates &amp; Exemptions ({currentTaxYear})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 bg-amber-50/80 dark:bg-slate-800/60 rounded-2xl border border-amber-100 dark:border-slate-800">
                <p className="text-[11px] font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1">Annual Exempt Amount</p>
                <p className="text-2xl font-black text-amber-950 dark:text-white tracking-tight">$3,000</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">Tax-free allowance per individual</p>
              </div>

              <div className="p-4 bg-emerald-50/80 dark:bg-slate-800/60 rounded-2xl border border-emerald-100 dark:border-slate-800">
                <p className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1">BADR Relief</p>
                <p className="text-2xl font-black text-emerald-950 dark:text-white tracking-tight">10% / 14%</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">Qualifying UK SME business sales ($1m limit)</p>
              </div>

              <div className="p-4 bg-blue-50/80 dark:bg-slate-800/60 rounded-2xl border border-blue-100 dark:border-slate-800">
                <p className="text-[11px] font-extrabold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">Basic Rate Taxpayers</p>
                <p className="text-2xl font-black text-blue-950 dark:text-white tracking-tight">18% / 10%</p>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">18% Residential Property • 10% Other Assets</p>
              </div>

              <div className="p-4 bg-rose-50/80 dark:bg-slate-800/60 rounded-2xl border border-rose-100 dark:border-slate-800">
                <p className="text-[11px] font-extrabold text-rose-700 dark:text-rose-300 uppercase tracking-wider mb-1">Higher Rate Taxpayers</p>
                <p className="text-2xl font-black text-rose-950 dark:text-white tracking-tight">24% / 20%</p>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">24% Residential Property • 20% Other Assets</p>
              </div>
            </div>

            {/* 60-Day UK Property Reporting Banner */}
            <div className="pt-3 border-t border-gray-100 dark:border-slate-800 p-4 bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-amber-50/90 dark:from-slate-800/80 dark:to-slate-800/40 rounded-2xl border border-amber-200/60 dark:border-slate-700 flex items-start gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 rounded-xl shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-amber-950 dark:text-amber-200">HMRC 60-Day UK Property Reporting Rule</p>
                <p className="text-xs text-amber-900/80 dark:text-gray-300 leading-relaxed mt-0.5">
                  Disposals of UK residential property with taxable capital gains must be reported and paid to HMRC within <strong>60 days of completion</strong> to avoid late penalties.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (() => {
        const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
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
        
        const isTodayCell = (dayNum: number) => 
          dayNum === today.getDate() && 
          calendarMonth === today.getMonth() && 
          calendarYear === today.getFullYear();
        
        const selectedEvent = selectedCalendarDay ? taxDates[String(selectedCalendarDay)] : null;
        
        const COLOR_MAP: Record<string, { cellBg: string; dotBg: string; text: string; border: string; buttonBg: string; targetTab: string }> = {
          purple: { cellBg: 'bg-purple-50/90 dark:bg-purple-950/60', dotBg: 'bg-purple-600', text: 'text-purple-950 dark:text-purple-200', border: 'border-purple-200 dark:border-purple-800', buttonBg: 'bg-purple-600 hover:bg-purple-700', targetTab: 'vat' },
          blue: { cellBg: 'bg-blue-50/90 dark:bg-blue-950/60', dotBg: 'bg-blue-600', text: 'text-blue-950 dark:text-blue-200', border: 'border-blue-200 dark:border-blue-800', buttonBg: 'bg-blue-600 hover:bg-blue-700', targetTab: 'paye' },
          emerald: { cellBg: 'bg-emerald-50/90 dark:bg-emerald-950/60', dotBg: 'bg-emerald-600', text: 'text-emerald-950 dark:text-emerald-200', border: 'border-emerald-200 dark:border-emerald-800', buttonBg: 'bg-emerald-600 hover:bg-emerald-700', targetTab: 'paye' },
          red: { cellBg: 'bg-rose-50/90 dark:bg-rose-950/60', dotBg: 'bg-rose-600', text: 'text-rose-950 dark:text-rose-200', border: 'border-rose-200 dark:border-rose-800', buttonBg: 'bg-indigo-600 hover:bg-indigo-700', targetTab: 'corporation-tax' },
        };

        return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Visual Calendar Grid Pane */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer text-gray-700 dark:text-gray-200 font-bold">
                  ‹ Prev
                </button>
                
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{monthNames[calendarMonth]} {calendarYear}</h2>
                  <p className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-0.5">UK Tax Year {currentTaxYear}</p>
                </div>
                
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer text-gray-700 dark:text-gray-200 font-bold">
                  Next ›
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-[10px] sm:text-[11px] font-extrabold text-gray-400 uppercase tracking-wider py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {Array.from({ length: firstDayOfMonth }, (_, i) => (
                  <div key={`empty-${i}`} className="h-14 sm:h-20 bg-gray-50/40 dark:bg-slate-800/30 rounded-2xl"></div>
                ))}
                
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const dayNum = i + 1;
                  const dayStr = String(dayNum);
                  const event = taxDates[dayStr];
                  const isToday = isTodayCell(dayNum);
                  const isSelected = selectedCalendarDay === dayNum;
                  const colorConfig = event ? COLOR_MAP[event.color] || COLOR_MAP.purple : null;

                  return (
                    <div 
                      key={dayNum}
                      onClick={() => setSelectedCalendarDay(dayNum)}
                      className={`h-14 sm:h-20 rounded-2xl p-2 transition-all cursor-pointer relative group flex flex-col justify-between ${
                        isSelected 
                          ? 'ring-2 ring-indigo-500 bg-white dark:bg-slate-900 shadow-md z-10' 
                          : isToday
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-2 border-indigo-300 dark:border-indigo-700'
                            : colorConfig
                              ? `${colorConfig.cellBg} ${colorConfig.border} border hover:shadow-sm`
                              : 'bg-gray-50/50 dark:bg-slate-800/40 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-100 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs sm:text-sm font-black ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                          {dayNum}
                        </span>
                        {colorConfig && (
                          <div className={`w-2 h-2 rounded-full ${colorConfig.dotBg} shadow-2xs`}></div>
                        )}
                      </div>
                      
                      {event && (
                        <p className={`text-[9px] font-extrabold truncate hidden sm:block ${colorConfig?.text}`}>
                          {event.type}
                        </p>
                      )}

                      {isToday && (
                        <span className="self-end px-1.5 py-0.2 bg-indigo-600 text-[8px] font-black text-white rounded-md uppercase">
                          Today
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 flex justify-center">
                <button 
                  onClick={goToToday}
                  className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-2xs uppercase tracking-wider"
                >
                  Reset to Today
                </button>
              </div>
            </div>

            {/* Day Details Sidebar */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Selected Date Details
                </h3>
                
                {selectedCalendarDay ? (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="bg-gray-50/90 dark:bg-slate-800/60 rounded-2xl p-4 border border-gray-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-gray-400">{monthNames[calendarMonth]} {calendarYear}</p>
                      <h4 className="text-3xl font-black text-gray-900 dark:text-white mt-0.5">Day {selectedCalendarDay}</h4>
                    </div>

                    {selectedEvent ? (
                      (() => {
                        const cfg = COLOR_MAP[selectedEvent.color] || COLOR_MAP.purple;
                        return (
                          <div className={`p-4 rounded-2xl border ${cfg.cellBg} ${cfg.border} space-y-3`}>
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 ${cfg.dotBg} rounded-lg text-white shadow-2xs`}>
                                <AlertCircle className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">{selectedEvent.type}</span>
                            </div>

                            <h5 className="text-sm font-extrabold text-gray-900 dark:text-white leading-snug">
                              {selectedEvent.fullTask}
                            </h5>

                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                              Mandatory statutory UK compliance deadline. Make sure your figures are ready and filed with HMRC (via your accountant or filing software) on time to avoid automated penalties.
                            </p>

                            <button
                              onClick={() => setActiveTab(cfg.targetTab)}
                              className={`w-full py-2 ${cfg.buttonBg} text-white font-extrabold text-xs rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95`}
                            >
                              <span>Open {selectedEvent.type} Module</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="p-6 text-center bg-gray-50/50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                        <CheckCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-gray-400">No statutory tax deadlines scheduled for this date.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Calendar className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-xs font-bold text-gray-400">Select any day on the calendar to inspect tax obligations.</p>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>
                  <span className="text-[11px] font-bold text-gray-500">VAT (7th)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                  <span className="text-[11px] font-bold text-gray-500">PAYE/NI (22nd)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
                  <span className="text-[11px] font-bold text-gray-500">HMRC Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-600"></div>
                  <span className="text-[11px] font-bold text-gray-500">CT600 / SA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Priority Deadline Watch Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Priority UK HMRC Statutory Deadline Watch
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {getUpcomingDeadlines().map((item, idx) => {
                const daysUntil = Math.ceil((item.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const cfg = COLOR_MAP[item.color] || COLOR_MAP.purple;

                return (
                  <div key={idx} className="p-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        daysUntil <= 7
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border border-rose-300/60'
                          : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60'
                      }`}>
                        {daysUntil <= 0 ? 'Due Today' : `Due in ${daysUntil} Days`}
                      </span>
                      <div className={`p-2 rounded-xl text-white ${cfg.dotBg}`}>
                        <Calendar className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-white leading-snug">{item.task}</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Deadline: <span className="font-semibold text-gray-700 dark:text-gray-300">{item.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab(cfg.targetTab)}
                      className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                    >
                      <span>Manage Task</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Annual Tax Calendar Reference */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
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
        </motion.div>
      </AnimatePresence>
      </div>
      {/* New Return Modal */}
      {showNewReturnModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 sm:p-4 pb-12 sm:pb-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-2xl max-h-[85dvh] flex flex-col border border-gray-200 transform animate-in slide-in-from-bottom-10 duration-300">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 sticky top-0 z-10 bg-white rounded-t-2xl sm:rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                    <Plus className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Create New Tax Return</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Step {newReturnStep} of 4 — {
                      newReturnStep === 1 ? 'Select Return Type' :
                      newReturnStep === 2 ? 'Period & Reference' :
                      newReturnStep === 3 ? 'Financial Details' :
                      'Review & Submit'
                    }</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowNewReturnModal(false);
                    setNewReturnStep(1);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-gray-900 h-full transition-all duration-500 ease-out"
                  style={{ width: `${(newReturnStep / 4) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-5 sm:p-8 space-y-6 flex-1 overflow-y-auto pb-32 sm:pb-10 custom-scrollbar">
              {/* Step 1: Select Type */}
              {newReturnStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { id: 'corporation', name: 'Corporation Tax', icon: Building2, desc: 'Annual CT600 return' },
                      { id: 'vat', name: 'VAT Return', icon: Receipt, desc: 'Quarterly VAT submission' },
                      { id: 'paye', name: 'PAYE & NI', icon: Users, desc: 'Monthly employer taxes' },
                      { id: 'self-assessment', name: 'Self Assessment', icon: User, desc: 'Individual tax return' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setNewReturnData({ ...newReturnData, type: item.name });
                          setNewReturnStep(2);
                        }}
                        className={`p-4 sm:p-5 border rounded-xl text-left transition-colors cursor-pointer flex items-start gap-3 sm:gap-4 ${
                          newReturnData.type === item.name
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                        }`}
                      >
                        <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                          <item.icon className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Period & Reference */}
              {newReturnStep === 2 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Selected Tax Type</label>
                    <div className="px-4 py-2.5 bg-gray-50 rounded-lg font-medium text-sm text-gray-900 border border-gray-200">
                      {newReturnData.type}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Accounting Period</label>
                    <select
                      value={newReturnData.period}
                      onChange={(e) => setNewReturnData({ ...newReturnData, period: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100 transition cursor-pointer"
                    >
                      <option>{calQuarterLabel}</option>
                      <option>{prevCalQuarterLabel}</option>
                      <option>{`FY ${taxYearOptions[0].year}`}</option>
                      <option>{`FY ${taxYearOptions[1].year}`}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Reference Number</label>
                    <input
                      type="text"
                      placeholder="e.g. TAX-2025-001"
                      value={newReturnData.reference}
                      onChange={(e) => setNewReturnData({ ...newReturnData, reference: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100 transition"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Financials */}
              {newReturnStep === 3 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Total Turnover ($)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={newReturnData.turnover}
                        onChange={(e) => setNewReturnData({ ...newReturnData, turnover: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Total Expenses ($)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={newReturnData.expenses}
                        onChange={(e) => setNewReturnData({ ...newReturnData, expenses: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes / Comments</label>
                    <textarea
                      placeholder="Enter any additional information..."
                      rows={3}
                      value={newReturnData.notes}
                      onChange={(e) => setNewReturnData({ ...newReturnData, notes: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100 transition resize-none"
                    ></textarea>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Estimated Taxable Profit</span>
                      <span className="text-lg font-semibold text-gray-900">
                        ${(Number(newReturnData.turnover) - Number(newReturnData.expenses)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {newReturnStep === 4 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="border-b border-gray-200 px-5 sm:px-6 py-3.5">
                      <h3 className="text-sm font-semibold text-gray-900">Report Summary</h3>
                    </div>
                    <div className="p-5 sm:p-6 space-y-3.5">
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-100 text-sm">
                        <span className="text-gray-500">Tax Type</span>
                        <span className="font-semibold text-gray-900">{newReturnData.type}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-100 text-sm">
                        <span className="text-gray-500">Period</span>
                        <span className="font-semibold text-gray-900">{newReturnData.period}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-100 text-sm">
                        <span className="text-gray-500">Reference</span>
                        <span className="font-semibold text-gray-900">{newReturnData.reference || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-100 text-sm">
                        <span className="text-gray-500">Turnover</span>
                        <span className="font-semibold text-gray-900">${Number(newReturnData.turnover).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-100 text-sm">
                        <span className="text-gray-500">Expenses</span>
                        <span className="font-semibold text-gray-900">${Number(newReturnData.expenses).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-gray-50 -mx-5 sm:-mx-6 px-5 sm:px-6 rounded-b-xl">
                        <span className="text-sm font-semibold text-gray-900">Total Liability (Estimated)</span>
                        <span className="text-xl font-semibold text-gray-900">
                          ${newReturnEstimatedLiability(newReturnData.type, newReturnData.turnover, newReturnData.expenses).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2.5 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <Shield className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500">
                      By downloading this report, you confirm that all figures provided are accurate to the best of your knowledge. Share this with your accountant for HMRC submission.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer — sticky so always visible */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-5 sm:px-8 py-4 flex items-center justify-between gap-3 pb-8 sm:pb-6 mb-1.5 sm:mb-0">
                <button
                  onClick={() => {
                    if (newReturnStep === 1) {
                      setShowNewReturnModal(false);
                    } else {
                      setNewReturnStep(newReturnStep - 1);
                    }
                  }}
                  className="flex-1 sm:flex-none px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {newReturnStep === 1 ? 'Cancel' : 'Back'}
                </button>
                <button
                  onClick={() => {
                    if (newReturnStep < 4) {
                      setNewReturnStep(newReturnStep + 1);
                    } else {
                      setShowNewReturnModal(false);
                      setNewReturnStep(1);
                      const newReturnRows: [string, string][] = [
                        ['Return Type', newReturnData.type || '—'],
                        ['Period', newReturnData.period || '—'],
                        ['Reference', newReturnData.reference || '—'],
                        ['Turnover', newReturnData.turnover ? `$${newReturnData.turnover}` : '—'],
                        ['Expenses', newReturnData.expenses ? `$${newReturnData.expenses}` : '—'],
                        ['Net Profit', newReturnData.turnover && newReturnData.expenses ? `$${(parseFloat(newReturnData.turnover) - parseFloat(newReturnData.expenses)).toFixed(2)}` : '—'],
                        ['Notes', newReturnData.notes || '—'],
                      ];
                      const retTitle = `${newReturnData.type || 'Tax Return'} — ${newReturnData.period}`;
                      setSuccessDownloadFns({
                        pdf: () => makeQuickPDF(retTitle, newReturnRows, 'Share with your accountant for HMRC submission.'),
                        excel: () => makeQuickExcel(retTitle, newReturnRows),
                      });
                      setSuccessContent({
                        title: 'Report Ready',
                        message: `Your ${newReturnData.type || 'tax'} report for ${newReturnData.period} is ready.\n\nDownload as PDF or Excel and share with your accountant for HMRC filing.`,
                      });
                      setShowSuccessModal(true);
                    }
                  }}
                  className={`flex-1 sm:flex-none px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                    newReturnStep === 1 && !newReturnData.type ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  {newReturnStep === 4 ? 'Confirm & Download' : 'Continue'}
                  <TrendingUp className="w-4 h-4" />
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Corporation Tax (CT600) Modal */}
      {showCT600Modal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 sm:p-4 pb-12 sm:pb-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[85dvh] flex flex-col border border-white/50 transform animate-in slide-in-from-bottom-10 duration-300">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-blue-700 to-indigo-700 p-6 rounded-t-2xl sticky top-0 z-10 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Building2 className="w-6 h-6" />
                    </div>
                    Corporation Tax Return (CT600)
                  </h2>
                  <p className="text-blue-50 text-sm mt-1 font-medium italic opacity-90">{ctPeriod}</p>
                </div>
                <button 
                  onClick={() => setShowCT600Modal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-8 space-y-6 flex-1 overflow-y-auto pb-24 sm:pb-10 custom-scrollbar">
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Tax Calculation Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-blue-100">
                    <span className="text-blue-800">Taxable Profit</span>
                    <span className="font-bold text-blue-900">${Number(ctProfit).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-100">
                    <span className="text-blue-800">Effective Tax Rate</span>
                    <span className="font-bold text-blue-900">{ctRateLabel}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 bg-white/60 -mx-6 px-6 mt-4">
                    <span className="text-blue-900 font-bold">Estimated Tax Liability</span>
                    <span className="text-3xl font-black text-blue-600">
                      ${ctTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
                  <p className="font-bold text-gray-900">{ctPaymentDeadline}</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-800">
                  <strong>Important:</strong> This is an estimate based on your taxable profit. The final CT600 may include adjustments for capital allowances, specialized tax reliefs (like R&D), and non-deductible expenses.
                </p>
              </div>

              {ctReports.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                    <History className="w-4 h-4 text-gray-400" />
                    Previous Downloads
                  </h3>
                  <div className="space-y-2">
                    {ctReports.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                          <p className="font-semibold text-gray-900 text-xs">{item.period}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{item.format} • {new Date(item.createdAt).toLocaleDateString('en-GB')}</p>
                        </div>
                        <span className="font-bold text-gray-900 text-xs">${item.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-5 sm:px-8 py-4 flex gap-4 pb-8 sm:pb-6 mb-1.5 sm:mb-0 shadow-[0_-10px_20px_rgba(0,0,0,0.04)]">
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
                    doc.text(`$${Number(ctProfit).toLocaleString()}`, 150, y, { align: 'right' });
                    
                    y += 10;
                    doc.text('Applicable Tax Rate:', 20, y);
                    doc.text(ctRateLabel, 150, y, { align: 'right' });

                    y += 15;
                    doc.setFont('helvetica', 'bold');
                    doc.text('TOTAL CORPORATION TAX PAYABLE:', 20, y);
                    doc.text(`$${ctTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 150, y, { align: 'right' });

                    y += 30;
                    doc.setFontSize(14);
                    doc.text('FILING INFORMATION', 20, y);
                    doc.line(20, y + 2, 190, y + 2);

                    y += 15;
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'normal');
                    doc.text('Filing Deadline:', 20, y);
                    doc.text(ctFilingDeadline, 100, y);

                    y += 10;
                    doc.text('Payment Deadline:', 20, y);
                    doc.text(ctPaymentDeadline, 100, y);
                    
                    y += 40;
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'italic');
                    doc.text('This document is a computer-generated summary of your Corporation Tax obligations.', 105, y, { align: 'center' });
                    doc.text('For official submission, please log in to HMRC Online Services.', 105, y + 7, { align: 'center' });

                    doc.save(`CT600_Summary_${ctProfit}_${new Date().toISOString().split('T')[0]}.pdf`);
                    setShowCT600Modal(false);
                    setSuccessContent({
                      title: 'Report Generated',
                      message: `CT600 Summary (PDF) for profits of $${Number(ctProfit).toLocaleString()} generated successfully.`
                    });
                    setShowSuccessModal(true);
                  }}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Generate & Download
                </button>
              </div>
            </div>
          </div>
      )}
      {/* Edit Income Source Modal */}
      {showEditIncomeModal && editingSource && (() => {
        const sourceIcon: Record<string, React.ComponentType<{ className?: string }>> = {
          'self-employment': Briefcase,
          'employment': DollarSign,
          'property': Home,
          'dividends': TrendingUp,
          'expenses': Calculator,
        };
        const SourceIcon = sourceIcon[editingSource.id] ?? DollarSign;
        return (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-w-md w-full border border-gray-200 transform animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-50 rounded-lg">
                  <SourceIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Edit {editingSource.name}</h2>
                  <p className="text-xs text-gray-500">Tax year {saTaxYear}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditIncomeModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                  <input
                    type="number"
                    autoFocus
                    defaultValue={editingSource.value}
                    onChange={(e) => setEditingSource({ ...editingSource, value: Number(e.target.value) })}
                    className="w-full pl-8 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 focus:outline-none text-lg font-semibold text-gray-900 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => setShowEditIncomeModal(false)}
                  className="flex-1 px-5 py-2.5 border border-gray-200 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
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
                  className="flex-1 px-5 py-2.5 bg-purple-600 text-white font-medium text-sm rounded-lg hover:bg-purple-700 transition-colors cursor-pointer shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}
      {/* Previous Returns History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl max-w-2xl w-full border border-white/50">
            <div className="bg-linear-to-r from-indigo-700 to-purple-800 p-5 rounded-t-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Clock className="w-6 h-6" />
                  </div>
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
              {saReports.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No previous returns yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Reports you download from &quot;Download Tax Reports&quot; or &quot;Start New Return&quot; will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {saReports.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{item.period}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.format} • Downloaded {new Date(item.createdAt).toLocaleDateString('en-GB')}</p>
                      </div>
                      <span className="font-bold text-gray-900 text-sm">${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              )}

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
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-100 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full border border-gray-200 transform animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-green-50 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>

              <h2 className="text-lg font-semibold text-gray-900 mb-1.5">{successContent.title}</h2>
              <div className="text-gray-500 mb-6 whitespace-pre-wrap leading-relaxed text-sm">
                {successContent.message}
              </div>

              {successDownloadFns && (
                <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                  {successDownloadFns.pdf && (
                    <button
                      onClick={() => { successDownloadFns.pdf!(); logReportDownload('PDF'); setShowSuccessModal(false); setSuccessDownloadFns(null); }}
                      className="py-2.5 bg-red-50 text-red-700 font-medium text-sm rounded-lg hover:bg-red-100 transition-colors cursor-pointer flex items-center justify-center gap-2 border border-red-100"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                  )}
                  {successDownloadFns.excel && (
                    <button
                      onClick={() => { successDownloadFns.excel!(); logReportDownload('Excel'); setShowSuccessModal(false); setSuccessDownloadFns(null); }}
                      className="py-2.5 bg-green-50 text-green-700 font-medium text-sm rounded-lg hover:bg-green-100 transition-colors cursor-pointer flex items-center justify-center gap-2 border border-green-100"
                    >
                      <Download className="w-4 h-4" />
                      Excel
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={() => { setShowSuccessModal(false); setSuccessDownloadFns(null); setPendingReportLog(null); }}
                className="w-full py-2.5 bg-gray-900 text-white font-medium text-sm rounded-lg hover:bg-black transition-colors cursor-pointer"
              >
                {successDownloadFns ? 'Skip Download' : 'Great, thanks!'}
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
            <div className="relative bg-linear-to-br from-emerald-500 via-green-500 to-teal-600 p-6 overflow-hidden">
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
                    <p className="text-emerald-100 text-sm font-medium">UK Tax Year {currentTaxYear}</p>
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
              <div className="bg-linear-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 border border-gray-200/50">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Enter Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Gross Salary</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
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
                        <span className="text-xl font-black text-gray-900">${(salary / 12).toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                      
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div>
                            <span className="text-red-800 font-medium">Income Tax</span>
                            <span className="ml-2 text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">PAYE</span>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-red-700">-${monthlyPAYE.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                      
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-purple-50/50">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <div>
                            <span className="text-purple-800 font-medium">National Insurance</span>
                            <span className="ml-2 text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">8%</span>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-purple-700">-${monthlyEmployeeNI.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                      
                      <div className="p-5 bg-linear-to-r from-emerald-500 to-green-500 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <span className="text-white font-bold text-lg">Take Home Pay</span>
                            <p className="text-emerald-100 text-xs">After deductions</p>
                          </div>
                        </div>
                        <span className="text-3xl font-black text-white">${monthlyNet.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    </div>

                    {/* Employer Cost Card */}
                    <div className="bg-linear-to-br from-indigo-50 to-blue-50 rounded-2xl p-4 border border-indigo-200/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <Users className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-indigo-900 font-bold">Employer NI Cost</p>
                            <p className="text-indigo-600 text-xs">15% over $9,100 threshold</p>
                          </div>
                        </div>
                        <span className="text-2xl font-black text-indigo-700">${monthlyEmployerNI.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    </div>

                    {/* Annual Summary */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                        <p className="text-xs text-gray-500 font-medium mb-1">Annual Tax</p>
                        <p className="text-lg font-black text-gray-900">${(monthlyPAYE * 12).toLocaleString('en-GB', {maximumFractionDigits: 0})}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                        <p className="text-xs text-gray-500 font-medium mb-1">Annual NI</p>
                        <p className="text-lg font-black text-gray-900">${(monthlyEmployeeNI * 12).toLocaleString('en-GB', {maximumFractionDigits: 0})}</p>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-200">
                        <p className="text-xs text-emerald-600 font-medium mb-1">Annual Net</p>
                        <p className="text-lg font-black text-emerald-700">${(monthlyNet * 12).toLocaleString('en-GB', {maximumFractionDigits: 0})}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Info Banner */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  <strong>{currentTaxYear} Rates:</strong> Employee NI reduced to 8%. Employer NI increased to 15% with $9,100 threshold.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setShowPAYECalculatorModal(false)}
                className="w-full py-4 bg-linear-to-r from-gray-800 to-gray-900 text-white font-bold rounded-xl hover:from-gray-900 hover:to-black hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer"
              >
                Close Calculator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RTI Report Download Modal */}
      {showRTIModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center z-[60] p-4 sm:p-4 pb-12 sm:pb-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-xl w-full max-h-[85dvh] overflow-hidden border border-white/50 transform animate-in slide-in-from-bottom-10 duration-300 flex flex-col">

            {/* Header with HMRC-style gradient */}
            <div className="relative bg-linear-to-br from-teal-600 via-cyan-600 to-blue-700 p-6 overflow-hidden">
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
                    <h2 className="text-2xl font-black text-white tracking-tight">RTI Report</h2>
                    <p className="text-cyan-100 text-sm font-medium">Full Payment Submission — for your accountant</p>
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
            
            <div className="p-5 sm:p-8 space-y-5 flex-1 overflow-y-auto pb-32 sm:pb-10 custom-scrollbar">
              {/* Status Banner */}
              <div className="flex items-center gap-4 p-4 bg-linear-to-r from-cyan-50 to-blue-50 rounded-2xl border border-cyan-200">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-20"></div>
                  <div className="relative p-3 bg-cyan-100 rounded-full">
                    <Shield className="w-6 h-6 text-cyan-700" />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-cyan-900">Report Ready to Download</p>
                  <p className="text-sm text-cyan-700">Review details, then share with your accountant</p>
                </div>
              </div>

              {/* Submission Details Card */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Report Details</h3>
                </div>
                
                <div className="divide-y divide-gray-100">
                  <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium">Pay Period</span>
                    </div>
                    <span className="font-bold text-gray-900">{payeMonthLabel} <span className="text-gray-500 text-sm font-normal">(Month {payeTaxMonthNumber})</span></span>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium">Employees Included</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span className="font-bold text-gray-900">{employeeCount}</span>
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
                    <span className="font-bold text-red-900 text-lg">${currentMonthlyPAYE.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-purple-800 font-medium">Employee NI (8%)</span>
                    </div>
                    <span className="font-bold text-purple-900 text-lg">${currentMonthlyEmployeeNI.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                      <span className="text-indigo-800 font-medium">Employer NI (15%)</span>
                    </div>
                    <span className="font-bold text-indigo-900 text-lg">${currentMonthlyEmployerNI.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="p-5 bg-linear-to-r from-teal-500 to-cyan-500 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Receipt className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-white font-bold text-lg">Total to HMRC</span>
                      <p className="text-cyan-100 text-xs">Due: {payeDueLabel}</p>
                    </div>
                  </div>
                  <span className="text-3xl font-black text-white">${currentMonthlyTotalDue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-5 sm:px-8 py-4 flex gap-3 pb-8 sm:pb-6 mb-1.5 sm:mb-0 shadow-[0_-10px_20px_rgba(0,0,0,0.04)]">
              <button
                onClick={() => setShowRTIModal(false)}
                className="flex-1 py-4 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-100 hover:border-gray-300 active:scale-[0.98] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowRTIModal(false);
                  const rtiRows: [string, string][] = [
                    ['Pay Period', payeMonthLabel],
                    ['Employees', String(employeeCount)],
                    ['PAYE Income Tax', `$${currentMonthlyPAYE.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                    ['Employee NI', `$${currentMonthlyEmployeeNI.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                    ['Employer NI', `$${currentMonthlyEmployerNI.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                    ['Total Due to HMRC', `$${currentMonthlyTotalDue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                    ['HMRC Deadline', payeDueLabel],
                  ];
                  setSuccessDownloadFns({
                    pdf: () => makeQuickPDF(`RTI Full Payment Submission — ${payeMonthLabel}`, rtiRows, 'Share with your accountant for RTI submission to HMRC.'),
                    excel: () => makeQuickExcel(`RTI Full Payment Submission — ${payeMonthLabel}`, rtiRows),
                  });
                  setPendingReportLog({ reportType: 'PAYE_RTI', period: payeMonthLabel, amount: currentMonthlyTotalDue });
                  setSuccessContent({
                    title: 'RTI Report Ready',
                    message: 'Your Full Payment Submission report is ready.\n\nDownload as PDF or Excel and share with your accountant for RTI submission to HMRC.',
                  });
                  setShowSuccessModal(true);
                }}
                className="flex-1 py-4 bg-linear-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-cyan-600 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-5 h-5" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}
      {/* VAT Return Modal */}
      {showVATReturnModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center z-[60] p-4 sm:p-4 pb-12 sm:pb-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-xl w-full max-h-[85dvh] overflow-hidden border border-white/50 transform animate-in slide-in-from-bottom-10 duration-300 flex flex-col">

            {/* Header with HMRC-style VAT branding */}
            <div className="relative bg-linear-to-br from-purple-700 via-indigo-700 to-blue-800 p-6 overflow-hidden">
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
                    <h2 className="text-2xl font-black text-white tracking-tight">VAT Return Report</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold text-white uppercase tracking-wider">For Your Accountant</span>
                      <p className="text-purple-100 text-sm font-medium">{vatQuarterFullLabel}</p>
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
            
            <div className="p-5 sm:p-8 space-y-6 flex-1 overflow-y-auto pb-32 sm:pb-10 custom-scrollbar">
              {/* Submission Information Banner */}
              <div className="flex items-start gap-4 p-4 bg-linear-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 shadow-sm">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <p className="font-bold text-purple-900">VAT Report Ready to Download</p>
                  <p className="text-xs text-purple-700 mt-0.5 leading-relaxed">
                    Download this report and share it with your accountant. They will submit it to HMRC via MTD. Ensure all figures align with your accounting records.
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
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">$</span>
                    <div className="w-full pl-9 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl text-xl font-black text-gray-900">
                      {parseFloat(vatOutputSales || '0').toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">Computed from your recorded invoices — edit an invoice to change this.</p>
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
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">$</span>
                    <div className="w-full pl-9 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl text-xl font-black text-gray-900">
                      {parseFloat(vatInputPurchases || '0').toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">Computed from your recorded expenses — edit an expense to change this.</p>
                </div>
              </div>

              {/* Advanced Calculation Preview */}
              <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-xl border border-white/10">
                <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">VAT Breakdown</h3>
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
                    <span className="text-lg font-black text-white">${realOutputVAT.toLocaleString('en-GB', {minimumFractionDigits: 2})}</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-300">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium opacity-60">Box 4</span>
                      <span className="text-sm font-bold">VAT reclaimed</span>
                    </div>
                    <span className="text-lg font-black text-white">${realInputVAT.toLocaleString('en-GB', {minimumFractionDigits: 2})}</span>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-tighter">Box 5</span>
                      <span className="text-lg font-black text-white">Net VAT Payable</span>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-blue-400">
                        ${Math.max(0, realOutputVAT - realInputVAT).toLocaleString('en-GB', {minimumFractionDigits: 2})}
                      </span>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Due to HMRC</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Footer Actions — sticky for mobile accessibility */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-5 sm:px-8 py-4 flex gap-4 pb-8 sm:pb-6 mb-1.5 sm:mb-0 shadow-[0_-10px_20px_rgba(0,0,0,0.04)]">
              <button
                onClick={() => setShowVATReturnModal(false)}
                className="flex-1 py-4 bg-white border-2 border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-100 hover:border-gray-300 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              >
                Save Draft
              </button>
              <button
                onClick={() => {
                  setShowVATReturnModal(false);
                  const net = Math.max(0, realOutputVAT - realInputVAT);
                  const vatRows: [string, string][] = [
                    ['VAT Period', vatQuarterFullLabel],
                    ['Box 1 — VAT due on sales', `$${realOutputVAT.toFixed(2)}`],
                    ['Box 2 — VAT due on EU acquisitions', 'Not tracked'],
                    ['Box 3 — Total VAT due', `$${realOutputVAT.toFixed(2)}`],
                    ['Box 4 — VAT reclaimed on purchases', `$${realInputVAT.toFixed(2)}`],
                    ['Box 5 — Net VAT Payable', `$${net.toFixed(2)}`],
                    ['Box 6 — Total sales excl. VAT', `$${parseFloat(vatOutputSales || '0').toLocaleString()}`],
                    ['Box 7 — Total purchases excl. VAT', `$${parseFloat(vatInputPurchases || '0').toLocaleString()}`],
                    ['Box 8 — EU supplies excl. VAT', 'Not tracked'],
                    ['Box 9 — EU acquisitions excl. VAT', 'Not tracked'],
                    ['HMRC Deadline', vatQuarterDueLabel],
                  ];
                  setSuccessDownloadFns({
                    pdf: () => makeQuickPDF(`VAT Return — ${vatQuarter.label}`, vatRows, 'Share with your accountant for VAT submission to HMRC.'),
                    excel: () => makeQuickExcel(`VAT Return — ${vatQuarter.label}`, vatRows),
                  });
                  setPendingReportLog({ reportType: 'VAT', period: vatQuarter.label, amount: net });
                  setSuccessContent({
                    title: 'VAT Report Ready',
                    message: `Net VAT Payable: $${net.toFixed(2)}\nHMRC Deadline: ${vatQuarterDueLabel}\n\nDownload as PDF or Excel and share with your accountant for HMRC filing.`,
                  });
                  setShowSuccessModal(true);
                }}
                className="flex-[1.5] py-4 bg-linear-to-r from-purple-600 to-blue-700 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-purple-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Download Report
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
            <div className="relative bg-linear-to-br from-indigo-600 via-purple-600 to-pink-700 p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-white rounded-full"></div>
              </div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg ring-1 ring-white/50">
                    <History className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">VAT Report History</h2>
                    <p className="text-indigo-100 text-sm font-medium">Reports downloaded for your accountant</p>
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
              {vatReports.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No VAT reports downloaded yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Reports you download from &quot;Prepare VAT Return&quot; will appear here.</p>
                </div>
              ) : (
                vatReports.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10 group-hover:scale-110 transition-transform"></div>

                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                            <Calendar className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-black text-gray-900 text-lg leading-tight">{item.period}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Downloaded on</span>
                            <span className="text-xs font-bold text-gray-700">{new Date(item.createdAt).toLocaleDateString('en-GB')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-gray-900 tracking-tight">${item.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        <div className="flex items-center justify-end gap-1.5 mt-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">{item.format}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
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
            <div className="relative bg-linear-to-br from-orange-600 via-red-600 to-rose-700 p-6 overflow-hidden">
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
                    <p className="text-orange-100 text-sm font-medium">UK Tax Year {currentTaxYear}</p>
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
              <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200 shadow-sm">
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

              {cgtAssetType === 'standard' && (
                <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200 shadow-sm">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Your Income Tax Band</label>
                  <p className="text-[11px] text-gray-500 mb-3">Standard-rate CGT depends on whether this gain falls in your basic or higher/additional rate band — this isn&apos;t something Okleevo tracks for you, so pick the one that applies.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setCgtIncomeBand('basic')}
                      className={`p-3 rounded-xl border-2 transition-all font-bold text-sm ${cgtIncomeBand === 'basic' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}`}
                    >
                      Basic Rate (18%)
                    </button>
                    <button
                      onClick={() => setCgtIncomeBand('higher')}
                      className={`p-3 rounded-xl border-2 transition-all font-bold text-sm ${cgtIncomeBand === 'higher' ? 'bg-orange-600 border-orange-600 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'}`}
                    >
                      Higher/Additional Rate (24%)
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-200/50">
                  <label className="block text-sm font-bold text-orange-900 mb-2">Disposal Value</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 font-bold">$</span>
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
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold">$</span>
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
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
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
                const rate = cgtAssetType === 'badr' ? 0.14 : (cgtIncomeBand === 'basic' ? 0.18 : 0.24);
                const taxDue = taxableGain * rate;

                return (
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Estimated Gain Breakdown</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${cgtAssetType === 'badr' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                        {cgtAssetType === 'badr' ? 'BADR Applied (14%)' : `Standard Rate (${(rate * 100).toFixed(0)}%)`}
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Gain</span>
                        <span className="font-bold text-gray-900">${totalGain.toLocaleString('en-GB', {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-orange-600">Annual Exempt Amount ({currentTaxYear})</span>
                        <span className="font-bold text-orange-600">-${aeAmount.toLocaleString('en-GB', {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Taxable Gain</span>
                        <span className="text-xl font-black text-gray-900">${taxableGain.toLocaleString('en-GB', {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className={`p-4 rounded-xl border mt-2 ${cgtAssetType === 'badr' ? 'bg-purple-50 border-purple-100' : 'bg-orange-50 border-orange-100'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-sm font-medium ${cgtAssetType === 'badr' ? 'text-purple-800' : 'text-orange-800'}`}>
                            Estimated Tax ({rate * 100}%)
                          </span>
                          <span className={`text-lg font-black ${cgtAssetType === 'badr' ? 'text-purple-900' : 'text-orange-900'}`}>
                            ${taxDue.toLocaleString('en-GB', {minimumFractionDigits: 2})}
                          </span>
                        </div>
                        <p className={`text-[10px] italic ${cgtAssetType === 'badr' ? 'text-purple-700' : 'text-orange-700'}`}>
                          * {cgtAssetType === 'badr' ? 'BADR relief applied (Lifetime limit $1m).' : `Based on ${currentTaxYear} ${cgtIncomeBand} rate (${(rate * 100).toFixed(0)}%), as selected above.`}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Important Update:</strong> Following Autumn Budget 2024, standard CGT rates are now aligned at <strong>18% and 24%</strong> for the 2025/26 tax year. BADR rate has increased to <strong>14%</strong>.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setShowCGTCalculatorModal(false)}
                className="w-full py-4 bg-linear-to-r from-orange-600 to-rose-600 text-white font-bold rounded-xl hover:shadow-xl transition-all cursor-pointer"
              >
                Close Calculator
              </button>
            </div>
          </div>
        </div>
      )}
       {/* MTD Learn More Modal */}
       {showMTDLearnMoreModal && (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative transform animate-in zoom-in-95 duration-300">
             <button 
               onClick={() => setShowMTDLearnMoreModal(false)}
               className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
             >
               <X className="w-5 h-5 text-gray-400" />
             </button>
             
             <div className="text-center mb-8">
               <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-600 rotate-3">
                 <ShieldCheck className="w-10 h-10" />
               </div>
               <h2 className="text-2xl font-black text-gray-900 tracking-tight">Understanding MTD Compliance</h2>
               <p className="text-gray-500 mt-2 font-medium">Making Tax Digital is an HMRC initiative to modernize the UK tax system.</p>
             </div>
 
             <div className="space-y-6 mb-8">
               <div className="flex gap-4">
                 <div className="bg-blue-50 p-2 rounded-lg h-fit group-hover:bg-blue-600 transition-colors">
                   <Globe className="w-5 h-5 text-blue-600 group-hover:text-white" />
                 </div>
                 <div>
                   <p className="font-bold text-gray-900 leading-none mb-1">Digital Records, Ready to File</p>
                   <p className="text-sm text-gray-600 leading-relaxed font-medium">Okleevo keeps digital records of your income and expenses and generates computation packs — you or your accountant file these with HMRC using their own MTD-recognized software. Okleevo does not submit directly to HMRC.</p>
                 </div>
               </div>
               <div className="flex gap-4">
                 <div className="bg-emerald-50 p-2 rounded-lg h-fit">
                   <Shield className="w-5 h-5 text-emerald-600" />
                 </div>
                 <div>
                   <p className="font-bold text-gray-900 leading-none mb-1">Standardized Records</p>
                   <p className="text-sm text-gray-600 leading-relaxed font-medium">Maintains digital records for at least six years as mandated by HMRC regulations.</p>
                 </div>
               </div>
               <div className="flex gap-4">
                 <div className="bg-purple-50 p-2 rounded-lg h-fit">
                   <CheckCircle className="w-5 h-5 text-purple-600" />
                 </div>
                 <div>
                   <p className="font-bold text-gray-900 leading-none mb-1">Not a Substitute for Filing Software</p>
                   <p className="text-sm text-gray-600 leading-relaxed font-medium">Okleevo is not on HMRC&apos;s list of recognized MTD software. If you&apos;re VAT-registered or filing Income Tax under MTD, you&apos;ll still need HMRC-recognized bridging or filing software — your accountant can advise.</p>
                 </div>
               </div>
             </div>
 
             <button
               onClick={() => setShowMTDLearnMoreModal(false)}
               className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-gray-900/10"
             >
               Got it, thanks!
             </button>
           </div>
         </div>
       )}

      {/* How Do I Actually File This — honest, per-tax-type filing guide */}
      {showFilingGuideModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-black text-gray-900">How Do I Actually File This?</h2>
                <p className="text-xs text-gray-500 mt-0.5">Okleevo computes your figures — it does not submit anything to HMRC. Here&apos;s the real path for each tax type.</p>
              </div>
              <button onClick={() => setShowFilingGuideModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer shrink-0">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                <p className="text-sm font-bold text-rose-900 mb-1">VAT Returns</p>
                <p className="text-xs text-rose-800 leading-relaxed">
                  Since April 2022, almost every VAT-registered business must file through <strong>HMRC-recognized MTD software</strong> — the old manual gov.uk form isn&apos;t available to most businesses anymore. Download the VAT Return from this app and import it into your accountant&apos;s software or an HMRC-recognized bridging tool.
                </p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <p className="text-sm font-bold text-amber-900 mb-1">Self Assessment</p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  You can still file directly on gov.uk yourself <strong>if you&apos;re not yet inside Making Tax Digital for Income Tax</strong> (being phased in by income level from April 2026 onward). If you are in scope, you&apos;ll need MTD-compatible software instead. Ask your accountant which applies to you.
                </p>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <p className="text-sm font-bold text-emerald-900 mb-1">Corporation Tax (CT600)</p>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Corporation Tax isn&apos;t part of Making Tax Digital the way VAT and Income Tax are. Many companies can still file directly through <strong>HMRC&apos;s own free CT600 online service</strong>, or via an accountant using commercial filing software.
                </p>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed pt-1">
                Rules change and vary by business — this is a general guide, not advice for your specific situation. Confirm what applies to you with your accountant or HMRC directly.
              </p>
            </div>
            <div className="p-5 border-t border-gray-100 shrink-0">
              <button onClick={() => setShowFilingGuideModal(false)} className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl transition-colors cursor-pointer">
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-200 pointer-events-none w-[calc(100%-2rem)] sm:w-auto max-w-sm"
          >
            <div className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-gray-900 text-white'
                : 'bg-red-600 text-white'
            }`}>
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-200 shrink-0" />
              )}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
