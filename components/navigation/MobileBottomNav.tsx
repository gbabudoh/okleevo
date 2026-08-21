'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  X, LayoutDashboard, Users,
  Inbox, Menu, LogOut, Settings, BookOpen,
  Calendar, MessageSquare, Mail, UsersRound,
  CheckSquare, FolderKanban, FileEdit, BarChart3,
  PenTool,
  LifeBuoy, Rocket, Search
} from 'lucide-react';
import { signOut } from 'next-auth/react';

const ALL_SECTIONS = [
  {
    label: 'Customer Tools',
    items: [
      { name: 'CRM',          desc: 'Deals & Contacts',   icon: Users,          href: '/dashboard/crm' },
      { name: 'Mailbox',      desc: 'Shared Inbox',       icon: Inbox,          href: '/dashboard/mailbox' },
      { name: 'Appointments', desc: 'Appointment Manager', icon: Calendar, href: '/dashboard/booking' },
      { name: 'Campaigns',    desc: 'Email Marketing',    icon: Mail,           href: '/dashboard/campaigns' },
    ],
  },
  {
    label: 'Team & Collaboration',
    items: [
      { name: 'Collaboration Hub', badge: 'video / messaging', desc: 'video / messaging', icon: UsersRound, href: '/dashboard/collaboration' },
    ],
  },
  {
    label: 'Productivity',
    items: [
      { name: 'Projects',      desc: 'Deliverables & Milestones', icon: FolderKanban, href: '/dashboard/projects' },
      { name: 'Tasks',         desc: 'Kanban Boards',     icon: CheckSquare, href: '/dashboard/tasks' },
      { name: 'AI Notes',      desc: 'Meeting Transcripts', icon: FileEdit,    href: '/dashboard/ai-notes' },
      { name: 'KPI Dashboard', desc: 'Realtime Metrics',  icon: BarChart3,   href: '/dashboard/kpi-dashboard' },
    ],
  },
  {
    label: 'Operations & Legal',
    items: [
      { name: 'E-Signature',   desc: 'Document Signing',  icon: PenTool,     href: '/dashboard/e-signature' },
    ],
  },
];

function ModuleTile({ name, desc, badge, icon: Icon, href, isActive, onClose }: {
  name: string; desc?: string; badge?: string; icon: React.ElementType; href: string; isActive: boolean; onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className={`group flex items-center gap-3 p-2.5 rounded-2xl transition-all cursor-pointer active:scale-95 border ${
        isActive
          ? 'bg-orange-50/80 dark:bg-orange-950/50 border-orange-400/80 ring-1 ring-orange-500/30'
          : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
      }`}
    >
      <span
        className={`flex items-center justify-center w-8 h-8 rounded-xl shrink-0 transition-colors ${
          isActive
            ? 'bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:text-slate-800 dark:group-hover:text-slate-200'
        }`}
      >
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className={`text-xs font-extrabold truncate ${isActive ? 'text-orange-600 dark:text-orange-400' : 'text-slate-900 dark:text-white'}`}>
          {name}
        </div>
        {badge ? (
          <span className="mt-1 inline-flex items-center w-fit px-1.5 py-0.5 rounded-md text-[9px] font-semibold tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700/60 group-hover:bg-orange-50 group-hover:text-orange-600 group-hover:border-orange-200/80 transition-all leading-none">
            {badge}
          </span>
        ) : desc ? (
          <div className="text-[10px] font-medium text-slate-400 truncate">
            {desc}
          </div>
        ) : null}
      </div>
      {isActive && (
        <motion.span
          layoutId="mobile-drawer-active-dot"
          className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mr-1"
          transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
        />
      )}
    </Link>
  );
}

