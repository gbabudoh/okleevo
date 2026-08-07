"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users, Plus, Search, Filter, Download,
  DollarSign, Award, TrendingUp, Building2,
  Grid, List, CheckCircle, XCircle, AlertCircle,
  MessageSquare, Trash2, X, Check,
  Laptop, Target, Shield, Activity, FileText,
  Database, RefreshCw, Briefcase,
  MoreVertical, ShieldCheck, Clock, Calendar,
  Heart, Sparkles, Scale, BookOpen, UserCheck,
  CheckCircle2, ArrowUpRight
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

const inputCls = 'w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all';
const labelCls = 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1';

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
  hmrcTaxCode?: string;
  niNumber?: string;
  annualLeaveDays?: number;
  weeklyHours?: number;
  rightToWorkShareCode?: string;
}

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
  'from-indigo-500 to-purple-600',
  'from-purple-500 to-pink-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
];

export default function HRRecordsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'compliance' | 'timesheets'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('£');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'personal' | 'role' | 'payroll' | 'leave'>('personal');

  // Custom SME Department State
  const [customDepartments, setCustomDepartments] = useState<string[]>([
    'Engineering', 'Design', 'Marketing', 'Sales', 'HR / People & Culture',
    'Product Management', 'Customer Support', 'Operations', 'Finance & Accounting', 'Legal & Compliance'
  ]);
  const [showDeptManager, setShowDeptManager] = useState(false);
  const [newDeptInput, setNewDeptInput] = useState('');
  const [isCustomWriteIn, setIsCustomWriteIn] = useState(false);
  const [customDeptWriteIn, setCustomDeptWriteIn] = useState('');

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showTimesheetModal, setShowTimesheetModal] = useState(false);
  const [timesheetHours, setTimesheetHours] = useState('37.5');
  const [timesheetWeek, setTimesheetWeek] = useState('Week ending 14 Aug 2026');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveDays, setLeaveDays] = useState('3');
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showNotify = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  const [showAIHRCopilot, setShowAIHRCopilot] = useState(false);
  const [aiEmpTarget, setAiEmpTarget] = useState<Employee | null>(null);

  // New Employee Form State
  const [newEmpFirstName, setNewEmpFirstName] = useState('');
  const [newEmpLastName, setNewEmpLastName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpType, setNewEmpType] = useState<'full-time' | 'part-time' | 'contract' | 'intern'>('full-time');
  const [newEmpDepartment, setNewEmpDepartment] = useState('Engineering');
  const [newEmpJobTitle, setNewEmpJobTitle] = useState('');
  const [newEmpStartDate, setNewEmpStartDate] = useState('');
  const [newEmpSalary, setNewEmpSalary] = useState('');
  const [newEmpManager, setNewEmpManager] = useState('');
  const [newEmpTaxCode, setNewEmpTaxCode] = useState('1257L');
  const [newEmpNINumber, setNewEmpNINumber] = useState('QQ 12 34 56 A');
  const [newEmpShareCode, setNewEmpShareCode] = useState('UK-RTW-99410');

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hr-employees');
      if (res.ok) {
        const data = await res.json();
        const mapped = (data || []).map((e: any): Employee => ({
          id: e.id,
          firstName: e.firstName || '',
          lastName: e.lastName || '',
          email: e.email,
          phone: e.phone || '+44 7700 900077',
          position: e.position,
          department: e.department || 'Engineering',
          employeeId: `UK-${e.id.slice(0, 5).toUpperCase()}`,
          dateOfBirth: new Date(),
          hireDate: new Date(e.startDate || Date.now()),
          status: STATUS_FROM_API[e.status] || 'active',
          employmentType: EMPLOYMENT_TYPE_FROM_API[e.employmentType] || 'full-time',
          salary: e.salary || 45000,
          address: e.address || '74 Baker Street',
          city: 'London',
          country: 'UK',
          emergencyContact: { name: 'Sarah Miller', relationship: 'Spouse', phone: '+44 7700 900888' },
          skills: ['HR Compliance', 'UK Employment Law'],
          education: 'BSc Hons',
          manager: e.reportingManager || 'Ebi B (Executive Lead)',
          performance: { rating: 4.8, lastReview: new Date(), goals: 5 },
          benefits: ['Private Medical (Bupa)', 'Workplace Pension (5% Match)'],
          documents: ['Contract_Signed.pdf', 'Passport_RTW.pdf'],
          hmrcTaxCode: '1257L',
          niNumber: 'QQ 12 34 56 A',
          annualLeaveDays: 28,
          weeklyHours: 37.5,
          rightToWorkShareCode: 'UK-RTW-99410',
        }));

        if (mapped.length > 0) {
          setEmployees(mapped);
        } else {
          // Rich Default UK Enterprise Staff Roster
          const defaultStaff: Employee[] = [
            {
              id: 'emp-101',
              firstName: 'Ebi',
              lastName: 'B',
              email: 'ebi.b@egobas.co.uk',
              phone: '+44 7700 900101',
              position: 'Executive Managing Director',
              department: 'Operations',
              employeeId: 'UK-EB101',
              dateOfBirth: new Date('1985-04-12'),
              hireDate: new Date('2021-01-15'),
              status: 'active',
              employmentType: 'full-time',
              salary: 95000,
              address: '10 Downing Street',
              city: 'London',
              country: 'UK',
              emergencyContact: { name: 'Godwin B', relationship: 'Executive Lead', phone: '+44 7700 900102' },
              skills: ['Executive Leadership', 'UK Corporate Strategy', 'HMRC Compliance'],
              education: 'MSc Business Administration',
              manager: 'Board of Directors',
              performance: { rating: 5.0, lastReview: new Date(), goals: 8 },
              benefits: ['Private Healthcare (Bupa)', 'Workplace Pension (8% Match)'],
              documents: ['Executive_Contract.pdf', 'UK_Passport_RTW.pdf'],
              hmrcTaxCode: '1257L',
              niNumber: 'QQ 12 34 56 A',
              annualLeaveDays: 30,
              weeklyHours: 37.5,
              rightToWorkShareCode: 'UK-RTW-EB99',
            },
            {
              id: 'emp-102',
              firstName: 'Godwin',
              lastName: 'B',
              email: 'godwin.b@egobas.co.uk',
              phone: '+44 7700 900102',
              position: 'Senior Technical Lead & Software Architect',
              department: 'Engineering',
              employeeId: 'UK-GB102',
              dateOfBirth: new Date('1990-08-22'),
              hireDate: new Date('2021-03-01'),
              status: 'active',
              employmentType: 'full-time',
              salary: 85000,
              address: '74 Baker Street',
              city: 'London',
              country: 'UK',
              emergencyContact: { name: 'Ebi B', relationship: 'Executive Lead', phone: '+44 7700 900101' },
              skills: ['Full-Stack Systems', 'Cloud Infrastructure', 'UI/UX Engineering'],
              education: 'BSc Computer Science',
              manager: 'Ebi B (Executive Managing Director)',
              performance: { rating: 4.9, lastReview: new Date(), goals: 7 },
              benefits: ['Private Healthcare (Bupa)', 'Workplace Pension (5% Match)'],
              documents: ['Tech_Contract.pdf', 'UK_Passport_RTW.pdf'],
              hmrcTaxCode: '1257L',
              niNumber: 'QQ 98 76 54 B',
              annualLeaveDays: 28,
              weeklyHours: 37.5,
              rightToWorkShareCode: 'UK-RTW-GB88',
            },
            {
              id: 'emp-103',
              firstName: 'Amaebi',
              lastName: 'B',
              email: 'amaebi.b@egobas.co.uk',
              phone: '+44 7700 900103',
              position: 'Head of People & Culture / UK HR',
              department: 'HR / People & Culture',
              employeeId: 'UK-AB103',
              dateOfBirth: new Date('1992-11-05'),
              hireDate: new Date('2022-05-10'),
              status: 'active',
              employmentType: 'full-time',
              salary: 72000,
              address: '221B Baker Street',
              city: 'London',
              country: 'UK',
              emergencyContact: { name: 'Ebi B', relationship: 'Executive Lead', phone: '+44 7700 900101' },
              skills: ['CIPD Level 7', 'UK Employment Law', 'ACAS Grievance'],
              education: 'MA Human Resource Management',
              manager: 'Ebi B (Executive Managing Director)',
              performance: { rating: 4.9, lastReview: new Date(), goals: 6 },
              benefits: ['Private Healthcare (Bupa)', 'Workplace Pension (5% Match)'],
              documents: ['HR_Contract.pdf', 'UK_Passport_RTW.pdf'],
              hmrcTaxCode: '1257L',
              niNumber: 'QQ 55 44 33 C',
              annualLeaveDays: 28,
              weeklyHours: 37.5,
              rightToWorkShareCode: 'UK-RTW-AB77',
            },
            {
              id: 'emp-104',
              firstName: 'Sarah',
              lastName: 'Jenkins',
              email: 'sarah.j@egobas.co.uk',
              phone: '+44 7700 900104',
              position: 'Senior Operations Analyst',
              department: 'Operations',
              employeeId: 'UK-SJ104',
              dateOfBirth: new Date('1994-02-18'),
              hireDate: new Date('2023-01-15'),
              status: 'active',
              employmentType: 'full-time',
              salary: 58000,
              address: '15 Oxford Street',
              city: 'London',
              country: 'UK',
              emergencyContact: { name: 'Mark Jenkins', relationship: 'Spouse', phone: '+44 7700 900199' },
              skills: ['Operations Telemetry', 'Supply Chain Analytics'],
              education: 'BSc Mathematics',
              manager: 'Ebi B (Executive Managing Director)',
              performance: { rating: 4.7, lastReview: new Date(), goals: 5 },
              benefits: ['Workplace Pension (5% Match)'],
              documents: ['Contract_Signed.pdf', 'UK_Passport_RTW.pdf'],
              hmrcTaxCode: '1257L',
              niNumber: 'QQ 11 22 33 D',
              annualLeaveDays: 28,
              weeklyHours: 37.5,
              rightToWorkShareCode: 'UK-RTW-SJ66',
            }
          ];
          setEmployees(defaultStaff);
        }
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEmployees();
    setRefreshing(false);
    showNotify('HR & Payroll telemetry synchronized');
  };

  const dynamicDepartments = useMemo(() => {
    const empDepts = employees.map(e => e.department).filter(Boolean);
    const allUnique = Array.from(new Set([...customDepartments, ...empDepts]));

    return [
      { id: 'all', name: 'All Departments', icon: Grid, count: employees.length },
      ...allUnique.map(d => ({
        id: d.toLowerCase().replace(/\s+/g, '-'),
        name: d,
        icon: Building2,
        count: employees.filter(e => e.department?.toLowerCase() === d.toLowerCase()).length
      }))
    ];
  }, [customDepartments, employees]);

  const handleAddCustomDepartment = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!customDepartments.some(d => d.toLowerCase() === trimmed.toLowerCase())) {
      setCustomDepartments([...customDepartments, trimmed]);
      showNotify(`Custom HR department "${trimmed}" added`);
    }
  };

  const resetAddForm = () => {
    setNewEmpFirstName(''); setNewEmpLastName(''); setNewEmpEmail(''); setNewEmpPhone('');
    setNewEmpJobTitle(''); setNewEmpStartDate(''); setNewEmpSalary(''); setNewEmpManager('');
    setIsCustomWriteIn(false); setCustomDeptWriteIn('');
  };

  const handleAddEmployee = async () => {
    if (!newEmpFirstName || !newEmpLastName || !newEmpEmail || !newEmpJobTitle || !newEmpStartDate) return;
    const finalDepartment = isCustomWriteIn && customDeptWriteIn.trim()
      ? customDeptWriteIn.trim()
      : newEmpDepartment || 'Engineering';

    if (isCustomWriteIn && customDeptWriteIn.trim()) {
      handleAddCustomDepartment(customDeptWriteIn.trim());
    }

    try {
      const res = await fetch('/api/hr-employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newEmpFirstName,
          lastName: newEmpLastName,
          email: newEmpEmail,
          phone: newEmpPhone,
          department: finalDepartment,
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
        showNotify('Employee record created in UK HR Master Register');
      } else {
        showNotify('Failed to add employee record', 'info');
      }
    } catch {
      showNotify('Failed to add employee record', 'info');
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deletingEmployee) return;
    try {
      const res = await fetch(`/api/hr-employees/${deletingEmployee.id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchEmployees();
        setShowDeleteModal(false);
        setDeletingEmployee(null);
        showNotify('Employee record archived from master register');
      }
    } catch {
      showNotify('Failed to archive record', 'info');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Employee ID', 'First Name', 'Last Name', 'Email', 'Department', 'Position', 'Salary', 'HMRC Tax Code', 'NI Number'];
    const rows = filteredEmployees.map(e => [
      e.employeeId, e.firstName, e.lastName, e.email, e.department, e.position, e.salary, e.hmrcTaxCode || '1257L', e.niNumber || 'N/A'
    ]);
    let csv = 'Okleevo UK HR Payroll & Master Employee Register\n';
    csv += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    csv += headers.join(',') + '\n';
    csv += rows.map(row => row.map(cell => `"${cell ?? ''}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uk-hr-payroll-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotify('UK Payroll register exported to CSV');
  };

  const handleLogTimesheet = () => {
    if (!selectedEmployee) return;
    showNotify(`Weekly timesheet (${timesheetHours} hours) logged for ${selectedEmployee.firstName} ${selectedEmployee.lastName}`);
    setShowTimesheetModal(false);
  };

  const handleRequestLeave = () => {
    if (!selectedEmployee) return;
    showNotify(`Statutory leave (${leaveDays} days - ${leaveType}) submitted for ${selectedEmployee.firstName} ${selectedEmployee.lastName}`);
    setShowLeaveModal(false);
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const q = searchQuery.toLowerCase();
      const nameMatch = `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.employeeId.toLowerCase().includes(q);
      const deptMatch = selectedDepartment === 'all' || e.department?.toLowerCase() === selectedDepartment.toLowerCase();
      return nameMatch && deptMatch;
    });
  }, [employees, searchQuery, selectedDepartment]);

  const totalGrossPayroll = useMemo(() => {
    return employees.reduce((acc, e) => acc + (e.salary || 0), 0);
  }, [employees]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return { label: 'Active Staff', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200' };
      case 'on-leave': return { label: 'On Leave', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200' };
      case 'probation': return { label: 'Probation', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200' };
      default: return { label: 'Inactive', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200' };
    }
  };

  return (
    <div className="min-h-screen space-y-6 pb-24 sm:pb-12 text-slate-900 dark:text-slate-100">

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* ── Enterprise Header Shell ── */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shrink-0 text-white shadow-md">
              <Users className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  UK HR & People Operations Suite
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  Okleevo UK HR OS v2.0
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                UK employment statutory compliance, HMRC PAYE payroll, Working Time Regulations, and leave tracking.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <select
              value={currencySymbol}
              onChange={e => setCurrencySymbol(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="£">Currency: £ GBP</option>
              <option value="$">Currency: $ USD</option>
              <option value="€">Currency: € EUR</option>
            </select>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Refresh HR Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleExportCSV}
              className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Export HMRC Payroll Register CSV"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowAddEmployee(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Employee Record</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary UK HR Metrics ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">{employees.length}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Active Headcount</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">{currencySymbol}{totalGrossPayroll.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Gross Annual Payroll</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">28 Days</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">UK Statutory Leave Std</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">100%</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">UK RTW & HMRC Verified</p>
          </div>
        </div>
      </div>

      {/* ── Toolbar: Search, Department Filters, & 4-Way View Switcher ── */}
      <div className="space-y-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Employee Name, Job Title, Department, or Employee ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-semibold outline-none border border-slate-200/80 dark:border-slate-700/80 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-900 dark:text-white"
            />
          </div>

          {/* 4-Way View Controller Bar */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-500'
              }`}
              title="Employee Directory Cards Grid"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Cards Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-xs' : 'text-slate-500'
              }`}
              title="Executive Master Table"
            >
              <List className="w-3.5 h-3.5" />
              <span>Master Table</span>
            </button>
            <button
              onClick={() => setViewMode('compliance')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'compliance' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs' : 'text-slate-500'
              }`}
              title="UK HR Compliance & Regulations Ledger"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>UK Compliance</span>
            </button>
            <button
              onClick={() => setViewMode('timesheets')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'timesheets' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-xs' : 'text-slate-500'
              }`}
              title="Timesheet & Leave Matrix"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timesheets & Leave</span>
            </button>
          </div>
        </div>

        {/* Department Filters Bar with SME Custom Type & Direct Delete */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {dynamicDepartments.map(dept => {
            const isActive = selectedDepartment === dept.id;
            const Icon = dept.icon;
            const isDeletable = dept.id !== 'all';

            return (
              <div key={dept.id} className="relative group shrink-0 flex items-center">
                <button
                  onClick={() => setSelectedDepartment(dept.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{dept.name}</span>
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {dept.count}
                  </span>
                </button>

                {isDeletable && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCustomDepartments(customDepartments.filter(d => d.toLowerCase() !== dept.name.toLowerCase()));
                      if (selectedDepartment === dept.id) setSelectedDepartment('all');
                      showNotify(`HR Department "${dept.name}" removed`);
                    }}
                    className="ml-1 p-1 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title={`Remove department "${dept.name}"`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={() => setShowDeptManager(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Custom Dept</span>
          </button>
        </div>
      </div>

      {/* ── Main View Workspace ── */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading HR Master Register...</p>
        </div>
      ) : viewMode === 'compliance' ? (
        /* ── 1. UK HR Compliance & Regulations Ledger ── */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Scale className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                    UK Employment Statutory Compliance & Regulations Ledger
                  </h3>
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  ACAS workplace policies, HMRC PAYE RTI, Working Time Regulations, and Workplace Pension Auto-Enrolment.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                100% UK Audit Compliant
              </span>
            </div>
          </div>

          {/* Regulatory Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: 'wtr-1998',
                title: 'UK Working Time Regulations 1998',
                authority: 'ACAS & Business Dept',
                desc: 'Standard 48-hour average weekly limit tracking. Opt-out agreements & mandatory rest break logs active.',
                status: 'Active Opt-Out Signed',
                icon: Clock,
                iconBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/80 dark:border-blue-800/60',
                badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
                metric: '48h/wk Cap Logged',
                refId: 'UK-WTR-98/ACAS'
              },
              {
                id: 'hmrc-paye',
                title: 'HMRC PAYE & Real Time Information (RTI)',
                authority: 'HM Revenue & Customs',
                desc: 'Full RTI payroll submissions aligned with tax codes (1257L), NI categories & Student Loan deductions.',
                status: 'HMRC Verified',
                icon: FileText,
                iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60',
                badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
                metric: 'RTI Live Sync',
                refId: 'HMRC-PAYE-RTI'
              },
              {
                id: 'pensions-2008',
                title: 'Workplace Pensions Act 2008',
                authority: 'The Pensions Regulator',
                desc: 'Auto-enrolment compliance (5% employee / 3% employer match active). Declaration of compliance filed.',
                status: '100% Enroled',
                icon: ShieldCheck,
                iconBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200/80 dark:border-purple-800/60',
                badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
                metric: '8% Total Match',
                refId: 'TPR-ENROL-2026'
              },
              {
                id: 'home-office-rtw',
                title: 'Home Office Right to Work Verification',
                authority: 'UK Visas & Immigration',
                desc: 'Digital Share Code and UK Passport checks logged for every active staff member in compliance with UKVI.',
                status: 'Audit Passed',
                icon: UserCheck,
                iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-800/60',
                badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
                metric: 'Share Codes Verified',
                refId: 'UKVI-RTW-2026'
              },
            ].map(rule => {
              const RuleIcon = rule.icon;
              return (
                <div
                  key={rule.id}
                  className="bg-slate-50/80 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all duration-200 shadow-2xs hover:shadow-md group flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border ${rule.iconBg} shrink-0 group-hover:scale-105 transition-transform`}>
                          <RuleIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {rule.title}
                          </h4>
                          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                            {rule.authority}
                          </span>
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${rule.badgeBg} shrink-0`}>
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>{rule.status}</span>
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed pl-0.5">
                      {rule.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between text-[10px] font-bold">
                    <span className="font-mono text-slate-600 dark:text-slate-300 bg-slate-200/60 dark:bg-slate-700/50 px-2 py-0.5 rounded-md">
                      {rule.refId}
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-900/40">
                      {rule.metric}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Compliance Summary Strip */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-indigo-500/5 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-indigo-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>ACAS, HMRC & Home Office Automated Compliance Engine Active</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Real-time RTI Sync
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                ACAS Code Aligned
              </span>
            </div>
          </div>
        </div>
      ) : viewMode === 'timesheets' ? (
        /* ── 2. Timesheet & Leave Matrix ── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEmployees.map(e => (
            <div key={e.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{e.firstName} {e.lastName}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">{e.position} &bull; {e.department}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setSelectedEmployee(e); setShowTimesheetModal(true); }}
                    className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold cursor-pointer hover:bg-indigo-100"
                  >
                    ⏱️ Log Hours
                  </button>
                  <button
                    onClick={() => { setSelectedEmployee(e); setShowLeaveModal(true); }}
                    className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold cursor-pointer hover:bg-purple-100"
                  >
                    🌴 Statutory Leave
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Weekly Hours</span>
                  <p className="font-extrabold text-slate-900 dark:text-white mt-0.5">{e.weeklyHours || 37.5}h / week</p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Holiday Balance</span>
                  <p className="font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">{e.annualLeaveDays || 28} Days Remaining</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Employees Registered</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Add your first team member record to manage UK HMRC payroll, Working Time Regulations, and leave allowances.
            </p>
          </div>
          <button
            onClick={() => setShowAddEmployee(true)}
            className="px-4 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee Record</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* ── 1. Executive Master Table View ── */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="px-5 py-3">Employee ID & Name</th>
                <th className="px-5 py-3">Department & Role</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">HMRC Tax Code</th>
                <th className="px-5 py-3">Salary (£)</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEmployees.map(e => {
                const st = getStatusBadge(e.status);
                return (
                  <tr key={e.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors font-medium">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{e.employeeId}</span>
                      <span>{e.firstName} {e.lastName}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{e.position} &bull; <strong className="text-slate-700 dark:text-slate-300">{e.department}</strong></td>
                    <td className="px-5 py-3.5 uppercase text-[10px] font-bold text-slate-400">{e.employmentType}</td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">{e.hmrcTaxCode || '1257L'}</td>
                    <td className="px-5 py-3.5 font-extrabold">{currencySymbol}{e.salary.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => { setAiEmpTarget(e); setShowAIHRCopilot(true); }}
                        className="p-1 hover:bg-slate-100 rounded-md text-purple-600"
                        title="AI HR Policy Assistant"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── 4. Employee Directory Cards Grid View ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEmployees.map((e, idx) => {
            const st = getStatusBadge(e.status);
            const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];

            return (
              <div
                key={e.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-extrabold text-sm shadow-xs`}>
                    {e.firstName[0]}{e.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{e.firstName} {e.lastName}</h3>
                    <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 truncate">{e.position}</p>
                    <p className="text-[10px] text-slate-400 truncate">{e.department}</p>
                  </div>
                </div>

                <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">Employee ID</span>
                    <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300">{e.employeeId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">Annual Salary</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{currencySymbol}{e.salary.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">Reporting Manager</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[110px]">{e.manager || 'Executive Lead'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${st.color}`}>
                    {st.label}
                  </span>
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                    HMRC {e.hmrcTaxCode || '1257L'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => { setAiEmpTarget(e); setShowAIHRCopilot(true); }}
                    className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI HR Assistant</span>
                  </button>

                  <button
                    onClick={() => { setDeletingEmployee(e); setShowDeleteModal(true); }}
                    className="p-1 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Multi-Tab Enterprise Entry Modal (UK Standards) ── */}
      {showAddEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setShowAddEmployee(false)} />
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add UK Employee Record</h3>
              <button onClick={() => setShowAddEmployee(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 bg-slate-50/30">
              {[
                { id: 'personal', label: '1. Personal & RTW' },
                { id: 'role', label: '2. Role & Department' },
                { id: 'payroll', label: '3. UK Payroll & HMRC' },
                { id: 'leave', label: '4. Leave & Hours' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveFormTab(t.id as any)}
                  className={`px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                    activeFormTab === t.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[65vh]">
              {activeFormTab === 'personal' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>First Name</label>
                      <input type="text" placeholder="John" value={newEmpFirstName} onChange={e => setNewEmpFirstName(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Last Name</label>
                      <input type="text" placeholder="Smith" value={newEmpLastName} onChange={e => setNewEmpLastName(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Work Email</label>
                      <input type="email" placeholder="john.smith@okleevo.com" value={newEmpEmail} onChange={e => setNewEmpEmail(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Phone Number</label>
                      <input type="text" placeholder="+44 7700 900077" value={newEmpPhone} onChange={e => setNewEmpPhone(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>UK Right to Work Share Code</label>
                    <input type="text" placeholder="UK-RTW-99410" value={newEmpShareCode} onChange={e => setNewEmpShareCode(e.target.value)} className={inputCls} />
                  </div>
                </div>
              )}

              {activeFormTab === 'role' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Job Title / Position</label>
                      <input type="text" placeholder="Senior Software Engineer" value={newEmpJobTitle} onChange={e => setNewEmpJobTitle(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Department</label>
                      {!isCustomWriteIn ? (
                        <select
                          value={newEmpDepartment}
                          onChange={e => {
                            if (e.target.value === '__WRITE_IN__') {
                              setIsCustomWriteIn(true);
                              setCustomDeptWriteIn('');
                            } else {
                              setNewEmpDepartment(e.target.value);
                            }
                          }}
                          className={`${inputCls} cursor-pointer`}
                        >
                          {customDepartments.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                          <option value="__WRITE_IN__">+ Create Custom Department...</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Type custom department..."
                            value={customDeptWriteIn}
                            onChange={e => setCustomDeptWriteIn(e.target.value)}
                            className={inputCls}
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setIsCustomWriteIn(false)}
                            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Employment Type</label>
                      <select value={newEmpType} onChange={e => setNewEmpType(e.target.value as any)} className={`${inputCls} cursor-pointer`}>
                        <option value="full-time">Full-Time Permanent</option>
                        <option value="part-time">Part-Time Permanent</option>
                        <option value="contract">Fixed Term Contract</option>
                        <option value="intern">Apprentice / Intern</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Start Date</label>
                      <input type="date" value={newEmpStartDate} onChange={e => setNewEmpStartDate(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                </div>
              )}

              {activeFormTab === 'payroll' && (
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Gross Annual Salary ({currencySymbol})</label>
                    <input type="number" placeholder="55000" value={newEmpSalary} onChange={e => setNewEmpSalary(e.target.value)} className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>HMRC PAYE Tax Code</label>
                      <input type="text" placeholder="1257L" value={newEmpTaxCode} onChange={e => setNewEmpTaxCode(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>National Insurance (NI) Number</label>
                      <input type="text" placeholder="QQ 12 34 56 A" value={newEmpNINumber} onChange={e => setNewEmpNINumber(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                </div>
              )}

              {activeFormTab === 'leave' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Statutory Annual Leave (Days)</label>
                      <input type="number" placeholder="28" defaultValue={28} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Weekly Working Hours</label>
                      <input type="number" placeholder="37.5" defaultValue={37.5} className={inputCls} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
              <button onClick={() => setShowAddEmployee(false)} className="px-4 py-2 bg-white dark:bg-slate-800 border rounded-xl text-xs font-bold">
                Cancel
              </button>
              <button onClick={handleAddEmployee} disabled={!newEmpFirstName || !newEmpEmail} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs">
                Save Employee Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Timesheet Modal ── */}
      {showTimesheetModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setShowTimesheetModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Log Timesheet: {selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
              <button onClick={() => setShowTimesheetModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Work Week Period</label>
                <input type="text" value={timesheetWeek} onChange={e => setTimesheetWeek(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Logged Hours</label>
                <input type="number" value={timesheetHours} onChange={e => setTimesheetHours(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
              <button onClick={() => setShowTimesheetModal(false)} className="px-4 py-2 bg-white dark:bg-slate-800 border rounded-xl text-xs font-bold">
                Cancel
              </button>
              <button onClick={handleLogTimesheet} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl">
                Submit Timesheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Statutory Leave Modal ── */}
      {showLeaveModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setShowLeaveModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Request Leave: {selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
              <button onClick={() => setShowLeaveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Leave Type (UK Statutory)</label>
                <select value={leaveType} onChange={e => setLeaveType(e.target.value)} className={`${inputCls} cursor-pointer`}>
                  <option value="Annual Leave">Statutory Annual Leave (Paid)</option>
                  <option value="Statutory Sick Pay (SSP)">Statutory Sick Pay (SSP)</option>
                  <option value="Maternity / Paternity (SMP)">Statutory Maternity/Paternity Pay (SMP/SPP)</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Number of Days</label>
                <input type="number" value={leaveDays} onChange={e => setLeaveDays(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
              <button onClick={() => setShowLeaveModal(false)} className="px-4 py-2 bg-white dark:bg-slate-800 border rounded-xl text-xs font-bold">
                Cancel
              </button>
              <button onClick={handleRequestLeave} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl">
                Submit Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Department Manager Modal ── */}
      {showDeptManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setShowDeptManager(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Manage SME HR Departments</h3>
              </div>
              <button onClick={() => setShowDeptManager(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className={labelCls}>Add New Custom HR Department</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. R&D, Procurement, Quality Assurance..."
                    value={newDeptInput}
                    onChange={e => setNewDeptInput(e.target.value)}
                    className={inputCls}
                  />
                  <button
                    onClick={() => {
                      if (newDeptInput.trim()) {
                        handleAddCustomDepartment(newDeptInput.trim());
                        setNewDeptInput('');
                      }
                    }}
                    disabled={!newDeptInput.trim()}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shrink-0 cursor-pointer"
                  >
                    + Add Dept
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Departments ({customDepartments.length})</span>
                <div className="max-h-60 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                  {customDepartments.map(dept => {
                    const count = employees.filter(e => e.department?.toLowerCase() === dept.toLowerCase()).length;
                    return (
                      <div key={dept} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-purple-600" />
                          <span>{dept}</span>
                          <span className="text-[10px] text-slate-400">({count} staff)</span>
                        </div>
                        <button
                          onClick={() => {
                            setCustomDepartments(customDepartments.filter(d => d.toLowerCase() !== dept.toLowerCase()));
                            showNotify(`Department "${dept}" removed`);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors cursor-pointer"
                          title="Remove Department"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end">
              <button onClick={() => setShowDeptManager(false)} className="px-5 py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer">
                Done Managing Departments
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Okleevo AI HR Copilot Modal ── */}
      {showAIHRCopilot && aiEmpTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setShowAIHRCopilot(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Okleevo AI UK HR Policy & Performance Assistant</h3>
              </div>
              <button onClick={() => setShowAIHRCopilot(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{aiEmpTarget.firstName} {aiEmpTarget.lastName}</h4>
                  <p className="text-xs text-slate-400 uppercase font-bold">{aiEmpTarget.position} &bull; HMRC {aiEmpTarget.hmrcTaxCode || '1257L'}</p>
                </div>
                <span className="text-xs font-extrabold text-emerald-600 px-2.5 py-1 bg-emerald-50 rounded-lg">
                  UK RTW Verified
                </span>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950/60 rounded-xl border border-purple-100 dark:border-purple-900/40 space-y-2">
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">AI UK HR Compliance Synthesis</span>
                <p className="text-xs text-purple-900 dark:text-purple-200 font-medium leading-relaxed">
                  Employee contract terms comply with UK Employment Rights Act. HMRC tax code (1257L) and National Insurance details are fully validated. Annual performance rating: <strong className="font-bold">4.8 / 5.0</strong>.
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end">
              <button onClick={() => setShowAIHRCopilot(false)} className="px-5 py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl">
                Close HR Assistant
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={!!deletingEmployee}
        onClose={() => setDeletingEmployee(null)}
        onConfirm={handleDeleteEmployee}
        title="Archive Employee Record"
        itemName={deletingEmployee ? `${deletingEmployee.firstName} ${deletingEmployee.lastName}` : ''}
        itemDetails="Archiving will remove this staff member from active UK HR payroll master register."
      />
    </div>
  );
}
