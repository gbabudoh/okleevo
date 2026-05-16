"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { 
  User, Mail, Phone, MapPin, Building2, Briefcase, Lock,
  Bell, CreditCard, Globe, Shield, Eye, EyeOff, Camera,
  Save, X, Check, AlertCircle, Settings as SettingsIcon,
  Zap, Download, Upload,
  Trash2, LogOut, Key, Smartphone, Monitor, Users, Crown,
  FileText, Link, Code, Plus, Sparkles,
  Edit3, UserPlus, UserCheck, Package, Truck, MessageSquare,
  Shield as ShieldIcon, Receipt, Calculator, FormInput, Calendar as CalendarIcon,
  CheckSquare, FileEdit, BarChart3, PenTool, TrendingUp
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { usePresence } from '@/components/hooks/use-presence';
import { TeamActivityFeed } from '@/components/team-activity-feed';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle as AlertCircleIcon } from 'lucide-react';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  address: string;
  city: string;
  country: string;
  timezone: string;
  language: string;
  avatar?: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  loginAlerts: boolean;
}

interface NotificationSettings {
  emailDigest: boolean;
  taskReminders: boolean;
  invoiceAlerts: boolean;
  teamUpdates: boolean;
  marketingEmails: boolean;
}

interface TeamMember {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  status?: string;
  avatar?: string;
  password?: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('MEMBER'); // Track user role
  
  // Team management state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [seatInfo, setSeatInfo] = useState({ used: 1, max: 10, available: 9 });
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<TeamMember | null>(null);

  // Billing states
  interface BillingInfo {
    status: string;
    plan: {
      name: string;
      amount: number;
      currency: string;
      interval: string;
    };
    currentPeriodEnd: string;
  }

  interface PaymentMethod {
    id: string;
    isDefault: boolean;
    card: {
      brand: string;
      last4: string;
      expMonth: number;
      expYear: number;
    };
  }

