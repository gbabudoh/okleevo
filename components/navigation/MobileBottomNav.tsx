'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  X, LayoutDashboard, Users, PoundSterling,
  Inbox, Menu, LogOut, Settings, BookOpen,
  Calculator, FileText, TrendingUp, FormInput,
  Calendar, MessageSquare, Mail, UsersRound,
  CheckSquare, Sparkles, FileEdit, BarChart3,
  Package, Truck, UserCheck, PenTool, Globe, Shield,
  LifeBuoy, Rocket
} from 'lucide-react';
import { signOut } from 'next-auth/react';

const ALL_SECTIONS = [
  {
    label: 'Finance',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    items: [
      { name: 'Invoicing',   icon: PoundSterling, href: '/dashboard/invoicing',     color: 'from-emerald-500 to-green-500' },
      { name: 'Accounting',  icon: Calculator,    href: '/dashboard/accounting',    color: 'from-teal-500 to-cyan-500' },
      { name: 'Taxation',    icon: FileText,      href: '/dashboard/taxation',      color: 'from-green-500 to-emerald-600' },
      { name: 'Cashflow',    icon: TrendingUp,    href: '/dashboard/cashflow',      color: 'from-cyan-500 to-teal-600' },
      { name: 'Expenses',    icon: FileText,      href: '/dashboard/expenses',      color: 'from-lime-500 to-green-500' },
      { name: 'VAT Tools',   icon: Calculator,    href: '/dashboard/vat-tools',     color: 'from-green-600 to-teal-600' },
    ],
  },
  {
    label: 'Customer',
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50',
    items: [
      { name: 'CRM',       icon: Users,          href: '/dashboard/crm',       color: 'from-blue-500 to-indigo-500' },
      { name: 'Mailbox',   icon: Inbox,          href: '/dashboard/mailbox',   color: 'from-rose-500 to-pink-500' },
      { name: 'Forms',     icon: FormInput,      href: '/dashboard/forms',     color: 'from-violet-500 to-purple-500' },
      { name: 'Booking',   icon: Calendar,       href: '/dashboard/booking',   color: 'from-sky-500 to-blue-500' },
      { name: 'Helpdesk',  icon: MessageSquare,  href: '/dashboard/helpdesk',  color: 'from-orange-500 to-amber-500' },
      { name: 'Campaigns', icon: Mail,           href: '/dashboard/campaigns', color: 'from-indigo-500 to-purple-500' },
    ],
  },
  {
    label: 'Team',
    color: 'from-purple-500 to-violet-500',
    bg: 'bg-purple-50',
    items: [
      { name: 'Collaboration', icon: UsersRound, href: '/dashboard/collaboration', color: 'from-purple-500 to-violet-500' },
    ],
  },
  {
    label: 'Productivity',
    color: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50',
    items: [
      { name: 'Tasks',         icon: CheckSquare, href: '/dashboard/tasks',         color: 'from-green-500 to-emerald-500' },
      { name: 'AI Content',    icon: Sparkles,    href: '/dashboard/ai-content',    color: 'from-orange-500 to-red-500' },
      { name: 'AI Notes',      icon: FileEdit,    href: '/dashboard/ai-notes',      color: 'from-amber-500 to-orange-500' },
      { name: 'KPI Dashboard', icon: BarChart3,   href: '/dashboard/kpi-dashboard', color: 'from-teal-500 to-cyan-500' },
    ],
  },
  {
    label: 'Operations',
    color: 'from-slate-600 to-gray-700',
    bg: 'bg-slate-50',
    items: [
      { name: 'Inventory',   icon: Package,    href: '/dashboard/inventory',   color: 'from-slate-500 to-gray-600' },
      { name: 'Suppliers',   icon: Truck,      href: '/dashboard/suppliers',   color: 'from-gray-500 to-slate-600' },
      { name: 'HR Records',  icon: UserCheck,  href: '/dashboard/hr-records',  color: 'from-blue-600 to-slate-600' },
      { name: 'E-Signature', icon: PenTool,    href: '/dashboard/e-signature', color: 'from-indigo-600 to-slate-600' },
      { name: 'Micro Pages', icon: Globe,      href: '/dashboard/micro-pages', color: 'from-sky-600 to-blue-600' },
      { name: 'Compliance',  icon: Shield,     href: '/dashboard/compliance',  color: 'from-amber-600 to-orange-600' },
    ],
  },
];

function ModuleTile({ name, icon: Icon, href, color, isActive, onClose }: {
  name: string; icon: React.ElementType; href: string; color: string; isActive: boolean; onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all active:scale-95 ${
        isActive ? 'bg-white shadow-md ring-2 ring-indigo-200' : 'hover:bg-white/60'
      }`}
    >
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className={`text-[10px] font-bold text-center leading-tight ${isActive ? 'text-indigo-700' : 'text-gray-600'}`}>
        {name}
      </span>
    </Link>
  );
}

// --- DRAWER COMPONENT ---
function MobileMenuDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            className="fixed bottom-0 left-0 right-0 h-[92vh] bg-slate-50 rounded-t-3xl z-[101] flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 shrink-0">
              <div>
                <h2 className="text-xl font-black text-gray-900">All Modules</h2>
                <p className="text-xs text-gray-400 mt-0.5">Navigate to any feature</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-white rounded-full text-gray-500 shadow-sm border border-gray-100 active:scale-95 transition-transform"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-5">

              {/* Home shortcut */}
              <div className="bg-white rounded-2xl p-3 shadow-sm border border-white/60">
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-95 ${
                    pathname === '/dashboard' ? 'bg-indigo-50 ring-2 ring-indigo-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-sm shrink-0">
                    <LayoutDashboard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${pathname === '/dashboard' ? 'text-indigo-700' : 'text-gray-800'}`}>Dashboard Home</p>
                    <p className="text-xs text-gray-400">Overview &amp; analytics</p>
                  </div>
                  {pathname === '/dashboard' && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-indigo-500" />
                  )}
                </Link>
              </div>

              {/* Module sections */}
              {ALL_SECTIONS.map((section) => (
                <div key={section.label} className="bg-white rounded-2xl p-3 shadow-sm border border-white/60">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className={`w-1.5 h-4 rounded-full bg-gradient-to-b ${section.color}`} />
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">{section.label}</h3>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {section.items.map((item) => (
                      <ModuleTile
                        key={item.name}
                        name={item.name}
                        icon={item.icon}
                        href={item.href}
                        color={item.color}
                        isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                        onClose={onClose}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Account section */}
              <div className="bg-white rounded-2xl p-3 shadow-sm border border-white/60">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-gray-400 to-gray-600" />
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Account</h3>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { name: 'Settings',    icon: Settings,  href: '/dashboard/settings', color: 'from-gray-500 to-slate-600' },
                    { name: 'User Guide',  icon: BookOpen,  href: '/guide',              color: 'from-indigo-500 to-blue-500' },
                    { name: 'Support',     icon: LifeBuoy,  href: '/dashboard/support',  color: 'from-sky-500 to-blue-500' },
                    { name: 'Quick Start', icon: Rocket,    href: '#',                   color: 'from-purple-500 to-indigo-500' },
                  ].map((item) => (
                    <ModuleTile
                      key={item.name}
                      name={item.name}
                      icon={item.icon}
                      href={item.href}
                      color={item.color}
                      isActive={pathname === item.href}
                      onClose={onClose}
                    />
                  ))}
                </div>
              </div>

              {/* Sign Out */}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform border border-red-100"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
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
    { name: 'Finance', href: '/dashboard/invoicing', icon: PoundSterling },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-t border-gray-200 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
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
