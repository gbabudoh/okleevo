"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, PoundSterling, Calculator, FileText,
  TrendingUp, FormInput, Calendar, MessageSquare, Mail,
  CheckSquare, Sparkles, BarChart3, Package,
  Truck, UserCheck, PenTool, Shield,
  CheckCircle, Clock, Plus, Inbox, Play, Settings
} from "lucide-react";

export interface PreviewConfig {
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
  const [suppliers] = useState([
    { name: "EcoPack Supplies Ltd", contact: "Mark Reed", rating: 5, leadTime: "3 days", category: "Packaging" },
    { name: "Royal Courier Services", contact: "Claire Booth", rating: 4, leadTime: "1 day", category: "Courier" },
    { name: "SME Cloud Infrastructure", contact: "Support Team", rating: 5, leadTime: "Same day", category: "IT Services" }
  ]);

  // Module Menu Definitions
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
      category: "Finance & Ledger",
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
      category: "Mail & Communication",
      items: [
        { id: "mailbox", label: "Mail Engine", icon: Mail, highlight: true }
      ]
    },
    {
      category: "Customer & Pipeline",
      items: [
        { id: "crm", label: "CRM Pipeline", icon: Users },
        { id: "forms", label: "Forms Builder", icon: FormInput },
        { id: "booking", label: "Booking Calendar", icon: Calendar },
        { id: "helpdesk", label: "Helpdesk Queue", icon: MessageSquare },
        { id: "campaigns", label: "Email Campaigns", icon: Mail },
      ]
    },
    {
      category: "AI & Productivity",
      items: [
        { id: "tasks", label: "Task Checklist", icon: CheckSquare },
        { id: "ai-notes", label: "AI Copilot Notes", icon: Sparkles },
        { id: "kpi-dashboard", label: "KPI Performance", icon: BarChart3 },
      ]
    },
    {
      category: "Operations & Compliance",
      items: [
        { id: "inventory", label: "Inventory Stock", icon: Package },
        { id: "suppliers", label: "Supplier Directory", icon: Truck },
        { id: "hr-records", label: "HR & Seats Directory", icon: UserCheck },
        { id: "e-signature", label: "E-Signature Contracts", icon: PenTool },
        { id: "compliance", label: "Government Compliance", icon: Shield },
      ]
    }
  ];

  return (
    <section id="preview-showcase" className="py-20 sm:py-28 px-4 sm:px-6 bg-slate-950 text-slate-100 relative overflow-hidden font-sans">
      {/* High-Level Ambient Radial Backdrop */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Minimalist Enterprise Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            Enterprise Grade System Preview
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Unified Modular SaaS Architecture
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal">
            Experience Okleevo&apos;s minimalist workspace: seamless integration across invoicing, CRM pipelines, HMRC compliance, mail relays, and AI synthesis.
          </p>
        </div>

        {/* Master Enterprise Application Window Frame */}
        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col md:flex-row min-h-[720px]">
          
          {/* LEFT PANEL: MINIMALIST SIDEBAR RAIL */}
          <aside className="w-full md:w-64 bg-slate-950/90 border-r border-white/10 flex flex-col shrink-0">
            
            {/* Enterprise Header Identity */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                  O
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-100 tracking-tight block">Okleevo Hub</span>
                  <span className="text-[9px] font-mono text-slate-400 block">v2.4 Enterprise</span>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-mono font-medium rounded-md">
                23 Integrated Tools
              </span>
            </div>

            {/* Scrollable Module Selector Rail */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 max-h-[300px] md:max-h-[600px] custom-scrollbar">
              
              {/* Home Overview Link */}
              <button
                onClick={() => setActiveModule("dashboard")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                  activeModule === "dashboard"
                    ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                <span>Overview Dashboard</span>
              </button>

              {modulesList.map((group, gIdx) => (
                <div key={gIdx} className="space-y-1">
                  <h4 className="px-3 text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold mb-1">
                    {group.category}
                  </h4>
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
                              ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold shadow-sm"
                              : item.highlight
                              ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20"
                              : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-400" : item.highlight ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Authenticated User Status Footer */}
            <div className="p-3.5 border-t border-white/10 bg-slate-950 flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-indigo-300">
                  JD
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-200 leading-none truncate">John Doe</p>
                <p className="text-[10px] font-mono text-slate-500 truncate mt-1">Acme Builders Ltd</p>
              </div>
            </div>

          </aside>

          {/* RIGHT PANEL: MAIN WORKSPACE FRAME */}
          <main className="flex-1 bg-[#0B0F17] flex flex-col min-w-0">
            
            {/* macOS Style Header Control Bar */}
            <div className="px-5 py-3 bg-slate-950/80 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 border border-red-500/40"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-500/40"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-500/40"></span>
              </div>
              
              {/* Route Indicator Pill */}
              <div className="bg-slate-900 border border-white/10 rounded-lg px-4 py-1 text-xs text-slate-400 font-mono tracking-wide text-center max-w-sm w-48 sm:w-72 truncate">
                okleevo.cloud/enterprise/v1/{activeModule}
              </div>

              {/* Node Status Pill */}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 border border-emerald-500/20 rounded-full hidden sm:inline">
                  UK Central Node
                </span>
              </div>
            </div>

            {/* Inner Dashboard Viewport Surface */}
            <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between overflow-y-auto max-h-[640px] custom-scrollbar space-y-6">
              
              {/* MODULE: OVERVIEW DASHBOARD */}
              {activeModule === "dashboard" && (
                <div className="space-y-6">
                  {/* Top Alert Bar */}
                  <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/20 rounded-xl text-xs text-indigo-200 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>HMRC Corporation Tax filing deadline coming up in 15 days.</span>
                    </div>
                    <button 
                      onClick={() => setActiveModule("compliance")}
                      className="text-[11px] font-mono font-semibold text-indigo-400 hover:text-indigo-300 underline shrink-0 ml-2"
                    >
                      View filing
                    </button>
                  </div>

                  {/* Top KPI Metrics Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-white/10 shadow-lg hover:border-white/20 transition-all">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-medium">Unpaid Billing</p>
                      <h4 className="text-2xl font-bold font-mono text-rose-400 mt-1">£{invUnpaid.toLocaleString(undefined, {minimumFractionDigits: 2})}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">{invCount} pending bills</p>
                    </div>
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-white/10 shadow-lg hover:border-white/20 transition-all">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-medium">CRM Leads Pipeline</p>
                      <h4 className="text-2xl font-bold font-mono text-indigo-400 mt-1">£{crmTotalRev.toLocaleString(undefined, {minimumFractionDigits: 2})}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">{crmClients} pipeline contacts</p>
                    </div>
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-white/10 shadow-lg hover:border-white/20 transition-all">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-medium">Active Tasks</p>
                      <h4 className="text-2xl font-bold font-mono text-slate-100 mt-1">
                        {tasks.filter(t => t.status !== "DONE").length} Remaining
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1">Out of {tasks.length} total operations</p>
                    </div>
                  </div>

                  {/* Chart and Live Feed Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Visual Vector Sparkline Chart Card */}
                    <div className="bg-slate-900/60 p-5 rounded-xl border border-white/10 shadow-lg flex flex-col justify-between">
                      <div className="flex justify-between items-center pb-3 border-b border-white/10">
                        <h4 className="text-xs font-semibold text-slate-200">Monthly Cashflow Trend (GBP)</h4>
                        <span className="text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          +14.2% <TrendingUp className="w-3 h-3" />
                        </span>
                      </div>
                      <div className="h-36 flex items-end justify-between pt-4 relative">
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <path
                            d="M 0 80 Q 25 60 50 30 T 100 10"
                            fill="none"
                            stroke="#818cf8"
                            strokeWidth="2.5"
                          />
                          <path
                            d="M 0 80 Q 25 60 50 30 T 100 10 L 100 100 L 0 100 Z"
                            fill="url(#darkChartGrad)"
                            opacity="0.2"
                          />
                          <defs>
                            <linearGradient id="darkChartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6366f1" />
                              <stop offset="100%" stopColor="#0b0f17" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <span className="text-[10px] font-mono text-slate-500 absolute bottom-0 left-0">Jan</span>
                        <span className="text-[10px] font-mono text-slate-500 absolute bottom-0 left-1/2 -translate-x-1/2">Mar</span>
                        <span className="text-[10px] font-mono text-slate-500 absolute bottom-0 right-0">May</span>
                      </div>
                    </div>

                    {/* Live Operations Feed Card */}
                    <div className="bg-slate-900/60 p-5 rounded-xl border border-white/10 shadow-lg">
                      <h4 className="text-xs font-semibold text-slate-200 pb-3 border-b border-white/10 mb-3">Live Feed Activity</h4>
                      <div className="space-y-3">
                        <div className="flex gap-3 text-xs">
                          <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0"></span>
                          <div>
                            <p className="font-medium text-slate-200">Inventory shortage alert</p>
                            <p className="text-[10px] text-slate-400">Eco-packaging boxes running low in main store.</p>
                          </div>
                        </div>
                        <div className="flex gap-3 text-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0"></span>
                          <div>
                            <p className="font-medium text-slate-200">VAT return validated</p>
                            <p className="text-[10px] text-slate-400">Confirmation statement synced with HMRC gateway.</p>
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
                    <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-xl border border-white/10 shadow-sm">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400">Outstanding Total</span>
                        <p className="text-xl font-bold font-mono text-rose-400 mt-0.5">£{invUnpaid.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono uppercase text-slate-400">Active Records</span>
                        <p className="text-xl font-bold font-mono text-slate-200 mt-0.5">{invCount} Invoices</p>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 rounded-xl border border-white/10 overflow-hidden shadow-sm">
                      <div className="px-4 py-2.5 bg-slate-950 border-b border-white/10 text-slate-400 text-[10px] font-mono uppercase tracking-wider flex">
                        <span className="w-1/4">Ref Code</span>
                        <span className="w-2/5">Client Name</span>
                        <span className="w-1/5 text-right">Amount</span>
                        <span className="w-1/4 text-right">Status Action</span>
                      </div>
                      <div className="divide-y divide-white/5">
                        {invoices.map((inv: any, idx: number) => (
                          <div key={idx} className="px-4 py-3 flex text-xs items-center hover:bg-white/[0.02] transition-colors">
                            <span className="w-1/4 font-mono text-slate-400">{inv.number}</span>
                            <span className="w-2/5 font-medium text-slate-200 truncate">{inv.client}</span>
                            <span className="w-1/5 text-right font-mono font-semibold text-slate-200">£{inv.amount.toLocaleString()}</span>
                            <div className="w-1/4 text-right">
                              {inv.status === "Paid" ? (
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[10px]">
                                  Paid
                                </span>
                              ) : (
                                <button
                                  onClick={() => markInvoicePaid(inv.number, inv.amount)}
                                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-medium transition-colors"
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
                  <p className="text-[10px] text-slate-500 text-center font-mono italic">
                    Click &ldquo;Mark Paid&rdquo; to test real-time dynamic cashflow updates.
                  </p>
                </div>
              )}

              {/* MODULE: CRM */}
              {activeModule === "crm" && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Leads List */}
                    <div className="md:col-span-2 bg-slate-900/60 rounded-xl border border-white/10 overflow-hidden shadow-sm flex flex-col">
                      <div className="p-3.5 bg-slate-950 border-b border-white/10 flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-200">Leads Pipeline</span>
                        <button
                          onClick={addCrmLead}
                          className="px-2.5 py-1 bg-indigo-600 text-white rounded font-medium text-[10px] flex items-center gap-1 hover:bg-indigo-500 transition-colors"
                        >
                          <Plus className="w-3 h-3" /> New Lead
                        </button>
                      </div>
                      <div className="divide-y divide-white/5">
                        {crmContacts.map((contact: any, idx: number) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedCrmContact(contact)}
                            className={`px-4 py-3 flex text-xs items-center justify-between cursor-pointer transition-colors ${
                              selectedCrmContact?.email === contact.email ? "bg-indigo-500/10 border-l-2 border-indigo-400" : "hover:bg-white/[0.02]"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-slate-200 truncate">{contact.name}</p>
                              <p className="text-[10px] font-mono text-slate-500 truncate">{contact.email}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded text-[9px] font-mono">
                                {contact.stage}
                              </span>
                              <span className="font-mono font-medium text-slate-300">£{contact.value.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Lead Detail Inspector */}
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-white/10 shadow-sm flex flex-col justify-between">
                      {selectedCrmContact ? (
                        <div className="space-y-4">
                          <div className="pb-3 border-b border-white/10">
                            <span className="text-[9px] font-mono uppercase text-slate-400">Selected Lead</span>
                            <h4 className="font-semibold text-slate-100 text-sm mt-0.5">{selectedCrmContact.name}</h4>
                            <p className="text-[10px] font-mono text-slate-400">{selectedCrmContact.email}</p>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Stage:</span>
                              <span className="font-medium text-slate-200 capitalize">{selectedCrmContact.stage}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Value:</span>
                              <span className="font-mono font-semibold text-indigo-400">£{selectedCrmContact.value.toLocaleString()}</span>
                            </div>
                            <div className="pt-2">
                              <span className="text-slate-400 block mb-1.5 text-[10px]">Actions:</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => alert(`Emailing ${selectedCrmContact.name}`)}
                                  className="flex-1 py-1 border border-white/10 text-slate-300 rounded text-[10px] font-medium hover:bg-white/[0.04]"
                                >
                                  Email
                                </button>
                                <button
                                  onClick={() => {
                                    alert("Converted Lead to Customer!");
                                    setCrmContacts(prev => prev.map(c => c.email === selectedCrmContact.email ? { ...c, stage: "Customer" } : c));
                                    setSelectedCrmContact({ ...selectedCrmContact, stage: "Customer" });
                                  }}
                                  className="flex-1 py-1 bg-indigo-600 text-white rounded text-[10px] font-medium hover:bg-indigo-500"
                                >
                                  Convert
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-500 text-xs font-mono">
                          Select a contact to view details.
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* MODULE: MAILBOX */}
              {activeModule === "mailbox" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                    
                    {/* Mail List */}
                    <div className="bg-slate-900/60 rounded-xl border border-white/10 shadow-sm overflow-hidden flex flex-col">
                      <div className="p-3 bg-slate-950 border-b border-white/10 font-semibold text-xs text-slate-300 flex items-center gap-2">
                        <Inbox className="w-4 h-4 text-indigo-400" /> Mail Engine Inbox
                      </div>
                      <div className="divide-y divide-white/5 overflow-y-auto max-h-[300px]">
                        {mailboxMsgs.map((mail) => (
                          <div
                            key={mail.id}
                            onClick={() => selectMail(mail)}
                            className={`p-3 text-xs cursor-pointer transition-colors text-left ${
                              activeMail?.id === mail.id ? "bg-indigo-500/10 border-l-2 border-indigo-400" : "hover:bg-white/[0.02]"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-slate-200">{mail.from}</span>
                              <span className="text-[9px] font-mono text-slate-500">{mail.date}</span>
                            </div>
                            <p className="text-[11px] text-slate-300 truncate">{mail.subject}</p>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">{mail.preview}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mail Viewer */}
                    <div className="md:col-span-2 bg-slate-900/60 rounded-xl border border-white/10 shadow-sm p-4 flex flex-col justify-between text-left">
                      {activeMail ? (
                        <div className="space-y-4 flex-1 flex flex-col">
                          <div className="pb-3 border-b border-white/10">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-slate-100 text-sm">{activeMail.subject}</h4>
                                <p className="text-xs text-slate-400 mt-1">From: <span className="text-slate-200">{activeMail.from}</span></p>
                              </div>
                              <span className="text-[10px] font-mono text-slate-500">{activeMail.date}</span>
                            </div>
                          </div>
                          <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed flex-1">
                            {activeMail.body}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-500 text-xs font-mono">
                          Select a message to read.
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
                    <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
                      <span className="text-xs font-semibold text-slate-300">Operations Checklist</span>
                      <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 border border-indigo-500/20 rounded-full">
                        {tasks.filter(t => t.status !== "DONE").length} Remaining
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => toggleTask(task.id)}
                          className="p-3 bg-slate-900/60 hover:bg-slate-900 rounded-xl border border-white/10 shadow-sm flex items-center justify-between cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={task.status === "DONE"}
                              readOnly
                              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-white/20 rounded"
                            />
                            <span className={`text-xs truncate ${
                              task.status === "DONE" ? "text-slate-500 line-through font-normal" : "text-slate-200 font-medium"
                            }`}>
                              {task.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${
                              task.status === "DONE"
                                ? "bg-slate-800 text-slate-500"
                                : task.status === "IN_PROGRESS"
                                ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                                : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                            }`}>
                              {task.status?.replace("_", " ")}
                            </span>
                            {task.priority === "HIGH" && (
                              <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-[9px] font-mono">
                                High Priority
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE: AI NOTES COPILOT */}
              {activeModule === "ai-notes" && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    
                    {/* Audio Transcript Card */}
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-white/10 shadow-sm flex flex-col justify-between text-left">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-white/10">
                          <span className="text-[10px] font-mono uppercase text-slate-400">Audio Input</span>
                          <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded text-[9px] font-mono">
                            Live Transcript
                          </span>
                        </div>
                        <textarea
                          value={aiInput}
                          onChange={(e) => setAiInput(e.target.value)}
                          className="w-full text-xs text-slate-200 leading-relaxed border border-white/10 rounded-xl p-3 bg-slate-950 focus:border-indigo-500 focus:outline-none resize-none font-medium"
                          rows={4}
                        />
                      </div>
                      <button
                        onClick={runAiSynthesis}
                        disabled={aiTyping}
                        className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" /> {aiTyping ? "Synthesizing..." : "Process with AI"}
                      </button>
                    </div>

                    {/* AI Copilot Terminal Output */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/30 text-white flex flex-col justify-between text-left shadow-2xl">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-white/10">
                          <span className="text-[10px] font-mono uppercase text-indigo-400 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> Copilot Terminal
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9px] font-mono border border-emerald-500/20">
                            Auto-Saved
                          </span>
                        </div>
                        <div className="text-xs font-mono whitespace-pre-wrap leading-relaxed min-h-[100px] text-slate-300">
                          {aiTyped}
                          {aiTyping && <span className="w-1.5 h-3 bg-indigo-400 inline-block animate-pulse ml-1"></span>}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* MODULE: COMPLIANCE */}
              {activeModule === "compliance" && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                      <span className="text-xs font-semibold text-slate-300">HMRC & Companies House Compliance</span>
                      <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                        HMRC MTD Ready
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {complianceItems.map((c) => (
                        <div key={c.id} className="p-3.5 bg-slate-900/60 border border-white/10 rounded-xl shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-3 text-left">
                            <Shield className={`w-4 h-4 ${c.status === "Success" ? "text-emerald-400" : "text-amber-400"}`} />
                            <div>
                              <p className="text-xs font-medium text-slate-200">{c.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{c.gov}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${
                              c.status === "Success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}>
                              {c.due}
                            </span>
                            <button
                              onClick={() => toggleCompliance(c.id)}
                              className="px-2.5 py-0.5 border border-white/10 hover:bg-white/[0.04] text-slate-300 rounded text-[9px] font-mono"
                            >
                              Toggle
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE: INVENTORY */}
              {activeModule === "inventory" && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                      <span className="text-xs font-semibold text-slate-300">Stock Control</span>
                      <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded font-mono border border-white/10">
                        3 SKUs Loaded
                      </span>
                    </div>
                    
                    <div className="bg-slate-900/60 border border-white/10 rounded-xl overflow-hidden shadow-sm">
                      <div className="px-4 py-2.5 bg-slate-950 border-b border-white/10 text-slate-400 text-[10px] font-mono uppercase tracking-wider flex">
                        <span className="w-1/3">SKU & Item</span>
                        <span className="w-1/4 text-center">Stock Level</span>
                        <span className="w-1/4 text-right">Unit Price</span>
                        <span className="w-1/6 text-right">Adjust</span>
                      </div>
                      <div className="divide-y divide-white/5">
                        {inventory.map((item) => (
                          <div key={item.sku} className="px-4 py-3 flex text-xs items-center justify-between text-left">
                            <div className="w-1/3">
                              <p className="font-medium text-slate-200">{item.name}</p>
                              <p className="text-[9px] font-mono text-slate-500">{item.sku}</p>
                            </div>
                            <div className="w-1/4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                                item.status === "IN_STOCK" 
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                  : item.status === "LOW_STOCK"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              }`}>
                                {item.stock} units
                              </span>
                            </div>
                            <div className="w-1/4 text-right font-mono font-medium text-slate-300">
                              £{item.price.toFixed(2)}
                            </div>
                            <div className="w-1/6 flex justify-end gap-1">
                              <button
                                onClick={() => adjustStock(item.sku, -10)}
                                className="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded flex items-center justify-center transition-colors"
                              >
                                -
                              </button>
                              <button
                                onClick={() => adjustStock(item.sku, 10)}
                                className="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded flex items-center justify-center transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE: HR RECORDS */}
              {activeModule === "hr-records" && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                      <span className="text-xs font-semibold text-slate-300">Staff & Seat Directory</span>
                      <button
                        onClick={addMockEmployee}
                        disabled={employees.length >= 6}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded font-medium text-[10px] flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Assign Seat
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {employees.map((emp) => (
                        <div key={emp.id} className="bg-slate-900/60 p-3.5 rounded-xl border border-white/10 shadow-sm flex flex-col justify-between text-left">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] font-mono text-slate-500">{emp.seat}</span>
                              <span className={`w-2 h-2 rounded-full ${emp.status === "Active" ? "bg-emerald-400" : "bg-amber-400"}`}></span>
                            </div>
                            <p className="text-xs font-medium text-slate-200 truncate">{emp.name}</p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{emp.role}</p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-slate-500">
                            <span>Status: {emp.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE: BOOKING */}
              {activeModule === "booking" && (
                <div className="space-y-6 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                      <h4 className="text-xs font-semibold text-slate-300">Meeting Scheduler</h4>
                      <span className="text-[10px] bg-slate-900 border border-white/10 text-slate-400 px-2 py-0.5 rounded font-mono">
                        UK Timezone
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"].map((slot) => {
                        const isBooked = bookedSlots.includes(slot);
                        return (
                          <button
                            key={slot}
                            onClick={() => toggleBookSlot(slot)}
                            className={`p-3 rounded-xl border text-xs font-medium transition-all text-center ${
                              isBooked 
                                ? "bg-indigo-600 text-white border-indigo-500 shadow-md" 
                                : "bg-slate-900/60 hover:bg-slate-900 text-slate-300 border-white/10"
                            }`}
                          >
                            {slot}
                            <span className="block text-[9px] font-mono opacity-75 mt-0.5">
                              {isBooked ? "Booked" : "Available"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE: EXPENSES */}
              {activeModule === "expenses" && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-white/10 shadow-sm flex flex-col justify-between">
                      <form onSubmit={addExpense} className="space-y-3">
                        <span className="text-[9px] font-mono uppercase text-slate-400">Log Receipt</span>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Item Name</label>
                          <input
                            type="text"
                            value={newExpenseName}
                            onChange={(e) => setNewExpenseName(e.target.value)}
                            placeholder="e.g. Train ticket"
                            className="w-full text-xs border border-white/10 rounded-lg px-2.5 py-1.5 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Amount (£)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={newExpenseAmount}
                            onChange={(e) => setNewExpenseAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full text-xs border border-white/10 rounded-lg px-2.5 py-1.5 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[10px] rounded-lg transition-colors"
                        >
                          Log Expense
                        </button>
                      </form>
                    </div>

                    <div className="md:col-span-2 bg-slate-900/60 rounded-xl border border-white/10 overflow-hidden shadow-sm flex flex-col">
                      <div className="px-4 py-2 bg-slate-950 border-b border-white/10 text-slate-400 text-[10px] font-mono uppercase flex">
                        <span className="w-1/2">Item</span>
                        <span className="w-1/4">Category</span>
                        <span className="w-1/4 text-right">Cost</span>
                      </div>
                      <div className="divide-y divide-white/5 overflow-y-auto max-h-[160px]">
                        {expenses.map((exp, idx) => (
                          <div key={idx} className="px-4 py-2.5 flex text-xs justify-between hover:bg-white/[0.02]">
                            <div className="w-1/2">
                              <p className="font-medium text-slate-200 truncate">{exp.item}</p>
                              <p className="text-[9px] font-mono text-slate-500">{exp.date}</p>
                            </div>
                            <span className="w-1/4 text-slate-400 self-center">{exp.category}</span>
                            <span className="w-1/4 text-right font-mono font-semibold text-slate-200 self-center">
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
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                      <span className="text-xs font-semibold text-slate-300">Trial Balance Ledger</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                        Balanced
                      </span>
                    </div>

                    <div className="bg-slate-900/60 border border-white/10 rounded-xl overflow-hidden shadow-sm">
                      <div className="px-4 py-2.5 bg-slate-950 border-b border-white/10 text-slate-400 text-[10px] font-mono uppercase flex">
                        <span className="w-2/5">Account</span>
                        <span className="w-1/5 text-slate-500">Code</span>
                        <span className="w-1/5 text-right">Debit</span>
                        <span className="w-1/5 text-right">Credit</span>
                      </div>
                      <div className="divide-y divide-white/5 text-xs">
                        <div className="px-4 py-2.5 flex items-center">
                          <span className="w-2/5 font-medium text-slate-200">Bank Current Account</span>
                          <span className="w-1/5 text-slate-500 font-mono">1200</span>
                          <span className="w-1/5 text-right font-mono text-slate-300">£14,250.00</span>
                          <span className="w-1/5 text-right text-slate-600">-</span>
                        </div>
                        <div className="px-4 py-2.5 flex items-center">
                          <span className="w-2/5 font-medium text-slate-200">Accounts Receivable</span>
                          <span className="w-1/5 text-slate-500 font-mono">1100</span>
                          <span className="w-1/5 text-right font-mono text-slate-300">£{invUnpaid.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          <span className="w-1/5 text-right text-slate-600">-</span>
                        </div>
                        <div className="px-4 py-2.5 flex items-center">
                          <span className="w-2/5 font-medium text-slate-200">Sales Revenues</span>
                          <span className="w-1/5 text-slate-500 font-mono">4000</span>
                          <span className="w-1/5 text-right text-slate-600">-</span>
                          <span className="w-1/5 text-right font-mono text-slate-300">£{(14250 + invUnpaid).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE: VAT TOOLS */}
              {activeModule === "vat-tools" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                      <span className="text-xs font-semibold text-slate-300">MTD UK VAT Return (Form 100)</span>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-mono">
                        HMRC Link Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-900/60 p-3.5 border border-white/10 rounded-xl shadow-sm">
                        <span className="text-[9px] font-mono uppercase text-slate-400">Box 1: Sales VAT</span>
                        <p className="text-base font-mono font-bold text-slate-200 mt-1">£{(crmTotalRev * 0.2).toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                        <span className="text-[8px] text-slate-500">Standard 20%</span>
                      </div>
                      <div className="bg-slate-900/60 p-3.5 border border-white/10 rounded-xl shadow-sm">
                        <span className="text-[9px] font-mono uppercase text-slate-400">Box 4: Reclaimed</span>
                        <p className="text-base font-mono font-bold text-slate-200 mt-1">£340.50</p>
                        <span className="text-[8px] text-slate-500">Purchases & Expenses</span>
                      </div>
                      <div className="bg-slate-900/60 p-3.5 border border-indigo-500/30 rounded-xl shadow-sm">
                        <span className="text-[9px] font-mono uppercase text-indigo-400">Box 5: Net Payable</span>
                        <p className="text-base font-mono font-bold text-indigo-400 mt-1">£{Math.max(0, (crmTotalRev * 0.2) - 340.50).toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                        <span className="text-[8px] text-slate-500">Due to HMRC</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE: CASHFLOW */}
              {activeModule === "cashflow" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                      <span className="text-xs font-semibold text-slate-300">Cashflow Forecast</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                        Surplus Forecasted
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-900/60 p-3.5 border border-white/10 rounded-xl space-y-2 text-xs shadow-sm">
                        <p className="font-medium text-slate-200 border-b border-white/10 pb-1.5 flex justify-between">
                          <span>Inflows (Receivables)</span>
                          <span className="text-emerald-400 font-mono">+£14,250.00</span>
                        </p>
                        <div className="space-y-1 text-slate-400">
                          <p className="flex justify-between"><span>DesignCo Contract</span><span className="font-mono text-slate-300">£4,500.00</span></p>
                          <p className="flex justify-between"><span>Jenkins Legal</span><span className="font-mono text-slate-300">£3,200.00</span></p>
                        </div>
                      </div>

                      <div className="bg-slate-900/60 p-3.5 border border-white/10 rounded-xl space-y-2 text-xs shadow-sm">
                        <p className="font-medium text-slate-200 border-b border-white/10 pb-1.5 flex justify-between">
                          <span>Outflows (Operating)</span>
                          <span className="text-rose-400 font-mono">-£2,450.00</span>
                        </p>
                        <div className="space-y-1 text-slate-400">
                          <p className="flex justify-between"><span>Office Workspace</span><span className="font-mono text-slate-300">£1,200.00</span></p>
                          <p className="flex justify-between"><span>HR Seats</span><span className="font-mono text-slate-300">£950.00</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE: TAXATION */}
              {activeModule === "taxation" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                      <span className="text-xs font-semibold text-slate-300">Corporation Tax Estimator (CT600)</span>
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                        Tax Year 2026/27
                      </span>
                    </div>

                    <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 space-y-3 text-xs shadow-sm">
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-slate-400">Net Revenues:</span>
                        <span className="font-mono font-medium text-slate-200">£{crmTotalRev.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-slate-400">Deductible Expenses:</span>
                        <span className="font-mono font-medium text-slate-200">£2,450.00</span>
                      </div>
                      <div className="flex justify-between items-center bg-indigo-500/10 p-2.5 border border-indigo-500/20 rounded-lg">
                        <span className="text-indigo-300 font-medium">Estimated Corp Tax (19% Rate)</span>
                        <span className="font-mono font-bold text-indigo-400 text-sm">
                          £{Math.max(0, (crmTotalRev - 3300) * 0.19).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE: FORMS */}
              {activeModule === "forms" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                      <span className="text-xs font-semibold text-slate-300">Form Submissions</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                        {formResponses} Responses
                      </span>
                    </div>

                    <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 shadow-sm space-y-3">
                      <button
                        onClick={() => {
                          setFormSubmitting(true);
                          setTimeout(() => {
                            setFormResponses(prev => prev + 1);
                            setFormSubmitting(false);
                            alert("Simulated form response submitted!");
                          }, 600);
                        }}
                        disabled={formSubmitting}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition-colors"
                      >
                        {formSubmitting ? "Submitting..." : "Simulate Form Submission"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE: HELPDESK */}
              {activeModule === "helpdesk" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                      <span className="text-xs font-semibold text-slate-300">Support Tickets</span>
                      <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-mono">
                        {tickets.filter(t => t.status === "Open").length} Open Tickets
                      </span>
                    </div>

                    <div className="space-y-2">
                      {tickets.map(t => (
                        <div key={t.id} className="p-3 bg-slate-900/60 border border-white/10 rounded-xl shadow-sm flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-400 font-bold">{t.id}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">{t.priority}</span>
                            </div>
                            <p className="text-xs font-medium text-slate-200 mt-1">{t.subject}</p>
                          </div>
                          <div>
                            {t.status === "Resolved" ? (
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                                Resolved
                              </span>
                            ) : (
                              <button
                                onClick={() => resolveTicket(t.id)}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-medium transition-colors"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE: CAMPAIGNS */}
              {activeModule === "campaigns" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                      <span className="text-xs font-semibold text-slate-300">Email Marketing</span>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-mono">
                        MTA Relay Active
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-900/60 p-3 border border-white/10 rounded-xl shadow-sm text-center">
                        <span className="text-[9px] font-mono uppercase text-slate-400">Sent</span>
                        <p className="text-base font-mono font-bold text-slate-200 mt-1">{campaignStats.sent}</p>
                      </div>
                      <div className="bg-slate-900/60 p-3 border border-white/10 rounded-xl shadow-sm text-center">
                        <span className="text-[9px] font-mono uppercase text-slate-400">Open Rate</span>
                        <p className="text-base font-mono font-bold text-emerald-400 mt-1">
                          {((campaignStats.opens / campaignStats.sent) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-slate-900/60 p-3 border border-white/10 rounded-xl shadow-sm text-center">
                        <span className="text-[9px] font-mono uppercase text-slate-400">Click Rate</span>
                        <p className="text-base font-mono font-bold text-indigo-400 mt-1">
                          {((campaignStats.clicks / campaignStats.sent) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE: COLLABORATION */}
              {activeModule === "collaboration" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                      <span className="text-xs font-semibold text-slate-300">Team Chat</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                        Online (3 Members)
                      </span>
                    </div>

                    <div className="bg-slate-900/60 border border-white/10 rounded-xl shadow-sm flex flex-col overflow-hidden">
                      <div className="p-3 space-y-2.5 overflow-y-auto max-h-[160px] min-h-[120px]">
                        {chatMessages.map((msg, idx) => (
                          <div key={idx} className="text-xs text-left">
                            <span className="font-semibold text-slate-200">{msg.user} </span>
                            <span className="text-[9px] font-mono text-slate-500">{msg.time}</span>
                            <p className="text-slate-300 bg-slate-950 p-2 rounded-lg mt-1 border border-white/5 font-medium">
                              {msg.text}
                            </p>
                          </div>
                        ))}
                      </div>
                      <form onSubmit={postChatMessage} className="p-2 border-t border-white/10 bg-slate-950 flex gap-2">
                        <input
                          type="text"
                          value={newChatText}
                          onChange={(e) => setNewChatText(e.target.value)}
                          placeholder="Type message..."
                          className="flex-1 border border-white/10 rounded-lg px-2.5 py-1 text-xs bg-slate-900 text-slate-200 focus:outline-none"
                        />
                        <button type="submit" className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-500 transition-colors">
                          Send
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE: AI CONTENT */}
              {activeModule === "ai-content" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                      <span className="text-xs font-semibold text-slate-300">AI Copy Generator</span>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-mono">
                        Powered by Gemini
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-900/60 p-3.5 border border-white/10 rounded-xl shadow-sm space-y-2.5">
                        <button
                          onClick={generateAiContent}
                          disabled={aiContentGenerating}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors"
                        >
                          {aiContentGenerating ? "Generating..." : "Generate Campaign Copy"}
                        </button>
                      </div>

                      <div className="bg-slate-950 text-white p-3.5 border border-white/10 rounded-xl shadow-sm flex flex-col justify-between text-xs font-mono">
                        <div className="whitespace-pre-wrap leading-relaxed text-slate-300 min-h-[100px]">
                          {aiContentOutput || "Click generate to draft copy blocks..."}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE: KPI DASHBOARD */}
              {activeModule === "kpi-dashboard" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                      <span className="text-xs font-semibold text-slate-300">KPI Performance</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                        System Optimized
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-slate-900/60 p-3.5 border border-white/10 rounded-xl shadow-sm">
                        <span className="text-[9px] font-mono uppercase text-slate-400">MRR Forecast</span>
                        <p className="text-base font-mono font-bold text-slate-200 mt-1">£4,850.00</p>
                      </div>
                      <div className="bg-slate-900/60 p-3.5 border border-white/10 rounded-xl shadow-sm">
                        <span className="text-[9px] font-mono uppercase text-slate-400">CAC Cost</span>
                        <p className="text-base font-mono font-bold text-slate-200 mt-1">£42.50</p>
                      </div>
                      <div className="bg-slate-900/60 p-3.5 border border-white/10 rounded-xl shadow-sm">
                        <span className="text-[9px] font-mono uppercase text-slate-400">LTV Value</span>
                        <p className="text-base font-mono font-bold text-slate-200 mt-1">£380.00</p>
                      </div>
                      <div className="bg-slate-900/60 p-3.5 border border-white/10 rounded-xl shadow-sm">
                        <span className="text-[9px] font-mono uppercase text-slate-400">NPS Rating</span>
                        <p className="text-base font-mono font-bold text-slate-200 mt-1">74 / 100</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE: SUPPLIERS */}
              {activeModule === "suppliers" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                      <span className="text-xs font-semibold text-slate-300">Supplier Directory</span>
                      <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded font-mono border border-white/10">
                        {suppliers.length} Registered
                      </span>
                    </div>

                    <div className="bg-slate-900/60 border border-white/10 rounded-xl overflow-hidden shadow-sm">
                      <div className="divide-y divide-white/5 text-xs">
                        {suppliers.map((sup, idx) => (
                          <div key={idx} className="px-4 py-3 flex items-center justify-between hover:bg-white/[0.02]">
                            <span className="font-medium text-slate-200">{sup.name}</span>
                            <span className="text-slate-400">{sup.contact}</span>
                            <span className="text-indigo-400 font-mono">{"★".repeat(sup.rating)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE: E-SIGNATURE */}
              {activeModule === "e-signature" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                      <span className="text-xs font-semibold text-slate-300">Digital Contracts</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                        HMRC Compliant
                      </span>
                    </div>

                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div key={doc.id} className="p-3 bg-slate-900/60 border border-white/10 rounded-xl shadow-sm flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-200 truncate">{doc.name}</span>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${
                              doc.status === "Signed" 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}>
                              {doc.status}
                            </span>
                            {doc.status !== "Signed" && (
                              <button
                                onClick={() => signDoc(doc.id)}
                                className="px-2.5 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[9px] font-medium transition-colors"
                              >
                                Sign
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE: MICRO PAGES */}
              {activeModule === "micro-pages" && (
                <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    <div className="bg-slate-900/60 p-4 border border-white/10 rounded-xl shadow-sm space-y-3">
                      <span className="text-[9px] font-mono uppercase text-slate-400">Bio Header</span>
                      <input
                        type="text"
                        value={bioPageTitle}
                        onChange={(e) => setBioPageTitle(e.target.value)}
                        className="w-full text-xs border border-white/10 rounded-lg px-2.5 py-1.5 bg-slate-950 text-slate-200 focus:outline-none"
                      />
                      <div className="space-y-2">
                        {bioLinks.map((link, idx) => (
                          <input
                            key={idx}
                            type="text"
                            value={link.label}
                            onChange={(e) => updateBioLinkLabel(idx, e.target.value)}
                            className="w-full text-xs border border-white/10 rounded px-2.5 py-1 bg-slate-950 text-slate-200 focus:outline-none"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 border border-white/10 rounded-xl flex items-center justify-center">
                      <div className="w-44 bg-slate-900 border-2 border-white/20 rounded-3xl p-3 shadow-xl flex flex-col items-center text-center">
                        <h5 className="text-[10px] font-bold text-slate-200 mt-2">{bioPageTitle}</h5>
                        <div className="space-y-1.5 w-full mt-3">
                          {bioLinks.map((link, idx) => (
                            <div key={idx} className="w-full py-1 bg-indigo-600 text-[8px] font-medium text-white rounded">
                              {link.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE: GENERIC FALLBACK */}
              {![
                "dashboard", "invoicing", "crm", "mailbox", "tasks", "ai-notes", 
                "compliance", "inventory", "hr-records", "booking", "expenses",
                "accounting", "vat-tools", "cashflow", "taxation",
                "forms", "helpdesk", "campaigns", "collaboration", "ai-content", 
                "kpi-dashboard", "suppliers", "e-signature", "micro-pages"
              ].includes(activeModule) && (
                <div className="space-y-6 flex-1 flex flex-col justify-center items-center py-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-sm">
                    {(() => {
                      const found = modulesList.flatMap(g => g.items).find(i => i.id === activeModule);
                      if (found) {
                        const Icon = found.icon;
                        return <Icon className="w-7 h-7" />;
                      }
                      return <Settings className="w-7 h-7" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-100 capitalize">
                      {activeModule.replace("-", " ")} Module
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed font-normal">
                      Okleevo replaces standard separate subscriptions by running {activeModule.replace("-", " ")} natively.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveModule("dashboard")}
                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-xs shadow-md transition-colors"
                  >
                    Return to Overview
                  </button>
                </div>
              )}

            </div>

            {/* Footer Session Strip */}
            <div className="px-5 py-3 bg-slate-950/90 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Enterprise Workspace Active</span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle className="w-3 h-3 text-emerald-400" /> Auto-sync enabled
              </span>
            </div>

          </main>

        </div>

      </div>
    </section>
  );
}
