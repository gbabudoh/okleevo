"use client";

import { useEffect, useState } from "react";
import { Building2, Users, CreditCard, TrendingUp, Activity, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalBusinesses: number;
  totalUsers: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  totalRevenue: number;
  recentBusinesses: any[];
  recentUsers: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [businessesRes, usersRes, subscriptionsRes] = await Promise.all([
        fetch("/api/admin/businesses?limit=5", { credentials: "include" }),
        fetch("/api/admin/users?limit=5", { credentials: "include" }),
        fetch("/api/admin/subscriptions", { credentials: "include" }),
      ]);

      const businessesData = await businessesRes.json();
      const usersData = await usersRes.json();
      const subscriptionsData = await subscriptionsRes.json();

      const activeSubs = subscriptionsData.subscriptions?.filter(
        (s: any) => s.status === "ACTIVE" || s.status === "TRIAL"
      ).length || 0;
      const trialSubs = subscriptionsData.subscriptions?.filter(
        (s: any) => s.status === "TRIAL"
      ).length || 0;

      setStats({
        totalBusinesses: businessesData.pagination?.total || 0,
        totalUsers: usersData.pagination?.total || 0,
        activeSubscriptions: activeSubs,
        trialSubscriptions: trialSubs,
        totalRevenue: subscriptionsData.subscriptions?.reduce(
          (sum: number, s: any) => sum + (s.amount || 0),
          0
        ) || 0,
        recentBusinesses: businessesData.businesses || [],
        recentUsers: usersData.users || [],
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Businesses",
      value: stats?.totalBusinesses || 0,
      icon: Building2,
      color: "bg-blue-500",
      href: "/admin/businesses",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "bg-green-500",
      href: "/admin/users",
    },
    {
      title: "Active Subscriptions",
      value: stats?.activeSubscriptions || 0,
      icon: CreditCard,
      color: "bg-purple-500",
      href: "/admin/subscriptions",
    },
    {
      title: "Trial Subscriptions",
      value: stats?.trialSubscriptions || 0,
      icon: Activity,
      color: "bg-orange-500",
      href: "/admin/subscriptions?status=TRIAL",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Platform Overview</h1>
            <p className="text-slate-300">Comprehensive management dashboard for all SMEs and users</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <p className="text-xs text-slate-300 mb-1">Monthly Revenue</p>
              <p className="text-2xl font-bold">
                £{((stats?.totalRevenue || 0) / 100).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:border-orange-200 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className="text-4xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`${card.color} p-4 rounded-xl group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-orange-600 font-medium group-hover:underline">
                  View details →
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Businesses */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Businesses</h2>
              <p className="text-sm text-gray-500 mt-1">Latest registered SMEs</p>
            </div>
            <Link
              href="/admin/businesses"
              className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.recentBusinesses.length ? (
              stats.recentBusinesses.map((business: any) => (
                <Link
                  key={business.id}
                  href={`/admin/businesses/${business.id}`}
                  className="block p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <p className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                          {business.name}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{business.industry}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {business.userCount} users
                        </span>
                        <span>
                          {business.seatCount}/{business.maxSeats} seats
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        business.subscription?.status === "ACTIVE"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : business.subscription?.status === "TRIAL"
                          ? "bg-orange-100 text-orange-700 border border-orange-200"
                          : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {business.subscription?.status || "No subscription"}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No businesses yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
              <p className="text-sm text-gray-500 mt-1">Latest registered users</p>
            </div>
            <Link
              href="/admin/users"
              className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.recentUsers.length ? (
              stats.recentUsers.map((user: any) => (
                <Link
                  key={user.id}
                  href={`/admin/users?businessId=${user.business?.id}`}
                  className="block p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{user.business?.name}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              user.role === "OWNER"
                                ? "bg-amber-100 text-amber-700"
                                : user.role === "ADMIN"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        user.status === "ACTIVE"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : user.status === "SUSPENDED"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No users yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

