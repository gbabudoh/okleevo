"use client";

import { useState, useRef, useEffect } from 'react';
import {
  PenTool, Search, Download, Upload,
  FileText, CheckCircle, Clock, XCircle, AlertCircle,
  Eye, Trash2, Share2, Check, X,
  FileCheck, Grid, List, Shield, Lock,
  Plus, Filter, MoreVertical, Send, UserPlus,
  History, Sparkles, ShieldCheck, Copy, Calendar,
  Mail, FileSignature, ArrowRight, Layers, FileCode
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { ModuleGuideBanner } from '@/components/tours/ModuleGuideBanner';

interface Recipient {
  name: string;
  email: string;
  role: 'signer' | 'approver' | 'cc';
  status: 'signed' | 'pending' | 'declined';
  signedDate?: string;
  ipAddress?: string;
}

interface DocumentEnvelope {
  id: string;
  name: string;
  type: string;
  status: 'signed' | 'pending' | 'declined' | 'draft' | 'expired';
  createdDate: string;
  signedDate?: string;
  expiryDate?: string;
  sender: string;
  envelopeHash: string;
  routingOrder: 'parallel' | 'sequential';
  recipients: Recipient[];
  description?: string;
  pages: number;
}

const SAMPLE_ENVELOPES: DocumentEnvelope[] = [];

const STATUS_CONFIGS = {
  signed:   { label: 'Legally Sealed', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle },
  pending:  { label: 'Out for Sign',  bg: 'bg-amber-50 text-amber-700 border-amber-200',     dot: 'bg-amber-500',   icon: Clock },
  declined: { label: 'Declined',      bg: 'bg-rose-50 text-rose-700 border-rose-200',        dot: 'bg-rose-500',    icon: XCircle },
  draft:    { label: 'In Preparation',bg: 'bg-slate-100 text-slate-700 border-slate-200',   dot: 'bg-slate-400',   icon: FileText },
  expired:  { label: 'Expired',       bg: 'bg-purple-50 text-purple-700 border-purple-200',  dot: 'bg-purple-500',  icon: AlertCircle },
};

const TEMPLATE_PRESETS = [
  { name: 'Mutual NDA Agreement', category: 'Legal', pages: 4, desc: 'Standard non-disclosure agreement for dual commercial discussions.' },
  { name: 'Service Level Agreement (SLA)', category: 'Commercial', pages: 8, desc: 'Client engagement terms, deliverables, and payment milestones.' },
  { name: 'Employment Offer & Contract', category: 'HR', pages: 5, desc: 'UK employment terms with IP assignment & confidentiality provisions.' },
  { name: 'Board Written Resolution', category: 'Corporate', pages: 2, desc: 'Director consent and written resolution for company records.' },
];

export default function ESignaturePage() {
  const [documents, setDocuments] = useState<DocumentEnvelope[]>(SAMPLE_ENVELOPES);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Modal states
  const [showSignSelfModal, setShowSignSelfModal] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState<DocumentEnvelope | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentEnvelope | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<DocumentEnvelope | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // New Request Wizard State
  const [newRequestStep, setNewRequestStep] = useState<1 | 2 | 3>(1);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('Commercial Agreement');
  const [newRouting, setNewRouting] = useState<'parallel' | 'sequential'>('parallel');
  const [newRecipients, setNewRecipients] = useState<Array<{ name: string; email: string; role: 'signer' | 'approver' | 'cc' }>>([
    { name: '', email: '', role: 'signer' }
  ]);
  const [eSignConsent, setESignConsent] = useState(false);

  // Signature Pad state
  const [signatureType, setSignatureType] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  const showNotify = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total:     documents.length,
    signed:    documents.filter(d => d.status === 'signed').length,
    pending:   documents.filter(d => d.status === 'pending').length,
    draft:     documents.filter(d => d.status === 'draft').length,
    awaiting:  documents.filter(d => d.recipients.some(r => r.email.includes('alex.director') && r.status === 'pending')).length,
  };

  // Signature pad setup
  useEffect(() => {
    if (!showSignSelfModal) return;
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.imageSmoothingEnabled = true;
    }, 150);
    return () => clearTimeout(timer);
  }, [showSignSelfModal]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const drawSmoothLine = (ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }) => {
    const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
    ctx.quadraticCurveTo(from.x, from.y, mid.x, mid.y);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCoordinates(e);
    if (!coords) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setLastPoint(coords);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !lastPoint) return;
    const coords = getCoordinates(e);
    if (!coords) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const distance = Math.sqrt(Math.pow(coords.x - lastPoint.x, 2) + Math.pow(coords.y - lastPoint.y, 2));
    const speed = Math.min(distance, 20);
    ctx.lineWidth = Math.max(1.8, Math.min(4.5, 3 - speed / 20));
    ctx.strokeStyle = '#2563EB';
    drawSmoothLine(ctx, lastPoint, coords);
    ctx.stroke();
    setLastPoint(coords);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.closePath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleCreateEnvelope = () => {
    if (!newDocName.trim()) {
      showNotify('Please enter a document name', 'error');
      return;
    }
    const validRecipients = newRecipients.filter(r => r.name.trim() && r.email.trim());
    if (validRecipients.length === 0) {
      showNotify('Please add at least one recipient with name and email', 'error');
      return;
    }

    const newEnv: DocumentEnvelope = {
      id: `ENV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newDocName.endsWith('.pdf') ? newDocName : `${newDocName}.pdf`,
      type: newDocType,
      status: 'pending',
      createdDate: new Date().toISOString().split('T')[0],
      sender: 'alex.director@okleevo.com',
      envelopeHash: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
      routingOrder: newRouting,
      pages: Math.floor(Math.random() * 5) + 2,
      recipients: validRecipients.map(r => ({ ...r, status: 'pending' })),
    };

    setDocuments([newEnv, ...documents]);
    setShowNewRequestModal(false);
    setNewDocName('');
    setNewRequestStep(1);
    showNotify(`Signature request dispatched for "${newEnv.name}"`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 md:pb-12 font-sans text-slate-900 dark:text-slate-100">

      {/* ── Glassmorphic Sticky Header ── */}
      <div className="sticky top-0 z-40 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <FileSignature className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                    E-Signature Studio
                  </h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-extrabold uppercase bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200/80 dark:border-orange-900/40 shrink-0">
                    eIDAS / ESIGN
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                  Legally binding signatures &amp; workflows
                </p>
              </div>
            </div>

            <div className="sm:hidden shrink-0">
              <ModuleGuideBanner
                moduleId="e-signature"
                moduleName="E-Signature"
                summary="Execute contracts, create reusable templates, and track cryptographic audit trails compliant with eIDAS & ESIGN Act."
                tips={[
                  "Upload PDFs or pick from pre-built agreement templates",
                  "Set sequential or parallel multi-signer routing rules",
                  "Download SHA-256 cryptographic Audit Certificates for legal proof"
                ]}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="hidden sm:block shrink-0">
              <ModuleGuideBanner
                moduleId="e-signature"
                moduleName="E-Signature"
                summary="Execute contracts, create reusable templates, and track cryptographic audit trails compliant with eIDAS & ESIGN Act."
                tips={[
                  "Upload PDFs or pick from pre-built agreement templates",
                  "Set sequential or parallel multi-signer routing rules",
                  "Download SHA-256 cryptographic Audit Certificates for legal proof"
                ]}
              />
            </div>
            <button
              onClick={() => setShowSignSelfModal(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 text-xs font-extrabold transition cursor-pointer shadow-2xs active:scale-95"
            >
              <PenTool className="w-3.5 h-3.5 text-orange-500" />
              <span>Sign Myself</span>
            </button>
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-black shadow-md shadow-orange-500/20 transition cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Request Signatures</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-3.5 sm:px-6 space-y-4 sm:space-y-6">

        {/* ── High-Performance Telemetry Pods (Mobile-Optimized Clean Cards) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { id: 'all',       label: 'Total Managed',  badge: 'All',           value: stats.total,    icon: Layers,        iconCls: 'from-orange-500 to-amber-600' },
            { id: 'signed',    label: 'Legally Sealed', badge: 'Executed',      value: stats.signed,   icon: ShieldCheck,   iconCls: 'from-emerald-500 to-teal-600' },
            { id: 'pending',   label: 'Out for Sign',   badge: 'Awaiting',      value: stats.pending,  icon: Clock,         iconCls: 'from-amber-500 to-orange-500' },
            { id: 'draft',     label: 'In Preparation', badge: 'Drafts',        value: stats.draft,    icon: FileText,      iconCls: 'from-indigo-500 to-purple-600' },
          ].map((item) => {
            const isSelected = selectedStatus === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedStatus(isSelected ? 'all' : item.id)}
                className={`bg-white dark:bg-slate-950 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border text-left transition-all cursor-pointer flex flex-col justify-between min-w-0 group ${
                  isSelected ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-md' : 'border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-orange-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-r ${item.iconCls} flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform shrink-0`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-800 truncate">
                    {item.badge}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight leading-none mb-1">{item.value}</h3>
                  <p className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 leading-snug truncate">{item.label}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Instant Workflow Hero Banner ── */}
        <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-200/60 dark:border-orange-900/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden shadow-2xs">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-orange-200/80 dark:border-orange-900/40 text-orange-600 dark:text-orange-400 text-xs font-extrabold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>Instant Workflow</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Upload &amp; Dispatch Documents in Seconds
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-bold">
                Drag any PDF, Word document, or image into Okleevo to automatically attach legal signature fields, assign signers, and generate cryptographic audit trails.
              </p>
            </div>

            {/* Quick Templates Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full lg:w-auto">
              <label className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-extrabold shadow-sm shadow-orange-500/20 transition-all cursor-pointer active:scale-95 text-center">
                <Upload className="w-4 h-4" />
                <span>Upload PDF / Word</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewDocName(file.name);
                      setShowNewRequestModal(true);
                      showNotify(`Uploaded ${file.name}. Configure signers below.`);
                    }
                  }}
                />
              </label>

              <button
                onClick={() => {
                  setNewDocName(TEMPLATE_PRESETS[0].name);
                  setNewDocType('Mutual NDA');
                  setShowNewRequestModal(true);
                }}
                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-slate-950 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-extrabold border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer shadow-2xs active:scale-95 text-center"
              >
                <FileCode className="w-4 h-4 text-orange-500" />
                <span>NDA Template</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Search & Filter Dock ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-950 p-3.5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search envelopes by name, type, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-500 transition-all"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide max-w-full">
            {[
              { id: 'all', label: 'All' },
              { id: 'signed', label: 'Legally Sealed' },
              { id: 'pending', label: 'Pending' },
              { id: 'draft', label: 'Draft' },
            ].map((tab) => {
              const active = selectedStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    active
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl shrink-0 self-end sm:self-auto border border-slate-200/60 dark:border-slate-800">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-white dark:bg-slate-950 text-orange-500 shadow-2xs' : 'text-slate-400'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white dark:bg-slate-950 text-orange-500 shadow-2xs' : 'text-slate-400'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── DOCUMENT MASTER TABLE / GRID ── */}
        {filteredDocuments.length === 0 ? (
          <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 sm:p-16 text-center space-y-4 shadow-2xs">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-2xs">
              <FileSignature className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">No Document Envelopes Found</h3>
              <p className="text-xs font-bold text-slate-400">
                {searchQuery ? 'No signature requests matched your search filters.' : 'Get started by creating your first legally-binding e-signature request.'}
              </p>
            </div>
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-extrabold shadow-sm shadow-orange-500/20 hover:from-orange-600 hover:to-amber-700 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Signature Request</span>
            </button>
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-widest">
                    <th className="px-5 py-4">Envelope &amp; Document</th>
                    <th className="px-4 py-4">Category</th>
                    <th className="px-4 py-4">Signer Status</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-xs">
                  {filteredDocuments.map((doc) => {
                    const statusCfg = STATUS_CONFIGS[doc.status];
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-colors group">
                        <td className="px-5 py-4 min-w-[240px]">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl flex items-center justify-center shrink-0 font-extrabold shadow-2xs">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-extrabold text-slate-900 dark:text-white truncate group-hover:text-orange-500 transition-colors">{doc.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">{doc.id} • {doc.pages} pages</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 text-[11px] font-extrabold">
                            {doc.type}
                          </span>
                        </td>

                        <td className="px-4 py-4 min-w-[200px]">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              {doc.recipients.map((r, i) => (
                                <div
                                  key={i}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-extrabold text-white relative ${
                                    r.status === 'signed' ? 'bg-emerald-600' : 'bg-amber-500'
                                  }`}
                                  title={`${r.name} (${r.role}) - ${r.status}`}
                                >
                                  {r.name.charAt(0)}
                                  {r.status === 'signed' && (
                                    <Check className="w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 bg-white text-emerald-600 rounded-full p-0.5" />
                                  )}
                                </div>
                              ))}
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono font-bold">
                              {doc.recipients.filter(r => r.status === 'signed').length} of {doc.recipients.length} signed
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border ${statusCfg.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                            {statusCfg.label}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedDocument(doc)}
                              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 transition-colors cursor-pointer shadow-2xs"
                              title="Inspect Envelope"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setShowAuditModal(doc)}
                              className="p-2.5 rounded-2xl bg-orange-50 dark:bg-orange-950/60 hover:bg-orange-100 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/40 transition-colors cursor-pointer shadow-2xs"
                              title="Legal Audit Certificate"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => showNotify(`Downloading ${doc.name}...`)}
                              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 transition-colors cursor-pointer shadow-2xs"
                              title="Download Signed PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => {
              const statusCfg = STATUS_CONFIGS[doc.status];
              return (
                <div key={doc.id} className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-2xs hover:border-orange-300 transition-all flex flex-col justify-between space-y-4 group">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-2xs">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${statusCfg.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors">{doc.name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono font-bold mt-1">{doc.id} • {doc.type}</p>
                    </div>
                  </div>

                  <div className="pt-3.5 border-t border-slate-100 dark:border-slate-900 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono font-bold">
                      <span>Signers</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">{doc.recipients.filter(r => r.status === 'signed').length} / {doc.recipients.length}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedDocument(doc)}
                        className="flex-1 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 text-xs font-extrabold transition-colors cursor-pointer shadow-2xs"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => setShowAuditModal(doc)}
                        className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-extrabold shadow-sm shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
                      >
                        Audit Log
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── LEGAL & TRUST FOOTER BAR ── */}
        <div className="bg-white dark:bg-slate-950 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 dark:text-white">eIDAS &amp; ESIGN Act Legal Compliance Guarantee</p>
              <p className="text-slate-400 font-bold text-[11px] mt-0.5">All envelopes contain cryptographic SHA-256 integrity hashes &amp; UTC timestamped Audit Certificates.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-mono font-extrabold text-[10px] border border-slate-200/60 dark:border-slate-800">
              AES-256 Encrypted
            </span>
          </div>
        </div>

      </div>

      {/* ── Adopt Official Digital Signature Modal ── */}
      {showSignSelfModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 pb-24 sm:pb-4 md:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={() => setShowSignSelfModal(false)} />
          <div className="relative bg-white dark:bg-slate-950 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[calc(100dvh-7.5rem)] sm:max-h-[85vh] transform animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="shrink-0 px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                    Adopt Official Digital Signature
                  </h3>
                  <p className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-400">
                    Legally binding eIDAS &amp; ESIGN certificate
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSignSelfModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              {/* Segmented Mode Switcher Tabs */}
              <div className="flex gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl w-full">
                {(['draw', 'type', 'upload'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSignatureType(t)}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold capitalize transition-all cursor-pointer ${
                      signatureType === t
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Signature Canvas / Type / Upload Container */}
              <div className="border-2 border-dashed border-slate-200/80 dark:border-slate-800 rounded-3xl h-44 sm:h-48 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/40 relative overflow-hidden shadow-2xs">
                {signatureType === 'draw' && (
                  <>
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="absolute inset-0 w-full h-full cursor-crosshair touch-none z-10"
                    />
                    {/* Baseline Guide */}
                    <div className="absolute bottom-8 left-8 right-8 border-b-2 border-dashed border-orange-300/40 dark:border-orange-900/40 pointer-events-none flex items-center justify-between pb-1">
                      <span className="text-[10px] font-mono font-bold text-orange-400/80 uppercase tracking-widest">x Sign Here</span>
                      <span className="text-[10px] font-mono text-slate-300 dark:text-slate-700">Digital Pad</span>
                    </div>
                    {!isDrawing && !lastPoint && (
                      <span className="text-xs font-bold text-slate-400 pointer-events-none z-0">
                        Draw your signature above using touch or mouse
                      </span>
                    )}
                    <button
                      onClick={clearCanvas}
                      className="absolute top-3 right-3 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl text-[10px] font-mono font-extrabold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shadow-2xs z-20 cursor-pointer"
                    >
                      Clear
                    </button>
                  </>
                )}

                {signatureType === 'type' && (
                  <div className="w-full px-4 sm:px-6 text-center space-y-2">
                    <input
                      type="text"
                      placeholder="Type full legal name"
                      value={typedSignature}
                      onChange={(e) => setTypedSignature(e.target.value)}
                      className="w-full text-center text-2xl sm:text-4xl text-slate-900 dark:text-white bg-transparent outline-none font-serif italic"
                    />
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Cursive Legal Font Preview</p>
                  </div>
                )}

                {signatureType === 'upload' && (
                  <div className="text-center space-y-2 p-4">
                    <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/60 text-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Upload transparent PNG signature</p>
                    <p className="text-[10px] font-mono text-slate-400">Max 5MB · Transparent background</p>
                  </div>
                )}
              </div>

              {/* eIDAS / ESIGN Legal Consent Container */}
              <label className="flex items-start gap-3 p-3.5 sm:p-4 bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40 rounded-2xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={eSignConsent}
                  onChange={(e) => setESignConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-orange-500 focus:ring-orange-400 cursor-pointer"
                />
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0" /> Legally Binding Consent
                  </p>
                  <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                    I agree that this electronic signature is intended to be my binding legal signature under eIDAS (EU/UK No 910/2014) and US ESIGN Act.
                  </p>
                </div>
              </label>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 border-t-2 border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3 shadow-xl z-20">
              <button
                type="button"
                onClick={() => setShowSignSelfModal(false)}
                className="flex-1 sm:flex-initial sm:min-w-[100px] py-3 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl text-xs font-black transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!eSignConsent}
                onClick={() => {
                  setShowSignSelfModal(false);
                  showNotify('Official signature adopted and saved to profile', 'success');
                }}
                className="flex-2 sm:flex-initial sm:min-w-[160px] py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-black disabled:opacity-40 transition-all shadow-lg shadow-orange-500/30 active:scale-95 cursor-pointer text-center"
              >
                Adopt &amp; Save Signature
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          NEW SIGNATURE REQUEST WIZARD MODAL
      ══════════════════════════════════════════════════════════════ */}
      {showNewRequestModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 pb-24 sm:pb-4 md:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={() => setShowNewRequestModal(false)} />
          <div className="relative bg-white dark:bg-slate-950 rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[calc(100dvh-7.5rem)] sm:max-h-[85vh] transform animate-in slide-in-from-bottom-4 duration-300">
            <div className="shrink-0 px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">New E-Signature Envelope</h3>
                <p className="text-[10px] sm:text-xs text-slate-400 font-bold">Step {newRequestStep} of 2 — Configure document &amp; routing</p>
              </div>
              <button onClick={() => setShowNewRequestModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              {newRequestStep === 1 ? (
                /* Step 1: Document info */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Document Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Master Services Agreement.pdf"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Agreement Type</label>
                    <select
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-orange-500 cursor-pointer transition-all"
                    >
                      <option value="Commercial Agreement">Commercial Agreement</option>
                      <option value="Mutual NDA">Mutual NDA</option>
                      <option value="Employment Contract">Employment Contract</option>
                      <option value="Service Proposal">Service Proposal</option>
                      <option value="Corporate Governance">Corporate Governance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Signer Routing Order</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setNewRouting('parallel')}
                        className={`p-3.5 rounded-2xl border text-left text-xs font-semibold cursor-pointer transition-all ${
                          newRouting === 'parallel' ? 'bg-orange-50/80 dark:bg-orange-950/60 border-orange-500 text-orange-700 dark:text-orange-300 shadow-2xs' : 'bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <p className="font-extrabold">Parallel Signing</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">All recipients sign simultaneously</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNewRouting('sequential')}
                        className={`p-3.5 rounded-2xl border text-left text-xs font-semibold cursor-pointer transition-all ${
                          newRouting === 'sequential' ? 'bg-orange-50/80 dark:bg-orange-950/60 border-orange-500 text-orange-700 dark:text-orange-300 shadow-2xs' : 'bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <p className="font-extrabold">Sequential Order</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Signs in numbered 1-by-1 order</p>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Step 2: Recipients */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Recipients &amp; Roles</label>
                    <button
                      type="button"
                      onClick={() => setNewRecipients([...newRecipients, { name: '', email: '', role: 'signer' }])}
                      className="text-xs font-extrabold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Recipient
                    </button>
                  </div>

                  {newRecipients.map((rec, index) => (
                    <div key={index} className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between text-xs font-extrabold text-slate-500">
                        <span>Recipient #{index + 1}</span>
                        {newRecipients.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setNewRecipients(newRecipients.filter((_, i) => i !== index))}
                            className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          placeholder="Full Name *"
                          value={rec.name}
                          onChange={(e) => {
                            const updated = [...newRecipients];
                            updated[index].name = e.target.value;
                            setNewRecipients(updated);
                          }}
                          className="px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-orange-500 transition-all text-slate-900 dark:text-white"
                        />
                        <input
                          type="email"
                          placeholder="Email Address *"
                          value={rec.email}
                          onChange={(e) => {
                            const updated = [...newRecipients];
                            updated[index].email = e.target.value;
                            setNewRecipients(updated);
                          }}
                          className="px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-orange-500 transition-all text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 border-t-2 border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3 shadow-xl z-20">
              {newRequestStep === 2 ? (
                <button
                  type="button"
                  onClick={() => setNewRequestStep(1)}
                  className="flex-1 sm:flex-initial sm:min-w-[90px] py-2.5 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl text-xs font-black transition-colors cursor-pointer text-center"
                >
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNewRequestModal(false)}
                  className="flex-1 sm:flex-initial sm:min-w-[90px] py-2.5 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl text-xs font-black transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
              )}

              {newRequestStep === 1 ? (
                <button
                  type="button"
                  onClick={() => setNewRequestStep(2)}
                  className="flex-2 sm:flex-initial sm:min-w-[160px] py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-orange-500/30 transition-all active:scale-95 cursor-pointer text-center"
                >
                  Next: Add Recipients
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreateEnvelope}
                  className="flex-2 sm:flex-initial sm:min-w-[160px] py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-orange-500/30 transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center gap-1.5 text-center"
                >
                  <Send className="w-3.5 h-3.5" /> Dispatch Envelope
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          AUDIT TRAIL CERTIFICATE MODAL
      ══════════════════════════════════════════════════════════════ */}
      {showAuditModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 pb-24 sm:pb-4 md:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={() => setShowAuditModal(null)} />
          <div className="relative bg-white dark:bg-slate-950 rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[calc(100dvh-7.5rem)] sm:max-h-[85vh]">
            <div className="shrink-0 px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Certificate of Completion &amp; Audit Trail</h3>
                  <p className="text-xs text-slate-500 font-mono">{showAuditModal.id}</p>
                </div>
              </div>
              <button onClick={() => setShowAuditModal(null)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-5 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              {/* Checksum details */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  <span>Cryptographic Document Hash (SHA-256)</span>
                  <span className="text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Verified Intact</span>
                </div>
                <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400 break-all bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 font-bold">
                  {showAuditModal.envelopeHash}
                </p>
              </div>

              {/* Timeline events */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Signing History Timeline</h4>
                
                <div className="space-y-3 border-l-2 border-orange-500/40 pl-4">
                  {showAuditModal.recipients.map((rec, i) => (
                    <div key={i} className="relative space-y-1">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-950" />
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">{rec.name} ({rec.role})</p>
                      <p className="text-[11px] text-slate-500">Email: {rec.email}</p>
                      {rec.signedDate && (
                        <p className="text-[10px] text-slate-400 font-mono">Timestamp: {rec.signedDate} • IP: {rec.ipAddress || '194.223.14.88'}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="shrink-0 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  showNotify('Certificate downloaded as official PDF artifact', 'success');
                  setShowAuditModal(null);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-black shadow-md transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Legal Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INSPECT DOCUMENT MODAL ── */}
      {selectedDocument && !showAuditModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 pb-24 sm:pb-4 md:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={() => setSelectedDocument(null)} />
          <div className="relative bg-white dark:bg-slate-950 rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[calc(100dvh-7.5rem)] sm:max-h-[85vh]">
            <div className="shrink-0 px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-6 h-6 text-orange-500 shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base truncate">{selectedDocument.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedDocument.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDocument(null)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedDocument.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Routing</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 capitalize">{selectedDocument.routingOrder}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Sender</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate block">{selectedDocument.sender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date Dispatched</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedDocument.createdDate}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Recipient Status</h4>
                <div className="space-y-2">
                  {selectedDocument.recipients.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs">
                      <div>
                        <p className="font-extrabold text-slate-900 dark:text-white">{r.name}</p>
                        <p className="text-[10px] text-slate-400">{r.email}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        r.status === 'signed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}>
                        {r.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="shrink-0 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowAuditModal(selectedDocument);
                  setSelectedDocument(null);
                }}
                className="text-xs font-extrabold text-orange-600 hover:text-orange-700 cursor-pointer"
              >
                View Audit Certificate
              </button>
              <button
                type="button"
                onClick={() => setSelectedDocument(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-extrabold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {deletingDocument && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeletingDocument(null); }}
          onConfirm={() => {
            setDocuments(documents.filter(d => d.id !== deletingDocument.id));
            showNotify('Document envelope deleted');
          }}
          title="Delete Envelope"
          itemName={deletingDocument.name}
          itemDetails={`${deletingDocument.type} · ${deletingDocument.id}`}
          warningMessage="This envelope and associated signature history will be deleted."
        />
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800 text-xs font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}