// --- DRAWER COMPONENT ---
function MobileMenuDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredSections = ALL_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            className="fixed bottom-0 left-0 right-0 h-[92vh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-t-[2.5rem] z-[101] flex flex-col overflow-hidden shadow-2xl border-t border-slate-200/80 dark:border-slate-800"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Header & Instant Search */}
            <div className="px-5 pt-2 pb-4 border-b border-slate-200/80 dark:border-slate-800 shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">All Tools</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Command palette &amp; feature launcher</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 bg-white dark:bg-slate-900 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-xs border border-slate-200/80 dark:border-slate-800 active:scale-95 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Instant Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search 11+ tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-2xs"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                  ⌘K
                </span>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

              {/* Dashboard Home Banner */}
              <Link
                href="/dashboard"
                onClick={onClose}
                className={`flex items-center gap-3.5 p-3 rounded-2xl transition-all cursor-pointer active:scale-95 border ${
                  pathname === '/dashboard'
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${pathname === '/dashboard' ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-orange-500 to-amber-600 text-white'}`}>
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-extrabold truncate ${pathname === '/dashboard' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    Dashboard Home
                  </div>
                  <div className={`text-[10px] font-medium truncate ${pathname === '/dashboard' ? 'text-orange-100' : 'text-slate-400'}`}>
                    Overview, KPIs &amp; recent activity
                  </div>
                </div>
                {pathname === '/dashboard' && (
                  <div className="w-2 h-2 rounded-full bg-white shrink-0 mr-1" />
                )}
              </Link>

              {/* Tool sections */}
              {filteredSections.map((section) => (
                <div key={section.label} className="space-y-2.5">
                  <h3 className="text-[11px] font-mono font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                    {section.label}
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {section.items.map((item) => (
                      <ModuleTile
                        key={item.name}
                        name={item.name}
                        desc={item.desc}
                        badge={'badge' in item ? (item as { badge?: string }).badge : undefined}
                        icon={item.icon}
                        href={item.href}
                        isActive={pathname === item.href || (Boolean(pathname) && pathname!.startsWith(item.href + '/'))}
                        onClose={onClose}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Account section */}
              <div className="space-y-2.5">
                <h3 className="text-[11px] font-mono font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                  Account &amp; Resources
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { name: 'Settings',    desc: 'Preferences & Billing', icon: Settings,  href: '/dashboard/settings' },
                    { name: 'User Guide',  desc: 'Docs & Tutorials',     icon: BookOpen,  href: '/dashboard/guides' },
                    { name: 'Support',     desc: 'Help Center',          icon: LifeBuoy,  href: '/dashboard/support' },
                    { name: 'Quick Start', desc: 'Platform Onboarding', icon: Rocket,    href: '/dashboard/guide' },
                  ].map((item) => (
                    <ModuleTile
                      key={item.name}
                      name={item.name}
                      desc={item.desc}
                      icon={item.icon}
                      href={item.href}
                      isActive={pathname === item.href}
                      onClose={onClose}
                    />
                  ))}
                </div>
              </div>

              {/* Sign Out */}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full py-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all border border-rose-200/80 dark:border-rose-900/40 cursor-pointer mt-4"
              >
                <LogOut className="w-4 h-4" />
                Sign Out Account
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// --- BOTTOM NAV COMPONENT ---
export default function MobileBottomNav() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const tabs = [
    { name: 'Home',    href: '/dashboard',          icon: LayoutDashboard },
    { name: 'CRM',     href: '/dashboard/crm',      icon: Users },
    { name: 'Mail',    href: '/dashboard/mailbox',  icon: Inbox },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-t border-gray-200 pb-safe no-select shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className="flex flex-col items-center justify-center w-16 h-14 relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-indigo-50 rounded-2xl -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className={`w-6 h-6 mb-1 transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span className={`text-[10px] font-bold transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                  {tab.name}
                </span>
              </Link>
            );
          })}

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-col items-center justify-center w-16 h-14 relative"
          >
            <Menu className="w-6 h-6 mb-1 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400">Menu</span>
          </button>
        </div>
      </div>

      <MobileMenuDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
