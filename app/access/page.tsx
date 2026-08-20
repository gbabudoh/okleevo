"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, ShieldCheck, RefreshCw, KeyRound } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function AccessContent() {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  
  // 2FA Verification State
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [otpCode, setOtpCode] = useState('');
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessBanner('Account created! Sign in below to get started.');
    } else if (searchParams.get('exists') === 'true') {
      setSuccessBanner('You already have an account. Sign in below.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

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

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        code: "",
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes('2FA_REQUIRED')) {
          setStep('2fa');
          setError(null);
          setSuccessBanner(`A 6-digit security code was dispatched to ${formData.email}`);
          setResendCooldown(30);
        } else {
          setError('Invalid email or password');
        }
      } else {
        proceedToDashboard();
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('2FA_REQUIRED')) {
        setStep('2fa');
        setError(null);
        setSuccessBanner(`A 6-digit security code was dispatched to ${formData.email}`);
        setResendCooldown(30);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        code: otpCode.trim(),
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes('INVALID_2FA_CODE')) {
          setError('Invalid or expired 6-digit code. Please check your email or request a new code.');
        } else {
          setError('Verification failed. Please try again.');
        }
      } else {
        proceedToDashboard();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      // Re-trigger credentials check without code to regenerate and dispatch email
      await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        code: "",
        redirect: false,
      });
      setSuccessBanner(`A new verification code was sent to ${formData.email}`);
      setResendCooldown(45);
    } catch {
      setError('Could not resend verification code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const proceedToDashboard = () => {
    const callbackUrl = searchParams.get('callbackUrl');
    const isAuthUrl = callbackUrl && (
      callbackUrl.startsWith('/auth') ||
      callbackUrl.startsWith('/access') ||
      callbackUrl.startsWith('/login') ||
      callbackUrl.startsWith('/signin') ||
      callbackUrl.startsWith('/onboarding') ||
      callbackUrl.startsWith('/signup') ||
      callbackUrl.startsWith('/register')
    );
    const targetUrl = callbackUrl && callbackUrl.startsWith('/') && !isAuthUrl ? callbackUrl : '/dashboard';
    window.location.href = targetUrl;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-8 px-4 pb-28 md:py-12 md:px-6 relative overflow-y-auto overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[100px] animate-blob mix-blend-multiply" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-400/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply" />
          <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-purple-400/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply" />
        </div>
      </div>

      <motion.div 
        className="w-full max-w-[440px] bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 sm:p-8 md:p-10 relative z-10 my-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-5 hover:scale-105 transition-transform">
            <Image src="/logo.png" alt="Okleevo" width={160} height={42} className="h-10 w-auto" priority />
          </Link>
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {step === '2fa' ? 'Two-Step Verification' : 'Welcome Back'}
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              {step === '2fa' ? 'Enter the security code sent to your email' : 'Sign in to manage your entire business.'}
            </p>
          </div>
        </div>

        {successBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-xs font-bold text-emerald-700">{successBanner}</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 'credentials' ? (
            /* STEP 1: EMAIL & PASSWORD */
            <motion.form
              key="credentials-form"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              onSubmit={handleCredentialsSubmit}
              className="space-y-4 sm:space-y-5"
            >
              <div>
                <label className="block text-xs font-extrabold uppercase font-mono tracking-wider text-gray-600 mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500">
                    <Mail className="h-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none font-bold text-xs text-gray-900 placeholder:text-gray-400 hover:bg-white hover:border-gray-300"
                    placeholder="you@business.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase font-mono tracking-wider text-gray-600 mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none font-bold text-xs text-gray-900 placeholder:text-gray-400 hover:bg-white hover:border-gray-300"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center focus:outline-none group/eye cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 group-hover/eye:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 group-hover/eye:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="peer sr-only" 
                    />
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-md peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-all flex items-center justify-center">
                      <ArrowRight className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 -rotate-45" strokeWidth={4} />
                    </div>
                    <span className="ml-2 text-xs font-bold text-gray-600 group-hover:text-gray-800 transition-colors">Remember me</span>
                  </div>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-2.5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <p className="text-xs font-bold text-rose-700">{error}</p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={!formData.email || !formData.password || isLoading}
                className="w-full group relative flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none bg-gradient-to-r from-orange-500 to-amber-600 overflow-hidden active:scale-95"
              >
                <span className="relative z-10">{isLoading ? 'Authenticating...' : 'Sign In'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />}
              </button>

              <p className="text-center text-gray-500 mt-6 text-xs font-medium">
                Don&apos;t have an account?{" "}
                <Link
                  href="/onboarding"
                  className="font-extrabold text-gray-900 hover:text-orange-600 transition-colors ml-1"
                >
                  Start Free Trial
                </Link>
              </p>
            </motion.form>
          ) : (
            /* STEP 2: 2FA 6-DIGIT EMAIL CODE */
            <motion.form
              key="2fa-form"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              onSubmit={handleOtpSubmit}
              className="space-y-5"
            >
              <div className="p-4 bg-orange-50/80 border border-orange-200/80 rounded-2xl text-center space-y-1">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center mx-auto shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="text-xs font-extrabold text-slate-900 pt-1">
                  Verification Code Dispatched
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  We sent a 6-digit PIN to <strong className="text-slate-800">{formData.email}</strong>. Enter it below to unlock your Virtual HQ.
                </p>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase font-mono tracking-wider text-gray-600 mb-1.5 text-center">
                  Enter 6-Digit PIN
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={otpCode}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtpCode(val);
                      setError(null);
                    }}
                    placeholder="000000"
                    className="w-full text-center tracking-[12px] text-2xl font-mono font-black py-3.5 bg-gray-50 border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-2xl outline-none transition-all text-slate-900 placeholder:text-gray-300"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-mono text-center mt-1.5">
                  Code expires in 10 minutes
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-2.5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <p className="text-xs font-bold text-rose-700">{error}</p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={otpCode.length !== 6 || isLoading}
                className="w-full py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500 to-amber-600 active:scale-95 flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isLoading ? 'Verifying PIN...' : 'Verify & Sign In →'}</span>
              </button>

              <div className="flex items-center justify-between text-xs font-bold pt-2">
                <button
                  type="button"
                  onClick={() => { setStep('credentials'); setOtpCode(''); setError(null); }}
                  className="text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  ← Back to Password
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0 || resending}
                  onClick={handleResendCode}
                  className="text-orange-600 hover:text-orange-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function AccessPage() {
  return (
    <Suspense>
      <AccessContent />
    </Suspense>
  );
}
