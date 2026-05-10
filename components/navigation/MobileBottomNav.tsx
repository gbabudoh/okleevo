'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  X, LayoutDashboard, Users, PoundSterling, 
  Inbox, Menu, LogOut, Settings, BookOpen
} from 'lucide-react';
import { signOut } from 'next-auth/react';

// --- DRAWER COMPONENT ---
function MobileMenuDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
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
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-3xl z-[101] flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">All Modules</h2>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32 custom-scrollbar">
              
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Account</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/dashboard/settings" onClick={onClose} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl gap-2 active:scale-95 transition-transform">
                    <Settings className="w-6 h-6 text-gray-600" />
                    <span className="text-xs font-bold text-gray-700">Settings</span>
                  </Link>
                  <Link href="/guide" onClick={onClose} className="flex flex-col items-center justify-center p-4 bg-indigo-50 rounded-2xl gap-2 active:scale-95 transition-transform">
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-700">User Guide</span>
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Core</h3>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { name: 'Home', icon: LayoutDashboard, href: '/dashboard', color: 'text-orange-500' },
                    { name: 'CRM', icon: Users, href: '/dashboard/crm', color: 'text-blue-500' },
                    { name: 'Mailbox', icon: Inbox, href: '/dashboard/mailbox', color: 'text-rose-500' },
                    { name: 'Finance', icon: PoundSterling, href: '/dashboard/invoicing', color: 'text-emerald-500' },
                  ].map((item) => (
                    <Link key={item.name} href={item.href} onClick={onClose} className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center active:bg-gray-100 active:scale-95 transition-all">
                        <item.icon className={`w-6 h-6 ${item.color}`} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-600">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full p-4 bg-red-50 text-red-600 font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
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
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'CRM', href: '/dashboard/crm', icon: Users },
    { name: 'Mail', href: '/dashboard/mailbox', icon: Inbox },
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
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
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
