"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";

export default function AccessPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

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
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        await new Promise(resolve => setTimeout(resolve, 500));
        try {
          const profileResponse = await fetch('/api/user/profile', { credentials: 'include' });
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            if (profileData.role === 'SUPER_ADMIN') {
              window.location.href = '/admin';
              return;
            }
          }
        } catch {
          console.warn('Could not check user role, defaulting to dashboard');
        }
        window.location.href = '/dashboard';
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to sign in. Please try again.');
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[100px] animate-blob mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-400/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply" />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-purple-400/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply" />
      </div>

      <motion.div 
        className="w-full max-w-[440px] bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10 relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6 hover:scale-105 transition-transform">
            <Image src="/logo.png" alt="Okleevo" width={160} height={42} className="h-10 w-auto" />
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
            <p className="text-base text-gray-500 font-medium">Sign in to manage your entire business.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500">
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400 hover:bg-white hover:border-gray-300"
                placeholder="you@business.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400 hover:bg-white hover:border-gray-300"
                placeholder="Password or 6-digit Code"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center focus:outline-none group/eye"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 group-hover/eye:text-gray-600 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 group-hover/eye:text-gray-600 transition-colors" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="peer sr-only" 
                />
                <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-all flex items-center justify-center">
                   <ArrowRight className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 -rotate-45" strokeWidth={4} />
                </div>
                <span className="ml-2.5 text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">Remember me</span>
              </div>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {error && (
            <motion.div 
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: "auto" }}
               className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-2xl flex items-center gap-3"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              <p className="text-sm font-medium text-red-700">{error}</p>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={!formData.email || !formData.password || isLoading}
            className="w-full group relative flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-lg shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none bg-gradient-to-r from-[#fc6813] to-[#ff8c42] overflow-hidden"
          >
            <span className="relative z-10">{isLoading ? 'Signing in...' : 'Sign In'}</span>
            {!isLoading && <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />}
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>

          <p className="text-center text-gray-500 mt-8 text-sm font-medium">
            Don&apos;t have an account?{" "}
            <Link
              href="/onboarding"
              className="font-bold text-gray-900 hover:text-orange-600 transition-colors ml-1"
            >
              Start Free Trial
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
