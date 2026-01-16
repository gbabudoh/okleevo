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

const auditLogs: AuditLog[] = [
  { action: 'Completed', item: 'GDPR Data Protection Assessment', user: 'Sarah Johnson', time: '2 hours ago', type: 'success' },
  { action: 'Updated', item: 'ISO 27001 Security Audit', user: 'Mike Chen', time: '5 hours ago', type: 'info' },
  { action: 'Overdue', item: 'Quarterly VAT Return', user: 'System', time: '1 day ago', type: 'error' },
  { action: 'Created', item: 'Environmental Impact Assessment', user: 'Emma Wilson', time: '2 days ago', type: 'success' },
  { action: 'Reviewed', item: 'Data Breach Response Plan', user: 'David Lee', time: '3 days ago', type: 'info' },
  { action: 'Assigned', item: 'Employee Background Checks', user: 'HR Team', time: '4 days ago', type: 'info' },
  { action: 'Certified', item: 'ISO 9001 Quality Management', user: 'BSI Auditor', time: '1 week ago', type: 'success' },
  { action: 'Risk Alert', item: 'PCI DSS Compliance Scan', user: 'Security System', time: '1 week ago', type: 'warning' }
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
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'PDF' | 'Excel' | 'CSV'>('PDF');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const showNotification = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 4000);
  };

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
      // eslint-disable-next-line
      id: Math.random().toString(36).substr(2, 9),
      title: `${item.title} (Copy)`,
    };
    setItems([...items, newItem]);
    showNotification(`✓ Duplicated: ${item.title}`);
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
    showNotification(`✓ Exported: ${item.title}`);
  };

  const handleShare = (item: ComplianceItem) => {
    setSharingItem(item);
    setShowShareModal(true);
  };

  const handleDelete = (item: ComplianceItem) => {
    if (confirm(`⚠️ Are you sure you want to delete "${item.title}"?\n\nThis action cannot be undone.`)) {
      setItems(items.filter(i => i.id !== item.id));
      showNotification(`✓ Deleted: ${item.title}`);
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
    showNotification(`✓ Marked as complete: ${item.title}`);
  };

  const handleGenerateReport = () => {
    // Collect data based on exportFormat
    const reportData = items.map(item => ({
      Title: item.title,
      Status: item.status,
      Priority: item.priority,
      DueDate: item.dueDate.toLocaleDateString(),
      Category: item.category,
      Framework: item.framework || 'N/A',
      Description: item.description
    }));

    let content = '';
    let mimeType = '';
    let extension = '';

    if (exportFormat === 'CSV' || exportFormat === 'Excel') {
      const headers = Object.keys(reportData[0]).join(',');
      const rows = reportData.map(row => Object.values(row).map(v => `"${v}"`).join(','));
      content = [headers, ...rows].join('\n');
      mimeType = exportFormat === 'CSV' ? 'text/csv' : 'application/vnd.ms-excel';
      extension = exportFormat === 'CSV' ? 'csv' : 'xls';

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compliance_report_${new Date().toISOString().split('T')[0]}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'PDF') {
      // Professional PDF Generation
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59); // gray-900
      doc.text("Compliance Center Report", 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // gray-500
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Total Items: ${items.length}`, 14, 35);
      
      doc.setDrawColor(226, 232, 240); // gray-200
      doc.line(14, 40, 196, 40);
      
      // Content
      let yOffset = 50;
      reportData.forEach((item, index) => {
        if (yOffset > 270) {
          doc.addPage();
          yOffset = 20;
        }
        
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "bold");
        doc.text(`${index + 1}. ${item.Title}`, 14, yOffset);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105); // gray-600
        doc.text(`Status: ${item.Status} | Priority: ${item.Priority} | Due: ${item.DueDate}`, 14, yOffset + 6);
        doc.text(`Category: ${item.Category} | Framework: ${item.Framework}`, 14, yOffset + 11);
        
        const descriptionLines = doc.splitTextToSize(item.Description, 170);
        doc.text(descriptionLines, 14, yOffset + 16);
        
        yOffset += 22 + (descriptionLines.length * 5);
      });
      
      doc.save(`compliance_report_${new Date().toISOString().split('T')[0]}.pdf`);
    }

    setShowExportModal(false);
    showNotification(`✓ ${exportFormat} report generated and download started!`);
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
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" 
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
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                    setOpenDropdown(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left cursor-pointer"
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
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left cursor-pointer"
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
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors text-left cursor-pointer"
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
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors text-left cursor-pointer"
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
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left cursor-pointer"
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
    <div className="min-h-screen bg-gray-50/50 p-6 pb-24 space-y-8 font-sans text-gray-900">
      {/* Premium Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100 p-6 rounded-[2rem] shadow-sm sticky top-4 z-40 transition-all duration-300">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
               <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-lg transition-all duration-300 group-hover:bg-blue-500/30"></div>
                  <div className="relative p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg border border-white/20 group-hover:scale-105 transition-transform duration-300 ring-4 ring-blue-50/50">
                     <Shield className="w-8 h-8 text-white" />
                  </div>
               </div>
               <div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                     Compliance <span className="text-gray-300 font-light">|</span> <span className="text-blue-600">Center</span>
                  </h1>
                  <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                     Regulatory Assurance System Active
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-3">
               <button className="h-12 w-12 flex items-center justify-center bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group relative cursor-pointer">
                  <Bell className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
                  <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
               </button>
               
               <button 
                  onClick={() => setShowExportModal(true)}
                  className="h-12 px-5 flex items-center gap-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm font-bold text-sm text-gray-600 cursor-pointer"
               >
                  <Download className="w-4 h-4" />
                  <span>Export Report</span>
               </button>

               <button
                  onClick={() => setShowAddItem(true)}
                  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-bold text-sm flex items-center gap-2 cursor-pointer"
               >
                  <Plus className="w-5 h-5" />
                  <span>New Compliance Item</span>
               </button>
            </div>
         </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-md rounded-[20px] p-2 border border-gray-100 flex items-center justify-between gap-2 overflow-x-auto shadow-sm sticky top-32 z-30">
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
                onClick={() => setActiveTab(tab.id as 'overview' | 'items' | 'frameworks' | 'risks' | 'audits')}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 relative overflow-hidden group cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white shadow-lg scale-100'
                    : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-md'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-500'} transition-colors`} />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl"></div>
                )}
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
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                     <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform duration-500">
                        <Shield className="w-6 h-6 text-white" />
                     </div>
                     <span className="flex items-center gap-1 text-xs font-bold bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                        <TrendingUp className="w-3 h-3" />
                        +5.2%
                     </span>
                  </div>
                  <div>
                     <p className="text-sm font-medium text-blue-100 mb-1 tracking-wide">Compliance Score</p>
                     <h3 className="text-4xl font-black text-white tracking-tight">{complianceRate}%</h3>
                  </div>
               </div>
            </div>

            {/* Total Frameworks */}
            <div 
              onClick={() => setActiveTab('frameworks')}
              className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
            >
               <div className="flex items-center justify-between mb-8">
                  <div className="p-3 bg-purple-50 rounded-2xl group-hover:bg-purple-100 transition-colors duration-300">
                     <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-purple-500 transition-colors" />
               </div>
               <div>
                  <p className="text-sm font-bold text-gray-500 mb-1 tracking-wide uppercase text-[10px]">Active Frameworks</p>
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-2">{frameworks.length}</h3>
                  <p className="text-xs font-medium text-green-600 bg-green-50 inline-block px-2 py-1 rounded-lg">
                     {frameworks.filter(f => (f.compliant / f.requirements) === 1).length} fully compliant
                  </p>
               </div>
            </div>

            {/* Risk Level */}
            <div 
              onClick={() => setActiveTab('risks')}
              className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
            >
               <div className="flex items-center justify-between mb-8">
                  <div className="p-3 bg-red-50 rounded-2xl group-hover:bg-red-100 transition-colors duration-300">
                     <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <Activity className="w-5 h-5 text-gray-300 group-hover:text-red-500 transition-colors" />
               </div>
               <div>
                  <p className="text-sm font-bold text-gray-500 mb-1 tracking-wide uppercase text-[10px]">Avg Risk Level</p>
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-3">{avgRiskLevel.toFixed(0)}</h3>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                     <div
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                        style={{ width: `${avgRiskLevel}%` }}
                     />
                  </div>
               </div>
            </div>

            {/* Compliance Cost */}
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
               <div className="flex items-center justify-between mb-8">
                  <div className="p-3 bg-emerald-50 rounded-2xl group-hover:bg-emerald-100 transition-colors duration-300">
                     <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
               </div>
               <div>
                  <p className="text-sm font-bold text-gray-500 mb-1 tracking-wide uppercase text-[10px]">Annual Cost</p>
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-2">${(totalCost / 1000).toFixed(0)}K</h3>
                  <p className="text-xs text-gray-400 font-medium">
                     ${(totalCost / items.length / 1000).toFixed(1)}K per item
                  </p>
               </div>
            </div>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="p-3 bg-green-50 rounded-2xl group-hover:bg-green-100 transition-colors">
                     <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-right">
                     <p className="text-4xl font-black text-gray-900 tracking-tight">{stats.compliant}</p>
                     <p className="text-xs font-bold text-green-600 uppercase tracking-widest mt-1">Compliant</p>
                  </div>
               </div>
               <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                     className="h-full bg-green-500 rounded-full transition-all duration-500 group-hover:shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                     style={{ width: `${(stats.compliant / stats.total) * 100}%` }}
                  />
               </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
                     <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-right">
                     <p className="text-4xl font-black text-gray-900 tracking-tight">{stats.pending}</p>
                     <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">Pending</p>
                  </div>
               </div>
               <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                     className="h-full bg-blue-500 rounded-full transition-all duration-500 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                     style={{ width: `${(stats.pending / stats.total) * 100}%` }}
                  />
               </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="p-3 bg-red-50 rounded-2xl group-hover:bg-red-100 transition-colors">
                     <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="text-right">
                     <p className="text-4xl font-black text-gray-900 tracking-tight">{stats.overdue}</p>
                     <p className="text-xs font-bold text-red-600 uppercase tracking-widest mt-1">Overdue</p>
                  </div>
               </div>
               <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                     className="h-full bg-red-500 rounded-full transition-all duration-500 group-hover:shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                     style={{ width: `${(stats.overdue / stats.total) * 100}%` }}
                  />
               </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="p-3 bg-orange-50 rounded-2xl group-hover:bg-orange-100 transition-colors">
                     <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-right">
                     <p className="text-4xl font-black text-gray-900 tracking-tight">{stats.atRisk}</p>
                     <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mt-1">At Risk</p>
                  </div>
               </div>
               <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                     className="h-full bg-orange-500 rounded-full transition-all duration-500 group-hover:shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                     style={{ width: `${(stats.atRisk / stats.total) * 100}%` }}
                  />
               </div>
            </div>
          </div>

          {/* Risk Metrics */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h3 className="font-black text-xl text-gray-900 mb-8 flex items-center gap-2">
               <div className="p-2 bg-purple-50 rounded-xl">
                  <Activity className="w-5 h-5 text-purple-600" />
               </div>
               Risk Metrics & Indicators
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {riskMetrics.map((metric) => {
                const Icon = metric.icon;
                const severityColors = {
                  low: 'bg-green-50 text-green-600 border-green-100',
                  medium: 'bg-yellow-50 text-yellow-600 border-yellow-100',
                  high: 'bg-orange-50 text-orange-600 border-orange-100',
                  critical: 'bg-red-50 text-red-600 border-red-100'
                };
                
                return (
                  <div key={metric.id} className="p-6 bg-white rounded-[2rem] border border-gray-100 hover:border-blue-100 hover:shadow-xl transition-all group cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-2xl ${severityColors[metric.severity]} border`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                        {metric.trend === 'up' && <TrendingUp className="w-3 h-3 text-red-500" />}
                        {metric.trend === 'down' && <TrendingUp className="w-3 h-3 text-green-500 rotate-180" />}
                        {metric.trend === 'stable' && <Activity className="w-3 h-3 text-gray-400" />}
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-500 mb-1">{metric.name}</p>
                    <p className="text-3xl font-black text-gray-900 mb-2">{metric.value}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                     <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        metric.severity === 'critical' ? 'bg-red-500' :
                        metric.severity === 'high' ? 'bg-orange-500' :
                        metric.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                     }`}></span>
                     {metric.severity} severity
                    </p>
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
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer"
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
              <button className="px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm cursor-pointer">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Filters</span>
              </button>
              
              <div className="flex items-center gap-1 bg-white border-2 border-gray-200 rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
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
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all shadow-sm cursor-pointer ${
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
                    className="group relative bg-white rounded-[2.5rem] border border-gray-100 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                     <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Priority Badge */}
                    <div className={`absolute top-6 right-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${priorityConfig.bg} ${priorityConfig.text} shadow-sm z-10`}>
                      {priorityConfig.label}
                    </div>

                    {/* Framework Badge */}
                    {item.framework && (
                      <div className="absolute top-6 left-6 px-4 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm z-10 flex items-center gap-1.5">
                        <Shield className="w-3 h-3" />
                        {item.framework}
                      </div>
                    )}

                    {/* Status Icon */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mt-10 ${statusConfig.bg} border ${statusConfig.border} group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10`}>
                      <StatusIcon className={`w-8 h-8 ${statusConfig.text}`} />
                    </div>

                    {/* Item Info */}
                    <div className="relative z-10">
                       <h3 className="font-black text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 tracking-tight">
                         {item.title}
                       </h3>
                       
                       <p className="text-sm font-medium text-gray-500 mb-6 line-clamp-2 leading-relaxed">{item.description}</p>
   
                       {/* Risk Level */}
                       {item.riskLevel && (
                         <div className="mb-6 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group-hover:bg-white group-hover:border-blue-100 transition-colors">
                           <div className="flex items-center justify-between text-xs mb-2">
                             <span className="text-gray-500 font-bold uppercase tracking-wider">Risk Level</span>
                             <span className="font-black text-gray-900">{item.riskLevel}%</span>
                           </div>
                           <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                             <div
                               className={`h-full rounded-full transition-all duration-500 ${
                                 item.riskLevel > 70 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                                 item.riskLevel > 50 ? 'bg-orange-500' :
                                 item.riskLevel > 30 ? 'bg-yellow-500' : 'bg-green-500'
                               }`}
                               style={{ width: `${item.riskLevel}%` }}
                             />
                           </div>
                         </div>
                       )}
   
                       {/* Meta Grid */}
                       <div className="grid grid-cols-2 gap-3 mb-6">
                           <div className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                              isOverdue ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100 group-hover:bg-white group-hover:border-gray-200'
                           }`}>
                              <Calendar className={`w-4 h-4 ${isOverdue ? 'text-red-600' : 'text-gray-400'}`} />
                              <div className="flex flex-col">
                                 <span className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-0.5">Due Date</span>
                                 <span className={`text-xs font-bold ${isOverdue ? 'text-red-700' : 'text-gray-700'}`}>
                                    {item.dueDate.toLocaleDateString()}
                                 </span>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 group-hover:bg-white group-hover:border-gray-200 transition-colors">
                              <Users className="w-4 h-4 text-gray-400" />
                              <div className="flex flex-col">
                                 <span className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-0.5">Assigned</span>
                                 <span className="text-xs font-bold text-gray-700 truncate">{item.assignedTo}</span>
                              </div>
                           </div>
                       </div>
   
                       {/* Footer Actions */}
                       <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                             <StatusIcon className="w-3 h-3" />
                             {statusConfig.label}
                          </div>
   
                          <div onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                             <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1">
                                <button onClick={() => handleEdit(item)} className="p-1.5 hover:bg-gray-50 rounded-md text-gray-500 hover:text-blue-600 transition-colors tooltip cursor-pointer" title="Edit">
                                   <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleShare(item)} className="p-1.5 hover:bg-gray-50 rounded-md text-gray-500 hover:text-green-600 transition-colors tooltip cursor-pointer" title="Share">
                                   <Share2 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDelete(item)} className="p-1.5 hover:bg-gray-50 rounded-md text-gray-500 hover:text-red-600 transition-colors tooltip cursor-pointer" title="Delete">
                                   <Trash2 className="w-3.5 h-3.5" />
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
               {/* List View Header */}
               <div className="grid grid-cols-12 gap-4 px-8 py-3 bg-gray-100/50 rounded-xl text-xs font-bold text-gray-500 uppercase tracking-widest border border-gray-200/50">
                  <div className="col-span-4">Item Details</div>
                  <div className="col-span-2">Priority</div>
                  <div className="col-span-2">Risk Status</div>
                  <div className="col-span-2">Due Date</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1 text-right">Actions</div>
               </div>

               {/* List Items */}
               <div className="space-y-3">
                  {filteredItems.map((item) => {
                     const statusConfig = getStatusConfig(item.status);
                     const priorityConfig = getPriorityConfig(item.priority);
                     const StatusIcon = statusConfig.icon;
                     const isOverdue = item.status === 'overdue' || (item.dueDate < new Date() && item.status !== 'compliant');
                     
                     return (
                        <div 
                           key={item.id} 
                           onClick={() => setSelectedItem(item)}
                           className={`group grid grid-cols-12 gap-4 items-center bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-x-1 transition-all duration-300 cursor-pointer relative ${openDropdown === `list-item-${item.id}` ? 'z-50' : ''}`}
                        >
                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem]"></div>
                           
                           <div className="col-span-4 relative">
                              <div className="flex items-center gap-4">
                                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusConfig.bg} border ${statusConfig.border} shadow-sm group-hover:scale-105 transition-transform`}>
                                    <StatusIcon className={`w-6 h-6 ${statusConfig.text}`} />
                                 </div>
                                 <div>
                                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                       <span className="text-xs font-medium text-gray-500">{item.category}</span>
                                       {item.framework && (
                                          <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                                             {item.framework}
                                          </span>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="col-span-2 relative">
                              <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${priorityConfig.bg} ${priorityConfig.text} shadow-sm`}>
                                 {priorityConfig.label}
                              </span>
                           </div>

                           <div className="col-span-2 relative">
                              <div className="flex flex-col gap-1.5">
                                 <div className="flex items-center justify-between text-[10px] font-bold">
                                    <span className="text-gray-500">Risk Level</span>
                                    <span className={item.riskLevel && item.riskLevel > 50 ? 'text-red-600' : 'text-gray-900'}>{item.riskLevel || 0}%</span>
                                 </div>
                                 <div className="w-24 bg-gray-100 rounded-full h-1.5">
                                    <div
                                       className={`h-full rounded-full ${
                                          (item.riskLevel || 0) > 70 ? 'bg-red-500' :
                                          (item.riskLevel || 0) > 50 ? 'bg-orange-500' :
                                          (item.riskLevel || 0) > 30 ? 'bg-yellow-500' : 'bg-green-500'
                                       }`}
                                       style={{ width: `${item.riskLevel || 0}%` }}
                                    />
                                 </div>
                              </div>
                           </div>

                           <div className="col-span-2 relative">
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border w-fit ${isOverdue ? 'bg-red-50 border-red-100 text-red-700' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                                 <Calendar className="w-3.5 h-3.5" />
                                 <span className="text-xs font-bold">{item.dueDate.toLocaleDateString()}</span>
                              </div>
                           </div>

                           <div className="col-span-1 relative">
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                                 {statusConfig.icon === CheckCircle && <CheckCircle className="w-3 h-3" />}
                                 {statusConfig.label}
                              </div>
                           </div>

                           <div className="col-span-1 relative text-right">
                              <div onClick={(e) => e.stopPropagation()} className="inline-block">
                                 <DropdownMenu
                                    id={`list-item-${item.id}`}
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
                <div key={framework.id} className={`bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-2xl transition-all relative ${openDropdown === `framework-${framework.id}` ? 'z-50' : ''}`}>
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
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all cursor-pointer">
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
              {auditLogs.map((log, idx) => {
                const typeConfig = {
                  success: { bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, iconColor: 'text-green-600' },
                  error: { bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, iconColor: 'text-red-600' },
                  warning: { bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertCircle, iconColor: 'text-orange-600' },
                  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: Clock, iconColor: 'text-blue-600' }
                };
                const config = typeConfig[log.type as keyof typeof typeConfig];
                const Icon = config.icon;
                
                return (
                  <div key={idx} className={`p-4 rounded-xl border-2 ${config.border} ${config.bg} hover:shadow-md transition-all relative ${openDropdown === `audit-${idx}` ? 'z-50' : ''}`}>
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
                          className="p-2 hover:bg-white rounded-lg transition-colors cursor-pointer"
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
                  <div key={item.id} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-lg transition-all cursor-pointer">
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

      {/* Item Detail Modal - Compact & Centered */}
      {selectedItem && (
         <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in zoom-in-95 duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden border border-gray-100">
               <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                  <div className="flex items-center gap-4">
                     <div className={`p-4 rounded-2xl flex items-center justify-center ${getStatusConfig(selectedItem.status).bg} border-2 ${getStatusConfig(selectedItem.status).border} shadow-lg shadow-gray-200`}>
                        {React.createElement(getStatusConfig(selectedItem.status).icon, { 
                           className: `w-8 h-8 ${getStatusConfig(selectedItem.status).text}` 
                        })}
                     </div>
                     <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{selectedItem.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedItem.category}</span>
                           <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedItem.framework || 'General'}</span>
                        </div>
                     </div>
                  </div>
                  <button onClick={() => setSelectedItem(null)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer group">
                     <X className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
                  </button>
               </div>
            
               <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                     <div className={`p-6 rounded-[2rem] border-2 ${getStatusConfig(selectedItem.status).bg} ${getStatusConfig(selectedItem.status).border} shadow-sm group hover:scale-[1.02] transition-transform`}>
                        <div className="flex items-center gap-2 mb-3">
                           {React.createElement(getStatusConfig(selectedItem.status).icon, { 
                              className: `w-5 h-5 ${getStatusConfig(selectedItem.status).text}` 
                           })}
                           <span className={`text-xs font-black uppercase tracking-widest ${getStatusConfig(selectedItem.status).text}`}>Status</span>
                        </div>
                        <p className={`text-2xl font-black ${getStatusConfig(selectedItem.status).text}`}>
                           {getStatusConfig(selectedItem.status).label}
                        </p>
                     </div>

                     <div className={`p-6 rounded-[2rem] ${getPriorityConfig(selectedItem.priority).bg} shadow-sm group hover:scale-[1.02] transition-transform`}>
                        <div className="flex items-center gap-2 mb-3">
                           <AlertTriangle className={`w-5 h-5 ${getPriorityConfig(selectedItem.priority).text}`} />
                           <span className={`text-xs font-black uppercase tracking-widest ${getPriorityConfig(selectedItem.priority).text}`}>Priority</span>
                        </div>
                        <p className={`text-2xl font-black ${getPriorityConfig(selectedItem.priority).text}`}>
                           {getPriorityConfig(selectedItem.priority).label}
                        </p>
                     </div>

                     {selectedItem.riskLevel && (
                        <div className="p-6 rounded-[2rem] bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 shadow-sm group hover:scale-[1.02] transition-transform">
                           <div className="flex items-center gap-2 mb-3">
                              <Activity className="w-5 h-5 text-orange-600" />
                              <span className="text-xs font-black uppercase tracking-widest text-orange-600">Risk Level</span>
                           </div>
                           <p className="text-2xl font-black text-orange-900 mb-2">{selectedItem.riskLevel}%</p>
                           <div className="w-full bg-orange-200/50 rounded-full h-1.5 overflow-hidden">
                              <div
                                 className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                                 style={{ width: `${selectedItem.riskLevel}%` }}
                              />
                           </div>
                        </div>
                     )}
                  </div>

                  <div className="space-y-6">
                     <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                           <FileText className="w-5 h-5 text-blue-500" />
                           Compliance Details
                        </h3>
                        <p className="text-gray-600 leading-relaxed font-medium">{selectedItem.description}</p>
                        {selectedItem.impact && (
                           <div className="mt-4 p-4 bg-red-50/50 border border-red-100 rounded-2xl flex items-start gap-3">
                              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                              <div>
                                 <span className="text-xs font-black text-red-600 uppercase tracking-widest block mb-1">Impact Analysis</span>
                                 <p className="text-sm font-medium text-red-800">{selectedItem.impact}</p>
                              </div>
                           </div>
                        )}
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm h-full">
                           <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-widest">
                              <Calendar className="w-4 h-4 text-purple-500" /> Key Dates
                           </h3>
                           <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                 <span className="text-sm text-gray-500 font-medium">Due Date</span>
                                 <span className="text-sm font-bold text-gray-900">{selectedItem.dueDate.toLocaleDateString()}</span>
                              </div>
                              {selectedItem.nextReview && (
                                 <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <span className="text-sm text-gray-500 font-medium">Next Review</span>
                                    <span className="text-sm font-bold text-gray-900">{selectedItem.nextReview.toLocaleDateString()}</span>
                                 </div>
                              )}
                              {selectedItem.lastAudit && (
                                 <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <span className="text-sm text-gray-500 font-medium">Last Audit</span>
                                    <span className="text-sm font-bold text-gray-900">{selectedItem.lastAudit.toLocaleDateString()}</span>
                                 </div>
                              )}
                           </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm h-full">
                           <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-widest">
                              <Users className="w-4 h-4 text-green-500" /> Responsibility
                           </h3>
                           <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                 <span className="text-sm text-gray-500 font-medium">Assigned To</span>
                                 <span className="text-sm font-bold text-gray-900">{selectedItem.assignedTo}</span>
                              </div>
                              {selectedItem.auditor && (
                                 <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <span className="text-sm text-gray-500 font-medium">Auditor</span>
                                    <span className="text-sm font-bold text-gray-900">{selectedItem.auditor}</span>
                                 </div>
                              )}
                              {selectedItem.jurisdiction && (
                                 <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <span className="text-sm text-gray-500 font-medium">Jurisdiction</span>
                                    <span className="text-sm font-bold text-gray-900">{selectedItem.jurisdiction}</span>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>

                  </div>
               </div>

               <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 sticky bottom-0 z-20">
                   <button 
                     onClick={() => {
                        handleMarkComplete(selectedItem);
                        setSelectedItem(null);
                     }}
                     className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                   >
                     <CheckCircle className="w-4 h-4" />
                     Mark Compliant
                   </button>
                   <button 
                     onClick={() => {
                        handleEdit(selectedItem);
                        setSelectedItem(null);
                     }}
                     className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                   >
                     <Edit3 className="w-4 h-4" />
                     Edit Item
                   </button>
               </div>
            </div>
         </div>
      )}

      {/* Edit Modal - Compact & Centered */}
      {showEditModal && editingItem && (
         <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in zoom-in-95 duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden border border-gray-100">
               <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                  <div>
                     <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Edit3 className="w-6 h-6 text-blue-600" />
                        Edit Compliance Item
                     </h2>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 pl-9">Update details for {editingItem.title}</p>
                  </div>
                  <button onClick={() => setShowEditModal(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer group">
                     <X className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/50">
                  <div className="space-y-6">
                     <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="space-y-6">
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Item Title</label>
                              <input 
                                 type="text" 
                                 value={editingItem.title} 
                                 onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} 
                                 className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-bold focus:border-blue-500 focus:outline-none transition-colors" 
                              />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Description</label>
                              <textarea 
                                 value={editingItem.description} 
                                 onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} 
                                 rows={3}
                                 className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-medium focus:border-blue-500 focus:outline-none transition-colors resize-none" 
                              />
                           </div>
                           <div className="grid grid-cols-2 gap-6">
                              <div>
                                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Category</label>
                                 <select 
                                    value={editingItem.category} 
                                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })} 
                                    className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-bold focus:border-blue-500 focus:outline-none transition-colors appearance-none"
                                 >
                                    {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                 </select>
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Status</label>
                                 <select 
                                    value={editingItem.status} 
                                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as ComplianceItem['status'] })} 
                                    className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-bold focus:border-blue-500 focus:outline-none transition-colors appearance-none"
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
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Assigned To</label>
                              <input 
                                 type="text" 
                                 value={editingItem.assignedTo} 
                                 onChange={(e) => setEditingItem({ ...editingItem, assignedTo: e.target.value })} 
                                 className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-bold focus:border-blue-500 focus:outline-none transition-colors" 
                              />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 sticky bottom-0 z-20">
                  <button onClick={() => setShowEditModal(false)} className="px-6 py-3 rounded-xl text-gray-400 hover:text-gray-900 font-bold transition-all text-sm cursor-pointer hover:bg-gray-100">Cancel</button>
                  <button 
                     onClick={() => {
                        setItems(items.map(i => i.id === editingItem.id ? editingItem : i));
                        setShowEditModal(false);
                        setEditingItem(null);
                        showNotification(`✓ Updated: ${editingItem.title}`);
                     }} 
                     className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
                  >
                     Save Changes
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Share Modal - Compact & Centered */}
      {showShareModal && sharingItem && (
         <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in zoom-in-95 duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl relative overflow-hidden border border-gray-100">
               <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                  <div>
                     <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Share2 className="w-6 h-6 text-green-600" />
                        Share Item
                     </h2>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 pl-9">Collaborate with team</p>
                  </div>
                  <button onClick={() => setShowShareModal(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer group">
                     <X className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
                  </button>
               </div>
               
               <div className="p-8 space-y-6">
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                     <p className="font-bold text-gray-900 mb-1">{sharingItem.title}</p>
                     <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{sharingItem.category}</p>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Share with (Email)</label>
                     <input 
                        type="email" 
                        placeholder="colleague@company.com" 
                        className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-bold focus:border-green-500 focus:outline-none transition-colors" 
                     />
                  </div>
                  
                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Message</label>
                     <textarea 
                        placeholder="Add a message..." 
                        rows={3}
                        className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-medium focus:border-green-500 focus:outline-none transition-colors resize-none" 
                     />
                  </div>

                  <div className="space-y-3">
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-green-600 rounded-lg border-2 border-gray-200 focus:ring-green-500 cursor-pointer" />
                        <span className="text-sm font-bold text-gray-700 group-hover:text-green-700 transition-colors">Allow editing</span>
                     </label>
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-green-600 rounded-lg border-2 border-gray-200 focus:ring-green-500 cursor-pointer" />
                        <span className="text-sm font-bold text-gray-700 group-hover:text-green-700 transition-colors">Send notification</span>
                     </label>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                     <button 
                        onClick={() => {
                           setShowShareModal(false);
                           setSharingItem(null);
                           showNotification(`✓ Shared: ${sharingItem.title}`);
                        }} 
                        className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                     >
                        <Share2 className="w-5 h-5" />
                        Share Now
                     </button>
                     <button 
                        onClick={() => {
                           navigator.clipboard.writeText(`${window.location.origin}/compliance/${sharingItem.id}`);
                           showNotification('✓ Link copied!');
                        }} 
                        className="px-6 py-3 border-2 border-gray-100 hover:border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-2"
                     >
                        <Link className="w-5 h-5" />
                        Copy Link
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Add Item Modal - Compact & Centered */}
      {showAddItem && (
         <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in zoom-in-95 duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden border border-gray-100">
               <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                  <div>
                     <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Plus className="w-6 h-6 text-blue-600" />
                        New Compliance Item
                     </h2>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 pl-9">Add item to regulatory tracking</p>
                  </div>
                  <button onClick={() => setShowAddItem(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer group">
                     <X className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/50">
                  <div className="space-y-6">
                     <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="space-y-6">
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Item Title</label>
                              <input type="text" className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-bold focus:border-blue-500 focus:outline-none transition-colors" placeholder="e.g. Annual Audit" />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Description</label>
                              <textarea rows={3} className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-medium focus:border-blue-500 focus:outline-none transition-colors resize-none" placeholder="Enter details..." />
                           </div>
                           <div className="grid grid-cols-2 gap-6">
                              <div>
                                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Category</label>
                                 <select className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-bold focus:border-blue-500 focus:outline-none transition-colors appearance-none">
                                    {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                 </select>
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Priority</label>
                                 <select className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-4 text-gray-900 font-bold focus:border-blue-500 focus:outline-none transition-colors appearance-none">
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                 </select>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 sticky bottom-0 z-20">
                  <button onClick={() => setShowAddItem(false)} className="px-6 py-3 rounded-xl text-gray-400 hover:text-gray-900 font-bold transition-all text-sm cursor-pointer hover:bg-gray-100">Cancel</button>
                  <button onClick={() => { showNotification('✓ Added Successfully'); setShowAddItem(false); }} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-95 cursor-pointer">
                     Create Item
                  </button>
               </div>
            </div>
         </div>
      )}
      
      {/* Export Report Modal */}
      {showExportModal && (
         <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in zoom-in-95 duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl relative overflow-hidden border border-gray-100">
               <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                  <div>
                     <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Download className="w-6 h-6 text-indigo-600" />
                        Export Report
                     </h2>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 pl-9">Generate compliance documentation</p>
                  </div>
                  <button onClick={() => setShowExportModal(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer group">
                     <X className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
                  </button>
               </div>
               
               <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar bg-gray-50/30">
                  {/* Format Selection - Card Based */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Report Format</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: 'PDF', icon: FileText, label: 'Standard PDF', desc: 'Secure & Ready' },
                        { id: 'Excel', icon: FileSpreadsheet, label: 'Excel Sheet', desc: 'Data Analysis' },
                        { id: 'CSV', icon: FileSpreadsheet, label: 'CSV Format', desc: 'System Import' }
                      ].map((format) => (
                        <button 
                          key={format.id} 
                          onClick={() => setExportFormat(format.id as 'PDF' | 'Excel' | 'CSV')}
                          className={`group p-4 rounded-[2rem] border-2 transition-all duration-300 text-left relative overflow-hidden cursor-pointer ${
                            exportFormat === format.id 
                              ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-500/10 scale-[1.02]' 
                              : 'border-white bg-white/60 hover:border-gray-200 hover:bg-white'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-500 group-hover:scale-110 ${
                            exportFormat === format.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            <format.icon className="w-6 h-6" />
                          </div>
                          <h4 className={`font-black text-sm mb-1 ${exportFormat === format.id ? 'text-gray-900' : 'text-gray-500'}`}>{format.id}</h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{format.desc}</p>
                          {exportFormat === format.id && (
                            <div className="absolute top-4 right-4 animate-in zoom-in-0 duration-300">
                              <CheckCircle className="w-4 h-4 text-indigo-600" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scope Selection */}
                  <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-sm ring-1 ring-black/[0.03]">
                    <div className="flex items-center gap-3 mb-4">
                       <div className="p-2 bg-indigo-50 rounded-xl">
                          <Activity className="w-4 h-4 text-indigo-600" />
                       </div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Report Scope</label>
                    </div>
                    <select className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-gray-900 font-black text-sm focus:border-indigo-600 focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer">
                      <option value="all">Full Compliance Inventory (All Active Modules)</option>
                      <option value="summary">Executive Summary (Critical KPI Data)</option>
                      <option value="critical">Critical Vulnerability Report (High Alert Only)</option>
                    </select>
                  </div>

                  {/* Include Sections - Mini Cards */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                       <div className="p-2 bg-purple-50 rounded-xl">
                          <PieChart className="w-4 h-4 text-purple-600" />
                       </div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Augment Sections</label>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'risk', label: 'Risk Analysis Vectors', icon: AlertTriangle, color: 'text-orange-500' },
                        { id: 'audit', label: 'Historical Audit Trail', icon: FileCheck, color: 'text-blue-500' },
                        { id: 'framework', label: 'Framework Compliance Status', icon: Award, color: 'text-purple-500' }
                      ].map((section) => (
                        <label key={section.id} className="flex items-center justify-between p-4 bg-white/60 hover:bg-white border-2 border-transparent hover:border-indigo-100 rounded-2xl transition-all cursor-pointer group shadow-sm">
                            <div className="flex items-center gap-4">
                               <div className={`p-2 rounded-xl bg-gray-50 group-hover:bg-indigo-50 transition-colors`}>
                                  <section.icon className={`w-4 h-4 ${section.color}`} />
                               </div>
                               <span className="text-sm font-black text-gray-700 group-hover:text-gray-900">{section.label}</span>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                               <input type="checkbox" defaultChecked className="sr-only peer" />
                               <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                     <button onClick={() => setShowExportModal(false)} className="flex-1 px-6 py-4 rounded-2xl text-gray-500 hover:text-gray-900 font-bold transition-all text-sm cursor-pointer hover:bg-white border-2 border-transparent hover:border-gray-100">Decline</button>
                     <button 
                        onClick={handleGenerateReport} 
                        className="flex-[2] px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 group"
                     >
                        <Download className="w-5 h-5 group-hover:animate-bounce" />
                        Initiate Node Export
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}

    {showSuccess && (
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-5 fade-in duration-500">
        <div className="bg-gray-900/90 backdrop-blur-2xl border border-white/20 px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-5 ring-4 ring-black/5">
          <div className="relative">
             <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse"></div>
             <div className="relative w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <CheckCircle className="w-7 h-7 text-white" />
             </div>
          </div>
          <div>
            <p className="text-white font-black text-sm tracking-tight leading-none mb-1.5 uppercase">Success Protocol Active</p>
            <p className="text-gray-300 text-xs font-bold">{successMessage}</p>
          </div>
          <button 
            onClick={() => setShowSuccess(false)}
            className="ml-4 p-2 hover:bg-white/10 rounded-xl transition-colors group cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-500 group-hover:text-white" />
          </button>
        </div>
      </div>
    )}
    </div>
  );
}
