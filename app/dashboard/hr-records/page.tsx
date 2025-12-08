"use client";

import React, { useState } from 'react';
import { 
  Users, Plus, Search, Filter, Download, Upload, UserCheck,
  Mail, Phone, MapPin, Calendar, Briefcase, DollarSign,
  Award, TrendingUp, Clock, Edit3, Trash2, Eye, MoreVertical,
  FileText, Star, Heart, Coffee, Cake, Gift, Target,
  CheckCircle, XCircle, AlertCircle, User, Building2,
  GraduationCap, Shield, Activity, BarChart3, PieChart,
  Grid, List, ChevronRight, X, Check, Zap, MessageSquare,
  Home, Car, Smartphone, Laptop, CreditCard, Wallet, Baby,
  Plane, Umbrella, HeartPulse, BookOpen, Settings
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messagingEmployee, setMessagingEmployee] = useState<Employee | null>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadingEmployee, setDownloadingEmployee] = useState<Employee | null>(null);

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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const calculateTenure = (hireDate: Date) => {
    const years = new Date().getFullYear() - hireDate.getFullYear();
    const months = new Date().getMonth() - hireDate.getMonth();
    if (years === 0) return `${months} months`;
    return `${years} year${years > 1 ? 's' : ''}`;
  };

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

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            HR Management
          </h1>
          <p className="text-gray-600 mt-2">Manage your team and employee records</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Upload className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Import</span>
          </button>
          <button className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Export</span>
          </button>
          <button
            onClick={() => setShowAddEmployee(true)}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-blue-700 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              8%
            </div>
          </div>
          <p className="text-sm text-blue-600 font-medium mb-1">Total Employees</p>
          <p className="text-3xl font-bold text-blue-900">{totalEmployees}</p>
          <p className="text-xs text-blue-600 mt-1">{activeEmployees} active</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-500 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-green-700 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              5%
            </div>
          </div>
          <p className="text-sm text-green-600 font-medium mb-1">Avg Salary</p>
          <p className="text-3xl font-bold text-green-900">${(avgSalary / 1000).toFixed(0)}K</p>
          <p className="text-xs text-green-600 mt-1">Per year</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < Math.floor(avgRating) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
              ))}
            </div>
          </div>
          <p className="text-sm text-purple-600 font-medium mb-1">Avg Performance</p>
          <p className="text-3xl font-bold text-purple-900">{avgRating.toFixed(1)}</p>
          <p className="text-xs text-purple-600 mt-1">Out of 5.0</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
              5 Depts
            </span>
          </div>
          <p className="text-sm text-orange-600 font-medium mb-1">Departments</p>
          <p className="text-3xl font-bold text-orange-900">{departments.length - 1}</p>
          <p className="text-xs text-orange-600 mt-1">Active teams</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <button className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-all group">
            <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-blue-900">Time Off</span>
          </button>

          <button className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:shadow-lg transition-all group">
            <div className="p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-green-900">Payroll</span>
          </button>

          <button className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-all group">
            <div className="p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-purple-900">Reports</span>
          </button>

          <button className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200 hover:shadow-lg transition-all group">
            <div className="p-2 bg-orange-500 rounded-lg group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-orange-900">Reviews</span>
          </button>

          <button className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 hover:shadow-lg transition-all group">
            <div className="p-2 bg-indigo-500 rounded-lg group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-indigo-900">Training</span>
          </button>

          <button className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border-2 border-pink-200 hover:shadow-lg transition-all group">
            <div className="p-2 bg-pink-500 rounded-lg group-hover:scale-110 transition-transform">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-pink-900">Benefits</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or employee ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Filters</span>
          </button>
          
          <div className="flex items-center gap-1 bg-white border-2 border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Department Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {departments.map((dept) => {
          const Icon = dept.icon;
          return (
            <button
              key={dept.id}
              onClick={() => setSelectedDepartment(dept.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                selectedDepartment === dept.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {dept.name}
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                selectedDepartment === dept.id ? 'bg-white bg-opacity-20' : 'bg-gray-100'
              }`}>
                {dept.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Employees Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => {
            const statusConfig = getStatusConfig(employee.status);
            const StatusIcon = statusConfig.icon;
            const tenure = calculateTenure(employee.hireDate);
            
            return (
              <div
                key={employee.id}
                className="group relative bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-purple-300 hover:shadow-2xl transition-all cursor-pointer"
                onClick={() => setSelectedEmployee(employee)}
              >
                {/* Status Badge */}
                <div className={`absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {getInitials(employee.firstName, employee.lastName)}
                  </div>
                  <div className="flex-1 min-w-0 pr-16">
                    <h3 className="font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                      {employee.firstName} {employee.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">{employee.position}</p>
                    <p className="text-xs text-gray-500">{employee.employeeId}</p>
                  </div>
                </div>

                {/* Department & Type */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium capitalize">
                    {employee.department}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium capitalize">
                    {employee.employmentType.replace('-', ' ')}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{employee.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{employee.city}, {employee.country}</span>
                  </div>
                </div>

                {/* Performance */}
                <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-yellow-700">Performance</span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < Math.floor(employee.performance.rating) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-yellow-600">Rating: {employee.performance.rating}/5.0</span>
                    <span className="text-yellow-600">{employee.performance.goals} goals</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                    <p className="text-xs text-green-600 mb-0.5">Salary</p>
                    <p className="text-sm font-bold text-green-900">${(employee.salary / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                    <p className="text-xs text-blue-600 mb-0.5">Tenure</p>
                    <p className="text-sm font-bold text-blue-900">{tenure}</p>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {employee.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                    {employee.skills.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                        +{employee.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button className="flex-1 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium flex items-center justify-center gap-1">
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </button>
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === employee.id ? null : employee.id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    {activeDropdown === employee.id && (
                      <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-[100]">
                        <div className="py-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEmployee(employee);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4 text-purple-600" />
                            View Details
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingEmployee(employee);
                              setShowEditModal(true);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4 text-blue-600" />
                            Edit Profile
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMessagingEmployee(employee);
                              setMessageSubject(`Message to ${employee.firstName} ${employee.lastName}`);
                              setMessageBody('');
                              setShowMessageModal(true);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 flex items-center gap-2 cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4 text-green-600" />
                            Send Message
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDownloadingEmployee(employee);
                              setShowDownloadModal(true);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-cyan-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Download className="w-4 h-4 text-cyan-600" />
                            Download Data
                          </button>
                          <div className="border-t border-gray-200 my-1"></div>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingEmployee(employee);
                              setShowDeleteModal(true);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                            Delete Employee
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
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Position</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Department</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Performance</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map((employee) => {
                const statusConfig = getStatusConfig(employee.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {getInitials(employee.firstName, employee.lastName)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{employee.firstName} {employee.lastName}</p>
                          <p className="text-xs text-gray-500">{employee.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{employee.position}</p>
                      <p className="text-xs text-gray-500 capitalize">{employee.employmentType.replace('-', ' ')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 capitalize">{employee.department}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">{employee.email}</p>
                        <p className="text-gray-500">{employee.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold text-gray-900">{employee.performance.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEmployee(employee);
                          }}
                          className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-purple-600" />
                        </button>
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === `list-${employee.id}` ? null : `list-${employee.id}`);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors" 
                            title="More options"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                          
                          {activeDropdown === `list-${employee.id}` && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-[100]">
                              <div className="py-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEmployee(employee);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4 text-purple-600" />
                                  View Details
                                </button>
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingEmployee(employee);
                                    setShowEditModal(true);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Edit3 className="w-4 h-4 text-blue-600" />
                                  Edit Profile
                                </button>
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMessagingEmployee(employee);
                                    setMessageSubject(`Message to ${employee.firstName} ${employee.lastName}`);
                                    setMessageBody('');
                                    setShowMessageModal(true);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <MessageSquare className="w-4 h-4 text-green-600" />
                                  Send Message
                                </button>
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDownloadingEmployee(employee);
                                    setShowDownloadModal(true);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-cyan-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Download className="w-4 h-4 text-cyan-600" />
                                  Download Data
                                </button>
                                <div className="border-t border-gray-200 my-1"></div>
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingEmployee(employee);
                                    setShowDeleteModal(true);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                  Delete Employee
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

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {getInitials(selectedEmployee.firstName, selectedEmployee.lastName)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedEmployee.firstName} {selectedEmployee.lastName}</h2>
                  <p className="text-sm text-gray-600">{selectedEmployee.position}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Tenure</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{calculateTenure(selectedEmployee.hireDate)}</p>
                  <p className="text-xs text-blue-600 mt-1">Since {selectedEmployee.hireDate.toLocaleDateString()}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Salary</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">${selectedEmployee.salary.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">Annual</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">Performance</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-900">{selectedEmployee.performance.rating}/5.0</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < Math.floor(selectedEmployee.performance.rating) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">Goals</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{selectedEmployee.performance.goals}</p>
                  <p className="text-xs text-purple-600 mt-1">Active goals</p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-blue-600 mb-1">Employee ID</p>
                    <p className="font-semibold text-blue-900">{selectedEmployee.employeeId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 mb-1">Date of Birth</p>
                    <p className="font-semibold text-blue-900">{selectedEmployee.dateOfBirth.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 mb-1">Email</p>
                    <p className="font-semibold text-blue-900">{selectedEmployee.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 mb-1">Phone</p>
                    <p className="font-semibold text-blue-900">{selectedEmployee.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-blue-600 mb-1">Address</p>
                    <p className="font-semibold text-blue-900">{selectedEmployee.address}, {selectedEmployee.city}, {selectedEmployee.country}</p>
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Employment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-purple-600 mb-1">Department</p>
                    <p className="font-semibold text-purple-900 capitalize">{selectedEmployee.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 mb-1">Employment Type</p>
                    <p className="font-semibold text-purple-900 capitalize">{selectedEmployee.employmentType.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 mb-1">Manager</p>
                    <p className="font-semibold text-purple-900">{selectedEmployee.manager || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 mb-1">Education</p>
                    <p className="font-semibold text-purple-900">{selectedEmployee.education}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 mb-1">Last Review</p>
                    <p className="font-semibold text-purple-900">{selectedEmployee.performance.lastReview.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 mb-1">Status</p>
                    <p className="font-semibold text-purple-900 capitalize">{selectedEmployee.status.replace('-', ' ')}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-5 border border-red-200">
                <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-red-600 mb-1">Name</p>
                    <p className="font-semibold text-red-900">{selectedEmployee.emergencyContact.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-red-600 mb-1">Relationship</p>
                    <p className="font-semibold text-red-900">{selectedEmployee.emergencyContact.relationship}</p>
                  </div>
                  <div>
                    <p className="text-xs text-red-600 mb-1">Phone</p>
                    <p className="font-semibold text-red-900">{selectedEmployee.emergencyContact.phone}</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedEmployee.skills.map((skill, idx) => (
                    <span key={idx} className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-green-600" />
                  Benefits & Perks
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedEmployee.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-green-900">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Documents
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedEmployee.documents.map((doc, idx) => (
                    <button key={idx} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-left">
                      <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-blue-900">{doc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button 
                  type="button"
                  onClick={() => {
                    setEditingEmployee(selectedEmployee);
                    setShowEditModal(true);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Edit3 className="w-5 h-5" />
                  Edit Profile
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setMessagingEmployee(selectedEmployee);
                    setMessageSubject(`Message to ${selectedEmployee.firstName} ${selectedEmployee.lastName}`);
                    setMessageBody('');
                    setShowMessageModal(true);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5" />
                  Send Message
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setDownloadingEmployee(selectedEmployee);
                    setShowDownloadModal(true);
                  }}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">Add New Employee</h2>
              <button
                onClick={() => setShowAddEmployee(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="john.doe@company.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
                  <input
                    type="text"
                    placeholder="e.g., Software Engineer"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="">Select department...</option>
                    <option value="engineering">Engineering</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="sales">Sales</option>
                    <option value="hr">Human Resources</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Employment Type</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Salary</label>
                  <input
                    type="number"
                    placeholder="75000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="active">Active</option>
                    <option value="probation">Probation</option>
                    <option value="on-leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    placeholder="Street address"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    placeholder="City"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    placeholder="Country"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAddEmployee(false)}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-xl transition-all">
                  Add Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Edit3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Edit Employee Profile</h2>
                  <p className="text-blue-100 text-sm">{editingEmployee.firstName} {editingEmployee.lastName}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEmployee(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={editingEmployee.firstName}
                    onChange={(e) => setEditingEmployee({...editingEmployee, firstName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={editingEmployee.lastName}
                    onChange={(e) => setEditingEmployee({...editingEmployee, lastName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
                <input
                  type="text"
                  value={editingEmployee.position}
                  onChange={(e) => setEditingEmployee({...editingEmployee, position: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editingEmployee.email}
                  onChange={(e) => setEditingEmployee({...editingEmployee, email: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={editingEmployee.phone}
                  onChange={(e) => setEditingEmployee({...editingEmployee, phone: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setEmployees(employees.map(emp => emp.id === editingEmployee.id ? editingEmployee : emp));
                    setShowEditModal(false);
                    setEditingEmployee(null);
                    alert('✓ Employee profile updated successfully!');
                  }}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:shadow-xl transition-all cursor-pointer"
                >
                  Save Changes
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEmployee(null);
                  }}
                  className="px-6 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showMessageModal && messagingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Send Message</h2>
                  <p className="text-green-100 text-sm">To: {messagingEmployee.email}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowMessageModal(false);
                  setMessagingEmployee(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter message subject"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={8}
                  placeholder="Type your message here..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    window.location.href = `mailto:${messagingEmployee.email}?subject=${encodeURIComponent(messageSubject)}&body=${encodeURIComponent(messageBody)}`;
                    setShowMessageModal(false);
                    setMessagingEmployee(null);
                    alert('✓ Email client opened!');
                  }}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-5 h-5" />
                  Send Message
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessagingEmployee(null);
                  }}
                  className="px-6 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download Modal */}
      {showDownloadModal && downloadingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <Download className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Download Employee Data</h2>
                  <p className="text-cyan-100 text-sm mt-0.5">{downloadingEmployee.firstName} {downloadingEmployee.lastName} • {downloadingEmployee.employeeId}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowDownloadModal(false);
                  setDownloadingEmployee(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Employee Preview Card */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {downloadingEmployee.firstName.charAt(0)}{downloadingEmployee.lastName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">{downloadingEmployee.firstName} {downloadingEmployee.lastName}</p>
                    <p className="text-sm text-gray-600">{downloadingEmployee.position}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded text-xs font-medium capitalize">
                        {downloadingEmployee.department}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium capitalize">
                        {downloadingEmployee.employmentType?.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-cyan-600" />
                    <span className="truncate">{downloadingEmployee.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-cyan-600" />
                    <span>{downloadingEmployee.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-600" />
                    <span>{downloadingEmployee.city}, {downloadingEmployee.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-cyan-600" />
                    <span className="font-semibold">${downloadingEmployee.salary.toLocaleString()}/year</span>
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
                  {/* Excel/CSV Option */}
                  <button
                    type="button"
                    onClick={() => {
                      const csv = `First Name,Last Name,Employee ID,Position,Department,Email,Phone,Salary,Hire Date,Status,Employment Type,City,Country,Manager,Education,Performance Rating\n${downloadingEmployee.firstName},${downloadingEmployee.lastName},${downloadingEmployee.employeeId},${downloadingEmployee.position},${downloadingEmployee.department},${downloadingEmployee.email},${downloadingEmployee.phone},$${downloadingEmployee.salary},${downloadingEmployee.hireDate.toLocaleDateString()},${downloadingEmployee.status},${downloadingEmployee.employmentType},${downloadingEmployee.city},${downloadingEmployee.country},${downloadingEmployee.manager || 'N/A'},${downloadingEmployee.education},${downloadingEmployee.performance.rating}`;
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${downloadingEmployee.firstName}_${downloadingEmployee.lastName}_${downloadingEmployee.employeeId}_data.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      setShowDownloadModal(false);
                      setDownloadingEmployee(null);
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
                        personalInfo: {
                          firstName: downloadingEmployee.firstName,
                          lastName: downloadingEmployee.lastName,
                          employeeId: downloadingEmployee.employeeId,
                          email: downloadingEmployee.email,
                          phone: downloadingEmployee.phone,
                          dateOfBirth: downloadingEmployee.dateOfBirth.toISOString(),
                          address: downloadingEmployee.address,
                          city: downloadingEmployee.city,
                          country: downloadingEmployee.country
                        },
                        employment: {
                          position: downloadingEmployee.position,
                          department: downloadingEmployee.department,
                          employmentType: downloadingEmployee.employmentType,
                          hireDate: downloadingEmployee.hireDate.toISOString(),
                          status: downloadingEmployee.status,
                          salary: downloadingEmployee.salary,
                          manager: downloadingEmployee.manager
                        },
                        performance: downloadingEmployee.performance,
                        skills: downloadingEmployee.skills,
                        education: downloadingEmployee.education,
                        benefits: downloadingEmployee.benefits,
                        emergencyContact: downloadingEmployee.emergencyContact,
                        exportedAt: new Date().toISOString()
                      };
                      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${downloadingEmployee.firstName}_${downloadingEmployee.lastName}_${downloadingEmployee.employeeId}_data.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      setShowDownloadModal(false);
                      setDownloadingEmployee(null);
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

                  {/* PDF Option */}
                  <button
                    type="button"
                    onClick={() => {
                      const pdfContent = `
EMPLOYEE PROFILE REPORT
${'='.repeat(80)}

PERSONAL INFORMATION
${'-'.repeat(80)}
Name:              ${downloadingEmployee.firstName} ${downloadingEmployee.lastName}
Employee ID:       ${downloadingEmployee.employeeId}
Date of Birth:     ${downloadingEmployee.dateOfBirth.toLocaleDateString()}
Email:             ${downloadingEmployee.email}
Phone:             ${downloadingEmployee.phone}
Address:           ${downloadingEmployee.address}, ${downloadingEmployee.city}, ${downloadingEmployee.country}

EMPLOYMENT DETAILS
${'-'.repeat(80)}
Position:          ${downloadingEmployee.position}
Department:        ${downloadingEmployee.department}
Employment Type:   ${downloadingEmployee.employmentType}
Hire Date:         ${downloadingEmployee.hireDate.toLocaleDateString()}
Status:            ${downloadingEmployee.status}
Manager:           ${downloadingEmployee.manager || 'N/A'}
Tenure:            ${Math.floor((new Date().getTime() - downloadingEmployee.hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365))} years

COMPENSATION & PERFORMANCE
${'-'.repeat(80)}
Annual Salary:     $${downloadingEmployee.salary.toLocaleString()}
Performance:       ${downloadingEmployee.performance.rating}/5.0
Last Review:       ${downloadingEmployee.performance.lastReview.toLocaleDateString()}
Active Goals:      ${downloadingEmployee.performance.goals}

SKILLS & EDUCATION
${'-'.repeat(80)}
Education:         ${downloadingEmployee.education}
Skills:            ${downloadingEmployee.skills.join(', ')}

BENEFITS
${'-'.repeat(80)}
${downloadingEmployee.benefits.map(b => `• ${b}`).join('\n')}

EMERGENCY CONTACT
${'-'.repeat(80)}
Name:              ${downloadingEmployee.emergencyContact.name}
Relationship:      ${downloadingEmployee.emergencyContact.relationship}
Phone:             ${downloadingEmployee.emergencyContact.phone}

${'='.repeat(80)}
Report Generated:  ${new Date().toLocaleString()}
Confidential - For Internal Use Only
`;
                      const blob = new Blob([pdfContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${downloadingEmployee.firstName}_${downloadingEmployee.lastName}_${downloadingEmployee.employeeId}_profile.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      setShowDownloadModal(false);
                      setDownloadingEmployee(null);
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

                  {/* Plain Text Option */}
                  <button
                    type="button"
                    onClick={() => {
                      const data = `EMPLOYEE DATA EXPORT\n${'='.repeat(60)}\n\nPERSONAL INFORMATION:\n  Name: ${downloadingEmployee.firstName} ${downloadingEmployee.lastName}\n  Employee ID: ${downloadingEmployee.employeeId}\n  Email: ${downloadingEmployee.email}\n  Phone: ${downloadingEmployee.phone}\n  Address: ${downloadingEmployee.address}, ${downloadingEmployee.city}, ${downloadingEmployee.country}\n\nEMPLOYMENT DETAILS:\n  Position: ${downloadingEmployee.position}\n  Department: ${downloadingEmployee.department}\n  Employment Type: ${downloadingEmployee.employmentType}\n  Hire Date: ${downloadingEmployee.hireDate.toLocaleDateString()}\n  Status: ${downloadingEmployee.status}\n  Manager: ${downloadingEmployee.manager || 'N/A'}\n\nCOMPENSATION:\n  Annual Salary: $${downloadingEmployee.salary.toLocaleString()}\n\nPERFORMANCE:\n  Rating: ${downloadingEmployee.performance.rating}/5.0\n  Last Review: ${downloadingEmployee.performance.lastReview.toLocaleDateString()}\n  Active Goals: ${downloadingEmployee.performance.goals}\n\nSKILLS:\n  ${downloadingEmployee.skills.join(', ')}\n\nEDUCATION:\n  ${downloadingEmployee.education}\n\nExported: ${new Date().toLocaleString()}\n`;
                      const blob = new Blob([data], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${downloadingEmployee.firstName}_${downloadingEmployee.lastName}_${downloadingEmployee.employeeId}_data.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      setShowDownloadModal(false);
                      setDownloadingEmployee(null);
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

              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-semibold mb-1">Data Privacy Notice</p>
                  <p>Downloaded files contain sensitive employee information. Handle with care and follow company data protection policies.</p>
                </div>
              </div>

              {/* Cancel Button */}
              <button 
                type="button"
                onClick={() => {
                  setShowDownloadModal(false);
                  setDownloadingEmployee(null);
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
      {deletingEmployee && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingEmployee(null);
          }}
          onConfirm={() => {
            setEmployees(employees.filter(emp => emp.id !== deletingEmployee.id));
            alert('✓ Employee deleted successfully!');
          }}
          title="Delete Employee"
          itemName={`${deletingEmployee.firstName} ${deletingEmployee.lastName}`}
          itemDetails={`${deletingEmployee.position} - ${deletingEmployee.department}`}
          warningMessage="This will permanently remove this employee and all their records."
        />
      )}
    </div>
  );
}
