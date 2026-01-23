"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  User, Mail, Phone, MapPin, Building2, Briefcase, Lock,
  Bell, CreditCard, Globe, Shield, Eye, EyeOff, Camera,
  Save, X, Check, AlertCircle, Settings as SettingsIcon,
  Zap, Download, Upload,
  Trash2, LogOut, Key, Smartphone, Monitor, Users, Crown,
  FileText, Link, Code, Plus,
  Edit3, UserPlus, UserCheck
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, session, status]);

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
    <div className="min-h-screen bg-gray-50/50 p-6 pb-24 space-y-8 font-sans text-gray-900">
      {/* Premium Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100 p-6 rounded-[2rem] shadow-sm sticky top-4 z-40 transition-all duration-300">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
               <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-lg transition-all duration-300 group-hover:bg-indigo-500/30"></div>
                  <div className="relative p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg border border-white/20 group-hover:scale-105 transition-transform duration-300 ring-4 ring-indigo-50/50">
                     <SettingsIcon className="w-8 h-8 text-white" />
                  </div>
               </div>
               <div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                     Settings <span className="text-gray-300 font-light">|</span> <span className="text-indigo-600">Command Center</span>
                  </h1>
                  <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                     System Preferences & Configuration
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-3">
               {saveSuccess && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl shadow-sm">
                     <div className="p-1 bg-green-500 rounded-full">
                        <Check className="w-3 h-3 text-white" />
                     </div>
                     <span className="text-sm font-bold text-green-700">Changes Saved</span>
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* Navigation Pills */}
      <div className="bg-white/60 backdrop-blur-md rounded-[20px] p-2 border border-gray-100 flex items-center gap-2 overflow-x-auto shadow-sm sticky top-32 z-30">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 relative overflow-hidden group cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-gray-900 text-white shadow-lg scale-100'
                  : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-md'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-gray-400 group-hover:text-indigo-600'} transition-colors`} />
              <span>{tab.name}</span>
              {isActive && (
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
               <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
               <p className="text-gray-500 font-medium">Loading profile data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               {/* Left Column - Avatar & Quick Actions */}
               <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm text-center relative overflow-hidden group">
                     <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent"></div>
                     <div className="relative">
                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full p-1 shadow-xl mb-4 relative group-hover:scale-105 transition-transform duration-500">
                           <div className="w-full h-full bg-white rounded-full p-1">
                              <div className="w-full h-full bg-indigo-50 rounded-full flex items-center justify-center text-4xl font-black text-indigo-600 overflow-hidden">
                                 {profile.avatar ? (
                                     // eslint-disable-next-line @next/next/no-img-element
                                    <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                 ) : (
                                    <>{profile.firstName ? profile.firstName.charAt(0) : ''}{profile.lastName ? profile.lastName.charAt(0) : ''}</>
                                 )}
                              </div>
                           </div>
                           <button className="absolute bottom-0 right-0 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors cursor-pointer ring-4 ring-white">
                              <Camera className="w-4 h-4" />
                           </button>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                           {profile.firstName || 'User'} {profile.lastName}
                        </h2>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
                           {profile.position || 'Full Stack Developer'}
                        </p>
                        
                        <div className="mt-6 flex flex-col gap-3">
                           {(userRole === 'OWNER' || userRole === 'ADMIN') && (
                              <button 
                                 type="button"
                                 onClick={() => showToast('Upload photo functionality', 'error')}
                                 className="w-full py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer flex items-center justify-center gap-2"
                              >
                                 <Upload className="w-4 h-4" />
                                 Upload New Photo
                              </button>
                           )}
                           <div className="p-4 bg-gray-50 rounded-2xl text-left border border-gray-100">
                              <div className="flex items-center gap-2 mb-2">
                                 <Shield className="w-4 h-4 text-green-500" />
                                 <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">Account Status</span>
                              </div>
                              <div className="flex items-center justify-between">
                                 <span className="text-sm font-medium text-gray-600">Plan</span>
                                 <span className="text-sm font-bold text-indigo-600">Pro Enterprise</span>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                 <span className="text-sm font-medium text-gray-600">Verified</span>
                                 <span className="text-xs font-bold text-white bg-green-500 px-2 py-0.5 rounded-full">Yes</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right Column - Profile Details */}
               <div className="lg:col-span-8">
                  <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                     <div className="flex items-center justify-between mb-8">
                        <div>
                           <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                              <User className="w-5 h-5 text-indigo-500" />
                              Personal Information
                           </h3>
                           <p className="text-gray-500 text-sm font-medium mt-1">Manage your public profile and private details</p>
                        </div>
                        {(userRole === 'OWNER' || userRole === 'ADMIN') && (
                           <button 
                              type="button"
                              onClick={handleSave}
                              className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 cursor-pointer flex items-center gap-2"
                           >
                              <Save className="w-4 h-4" />
                              Save Changes
                           </button>
                        )}
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                           { label: 'First Name', value: profile.firstName, key: 'firstName', icon: User },
                           { label: 'Last Name', value: profile.lastName, key: 'lastName', icon: User },
                           { label: 'Email Address', value: profile.email, key: 'email', icon: Mail, type: 'email' },
                           { label: 'Phone Number', value: profile.phone, key: 'phone', icon: Phone, type: 'tel' },
                           { label: 'Company Name', value: profile.company, key: 'company', icon: Building2 },
                           { label: 'Job Title', value: profile.position, key: 'position', icon: Briefcase },
                           { label: 'Address', value: profile.address, key: 'address', icon: MapPin, colSpan: 2 },
                           { label: 'City', value: profile.city, key: 'city', icon: Building2 },
                           { label: 'Country', value: profile.country, key: 'country', icon: Globe },
                        ].map((field) => (
                           <div key={field.key} className={field.colSpan ? `md:col-span-${field.colSpan}` : ''}>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">{field.label}</label>
                              <div className="relative group">
                                 <field.icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                 <input
                                    type={field.type || 'text'}
                                    value={field.value}
                                    onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                                    disabled={userRole === 'MANAGER' || userRole === 'MEMBER'}
                                    className={`w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-xl font-bold text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all ${
                                       (userRole === 'MANAGER' || userRole === 'MEMBER') ? 'opacity-60 cursor-not-allowed' : ''
                                    }`}
                                 />
                              </div>
                           </div>
                        ))}
                     </div>

                     {(userRole === 'MANAGER' || userRole === 'MEMBER') && (
                        <div className="mt-8 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center gap-3">
                           <div className="p-2 bg-blue-100 rounded-lg">
                              <AlertCircle className="w-5 h-5 text-blue-600" />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-blue-900">View Only Access</p>
                              <p className="text-xs font-medium text-blue-700">Contact your administrator to update profile details.</p>
                           </div>
                        </div>
                     )}
                  </div>
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
             <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group">
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

             <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
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

             <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center space-y-4 group hover:shadow-md transition-all">
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
                      <div key={i} className="h-48 bg-gray-100 rounded-[2rem] animate-pulse"></div>
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
                         <div key={member.id} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
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
                                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-xl font-black text-indigo-600 shadow-inner">
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
               <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
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
                         <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600 peer-checked:shadow-lg"></div>
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
          {/* Current Plan */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">All-in-One Plan</h2>
                <p className="text-indigo-100">Billed monthly</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">£19.99</p>
                <p className="text-indigo-100">per month</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                type="button"
                onClick={() => showToast('Upgrade plan functionality')}
                className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all cursor-pointer"
              >
                Upgrade Plan
              </button>
              <button 
                type="button"
                onClick={() => showToast('View all plans')}
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-all cursor-pointer"
              >
                View All Plans
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900">Visa ending in 4242</h3>
                    <p className="text-sm text-blue-700">Expires 12/2025</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Default</span>
                  <button 
                    type="button"
                    onClick={() => showToast('Edit payment method')}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => showToast('Add payment method')}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 text-gray-700 font-medium rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                Add Payment Method
              </button>
            </div>
          </div>

          {/* Billing History */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Billing History</h2>
            <div className="space-y-3">
              {[
                { date: 'Dec 1, 2024', amount: '£19.99', status: 'Paid', invoice: 'INV-2024-12' },
                { date: 'Nov 1, 2024', amount: '£19.99', status: 'Paid', invoice: 'INV-2024-11' },
                { date: 'Oct 1, 2024', amount: '£19.99', status: 'Paid', invoice: 'INV-2024-10' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.invoice}</h3>
                      <p className="text-sm text-gray-600">{item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-900">{item.amount}</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">{item.status}</span>
                    <button 
                      type="button"
                      onClick={() => showToast(`Downloading invoice ${item.invoice}`)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
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
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
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
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
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
            <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
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
              <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
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
                    className="group relative px-5 py-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all flex flex-col items-center gap-2 font-semibold cursor-pointer overflow-hidden"
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
                      
                      const blob = new Blob([csv], { type: 'text/csv' });
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
                    className="group relative px-5 py-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all flex flex-col items-center gap-2 font-semibold cursor-pointer overflow-hidden"
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
                    className="group relative px-5 py-4 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all flex flex-col items-center gap-2 font-semibold cursor-pointer overflow-hidden"
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
                    className="group relative px-5 py-4 bg-gradient-to-br from-gray-600 to-gray-800 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all flex flex-col items-center gap-2 font-semibold cursor-pointer overflow-hidden"
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
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
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
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all cursor-pointer"
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
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all cursor-pointer"
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
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
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