  interface Invoice {
    id: string;
    number: string;
    periodStart: string;
    amount: number;
    status: string;
    invoicePdf: string;
  }

  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingBilling, setLoadingBilling] = useState(false);
  
  // Presence tracking
  const { presence } = usePresence();
  const [newEmployee, setNewEmployee] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'MEMBER',
    password: '',
  });

  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    address: '',
    city: '',
    country: 'UK',
    timezone: 'Europe/London',
    language: 'English'
  });

  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [updatingModules, setUpdatingModules] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  // Fetch user data on component mount
  useEffect(() => {
    async function fetchUserData() {
      if (status === 'loading') return;
      
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          // Store user role
          setUserRole(data.role || 'MEMBER');
          // Map database fields to profile state
          setProfile({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            company: data.business?.name || '',
            position: data.role === 'OWNER' ? 'Owner' : data.role === 'ADMIN' ? 'Administrator' : data.role === 'MANAGER' ? 'Manager' : 'Member',
            address: data.business?.address || '',
            city: data.business?.city || '',
            country: data.business?.country || 'UK',
            timezone: 'Europe/London', // Default, can be updated from user preferences later
            language: 'English'
          });
          setEnabledModules(data.business?.enabledModules || []);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [session, status]);

  // Fetch team members when team tab is active
  useEffect(() => {
    if (activeTab === 'team') {
      fetchTeamMembers();
    }
    if (activeTab === 'billing') {
      fetchBillingInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, session, status]);

  async function fetchBillingInfo() {
    setLoadingBilling(true);
    try {
      const [subRes, pmRes, invRes] = await Promise.all([
        fetch('/app/billing/subscription'),
        fetch('/app/billing/payment-method'),
        fetch('/app/billing/invoices?limit=5')
      ]);

      if (subRes.ok) setBillingInfo(await subRes.json());
      if (pmRes.ok) {
        const pmData = await pmRes.json();
        setPaymentMethods(pmData.data || []);
      }
      if (invRes.ok) {
        const invData = await invRes.json();
        setInvoices(invData.data || []);
      }
    } catch (error) {
      console.error('Error fetching billing info:', error);
      showToast('Failed to load billing information', 'error');
    } finally {
      setLoadingBilling(false);
    }
  }

  async function handleOpenPortal() {
    try {
      const response = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        showToast(data.error || 'Failed to open billing portal', 'error');
      }
    } catch (error) {
      console.error('Portal error:', error);
      showToast('Connection error', 'error');
    }
  }

  async function fetchTeamMembers() {
    if (status === 'loading' || !session?.user?.id) {
      console.log('Skipping fetch - status:', status, 'hasSession:', !!session?.user?.id);
      return;
    }
    
    setLoadingTeam(true);
    try {
      const response = await fetch('/api/employees', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        setTeamMembers(data.users || []);
        // Hard-mocked for the demo as requested to show 1/10
        setSeatInfo({ used: 1, max: 10, available: 9 });
      } else {
        const text = await response.text();
        let errorData;
        try {
          errorData = text ? JSON.parse(text) : { error: `HTTP ${response.status}` };
        } catch {
          errorData = { error: `Server error (${response.status}): ${text || response.statusText}` };
        }
        
        console.error('Failed to fetch team members:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          responseText: text
        });

        // Show user-friendly error message
        if (response.status === 401) {
          console.warn('Session expired. Please refresh the page and sign in again.');
        } else if (response.status === 403) {
          console.warn('You do not have permission to view team members. Only owners and admins can access this.');
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching team members:', errorMessage);
    } finally {
      setLoadingTeam(false);
    }
  }

  async function handleAddEmployee() {
    if (!newEmployee.email || !newEmployee.firstName || !newEmployee.lastName) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newEmployee),
      });

      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        data = { error: 'Invalid response from server' };
      }

      if (response.ok) {
        showToast('Employee added successfully!');
        setShowAddModal(false);
        setNewEmployee({
          email: '',
          firstName: '',
          lastName: '',
          phone: '',
          role: 'MEMBER',
          password: '',
        });
        fetchTeamMembers();
      } else {
        console.error('Failed to add employee:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        const errorMessage = data?.error || `Server error (${response.status})`;
        showToast(`Error: ${errorMessage}`, 'error');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error adding employee:', errorMessage);
      showToast(`Failed to add employee: ${errorMessage}`, 'error');
    }
  }

  async function handleDeleteEmployee(userId: string) {
    if (!confirm('Are you sure you want to remove this employee?')) return;

    try {
      const response = await fetch(`/api/employees/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (response.ok) {
        showToast('Employee removed successfully!');
        fetchTeamMembers();
      } else {
        console.error('Failed to delete employee:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        alert(`Error: ${data.error || `Server error (${response.status})`}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error deleting employee:', errorMessage);
      showToast(`Failed to remove employee: ${errorMessage}`, 'error');
    }
  }

  async function handleUpdateEmployee() {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/employees/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingUser),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (response.ok) {
        showToast('Employee updated successfully!');
        setShowEditModal(false);
        setEditingUser(null);
        fetchTeamMembers();
      } else {
        console.error('Failed to update employee:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        alert(`Error: ${data.error || `Server error (${response.status})`}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating employee:', errorMessage);
      showToast(`Failed to update employee: ${errorMessage}`, 'error');
    }
  }

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    loginAlerts: true
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailDigest: true,
    taskReminders: true,
    invoiceAlerts: true,
    teamUpdates: true,
    marketingEmails: false
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'avatars');
      const uploadRes = await fetch('/api/storage/upload', { method: 'POST', body: form });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.url) throw new Error(uploadData.error || 'Upload failed');

      const patchRes = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: uploadData.url }),
      });
      const patchData = await patchRes.json();
      if (!patchRes.ok) throw new Error(patchData.error || 'Failed to save avatar');

      setProfile(prev => ({ ...prev, avatar: uploadData.url }));
      showToast('Profile photo updated', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Upload failed', 'error');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Filter tabs based on user role
  const allTabs = [
    { id: 'profile', name: 'Profile', icon: User, roles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER'] },
    { id: 'team', name: 'Team', icon: Users, roles: ['OWNER'] },
    { id: 'security', name: 'Security', icon: Shield, roles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER'] },
    { id: 'notifications', name: 'Notifications', icon: Bell, roles: ['OWNER', 'ADMIN'] },
    { id: 'billing', name: 'Billing', icon: CreditCard, roles: ['OWNER'] },
    { id: 'modules', name: 'Modules', icon: Zap, roles: ['OWNER', 'ADMIN'] },
    { id: 'preferences', name: 'Preferences', icon: SettingsIcon, roles: ['OWNER', 'ADMIN'] },
    { id: 'integrations', name: 'Integrations', icon: Link, roles: ['OWNER', 'ADMIN'] },
  ];

  const tabs = allTabs.filter(tab => tab.roles.includes(userRole));
  
  // If current tab is not available for user role, switch to profile
  useEffect(() => {
    const availableTabs = allTabs.filter(tab => tab.roles.includes(userRole));
    if (!availableTabs.find(tab => tab.id === activeTab)) {
      setActiveTab('profile');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, activeTab]);

  return (
    <div className="min-h-[calc(100vh-4rem)] space-y-4 md:space-y-6">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-linear-to-br from-gray-900 via-indigo-950 to-gray-900 px-5 py-7 md:px-10 md:py-10">
        <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 md:w-72 md:h-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 w-40 h-40 md:w-60 md:h-60 rounded-full bg-purple-500/15 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1">
              <SettingsIcon className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-300">Command Center</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              Account <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">Settings</span>
            </h1>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              {userRole} · System preferences &amp; configuration
            </p>
          </div>
          {saveSuccess && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 w-fit">
              <Check className="h-4 w-4 text-emerald-400" />
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">Changes Saved</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-wider transition shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-indigo-400' : 'text-gray-400'}`} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* ── Profile Tab ── */}
      {activeTab === 'profile' && (
        <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-20">
              <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="mt-3 text-sm font-medium text-gray-500">Loading profile…</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 md:gap-6">
              {/* Avatar card */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col items-center text-center gap-4">
                {/* Hidden file input */}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <div className="relative">
                  <div className="h-24 w-24 bg-linear-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-lg overflow-hidden">
                    {uploadingAvatar ? (
                      <div className="h-7 w-7 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : profile.avatar ? (
                      <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <>{profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}</>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition cursor-pointer ring-2 ring-white disabled:opacity-60 disabled:cursor-not-allowed">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  <p className="text-lg font-black text-gray-900">{profile.firstName || 'User'} {profile.lastName}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">{profile.position || 'Team Member'}</p>
                </div>
                {(userRole === 'OWNER' || userRole === 'ADMIN') && (
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="w-full py-2.5 rounded-xl bg-indigo-50 text-indigo-700 text-[11px] font-black uppercase tracking-wider hover:bg-indigo-100 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                    {uploadingAvatar
                      ? <><div className="h-3.5 w-3.5 border-2 border-indigo-300 border-t-indigo-700 rounded-full animate-spin" /> Uploading…</>
                      : <><Upload className="h-3.5 w-3.5" /> Upload Photo</>}
                  </button>
                )}
                <div className="w-full rounded-xl bg-gray-50 border border-gray-100 p-4 text-left space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Account Status</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-600">Plan</span>
                    <span className="font-black text-indigo-600">Pro Enterprise</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-600">Verified</span>
                    <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-black text-white">Yes</span>
                  </div>
                </div>
              </div>

              {/* Personal info form */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-black text-gray-900 flex items-center gap-2"><User className="h-4 w-4 text-indigo-500" /> Personal Information</h3>
                    <p className="text-xs font-medium text-gray-400 mt-0.5">Manage your public profile and private details</p>
                  </div>
                  {(userRole === 'OWNER' || userRole === 'ADMIN') && (
                    <button type="button" onClick={handleSave}
                      className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-white hover:bg-gray-800 transition shadow-sm cursor-pointer">
                      <Save className="h-3.5 w-3.5" /> Save
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'First Name', value: profile.firstName, key: 'firstName', icon: User },
                    { label: 'Last Name', value: profile.lastName, key: 'lastName', icon: User },
                    { label: 'Email Address', value: profile.email, key: 'email', icon: Mail, type: 'email' },
                    { label: 'Phone Number', value: profile.phone, key: 'phone', icon: Phone, type: 'tel' },
                    { label: 'Company Name', value: profile.company, key: 'company', icon: Building2 },
                    { label: 'Job Title', value: profile.position, key: 'position', icon: Briefcase },
                    { label: 'Address', value: profile.address, key: 'address', icon: MapPin, full: true },
                    { label: 'City', value: profile.city, key: 'city', icon: Building2 },
                    { label: 'Country', value: profile.country, key: 'country', icon: Globe },
                  ].map(field => (
                    <div key={field.key} className={field.full ? 'sm:col-span-2' : ''}>
                      <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 mb-2">{field.label}</label>
                      <div className="relative">
                        <field.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type={field.type || 'text'}
                          value={field.value}
                          onChange={e => setProfile({ ...profile, [field.key]: e.target.value })}
                          disabled={userRole === 'MANAGER' || userRole === 'MEMBER'}
                          className={`w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm font-medium text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition ${
                            (userRole === 'MANAGER' || userRole === 'MEMBER') ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {(userRole === 'MANAGER' || userRole === 'MEMBER') && (
                  <div className="mt-5 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <AlertCircle className="h-4 w-4 text-blue-500 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-blue-900">View Only Access</p>
                      <p className="text-xs text-blue-700">Contact your administrator to update profile details.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Team Tab */}
      {activeTab === 'team' && (
        <div className="space-y-8">
          {/* Stats & Capacity Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-linear-to-br from-indigo-600 to-purple-600 rounded-4xl p-6 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700">
                   <Users className="w-32 h-32" />
                </div>
                <div className="relative">
                   <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                         <Crown className="w-6 h-6 text-white" />
                      </div>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/10 uppercase tracking-wider">
                         Plan limit: {seatInfo.max}
                      </span>
                   </div>
                   <h3 className="text-3xl font-black tracking-tight">{seatInfo.used} / {seatInfo.max}</h3>
                   <p className="text-indigo-100 font-medium">Active Seats Used</p>
                   
                   <div className="mt-6">
                      <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wide opacity-80">
                         <span>Capacity Usage</span>
                         <span>{Math.round((seatInfo.used / seatInfo.max) * 100)}%</span>
                      </div>
                      <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                         <div
                            className="bg-white rounded-full h-2 transition-all duration-1000 ease-out"
                            style={{ width: `${(seatInfo.used / seatInfo.max) * 100}%` }}
                         />
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-4xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 transform translate-x-2 -translate-y-2 group-hover:rotate-12 transition-transform duration-500">
                   <UserCheck className="w-24 h-24 text-green-600" />
                </div>
                <div className="relative">
                   <div className="p-3 bg-green-50 w-fit rounded-2xl mb-4 group-hover:bg-green-100 transition-colors">
                      <UserCheck className="w-6 h-6 text-green-600" />
                   </div>
                   <h3 className="text-3xl font-black text-gray-900 tracking-tight">
                      {teamMembers.filter(m => presence?.presence?.find(p => p.userId === m.id)?.isOnline).length}
                   </h3>
                   <p className="text-gray-500 font-medium">Team Members Online</p>
                   <div className="mt-4 flex -space-x-2">
                      {teamMembers.slice(0, 4).map((member, i) => (
                         <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 ring-2 ring-gray-50">
                            {member.firstName?.charAt(0)}
                         </div>
                      ))}
                      {teamMembers.length > 4 && (
                         <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                            +{teamMembers.length - 4}
                         </div>
                      )}
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-4xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center space-y-4 group hover:shadow-md transition-all">
                <div className="p-4 bg-indigo-50 rounded-full group-hover:bg-indigo-100 transition-colors">
                   <UserPlus className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-gray-900">Invite New Member</h3>
                   <p className="text-sm text-gray-500 mt-1 max-w-[200px]">Expand your team and collaborate more effectively.</p>
                </div>
                <button
                   onClick={() => setShowAddModal(true)}
                   disabled={seatInfo.available === 0}
                   className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg ${
                      seatInfo.available === 0
                         ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                         : 'bg-gray-900 text-white hover:bg-gray-800 hover:scale-[1.02] cursor-pointer'
                   }`}
                >
                   {seatInfo.available === 0 ? 'Capacity Full' : 'Add Member'}
                </button>
             </div>
          </div>

          {/* Members Grid */}
          <div>
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" />
                    Team Roster
                 </h2>
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">View:</span>
                    <button className="p-2 bg-white border border-gray-200 rounded-lg text-indigo-600 shadow-sm"><Users className="w-4 h-4" /></button>
                 </div>
              </div>

             {loadingTeam ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {[1, 2, 3].map(i => (
                      <div key={i} className="h-48 bg-gray-100 rounded-4xl animate-pulse"></div>
                   ))}
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {teamMembers.map((member) => {
                      const isOnline = presence?.presence?.find(p => p.userId === member.id)?.isOnline || false;
                      const roleColor = member.role === 'OWNER' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                      member.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                                      'bg-gray-100 text-gray-700 border-gray-200';
                      
                      return (
                         <div key={member.id} className="bg-white rounded-4xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               {member.role !== 'OWNER' && (
                                  <>
                                     <button
                                        onClick={() => {
                                           setEditingUser({ ...member });
                                           setShowEditModal(true);
                                        }}
                                        className="p-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-colors cursor-pointer"
                                     >
                                        <Edit3 className="w-4 h-4" />
                                     </button>
                                     <button
                                        onClick={() => handleDeleteEmployee(member.id)}
                                        className="p-2 bg-white border border-gray-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-200 shadow-sm transition-colors cursor-pointer"
                                     >
                                        <Trash2 className="w-4 h-4" />
                                     </button>
                                  </>
                               )}
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                               <div className="relative">
                                  <div className="w-16 h-16 bg-linear-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-xl font-black text-indigo-600 shadow-inner">
                                     {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                                  </div>
                                  {isOnline && (
                                     <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                                  )}
                               </div>
                               <div>
                                  <h4 className="font-bold text-gray-900 text-lg leading-tight">{member.firstName} {member.lastName}</h4>
                                  <p className="text-sm text-gray-500">{member.email}</p>
                               </div>
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                               <span className={`px-3 py-1 rounded-full text-xs font-bold border ${roleColor}`}>
                                  {member.role}
                               </span>
                               <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                  member.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' :
                                  'bg-gray-50 text-gray-500 border-gray-200'
                               }`}>
                                  {member.status || 'ACTIVE'}
                               </span>
                            </div>

                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs font-medium text-gray-400">
                               <span>Joined {new Date().toLocaleDateString()}</span>
                               {isOnline ? (
                                  <span className="text-green-600 flex items-center gap-1">
                                     <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                     Online now
                                  </span>
                               ) : (
                                  <span>Offline</span>
                               )}
                            </div>
                         </div>
                      );
                   })}
                </div>
             )}
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
             <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Team Activity
             </h3>
             <TeamActivityFeed />
          </div>
        </div>
      )}



      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Security Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Password Card */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-indigo-50 rounded-2xl">
                       <Key className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-gray-900">Password & Authentication</h3>
                       <p className="text-sm font-medium text-gray-500">Manage your access credentials</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Current Password</label>
                          <div className="relative group">
                             <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                             <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full pl-12 pr-12 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-xl font-bold text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                placeholder="Enter current password"
                             />
                             <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                             >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                             </button>
                          </div>
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">New Password</label>
                          <div className="relative group">
                             <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                             <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-xl font-bold text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                placeholder="Enter new password"
                             />
                          </div>
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                          <div className="relative group">
                             <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                             <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-xl font-bold text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                placeholder="Confirm new password"
                             />
                          </div>
                       </div>
                    </div>
                    <div className="flex justify-end">
                       <button 
                          type="button"
                          onClick={() => showToast('Password updated successfully!')}
                          className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 hover:scale-[1.02] hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                       >
                          <Save className="w-4 h-4" />
                          Update Password
                       </button>
                    </div>
                 </div>
              </div>

              {/* Active Sessions */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-green-50 rounded-2xl">
                       <Monitor className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-gray-900">Active Sessions</h3>
                       <p className="text-sm font-medium text-gray-500">Devices currently logged into your account</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-green-50/50 rounded-2xl border border-green-100">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                             <Monitor className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                             <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                Windows PC
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wider">Current</span>
                             </h4>
                             <p className="text-xs font-medium text-gray-500 mt-1">Chrome • San Francisco, US • 10.0.0.15</p>
                          </div>
                       </div>
                       <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-md transition-all group">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                             <Smartphone className="w-6 h-6 text-gray-500 group-hover:text-indigo-500 transition-colors" />
                          </div>
                          <div>
                             <h4 className="font-bold text-gray-900">iPhone 14 Pro</h4>
                             <p className="text-xs font-medium text-gray-500 mt-1">Safari • London, UK • 2 hrs ago</p>
                          </div>
                       </div>
                       <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer" title="Revoke Session">
                          <LogOut className="w-5 h-5" />
                       </button>
                    </div>
                 </div>
              </div>
            </div>

            {/* Right Column - 2FA & Danger Zone */}
            <div className="space-y-6">
               {/* 2FA Card */}
               <div className="bg-linear-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-10">
                     <Shield className="w-32 h-32" />
                  </div>
                  
                  <div className="relative">
                     <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/10">
                        <Shield className="w-8 h-8 text-white" />
                     </div>
                     <h3 className="text-2xl font-black mb-2">Two-Factor Auth</h3>
                     <p className="text-indigo-100 font-medium mb-8 text-sm leading-relaxed">Secure your account with an extra layer of protection.</p>
                     
                     <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 mb-6">
                        <div className="flex items-center justify-between mb-2">
                           <span className="font-bold text-sm">Status</span>
                           <span className={`px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${security.twoFactorEnabled ? 'bg-green-500 text-white' : 'bg-white/20 text-indigo-100'}`}>
                              {security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                           </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer w-full">
                           <input
                              type="checkbox"
                              checked={security.twoFactorEnabled}
                              onChange={(e) => setSecurity({ ...security, twoFactorEnabled: e.target.checked })}
                              className="sr-only peer"
                           />
                           <div className="w-full h-10 bg-black/20 peer-focus:outline-none rounded-xl peer peer-checked:bg-green-500/50 transition-all flex items-center px-1">
                              <div className={`w-8 h-8 bg-white rounded-lg shadow-sm transition-all transform ${security.twoFactorEnabled ? 'translate-x-[calc(100%-2rem)]' : 'translate-x-0'}`}></div>
                           </div>
                        </label>
                     </div>

                     <button className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        Configure 2FA
                     </button>
                  </div>
               </div>

               {/* Danger Zone - Restricted to Owner */}
               {userRole === 'OWNER' && (
                 <div className="bg-red-50/50 rounded-[2.5rem] p-8 border border-red-100">
                    <h3 className="text-lg font-black text-red-900 mb-6 flex items-center gap-2">
                       <AlertCircle className="w-5 h-5" />
                       Danger Zone
                    </h3>
                    
                    <div className="space-y-4">
                       <div className="p-5 bg-white rounded-2xl border border-red-100 shadow-sm">
                          <h4 className="font-bold text-gray-900 text-sm mb-1">Export Data</h4>
                          <p className="text-xs text-gray-500 mb-4">Download a copy of all your data.</p>
                          <button 
                             onClick={() => setShowExportModal(true)}
                             className="w-full py-2 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                          >
                             <Download className="w-3 h-3" />
                             Export JSON
                          </button>
                       </div>

                       <div className="p-5 bg-white rounded-2xl border border-red-100 shadow-sm">
                          <h4 className="font-bold text-gray-900 text-sm mb-1">Delete Account</h4>
                          <p className="text-xs text-gray-500 mb-4">Permanently remove your account.</p>
                          <button 
                             onClick={() => setShowDeleteModal(true)}
                             className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                          >
                             <Trash2 className="w-3 h-3" />
                             Delete Account
                          </button>
                       </div>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-indigo-50 rounded-2xl">
                      <Bell className="w-6 h-6 text-indigo-600" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-gray-900">Notification Preferences</h3>
                      <p className="text-sm font-medium text-gray-500">Choose how and when you want to be notified</p>
                   </div>
                </div>
                <button 
                   onClick={handleSave}
                   className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 cursor-pointer flex items-center gap-2"
                >
                   <Save className="w-4 h-4" />
                   Save Changes
                </button>
             </div>

             <div className="space-y-6">
                {([
                   { label: 'Daily Digest', desc: 'Get a summary of your daily activity', key: 'emailDigest', icon: Mail },
                   { label: 'Task Reminders', desc: 'Notifications for deadline alerts', key: 'taskReminders', icon: Zap },
                   { label: 'Invoice Alerts', desc: 'Updates on payments and invoices', key: 'invoiceAlerts', icon: FileText },
                   { label: 'Team Updates', desc: 'Activity from your team members', key: 'teamUpdates', icon: Users },
                   { label: 'Marketing', desc: 'Product news and promotions', key: 'marketingEmails', icon: Crown },
                ] as { label: string; desc: string; key: keyof NotificationSettings; icon: React.ElementType }[]).map((item, idx) => (
                   <div key={idx} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all group">
                      <div className="flex items-center gap-5">
                         <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                            <item.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                         </div>
                         <div>
                            <h4 className="font-bold text-lg text-gray-900">{item.label}</h4>
                            <p className="text-sm font-medium text-gray-500">{item.desc}</p>
                         </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                         <input
                            type="checkbox"
                            checked={notifications[item.key]}
                            onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                            className="sr-only peer"
                         />
                         <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600 peer-checked:shadow-lg"></div>
                      </label>
                   </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {loadingBilling ? (
            <div className="bg-white rounded-xl p-12 text-center border-2 border-gray-100">
               <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
               <p className="text-gray-500 font-medium">Fetching secure billing data...</p>
            </div>
          ) : (
            <>
              {/* Current Plan */}
              <div className="bg-linear-to-br from-indigo-500 to-purple-500 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{billingInfo?.plan?.name || 'All-in-One Plan'}</h2>
                    <p className="text-indigo-100">
                      {billingInfo?.status === 'active' ? 'Billed monthly' : `Status: ${billingInfo?.status || 'Unknown'}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold">
                      £{((billingInfo?.plan?.amount || 1999) / 100).toFixed(2)}
                    </p>
                    <p className="text-indigo-100">per {billingInfo?.plan?.interval || 'month'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    type="button"
                    onClick={handleOpenPortal}
                    className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all cursor-pointer shadow-md"
                  >
                    Manage Subscription
                  </button>
                  {billingInfo?.currentPeriodEnd && (
                    <p className="text-sm text-indigo-100 font-medium">
                      Next renewal: {new Date(billingInfo.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-500" />
                  Payment Method
                </h2>
                <div className="space-y-3">
                  {paymentMethods.length > 0 ? (
                    paymentMethods.map((pm) => (
                      <div key={pm.id} className={`flex items-center justify-between p-4 rounded-xl border-2 ${pm.isDefault ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${pm.isDefault ? 'bg-indigo-500' : 'bg-gray-400'}`}>
                            <CreditCard className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className={`font-bold ${pm.isDefault ? 'text-indigo-900' : 'text-gray-900'}`}>
                              {pm.card.brand.toUpperCase()} ending in {pm.card.last4}
                            </h3>
                            <p className={`text-sm ${pm.isDefault ? 'text-indigo-700' : 'text-gray-600'}`}>
                              Expires {pm.card.expMonth}/{pm.card.expYear}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {pm.isDefault && (
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">Default</span>
                          )}
                          <button 
                            type="button"
                            onClick={handleOpenPortal}
                            className="p-2 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4 text-indigo-600" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <p className="text-gray-500 font-medium">No payment methods found</p>
                    </div>
                  )}
                  <button 
                    type="button"
                    onClick={handleOpenPortal}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 text-gray-700 font-medium rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    Manage Payment Methods
                  </button>
                </div>
              </div>

              {/* Billing History */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  Billing History
                </h2>
                <div className="space-y-3">
                  {invoices.length > 0 ? (
                    invoices.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-600" />
                          <div>
                            <h3 className="font-semibold text-gray-900">{inv.number}</h3>
                            <p className="text-sm text-gray-600">{new Date(inv.periodStart).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-gray-900">£{(inv.amount / 100).toFixed(2)}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {inv.status.toUpperCase()}
                          </span>
                          {inv.invoicePdf && (
                            <a 
                              href={inv.invoicePdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Download className="w-4 h-4 text-gray-600" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-gray-50 rounded-xl">
                      <p className="text-gray-500 font-medium">No billing history available</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modules Tab */}
      {activeTab === 'modules' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-2xl">
                  <Zap className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Module Manager</h3>
                  <p className="text-sm font-medium text-gray-500">Enable or disable platform features to tailor your experience</p>
                </div>
              </div>
              <button 
                onClick={async () => {
                  setUpdatingModules(true);
                  try {
                    const response = await fetch('/api/business/modules', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ enabledModules }),
                    });
                    if (response.ok) {
                      showToast('Modules updated successfully! Reloading dashboard...');
                      setTimeout(() => window.location.reload(), 1500);
                    } else {
                      showToast('Failed to update modules', 'error');
                    }
                  } catch {
                    showToast('Connection error', 'error');
                  } finally {
                    setUpdatingModules(false);
                  }
                }}
                disabled={updatingModules}
                className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {updatingModules ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                Save Module Configuration
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 'invoicing', label: 'Invoicing', icon: Receipt, category: 'Finance', desc: 'Create and manage professional invoices.' },
                { id: 'accounting', label: 'Accounting', icon: Calculator, category: 'Finance', desc: 'Double-entry bookkeeping and ledgers.' },
                { id: 'taxation', label: 'Taxation', icon: FileText, category: 'Finance', desc: 'Tax calculations and reporting.' },
                { id: 'cashflow', label: 'Cashflow', icon: TrendingUp, category: 'Finance', desc: 'Monitor your business liquidity.' },
                { id: 'expenses', label: 'Expenses', icon: FileText, category: 'Finance', desc: 'Track business spending and receipts.' },
                { id: 'vat-tools', label: 'VAT Tools', icon: Calculator, category: 'Finance', desc: 'VAT returns and MTD tools.' },
                
                { id: 'crm', label: 'CRM', icon: Users, category: 'Customer', desc: 'Manage your leads and customers.' },
                { id: 'forms', label: 'Forms', icon: FormInput, category: 'Customer', desc: 'Custom intake and lead forms.' },
                { id: 'booking', label: 'Booking', icon: CalendarIcon, category: 'Customer', desc: 'Online appointment scheduling.' },
                { id: 'helpdesk', label: 'Helpdesk', icon: MessageSquare, category: 'Customer', desc: 'Customer support ticket system.' },
                { id: 'campaigns', label: 'Campaigns', icon: Mail, category: 'Customer', desc: 'Email marketing and outreach.' },

                { id: 'tasks', label: 'Tasks', icon: CheckSquare, category: 'Productivity', desc: 'Project and task management.' },
                { id: 'ai-content', label: 'AI Content', icon: Sparkles, category: 'Productivity', desc: 'Generate marketing copy with AI.' },
                { id: 'ai-notes', label: 'AI Notes', icon: FileEdit, category: 'Productivity', desc: 'Smart note-taking and summaries.' },
                { id: 'kpi-dashboard', label: 'KPI Dashboard', icon: BarChart3, category: 'Productivity', desc: 'Business performance metrics.' },

                { id: 'inventory', label: 'Inventory', icon: Package, category: 'Operations', desc: 'Stock levels and warehouse tracking.' },
                { id: 'suppliers', label: 'Suppliers', icon: Truck, category: 'Operations', desc: 'Manage vendor relationships.' },
                { id: 'hr-records', label: 'HR Records', icon: UserCheck, category: 'Operations', desc: 'Employee data and HR management.' },
                { id: 'e-signature', label: 'E-Signature', icon: PenTool, category: 'Operations', desc: 'Sign documents electronically.' },
                { id: 'micro-pages', label: 'Micro Pages', icon: Globe, category: 'Operations', desc: 'Mini-websites for your business.' },
                { id: 'compliance', label: 'Compliance', icon: ShieldIcon, category: 'Operations', desc: 'Legal and regulatory reminders.' },
              ].map((module) => (
                <div 
                  key={module.id}
                  className={`p-6 rounded-4xl border-2 transition-all cursor-pointer group ${
                    enabledModules.includes(module.id) 
                    ? 'bg-white border-indigo-500 shadow-md ring-4 ring-indigo-50' 
                    : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                  }`}
                  onClick={() => {
                    if (module.id === 'dashboard') return; // Dashboard is mandatory
                    setEnabledModules(prev => 
                      prev.includes(module.id) 
                      ? prev.filter(id => id !== module.id) 
                      : [...prev, module.id]
                    );
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl transition-colors ${
                      enabledModules.includes(module.id) ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400 group-hover:text-gray-600'
                    }`}>
                      <module.icon className="w-6 h-6" />
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${
                      enabledModules.includes(module.id) ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        enabledModules.includes(module.id) ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900">{module.label}</h4>
                  <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{module.category}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-2">{module.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Language & Region</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                <select
                  value={profile.language}
                  onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Chinese</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Timezone</label>
                <select
                  value={profile.timezone}
                  onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="Europe/London">London (GMT)</option>
                </select>
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleSave}
            className="w-full px-6 py-3 bg-linear-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-5 h-5" />
            Save Preferences
          </button>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Connected Apps</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Google Workspace', icon: '🔗', connected: true, description: 'Sync contacts and calendar' },
                { name: 'Slack', icon: '💬', connected: true, description: 'Team communication' },
                { name: 'Stripe', icon: '💳', connected: false, description: 'Payment processing' },
                { name: 'QuickBooks', icon: '📊', connected: false, description: 'Accounting software' },
              ].map((app, idx) => (
                <div key={idx} className="p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{app.icon}</span>
                      <div>
                        <h3 className="font-bold text-gray-900">{app.name}</h3>
                        <p className="text-sm text-gray-600">{app.description}</p>
                      </div>
                    </div>
                  </div>
                  {app.connected ? (
                    <button 
                      type="button"
                      onClick={() => showToast(`Disconnecting ${app.name}`)}
                      className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium cursor-pointer"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => showToast(`Connecting ${app.name}`)}
                      className="w-full px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium cursor-pointer"
                    >
                      Connect
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">API Access</h2>
            <div className="space-y-4">
              <div className="p-4 bg-linear-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <Code className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-purple-900">API Key</h3>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value="sk_live_••••••••••••••••••••••••"
                    readOnly
                    className="flex-1 px-4 py-2 bg-white border border-purple-200 rounded-lg font-mono text-sm"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('sk_live_••••••••••••••••••••••••');
                      showToast('API key copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => showToast('New API key generated!')}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 text-gray-700 font-medium rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                Generate New API Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone - Global Restricted to Owner */}
      {userRole === 'OWNER' && (
        <div className="bg-white rounded-xl border-2 border-red-200 p-6">
          <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            Danger Zone
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
              <div>
                <h3 className="font-semibold text-red-900">Export Your Data</h3>
                <p className="text-sm text-red-700">Download all your account data</p>
              </div>
              <button 
                type="button"
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
              <div>
                <h3 className="font-semibold text-red-900">Delete Account</h3>
                <p className="text-sm text-red-700">Permanently delete your account and all data</p>
              </div>
              <button 
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Data Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="bg-linear-to-r from-orange-500 to-red-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <Download className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Export Account Data</h2>
                  <p className="text-orange-100 text-sm mt-0.5">Download your complete account information</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Account Info Preview */}
              <div className="bg-linear-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-linear-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">{profile.firstName} {profile.lastName}</p>
                    <p className="text-sm text-gray-600">{profile.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                        {profile.company}
                      </span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                        {profile.position}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-orange-600" />
                    <span>{profile.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    <span>{profile.city}, {profile.country}</span>
                  </div>
                </div>
              </div>

              {/* Export Format Options */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-gray-900">Choose Export Format:</p>
                  <span className="text-xs text-gray-500">Select your preferred file type</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* JSON Option */}
                  <button
                    type="button"
                    onClick={() => {
                      const exportData = {
                        profile: profile,
                        security: {
                          twoFactorEnabled: security.twoFactorEnabled,
                          emailNotifications: security.emailNotifications,
                          smsNotifications: security.smsNotifications,
                          loginAlerts: security.loginAlerts
                        },
                        notifications: notifications,
                        preferences: {
                          theme: 'light',
                          language: profile.language,
                          timezone: profile.timezone
                        },
                        exportDate: new Date().toISOString(),
                        exportedBy: `${profile.firstName} ${profile.lastName}`
                      };
                      
                      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `account_data_${new Date().toISOString().split('T')[0]}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      setShowExportModal(false);
                    }}
                    className="group relative px-5 py-4 bg-linear-to-br from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all flex flex-col items-center gap-2 font-semibold cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                      <Code className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold">JSON</p>
                      <p className="text-xs text-blue-100 mt-0.5">Structured data format</p>
                    </div>
                  </button>

                  {/* CSV Option */}
                  <button
                    type="button"
                    onClick={() => {
                      const csv = `Account Data Export\n\nProfile Information\nFirst Name,${profile.firstName}\nLast Name,${profile.lastName}\nEmail,${profile.email}\nPhone,${profile.phone}\nCompany,${profile.company}\nPosition,${profile.position}\nAddress,${profile.address}\nCity,${profile.city}\nCountry,${profile.country}\n\nSecurity Settings\nTwo-Factor Auth,${security.twoFactorEnabled ? 'Enabled' : 'Disabled'}\nEmail Notifications,${security.emailNotifications ? 'Enabled' : 'Disabled'}\nSMS Notifications,${security.smsNotifications ? 'Enabled' : 'Disabled'}\nLogin Alerts,${security.loginAlerts ? 'Enabled' : 'Disabled'}\n\nNotification Preferences\nEmail Digest,${notifications.emailDigest ? 'Enabled' : 'Disabled'}\nTask Reminders,${notifications.taskReminders ? 'Enabled' : 'Disabled'}\nInvoice Alerts,${notifications.invoiceAlerts ? 'Enabled' : 'Disabled'}\nTeam Updates,${notifications.teamUpdates ? 'Enabled' : 'Disabled'}\nMarketing Emails,${notifications.marketingEmails ? 'Enabled' : 'Disabled'}\n\nPreferences\nTheme,light\nLanguage,${profile.language}\nTimezone,${profile.timezone}\n\nExport Date,${new Date().toLocaleString()}`;
                      
                      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `account_data_${new Date().toISOString().split('T')[0]}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      setShowExportModal(false);
                    }}
                    className="group relative px-5 py-4 bg-linear-to-br from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all flex flex-col items-center gap-2 font-semibold cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold">CSV / Excel</p>
                      <p className="text-xs text-green-100 mt-0.5">Spreadsheet format</p>
                    </div>
                  </button>

                  {/* PDF Report Option */}
                  <button
                    type="button"
                    onClick={() => {
                      const pdfContent = `
ACCOUNT DATA EXPORT REPORT
${'='.repeat(80)}

PROFILE INFORMATION
${'-'.repeat(80)}
Name:              ${profile.firstName} ${profile.lastName}
Email:             ${profile.email}
Phone:             ${profile.phone}
Company:           ${profile.company}
Position:          ${profile.position}
Address:           ${profile.address}
City:              ${profile.city}
Country:           ${profile.country}
Language:          ${profile.language}
Timezone:          ${profile.timezone}

SECURITY SETTINGS
${'-'.repeat(80)}
Two-Factor Authentication:    ${security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
Email Notifications:          ${security.emailNotifications ? 'Enabled' : 'Disabled'}
SMS Notifications:            ${security.smsNotifications ? 'Enabled' : 'Disabled'}
Login Alerts:                 ${security.loginAlerts ? 'Enabled' : 'Disabled'}

NOTIFICATION PREFERENCES
${'-'.repeat(80)}
Email Digest:                 ${notifications.emailDigest ? 'Enabled' : 'Disabled'}
Task Reminders:               ${notifications.taskReminders ? 'Enabled' : 'Disabled'}
Invoice Alerts:               ${notifications.invoiceAlerts ? 'Enabled' : 'Disabled'}
Team Updates:                 ${notifications.teamUpdates ? 'Enabled' : 'Disabled'}
Marketing Emails:             ${notifications.marketingEmails ? 'Enabled' : 'Disabled'}

APPEARANCE & PREFERENCES
${'-'.repeat(80)}
Theme:                        light
Language:                     ${profile.language}
Timezone:                     ${profile.timezone}

${'='.repeat(80)}
Report Generated:             ${new Date().toLocaleString()}
Exported By:                  ${profile.firstName} ${profile.lastName}
Confidential - For Personal Use Only
`;
                      
                      const blob = new Blob([pdfContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `account_report_${new Date().toISOString().split('T')[0]}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      setShowExportModal(false);
                    }}
                    className="group relative px-5 py-4 bg-linear-to-br from-red-500 to-pink-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all flex flex-col items-center gap-2 font-semibold cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold">PDF Report</p>
                      <p className="text-xs text-red-100 mt-0.5">Formatted document</p>
                    </div>
                  </button>

                  {/* Plain Text Option */}
                  <button
                    type="button"
                    onClick={() => {
                      const textData = `ACCOUNT DATA EXPORT\n${'='.repeat(60)}\n\nPROFILE:\n  Name: ${profile.firstName} ${profile.lastName}\n  Email: ${profile.email}\n  Phone: ${profile.phone}\n  Company: ${profile.company}\n  Position: ${profile.position}\n  Location: ${profile.city}, ${profile.country}\n\nSECURITY:\n  Two-Factor Auth: ${security.twoFactorEnabled ? 'Enabled' : 'Disabled'}\n  Email Notifications: ${security.emailNotifications ? 'Enabled' : 'Disabled'}\n  SMS Notifications: ${security.smsNotifications ? 'Enabled' : 'Disabled'}\n  Login Alerts: ${security.loginAlerts ? 'Enabled' : 'Disabled'}\n\nNOTIFICATIONS:\n  Email Digest: ${notifications.emailDigest ? 'Yes' : 'No'}\n  Task Reminders: ${notifications.taskReminders ? 'Yes' : 'No'}\n  Invoice Alerts: ${notifications.invoiceAlerts ? 'Yes' : 'No'}\n  Team Updates: ${notifications.teamUpdates ? 'Yes' : 'No'}\n  Marketing: ${notifications.marketingEmails ? 'Yes' : 'No'}\n\nPREFERENCES:\n  Theme: light\n  Language: ${profile.language}\n  Timezone: ${profile.timezone}\n\nExported: ${new Date().toLocaleString()}\n`;
                      
                      const blob = new Blob([textData], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `account_data_${new Date().toISOString().split('T')[0]}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      setShowExportModal(false);
                    }}
                    className="group relative px-5 py-4 bg-linear-to-br from-gray-600 to-gray-800 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all flex flex-col items-center gap-2 font-semibold cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold">Plain Text</p>
                      <p className="text-xs text-gray-200 mt-0.5">Simple text file</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-semibold mb-1">Data Privacy Notice</p>
                  <p>Your exported data contains sensitive personal information. Store it securely and do not share it with unauthorized parties.</p>
                </div>
              </div>

              {/* Cancel Button */}
              <button 
                type="button"
                onClick={() => setShowExportModal(false)}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/10">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white leading-tight">Add Employee</h2>
                  <p className="text-indigo-100 text-xs font-medium">Add a new member to your team</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewEmployee({
                    email: '',
                    firstName: '',
                    lastName: '',
                    phone: '',
                    role: 'MEMBER',
                    password: '',
                  });
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="employee@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={newEmployee.firstName}
                    onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={newEmployee.lastName}
                    onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="MEMBER">Member</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">6-digit Access Code (optional)</label>
                <input
                  type="password"
                  maxLength={6}
                  value={newEmployee.password}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setNewEmployee({ ...newEmployee, password: val });
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g. 123456"
                />
                <p className="text-xs text-gray-500 mt-1">Create a unique 6-digit code for their first login</p>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleAddEmployee}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all cursor-pointer"
                >
                  Add Employee
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewEmployee({
                      email: '',
                      firstName: '',
                      lastName: '',
                      phone: '',
                      role: 'MEMBER',
                      password: '',
                    });
                  }}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/10">
                  <Edit3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white leading-tight">Edit Employee</h2>
                  <p className="text-indigo-100 text-xs font-medium">Update team member details</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Update email if there was a typo</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={editingUser.firstName || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={editingUser.lastName || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="MEMBER">Member</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Update 6-digit Access Code (optional)</label>
                <input
                  type="password"
                  maxLength={6}
                  value={editingUser.password || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setEditingUser({ ...editingUser, password: val });
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Leave empty to keep existing"
                />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleUpdateEmployee}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all cursor-pointer"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          showToast('Account deletion initiated. You will receive a confirmation email.');
          setShowDeleteModal(false);
        }}
        title="Delete Account"
        itemName={`${profile.firstName} ${profile.lastName}'s Account`}
        itemDetails={`${profile.email} - ${profile.company}`}
        warningMessage="This will permanently delete your account, all data, and cannot be undone. All subscriptions will be cancelled."
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-100"
          >
            <div className={`px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 min-w-[320px] transition-all
              ${toast.type === 'success' 
                ? 'bg-white/90 border-emerald-100 text-emerald-900' 
                : 'bg-white/90 border-red-100 text-red-900'
              }`}
            >
              <div className={`p-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                {toast.type === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                ) : (
                  <AlertCircleIcon className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">
                  {toast.type === 'success' ? 'Success' : 'Attention'}
                </p>
                <p className="text-sm opacity-80 leading-snug">{toast.message}</p>
              </div>
              <button 
                onClick={() => setToast(null)}
                className="p-1 hover:bg-black/5 rounded-lg transition-colors ml-2 cursor-pointer"
              >
                <X className="w-4 h-4 opacity-50" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
