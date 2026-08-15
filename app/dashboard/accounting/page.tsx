"use client";

import { useState, type ComponentType } from "react";
import {
  Calculator,
  Plus,
  Download,
  Eye,
  Edit3,
  Trash2,
  TrendingUp,
  FileText,
  Calendar,
  BarChart3,
  PieChart,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertCircle,
  Printer,
  Save,
  X,
  FileCheck,
  Search,
  Filter,
  Users,
  Building2,
  Landmark,
  Undo2,
} from "lucide-react";
import useSWR, { mutate as globalMutate } from "swr";
import accounting from "accounting";
import { AccountingSummary } from "@/components/dashboard/accounting/AccountingSummary";
import TourProvider from "@/components/tours/TourProvider";
import { accountingTourSteps } from "./tour-steps";
import { ModuleGuideBanner } from "@/components/tours/ModuleGuideBanner";
import { ChartOfAccounts } from "@/components/dashboard/accounting/ChartOfAccounts";
import { JournalEntries } from "@/components/dashboard/accounting/JournalEntries";
import { jsPDF } from "jspdf";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  category: string;
  balance: number;
  lastTransaction?: Date;
  isCashAccount?: boolean;
}

interface Transaction {
  id: string;
  date: Date | string;
  description: string;
  reference?: string;
  status: string;
  entries: {
    debit: number;
    credit: number;
    accountId: string;
    account: { id: string; name: string };
  }[];
}

interface ReportRow { label: string; amount: number; }
interface ReportSection { heading: string; rows: ReportRow[]; total: number; totalLabel: string; }
interface ReportDocument { title: string; sections: ReportSection[]; summaryLines: ReportRow[]; note?: string; }

