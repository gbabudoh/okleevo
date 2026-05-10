'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronRight, ChevronLeft, Sparkles, 
  Users, PoundSterling, CheckSquare,
  Zap, Rocket, Heart, Mail, Video
} from 'lucide-react';

interface WelcomeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
}

export default function WelcomeGuideModal({ isOpen, onClose, businessName }: WelcomeGuideModalProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  if (!isOpen) return null;

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="absolute top-6 right-6 z-10">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="relative">
            {/* Step 1: Welcome */}
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-12 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
                  <Rocket className="w-10 h-10 text-indigo-600" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                  Welcome to Okleevo, <br/>
                  <span className="text-indigo-600">{businessName}!</span>
                </h2>
                <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                  We&apos;re thrilled to have you here. Okleevo is designed to be the nervous system for your business.
                </p>
                <div className="pt-8">
                  <button 
                    onClick={nextStep}
                    className="px-10 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-xl hover:scale-105 cursor-pointer flex items-center gap-2 mx-auto"
                  >
                    Let&apos;s Get Started
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: The Core Three */}
            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-12 space-y-8"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-black text-gray-900">The Power of Three</h3>
                  <p className="text-gray-500 font-medium">Most businesses start with these essentials:</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { icon: Users, title: 'CRM', desc: 'Manage customers and send direct, branded emails via internal SMTP.', color: 'bg-blue-50 text-blue-600' },
                    { icon: PoundSterling, title: 'Invoicing', desc: 'Send professional, branded invoices and get paid faster.', color: 'bg-emerald-50 text-emerald-600' },
                    { icon: CheckSquare, title: 'Tasks', desc: 'Manage your daily workflow and never miss a deadline.', color: 'bg-purple-50 text-purple-600' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
                      <div className={`p-3 rounded-xl ${item.color}`}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <button onClick={prevStep} className="px-6 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors cursor-pointer flex items-center gap-2">
                    <ChevronLeft className="w-5 h-5" /> Back
                  </button>
                  <button onClick={nextStep} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg cursor-pointer flex items-center gap-2">
                    Next <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Zero Integration */}
            {step === 3 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-12 space-y-8"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-black text-gray-900">Zero Third-Party Costs</h3>
                  <p className="text-gray-500 font-medium">Everything you need to communicate is built right in.</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
                    <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Enterprise Mailbox</h4>
                      <p className="text-sm text-gray-500">Cancel your Mailchimp and Zendesk. Send and receive emails directly from your CRM using our high-speed API.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
                    <div className="p-3 rounded-xl bg-teal-50 text-teal-600">
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Video & Chat Collaboration</h4>
                      <p className="text-sm text-gray-500">Cancel Slack and Zoom. Hop on instant video calls and team chats directly inside your Okleevo workspace.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button onClick={prevStep} className="px-6 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors cursor-pointer flex items-center gap-2">
                    <ChevronLeft className="w-5 h-5" /> Back
                  </button>
                  <button onClick={nextStep} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg cursor-pointer flex items-center gap-2">
                    Next <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Module Manager */}
            {step === 4 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-12 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <Zap className="w-10 h-10 text-amber-600" />
                </div>
                <h3 className="text-3xl font-black text-gray-900">Tailor Your Workspace</h3>
                <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                  Okleevo has over 20 modules. We&apos;ve only enabled the essentials to keep things simple for you.
                </p>
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 inline-block">
                  <p className="text-sm font-bold text-amber-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Tip: Unlock more features in Settings &gt; Modules
                  </p>
                </div>

                <div className="flex justify-between pt-8">
                  <button onClick={prevStep} className="px-6 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors cursor-pointer flex items-center gap-2">
                    <ChevronLeft className="w-5 h-5" /> Back
                  </button>
                  <button onClick={nextStep} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg cursor-pointer flex items-center gap-2">
                    Got it <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Final */}
            {step === 5 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-12 text-center space-y-8"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl rotate-12">
                  <Heart className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-black text-gray-900">You&apos;re All Set!</h3>
                <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                  Your business journey just got a whole lot easier. If you ever need help, our support team is just a click away.
                </p>
                
                <div className="pt-8">
                  <button 
                    onClick={onClose}
                    className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-lg rounded-[2rem] hover:shadow-2xl hover:scale-105 transition-all cursor-pointer shadow-indigo-200"
                  >
                    Enter Command Center
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-gray-100 flex">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div 
                key={i} 
                className={`h-full flex-1 transition-all duration-500 ${
                  i < step ? 'bg-indigo-600' : 'bg-gray-100'
                }`} 
              />
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
