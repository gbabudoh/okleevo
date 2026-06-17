"use client";

import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, Users, PoundSterling, Calculator, FileText,
  TrendingUp, FormInput, Calendar, MessageSquare, Mail,
  CheckSquare, Sparkles, FileEdit, BarChart3, Package,
  Truck, UserCheck, PenTool, Globe, Shield, ArrowRight,
  CheckCircle, Clock, Plus, Inbox, Edit3, Trash2, ArrowUpRight, Search, Play, Settings
} from "lucide-react";

interface PreviewConfig {
  activeTab: string;
  crmTotalRevenue: number;
  crmClientCount: number;
  crmContactsJson: string;
  invUnpaidCount: number;
  invTotalUnpaid: number;
  invInvoicesJson: string;
  tasksJson: string;
  aiInputText: string;
  aiOutputText: string;
}

interface DashboardPreviewRegionProps {
  initialConfig?: PreviewConfig | null;
}

// Fallback default values
const DEFAULT_PREVIEW_DATA: PreviewConfig = {
  activeTab: "dashboard",
  crmTotalRevenue: 12450.00,
  crmClientCount: 8,
  crmContactsJson: JSON.stringify([
    { name: "Alex Mercer", email: "alex@designco.uk", stage: "Lead", value: 4500.00 },
    { name: "Sarah Jenkins", email: "sarah@jenkinslegal.co.uk", stage: "Customer", value: 3200.00 },
    { name: "David Cole", email: "david@colebuilders.uk", stage: "Contact", value: 1500.00 }
  ]),
  invUnpaidCount: 3,
  invTotalUnpaid: 1850.00,
  invInvoicesJson: JSON.stringify([
    { number: "INV-2026-001", client: "Acme Corp Ltd", amount: 950.00, status: "Pending" },
    { number: "INV-2026-002", client: "Sarah Jenkins", amount: 650.00, status: "Overdue" },
    { number: "INV-2026-003", client: "David Cole", amount: 250.00, status: "Pending" }
  ]),
  tasksJson: JSON.stringify([
    { id: "1", title: "Review UK VAT returns", status: "TODO", priority: "HIGH" },
    { id: "2", title: "Follow up with Alex Mercer", status: "IN_PROGRESS", priority: "MEDIUM" },
    { id: "3", title: "Submit corporation tax draft", status: "TODO", priority: "HIGH" }
  ]),
  aiInputText: "Spent 45 mins with John. He wants to order 12 more units by Friday. Send invoice ASAP.",
  aiOutputText: "• Client: John\n• Action Item: Order 12 units by Friday\n• Task: Generate and send invoice."
};

