"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { 
  User, Mail, Phone, MapPin, Building2, Briefcase, Lock,
  Bell, CreditCard, Globe, Shield, Eye, EyeOff, Camera,
  Save, X, Check, AlertCircle, Settings as SettingsIcon,
  Zap, Download, Upload,
  Trash2, LogOut, Key, Smartphone, Monitor, Users, Crown,
  FileText, Code, Sparkles,
  Edit3, UserPlus, UserCheck, MessageSquare, MessageCircle,
  Calculator, Calendar as CalendarIcon,
  CheckSquare, FileEdit, BarChart3, PenTool, Layout
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { usePresence } from '@/components/hooks/use-presence';
import { TeamActivityFeed } from '@/components/team-activity-feed';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle as AlertCircleIcon } from 'lucide-react';

// Global pivot pricing tiers — display copy only. The actual charge amount
// always comes from Stripe (see lib/stripe/global-billing.ts, which reads
// unit_amount off the configured Price object rather than duplicating these
// numbers as a billing source of truth).
const GLOBAL_TIERS: { id: 'FREE' | 'STARTER' | 'GROWTH' | 'SCALE'; label: string; monthly: number; annual: number; seats: number; badge?: string }[] = [
  { id: 'FREE', label: 'Free Forever', monthly: 0, annual: 0, seats: 1, badge: 'Freemium' },
  { id: 'STARTER', label: 'Starter', monthly: 39, annual: 29, seats: 5 },
  { id: 'GROWTH', label: 'Growth', monthly: 79, annual: 59, seats: 12, badge: 'Flagship' },
  { id: 'SCALE', label: 'Scale', monthly: 159, annual: 129, seats: 25 },
];

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
  image?: string;
  password?: string;
}

// Hidden until real Shopify app credentials are configured — the backend
// (connect/callback/sync routes) is fully built, just not exposed in the UI yet.
const SHOPIFY_SYNC_ENABLED = false;

