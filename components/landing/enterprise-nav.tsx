"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, Sparkles, ChevronRight } from "lucide-react";

interface EnterpriseNavProps {
  isLoggedIn?: boolean;
}

export function EnterpriseNav({ isLoggedIn }: EnterpriseNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Interactive Demo", href: pathname === "/" ? "#demo" : "/#demo" },
    { name: "Tools", href: pathname === "/" ? "#features" : "/#features" },
    { name: "Workflow Simulator", href: pathname === "/" ? "#workflow" : "/#workflow" },
    { name: "Pricing", href: "/pricing" },
    { name: "Docs", href: "/guide" },
  ];

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Top micro-announcement banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest">
          NEW v2.4
        </span>
        <span>Okleevo Enterprise Engine: Autonomous AI Workflows & Zero-Trust Client Storage</span>
        <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
      </div>

      {/* Main Nav Bar */}
      <nav className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Brand & Status */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="Okleevo"
                    width={110}
                    height={30}
                    className="h-7 sm:h-8 w-auto relative z-10"
                    priority
                  />
                </div>
                <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Operational
                </span>
              </Link>

              {/* Desktop Nav Links */}
              <div className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200 dark:border-slate-800">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={(e) => handleAnchorClick(e, item.href)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                        isActive
                          ? "bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-orange-50/60 dark:hover:bg-slate-900"
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="hidden sm:flex items-center gap-3">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="relative group overflow-hidden rounded-full bg-gradient-to-r from-orange-500 to-amber-500 p-[1px] focus:outline-none"
                >
                  <span className="flex items-center gap-2 rounded-full bg-white dark:bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-900 dark:text-white group-hover:bg-opacity-0 group-hover:text-white transition duration-300">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500 group-hover:text-white transition" />
                    Open Dashboard
                  </span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="group relative inline-flex items-center justify-center px-5 py-2 text-xs font-semibold text-white transition-all bg-gradient-to-r from-orange-500 to-amber-600 rounded-full shadow-[0_4px_20px_rgba(252,104,19,0.3)] hover:shadow-[0_6px_25px_rgba(252,104,19,0.45)] active:scale-95"
                  >
                    <span>Sign Up</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none cursor-pointer"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Right Slide-over Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[99998] md:hidden"
              />

              {/* Right Slide-over Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="fixed top-0 right-0 bottom-0 h-screen w-[85vw] max-w-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-white z-[99999] md:hidden shadow-2xl p-6 flex flex-col justify-between overflow-y-auto border-l border-slate-200 dark:border-slate-800"
              >
                <div>
                  <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-100 dark:border-slate-900">
                    <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                      <Image
                        src="/logo.png"
                        alt="Okleevo"
                        width={110}
                        height={30}
                        className="h-7 w-auto"
                        priority
                      />
                    </Link>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                      aria-label="Close menu"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="space-y-2">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={(e) => {
                            handleAnchorClick(e, item.href);
                            setMobileMenuOpen(false);
                          }}
                          className={`flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all ${
                            isActive
                              ? "bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold"
                              : "text-slate-700 dark:text-slate-200 hover:text-orange-600 hover:bg-orange-50/80 dark:hover:bg-orange-950/30"
                          }`}
                        >
                          {item.name}
                        </Link>
                      );
                    })}
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-orange-600 hover:bg-orange-50/80 dark:hover:bg-orange-950/30 rounded-2xl transition-all"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-4 py-3 text-sm font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-50/80 dark:hover:bg-orange-950/30 rounded-2xl transition-all"
                    >
                      Sign Up
                    </Link>
                  </nav>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-900 flex flex-col gap-3 shrink-0 mt-6">
                  {isLoggedIn ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                    >
                      Open Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/auth/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-3 text-xs font-extrabold text-white bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      Start Free Trial
                    </Link>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
