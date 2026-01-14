"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  TrendingUp, Users, FileText, CheckSquare, 
  DollarSign, Calendar, Clock, ArrowUpRight, ArrowDownRight,
  Sparkles, Plus, BarChart3, Activity, Target,
  Zap, Award, Bell, MessageSquare, Mail,
  Shield, Briefcase, AlertCircle, X,
  Building2, UsersRound, AtSign, Cpu, Circle, LineChart
} from 'lucide-react';
import { usePresence } from '@/components/hooks/use-presence';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  business: {
    name: string;
    industry: string;
    size: string;
    seatCount: number;
    maxSeats: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  
  // Team presence tracking
  const { presence } = usePresence();

  // Check if user is super admin and redirect
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      return;
    }

    // Check if user is SUPER_ADMIN - they should only access admin panel
    const userRole = (session.user as { role?: string })?.role;
    if (userRole === 'SUPER_ADMIN') {
      console.log('[DASHBOARD] Super admin detected, redirecting to admin panel');
      router.push('/admin');
      return;
    }
  }, [session, status, router]);

  // Fetch user and business data
  useEffect(() => {
    async function fetchUserData() {
      if (status === 'loading') return;
      
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      // Don't fetch if super admin (will be redirected)
      const userRole = (session.user as { role?: string })?.role;
      if (userRole === 'SUPER_ADMIN') {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/profile');
        console.log('API Response:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('User data fetched:', data);
          
          if (data && data.business) {
            setUserData(data);
          } else {
            console.error('Missing business data in response:', data);
          }
        } else {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          try {
            const errorData = JSON.parse(errorText);
            console.error('Error details:', errorData);
          } catch {
            console.error('Error response text:', errorText);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [session, status]);

  // const handleExportReport = () => {
  //   const reportData = {
  //     date: new Date().toISOString(),
  //     revenue: '£124,500',
  //     customers: '2,847',
  //     projects: '42',
  //     tasks: '18'
  //   };
  //   const dataStr = JSON.stringify(reportData, null, 2);
  //   const dataBlob = new Blob([dataStr], { type: 'application/json' });
  //   const url = URL.createObjectURL(dataBlob);
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.download = `dashboard_report_${new Date().toISOString().split('T')[0]}.json`;
  //   link.click();
  //   URL.revokeObjectURL(url);
  //   alert('✓ Report exported successfully!');
  // };

  const handleCreateProject = () => {
    if (projectName.trim()) {
      alert(`✓ Project "${projectName}" created successfully!`);
      setShowNewProjectModal(false);
      setProjectName('');
      setProjectDescription('');
    } else {
      alert('⚠️ Please enter a project name');
    }
  };

  const stats = [
    {
      title: 'Total Revenue',
      value: '£124,500',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-blue-500',
      period: 'vs last month'
    },
    {
      title: 'New Customers',
      value: '2,847',
      change: '+18.2%',
      trend: 'up',
      icon: Users,
      gradient: 'from-purple-500 via-purple-600 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      iconBg: 'bg-purple-500',
      period: 'this month'
    },
    {
      title: 'Active Projects',
      value: '42',
      change: '+5',
      trend: 'up',
      icon: Briefcase,
      gradient: 'from-green-500 via-green-600 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      iconBg: 'bg-green-500',
      period: 'in progress'
    },
    {
      title: 'Pending Tasks',
      value: '18',
      change: '-3',
      trend: 'down',
      icon: CheckSquare,
      gradient: 'from-orange-500 via-orange-600 to-red-600',
      bgGradient: 'from-orange-50 to-red-50',
      iconBg: 'bg-orange-500',
      period: 'due this week'
    }
  ];

  const quickActions = [
    { 
      name: 'Create Invoice', 
      icon: FileText, 
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Generate new invoice',
      href: '/dashboard/invoicing'
    },
    { 
      name: 'Add Customer', 
      icon: Users, 
      gradient: 'from-purple-500 to-pink-500',
      description: 'New CRM contact',
      href: '/dashboard/crm'
    },
    { 
      name: 'New Task', 
      icon: CheckSquare, 
      gradient: 'from-green-500 to-emerald-500',
      description: 'Create task',
      href: '/dashboard/tasks'
    },
    { 
      name: 'AI Content', 
      icon: Sparkles, 
      gradient: 'from-orange-500 to-red-500',
      description: 'Generate content',
      href: '/dashboard/ai-content'
    },
    { 
      name: 'Send Campaign', 
      icon: Mail, 
      gradient: 'from-indigo-500 to-purple-500',
      description: 'Email marketing',
      href: '/dashboard/campaigns'
    },
    { 
      name: 'View Analytics', 
      icon: BarChart3, 
      gradient: 'from-teal-500 to-cyan-500',
      description: 'KPI dashboard',
      href: '/dashboard/kpi-dashboard'
    },
    { 
      name: 'Book Meeting', 
      icon: Calendar, 
      gradient: 'from-rose-500 to-pink-500',
      description: 'Schedule appointment',
      href: '/dashboard/booking'
    },
    { 
      name: 'Compliance', 
      icon: Shield, 
      gradient: 'from-amber-500 to-orange-500',
      description: 'Regulatory tracking',
      href: '/dashboard/compliance'
    }
  ];

  const recentActivity = [
    { 
      type: 'invoice', 
      title: 'Invoice #INV-1045 paid', 
      client: 'Acme Corporation', 
      amount: '£2,450', 
      time: '2 hours ago',
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    { 
      type: 'customer', 
      title: 'New customer added', 
      client: 'Tech Solutions Ltd', 
      amount: null, 
      time: '4 hours ago',
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    { 
      type: 'task', 
      title: 'Task completed', 
      client: 'Q4 Financial Review', 
      amount: null, 
      time: '6 hours ago',
      icon: CheckSquare,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      type: 'campaign', 
      title: 'Campaign sent', 
      client: '1,250 recipients', 
      amount: null, 
      time: '1 day ago',
      icon: Mail,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    }
  ];

  const upcomingTasks = [
    { 
      title: 'Quarterly VAT Return', 
      dueDate: 'Due in 2 days', 
      priority: 'high',
      category: 'Finance',
      progress: 75
    },
    { 
      title: 'Client Presentation', 
      dueDate: 'Due in 3 days', 
      priority: 'medium',
      category: 'Sales',
      progress: 50
    },
    { 
      title: 'Update Website Content', 
      dueDate: 'Due in 5 days', 
      priority: 'low',
      category: 'Marketing',
      progress: 30
    },
    { 
      title: 'Team Performance Review', 
      dueDate: 'Due in 1 week', 
      priority: 'medium',
      category: 'HR',
      progress: 20
    }
  ];

  // Helper to render company info
  const renderCompanyInfo = (
    companyName: string,
    industry: string,
    seatCount: number,
    maxSeats: number,
    email: string
  ) => (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      {/* Company Name with Icon */}
      <div className="flex items-center gap-4">
        <Building2 className="w-7 h-7 text-white" />
        <div>
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Company</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">{companyName}</h2>
        </div>
      </div>

      {/* Info Pills */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Industry */}
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-300" />
          <span className="text-sm font-medium text-white capitalize">{industry}</span>
        </div>

        {/* Employees */}
        <div className="flex items-center gap-2">
          <UsersRound className="w-4 h-4 text-blue-300" />
          <span className="text-sm font-medium text-white">{seatCount} / {maxSeats} employees</span>
        </div>

        {/* Email */}
        <div className="flex items-center gap-2">
          <AtSign className="w-4 h-4 text-amber-300" />
          <span className="text-sm font-medium text-white">{email}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-8">
      {/* Company Header */}
      {/* Company Header */}
      <div className="rounded-2xl p-6 md:p-8 text-white shadow-lg overflow-hidden relative bg-gradient-to-r from-slate-800/90 via-slate-700/90 to-slate-800/90 backdrop-blur-md border border-white/20">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full -mr-36 -mt-36"></div>
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white rounded-full -mb-24"></div>
        </div>
        
        <div className="relative z-10">
          {loading ? (
            <div className="flex items-center gap-3 py-4">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-300 text-base">Loading...</p>
            </div>
          ) : userData && userData.business ? (
            renderCompanyInfo(
              userData.business.name,
              userData.business.industry,
              userData.business.seatCount,
              userData.business.maxSeats,
              userData.email
            )
          ) : (
            renderCompanyInfo(
              'Egobas Limited',
              'technology',
              1,
              5,
              'godwinbabs@egobas.com'
            )
          )}
        </div>
      </div>

      {/* Team Collaboration Widget */}
      {presence && presence.presence && presence.presence.length > 0 && (
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Team Collaboration
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Circle className={`w-2 h-2 ${presence.onlineCount > 0 ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`} />
              <span>{presence.onlineCount} of {presence.totalCount} online</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {presence.presence.map((member) => (
              <div
                key={member.userId}
                className="flex flex-col items-center p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="relative mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                  </div>
                  {member.isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white text-center">
                  {member.firstName} {member.lastName.charAt(0)}.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                  {member.isOnline ? (
                    <span className="text-green-600 font-medium">● Online</span>
                  ) : (
                    <span className="text-gray-400">Offline</span>
                  )}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <p className="text-sm text-indigo-800 dark:text-indigo-300">
              <strong>Collaboration Enabled:</strong> All team members can see and share business data within {userData?.business?.name || 'your organization'}.
            </p>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          
          return (
            <div
              key={index}
              className={`relative bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-6 border border-white/50 hover:shadow-xl hover:scale-105 transition-all cursor-pointer overflow-hidden group backdrop-blur-sm`}
            >
              {/* Background decoration */}
              <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full group-hover:scale-150 transition-transform`} />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                    stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <TrendIcon className="w-4 h-4" />
                    <span className="text-sm font-bold">{stat.change}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">{stat.title}</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.period}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
          <Zap className="w-6 h-6 text-yellow-500" />
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            
            return (
              <button
                key={index}
                onClick={() => router.push(action.href)}
                className="group relative p-6 rounded-2xl border border-white/40 bg-white/40 hover:bg-white/60 hover:border-transparent hover:shadow-2xl transition-all text-center overflow-hidden cursor-pointer"
              >
                {/* Hover gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white group-hover:text-white transition-colors mb-1">{action.name}</p>
                  <p className="text-xs text-gray-500 group-hover:text-white group-hover:text-opacity-90 transition-colors">{action.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              Recent Activity
            </h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
                >
                  <div className={`p-3 rounded-xl ${activity.bg} group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${activity.color}`} />
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.client}</p>
                  </div>
                  
                  <div className="text-right">
                    {activity.amount && (
                      <p className="font-bold text-gray-900 dark:text-white mb-1">{activity.amount}</p>
                    )}
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Tasks - Takes 1 column */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-green-600" />
              Upcoming Tasks
            </h2>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <div className="space-y-4">
            {upcomingTasks.map((task, index) => {
              const priorityColors = {
                high: 'bg-red-100 text-red-700 border-red-200',
                medium: 'bg-orange-100 text-orange-700 border-orange-200',
                low: 'bg-green-100 text-green-700 border-green-200'
              };
              
              return (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.category}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.dueDate}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm mb-1">Monthly Revenue</p>
              <p className="text-3xl font-bold">£124.5K</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl">
              <LineChart className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 bg-white bg-opacity-20 px-2 py-1 rounded-lg">
              <TrendingUp className="w-4 h-4" />
              <span>+12.5%</span>
            </div>
            <span className="text-blue-100">vs last month</span>
          </div>
        </div>

        {/* Customer Growth */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-purple-100 text-sm mb-1">Customer Growth</p>
              <p className="text-3xl font-bold">+18.2%</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 bg-white bg-opacity-20 px-2 py-1 rounded-lg">
              <TrendingUp className="w-4 h-4" />
              <span>2,847</span>
            </div>
            <span className="text-purple-100">new customers</span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-100 text-sm mb-1">Conversion Rate</p>
              <p className="text-3xl font-bold">24.8%</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl">
              <Target className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 bg-white bg-opacity-20 px-2 py-1 rounded-lg">
              <TrendingUp className="w-4 h-4" />
              <span>+3.2%</span>
            </div>
            <span className="text-green-100">improvement</span>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Performing Products */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Top Performing
          </h2>
          
          <div className="space-y-3">
            {[
              { name: 'Premium Package', sales: '£45,200', growth: '+25%', color: 'from-blue-500 to-cyan-500' },
              { name: 'Standard Plan', sales: '£32,100', growth: '+18%', color: 'from-purple-500 to-pink-500' },
              { name: 'Basic Service', sales: '£28,400', growth: '+12%', color: 'from-green-500 to-emerald-500' }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-lg transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold shadow-lg`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.sales} revenue</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold">
                    {item.growth}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-500" />
            Notifications
            <span className="ml-auto px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">3</span>
          </h2>
          
          <div className="space-y-3">
            {[
              { type: 'urgent', message: 'VAT return due in 2 days', icon: AlertCircle, color: 'red' },
              { type: 'info', message: 'New customer inquiry received', icon: MessageSquare, color: 'blue' },
              { type: 'success', message: 'Invoice #1045 has been paid', icon: CheckSquare, color: 'green' }
            ].map((notification, index) => {
              const Icon = notification.icon;
              const colors = {
                red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
                blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
                green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' }
              };
              const colorScheme = colors[notification.color as keyof typeof colors];
              
              return (
                <div key={index} className={`flex items-center gap-3 p-4 rounded-xl border ${colorScheme.border} ${colorScheme.bg} hover:shadow-lg transition-all cursor-pointer`}>
                  <div className={`p-2 bg-white rounded-lg ${colorScheme.text}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="flex-1 text-sm font-medium text-gray-900 dark:text-white">{notification.message}</p>
                  <button className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                Create New Project
              </h2>
              <button
                onClick={() => {
                  setShowNewProjectModal(false);
                  setProjectName('');
                  setProjectDescription('');
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Add project description..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Priority
                </label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleCreateProject}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Project
                </button>
                <button
                  onClick={() => {
                    setShowNewProjectModal(false);
                    setProjectName('');
                    setProjectDescription('');
                  }}
                  className="px-6 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
