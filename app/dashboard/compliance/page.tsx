"use client";

import React, { useState } from 'react';
import {
  Shield, Bell, AlertTriangle, CheckCircle, Clock, Calendar,
  FileText, Download, Plus, Search, Filter, Eye,
  Edit3, Trash2, X, MoreVertical, ChevronRight,
  Scale, Gavel, ClipboardCheck, Award, Lock,
  Users, Globe, DollarSign, TrendingUp, Target,
  AlertCircle, XCircle, Link, Share2,
  Grid, List,
  BarChart3, PieChart, Activity, FileCheck,
  Server, Workflow, FileSpreadsheet
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'compliant' | 'pending' | 'overdue' | 'at-risk' | 'not-applicable';
  dueDate: Date;
  completedDate?: Date;
  assignedTo: string;
  documents: string[];
  requirements: string[];
  framework?: string;
  jurisdiction?: string;
  frequency: 'one-time' | 'monthly' | 'quarterly' | 'annually';
  nextReview?: Date;
  riskLevel?: number;
  lastAudit?: Date;
  auditor?: string;
  cost?: number;
  impact?: string;
}

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  requirements: number;
  compliant: number;
  category: string;
  certificationDate?: Date;
  expiryDate?: Date;
}

interface RiskMetric {
  id: string;
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  severity: 'low' | 'medium' | 'high' | 'critical';
  icon: React.ElementType;
}

interface AuditLog {
  action: string;
  item: string;
  user: string;
  time: string;
  type: 'success' | 'info' | 'error' | 'warning';
}

const initialFrameworks: ComplianceFramework[] = [];
const riskMetrics: RiskMetric[] = [];
const auditLogs: AuditLog[] = [];

const categoryConfigs = [
  { id: 'all', name: 'All Items', icon: Grid },
  { id: 'data-privacy', name: 'Data Privacy', icon: Lock },
  { id: 'financial', name: 'Financial', icon: DollarSign },
  { id: 'legal', name: 'Legal', icon: Gavel },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'operational', name: 'Operational', icon: Workflow },
  { id: 'environmental', name: 'Environmental', icon: Globe },
];

