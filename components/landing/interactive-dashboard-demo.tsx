"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Kanban,
  Video,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Mic,
  MicOff,
  PhoneOff,
  FileText,
  Lock,
  Download,
  Search,
  CheckCircle2,
  Play,
  Pause,
  Bot,
  Zap
} from "lucide-react";

type DemoTab = "crm" | "huddles" | "ai" | "vault";

export function InteractiveDashboardDemo() {
  const [activeTab, setActiveTab] = useState<DemoTab>("crm");
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [revenue, setRevenue] = useState(148500);

  // Auto tour cycling
  useEffect(() => {
    if (!isAutoPlaying) return;
    const tabs: DemoTab[] = ["crm", "huddles", "ai", "vault"];
    const interval = setInterval(() => {
      setActiveTab((current) => {
        const nextIndex = (tabs.indexOf(current) + 1) % tabs.length;
        return tabs[nextIndex];
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Simulate live revenue ticking up
  useEffect(() => {
    const interval = setInterval(() => {
      setRevenue((prev) => prev + Math.floor(Math.random() * 450));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="demo" className="py-20 bg-gradient-to-b from-slate-50 via-orange-50/40 to-white text-slate-900 relative overflow-hidden">
      {/* Background radial orange accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-gradient-to-tr from-orange-300/30 via-amber-200/25 to-orange-400/20 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-700 bg-orange-100 border border-orange-200 px-3 py-1 rounded-full shadow-sm">
            Live Workspace Simulator
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-4 text-slate-900">
            Experience Okleevo in Action
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base font-normal">
            Click through the interactive modules below to test Okleevo’s core enterprise capabilities in real-time.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: "crm", label: "CRM & Revenue Pipeline", icon: Kanban },
            { id: "huddles", label: "Live Voice & Video Huddles", icon: Video },
            { id: "ai", label: "AI Meeting Transcripts", icon: Sparkles },
            { id: "vault", label: "Zero-Trust Client Vault", icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as DemoTab);
                  setIsAutoPlaying(false);
                }}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-300 shrink-0 ${isActive
                    ? "text-white shadow-[0_4px_20px_rgba(252,104,19,0.35)]"
                    : "text-slate-700 hover:text-slate-900 bg-white hover:bg-orange-50 border border-slate-200 shadow-sm"
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabPillLightSimulator"
                    className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          {/* Play / Pause Auto Tour Toggle */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-mono text-slate-700 bg-white border border-slate-200 hover:text-slate-900 shadow-sm transition"
            title={isAutoPlaying ? "Pause auto tour" : "Start auto tour"}
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                <span className="hidden sm:inline font-bold">Auto Tour ON</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline font-bold">Auto Tour OFF</span>
              </>
            )}
          </button>
        </div>

        {/* 3D Floating Dashboard Container (Light Mode with Orange Gradient accents) */}
        <div className="relative group">
          {/* Ambient Backlight Glow behind window */}
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-400/35 via-amber-300/30 to-orange-400/35 rounded-3xl blur-2xl opacity-70 group-hover:opacity-100 transition duration-700 pointer-events-none" />

          {/* Window Shell */}
          <div className="relative rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-[0_20px_60px_-15px_rgba(252,104,19,0.18)] overflow-hidden min-h-[540px] flex flex-col">

            {/* Window Header Bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-100/90 border-b border-slate-200 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 font-mono text-[11px] text-slate-500 font-semibold hidden sm:inline">
                  okleevo-workspace.internal / enterprise-hq
                </span>
              </div>

              {/* Center Search Simulation */}
              <div className="hidden md:flex items-center gap-2 bg-white px-3 py-1 rounded-md border border-slate-200 text-slate-500 shadow-sm w-64">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px]">Search deals, files, transcripts... (Cmd+K)</span>
              </div>

              {/* Right Live Status Pill */}
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Live Sync
                </span>
              </div>
            </div>

            {/* Window Body - Dynamic Tab Views */}
            <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between bg-gradient-to-b from-orange-50/30 via-white to-slate-50/50">
              <AnimatePresence mode="wait">
                {activeTab === "crm" && <CRMView key="crm" revenue={revenue} />}
                {activeTab === "huddles" && <HuddlesView key="huddles" />}
                {activeTab === "ai" && <AIView key="ai" />}
                {activeTab === "vault" && <VaultView key="vault" />}
              </AnimatePresence>
            </div>

            {/* Bottom Status Footer Strip */}
            <div className="px-4 sm:px-6 py-2.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-mono font-semibold">
              <div className="flex items-center gap-4">
                <span>ACTIVE SEATS: 24/25</span>
                <span>LATENCY: 12ms</span>
                <span className="hidden sm:inline">MALWARE SHIELD: ACTIVE</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <span>Interactive Live Demo State</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

{/* Tab View 1: CRM & Revenue Pipeline */ }
function CRMView({ revenue }: { revenue: number }) {
  const [deals] = useState([
    { id: 1, name: "Acme Corp Enterprise License", value: "$48,000", stage: "Negotiation", client: "Acme Corp", date: "Just now" },
    { id: 2, name: "Nexus Systems Annual Expansion", value: "$92,000", stage: "Closed Won", client: "Nexus Inc", date: "2 mins ago" },
    { id: 3, name: "Starlight SaaS Migration", value: "$34,500", stage: "Proposal Sent", client: "Starlight", date: "12 mins ago" },
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 text-slate-900"
    >
      {/* Top Telemetry Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Quarterly Pipeline ARR</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            ${revenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <span>+18.4% vs last month</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Average Velocity</span>
            <Zap className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">4.2 Days</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Lead to Closed-Won</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Win Rate (Q3)</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">68.5%</div>
          <div className="text-[11px] text-blue-600 font-bold mt-1">+6.2% Industry Avg</div>
        </div>
      </div>

      {/* Kanban Board Mockup */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          { title: "Lead Inbound", count: 4, color: "bg-slate-400" },
          { title: "Proposal Sent", count: 3, color: "bg-amber-500" },
          { title: "Negotiation", count: 2, color: "bg-orange-500" },
          { title: "Closed Won", count: 8, color: "bg-emerald-500" },
        ].map((column, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-slate-100/70 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${column.color}`} />
                <span>{column.title}</span>
              </div>
              <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] text-slate-600 font-mono">{column.count}</span>
            </div>

            {deals.filter(d => idx === 1 ? d.stage === "Proposal Sent" : idx === 2 ? d.stage === "Negotiation" : idx === 3 ? d.stage === "Closed Won" : true).slice(0, 1).map((deal) => (
              <motion.div
                key={deal.id}
                whileHover={{ scale: 1.02 }}
                className="p-3 rounded-lg bg-white border border-slate-200 shadow-sm cursor-pointer space-y-2 hover:border-orange-400 transition"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>{deal.client}</span>
                  <span className="text-emerald-600 font-mono">{deal.value}</span>
                </div>
                <p className="text-[11px] text-slate-600 truncate font-medium">{deal.name}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100 font-medium">
                  <span>Updated {deal.date}</span>
                  <span className="text-orange-600 font-bold">95% Match</span>
                </div>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

{/* Tab View 2: Voice & Video Huddles */ }
function HuddlesView() {
  const [isMuted, setIsMuted] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 text-slate-900"
    >
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-slate-200 shadow-sm text-xs">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-bold text-slate-900">Engineering Architecture & Product Sync</span>
          <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono">4 Participants</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium">
          <span>1080p Studio HD</span>
          <span>• Encrypted Meeting</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { name: "Sarah Chen (VP Product)", role: "Speaking", avatar: "👩‍💻", isSpeaking: true },
          { name: "Alex Rivera (Tech Lead)", role: "Muted", avatar: "👨‍💻", isSpeaking: false },
          { name: "David Kim (Lead Architect)", role: "Screen Share", avatar: "👨‍🔬", isSpeaking: false },
          { name: "Elena Rostova (Design)", role: "Listening", avatar: "👩‍🎨", isSpeaking: false },
        ].map((user, idx) => (
          <div
            key={idx}
            className={`relative rounded-xl p-4 bg-white border flex flex-col items-center justify-between min-h-[140px] overflow-hidden transition-all ${user.isSpeaking ? "border-orange-500 shadow-[0_4px_20px_rgba(252,104,19,0.25)]" : "border-slate-200 shadow-sm"
              }`}
          >
            <div className="w-full flex items-center justify-between text-[10px]">
              <span className={`px-2 py-0.5 rounded font-bold ${user.isSpeaking ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-600"}`}>
                {user.role}
              </span>
              {user.isSpeaking && (
                <div className="flex items-center gap-0.5">
                  <span className="w-1 h-3 bg-orange-500 rounded animate-pulse" />
                  <span className="w-1 h-4 bg-orange-500 rounded animate-pulse delay-75" />
                  <span className="w-1 h-2 bg-orange-500 rounded animate-pulse delay-150" />
                </div>
              )}
            </div>

            <div className="text-3xl my-2">{user.avatar}</div>

            <div className="w-full text-center truncate">
              <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 py-3 rounded-xl bg-slate-100 border border-slate-200 shadow-inner">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-3 rounded-full transition shadow-sm ${isMuted ? "bg-red-100 text-red-600 border border-red-300" : "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50"
            }`}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <button className="p-3 rounded-full bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 transition shadow-sm">
          <Video className="w-4 h-4" />
        </button>
        <button className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition shadow-md">
          <PhoneOff className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

{/* Tab View 3: AI Meeting Intelligence */ }
function AIView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 text-slate-900"
    >
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600">
            <Bot className="w-4 h-4" />
            <span>Autonomous AI Meeting Transcription & Action Extractor</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Model: Groq Llama-3 70B</span>
        </div>

        {/* Dynamic Transcript Stream Box with crisp dark contrast styling */}
        <div className="space-y-2 font-mono text-xs text-slate-100 bg-slate-900 p-3.5 rounded-lg border border-slate-800 max-h-40 overflow-y-auto custom-scrollbar shadow-inner">
          <p className="text-slate-400 text-[10px]">[14:32:01] Transcript stream initialized...</p>
          <p><span className="text-orange-400 font-bold">Sarah Chen:</span> "We've confirmed the Q4 architecture migration roadmap. Okleevo will handle zero-trust file scanning directly."</p>
          <p><span className="text-blue-400 font-bold">Alex Rivera:</span> "Awesome. I'll deploy the updated API proxy by end of day today."</p>
          <p className="text-emerald-400 font-bold animate-pulse">[AI Auto-Extracting Action Items...]</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Action Item #1 (Assigned: Alex)</span>
          </div>
          <p className="text-slate-700 font-medium">Deploy updated zero-trust proxy endpoints to production worker.</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-[11px]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Executive Summary</span>
          </div>
          <p className="text-slate-700 font-medium">Client onboarding workflow reduced from 3 days to under 4 minutes.</p>
        </div>
      </div>
    </motion.div>
  );
}

{/* Tab View 4: Zero-Trust Client Vault */ }
function VaultView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 text-slate-900"
    >
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm text-xs">
        <div className="flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-slate-900">Client Storage Bucket: bucket-eu-enterprise-09</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
          ClamAV Malware Engine: 100% Clean
        </span>
      </div>

      <div className="space-y-2">
        {[
          { name: "Q4_Master_Services_Agreement_Signed.pdf", size: "4.2 MB", status: "Scanned & Encrypted", date: "Today, 14:20" },
          { name: "Brand_Design_Tokens_2026.zip", size: "128.4 MB", status: "Scanned & Encrypted", date: "Yesterday" },
          { name: "Financial_Audit_Report_CONFIDENTIAL.xlsx", size: "1.8 MB", status: "Scanned & Encrypted", date: "3 days ago" },
        ].map((file, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-orange-300 shadow-sm text-xs transition"
          >
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="w-4 h-4 text-orange-600 shrink-0" />
              <div className="truncate">
                <p className="text-slate-900 font-bold truncate">{file.name}</p>
                <p className="text-[10px] text-slate-500 font-medium">{file.size} • {file.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold hidden sm:inline">
                {file.status}
              </span>
              <button className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
