"use client";

import { useState, useRef, useEffect } from 'react';
import {
  PenTool, Search, Download, Upload,
  FileText, CheckCircle, Clock, XCircle, AlertCircle,
  Eye, Trash2, Share2, Check, X,
  FileCheck, Grid, List, Shield, Lock,
  Plus, Filter, MoreVertical
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'signed' | 'pending' | 'declined' | 'draft' | 'expired';
  createdDate: Date;
  signedDate?: Date;
  expiryDate?: Date;
  sender: string;
  recipients: Array<{
    name: string;
    email: string;
    status: 'signed' | 'pending' | 'declined';
    signedDate?: Date;
  }>;
  description?: string;
  pages: number;
}

const STATUS_CONFIGS = {
  signed:   { label: 'Signed',   bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: CheckCircle },
  pending:  { label: 'Pending',  bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500',   icon: Clock },
  declined: { label: 'Declined', bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500',     icon: XCircle },
  draft:    { label: 'Draft',    bg: 'bg-gray-50',    text: 'text-gray-600',    dot: 'bg-gray-400',    icon: FileText },
  expired:  { label: 'Expired',  bg: 'bg-purple-50',  text: 'text-purple-700',  dot: 'bg-purple-500',  icon: AlertCircle },
};

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'signed', label: 'Signed' },
  { id: 'pending', label: 'Pending' },
  { id: 'draft', label: 'Draft' },
  { id: 'declined', label: 'Declined' },
  { id: 'expired', label: 'Expired' },
];