export default function CompliancePage() {
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [frameworksState, setFrameworksState] = useState<ComplianceFramework[]>(initialFrameworks);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'frameworks' | 'risks' | 'audits'>('overview');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ComplianceItem | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingItem, setSharingItem] = useState<ComplianceItem | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'PDF' | 'Excel' | 'CSV'>('PDF');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null);
  const [newItemData, setNewItemData] = useState({
    title: '',
    description: '',
    category: 'data-privacy',
    priority: 'medium' as ComplianceItem['priority'],
    assignedTo: 'General Team'
  });
  const [reportScope, setReportScope] = useState('all');
  const [reportAugmentations, setReportAugmentations] = useState({
    risk: true,
    audit: true,
    framework: true
  });
  const [editingFramework, setEditingFramework] = useState<ComplianceFramework | null>(null);
  const [showEditFrameworkModal, setShowEditFrameworkModal] = useState(false);
  const [sharingFramework, setSharingFramework] = useState<ComplianceFramework | null>(null);
  const [showShareFrameworkModal, setShowShareFrameworkModal] = useState(false);

  const showNotification = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const categories = categoryConfigs.map(cat => ({
    ...cat,
    count: cat.id === 'all' ? items.length : items.filter(i => i.category === cat.id).length
  }));

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'compliant':   return { icon: CheckCircle, label: 'Compliant',  bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500'  };
      case 'pending':     return { icon: Clock,        label: 'Pending',    bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500'   };
      case 'overdue':     return { icon: AlertTriangle, label: 'Overdue',   bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500'    };
      case 'at-risk':     return { icon: AlertCircle,  label: 'At Risk',   bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' };
      case 'not-applicable': return { icon: XCircle,   label: 'N/A',       bg: 'bg-gray-50',   text: 'text-gray-700',   border: 'border-gray-200',   dot: 'bg-gray-400'   };
      default:            return { icon: AlertCircle,  label: 'Unknown',   bg: 'bg-gray-50',   text: 'text-gray-700',   border: 'border-gray-200',   dot: 'bg-gray-400'   };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'critical': return { label: 'Critical', bg: 'bg-red-100',    text: 'text-red-700'    };
      case 'high':     return { label: 'High',     bg: 'bg-orange-100', text: 'text-orange-700' };
      case 'medium':   return { label: 'Medium',   bg: 'bg-yellow-100', text: 'text-yellow-700' };
      case 'low':      return { label: 'Low',      bg: 'bg-green-100',  text: 'text-green-700'  };
      default:         return { label: 'Unknown',  bg: 'bg-gray-100',   text: 'text-gray-700'   };
    }
  };

  const stats = {
    total: items.length,
    compliant: items.filter(i => i.status === 'compliant').length,
    pending: items.filter(i => i.status === 'pending').length,
    overdue: items.filter(i => i.status === 'overdue').length,
    atRisk: items.filter(i => i.status === 'at-risk').length,
  };

  const complianceRate = stats.total > 0 ? ((stats.compliant / stats.total) * 100).toFixed(1) : '0.0';
  const totalCost = items.reduce((sum, item) => sum + (item.cost || 0), 0);
  const avgRiskLevel = items.length > 0 ? items.reduce((sum, item) => sum + (item.riskLevel || 0), 0) / items.length : 0;

  const handleEdit = (item: ComplianceItem) => { setEditingItem(item); setShowEditModal(true); };
  const handleDuplicate = (item: ComplianceItem) => {
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9), title: `${item.title} (Copy)` };
    setItems([...items, newItem]);
    showNotification(`✓ Duplicated: ${item.title}`);
  };
  const handleExport = (item: ComplianceItem) => {
    const exportData = { ...item, dueDate: item.dueDate.toISOString(), completedDate: item.completedDate?.toISOString(), nextReview: item.nextReview?.toISOString(), lastAudit: item.lastAudit?.toISOString() };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url; link.download = `${item.title.replace(/\s+/g, '_')}_compliance.json`; link.click();
    URL.revokeObjectURL(url);
    showNotification(`✓ Exported: ${item.title}`);
  };
  const handleShare = (item: ComplianceItem) => { setSharingItem(item); setShowShareModal(true); };
  const handleDelete = (item: ComplianceItem) => {
    if (confirm(`Delete "${item.title}"? This cannot be undone.`)) {
      setItems(items.filter(i => i.id !== item.id));
      showNotification(`✓ Deleted: ${item.title}`);
    }
  };
  const handleMarkComplete = (item: ComplianceItem) => {
    setItems(items.map(i => i.id === item.id ? { ...i, status: 'compliant' as const, completedDate: new Date() } : i));
    setSelectedItem(null);
    showNotification(`✓ Marked as complete: ${item.title}`);
  };
  const handleCreateItem = () => {
    if (!newItemData.title) return;
    const newItem: ComplianceItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: newItemData.title, description: newItemData.description,
      category: newItemData.category, priority: newItemData.priority,
      status: 'pending', dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      assignedTo: newItemData.assignedTo, documents: [], requirements: ['Initial review required'],
      frequency: 'annually', riskLevel: 25
    };
    setItems([newItem, ...items]);
    setShowAddItem(false);
    setNewItemData({ title: '', description: '', category: 'data-privacy', priority: 'medium', assignedTo: 'General Team' });
    showNotification(`✓ Created: ${newItem.title}`);
  };
  const handleEditFramework = (framework: ComplianceFramework) => { setEditingFramework(framework); setShowEditFrameworkModal(true); };
  const handleShareFramework = (framework: ComplianceFramework) => { setSharingFramework(framework); setShowShareFrameworkModal(true); };
  const handleExportFramework = (framework: ComplianceFramework) => {
    const data = JSON.stringify(framework, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `${framework.name}_data.json`; link.click();
    showNotification(`✓ Exported: ${framework.name}`);
  };
  const handleGenerateReport = () => {
    const reportData = items.map(item => ({
      Title: item.title, Status: item.status, Priority: item.priority,
      DueDate: item.dueDate.toLocaleDateString(), Category: item.category,
      Framework: item.framework || 'N/A', Description: item.description
    }));
    if (exportFormat === 'CSV' || exportFormat === 'Excel') {
      const headers = Object.keys(reportData[0] || {}).join(',');
      const rows = reportData.map(row => Object.values(row).map(v => `"${v}"`).join(','));
      const content = [headers, ...rows].join('\n');
      const mimeType = exportFormat === 'CSV' ? 'text/csv' : 'application/vnd.ms-excel';
      const extension = exportFormat === 'CSV' ? 'csv' : 'xls';
      const blob = new Blob(['﻿' + content], { type: mimeType + ';charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = `compliance_report_${new Date().toISOString().split('T')[0]}.${extension}`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const doc = new jsPDF();
      doc.setFontSize(22); doc.setTextColor(30, 41, 59);
      doc.text("Compliance Center Report", 14, 22);
      doc.setFontSize(10); doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Total Items: ${items.length}`, 14, 35);
      doc.setDrawColor(226, 232, 240); doc.line(14, 40, 196, 40);
      let yOffset = 50;
      reportData.forEach((item, index) => {
        if (yOffset > 270) { doc.addPage(); yOffset = 20; }
        doc.setFontSize(12); doc.setTextColor(30, 41, 59); doc.setFont("helvetica", "bold");
        doc.text(`${index + 1}. ${item.Title}`, 14, yOffset);
        doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(71, 85, 105);
        doc.text(`Status: ${item.Status} | Priority: ${item.Priority} | Due: ${item.DueDate}`, 14, yOffset + 6);
        const descLines = doc.splitTextToSize(item.Description, 170);
        doc.text(descLines, 14, yOffset + 12);
        yOffset += 18 + (descLines.length * 5);
      });
      doc.save(`compliance_report_${new Date().toISOString().split('T')[0]}.pdf`);
    }
    setShowExportModal(false);
    showNotification(`✓ ${exportFormat} report generated!`);
  };

  // Dropdown menu
  const DropdownMenu = ({ id, onEdit, onDelete, onDuplicate, onExport, onShare }: {
    id: string; onEdit?: () => void; onDelete?: () => void;
    onDuplicate?: () => void; onExport?: () => void; onShare?: () => void;
  }) => {
    const isOpen = openDropdown === id;
    return (
      <div className="relative">
        <button onClick={(e) => { e.stopPropagation(); setOpenDropdown(isOpen ? null : id); }}
          className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1 overflow-hidden">
              {onEdit && (
                <button onClick={(e) => { e.stopPropagation(); onEdit(); setOpenDropdown(null); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left cursor-pointer">
                  <Edit3 className="w-4 h-4 text-blue-600" /><span className="text-sm text-gray-700">Edit</span>
                </button>
              )}
              {onDuplicate && (
                <button onClick={(e) => { e.stopPropagation(); onDuplicate(); setOpenDropdown(null); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 transition-colors text-left cursor-pointer">
                  <ClipboardCheck className="w-4 h-4 text-purple-600" /><span className="text-sm text-gray-700">Duplicate</span>
                </button>
              )}
              {onShare && (
                <button onClick={(e) => { e.stopPropagation(); onShare(); setOpenDropdown(null); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 transition-colors text-left cursor-pointer">
                  <Share2 className="w-4 h-4 text-green-600" /><span className="text-sm text-gray-700">Share</span>
                </button>
              )}
              {onExport && (
                <button onClick={(e) => { e.stopPropagation(); onExport(); setOpenDropdown(null); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 transition-colors text-left cursor-pointer">
                  <Download className="w-4 h-4 text-indigo-600" /><span className="text-sm text-gray-700">Export</span>
                </button>
              )}
              {onDelete && (
                <>
                  <div className="border-t border-gray-100 my-1" />
                  <button onClick={(e) => { e.stopPropagation(); onDelete(); setOpenDropdown(null); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left cursor-pointer">
                    <Trash2 className="w-4 h-4 text-red-500" /><span className="text-sm text-red-600">Delete</span>
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'overview',   label: 'Overview',    icon: Activity      },
    { id: 'items',      label: 'Items',        icon: ClipboardCheck },
    { id: 'frameworks', label: 'Frameworks',   icon: Award         },
    { id: 'risks',      label: 'Risks',        icon: AlertTriangle },
    { id: 'audits',     label: 'Audits',       icon: FileText      },
  ];

  const inputCls = "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all";
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-24 sm:pb-8">

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight truncate">
                Compliance Hub
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-600 font-medium">Operational</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setShowExportModal(true)}
              className="h-9 w-9 sm:w-auto sm:px-4 flex items-center justify-center sm:gap-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer">
              <Download className="w-4 h-4 text-gray-600" />
              <span className="hidden sm:inline text-sm font-medium text-gray-700">Export</span>
            </button>
            <button onClick={() => setShowAddItem(true)}
              className="h-9 px-4 sm:px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm flex items-center gap-2 cursor-pointer transition-colors shadow-sm active:scale-95">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Entry</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Tab nav */}
        <div className="px-4 sm:px-6">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide border-t border-gray-50">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all cursor-pointer shrink-0 ${
                    isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                  }`}>
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">

            {/* Key metrics — 2 col mobile → 4 col desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

              {/* Compliance Score */}
              <div className="col-span-2 sm:col-span-1 bg-gray-900 rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                      <Shield className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex items-center gap-1 bg-blue-500/20 px-2 py-1 rounded-lg border border-blue-400/20">
                      <TrendingUp className="w-3 h-3 text-blue-400" />
                      <span className="text-[10px] font-bold text-blue-400">+5.2%</span>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Compliance Score</p>
                  <p className="text-4xl font-bold text-white">{complianceRate}%</p>
                  <p className="text-xs text-blue-400/60 mt-1">Global average</p>
                </div>
              </div>

              {/* Frameworks */}
              <div onClick={() => setActiveTab('frameworks')}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Frameworks</p>
                <p className="text-3xl font-bold text-gray-900">{frameworksState.length}</p>
                <p className="text-xs text-green-600 font-medium mt-1">
                  {frameworksState.filter((f: ComplianceFramework) => (f.compliant / f.requirements) === 1).length} fully compliant
                </p>
              </div>

              {/* Risk Level */}
              <div onClick={() => setActiveTab('risks')}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  </div>
                  <Activity className="w-4 h-4 text-gray-300" />
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Avg Risk</p>
                <p className="text-3xl font-bold text-gray-900">{avgRiskLevel.toFixed(0)}</p>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full" style={{ width: `${avgRiskLevel}%` }} />
                </div>
              </div>

              {/* Annual Cost */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-gray-300" />
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Annual Cost</p>
                <p className="text-3xl font-bold text-gray-900">${(totalCost / 1000).toFixed(0)}K</p>
                <p className="text-xs text-gray-400 mt-1">
                  ${items.length > 0 ? (totalCost / items.length / 1000).toFixed(1) : '0.0'}K per item
                </p>
              </div>
            </div>

            {/* Status overview — 2 col mobile → 4 col desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Compliant', count: stats.compliant, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', bar: 'bg-green-500' },
                { label: 'Pending',   count: stats.pending,   icon: Clock,        color: 'text-blue-600',  bg: 'bg-blue-50',  bar: 'bg-blue-500'  },
                { label: 'Overdue',   count: stats.overdue,   icon: AlertTriangle, color: 'text-red-600',   bg: 'bg-red-50',   bar: 'bg-red-500'   },
                { label: 'At Risk',   count: stats.atRisk,    icon: AlertCircle,  color: 'text-orange-600',bg: 'bg-orange-50',bar: 'bg-orange-500' },
              ].map(({ label, count, icon: Icon, color, bg, bar }) => (
                <div key={label} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <p className={`text-2xl sm:text-3xl font-bold text-gray-900`}>{count}</p>
                  </div>
                  <p className={`text-xs font-semibold ${color}`}>{label}</p>
                  <div className="w-full bg-gray-100 rounded-full h-1 mt-2 overflow-hidden">
                    <div className={`h-full ${bar} rounded-full`} style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Risk Metrics */}
            {riskMetrics.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-purple-600" />
                  </div>
                  Risk Metrics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {riskMetrics.map((metric) => {
                    const Icon = metric.icon;
                    const sev = { low: 'text-green-600 bg-green-50', medium: 'text-yellow-600 bg-yellow-50', high: 'text-orange-600 bg-orange-50', critical: 'text-red-600 bg-red-50' }[metric.severity];
                    return (
                      <div key={metric.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${sev}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-red-500" />}
                          {metric.trend === 'down' && <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />}
                          {metric.trend === 'stable' && <Activity className="w-4 h-4 text-gray-400" />}
                        </div>
                        <p className="text-xs text-gray-500 mb-0.5">{metric.name}</p>
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                        <p className={`text-xs font-medium mt-1 capitalize ${sev?.split(' ')[0]}`}>{metric.severity} severity</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Frameworks overview */}
            {frameworksState.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-600" /> Frameworks
                  </h3>
                  <button onClick={() => setActiveTab('frameworks')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer">
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {frameworksState.slice(0, 4).map((framework: ComplianceFramework) => {
                    const Icon = framework.icon;
                    const pct = (framework.compliant / framework.requirements) * 100;
                    return (
                      <div key={framework.id} onClick={() => setSelectedFramework(framework)}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group relative">
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu id={`ov-fw-${framework.id}`}
                            onEdit={() => handleEditFramework(framework)}
                            onShare={() => handleShareFramework(framework)}
                            onExport={() => handleExportFramework(framework)} />
                        </div>
                        <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${framework.gradient} mb-3 shadow-sm`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{framework.name}</h4>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          <span>Progress</span><span className="font-medium">{framework.compliant}/{framework.requirements}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${framework.gradient} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs font-medium text-gray-700 mt-1.5">{pct.toFixed(0)}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ITEMS TAB ── */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            {/* Search + view toggle */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search items..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
                <button onClick={() => setViewMode('grid')}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <Grid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category filter — horizontal scroll */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              {categories.map(({ id, name, icon: Icon, count }) => (
                <button key={id} onClick={() => setSelectedCategory(id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    selectedCategory === id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}>
                  <Icon className="w-4 h-4" />{name}
                  <span className={`px-1.5 py-0.5 rounded-md text-xs font-bold ${selectedCategory === id ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
                </button>
              ))}
            </div>

            {/* Empty state */}
            {filteredItems.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ClipboardCheck className="w-7 h-7 text-gray-400" />
                </div>
                <p className="font-semibold text-gray-700 mb-1">No compliance items</p>
                <p className="text-sm text-gray-400 mb-5">Create your first item to start tracking</p>
                <button onClick={() => setShowAddItem(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors cursor-pointer">
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>
            )}

            {/* Grid view */}
            {viewMode === 'grid' && filteredItems.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => {
                  const sc = getStatusConfig(item.status);
                  const pc = getPriorityConfig(item.priority);
                  const StatusIcon = sc.icon;
                  const isOverdue = item.status === 'overdue' || (item.dueDate < new Date() && item.status !== 'compliant');
                  return (
                    <div key={item.id} onClick={() => setSelectedItem(item)}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden group">
                      {/* Status accent */}
                      <div className={`h-1 w-full ${sc.dot.replace('bg-', 'bg-')}`} />
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sc.bg} border ${sc.border}`}>
                            <StatusIcon className={`w-5 h-5 ${sc.text}`} />
                          </div>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${pc.bg} ${pc.text}`}>{pc.label}</span>
                            <DropdownMenu id={`grid-${item.id}`}
                              onEdit={() => handleEdit(item)} onDuplicate={() => handleDuplicate(item)}
                              onExport={() => handleExport(item)} onShare={() => handleShare(item)}
                              onDelete={() => handleDelete(item)} />
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base leading-tight">{item.title}</h4>
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-4">{item.description}</p>

                        {/* Risk bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-gray-400 font-medium">Risk</span>
                            <span className={`font-semibold ${(item.riskLevel || 0) > 50 ? 'text-red-600' : 'text-gray-600'}`}>{item.riskLevel || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full rounded-full ${(item.riskLevel || 0) > 70 ? 'bg-red-500' : (item.riskLevel || 0) > 40 ? 'bg-orange-400' : 'bg-blue-500'}`}
                              style={{ width: `${item.riskLevel || 0}%` }} />
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-50">
                          <div className={`flex items-center gap-2 p-2.5 rounded-xl ${isOverdue ? 'bg-red-50' : 'bg-gray-50'}`}>
                            <Calendar className={`w-3.5 h-3.5 shrink-0 ${isOverdue ? 'text-red-500' : 'text-blue-500'}`} />
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-400">Due</p>
                              <p className={`text-xs font-medium truncate ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>{item.dueDate.toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50">
                            <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-400">Officer</p>
                              <p className="text-xs font-medium text-gray-700 truncate">{item.assignedTo}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* List view — card-based, mobile-friendly */}
            {viewMode === 'list' && filteredItems.length > 0 && (
              <div className="space-y-2">
                {filteredItems.map((item) => {
                  const sc = getStatusConfig(item.status);
                  const pc = getPriorityConfig(item.priority);
                  const StatusIcon = sc.icon;
                  const isOverdue = item.status === 'overdue' || (item.dueDate < new Date() && item.status !== 'compliant');
                  return (
                    <div key={item.id} onClick={() => setSelectedItem(item)}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                      <div className="p-4 sm:p-5 flex items-center gap-4">
                        {/* Status icon */}
                        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${sc.bg} border ${sc.border}`}>
                          <StatusIcon className={`w-5 h-5 ${sc.text}`} />
                        </div>

                        {/* Title + meta */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 text-sm truncate">{item.title}</h4>
                            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${pc.bg} ${pc.text}`}>{pc.label}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                            <span className="capitalize">{item.category.replace('-', ' ')}</span>
                            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
                              <Calendar className="w-3 h-3" /> {item.dueDate.toLocaleDateString()}
                            </span>
                            <span className="hidden sm:flex items-center gap-1">
                              <Users className="w-3 h-3" /> {item.assignedTo}
                            </span>
                          </div>
                        </div>

                        {/* Risk + actions */}
                        <div className="shrink-0 flex items-center gap-2">
                          <div className="hidden sm:flex flex-col items-end gap-1">
                            <span className={`text-xs font-semibold ${(item.riskLevel || 0) > 50 ? 'text-red-600' : 'text-gray-600'}`}>{item.riskLevel || 0}%</span>
                            <div className="w-16 bg-gray-100 rounded-full h-1 overflow-hidden">
                              <div className={`h-full rounded-full ${(item.riskLevel || 0) > 70 ? 'bg-red-500' : (item.riskLevel || 0) > 40 ? 'bg-orange-400' : 'bg-blue-500'}`}
                                style={{ width: `${item.riskLevel || 0}%` }} />
                            </div>
                          </div>
                          <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu id={`list-${item.id}`}
                              onEdit={() => handleEdit(item)} onDuplicate={() => handleDuplicate(item)}
                              onExport={() => handleExport(item)} onShare={() => handleShare(item)}
                              onDelete={() => handleDelete(item)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── FRAMEWORKS TAB ── */}
        {activeTab === 'frameworks' && (
          <div className="space-y-4">
            {frameworksState.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-7 h-7 text-purple-400" />
                </div>
                <p className="font-semibold text-gray-700 mb-1">No frameworks configured</p>
                <p className="text-sm text-gray-400">Add compliance frameworks to track certifications</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {frameworksState.map((framework: ComplianceFramework) => {
                  const Icon = framework.icon;
                  const pct = (framework.compliant / framework.requirements) * 100;
                  const daysUntilExpiry = framework.expiryDate ? Math.ceil((framework.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
                  return (
                    <div key={framework.id} onClick={() => setSelectedFramework(framework)}
                      className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all cursor-pointer relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${framework.gradient} shadow-sm`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex items-center gap-2">
                          {pct === 100 && (
                            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                              <CheckCircle className="w-3.5 h-3.5" /> Certified
                            </div>
                          )}
                          <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu id={`fw-${framework.id}`}
                              onEdit={() => handleEditFramework(framework)}
                              onExport={() => handleExportFramework(framework)}
                              onShare={() => handleShareFramework(framework)} />
                          </div>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{framework.name}</h3>
                      <p className="text-xs text-gray-500 mb-4 line-clamp-2">{framework.description}</p>
                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Category</span><span className="font-medium text-gray-700">{framework.category}</span>
                        </div>
                        {framework.expiryDate && (
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Expires</span>
                            <span className={`font-medium ${daysUntilExpiry && daysUntilExpiry < 90 ? 'text-red-600' : 'text-gray-700'}`}>
                              {framework.expiryDate.toLocaleDateString()}
                              {daysUntilExpiry && daysUntilExpiry < 90 && <span className="ml-1">({daysUntilExpiry}d)</span>}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-semibold text-gray-900">{framework.compliant}/{framework.requirements}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${framework.gradient} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{pct.toFixed(0)}%</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedFramework(framework); }}
                        className="mt-4 w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all cursor-pointer">
                        View Details
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── RISKS TAB ── */}
        {activeTab === 'risks' && (
          <div className="space-y-4">
            {/* Risk overview cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl p-5 text-white shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white/20 rounded-xl"><AlertTriangle className="w-6 h-6" /></div>
                  <TrendingUp className="w-5 h-5 opacity-60 rotate-180" />
                </div>
                <p className="text-sm opacity-90 mb-1">High Risk</p>
                <p className="text-4xl font-bold">{items.filter(i => (i.riskLevel || 0) > 70).length}</p>
                <p className="text-xs opacity-70 mt-1">Require immediate attention</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl p-5 text-white shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white/20 rounded-xl"><AlertCircle className="w-6 h-6" /></div>
                  <Activity className="w-5 h-5 opacity-60" />
                </div>
                <p className="text-sm opacity-90 mb-1">Medium Risk</p>
                <p className="text-4xl font-bold">{items.filter(i => (i.riskLevel || 0) > 40 && (i.riskLevel || 0) <= 70).length}</p>
                <p className="text-xs opacity-70 mt-1">Monitor closely</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-5 text-white shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white/20 rounded-xl"><CheckCircle className="w-6 h-6" /></div>
                  <TrendingUp className="w-5 h-5 opacity-60" />
                </div>
                <p className="text-sm opacity-90 mb-1">Low Risk</p>
                <p className="text-4xl font-bold">{items.filter(i => (i.riskLevel || 0) <= 40).length}</p>
                <p className="text-xs opacity-70 mt-1">Well managed</p>
              </div>
            </div>

            {/* Risk detail */}
            {riskMetrics.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" /> Detailed Risk Analysis
                </h3>
                <div className="space-y-3">
                  {riskMetrics.map((metric) => {
                    const Icon = metric.icon;
                    const cols = { low: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', bar: 'bg-green-500' }, medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', bar: 'bg-yellow-500' }, high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', bar: 'bg-orange-500' }, critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', bar: 'bg-red-500' } }[metric.severity];
                    return (
                      <div key={metric.id} className={`p-4 rounded-xl border ${cols.border} ${cols.bg}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 ${cols.bar} rounded-lg`}><Icon className="w-4 h-4 text-white" /></div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">{metric.name}</h4>
                              <p className={`text-xs font-medium ${cols.text} capitalize`}>{metric.severity} severity</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                            {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-red-500" />}
                            {metric.trend === 'down' && <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />}
                            {metric.trend === 'stable' && <Activity className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>
                        <div className="w-full bg-white/50 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full ${cols.bar} rounded-full`} style={{ width: `${metric.value}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Risk by category */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-600" /> Risk by Category
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.filter(c => c.id !== 'all').map(({ id, name, icon: Icon }) => {
                  const catItems = items.filter(i => i.category === id);
                  const avg = catItems.length > 0 ? catItems.reduce((sum, i) => sum + (i.riskLevel || 0), 0) / catItems.length : 0;
                  return (
                    <div key={id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">{name}</h4>
                          <p className="text-xs text-gray-500">{catItems.length} items</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-500">Avg Risk</span>
                        <span className="font-semibold text-gray-900">{avg.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full rounded-full ${avg > 70 ? 'bg-red-500' : avg > 50 ? 'bg-orange-500' : avg > 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${avg}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── AUDITS TAB ── */}
        {activeTab === 'audits' && (
          <div className="space-y-4">
            {/* Recent activity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" /> Recent Audit Activities
              </h3>
              {auditLogs.length === 0 ? (
                <div className="text-center py-8">
                  <FileCheck className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No audit logs yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map((log, idx) => {
                    const cfg = { success: { bg: 'bg-green-50', border: 'border-green-100', icon: CheckCircle, ic: 'text-green-600' }, error: { bg: 'bg-red-50', border: 'border-red-100', icon: AlertTriangle, ic: 'text-red-600' }, warning: { bg: 'bg-orange-50', border: 'border-orange-100', icon: AlertCircle, ic: 'text-orange-600' }, info: { bg: 'bg-blue-50', border: 'border-blue-100', icon: Clock, ic: 'text-blue-600' } }[log.type];
                    const LIcon = cfg.icon;
                    return (
                      <div key={idx} className={`p-4 rounded-xl border ${cfg.border} ${cfg.bg}`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-white rounded-lg ${cfg.ic}`}><LIcon className="w-4 h-4" /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className="font-semibold text-gray-900 text-sm">{log.action}</span>
                              <span className="text-gray-400">·</span>
                              <span className="text-sm text-gray-600 truncate">{log.item}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{log.user}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{log.time}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => showNotification(`Opening: ${log.item}`)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors cursor-pointer">
                              <Eye className="w-4 h-4 text-blue-600" />
                            </button>
                            <DropdownMenu id={`audit-${idx}`}
                              onExport={() => showNotification(`Export: ${log.item}`)}
                              onShare={() => showNotification(`Share: ${log.item}`)} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upcoming audits */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" /> Upcoming Audits
              </h3>
              {items.filter(i => i.nextReview).length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No upcoming audits scheduled</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {items.filter(i => i.nextReview).slice(0, 4).map((item) => {
                    const d = item.nextReview ? Math.ceil((item.nextReview.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
                    return (
                      <div key={item.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition-all cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                            <p className="text-xs text-gray-500">{item.framework || item.category}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${d < 30 ? 'bg-red-100 text-red-700' : d < 60 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{d}d</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{item.nextReview?.toLocaleDateString()}</span>
                          {item.auditor && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{item.auditor}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── ITEM DETAIL MODAL ── */}
      {selectedItem && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusConfig(selectedItem.status).bg} border ${getStatusConfig(selectedItem.status).border}`}>
                  {React.createElement(getStatusConfig(selectedItem.status).icon, { className: `w-5 h-5 ${getStatusConfig(selectedItem.status).text}` })}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base leading-tight">{selectedItem.title}</h2>
                  <p className="text-xs text-gray-400 capitalize">{selectedItem.category.replace('-', ' ')} · {selectedItem.framework || 'General'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-gray-50/50">
              {/* Status / Priority / Risk */}
              <div className="grid grid-cols-3 gap-3">
                <div className={`p-4 rounded-xl border ${getStatusConfig(selectedItem.status).bg} ${getStatusConfig(selectedItem.status).border} text-center`}>
                  <p className={`text-xs font-semibold ${getStatusConfig(selectedItem.status).text} mb-1`}>Status</p>
                  <p className={`font-bold text-sm ${getStatusConfig(selectedItem.status).text}`}>{getStatusConfig(selectedItem.status).label}</p>
                </div>
                <div className={`p-4 rounded-xl ${getPriorityConfig(selectedItem.priority).bg} text-center`}>
                  <p className={`text-xs font-semibold ${getPriorityConfig(selectedItem.priority).text} mb-1`}>Priority</p>
                  <p className={`font-bold text-sm ${getPriorityConfig(selectedItem.priority).text}`}>{getPriorityConfig(selectedItem.priority).label}</p>
                </div>
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 text-center">
                  <p className="text-xs font-semibold text-orange-600 mb-1">Risk</p>
                  <p className="font-bold text-sm text-orange-700">{selectedItem.riskLevel || 0}%</p>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white p-5 rounded-xl border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" /> Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{selectedItem.description}</p>
                {selectedItem.impact && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-red-600 mb-0.5">Impact</p>
                      <p className="text-xs text-red-700">{selectedItem.impact}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Dates + Responsibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-5 rounded-xl border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-purple-500" /> Key Dates</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Due Date', value: selectedItem.dueDate.toLocaleDateString() },
                      selectedItem.nextReview && { label: 'Next Review', value: selectedItem.nextReview.toLocaleDateString() },
                      selectedItem.lastAudit && { label: 'Last Audit', value: selectedItem.lastAudit.toLocaleDateString() },
                    ].filter(Boolean).map((row: any) => (
                      <div key={row.label} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                        <span className="text-gray-500">{row.label}</span>
                        <span className="font-medium text-gray-900">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-green-500" /> Responsibility</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Assigned To', value: selectedItem.assignedTo },
                      selectedItem.auditor && { label: 'Auditor', value: selectedItem.auditor },
                      selectedItem.jurisdiction && { label: 'Jurisdiction', value: selectedItem.jurisdiction },
                    ].filter(Boolean).map((row: any) => (
                      <div key={row.label} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                        <span className="text-gray-500">{row.label}</span>
                        <span className="font-medium text-gray-900">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-white flex gap-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-5">
              <button onClick={() => { handleMarkComplete(selectedItem); }} className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> Mark Compliant
              </button>
              <button onClick={() => { handleEdit(selectedItem); setSelectedItem(null); }} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2">
                <Edit3 className="w-4 h-4" /> Edit Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT ITEM MODAL ── */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900 flex items-center gap-2"><Edit3 className="w-5 h-5 text-blue-600" /> Edit Item</h2>
                <p className="text-xs text-gray-400 mt-0.5">{editingItem.title}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-gray-50/50">
              <div className="bg-white p-5 rounded-xl border border-gray-100 space-y-4">
                <div>
                  <label className={labelCls}>Title</label>
                  <input type="text" value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea rows={3} value={editingItem.description} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} className={`${inputCls} resize-none`} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Category</label>
                    <select value={editingItem.category} onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })} className={inputCls}>
                      {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select value={editingItem.status} onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as ComplianceItem['status'] })} className={inputCls}>
                      <option value="compliant">Compliant</option>
                      <option value="pending">Pending</option>
                      <option value="overdue">Overdue</option>
                      <option value="at-risk">At Risk</option>
                      <option value="not-applicable">Not Applicable</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Assigned To</label>
                  <input type="text" value={editingItem.assignedTo} onChange={(e) => setEditingItem({ ...editingItem, assignedTo: e.target.value })} className={inputCls} />
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row gap-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-5">
              <button onClick={() => setShowEditModal(false)} className="sm:flex-1 py-3 text-gray-500 hover:text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">Cancel</button>
              <button onClick={() => { setItems(items.map(i => i.id === editingItem.id ? editingItem : i)); setShowEditModal(false); setEditingItem(null); showNotification(`✓ Updated: ${editingItem.title}`); }}
                className="sm:flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer active:scale-95">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SHARE ITEM MODAL ── */}
      {showShareModal && sharingItem && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><Share2 className="w-5 h-5 text-green-600" /> Share Item</h2>
              <button onClick={() => setShowShareModal(false)} className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="font-semibold text-gray-900 text-sm">{sharingItem.title}</p>
                <p className="text-xs text-blue-600 font-medium mt-0.5 capitalize">{sharingItem.category.replace('-', ' ')}</p>
              </div>
              <div>
                <label className={labelCls}>Share with (Email)</label>
                <input type="email" placeholder="colleague@company.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Message</label>
                <textarea rows={2} placeholder="Add a message..." className={`${inputCls} resize-none`} />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
                  <span className="text-sm text-gray-700">Allow editing</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
                  <span className="text-sm text-gray-700">Send notification</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2 pb-[calc(env(safe-area-inset-bottom,0px))] sm:pb-0">
                <button onClick={() => { setShowShareModal(false); setSharingItem(null); showNotification(`✓ Shared: ${sharingItem.title}`); }}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/compliance/${sharingItem.id}`); showNotification('✓ Link copied!'); }}
                  className="py-3 px-4 border border-gray-200 text-gray-600 hover:border-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-2">
                  <Link className="w-4 h-4" /> Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD ITEM MODAL ── */}
      {showAddItem && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900 flex items-center gap-2"><Plus className="w-5 h-5 text-blue-600" /> New Compliance Item</h2>
                <p className="text-xs text-gray-400 mt-0.5">Add to regulatory tracking</p>
              </div>
              <button onClick={() => setShowAddItem(false)} className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-gray-50/50">
              <div className="bg-white p-5 rounded-xl border border-gray-100 space-y-4">
                <div>
                  <label className={labelCls}>Title</label>
                  <input type="text" placeholder="e.g. Annual Audit" value={newItemData.title} onChange={(e) => setNewItemData({ ...newItemData, title: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea rows={3} placeholder="Enter details..." value={newItemData.description} onChange={(e) => setNewItemData({ ...newItemData, description: e.target.value })} className={`${inputCls} resize-none`} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Category</label>
                    <select value={newItemData.category} onChange={(e) => setNewItemData({ ...newItemData, category: e.target.value })} className={inputCls}>
                      {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Priority</label>
                    <select value={newItemData.priority} onChange={(e) => setNewItemData({ ...newItemData, priority: e.target.value as ComplianceItem['priority'] })} className={inputCls}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Assigned To</label>
                  <input type="text" value={newItemData.assignedTo} onChange={(e) => setNewItemData({ ...newItemData, assignedTo: e.target.value })} className={inputCls} />
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row gap-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-5">
              <button onClick={() => setShowAddItem(false)} className="sm:flex-1 py-3 text-gray-500 hover:text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleCreateItem} className="sm:flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer active:scale-95">
                Create Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EXPORT MODAL ── */}
      {showExportModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900 flex items-center gap-2"><Download className="w-5 h-5 text-indigo-600" /> Export Report</h2>
                <p className="text-xs text-gray-400 mt-0.5">Generate compliance documentation</p>
              </div>
              <button onClick={() => setShowExportModal(false)} className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Format */}
              <div>
                <label className={labelCls}>Format</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'PDF', icon: FileText, desc: 'PDF Document' },
                    { id: 'Excel', icon: FileSpreadsheet, desc: 'Excel Sheet' },
                    { id: 'CSV', icon: FileSpreadsheet, desc: 'CSV File' },
                  ].map(({ id, icon: Icon, desc }) => (
                    <button key={id} onClick={() => setExportFormat(id as 'PDF' | 'Excel' | 'CSV')}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${exportFormat === id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                      <Icon className={`w-5 h-5 mb-2 ${exportFormat === id ? 'text-blue-600' : 'text-gray-400'}`} />
                      <p className={`text-sm font-semibold ${exportFormat === id ? 'text-blue-700' : 'text-gray-700'}`}>{id}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                      {exportFormat === id && <CheckCircle className="w-3.5 h-3.5 text-blue-600 mt-1" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scope */}
              <div>
                <label className={labelCls}>Scope</label>
                <select value={reportScope} onChange={(e) => setReportScope(e.target.value)} className={inputCls}>
                  <option value="all">Full Inventory</option>
                  <option value="summary">Executive Summary</option>
                  <option value="critical">Critical Items Only</option>
                </select>
              </div>

              {/* Sections */}
              <div>
                <label className={labelCls}>Include Sections</label>
                <div className="space-y-2">
                  {[
                    { id: 'risk', label: 'Risk Analysis', icon: AlertTriangle },
                    { id: 'audit', label: 'Audit Trail', icon: FileCheck },
                    { id: 'framework', label: 'Framework Status', icon: Award },
                  ].map(({ id, label, icon: Icon }) => (
                    <label key={id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{label}</span>
                      </div>
                      <div className="relative">
                        <input type="checkbox" checked={reportAugmentations[id as keyof typeof reportAugmentations]}
                          onChange={(e) => setReportAugmentations({ ...reportAugmentations, [id]: e.target.checked })}
                          className="sr-only peer" />
                        <div className="w-10 h-5 bg-gray-200 peer-checked:bg-blue-600 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:w-4 after:h-4 after:transition-all peer-checked:after:translate-x-5" />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-white flex gap-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-5">
              <button onClick={() => setShowExportModal(false)} className="flex-1 py-3 text-gray-500 hover:text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleGenerateReport} className="flex-[2] py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FRAMEWORK DETAIL MODAL ── */}
      {selectedFramework && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
          <div className="absolute inset-0" onClick={() => setSelectedFramework(null)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedFramework.gradient} flex items-center justify-center shadow-sm`}>
                  {React.createElement(selectedFramework.icon, { className: "w-6 h-6 text-white" })}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">{selectedFramework.name}</h2>
                  <p className="text-xs text-gray-400 capitalize">{selectedFramework.category} framework</p>
                </div>
              </div>
              <button onClick={() => setSelectedFramework(null)} className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-gray-50/50">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedFramework.requirements}</p>
                  <p className="text-xs text-gray-400 mt-1">Requirements</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedFramework.compliant}</p>
                  <p className="text-xs text-gray-400 mt-1">Compliant</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
                  <p className="text-2xl font-bold text-blue-600">{((selectedFramework.compliant / selectedFramework.requirements) * 100).toFixed(0)}%</p>
                  <p className="text-xs text-gray-400 mt-1">Complete</p>
                </div>
              </div>

              {/* Progress */}
              <div className="bg-white p-5 rounded-xl border border-gray-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Compliance Progress</span>
                  <span className="font-semibold text-gray-900">{selectedFramework.compliant}/{selectedFramework.requirements}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${selectedFramework.gradient} rounded-full transition-all`}
                    style={{ width: `${(selectedFramework.compliant / selectedFramework.requirements) * 100}%` }} />
                </div>
              </div>

              {/* Description */}
              <div className="bg-white p-5 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed">{selectedFramework.description}</p>
              </div>

              {/* Dates */}
              <div className="bg-white p-5 rounded-xl border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Certification Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">Certified</span>
                    <span className="font-medium text-gray-900">{selectedFramework.certificationDate?.toLocaleDateString() || 'Pending'}</span>
                  </div>
                  <div className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">Expires</span>
                    <span className="font-medium text-gray-900">{selectedFramework.expiryDate?.toLocaleDateString() || 'No expiry'}</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {['DLP-ACTIVE', 'ENCRYPTION', 'AUDIT-LOGGING', 'CERTIFIED'].map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium">{tag}</span>
                ))}
              </div>
            </div>
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-white flex gap-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-5">
              <button onClick={() => setSelectedFramework(null)} className="flex-1 py-3 text-gray-500 hover:text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">Dismiss</button>
              <button onClick={() => { showNotification(`✓ Audit initiated: ${selectedFramework.name}`); setSelectedFramework(null); }}
                className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer active:scale-95">
                Trigger Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT FRAMEWORK MODAL ── */}
      {showEditFrameworkModal && editingFramework && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[110] p-0 sm:p-4">
          <div className="absolute inset-0" onClick={() => setShowEditFrameworkModal(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><Edit3 className="w-5 h-5 text-blue-600" /> Edit Framework</h2>
              <button onClick={() => setShowEditFrameworkModal(false)} className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <label className={labelCls}>Name</label>
                <input type="text" value={editingFramework.name} onChange={(e) => setEditingFramework({ ...editingFramework, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea rows={3} value={editingFramework.description} onChange={(e) => setEditingFramework({ ...editingFramework, description: e.target.value })} className={`${inputCls} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Requirements</label>
                  <input type="number" value={editingFramework.requirements} onChange={(e) => setEditingFramework({ ...editingFramework, requirements: parseInt(e.target.value) })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Compliant</label>
                  <input type="number" value={editingFramework.compliant} onChange={(e) => setEditingFramework({ ...editingFramework, compliant: parseInt(e.target.value) })} className={inputCls} />
                </div>
              </div>
              <div className="flex gap-3 pt-2 pb-[calc(env(safe-area-inset-bottom,0px))] sm:pb-0">
                <button onClick={() => setShowEditFrameworkModal(false)} className="flex-1 py-3 text-gray-500 hover:text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">Cancel</button>
                <button onClick={() => { setFrameworksState(frameworksState.map((f: ComplianceFramework) => f.id === editingFramework.id ? editingFramework : f)); setShowEditFrameworkModal(false); showNotification(`✓ Updated: ${editingFramework.name}`); }}
                  className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer active:scale-95">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SHARE FRAMEWORK MODAL ── */}
      {showShareFrameworkModal && sharingFramework && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[110] p-0 sm:p-4">
          <div className="absolute inset-0" onClick={() => setShowShareFrameworkModal(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><Share2 className="w-5 h-5 text-indigo-600" /> Share Framework</h2>
              <button onClick={() => setShowShareFrameworkModal(false)} className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${sharingFramework.gradient} flex items-center justify-center`}>
                  {React.createElement(sharingFramework.icon, { className: "w-5 h-5 text-white" })}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{sharingFramework.name}</p>
                  <p className="text-xs text-indigo-600">{sharingFramework.category} framework</p>
                </div>
              </div>
              <div>
                <label className={labelCls}>Recipient Email</label>
                <input type="email" placeholder="auditor@regulator.gov" className={inputCls} />
              </div>
              <div className="flex gap-3 pb-[calc(env(safe-area-inset-bottom,0px))] sm:pb-0">
                <button onClick={() => { setShowShareFrameworkModal(false); showNotification(`✓ Shared: ${sharingFramework.name}`); }}
                  className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/compliance/framework/${sharingFramework.id}`); showNotification('✓ Link copied!'); }}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center gap-2">
                  <Link className="w-4 h-4" /> Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUCCESS TOAST ── */}
      {showSuccess && (
        <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] sm:w-auto max-w-sm">
          <div className="bg-gray-900 border border-white/10 px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
            <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-white font-medium flex-1">{successMessage}</p>
            <button onClick={() => setShowSuccess(false)} className="w-7 h-7 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer shrink-0">
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
