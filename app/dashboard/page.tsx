"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  TrendingUp, Users, CheckSquare,
  DollarSign, Calendar, Clock, ArrowUpRight, ArrowDownRight,
  FileEdit, Plus, BarChart3, Activity, Target,
  Zap, Award, Bell, Mail, PenTool,
  Briefcase, AlertCircle, X,
  UsersRound, Circle, LineChart, Settings,
  Building2, ShieldCheck
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

interface DashboardStat {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
  gradient: string;
  bgGradient: string;
  iconBg: string;
  period: string;
}

const DEFAULT_STATS: DashboardStat[] = [
  {
    title: 'Total Revenue',
    value: '£0',
    change: '+0%',
    trend: 'up',
    icon: DollarSign,
    gradient: 'from-blue-500 via-blue-600 to-indigo-600',
    bgGradient: 'from-blue-50 to-indigo-50',
    iconBg: 'bg-blue-500',
    period: 'vs last month'
  },
  {
    title: 'Total Customers',
    value: '0',
    change: '+0%',
    trend: 'up',
    icon: Users,
    gradient: 'from-purple-500 via-purple-600 to-pink-600',
    bgGradient: 'from-purple-50 to-pink-50',
    iconBg: 'bg-purple-500',
    period: 'total base'
  },
  {
    title: 'Sales Volume',
    value: '0',
    change: '+0%',
    trend: 'up',
    icon: Briefcase,
    gradient: 'from-green-500 via-green-600 to-emerald-600',
    bgGradient: 'from-green-50 to-emerald-50',
    iconBg: 'bg-green-500',
    period: 'units sold'
  },
  {
    title: 'Lead Acquisition',
    value: '0',
    change: '+0%',
    trend: 'up',
    icon: Target,
    gradient: 'from-orange-500 via-orange-600 to-red-600',
    bgGradient: 'from-orange-50 to-red-50',
    iconBg: 'bg-orange-500',
    period: 'potential assets'
  }
];

interface ActivityItem {
  type: string;
  title: string;
  client: string;
  amount: string | null;
  time: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  resource?: string;
}

interface TaskItem {
  title: string;
  dueDate: string;
  priority: string;
  category: string;
  progress: number;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  status: 'unread' | 'read';
  createdAt: string;
  link?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  // Dashboard Data State
  const [stats, setStats] = useState<DashboardStat[]>(DEFAULT_STATS);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<TaskItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
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

