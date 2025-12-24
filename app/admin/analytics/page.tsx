"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, Building2, CreditCard, Activity } from "lucide-react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      console.log('[ANALYTICS] Fetching analytics data...');
      const response = await fetch("/api/admin/analytics", {
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[ANALYTICS] Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch analytics');
      }

      const data = await response.json();
      console.log('[ANALYTICS] Analytics data received:', data);

      if (data.stats) {
        setStats(data.stats);
      } else {
        console.error('[ANALYTICS] No stats in response:', data);
        setStats({
          totalBusinesses: 0,
          totalUsers: 0,
          activeSubscriptions: 0,
          trialSubscriptions: 0,
          totalRevenue: 0,
          industryCount: {},
          roleCount: {},
        });
      }
    } catch (error: any) {
      console.error("[ANALYTICS] Error fetching analytics:", error);
      console.error("[ANALYTICS] Error details:", error.message);
      // Set default stats on error
      setStats({
        totalBusinesses: 0,
        totalUsers: 0,
        activeSubscriptions: 0,
        trialSubscriptions: 0,
        totalRevenue: 0,
        industryCount: {},
        roleCount: {},
      });
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-2xl">
        <div>
          <h1 className="text-4xl font-bold mb-2">Platform Analytics</h1>
          <p className="text-slate-300">Comprehensive statistics and insights across all SMEs</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Businesses</p>
              <p className="text-4xl font-bold text-gray-900">{stats?.totalBusinesses || 0}</p>
              <p className="text-xs text-gray-500 mt-1">SME accounts</p>
            </div>
            <div className="p-4 bg-blue-100 rounded-xl">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
              <p className="text-4xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Across all SMEs</p>
            </div>
            <div className="p-4 bg-green-100 rounded-xl">
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Active Subscriptions</p>
              <p className="text-4xl font-bold text-gray-900">{stats?.activeSubscriptions || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.trialSubscriptions ? `${stats.trialSubscriptions} on trial` : 'Paid subscriptions'}
              </p>
            </div>
            <div className="p-4 bg-purple-100 rounded-xl">
              <CreditCard className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Monthly Revenue</p>
              <p className="text-4xl font-bold text-gray-900">
                £{((stats?.totalRevenue || 0) / 100).toLocaleString('en-GB', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-gray-500 mt-1">Recurring revenue</p>
            </div>
            <div className="p-4 bg-orange-100 rounded-xl">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Industry Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-400" />
            Businesses by Industry
          </h2>
          <div className="space-y-4">
            {Object.keys(stats?.industryCount || {}).length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No businesses yet</p>
              </div>
            ) : (
              Object.entries(stats?.industryCount || {})
                .sort(([, a]: any, [, b]: any) => b - a)
                .map(([industry, count]: [string, any]) => (
                  <div key={industry} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">{industry}</span>
                      <span className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                        {count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${(count / (stats?.totalBusinesses || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            Users by Role
          </h2>
          <div className="space-y-4">
            {Object.keys(stats?.roleCount || {}).length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No users yet</p>
              </div>
            ) : (
              Object.entries(stats?.roleCount || {})
                .sort(([, a]: any, [, b]: any) => b - a)
                .map(([role, count]: [string, any]) => (
                  <div key={role} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">{role}</span>
                      <span className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                        {count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${(count / (stats?.totalUsers || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