export default function ESignaturePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showSignModal, setShowSignModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [signatureType, setSignatureType] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  const showNotify = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total:   documents.length,
    signed:  documents.filter(d => d.status === 'signed').length,
    pending: documents.filter(d => d.status === 'pending').length,
    draft:   documents.filter(d => d.status === 'draft').length,
  };

  const statusCounts: Record<string, number> = {
    all:      documents.length,
    signed:   stats.signed,
    pending:  stats.pending,
    draft:    stats.draft,
    declined: documents.filter(d => d.status === 'declined').length,
    expired:  documents.filter(d => d.status === 'expired').length,
  };

  useEffect(() => {
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
  }, [showSignModal]);

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
    ctx.lineWidth = Math.max(1.5, Math.min(4, 2.5 - speed / 20));
    ctx.strokeStyle = '#4F46E5';
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

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-24 md:pb-10">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-600 via-indigo-700 to-violet-800 p-6 sm:p-8 text-white shadow-xl shadow-indigo-200/40">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 left-12 w-40 h-40 bg-violet-400/20 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-white/15 rounded-lg"><PenTool className="w-4 h-4 text-white" /></div>
              <span className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Digital Signatures</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-1">E-Signature</h1>
            <p className="text-indigo-300 text-sm font-medium">Secure document signing & management</p>
          </div>
          <div className="flex flex-col gap-2.5 sm:items-end">
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <label className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer" title="Upload Document">
                <Upload className="w-4 h-4 text-white" />
                <input type="file" accept=".pdf,.doc,.docx,image/*" className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 10 * 1024 * 1024) { showNotify('File must be under 10MB', 'error'); return; }
                      showNotify(`${file.name} uploaded`, 'success');
                      e.target.value = '';
                    }
                  }} />
              </label>
              <button onClick={() => showNotify('Verifying signatures…', 'info')} className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer" title="Verify">
                <FileCheck className="w-4 h-4 text-white" />
              </button>
            </div>
            <button onClick={() => setShowSignModal(true)}
              className="flex items-center justify-center gap-2 bg-white text-indigo-700 font-black text-sm rounded-xl px-5 py-2.5 shadow-lg hover:bg-indigo-50 active:scale-95 transition-all w-full sm:w-auto cursor-pointer">
              <Plus className="w-4 h-4" />New Signature Request
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Docs',  value: stats.total,   sub: 'managed',          icon: FileText,     color: 'text-indigo-600',  bg: 'bg-indigo-50' },
          { label: 'Signed',      value: stats.signed,  sub: 'executed',         icon: CheckCircle,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending',     value: stats.pending, sub: 'awaiting sign',    icon: Clock,        color: 'text-amber-600',   bg: 'bg-amber-50' },
          { label: 'Drafts',      value: stats.draft,   sub: 'in preparation',   icon: FileText,     color: 'text-purple-600',  bg: 'bg-purple-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider truncate">{s.label}</p>
              <p className="text-lg font-black text-gray-900 leading-tight">{s.value}</p>
              <p className="text-[9px] font-bold text-gray-400 truncate">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search + Filter + View ── */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by document name or type…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
        </div>
        <button className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-black text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-all cursor-pointer">
          <Filter className="w-4 h-4" /><span className="hidden sm:inline">Filter</span>
        </button>
        <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-0.5">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}><Grid className="w-4 h-4" /></button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}><List className="w-4 h-4" /></button>
        </div>
      </div>

      {/* ── Status Pills ── */}
      <div className="-mx-4 sm:mx-0 flex items-center gap-2 overflow-x-auto px-4 sm:px-0 pb-1 hide-scrollbar">
        {STATUS_FILTERS.map(f => {
          const isActive = selectedStatus === f.id;
          return (
            <button key={f.id} onClick={() => setSelectedStatus(f.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wide whitespace-nowrap shrink-0 transition-all cursor-pointer border ${isActive ? 'bg-gray-900 border-gray-900 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600'}`}>
              {f.label}
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>{statusCounts[f.id]}</span>
            </button>
          );
        })}
      </div>

      {/* ── Grid View ── */}
      {viewMode === 'grid' ? (
        filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-gray-100">
            <FileText className="w-10 h-10 text-gray-200" />
            <p className="text-sm font-bold text-gray-400">No documents yet</p>
            <button onClick={() => setShowSignModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-indigo-700 transition-all cursor-pointer">
              <Plus className="w-3.5 h-3.5" />New Request
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredDocuments.map(doc => {
              const sc = STATUS_CONFIGS[doc.status];
              return (
                <div key={doc.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-gray-100 transition-all group">
                  {/* Card top */}
                  <div className="p-4 pb-3">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      {/* File icon */}
                      <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shrink-0">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      {/* Status badge + menu */}
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                        </span>
                        <div className="relative">
                          <button onClick={e => { e.stopPropagation(); setActiveMenu(activeMenu === doc.id ? null : doc.id); }}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-all cursor-pointer">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                          {activeMenu === doc.id && (
                            <>
                              <div className="fixed inset-0 z-60" onClick={() => setActiveMenu(null)} />
                              <div className="absolute right-0 top-8 z-70 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1">
                                <button onClick={e => { e.stopPropagation(); setSelectedDocument(doc); setActiveMenu(null); }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">
                                  <Eye className="w-3.5 h-3.5 text-gray-400" />View Document
                                </button>
                                <button onClick={e => { e.stopPropagation(); showNotify('Download started…'); setActiveMenu(null); }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">
                                  <Download className="w-3.5 h-3.5 text-gray-400" />Download
                                </button>
                                <div className="my-1 border-t border-gray-100" />
                                <button onClick={e => { e.stopPropagation(); setDeletingDocument(doc); setShowDeleteModal(true); setActiveMenu(null); }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 cursor-pointer">
                                  <Trash2 className="w-3.5 h-3.5" />Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <h3 className="text-sm font-black text-gray-900 leading-tight group-hover:text-indigo-700 transition-colors line-clamp-2 mb-1">{doc.name}</h3>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{doc.type} • {doc.pages} pages</p>
                  </div>

                  {/* Signatories */}
                  <div className="px-4 pb-3">
                    <div className="flex items-center justify-between text-[9px] font-black text-gray-400 uppercase tracking-wider mb-2">
                      <span>Signatories</span><span className="text-indigo-600">{doc.recipients.length} required</span>
                    </div>
                    <div className="flex -space-x-2">
                      {doc.recipients.slice(0, 5).map((r, i) => (
                        <div key={i} className="relative w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-600" title={r.name}>
                          {r.name.charAt(0)}
                          {r.status === 'signed' && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border border-white rounded-full flex items-center justify-center">
                              <Check className="w-2 h-2 text-white" />
                            </span>
                          )}
                        </div>
                      ))}
                      {doc.recipients.length > 5 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-900 flex items-center justify-center text-[9px] font-black text-white">
                          +{doc.recipients.length - 5}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={`grid gap-2 px-4 pb-4 ${doc.status === 'pending' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <button onClick={() => setSelectedDocument(doc)}
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-all active:scale-95 cursor-pointer text-[9px] font-black uppercase tracking-wide">
                      <Eye className="w-3.5 h-3.5" />Inspect
                    </button>
                    {doc.status === 'pending' && (
                      <button onClick={() => { setSelectedDocument(doc); setShowSignModal(true); }}
                        className="flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all active:scale-95 cursor-pointer text-[9px] font-black uppercase tracking-wide shadow-lg shadow-indigo-200">
                        <PenTool className="w-3.5 h-3.5" />Sign Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* ── List View ── */
        filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-gray-100">
            <FileText className="w-10 h-10 text-gray-200" />
            <p className="text-sm font-bold text-gray-400">No documents yet</p>
            <button onClick={() => setShowSignModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-indigo-700 transition-all cursor-pointer">
              <Plus className="w-3.5 h-3.5" />New Request
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto hide-scrollbar">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="bg-gray-900">
                    {['Document', 'Type', 'Signatories', 'Status', 'Actions'].map((h, i) => (
                      <th key={h} className={`px-5 py-3.5 text-[9px] font-black text-gray-400 uppercase tracking-widest ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredDocuments.map(doc => {
                    const sc = STATUS_CONFIGS[doc.status];
                    return (
                      <tr key={doc.id} className="hover:bg-indigo-50/30 transition-colors cursor-pointer" onClick={() => setSelectedDocument(doc)}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900 leading-tight">{doc.name}</p>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">{doc.createdDate.toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-gray-900">{doc.type}</p>
                          <p className="text-[10px] text-gray-400">{doc.pages} pages</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex -space-x-2">
                            {doc.recipients.slice(0, 4).map((r, i) => (
                              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-600" title={r.name}>
                                {r.name.charAt(0)}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${sc.bg} ${sc.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={e => { e.stopPropagation(); setSelectedDocument(doc); }}
                              className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={e => { e.stopPropagation(); setDeletingDocument(doc); setShowDeleteModal(true); }}
                              className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
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
        )
      )}

      {/* ── Sign Modal ── */}
      {showSignModal && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 sm:pl-0 md:pl-64">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowSignModal(false)} />
          <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0"><div className="w-10 h-1 bg-gray-200 rounded-full" /></div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2"><PenTool className="w-5 h-5 text-indigo-500" />Digital Signature</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Adopt your official mark</p>
              </div>
              <button onClick={() => setShowSignModal(false)} className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 pt-16 pb-3 sm:py-4 space-y-3 sm:space-y-4">
              {/* Mode tabs */}
              <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl w-fit">
                {(['draw', 'type', 'upload'] as const).map(t => (
                  <button key={t} onClick={() => setSignatureType(t)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${signatureType === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Signature pad */}
              <div className="relative bg-white border-2 border-dashed border-gray-200 rounded-2xl h-40 sm:h-56 overflow-hidden flex items-center justify-center">
                {signatureType === 'draw' && (
                  <>
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                      className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                    />
                    {!isDrawing && !lastPoint && (
                      <div className="pointer-events-none flex flex-col items-center gap-2 text-gray-300">
                        <PenTool className="w-8 h-8 opacity-40" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Sign here</span>
                      </div>
                    )}
                    <button onClick={clearCanvas} className="absolute top-3 right-3 px-3 py-1.5 bg-white/90 hover:bg-gray-50 border border-gray-200 rounded-lg text-[9px] font-black text-gray-500 uppercase tracking-wider cursor-pointer z-10 shadow-sm active:scale-95">
                      Clear
                    </button>
                  </>
                )}
                {signatureType === 'type' && (
                  <div className="w-full h-full p-4 flex items-center justify-center">
                    <input type="text" value={typedSignature} onChange={e => setTypedSignature(e.target.value)}
                      placeholder="Type your full name"
                      className="w-full text-center text-3xl sm:text-4xl text-indigo-900 bg-transparent outline-none placeholder:text-gray-300 transition-all"
                      style={{ fontFamily: '"Dancing Script", cursive' }} />
                  </div>
                )}
                {signatureType === 'upload' && (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-indigo-500 transition-colors cursor-pointer"
                    onClick={() => showNotify('Opening file picker…', 'info')}>
                    <Upload className="w-8 h-8 mb-2 opacity-40" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Drop signature image here</span>
                    <p className="text-[9px] text-gray-300 mt-1.5">PNG, JPG or SVG · Max 5MB</p>
                  </div>
                )}
              </div>

              {/* Security notice */}
              <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 rounded-xl p-3.5">
                <Lock className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                <p className="text-[10px] font-bold text-indigo-700 leading-relaxed">
                  This signature will be encrypted and timestamped. By clicking <span className="font-black">&quot;Adopt &amp; Sign&quot;</span> you agree to the electronic records policy.
                </p>
              </div>

              {/* Mobile buttons inside scroll — extended scroll space */}
              <div className="flex items-center gap-3 pt-1 pb-32 sm:hidden">
                <button onClick={() => setShowSignModal(false)} className="flex-1 py-3 border border-gray-200 text-sm font-black text-gray-600 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">Cancel</button>
                <button onClick={() => { showNotify('Signature adopted successfully'); setShowSignModal(false); }}
                  className="flex-[2] flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white text-sm font-black rounded-xl hover:bg-indigo-700 transition-all cursor-pointer shadow-lg shadow-indigo-200">
                  <PenTool className="w-4 h-4" />Adopt & Sign
                </button>
              </div>
            </div>

            {/* Desktop sticky footer */}
            <div className="hidden sm:flex px-6 py-4 border-t border-gray-100 items-center justify-end gap-3 shrink-0">
              <button onClick={() => setShowSignModal(false)} className="px-5 py-2.5 border border-gray-200 text-sm font-black text-gray-600 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">Cancel</button>
              <button onClick={() => { showNotify('Signature adopted successfully'); setShowSignModal(false); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-black rounded-xl hover:bg-indigo-700 transition-all cursor-pointer shadow-lg shadow-indigo-200">
                <PenTool className="w-4 h-4" />Adopt & Sign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Document Modal ── */}
      {selectedDocument && !showSignModal && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 sm:pl-0 md:pl-64">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSelectedDocument(null)} />
          <div className="relative w-full sm:max-w-2xl bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0"><div className="w-10 h-1 bg-gray-200 rounded-full" /></div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900 leading-tight">{selectedDocument.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${STATUS_CONFIGS[selectedDocument.status].bg} ${STATUS_CONFIGS[selectedDocument.status].text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIGS[selectedDocument.status].dot}`} />
                      {STATUS_CONFIGS[selectedDocument.status].label}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{selectedDocument.type}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedDocument(null)} className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            {/* Document viewer */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Color accent bar */}
                <div className="h-1.5 bg-linear-to-r from-indigo-500 via-violet-500 to-pink-500" />
                <div className="p-6 sm:p-10 min-h-80">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-28 h-7 bg-gray-100 rounded-lg" />
                    <div className="text-right space-y-1.5">
                      <div className="w-20 h-3.5 bg-gray-100 rounded ml-auto" />
                      <div className="w-28 h-3.5 bg-gray-100 rounded ml-auto" />
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div className="w-2/3 h-6 bg-gray-100 rounded-lg" />
                    <div className="space-y-2.5">
                      {[...Array(6)].map((_, i) => <div key={i} className={`h-3 bg-gray-100 rounded ${i % 3 === 2 ? 'w-4/5' : 'w-full'}`} />)}
                    </div>
                  </div>

                  {selectedDocument.status === 'signed' && (
                    <div className="mt-10 flex justify-end">
                      <div className="rotate-[-8deg] border-4 border-indigo-600 rounded-xl p-3 opacity-75">
                        <p className="text-indigo-600 font-black text-xl uppercase tracking-widest">SIGNED</p>
                        <p className="text-indigo-500 text-[9px] font-bold uppercase mt-0.5">{selectedDocument.signedDate?.toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex -space-x-2">
                {selectedDocument.recipients.map((r, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-600" title={r.name}>
                    {r.name.charAt(0)}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => showNotify('PDF export started…', 'info')}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-gray-50 transition-all cursor-pointer">
                  <Download className="w-3.5 h-3.5" /><span className="hidden sm:inline">Export</span>
                </button>
                <button onClick={() => showNotify('Share link copied', 'success')}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all cursor-pointer shadow-lg shadow-indigo-200">
                  <Share2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Share</span>
                </button>
                <button onClick={() => { setDeletingDocument(selectedDocument); setSelectedDocument(null); setShowDeleteModal(true); }}
                  className="p-2.5 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-100 transition-all cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Security Feature Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
        <div className="relative overflow-hidden bg-indigo-600 rounded-2xl p-5 text-white group cursor-pointer">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
          <Shield className="w-7 h-7 mb-3 text-indigo-300" />
          <h4 className="font-black mb-1 text-base">Legally Binding</h4>
          <p className="text-indigo-200 text-xs leading-relaxed">eIDAS & ESIGN Act compliant digital signatures.</p>
        </div>
        <div className="relative overflow-hidden bg-gray-900 rounded-2xl p-5 text-white group cursor-pointer">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
          <Lock className="w-7 h-7 mb-3 text-violet-400" />
          <h4 className="font-black mb-1 text-base">End-to-End Encrypted</h4>
          <p className="text-gray-400 text-xs leading-relaxed">All documents encrypted at rest and in transit.</p>
        </div>
        <div className="relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-5 group cursor-pointer">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
          <FileCheck className="w-7 h-7 mb-3 text-indigo-500" />
          <h4 className="font-black mb-1 text-base text-gray-900">Audit Trail</h4>
          <p className="text-gray-500 text-xs leading-relaxed">Full timestamped history of every signature event.</p>
        </div>
      </div>

      {/* ── Delete Modal ── */}
      {deletingDocument && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeletingDocument(null); }}
          onConfirm={() => { setDocuments(documents.filter(d => d.id !== deletingDocument.id)); showNotify('Document deleted'); }}
          title="Delete Document"
          itemName={deletingDocument.name}
          itemDetails={`${deletingDocument.type} · ${deletingDocument.status}`}
          warningMessage="This document will be permanently deleted and cannot be recovered."
        />
      )}

      {/* ── Toast ── */}
      {notification && (
        <div className="fixed bottom-24 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-80 z-200">
          <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-xl border ${
            notification.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' :
            notification.type === 'error'   ? 'bg-red-500 border-red-400 text-white' :
            notification.type === 'warning' ? 'bg-amber-500 border-amber-400 text-white' :
            'bg-gray-900 border-gray-800 text-white'
          }`}>
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
              {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
               notification.type === 'error'   ? <XCircle className="w-4 h-4" /> :
               <AlertCircle className="w-4 h-4" />}
            </div>
            <p className="text-xs font-black flex-1">{notification.message}</p>
            <button onClick={() => setNotification(null)} className="p-1 hover:bg-white/10 rounded-lg cursor-pointer"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
