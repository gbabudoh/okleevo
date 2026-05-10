'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, UserPlus, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PublicMobileNav() {
  const pathname = usePathname();

  // Hide on dashboard routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return null;
  }

  const tabs = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Guide', href: '/guide', icon: BookOpen },
    { name: 'Log In', href: '/auth/login', icon: LogIn },
    { name: 'Sign Up', href: '/onboarding', icon: UserPlus },
  ];

  return (
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
                  layoutId="publicActiveTab"
                  className="absolute inset-0 bg-indigo-50 rounded-2xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon className={`w-5 h-5 mb-1 transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
              <span className={`text-[10px] font-bold transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
