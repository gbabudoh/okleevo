"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

export default function AdminAccessPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Redirect if already logged in as super admin
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Check role directly from session (no API call needed)
      const userRole = (session.user as any)?.role;
      if (userRole === "SUPER_ADMIN") {
        router.push("/admin");
      } else if (userRole) {
        // Not a super admin, redirect to regular dashboard
        router.push("/dashboard");
      }
      // If role is not set yet, wait for it to be loaded
    }
  }, [session, status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      // First, ensure the user exists and is properly configured
      console.log('[LOGIN] ========================================');
      console.log('[LOGIN] Step 1: Fixing/creating super admin user...');
      try {
        const fixResponse = await fetch('/api/admin/fix-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const fixData = await fixResponse.json();
        if (fixResponse.ok) {
          console.log('[LOGIN] ✅ User fixed/created successfully');
          console.log('[LOGIN] User details:', {
            email: fixData.user?.email,
            role: fixData.user?.role,
            status: fixData.user?.status,
            passwordValid: fixData.user?.passwordValid,
          });
        } else {
          console.error('[LOGIN] ❌ Fix login endpoint returned error:', fixData);
          setError(`Failed to setup user: ${fixData.error || 'Unknown error'}. Please try the fix-login endpoint manually.`);
          return;
        }
      } catch (fixError: any) {
        console.error('[LOGIN] ❌ Could not call fix-login endpoint:', fixError);
        setError(`Failed to setup user: ${fixError.message}. Please check your connection.`);
        return;
      }

      console.log('[LOGIN] Step 2: Attempting sign in with NextAuth...');
      console.log('[LOGIN] Email:', formData.email);
      console.log('[LOGIN] Password length:', formData.password.length);

      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      console.log('[LOGIN] Sign in result:', result);

      if (result?.error) {
        console.error('[LOGIN] ❌ Sign in error:', result.error);
        setError(`Login failed: ${result.error}. Check server console (where npm run dev is running) for [AUTH] logs.`);
      } else if (result?.ok) {
        console.log('[LOGIN] ✅ Sign in successful, redirecting...');
        // Wait a moment for session to update with role
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Force a full page reload to ensure session is properly set
        window.location.href = '/admin';
      } else {
        setError('Unexpected response from sign in. Please try again.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center px-6 py-12 relative">
      {/* Logo */}
      <Link href="/" className="absolute top-6 left-6">
        <img src="/logo.png" alt="Okleevo" className="h-10 w-auto" />
      </Link>

      <div className="w-full max-w-md">
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Access
            </h1>
            <p className="text-gray-600">
              Sign in to access the admin panel
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{ backgroundColor: '#fc6813' }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In to Admin Panel"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Regular user?{" "}
              <Link href="/access" className="font-medium text-orange-600 hover:text-orange-500">
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

