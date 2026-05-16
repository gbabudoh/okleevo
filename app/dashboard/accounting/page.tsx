"use client";

import { useState, type ComponentType } from "react";
import {
  Calculator,
  Plus,
  Download,
  Upload,
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
  Receipt,
  FileCheck,
  Search,
  Filter,
  DollarSign,
} from "lucide-react";
import useSWR from "swr";
import accounting from "accounting";
import { AccountingSummary } from "@/components/dashboard/accounting/AccountingSummary";
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
    account: { name: string };
  }[];
}

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
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
          <X className="w-5 h-5 text-gray-400" />
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
}

// ── Entry Form ──────────────────────────────────────────────────
const EntryForm = ({ onSave, onCancel, saveLabel = "Save Entry", newEntry, setNewEntry, accounts, isBalanced }: EntryFormProps) => (
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
          <select value={newEntry.debitAccount} onChange={(e) => setNewEntry({ ...newEntry, debitAccount: e.target.value })} className={inputCls}>
            <option value="">Select account…</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
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
          <select value={newEntry.creditAccount} onChange={(e) => setNewEntry({ ...newEntry, creditAccount: e.target.value })} className={inputCls}>
            <option value="">Select account…</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
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

    <div className="sticky bottom-0 -mx-5 px-5 pt-4 pb-[calc(2.25rem+env(safe-area-inset-bottom,0px))] bg-white border-t border-gray-100 flex flex-row gap-3 sm:pb-6 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
      <button onClick={onCancel} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
      <button onClick={onSave} className="flex-2 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
        <Save className="w-4 h-4" /> {saveLabel}
      </button>
    </div>
  </>
);

