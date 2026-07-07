"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Plus, Search, Filter, Download,
  DollarSign, Award, TrendingUp, Building2,
  Grid, List, CheckCircle, XCircle, AlertCircle,
  MessageSquare, Trash2, X,
  Laptop, Target, Shield, Activity, FileText,
  Database, RefreshCw, Briefcase,
  MoreVertical
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  employeeId: string;
  dateOfBirth: Date;
  hireDate: Date;
  status: 'active' | 'on-leave' | 'inactive' | 'probation';
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
  salary: number;
  address: string;
  city: string;
  country: string;
  emergencyContact: { name: string; relationship: string; phone: string };
  skills: string[];
  education: string;
  manager?: string;
  performance: { rating: number; lastReview: Date; goals: number };
  benefits: string[];
  documents: string[];
  notes?: string;
}

const departmentConfigs = [
  { id: 'all',                name: 'All',                              icon: Grid },
  { id: 'engineering',        name: 'Engineering',                      icon: Laptop },
  { id: 'design',             name: 'Design',                           icon: Award },
  { id: 'marketing',          name: 'Marketing',                        icon: Target },
  { id: 'sales',              name: 'Sales',                            icon: TrendingUp },
  { id: 'hr',                 name: 'HR / People & Culture',            icon: Users },
  { id: 'product',            name: 'Product Management',               icon: Briefcase },
  { id: 'customer-support',   name: 'Customer Support / Success',       icon: MessageSquare },
  { id: 'operations',         name: 'Operations',                       icon: RefreshCw },
  { id: 'finance',            name: 'Finance & Accounting',             icon: DollarSign },
  { id: 'it',                 name: 'IT / Infrastructure',              icon: Database },
  { id: 'legal',              name: 'Legal & Compliance',               icon: Shield },
  { id: 'data',               name: 'Data & Analytics',                 icon: Activity },
];

const EMPLOYMENT_TYPE_TO_API: Record<string, string> = {
  'full-time': 'FULL_TIME', 'part-time': 'PART_TIME', 'contract': 'CONTRACT', 'intern': 'INTERN',
};
const EMPLOYMENT_TYPE_FROM_API: Record<string, 'full-time' | 'part-time' | 'contract' | 'intern'> = {
  FULL_TIME: 'full-time', PART_TIME: 'part-time', CONTRACT: 'contract', INTERN: 'intern',
};
const STATUS_FROM_API: Record<string, Employee['status']> = {
  ACTIVE: 'active', ON_LEAVE: 'on-leave', TERMINATED: 'inactive',
};

const AVATAR_GRADIENTS = [
  'from-purple-500 to-pink-600',
  'from-indigo-500 to-violet-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
];

