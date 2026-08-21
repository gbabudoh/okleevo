"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard, X, Inbox,
  LogOut, Settings, Building2, CreditCard, HelpCircle, ChevronUp,
  LifeBuoy, Rocket, BookOpen, Bell, Compass
} from 'lucide-react';

import WelcomeGuideModal from '@/components/WelcomeGuideModal';
import IncomingCallModal from '@/components/collaboration/IncomingCallModal';
import MobileBottomNav from '@/components/navigation/MobileBottomNav';
import PivotNav from '@/components/navigation/PivotNav';
import { REPLAY_TOUR_EVENT } from '@/components/tours/TourProvider';
import { moduleHasTour } from '@/components/tours/pilot-modules';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
  image?: string | null;
  business: {
    name: string;
    industry: string;
    size: string;
    seatCount: number;
    maxSeats: number;
    enabledModules: string[];
    pivotNavEnabled: boolean;
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
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [activeChatToast, setActiveChatToast] = useState<ChatToastInfo | null>(null);
  const lastSeenChatMsgIdRef = useRef<string | null>(null);
  const [subInfo, setSubInfo] = useState<SubInfo | null>(null);
  const [unreadMailCount, setUnreadMailCount] = useState(0);

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
    const sendHeartbeat = () => fetch('/api/presence', { method: 'POST' }).catch(() => { });
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
        if (error instanceof Error) {
          if (error.name === 'AbortError') return;
          const isNetworkError =
            error.message.includes('Failed to fetch') ||
            error.message.includes('NetworkError') ||
            error.message.includes('Load failed');
          if (isNetworkError) {
            console.warn('Network issue fetching notifications:', error.message);
          } else {
            console.error('Error fetching notifications:', error);
          }
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
      .catch(() => { });
  }, [status, session]);

  // Unread mail badge — fetch on mount and poll every 60s
  useEffect(() => {
    if (status !== 'authenticated') return;
    const fetchUnread = () => {
      fetch('/api/email/inbox')
        .then(r => r.ok ? r.json() : [])
        .then((msgs: { folder: string; status: string }[]) => {
          const count = msgs.filter(m => m.folder === 'INBOX' && m.status === 'UNREAD').length;
          setUnreadMailCount(count);
        })
        .catch(() => { });
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60_000);
    return () => clearInterval(interval);
  }, [status]);

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

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Suspense-isolated scroll to top watcher */}
      <Suspense fallback={null}>
        <ScrollWatcher pathname={pathname} />
      </Suspense>

      {/* Sidebar (Desktop Only) */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 z-40 transition-all duration-300 flex-col">
        <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Okleevo" width={100} height={26} className="h-6 w-auto" />
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {(() => {
            const enabledModules = userData?.business?.enabledModules || [];
            const defaultModules = [
              "dashboard",
              "crm", "invoicing", "mailbox", "booking", "campaigns",
              "collaboration", "tasks", "ai-notes", "kpi-dashboard",
              "e-signature"
            ];

            // Show only enabled modules to the user (excluding hidden modules)
            const finalModules = (enabledModules.length > 0
              ? (enabledModules.includes('invoicing') ? enabledModules : [...enabledModules, 'invoicing'])
              : defaultModules
            ).filter(m => m !== 'helpdesk');

            const isDashboardActive = pathname === '/dashboard';

            return (
              <>
                <Link
                  href="/dashboard"
                  className={`group flex items-center gap-3 px-3 py-2 rounded-lg mb-4 transition-colors ${
                    isDashboardActive ? 'text-orange-700 font-semibold' : 'text-gray-600 hover:text-gray-900 font-medium'
                  }`}
                >
                  <span className={`flex items-center justify-center w-7 h-7 rounded-md shrink-0 transition-colors ${
                    isDashboardActive ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'
                  }`}>
                    <LayoutDashboard className="w-4 h-4" />
                  </span>
                  <span className="text-sm">Dashboard</span>
                </Link>

                <PivotNav finalModules={finalModules} pathname={pathname} unreadMailCount={unreadMailCount} />
              </>
            );
          })()}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 space-y-1 relative">
          <div className="relative">
            <button
              onClick={() => setShowHelpMenu(v => !v)}
              className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50/80 dark:hover:bg-indigo-950/50 transition-all w-full text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1 bg-indigo-100 dark:bg-indigo-900/60 rounded-lg text-indigo-600 dark:text-indigo-300">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className="text-xs">Help &amp; Guides</span>
              </div>
              <ChevronUp className={`w-3.5 h-3.5 transition-transform ${showHelpMenu ? 'rotate-180' : ''}`} />
            </button>

            {showHelpMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowHelpMenu(false)} />
                <div className="absolute bottom-12 left-0 right-0 z-20 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl p-2 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <button
                    onClick={() => { setShowWelcomeGuide(true); setShowHelpMenu(false); }}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors w-full text-left cursor-pointer"
                  >
                    <Rocket className="w-4 h-4 text-indigo-600" />
                    <span>Quick Start Guide</span>
                  </button>
                  {moduleHasTour(pathname?.split('/')[2]) && (
                    <button
                      onClick={() => {
                        const moduleId = pathname?.split('/')[2];
                        if (moduleId) {
                          window.dispatchEvent(new CustomEvent(REPLAY_TOUR_EVENT, { detail: { moduleId } }));
                        }
                        setShowHelpMenu(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors w-full text-left cursor-pointer"
                    >
                      <Compass className="w-4 h-4 text-emerald-600" />
                      <span>Tool Guide</span>
                    </button>
                  )}
                  <Link
                    href="/dashboard/guides"
                    onClick={() => setShowHelpMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>User Manual &amp; Docs</span>
                  </Link>
                  <Link
                    href="/dashboard/support"
                    onClick={() => setShowHelpMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <LifeBuoy className="w-4 h-4 text-amber-600" />
                    <span>Live Support &amp; Ticket</span>
                  </Link>
                </div>
              </>
            )}
          </div>

          <Link href="/dashboard/settings?tab=billing" className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-slate-800/60 transition-colors">
            <CreditCard className="w-4 h-4 text-gray-500" />
            <span>Billing &amp; Plan</span>
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-slate-800/60 transition-colors">
            <Settings className="w-4 h-4 text-gray-500" />
            <span>Settings</span>
          </Link>
          <button
            onClick={async () => {
              try {
                await fetch('/api/auth/logout-session', { method: 'POST', credentials: 'include' });
              } catch (error) {
                console.error('Error deleting session:', error);
              }
              await signOut({ callbackUrl: '/' });
            }}
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors w-full text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-0 md:ml-64 h-screen pb-20 md:pb-0 overflow-y-auto relative" id="main-content">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
          <div className="px-6 py-3.5 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex items-center gap-2 py-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-500">Loading...</p>
                </div>
              ) : userData && userData.business ? (
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="font-semibold text-gray-900 truncate">{userData.business.name}</span>
                  <span className="text-gray-300 shrink-0">·</span>
                  <span className="text-gray-500 capitalize hidden sm:inline shrink-0">{userData.business.industry}</span>
                  <span className="text-gray-300 hidden sm:inline shrink-0">·</span>
                  <span className="text-gray-500 hidden sm:inline shrink-0">{userData.business.seatCount}/{userData.business.maxSeats} seats</span>
                </div>
              ) : null}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
                              <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notification.type === 'error' ? 'bg-red-500' :
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

              {/* Okleevo Platform Support Button */}
              <Link
                href="/dashboard/support"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200/80 text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
                title="Contact Okleevo Support & Admin"
              >
                <HelpCircle className="w-3.5 h-3.5 text-orange-500" />
                <span>Support</span>
              </Link>

              <Link
                href="/dashboard/settings"
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center text-white text-xs font-black shadow-md overflow-hidden hover:ring-2 hover:ring-orange-500/50 transition-all"
                title="Account Settings"
              >
                {userData?.avatar ? (
                  <img src={userData.avatar} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <span>{userData?.firstName?.charAt(0) || 'U'}</span>
                )}
              </Link>
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
              Subscribe · $39/mo
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
                Subscribe for <span className="font-bold text-gray-900">$39/month</span> to keep full access to all 20+ Okleevo modules. Cancel anytime.
              </p>
              <Link
                href="/billing"
                className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-[#ff8c42] text-white font-bold text-lg shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all"
              >
                <CreditCard className="w-5 h-5" />
                Subscribe · $39/month
              </Link>
              <p className="text-xs text-gray-400 mt-4">Secured by Stripe · No lock-in · Cancel anytime</p>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="p-6 relative">
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

function ScrollWatcher({ pathname }: { pathname: string }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname, searchParams]);
  return null;
}
