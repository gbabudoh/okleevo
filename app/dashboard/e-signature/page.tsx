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
    <div className="max-w-7xl mx-auto space-y-6 pb-24 md:pb-12 font-sans text-slate-900">

      {/* ── STICKY MODULE HEADER ─────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-2xs">
        <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <FileSignature className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 leading-tight truncate">
                  E-Signature Studio
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                  eIDAS / ESIGN
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                Legally binding electronic signatures &amp; document workflows
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
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
            <button
              onClick={() => setShowSignSelfModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer shrink-0"
            >
              <PenTool className="w-4 h-4 text-slate-600 cursor-pointer" />
              <span>Sign Yourself</span>
            </button>
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 cursor-pointer" />
              <span>Request Signatures</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 space-y-6">

        {/* ── KPI METRICS SUMMARY GRID ───────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { id: 'all',       label: 'Total Managed',  badge: 'All Envelopes', value: stats.total,    icon: Layers,        iconCls: 'bg-blue-50 text-blue-600 border-blue-100' },
            { id: 'signed',    label: 'Legally Sealed', badge: 'Fully Executed',value: stats.signed,   icon: ShieldCheck,   iconCls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            { id: 'pending',   label: 'Out for Sign',  badge: 'Awaiting Sign',  value: stats.pending,  icon: Clock,         iconCls: 'bg-amber-50 text-amber-600 border-amber-100' },
            { id: 'draft',     label: 'In Preparation', badge: 'Drafts & Templates',value: stats.draft,    icon: FileText,      iconCls: 'bg-purple-50 text-purple-600 border-purple-100' },
          ].map((item) => {
            const isSelected = selectedStatus === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedStatus(isSelected ? 'all' : item.id)}
                className={`bg-white rounded-2xl p-4 sm:p-4.5 border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 group ${
                  isSelected ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-md' : 'border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className={`p-2 rounded-xl border ${item.iconCls} transition-transform group-hover:scale-105 shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 truncate max-w-[100px]">
                    {item.badge}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">{item.label}</p>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5 truncate">{item.value}</h3>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── DRAG & DROP QUICK START BANNER ───────────────────────────── */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Instant Workflow</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Upload &amp; Dispatch Documents in Seconds
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Drag any PDF, Word document, or image into Okleevo to automatically attach legal signature fields, assign signers, and generate cryptographic audit trails.
              </p>
            </div>

            {/* Quick Templates Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto">
              <label className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer active:scale-95">
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
                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-all cursor-pointer active:scale-95"
              >
                <FileCode className="w-4 h-4 text-blue-300" />
                <span>NDA Template</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── CONTROLS & FILTER BAR ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search envelopes by name, type, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Status Pills */}
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                    active ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── DOCUMENT MASTER TABLE / GRID ───────────────────────────────── */}
        {filteredDocuments.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <FileSignature className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-bold text-slate-900">No Document Envelopes Found</h3>
              <p className="text-xs text-slate-500">
                {searchQuery ? 'No signature requests matched your search filters.' : 'Get started by creating your first legally-binding e-signature request.'}
              </p>
            </div>
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Signature Request</span>
            </button>
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Envelope &amp; Document</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Signer Status</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredDocuments.map((doc) => {
                    const statusCfg = STATUS_CONFIGS[doc.status];
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="px-5 py-4 min-w-[240px]">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 font-bold">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{doc.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{doc.id} • {doc.pages} pages</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                            {doc.type}
                          </span>
                        </td>

                        <td className="px-4 py-4 min-w-[200px]">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              {doc.recipients.map((r, i) => (
                                <div
                                  key={i}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white relative ${
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
                            <p className="text-[10px] text-slate-400 font-medium">
                              {doc.recipients.filter(r => r.status === 'signed').length} of {doc.recipients.length} signed
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusCfg.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                            {statusCfg.label}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedDocument(doc)}
                              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                              title="Inspect Envelope"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setShowAuditModal(doc)}
                              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
                              title="Legal Audit Certificate"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingDocument(doc);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                              title="Delete Envelope"
                            >
                              <Trash2 className="w-4 h-4" />
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
                <div key={doc.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusCfg.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">{doc.name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-1">{doc.id} • {doc.type}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Signers</span>
                      <span className="font-semibold text-slate-700">{doc.recipients.filter(r => r.status === 'signed').length} / {doc.recipients.length}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedDocument(doc)}
                        className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => setShowAuditModal(doc)}
                        className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
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

        {/* ── LEGAL & TRUST FOOTER BAR ──────────────────────────────────── */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs border border-slate-800">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-white">eIDAS &amp; ESIGN Act Legal Compliance Guarantee</p>
              <p className="text-slate-400 text-[11px]">All envelopes contain cryptographic SHA-256 integrity hashes &amp; UTC timestamped Audit Certificates.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono text-[10px]">AES-256 Encrypted</span>
            <span className="px-3 py-1 rounded-lg bg-emerald-950/80 text-emerald-400 font-mono text-[10px]">Audit Sealed</span>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════
          SIGN YOURSELF MODAL
      ══════════════════════════════════════════════════════════════ */}
      {showSignSelfModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <PenTool className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Adopt Official Digital Signature</h3>
              </div>
              <button onClick={() => setShowSignSelfModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
                {(['draw', 'type', 'upload'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSignatureType(t)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      signatureType === t ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Signature Canvas / Type / Upload */}
              <div className="border-2 border-dashed border-slate-200 rounded-2xl h-44 flex items-center justify-center bg-slate-50/50 relative overflow-hidden">
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
                      className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                    />
                    {!isDrawing && !lastPoint && (
                      <span className="text-xs text-slate-400 font-medium pointer-events-none">Draw your signature here</span>
                    )}
                    <button
                      onClick={clearCanvas}
                      className="absolute top-2 right-2 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Clear
                    </button>
                  </>
                )}

                {signatureType === 'type' && (
                  <div className="w-full px-6 text-center">
                    <input
                      type="text"
                      placeholder="Type your full legal name"
                      value={typedSignature}
                      onChange={(e) => setTypedSignature(e.target.value)}
                      className="w-full text-center text-3xl text-slate-900 bg-transparent outline-none font-serif italic"
                    />
                  </div>
                )}

                {signatureType === 'upload' && (
                  <div className="text-center space-y-2">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">Upload transparent PNG signature image</p>
                  </div>
                )}
              </div>

              {/* Consent check */}
              <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={eSignConsent}
                  onChange={(e) => setESignConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  I agree that this electronic signature is intended to be my binding legal signature under eIDAS (EU/UK No 910/2014) and US ESIGN Act.
                </span>
              </label>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowSignSelfModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                disabled={!eSignConsent}
                onClick={() => {
                  setShowSignSelfModal(false);
                  showNotify('Official signature adopted and saved to profile', 'success');
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50 transition-colors shadow-md shadow-blue-600/20"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">New E-Signature Envelope</h3>
                <p className="text-xs text-slate-400">Step {newRequestStep} of 2 — Configure document &amp; recipient routing</p>
              </div>
              <button onClick={() => setShowNewRequestModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {newRequestStep === 1 ? (
                /* Step 1: Document info */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Document Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Master Services Agreement - Acme Ltd.pdf"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Agreement Type</label>
                    <select
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    >
                      <option value="Commercial Agreement">Commercial Agreement</option>
                      <option value="Mutual NDA">Mutual NDA</option>
                      <option value="Employment Contract">Employment Contract</option>
                      <option value="Service Proposal">Service Proposal</option>
                      <option value="Corporate Governance">Corporate Governance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Signer Routing Order</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setNewRouting('parallel')}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold cursor-pointer transition-all ${
                          newRouting === 'parallel' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <p className="font-bold">Parallel Signing</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">All recipients sign simultaneously</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNewRouting('sequential')}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold cursor-pointer transition-all ${
                          newRouting === 'sequential' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <p className="font-bold">Sequential Order</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Signs in numbered 1-by-1 order</p>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Step 2: Recipients */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Recipients &amp; Roles</label>
                    <button
                      type="button"
                      onClick={() => setNewRecipients([...newRecipients, { name: '', email: '', role: 'signer' }])}
                      className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Recipient
                    </button>
                  </div>

                  {newRecipients.map((rec, index) => (
                    <div key={index} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>Recipient #{index + 1}</span>
                        {newRecipients.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setNewRecipients(newRecipients.filter((_, i) => i !== index))}
                            className="text-rose-500 hover:text-rose-700 text-xs"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Full Name *"
                          value={rec.name}
                          onChange={(e) => {
                            const updated = [...newRecipients];
                            updated[index].name = e.target.value;
                            setNewRecipients(updated);
                          }}
                          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
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
                          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
              {newRequestStep === 2 ? (
                <button
                  type="button"
                  onClick={() => setNewRequestStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
                >
                  Back
                </button>
              ) : <div />}

              {newRequestStep === 1 ? (
                <button
                  type="button"
                  onClick={() => setNewRequestStep(2)}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
                >
                  Next: Add Recipients
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreateEnvelope}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-base">Certificate of Completion &amp; Audit Trail</h3>
                  <p className="text-xs text-slate-400 font-mono">{showAuditModal.id}</p>
                </div>
              </div>
              <button onClick={() => setShowAuditModal(null)} className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Checksum details */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Cryptographic Document Hash (SHA-256)</span>
                  <span className="text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Verified Intact</span>
                </div>
                <p className="font-mono text-[11px] text-slate-600 break-all bg-white p-2 rounded-lg border border-slate-200">
                  {showAuditModal.envelopeHash}
                </p>
              </div>

              {/* Timeline events */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Signing History Timeline</h4>
                
                <div className="space-y-3 border-l-2 border-slate-200 pl-4">
                  {showAuditModal.recipients.map((rec, i) => (
                    <div key={i} className="relative space-y-1">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                      <p className="text-xs font-bold text-slate-900">{rec.name} ({rec.role})</p>
                      <p className="text-[11px] text-slate-500">Email: {rec.email}</p>
                      {rec.signedDate && (
                        <p className="text-[10px] text-slate-400 font-mono">Timestamp: {rec.signedDate} • IP: {rec.ipAddress || '194.223.14.88'}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  showNotify('Certificate downloaded as official PDF artifact', 'success');
                  setShowAuditModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Legal Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INSPECT DOCUMENT MODAL ── */}
      {selectedDocument && !showAuditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedDocument.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedDocument.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDocument(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                  <span className="font-semibold text-slate-800">{selectedDocument.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Routing</span>
                  <span className="font-semibold text-slate-800 capitalize">{selectedDocument.routingOrder}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Sender</span>
                  <span className="font-semibold text-slate-800 truncate block">{selectedDocument.sender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date Dispatched</span>
                  <span className="font-semibold text-slate-800">{selectedDocument.createdDate}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Recipient Status</h4>
                <div className="space-y-2">
                  {selectedDocument.recipients.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{r.name}</p>
                        <p className="text-[10px] text-slate-400">{r.email}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        r.status === 'signed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {r.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowAuditModal(selectedDocument);
                  setSelectedDocument(null);
                }}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                View Audit Certificate
              </button>
              <button
                onClick={() => setSelectedDocument(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold"
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