  useEffect(() => {
    async function fetchDashboardData() {
      if (status === 'loading' || !session?.user?.id) return;
      
      // Start loading but don't block the UI for stats anymore
      setIsDashboardLoading(true);
      
      try {
        // 1. Fetch all data in parallel for maximum performance
        const [profileRes, kpiRes, activityRes, tasksRes, notifyRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/kpis'),
          fetch('/api/activity?limit=5'),
          fetch('/api/tasks'),
          fetch('/api/notifications')
        ]);

        // 2. Process User Profile
        if (profileRes.ok) {
          const data: UserData = await profileRes.json();
          if (data?.business) setUserData(data);
        }

        // 3. Process KPIs for Stats
        if (kpiRes.ok) {
          const { kpis }: { kpis: { value: string; change: number }[] } = await kpiRes.json();
          const mappedStats: DashboardStat[] = [
            {
              ...DEFAULT_STATS[0],
              value: `£${(parseInt(kpis[0]?.value?.replace(/[^0-9]/g, '') || '0')).toLocaleString()}`,
              change: `${kpis[0]?.change >= 0 ? '+' : ''}${kpis[0]?.change}%`,
              trend: kpis[0]?.change >= 0 ? 'up' : 'down',
            },
            {
              ...DEFAULT_STATS[1],
              value: kpis[6]?.value || '0',
              change: `${kpis[6]?.change >= 0 ? '+' : ''}${kpis[6]?.change}%`,
              trend: kpis[6]?.change >= 0 ? 'up' : 'down',
            },
            {
              ...DEFAULT_STATS[2],
              value: kpis[3]?.value || '0',
              change: `${kpis[3]?.change >= 0 ? '+' : ''}${kpis[3]?.change}%`,
              trend: kpis[3]?.change >= 0 ? 'up' : 'down',
            },
            {
              ...DEFAULT_STATS[3],
              value: kpis[5]?.value || '0',
              change: `${kpis[5]?.change >= 0 ? '+' : ''}${kpis[5]?.change}%`,
              trend: kpis[5]?.change >= 0 ? 'up' : 'down',
            }
          ];
          setStats(mappedStats);
        }

        // 4. Process Recent Activity
        if (activityRes.ok) {
          const { activity } = await activityRes.json();
          const mappedActivity = activity.map((a: {
            type: string;
            action: string;
            resource: string;
            user: { name: string };
            metadata?: { amount?: number };
            timestamp: string;
          }) => ({
            type: a.type,
            title: `${a.type.charAt(0).toUpperCase() + a.type.slice(1)} ${a.action}: ${a.resource}`,
            client: a.user.name,
            amount: a.metadata?.amount ? `£${a.metadata.amount.toLocaleString()}` : null,
            time: new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            icon: a.type === 'invoice' ? DollarSign : a.type === 'contact' ? Users : a.type === 'task' ? CheckSquare : Mail,
            color: a.type === 'invoice' ? 'text-green-600' : a.type === 'contact' ? 'text-purple-600' : 'text-blue-600',
            bg: a.type === 'invoice' ? 'bg-green-50' : a.type === 'contact' ? 'bg-purple-50' : 'bg-blue-50',
            resource: a.resource
          }));
          setRecentActivity(mappedActivity);
        }

        // 5. Process Tasks
        if (tasksRes.ok) {
          const tasks = await tasksRes.json();
          const upcoming = tasks
            .filter((t: { status: string }) => t.status !== 'done')
            .slice(0, 4)
            .map((t: { 
              title: string; 
              dueDate?: string; 
              priority: string; 
              tags?: string[]; 
              status: string 
            }) => ({
              title: t.title,
              dueDate: t.dueDate ? `Due ${t.dueDate}` : 'No due date',
              priority: t.priority,
              category: t.tags?.[0] || 'Task',
              progress: t.status === 'in_progress' ? 50 : 10
            }));
          setUpcomingTasks(upcoming);
        }

        // 6. Process Notifications
        if (notifyRes.ok) {
          const data: NotificationItem[] = await notifyRes.json();
          setNotifications(data);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsDashboardLoading(false);
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [session, status]);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'read' })
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

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

  const quickActions = [
    {
      name: 'Team Huddle',
      icon: UsersRound,
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Start a voice huddle',
      href: '/dashboard/collaboration'
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
      name: 'AI Notes',
      icon: FileEdit,
      gradient: 'from-orange-500 to-red-500',
      description: 'Summarize a meeting',
      href: '/dashboard/ai-notes'
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
      name: 'E-Signature',
      icon: PenTool,
      gradient: 'from-amber-500 to-orange-500',
      description: 'Send for signature',
      href: '/dashboard/e-signature'
    }
  ];

  // Helper to render company info in sleek executive style
  const renderCompanyInfo = (
    companyName: string,
    industry: string,
    seatCount: number,
    maxSeats: number,
    email: string
  ) => {
    const seatPercentage = maxSeats > 0 ? Math.min(100, Math.round((seatCount / maxSeats) * 100)) : 0;
    const onlineCount = presence?.onlineCount || 1;

    return (
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Company Identity & Metadata */}
        <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
          {/* Refined Geometric Brand Monogram */}
          <div className="relative shrink-0">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 text-white font-black text-2xl shadow-sm border border-slate-700/60 dark:border-slate-700 select-none">
              {companyName.charAt(0).toUpperCase()}
            </div>
            {/* Live Workspace Status Ring */}
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-xs" />
            </span>
          </div>

          <div className="min-w-0 space-y-1.5">
            {/* Title & Verified Badge */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                {companyName}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Verified Workspace</span>
              </span>
            </div>

            {/* Structured Minimalist Metadata */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs text-slate-500 dark:text-slate-400 font-medium">
              {/* Industry Tag */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="capitalize font-semibold">{industry || 'Enterprise'}</span>
              </div>

              {/* Seat Capacity with micro meter */}
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {seatCount} / {maxSeats} <span className="text-slate-400 font-normal">Seats</span>
                </span>
                <div className="w-10 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shrink-0">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${seatPercentage}%` }}
                  />
                </div>
              </div>

              {/* Workspace Contact / Domain */}
              {email && (
                <div className="hidden md:inline-flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-mono text-[11px] truncate">
                  <span>·</span>
                  <span className="truncate">{email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sleek Enterprise Action Bar */}
        <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
          <button
            onClick={() => router.push('/dashboard/collaboration')}
            className="group relative inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
          >
            <UsersRound className="w-3.5 h-3.5 text-orange-400 dark:text-orange-600 transition-transform group-hover:scale-110" />
            <span>Team Hub</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 dark:bg-slate-900/15 text-[10px] font-mono font-extrabold text-orange-300 dark:text-orange-700">
              {onlineCount} Live
            </span>
          </button>

          <button
            onClick={() => router.push('/dashboard/settings')}
            className="group inline-flex items-center gap-2 px-3.5 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200/80 dark:border-slate-800 transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
            title="Workspace Settings"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-45 transition-transform" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Company Header */}
      <div className="rounded-3xl p-6 sm:p-7 md:p-8 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden transition-all">
        {/* Subtle ambient gradient flare */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500/8 via-amber-500/4 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-900/3 dark:bg-white/2 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10">
          {loading ? (
            <div className="flex items-center gap-3 py-4">
              <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-xs font-mono font-bold">Loading workspace details…</p>
            </div>
          ) : userData && userData.business ? (
            renderCompanyInfo(
              userData.business.name,
              userData.business.industry,
              presence?.totalCount || userData.business.seatCount,
              userData.business.maxSeats,
              userData.email
            )
          ) : (
            renderCompanyInfo(
              'Business Name',
              'industry',
              presence?.totalCount || 0,
              0,
              'email@example.com'
            )
          )}
        </div>
      </div>

      {/* Team Collaboration Widget */}
      {presence && presence.presence && presence.presence.length > 0 && (
        <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-2xs">
          <div className="flex items-center justify-between mb-5 gap-2">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200/80 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-xs">
                <Users className="w-4 h-4" />
              </div>
              <span>Team Presence & Activity</span>
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/60 uppercase shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>{presence.onlineCount} OF {presence.totalCount} ONLINE</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {presence.presence.map((member) => (
              <div
                key={member.userId}
                className="flex flex-col items-center p-3.5 sm:p-4 rounded-3xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 hover:border-orange-400/80 transition-all shadow-2xs group text-center"
              >
                <div className="relative mb-2.5">
                  <div className="w-12 h-12 sm:w-13 sm:h-13 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl flex items-center justify-center font-extrabold text-xs sm:text-sm shadow-2xs overflow-hidden border border-slate-200/80 dark:border-slate-800 group-hover:border-orange-400/80 transition-colors">
                    {member.image ? (
                      <img src={member.image} alt={`${member.firstName} ${member.lastName}`} className="w-full h-full object-cover" />
                    ) : (
                      <span>{member.firstName.charAt(0)}{member.lastName.charAt(0)}</span>
                    )}
                  </div>
                  {member.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full shadow-xs"></div>
                  )}
                </div>
                <div className="w-full min-h-[32px] flex items-center justify-center">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white text-center leading-tight break-words group-hover:text-orange-500 transition-colors">
                    {member.firstName} {member.lastName}
                  </p>
                </div>
                <p className="text-[9px] sm:text-[10px] font-mono font-bold text-center mt-1">
                  {member.isOnline ? (
                    <span className="text-emerald-600 dark:text-emerald-400">● ONLINE</span>
                  ) : (
                    <span className="text-slate-400 uppercase">OFFLINE</span>
                  )}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-5 p-4 bg-orange-50/40 dark:bg-orange-950/20 rounded-3xl border border-orange-200/60 dark:border-orange-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
            <p className="text-xs text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
              <strong className="text-orange-600 dark:text-orange-400">Collaboration Hub:</strong> Team data, HD video calls, and voice channels are active for {userData?.business?.name || 'your organisation'}.
            </p>
            <button 
              onClick={() => router.push('/dashboard/collaboration')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-extrabold rounded-2xl transition-all shadow-sm shadow-orange-500/20 active:scale-95 cursor-pointer shrink-0"
            >
              <UsersRound className="w-3.5 h-3.5" />
              <span>Open Collaboration Hub</span>
            </button>
          </div>
        </div>
      )}

      {/* Telemetry KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          const isZeroChange = stat.change === '+0%' || stat.change === '0%';
          const isHydrating = loading && (stat.value === '£0' || stat.value === '0');
          
          return (
            <div
              key={index}
              className={`relative bg-white dark:bg-slate-950 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 hover:border-orange-400/80 transition-all cursor-pointer overflow-hidden group shadow-2xs ${isHydrating ? 'opacity-70' : 'opacity-100'}`}
            >
              {/* Background decoration */}
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-orange-500/5 rounded-full group-hover:scale-150 transition-transform pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-orange-100 dark:group-hover:bg-orange-950/80 group-hover:text-orange-600 flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase border ${
                    isZeroChange 
                      ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 border-slate-200/60 dark:border-slate-800' 
                      : stat.trend === 'up' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/40' 
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-900/40'
                  }`}>
                    {!isZeroChange && <TrendIcon className="w-3 h-3" />}
                    <span>{isZeroChange ? 'NO CHANGE' : stat.change}</span>
                  </div>
                </div>
                
                <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider font-mono mb-1">{stat.title}</p>
                <p className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 dark:text-white mb-1 tracking-tight">{stat.value}</p>
                <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">{stat.period}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions Hub */}
      <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-2xs">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200/80 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-xs">
            <Zap className="w-4 h-4" />
          </div>
          Quick Actions & Short-Cuts
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            
            return (
              <button
                key={index}
                onClick={() => router.push(action.href)}
                className="group relative p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-orange-400/80 transition-all text-center overflow-hidden cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-orange-100 dark:group-hover:bg-orange-950/80 group-hover:text-orange-600 dark:group-hover:text-orange-400 flex items-center justify-center mx-auto mb-3 transition-colors shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors mb-1 truncate">{action.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 transition-colors truncate">{action.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Recent Activity - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-2xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-900">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-2xs">
                <Activity className="w-4 h-4" />
              </div>
              Recent Workspace Activity
            </h2>
            <button className="text-xs font-extrabold text-orange-500 hover:text-orange-600 flex items-center gap-1 cursor-pointer">
              View All
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="space-y-3.5">
            {isDashboardLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-900 animate-pulse rounded-2xl" />
              ))
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 hover:border-orange-400/80 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-500 flex items-center justify-center shrink-0 border border-orange-200/60">
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors truncate">{activity.title}</p>
                      <p className="text-[10px] font-mono font-bold text-slate-400 truncate">{activity.client}</p>
                    </div>
                    
                    <div className="text-right shrink-0">
                      {activity.amount && (
                        <p className="text-xs font-extrabold font-mono text-slate-900 dark:text-white mb-0.5">{activity.amount}</p>
                      )}
                      <p className="text-[10px] font-mono font-bold text-slate-400">{activity.time}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-400 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-xs font-mono font-bold">No recent activity recorded.</p>
                <p className="text-[10px] font-mono text-slate-400 mt-1">Activities from Tasks, Invoices, and CRM will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Tasks - Takes 1 column */}
        <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-2xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-900">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-2xs">
                <CheckSquare className="w-4 h-4" />
              </div>
              Upcoming Tasks
            </h2>
            <button 
              onClick={() => router.push('/dashboard/tasks')}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-orange-50 text-slate-500 hover:text-orange-500 flex items-center justify-center transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-800"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {isDashboardLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-100 dark:bg-slate-900 animate-pulse rounded-2xl" />
              ))
            ) : upcomingTasks.length > 0 ? (
              upcomingTasks.map((task, index) => {
                const priorityColors = {
                  high: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-900/40',
                  medium: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/40',
                  low: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/40'
                };
                
                return (
                  <div
                    key={index}
                    className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 hover:border-orange-400/80 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors mb-0.5 truncate">{task.title}</p>
                        <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">{task.category}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase border shrink-0 ${priorityColors[task.priority as keyof typeof priorityColors] || 'bg-slate-100 text-slate-500'}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-orange-500" />
                          {task.dueDate}
                        </span>
                        <span className="text-slate-900 dark:text-white font-extrabold">{task.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-600 rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-400 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-xs font-mono font-bold">All caught up!</p>
                <p className="text-[10px] font-mono text-slate-400 mt-1">No pending tasks assigned.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
        {[
          { label: 'Monthly Revenue', value: stats[0]?.value || '£0', change: stats[0]?.change || '0%', sub: 'vs last month', icon: LineChart },
          { label: 'Customer Growth', value: stats[1]?.change || '0%', change: stats[1]?.value || '0', sub: 'new customers', icon: Users },
          { label: 'Conversion Rate', value: stats[2]?.value || '0', change: stats[2]?.change || '0%', sub: 'improvement', icon: Target },
        ].map(({ label, value, change, sub, icon: Icon }) => (
          <div key={label} className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider font-mono">{label}</p>
              <div className="w-9 h-9 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-500 flex items-center justify-center border border-orange-200/60">
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white mb-3">{value}</p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 uppercase">
                <TrendingUp className="w-3 h-3" />
                {change}
              </span>
              <span className="text-xs font-bold text-slate-400">{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {/* Top Performing Items */}
        <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-2xs">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-900">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-2xs">
              <Award className="w-4 h-4" />
            </div>
            Top Performing Services
          </h2>
          
          <div className="space-y-3.5">
            {!isDashboardLoading && recentActivity.filter(a => a.type === 'invoice').length > 0 ? (
              recentActivity.filter(a => a.type === 'invoice').slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 flex items-center justify-center text-white font-extrabold text-xs shadow-2xs shrink-0 font-mono">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{item.resource || 'Premium Item'}</p>
                    <p className="text-[10px] font-mono font-bold text-slate-400">{item.amount || '£0'} revenue</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 rounded-full text-[9px] font-mono font-extrabold uppercase">
                      ACTIVE
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-xs font-mono font-bold">No sales data yet recorded.</p>
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-2xs">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-900">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-2xs">
              <Bell className="w-4 h-4" />
            </div>
            System Notifications
            {notifications.length > 0 && (
              <span className="ml-auto px-2.5 py-0.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-[10px] font-mono font-extrabold rounded-full shadow-2xs">
                {notifications.length}
              </span>
            )}
          </h2>
          
          <div className="space-y-3.5">
            {notifications.length > 0 ? (
              notifications.map((notification) => {
                const colors: Record<string, { bg: string, text: string, border: string, icon: React.ElementType }> = {
                  error: { bg: 'bg-rose-50 dark:bg-rose-950/60', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200/60 dark:border-rose-900/40', icon: Bell },
                  info: { bg: 'bg-slate-50 dark:bg-slate-900/40', text: 'text-orange-500', border: 'border-slate-200/80 dark:border-slate-800', icon: Bell },
                  success: { bg: 'bg-emerald-50 dark:bg-emerald-950/60', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200/60 dark:border-emerald-900/40', icon: CheckSquare },
                  warning: { bg: 'bg-amber-50 dark:bg-amber-950/60', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200/60 dark:border-amber-900/40', icon: AlertCircle }
                };
                const colorScheme = colors[notification.type] || colors.info;
                const Icon = colorScheme.icon;
                
                return (
                  <div 
                    key={notification.id} 
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border ${colorScheme.border} ${colorScheme.bg} transition-all cursor-pointer group shadow-2xs`}
                  >
                    <div className={`p-2 rounded-xl bg-white dark:bg-slate-950 ${colorScheme.text} border border-slate-200/60 dark:border-slate-800 shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{notification.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-relaxed">{notification.message}</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                      title="Mark as read"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-400 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-xs font-mono font-bold">No new notifications.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
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
            
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
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
