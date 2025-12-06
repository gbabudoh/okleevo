"use client";

import React, { useState } from 'react';
import { 
  Shield, Bell, AlertTriangle, CheckCircle, Clock, Calendar,
  FileText, Download, Upload, Plus, Search, Filter, Eye,
  Edit3, Trash2, MoreVertical, X, Check, ChevronRight,
  Scale, Gavel, BookOpen, ClipboardCheck, Award, Lock,
  Users, Building2, Globe, DollarSign, TrendingUp, Target,
  AlertCircle, XCircle, Zap, Star, Settings, Link, Share2,
  Grid, List, Archive, RefreshCw, Mail, Phone, MapPin,
  BarChart3, PieChart, Activity, Briefcase, FileCheck,
  Layers, Database, Server, Cloud, Code, GitBranch,
  Workflow, Boxes, Package, Cpu, HardDrive, Network
} from 'lucide-react';

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
  icon: any;
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
  icon: any;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  item: string;
  details: string;
}

const frameworks: ComplianceFramework[] = [
  {
    id: 'gdpr',
    name: 'GDPR',
    description: 'General Data Protection Regulation',
    icon: Shield,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    requirements: 12,
    compliant: 10,
    category: 'Data Privacy',
    certificationDate: new Date('2023-01-15'),
    expiryDate: new Date('2025-01-15')
  },
  {
    id: 'hipaa',
    name: 'HIPAA',
    description: 'Health Insurance Portability',
    icon: Lock,
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    requirements: 8,
    compliant: 8,
    category: 'Healthcare',
    certificationDate: new Date('2023-03-20'),
    expiryDate: new Date('2025-03-20')
  },
  {
    id: 'sox',
    name: 'SOX',
    description: 'Sarbanes-Oxley Act',
    icon: Scale,
    color: 'green',
    gradient: 'from-green-500 to-emerald-500',
    requirements: 15,
    compliant: 12,
    category: 'Financial',
    certificationDate: new Date('2023-06-10')
  },
  {
    id: 'iso27001',
    name: 'ISO 27001',
    description: 'Information Security Management',
    icon: Award,
    color: 'orange',
    gradient: 'from-orange-500 to-red-500',
    requirements: 20,
    compliant: 18,
    category: 'Security',
    certificationDate: new Date('2023-09-05'),
    expiryDate: new Date('2026-09-05')
  },
  {
    id: 'pci-dss',
    name: 'PCI DSS',
    description: 'Payment Card Industry Data Security',
    icon: DollarSign,
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-500',
    requirements: 12,
    compliant: 11,
    category: 'Financial',
    certificationDate: new Date('2024-02-01'),
    expiryDate: new Date('2025-02-01')
  },
  {
    id: 'ccpa',
    name: 'CCPA',
    description: 'California Consumer Privacy Act',
    icon: Globe,
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-500',
    requirements: 8,
    compliant: 7,
    category: 'Data Privacy',
    certificationDate: new Date('2024-01-10')
  },
  {
    id: 'iso9001',
    name: 'ISO 9001',
    description: 'Quality Management Systems',
    icon: Target,
    color: 'rose',
    gradient: 'from-rose-500 to-pink-500',
    requirements: 10,
    compliant: 10,
    category: 'Quality',
    certificationDate: new Date('2023-11-15'),
    expiryDate: new Date('2026-11-15')
  },
  {
    id: 'nist',
    name: 'NIST CSF',
    description: 'Cybersecurity Framework',
    icon: Server,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    requirements: 18,
    compliant: 15,
    category: 'Security',
    certificationDate: new Date('2024-03-01')
  }
];

const riskMetrics: RiskMetric[] = [
  { id: '1', name: 'Data Breach Risk', value: 23, trend: 'down', severity: 'medium', icon: Shield },
  { id: '2', name: 'Regulatory Penalties', value: 15, trend: 'down', severity: 'low', icon: AlertTriangle },
  { id: '3', name: 'Audit Findings', value: 8, trend: 'stable', severity: 'low', icon: FileCheck },
  { id: '4', name: 'Policy Violations', value: 12, trend: 'up', severity: 'medium', icon: XCircle }
];

const categories = [
  { id: 'all', name: 'All Items', icon: Grid, count: 24 },
  { id: 'data-privacy', name: 'Data Privacy', icon: Lock, count: 8 },
  { id: 'financial', name: 'Financial', icon: DollarSign, count: 6 },
  { id: 'legal', name: 'Legal', icon: Gavel, count: 5 },
  { id: 'security', name: 'Security', icon: Shield, count: 5 },
  { id: 'operational', name: 'Operational', icon: Workflow, count: 4 },
  { id: 'environmental', name: 'Environmental', icon: Globe, count: 3 },
];

