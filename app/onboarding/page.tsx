"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Users, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  LayoutGrid
} from "lucide-react";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Business Info
    businessName: "",
    industry: "",
    businessSize: "",
    
    // Step 2: Personal Info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    
    // Step 3: Account Setup
    password: "",
    confirmPassword: "",
    
    // Step 4: Address
    address: "",
    city: "",
    postcode: "",
  });

  const totalSteps = 4;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response. Please try again.');
      }

      const data = await response.json();

      if (response.status === 409) {
        window.location.href = '/access?exists=true';
        return;
      }

      if (!response.ok) {
        const errorMessage = data.error || data.message || 'Registration failed';
        const errorDetails = data.details ? ` Details: ${JSON.stringify(data.details)}` : '';
        throw new Error(errorMessage + errorDetails);
      }

      setShowSuccessModal(true);
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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
        className="w-full max-w-3xl bg-white/80 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/50 p-6 sm:p-8 md:p-12 relative z-10 my-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header: Logo and Step Progress */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity self-start sm:self-auto">
            <Image src="/logo.png" alt="Okleevo" width={140} height={36} className="h-9 w-auto" />
          </Link>

          {/* Step Indicator */}
          <div className="self-start sm:self-auto bg-gray-100/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50 flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-500">
              Step {step} of {totalSteps}
            </span>
            <div className="h-1.5 w-24 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="mt-0">
          <AnimatePresence mode="wait">
            {/* Step 1: Business Information */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Tell us about your business</h2>
                  <p className="text-gray-500 font-medium">Let&apos;s start with some basic information</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Business Name *</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none font-medium text-gray-900 hover:bg-white hover:border-gray-300 placeholder:text-gray-400"
                        placeholder="Enter your business name"
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Industry *</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Briefcase className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <select
                          name="industry"
                          value={formData.industry}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none font-medium text-gray-900 appearance-none hover:bg-white hover:border-gray-300 cursor-pointer"
                          required
                        >
                          <option value="">Select industry</option>
                          <option value="retail">Retail</option>
                          <option value="hospitality">Hospitality</option>
                          <option value="professional-services">Professional Services</option>
                          <option value="construction">Construction</option>
                          <option value="healthcare">Healthcare</option>
                          <option value="technology">Technology</option>
                          <option value="manufacturing">Manufacturing</option>
                          <option value="other">Other</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <LayoutGrid className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Business Size *</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Users className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <select
                          name="businessSize"
                          value={formData.businessSize}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none font-medium text-gray-900 appearance-none hover:bg-white hover:border-gray-300 cursor-pointer"
                          required
                        >
                          <option value="">Number of employees</option>
                           <option value="1-5">1 - 5 employees</option>
                           <option value="6-10">6 - 10 employees</option>
                           <option value="11-25">11 - 25 employees</option>
                           <option value="26-50">26 - 50 employees</option>
                           <option value="50+">50+ employees</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <LayoutGrid className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex justify-end">
                   <button
                    onClick={nextStep}
                    className="group flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all bg-gradient-to-r from-orange-500 to-[#ff8c42] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!formData.businessName || !formData.industry || !formData.businessSize}
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Personal Information */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Your contact details</h2>
                  <p className="text-gray-500 font-medium">How should we reach you?</p>
                </div>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">First Name *</label>
                      <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                          </div>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none font-medium text-gray-900 hover:bg-white hover:border-gray-300"
                            placeholder="John"
                            required
                          />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Last Name *</label>
                      <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                          </div>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none font-medium text-gray-900 hover:bg-white hover:border-gray-300"
                            placeholder="Smith"
                            required
                          />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address *</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none font-medium text-gray-900 hover:bg-white hover:border-gray-300"
                          placeholder="john@business.com"
                          required
                        />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Phone Number *</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none font-medium text-gray-900 hover:bg-white hover:border-gray-300"
                          placeholder="07XXX XXXXXX"
                          required
                        />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-10">
                  <button
                    onClick={prevStep}
                    className="flex-1 px-6 py-4 rounded-xl border-2 border-transparent hover:border-gray-200 text-gray-500 hover:text-gray-700 font-bold text-lg transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    className="flex-[2] group flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all bg-gradient-to-r from-orange-500 to-[#ff8c42] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone}
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Account Setup */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Secure your account</h2>
                  <p className="text-gray-500 font-medium">Create a strong password</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password *</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                      </div>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none font-medium text-gray-900 hover:bg-white hover:border-gray-300"
                        placeholder="Enter password"
                        required
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2 ml-1">Must be at least 8 characters long</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Confirm Password *</label>
                     <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                      </div>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none font-medium text-gray-900 hover:bg-white hover:border-gray-300"
                        placeholder="Confirm password"
                        required
                      />
                    </div>
                  </div>

                  {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100"
                    >
                        Passwords do not match
                    </motion.div>
                  )}
                </div>

                <div className="flex gap-4 mt-10">
                  <button
                    onClick={prevStep}
                     className="flex-1 px-6 py-4 rounded-xl border-2 border-transparent hover:border-gray-200 text-gray-500 hover:text-gray-700 font-bold text-lg transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    className="flex-[2] group flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all bg-gradient-to-r from-orange-500 to-[#ff8c42] disabled:opacity-50 disabled:cursor-not-allowed"
                     disabled={!formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword}
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Business Address */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Business address</h2>
                  <p className="text-gray-500 font-medium">Where is your business located?</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Street Address *</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none font-medium text-gray-900 hover:bg-white hover:border-gray-300"
                        placeholder="123 High Street"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">City *</label>
                      <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                          </div>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none font-medium text-gray-900 hover:bg-white hover:border-gray-300"
                            placeholder="London"
                            required
                          />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Postcode *</label>
                      <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                          </div>
                          <input
                            type="text"
                            name="postcode"
                            value={formData.postcode}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none font-medium text-gray-900 hover:bg-white hover:border-gray-300"
                            placeholder="SW1A 1AA"
                            required
                          />
                      </div>
                    </div>
                  </div>

                  {submitError && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-2xl flex items-center gap-3"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      <p className="text-sm font-medium text-red-700">{submitError}</p>
                    </motion.div>
                  )}

                  <div className="flex gap-4 mt-10">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 px-6 py-4 rounded-xl border-2 border-transparent hover:border-gray-200 text-gray-500 hover:text-gray-700 font-bold text-lg transition-all flex items-center justify-center gap-2"
                      disabled={isSubmitting}
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </button>
                    <button
                      type="submit"
                       className="flex-[2] group flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all bg-gradient-to-r from-orange-500 to-[#ff8c42] disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!formData.address || !formData.city || !formData.postcode || isSubmitting}
                    >
                      {isSubmitting ? 'Creating Account...' : 'Complete Setup'}
                      {!isSubmitting && <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Sign In Link */}
        <p className="text-center mt-10 text-gray-400 text-sm font-medium">
          Already have an account?{" "}
          <Link href="/access" className="font-bold text-gray-900 hover:text-orange-500 transition-colors ml-1">
            Sign In
          </Link>
        </p>
      </motion.div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 max-w-md w-full text-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
                Registration Successful!
              </h2>
              <p className="text-gray-500 font-medium mb-1">
                Your account has been created.
              </p>
              <p className="text-gray-500 font-medium mb-8">
                Now login to access your dashboard.
              </p>
              <div className="bg-gray-50 rounded-2xl px-5 py-3 mb-8 text-sm text-gray-600">
                Signed up as <span className="font-bold text-gray-900">{formData.email}</span>
              </div>
              <Link
                href="/access?registered=true"
                className="group inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-bold text-lg bg-gradient-to-r from-orange-500 to-[#ff8c42] shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all"
              >
                Login to Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
