"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard, Users, PoundSterling, Calculator, FileText,
  TrendingUp, FormInput, Calendar, MessageSquare, Mail,
  CheckSquare, Sparkles, FileEdit, BarChart3, Package,
  Truck, UserCheck, PenTool, Globe, Shield, X, Inbox,
  LogOut, Settings, Building2, CreditCard,
  LifeBuoy, Rocket, BookOpen, Bell, Cpu, UsersRound, AtSign
} from 'lucide-react';

import WelcomeGuideModal from '@/components/WelcomeGuideModal';
import IncomingCallModal from '@/components/collaboration/IncomingCallModal';
import MobileBottomNav from '@/components/navigation/MobileBottomNav';

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
    enabledModules: string[];
    createdAt: string;
  };
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  status: 'unread' | 'read';
  createdAt: string;
  link?: string;
  metadata?: Record<string, string> | string | null;
}

type SubInfo = { status: string; isActive: boolean; daysLeft: number | null };

interface ChatToastInfo {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen] = useState(true);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
  const [activeChatToast, setActiveChatToast] = useState<ChatToastInfo | null>(null);
  const lastSeenChatMsgIdRef = useRef<string | null>(null);
  const [subInfo, setSubInfo] = useState<SubInfo | null>(null);

  // Check for new users to show welcome guide automatically
  useEffect(() => {
    if (userData?.business?.createdAt) {
      const createdDate = new Date(userData.business.createdAt);
      const now = new Date();
      const diffInMinutes = (now.getTime() - createdDate.getTime()) / (1000 * 60);
      
      const hasSeenSession = sessionStorage.getItem('hasSeenWelcomeGuide');
      
      if (diffInMinutes < 10 && !hasSeenSession) {
        setShowWelcomeGuide(true);
        sessionStorage.setItem('hasSeenWelcomeGuide', 'true');
      }
    }
  }, [userData]);

  const router = useRouter();

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
        
        if (response.ok) {
          const data = await response.json();
          
          if (data && data.business) {
            setUserData(data);
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

  // Presence heartbeat — keeps this user marked "online" on every dashboard page
  useEffect(() => {
    if (status === 'loading' || !session?.user?.id) return;
    const sendHeartbeat = () => fetch('/api/presence', { method: 'POST' }).catch(() => {});
    sendHeartbeat(); // immediate on mount
    const interval = setInterval(sendHeartbeat, 15000);
    return () => clearInterval(interval);
  }, [session?.user?.id, status]);

  // Fetch notifications (snappy 5-second polling for live call and chat detection)
  useEffect(() => {
    let controller = new AbortController();

    async function fetchNotifications() {
      if (status === 'loading' || !session?.user?.id) return;
      controller.abort();
      controller = new AbortController();
      try {
        const response = await fetch('/api/notifications', { signal: controller.signal });
        if (response.ok) {
          const data = await response.json();
          console.log("[LAYOUT_POLL] Fetched notifications count:", data.length, data);
          setNotifications(data);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching notifications:', error);
        }
      }
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // snappy 5s poll
    return () => {
      clearInterval(interval);
      controller.abort();
    };
  }, [session, status]);

  // Handle live incoming chat notifications toast
  useEffect(() => {
    console.log("[LAYOUT_TOAST] Total notifications count in state:", notifications.length);
    const chatNotification = notifications.find(
      n => n.type?.toUpperCase() === 'CHAT_MESSAGE' && n.status === 'unread'
    );
    console.log("[LAYOUT_TOAST] Found chatNotification:", chatNotification);
    
    if (chatNotification) {
      if (lastSeenChatMsgIdRef.current !== chatNotification.id) {
        lastSeenChatMsgIdRef.current = chatNotification.id;
        
        const meta = chatNotification.metadata;
        console.log("[LAYOUT_TOAST] Raw metadata:", meta);
        let parsedMeta: Record<string, string> | null = null;
        if (typeof meta === 'string') {
          try {
            parsedMeta = JSON.parse(meta) as Record<string, string>;
          } catch (e) {
            console.error('Failed to parse chat metadata:', e);
          }
        } else if (meta && typeof meta === 'object') {
          parsedMeta = meta;
        }
        
        console.log("[LAYOUT_TOAST] Parsed metadata object:", parsedMeta);
        
        if (parsedMeta) {
          setActiveChatToast({
            id: chatNotification.id,
            senderId: parsedMeta.senderId || '',
            senderName: parsedMeta.senderName || 'Team Member',
            content: parsedMeta.content || ''
          });

          // Auto-clear toast after 6 seconds
          setTimeout(() => {
            setActiveChatToast(current => {
              if (current?.id === chatNotification.id) {
                return null;
              }
              return current;
            });
          }, 6000);
        }
      }
    } else {
      setActiveChatToast(null);
    }
  }, [notifications]);

  // Fetch subscription status after session is ready
  useEffect(() => {
    if (status !== 'authenticated') return;
    const userRole = (session?.user as { role?: string })?.role;
    if (userRole === 'SUPER_ADMIN') return;
    fetch('/api/billing/status')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setSubInfo(data); })
      .catch(() => {});
  }, [status, session]);

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

  // Scroll to top on route change
  useEffect(() => {
    // Scroll both window and main content area to top
    window.scrollTo(0, 0);
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[100px] animate-blob mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-400/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply" />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-purple-400/20 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply" />
      </div>

      {/* Sidebar (Desktop Only) */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white/60 backdrop-blur-xl border-r border-white/20 z-40 transition-all duration-300 shadow-sm flex-col">
        <div className="p-6 border-b border-white/20 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Okleevo" width={120} height={32} className="h-8 w-auto" />
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {(() => {
            const enabledModules = userData?.business?.enabledModules || [];
            const defaultModules = [
              "dashboard", "invoicing", "accounting", "taxation", "cashflow", "expenses", "vat-tools",
              "crm", "mailbox", "forms", "booking", "helpdesk", "campaigns",
              "collaboration", "tasks", "ai-content", "ai-notes", "kpi-dashboard",
              "inventory", "suppliers", "hr-records", "e-signature", "micro-pages", "compliance"
            ];
            
            // In development, we show all modules to the user
            const finalModules = process.env.NODE_ENV === 'development' 
              ? defaultModules 
              : (enabledModules.length > 0 ? enabledModules : defaultModules);

            return (
              <>
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                  style={{ backgroundColor: '#fc68131a', color: '#fc6813' }}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                
                <div className="space-y-4">
                  {/* Finance */}
                  {(() => {
                    const financeModules = [
                      { id: 'invoicing', href: '/dashboard/invoicing', icon: PoundSterling, label: 'Invoicing' },
                      { id: 'accounting', href: '/dashboard/accounting', icon: Calculator, label: 'Accounting' },
                      { id: 'taxation', href: '/dashboard/taxation', icon: FileText, label: 'Taxation' },
                      { id: 'cashflow', href: '/dashboard/cashflow', icon: TrendingUp, label: 'Cashflow' },
                      { id: 'expenses', href: '/dashboard/expenses', icon: FileText, label: 'Expenses' },
                      { id: 'vat-tools', href: '/dashboard/vat-tools', icon: Calculator, label: 'VAT Tools' },
                    ].filter(m => finalModules.includes(m.id));

                    if (financeModules.length === 0) return null;
                    return (
                      <div className="pt-4">
                        <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Finance</p>
                        {financeModules.map(m => (
                          <Link key={m.id} href={m.href} className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white/50 transition-colors">
                            <m.icon className="w-5 h-5" /> {m.label}
                          </Link>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Okleevo Mail Engine — standalone section */}
                  {finalModules.includes('mailbox') && (
                    <div className="pt-4">
                      <p className="px-4 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#fc6813' }}>
                        Okleevo Mail Engine
                      </p>
                      <Link
                        href="/dashboard/mailbox"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition-all group"
                        style={{
                          background: 'linear-gradient(135deg, #fc681308 0%, #ff8c4208 100%)',
                          border: '1px solid #fc681320',
                          color: '#fc6813',
                        }}
                      >
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0" style={{ background: 'linear-gradient(135deg, #fc6813, #ff8c42)' }}>
                          <Mail className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm">Mail Engine</span>
                        </div>
                      </Link>
                    </div>
                  )}

                  {/* Customer */}
                  {(() => {
                    const customerModules = [
                      { id: 'crm', href: '/dashboard/crm', icon: Users, label: 'CRM' },
                      { id: 'forms', href: '/dashboard/forms', icon: FormInput, label: 'Forms' },
                      { id: 'booking', href: '/dashboard/booking', icon: Calendar, label: 'Booking' },
                      { id: 'helpdesk', href: '/dashboard/helpdesk', icon: MessageSquare, label: 'Helpdesk' },
                      { id: 'campaigns', href: '/dashboard/campaigns', icon: Mail, label: 'Campaigns' },
                    ].filter(m => finalModules.includes(m.id));

                    return (
                      <div className="pt-4">
                        <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Customer</p>
                        {customerModules.map(m => (
                          <Link key={m.id} href={m.href} className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white/50 transition-colors">
                            <m.icon className="w-5 h-5" /> {m.label}
                          </Link>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Team */}
                  {(() => {
                    const teamModules = [
                      { id: 'collaboration', href: '/dashboard/collaboration', icon: UsersRound, label: 'Collaboration' },
                    ];

                    if (teamModules.length === 0) return null;
                    return (
                      <div className="pt-4">
                        <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Team</p>
                        {teamModules.map(m => (
                          <Link key={m.id} href={m.href} className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white/50 transition-colors">
                            <m.icon className="w-5 h-5" /> {m.label}
                          </Link>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Productivity */}
                  {(() => {
                    const productivityModules = [
                      { id: 'tasks', href: '/dashboard/tasks', icon: CheckSquare, label: 'Tasks' },
                      { id: 'ai-content', href: '/dashboard/ai-content', icon: Sparkles, label: 'AI Content' },
                      { id: 'ai-notes', href: '/dashboard/ai-notes', icon: FileEdit, label: 'AI Notes' },
                      { id: 'kpi-dashboard', href: '/dashboard/kpi-dashboard', icon: BarChart3, label: 'KPI Dashboard' },
                    ].filter(m => finalModules.includes(m.id));

                    if (productivityModules.length === 0) return null;
                    return (
                      <div className="pt-4">
                        <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Productivity</p>
                        {productivityModules.map(m => (
                          <Link key={m.id} href={m.href} className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white/50 transition-colors">
                            <m.icon className="w-5 h-5" /> {m.label}
                          </Link>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Operations */}
                  {(() => {
                    const operationsModules = [
                      { id: 'inventory', href: '/dashboard/inventory', icon: Package, label: 'Inventory' },
                      { id: 'suppliers', href: '/dashboard/suppliers', icon: Truck, label: 'Suppliers' },
                      { id: 'hr-records', href: '/dashboard/hr-records', icon: UserCheck, label: 'HR Records' },
                      { id: 'e-signature', href: '/dashboard/e-signature', icon: PenTool, label: 'E-Signature' },
                      { id: 'micro-pages', href: '/dashboard/micro-pages', icon: Globe, label: 'Micro Pages' },
                      { id: 'compliance', href: '/dashboard/compliance', icon: Shield, label: 'Compliance' },
                    ].filter(m => finalModules.includes(m.id));

                    if (operationsModules.length === 0) return null;
                    return (
                      <div className="pt-4">
                        <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Operations</p>
                        {operationsModules.map(m => (
                          <Link key={m.id} href={m.href} className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white/50 transition-colors">
                            <m.icon className="w-5 h-5" /> {m.label}
                          </Link>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </>
            );
          })()}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/20 bg-white/60 backdrop-blur-xl space-y-2">
          <button 
            onClick={() => setShowWelcomeGuide(true)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-indigo-600 font-bold hover:bg-white/50 transition-colors w-full text-left cursor-pointer"
          >
            <Rocket className="w-5 h-5" />
            <span>Quick Start Guide</span>
          </button>
          <Link href="/guide" target="_blank" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white/50 transition-colors">
            <BookOpen className="w-5 h-5" />
            <span>User Guide</span>
          </Link>
          <Link href="/dashboard/support" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white/50 transition-colors">
            <LifeBuoy className="w-5 h-5" />
            <span>Support</span>
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white/50 transition-colors">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
          <button
            onClick={async () => {
              // Delete session from database before signing out
              try {
                await fetch('/api/auth/logout-session', {
                  method: 'POST',
                  credentials: 'include',
                });
                // Continue with logout even if session deletion fails
              } catch (error) {
                console.error('Error deleting session:', error);
              }
              // Sign out and redirect to homepage
              await signOut({ callbackUrl: '/' });
            }}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white/50 transition-colors w-full text-left cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className={`ml-0 md:ml-64 h-screen pb-20 md:pb-0 overflow-y-auto relative ${sidebarOpen ? 'z-10' : 'z-20'}`} id="main-content">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-md border-b border-white/20">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex-1">
              {loading ? (
                <div className="flex items-center gap-2 py-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-500">Loading...</p>
                </div>
              ) : userData && userData.business ? (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 border border-white/50 rounded-lg shadow-sm">
                    <Building2 className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-semibold text-slate-800">{userData.business.name}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50/50 border border-emerald-100/50 rounded-lg shadow-sm">
                    <Cpu className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-emerald-700 capitalize">{userData.business.industry}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 border border-blue-100/50 rounded-lg shadow-sm">
                    <UsersRound className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700">{userData.business.seatCount} / {userData.business.maxSeats} employees</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50/50 border border-amber-100/50 rounded-lg shadow-sm">
                    <AtSign className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-amber-700">{userData.email}</span>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-white/50 transition-colors relative cursor-pointer"
              >
                <Bell className={`w-5 h-5 ${notifications.length > 0 ? 'text-orange-500' : 'text-gray-600'}`} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  {/* Mobile backdrop */}
                  <div className="fixed inset-0 bg-black/30 z-40 sm:hidden" onClick={() => setShowNotifications(false)} />
                  <div className="fixed left-1/2 -translate-x-1/2 top-16 w-[calc(100%-2rem)] max-w-sm z-50 sm:absolute sm:left-auto sm:translate-x-0 sm:inset-auto sm:top-full sm:right-0 sm:mt-2 sm:w-80 bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                      <div className="flex items-center gap-3">
                        <button onClick={async () => { const res = await fetch('/api/notifications', { method: 'DELETE' }); if (res.ok) setNotifications([]); }} className="text-xs text-indigo-600 font-bold cursor-pointer">Clear All</button>
                        <button 
                          onClick={() => setShowNotifications(false)}
                          className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className="p-4 border-b border-gray-50 hover:bg-slate-50 transition-colors cursor-pointer group flex items-start gap-3"
                            onClick={() => {
                              if (notification.link) router.push(notification.link);
                              markAsRead(notification.id);
                              setShowNotifications(false);
                            }}
                          >
                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                              notification.type === 'error' ? 'bg-red-500' : 
                              notification.type === 'success' ? 'bg-emerald-500' : 
                              'bg-blue-500'
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                              <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notification.message}</p>
                              <p className="text-[10px] text-gray-400 mt-1">
                                {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-red-400 transition-all"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <p className="text-sm">All caught up!</p>
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-3 bg-slate-50 text-center border-t border-gray-100">
                        <button 
                          onClick={() => {
                            setShowNotifications(false);
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                        >
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
              </div>
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                {userData?.firstName?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>
        
        {/* Trial warning banner — shown when ≤ 7 days left */}
        {subInfo?.status === 'TRIAL' && subInfo.isActive && typeof subInfo.daysLeft === 'number' && subInfo.daysLeft <= 7 && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-amber-800">
              {subInfo.daysLeft === 0
                ? 'Your free trial ends today.'
                : `Your free trial ends in ${subInfo.daysLeft} day${subInfo.daysLeft === 1 ? '' : 's'}.`}
            </p>
            <Link
              href="/billing"
              className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
            >
              Subscribe · £9.99/mo
            </Link>
          </div>
        )}

        {/* Expired paywall — full-screen overlay */}
        {subInfo && !subInfo.isActive && subInfo.status !== 'ACTIVE' && subInfo.status !== 'NONE' && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 max-w-md w-full mx-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">
                {subInfo.status === 'CANCELED' ? 'Subscription Cancelled' : 'Your Free Trial Has Ended'}
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Subscribe for <span className="font-bold text-gray-900">£9.99/month</span> to keep full access to all 20+ Okleevo modules. Cancel anytime.
              </p>
              <Link
                href="/billing"
                className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-[#ff8c42] text-white font-bold text-lg shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all"
              >
                <CreditCard className="w-5 h-5" />
                Subscribe · £9.99/month
              </Link>
              <p className="text-xs text-gray-400 mt-4">Secured by Stripe · No lock-in · Cancel anytime</p>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="p-6 relative z-10">
          {children}
        </main>
      </div>

      {/* Welcome Guide Modal */}
      <WelcomeGuideModal 
        isOpen={showWelcomeGuide} 
        onClose={() => setShowWelcomeGuide(false)} 
        businessName={userData?.business?.name || 'Business'} 
      />
      <IncomingCallModal />
      
      {/* ── Chat Toast Popup ── */}
      {activeChatToast && (
        <div 
          onClick={async () => {
            await markAsRead(activeChatToast.id);
            setActiveChatToast(null);
            router.push(`/dashboard/collaboration?chat=${activeChatToast.senderId}`);
          }}
          className="fixed bottom-24 right-4 left-4 sm:bottom-6 sm:left-auto sm:right-6 sm:w-80 bg-white dark:bg-slate-900 border-2 border-indigo-600 rounded-2xl shadow-2xl p-4 z-[9999] cursor-pointer animate-in fade-in slide-in-from-bottom-10 duration-300 hover:scale-[1.02] active:scale-98 transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {activeChatToast.senderName.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">New Chat Message</span>
                <span className="text-[9px] font-bold text-slate-400">Just now</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mt-0.5">
                {activeChatToast.senderName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                {activeChatToast.content}
              </p>
            </div>
          </div>
        </div>
      )}

      <MobileBottomNav />
    </div>
  );
}
