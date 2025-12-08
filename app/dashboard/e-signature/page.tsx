"use client";

import React, { useState, useRef } from 'react';
import { 
  PenTool, Plus, Search, Filter, Download, Upload, Send,
  FileText, CheckCircle, Clock, XCircle, AlertCircle,
  User, Mail, Calendar, Eye, Edit3, Trash2, MoreVertical,
  Users, Share2, Copy, RefreshCw, Signature, MousePointer,
  Type, Image as ImageIcon, Sparkles, Check, X, Zap,
  FileCheck, FileClock, FileX, Grid, List, ChevronRight
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
  const [isSaving, setIsSaving] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadingDocument, setDownloadingDocument] = useState<Document | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingDocument, setSharingDocument] = useState<Document | null>(null);

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
  React.useEffect(() => {
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
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (activeDropdown) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  // Get coordinates from mouse or touch event
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

  // Smooth drawing with quadratic curves
  const drawSmoothLine = (ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }) => {
    const midPoint = {
      x: (from.x + to.x) / 2,
      y: (from.y + to.y) / 2
    };
    
    ctx.quadraticCurveTo(from.x, from.y, midPoint.x, midPoint.y);
  };

  // Start drawing
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

  // Draw with smooth curves
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !lastPoint) return;
    
    const coords = getCoordinates(e);
    if (!coords) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Calculate distance for variable line width
    const distance = Math.sqrt(
      Math.pow(coords.x - lastPoint.x, 2) + Math.pow(coords.y - lastPoint.y, 2)
    );
    
    // Variable line width based on speed (slower = thicker)
    const baseWidth = 2.5;
    const maxWidth = 4;
    const minWidth = 1.5;
    const speed = Math.min(distance, 20);
    const lineWidth = Math.max(minWidth, Math.min(maxWidth, baseWidth - (speed / 20)));
    
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#4F46E5';
    
    // Draw smooth curve
    drawSmoothLine(ctx, lastPoint, coords);
    ctx.stroke();
    
    setLastPoint(coords);
  };

  // Stop drawing
  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.closePath();
  };

  // Clear canvas with animation
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Fade out animation
    let alpha = 1;
    const fadeOut = () => {
      if (alpha <= 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      ctx.globalAlpha = alpha;
      alpha -= 0.1;
      requestAnimationFrame(fadeOut);
    };
    fadeOut();
    
    setTimeout(() => {
      ctx.globalAlpha = 1;
    }, 200);
  };

  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
      <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl">
              <Signature className="w-8 h-8 text-white" />
            </div>
            E-Signature
          </h1>
          <p className="text-gray-600 mt-2">Sign and manage documents digitally with ease</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => document.getElementById('document-upload-top')?.click()}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Upload</span>
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
                  alert('File size must be less than 10MB');
                  return;
                }
                
                alert(`✓ Document "${file.name}" uploaded successfully!\n\nFile size: ${(file.size / 1024).toFixed(2)} KB\nType: ${file.type || 'Unknown'}\n\nYou can now add signatures to this document.`);
                
                // Reset input so same file can be uploaded again
                e.target.value = '';
              }
            }}
          />
          <button
            onClick={() => setShowSignModal(true)}
            className="px-6 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            New Document
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <Sparkles className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-sm text-blue-600 font-medium mb-1">Total Documents</p>
          <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <Check className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-sm text-green-600 font-medium mb-1">Signed</p>
          <p className="text-3xl font-bold text-green-900">{stats.signed}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <AlertCircle className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-sm text-orange-600 font-medium mb-1">Pending</p>
          <p className="text-3xl font-bold text-orange-900">{stats.pending}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-500 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <Edit3 className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-sm text-purple-600 font-medium mb-1">Drafts</p>
          <p className="text-3xl font-bold text-purple-900">{stats.draft}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents by name or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="signed">Signed</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
            <option value="declined">Declined</option>
            <option value="expired">Expired</option>
          </select>
          
          <div className="flex items-center gap-1 bg-white border-2 border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Documents Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => {
            const config = statusConfig[doc.status];
            const StatusIcon = config.icon;
            
            return (
              <div
                key={doc.id}
                className="group relative bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-indigo-300 hover:shadow-2xl transition-all cursor-pointer"
                onClick={() => setSelectedDocument(doc)}
              >
                {/* Status Badge */}
                <div className={`absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${config.bg} ${config.text} border ${config.border}`}>
                  <StatusIcon className="w-3 h-3" />
                  {config.label}
                </div>

                {/* Document Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 text-indigo-600" />
                </div>

                {/* Document Info */}
                <h3 className="font-bold text-gray-900 mb-1 pr-20 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {doc.name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3">{doc.type}</p>

                {doc.description && (
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{doc.description}</p>
                )}

                {/* Recipients */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-semibold text-gray-700">Recipients ({doc.recipients.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {doc.recipients.slice(0, 3).map((recipient, idx) => (
                      <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                        <div className={`w-2 h-2 rounded-full ${
                          recipient.status === 'signed' ? 'bg-green-500' :
                          recipient.status === 'declined' ? 'bg-red-500' : 'bg-orange-500'
                        }`} />
                        <span className="text-gray-700">{recipient.name.split(' ')[0]}</span>
                      </div>
                    ))}
                    {doc.recipients.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        +{doc.recipients.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>Created: {doc.createdDate.toLocaleDateString()}</span>
                  </div>
                  {doc.signedDate && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      <span>Signed: {doc.signedDate.toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <FileText className="w-3 h-3" />
                    <span>{doc.pages} pages</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDocument(doc);
                    }}
                    className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  {doc.status === 'pending' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSignModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <PenTool className="w-4 h-4" />
                      Sign
                    </button>
                  )}
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === doc.id ? null : doc.id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    {activeDropdown === doc.id && (
                      <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-[100]">
                        <div className="py-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDocument(doc);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4 text-indigo-600" />
                            View Details
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setDownloadingDocument(doc);
                              setShowDownloadModal(true);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                          >
                            <Download className="w-4 h-4 text-blue-600" />
                            Download
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSharingDocument(doc);
                              setShowShareModal(true);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 flex items-center gap-2"
                          >
                            <Share2 className="w-4 h-4 text-green-600" />
                            Share
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const newDoc: Document = {
                                ...doc,
                                id: `${Date.now()}`,
                                name: `${doc.name} (Copy)`,
                                status: 'draft',
                                createdDate: new Date(),
                                signedDate: undefined,
                                recipients: doc.recipients.map(r => ({ ...r, status: 'pending', signedDate: undefined }))
                              };
                              setDocuments([...documents, newDoc]);
                              setActiveDropdown(null);
                              alert('✓ Document duplicated successfully!');
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4 text-purple-600" />
                            Duplicate
                          </button>
                          <div className="border-t border-gray-200 my-1"></div>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingDocument(doc);
                              setShowDeleteModal(true);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                            Delete Document
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Document</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Recipients</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Created</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDocuments.map((doc) => {
                const config = statusConfig[doc.status];
                const StatusIcon = config.icon;
                
                return (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.pages} pages</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{doc.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {doc.recipients.slice(0, 2).map((recipient, idx) => (
                          <div key={idx} className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {recipient.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        ))}
                        {doc.recipients.length > 2 && (
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 text-xs font-bold">
                            +{doc.recipients.length - 2}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{doc.createdDate.toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold ${config.bg} ${config.text} border ${config.border}`}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDocument(doc);
                          }}
                          className="p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-indigo-600" />
                        </button>
                        {doc.status === 'pending' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowSignModal(true);
                            }}
                            className="p-2 hover:bg-green-50 rounded-lg transition-colors" 
                            title="Sign"
                          >
                            <PenTool className="w-4 h-4 text-green-600" />
                          </button>
                        )}
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === `list-${doc.id}` ? null : `list-${doc.id}`);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors" 
                            title="More options"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                          
                          {activeDropdown === `list-${doc.id}` && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-[100]">
                              <div className="py-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDocument(doc);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4 text-indigo-600" />
                                  View Details
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDownloadingDocument(doc);
                                    setShowDownloadModal(true);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                                >
                                  <Download className="w-4 h-4 text-blue-600" />
                                  Download
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSharingDocument(doc);
                                    setShowShareModal(true);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 flex items-center gap-2"
                                >
                                  <Share2 className="w-4 h-4 text-green-600" />
                                  Share
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newDoc: Document = {
                                      ...doc,
                                      id: `${Date.now()}`,
                                      name: `${doc.name} (Copy)`,
                                      status: 'draft',
                                      createdDate: new Date(),
                                      signedDate: undefined,
                                      recipients: doc.recipients.map(r => ({ ...r, status: 'pending', signedDate: undefined }))
                                    };
                                    setDocuments([...documents, newDoc]);
                                    setActiveDropdown(null);
                                    alert('✓ Document duplicated successfully!');
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2"
                                >
                                  <Copy className="w-4 h-4 text-purple-600" />
                                  Duplicate
                                </button>
                                <div className="border-t border-gray-200 my-1"></div>
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingDocument(doc);
                                    setShowDeleteModal(true);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                  Delete Document
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Sign Document Modal */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Signature className="w-6 h-6 text-indigo-600" />
                Create Your Signature
              </h2>
              <button
                onClick={() => setShowSignModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Signature Type Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Choose Signature Method</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setSignatureType('draw')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      signatureType === 'draw' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <MousePointer className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
                    <p className="font-semibold text-gray-900 text-sm">Draw</p>
                    <p className="text-xs text-gray-600">Use mouse or touch</p>
                  </button>

                  <button
                    onClick={() => setSignatureType('type')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      signatureType === 'type' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Type className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <p className="font-semibold text-gray-900 text-sm">Type</p>
                    <p className="text-xs text-gray-600">Type your name</p>
                  </button>

                  <button
                    onClick={() => setSignatureType('upload')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      signatureType === 'upload' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-pink-600" />
                    <p className="font-semibold text-gray-900 text-sm">Upload</p>
                    <p className="text-xs text-gray-600">Upload image</p>
                  </button>
                </div>
              </div>

              {/* Draw Signature */}
              {signatureType === 'draw' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-indigo-900">Draw your signature below</p>
                      <button
                        onClick={clearCanvas}
                        className="px-3 py-1.5 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-sm font-medium flex items-center gap-1"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Clear
                      </button>
                    </div>
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-48 bg-white rounded-lg border-2 border-indigo-300 cursor-crosshair shadow-inner transition-all hover:border-indigo-400"
                      style={{ touchAction: 'none' }}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-indigo-700 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Use your mouse, touchpad, or finger to draw
                      </p>
                      <div className="flex items-center gap-2 text-xs text-indigo-600">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                          <span>Pressure-sensitive</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tips */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Pro Tips</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Draw slowly for thicker, bolder lines</li>
                          <li>• Draw quickly for thinner, elegant strokes</li>
                          <li>• Sign naturally as you would on paper</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Type Signature */}
              {signatureType === 'type' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type Your Name</label>
                    <input
                      type="text"
                      value={typedSignature}
                      onChange={(e) => setTypedSignature(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  {typedSignature && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border-2 border-purple-200 animate-in fade-in duration-300">
                      <p className="text-sm font-semibold text-purple-900 mb-4 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Preview:
                      </p>
                      <div className="bg-white rounded-lg p-8 border-2 border-purple-300 shadow-inner">
                        <p className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                          {typedSignature}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-xs text-purple-700">
                        <Check className="w-3 h-3" />
                        <span>This is how your signature will appear on documents</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Upload Signature */}
              {signatureType === 'upload' && (
                <div className="space-y-4">
                  <div 
                    onClick={() => document.getElementById('signature-upload')?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="font-semibold text-gray-900 mb-1">Upload Signature Image</p>
                    <p className="text-sm text-gray-600 mb-4">PNG, JPG up to 5MB</p>
                    <input
                      type="file"
                      id="signature-upload"
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            alert('File size must be less than 5MB');
                            return;
                          }
                          
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const img = new Image();
                            img.onload = () => {
                              // Create a canvas to display the uploaded image
                              const canvas = canvasRef.current;
                              if (canvas) {
                                const ctx = canvas.getContext('2d');
                                if (ctx) {
                                  // Clear canvas
                                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                                  
                                  // Calculate scaling to fit canvas while maintaining aspect ratio
                                  const scale = Math.min(
                                    canvas.width / img.width,
                                    canvas.height / img.height
                                  );
                                  const x = (canvas.width - img.width * scale) / 2;
                                  const y = (canvas.height - img.height * scale) / 2;
                                  
                                  // Draw image on canvas
                                  ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                                }
                              }
                            };
                            img.src = event.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                          
                          alert(`✓ Signature image "${file.name}" uploaded successfully!`);
                        }
                      }}
                    />
                    <button className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium">
                      Choose File
                    </button>
                  </div>
                  
                  {/* Preview Canvas */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                    <p className="text-sm font-semibold text-indigo-900 mb-4">Preview</p>
                    <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={200}
                        className="w-full border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowSignModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsSaving(true);
                    setTimeout(() => {
                      setIsSaving(false);
                      setShowSignModal(false);
                      // Reset states
                      setTypedSignature('');
                      clearCanvas();
                    }, 1500);
                  }}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Save Signature</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedDocument.name}</h2>
                  <p className="text-sm text-gray-600">{selectedDocument.type}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDocument(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className={`p-4 rounded-xl border-2 ${statusConfig[selectedDocument.status].bg} ${statusConfig[selectedDocument.status].border}`}>
                <div className="flex items-center gap-3">
                  {React.createElement(statusConfig[selectedDocument.status].icon, { className: `w-6 h-6 ${statusConfig[selectedDocument.status].text}` })}
                  <div>
                    <h3 className={`font-bold ${statusConfig[selectedDocument.status].text}`}>
                      {statusConfig[selectedDocument.status].label}
                    </h3>
                    <p className={`text-sm ${statusConfig[selectedDocument.status].text}`}>
                      {selectedDocument.status === 'signed' && selectedDocument.signedDate && `Signed on ${selectedDocument.signedDate.toLocaleDateString()}`}
                      {selectedDocument.status === 'pending' && selectedDocument.expiryDate && `Expires on ${selectedDocument.expiryDate.toLocaleDateString()}`}
                      {selectedDocument.status === 'draft' && 'Document is in draft mode'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedDocument.description && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedDocument.description}</p>
                </div>
              )}

              {/* Recipients */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Recipients ({selectedDocument.recipients.length})</h3>
                <div className="space-y-2">
                  {selectedDocument.recipients.map((recipient, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                          {recipient.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{recipient.name}</p>
                          <p className="text-sm text-gray-600">{recipient.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {recipient.signedDate && (
                          <span className="text-xs text-gray-600">{recipient.signedDate.toLocaleDateString()}</span>
                        )}
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold ${
                          recipient.status === 'signed' ? 'bg-green-100 text-green-700' :
                          recipient.status === 'declined' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {recipient.status === 'signed' && <CheckCircle className="w-3 h-3" />}
                          {recipient.status === 'declined' && <XCircle className="w-3 h-3" />}
                          {recipient.status === 'pending' && <Clock className="w-3 h-3" />}
                          {recipient.status.charAt(0).toUpperCase() + recipient.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-xs text-blue-600 mb-1">Created By</p>
                  <p className="font-semibold text-blue-900">{selectedDocument.sender}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <p className="text-xs text-purple-600 mb-1">Pages</p>
                  <p className="font-semibold text-purple-900">{selectedDocument.pages} pages</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-xs text-green-600 mb-1">Created Date</p>
                  <p className="font-semibold text-green-900">{selectedDocument.createdDate.toLocaleDateString()}</p>
                </div>
                {selectedDocument.signedDate && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <p className="text-xs text-emerald-600 mb-1">Signed Date</p>
                    <p className="font-semibold text-emerald-900">{selectedDocument.signedDate.toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button 
                  type="button"
                  onClick={() => {
                    setDownloadingDocument(selectedDocument);
                    setShowDownloadModal(true);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
                {selectedDocument.status === 'pending' && (
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedDocument(null);
                      setShowSignModal(true);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PenTool className="w-5 h-5" />
                    Sign Document
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => {
                    setSharingDocument(selectedDocument);
                    setShowShareModal(true);
                  }}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download Modal */}
      {showDownloadModal && downloadingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <Download className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Download Document</h2>
                  <p className="text-blue-100 text-sm mt-0.5">{downloadingDocument.name}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowDownloadModal(false);
                  setDownloadingDocument(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Document Preview Card */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">{downloadingDocument.name}</p>
                    <p className="text-sm text-gray-600">{downloadingDocument.type}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {downloadingDocument.pages} pages
                      </span>
                      <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded text-xs font-medium capitalize">
                        {downloadingDocument.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Sender: {downloadingDocument.sender}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>{downloadingDocument.recipients.length} Recipients</span>
                  </div>
                </div>
              </div>

              {/* Download Format Options */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-gray-900">Choose Download Format:</p>
                  <span className="text-xs text-gray-500">Select your preferred file type</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* PDF Option */}
                  <button
                    type="button"
                    onClick={() => {
                      const pdfContent = `
E-SIGNATURE DOCUMENT
${'='.repeat(80)}

Document: ${downloadingDocument.name}
Type: ${downloadingDocument.type}
Status: ${downloadingDocument.status.toUpperCase()}
Created: ${downloadingDocument.createdDate.toLocaleDateString()}
${downloadingDocument.signedDate ? `Signed: ${downloadingDocument.signedDate.toLocaleDateString()}` : ''}
Pages: ${downloadingDocument.pages}

DESCRIPTION:
${downloadingDocument.description || 'No description provided'}

SENDER:
${downloadingDocument.sender}

RECIPIENTS (${downloadingDocument.recipients.length}):
${downloadingDocument.recipients.map(r => `  • ${r.name} (${r.email}) - ${r.status.toUpperCase()}${r.signedDate ? ` - Signed: ${r.signedDate.toLocaleDateString()}` : ''}`).join('\n')}

${'='.repeat(80)}
Document Generated: ${new Date().toLocaleString()}
`;
                      const blob = new Blob([pdfContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${downloadingDocument.name.replace(/[^a-z0-9]/gi, '_')}_document.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      setShowDownloadModal(false);
                      setDownloadingDocument(null);
                    }}
                    className="group relative px-5 py-4 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all flex flex-col items-center gap-2 font-semibold cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold">PDF Report</p>
                      <p className="text-xs text-red-100 mt-0.5">Formatted document</p>
                    </div>
                  </button>

                  {/* Excel/CSV Option */}
                  <button
                    type="button"
                    onClick={() => {
                      const csv = `Document Name,Type,Status,Created Date,Signed Date,Sender,Pages,Recipients\n${downloadingDocument.name},${downloadingDocument.type},${downloadingDocument.status},${downloadingDocument.createdDate.toLocaleDateString()},${downloadingDocument.signedDate?.toLocaleDateString() || 'N/A'},${downloadingDocument.sender},${downloadingDocument.pages},${downloadingDocument.recipients.length}\n\nRecipients:\nName,Email,Status,Signed Date\n${downloadingDocument.recipients.map(r => `${r.name},${r.email},${r.status},${r.signedDate?.toLocaleDateString() || 'N/A'}`).join('\n')}`;
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${downloadingDocument.name.replace(/[^a-z0-9]/gi, '_')}_data.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      setShowDownloadModal(false);
                      setDownloadingDocument(null);
                    }}
                    className="group relative px-5 py-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all flex flex-col items-center gap-2 font-semibold cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold">Excel / CSV</p>
                      <p className="text-xs text-green-100 mt-0.5">Spreadsheet format</p>
                    </div>
                  </button>

                  {/* JSON Option */}
                  <button
                    type="button"
                    onClick={() => {
                      const jsonData = {
                        document: {
                          id: downloadingDocument.id,
                          name: downloadingDocument.name,
                          type: downloadingDocument.type,
                          status: downloadingDocument.status,
                          createdDate: downloadingDocument.createdDate.toISOString(),
                          signedDate: downloadingDocument.signedDate?.toISOString(),
                          expiryDate: downloadingDocument.expiryDate?.toISOString(),
                          sender: downloadingDocument.sender,
                          pages: downloadingDocument.pages,
                          description: downloadingDocument.description
                        },
                        recipients: downloadingDocument.recipients.map(r => ({
                          name: r.name,
                          email: r.email,
                          status: r.status,
                          signedDate: r.signedDate?.toISOString()
                        })),
                        exportedAt: new Date().toISOString()
                      };
                      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${downloadingDocument.name.replace(/[^a-z0-9]/gi, '_')}_data.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      setShowDownloadModal(false);
                      setDownloadingDocument(null);
                    }}
                    className="group relative px-5 py-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all flex flex-col items-center gap-2 font-semibold cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold">JSON</p>
                      <p className="text-xs text-blue-100 mt-0.5">Structured data format</p>
                    </div>
                  </button>

                  {/* Plain Text Option */}
                  <button
                    type="button"
                    onClick={() => {
                      const data = `DOCUMENT EXPORT\n${'='.repeat(60)}\n\nDocument: ${downloadingDocument.name}\nType: ${downloadingDocument.type}\nStatus: ${downloadingDocument.status}\nCreated: ${downloadingDocument.createdDate.toLocaleDateString()}\n${downloadingDocument.signedDate ? `Signed: ${downloadingDocument.signedDate.toLocaleDateString()}\n` : ''}Pages: ${downloadingDocument.pages}\nSender: ${downloadingDocument.sender}\n\nDescription:\n${downloadingDocument.description || 'No description'}\n\nRecipients (${downloadingDocument.recipients.length}):\n${downloadingDocument.recipients.map(r => `  • ${r.name} (${r.email}) - ${r.status}`).join('\n')}\n\nExported: ${new Date().toLocaleString()}\n`;
                      const blob = new Blob([data], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${downloadingDocument.name.replace(/[^a-z0-9]/gi, '_')}_data.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      setShowDownloadModal(false);
                      setDownloadingDocument(null);
                    }}
                    className="group relative px-5 py-4 bg-gradient-to-br from-gray-600 to-gray-800 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all flex flex-col items-center gap-2 font-semibold cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold">Plain Text</p>
                      <p className="text-xs text-gray-200 mt-0.5">Simple text file</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Cancel Button */}
              <button 
                type="button"
                onClick={() => {
                  setShowDownloadModal(false);
                  setDownloadingDocument(null);
                }}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && sharingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <Share2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Share Document</h2>
                  <p className="text-green-100 text-sm mt-0.5">{sharingDocument.name}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowShareModal(false);
                  setSharingDocument(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Document Info */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{sharingDocument.name}</p>
                    <p className="text-sm text-gray-600">{sharingDocument.type} • {sharingDocument.pages} pages</p>
                  </div>
                </div>
              </div>

              {/* Share Options */}
              <div className="space-y-3">
                <p className="text-sm font-bold text-gray-900">Share via:</p>
                
                <button
                  type="button"
                  onClick={() => {
                    const subject = encodeURIComponent(`Document: ${sharingDocument.name}`);
                    const body = encodeURIComponent(`I'm sharing the following document with you:\n\nDocument: ${sharingDocument.name}\nType: ${sharingDocument.type}\nStatus: ${sharingDocument.status}\nPages: ${sharingDocument.pages}\n\nPlease review and sign if required.`);
                    window.location.href = `mailto:?subject=${subject}&body=${body}`;
                    setShowShareModal(false);
                    setSharingDocument(null);
                  }}
                  className="w-full px-5 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:shadow-xl transition-all flex items-center gap-3 font-semibold"
                >
                  <Mail className="w-6 h-6" />
                  <div className="text-left">
                    <p className="font-bold">Email</p>
                    <p className="text-xs text-blue-100">Send via email client</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/documents/${sharingDocument.id}`;
                    navigator.clipboard.writeText(url);
                    alert('✓ Link copied to clipboard!');
                    setShowShareModal(false);
                    setSharingDocument(null);
                  }}
                  className="w-full px-5 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-xl transition-all flex items-center gap-3 font-semibold"
                >
                  <Copy className="w-6 h-6" />
                  <div className="text-left">
                    <p className="font-bold">Copy Link</p>
                    <p className="text-xs text-purple-100">Copy shareable link</p>
                  </div>
                </button>
              </div>

              {/* Cancel Button */}
              <button 
                type="button"
                onClick={() => {
                  setShowShareModal(false);
                  setSharingDocument(null);
                }}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDocument && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingDocument(null);
          }}
          onConfirm={() => {
            setDocuments(documents.filter(doc => doc.id !== deletingDocument.id));
            alert('✓ Document deleted successfully!');
          }}
          title="Delete Document"
          itemName={deletingDocument.name}
          itemDetails={`${deletingDocument.type} - ${deletingDocument.pages} pages`}
          warningMessage="This will permanently remove this document and all its signatures."
        />
      )}
      </div>
    </>
  );
}
