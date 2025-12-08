"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  FileText,
  Calculator,
  Users,
  FormInput,
  Calendar,
  MessageSquare,
  Mail,
  CheckSquare,
  Sparkles,
  FileEdit,
  BarChart3,
  Package,
  Truck,
  UserCheck,
  Target,
  PenTool,
  Globe,
  Shield,
  Bell,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full ${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 z-40 transition-all duration-300`}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {sidebarOpen ? (
              <img src="/logo.png" alt="Okleevo" className="h-8 w-auto" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#fc6813' }}>
                <span className="text-white font-bold">O</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-180px)]">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: '#fc68131a', color: '#fc6813' }}
          >
            <LayoutDashboard className="w-5 h-5" />
            {sidebarOpen && <span>Dashboard</span>}
          </Link>
          
          {sidebarOpen && (
            <>
              <div className="pt-4">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Finance</p>
                <Link href="/dashboard/invoicing" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <Receipt className="w-5 h-5" /> Invoicing
                </Link>
                <Link href="/dashboard/accounting" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <Calculator className="w-5 h-5" /> Accounting
                </Link>
                <Link href="/dashboard/taxation" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <FileText className="w-5 h-5" /> Taxation
                </Link>
                <Link href="/dashboard/cashflow" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <TrendingUp className="w-5 h-5" /> Cashflow
                </Link>
                <Link href="/dashboard/expenses" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <FileText className="w-5 h-5" /> Expenses
                </Link>
                <Link href="/dashboard/vat-tools" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <Calculator className="w-5 h-5" /> VAT Tools
                </Link>
              </div>
              
              <div className="pt-4">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer</p>
                <Link href="/dashboard/crm" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <Users className="w-5 h-5" /> CRM
                </Link>
                <Link href="/dashboard/forms" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <FormInput className="w-5 h-5" /> Forms
                </Link>
                <Link href="/dashboard/booking" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <Calendar className="w-5 h-5" /> Booking
                </Link>
                <Link href="/dashboard/helpdesk" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <MessageSquare className="w-5 h-5" /> Helpdesk
                </Link>
                <Link href="/dashboard/campaigns" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <Mail className="w-5 h-5" /> Campaigns
                </Link>
              </div>
              
              <div className="pt-4">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Productivity</p>
                <Link href="/dashboard/tasks" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <CheckSquare className="w-5 h-5" /> Tasks
                </Link>
                <Link href="/dashboard/ai-content" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <Sparkles className="w-5 h-5" /> AI Content
                </Link>
                <Link href="/dashboard/ai-notes" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <FileEdit className="w-5 h-5" /> AI Notes
                </Link>
                <Link href="/dashboard/kpi-dashboard" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <BarChart3 className="w-5 h-5" /> KPI Dashboard
                </Link>
              </div>

              <div className="pt-4">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Operations</p>
                <Link href="/dashboard/inventory" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <Package className="w-5 h-5" /> Inventory
                </Link>
                <Link href="/dashboard/suppliers" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <Truck className="w-5 h-5" /> Suppliers
                </Link>
                <Link href="/dashboard/hr-records" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <UserCheck className="w-5 h-5" /> HR Records
                </Link>
                <Link href="/dashboard/e-signature" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <PenTool className="w-5 h-5" /> E-Signature
                </Link>
                <Link href="/dashboard/micro-pages" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <Globe className="w-5 h-5" /> Micro Pages
                </Link>
                <Link href="/dashboard/compliance" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <Shield className="w-5 h-5" /> Compliance
                </Link>
              </div>
            </>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white space-y-2">
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <Settings className="w-5 h-5" />
            {sidebarOpen && <span>Settings</span>}
          </Link>
          <Link href="/access" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Sign Out</span>}
          </Link>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="ml-64 h-screen overflow-y-auto" id="main-content">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500"></div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

