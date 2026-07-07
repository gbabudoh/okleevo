"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  BarChart3,
  LogOut,
  Menu,
  X,
  Shield,
  MessageSquare,
  Sliders
} from "lucide-react";
import { signOut } from "next-auth/react";

interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Sidebar doubles as a desktop collapse toggle and a mobile off-canvas
  // drawer — default it closed on mobile so it doesn't cover the screen
  // on first load (desktop keeps its expanded-by-default behavior).
  useLayoutEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  // Skip layout for access page and debug pages
  const isAccessPage = pathname === "/admin/access" || pathname === "/admin/debug-login";

  useEffect(() => {
    // Don't check auth on access page
    if (isAccessPage) return;

    if (status === "loading") return;

    if (!session?.user) {
      router.push("/admin/access");
      return;
    }

    // Check role directly from session (no API call needed)
    const userRole = (session.user as ExtendedUser)?.role;
    if (userRole !== "SUPER_ADMIN") {
      router.push("/dashboard");
    }
  }, [session, status, router, isAccessPage]);

  // If on access page, render children directly without layout
  if (isAccessPage) {
    return <>{children}</>;
  }

  // Show loading only while session is loading
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Check if user is super admin (from session)
  const userRole = (session?.user as ExtendedUser)?.role;
  if (!session?.user || userRole !== "SUPER_ADMIN") {
    return null; // Will redirect in useEffect
  }

  const menuItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Overview" },
    { href: "/admin/businesses", icon: Building2, label: "Businesses" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/subscriptions", icon: CreditCard, label: "Subscriptions" },
    { href: "/admin/tickets", icon: MessageSquare, label: "Tickets" },
    { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/admin/dashboard-preview", icon: Sliders, label: "Dashboard Preview" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/admin" className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg shrink-0">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-sm sm:text-xl text-gray-900 truncate block">Admin Panel</span>
                <p className="text-xs text-gray-500 hidden sm:block">Platform Management</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-900">
                {(session?.user as ExtendedUser)?.name || 'Super Admin'}
              </p>
              <p className="text-xs text-gray-500">Platform Administrator</p>
            </div>
            <button
              onClick={async () => {
                await fetch("/api/auth/logout-session", {
                  method: "POST",
                  credentials: "include",
                });
                signOut({ callbackUrl: "/" });
              }}
              className="p-2 sm:px-4 sm:py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-2 rounded-lg border border-gray-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Mobile backdrop, shown behind the drawer while it's open */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/30 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar: off-canvas drawer on mobile, collapsible column on desktop */}
        <aside
          className={`bg-white/95 md:bg-white/80 backdrop-blur-lg border-r border-gray-200/50 transition-all duration-300 shadow-sm
            fixed md:sticky left-0 top-[57px] sm:top-[65px] md:top-[73px] z-40
            h-[calc(100vh-57px)] sm:h-[calc(100vh-65px)] md:h-auto md:min-h-[calc(100vh-73px)]
            w-64 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-20"}`}
        >
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20"
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : ""}`} />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}

