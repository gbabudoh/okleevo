"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  LayoutDashboard, Users, PoundSterling, Calculator, FileText, 
  TrendingUp, FormInput, Calendar, MessageSquare, Mail, 
  CheckSquare, Sparkles, FileEdit, BarChart3, Package, 
  Truck, UserCheck, PenTool, Globe, Shield, X, Inbox,
  LogOut, Settings, Building2, 
  LifeBuoy, Rocket, BookOpen, Bell, Cpu, UsersRound, AtSign
} from 'lucide-react';
import WelcomeGuideModal from '@/components/WelcomeGuideModal';
import IncomingCallModal from '@/components/collaboration/IncomingCallModal';

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

  // Fetch notifications
  useEffect(() => {
    async function fetchNotifications() {
      if (status === 'loading' || !session?.user?.id) return;
      try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
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

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white/60 backdrop-blur-xl border-r border-white/20 z-40 transition-all duration-300 shadow-sm flex flex-col">
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

                  {/* Customer */}
                  {(() => {
                    const customerModules = [
                      { id: 'crm', href: '/dashboard/crm', icon: Users, label: 'CRM' },
                      { id: 'mailbox', href: '/dashboard/mailbox', icon: Inbox, label: 'Mailbox' },
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
      <div className={`ml-64 h-screen overflow-y-auto relative ${sidebarOpen ? 'z-10' : 'z-20'}`} id="main-content">
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
                <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Notifications</h3><button onClick={async () => { await fetch('/api/notifications', { method: 'DELETE' }); window.location.reload(); }} className="text-xs text-indigo-600 font-bold ml-2 cursor-pointer">Clear All</button>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className="p-4 border-b border-gray-50 hover:bg-slate-50 transition-colors cursor-pointer group flex items-start gap-3"
                          onClick={() => {
                            // Handle click (e.g. navigate to link)
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
                          // Mark all as read logic could go here
                          setShowNotifications(false);
                        }}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                {userData?.firstName?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>
        
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
    </div>
  );
}
