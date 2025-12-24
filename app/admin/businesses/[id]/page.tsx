"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Users, Building2, CreditCard } from "lucide-react";
import Link from "next/link";

interface BusinessDetail {
  id: string;
  name: string;
  industry: string;
  size: string;
  country: string;
  city: string;
  address: string;
  seatCount: number;
  maxSeats: number;
  users: any[];
  subscription: any;
  _count: {
    invoices: number;
    contacts: number;
    tasks: number;
  };
  createdAt: string;
}

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [business, setBusiness] = useState<BusinessDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchBusiness();
    }
  }, [params.id]);

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      const businessId = params.id;
      
      if (!businessId) {
        console.error('[BUSINESS-DETAIL] No business ID provided');
        alert("Business ID is missing");
        router.push("/admin/businesses");
        return;
      }

      console.log('[BUSINESS-DETAIL] Fetching business:', businessId);
      
      const response = await fetch(`/api/admin/businesses/${businessId}`, {
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log('[BUSINESS-DETAIL] Business fetched successfully');
        setBusiness(data.business);
      } else {
        console.error('[BUSINESS-DETAIL] Failed to fetch business:', data);
        const errorMessage = data.error || data.details || "Failed to fetch business";
        alert(`Error: ${errorMessage}`);
        router.push("/admin/businesses");
      }
    } catch (error: any) {
      console.error("[BUSINESS-DETAIL] Error fetching business:", error);
      console.error("[BUSINESS-DETAIL] Error details:", error.message);
      alert(`Failed to fetch business: ${error.message || 'Unknown error'}`);
      router.push("/admin/businesses");
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

  if (!business) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin/businesses"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{business.name}</h1>
            <div className="flex items-center gap-4 text-slate-300">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {business.industry}
              </span>
              <span>•</span>
              <span>{business.city}, {business.country}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Business Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Industry</p>
                <p className="font-medium text-gray-900">{business.industry}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Size</p>
                <p className="font-medium text-gray-900">{business.size}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Country</p>
                <p className="font-medium text-gray-900">{business.country}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">City</p>
                <p className="font-medium text-gray-900">{business.city || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium text-gray-900">{business.address || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Seats</p>
                <p className="font-medium text-gray-900">
                  {business.seatCount} / {business.maxSeats}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium text-gray-900">
                  {new Date(business.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Subscription */}
          {business.subscription && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-400" />
                Subscription
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                      business.subscription.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : business.subscription.status === "TRIAL"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {business.subscription.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="font-medium text-gray-900">{business.subscription.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-medium text-gray-900">
                    {new Intl.NumberFormat("en-GB", {
                      style: "currency",
                      currency: business.subscription.currency?.toUpperCase() || "GBP",
                    }).format(business.subscription.amount / 100)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Period End</p>
                  <p className="font-medium text-gray-900">
                    {new Date(business.subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Usage Statistics</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-600 mb-2">Invoices</p>
                <p className="text-3xl font-bold text-gray-900">{business._count.invoices}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-600 mb-2">Contacts</p>
                <p className="text-3xl font-bold text-gray-900">{business._count.contacts}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-600 mb-2">Tasks</p>
                <p className="text-3xl font-bold text-gray-900">{business._count.tasks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users List - Enhanced */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                All Users
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {business.users.length} user{business.users.length !== 1 ? 's' : ''} under this SME
              </p>
            </div>
            <Link
              href={`/admin/users?businessId=${business.id}`}
              className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
            >
              Manage Users →
            </Link>
          </div>
          <div className="space-y-3 max-h-[700px] overflow-y-auto">
            {business.users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No users yet</p>
                <p className="text-gray-400 text-sm mt-2">Users will appear here once added</p>
              </div>
            ) : (
              business.users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          {user.role === "OWNER" && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                              Owner
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                              user.role === "OWNER"
                                ? "bg-amber-100 text-amber-700 border-amber-200"
                                : user.role === "ADMIN"
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : user.role === "MANAGER"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-gray-100 text-gray-700 border-gray-200"
                            }`}
                          >
                            {user.role}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                              user.status === "ACTIVE"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : user.status === "SUSPENDED"
                                ? "bg-red-100 text-red-700 border-red-200"
                                : "bg-gray-100 text-gray-700 border-gray-200"
                            }`}
                          >
                            {user.status}
                          </span>
                          {user.lastLoginAt && (
                            <span className="text-xs text-gray-500">
                              Last active: {new Date(user.lastLoginAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
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

