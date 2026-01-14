"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  PenTool, Search, Download, Upload,
  FileText, CheckCircle, Clock, XCircle, AlertCircle,
  Eye, Edit3, Trash2,
  Share2, Check, X, Zap,
  FileCheck, Grid, List,
  Shield, Lock, Activity
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

const statusConfig = {
  signed: { color: 'green', icon: CheckCircle, label: 'Signed', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  pending: { color: 'orange', icon: Clock, label: 'Pending', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  declined: { color: 'red', icon: XCircle, label: 'Declined', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  draft: { color: 'gray', icon: FileText, label: 'Draft', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  expired: { color: 'purple', icon: AlertCircle, label: 'Expired', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

export default function ESignaturePage() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Service Agreement Contract',
      type: 'Contract',
      status: 'signed',
      createdDate: new Date('2024-12-01'),
      signedDate: new Date('2024-12-02'),
      sender: 'John Doe',
      recipients: [
        { name: 'Alice Johnson', email: 'alice@company.com', status: 'signed', signedDate: new Date('2024-12-02') },
        { name: 'Bob Smith', email: 'bob@company.com', status: 'signed', signedDate: new Date('2024-12-02') }
      ],
      description: 'Annual service agreement for software development services',
      pages: 5
    },
    {
      id: '2',
      name: 'Non-Disclosure Agreement',
      type: 'NDA',
      status: 'pending',
      createdDate: new Date('2024-12-03'),
      expiryDate: new Date('2024-12-10'),
      sender: 'John Doe',
      recipients: [
        { name: 'Carol Martinez', email: 'carol@partner.com', status: 'pending' },
        { name: 'David Lee', email: 'david@partner.com', status: 'pending' }
      ],
      description: 'Confidentiality agreement for project collaboration',
      pages: 3
    },
    {
      id: '3',
      name: 'Employment Contract - Emma Wilson',
      type: 'Employment',
      status: 'signed',
      createdDate: new Date('2024-11-28'),
      signedDate: new Date('2024-11-30'),
      sender: 'HR Department',
      recipients: [
        { name: 'Emma Wilson', email: 'emma@company.com', status: 'signed', signedDate: new Date('2024-11-30') }
      ],
      description: 'Full-time employment contract for Sales Representative position',
      pages: 8
    },
    {
      id: '4',
      name: 'Partnership Agreement Draft',
      type: 'Partnership',
      status: 'draft',
      createdDate: new Date('2024-12-04'),
      sender: 'John Doe',
      recipients: [],
      description: 'Strategic partnership agreement - pending final review',
      pages: 12
    },
    {
      id: '5',
      name: 'Vendor Agreement',
      type: 'Contract',
      status: 'declined',
      createdDate: new Date('2024-11-25'),
      sender: 'Procurement Team',
      recipients: [
        { name: 'Tech Supplies Inc.', email: 'contracts@techsupplies.com', status: 'declined' }
      ],
      description: 'Vendor services agreement - declined by vendor',
      pages: 6
    }
  ]);

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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(null);
  /* State variables for unused modals removed to clean up lint warnings */
  
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
    total: documents.length,
    signed: documents.filter(d => d.status === 'signed').length,
    pending: documents.filter(d => d.status === 'pending').length,
    draft: documents.filter(d => d.status === 'draft').length,
  };

  // Initialize canvas with better settings
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Better rendering settings
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
  }, [showSignModal]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (activeDropdown) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  // Drawing functions
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const drawSmoothLine = (ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }) => {
    const midPoint = {
      x: (from.x + to.x) / 2,
      y: (from.y + to.y) / 2
    };
    
    ctx.quadraticCurveTo(from.x, from.y, midPoint.x, midPoint.y);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCoordinates(e);
    if (!coords) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
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
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const distance = Math.sqrt(
      Math.pow(coords.x - lastPoint.x, 2) + Math.pow(coords.y - lastPoint.y, 2)
    );
    
    const baseWidth = 2.5;
    const maxWidth = 4;
    const minWidth = 1.5;
    const speed = Math.min(distance, 20);
    const lineWidth = Math.max(minWidth, Math.min(maxWidth, baseWidth - (speed / 20)));
    
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#4F46E5';
    
    drawSmoothLine(ctx, lastPoint, coords);
    ctx.stroke();
    
    setLastPoint(coords);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.closePath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] p-4 md:p-8 overflow-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px] animate-mesh" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[140px] animate-mesh-delayed" />
      </div>

      <div className="relative z-10 space-y-8 max-w-[1600px] mx-auto">
        {/* Header / Command Center */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border-2 border-white shadow-2xl flex flex-col items-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-6 relative z-10">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Trust Protocol</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight mb-4 relative z-10">
            Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">Signatures</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl mb-10 leading-relaxed uppercase text-[10px] tracking-[0.1em] relative z-10">
            Secure Document Verification & Authentication System
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <button
               onClick={() => document.getElementById('document-upload-top')?.click()}
               className="px-8 py-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-indigo-600 active:scale-95 transition-all duration-500 flex items-center gap-3 cursor-pointer shadow-xl shadow-gray-900/20"
            >
               <Upload className="w-4 h-4" />
               Upload Document
            </button>
            <input
               type="file"
               id="document-upload-top"
               accept=".pdf,.doc,.docx,image/*"
               className="hidden"
               onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                     if (file.size > 10 * 1024 * 1024) {
                        showNotify('File must be < 10MB', 'error');
                        return;
                     }
                     showNotify(`${file.name} Uploaded Successfully`, 'success');
                     e.target.value = '';
                  }
               }}
            />
            <button
               onClick={() => setShowSignModal(true)}
               className="px-8 py-4 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-indigo-600 active:scale-95 transition-all duration-500 flex items-center gap-3 cursor-pointer shadow-xl shadow-indigo-500/20"
            >
               <PenTool className="w-4 h-4" />
               New Request
            </button>
            <div className="h-10 w-px bg-gray-200 mx-2 hidden md:block" />
            <div className="flex items-center gap-2">
               <button 
                  onClick={() => showNotify('Verifying Digital Keys...', 'info')}
                  className="p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-indigo-500 hover:text-indigo-500 active:scale-95 transition-all cursor-pointer"
                  title="Verify Signatures"
               >
                  <FileCheck className="w-5 h-5" />
               </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
             { label: 'Total Documents', val: stats.total, sub: 'Managed Files', icon: FileText, color: 'blue' },
             { label: 'Executed', val: stats.signed, sub: 'Legally Binding', icon: CheckCircle, color: 'emerald' },
             { label: 'Pending Action', val: stats.pending, sub: 'Awaiting Signatures', icon: Clock, color: 'orange' },
             { label: 'Draft Mode', val: stats.draft, sub: 'In Preparation', icon: Edit3, color: 'purple' },
          ].map((stat, idx) => (
             <div key={idx} className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 border-2 border-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
                <div className="flex items-center justify-between mb-4">
                   <div className={`p-4 bg-${stat.color}-500 rounded-2xl shadow-lg shadow-${stat.color}-500/20`}>
                      <stat.icon className="w-6 h-6 text-white" />
                   </div>
                   <Activity className={`w-5 h-5 text-${stat.color}-500 opacity-50`} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.val}</p>
                <p className={`text-[9px] font-bold text-${stat.color}-600 mt-2 flex items-center gap-1`}>
                   <Zap className="w-3 h-3" />
                   {stat.sub}
                </p>
             </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-6">
           <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-indigo-500/5 rounded-3xl blur-xl group-focus-within:bg-indigo-500/10 transition-all opacity-0 group-focus-within:opacity-100" />
              <div className="relative flex items-center bg-white/60 backdrop-blur-xl border-2 border-white shadow-xl rounded-3xl p-2 pl-6 focus-within:border-indigo-500/50 transition-all">
                 <Search className="w-5 h-5 text-gray-400" />
                 <input
                    type="text"
                    placeholder="Search query: Document Name, Type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-3 bg-transparent text-sm font-bold text-gray-900 outline-none placeholder:text-gray-400"
                 />
                 <div className="hidden md:flex items-center gap-2 pr-4">
                    <span className="px-2 py-1 bg-gray-100 text-[10px] font-black text-gray-400 rounded-lg">CMD</span>
                    <span className="px-2 py-1 bg-gray-100 text-[10px] font-black text-gray-400 rounded-lg">K</span>
                 </div>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <select
                 value={selectedStatus}
                 onChange={(e) => setSelectedStatus(e.target.value)}
                 className="px-8 py-5 bg-white/60 backdrop-blur-xl border-2 border-white rounded-3xl shadow-xl outline-none text-[10px] font-black uppercase tracking-[0.2em] text-gray-700 cursor-pointer hover:border-indigo-500/50 transition-all appearance-none"
                 style={{ backgroundImage: 'none' }}
              >
                 <option value="all">All Documents</option>
                 <option value="signed">Signed</option>
                 <option value="pending">Pending</option>
                 <option value="draft">Drafts</option>
                 <option value="declined">Declined</option>
                 <option value="expired">Expired</option>
              </select>
              
              <div className="flex items-center gap-1 bg-white/60 backdrop-blur-xl border-2 border-white shadow-xl rounded-2xl p-1.5">
                 <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}>
                    <Grid className="w-5 h-5" />
                 </button>
                 <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all cursor-pointer ${viewMode === 'list' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}>
                    <List className="w-5 h-5" />
                 </button>
              </div>
           </div>
        </div>

        {/* Document Grid */}
        {viewMode === 'grid' ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDocuments.map((doc, idx) => {
                 const config = statusConfig[doc.status];
                 const StatusIcon = config.icon;
                 
                 return (
                    <div
                       key={doc.id}
                       onClick={() => setSelectedDocument(doc)}
                       className="group relative bg-white/60 backdrop-blur-xl rounded-[3rem] border-2 border-white p-8 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 cursor-pointer animate-in fade-in zoom-in-95 fill-mode-both"
                       style={{ animationDelay: `${idx * 100}ms` }}
                    >
                       {/* Status Seal */}
                       <div className={`absolute top-6 right-6 flex items-center gap-2 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${config.bg} ${config.text} border ${config.border} shadow-sm`}>
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                       </div>
                       
                       {/* Icon Preview */}
                       <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500 relative overflow-hidden">
                          <FileText className="w-8 h-8 text-white relative z-10" />
                          <div className="absolute inset-0 bg-white/10 blur-xl"></div>
                       </div>
                       
                       <h3 className="text-lg font-black text-gray-900 tracking-tight leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                          {doc.name}
                       </h3>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-6">
                          {doc.type} • {doc.pages} Pages
                       </p>
                       
                       {/* Signatories */}
                       <div className="flex items-center justify-between mb-2">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Signatories</p>
                          <span className="text-[9px] font-bold text-indigo-600">{doc.recipients.length} Required</span>
                       </div>
                       <div className="flex -space-x-3 mb-8">
                          {doc.recipients.slice(0, 4).map((r, i) => (
                             <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 relative tooltip-trigger" title={r.name}>
                                {r.name.charAt(0)}
                                {r.status === 'signed' && (
                                   <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border border-white rounded-full flex items-center justify-center">
                                      <Check className="w-2 h-2 text-white" />
                                   </div>
                                )}
                             </div>
                          ))}
                          {doc.recipients.length > 4 && (
                             <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-900 flex items-center justify-center text-[10px] font-bold text-white">
                                +{doc.recipients.length - 4}
                             </div>
                          )}
                       </div>
                       
                       {/* Actions */}
                       <div className="flex items-center gap-2">
                          <button 
                             onClick={(e) => { e.stopPropagation(); setSelectedDocument(doc); }}
                             className="flex-1 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
                          >
                             Inspect
                          </button>
                          {doc.status === 'pending' && (
                             <button 
                                onClick={(e) => { e.stopPropagation(); setShowSignModal(true); }}
                                className="flex-1 py-3 bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all cursor-pointer shadow-lg shadow-indigo-500/20"
                             >
                                Sign Now
                             </button>
                          )}
                       </div>
                    </div>
                 );
              })}
           </div>
        ) : (
           <div className="bg-white/60 backdrop-blur-xl rounded-[3rem] border-2 border-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
              <table className="w-full">
                 <thead className="bg-gray-900">
                    <tr>
                       <th className="px-8 py-6 text-left text-[10px] font-black text-white uppercase tracking-[0.2em]">Document</th>
                       <th className="px-8 py-6 text-left text-[10px] font-black text-white uppercase tracking-[0.2em]">Type</th>
                       <th className="px-8 py-6 text-left text-[10px] font-black text-white uppercase tracking-[0.2em]">Signatories</th>
                       <th className="px-8 py-6 text-left text-[10px] font-black text-white uppercase tracking-[0.2em]">Status</th>
                       <th className="px-8 py-6 text-right text-[10px] font-black text-white uppercase tracking-[0.2em]">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 bg-white/40">
                    {filteredDocuments.map(doc => (
                       <tr key={doc.id} className="group hover:bg-indigo-50/50 transition-colors cursor-pointer" onClick={() => setSelectedDocument(doc)}>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md">
                                   <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                   <p className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">{doc.name}</p>
                                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{doc.createdDate.toLocaleDateString()}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <p className="text-sm font-bold text-gray-900">{doc.type}</p>
                             <p className="text-[10px] text-gray-500">{doc.pages} Pages</p>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex -space-x-2">
                                {doc.recipients.slice(0, 3).map((r, i) => (
                                   <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600" title={r.name}>
                                      {r.name.charAt(0)}
                                   </div>
                                ))}
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${statusConfig[doc.status].bg} ${statusConfig[doc.status].text} border ${statusConfig[doc.status].border}`}>
                                {doc.status}
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-indigo-500 hover:text-white transition-all cursor-pointer">
                                <Eye className="w-4 h-4" />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}
      </div>

      {/* Signature Modal */}
      {showSignModal && (
         <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[150] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-300 border-4 border-white/20">
               <div className="p-10 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div>
                     <h2 className="text-2xl font-black text-gray-900 tracking-tight">Digital <span className="text-indigo-600">Signature</span></h2>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Adopt Your Official Mark</p>
                  </div>
                  <button onClick={() => setShowSignModal(false)} className="p-3 bg-white rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">
                     <X className="w-6 h-6 text-gray-900" />
                  </button>
               </div>
               
               <div className="p-10">
                  <div className="flex gap-4 mb-6 p-1 bg-gray-100 rounded-2xl w-fit">
                     {['draw', 'type', 'upload'].map((t) => (
                        <button
                           key={t}
                           onClick={() => setSignatureType(t as 'draw' | 'type' | 'upload')}
                           className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                              signatureType === t ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-500 hover:text-gray-900'
                           }`}
                        >
                           {t}
                        </button>
                     ))}
                  </div>

                  <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2rem] h-64 relative flex items-center justify-center overflow-hidden group">
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
                              <div className="pointer-events-none text-gray-300 flex flex-col items-center gap-2">
                                 <PenTool className="w-8 h-8 opacity-50" />
                                 <span className="text-xs font-bold uppercase tracking-widest">Sign Here</span>
                              </div>
                           )}
                           <button onClick={clearCanvas} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-xs font-bold text-gray-600 cursor-pointer z-10">
                              Clear Pad
                           </button>
                        </>
                     )}
                     {signatureType === 'type' && (
                         <input
                           type="text"
                           value={typedSignature}
                           onChange={(e) => setTypedSignature(e.target.value)}
                           placeholder="Type your full name"
                           className="w-full h-full text-center text-5xl font-script text-indigo-900 bg-transparent outline-none placeholder:text-gray-200"
                           style={{ fontFamily: '"Dancing Script", cursive' }}
                         />
                     )}
                     {signatureType === 'upload' && (
                        <div className="flex flex-col items-center text-gray-400">
                           <Upload className="w-10 h-10 mb-2" />
                           <span className="text-xs font-bold uppercase tracking-widest">Drop signature image here</span>
                        </div>
                     )}
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-gray-400 bg-gray-50 p-4 rounded-xl">
                     <Lock className="w-3 h-3 text-emerald-500" />
                     <span>This signature will be encrypted and timestamped. By clicking &quot;Adopt & Sign&quot;, you agree to the electronic records policy.</span>
                  </div>
               </div>

               <div className="p-10 pt-0 flex gap-4">
                  <button onClick={() => setShowSignModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-colors cursor-pointer">
                     Cancel
                  </button>
                  <button 
                     onClick={() => {
                        showNotify('High-Fidelity Signature Adopted', 'success');
                        setShowSignModal(false);
                     }}
                     className="flex-[2] py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-indigo-700 transition-colors shadow-xl shadow-indigo-600/20 cursor-pointer"
                  >
                     Adopt & Sign
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* View Document Modal */}
      {selectedDocument && (
         <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-500">
            <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] w-full max-w-4xl h-[85vh] flex flex-col border-2 border-white shadow-2xl">
               <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                        <FileText className="w-6 h-6" />
                     </div>
                     <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">{selectedDocument.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                           <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${statusConfig[selectedDocument.status].bg} ${statusConfig[selectedDocument.status].text}`}>
                              {selectedDocument.status}
                           </span>
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 border-l border-gray-300">
                              {selectedDocument.type}
                           </span>
                        </div>
                     </div>
                  </div>
                  <button onClick={() => setSelectedDocument(null)} className="p-3 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
                     <X className="w-5 h-5 text-gray-500" />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-10 bg-gray-50/50 custom-scrollbar">
                  {/* Mock Document Viewer */}
                  <div className="bg-white shadow-lg rounded-xl min-h-[800px] p-16 animate-in slide-in-from-bottom-4 duration-700 mx-auto max-w-3xl border border-gray-200 relative">
                     <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                     
                     <div className="flex justify-between items-start mb-12">
                        <div className="w-32 h-8 bg-gray-200 rounded"></div>
                        <div className="text-right">
                           <div className="w-24 h-4 bg-gray-200 rounded mb-2 ml-auto"></div>
                           <div className="w-32 h-4 bg-gray-200 rounded ml-auto"></div>
                        </div>
                     </div>
                     
                     <div className="space-y-6">
                        <div className="w-3/4 h-8 bg-gray-200 rounded mb-8"></div>
                        <div className="space-y-3">
                           <div className="w-full h-4 bg-gray-100 rounded"></div>
                           <div className="w-full h-4 bg-gray-100 rounded"></div>
                           <div className="w-5/6 h-4 bg-gray-100 rounded"></div>
                        </div>
                        <div className="space-y-3">
                           <div className="w-full h-4 bg-gray-100 rounded"></div>
                           <div className="w-full h-4 bg-gray-100 rounded"></div>
                           <div className="w-4/5 h-4 bg-gray-100 rounded"></div>
                        </div>
                     </div>
                     
                     {/* Digital Signature Stamp */}
                     {selectedDocument.status === 'signed' && (
                        <div className="absolute bottom-16 right-16 rotate-[-10deg] border-4 border-indigo-600 rounded-lg p-4 opacity-80 mix-blend-multiply">
                           <p className="text-indigo-600 font-black uppercase text-2xl tracking-widest">SIGNED</p>
                           <p className="text-indigo-600 text-[10px] font-bold uppercase mt-1">Digital Trust Protocol</p>
                           <p className="text-indigo-600 text-[8px] font-mono mt-0.5">{selectedDocument.signedDate?.toLocaleDateString()}</p>
                        </div>
                     )}
                  </div>
               </div>

               <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky bottom-0">
                  <div className="flex -space-x-2">
                     {selectedDocument.recipients.map((r, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold" title={r.name}>
                           {r.name.charAt(0)}
                        </div>
                     ))}
                  </div>
                  <div className="flex gap-3">
                     <button 
                        onClick={() => showNotify('PDF Export Started...', 'info')}
                        className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-2"
                     >
                        <Download className="w-4 h-4" /> Export PDF
                     </button>
                     <button 
                        onClick={() => showNotify('Share Link Copied to Clipboard', 'success')}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors cursor-pointer shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                     >
                        <Share2 className="w-4 h-4" /> Share
                     </button>
                     <button 
                        onClick={() => {
                           setDeletingDocument(selectedDocument);
                           setShowDeleteModal(true);
                           setSelectedDocument(null);
                        }}
                        className="px-4 py-3 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-8 duration-500">
          <div className={`px-8 py-4 rounded-[2rem] shadow-2xl backdrop-blur-2xl border-2 flex items-center gap-4 ${
            notification.type === 'success' ? 'bg-emerald-500/90 border-emerald-400/50 text-white' :
            notification.type === 'error' ? 'bg-rose-500/90 border-rose-400/50 text-white' :
            'bg-gray-900/90 border-gray-700 text-white'
          }`}>
            <div className={`p-2 rounded-xl bg-white/20`}>
              {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : 
               notification.type === 'error' ? <XCircle className="w-5 h-5" /> : 
               <Zap className="w-5 h-5" />}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingDocument && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingDocument(null);
          }}
          onConfirm={() => {
            setDocuments(documents.filter(d => d.id !== deletingDocument.id));
            showNotify('Document Permanently Removed', 'info');
          }}
          title="Revoke Document"
          itemName={deletingDocument.name}
          itemDetails={`${deletingDocument.type} - ${deletingDocument.status}`}
          warningMessage="This legal record will be permanently deleted from the registry."
        />
      )}
    </div>
  );
}
