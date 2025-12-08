"use client";

import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Building2, Briefcase, Lock,
  Bell, CreditCard, Globe, Shield, Eye, EyeOff, Camera,
  Save, X, Check, AlertCircle, Settings as SettingsIcon,
  Palette, Moon, Sun, Zap, Database, Download, Upload,
  Trash2, LogOut, Key, Smartphone, Monitor, Users, Crown,
  Calendar, DollarSign, FileText, Link, Share2, Code, Plus,
  Edit3
} from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corporation',
    position: 'CEO',
    address: '123 Business Street',
    city: 'San Francisco',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    language: 'English'
  });

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

  const [theme, setTheme] = useState('light');

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'billing', name: 'Billing', icon: CreditCard },
    { id: 'preferences', name: 'Preferences', icon: SettingsIcon },
    { id: 'integrations', name: 'Integrations', icon: Link },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            Settings
          </h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>
        
        {saveSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border-2 border-green-200 rounded-xl">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-medium">Changes saved successfully!</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Picture</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                  {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-indigo-500 rounded-full text-white hover:bg-indigo-600 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">{profile.firstName} {profile.lastName}</h3>
                <p className="text-sm text-gray-600 mb-3">{profile.position} at {profile.company}</p>
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => alert('Upload photo functionality')}
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium cursor-pointer"
                  >
                    Upload Photo
                  </button>
                  <button 
                    type="button"
                    onClick={() => alert('Remove photo')}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={profile.position}
                    onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  value={profile.country}
                  onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3">
            <button 
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button 
                type="button"
                onClick={() => alert('✓ Password updated successfully!')}
                className="w-full px-6 py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all cursor-pointer"
              >
                Update Password
              </button>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Two-Factor Authentication</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-green-700">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={security.twoFactorEnabled}
                    onChange={(e) => setSecurity({ ...security, twoFactorEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {security.twoFactorEnabled && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Authenticator App</h4>
                      <p className="text-sm text-blue-700 mb-3">Use an authenticator app to generate verification codes</p>
                      <button 
                        type="button"
                        onClick={() => alert('Setup authenticator app')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium cursor-pointer"
                      >
                        Setup Authenticator
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security Alerts */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Security Alerts</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive security alerts via email</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={security.emailNotifications}
                    onChange={(e) => setSecurity({ ...security, emailNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">SMS Notifications</h3>
                    <p className="text-sm text-gray-600">Receive security alerts via SMS</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={security.smsNotifications}
                    onChange={(e) => setSecurity({ ...security, smsNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-gray-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Login Alerts</h3>
                    <p className="text-sm text-gray-600">Get notified of new login attempts</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={security.loginAlerts}
                    onChange={(e) => setSecurity({ ...security, loginAlerts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Active Sessions</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900">Current Session</h3>
                    <p className="text-sm text-green-700">Windows • Chrome • San Francisco, CA</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Active Now</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">iPhone 14 Pro</h3>
                    <p className="text-sm text-gray-600">Safari • Last active 2 hours ago</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => alert('Session revoked')}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  Revoke
                </button>
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleSave}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-5 h-5" />
            Save Security Settings
          </button>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Email Notifications</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="font-semibold text-gray-900">Daily Email Digest</h3>
                  <p className="text-sm text-gray-600">Receive a daily summary of your activity</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.emailDigest}
                    onChange={(e) => setNotifications({ ...notifications, emailDigest: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="font-semibold text-gray-900">Task Reminders</h3>
                  <p className="text-sm text-gray-600">Get notified about upcoming tasks and deadlines</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.taskReminders}
                    onChange={(e) => setNotifications({ ...notifications, taskReminders: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="font-semibold text-gray-900">Invoice Alerts</h3>
                  <p className="text-sm text-gray-600">Notifications for new invoices and payments</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.invoiceAlerts}
                    onChange={(e) => setNotifications({ ...notifications, invoiceAlerts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="font-semibold text-gray-900">Team Updates</h3>
                  <p className="text-sm text-gray-600">Stay informed about team activities and changes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.teamUpdates}
                    onChange={(e) => setNotifications({ ...notifications, teamUpdates: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="font-semibold text-gray-900">Marketing Emails</h3>
                  <p className="text-sm text-gray-600">Receive product updates and promotional content</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.marketingEmails}
                    onChange={(e) => setNotifications({ ...notifications, marketingEmails: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleSave}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-5 h-5" />
            Save Notification Settings
          </button>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Current Plan */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Professional Plan</h2>
                  <p className="text-indigo-100">Billed monthly</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">$49</p>
                <p className="text-indigo-100">per month</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                type="button"
                onClick={() => alert('Upgrade plan functionality')}
                className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all cursor-pointer"
              >
                Upgrade Plan
              </button>
              <button 
                type="button"
                onClick={() => alert('View all plans')}
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
                    onClick={() => alert('Edit payment method')}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => alert('Add payment method')}
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
                { date: 'Dec 1, 2024', amount: '$49.00', status: 'Paid', invoice: 'INV-2024-12' },
                { date: 'Nov 1, 2024', amount: '$49.00', status: 'Paid', invoice: 'INV-2024-11' },
                { date: 'Oct 1, 2024', amount: '$49.00', status: 'Paid', invoice: 'INV-2024-10' },
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
                      onClick={() => alert(`Downloading invoice ${item.invoice}`)}
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
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Appearance</h2>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  theme === 'light' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Sun className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <p className="font-semibold text-gray-900">Light</p>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  theme === 'dark' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Moon className="w-8 h-8 mx-auto mb-2 text-indigo-500" />
                <p className="font-semibold text-gray-900">Dark</p>
              </button>

              <button
                type="button"
                onClick={() => setTheme('auto')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  theme === 'auto' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Monitor className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="font-semibold text-gray-900">Auto</p>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
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
                      onClick={() => alert(`Disconnecting ${app.name}`)}
                      className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium cursor-pointer"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => alert(`Connecting ${app.name}`)}
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
                      alert('✓ API key copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => alert('✓ New API key generated!')}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 text-gray-700 font-medium rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                Generate New API Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone */}
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
                          theme: theme,
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
                      const csv = `Account Data Export\n\nProfile Information\nFirst Name,${profile.firstName}\nLast Name,${profile.lastName}\nEmail,${profile.email}\nPhone,${profile.phone}\nCompany,${profile.company}\nPosition,${profile.position}\nAddress,${profile.address}\nCity,${profile.city}\nCountry,${profile.country}\n\nSecurity Settings\nTwo-Factor Auth,${security.twoFactorEnabled ? 'Enabled' : 'Disabled'}\nEmail Notifications,${security.emailNotifications ? 'Enabled' : 'Disabled'}\nSMS Notifications,${security.smsNotifications ? 'Enabled' : 'Disabled'}\nLogin Alerts,${security.loginAlerts ? 'Enabled' : 'Disabled'}\n\nNotification Preferences\nEmail Digest,${notifications.emailDigest ? 'Enabled' : 'Disabled'}\nTask Reminders,${notifications.taskReminders ? 'Enabled' : 'Disabled'}\nInvoice Alerts,${notifications.invoiceAlerts ? 'Enabled' : 'Disabled'}\nTeam Updates,${notifications.teamUpdates ? 'Enabled' : 'Disabled'}\nMarketing Emails,${notifications.marketingEmails ? 'Enabled' : 'Disabled'}\n\nPreferences\nTheme,${theme}\nLanguage,${profile.language}\nTimezone,${profile.timezone}\n\nExport Date,${new Date().toLocaleString()}`;
                      
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
Theme:                        ${theme}
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
                      const textData = `ACCOUNT DATA EXPORT\n${'='.repeat(60)}\n\nPROFILE:\n  Name: ${profile.firstName} ${profile.lastName}\n  Email: ${profile.email}\n  Phone: ${profile.phone}\n  Company: ${profile.company}\n  Position: ${profile.position}\n  Location: ${profile.city}, ${profile.country}\n\nSECURITY:\n  Two-Factor Auth: ${security.twoFactorEnabled ? 'Enabled' : 'Disabled'}\n  Email Notifications: ${security.emailNotifications ? 'Enabled' : 'Disabled'}\n  SMS Notifications: ${security.smsNotifications ? 'Enabled' : 'Disabled'}\n  Login Alerts: ${security.loginAlerts ? 'Enabled' : 'Disabled'}\n\nNOTIFICATIONS:\n  Email Digest: ${notifications.emailDigest ? 'Yes' : 'No'}\n  Task Reminders: ${notifications.taskReminders ? 'Yes' : 'No'}\n  Invoice Alerts: ${notifications.invoiceAlerts ? 'Yes' : 'No'}\n  Team Updates: ${notifications.teamUpdates ? 'Yes' : 'No'}\n  Marketing: ${notifications.marketingEmails ? 'Yes' : 'No'}\n\nPREFERENCES:\n  Theme: ${theme}\n  Language: ${profile.language}\n  Timezone: ${profile.timezone}\n\nExported: ${new Date().toLocaleString()}\n`;
                      
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

      {/* Delete Account Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          alert('✓ Account deletion initiated. You will receive a confirmation email.');
          setShowDeleteModal(false);
        }}
        title="Delete Account"
        itemName={`${profile.firstName} ${profile.lastName}'s Account`}
        itemDetails={`${profile.email} - ${profile.company}`}
        warningMessage="This will permanently delete your account, all data, and cannot be undone. All subscriptions will be cancelled."
      />
    </div>
  );
}