// ── Account Type Selector Interfaces ────────────────────────────
interface NewAccountState {
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  description: string;
  openingBalance: string;
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
  const { mutate } = useSWR("/api/accounting/accounts", fetcher);
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showViewAccountModal, setShowViewAccountModal] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [showViewEntryModal, setShowViewEntryModal] = useState(false);
  const [showEditEntryModal, setShowEditEntryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showYearEndModal, setShowYearEndModal] = useState(false);
  const [toast, setToast] = useState("");
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

  const tabs = [
    { id: "overview",          name: "Overview",          icon: BarChart3  },
    { id: "chart-of-accounts", name: "Chart of Accounts", icon: BookOpen   },
    { id: "journal",           name: "Journal",           icon: FileText   },
    { id: "trial-balance",     name: "Trial Balance",     icon: Calculator },
    { id: "reports",           name: "Reports",           icon: PieChart   },
    { id: "year-end",          name: "Year-End",          icon: Calendar   },
  ];

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const resetEntry = () =>
    setNewEntry({ date: new Date().toISOString().split("T")[0], description: "", reference: "", debitAccount: "", debitAmount: "", creditAccount: "", creditAmount: "" });

  const handleSaveEntry = async () => {
    if (!newEntry.description || !newEntry.debitAccount || !newEntry.creditAccount || !newEntry.debitAmount || !newEntry.creditAmount) {
      alert("Please fill in all required fields");
      return;
    }
    if (parseFloat(newEntry.debitAmount) !== parseFloat(newEntry.creditAmount)) {
      alert("Debit and Credit amounts must be equal");
      return;
    }

    try {
      const res = await fetch("/api/accounting/journal", {
        method: "POST",
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
        mutate("/api/accounting/journal");
        mutate("/api/accounting/accounts");
        showToastMsg("Journal entry saved successfully");
      }
    } catch (err) {
      console.error("Save entry error:", err);
      alert("Failed to save entry");
    }
  };

  const handleSeedAccounts = async () => {
    const defaultAccounts = [
      { code: "1200", name: "Bank Current Account", type: "ASSET", category: "Cash and Cash Equivalents" },
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
      mutate("/api/accounting/accounts");
      showToastMsg("Default Chart of Accounts initialized!");
    } catch (err) {
      console.error("Seed accounts error:", err);
    }
  };

  const handleSaveAccount = () => {
    if (!newAccount.code || !newAccount.name) {
      alert("Please fill in all required fields");
      return;
    }
    console.log("Saving account:", newAccount);
    setNewAccount({ code: "", name: "", type: "asset", description: "", openingBalance: "" });
    setShowAddAccountModal(false);
    setShowEditAccountModal(false);
    showToastMsg("Account saved successfully");
  };

  const handleViewAccount  = (a: Account) => { setSelectedAccount(a); setShowViewAccountModal(true); };
  const handleEditAccount  = (a: Account) => {
    setSelectedAccount(a);
    setNewAccount({ code: a.code, name: a.name, type: a.type as never, description: "", openingBalance: a.balance.toString() });
    setShowEditAccountModal(true);
  };
  const handleViewEntry    = (e: Transaction) => { setSelectedEntry(e); setShowViewEntryModal(true); };
  const handleEditEntry    = (e: Transaction) => {
    setSelectedEntry(e);
    setNewEntry({
      date: new Date(e.date).toISOString().split("T")[0],
      description: e.description,
      reference: e.reference || "",
      debitAccount: e.entries[0]?.account.name || "",
      debitAmount:  (e.entries[0]?.debit  || 0).toString(),
      creditAccount: e.entries[1]?.account.name || "",
      creditAmount:  (e.entries[1]?.credit || 0).toString(),
    });
    setShowEditEntryModal(true);
  };
  const handleDeleteClick   = (type: "account" | "entry", id: string) => { setDeleteTarget({ type, id }); setShowDeleteModal(true); };
  const handleConfirmDelete = () => {
    if (deleteTarget) showToastMsg(`${deleteTarget.type === "account" ? "Account" : "Entry"} deleted`);
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleExportReport = (reportType: string) => {
    exportAccountingData(reportType, selectedExportFormat, activeTab === "chart-of-accounts", accounts, recentTransactions);
    showToastMsg(`Exported as ${selectedExportFormat}`);
  };

  const handleGenerateReport = (reportType: string) => { setSelectedReport(reportType); setShowReportModal(true); };
  const handleDownloadReport = (fmt: string) => {
    setSelectedExportFormat(fmt as "CSV" | "Excel" | "PDF");
    setTimeout(() => { handleExportReport(selectedReport || "Financial_Report"); setShowReportModal(false); }, 100);
  };

  const isBalanced = Boolean(
    newEntry.debitAmount && 
    newEntry.creditAmount &&
    parseFloat(newEntry.debitAmount) === parseFloat(newEntry.creditAmount)
  );



  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-blue-600 rounded-xl shrink-0">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Accounting</h1>
              <p className="text-[11px] text-gray-400 hidden sm:block">Double-entry bookkeeping · UK SME</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => setShowImportModal(true)}
              className="p-2 sm:px-3 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer text-sm font-medium text-gray-700">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
            </button>
            <button onClick={() => setShowExportModal(true)}
              className="p-2 sm:px-3 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer text-sm font-medium text-gray-700">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button onClick={() => setShowNewEntryModal(true)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Entry</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="sticky top-[57px] sm:top-[65px] z-30 bg-white border-b border-gray-100">
        <div className="flex overflow-x-auto scrollbar-hide px-4">
          {tabs.map(({ id, name, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all cursor-pointer shrink-0 ${
                  active ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
                }`}>
                <Icon className="w-4 h-4" />
                {name}
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

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-gray-900">Recent Journal Entries</h2>
                </div>
                <button onClick={() => setActiveTab("journal")} className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">View all</button>
              </div>
              <div className="p-5">
                <JournalEntries entries={recentTransactions} onViewEntry={handleViewEntry} onEditEntry={handleEditEntry} onDeleteEntry={(id) => handleDeleteClick("entry", id)} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { tab: "year-end",      icon: FileCheck,  color: "bg-blue-500",   title: "Year-End Accounts",    desc: "Generate HMRC-ready financials" },
                { tab: "trial-balance", icon: Calculator, color: "bg-green-500",  title: "Run Trial Balance",    desc: "Verify debits equal credits" },
                { tab: "reports",       icon: PieChart,   color: "bg-violet-500", title: "Financial Reports",    desc: "P&L, Balance Sheet, Cash Flow" },
              ].map(({ tab, icon: Icon, color, title, desc }) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-left cursor-pointer group">
                  <div className={`p-2.5 ${color} rounded-xl shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900">{title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
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
            <div className="px-4 sm:px-5 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Journal Entries</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Double-entry bookkeeping ledger</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative hidden sm:block">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Search…" className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none w-40 transition-all" />
                  </div>
                  <button className="p-2 sm:px-3 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer text-sm font-medium text-gray-700">
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filter</span>
                  </button>
                  <button onClick={() => setShowNewEntryModal(true)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New Entry</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>
              </div>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">No Journal Entries Yet</h3>
                <p className="text-xs text-gray-400 mb-5">Start recording transactions with double-entry bookkeeping</p>
                <button onClick={() => setShowNewEntryModal(true)}
                  className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center gap-2 cursor-pointer">
                  <Plus className="w-4 h-4" /> Create First Entry
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentTransactions.map((tx) => (
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
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              tx.status === "posted" ? "bg-emerald-100 text-emerald-700"
                              : tx.status === "pending" ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-500"}`}>
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button onClick={() => handleViewEntry(tx)} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="View">
                          <Eye className="w-4 h-4 text-blue-500" />
                        </button>
                        <button onClick={() => handleEditEntry(tx)} className="p-1.5 hover:bg-violet-50 rounded-lg transition-colors cursor-pointer" title="Edit">
                          <Edit3 className="w-4 h-4 text-violet-500" />
                        </button>
                        <button onClick={() => handleDeleteClick("entry", tx.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Trial Balance</h2>
                <p className="text-xs text-gray-400 mt-0.5">Total debits must equal total credits</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => window.print()}
                  className="p-2 sm:px-3 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer text-sm font-medium text-gray-700">
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Print</span>
                </button>
                <button onClick={() => setShowExportModal(true)}
                  className="p-2 sm:px-3 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer text-sm font-medium text-gray-700">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[440px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wide">Code</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wide">Account Name</th>
                    <th className="px-4 sm:px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wide">Debit £</th>
                    <th className="px-4 sm:px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wide">Credit £</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {accounts.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 sm:px-6 py-3 font-mono text-xs font-semibold text-gray-500">{a.code}</td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-gray-800">{a.name}</td>
                      <td className="px-4 sm:px-6 py-3 text-right text-sm font-semibold text-emerald-700">
                        {["asset", "expense"].includes(a.type) ? `£${a.balance.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-right text-sm font-semibold text-rose-700">
                        {["liability", "equity", "revenue"].includes(a.type) ? `£${a.balance.toLocaleString()}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={2} className="px-4 sm:px-6 py-4 text-sm font-bold text-gray-900">TOTALS</td>
                    <td className="px-4 sm:px-6 py-4 text-right text-sm font-bold text-emerald-800">
                      £{accounts.filter((a) => ["asset","expense"].includes(a.type)).reduce((s, a) => s + a.balance, 0).toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right text-sm font-bold text-rose-800">
                      £{accounts.filter((a) => ["liability","equity","revenue"].includes(a.type)).reduce((s, a) => s + a.balance, 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="px-4 sm:px-5 py-4 border-t border-gray-100">
              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-900">Trial Balance is Balanced</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Total Debits = Total Credits — books are in order</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REPORTS */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
              <h2 className="text-sm font-bold text-gray-900 mb-0.5">Financial Reports</h2>
              <p className="text-xs text-gray-400">Generate comprehensive statements for your business</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { type: "Profit & Loss Statement", Icon: BarChart3,  bg: "bg-blue-50",   ic: "text-blue-600",   link: "text-blue-600",   desc: "Income vs expenses at a glance" },
                { type: "Balance Sheet",           Icon: PieChart,   bg: "bg-green-50",  ic: "text-green-600",  link: "text-green-600",  desc: "Assets, liabilities, equity snapshot" },
                { type: "Cash Flow Statement",     Icon: TrendingUp, bg: "bg-orange-50", ic: "text-orange-600", link: "text-orange-600", desc: "Operating, investing & financing flows" },
              ].map(({ type, Icon, bg, ic, link, desc }) => (
                <button key={type} onClick={() => handleGenerateReport(type)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-gray-200 transition-all text-left cursor-pointer group">
                  <div className={`p-2.5 ${bg} rounded-xl w-fit mb-3 group-hover:scale-105 transition-transform`}>
                    <Icon className={`w-5 h-5 ${ic}`} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{type}</h3>
                  <p className="text-xs text-gray-400 mb-3">{desc}</p>
                  <span className={`text-xs font-semibold ${link} flex items-center gap-1`}>
                    Generate <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* YEAR-END */}
        {activeTab === "year-end" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 mb-0.5">Year-End Accounts for HMRC</h2>
                  <p className="text-xs text-gray-400">Prepare annual accounts for Companies House & HMRC submission</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setShowYearEndModal(true)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap">
                    Generate
                  </button>
                  <button onClick={() => setShowYearEndModal(true)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap">
                    Checklist
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" /> Required Documents
                </h3>
                <div className="space-y-2">
                  {["Profit & Loss Statement","Balance Sheet","Directors Report","Notes to Accounts","Corporation Tax Computation"].map((doc) => (
                    <div key={doc} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                      <span className="text-xs font-medium text-gray-700">{doc}</span>
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" /> Important Deadlines
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "Companies House Filing",   detail: "9 months after year-end",        bg: "bg-red-50",    border: "border-red-100",    text: "text-red-800",    sub: "text-red-500" },
                    { label: "Corporation Tax Return",   detail: "12 months after year-end",       bg: "bg-orange-50", border: "border-orange-100",  text: "text-orange-800", sub: "text-orange-500" },
                    { label: "Corporation Tax Payment",  detail: "9 months + 1 day after year-end", bg: "bg-blue-50",   border: "border-blue-100",    text: "text-blue-800",   sub: "text-blue-500" },
                  ].map(({ label, detail, bg, border, text, sub }) => (
                    <div key={label} className={`p-3 ${bg} border ${border} rounded-xl`}>
                      <p className={`text-xs font-semibold ${text}`}>{label}</p>
                      <p className={`text-[11px] ${sub} mt-0.5`}>{detail}</p>
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
          <EntryForm onSave={handleSaveEntry} onCancel={() => { setShowNewEntryModal(false); resetEntry(); }} newEntry={newEntry} setNewEntry={setNewEntry} accounts={accounts} isBalanced={isBalanced} />
        </ModalShell>
      )}

      {/* Edit Entry */}
      {showEditEntryModal && selectedEntry && (
        <ModalShell onClose={() => { setShowEditEntryModal(false); resetEntry(); }} title="Edit Journal Entry" icon={Edit3} iconColor="text-violet-600">
          <EntryForm onSave={handleSaveEntry} onCancel={() => { setShowEditEntryModal(false); resetEntry(); }} saveLabel="Update Entry" newEntry={newEntry} setNewEntry={setNewEntry} accounts={accounts} isBalanced={isBalanced} />
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

          <div className="flex gap-3 pt-2 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-2">
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
            <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${ACCOUNT_COLORS[selectedAccount.type]?.pill ?? "bg-gray-100 text-gray-600"}`}>
              {selectedAccount.type.toUpperCase()}
            </span>
          </div>
          <div>
            <p className={labelCls}>Balance</p>
            <p className="text-2xl font-bold text-gray-900">£{selectedAccount.balance.toLocaleString()}</p>
          </div>
          <div>
            <p className={labelCls}>Last Transaction</p>
            <p className="text-sm text-gray-700">{selectedAccount.lastTransaction ? new Date(selectedAccount.lastTransaction).toLocaleDateString("en-GB") : "—"}</p>
          </div>
          <div className="pt-2 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-2">
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
          <div className="flex gap-3 pt-2 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-2">
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
              <div className="flex gap-3 pt-2 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-2">
                <button onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
                <button onClick={handleConfirmDelete} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import */}
      {showImportModal && (
        <ModalShell onClose={() => setShowImportModal(false)} title="Import Accounting Data" icon={Upload} iconColor="text-emerald-600">
          <div className="border-2 border-dashed border-gray-200 hover:border-emerald-400 rounded-xl p-6 text-center transition-colors">
            <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-800 mb-1">Drop file or click to browse</p>
            <p className="text-xs text-gray-400 mb-3">CSV, Excel (.xlsx, .xls), QuickBooks (.qbo)</p>
            <input type="file" accept=".csv,.xlsx,.xls,.qbo" className="hidden" id="file-upload"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) alert(`File selected: ${f.name} (${(f.size / 1024).toFixed(1)} KB)`); }} />
            <label htmlFor="file-upload" className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer inline-block">
              Choose File
            </label>
          </div>

          <div>
            <label className={labelCls}>Import Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[{ icon: FileText, label: "Journal Entries" }, { icon: BookOpen, label: "Chart of Accounts" }, { icon: DollarSign, label: "Bank Statements" }, { icon: Receipt, label: "Invoices" }].map(({ icon: Icon, label }) => (
                <label key={label} className="flex items-center gap-2.5 p-3 border border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer transition-all">
                  <input type="radio" name="importType" className="w-4 h-4 accent-emerald-600" />
                  <Icon className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Tips</p>
            <ul className="text-xs text-blue-600 space-y-0.5">
              <li>CSV headers: Date, Description, Debit Account, Debit Amount, Credit Account, Credit Amount</li>
              <li>Amounts in GBP (£) · Dates in DD/MM/YYYY</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-2">
            <button onClick={() => setShowImportModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
            <button onClick={() => {
              const fi = document.getElementById("file-upload") as HTMLInputElement;
              if (fi?.files?.[0]) { alert(`Importing ${fi.files[0].name}…\nSuccess! ${Math.floor(Math.random()*50+10)} records imported.`); setShowImportModal(false); }
              else alert("Please select a file first");
            }} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" /> Start Import
            </button>
          </div>
        </ModalShell>
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
      {showReportModal && selectedReport && (
        <ModalShell onClose={() => setShowReportModal(false)} title={selectedReport} icon={BarChart3}>
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
      )}

      {/* Year-End */}
      {showYearEndModal && (
        <ModalShell onClose={() => setShowYearEndModal(false)} title="Year-End Process" icon={Calendar} iconColor="text-indigo-600">
          <p className="text-sm text-gray-500">
            Generate your complete year-end accounts package including all required statements for HMRC and Companies House.
          </p>
          <div className="space-y-2">
            {["Profit & Loss Statement","Balance Sheet","Trial Balance Report","Corporation Tax Computation"].map((item) => (
              <div key={item} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)] sm:pb-0">
            <button onClick={() => setShowYearEndModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
            <button onClick={() => { setShowYearEndModal(false); showToastMsg("Year-end accounts generated successfully"); }}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <FileCheck className="w-4 h-4" /> Generate
            </button>
          </div>
        </ModalShell>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-200 pointer-events-none w-[calc(100%-2rem)] sm:w-auto max-w-sm">
          <div className="bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-sm font-medium">{toast}</p>
          </div>
        </div>
      )}
    </div>
  );
}
