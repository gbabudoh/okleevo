"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to process request. Please try again.");
      }
    } catch {
      setError("Failed to process request. Please try again.");
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
          {!submitted ? (
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Forgot Password?</h1>
              <p className="text-base text-gray-500 font-medium">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
              <p className="text-base text-gray-500 font-medium">
                If an account exists for <span className="font-semibold text-gray-700">{email}</span>, you will receive a password reset link shortly.
              </p>
            </div>
          )}
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400 hover:bg-white hover:border-gray-300"
                  placeholder="you@business.com"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 bg-red-50/80 border border-red-100 rounded-2xl flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                <p className="text-sm font-medium text-red-700">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={!email || isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-lg shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none bg-gradient-to-r from-[#fc6813] to-[#ff8c42]"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        ) : null}

        <div className="mt-8 text-center">
          <Link
            href="/access"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