// Separate impure logic from the React component to avoid render-purity errors
const exportAccountingData = (
  reportType: string,
  format: "CSV" | "Excel" | "PDF",
  isAccounts: boolean,
  accounts: Account[],
  recentTransactions: Transaction[]
) => {
  if (format === "PDF") {
    const doc = new jsPDF();

    doc.setFillColor(63, 81, 181);
    doc.rect(0, 0, 210, 40, "F");

    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Okleevo", 14, 25);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Professional Accounting Services", 14, 33);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const displayTitle = reportType.replace(/_/g, " ");
    doc.text(displayTitle, 14, 55);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    const timestamp = new Date().toLocaleString();
    const refId = Math.random().toString(36).substring(2, 9).toUpperCase();
    doc.text(`Generated: ${timestamp}`, 14, 63);
    doc.text(`Reference: OKL-${refId}`, 14, 68);

    doc.setDrawColor(230);
    doc.line(14, 75, 196, 75);

    let y = 85;
    doc.setFontSize(9);
    doc.setTextColor(0);

    if (isAccounts) {
      doc.setFillColor(245, 247, 250);
      doc.rect(14, y - 6, 182, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.text("CODE", 16, y);
      doc.text("ACCOUNT NAME", 40, y);
      doc.text("TYPE", 120, y);
      doc.text("BALANCE", 170, y);
      y += 10;
      doc.setFont("helvetica", "normal");

      accounts.forEach((acc: Account, idx: number) => {
        if (y > 270) { doc.addPage(); y = 20; }
        if (idx % 2 === 0) {
          doc.setFillColor(252, 252, 252);
          doc.rect(14, y - 5, 182, 7, "F");
        }
        doc.text(acc.code, 16, y);
        doc.text(acc.name, 40, y);
        doc.text(acc.type, 120, y);
        doc.text(accounting.formatMoney(acc.balance, "£"), 170, y);
        y += 7;
      });
    } else {
      doc.setFillColor(245, 247, 250);
      doc.rect(14, y - 6, 182, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.text("DATE", 16, y);
      doc.text("DESCRIPTION", 40, y);
      doc.text("REF", 120, y);
      doc.text("DEBIT", 150, y);
      doc.text("CREDIT", 175, y);
      y += 10;
      doc.setFont("helvetica", "normal");

      recentTransactions.forEach((tx: Transaction, idx: number) => {
        if (y > 270) { doc.addPage(); y = 20; }
        if (idx % 2 === 0) {
          doc.setFillColor(252, 252, 252);
          doc.rect(14, y - 5, 182, 7, "F");
        }
        doc.text(new Date(tx.date).toLocaleDateString(), 16, y);
        doc.text(tx.description.substring(0, 40), 40, y);
        doc.text(tx.reference || "-", 120, y);
        doc.text(tx.entries[0]?.debit > 0 ? accounting.formatMoney(tx.entries[0].debit, "") : "-", 150, y);
        doc.text(tx.entries[1]?.credit > 0 ? accounting.formatMoney(tx.entries[1].credit, "") : "-", 175, y);
        y += 7;
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Okleevo | Financial Document | Page ${i} of ${pageCount}`, 105, 285, { align: "center" });
    }

    doc.save(`Okleevo_Accounting_Data_${Date.now()}.pdf`);
  } else if (format === "Excel") {
    let xmlContent = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Accounting Data">
  <Table>`;

    if (isAccounts) {
      xmlContent += `<Row>
        <Cell><Data ss:Type="String">Account Code</Data></Cell>
        <Cell><Data ss:Type="String">Name</Data></Cell>
        <Cell><Data ss:Type="String">Type</Data></Cell>
        <Cell><Data ss:Type="String">Balance</Data></Cell>
      </Row>`;
      accounts.forEach((acc: Account) => {
        xmlContent += `<Row>
          <Cell><Data ss:Type="String">${acc.code}</Data></Cell>
          <Cell><Data ss:Type="String">${acc.name}</Data></Cell>
          <Cell><Data ss:Type="String">${acc.type}</Data></Cell>
          <Cell><Data ss:Type="Number">${acc.balance}</Data></Cell>
        </Row>`;
      });
    } else {
      xmlContent += `<Row>
        <Cell><Data ss:Type="String">Date</Data></Cell>
        <Cell><Data ss:Type="String">Description</Data></Cell>
        <Cell><Data ss:Type="String">Reference</Data></Cell>
        <Cell><Data ss:Type="String">Debit Account</Data></Cell>
        <Cell><Data ss:Type="String">Debit Amount</Data></Cell>
        <Cell><Data ss:Type="String">Credit Account</Data></Cell>
        <Cell><Data ss:Type="String">Credit Amount</Data></Cell>
      </Row>`;
      recentTransactions.forEach((tx: Transaction) => {
        xmlContent += `<Row>
          <Cell><Data ss:Type="String">${new Date(tx.date).toLocaleDateString()}</Data></Cell>
          <Cell><Data ss:Type="String">${tx.description}</Data></Cell>
          <Cell><Data ss:Type="String">${tx.reference || ""}</Data></Cell>
          <Cell><Data ss:Type="String">${tx.entries[0]?.account.name}</Data></Cell>
          <Cell><Data ss:Type="Number">${tx.entries[0]?.debit}</Data></Cell>
          <Cell><Data ss:Type="String">${tx.entries[1]?.account.name}</Data></Cell>
          <Cell><Data ss:Type="Number">${tx.entries[1]?.credit}</Data></Cell>
        </Row>`;
      });
    }

    xmlContent += `</Table></Worksheet></Workbook>`;

    const blob = new Blob([xmlContent], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Okleevo_Accounting_Data_${Date.now()}.xls`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    let csvContent = "sep=,\n";
    if (isAccounts) {
      csvContent += "Account Code,Name,Type,Balance\n";
      accounts.forEach((acc: Account) => {
        csvContent += `"${acc.code}","${acc.name}","${acc.type}","${acc.balance}"\n`;
      });
    } else {
      csvContent += "Date,Description,Reference,Debit Account,Debit Amount,Credit Account,Credit Amount\n";
      recentTransactions.forEach((tx: Transaction) => {
        csvContent += `"${new Date(tx.date).toLocaleDateString()}","${tx.description}","${tx.reference || ""}","${tx.entries[0]?.account.name}","${tx.entries[0]?.debit}","${tx.entries[1]?.account.name}","${tx.entries[1]?.credit}"\n`;
      });
    }

    const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Okleevo_Accounting_Data_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const exportReportPDF = (report: ReportDocument) => {
  const doc = new jsPDF();
  doc.setFillColor(63, 81, 181);
  doc.rect(0, 0, 210, 40, "F");
  doc.setFontSize(24); doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold");
  doc.text("Okleevo", 14, 25);
  doc.setFontSize(12); doc.setFont("helvetica", "normal");
  doc.text("Professional Accounting Services", 14, 33);

  doc.setTextColor(0, 0, 0); doc.setFontSize(18); doc.setFont("helvetica", "bold");
  doc.text(report.title, 14, 55);
  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 63);
  doc.setDrawColor(230); doc.line(14, 70, 196, 70);

  let y = 82;
  doc.setTextColor(0);
  report.sections.forEach((section) => {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(12);
    doc.text(section.heading, 14, y); y += 7;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    section.rows.forEach((r) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(r.label, 18, y);
      doc.text(`£${r.amount.toLocaleString()}`, 196, y, { align: "right" });
      y += 6;
    });
    doc.setDrawColor(240); doc.line(14, y - 2, 196, y - 2);
    doc.setFont("helvetica", "bold");
    doc.text(section.totalLabel, 18, y + 3);
    doc.text(`£${section.total.toLocaleString()}`, 196, y + 3, { align: "right" });
    y += 12;
    doc.setFont("helvetica", "normal");
  });

  if (report.summaryLines.length > 0) {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFillColor(239, 246, 255); doc.rect(14, y - 6, 182, report.summaryLines.length * 7 + 6, "F");
    report.summaryLines.forEach((l) => {
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(0);
      doc.text(l.label, 18, y);
      doc.text(`£${l.amount.toLocaleString()}`, 192, y, { align: "right" });
      y += 7;
    });
    y += 6;
  }

  if (report.note) {
    doc.setFont("helvetica", "italic"); doc.setFontSize(8); doc.setTextColor(120);
    const split = doc.splitTextToSize(report.note, 180);
    doc.text(split, 14, y);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8); doc.setTextColor(150);
    doc.text(`Okleevo | Financial Document | Page ${i} of ${pageCount}`, 105, 285, { align: "center" });
  }

  doc.save(`Okleevo_${report.title.replace(/\s+/g, "_")}_${Date.now()}.pdf`);
};

const exportReportCSV = (report: ReportDocument) => {
  let csv = `${report.title}\nGenerated: ${new Date().toLocaleString()}\n\n`;
  report.sections.forEach((section) => {
    csv += `${section.heading}\n`;
    section.rows.forEach((r) => { csv += `"${r.label}",£${r.amount}\n`; });
    csv += `"${section.totalLabel}",£${section.total}\n\n`;
  });
  if (report.summaryLines.length > 0) {
    report.summaryLines.forEach((l) => { csv += `"${l.label}",£${l.amount}\n`; });
  }
  if (report.note) csv += `\n"${report.note.replace(/"/g, '""')}"\n`;
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${report.title.replace(/\s+/g, "_")}_${Date.now()}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const exportReportExcel = (report: ReportDocument) => {
  let xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="${report.title.slice(0, 31)}">
  <Table>`;
  xml += `<Row><Cell><Data ss:Type="String">${report.title}</Data></Cell></Row>`;
  report.sections.forEach((section) => {
    xml += `<Row><Cell><Data ss:Type="String">${section.heading}</Data></Cell></Row>`;
    section.rows.forEach((r) => {
      xml += `<Row><Cell><Data ss:Type="String">${r.label}</Data></Cell><Cell><Data ss:Type="Number">${r.amount}</Data></Cell></Row>`;
    });
    xml += `<Row><Cell><Data ss:Type="String">${section.totalLabel}</Data></Cell><Cell><Data ss:Type="Number">${section.total}</Data></Cell></Row>`;
  });
  report.summaryLines.forEach((l) => {
    xml += `<Row><Cell><Data ss:Type="String">${l.label}</Data></Cell><Cell><Data ss:Type="Number">${l.amount}</Data></Cell></Row>`;
  });
  xml += `</Table></Worksheet></Workbook>`;
  const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${report.title.replace(/\s+/g, "_")}_${Date.now()}.xls`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Shared field styles
const inputCls =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

const ACCOUNT_COLORS: Record<string, { pill: string; border: string }> = {
  asset:     { pill: "bg-blue-100 text-blue-700",   border: "border-blue-400" },
  liability: { pill: "bg-red-100 text-red-700",     border: "border-red-400" },
  equity:    { pill: "bg-purple-100 text-purple-700", border: "border-purple-400" },
  revenue:   { pill: "bg-green-100 text-green-700",  border: "border-green-400" },
  expense:   { pill: "bg-orange-100 text-orange-700", border: "border-orange-400" },
};

// Journal entry status is stored as an uppercase Prisma enum (DRAFT/PENDING/POSTED/VOID) —
// always normalize with .toLowerCase() before looking this up.
const JOURNAL_STATUS_PILL: Record<string, string> = {
  posted:  "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  draft:   "bg-blue-100 text-blue-700",
  void:    "bg-gray-100 text-gray-500",
};

// ── Shared Modal Shell ──────────────────────────────────────────
const ModalShell = ({ onClose, title, icon: Icon, iconColor = "text-blue-600", children }: {
  onClose: () => void;
  title: string;
  icon: ComponentType<{ className?: string }>;
  iconColor?: string;
  children: React.ReactNode;
}) => (
  <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-100 p-0 sm:p-4">
    <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl">
      <div className="flex justify-center pt-3 pb-1 sm:hidden">
        <div className="w-10 h-1 rounded-full bg-gray-200" />
      </div>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          {title}
        </h2>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center">
          <X className="w-5 h-5 text-gray-400 cursor-pointer" />
        </button>
      </div>
      <div className="p-5 space-y-4 pb-20 sm:pb-10">
        {children}
      </div>
    </div>
  </div>
);

// ── Entry Form Interfaces ───────────────────────────────────────
interface NewEntryState {
  date: string;
  description: string;
  reference: string;
  debitAccount: string;
  debitAmount: string;
  creditAccount: string;
  creditAmount: string;
}

interface EntryFormProps {
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
  newEntry: NewEntryState;
  setNewEntry: React.Dispatch<React.SetStateAction<NewEntryState>>;
  accounts: Account[];
  isBalanced: boolean;
  onSeedAccounts?: () => void;
}

// ── Entry Form ──────────────────────────────────────────────────
const EntryForm = ({ onSave, onCancel, saveLabel = "Save Entry", newEntry, setNewEntry, accounts, isBalanced, onSeedAccounts }: EntryFormProps) => {
  if (accounts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-5 text-center space-y-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-1">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-gray-900">Setup Required: Chart of Accounts</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              To record journal entries, you need active accounts in your Chart of Accounts (Assets, Liabilities, Equity, Revenue, Expenses).
            </p>
          </div>
          {onSeedAccounts && (
            <button
              onClick={onSeedAccounts}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 cursor-pointer" /> Setup Default Accounts
            </button>
          )}
        </div>
        <div className="pt-2 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-2">
          <button
            onClick={onCancel}
            className="w-full py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Date *</label>
          <input type="date" value={newEntry.date} onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Reference</label>
          <input type="text" value={newEntry.reference} onChange={(e) => setNewEntry({ ...newEntry, reference: e.target.value })} placeholder="e.g. JE-001" className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Description *</label>
        <textarea value={newEntry.description} onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })} placeholder="Transaction description..." rows={2} className={`${inputCls} resize-none`} />
      </div>

      {/* Debit */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-3">
        <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wide">
          <ArrowUpRight className="w-3.5 h-3.5" /> Debit Entry
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Account *</label>
            <select value={newEntry.debitAccount} onChange={(e) => setNewEntry({ ...newEntry, debitAccount: e.target.value })} className={`${inputCls} cursor-pointer`}>
              <option value="" className="cursor-pointer">Select account…</option>
              {accounts.map((a) => <option key={a.id} value={a.id} className="cursor-pointer">{a.code} — {a.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Amount (£) *</label>
            <input type="number" step="0.01" value={newEntry.debitAmount} onChange={(e) => setNewEntry({ ...newEntry, debitAmount: e.target.value })} placeholder="0.00" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Credit */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-3">
        <p className="text-xs font-bold text-rose-800 flex items-center gap-1.5 uppercase tracking-wide">
          <ArrowDownRight className="w-3.5 h-3.5" /> Credit Entry
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Account *</label>
            <select value={newEntry.creditAccount} onChange={(e) => setNewEntry({ ...newEntry, creditAccount: e.target.value })} className={`${inputCls} cursor-pointer`}>
              <option value="" className="cursor-pointer">Select account…</option>
              {accounts.map((a) => <option key={a.id} value={a.id} className="cursor-pointer">{a.code} — {a.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Amount (£) *</label>
            <input type="number" step="0.01" value={newEntry.creditAmount} onChange={(e) => setNewEntry({ ...newEntry, creditAmount: e.target.value })} placeholder="0.00" className={inputCls} />
          </div>
        </div>
      </div>

      {newEntry.debitAmount && newEntry.creditAmount && (
        <div className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold ${isBalanced ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
          {isBalanced
            ? <><CheckCircle className="w-4 h-4 shrink-0" /> Entry is balanced</>
            : <><AlertCircle className="w-4 h-4 shrink-0" /> Difference: £{Math.abs(parseFloat(newEntry.debitAmount) - parseFloat(newEntry.creditAmount)).toFixed(2)}</>}
        </div>
      )}

      <div className="sticky bottom-0 -mx-5 px-5 pt-4 pb-8 sm:pb-6 bg-white border-t border-gray-100 flex flex-row gap-3 mb-1.5 sm:mb-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
        <button onClick={onCancel} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
        <button onClick={onSave} className="flex-2 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
          <Save className="w-4 h-4" /> {saveLabel}
        </button>
      </div>
    </>
  );
};

// ── Account Type Selector Interfaces ────────────────────────────
interface NewAccountState {
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  description: string;
  openingBalance: string;
  isCashAccount: boolean;
}

interface AccountTypeSelectorProps {
  newAccount: NewAccountState;
  setNewAccount: React.Dispatch<React.SetStateAction<NewAccountState>>;
}

// ── Account Type Selector ───────────────────────────────────────
const AccountTypeSelector = ({ newAccount, setNewAccount }: AccountTypeSelectorProps) => (
  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
    {(["asset", "liability", "equity", "revenue", "expense"] as const).map((t) => {
      const c = ACCOUNT_COLORS[t];
      return (
        <button key={t} onClick={() => setNewAccount({ ...newAccount, type: t })}
          className={`py-2.5 rounded-xl border-2 text-xs font-bold capitalize transition-all cursor-pointer ${newAccount.type === t ? `${c.pill} ${c.border}` : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
          {t}
        </button>
      );
    })}
  </div>
);

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [journalSearchQuery, setJournalSearchQuery] = useState("");
  const [journalStatusFilter, setJournalStatusFilter] = useState<"all" | "draft" | "pending" | "posted" | "void">("all");
  const [showJournalFilterMenu, setShowJournalFilterMenu] = useState(false);
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showViewAccountModal, setShowViewAccountModal] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [showViewEntryModal, setShowViewEntryModal] = useState(false);
  const [showEditEntryModal, setShowEditEntryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showYearEndModal, setShowYearEndModal] = useState(false);
  const [showYearEndCloseConfirm, setShowYearEndCloseConfirm] = useState(false);
  const [closingYearEnd, setClosingYearEnd] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "account" | "entry"; id: string } | null>(null);
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [selectedExportFormat, setSelectedExportFormat] = useState<"CSV" | "Excel" | "PDF">("CSV");

  const [newEntry, setNewEntry] = useState<NewEntryState>({
    date: new Date().toISOString().split("T")[0],
    description: "",
    reference: "",
    debitAccount: "",
    debitAmount: "",
    creditAccount: "",
    creditAmount: "",
  });
  const [newAccount, setNewAccount] = useState<NewAccountState>({
    code: "",
    name: "",
    type: "asset",
    description: "",
    openingBalance: "",
    isCashAccount: false,
  });

  const { data: accountsData } = useSWR("/api/accounting/accounts", fetcher);
  const { data: journalData } = useSWR("/api/accounting/journal", fetcher);

  const accounts: Account[] = accountsData?.data || [];
  const recentTransactions: Transaction[] = journalData?.data || [];

  const financialSummary = {
    totalAssets:      accounts.filter((a) => a.type === "asset").reduce((s, a) => s + a.balance, 0),
    totalLiabilities: accounts.filter((a) => a.type === "liability").reduce((s, a) => s + a.balance, 0),
    totalEquity:      accounts.filter((a) => a.type === "equity").reduce((s, a) => s + a.balance, 0),
    totalRevenue:     accounts.filter((a) => a.type === "revenue").reduce((s, a) => s + a.balance, 0),
    totalExpenses:    accounts.filter((a) => a.type === "expense").reduce((s, a) => s + a.balance, 0),
    netProfit: 0,
  };
  financialSummary.netProfit = financialSummary.totalRevenue - financialSummary.totalExpenses;

  const trialBalanceDebitTotal = accounts.filter((a) => ["asset", "expense"].includes(a.type)).reduce((s, a) => s + a.balance, 0);
  const trialBalanceCreditTotal = accounts.filter((a) => ["liability", "equity", "revenue"].includes(a.type)).reduce((s, a) => s + a.balance, 0);
  const trialBalanceIsBalanced = Math.abs(trialBalanceDebitTotal - trialBalanceCreditTotal) < 0.005;

  const filteredJournalEntries = recentTransactions.filter((tx) => {
    const q = journalSearchQuery.toLowerCase();
    const matchesSearch = !q || tx.description.toLowerCase().includes(q) || (tx.reference?.toLowerCase().includes(q) ?? false);
    const matchesStatus = journalStatusFilter === "all" || tx.status.toLowerCase() === journalStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const tabs = [
    { id: "overview",          name: "Overview",          icon: BarChart3  },
    { id: "chart-of-accounts", name: "Chart of Accounts", icon: BookOpen   },
    { id: "journal",           name: "Journal",           icon: FileText   },
    { id: "trial-balance",     name: "Trial Balance",     icon: Calculator },
    { id: "reports",           name: "Reports",           icon: PieChart   },
    { id: "year-end",          name: "Year-End",          icon: Calendar   },
  ];

  const showToastMsg = (msg: string, type: "success" | "error" = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetEntry = () =>
    setNewEntry({ date: new Date().toISOString().split("T")[0], description: "", reference: "", debitAccount: "", debitAmount: "", creditAccount: "", creditAmount: "" });

  const handleSaveEntry = async () => {
    if (!newEntry.description || !newEntry.debitAccount || !newEntry.creditAccount || !newEntry.debitAmount || !newEntry.creditAmount) {
      showToastMsg("Please fill in all required fields", "error");
      return;
    }
    if (parseFloat(newEntry.debitAmount) !== parseFloat(newEntry.creditAmount)) {
      showToastMsg("Debit and Credit amounts must be equal", "error");
      return;
    }
    try {
      const isEdit = showEditEntryModal && selectedEntry;
      const url = isEdit ? `/api/accounting/journal/${selectedEntry.id}` : "/api/accounting/journal";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: newEntry.date,
          description: newEntry.description,
          reference: newEntry.reference,
          entries: [
            { accountId: newEntry.debitAccount, debit: parseFloat(newEntry.debitAmount), credit: 0 },
            { accountId: newEntry.creditAccount, debit: 0, credit: parseFloat(newEntry.creditAmount) }
          ]
        })
      });
      if (res.ok) {
        resetEntry();
        setShowNewEntryModal(false);
        setShowEditEntryModal(false);
        setSelectedEntry(null);
        globalMutate("/api/accounting/journal");
        globalMutate("/api/accounting/accounts");
        showToastMsg(isEdit ? "Journal entry updated successfully" : "Journal entry saved successfully");
      } else {
        const err = await res.json();
        showToastMsg(err.error || "Failed to save entry", "error");
      }
    } catch (err) {
      console.error("Save entry error:", err);
      showToastMsg("Failed to save entry", "error");
    }
  };

  const handleSeedAccounts = async () => {
    const defaultAccounts = [
      { code: "1200", name: "Bank Current Account", type: "ASSET", category: "Cash and Cash Equivalents", isCashAccount: true },
      { code: "1100", name: "Accounts Receivable", type: "ASSET", category: "Current Assets" },
      { code: "2100", name: "Accounts Payable", type: "LIABILITY", category: "Current Liabilities" },
      { code: "4000", name: "Sales Revenue", type: "REVENUE", category: "Operating Revenue" },
      { code: "7000", name: "General Expenses", type: "EXPENSE", category: "Operating Expenses" },
      { code: "3000", name: "Retained Earnings", type: "EQUITY", category: "Equity" },
    ];

    try {
      for (const acc of defaultAccounts) {
        await fetch("/api/accounting/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(acc)
        });
      }
      globalMutate("/api/accounting/accounts");
      showToastMsg("Default Chart of Accounts initialized!");
    } catch (err) {
      console.error("Seed accounts error:", err);
    }
  };

  const handleSaveAccount = async () => {
    if (!newAccount.code || !newAccount.name) {
      showToastMsg("Please fill in all required fields", "error");
      return;
    }
    try {
      const isEdit = showEditAccountModal && selectedAccount;
      const url = isEdit ? `/api/accounting/accounts/${selectedAccount.id}` : "/api/accounting/accounts";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newAccount.code,
          name: newAccount.name,
          type: newAccount.type,
          description: newAccount.description,
          category: newAccount.type.toUpperCase(),
          openingBalance: newAccount.openingBalance,
          isCashAccount: newAccount.isCashAccount,
        })
      });
      if (res.ok) {
        setNewAccount({ code: "", name: "", type: "asset", description: "", openingBalance: "", isCashAccount: false });
        setShowAddAccountModal(false);
        setShowEditAccountModal(false);
        setSelectedAccount(null);
        globalMutate("/api/accounting/accounts");
        globalMutate("/api/accounting/journal");
        showToastMsg(isEdit ? "Account updated successfully" : "Account created successfully");
      } else {
        const err = await res.json();
        showToastMsg(err.error || "Failed to save account", "error");
      }
    } catch (err) {
      console.error("Save account error:", err);
      showToastMsg("Failed to save account", "error");
    }
  };

  const handleViewAccount  = (a: Account) => { setSelectedAccount(a); setShowViewAccountModal(true); };
  const handleEditAccount  = (a: Account) => {
    setSelectedAccount(a);
    setNewAccount({ code: a.code, name: a.name, type: a.type as never, description: "", openingBalance: a.balance.toString(), isCashAccount: Boolean(a.isCashAccount) });
    setShowEditAccountModal(true);
  };
  const handleViewEntry    = (e: Transaction) => { setSelectedEntry(e); setShowViewEntryModal(true); };
  const handleEditEntry    = (e: Transaction) => {
    setSelectedEntry(e);
    setNewEntry({
      date: new Date(e.date).toISOString().split("T")[0],
      description: e.description,
      reference: e.reference || "",
      debitAccount: e.entries[0]?.accountId || "",
      debitAmount:  (e.entries[0]?.debit  || 0).toString(),
      creditAccount: e.entries[1]?.accountId || "",
      creditAmount:  (e.entries[1]?.credit || 0).toString(),
    });
    setShowEditEntryModal(true);
  };
  const handleDeleteClick   = (type: "account" | "entry", id: string) => { setDeleteTarget({ type, id }); setShowDeleteModal(true); };
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const url = deleteTarget.type === "account"
        ? `/api/accounting/accounts/${deleteTarget.id}`
        : `/api/accounting/journal/${deleteTarget.id}`;
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToastMsg(`${deleteTarget.type === "account" ? "Account" : "Entry"} deleted`);
        globalMutate("/api/accounting/accounts");
        globalMutate("/api/accounting/journal");
      } else {
        showToastMsg(data.error || "Failed to delete", "error");
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToastMsg("Failed to delete", "error");
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleReverseEntry = async (entry: Transaction) => {
    try {
      const res = await fetch(`/api/accounting/journal/${entry.id}/reverse`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToastMsg("Reversing entry posted");
        globalMutate("/api/accounting/journal");
        globalMutate("/api/accounting/accounts");
      } else {
        showToastMsg(data.error || "Failed to reverse entry", "error");
      }
    } catch (err) {
      console.error("Reverse entry error:", err);
      showToastMsg("Failed to reverse entry", "error");
    }
  };

  const handleExportReport = (reportType: string) => {
    exportAccountingData(reportType, selectedExportFormat, activeTab === "chart-of-accounts", accounts, recentTransactions);
    showToastMsg(`Exported as ${selectedExportFormat}`);
  };

  // Prefer the explicit isCashAccount flag; fall back to category/name matching for
  // accounts created before that field existed, so nothing that worked before regresses.
  const isCashAccount = (a: Account) =>
    a.isCashAccount === true ||
    a.category?.toLowerCase().includes("cash") ||
    /bank|cash|paypal|stripe/i.test(a.name);

  const buildProfitAndLossReport = (): ReportDocument => {
    const revenueRows = accounts.filter((a) => a.type === "revenue").map((a) => ({ label: a.name, amount: a.balance }));
    const expenseRows = accounts.filter((a) => a.type === "expense").map((a) => ({ label: a.name, amount: a.balance }));
    const totalRevenue = revenueRows.reduce((s, r) => s + r.amount, 0);
    const totalExpenses = expenseRows.reduce((s, r) => s + r.amount, 0);
    return {
      title: "Profit & Loss Statement",
      sections: [
        { heading: "Revenue", rows: revenueRows, total: totalRevenue, totalLabel: "Total Revenue" },
        { heading: "Expenses", rows: expenseRows, total: totalExpenses, totalLabel: "Total Expenses" },
      ],
      summaryLines: [{ label: "Net Profit", amount: totalRevenue - totalExpenses }],
    };
  };

  const buildBalanceSheetReport = (): ReportDocument => {
    const assetRows = accounts.filter((a) => a.type === "asset").map((a) => ({ label: a.name, amount: a.balance }));
    const liabilityRows = accounts.filter((a) => a.type === "liability").map((a) => ({ label: a.name, amount: a.balance }));
    const equityRows = accounts.filter((a) => a.type === "equity").map((a) => ({ label: a.name, amount: a.balance }));
    // Revenue/Expense aren't Balance Sheet accounts — but until a formal
    // year-end close sweeps them into Retained Earnings, their net (this
    // period's profit) must appear in Equity or Assets ≠ Liabilities + Equity
    // for any business that has actually made a sale.
    if (Math.abs(financialSummary.netProfit) >= 0.005) {
      equityRows.push({ label: "Net Income (Current Period)", amount: financialSummary.netProfit });
    }
    const totalAssets = assetRows.reduce((s, r) => s + r.amount, 0);
    const totalLiabilities = liabilityRows.reduce((s, r) => s + r.amount, 0);
    const totalEquity = equityRows.reduce((s, r) => s + r.amount, 0);
    const balanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.005;
    return {
      title: "Balance Sheet",
      sections: [
        { heading: "Assets", rows: assetRows, total: totalAssets, totalLabel: "Total Assets" },
        { heading: "Liabilities", rows: liabilityRows, total: totalLiabilities, totalLabel: "Total Liabilities" },
        { heading: "Equity", rows: equityRows, total: totalEquity, totalLabel: "Total Equity" },
      ],
      summaryLines: [{ label: "Liabilities + Equity", amount: totalLiabilities + totalEquity }],
      note: balanced
        ? "Assets = Liabilities + Equity — the balance sheet balances."
        : `Out of balance — Assets differ from Liabilities + Equity by £${Math.abs(totalAssets - (totalLiabilities + totalEquity)).toLocaleString()}.`,
    };
  };

  const buildCashFlowReport = (): ReportDocument => {
    const cashAccounts = accounts.filter(isCashAccount);
    const cashIds = new Set(cashAccounts.map((a) => a.id));
    const totalCashPosition = cashAccounts.reduce((s, a) => s + a.balance, 0);

    let operating = 0, investing = 0, financing = 0;
    recentTransactions.forEach((tx) => {
      const debitEntry = tx.entries[0];
      const creditEntry = tx.entries[1];
      if (!debitEntry || !creditEntry) return;
      const debitIsCash = cashIds.has(debitEntry.accountId);
      const creditIsCash = cashIds.has(creditEntry.accountId);
      if (debitIsCash === creditIsCash) return; // both cash (transfer) or neither — no net cash-flow category to assign
      const netCashImpact = debitIsCash ? debitEntry.debit : -creditEntry.credit;
      const otherAccountId = debitIsCash ? creditEntry.accountId : debitEntry.accountId;
      const otherAccount = accounts.find((a) => a.id === otherAccountId);
      if (!otherAccount) return;
      if (["revenue", "expense"].includes(otherAccount.type)) operating += netCashImpact;
      else if (otherAccount.type === "asset") investing += netCashImpact;
      else if (["liability", "equity"].includes(otherAccount.type)) financing += netCashImpact;
    });

    return {
      title: "Cash Flow Statement",
      sections: [
        { heading: "Cash Accounts", rows: cashAccounts.map((a) => ({ label: a.name, amount: a.balance })), total: totalCashPosition, totalLabel: "Total Cash Position" },
      ],
      summaryLines: [
        { label: "Operating Activities", amount: operating },
        { label: "Investing Activities", amount: investing },
        { label: "Financing Activities", amount: financing },
        { label: "Net Change in Cash", amount: operating + investing + financing },
      ],
      note: cashAccounts.length > 0
        ? `Cash accounts identified: ${cashAccounts.map((a) => a.name).join(", ")}. Each transaction is categorized by the type of the other account it touches (Revenue/Expense = Operating, other Assets = Investing, Liabilities/Equity = Financing).`
        : "No cash/bank accounts found — add an account categorized \"Cash and Cash Equivalents\", or with a name containing \"Bank\" or \"Cash\", to enable this statement.",
    };
  };

  const computeReportDocument = (reportType: string): ReportDocument => {
    if (reportType.includes("Balance Sheet")) return buildBalanceSheetReport();
    if (reportType.includes("Cash Flow")) return buildCashFlowReport();
    return buildProfitAndLossReport();
  };

  const handleGenerateReport = (reportType: string) => { setSelectedReport(reportType); setShowReportModal(true); };
  const handleDownloadReport = (fmt: "CSV" | "Excel" | "PDF") => {
    const report = computeReportDocument(selectedReport);
    if (fmt === "PDF") exportReportPDF(report);
    else if (fmt === "Excel") exportReportExcel(report);
    else exportReportCSV(report);
    setShowReportModal(false);
    showToastMsg(`${report.title} exported as ${fmt}`);
  };

  const handleRunYearEndClose = async () => {
    setClosingYearEnd(true);
    try {
      const res = await fetch("/api/accounting/year-end-close", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToastMsg(`Fiscal year closed. £${Number(data.data.netIncome).toLocaleString()} net income moved to Retained Earnings.`);
        globalMutate("/api/accounting/accounts");
        globalMutate("/api/accounting/journal");
        setShowYearEndCloseConfirm(false);
      } else {
        showToastMsg(data.error || "Failed to close fiscal year", "error");
      }
    } catch (err) {
      console.error("Year-end close error:", err);
      showToastMsg("Failed to close fiscal year", "error");
    } finally {
      setClosingYearEnd(false);
    }
  };

  const handleGenerateYearEnd = () => {
    const doc = new jsPDF();

    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 40, "F");
    doc.setFontSize(24); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
    doc.text("Year-End Accounts", 14, 25);
    doc.setFontSize(11); doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 33);

    doc.setTextColor(0, 0, 0);
    let y = 55;

    doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text("Profit & Loss Summary", 14, y);
    y += 8;
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    [
      ["Total Revenue", financialSummary.totalRevenue],
      ["Total Expenses", financialSummary.totalExpenses],
      ["Net Profit", financialSummary.netProfit],
    ].forEach(([label, value]) => {
      doc.text(String(label), 16, y);
      doc.text(`£${Number(value).toLocaleString()}`, 180, y, { align: "right" });
      y += 7;
    });

    y += 8;
    doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text("Balance Sheet Summary", 14, y);
    y += 8;
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    [
      ["Total Assets", financialSummary.totalAssets],
      ["Total Liabilities", financialSummary.totalLiabilities],
      ["Total Equity", financialSummary.totalEquity],
    ].forEach(([label, value]) => {
      doc.text(String(label), 16, y);
      doc.text(`£${Number(value).toLocaleString()}`, 180, y, { align: "right" });
      y += 7;
    });

    y += 8;
    doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text("Trial Balance", 14, y);
    y += 8;
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text("Total Debits", 16, y);
    doc.text(`£${trialBalanceDebitTotal.toLocaleString()}`, 180, y, { align: "right" });
    y += 7;
    doc.text("Total Credits", 16, y);
    doc.text(`£${trialBalanceCreditTotal.toLocaleString()}`, 180, y, { align: "right" });
    y += 10;

    if (trialBalanceIsBalanced) {
      doc.setTextColor(16, 130, 80);
      doc.text("✓ Trial Balance is balanced", 16, y);
    } else {
      doc.setTextColor(190, 30, 30);
      doc.text(`⚠ Trial Balance is NOT balanced — difference of £${Math.abs(trialBalanceDebitTotal - trialBalanceCreditTotal).toLocaleString()}`, 16, y);
    }

    doc.setTextColor(150);
    doc.setFontSize(8);
    doc.text("Okleevo | Year-End Accounts Pack", 105, 285, { align: "center" });

    doc.save(`Okleevo_Year_End_Accounts_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const isBalanced = Boolean(
    newEntry.debitAmount && 
    newEntry.creditAmount &&
    parseFloat(newEntry.debitAmount) === parseFloat(newEntry.creditAmount)
  );



  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8">
      <TourProvider moduleId="accounting" steps={accountingTourSteps} />

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-2xs">
        <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Calculator className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 leading-tight truncate">
                  Accounting &amp; Ledger
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                  UK Double-Entry
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                Chart of accounts, general journal, P&amp;L &amp; Balance Sheet
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
            <ModuleGuideBanner
              moduleId="accounting"
              moduleName="Double-Entry Accounting & Ledger"
              summary="Manage your Chart of Accounts, record general journal entries, reconcile cash positions, and generate statutory P&L, Balance Sheet, and Trial Balance reports."
              tips={[
                "Set up your Chart of Accounts with assets, liabilities, equity, revenues, and expenses",
                "Record double-entry journal entries with matching debit and credit amounts",
                "Export statutory financial statements to PDF or Excel for HMRC tax filing"
              ]}
            />
            <button
              id="tour-accounting-export"
              onClick={() => setShowExportModal(true)}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0"
            >
              <Download className="w-4 h-4 cursor-pointer" />
              <span className="hidden sm:inline cursor-pointer">Export</span>
            </button>
            <button
              id="tour-accounting-new-entry"
              onClick={() => setShowNewEntryModal(true)}
              className="px-3 sm:px-3.5 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-600/20 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 cursor-pointer" />
              <span>New Entry</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div id="tour-accounting-tabs" className="sticky top-[57px] sm:top-[65px] z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 shadow-2xs">
        <div className="flex overflow-x-auto scrollbar-none px-4 sm:px-6 gap-1">
          {tabs.map(({ id, name, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer shrink-0 ${
                  active
                    ? "border-blue-600 text-blue-600 bg-blue-50/40"
                    : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                <Icon className="w-4 h-4 cursor-pointer" />
                <span className="cursor-pointer">{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Page Content ── */}
      <div className="px-4 sm:px-6 py-5 space-y-4 sm:space-y-5">

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <>
            <AccountingSummary data={financialSummary} />

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900">Recent Journal Submissions</h2>
                </div>
                <button onClick={() => setActiveTab("journal")} className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">
                  View all entries &rarr;
                </button>
              </div>
              <div className="p-4 sm:p-5">
                <JournalEntries entries={recentTransactions} onViewEntry={handleViewEntry} onEditEntry={handleEditEntry} onDeleteEntry={(id) => handleDeleteClick("entry", id)} onReverseEntry={handleReverseEntry} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                { tab: "year-end",      icon: FileCheck,  badgeBg: "bg-blue-50 text-blue-600 border-blue-100",   title: "Year-End Accounts Pack", desc: "HMRC-ready financial statement export" },
                { tab: "trial-balance", icon: Calculator, badgeBg: trialBalanceIsBalanced ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100", title: "Trial Balance Check", desc: trialBalanceIsBalanced ? "Debits match Credits (Balanced)" : "Unbalanced - Review entries" },
                { tab: "reports",       icon: PieChart,   badgeBg: "bg-purple-50 text-purple-600 border-purple-100", title: "Financial Reports", desc: "P&L, Balance Sheet & Cash Position" },
              ].map(({ tab, icon: Icon, badgeBg, title, desc }) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex items-center gap-3.5 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all text-left cursor-pointer group"
                >
                  <div className={`p-2.5 rounded-xl border ${badgeBg} shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* CHART OF ACCOUNTS */}
        {activeTab === "chart-of-accounts" && (
          <ChartOfAccounts
            accounts={accounts}
            onAddAccount={() => setShowAddAccountModal(true)}
            onViewAccount={handleViewAccount}
            onEditAccount={handleEditAccount}
            onDeleteAccount={(id) => handleDeleteClick("account", id)}
            onSeedAccounts={handleSeedAccounts}
          />
        )}

        {/* JOURNAL */}
        {activeTab === "journal" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Journal Entries</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Double-entry bookkeeping audit trail</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative hidden sm:block">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search entries…"
                      value={journalSearchQuery}
                      onChange={(e) => setJournalSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none w-44 transition-all text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowJournalFilterMenu((v) => !v)}
                      className={`p-2 sm:px-3 sm:py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-bold ${
                        journalStatusFilter !== "all" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300" : "bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <Filter className="w-4 h-4" />
                      <span className="hidden sm:inline capitalize">{journalStatusFilter === "all" ? "Status Filter" : journalStatusFilter}</span>
                    </button>
                    {showJournalFilterMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowJournalFilterMenu(false)} />
                        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800 py-1 z-50 overflow-hidden">
                          {(["all", "draft", "pending", "posted", "void"] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() => { setJournalStatusFilter(s); setShowJournalFilterMenu(false); }}
                              className={`w-full px-4 py-2 text-left text-xs capitalize cursor-pointer transition-colors ${journalStatusFilter === s ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"}`}
                            >
                              {s === "all" ? "All Statuses" : s}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {filteredJournalEntries.length === 0 ? (
              <div className="py-12 px-4">
                {recentTransactions.length === 0 ? (
                  <div className="bg-gradient-to-br from-indigo-50/90 via-blue-50/50 to-indigo-50/90 dark:from-slate-800/80 dark:to-slate-800/40 border border-indigo-100 dark:border-slate-700 rounded-3xl p-6 sm:p-8 max-w-xl mx-auto text-center space-y-4 shadow-2xs">
                    <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/60 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">No Journal Entries Posted Yet</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Record balanced debits &amp; credits for UK SME double-entry accounting.
                      </p>
                    </div>
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={() => setShowNewEntryModal(true)}
                        className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        <Plus className="w-4 h-4" /> Create First Entry
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No matching journal entries</h3>
                    <p className="text-xs text-gray-400">Try adjusting your search terms or status filter</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredJournalEntries.map((tx) => (
                  <div key={tx.id} className="p-4 sm:p-5 hover:bg-gray-50/60 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2 bg-blue-50 rounded-xl shrink-0">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{tx.description}</p>
                          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(tx.date).toLocaleDateString("en-GB")}
                            </span>
                            {tx.reference && <span className="text-xs text-gray-400">Ref: {tx.reference}</span>}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${JOURNAL_STATUS_PILL[tx.status.toLowerCase()] ?? "bg-gray-100 text-gray-500"}`}>
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button onClick={() => handleViewEntry(tx)} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="View">
                          <Eye className="w-4 h-4 text-blue-500" />
                        </button>
                        {tx.status.toUpperCase() === "POSTED" ? (
                          <button onClick={() => handleReverseEntry(tx)} className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer" title="Reverse Entry">
                            <Undo2 className="w-4 h-4 text-amber-500" />
                          </button>
                        ) : tx.status.toUpperCase() !== "VOID" ? (
                          <>
                            <button onClick={() => handleEditEntry(tx)} className="p-1.5 hover:bg-violet-50 rounded-lg transition-colors cursor-pointer" title="Edit">
                              <Edit3 className="w-4 h-4 text-violet-500" />
                            </button>
                            <button onClick={() => handleDeleteClick("entry", tx.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Debit</span>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate mb-0.5">{tx.entries[0]?.account.name}</p>
                        <p className="text-sm font-bold text-emerald-800">{accounting.formatMoney(tx.entries[0]?.debit || 0, "£")}</p>
                      </div>
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <ArrowDownRight className="w-3 h-3 text-rose-600" />
                          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wide">Credit</span>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate mb-0.5">{tx.entries[1]?.account.name}</p>
                        <p className="text-sm font-bold text-rose-800">{accounting.formatMoney(tx.entries[1]?.credit || 0, "£")}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TRIAL BALANCE */}
        {activeTab === "trial-balance" && (
          <div className="space-y-4">
            {/* Top KPI Audit Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-slate-800 shadow-xs">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Debits</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">£{trialBalanceDebitTotal.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-slate-800 shadow-xs">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Credits</p>
                <p className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">£{trialBalanceCreditTotal.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-slate-800 shadow-xs">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Reconciliation Status</p>
                {accounts.length === 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold mt-1">
                    No Accounts Setup
                  </span>
                ) : trialBalanceIsBalanced ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-xs font-bold mt-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Balanced ✓
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200/60 rounded-full text-xs font-bold mt-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Unbalanced (£{Math.abs(trialBalanceDebitTotal - trialBalanceCreditTotal).toLocaleString()})
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-gray-900 dark:text-white">Trial Balance Report</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Double-entry audit verification (Debits must equal Credits)</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => window.print()}
                    className="p-2 sm:px-3 sm:py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-200">
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Print Report</span>
                  </button>
                  <button onClick={() => setShowExportModal(true)}
                    className="p-2 sm:px-3 sm:py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-200">
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                </div>
              </div>

              {accounts.length === 0 ? (
                <div className="bg-gradient-to-br from-indigo-50/90 via-blue-50/50 to-indigo-50/90 dark:from-slate-800/80 dark:to-slate-800/40 p-6 sm:p-8 text-center space-y-4">
                  <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/60 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
                    <Calculator className="w-7 h-7" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">No Ledger Accounts Configured</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Configure your chart of accounts or load default UK GAAP ledger codes to view debit &amp; credit trial balances.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab("chart-of-accounts")}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer inline-flex items-center gap-2 active:scale-95"
                    >
                      <BookOpen className="w-4 h-4" /> Go to Chart of Accounts
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[440px]">
                    <thead className="bg-gray-50/80 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-800">
                      <tr>
                        <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Code</th>
                        <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Account Name</th>
                        <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Debit (£)</th>
                        <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Credit (£)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {accounts.map((a) => (
                        <tr key={a.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-3 font-mono text-xs font-bold text-gray-900 dark:text-white">{a.code}</td>
                          <td className="px-5 py-3 text-sm font-semibold text-gray-900 dark:text-white">{a.name}</td>
                          <td className="px-5 py-3 text-right text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                            {["asset", "expense"].includes(a.type) ? `£${a.balance.toLocaleString()}` : "—"}
                          </td>
                          <td className="px-5 py-3 text-right text-sm font-extrabold text-rose-600 dark:text-rose-400">
                            {["liability", "equity", "revenue"].includes(a.type) ? `£${a.balance.toLocaleString()}` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-slate-800/90 border-t-2 border-gray-200 dark:border-slate-700">
                      <tr>
                        <td colSpan={2} className="px-5 py-4 text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">Total Ledger Balances</td>
                        <td className="px-5 py-4 text-right text-sm font-black text-emerald-600 dark:text-emerald-400">
                          £{trialBalanceDebitTotal.toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-right text-sm font-black text-rose-600 dark:text-rose-400">
                          £{trialBalanceCreditTotal.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REPORTS */}
        {activeTab === "reports" && (
          <div className="space-y-5">
            {/* Header Card with Format Selector */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Financial Reports Suite
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Generate compliant UK SME statements, tax summaries, and audit ledgers</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 mr-1 hidden sm:inline">Default Format:</span>
                {(["CSV", "Excel", "PDF"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setSelectedExportFormat(fmt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedExportFormat === fmt
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* 6 Executive Report Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  type: "Profit & Loss Statement",
                  Icon: BarChart3,
                  bgGrad: "from-blue-500 to-indigo-600",
                  desc: "Income vs expenses, gross margin & net profit at a glance",
                  metricLabel: "Current Net Profit",
                  metricVal: `£${financialSummary.netProfit.toLocaleString()}`,
                  metricCls: financialSummary.netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
                },
                {
                  type: "Balance Sheet",
                  Icon: PieChart,
                  bgGrad: "from-emerald-500 to-teal-600",
                  desc: "Snapshot of total assets, liabilities & owner equity balance",
                  metricLabel: "Net Worth (Assets - Liab)",
                  metricVal: `£${(financialSummary.totalAssets - financialSummary.totalLiabilities).toLocaleString()}`,
                  metricCls: "text-indigo-600 dark:text-indigo-400",
                },
                {
                  type: "Cash Flow Statement",
                  Icon: TrendingUp,
                  bgGrad: "from-amber-500 to-orange-600",
                  desc: "Tracking operating, investing & financing liquidity flows",
                  metricLabel: "Total Cash & Assets",
                  metricVal: `£${financialSummary.totalAssets.toLocaleString()}`,
                  metricCls: "text-blue-600 dark:text-blue-400",
                },
                {
                  type: "Aged Receivables (Debtors)",
                  Icon: Users,
                  bgGrad: "from-purple-500 to-indigo-600",
                  desc: "Outstanding customer invoice aging breakdown (30/60/90+ days)",
                  metricLabel: "Total Outstanding Sales",
                  metricVal: `£${financialSummary.totalRevenue.toLocaleString()}`,
                  metricCls: "text-purple-600 dark:text-purple-400",
                },
                {
                  type: "Aged Payables (Creditors)",
                  Icon: Building2,
                  bgGrad: "from-rose-500 to-red-600",
                  desc: "Vendor bills & supplier payment schedules due",
                  metricLabel: "Total Outstanding Bills",
                  metricVal: `£${financialSummary.totalLiabilities.toLocaleString()}`,
                  metricCls: "text-rose-600 dark:text-rose-400",
                },
                {
                  type: "UK HMRC VAT Summary",
                  Icon: Landmark,
                  bgGrad: "from-teal-500 to-emerald-600",
                  desc: "Estimated Output vs Input VAT tax breakdown for HMRC returns",
                  metricLabel: "Est. VAT Liability (20%)",
                  metricVal: `£${(financialSummary.totalRevenue * 0.2).toLocaleString()}`,
                  metricCls: "text-teal-600 dark:text-teal-400",
                },
              ].map(({ type, Icon, bgGrad, desc, metricLabel, metricVal, metricCls }) => (
                <div
                  key={type}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 bg-gradient-to-br ${bgGrad} rounded-2xl text-white shadow-sm group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 px-2.5 py-1 bg-gray-100 dark:bg-slate-800 rounded-full">
                        {selectedExportFormat} Ready
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">{type}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed mt-1">{desc}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-slate-800 mt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-medium">{metricLabel}:</span>
                      <span className={`font-black text-sm ${metricCls}`}>{metricVal}</span>
                    </div>

                    <button
                      onClick={() => handleGenerateReport(type)}
                      className="w-full py-2.5 bg-gray-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs"
                    >
                      Generate &amp; Download ({selectedExportFormat})
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* YEAR-END */}
        {activeTab === "year-end" && (
          <div className="space-y-5">
            {/* Executive Year-End Header */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Year-End Statutory Accounts
                  </h2>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-200/60">
                    UK SME GAAP Compliant ✓
                  </span>
                </div>
                <p className="text-xs text-gray-400">Prepare annual statutory financial packs for Companies House &amp; HMRC CT600 filing</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setShowYearEndModal(true)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Generate Year-End Pack (PDF)
                </button>
                <button
                  onClick={() => setShowYearEndCloseConfirm(true)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Run Year-End Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Statutory Documents Grid */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Statutory Filing Documents
                  </h3>
                  <span className="text-[11px] font-extrabold text-gray-400">6 Required</span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { doc: "Profit & Loss Statement", tag: "Included in Pack ✓", badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300" },
                    { doc: "Balance Sheet", tag: "Included in Pack ✓", badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300" },
                    { doc: "Trial Balance Ledger", tag: "Included in Pack ✓", badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300" },
                    { doc: "Corporation Tax Computation", tag: "Not Yet Available — Consult Your Accountant", badgeCls: "bg-gray-100 text-gray-500 border-gray-200/60 dark:bg-slate-800 dark:text-gray-400" },
                    { doc: "Directors Report", tag: "Not Yet Available", badgeCls: "bg-gray-100 text-gray-500 border-gray-200/60 dark:bg-slate-800 dark:text-gray-400" },
                    { doc: "Notes to Financial Statements", tag: "Not Yet Available", badgeCls: "bg-gray-100 text-gray-500 border-gray-200/60 dark:bg-slate-800 dark:text-gray-400" },
                  ].map(({ doc, tag, badgeCls }) => (
                    <div key={doc} className="flex items-center justify-between p-3 bg-gray-50/80 dark:bg-slate-800/60 rounded-2xl border border-gray-100/80 dark:border-slate-800">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{doc}</span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${badgeCls} shrink-0`}>
                        {tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statutory Tax Deadlines Timeline */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    HMRC &amp; Companies House Statutory Deadlines
                  </h3>
                  <span className="text-[11px] font-extrabold text-gray-400">UK Law</span>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      label: "Companies House Statutory Filing",
                      detail: "Annual accounts submission required within 9 months of financial year-end",
                      badge: "9 Months Limit",
                      cardCls: "bg-rose-50/70 border-rose-100 dark:bg-rose-950/40 dark:border-rose-900/60",
                      titleCls: "text-rose-950 dark:text-rose-200",
                      badgeCls: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/80 dark:text-rose-300",
                    },
                    {
                      label: "HMRC Corporation Tax Return (CT600)",
                      detail: "Company tax return submission required within 12 months of accounting period end",
                      badge: "12 Months Limit",
                      cardCls: "bg-amber-50/70 border-amber-100 dark:bg-amber-950/40 dark:border-amber-900/60",
                      titleCls: "text-amber-950 dark:text-amber-200",
                      badgeCls: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/80 dark:text-amber-300",
                    },
                    {
                      label: "HMRC Corporation Tax Payment",
                      detail: "Payment due 9 months and 1 day after end of accounting period",
                      badge: "9 Months + 1 Day",
                      cardCls: "bg-blue-50/70 border-blue-100 dark:bg-blue-950/40 dark:border-blue-900/60",
                      titleCls: "text-blue-950 dark:text-blue-200",
                      badgeCls: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/80 dark:text-blue-300",
                    },
                  ].map(({ label, detail, badge, cardCls, titleCls, badgeCls }) => (
                    <div key={label} className={`p-4 ${cardCls} border rounded-2xl space-y-1`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs font-extrabold ${titleCls}`}>{label}</p>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${badgeCls} shrink-0`}>
                          {badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════
          MODALS
      ════════════════════════════════════════ */}

      {/* New Entry */}
      {showNewEntryModal && (
        <ModalShell onClose={() => { setShowNewEntryModal(false); resetEntry(); }} title="New Journal Entry" icon={FileText}>
          <EntryForm onSave={handleSaveEntry} onCancel={() => { setShowNewEntryModal(false); resetEntry(); }} newEntry={newEntry} setNewEntry={setNewEntry} accounts={accounts} isBalanced={isBalanced} onSeedAccounts={handleSeedAccounts} />
        </ModalShell>
      )}

      {/* Edit Entry */}
      {showEditEntryModal && selectedEntry && (
        <ModalShell onClose={() => { setShowEditEntryModal(false); resetEntry(); }} title="Edit Journal Entry" icon={Edit3} iconColor="text-violet-600">
          <EntryForm onSave={handleSaveEntry} onCancel={() => { setShowEditEntryModal(false); resetEntry(); }} saveLabel="Update Entry" newEntry={newEntry} setNewEntry={setNewEntry} accounts={accounts} isBalanced={isBalanced} onSeedAccounts={handleSeedAccounts} />
        </ModalShell>
      )}

      {/* View Entry */}
      {showViewEntryModal && selectedEntry && (
        <ModalShell onClose={() => setShowViewEntryModal(false)} title="Journal Entry" icon={FileText} iconColor="text-indigo-600">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={labelCls}>Date</p>
              <p className="text-sm font-semibold text-gray-900">{new Date(selectedEntry.date).toLocaleDateString("en-GB")}</p>
            </div>
            <div>
              <p className={labelCls}>Reference</p>
              <p className="text-sm font-semibold text-gray-900">{selectedEntry.reference || "—"}</p>
            </div>
          </div>
          <div>
            <p className={labelCls}>Description</p>
            <p className="text-sm text-gray-800">{selectedEntry.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> Debit
              </p>
              <p className="text-xs text-gray-500 mb-1">{selectedEntry.entries[0]?.account.name}</p>
              <p className="text-lg font-bold text-emerald-900">£{(selectedEntry.entries[0]?.debit || 0).toLocaleString()}</p>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
              <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3" /> Credit
              </p>
              <p className="text-xs text-gray-500 mb-1">{selectedEntry.entries[1]?.account.name}</p>
              <p className="text-lg font-bold text-rose-900">£{(selectedEntry.entries[1]?.credit || 0).toLocaleString()}</p>
            </div>
          </div>
          <div>
            <p className={labelCls}>Status</p>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              selectedEntry.status === "posted" ? "bg-emerald-100 text-emerald-700"
              : selectedEntry.status === "pending" ? "bg-amber-100 text-amber-700"
              : "bg-gray-100 text-gray-500"}`}>
              {selectedEntry.status.toUpperCase()}
            </span>
          </div>
          <div className="pt-2 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-2">
            <button onClick={() => setShowViewEntryModal(false)}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer">
              Close
            </button>
          </div>
        </ModalShell>
      )}

      {/* Add Account */}
      {showAddAccountModal && (
        <ModalShell onClose={() => setShowAddAccountModal(false)} title="Add New Account" icon={BookOpen} iconColor="text-violet-600">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Account Code *</label>
              <input type="text" value={newAccount.code} onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })} placeholder="e.g. 1300" className={`${inputCls} font-mono`} />
            </div>
            <div>
              <label className={labelCls}>Account Name *</label>
              <input type="text" value={newAccount.name} onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })} placeholder="e.g. Petty Cash" className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Account Type *</label>
            <AccountTypeSelector newAccount={newAccount} setNewAccount={setNewAccount} />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea value={newAccount.description} onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })} placeholder="Optional notes…" rows={2} className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className={labelCls}>Opening Balance (£)</label>
            <input type="number" step="0.01" value={newAccount.openingBalance} onChange={(e) => setNewAccount({ ...newAccount, openingBalance: e.target.value })} placeholder="0.00" className={inputCls} />
          </div>

          {newAccount.type === "asset" && (
            <label className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer">
              <input type="checkbox" checked={newAccount.isCashAccount} onChange={(e) => setNewAccount({ ...newAccount, isCashAccount: e.target.checked })} className="w-4 h-4 accent-violet-600 cursor-pointer" />
              <div>
                <p className="text-sm font-semibold text-gray-800">This is a cash or bank account</p>
                <p className="text-xs text-gray-400">Used to categorize movements in the Cash Flow Statement</p>
              </div>
            </label>
          )}

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
            <p className="text-xs font-semibold text-indigo-800 mb-1.5 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Account Type Guide</p>
            <ul className="text-xs text-indigo-700 space-y-0.5">
              <li><strong>Asset</strong> — Resources owned (Cash, Equipment)</li>
              <li><strong>Liability</strong> — Money owed (Loans, Payables)</li>
              <li><strong>Equity</strong> — Owner&apos;s stake (Share Capital)</li>
              <li><strong>Revenue</strong> — Income earned (Sales)</li>
              <li><strong>Expense</strong> — Costs incurred (Rent, Salaries)</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2 pb-7 sm:pb-3 mb-1.5 sm:mb-0">
            <button onClick={() => setShowAddAccountModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
            <button onClick={handleSaveAccount} className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <Save className="w-4 h-4" /> Save Account
            </button>
          </div>
        </ModalShell>
      )}

      {/* View Account */}
      {showViewAccountModal && selectedAccount && (
        <ModalShell onClose={() => setShowViewAccountModal(false)} title="Account Details" icon={Eye} iconColor="text-blue-600">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={labelCls}>Code</p>
              <p className="font-mono font-bold text-gray-900">{selectedAccount.code}</p>
            </div>
            <div>
              <p className={labelCls}>Name</p>
              <p className="font-bold text-gray-900">{selectedAccount.name}</p>
            </div>
          </div>
          <div>
            <p className={labelCls}>Type</p>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${ACCOUNT_COLORS[selectedAccount.type]?.pill ?? "bg-gray-100 text-gray-600"}`}>
                {selectedAccount.type.toUpperCase()}
              </span>
              {selectedAccount.isCashAccount && (
                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full">CASH ACCOUNT</span>
              )}
            </div>
          </div>
          <div>
            <p className={labelCls}>Balance</p>
            <p className="text-2xl font-bold text-gray-900">£{selectedAccount.balance.toLocaleString()}</p>
          </div>
          <div>
            <p className={labelCls}>Last Transaction</p>
            <p className="text-sm text-gray-700">{selectedAccount.lastTransaction ? new Date(selectedAccount.lastTransaction).toLocaleDateString("en-GB") : "—"}</p>
          </div>
          <div className="pt-2 pb-7 sm:pb-3 mb-1.5 sm:mb-0">
            <button onClick={() => setShowViewAccountModal(false)}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer">
              Close
            </button>
          </div>
        </ModalShell>
      )}

      {/* Edit Account */}
      {showEditAccountModal && selectedAccount && (
        <ModalShell onClose={() => setShowEditAccountModal(false)} title="Edit Account" icon={Edit3} iconColor="text-violet-600">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Account Code *</label>
              <input type="text" value={newAccount.code} onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })} className={`${inputCls} font-mono`} />
            </div>
            <div>
              <label className={labelCls}>Account Name *</label>
              <input type="text" value={newAccount.name} onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Account Type *</label>
            <AccountTypeSelector newAccount={newAccount} setNewAccount={setNewAccount} />
          </div>
          <div>
            <label className={labelCls}>Balance (£)</label>
            <input type="number" step="0.01" value={newAccount.openingBalance} onChange={(e) => setNewAccount({ ...newAccount, openingBalance: e.target.value })} className={inputCls} />
          </div>
          {newAccount.type === "asset" && (
            <label className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer">
              <input type="checkbox" checked={newAccount.isCashAccount} onChange={(e) => setNewAccount({ ...newAccount, isCashAccount: e.target.checked })} className="w-4 h-4 accent-violet-600 cursor-pointer" />
              <div>
                <p className="text-sm font-semibold text-gray-800">This is a cash or bank account</p>
                <p className="text-xs text-gray-400">Used to categorize movements in the Cash Flow Statement</p>
              </div>
            </label>
          )}
          <div className="flex gap-3 pt-2 pb-7 sm:pb-3 mb-1.5 sm:mb-0">
            <button onClick={() => setShowEditAccountModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
            <button onClick={handleSaveAccount} className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <Save className="w-4 h-4" /> Update Account
            </button>
          </div>
        </ModalShell>
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-100 p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm shadow-2xl">
            <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 rounded-full bg-gray-200" /></div>
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-base font-bold text-gray-900 mb-1">Delete {deleteTarget.type === "account" ? "Account" : "Entry"}?</h2>
              <p className="text-sm text-gray-400 mb-5">This action cannot be undone.</p>
              <div className="flex gap-3 pt-2 pb-7 sm:pb-3 mb-1.5 sm:mb-0">
                <button onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
                <button onClick={handleConfirmDelete} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Export */}
      {showExportModal && (
        <ModalShell onClose={() => setShowExportModal(false)} title="Export Accounting Data" icon={Download} iconColor="text-blue-600">
          <div>
            <label className={labelCls}>Date Range</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-gray-400 mb-1 block">From</span>
                <input type="date" defaultValue={new Date(new Date().getFullYear(), 3, 1).toISOString().split("T")[0]} className={inputCls} />
              </div>
              <div>
                <span className="text-xs text-gray-400 mb-1 block">To</span>
                <input type="date" defaultValue={new Date().toISOString().split("T")[0]} className={inputCls} />
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>Format</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { fmt: "CSV"   as const, color: "blue",  sub: "Excel ready"  },
                { fmt: "Excel" as const, color: "green", sub: ".xls format"  },
                { fmt: "PDF"   as const, color: "red",   sub: "Print ready"  },
              ]).map(({ fmt, sub }) => (
                <button key={fmt} onClick={() => setSelectedExportFormat(fmt)}
                  className={`p-3 border-2 rounded-xl text-center cursor-pointer transition-all ${selectedExportFormat === fmt ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <FileText className={`w-5 h-5 mx-auto mb-1.5 ${selectedExportFormat === fmt ? "text-blue-600" : "text-gray-400"}`} />
                  <p className={`text-xs font-bold mb-0.5 ${selectedExportFormat === fmt ? "text-blue-900" : "text-gray-700"}`}>{fmt}</p>
                  <p className="text-[10px] text-gray-400">{sub}</p>
                  {selectedExportFormat === fmt && <CheckCircle className="w-3.5 h-3.5 text-blue-500 mx-auto mt-1.5" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Data to Include</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: FileText,   label: "Journal Entries" },
                { icon: BookOpen,   label: "Chart of Accounts" },
                { icon: Calculator, label: "Trial Balance" },
                { icon: PieChart,   label: "Financial Reports" },
              ].map(({ icon: Icon, label }) => (
                <label key={label} className="flex items-center gap-2.5 p-3 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all">
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600 rounded" />
                  <Icon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)] sm:pb-0">
            <button onClick={() => setShowExportModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
            <button onClick={() => { handleExportReport(`Accounting_${selectedExportFormat}`); setShowExportModal(false); }}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <Download className="w-4 h-4" /> Download {selectedExportFormat}
            </button>
          </div>
        </ModalShell>
      )}

      {/* Report Generation */}
      {showReportModal && selectedReport && (() => {
        const previewReport = computeReportDocument(selectedReport);
        return (
          <ModalShell onClose={() => setShowReportModal(false)} title={selectedReport} icon={BarChart3}>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {previewReport.sections.map((section) => (
                <div key={section.heading} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{section.heading}</p>
                  {section.rows.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No accounts of this type yet</p>
                  ) : (
                    <div className="space-y-1">
                      {section.rows.map((r) => (
                        <div key={r.label} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{r.label}</span>
                          <span className="font-medium text-gray-900">£{r.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm font-bold text-gray-900 mt-2 pt-2 border-t border-gray-200">
                    <span>{section.totalLabel}</span>
                    <span>£{section.total.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-1">
                {previewReport.summaryLines.map((l) => (
                  <div key={l.label} className="flex items-center justify-between text-sm font-bold text-blue-900">
                    <span>{l.label}</span>
                    <span>£{l.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              {previewReport.note && <p className="text-[11px] text-gray-400 italic">{previewReport.note}</p>}
            </div>

            <p className="text-sm text-gray-500">Choose a download format for this report.</p>
            <div className="grid grid-cols-3 gap-2">
              {(["CSV","Excel","PDF"] as const).map((fmt) => (
                <button key={fmt} onClick={() => setSelectedExportFormat(fmt)}
                  className={`p-3 border-2 rounded-xl text-center cursor-pointer transition-all ${selectedExportFormat === fmt ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <FileText className={`w-5 h-5 mx-auto mb-1 ${selectedExportFormat === fmt ? "text-blue-600" : "text-gray-400"}`} />
                  <p className={`text-xs font-bold ${selectedExportFormat === fmt ? "text-blue-900" : "text-gray-700"}`}>{fmt}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)] sm:pb-0">
              <button onClick={() => setShowReportModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
              <button onClick={() => handleDownloadReport(selectedExportFormat)}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </ModalShell>
        );
      })()}

      {/* Year-End */}
      {showYearEndModal && (
        <ModalShell onClose={() => setShowYearEndModal(false)} title="Year-End Process" icon={Calendar} iconColor="text-indigo-600">
          <p className="text-sm text-gray-500">
            Generate a year-end accounts pack summarising your Profit &amp; Loss, Balance Sheet, and Trial Balance from your current ledger.
          </p>
          <div className="space-y-2">
            {["Profit & Loss Summary","Balance Sheet Summary","Trial Balance"].map((item) => (
              <div key={item} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                <FileCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
          {!trialBalanceIsBalanced && (
            <div className="flex items-center gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <p className="text-xs font-medium text-red-700">Your Trial Balance is currently out of balance — the generated pack will flag this, but you may want to fix it first.</p>
            </div>
          )}
          <div className="flex gap-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)] sm:pb-0">
            <button onClick={() => setShowYearEndModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
            <button onClick={() => { handleGenerateYearEnd(); setShowYearEndModal(false); showToastMsg("Year-end accounts pack downloaded"); }}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <FileCheck className="w-4 h-4" /> Generate
            </button>
          </div>
        </ModalShell>
      )}

      {showYearEndCloseConfirm && (
        <ModalShell onClose={() => !closingYearEnd && setShowYearEndCloseConfirm(false)} title="Run Year-End Close" icon={FileCheck} iconColor="text-indigo-600">
          <p className="text-sm text-gray-500">
            This posts a permanent closing journal entry: every Revenue and Expense account is zeroed, and the net result moves into Retained Earnings. It cannot be undone by editing — only by a further correcting entry.
          </p>
          <div className="p-3.5 bg-gray-50 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Net Income to close</span>
              <span className={`font-bold ${financialSummary.netProfit >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                £{financialSummary.netProfit.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Moves to</span>
              <span className="font-semibold text-gray-800">Retained Earnings</span>
            </div>
          </div>
          {!trialBalanceIsBalanced && (
            <div className="flex items-center gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <p className="text-xs font-medium text-red-700">Your Trial Balance is currently out of balance — fix that before closing the year.</p>
            </div>
          )}
          <div className="flex gap-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)] sm:pb-0">
            <button onClick={() => setShowYearEndCloseConfirm(false)} disabled={closingYearEnd} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50">Cancel</button>
            <button onClick={handleRunYearEndClose} disabled={closingYearEnd || !trialBalanceIsBalanced}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <FileCheck className="w-4 h-4" /> {closingYearEnd ? "Closing…" : "Close Fiscal Year"}
            </button>
          </div>
        </ModalShell>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-200 pointer-events-none w-[calc(100%-2rem)] sm:w-auto max-w-sm">
          <div className="bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3">
            {toast.type === "error"
              ? <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              : <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