export default function HRRecordsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messagePriority, setMessagePriority] = useState('normal');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [newEmpFirstName, setNewEmpFirstName] = useState('');
  const [newEmpLastName, setNewEmpLastName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpType, setNewEmpType] = useState<'full-time' | 'part-time' | 'contract' | 'intern'>('full-time');
  const [newEmpDepartment, setNewEmpDepartment] = useState('engineering');
  const [newEmpJobTitle, setNewEmpJobTitle] = useState('');
  const [newEmpStartDate, setNewEmpStartDate] = useState('');
  const [newEmpSalary, setNewEmpSalary] = useState('');
  const [newEmpManager, setNewEmpManager] = useState('');

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/hr-employees');
      if (res.ok) {
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = (data || []).map((e: any): Employee => ({
          id: e.id,
          firstName: e.firstName || '',
          lastName: e.lastName || '',
          email: e.email,
          phone: e.phone || '',
          position: e.position,
          department: e.department,
          employeeId: e.id.slice(0, 8).toUpperCase(),
          dateOfBirth: new Date(),
          hireDate: new Date(e.startDate),
          status: STATUS_FROM_API[e.status] || 'active',
          employmentType: EMPLOYMENT_TYPE_FROM_API[e.employmentType] || 'full-time',
          salary: e.salary || 0,
          address: e.address || '',
          city: '',
          country: 'UK',
          emergencyContact: { name: '', relationship: '', phone: '' },
          skills: [],
          education: '',
          manager: e.reportingManager || undefined,
          performance: { rating: 0, lastReview: new Date(), goals: 0 },
          benefits: [],
          documents: [],
        }));
        setEmployees(mapped);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleAddEmployee = async () => {
    if (!newEmpFirstName || !newEmpLastName || !newEmpEmail || !newEmpDepartment || !newEmpJobTitle || !newEmpStartDate) return;
    try {
      const res = await fetch('/api/hr-employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newEmpFirstName,
          lastName: newEmpLastName,
          email: newEmpEmail,
          phone: newEmpPhone,
          department: newEmpDepartment,
          position: newEmpJobTitle,
          startDate: newEmpStartDate,
          salary: newEmpSalary,
          employmentType: EMPLOYMENT_TYPE_TO_API[newEmpType],
          reportingManager: newEmpManager,
        }),
      });
      if (res.ok) {
        await fetchEmployees();
        setShowAddEmployee(false);
        resetAddForm();
        showNotify('Employee added successfully');
      } else {
        const err = await res.json();
        showNotify(err.error || 'Failed to add employee', 'error');
      }
    } catch {
      showNotify('Failed to add employee', 'error');
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deletingEmployee) return;
    try {
      const res = await fetch(`/api/hr-employees/${deletingEmployee.id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchEmployees();
        setSelectedEmployee(null);
        showNotify('Employee removed');
      } else {
        showNotify('Failed to remove employee', 'error');
      }
    } catch {
      showNotify('Failed to remove employee', 'error');
    }
    setShowDeleteModal(false);
    setDeletingEmployee(null);
  };

  const departments = departmentConfigs.map(cat => ({
    ...cat,
    count: cat.id === 'all' ? employees.length : employees.filter(e => e.department === cat.id).length,
  }));

  const showNotify = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === 'all' || emp.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':   return { label: 'Active',    bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
      case 'on-leave': return { label: 'On Leave',  bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' };
      case 'inactive': return { label: 'Inactive',  bg: 'bg-gray-50',    text: 'text-gray-600',    dot: 'bg-gray-400' };
      case 'probation':return { label: 'Probation', bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500' };
      default:         return { label: 'Unknown',   bg: 'bg-gray-50',    text: 'text-gray-600',    dot: 'bg-gray-400' };
    }
  };

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const avgSalary = employees.length > 0 ? employees.reduce((a, e) => a + e.salary, 0) / employees.length : 0;
  const avgRating = employees.length > 0 ? employees.reduce((a, e) => a + e.performance.rating, 0) / employees.length : 0;

  const handleExport = () => {
    showNotify('Generating export…');
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Position', 'Department', 'Employee ID', 'Start Date', 'Status', 'Employment Type', 'Salary', 'Location', 'Performance Rating', 'Manager'];
    const rows = employees.map(e => [e.id, `"${e.firstName}"`, `"${e.lastName}"`, e.email, e.phone, `"${e.position}"`, e.department, e.employeeId, e.hireDate.toISOString().split('T')[0], e.status, e.employmentType, e.salary, `"${e.city}, ${e.country}"`, e.performance.rating, `"${e.manager || ''}"`]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => showNotify('Export downloaded'), 1000);
  };

  const getInitials = (f: string, l: string) => `${f.charAt(0)}${l.charAt(0)}`.toUpperCase();

  const calcTenure = (hireDate: Date) => {
    const years = new Date().getFullYear() - hireDate.getFullYear();
    if (years === 0) return `${new Date().getMonth() - hireDate.getMonth()} mo`;
    return `${years} yr${years > 1 ? 's' : ''}`;
  };

  const resetAddForm = () => {
    setNewEmpFirstName(''); setNewEmpLastName(''); setNewEmpEmail(''); setNewEmpPhone(''); setNewEmpType('full-time');
    setNewEmpDepartment('engineering'); setNewEmpJobTitle(''); setNewEmpStartDate(''); setNewEmpSalary(''); setNewEmpManager('');
  };

  const avatarGradient = (emp: Employee) =>
    AVATAR_GRADIENTS[(emp.firstName.charCodeAt(0) + emp.lastName.charCodeAt(0)) % AVATAR_GRADIENTS.length];

  const inputCls = "w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1.5";
  const modalHeaderCls = "px-5 sm:px-6 py-4 flex items-center justify-between shrink-0 border-b border-gray-100";

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-24 md:pb-10">

      {/* ── Hero ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-none">HR Records</h1>
              <p className="text-gray-500 text-xs sm:text-sm font-medium mt-1.5">Employee management & records</p>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 sm:items-end">
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <button onClick={handleExport} className="p-2.5 bg-white hover:bg-gray-50 rounded-xl transition-all border border-gray-200 cursor-pointer" title="Export">
                <Download className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <button onClick={() => setShowAddEmployee(true)} className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl px-5 py-2.5 active:scale-95 transition-all w-full sm:w-auto cursor-pointer">
              <Plus className="w-4 h-4" />Add Employee
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Staff',   value: totalEmployees,              sub: `${activeEmployees} active`, icon: Users,     color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Avg Salary',    value: `£${(avgSalary/1000).toFixed(0)}K`, sub: 'per year',        icon: DollarSign, color: 'text-emerald-600',bg: 'bg-emerald-50' },
          { label: 'Avg Rating',    value: avgRating.toFixed(1),        sub: 'performance',              icon: Award,     color: 'text-amber-600',  bg: 'bg-amber-50' },
          { label: 'Departments',   value: departments.length - 1,      sub: 'active units',             icon: Building2, color: 'text-blue-600',   bg: 'bg-blue-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider truncate">{s.label}</p>
              <p className="text-lg font-bold text-gray-900 leading-tight">{s.value}</p>
              <p className="text-[9px] font-semibold text-gray-400 truncate">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search + Filter + View ── */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by name, email or ID…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" />
        </div>
        <button className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-black text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-all cursor-pointer">
          <Filter className="w-4 h-4" /><span className="hidden sm:inline">Filter</span>
        </button>
        <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-0.5">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}><Grid className="w-4 h-4" /></button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}><List className="w-4 h-4" /></button>
        </div>
      </div>

      {/* ── Department Pills ── */}
      <div className="relative">
        <div className="-mx-4 sm:mx-0 flex items-center gap-2 overflow-x-auto px-4 sm:px-0 pb-2 custom-scrollbar-x">
          {departments.map(dept => {
            const Icon = dept.icon;
            const isActive = selectedDepartment === dept.id;
            return (
              <button key={dept.id} onClick={() => setSelectedDepartment(dept.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wide whitespace-nowrap shrink-0 transition-all cursor-pointer border ${isActive ? 'bg-gray-900 border-gray-900 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-purple-400 hover:text-purple-600'}`}>
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{dept.name}</span>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>{dept.count}</span>
              </button>
            );
          })}
        </div>
        <div className="pointer-events-none absolute right-0 top-0 h-[calc(100%-8px)] w-16 bg-linear-to-l from-slate-50 to-transparent" />
      </div>

      {/* ── Grid View ── */}
      {viewMode === 'grid' ? (
        filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-gray-100">
            <Users className="w-10 h-10 text-gray-200" />
            <p className="text-sm font-bold text-gray-400">No employees yet</p>
            <button onClick={() => setShowAddEmployee(true)} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-purple-700 transition-all cursor-pointer">
              <Plus className="w-3.5 h-3.5" />Add First Employee
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredEmployees.map(emp => {
              const gradient = avatarGradient(emp);
              const sc = getStatusConfig(emp.status);
              return (
                <div key={emp.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-gray-100 transition-all group">
                  <div className="flex items-start gap-4 p-4 pb-3">
                    <div className="relative shrink-0">
                      <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${gradient} flex items-center justify-center text-white text-xl font-black shadow-md`}>
                        {getInitials(emp.firstName, emp.lastName)}
                      </div>
                      <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 ${sc.dot} border-2 border-white rounded-full shadow-sm`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="text-base font-black text-gray-900 truncate leading-tight group-hover:text-purple-700 transition-colors">
                          {emp.firstName} {emp.lastName}
                        </h3>
                        <div className="relative shrink-0">
                          <button onClick={e => { e.stopPropagation(); setActiveMenu(activeMenu === emp.id ? null : emp.id); }}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-all cursor-pointer">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                          {activeMenu === emp.id && (
                            <>
                              <div className="fixed inset-0 z-60" onClick={() => setActiveMenu(null)} />
                              <div className="absolute right-0 top-8 z-70 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1">
                                <button onClick={e => { e.stopPropagation(); setSelectedEmployee(emp); setShowDetailModal(true); setActiveMenu(null); }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">
                                  <FileText className="w-3.5 h-3.5 text-gray-400" />View Profile
                                </button>
                                <button onClick={e => { e.stopPropagation(); setSelectedEmployee(emp); setShowMessageModal(true); setActiveMenu(null); }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">
                                  <MessageSquare className="w-3.5 h-3.5 text-gray-400" />Message
                                </button>
                                <div className="my-1 border-t border-gray-100" />
                                <button onClick={e => { e.stopPropagation(); setDeletingEmployee(emp); setShowDeleteModal(true); setActiveMenu(null); }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 cursor-pointer">
                                  <Trash2 className="w-3.5 h-3.5" />Remove
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide truncate mt-0.5">{emp.position}</p>
                      <span className={`inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                      </span>
                    </div>
                  </div>

                  {/* Performance bar */}
                  <div className="px-4 pb-3">
                    <div className="flex items-center justify-between text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                      <span>Performance</span><span className="text-gray-700">{emp.performance.rating}/5.0</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-linear-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${(emp.performance.rating / 5) * 100}%` }} />
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="px-4 pb-3 flex items-center gap-2">
                    {[
                      { label: 'Tenure', value: calcTenure(emp.hireDate) },
                      { label: 'Dept',   value: emp.department },
                      { label: 'Type',   value: emp.employmentType.replace('-', ' ') },
                    ].map(s => (
                      <div key={s.label} className="flex-1 bg-gray-50 rounded-xl px-2.5 py-2">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider">{s.label}</p>
                        <p className="text-[10px] font-black text-gray-900 mt-0.5 truncate capitalize">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 px-4 pb-4">
                    <button onClick={() => { setSelectedEmployee(emp); setShowDetailModal(true); }}
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-purple-50 hover:bg-purple-600 text-purple-600 hover:text-white rounded-xl transition-all active:scale-95 cursor-pointer text-[9px] font-black uppercase tracking-wide">
                      <FileText className="w-3.5 h-3.5" />Profile
                    </button>
                    <button onClick={() => { setSelectedEmployee(emp); setShowMessageModal(true); }}
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-pink-50 hover:bg-pink-600 text-pink-600 hover:text-white rounded-xl transition-all active:scale-95 cursor-pointer text-[9px] font-black uppercase tracking-wide">
                      <MessageSquare className="w-3.5 h-3.5" />Message
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* ── List View ── */
        filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-gray-100">
            <Users className="w-10 h-10 text-gray-200" />
            <p className="text-sm font-bold text-gray-400">No employees yet</p>
            <button onClick={() => setShowAddEmployee(true)} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-purple-700 transition-all cursor-pointer">
              <Plus className="w-3.5 h-3.5" />Add First Employee
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto hide-scrollbar">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-gray-900">
                    {['Employee', 'Role', 'Status', 'Contact', 'Performance', 'Actions'].map((h, i) => (
                      <th key={h} className={`px-5 py-3.5 text-[9px] font-black text-gray-400 uppercase tracking-widest ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredEmployees.map(emp => {
                    const gradient = avatarGradient(emp);
                    const sc = getStatusConfig(emp.status);
                    return (
                      <tr key={emp.id} className="hover:bg-purple-50/30 transition-colors cursor-pointer" onClick={() => { setSelectedEmployee(emp); setShowDetailModal(true); }}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${gradient} flex items-center justify-center text-white text-xs font-black shrink-0`}>
                              {getInitials(emp.firstName, emp.lastName)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900 leading-tight">{emp.firstName} {emp.lastName}</p>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">{emp.employeeId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-gray-900">{emp.position}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide capitalize">{emp.department}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${sc.bg} ${sc.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-xs font-bold text-gray-900">{emp.email}</p>
                          <p className="text-[10px] text-gray-400">{emp.phone}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full w-16 overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(emp.performance.rating / 5) * 100}%` }} />
                            </div>
                            <span className="text-xs font-black text-gray-700">{emp.performance.rating}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={e => { e.stopPropagation(); setSelectedEmployee(emp); setShowMessageModal(true); }}
                              className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-all cursor-pointer">
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={e => { e.stopPropagation(); setDeletingEmployee(emp); setShowDeleteModal(true); }}
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

      {/* ── Employee Detail Modal ── */}
      {showDetailModal && selectedEmployee && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 sm:pl-0 md:pl-64">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
          <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0"><div className="w-10 h-1 bg-gray-200 rounded-full" /></div>
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${avatarGradient(selectedEmployee)} flex items-center justify-center text-white text-lg font-black shadow-md`}>
                  {getInitials(selectedEmployee.firstName, selectedEmployee.lastName)}
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900">{selectedEmployee.firstName} {selectedEmployee.lastName}</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{selectedEmployee.position}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { ...getStatusConfig(selectedEmployee.status), value: getStatusConfig(selectedEmployee.status).label },
                ].map(s => (
                  <span key="status" className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${s.bg} ${s.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
                  </span>
                ))}
                <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-[9px] font-black uppercase tracking-wider text-gray-600 capitalize">
                  {selectedEmployee.employmentType.replace('-', ' ')}
                </span>
                <span className="px-2.5 py-1 bg-purple-50 rounded-lg text-[9px] font-black uppercase tracking-wider text-purple-600 capitalize">
                  {selectedEmployee.department}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-50 rounded-2xl p-4">
                  <p className="text-[9px] font-black text-purple-400 uppercase tracking-wider mb-1">Salary</p>
                  <p className="text-xl font-black text-purple-900">£{(selectedEmployee.salary / 1000).toFixed(0)}K</p>
                </div>
                <div className="bg-pink-50 rounded-2xl p-4">
                  <p className="text-[9px] font-black text-pink-400 uppercase tracking-wider mb-1">Rating</p>
                  <p className="text-xl font-black text-pink-900">{selectedEmployee.performance.rating}/5.0</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[9px] font-black text-gray-400 uppercase tracking-wider mb-2">
                  <span>Performance</span><span>{selectedEmployee.performance.goals} goals pending</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-linear-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${(selectedEmployee.performance.rating / 5) * 100}%` }} />
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 grid grid-cols-2 gap-y-4 gap-x-3">
                {[
                  { label: 'Email',       value: selectedEmployee.email },
                  { label: 'Phone',       value: selectedEmployee.phone },
                  { label: 'Employee ID', value: selectedEmployee.employeeId },
                  { label: 'Manager',     value: selectedEmployee.manager || '—' },
                  { label: 'Location',    value: `${selectedEmployee.city}, ${selectedEmployee.country}` },
                  { label: 'Joined',      value: selectedEmployee.hireDate.toLocaleDateString() },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                    <p className="text-xs font-bold text-gray-900 break-all">{item.value}</p>
                  </div>
                ))}
              </div>

              {selectedEmployee.skills.length > 0 && (
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEmployee.skills.map(skill => (
                      <span key={skill} className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex items-center gap-3 shrink-0">
              <button onClick={() => { setShowDetailModal(false); setShowMessageModal(true); }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-purple-700 transition-all cursor-pointer">
                <MessageSquare className="w-4 h-4" />Message
              </button>
              <button onClick={() => { setDeletingEmployee(selectedEmployee); setShowDetailModal(false); setShowDeleteModal(true); }}
                className="p-3 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-all cursor-pointer">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Employee Modal ── */}
      {showAddEmployee && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 sm:pl-0 md:pl-64">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => { setShowAddEmployee(false); resetAddForm(); }} />
          <div className="relative w-full sm:max-w-lg bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className={modalHeaderCls}>
              <div>
                <h2 className="text-sm sm:text-lg font-bold text-gray-900 tracking-tight">Add employee</h2>
                <p className="text-[11px] text-gray-500 font-medium">Add a new team member</p>
              </div>
              <button onClick={() => { setShowAddEmployee(false); resetAddForm(); }} className="p-2.5 hover:bg-gray-100 rounded-xl transition-all cursor-pointer text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2.5">Personal info</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelCls}>First name *</label><input type="text" value={newEmpFirstName} onChange={e => setNewEmpFirstName(e.target.value)} placeholder="Sarah" className={inputCls} /></div>
                    <div><label className={labelCls}>Last name *</label><input type="text" value={newEmpLastName} onChange={e => setNewEmpLastName(e.target.value)} placeholder="Johnson" className={inputCls} /></div>
                  </div>
                  <div><label className={labelCls}>Email *</label><input type="email" value={newEmpEmail} onChange={e => setNewEmpEmail(e.target.value)} placeholder="sarah@company.com" className={inputCls} /></div>
                  <div><label className={labelCls}>Phone</label><input type="tel" value={newEmpPhone} onChange={e => setNewEmpPhone(e.target.value)} placeholder="+44 7911 123456" className={inputCls} /></div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2.5">Role & department</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Department *</label>
                      <select value={newEmpDepartment} onChange={e => setNewEmpDepartment(e.target.value)} className={inputCls}>{departmentConfigs.filter(d => d.id !== 'all').map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
                    </div>
                    <div><label className={labelCls}>Job title *</label><input type="text" value={newEmpJobTitle} onChange={e => setNewEmpJobTitle(e.target.value)} placeholder="Senior Developer" className={inputCls} /></div>
                  </div>
                  <div>
                    <label className={labelCls}>Employment type</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['full-time', 'part-time', 'contract', 'intern'] as const).map(t => (
                        <button key={t} type="button" onClick={() => setNewEmpType(t)}
                          className={`py-2 rounded-xl text-[10px] font-semibold capitalize transition-all cursor-pointer border ${newEmpType === t ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-purple-300'}`}>
                          {t.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2.5">Administrative</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>Start date *</label><input type="date" value={newEmpStartDate} onChange={e => setNewEmpStartDate(e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Base salary (£)</label><input type="number" value={newEmpSalary} onChange={e => setNewEmpSalary(e.target.value)} placeholder="35000" className={inputCls} /></div>
                  <div className="col-span-2"><label className={labelCls}>Reporting manager</label><input type="text" value={newEmpManager} onChange={e => setNewEmpManager(e.target.value)} placeholder="e.g. Jane Smith" className={inputCls} /></div>
                </div>
              </div>

              <p className="text-[11px] text-gray-400">Fields marked * are required.</p>
            </div>

            <div className="shrink-0 bg-white border-t border-gray-100 px-5 sm:px-6 py-3 flex flex-row gap-2.5 pb-[calc(1.25rem+env(safe-area-inset-bottom,12px))] sm:pb-3">
              <button type="button" onClick={() => { setShowAddEmployee(false); resetAddForm(); }}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer active:scale-[0.98]">
                Cancel
              </button>
              <button type="button" onClick={handleAddEmployee}
                className="flex-2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">
                <CheckCircle className="w-4 h-4" /> Add employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Message Modal ── */}
      {showMessageModal && selectedEmployee && (
        <div className="fixed inset-0 z-110 flex items-end sm:items-center justify-center p-0 sm:p-4 sm:pl-0 md:pl-64">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowMessageModal(false)} />
          <div className="relative w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0"><div className="w-10 h-1 bg-gray-200 rounded-full" /></div>
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="text-[10px] font-black text-purple-500 uppercase tracking-wider mb-0.5">To: {selectedEmployee.firstName} {selectedEmployee.lastName}</p>
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-purple-500" />Send Message</h2>
              </div>
              <button onClick={() => setShowMessageModal(false)} className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {['normal', 'high', 'critical'].map(p => (
                    <button key={p} onClick={() => setMessagePriority(p)}
                      className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${messagePriority === p ? (p === 'critical' ? 'bg-red-500 text-white' : 'bg-purple-600 text-white') : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Subject</label>
                <input type="text" value={messageSubject} onChange={e => setMessageSubject(e.target.value)} placeholder="Message subject…" className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Message</label>
                <textarea rows={5} value={messageBody} onChange={e => setMessageBody(e.target.value)} placeholder="Write your message…"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all resize-none" />
              </div>
            </div>
            <div className="px-5 sm:px-6 py-4 border-t border-gray-100 shrink-0">
              <button disabled={!messageSubject || !messageBody}
                onClick={() => { showNotify(`Message sent to ${selectedEmployee.firstName}`); setShowMessageModal(false); setMessageSubject(''); setMessageBody(''); }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-purple-700 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                <MessageSquare className="w-4 h-4" />Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {deletingEmployee && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeletingEmployee(null); }}
          onConfirm={handleDeleteEmployee}
          title="Remove Employee"
          itemName={`${deletingEmployee.firstName} ${deletingEmployee.lastName}`}
          itemDetails={`${deletingEmployee.position} — ${deletingEmployee.department}`}
          warningMessage="This will permanently remove this employee record."
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
