"use client";

import { useState } from "react";
import Link from "next/link";
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
  ArrowLeft
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    setStep(5); // Success step
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center px-6 py-12">
      {/* Logo */}
      <Link href="/" className="absolute top-6 left-6">
        <img src="/logo.png" alt="Okleevo" className="h-10 w-auto" />
      </Link>

      <div className="w-full max-w-2xl">
        {step <= totalSteps && (
          <>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Step {step} of {totalSteps}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {Math.round((step / totalSteps) * 100)}% Complete
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: '#fc6813' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / totalSteps) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </>
        )}

        {/* Form Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
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
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#fc6813' }}>
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Tell us about your business
                  </h2>
                  <p className="text-gray-600">
                    Let's start with some basic information
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter your business name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry *
                    </label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select your industry</option>
                      <option value="retail">Retail</option>
                      <option value="hospitality">Hospitality</option>
                      <option value="professional-services">Professional Services</option>
                      <option value="construction">Construction</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="technology">Technology</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Size *
                    </label>
                    <select
                      name="businessSize"
                      value={formData.businessSize}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select business size</option>
                      <option value="1-5">1-5 employees</option>
                      <option value="6-10">6-10 employees</option>
                      <option value="11-25">11-25 employees</option>
                      <option value="26-50">26-50 employees</option>
                      <option value="51+">51+ employees</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={nextStep}
                  className="w-full mt-8 px-6 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#fc6813' }}
                  disabled={!formData.businessName || !formData.industry || !formData.businessSize}
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
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
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#fc6813' }}>
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Your contact details
                  </h2>
                  <p className="text-gray-600">
                    How should we reach you?
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="John"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Smith"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="john@business.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="07XXX XXXXXX"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={prevStep}
                    className="flex-1 px-6 py-4 rounded-full border-2 border-gray-300 text-gray-700 font-semibold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    className="flex-1 px-6 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#fc6813' }}
                    disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone}
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
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
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#fc6813' }}>
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Secure your account
                  </h2>
                  <p className="text-gray-600">
                    Create a strong password
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter password"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Must be at least 8 characters with uppercase, lowercase, and numbers
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Confirm password"
                      required
                    />
                  </div>

                  {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-sm text-red-600">Passwords do not match</p>
                  )}
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={prevStep}
                    className="flex-1 px-6 py-4 rounded-full border-2 border-gray-300 text-gray-700 font-semibold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    className="flex-1 px-6 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#fc6813' }}
                    disabled={!formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword}
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
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
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#fc6813' }}>
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Business address
                  </h2>
                  <p className="text-gray-600">
                    Where is your business located?
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="123 High Street"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="London"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postcode *
                      </label>
                      <input
                        type="text"
                        name="postcode"
                        value={formData.postcode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="SW1A 1AA"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 px-6 py-4 rounded-full border-2 border-gray-300 text-gray-700 font-semibold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#fc6813' }}
                      disabled={!formData.address || !formData.city || !formData.postcode}
                    >
                      Complete Setup
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 5: Success */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-emerald-100">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to Okleevo!
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Your account has been created successfully
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                  <p className="text-gray-700 mb-2">
                    We've sent a verification email to:
                  </p>
                  <p className="font-semibold text-gray-900">{formData.email}</p>
                </div>
                <Link
                  href="/dashboard"
                  className="inline-block px-12 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  style={{ backgroundColor: '#fc6813' }}
                >
                  Go to Dashboard
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Sign In Link */}
        {step <= totalSteps && (
          <p className="text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <Link href="/access" className="font-semibold hover:underline" style={{ color: '#fc6813' }}>
              Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