function SettingsPageInner() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'profile');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
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

  // Sync URL searchParam tab to activeTab state
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Scroll to top when settings tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [activeTab]);

  // Billing states
  interface SubInfo {
    status: string;
    isActive: boolean;
    daysLeft: number | null;
    trialEnd: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    amount: number;
    currency?: string;
    plan?: string | null;
    planTier: string | null;
  }

  const [subInfo, setSubInfo] = useState<SubInfo | null>(null);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [globalBillingPeriod, setGlobalBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [checkoutLoadingTier, setCheckoutLoadingTier] = useState<string | null>(null);

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

  const [fiscalYearEnd, setFiscalYearEnd] = useState({ month: 3, day: 31 });
  const [savingFiscalYearEnd, setSavingFiscalYearEnd] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }

  const [shopifyStatus, setShopifyStatus] = useState<{ connected: boolean; shopDomain?: string } | null>(null);
  const [shopifyShopInput, setShopifyShopInput] = useState('');
  const [shopifySyncing, setShopifySyncing] = useState(false);
  const [shopifyDisconnecting, setShopifyDisconnecting] = useState(false);

  const fetchShopifyStatus = async () => {
    try {
      const res = await fetch('/api/integrations/shopify');
      if (res.ok) setShopifyStatus(await res.json());
    } catch { /* silent */ }
  };

  useEffect(() => { if (SHOPIFY_SYNC_ENABLED) fetchShopifyStatus(); }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/business');
        if (res.ok) {
          const data = await res.json();
          setFiscalYearEnd({ month: data.fiscalYearEndMonth, day: data.fiscalYearEndDay });
        }
      } catch { /* silent */ }
    })();
  }, []);

  const handleSaveFiscalYearEnd = async () => {
    setSavingFiscalYearEnd(true);
    try {
      const res = await fetch('/api/business', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fiscalYearEndMonth: fiscalYearEnd.month, fiscalYearEndDay: fiscalYearEnd.day }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      showToast('Fiscal year end updated');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save fiscal year end', 'error');
    } finally {
      setSavingFiscalYearEnd(false);
    }
  };

  const handleConnectShopify = () => {
    const shop = shopifyShopInput.trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)) {
      showToast('Enter a valid shop domain, e.g. your-store.myshopify.com', 'error');
      return;
    }
    window.location.href = `/api/integrations/shopify/connect?shop=${encodeURIComponent(shop)}`;
  };

  const handleSyncShopify = async () => {
    setShopifySyncing(true);
    try {
      const res = await fetch('/api/integrations/shopify/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast(`Synced — ${data.created} created, ${data.updated} updated`, 'success');
      } else {
        showToast(data.error || 'Sync failed', 'error');
      }
    } catch {
      showToast('Sync failed', 'error');
    } finally {
      setShopifySyncing(false);
    }
  };

  const handleDisconnectShopify = async () => {
    setShopifyDisconnecting(true);
    try {
      const res = await fetch('/api/integrations/shopify', { method: 'DELETE' });
      if (res.ok) {
        setShopifyStatus({ connected: false });
        showToast('Disconnected from Shopify');
      }
    } finally {
      setShopifyDisconnecting(false);
    }
  };

  // Handle Stripe/Shopify return — open the right tab and show an outcome toast
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const success = params.get('success');
    const cancelled = params.get('cancelled');
    const shopify = params.get('shopify');
    if (tab) setActiveTab(tab);
    if (success === 'true') showToast('Payment successful! Your subscription is now active.', 'success');
    if (cancelled === 'true') showToast('Checkout cancelled — no charge was made.', 'error');
    if (shopify === 'connected') { showToast('Connected to Shopify!', 'success'); fetchShopifyStatus(); }
    if (shopify === 'error') showToast('Failed to connect to Shopify. Please try again.', 'error');
    // Clean the URL without a page reload
    if (tab || success || cancelled || shopify) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

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
            timezone: data.timezone || 'Europe/London',
            language: 'English',
            avatar: data.avatar || data.image || '',
          });
          setSecurity(prev => ({
            ...prev,
            twoFactorEnabled: data.twoFactorEnabled ?? false,
          }));
          const fetchedModules = data.business?.enabledModules || [];
          const defaultAll = [
            'dashboard', 'crm', 'booking', 'helpdesk', 'campaigns',
            'tasks', 'ai-notes', 'kpi-dashboard', 'e-signature',
            'mailbox', 'collaboration', 'projects'
          ];
          if (fetchedModules.length === 0) {
            setEnabledModules(defaultAll);
          } else {
            const merged = Array.from(new Set([...fetchedModules, 'projects', 'collaboration', 'mailbox']));
            setEnabledModules(merged);
          }
          if (data.notificationPreferences) {
            setNotifications(prev => ({ ...prev, ...data.notificationPreferences }));
          }
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
      const res = await fetch('/api/billing/status');
      if (res.ok) setSubInfo(await res.json());
    } catch (error) {
      console.error('Error fetching billing info:', error);
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

  async function handleGlobalCheckout(planTier: 'FREE' | 'STARTER' | 'GROWTH' | 'SCALE') {
    if (planTier === 'FREE') {
      showToast('You are on the Free Forever plan ($0.00/mo)!');
      return;
    }
    setCheckoutLoadingTier(planTier);
    try {
      const response = await fetch('/api/billing/checkout-global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planTier, billingPeriod: globalBillingPeriod }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        showToast(data.error || 'Failed to start checkout', 'error');
      }
    } catch (error) {
      console.error('Global checkout error:', error);
      showToast('Connection error', 'error');
    } finally {
      setCheckoutLoadingTier(null);
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
        if (data.seatInfo) {
          setSeatInfo(data.seatInfo);
        } else {
          setSeatInfo({
            used: data.users?.length || 1,
            max: 10,
            available: 10 - (data.users?.length || 1)
          });
        }
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
    twoFactorEnabled: false,
    emailNotifications: true,
    smsNotifications: false,
    loginAlerts: true
  });

  // 2FA Verification & Management State
  const [show2FAVerifyModal, setShow2FAVerifyModal] = useState(false);
  const [show2FADisableModal, setShow2FADisableModal] = useState(false);
  const [twoFactorCodeInput, setTwoFactorCodeInput] = useState('');
  const [twoFactorPasswordInput, setTwoFactorPasswordInput] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

  const handleToggle2FA = async () => {
    if (!security.twoFactorEnabled) {
      // Send verification email to user
      setTwoFactorLoading(true);
      setTwoFactorError(null);
      setTwoFactorCodeInput('');
      try {
        const res = await fetch('/api/auth/2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send-enable-code' }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send verification code');
        setShow2FAVerifyModal(true);
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : 'Failed to send verification code', 'error');
      } finally {
        setTwoFactorLoading(false);
      }
    } else {
      // Prompt password before disabling
      setTwoFactorError(null);
      setTwoFactorPasswordInput('');
      setShow2FADisableModal(true);
    }
  };

  const handleConfirmEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCodeInput.trim().length !== 6) {
      setTwoFactorError('Please enter the complete 6-digit verification code.');
      return;
    }
    setTwoFactorLoading(true);
    setTwoFactorError(null);
    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-enable', code: twoFactorCodeInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid verification code');
      setSecurity(prev => ({ ...prev, twoFactorEnabled: true }));
      setShow2FAVerifyModal(false);
      setTwoFactorCodeInput('');
      showToast('Two-Factor Authentication is now enabled!', 'success');
    } catch (err: unknown) {
      setTwoFactorError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleConfirmDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorPasswordInput) {
      setTwoFactorError('Please enter your password to confirm.');
      return;
    }
    setTwoFactorLoading(true);
    setTwoFactorError(null);
    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disable', password: twoFactorPasswordInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Incorrect password');
      setSecurity(prev => ({ ...prev, twoFactorEnabled: false }));
      setShow2FADisableModal(false);
      setTwoFactorPasswordInput('');
      showToast('Two-Factor Authentication has been disabled.', 'success');
    } catch (err: unknown) {
      setTwoFactorError(err instanceof Error ? err.message : 'Incorrect password');
    } finally {
      setTwoFactorLoading(false);
    }
  };

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
      let avatarUrl = '';
      try {
        const form = new FormData();
        form.append('file', file);
        form.append('folder', 'avatars');
        const uploadRes = await fetch('/api/storage/upload', { method: 'POST', body: form });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.url) {
          avatarUrl = uploadData.url;
        }
      } catch {
        /* storage API fallback to base64 */
      }

      // If storage service isn't active or failed, read image as Base64 Data URL
      if (!avatarUrl) {
        avatarUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      const patchRes = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: avatarUrl }),
      });
      const patchData = await patchRes.json();
      if (!patchRes.ok) throw new Error(patchData.error || 'Failed to save avatar');

      setProfile(prev => ({ ...prev, avatar: avatarUrl }));
      showToast('Profile photo updated', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Upload failed', 'error');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSavingProfile(true);
    try {
      const requests = [
        fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
          }),
        }),
      ];

      if (userRole === 'OWNER' || userRole === 'ADMIN') {
        requests.push(
          fetch('/api/business', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: profile.company,
              address: profile.address,
              city: profile.city,
              country: profile.country,
            }),
          })
        );
      }

      const responses = await Promise.all(requests);
      const failed = responses.find(r => !r.ok);
      if (failed) {
        const data = await failed.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save changes');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      showToast('Profile updated successfully');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save changes', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSavingNotifications(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationPreferences: notifications }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save notification preferences');
      }
      showToast('Notification preferences saved');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save notification preferences', 'error');
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timezone: profile.timezone }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save preferences');
      }
      showToast('Preferences saved');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save preferences', 'error');
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.next || !passwordForm.confirm) {
      showToast('Please fill in all three password fields', 'error');
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      showToast('New password and confirmation do not match', 'error');
      return;
    }
    if (passwordForm.next.length < 8) {
      showToast('New password must be at least 8 characters', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.next,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }
      setPasswordForm({ current: '', next: '', confirm: '' });
      showToast('Password updated successfully');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update password', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  // Filter tabs based on user role
  const allTabs = [
    { id: 'profile', name: 'Profile', icon: User, roles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER'] },
    { id: 'team', name: 'Team', icon: Users, roles: ['OWNER'] },
    { id: 'security', name: 'Security', icon: Shield, roles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER'] },
    { id: 'notifications', name: 'Notifications', icon: Bell, roles: ['OWNER', 'ADMIN'] },
    { id: 'billing', name: 'Billing', icon: CreditCard, roles: ['OWNER', 'ADMIN'] },
    { id: 'modules', name: 'Tools', icon: Zap, roles: ['OWNER', 'ADMIN'] },
    { id: 'preferences', name: 'Preferences', icon: SettingsIcon, roles: ['OWNER', 'ADMIN'] },
  ];

  const tabs = allTabs.filter(tab => tab.roles.includes(userRole));
  
  // If current tab is not available for user role, switch to profile (only after profile finishes loading)
  useEffect(() => {
    if (loading) return;
    const availableTabs = allTabs.filter(tab => tab.roles.includes(userRole));
    if (!availableTabs.find(tab => tab.id === activeTab)) {
      setActiveTab('profile');
    }
  }, [userRole, activeTab, loading]);

  return (
    <div className="min-h-[calc(100vh-4rem)] space-y-4 md:space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            Account Settings
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/40">
              {profile.position || userRole}
            </span>
          </h1>
          <p className="mt-1 text-xs font-bold text-slate-400">
            Signed in as <span className="font-extrabold text-slate-700 dark:text-slate-300">{profile.email || 'Owner'}</span> · Manage preferences and configuration
          </p>
        </div>
        {saveSuccess && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2 w-fit">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300">Changes saved successfully</span>
          </div>
        )}
      </div>

      {/* ── Tab Navigation ── */}
      <div className="w-full flex items-center gap-1.5 p-1.5 bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-x-auto scrollbar-hide">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* ── Profile Tab ── */}
      {activeTab === 'profile' && (
        <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 py-20">
              <div className="h-9 w-9 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
              <p className="mt-3 text-xs font-bold text-slate-400">Loading profile…</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 md:gap-6">
              {/* Avatar card */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 flex flex-col items-center text-center gap-4 shadow-2xs">
                {/* Hidden file input */}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <div className="relative">
                  <div className="h-22 w-22 bg-slate-100 dark:bg-slate-900 border-2 border-orange-400 ring-4 ring-orange-500/20 rounded-full flex items-center justify-center text-2xl font-extrabold text-slate-700 dark:text-slate-200 overflow-hidden shadow-2xs">
                    {uploadingAvatar ? (
                      <div className="h-6 w-6 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
                    ) : profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={() => setProfile(prev => ({ ...prev, avatar: '' }))}
                      />
                    ) : (
                      <>{profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}</>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute -bottom-1 -right-1 p-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-full shadow-2xs hover:from-orange-600 hover:to-amber-700 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">{profile.firstName || 'User'} {profile.lastName}</p>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">{profile.position || 'Team Member'}</p>
                </div>
                {(userRole === 'OWNER' || userRole === 'ADMIN') && (
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="w-full py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold hover:bg-slate-50 dark:hover:bg-slate-900 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {uploadingAvatar
                      ? <><div className="h-3.5 w-3.5 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" /> Uploading…</>
                      : <><Upload className="h-3.5 w-3.5 text-orange-500" /> Upload photo</>}
                  </button>
                )}
                <div className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 text-left space-y-2.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Shield className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Account status</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">Plan</span>
                    <span className="font-mono font-extrabold text-slate-900 dark:text-white">£9.99/mo</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">Verified</span>
                    <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40 px-2.5 py-0.5 text-[10px] font-mono font-extrabold uppercase">Yes</span>
                  </div>
                </div>
              </div>

              {/* Personal info form */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 sm:p-7 shadow-2xs">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Personal Information</h3>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">Manage your public profile and private details</p>
                    </div>
                  </div>
                  {(userRole === 'OWNER' || userRole === 'ADMIN') && (
                    <button type="button" onClick={handleSave} disabled={savingProfile}
                      className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 px-4 py-2.5 text-xs font-extrabold text-white transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50">
                      <Save className="h-4 w-4" /> {savingProfile ? 'Saving…' : 'Save'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'First Name', value: profile.firstName, key: 'firstName', icon: User },
                    { label: 'Last Name', value: profile.lastName, key: 'lastName', icon: User },
                    { label: 'Email Address', value: profile.email, key: 'email', icon: Mail, type: 'email', alwaysDisabled: true, hint: 'Contact support to change your login email' },
                    { label: 'Phone Number', value: profile.phone, key: 'phone', icon: Phone, type: 'tel' },
                    { label: 'Company Name', value: profile.company, key: 'company', icon: Building2 },
                    { label: 'Job Title', value: profile.position, key: 'position', icon: Briefcase, alwaysDisabled: true, hint: 'Reflects your account role' },
                    { label: 'Address', value: profile.address, key: 'address', icon: MapPin, full: true },
                    { label: 'City', value: profile.city, key: 'city', icon: Building2 },
                    { label: 'Country', value: profile.country, key: 'country', icon: Globe },
                  ].map(field => {
                    const isDisabled = field.alwaysDisabled || userRole === 'MANAGER' || userRole === 'MEMBER';
                    return (
                    <div key={field.key} className={field.full ? 'sm:col-span-2' : ''}>
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">{field.label}</label>
                      <div className="relative">
                        <field.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type={field.type || 'text'}
                          value={field.value}
                          onChange={e => setProfile({ ...profile, [field.key]: e.target.value })}
                          disabled={isDisabled}
                          className={`w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-orange-500 transition ${
                            isDisabled ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-900' : ''
                          }`}
                        />
                      </div>
                      {field.hint && <p className="mt-1.5 text-xs text-gray-400">{field.hint}</p>}
                    </div>
                    );
                  })}
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
        <div className="space-y-6">
          {/* Stats & Capacity Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-2xs hover:border-orange-300 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-2xs">
                  <Crown className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 bg-orange-50 dark:bg-orange-950/60 rounded-full text-[10px] font-mono font-extrabold text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/40 uppercase">
                  Plan Limit: {seatInfo.max}
                </span>
              </div>
              <h3 className="text-3xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white">
                {seatInfo.used} / {seatInfo.max}
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-0.5">Active seats used</p>

              <div className="mt-5">
                <div className="flex justify-between text-xs font-mono font-bold mb-1.5 text-slate-400">
                  <span>Capacity Usage</span>
                  <span className="text-orange-500">{Math.round((seatInfo.used / seatInfo.max) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-200/60 dark:border-slate-800">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-full h-2 transition-all duration-700 ease-out shadow-2xs"
                    style={{ width: `${(seatInfo.used / seatInfo.max) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-2xs hover:border-emerald-300 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-2xs mb-4">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
                {teamMembers.filter(m => presence?.presence?.find(p => p.userId === m.id)?.isOnline).length}
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-0.5">Team members online now</p>
              <div className="mt-4 flex -space-x-2.5">
                {teamMembers.slice(0, 4).map((member, i) => {
                  const mAvatar = member.avatar || member.image || (session?.user?.id === member.id ? profile.avatar : '');
                  return (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-950 bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-xs font-extrabold text-slate-700 dark:text-slate-300 shadow-2xs overflow-hidden">
                      {mAvatar ? (
                        <img src={mAvatar} alt="Member Avatar" className="w-full h-full object-cover" />
                      ) : (
                        member.firstName?.charAt(0)
                      )}
                    </div>
                  );
                })}
                {teamMembers.length > 4 && (
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-950 bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-xs font-mono font-extrabold text-slate-500 shadow-2xs">
                    +{teamMembers.length - 4}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 flex flex-col justify-center items-center text-center gap-3 shadow-2xs">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-2xs">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Invite New Member</h3>
                <p className="text-xs font-bold text-slate-400 mt-0.5 max-w-[200px]">Expand your team and collaborate in real-time.</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                disabled={seatInfo.available === 0}
                className={`w-full py-2.5 rounded-2xl text-xs font-extrabold transition-all shadow-xs cursor-pointer active:scale-95 ${
                  seatInfo.available === 0
                    ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-800'
                    : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-orange-500/20'
                }`}
              >
                {seatInfo.available === 0 ? 'Capacity Full' : '+ Add Member'}
              </button>
            </div>
          </div>

          {/* Members Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-500" />
                Team Roster
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">Layout:</span>
                <button className="p-2 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl text-orange-500 shadow-2xs">
                  <Users className="w-4 h-4" />
                </button>
              </div>
            </div>

            {loadingTeam ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-44 bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {teamMembers.map((member) => {
                  const isOnline = presence?.presence?.find(p => p.userId === member.id)?.isOnline || false;
                  const roleBadge =
                    member.role === 'OWNER' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60' :
                    member.role === 'ADMIN' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200/60' :
                    member.role === 'MANAGER' ? 'bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border-orange-200/60' :
                    'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200/60';

                  const memberAvatar = member.avatar || member.image || (session?.user?.id === member.id ? profile.avatar : '');

                  return (
                    <div key={member.id} className="bg-white dark:bg-slate-950 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-orange-300 transition-all group relative">
                      <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        {member.role !== 'OWNER' && (
                          <>
                            <button
                              onClick={() => {
                                setEditingUser({ ...member });
                                setShowEditModal(true);
                              }}
                              className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:text-orange-500 transition-colors cursor-pointer shadow-2xs"
                              title="Edit Member"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(member.id)}
                              className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shadow-2xs"
                              title="Remove Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-3.5 mb-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 border-2 border-orange-400/80 rounded-full flex items-center justify-center text-sm font-extrabold text-slate-700 dark:text-slate-200 shadow-2xs overflow-hidden">
                            {memberAvatar ? (
                              <img src={memberAvatar} alt={`${member.firstName} ${member.lastName}`} className="w-full h-full object-cover" />
                            ) : (
                              <>{member.firstName?.charAt(0)}{member.lastName?.charAt(0)}</>
                            )}
                          </div>
                          {isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full shadow-2xs"></div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm leading-tight truncate group-hover:text-orange-500 transition-colors">
                            {member.firstName} {member.lastName}
                          </h4>
                          <p className="text-xs font-bold text-slate-400 mt-0.5 truncate">{member.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase border ${roleBadge}`}>
                          {member.role}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                          {member.status || 'ACTIVE'}
                        </span>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between text-xs font-mono font-bold text-slate-400">
                        <span>Joined {new Date().toLocaleDateString()}</span>
                        {isOnline ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
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

          <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              Team Activity Log
            </h3>
            <TeamActivityFeed />
          </div>
        </div>
      )}



      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Security Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Password Card */}
              <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-2xs">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Password & Access Credentials</h3>
                    <p className="text-xs font-bold text-slate-400">Manage and protect your account access keys</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordForm.current}
                          onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-2xl outline-none focus:border-orange-500 transition"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
                      <div className="relative">
                        <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordForm.next}
                          onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-2xl outline-none focus:border-orange-500 transition"
                          placeholder="Enter new password"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordForm.confirm}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-2xl outline-none focus:border-orange-500 transition"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-extrabold rounded-2xl transition-all cursor-pointer flex items-center gap-2 shadow-sm shadow-orange-500/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {changingPassword ? 'Updating…' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-2xs">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Active Device Sessions</h3>
                    <p className="text-xs font-bold text-slate-400">Devices currently authenticated to your account</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-center shadow-2xs">
                        <Monitor className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          This Device
                          <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40 rounded-full text-[10px] font-mono font-extrabold uppercase">Current</span>
                        </h4>
                        <p className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">Signed in now · Web Session</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      Active
                    </div>
                  </div>
                </div>
                <p className="text-[10px] font-mono font-bold text-slate-400 mt-4">Detailed device and location tracking is actively synchronized.</p>
              </div>
            </div>

            {/* Right Column - 2FA & Danger Zone */}
            <div className="space-y-6">
              {/* 2FA Card */}
              <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-2xs mb-4">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">Two-Factor Authentication</h3>
                <p className="text-xs font-bold text-slate-400 mb-5 leading-relaxed">Secure your account with an extra layer of 2FA protection.</p>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 mb-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">Email 2FA</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase border ${
                        security.twoFactorEnabled 
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/40' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200/60'
                      }`}>
                        {security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                      Sends a secure 6-digit PIN to {profile.email || 'your email'} whenever signing in.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggle2FA}
                    disabled={twoFactorLoading}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                      security.twoFactorEnabled
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        security.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[10px] font-mono font-bold text-slate-400">Enrolling 2FA enforces multi-factor verification at sign-in.</p>
              </div>

              {/* Danger Zone - Restricted to Owner */}
              {userRole === 'OWNER' && (
                <div className="bg-rose-50/30 dark:bg-rose-950/20 rounded-3xl p-6 border border-rose-200/80 dark:border-rose-900/40 shadow-2xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white flex items-center justify-center shadow-2xs">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-mono font-extrabold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Danger Zone</h3>
                      <p className="text-[10px] font-mono text-rose-500/80">Owner Restricted Area</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-white/80 dark:bg-slate-950/80 rounded-2xl border border-rose-200/60 dark:border-rose-900/30 shadow-2xs">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mb-1">Export Data</h4>
                      <p className="text-[10px] font-bold text-slate-400 mb-3">Download a structured JSON copy of all account data.</p>
                      <button
                        onClick={() => setShowExportModal(true)}
                        className="w-full py-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-orange-400 text-slate-800 dark:text-slate-200 font-extrabold rounded-2xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5 text-orange-500" />
                        Export JSON
                      </button>
                    </div>

                    <div className="p-4 bg-white/80 dark:bg-slate-950/80 rounded-2xl border border-rose-200/60 dark:border-rose-900/30 shadow-2xs">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mb-1">Delete Account</h4>
                      <p className="text-[10px] font-bold text-slate-400 mb-3">Permanently remove your business and account data.</p>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-extrabold rounded-2xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-rose-600/20 active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-900">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Notification Preferences</h3>
                  <p className="text-xs font-bold text-slate-400">Choose how and when you want to be notified across channels</p>
                </div>
              </div>
              <button
                onClick={handleSaveNotifications}
                disabled={savingNotifications}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-extrabold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto shrink-0 shadow-sm shadow-orange-500/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save className="w-3.5 h-3.5" />
                {savingNotifications ? 'Saving…' : 'Save Changes'}
              </button>
            </div>

            <div className="space-y-3.5">
              {([
                { label: 'Daily Digest', desc: 'Get a consolidated summary of your daily workspace activity', key: 'emailDigest', icon: Mail, badgeColor: 'text-orange-500 bg-orange-50 dark:bg-orange-950/60 border-orange-200/60' },
                { label: 'Task Reminders', desc: 'Real-time notifications for deadline alerts & upcoming milestones', key: 'taskReminders', icon: Zap, badgeColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-200/60' },
                { label: 'Invoice Alerts', desc: 'Instant updates on customer payments, overdue accounts & receipts', key: 'invoiceAlerts', icon: FileText, badgeColor: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/60' },
                { label: 'Team Updates', desc: 'Activity feed alerts from team members and seat assignments', key: 'teamUpdates', icon: Users, badgeColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/60' },
                { label: 'Marketing & Releases', desc: 'Product news, feature releases, and promotional announcements', key: 'marketingEmails', icon: Crown, badgeColor: 'text-purple-500 bg-purple-50 dark:bg-purple-950/60 border-purple-200/60' },
              ] as { label: string; desc: string; key: keyof NotificationSettings; icon: React.ElementType; badgeColor: string }[]).map((item, idx) => {
                const isChecked = notifications[item.key];
                return (
                  <div key={idx} className="flex items-center justify-between p-4 sm:p-4.5 bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-orange-300/80 transition-all shadow-2xs group">
                    <div className="flex items-center gap-3.5 min-w-0 pr-4">
                      <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs ${item.badgeColor}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight group-hover:text-orange-500 transition-colors">
                            {item.label}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase border ${
                            isChecked 
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/40' 
                              : 'bg-slate-100 dark:bg-slate-900 text-slate-400 border-slate-200/60 dark:border-slate-800'
                          }`}>
                            {isChecked ? 'ACTIVE' : 'MUTED'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 mt-0.5 truncate">{item.desc}</p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-7 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-xl peer peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-amber-600 transition-all flex items-center px-0.5">
                        <div className={`w-6 h-6 bg-white rounded-lg shadow-sm transition-transform ${isChecked ? 'translate-x-5' : 'translate-x-0'}`}></div>
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {loadingBilling ? (
            <div className="bg-white dark:bg-slate-950 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400 font-mono font-bold text-xs">Loading subscription details...</p>
            </div>
          ) : (
            <>
              {/* Plan card */}
              <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider font-mono">
                      {subInfo?.plan || 'Starter Plan'}
                    </p>
                    <h2 className="text-4xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white">
                      {subInfo?.currency === 'gbp' ? '£9.99' : '$39'}{' '}
                      <span className="text-sm font-bold text-slate-400 font-sans">/ month</span>
                    </h2>
                    <p className="text-xs font-bold text-slate-400 mt-1">
                      5 Team Seats Included · Full Virtual HQ & Client Suite Access · Cancel anytime
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                    <CreditCard className="w-6 h-6" />
                  </div>
                </div>

                {/* Status pill */}
                <div className="mt-5">
                  {subInfo?.status === 'TRIAL' && subInfo.isActive && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full text-xs font-mono font-extrabold uppercase">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      Free Trial · {subInfo.daysLeft === 1 ? '1 day' : `${subInfo.daysLeft} days`} remaining
                    </div>
                  )}
                  {subInfo?.status === 'ACTIVE' && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-mono font-extrabold uppercase">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active (Starter)
                      {subInfo.currentPeriodEnd && !subInfo.cancelAtPeriodEnd &&
                        ` · Renews ${new Date(subInfo.currentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                      {subInfo.cancelAtPeriodEnd && subInfo.currentPeriodEnd &&
                        ` · Cancels ${new Date(subInfo.currentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                    </div>
                  )}
                  {(!subInfo || subInfo.status === 'NONE') && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 text-slate-500 border border-slate-200/60 dark:border-slate-800 rounded-full text-xs font-mono font-extrabold uppercase">
                      No active subscription
                    </div>
                  )}
                  {subInfo && (subInfo.status === 'CANCELED' || subInfo.status === 'PAST_DUE') && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 rounded-full text-xs font-mono font-extrabold uppercase">
                      {subInfo.status === 'PAST_DUE' ? 'Payment failed' : 'Cancelled'}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleOpenPortal}
                    className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold rounded-2xl text-xs shadow-sm shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
                  >
                    Manage via Stripe Portal
                  </button>
                  {(!subInfo || !subInfo.isActive) && subInfo?.status !== 'ACTIVE' && (
                    <a
                      href="/billing"
                      className="px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-extrabold rounded-2xl text-xs border border-slate-200/80 dark:border-slate-800 hover:border-orange-400 transition-all shadow-2xs"
                    >
                      Subscribe · $39/mo
                    </a>
                  )}
                </div>
              </div>

              {/* What's included */}
              <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-2xs">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-500 flex items-center justify-center border border-orange-200/60">
                    <Zap className="w-4 h-4" />
                  </div>
                  What&apos;s Included in Your Plan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    '5 Team Seats Included',
                    'Collaboration Hub (Chat & Video)',
                    'Tasks & Agile Boards',
                    'Notes & Brainstorming',
                    'KPI Dashboard',
                    'Projects & Milestones',
                    'CRM Pipeline',
                    'Booking Pages',
                    'Mail Engine',
                    'E-Signatures',
                    'Campaigns',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 p-2.5 bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/80">
                      <div className="w-5 h-5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/60">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Info note */}
              <div className="flex items-start gap-3.5 p-5 bg-orange-50/40 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40 rounded-3xl shadow-2xs">
                <div className="w-9 h-9 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                  Payment methods, invoices, and billing history are managed securely through the <strong className="text-orange-600 dark:text-orange-400">Stripe Customer Portal</strong>. Click <em>Manage via Stripe Portal</em> above to update your card, download receipts, or cancel your subscription.
                </p>
              </div>

              {/* Global pivot: new USD tiered plans */}
              <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-900">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      Okleevo Global — Borderless Workspace Plans
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">Switch anytime. Your seat count carries over; extra seats beyond a plan&apos;s allotment are billed per seat.</p>
                  </div>
                  <div className="inline-flex items-center bg-slate-100 dark:bg-slate-900 rounded-2xl p-1 text-xs font-extrabold shrink-0 border border-slate-200/80 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setGlobalBillingPeriod('monthly')}
                      className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${globalBillingPeriod === 'monthly' ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-2xs' : 'text-slate-400'}`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setGlobalBillingPeriod('annual')}
                      className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${globalBillingPeriod === 'annual' ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-2xs' : 'text-slate-400'}`}
                    >
                      Annual
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
                  {GLOBAL_TIERS.map((tier) => {
                    const price = globalBillingPeriod === 'monthly' ? tier.monthly : tier.annual;
                    const isCurrentTier = subInfo?.planTier === tier.id || (!subInfo?.planTier && tier.id === 'FREE');
                    return (
                      <div key={tier.id} className={`rounded-3xl border p-5 flex flex-col justify-between transition-all shadow-2xs ${tier.id === 'GROWTH' ? 'border-orange-400/80 bg-orange-50/20 dark:bg-orange-950/10' : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950'}`}>
                        <div>
                          {tier.badge && (
                            <span className="self-start inline-block px-2.5 py-0.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-[9px] font-mono font-extrabold uppercase tracking-wide rounded-full mb-3 shadow-2xs">
                              {tier.badge}
                            </span>
                          )}
                          <p className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-mono">{tier.label}</p>
                          <p className="mt-2">
                            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">${price}</span>
                            <span className="text-xs font-bold text-slate-400">/mo</span>
                          </p>
                          <p className="text-xs font-mono font-bold text-slate-400 mb-4 mt-1">{tier.seats} seat{tier.seats > 1 ? 's' : ''} included</p>
                        </div>
                        <button
                          type="button"
                          disabled={checkoutLoadingTier !== null || Boolean(isCurrentTier)}
                          onClick={() => handleGlobalCheckout(tier.id)}
                          className={`mt-4 px-4 py-2.5 text-xs font-extrabold rounded-2xl transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isCurrentTier
                              ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 border border-slate-200/80 dark:border-slate-800'
                              : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-xs shadow-orange-500/20'
                          }`}
                        >
                          {isCurrentTier ? 'Current plan' : checkoutLoadingTier === tier.id ? 'Redirecting...' : tier.id === 'FREE' ? 'Free Forever' : 'Switch to this plan'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modules Tab */}
      {activeTab === 'modules' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-900">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Workspace Tools & Integrations</h3>
                  <p className="text-xs font-bold text-slate-400">Enable or disable workspace tools to customize your platform</p>
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
                      showToast('Tools updated successfully! Reloading dashboard...');
                      setTimeout(() => window.location.reload(), 1500);
                    } else {
                      showToast('Failed to update tools', 'error');
                    }
                  } catch {
                    showToast('Connection error', 'error');
                  } finally {
                    setUpdatingModules(false);
                  }
                }}
                disabled={updatingModules}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-extrabold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto shrink-0 shadow-sm shadow-orange-500/20 active:scale-95"
              >
                {updatingModules ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {updatingModules ? 'Saving…' : 'Save Tool Configuration'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
              {[
                { id: 'collaboration', label: 'Collaboration Hub', icon: MessageSquare, category: 'Communication', desc: 'Real-time team messaging, channels, and WebRTC video meetings.' },
                { id: 'tasks', label: 'Tasks', icon: CheckSquare, category: 'Productivity', desc: 'Task management, subtasks, and deadline tracking.' },
                { id: 'ai-notes', label: 'Notes', icon: FileEdit, category: 'Productivity', desc: 'Smart note-taking, AI document summaries, and rich text.' },
                { id: 'kpi-dashboard', label: 'KPI Dashboard', icon: BarChart3, category: 'Analytics', desc: 'Executive metrics, revenue tracking, and financial performance.' },
                { id: 'projects', label: 'Projects', icon: Layout, category: 'Productivity', desc: 'Project boards, gantt timelines, and team milestones.' },
                { id: 'crm', label: 'CRM Pipeline', icon: Users, category: 'Sales', desc: 'Customer deal pipeline, lead tracking, and contact management.' },
                { id: 'booking', label: 'Booking Pages', icon: CalendarIcon, category: 'Appointments', desc: 'Client appointment booking portal and availability rules.' },
                { id: 'mailbox', label: 'Mail Engine', icon: Mail, category: 'Communication', desc: 'Automated email dispatch and transactional mail engine.' },
                { id: 'e-signature', label: 'E-Signatures', icon: PenTool, category: 'Legal', desc: 'Legally binding eIDAS e-signature pad and client documents.' },
                { id: 'campaigns', label: 'Campaigns', icon: Zap, category: 'Marketing', desc: 'Broadcast email marketing campaigns and engagement telemetry.' },
              ].map((module) => {
                const isEnabled = enabledModules.includes(module.id);
                return (
                  <div
                    key={module.id}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-2xs group relative flex flex-col justify-between ${
                      isEnabled
                        ? 'bg-white dark:bg-slate-950 border-orange-400/80 shadow-xs'
                        : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                    }`}
                    onClick={() => {
                      if (module.id === 'dashboard') return;
                      setEnabledModules(prev =>
                        prev.includes(module.id)
                          ? prev.filter(id => id !== module.id)
                          : [...prev, module.id]
                      );
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-all shadow-2xs ${
                          isEnabled
                            ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white border-transparent'
                            : 'bg-white dark:bg-slate-950 border-slate-200/80 dark:border-slate-800 text-slate-400'
                        }`}>
                          <module.icon className="w-5 h-5" />
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase border ${
                          isEnabled
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/40'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-400 border-slate-200/60 dark:border-slate-800'
                        }`}>
                          {isEnabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight group-hover:text-orange-500 transition-colors">
                        {module.label}
                      </h4>
                      <p className="text-[10px] font-mono font-bold text-orange-500 uppercase mt-0.5">{module.category}</p>
                      <p className="text-xs font-bold text-slate-400 leading-relaxed mt-2">{module.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400">Toggle Access</span>
                      <div className={`w-10 h-6 rounded-full relative transition-colors ${
                        isEnabled ? 'bg-gradient-to-r from-orange-500 to-amber-600' : 'bg-slate-200 dark:bg-slate-800'
                      }`}>
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          isEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-2xs">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-500" />
              Language & Regional Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">Language</label>
                <select
                  value={profile.language}
                  onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-2xl outline-none focus:border-orange-500 transition"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Chinese</option>
                </select>
                <p className="mt-1.5 text-[10px] font-mono text-slate-400">Display-only for now — the app doesn&apos;t support translations yet.</p>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">Timezone</label>
                <select
                  value={profile.timezone}
                  onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-2xl outline-none focus:border-orange-500 transition"
                >
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="Europe/London">London (GMT)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={savingPreferences}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-extrabold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save className="w-3.5 h-3.5" />
                {savingPreferences ? 'Saving…' : 'Save Preferences'}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-2xs">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-orange-500" /> Fiscal & Tax Settings
            </h2>
            <p className="text-xs font-bold text-slate-400 mb-5">Used by the UK Taxation tool to calculate Corporation Tax deadlines. Defaults to the common UK year-end of 31 March.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">Fiscal Year End — Month</label>
                <select
                  value={fiscalYearEnd.month}
                  onChange={(e) => setFiscalYearEnd({ ...fiscalYearEnd, month: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-2xl outline-none focus:border-orange-500 transition"
                >
                  {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">Fiscal Year End — Day</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={fiscalYearEnd.day}
                  onChange={(e) => setFiscalYearEnd({ ...fiscalYearEnd, day: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-2xl outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button
                type="button"
                onClick={handleSaveFiscalYearEnd}
                disabled={savingFiscalYearEnd}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-extrabold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save className="w-3.5 h-3.5" /> {savingFiscalYearEnd ? 'Saving…' : 'Save Tax Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Data Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[calc(100dvh-2rem)] flex flex-col transform -translate-y-6 sm:translate-y-0">
            <div className="bg-linear-to-r from-orange-500 to-red-600 px-6 py-5 flex items-center justify-between rounded-t-2xl shrink-0">
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
            
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
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
            </div>
            <div className="shrink-0 bg-white border-t border-gray-100 p-6">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[calc(100dvh-2rem)] flex flex-col transform -translate-y-6 sm:translate-y-0">
            <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between rounded-t-2xl shrink-0">
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
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
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
            </div>
            <div className="shrink-0 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 p-5 flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddEmployee}
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold rounded-2xl text-xs shadow-xs transition-all cursor-pointer active:scale-95"
              >
                Add Employee
              </button>
              <button
                type="button"
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
                className="px-5 py-2.5 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white dark:bg-slate-950 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/80 dark:border-slate-800 max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-5 flex items-center justify-between shrink-0 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/10">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white leading-tight">Edit Employee</h2>
                  <p className="text-orange-100 text-xs font-bold">Update team member details</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-2xl outline-none focus:border-orange-500 transition"
                />
                <p className="text-[10px] font-mono text-slate-400 mt-1">Update email if there was a typo</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
                  <input
                    type="text"
                    value={editingUser.firstName || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-2xl outline-none focus:border-orange-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
                  <input
                    type="text"
                    value={editingUser.lastName || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-2xl outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-2xl outline-none focus:border-orange-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-2xl outline-none focus:border-orange-500 transition"
                >
                  <option value="MEMBER">Member</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-2xl outline-none focus:border-orange-500 transition"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">Update 6-digit Access Code (optional)</label>
                <input
                  type="password"
                  maxLength={6}
                  value={editingUser.password || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setEditingUser({ ...editingUser, password: val });
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-2xl outline-none focus:border-orange-500 transition"
                  placeholder="Leave empty to keep existing"
                />
              </div>
            </div>
            <div className="shrink-0 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 p-5 flex items-center gap-3">
              <button
                type="button"
                onClick={handleUpdateEmployee}
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold rounded-2xl text-xs shadow-xs transition-all cursor-pointer active:scale-95"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="px-5 py-2.5 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enable 2FA Verification Modal */}
      {show2FAVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-5 transform animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mx-auto border border-orange-500/20 shadow-sm">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Enable Two-Factor Authentication</h2>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                We emailed a 6-digit verification code to <strong className="text-slate-700 dark:text-slate-200">{profile.email}</strong>. Enter it below to activate 2FA protection.
              </p>
            </div>

            <form onSubmit={handleConfirmEnable2FA} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-extrabold text-slate-400 uppercase tracking-wider text-center mb-1.5">
                  Enter 6-Digit PIN
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  value={twoFactorCodeInput}
                  onChange={e => {
                    setTwoFactorCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setTwoFactorError(null);
                  }}
                  placeholder="000000"
                  className="w-full text-center tracking-[10px] text-2xl font-mono font-black py-3 bg-slate-50 dark:bg-slate-900 border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-2xl outline-none transition text-slate-900 dark:text-white"
                  required
                />
              </div>

              {twoFactorError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs font-bold text-rose-600 rounded-xl text-center">
                  {twoFactorError}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShow2FAVerifyModal(false)}
                  className="flex-1 py-2.5 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={twoFactorCodeInput.length !== 6 || twoFactorLoading}
                  className="flex-2 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-2xl shadow-sm transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {twoFactorLoading ? 'Verifying...' : 'Activate 2FA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disable 2FA Password Confirmation Modal */}
      {show2FADisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-5 transform animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20 shadow-sm">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Disable Two-Factor Auth?</h2>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Please enter your account password to confirm turning off 2FA protection.
              </p>
            </div>

            <form onSubmit={handleConfirmDisable2FA} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  autoFocus
                  value={twoFactorPasswordInput}
                  onChange={e => {
                    setTwoFactorPasswordInput(e.target.value);
                    setTwoFactorError(null);
                  }}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-2xl outline-none focus:border-orange-500 transition"
                  required
                />
              </div>

              {twoFactorError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs font-bold text-rose-600 rounded-xl text-center">
                  {twoFactorError}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShow2FADisableModal(false)}
                  className="flex-1 py-2.5 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!twoFactorPasswordInput || twoFactorLoading}
                  className="flex-2 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-2xl shadow-sm transition cursor-pointer active:scale-95"
                >
                  {twoFactorLoading ? 'Disabling...' : 'Confirm Disable'}
                </button>
              </div>
            </form>
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
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 sm:top-auto sm:bottom-8 left-1/2 -translate-x-1/2 z-[300]"
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

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] text-gray-400 text-sm font-semibold">Loading settings…</div>}>
      <SettingsPageInner />
    </Suspense>
  );
}