export function DashboardPreviewRegion({ initialConfig }: DashboardPreviewRegionProps) {
  const [dbConfig, setDbConfig] = useState<PreviewConfig>(initialConfig || DEFAULT_PREVIEW_DATA);
  const [activeModule, setActiveModule] = useState<string>("dashboard");

  // Sync initialConfig changes
  useEffect(() => {
    if (initialConfig) {
      setDbConfig(initialConfig);
    }
  }, [initialConfig]);

  // Interactive mockup states
  const [crmContacts, setCrmContacts] = useState<any[]>([]);
  const [crmTotalRev, setCrmTotalRev] = useState<number>(DEFAULT_PREVIEW_DATA.crmTotalRevenue);
  const [crmClients, setCrmClients] = useState<number>(DEFAULT_PREVIEW_DATA.crmClientCount);
  const [selectedCrmContact, setSelectedCrmContact] = useState<any>(null);

  const [invoices, setInvoices] = useState<any[]>([]);
  const [invUnpaid, setInvUnpaid] = useState<number>(DEFAULT_PREVIEW_DATA.invTotalUnpaid);
  const [invCount, setInvCount] = useState<number>(DEFAULT_PREVIEW_DATA.invUnpaidCount);

  const [tasks, setTasks] = useState<any[]>([]);
  const [aiInput, setAiInput] = useState<string>("");
  const [aiOutput, setAiOutput] = useState<string>("");
  const [aiTyped, setAiTyped] = useState<string>("");
  const [aiTyping, setAiTyping] = useState<boolean>(false);

  // Load interactive state values from dbConfig JSON
  useEffect(() => {
    try {
      const parsedContacts = JSON.parse(dbConfig.crmContactsJson);
      setCrmContacts(parsedContacts);
      setSelectedCrmContact(parsedContacts[0] || null);
    } catch {
      setCrmContacts([]);
    }
    setCrmTotalRev(dbConfig.crmTotalRevenue);
    setCrmClients(dbConfig.crmClientCount);

    try {
      setInvoices(JSON.parse(dbConfig.invInvoicesJson));
    } catch {
      setInvoices([]);
    }
    setInvUnpaid(dbConfig.invTotalUnpaid);
    setInvCount(dbConfig.invUnpaidCount);

    try {
      setTasks(JSON.parse(dbConfig.tasksJson));
    } catch {
      setTasks([]);
    }

    setAiInput(dbConfig.aiInputText);
    setAiOutput(dbConfig.aiOutputText);
  }, [dbConfig]);

  // Interactive AI synthesis trigger
  const runAiSynthesis = () => {
    if (aiTyping) return;
    setAiTyping(true);
    setAiTyped("");
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < aiOutput.length) {
        setAiTyped((prev) => prev + aiOutput.charAt(idx));
        idx++;
      } else {
        clearInterval(interval);
        setAiTyping(false);
      }
    }, 20);
  };

  // Run initial synthesis typing if user opens AI module
  useEffect(() => {
    if (activeModule === "ai-notes" && aiOutput) {
      runAiSynthesis();
    }
  }, [activeModule, aiOutput]);

  // CRM: Add Contact
  const addCrmLead = () => {
    const newLead = { name: "New Lead", email: "info@business.uk", stage: "Lead", value: 2500.00 };
    const updated = [newLead, ...crmContacts];
    setCrmContacts(updated);
    setCrmClients((prev) => prev + 1);
    setCrmTotalRev((prev) => prev + 2500.00);
    setSelectedCrmContact(newLead);
  };

  // Invoices: Mark Paid
  const markInvoicePaid = (number: string, amount: number) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.number === number ? { ...inv, status: "Paid" } : inv))
    );
    setInvCount((prev) => Math.max(0, prev - 1));
    setInvUnpaid((prev) => Math.max(0, prev - amount));
  };

  // Tasks: Toggle checklist
  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === "DONE" ? "TODO" : "DONE" } : t))
    );
  };

  // Operations: Compliance statuses
  const [complianceItems, setComplianceItems] = useState([
    { id: "vat", name: "Q2 VAT Return Submission", due: "15 Days Left", status: "Pending", gov: "HMRC Gateway" },
    { id: "corp", name: "Corporation Tax Return (CT600)", due: "30 Days Left", status: "Pending", gov: "Companies House" },
    { id: "conf", name: "Annual Confirmation Statement", due: "Completed", status: "Success", gov: "Companies House" }
  ]);
  const toggleCompliance = (id: string) => {
    setComplianceItems(prev => prev.map(c => {
      if (c.id === id) {
        const isSuccess = c.status === "Success";
        return { ...c, status: isSuccess ? "Pending" : "Success", due: isSuccess ? "Action Required" : "Completed" };
      }
      return c;
    }));
  };

  // Operations: Inventory items
  const [inventory, setInventory] = useState([
    { sku: "OK-SH-01", name: "Eco Packaging boxes (S)", stock: 840, price: 1.20, status: "IN_STOCK" },
    { sku: "OK-SH-02", name: "Kraft Mailer bags (M)", stock: 120, price: 2.50, status: "LOW_STOCK" },
    { sku: "OK-SH-03", name: "Biodegradable tape rolls", stock: 8, price: 4.80, status: "OUT_OF_STOCK" }
  ]);
  const adjustStock = (sku: string, delta: number) => {
    setInventory(prev => prev.map(item => {
      if (item.sku === sku) {
        const nextStock = Math.max(0, item.stock + delta);
        let status = "IN_STOCK";
        if (nextStock === 0) status = "OUT_OF_STOCK";
        else if (nextStock < 150) status = "LOW_STOCK";
        return { ...item, stock: nextStock, status };
      }
      return item;
    }));
  };

  // Operations: HR records
  const [employees, setEmployees] = useState([
    { id: "emp1", name: "Gavin Jones", role: "Sales Executive", status: "Active", seat: "Seat 1" },
    { id: "emp2", name: "Harriet Green", role: "Financial Advisor", status: "On Leave", seat: "Seat 2" },
    { id: "emp3", name: "Luke Potter", role: "Operations Lead", status: "Active", seat: "Seat 3" }
  ]);
  const addMockEmployee = () => {
    if (employees.length >= 6) return;
    const name = prompt("Enter employee name:", "Alice Cooper");
    if (!name) return;
    const role = prompt("Enter job title:", "Product Designer");
    if (!role) return;
    setEmployees(prev => [...prev, {
      id: `emp${prev.length + 1}`,
      name,
      role,
      status: "Active",
      seat: `Seat ${prev.length + 1}`
    }]);
  };

  // Mail Engine: inbox list
  const [mailboxMsgs, setMailboxMsgs] = useState([
    { id: "1", from: "HMRC Gateway", subject: "VAT Notice: Electronic submission requirement", preview: "Your Q2 accounting statement is ready for review.", date: "Today, 10:24 AM", read: false, body: "Dear Business Owner,\n\nYour quarterly VAT submission period ends on the 30th. Please submit your digital tax record (MTD) via the linked accounting ledger integration.\n\nBest Regards,\nHM Revenue & Customs" },
    { id: "2", from: "Alex Mercer", subject: "Quote revision: Eco-packaging contract draft", preview: "Hi Gavin, we reviewed the GBP breakdown and wanted to adjust the volume...", date: "Today, 8:15 AM", read: true, body: "Hi Gavin,\n\nWe looked at the initial invoice projection. Could we bump the Kraft Mailer Bags count to 500 units if we sign this week? Let me know the adjusted billing estimate.\n\nAlex Mercer\nDesignCo UK" },
    { id: "3", from: "Luke Potter", subject: "Low Stock Alert: Biodegradable tape rolls", preview: "Current quantity: 8 rolls. Reorder threshold is set to 20.", date: "Yesterday", read: true, body: "Gavin, stock levels of biodegradable tape have dipped below safety parameters. Please place a purchase order with suppliers today to avoid shipping disruptions.\n\nCheers,\nLuke" }
  ]);
  const [activeMail, setActiveMail] = useState<any>(mailboxMsgs[0]);
  const selectMail = (mail: any) => {
    setActiveMail(mail);
    setMailboxMsgs(prev => prev.map(m => m.id === mail.id ? { ...m, read: true } : m));
  };

  // Booking Scheduler
  const [bookedSlots, setBookedSlots] = useState<string[]>(["10:00 AM", "2:00 PM"]);
  const toggleBookSlot = (slot: string) => {
    setBookedSlots(prev => 
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  // Expenses Module
  const [expenses, setExpenses] = useState([
    { item: "Companies House filing fee", category: "Compliance", amount: 13.00, date: "15/06/2026" },
    { item: "Office recycling service", category: "Utilities", amount: 48.50, date: "14/06/2026" },
    { item: "Google Workspace seats (x3)", category: "Software", amount: 31.80, date: "12/06/2026" }
  ]);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseName || !newExpenseAmount) return;
    setExpenses(prev => [{
      item: newExpenseName,
      category: "Operations",
      amount: parseFloat(newExpenseAmount) || 0,
      date: "Today"
    }, ...prev]);
    setNewExpenseName("");
    setNewExpenseAmount("");
  };

  // Forms states
  const [formResponses, setFormResponses] = useState(24);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Helpdesk states
  const [tickets, setTickets] = useState([
    { id: "TK-402", subject: "Invoice mismatch on Eco-boxes billing", client: "Alex Mercer", priority: "HIGH", status: "Open" },
    { id: "TK-398", subject: "Failed to login on mobile app", client: "Sarah Jenkins", priority: "MEDIUM", status: "Open" },
    { id: "TK-381", subject: "Booking calendar timezone sync query", client: "David Cole", priority: "LOW", status: "Resolved" }
  ]);
  const resolveTicket = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "Resolved" } : t));
  };

  // Campaigns state
  const [campaignStats, setCampaignStats] = useState({ sent: 1200, opens: 576, clicks: 144 });
  const sendTestCampaign = () => {
    setCampaignStats(prev => ({
      sent: prev.sent + 1,
      opens: prev.opens + 1,
      clicks: prev.clicks + 1
    }));
  };

  // Collaboration Chat States
  const [chatMessages, setChatMessages] = useState([
    { user: "Gavin Jones", text: "Hey team, did we file the corporation tax return for Acme?", time: "10:15 AM" },
    { user: "Harriet Green", text: "Yes Gavin, submitted standard CT600 to Companies House.", time: "10:18 AM" }
  ]);
  const [newChatText, setNewChatText] = useState("");
  const postChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText) return;
    setChatMessages(prev => [...prev, { user: "You (John Doe)", text: newChatText, time: "Just now" }]);
    setNewChatText("");
  };

  // AI Content Generator states
  const [aiContentTopic, setAiContentTopic] = useState("Eco Packaging boxes");
  const [aiContentTone, setAiContentTone] = useState("Professional");
  const [aiContentOutput, setAiContentOutput] = useState("");
  const [aiContentGenerating, setAiContentGenerating] = useState(false);
  const generateAiContent = () => {
    if (aiContentGenerating) return;
    setAiContentGenerating(true);
    setAiContentOutput("");
    const resultText = `🎯 Okleevo ${aiContentTopic} Campaign Copy:\n\nLooking for standard UK compliance packaging? Our standard custom boxes are carbon-neutral and standard VAT-deductible under operations costs. Order GBP contract allocations today!`;
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < resultText.length) {
        setAiContentOutput((prev) => prev + resultText.charAt(idx));
        idx++;
      } else {
        clearInterval(interval);
        setAiContentGenerating(false);
      }
    }, 15);
  };

  // E-Signature States
  const [documents, setDocuments] = useState([
    { id: "doc-1", name: "Supplier Service Agreement.pdf", status: "Awaiting Signature" },
    { id: "doc-2", name: "Employment Contract Gavin Jones.pdf", status: "Signed" },
    { id: "doc-3", name: "Acme Builders Partnership Deed.pdf", status: "Awaiting Signature" }
  ]);
  const signDoc = (id: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, status: "Signed" } : d));
  };

  // Micro Pages States
  const [bioPageTitle, setBioPageTitle] = useState("Acme Builders Links");
  const [bioLinks, setBioLinks] = useState([
    { label: "Acme Builders Website", url: "https://acmebuilders.uk" },
    { label: "Request Business Quote", url: "https://acmebuilders.uk/quote" },
    { label: "Contact customer support", url: "https://acmebuilders.uk/support" }
  ]);
  const updateBioLinkLabel = (idx: number, newLabel: string) => {
    setBioLinks(prev => prev.map((l, i) => i === idx ? { ...l, label: newLabel } : l));
  };

  // Suppliers state
  const [suppliers, setSuppliers] = useState([
    { name: "EcoPack Supplies Ltd", contact: "Mark Reed", rating: 5, leadTime: "3 days", category: "Packaging" },
    { name: "Royal Courier Services", contact: "Claire Booth", rating: 4, leadTime: "1 day", category: "Courier" },
    { name: "SME Cloud Infrastructure", contact: "Support Team", rating: 5, leadTime: "Same day", category: "IT Services" }
  ]);

  // Helper Module Menu Definitions matching app/dashboard/layout.tsx
  interface ModuleItem {
    id: string;
    label: string;
    icon: any;
    highlight?: boolean;
  }
  
  interface ModuleGroup {
    category: string;
    items: ModuleItem[];
  }

  const modulesList: ModuleGroup[] = [
    {
      category: "Finance",
      items: [
        { id: "invoicing", label: "Invoicing", icon: PoundSterling },
        { id: "accounting", label: "Accounting", icon: Calculator },
        { id: "taxation", label: "Taxation", icon: FileText },
        { id: "cashflow", label: "Cashflow", icon: TrendingUp },
        { id: "expenses", label: "Expenses", icon: FileText },
        { id: "vat-tools", label: "VAT Tools", icon: Calculator },
      ]
    },
    {
      category: "Okleevo Mail Engine",
      items: [
        { id: "mailbox", label: "Mail Engine", icon: Mail, highlight: true }
      ]
    },
    {
      category: "Customer",
      items: [
        { id: "crm", label: "CRM Pipeline", icon: Users },
        { id: "forms", label: "Forms", icon: FormInput },
        { id: "booking", label: "Booking", icon: Calendar },
        { id: "helpdesk", label: "Helpdesk", icon: MessageSquare },
        { id: "campaigns", label: "Campaigns", icon: Mail },
      ]
    },
    {
      category: "Productivity",
      items: [
        { id: "tasks", label: "Tasks", icon: CheckSquare },
        { id: "ai-notes", label: "AI Notes", icon: Sparkles },
        { id: "kpi-dashboard", label: "KPI Dashboard", icon: BarChart3 },
      ]
    },
    {
      category: "Operations",
      items: [
        { id: "inventory", label: "Inventory", icon: Package },
        { id: "suppliers", label: "Suppliers", icon: Truck },
        { id: "hr-records", label: "HR Records", icon: UserCheck },
        { id: "e-signature", label: "E-Signature", icon: PenTool },
        { id: "compliance", label: "Compliance", icon: Shield },
      ]
    }
  ];

  return (
    <section id="preview-showcase" className="py-20 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-slate-50 via-white to-orange-50/20 relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-extrabold text-orange-600 px-3 py-1 bg-orange-50 rounded-full border border-orange-200/50">
            Interactive System Simulation
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mt-4 mb-4">
            A Fully Integrated Light-Mode Workspace
          </h2>
          <p className="text-base sm:text-xl text-gray-600 leading-relaxed">
            Instantly preview how Okleevo unifies invoicing, CRM pipeline, mail servers, VAT tools, and artificial intelligence in one lightning-fast system. **Click any of the 20 modules in the sidebar to explore.**
          </p>
        </div>

        {/* Mockup Windows Wrapper */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col md:flex-row min-h-[680px]">
          
          {/* LEFT PANEL: COLLAPSED SIDEBAR OR SCROLLABLE SELECTOR */}
          <aside className="w-full md:w-64 bg-slate-50 border-r border-slate-200/80 flex flex-col shrink-0">
            
            {/* Mock Header Branding */}
            <div className="p-5 border-b border-slate-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-black shadow-md">O</span>
                <span className="font-bold text-sm text-slate-800 tracking-tight">Okleevo Hub</span>
              </div>
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[9px] font-bold rounded">22 Modules</span>
            </div>

            {/* Scrollable Categories List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 max-h-[300px] md:max-h-[580px] custom-scrollbar">
              
              {/* Home Overview Link */}
              <button
                onClick={() => setActiveModule("dashboard")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                  activeModule === "dashboard"
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/10"
                    : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview Dashboard</span>
              </button>

              {modulesList.map((group, gIdx) => (
                <div key={gIdx} className="space-y-1">
                  <h4 className="px-3 text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-1.5">{group.category}</h4>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeModule === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveModule(item.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all text-left group ${
                            isActive
                              ? "bg-slate-800 text-white font-medium"
                              : item.highlight
                              ? "bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200/40"
                              : "text-slate-600 hover:bg-slate-200/40 hover:text-slate-900"
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : item.highlight ? "text-orange-500" : "text-slate-400 group-hover:text-slate-600"}`} />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Simulated Live User details */}
            <div className="p-4 border-t border-slate-200/60 bg-slate-100/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs">
                JD
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 leading-none truncate">John Doe</p>
                <p className="text-[9px] text-slate-400 truncate mt-0.5">Acme Builders Ltd</p>
              </div>
            </div>

          </aside>

          {/* RIGHT PANEL: MAIN LIGHT WORKSPACE FRAME */}
          <main className="flex-1 bg-slate-50 flex flex-col min-w-0">
            
            {/* macOS Inner Header Bar */}
            <div className="px-6 py-3 bg-white border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]"></span>
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]"></span>
                <span className="w-3 h-3 rounded-full bg-[#27c93f]"></span>
              </div>
              
              <div className="bg-slate-100 border border-slate-200 rounded-lg px-4 py-1 text-xs text-slate-500 font-mono tracking-wide text-center max-w-sm w-48 sm:w-64 truncate">
                okleevo.com/dashboard/{activeModule}
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 border border-green-200 rounded-full hidden sm:inline">
                  UK Node Live
                </span>
              </div>
            </div>

            {/* Inner Dashboard Viewport */}
            <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between overflow-y-auto max-h-[580px] custom-scrollbar">
              
              {/* MODULE: OVERVIEW DASHBOARD */}
              {activeModule === "dashboard" && (
                <div className="space-y-6">
                  {/* Top Notification Alert */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>HMRC Corporation Tax filing deadline coming up in 15 days.</span>
                    </div>
                    <button 
                      onClick={() => setActiveModule("compliance")}
                      className="text-[10px] font-bold text-blue-600 underline hover:text-blue-800 shrink-0"
                    >
                      View filing
                    </button>
                  </div>

                  {/* Top Stats metrics row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unpaid Billing</p>
                      <h4 className="text-xl font-black text-red-500 mt-1">£{invUnpaid.toLocaleString(undefined, {minimumFractionDigits: 2})}</h4>
                      <p className="text-[9px] text-slate-400 mt-1">{invCount} pending bills</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CRM leads value</p>
                      <h4 className="text-xl font-black text-blue-500 mt-1">£{crmTotalRev.toLocaleString(undefined, {minimumFractionDigits: 2})}</h4>
                      <p className="text-[9px] text-slate-400 mt-1">{crmClients} pipeline clients</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remaining tasks</p>
                      <h4 className="text-xl font-black text-slate-800 mt-1">
                        {tasks.filter(t => t.status !== "DONE").length} Active
                      </h4>
                      <p className="text-[9px] text-slate-400 mt-1">Of {tasks.length} total tasks</p>
                    </div>
                  </div>

                  {/* SVG line chart and recent alerts grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* SVG Chart */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <h4 className="text-xs font-bold text-slate-800">Monthly Cashflow Trend (GBP)</h4>
                        <span className="text-[10px] text-green-500 font-semibold flex items-center gap-1">
                          +14.2% <TrendingUp className="w-3 h-3" />
                        </span>
                      </div>
                      <div className="h-32 flex items-end justify-between pt-4 relative">
                        {/* Simulated SVG line */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <path
                            d="M 0 80 Q 25 60 50 30 T 100 10"
                            fill="none"
                            stroke="#fc6813"
                            strokeWidth="3"
                          />
                          <path
                            d="M 0 80 Q 25 60 50 30 T 100 10 L 100 100 L 0 100 Z"
                            fill="url(#chartGrad)"
                            opacity="0.1"
                          />
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#fc6813" />
                              <stop offset="100%" stopColor="#fff" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <span className="text-[9px] text-slate-400 absolute bottom-0 left-0">Jan</span>
                        <span className="text-[9px] text-slate-400 absolute bottom-0 left-1/2 -translate-x-1/2">Mar</span>
                        <span className="text-[9px] text-slate-400 absolute bottom-0 right-0">May</span>
                      </div>
                    </div>

                    {/* Operational checklist alerts */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-800 pb-2 border-b border-slate-100 mb-3">Live Feed Notice</h4>
                      <div className="space-y-2">
                        <div className="flex gap-3 text-xs">
                          <span className="w-2 h-2 rounded-full bg-orange-500 mt-1 shrink-0"></span>
                          <div>
                            <p className="font-semibold text-slate-800">Inventory shortage</p>
                            <p className="text-[10px] text-slate-500">Eco-packaging boxes running low in stock room.</p>
                          </div>
                        </div>
                        <div className="flex gap-3 text-xs">
                          <span className="w-2 h-2 rounded-full bg-green-500 mt-1 shrink-0"></span>
                          <div>
                            <p className="font-semibold text-slate-800">VAT declaration validated</p>
                            <p className="text-[10px] text-slate-500">Corporate confirmation submitted to Companies House.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE: INVOICING */}
              {activeModule === "invoicing" && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Outstanding Bills</span>
                        <p className="text-lg font-black text-red-500">£{invUnpaid.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Active Count</span>
                        <p className="text-lg font-bold text-slate-800">{invCount} Invoices</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold flex">
                        <span className="w-1/4">Ref</span>
                        <span className="w-2/5">Client</span>
                        <span className="w-1/5 text-right">Amount</span>
                        <span className="w-1/4 text-right">Action</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {invoices.map((inv: any, idx: number) => (
                          <div key={idx} className="px-4 py-3 flex text-xs items-center hover:bg-slate-50/50 transition-colors">
                            <span className="w-1/4 font-mono text-slate-400">{inv.number}</span>
                            <span className="w-2/5 font-semibold text-slate-800 truncate">{inv.client}</span>
                            <span className="w-1/5 text-right font-semibold text-slate-800">£{inv.amount.toLocaleString()}</span>
                            <div className="w-1/4 text-right">
                              {inv.status === "Paid" ? (
                                <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded font-bold text-[10px]">
                                  Paid
                                </span>
                              ) : (
                                <button
                                  onClick={() => markInvoicePaid(inv.number, inv.amount)}
                                  className="px-2 py-0.5 bg-orange-500 hover:bg-orange-600 text-white rounded font-bold text-[10px] transition-colors"
                                >
                                  Mark Paid
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center italic mt-4">
                    Click &ldquo;Mark Paid&rdquo; to test dynamic cashflow simulation inside the landing page mockup.
                  </p>
                </div>
              )}

              {/* MODULE: CRM */}
              {activeModule === "crm" && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Leads List */}
                    <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                      <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700">Leads Pipeline</span>
                        <button
                          onClick={addCrmLead}
                          className="px-2 py-1 bg-orange-500 text-white rounded font-bold text-[10px] flex items-center gap-1 hover:bg-orange-600 transition-colors"
                        >
                          <Plus className="w-3 h-3" /> New Lead
                        </button>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {crmContacts.map((contact: any, idx: number) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedCrmContact(contact)}
                            className={`px-4 py-3 flex text-xs items-center justify-between cursor-pointer transition-colors ${
                              selectedCrmContact?.email === contact.email ? "bg-orange-50/50" : "hover:bg-slate-50/50"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-800 truncate">{contact.name}</p>
                              <p className="text-[10px] text-slate-500 truncate">{contact.email}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px] font-bold">
                                {contact.stage}
                              </span>
                              <span className="font-semibold text-slate-700">£{contact.value.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Lead details inspect card */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      {selectedCrmContact ? (
                        <div className="space-y-4">
                          <div className="pb-3 border-b border-slate-100">
                            <span className="text-[9px] uppercase font-bold text-slate-400">Selected Lead</span>
                            <h4 className="font-bold text-slate-900 text-sm mt-0.5">{selectedCrmContact.name}</h4>
                            <p className="text-[10px] text-slate-500">{selectedCrmContact.email}</p>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Pipeline Stage:</span>
                              <span className="font-bold text-slate-800 capitalize">{selectedCrmContact.stage}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Contract Value:</span>
                              <span className="font-bold text-orange-600">£{selectedCrmContact.value.toLocaleString()}</span>
                            </div>
                            <div className="pt-2">
                              <span className="text-slate-500 block mb-1">Actions:</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => alert(`Emailing ${selectedCrmContact.name} via Mail Engine.`)}
                                  className="flex-1 py-1 border border-slate-200 text-slate-700 rounded text-[10px] font-bold hover:bg-slate-50"
                                >
                                  Email
                                </button>
                                <button
                                  onClick={() => {
                                    alert("Converted Lead to Customer!");
                                    setCrmContacts(prev => prev.map(c => c.email === selectedCrmContact.email ? { ...c, stage: "Customer" } : c));
                                    setSelectedCrmContact({ ...selectedCrmContact, stage: "Customer" });
                                  }}
                                  className="flex-1 py-1 bg-orange-500 text-white rounded text-[10px] font-bold hover:bg-orange-600"
                                >
                                  Convert
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-400 text-xs">
                          Select a contact to view detail metrics.
                        </div>
                      )}
                      <p className="text-[9px] text-slate-400 italic text-center mt-4">
                        Synced dynamically with CRM pipeline databases.
                      </p>
                    </div>

                  </div>
                </div>
              )}

              {/* MODULE: MAILBOX */}
              {activeModule === "mailbox" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                    
                    {/* Mail list */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center gap-2">
                        <Inbox className="w-4 h-4 text-orange-500" /> Okleevo Mailbox
                      </div>
                      <div className="divide-y divide-slate-100 overflow-y-auto max-h-[300px]">
                        {mailboxMsgs.map((mail) => (
                          <div
                            key={mail.id}
                            onClick={() => selectMail(mail)}
                            className={`p-3 text-xs cursor-pointer transition-colors text-left ${
                              activeMail?.id === mail.id ? "bg-orange-50/50" : "hover:bg-slate-50/50"
                            } ${!mail.read ? "border-l-2 border-orange-500 font-semibold" : ""}`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-slate-800">{mail.from}</span>
                              <span className="text-[9px] text-slate-400">{mail.date}</span>
                            </div>
                            <p className="text-[11px] text-slate-700 truncate">{mail.subject}</p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{mail.preview}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mail viewer */}
                    <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between text-left">
                      {activeMail ? (
                        <div className="space-y-4 flex-1 flex flex-col">
                          <div className="pb-3 border-b border-slate-100">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-slate-800 text-sm">{activeMail.subject}</h4>
                                <p className="text-xs text-slate-500 mt-1">From: <span className="font-semibold text-slate-700">{activeMail.from}</span></p>
                              </div>
                              <span className="text-[10px] text-slate-400">{activeMail.date}</span>
                            </div>
                          </div>
                          <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed flex-1">
                            {activeMail.body}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-400 text-xs">
                          Select an email message from the mailbox inbox list.
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* MODULE: TASKS */}
              {activeModule === "tasks" && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
                      <span className="text-xs font-bold text-slate-600">Pending Operations Checklist</span>
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 border border-orange-200 rounded-full">
                        {tasks.filter(t => t.status !== "DONE").length} Remaining
                      </span>
                    </div>

                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => toggleTask(task.id)}
                          className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer transition-all hover:-translate-y-0.5"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={task.status === "DONE"}
                              readOnly
                              className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <span className={`text-xs truncate ${
                              task.status === "DONE" ? "text-slate-400 line-through font-normal" : "text-slate-800 font-bold"
                            }`}>
                              {task.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              task.status === "DONE"
                                ? "bg-slate-100 text-slate-400"
                                : task.status === "IN_PROGRESS"
                                ? "bg-blue-50 text-blue-600 border border-blue-100"
                                : "bg-orange-50 text-orange-600 border border-orange-100"
                            }`}>
                              {task.status?.replace("_", " ")}
                            </span>
                            {task.priority === "HIGH" && (
                              <span className="px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-[9px] font-bold">
                                High Priority
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center italic">
                    Click checklist items above to mark tasks as completed.
                  </p>
                </div>
              )}

              {/* MODULE: AI NOTES */}
              {activeModule === "ai-notes" && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    
                    {/* Audio Transcript Card */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between text-left">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Input Audio Snippet</span>
                          <span className="px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-100 rounded text-[9px] font-bold">
                            Live Transcript
                          </span>
                        </div>
                        <textarea
                          value={aiInput}
                          onChange={(e) => setAiInput(e.target.value)}
                          className="w-full text-xs text-slate-700 leading-relaxed border border-slate-200 rounded-xl p-3 focus:ring-1 focus:ring-orange-500 focus:outline-none resize-none font-medium"
                          rows={4}
                        />
                      </div>
                      <button
                        onClick={runAiSynthesis}
                        disabled={aiTyping}
                        className="w-full mt-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" /> {aiTyping ? "Synthesizing..." : "Process with AI"}
                      </button>
                    </div>

                    {/* AI summary result card */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-white flex flex-col justify-between text-left">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest flex items-center gap-1 font-mono">
                            <Sparkles className="w-3.5 h-3.5" /> AI Synthesis Engine
                          </span>
                          <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded text-[9px] font-bold border border-green-500/20">
                            Auto-Saved
                          </span>
                        </div>
                        <div className="text-xs font-mono whitespace-pre-wrap leading-relaxed min-h-[100px]">
                          {aiTyped}
                          {aiTyping && <span className="w-1.5 h-3 bg-orange-500 inline-block animate-ping ml-0.5"></span>}
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-500 mt-4 block">Note converted to structured database contact card</span>
                    </div>

                  </div>
                </div>
              )}

              {/* MODULE: COMPLIANCE */}
              {activeModule === "compliance" && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-700">HMRC & Companies House Filings</span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                        HMRC MTD Ready
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {complianceItems.map((c) => (
                        <div key={c.id} className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-3 text-left">
                            <Shield className={`w-4 h-4 ${c.status === "Success" ? "text-green-500" : "text-amber-500"}`} />
                            <div>
                              <p className="text-xs font-bold text-slate-800">{c.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{c.gov}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              c.status === "Success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {c.due}
                            </span>
                            <button
                              onClick={() => toggleCompliance(c.id)}
                              className="px-2 py-0.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded text-[9px] font-bold"
                            >
                              Toggle
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic text-center">
                    Automatic alerts coordinate filing deadlines with calendar modules.
                  </p>
                </div>
              )}

              {/* MODULE: INVENTORY */}
              {activeModule === "inventory" && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-700">Product Stock Control</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                        3 SKUs Loaded
                      </span>
                    </div>
                    
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold flex">
                        <span className="w-1/3">SKU & Item</span>
                        <span className="w-1/4 text-center">Stock Level</span>
                        <span className="w-1/4 text-right">Unit Price</span>
                        <span className="w-1/6 text-right">Adjust</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {inventory.map((item) => (
                          <div key={item.sku} className="px-4 py-3 flex text-xs items-center justify-between text-left">
                            <div className="w-1/3">
                              <p className="font-bold text-slate-800">{item.name}</p>
                              <p className="text-[9px] font-mono text-slate-400">{item.sku}</p>
                            </div>
                            <div className="w-1/4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.status === "IN_STOCK" 
                                  ? "bg-green-50 text-green-700 border border-green-200" 
                                  : item.status === "LOW_STOCK"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}>
                                {item.stock} units
                              </span>
                            </div>
                            <div className="w-1/4 text-right font-bold text-slate-700">
                              £{item.price.toFixed(2)}
                            </div>
                            <div className="w-1/6 flex justify-end gap-1">
                              <button
                                onClick={() => adjustStock(item.sku, -10)}
                                className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded flex items-center justify-center transition-colors"
                              >
                                -
                              </button>
                              <button
                                onClick={() => adjustStock(item.sku, 10)}
                                className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded flex items-center justify-center transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic text-center">
                    Adjust mock inventory stock to trigger low-level alerts dynamically.
                  </p>
                </div>
              )}

              {/* MODULE: HR RECORDS */}
              {activeModule === "hr-records" && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-700">Staff & Seat Directory</span>
                      <button
                        onClick={addMockEmployee}
                        disabled={employees.length >= 6}
                        className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded font-bold text-[10px] flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Assign Seat
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {employees.map((emp) => (
                        <div key={emp.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between text-left">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] font-mono text-slate-400">{emp.seat}</span>
                              <span className={`w-2 h-2 rounded-full ${emp.status === "Active" ? "bg-green-500" : "bg-amber-400"}`}></span>
                            </div>
                            <p className="text-xs font-bold text-slate-800 truncate">{emp.name}</p>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">{emp.role}</p>
                          </div>
                          <div className="mt-4 pt-2 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400">
                            <span>Status: {emp.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic text-center">
                    Supports seat billing limits (e.g. 10 Seats Included automatically).
                  </p>
                </div>
              )}

              {/* MODULE: BOOKING */}
              {activeModule === "booking" && (
                <div className="space-y-6 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <h4 className="text-xs font-bold text-slate-800">Interactive Meeting Scheduler</h4>
                      <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono">
                        UK Timezone (Europe/London)
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      Select mock time slots below to schedule or cancel user appointments.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"].map((slot) => {
                        const isBooked = bookedSlots.includes(slot);
                        return (
                          <button
                            key={slot}
                            onClick={() => toggleBookSlot(slot)}
                            className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                              isBooked 
                                ? "bg-orange-500 text-white border-orange-600 shadow-md" 
                                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                            }`}
                          >
                            {slot}
                            <span className="block text-[8px] opacity-75 mt-0.5">
                              {isBooked ? "Booked" : "Available"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic text-center">
                    Meetings integrate with the built-in calendar and email notification engines.
                  </p>
                </div>
              )}

              {/* MODULE: EXPENSES */}
              {activeModule === "expenses" && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    {/* Log Expense Form */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <form onSubmit={addExpense} className="space-y-3">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Log Business Receipt</span>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Expense Item Name</label>
                          <input
                            type="text"
                            value={newExpenseName}
                            onChange={(e) => setNewExpenseName(e.target.value)}
                            placeholder="e.g. Train ticket to London"
                            className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Amount (£)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={newExpenseAmount}
                            onChange={(e) => setNewExpenseAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white text-slate-800"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] rounded-lg transition-colors"
                        >
                          Log Expense
                        </button>
                      </form>
                      <p className="text-[8px] text-slate-400 italic text-center mt-3">
                        Integrates with Double-Entry Ledger and VAT deduction logs.
                      </p>
                    </div>

                    {/* Expense log sheet */}
                    <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold flex">
                        <span className="w-1/2">Expense Item</span>
                        <span className="w-1/4">Category</span>
                        <span className="w-1/4 text-right">Cost</span>
                      </div>
                      <div className="divide-y divide-slate-100 overflow-y-auto max-h-[160px]">
                        {expenses.map((exp, idx) => (
                          <div key={idx} className="px-4 py-2 flex text-xs justify-between hover:bg-slate-50/50">
                            <div className="w-1/2">
                              <p className="font-bold text-slate-800 truncate">{exp.item}</p>
                              <p className="text-[9px] text-slate-400">{exp.date}</p>
                            </div>
                            <span className="w-1/4 text-slate-500 self-center">{exp.category}</span>
                            <span className="w-1/4 text-right font-bold text-slate-800 self-center">
                              £{exp.amount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* MODULE: ACCOUNTING */}
              {activeModule === "accounting" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-700">General Ledger Trial Balance</span>
                      <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded font-bold font-mono">
                        Balanced
                      </span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold flex">
                        <span className="w-2/5">Account Name</span>
                        <span className="w-1/5 text-slate-400 font-mono">Code</span>
                        <span className="w-1/5 text-right">Debit</span>
                        <span className="w-1/5 text-right">Credit</span>
                      </div>
                      <div className="divide-y divide-slate-100 text-xs">
                        <div className="px-4 py-2.5 flex items-center">
                          <span className="w-2/5 font-semibold text-slate-800">Bank Current Account</span>
                          <span className="w-1/5 text-slate-400 font-mono">1200</span>
                          <span className="w-1/5 text-right text-slate-700">£14,250.00</span>
                          <span className="w-1/5 text-right text-slate-400">-</span>
                        </div>
                        <div className="px-4 py-2.5 flex items-center">
                          <span className="w-2/5 font-semibold text-slate-800">Accounts Receivable</span>
                          <span className="w-1/5 text-slate-400 font-mono">1100</span>
                          <span className="w-1/5 text-right text-slate-700">£{invUnpaid.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          <span className="w-1/5 text-right text-slate-400">-</span>
                        </div>
                        <div className="px-4 py-2.5 flex items-center">
                          <span className="w-2/5 font-semibold text-slate-800">Sales Revenues</span>
                          <span className="w-1/5 text-slate-400 font-mono">4000</span>
                          <span className="w-1/5 text-right text-slate-400">-</span>
                          <span className="w-1/5 text-right text-slate-700">£{(14250 + invUnpaid).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 px-4 py-2 flex text-xs font-bold border-t border-slate-100">
                        <span className="w-3/5 text-slate-600">Total Ledgers Balance</span>
                        <span className="w-1/5 text-right text-slate-800">£{(14250 + invUnpaid).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        <span className="w-1/5 text-right text-slate-800">£{(14250 + invUnpaid).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center italic">
                    All double-entry ledger items remain balanced automatically through integrated invoicing activities.
                  </p>
                </div>
              )}

              {/* MODULE: VAT TOOLS */}
              {activeModule === "vat-tools" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-700">MTD UK VAT Return (Form 100)</span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> HMRC MTD Link Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-sm">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Box 1: VAT due on Sales</span>
                        <p className="text-base font-black text-slate-800 mt-1">£{(crmTotalRev * 0.2).toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                        <span className="text-[8px] text-slate-400">Calculated at standard 20%</span>
                      </div>
                      <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-sm">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Box 4: VAT Reclaimed</span>
                        <p className="text-base font-black text-slate-800 mt-1">£340.50</p>
                        <span className="text-[8px] text-slate-400">From purchases & expenses</span>
                      </div>
                      <div className="bg-white p-3 border border-slate-200 rounded-xl bg-orange-50/50 border-orange-200/50 shadow-sm">
                        <span className="text-[9px] uppercase font-bold text-orange-600">Box 5: Net VAT Payable</span>
                        <p className="text-base font-black text-orange-600 mt-1">£{Math.max(0, (crmTotalRev * 0.2) - 340.50).toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                        <span className="text-[8px] text-slate-400">Due to HM Revenue & Customs</span>
                      </div>
                    </div>

                    <div className="bg-white p-3 border border-slate-200 rounded-xl space-y-2 text-xs shadow-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Box 6: Total value of sales (excl. VAT):</span>
                        <span className="font-semibold text-slate-800">£{crmTotalRev.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Box 7: Total value of purchases (excl. VAT):</span>
                        <span className="font-semibold text-slate-800">£1,702.50</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center italic">
                    Generates MTD (Making Tax Digital) XML structures natively for HMRC gateway submissions.
                  </p>
                </div>
              )}

              {/* MODULE: CASHFLOW */}
              {activeModule === "cashflow" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-700">Cashflow Forecast & Burn Rate</span>
                      <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded font-bold">
                        Surplus Forecasted
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Cash inflows / outflows list */}
                      <div className="bg-white p-3 border border-slate-200 rounded-xl space-y-2 text-xs shadow-sm">
                        <p className="font-bold text-slate-800 border-b border-slate-100 pb-1 flex justify-between">
                          <span>Inflows (Receivables)</span>
                          <span className="text-green-600">+£14,250.00</span>
                        </p>
                        <div className="space-y-1 text-slate-600">
                          <p className="flex justify-between"><span>DesignCo Contract</span><span>£4,500.00</span></p>
                          <p className="flex justify-between"><span>Jenkins Legal retainer</span><span>£3,200.00</span></p>
                          <p className="flex justify-between"><span>Completed work invoices</span><span>£6,550.00</span></p>
                        </div>
                      </div>

                      <div className="bg-white p-3 border border-slate-200 rounded-xl space-y-2 text-xs shadow-sm">
                        <p className="font-bold text-slate-800 border-b border-slate-100 pb-1 flex justify-between">
                          <span>Outflows (Operating Cost)</span>
                          <span className="text-red-600">-£2,450.00</span>
                        </p>
                        <div className="space-y-1 text-slate-600">
                          <p className="flex justify-between"><span>Office workspace rental</span><span>£1,200.00</span></p>
                          <p className="flex justify-between"><span>Salary & HR seats</span><span>£950.00</span></p>
                          <p className="flex justify-between"><span>Compliance & software fees</span><span>£300.00</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Net Cash Position Widget */}
                    <div className="p-3 bg-slate-800 text-white rounded-xl flex justify-between items-center text-xs shadow-sm">
                      <div>
                        <span className="text-slate-400 text-[10px]">Net Cash Runway (12 Months)</span>
                        <p className="text-base font-extrabold text-orange-400">£11,800.00 / mo average net</p>
                      </div>
                      <span className="px-2.5 py-1 bg-green-500 text-white font-bold rounded-lg text-[10px]">
                        Low Risk
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center italic">
                    Forecast parameters adjust dynamically when client payment schedules are edited in the settings page.
                  </p>
                </div>
              )}

              {/* MODULE: TAXATION */}
              {activeModule === "taxation" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-700">UK Corporation Tax Estimator (CT600)</span>
                      <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-bold">
                        Tax Year 2026/27
                      </span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 text-xs shadow-sm">
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-600">Total Net Revenues (excl. VAT):</span>
                        <span className="font-bold text-slate-800">£{crmTotalRev.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-600">Deductible Business Expenses:</span>
                        <span className="font-bold text-slate-800">£2,450.00</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-600">Capital Allowances (Machinery/Office):</span>
                        <span className="font-bold text-slate-800">£850.00</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5 bg-slate-50 p-1 rounded">
                        <span className="text-slate-700 font-semibold">Estimated Net Taxable Profit:</span>
                        <span className="font-bold text-slate-900">£{Math.max(0, crmTotalRev - 3300).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between items-center bg-orange-50 p-2 border border-orange-100 rounded">
                        <div>
                          <span className="text-orange-700 font-bold block">Corp Tax Payable (19% rate)</span>
                          <span className="text-[9px] text-slate-500">Profits below £50,000 threshold</span>
                        </div>
                        <span className="font-black text-orange-600 text-sm">
                          £{Math.max(0, (crmTotalRev - 3300) * 0.19).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center italic">
                    Estimates are generated for general planning only. Please sync with Companies House filings for formal submission.
                  </p>
                </div>
              )}

              {/* MODULE: FORMS */}
              {activeModule === "forms" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-700">Form Builder & Submissions</span>
                      <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded font-bold font-mono">
                        {formResponses} Responses
                      </span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Live Form Preview: Feedback Form</span>
                        <div className="space-y-2 mt-2">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Full Name</label>
                            <input type="text" disabled placeholder="Alex Mercer" className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-400" />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Rating</label>
                            <select disabled className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-400">
                              <option>Excellent (5 Stars)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setFormSubmitting(true);
                          setTimeout(() => {
                            setFormResponses(prev => prev + 1);
                            setFormSubmitting(false);
                            alert("Simulated form response submitted successfully!");
                          }, 600);
                        }}
                        disabled={formSubmitting}
                        className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-colors"
                      >
                        {formSubmitting ? "Submitting response..." : "Simulate Live Response Submission"}
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center italic">
                    Form submissions feed directly into the CRM pipeline contacts list automatically.
                  </p>
                </div>
              )}

              {/* MODULE: HELPDESK */}
              {activeModule === "helpdesk" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-700">Support Tickets Queue</span>
                      <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-bold">
                        {tickets.filter(t => t.status === "Open").length} Open Tickets
                      </span>
                    </div>

                    <div className="space-y-2">
                      {tickets.map(t => (
                        <div key={t.id} className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-400 font-bold">{t.id}</span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                t.priority === "HIGH" ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"
                              }`}>{t.priority}</span>
                            </div>
                            <p className="text-xs font-bold text-slate-800 mt-1">{t.subject}</p>
                            <p className="text-[9px] text-slate-400">Client: {t.client}</p>
                          </div>
                          <div>
                            {t.status === "Resolved" ? (
                              <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                                Resolved
                              </span>
                            ) : (
                              <button
                                onClick={() => resolveTicket(t.id)}
                                className="px-2 py-0.5 bg-orange-500 hover:bg-orange-600 text-white rounded text-[10px] font-bold transition-colors"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center italic">
                    Tickets automatically link with active client accounts inside CRM databases.
                  </p>
                </div>
              )}

              {/* MODULE: CAMPAIGNS */}
              {activeModule === "campaigns" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-700">Email Marketing Campaigns</span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold font-mono">
                        UK Node MTA Active
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-sm text-center">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Emails Sent</span>
                        <p className="text-base font-black text-slate-800 mt-1">{campaignStats.sent}</p>
                      </div>
                      <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-sm text-center">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Open Rate</span>
                        <p className="text-base font-black text-green-600 mt-1">
                          {((campaignStats.opens / campaignStats.sent) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-sm text-center">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Click Rate</span>
                        <p className="text-base font-black text-blue-600 mt-1">
                          {((campaignStats.clicks / campaignStats.sent) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">Monthly Product Promotion Campaign</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Target: All Subscribers (UK Region)</p>
                      </div>
                      <button
                        onClick={sendTestCampaign}
                        className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs shadow-sm transition-colors"
                      >
                        Send Test Dispatch
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center italic">
                    Mails are routed via standard SPF/DKIM authenticated SMTP relays.
                  </p>
                </div>
              )}

              {/* MODULE: COLLABORATION */}
              {activeModule === "collaboration" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-700">Team Collaboration Chat</span>
                      <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded font-bold font-mono">
                        Online (3 Members)
                      </span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                      <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-bold">
                        <span>#general-operations</span>
                        <span>Multi-User Sync</span>
                      </div>
                      <div className="p-3 space-y-2.5 overflow-y-auto max-h-[160px] min-h-[120px]">
                        {chatMessages.map((msg, idx) => (
                          <div key={idx} className="text-xs text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800">{msg.user}</span>
                              <span className="text-[8px] text-slate-400">{msg.time}</span>
                            </div>
                            <p className="text-slate-600 bg-slate-50 p-2 rounded-lg mt-0.5 border border-slate-100/50 inline-block max-w-[90%] font-medium">
                              {msg.text}
                            </p>
                          </div>
                        ))}
                      </div>
                      <form onSubmit={postChatMessage} className="p-2 border-t border-slate-200/80 bg-slate-50 flex gap-2">
                        <input
                          type="text"
                          value={newChatText}
                          onChange={(e) => setNewChatText(e.target.value)}
                          placeholder="Type a team message..."
                          className="flex-1 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white text-slate-800"
                        />
                        <button type="submit" className="px-3 py-1 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors">
                          Send
                        </button>
                      </form>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center italic">
                    Includes built-in Audio/Video peer sharing capabilities for team coordination.
                  </p>
                </div>
              )}

              {/* MODULE: AI CONTENT */}
              {activeModule === "ai-content" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-700">AI Copywriter & Copy Generator</span>
                      <span className="text-[10px] bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-0.5 rounded font-bold font-mono">
                        Powered by Gemini
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Controls Card */}
                      <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-sm space-y-2.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Topic / Product</label>
                          <input
                            type="text"
                            value={aiContentTopic}
                            onChange={(e) => setAiContentTopic(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-800 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Tone</label>
                          <select
                            value={aiContentTone}
                            onChange={(e) => setAiContentTone(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-800 focus:outline-none"
                          >
                            <option value="Professional">Professional</option>
                            <option value="Casual">Casual</option>
                            <option value="Sales Focused">Sales Focused</option>
                          </select>
                        </div>
                        <button
                          onClick={generateAiContent}
                          disabled={aiContentGenerating}
                          className="w-full py-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors"
                        >
                          {aiContentGenerating ? "Generating copy..." : "Generate Marketing Copy"}
                        </button>
                      </div>

                      {/* Generated Text */}
                      <div className="bg-slate-900 text-white p-3 border border-slate-800 rounded-xl shadow-sm flex flex-col justify-between text-xs font-mono">
                        <div className="whitespace-pre-wrap leading-relaxed min-h-[100px]">
                          {aiContentOutput || "Click generate to draft copy blocks..."}
                          {aiContentGenerating && <span className="w-1.5 h-3 bg-orange-500 inline-block animate-ping ml-0.5"></span>}
                        </div>
                        <span className="text-[9px] text-slate-500 block border-t border-slate-800 pt-1.5 mt-2">
                          Tone style: {aiContentTone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center italic">
                    Generates blog posts, campaigns, or service copy instantly inside the app workspace.
                  </p>
                </div>
              )}

              {/* MODULE: KPI DASHBOARD */}
              {activeModule === "kpi-dashboard" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-700">KPI Performance Dashboard</span>
                      <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded font-bold font-mono">
                        System Optimized
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-sm">
                        <span className="text-[9px] uppercase font-bold text-slate-400">MRR Forecast</span>
                        <p className="text-base font-black text-slate-800 mt-1">£4,850.00</p>
                        <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                          <div className="bg-green-500 h-full w-[80%]"></div>
                        </div>
                      </div>
                      <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-sm">
                        <span className="text-[9px] uppercase font-bold text-slate-400">UK CAC Cost</span>
                        <p className="text-base font-black text-slate-800 mt-1">£42.50</p>
                        <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                          <div className="bg-blue-500 h-full w-[45%]"></div>
                        </div>
                      </div>
                      <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-sm">
                        <span className="text-[9px] uppercase font-bold text-slate-400">LTV Value</span>
                        <p className="text-base font-black text-slate-800 mt-1">£380.00</p>
                        <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                          <div className="bg-purple-500 h-full w-[70%]"></div>
                        </div>
                      </div>
                      <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-sm">
                        <span className="text-[9px] uppercase font-bold text-slate-400">NPS Rating</span>
                        <p className="text-base font-black text-slate-800 mt-1">74 / 100</p>
                        <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                          <div className="bg-orange-500 h-full w-[90%]"></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Churn rate (last 30 days):</span>
                        <span className="font-semibold text-red-600">1.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Active Seats Allocation:</span>
                        <span className="font-semibold text-slate-800">{employees.length} / 10 Seats Used</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center italic">
                    All core calculations auto-compile daily and sync with HMRC compliance data grids.
                  </p>
                </div>
              )}

              {/* MODULE: SUPPLIERS */}
              {activeModule === "suppliers" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-700">Supplier Directory & Lead Times</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                        {suppliers.length} Registered Suppliers
                      </span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold flex">
                        <span className="w-2/5">Supplier Name</span>
                        <span className="w-1/4">Contact Officer</span>
                        <span className="w-1/5 text-center">Lead Time</span>
                        <span className="w-1/6 text-right">Rating</span>
                      </div>
                      <div className="divide-y divide-slate-100 text-xs">
                        {suppliers.map((sup, idx) => (
                          <div key={idx} className="px-4 py-2.5 flex items-center hover:bg-slate-50/50 transition-colors">
                            <span className="w-2/5 font-bold text-slate-800">{sup.name}</span>
                            <span className="w-1/4 text-slate-600 truncate">{sup.contact}</span>
                            <span className="w-1/5 text-center text-slate-500">{sup.leadTime}</span>
                            <span className="w-1/6 text-right text-orange-500 font-bold">{"★".repeat(sup.rating)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center italic">
                    Suppliers are integrated with purchase orders and stock alerts within the Inventory module.
                  </p>
                </div>
              )}

              {/* MODULE: E-SIGNATURE */}
              {activeModule === "e-signature" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-700">Digital E-Signature Contracts</span>
                      <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded font-bold">
                        HMRC Compliant Signatures
                      </span>
                    </div>

                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div key={doc.id} className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <PenTool className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="text-xs font-bold text-slate-800 truncate max-w-[200px] sm:max-w-xs">{doc.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              doc.status === "Signed" 
                                ? "bg-green-50 text-green-700 border border-green-200" 
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {doc.status}
                            </span>
                            {doc.status !== "Signed" && (
                              <button
                                onClick={() => signDoc(doc.id)}
                                className="px-2.5 py-0.5 bg-orange-500 hover:bg-orange-600 text-white rounded text-[9px] font-bold transition-colors"
                              >
                                Sign
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center italic">
                    Click &ldquo;Sign&rdquo; to test dynamic contract signing with cryptographic validation.
                  </p>
                </div>
              )}

              {/* MODULE: MICRO PAGES */}
              {activeModule === "micro-pages" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    
                    {/* Controls */}
                    <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm space-y-3">
                      <span className="text-[9px] uppercase font-bold text-slate-400">Micro-Landing Page Builder</span>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Page Branding Header</label>
                        <input
                          type="text"
                          value={bioPageTitle}
                          onChange={(e) => setBioPageTitle(e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-800 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-500">Custom Buttons Label (Real-time)</label>
                        {bioLinks.map((link, idx) => (
                          <input
                            key={idx}
                            type="text"
                            value={link.label}
                            onChange={(e) => updateBioLinkLabel(idx, e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-800 focus:outline-none"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Simulated Mobile Mock */}
                    <div className="bg-slate-100 p-4 border border-slate-200 rounded-xl flex items-center justify-center">
                      <div className="w-44 bg-white border-4 border-slate-800 rounded-3xl p-3 shadow-md min-h-[180px] flex flex-col items-center justify-between text-center relative">
                        <div className="w-10 h-3 bg-slate-800 rounded-full mb-3 shrink-0"></div>
                        <div className="flex-1 w-full flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold mb-1.5 shadow-sm">O</div>
                          <h5 className="text-[10px] font-bold text-slate-800 truncate w-full max-w-[120px]">{bioPageTitle}</h5>
                          <div className="space-y-1.5 w-full mt-3">
                            {bioLinks.map((link, idx) => (
                              <a
                                key={idx}
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                className="block w-full py-1 bg-slate-800 text-[8px] font-semibold text-white rounded shadow-sm truncate hover:scale-[1.02] transition-transform"
                              >
                                {link.label}
                              </a>
                            ))}
                          </div>
                        </div>
                        <span className="text-[6px] text-slate-400 mt-2 shrink-0">Powered by Okleevo</span>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* MODULE: GENERIC FALLBACK FOR THE OTHER 14+ MODULES */}
              {![
                "dashboard", "invoicing", "crm", "mailbox", "tasks", "ai-notes", 
                "compliance", "inventory", "hr-records", "booking", "expenses",
                "accounting", "vat-tools", "cashflow", "taxation",
                "forms", "helpdesk", "campaigns", "collaboration", "ai-content", 
                "kpi-dashboard", "suppliers", "e-signature", "micro-pages"
              ].includes(activeModule) && (
                <div className="space-y-6 flex-1 flex flex-col justify-center items-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 mb-4 shadow-sm">
                    {(() => {
                      const found = modulesList.flatMap(g => g.items).find(i => i.id === activeModule);
                      if (found) {
                        const Icon = found.icon;
                        return <Icon className="w-8 h-8" />;
                      }
                      return <Settings className="w-8 h-8" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 capitalize">
                      {activeModule.replace("-", " ")} Module Simulation
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
                      Okleevo replaces standard separate subscriptions by running {activeModule.replace("-", " ")} natively. Features include GBP currency standards, automatic compliance alerts, and full data sharing with lead profiles.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveModule("dashboard")}
                    className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-md shadow-slate-900/10 transition-colors"
                  >
                    Return to Dashboard Home
                  </button>
                </div>
              )}

            </div>

            {/* Simulated Workspace Footer banner */}
            <div className="p-3 bg-white border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-400">
              <span>Workspace Session Active</span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" /> Auto-sync enabled
              </span>
            </div>

          </main>

        </div>

      </div>
    </section>
  );
}