export default function CompliancePage() {
  const [items, setItems] = useState<ComplianceItem[]>([
    {
      id: '1',
      title: 'Annual Tax Filing',
      description: 'Submit annual corporate tax returns and financial statements',
      category: 'financial',
      priority: 'critical',
      status: 'pending',
      dueDate: new Date('2024-12-31'),
      assignedTo: 'Finance Team',
      documents: ['Tax Return Form', 'Financial Statements', 'Audit Report'],
      requirements: ['Complete financial audit', 'Prepare tax documentation', 'Submit to authorities'],
      framework: 'SOX',
      jurisdiction: 'United States',
      frequency: 'annually',
      nextReview: new Date('2025-01-15'),
      riskLevel: 85,
      lastAudit: new Date('2024-01-15'),
      auditor: 'Ernst & Young',
      cost: 45000,
      impact: 'High financial and reputational risk'
    },
    {
      id: '2',
      title: 'Quarterly VAT Return',
      description: 'Submit quarterly VAT returns and payment',
      category: 'financial',
      priority: 'high',
      status: 'overdue',
      dueDate: new Date('2024-12-15'),
      assignedTo: 'Accounting',
      documents: ['VAT Return', 'Sales Records', 'Purchase Records'],
      requirements: ['Calculate VAT liability', 'Prepare return', 'Submit payment'],
      jurisdiction: 'United Kingdom',
      frequency: 'quarterly',
      nextReview: new Date('2025-03-15'),
      riskLevel: 70,
      cost: 5000,
      impact: 'Financial penalties and interest charges'
    },
    {
      id: '3',
      title: 'GDPR Data Protection Assessment',
      description: 'Annual review of data protection policies and procedures',
      category: 'data-privacy',
      priority: 'high',
      status: 'compliant',
      dueDate: new Date('2024-11-30'),
      completedDate: new Date('2024-11-28'),
      assignedTo: 'Legal & IT',
      documents: ['DPIA Report', 'Privacy Policy', 'Data Mapping'],
      requirements: ['Review data processing', 'Update privacy policies', 'Train staff'],
      framework: 'GDPR',
      jurisdiction: 'European Union',
      frequency: 'annually',
      nextReview: new Date('2025-11-30'),
      riskLevel: 45,
      lastAudit: new Date('2024-11-20'),
      auditor: 'Internal Audit Team',
      cost: 25000,
      impact: 'Regulatory fines up to €20M or 4% of revenue'
    },
    {
      id: '4',
      title: 'Employee Background Checks',
      description: 'Conduct background checks for new hires',
      category: 'legal',
      priority: 'medium',
      status: 'at-risk',
      dueDate: new Date('2024-12-20'),
      assignedTo: 'HR Department',
      documents: ['Background Check Forms', 'Consent Forms'],
      requirements: ['Obtain consent', 'Conduct checks', 'Document results'],
      jurisdiction: 'United States',
      frequency: 'one-time',
      riskLevel: 55,
      cost: 3000,
      impact: 'Legal liability and workplace safety concerns'
    },
    {
      id: '5',
      title: 'ISO 27001 Security Audit',
      description: 'Annual information security management system audit',
      category: 'security',
      priority: 'high',
      status: 'pending',
      dueDate: new Date('2025-01-15'),
      assignedTo: 'Security Team',
      documents: ['Audit Plan', 'Security Policies', 'Risk Assessment'],
      requirements: ['Internal audit', 'External certification', 'Remediation plan'],
      framework: 'ISO 27001',
      jurisdiction: 'International',
      frequency: 'annually',
      nextReview: new Date('2026-01-15'),
      riskLevel: 60,
      lastAudit: new Date('2024-01-10'),
      auditor: 'BSI Group',
      cost: 35000,
      impact: 'Loss of certification and customer trust'
    },
    {
      id: '6',
      title: 'Data Breach Response Plan',
      description: 'Review and update incident response procedures',
      category: 'data-privacy',
      priority: 'critical',
      status: 'compliant',
      dueDate: new Date('2024-12-01'),
      completedDate: new Date('2024-11-25'),
      assignedTo: 'Security & Legal',
      documents: ['Response Plan', 'Contact List', 'Communication Templates'],
      requirements: ['Update procedures', 'Test response', 'Train team'],
      framework: 'GDPR',
      jurisdiction: 'European Union',
      frequency: 'annually',
      nextReview: new Date('2025-12-01'),
      riskLevel: 40,
      lastAudit: new Date('2024-11-15'),
      auditor: 'Internal Security Team',
      cost: 15000,
      impact: 'Regulatory fines and reputational damage'
    },
    {
      id: '7',
      title: 'PCI DSS Compliance Scan',
      description: 'Quarterly vulnerability scanning and penetration testing',
      category: 'security',
      priority: 'high',
      status: 'pending',
      dueDate: new Date('2024-12-28'),
      assignedTo: 'IT Security',
      documents: ['Scan Report', 'Remediation Plan', 'Network Diagram'],
      requirements: ['Run vulnerability scan', 'Fix critical issues', 'Submit ASV report'],
      framework: 'PCI DSS',
      jurisdiction: 'International',
      frequency: 'quarterly',
      nextReview: new Date('2025-03-28'),
      riskLevel: 75,
      cost: 12000,
      impact: 'Loss of payment processing capability'
    },
    {
      id: '8',
      title: 'Environmental Impact Assessment',
      description: 'Annual sustainability and environmental compliance review',
      category: 'environmental',
      priority: 'medium',
      status: 'compliant',
      dueDate: new Date('2024-11-15'),
      completedDate: new Date('2024-11-10'),
      assignedTo: 'Operations',
      documents: ['Impact Report', 'Carbon Footprint Analysis', 'Waste Management Plan'],
      requirements: ['Measure emissions', 'Report to authorities', 'Implement improvements'],
      jurisdiction: 'European Union',
      frequency: 'annually',
      nextReview: new Date('2025-11-15'),
      riskLevel: 30,
      cost: 18000,
      impact: 'Regulatory fines and brand reputation'
    }
  ]);

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

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'compliant':
        return { color: 'green', icon: CheckCircle, label: 'Compliant', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
      case 'pending':
        return { color: 'blue', icon: Clock, label: 'Pending', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case 'overdue':
        return { color: 'red', icon: AlertTriangle, label: 'Overdue', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
      case 'at-risk':
        return { color: 'orange', icon: AlertCircle, label: 'At Risk', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
      case 'not-applicable':
        return { color: 'gray', icon: XCircle, label: 'N/A', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
      default:
        return { color: 'gray', icon: AlertCircle, label: 'Unknown', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'critical':
        return { color: 'red', label: 'Critical', bg: 'bg-red-100', text: 'text-red-700' };
      case 'high':
        return { color: 'orange', label: 'High', bg: 'bg-orange-100', text: 'text-orange-700' };
      case 'medium':
        return { color: 'yellow', label: 'Medium', bg: 'bg-yellow-100', text: 'text-yellow-700' };
      case 'low':
        return { color: 'green', label: 'Low', bg: 'bg-green-100', text: 'text-green-700' };
      default:
        return { color: 'gray', label: 'Unknown', bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  };

  const stats = {
    total: items.length,
    compliant: items.filter(i => i.status === 'compliant').length,
    pending: items.filter(i => i.status === 'pending').length,
    overdue: items.filter(i => i.status === 'overdue').length,
    atRisk: items.filter(i => i.status === 'at-risk').length,
  };

  const complianceRate = ((stats.compliant / stats.total) * 100).toFixed(1);
  const totalCost = items.reduce((sum, item) => sum + (item.cost || 0), 0);
  const avgRiskLevel = items.reduce((sum, item) => sum + (item.riskLevel || 0), 0) / items.length;

  // Action Handlers
  const handleEdit = (item: ComplianceItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleDuplicate = (item: ComplianceItem) => {
    const newItem = {
      ...item,
      id: `${Date.now()}`,
      title: `${item.title} (Copy)`,
    };
    setItems([...items, newItem]);
    alert(`✓ Duplicated: ${item.title}`);
  };

  const handleExport = (item: ComplianceItem) => {
    const exportData = {
      ...item,
      dueDate: item.dueDate.toISOString(),
      completedDate: item.completedDate?.toISOString(),
      nextReview: item.nextReview?.toISOString(),
      lastAudit: item.lastAudit?.toISOString(),
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.title.replace(/\s+/g, '_')}_compliance.json`;
    link.click();
    URL.revokeObjectURL(url);
    alert(`✓ Exported: ${item.title}`);
  };

  const handleShare = (item: ComplianceItem) => {
    setSharingItem(item);
    setShowShareModal(true);
  };

  const handleDelete = (item: ComplianceItem) => {
    if (confirm(`⚠️ Are you sure you want to delete "${item.title}"?\n\nThis action cannot be undone.`)) {
      setItems(items.filter(i => i.id !== item.id));
      alert(`✓ Deleted: ${item.title}`);
    }
  };

  const handleMarkComplete = (item: ComplianceItem) => {
    const updatedItems = items.map(i => 
      i.id === item.id 
        ? { ...i, status: 'compliant' as const, completedDate: new Date() }
        : i
    );
    setItems(updatedItems);
    setSelectedItem(null);
    alert(`✓ Marked as complete: ${item.title}`);
  };

  // Dropdown Menu Component
  const DropdownMenu = ({ 
    id, 
    onEdit, 
    onDelete, 
    onDuplicate, 
    onExport, 
    onShare 
  }: { 
    id: string; 
    onEdit?: () => void;
    onDelete?: () => void;
    onDuplicate?: () => void;
    onExport?: () => void;
    onShare?: () => void;
  }) => {
    const isOpen = openDropdown === id;
    
    return (
      <div className="relative">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setOpenDropdown(isOpen ? null : id);
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors" 
          title="More options"
        >
          <MoreVertical className="w-4 h-4 text-gray-600" />
        </button>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setOpenDropdown(null)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50 overflow-hidden">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                    setOpenDropdown(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                >
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Edit</span>
                </button>
              )}
              {onDuplicate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                    setOpenDropdown(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left"
                >
                  <ClipboardCheck className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">Duplicate</span>
                </button>
              )}
              {onShare && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare();
                    setOpenDropdown(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors text-left"
                >
                  <Share2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Share</span>
                </button>
              )}
              {onExport && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onExport();
                    setOpenDropdown(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors text-left"
                >
                  <Download className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-900">Export</span>
                </button>
              )}
              {onDelete && (
                <>
                  <div className="border-t border-gray-200" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                      setOpenDropdown(null);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-600">Delete</span>
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            Compliance Management
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Enterprise regulatory compliance & risk management</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Alerts</span>
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">3</span>
          </button>
          <button className="px-5 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
            <Download className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Export</span>
          </button>
          <button
            onClick={() => setShowAddItem(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-2xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Compliance Item
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-2 shadow-sm">
        <div className="flex items-center gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'items', label: 'Compliance Items', icon: ClipboardCheck },
            { id: 'frameworks', label: 'Frameworks', icon: Award },
            { id: 'risks', label: 'Risk Analysis', icon: AlertTriangle },
            { id: 'audits', label: 'Audit Trail', icon: FileCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Compliance Score */}
            <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <Shield className="w-8 h-8" />
                </div>
                <TrendingUp className="w-6 h-6 opacity-70" />
              </div>
              <p className="text-sm opacity-90 mb-1">Compliance Score</p>
              <p className="text-5xl font-bold mb-2">{complianceRate}%</p>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1 bg-white bg-opacity-20 px-2 py-1 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                  <span>+5.2%</span>
                </div>
                <span className="opacity-80">vs last month</span>
              </div>
            </div>

            {/* Total Frameworks */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Active Frameworks</p>
              <p className="text-5xl font-bold text-gray-900 mb-2">{frameworks.length}</p>
              <p className="text-sm text-green-600 font-medium">
                {frameworks.filter(f => (f.compliant / f.requirements) === 1).length} fully compliant
              </p>
            </div>

            {/* Risk Level */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <Activity className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Avg Risk Level</p>
              <p className="text-5xl font-bold text-gray-900 mb-2">{avgRiskLevel.toFixed(0)}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                  style={{ width: `${avgRiskLevel}%` }}
                />
              </div>
            </div>

            {/* Compliance Cost */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Annual Cost</p>
              <p className="text-5xl font-bold text-gray-900 mb-2">${(totalCost / 1000).toFixed(0)}K</p>
              <p className="text-sm text-gray-600">
                ${(totalCost / items.length / 1000).toFixed(1)}K per item
              </p>
            </div>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-500 rounded-lg shadow-md">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-900">{stats.compliant}</p>
                  <p className="text-xs text-green-600 font-medium">Compliant</p>
                </div>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${(stats.compliant / stats.total) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-500 rounded-lg shadow-md">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-900">{stats.pending}</p>
                  <p className="text-xs text-blue-600 font-medium">Pending</p>
                </div>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${(stats.pending / stats.total) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-5 border-2 border-red-200 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-red-500 rounded-lg shadow-md">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-red-900">{stats.overdue}</p>
                  <p className="text-xs text-red-600 font-medium">Overdue</p>
                </div>
              </div>
              <div className="w-full bg-red-200 rounded-full h-2">
                <div
                  className="h-full bg-red-500 rounded-full transition-all"
                  style={{ width: `${(stats.overdue / stats.total) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-5 border-2 border-orange-200 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-orange-500 rounded-lg shadow-md">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-orange-900">{stats.atRisk}</p>
                  <p className="text-xs text-orange-600 font-medium">At Risk</p>
                </div>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-2">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all"
                  style={{ width: `${(stats.atRisk / stats.total) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Risk Metrics */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-purple-600" />
              Risk Metrics & Indicators
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {riskMetrics.map((metric) => {
                const Icon = metric.icon;
                const severityColors = {
                  low: 'from-green-500 to-emerald-500',
                  medium: 'from-yellow-500 to-orange-500',
                  high: 'from-orange-500 to-red-500',
                  critical: 'from-red-500 to-rose-500'
                };
                
                return (
                  <div key={metric.id} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${severityColors[metric.severity]}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex items-center gap-1">
                        {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-red-500" />}
                        {metric.trend === 'down' && <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />}
                        {metric.trend === 'stable' && <Activity className="w-4 h-4 text-gray-500" />}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{metric.name}</p>
                    <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{metric.severity} severity</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Frameworks Overview */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                <Award className="w-6 h-6 text-indigo-600" />
                Compliance Frameworks
              </h3>
              <button 
                onClick={() => setActiveTab('frameworks')}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {frameworks.slice(0, 4).map((framework) => {
                const Icon = framework.icon;
                const percentage = (framework.compliant / framework.requirements) * 100;
                
                return (
                  <div key={framework.id} className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-xl transition-all cursor-pointer">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${framework.gradient} mb-4 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1 text-lg">{framework.name}</h4>
                    <p className="text-xs text-gray-600 mb-4">{framework.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-bold text-gray-900">{framework.compliant}/{framework.requirements}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-full bg-gradient-to-r ${framework.gradient} rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-gray-900">{percentage.toFixed(0)}% Complete</p>
                        {percentage === 100 && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs font-semibold">Certified</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Compliance Items Tab */}
      {activeTab === 'items' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search compliance items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Filters</span>
              </button>
              
              <div className="flex items-center gap-1 bg-white border-2 border-gray-200 rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all shadow-sm ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    selectedCategory === category.id ? 'bg-white bg-opacity-20' : 'bg-gray-100'
                  }`}>
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Items Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const statusConfig = getStatusConfig(item.status);
                const priorityConfig = getPriorityConfig(item.priority);
                const StatusIcon = statusConfig.icon;
                const isOverdue = item.status === 'overdue' || (item.dueDate < new Date() && item.status !== 'compliant');
                
                return (
                  <div
                    key={item.id}
                    className="group relative bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-blue-300 hover:shadow-2xl transition-all cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    {/* Priority Badge */}
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-lg text-xs font-bold ${priorityConfig.bg} ${priorityConfig.text} shadow-sm`}>
                      {priorityConfig.label}
                    </div>

                    {/* Framework Badge */}
                    {item.framework && (
                      <div className="absolute top-4 left-4 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold shadow-sm">
                        {item.framework}
                      </div>
                    )}

                    {/* Status Icon */}
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 mt-8 ${statusConfig.bg} border-2 ${statusConfig.border} group-hover:scale-110 transition-transform shadow-md`}>
                      <StatusIcon className={`w-8 h-8 ${statusConfig.text}`} />
                    </div>

                    {/* Item Info */}
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>

                    {/* Risk Level */}
                    {item.riskLevel && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600 font-medium">Risk Level</span>
                          <span className="font-bold text-gray-900">{item.riskLevel}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-full rounded-full transition-all ${
                              item.riskLevel > 70 ? 'bg-red-500' :
                              item.riskLevel > 50 ? 'bg-orange-500' :
                              item.riskLevel > 30 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${item.riskLevel}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Due Date */}
                    <div className={`flex items-center gap-2 mb-3 p-2 rounded-lg ${
                      isOverdue ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'
                    }`}>
                      <Calendar className={`w-4 h-4 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`} />
                      <span className={`text-sm font-medium ${isOverdue ? 'text-red-700' : 'text-gray-700'}`}>
                        Due: {item.dueDate.toLocaleDateString()}
                      </span>
                    </div>

                    {/* Assigned To */}
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700 font-medium">{item.assignedTo}</span>
                    </div>

                    {/* Cost */}
                    {item.cost && (
                      <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700 font-medium">${item.cost.toLocaleString()}</span>
                      </div>
                    )}

                    {/* Status */}
                    <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold mb-4 ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} shadow-sm`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </div>

                    {/* Documents Count & Actions */}
                    <div className="flex items-center justify-between text-xs text-gray-600 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>{item.documents.length} docs</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ClipboardCheck className="w-3 h-3" />
                          <span>{item.requirements.length} reqs</span>
                        </div>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu
                          id={`grid-item-${item.id}`}
                          onEdit={() => handleEdit(item)}
                          onDuplicate={() => handleDuplicate(item)}
                          onExport={() => handleExport(item)}
                          onShare={() => handleShare(item)}
                          onDelete={() => handleDelete(item)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Item</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Priority</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Risk</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Due Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Assigned</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredItems.map((item) => {
                    const statusConfig = getStatusConfig(item.status);
                    const priorityConfig = getPriorityConfig(item.priority);
                    const StatusIcon = statusConfig.icon;
                    const isOverdue = item.status === 'overdue' || (item.dueDate < new Date() && item.status !== 'compliant');
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusConfig.bg} border ${statusConfig.border}`}>
                              <StatusIcon className={`w-5 h-5 ${statusConfig.text}`} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{item.title}</p>
                              <p className="text-xs text-gray-500">{item.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${priorityConfig.bg} ${priorityConfig.text}`}>
                            {priorityConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-full rounded-full ${
                                  (item.riskLevel || 0) > 70 ? 'bg-red-500' :
                                  (item.riskLevel || 0) > 50 ? 'bg-orange-500' :
                                  (item.riskLevel || 0) > 30 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${item.riskLevel || 0}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{item.riskLevel || 0}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${isOverdue ? 'text-red-700' : 'text-gray-700'}`}>
                            {item.dueDate.toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{item.assignedTo}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem(item);
                              }}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                            </button>
                            <DropdownMenu
                              id={`item-${item.id}`}
                              onEdit={() => handleEdit(item)}
                              onDuplicate={() => handleDuplicate(item)}
                              onExport={() => handleExport(item)}
                              onShare={() => handleShare(item)}
                              onDelete={() => handleDelete(item)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Frameworks Tab */}
      {activeTab === 'frameworks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {frameworks.map((framework) => {
              const Icon = framework.icon;
              const percentage = (framework.compliant / framework.requirements) * 100;
              const daysUntilExpiry = framework.expiryDate ? Math.ceil((framework.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
              
              return (
                <div key={framework.id} className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-2xl transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${framework.gradient} shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    {percentage === 100 && (
                      <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-bold">Certified</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-xl text-gray-900 mb-1">{framework.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{framework.description}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Category</span>
                      <span className="font-semibold text-gray-900">{framework.category}</span>
                    </div>
                    
                    {framework.certificationDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Certified</span>
                        <span className="font-semibold text-gray-900">{framework.certificationDate.toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {framework.expiryDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Expires</span>
                        <span className={`font-semibold ${daysUntilExpiry && daysUntilExpiry < 90 ? 'text-red-600' : 'text-gray-900'}`}>
                          {framework.expiryDate.toLocaleDateString()}
                          {daysUntilExpiry && daysUntilExpiry < 90 && (
                            <span className="ml-1 text-xs">({daysUntilExpiry}d)</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Compliance Progress</span>
                      <span className="font-bold text-gray-900">{framework.compliant}/{framework.requirements}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-full bg-gradient-to-r ${framework.gradient} rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-sm font-bold text-gray-900">{percentage.toFixed(0)}% Complete</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                      View Details
                    </button>
                    <DropdownMenu
                      id={`framework-${framework.id}`}
                      onEdit={() => alert(`Edit Framework: ${framework.name}`)}
                      onExport={() => alert(`Export Framework: ${framework.name}`)}
                      onShare={() => alert(`Share Framework: ${framework.name}`)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Risk Analysis Tab */}
      {activeTab === 'risks' && (
        <div className="space-y-6">
          {/* Risk Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <TrendingUp className="w-6 h-6 opacity-70 rotate-180" />
              </div>
              <p className="text-sm opacity-90 mb-1">High Risk Items</p>
              <p className="text-5xl font-bold mb-2">{items.filter(i => (i.riskLevel || 0) > 70).length}</p>
              <p className="text-sm opacity-80">Require immediate attention</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <Activity className="w-6 h-6 opacity-70" />
              </div>
              <p className="text-sm opacity-90 mb-1">Medium Risk Items</p>
              <p className="text-5xl font-bold mb-2">{items.filter(i => (i.riskLevel || 0) > 40 && (i.riskLevel || 0) <= 70).length}</p>
              <p className="text-sm opacity-80">Monitor closely</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <TrendingUp className="w-6 h-6 opacity-70" />
              </div>
              <p className="text-sm opacity-90 mb-1">Low Risk Items</p>
              <p className="text-5xl font-bold mb-2">{items.filter(i => (i.riskLevel || 0) <= 40).length}</p>
              <p className="text-sm opacity-80">Well managed</p>
            </div>
          </div>

          {/* Risk Metrics Detail */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-purple-600" />
              Detailed Risk Analysis
            </h3>
            <div className="space-y-4">
              {riskMetrics.map((metric) => {
                const Icon = metric.icon;
                const severityColors = {
                  low: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', bar: 'bg-green-500' },
                  medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', bar: 'bg-yellow-500' },
                  high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', bar: 'bg-orange-500' },
                  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', bar: 'bg-red-500' }
                };
                const colors = severityColors[metric.severity];
                
                return (
                  <div key={metric.id} className={`p-5 rounded-xl border-2 ${colors.border} ${colors.bg}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${colors.bar} rounded-lg`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{metric.name}</h4>
                          <p className="text-xs text-gray-600 capitalize">{metric.severity} severity</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                          <p className="text-xs text-gray-600">incidents</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {metric.trend === 'up' && <TrendingUp className="w-5 h-5 text-red-500" />}
                          {metric.trend === 'down' && <TrendingUp className="w-5 h-5 text-green-500 rotate-180" />}
                          {metric.trend === 'stable' && <Activity className="w-5 h-5 text-gray-500" />}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-full ${colors.bar} rounded-full transition-all`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Risk by Category */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
              <PieChart className="w-6 h-6 text-indigo-600" />
              Risk Distribution by Category
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.filter(c => c.id !== 'all').map((category) => {
                const Icon = category.icon;
                const categoryItems = items.filter(i => i.category === category.id);
                const avgRisk = categoryItems.length > 0 
                  ? categoryItems.reduce((sum, item) => sum + (item.riskLevel || 0), 0) / categoryItems.length 
                  : 0;
                
                return (
                  <div key={category.id} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{category.name}</h4>
                        <p className="text-xs text-gray-600">{categoryItems.length} items</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Avg Risk</span>
                        <span className="font-bold text-gray-900">{avgRisk.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-full rounded-full ${
                            avgRisk > 70 ? 'bg-red-500' :
                            avgRisk > 50 ? 'bg-orange-500' :
                            avgRisk > 30 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${avgRisk}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail Tab */}
      {activeTab === 'audits' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-blue-600" />
              Recent Audit Activities
            </h3>
            <div className="space-y-3">
              {[
                { action: 'Completed', item: 'GDPR Data Protection Assessment', user: 'Sarah Johnson', time: '2 hours ago', type: 'success' },
                { action: 'Updated', item: 'ISO 27001 Security Audit', user: 'Mike Chen', time: '5 hours ago', type: 'info' },
                { action: 'Overdue', item: 'Quarterly VAT Return', user: 'System', time: '1 day ago', type: 'error' },
                { action: 'Created', item: 'Environmental Impact Assessment', user: 'Emma Wilson', time: '2 days ago', type: 'success' },
                { action: 'Reviewed', item: 'Data Breach Response Plan', user: 'David Lee', time: '3 days ago', type: 'info' },
                { action: 'Assigned', item: 'Employee Background Checks', user: 'HR Team', time: '4 days ago', type: 'info' },
                { action: 'Certified', item: 'ISO 9001 Quality Management', user: 'BSI Auditor', time: '1 week ago', type: 'success' },
                { action: 'Risk Alert', item: 'PCI DSS Compliance Scan', user: 'Security System', time: '1 week ago', type: 'warning' }
              ].map((log, idx) => {
                const typeConfig = {
                  success: { bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, iconColor: 'text-green-600' },
                  error: { bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, iconColor: 'text-red-600' },
                  warning: { bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertCircle, iconColor: 'text-orange-600' },
                  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: Clock, iconColor: 'text-blue-600' }
                };
                const config = typeConfig[log.type as keyof typeof typeConfig];
                const Icon = config.icon;
                
                return (
                  <div key={idx} className={`p-4 rounded-xl border-2 ${config.border} ${config.bg} hover:shadow-md transition-all`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-2 bg-white rounded-lg ${config.iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{log.action}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-700">{log.item}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{log.user}</span>
                          <span className="text-gray-400">•</span>
                          <Clock className="w-4 h-4" />
                          <span>{log.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => alert(`View details: ${log.item}`)}
                          className="p-2 hover:bg-white rounded-lg transition-colors"
                        >
                          <Eye className="w-5 h-5 text-blue-600" />
                        </button>
                        <DropdownMenu
                          id={`audit-${idx}`}
                          onExport={() => alert(`Export audit log: ${log.item}`)}
                          onShare={() => alert(`Share audit log: ${log.item}`)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Audits */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              Upcoming Audits & Reviews
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.filter(i => i.nextReview).slice(0, 4).map((item) => {
                const daysUntil = item.nextReview ? Math.ceil((item.nextReview.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
                
                return (
                  <div key={item.id} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-xs text-gray-600">{item.framework || item.category}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        daysUntil < 30 ? 'bg-red-100 text-red-700' :
                        daysUntil < 60 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {daysUntil}d
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4" />
                        <span>{item.nextReview?.toLocaleDateString()}</span>
                      </div>
                      {item.auditor && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Users className="w-4 h-4" />
                          <span>{item.auditor}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getStatusConfig(selectedItem.status).bg} border-2 ${getStatusConfig(selectedItem.status).border} shadow-md`}>
                  {React.createElement(getStatusConfig(selectedItem.status).icon, { 
                    className: `w-7 h-7 ${getStatusConfig(selectedItem.status).text}` 
                  })}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedItem.title}</h2>
                  <p className="text-sm text-gray-600">{selectedItem.category} • {selectedItem.framework || 'General'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-5 rounded-xl border-2 ${getStatusConfig(selectedItem.status).bg} ${getStatusConfig(selectedItem.status).border} shadow-sm`}>
                  <div className="flex items-center gap-2 mb-2">
                    {React.createElement(getStatusConfig(selectedItem.status).icon, { 
                      className: `w-6 h-6 ${getStatusConfig(selectedItem.status).text}` 
                    })}
                    <span className={`text-sm font-medium ${getStatusConfig(selectedItem.status).text}`}>Status</span>
                  </div>
                  <p className={`text-3xl font-bold ${getStatusConfig(selectedItem.status).text}`}>
                    {getStatusConfig(selectedItem.status).label}
                  </p>
                </div>

                <div className={`p-5 rounded-xl ${getPriorityConfig(selectedItem.priority).bg} shadow-sm`}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={`w-6 h-6 ${getPriorityConfig(selectedItem.priority).text}`} />
                    <span className={`text-sm font-medium ${getPriorityConfig(selectedItem.priority).text}`}>Priority</span>
                  </div>
                  <p className={`text-3xl font-bold ${getPriorityConfig(selectedItem.priority).text}`}>
                    {getPriorityConfig(selectedItem.priority).label}
                  </p>
                </div>

                {selectedItem.riskLevel && (
                  <div className="p-5 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-6 h-6 text-orange-700" />
                      <span className="text-sm font-medium text-orange-700">Risk Level</span>
                    </div>
                    <p className="text-3xl font-bold text-orange-900 mb-2">{selectedItem.riskLevel}%</p>
                    <div className="w-full bg-orange-200 rounded-full h-2">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${selectedItem.riskLevel}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">{selectedItem.description}</p>
                {selectedItem.impact && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-semibold text-red-900">Impact: {selectedItem.impact}</p>
                  </div>
                )}
              </div>

              {/* Key Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Due Date</p>
                      <p className="font-bold text-gray-900">{selectedItem.dueDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                    <Users className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="text-xs text-purple-600 font-medium">Assigned To</p>
                      <p className="font-bold text-gray-900">{selectedItem.assignedTo}</p>
                    </div>
                  </div>

                  {selectedItem.cost && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                      <DollarSign className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="text-xs text-green-600 font-medium">Estimated Cost</p>
                        <p className="font-bold text-gray-900">${selectedItem.cost.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedItem.jurisdiction && (
                    <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                      <Globe className="w-6 h-6 text-indigo-600" />
                      <div>
                        <p className="text-xs text-indigo-600 font-medium">Jurisdiction</p>
                        <p className="font-bold text-gray-900">{selectedItem.jurisdiction}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
                    <RefreshCw className="w-6 h-6 text-orange-600" />
                    <div>
                      <p className="text-xs text-orange-600 font-medium">Frequency</p>
                      <p className="font-bold text-gray-900 capitalize">{selectedItem.frequency.replace('-', ' ')}</p>
                    </div>
                  </div>

                  {selectedItem.nextReview && (
                    <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-xl border border-cyan-200">
                      <Clock className="w-6 h-6 text-cyan-600" />
                      <div>
                        <p className="text-xs text-cyan-600 font-medium">Next Review</p>
                        <p className="font-bold text-gray-900">{selectedItem.nextReview.toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Audit Information */}
              {(selectedItem.lastAudit || selectedItem.auditor) && (
                <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-purple-600" />
                    Audit Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedItem.lastAudit && (
                      <div>
                        <p className="text-xs text-purple-600 font-medium mb-1">Last Audit</p>
                        <p className="font-semibold text-gray-900">{selectedItem.lastAudit.toLocaleDateString()}</p>
                      </div>
                    )}
                    {selectedItem.auditor && (
                      <div>
                        <p className="text-xs text-purple-600 font-medium mb-1">Auditor</p>
                        <p className="font-semibold text-gray-900">{selectedItem.auditor}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Requirements */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-blue-600" />
                  Requirements Checklist
                </h3>
                <div className="space-y-2">
                  {selectedItem.requirements.map((req, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors">
                      <div className="p-1 bg-blue-500 rounded-md mt-0.5">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-blue-900 font-medium flex-1">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Required Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedItem.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200 hover:bg-green-100 transition-colors cursor-pointer group">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm text-green-900 font-medium flex-1">{doc}</span>
                      <Download className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t-2 border-gray-200">
                <button 
                  onClick={() => handleEdit(selectedItem)}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-5 h-5" />
                  Edit Item
                </button>
                <button 
                  onClick={() => handleMarkComplete(selectedItem)}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark Complete
                </button>
                <button 
                  onClick={() => handleExport(selectedItem)}
                  className="px-6 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-3xl">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Edit3 className="w-6 h-6 text-blue-600" />
                Edit Compliance Item
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                  <select
                    value={editingItem.priority}
                    onChange={(e) => setEditingItem({ ...editingItem, priority: e.target.value as any })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="compliant">Compliant</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                    <option value="at-risk">At Risk</option>
                    <option value="not-applicable">Not Applicable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned To</label>
                <input
                  type="text"
                  value={editingItem.assignedTo}
                  onChange={(e) => setEditingItem({ ...editingItem, assignedTo: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setItems(items.map(i => i.id === editingItem.id ? editingItem : i));
                    setShowEditModal(false);
                    setEditingItem(null);
                    alert(`✓ Updated: ${editingItem.title}`);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && sharingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Share2 className="w-6 h-6 text-green-600" />
                Share Compliance Item
              </h2>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setSharingItem(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="font-semibold text-gray-900 mb-1">{sharingItem.title}</p>
                <p className="text-sm text-gray-600">{sharingItem.category}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Share with (Email)</label>
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message (Optional)</label>
                <textarea
                  placeholder="Add a message..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 rounded" />
                  <span className="text-sm text-gray-700">Allow editing</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 rounded" />
                  <span className="text-sm text-gray-700">Send email notification</span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowShareModal(false);
                    setSharingItem(null);
                    alert(`✓ Shared: ${sharingItem.title}`);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share Now
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/compliance/${sharingItem.id}`);
                    alert('✓ Link copied to clipboard!');
                  }}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  <Link className="w-5 h-5" />
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
