"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) setError("Invalid or missing reset link. Please request a new one.");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to reset password. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[100px] animate-blob mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-400/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply" />
      </div>

      <motion.div
        className="w-full max-w-[440px] bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10 relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6 hover:scale-105 transition-transform">
            <Image src="/logo.png" alt="Okleevo" width={160} height={42} className="h-10 w-auto" />
          </Link>

          {success ? (
            <div className="space-y-2">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h1 className="text-2xl font-bold text-gray-900">Password Updated!</h1>
              <p className="text-base text-gray-500 font-medium">
                Your password has been reset successfully. You can now sign in.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Set New Password</h1>
              <p className="text-base text-gray-500 font-medium">
                Choose a strong password for your account.
              </p>
            </div>
          )}
        </div>

        {!success && !error?.includes("Invalid or missing") ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
                New Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400 hover:bg-white hover:border-gray-300"
                  placeholder="Min. 8 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword
                    ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400 hover:bg-white hover:border-gray-300"
                  placeholder="Repeat your new password"
                  required
                />
              </div>
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 font-medium mt-1.5 ml-1">Passwords do not match</p>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 bg-red-50/80 border border-red-100 rounded-2xl flex items-center gap-3"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm font-medium text-red-700">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword || isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-lg shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none bg-gradient-to-r from-[#fc6813] to-[#ff8c42]"
            >
              {isLoading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        ) : error?.includes("Invalid or missing") ? (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">{error}</p>
              <Link href="/forgot-password" className="text-sm font-bold text-orange-600 hover:underline mt-1 inline-block">
                Request a new reset link
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mt-8 text-center">
          <Link
            href="/access"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {success ? "Sign In Now" : "Back to Sign In"}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
