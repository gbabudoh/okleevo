"use client";

import React, { useState } from 'react';
import { 
  Users, Plus, Search, Filter, Download, Upload,
  DollarSign, Award, TrendingUp, Zap, Building2,
  Grid, List, CheckCircle, XCircle, AlertCircle, Clock,
  Mail, MessageSquare, Trash2, Eye, X,
  Laptop, Target, Shield, Activity, FileText
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
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
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  skills: string[];
  education: string;
  manager?: string;
  performance: {
    rating: number;
    lastReview: Date;
    goals: number;
  };
  benefits: string[];
  documents: string[];
  notes?: string;
}

const departments = [
  { id: 'all', name: 'All Departments', icon: Grid, count: 24 },
  { id: 'engineering', name: 'Engineering', icon: Laptop, count: 8 },
  { id: 'design', name: 'Design', icon: Award, count: 5 },
  { id: 'marketing', name: 'Marketing', icon: Target, count: 4 },
  { id: 'sales', name: 'Sales', icon: TrendingUp, count: 4 },
  { id: 'hr', name: 'Human Resources', icon: Users, count: 3 },
];

export default function HRRecordsPage() {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@company.com',
      phone: '+1 (555) 123-4567',
      position: 'Senior Software Engineer',
      department: 'engineering',
      employeeId: 'EMP-2021-001',
      dateOfBirth: new Date('1990-05-15'),
      hireDate: new Date('2021-03-01'),
      status: 'active',
      employmentType: 'full-time',
      salary: 95000,
      address: '123 Tech Street',
      city: 'San Francisco',
      country: 'USA',
      emergencyContact: {
        name: 'John Johnson',
        relationship: 'Spouse',
        phone: '+1 (555) 123-4568'
      },
      skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
      education: 'BS Computer Science',
      manager: 'Sarah Williams',
      performance: {
        rating: 4.8,
        lastReview: new Date('2024-11-01'),
        goals: 5
      },
      benefits: ['Health Insurance', '401k', 'Remote Work', 'Gym Membership'],
      documents: ['Contract', 'NDA', 'Tax Forms', 'Resume']
    },
    {
      id: '2',
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob.smith@company.com',
      phone: '+1 (555) 234-5678',
      position: 'Lead Product Designer',
      department: 'design',
      employeeId: 'EMP-2020-045',
      dateOfBirth: new Date('1988-08-22'),
      hireDate: new Date('2020-06-15'),
      status: 'active',
      employmentType: 'full-time',
      salary: 88000,
      address: '456 Design Avenue',
      city: 'New York',
      country: 'USA',
      emergencyContact: {
        name: 'Mary Smith',
        relationship: 'Mother',
        phone: '+1 (555) 234-5679'
      },
      skills: ['Figma', 'Adobe XD', 'UI/UX', 'Prototyping'],
      education: 'BA Graphic Design',
      manager: 'Jennifer Lee',
      performance: {
        rating: 4.6,
        lastReview: new Date('2024-10-15'),
        goals: 4
      },
      benefits: ['Health Insurance', '401k', 'Design Tools Budget'],
      documents: ['Contract', 'Portfolio', 'Tax Forms']
    },
    {
      id: '3',
      firstName: 'Carol',
      lastName: 'Martinez',
      email: 'carol.martinez@company.com',
      phone: '+1 (555) 345-6789',
      position: 'Marketing Manager',
      department: 'marketing',
      employeeId: 'EMP-2019-023',
      dateOfBirth: new Date('1985-12-10'),
      hireDate: new Date('2019-09-01'),
      status: 'active',
      employmentType: 'full-time',
      salary: 92000,
      address: '789 Marketing Blvd',
      city: 'Los Angeles',
      country: 'USA',
      emergencyContact: {
        name: 'Carlos Martinez',
        relationship: 'Brother',
        phone: '+1 (555) 345-6790'
      },
      skills: ['SEO', 'Content Strategy', 'Analytics', 'Social Media'],
      education: 'MBA Marketing',
      manager: 'David Chen',
      performance: {
        rating: 4.9,
        lastReview: new Date('2024-11-20'),
        goals: 6
      },
      benefits: ['Health Insurance', '401k', 'Remote Work', 'Professional Development'],
      documents: ['Contract', 'Certifications', 'Tax Forms']
    },
    {
      id: '4',
      firstName: 'David',
      lastName: 'Lee',
      email: 'david.lee@company.com',
      phone: '+1 (555) 456-7890',
      position: 'Junior Developer',
      department: 'engineering',
      employeeId: 'EMP-2024-089',
      dateOfBirth: new Date('1998-03-25'),
      hireDate: new Date('2024-08-01'),
      status: 'probation',
      employmentType: 'full-time',
      salary: 65000,
      address: '321 Code Lane',
      city: 'Austin',
      country: 'USA',
      emergencyContact: {
        name: 'Susan Lee',
        relationship: 'Mother',
        phone: '+1 (555) 456-7891'
      },
      skills: ['JavaScript', 'Python', 'Git', 'SQL'],
      education: 'BS Software Engineering',
      manager: 'Alice Johnson',
      performance: {
        rating: 4.2,
        lastReview: new Date('2024-11-01'),
        goals: 3
      },
      benefits: ['Health Insurance', 'Learning Budget'],
      documents: ['Contract', 'Resume', 'Tax Forms']
    },
    {
      id: '5',
      firstName: 'Emma',
      lastName: 'Wilson',
      email: 'emma.wilson@company.com',
      phone: '+1 (555) 567-8901',
      position: 'Sales Representative',
      department: 'sales',
      employeeId: 'EMP-2022-056',
      dateOfBirth: new Date('1992-07-18'),
      hireDate: new Date('2022-01-15'),
      status: 'on-leave',
      employmentType: 'full-time',
      salary: 75000,
      address: '654 Sales Street',
      city: 'Chicago',
      country: 'USA',
      emergencyContact: {
        name: 'James Wilson',
        relationship: 'Father',
        phone: '+1 (555) 567-8902'
      },
      skills: ['Salesforce', 'Negotiation', 'CRM', 'Lead Generation'],
      education: 'BA Business Administration',
      manager: 'Michael Brown',
      performance: {
        rating: 4.5,
        lastReview: new Date('2024-09-30'),
        goals: 4
      },
      benefits: ['Health Insurance', '401k', 'Commission Plan', 'Car Allowance'],
      documents: ['Contract', 'Sales Certifications', 'Tax Forms']
    },
    {
      id: '6',
      firstName: 'Frank',
      lastName: 'Taylor',
      email: 'frank.taylor@company.com',
      phone: '+1 (555) 678-9012',
      position: 'HR Specialist',
      department: 'hr',
      employeeId: 'EMP-2023-034',
      dateOfBirth: new Date('1987-11-05'),
      hireDate: new Date('2023-04-01'),
      status: 'active',
      employmentType: 'full-time',
      salary: 72000,
      address: '987 HR Plaza',
      city: 'Seattle',
      country: 'USA',
      emergencyContact: {
        name: 'Linda Taylor',
        relationship: 'Spouse',
        phone: '+1 (555) 678-9013'
      },
      skills: ['Recruitment', 'Employee Relations', 'HRIS', 'Compliance'],
      education: 'BA Human Resources',
      manager: 'Patricia Anderson',
      performance: {
        rating: 4.7,
        lastReview: new Date('2024-10-01'),
        goals: 5
      },
      benefits: ['Health Insurance', '401k', 'Remote Work', 'Professional Development'],
      documents: ['Contract', 'HR Certifications', 'Tax Forms']
    }
  ]);

  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messagePriority, setMessagePriority] = useState('normal');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  const showNotify = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || emp.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'green', icon: CheckCircle, label: 'Active', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
      case 'on-leave':
        return { color: 'orange', icon: Clock, label: 'On Leave', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
      case 'inactive':
        return { color: 'gray', icon: XCircle, label: 'Inactive', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
      case 'probation':
        return { color: 'blue', icon: AlertCircle, label: 'Probation', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      default:
        return { color: 'gray', icon: AlertCircle, label: 'Unknown', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const avgSalary = employees.reduce((acc, e) => acc + e.salary, 0) / employees.length;
  const avgRating = employees.reduce((acc, e) => acc + e.performance.rating, 0) / employees.length;

  const handleExport = () => {
    showNotify('Exporting Personnel Data...');
    
    // Create CSV content
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Position', 'Department', 'Employee ID', 'Start Date', 'Status', 'Employment Type', 'Salary', 'Location', 'Performance Rating', 'Manager'];
    const rows = employees.map(e => [
      e.id,
      `"${e.firstName}"`,
      `"${e.lastName}"`,
      e.email,
      e.phone,
      `"${e.position}"`,
      e.department,
      e.employeeId,
      e.hireDate.toISOString().split('T')[0],
      e.status,
      e.employmentType,
      e.salary,
      `"${e.city}, ${e.country}"`,
      e.performance.rating,
      `"${e.manager || ''}"`
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `personnel_manifest_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => showNotify('Personnel Data Successfully Archived'), 1000);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const calculateTenure = (hireDate: Date) => {
    const years = new Date().getFullYear() - hireDate.getFullYear();
    const months = new Date().getMonth() - hireDate.getMonth();
    if (years === 0) return `${months} months`;
    return `${years} year${years > 1 ? 's' : ''}`;
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] p-4 md:p-8 overflow-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-mesh" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/10 rounded-full blur-[140px] animate-mesh-delayed" />
        <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px] animate-mesh" />
      </div>

      <div className="relative z-10 space-y-8 max-w-[1600px] mx-auto">
        {/* Header / Command Center */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border-2 border-white shadow-2xl flex flex-col items-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-purple-50 border border-purple-100 rounded-full mb-6">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em]">Human Capital Command</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight mb-4">
            Talent <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Registry</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl mb-10 leading-relaxed uppercase text-[10px] tracking-[0.1em]">
            Workforce Intelligence & Organizational Architect
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                showNotify('Syncing HRIS Database...');
              }}
              className="px-8 py-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-purple-600 active:scale-95 transition-all duration-500 flex items-center gap-3 cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              Sync Protocol
            </button>
            <button
              onClick={() => setShowAddEmployee(true)}
              className="px-8 py-4 bg-purple-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-purple-600 active:scale-95 transition-all duration-500 flex items-center gap-3 cursor-pointer shadow-xl shadow-purple-500/20"
            >
              <Plus className="w-4 h-4" />
              Onboard Talent
            </button>
            <div className="h-10 w-px bg-gray-200 mx-2 hidden md:block" />
            <div className="flex items-center gap-2">
              <button 
                onClick={handleExport}
                className="p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-purple-500 hover:text-purple-500 active:scale-95 transition-all cursor-pointer group/btn" 
                title="Export Data"
              >
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={() => showNotify('Opening Import Wizard...')}
                className="p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-purple-500 hover:text-purple-500 active:scale-95 transition-all cursor-pointer group/btn" 
                title="Import Data"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Workforce', val: totalEmployees, sub: `${activeEmployees} Active Nodes`, icon: Users, color: 'purple' },
            { label: 'Avg Compensation', val: `$${(avgSalary / 1000).toFixed(0)}K`, sub: 'Per Annum', icon: DollarSign, color: 'emerald' },
            { label: 'Performance Index', val: avgRating.toFixed(1), sub: 'Mean Rating', icon: Award, color: 'pink' },
            { label: 'Divisions', val: departments.length - 1, sub: 'Active Units', icon: Building2, color: 'blue' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 border-2 border-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
              <div className="flex items-center justify-between mb-4">
                <div className={`p-4 bg-${stat.color}-500 rounded-2xl shadow-lg shadow-${stat.color}-500/20`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className={`w-5 h-5 text-${stat.color}-500 opacity-50`} />
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

        {/* Search and Filters Hub */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-purple-500/5 rounded-3xl blur-xl group-focus-within:bg-purple-500/10 transition-all opacity-0 group-focus-within:opacity-100" />
            <div className="relative flex items-center bg-white/60 backdrop-blur-xl border-2 border-white shadow-xl rounded-3xl p-2 pl-6 focus-within:border-purple-500/50 transition-all">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Locate personnel by identity or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 bg-transparent text-sm font-bold text-gray-900 outline-none placeholder:text-gray-400"
              />
              <div className="hidden md:flex items-center gap-2 pr-4">
                <span className="px-2 py-1 bg-gray-100 text-[10px] font-black text-gray-400 rounded-lg">CMD</span>
                <span className="px-2 py-1 bg-gray-100 text-[10px] font-black text-gray-400 rounded-lg">F</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-8 py-5 bg-white/60 backdrop-blur-xl border-2 border-white rounded-3xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3 cursor-pointer group">
              <Filter className="w-5 h-5 text-gray-600 group-hover:text-purple-500 transition-colors" />
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em] group-hover:text-purple-500">Filters</span>
            </button>
            
            <div className="flex items-center gap-1 bg-white/60 backdrop-blur-xl border-2 border-white shadow-xl rounded-2xl p-1.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all cursor-pointer ${viewMode === 'list' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Department Navigation */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar">
          {departments.map((category) => {
            const Icon = category.icon;
            const isActive = selectedDepartment === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedDepartment(category.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-500 whitespace-nowrap cursor-pointer border-2 ${
                  isActive
                    ? 'bg-gray-900 border-gray-900 text-white shadow-xl shadow-gray-900/10 scale-105'
                    : 'bg-white/60 backdrop-blur-md border-white text-gray-500 hover:border-purple-500/30 hover:text-purple-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.name}
                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {category.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEmployees.map((employee, idx) => {
              const statusConfig = getStatusConfig(employee.status);
              const StatusIcon = statusConfig.icon;
              const tenure = calculateTenure(employee.hireDate);
              
              return (
                <div
                  key={employee.id}
                  onClick={() => setSelectedEmployee(employee)}
                  className="group relative bg-white/60 backdrop-blur-xl rounded-[3rem] border-2 border-white p-8 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 cursor-pointer animate-in fade-in zoom-in-95 fill-mode-both"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Status Float */}
                  <div className={`absolute top-6 right-6 flex items-center gap-2 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} shadow-sm`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label}
                  </div>

                  {/* Identity Block */}
                  <div className="flex items-center gap-5 mb-8">
                     <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-[1.5rem] flex items-center justify-center border-2 border-white shadow-lg text-white font-black text-xl group-hover:scale-110 transition-transform duration-500">
                       {getInitials(employee.firstName, employee.lastName)}
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight group-hover:text-purple-600 transition-colors">{employee.firstName} {employee.lastName}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{employee.position}</p>
                     </div>
                  </div>

                  {/* Performance Matrix */}
                  <div className="mb-8 p-5 bg-gray-50/50 rounded-[2rem] border border-white/50">
                    <div className="flex items-center justify-between mb-3 text-[9px] font-black uppercase tracking-widest">
                      <span className="text-gray-400">Perf. Index</span>
                      <span className="text-gray-900">{employee.performance.rating}/5.0</span>
                    </div>
                    <div className="w-full h-2 bg-white rounded-full overflow-hidden shadow-inner mb-2">
                       <div 
                         className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                         style={{ width: `${(employee.performance.rating / 5) * 100}%` }}
                       />
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500">
                      <Target className="w-3 h-3" />
                      <span>{employee.performance.goals} Goals Pending</span>
                    </div>
                  </div>

                  {/* Operational Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="p-4 bg-white rounded-2xl border border-gray-50 shadow-sm group-hover:shadow-md transition-all">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Tenure</p>
                        <p className="text-sm font-black text-gray-900">{tenure}</p>
                     </div>
                     <div className="p-4 bg-white rounded-2xl border border-gray-50 shadow-sm group-hover:shadow-md transition-all">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Department</p>
                        <p className="text-sm font-black text-gray-900 capitalize">{employee.department}</p>
                     </div>
                  </div>

                  {/* Contact Interface */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                      <Mail className="w-3 h-3" />
                      {employee.email.split('@')[0]}
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); showNotify('Initiating Secure Comms...'); }}
                        className="p-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-500 hover:text-white transition-all cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setDeletingEmployee(employee);
                          setShowDeleteModal(true);
                        }}
                        className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
                  <th className="px-8 py-6 text-left text-[10px] font-black text-white uppercase tracking-[0.2em]">Personnel</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-white uppercase tracking-[0.2em]">Role</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-white uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-white uppercase tracking-[0.2em]">Contact</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-white uppercase tracking-[0.2em]">Performance</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-white uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white/40">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="group hover:bg-purple-50/50 transition-colors cursor-pointer" onClick={() => setSelectedEmployee(employee)}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                          {getInitials(employee.firstName, employee.lastName)}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 group-hover:text-purple-600 transition-colors leading-tight">{employee.firstName} {employee.lastName}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{employee.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-gray-900">{employee.position}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">{employee.department}</p>
                    </td>
                    <td className="px-8 py-6">
                       <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${getStatusConfig(employee.status).bg} ${getStatusConfig(employee.status).text} border ${getStatusConfig(employee.status).border}`}>
                          {employee.status}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-sm font-bold text-gray-900">{employee.email}</p>
                       <p className="text-[10px] text-gray-500">{employee.phone}</p>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 h-1.5 rounded-full w-24">
                             <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(employee.performance.rating / 5) * 100}%` }} />
                          </div>
                          <span className="text-xs font-black text-gray-900">{employee.performance.rating}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-purple-500 hover:text-white transition-all cursor-pointer">
                             <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all cursor-pointer">
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-500">
          <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-hidden border-2 border-white shadow-2xl flex flex-col relative">
             <div className="p-8 md:p-10 border-b border-gray-100 flex items-center justify-between bg-white/40 sticky top-0 z-10">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 text-white font-black text-xl">
                    {getInitials(selectedEmployee.firstName, selectedEmployee.lastName)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{selectedEmployee.firstName} {selectedEmployee.lastName}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${getStatusConfig(selectedEmployee.status).bg} ${getStatusConfig(selectedEmployee.status).text} border ${getStatusConfig(selectedEmployee.status).border}`}>
                        {selectedEmployee.status}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 border-l border-gray-300">
                        {selectedEmployee.position}
                      </span>
                    </div>
                  </div>
               </div>
               <button
                 onClick={() => setSelectedEmployee(null)}
                 className="p-4 bg-gray-100/50 hover:bg-gray-200/50 rounded-2xl transition-all cursor-pointer group"
               >
                 <X className="w-5 h-5 text-gray-500 group-hover:rotate-90 transition-transform duration-500" />
               </button>
             </div>

             <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 custom-scrollbar">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-[2rem] border border-purple-100">
                      <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest mb-2">Comp. Package</p>
                      <p className="text-3xl font-black text-purple-900">${(selectedEmployee.salary / 1000).toFixed(0)}K</p>
                   </div>
                   <div className="p-6 bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-[2rem] border border-pink-100">
                      <p className="text-[9px] font-black text-pink-500 uppercase tracking-widest mb-2">Performance</p>
                      <p className="text-3xl font-black text-pink-900">{selectedEmployee.performance.rating}</p>
                   </div>
                </div>

                {/* Info Grid */}
                <div>
                   <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gray-400" />
                      Personnel Dossier
                   </h3>
                   <div className="bg-white/50 border-2 border-gray-100 rounded-[2rem] p-6 grid grid-cols-2 gap-y-6">
                      <div>
                         <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Department</p>
                         <p className="font-bold text-gray-900 capitalize">{selectedEmployee.department}</p>
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Employment Type</p>
                         <p className="font-bold text-gray-900 capitalize">{selectedEmployee.employmentType.replace('-', ' ')}</p>
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Email</p>
                         <p className="font-bold text-gray-900 text-sm">{selectedEmployee.email}</p>
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Phone</p>
                         <p className="font-bold text-gray-900">{selectedEmployee.phone}</p>
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Location</p>
                         <p className="font-bold text-gray-900">{selectedEmployee.city}, {selectedEmployee.country}</p>
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Joined</p>
                         <p className="font-bold text-gray-900">{selectedEmployee.hireDate.toLocaleDateString()}</p>
                      </div>
                   </div>
                </div>
                
                {/* Skills */}
                <div>
                   <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Competencies
                   </h3>
                   <div className="flex flex-wrap gap-2">
                      {selectedEmployee.skills.map(skill => (
                        <span key={skill} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-sm">
                           {skill}
                        </span>
                      ))}
                   </div>
                </div>
             </div>

             <div className="p-8 md:p-10 bg-white/60 border-t border-gray-100 flex items-center gap-3 sticky bottom-0">
                <button 
                  onClick={() => setShowMessageModal(true)}
                  className="flex-1 px-8 py-5 bg-purple-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-purple-600 transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  Dispatch Info
                </button>
                <button 
                  onClick={() => {
                     setDeletingEmployee(selectedEmployee);
                     setShowDeleteModal(true);
                  }}
                  className="p-5 border-2 border-rose-100 text-rose-500 rounded-2xl hover:bg-rose-50 transition-all cursor-pointer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-500">
          <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-hidden border-2 border-white shadow-2xl flex flex-col relative text-gray-900">
             <div className="p-8 md:p-10 border-b border-gray-100 flex items-center justify-between bg-white/40 sticky top-0 z-10">
               <h2 className="text-2xl font-black tracking-tight">Onboard <span className="text-purple-600">Talent</span></h2>
               <button onClick={() => setShowAddEmployee(false)} className="p-4 bg-gray-100/50 hover:bg-gray-200/50 rounded-2xl transition-all cursor-pointer">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">First Name</label>
                      <input type="text" placeholder="John" className="w-full px-6 py-4 bg-white/50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 outline-none transition-all font-bold placeholder:text-gray-300" />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Last Name</label>
                      <input type="text" placeholder="Doe" className="w-full px-6 py-4 bg-white/50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 outline-none transition-all font-bold placeholder:text-gray-300" />
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Email Address</label>
                      <input type="email" placeholder="john.doe@company.com" className="w-full px-6 py-4 bg-white/50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 outline-none transition-all font-bold placeholder:text-gray-300" />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Department</label>
                      <select className="w-full px-6 py-4 bg-white/50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 outline-none transition-all font-bold">
                        {departments.filter(d => d.id !== 'all').map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Role / Title</label>
                      <input type="text" placeholder="Software Engineer" className="w-full px-6 py-4 bg-white/50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 outline-none transition-all font-bold placeholder:text-gray-300" />
                   </div>
                </div>

                <div className="bg-purple-50/50 rounded-[2.5rem] p-8 border border-purple-100">
                   <h3 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Administrative Details
                   </h3>
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                         <label className="block text-[9px] font-black text-purple-400 uppercase mb-2">Start Date</label>
                         <input type="date" className="w-full px-5 py-4 bg-white border-2 border-purple-100 rounded-xl focus:border-purple-500 outline-none transition-all font-bold text-gray-700" />
                      </div>
                      <div>
                         <label className="block text-[9px] font-black text-purple-400 uppercase mb-2">Base Salary</label>
                         <input type="number" placeholder="0.00" className="w-full px-5 py-4 bg-white border-2 border-purple-100 rounded-xl focus:border-purple-500 outline-none transition-all font-bold placeholder:text-purple-200" />
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-8 md:p-10 bg-white/60 border-t border-gray-100 flex items-center gap-3">
                <button onClick={() => setShowAddEmployee(false)} className="flex-1 px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-all cursor-pointer">
                  Cancel
                </button>
                <button 
                  onClick={() => {
                     showNotify('Talent Successfully Registered');
                     setShowAddEmployee(false);
                  }}
                  className="flex-[2] px-8 py-5 bg-purple-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-purple-600 transition-all shadow-xl shadow-purple-500/20 cursor-pointer"
                >
                  Confirm Registry
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedEmployee && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-in fade-in duration-500">
           <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] max-w-xl w-full max-h-[90vh] overflow-hidden border-2 border-white shadow-2xl flex flex-col relative text-gray-900">
              <div className="p-8 border-b border-gray-100 bg-white/40 sticky top-0 z-10 flex items-center justify-between">
                 <div>
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                       <MessageSquare className="w-6 h-6 text-purple-600" />
                       Internal Comms
                    </h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Recipient: {selectedEmployee.firstName} {selectedEmployee.lastName}</p>
                 </div>
                 <button onClick={() => setShowMessageModal(false)} className="p-4 bg-gray-100/50 rounded-2xl cursor-pointer">
                   <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Urgency Level</label>
                    <div className="grid grid-cols-3 gap-2">
                       {['normal', 'high', 'critical'].map((p) => (
                         <button
                           key={p}
                           onClick={() => setMessagePriority(p)}
                           className={`py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                             messagePriority === p 
                             ? (p === 'critical' ? 'bg-rose-500 text-white' : 'bg-purple-500 text-white')
                             : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                           }`}
                         >
                           {p}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Subject Vector</label>
                    <input 
                       type="text" 
                       value={messageSubject}
                       onChange={(e) => setMessageSubject(e.target.value)}
                       placeholder="Enter brief subject..." 
                       className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-purple-500" 
                    />
                 </div>

                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Message Body</label>
                    <textarea 
                       rows={6}
                       value={messageBody}
                       onChange={(e) => setMessageBody(e.target.value)}
                       placeholder="Type your message..." 
                       className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-purple-500 resize-none" 
                    />
                 </div>
              </div>

              <div className="p-8 bg-white/60 border-t border-gray-100">
                 <button 
                   disabled={!messageSubject || !messageBody}
                   onClick={() => {
                     showNotify(`Message Dispatched to ${selectedEmployee.firstName}`);
                     setShowMessageModal(false);
                   }}
                   className="w-full py-5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-purple-600 transition-all shadow-xl disabled:opacity-30 cursor-pointer"
                 >
                   Send Transmission
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingEmployee && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingEmployee(null);
          }}
          onConfirm={() => {
            setEmployees(employees.filter(e => e.id !== deletingEmployee.id));
            showNotify('Personnel Record Terminated');
          }}
          title="Disconnect Node"
          itemName={`${deletingEmployee.firstName} ${deletingEmployee.lastName}`}
          itemDetails={`${deletingEmployee.position} - ${deletingEmployee.department}`}
          warningMessage="This action will permanently remove this employee record from the registry."
        />
      )}

      {/* Global Toast Notification */}
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
      </div>
    </div>
  );
}
