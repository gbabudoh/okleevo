'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, ChevronLeft, Sparkles,
  Users, CheckSquare,
  Zap, Rocket, Heart, Mail, Video, ShieldCheck, CreditCard
} from 'lucide-react';
import { modules, moduleGroups } from '@/lib/module-catalogue';

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
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-2xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl text-slate-900 dark:text-white rounded-[2.5rem] shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden"
        >
          {/* Header Controls & Top Pill */}
          <div className="flex items-center justify-between px-8 pt-7 pb-2 relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-200/80 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 font-mono font-extrabold text-[10px] uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Step {step} of {totalSteps} • Onboarding
            </span>

            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close welcome modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            {/* Step 1: Welcome */}
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-8 sm:p-12 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-orange-50 dark:bg-orange-950/60 border border-orange-200/80 dark:border-orange-900/50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-orange-500/10">
                  <Rocket className="w-10 h-10 text-orange-600 dark:text-orange-400 animate-pulse" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Welcome to Okleevo, <br/>
                  <span className="bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">{businessName}!</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed font-medium">
                  We&apos;re thrilled to have you here. Okleevo is designed to be the autonomous nervous system for your enterprise.
                </p>
                <div className="pt-6">
                  <button 
                    onClick={nextStep}
                    className="px-10 py-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer flex items-center gap-2 mx-auto"
                  >
                    <span>Let&apos;s Get Started</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: The Core Essentials */}
            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-8 sm:p-12 space-y-6"
              >
                <div className="text-center space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Core Enterprise Tools</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Built-in suite ready for high-velocity teams:</p>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { icon: Users, title: 'CRM Pipeline', desc: 'Track deals, contacts, and manage lead lifecycles seamlessly.', color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/80 dark:border-blue-900/50' },
                    { icon: CreditCard, title: 'Invoicing & Stripe', desc: 'Send automated PDF invoices and collect instant payments globally.', color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-900/50' },
                    { icon: CheckSquare, title: 'Tasks & Boards', desc: 'Organize async workflows, assign team tasks, and meet deadlines.', color: 'bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border-orange-200/80 dark:border-orange-900/50' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 hover:border-orange-300 dark:hover:border-orange-800 transition-all shadow-2xs">
                      <div className={`p-3 rounded-xl border ${item.color} shrink-0`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{item.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <button onClick={prevStep} className="px-5 py-3 text-slate-500 dark:text-slate-400 font-extrabold text-xs hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={nextStep} className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95">
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Zero Third-Party Costs */}
            {step === 3 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-8 sm:p-12 space-y-6"
              >
                <div className="text-center space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Zero Third-Party Tool Costs</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Replace Slack, Zoom, and Calendly with zero extra monthly add-ons.</p>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 hover:border-orange-300 dark:hover:border-orange-800 transition-all shadow-2xs">
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/50 shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Enterprise Shared Mailbox</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Send and receive customer emails directly inside your CRM via high-speed API endpoints.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 hover:border-orange-300 dark:hover:border-orange-800 transition-all shadow-2xs">
                    <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/80 dark:border-teal-900/50 shrink-0">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">WebRTC Video & Huddles</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Hop on instant HD video calls and persistent voice huddles directly inside your Virtual HQ.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button onClick={prevStep} className="px-5 py-3 text-slate-500 dark:text-slate-400 font-extrabold text-xs hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={nextStep} className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95">
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Tailor Your Workspace */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-8 sm:p-12 text-center space-y-5"
              >
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl flex items-center justify-center mx-auto mb-1">
                  <Zap className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Tailor Your Workspace</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium">
                  Okleevo includes {modules.length} integrated tools. We&apos;ve enabled the essential tools to keep your dashboard clean.
                </p>

                <div className="max-h-56 overflow-y-auto pr-1 -mr-1 space-y-3 text-left">
                  {moduleGroups.filter(g => g !== 'All').map((group) => (
                    <div key={group}>
                      <p className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">{group}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {modules.filter(m => m.group === group).map((mod) => (
                          <div key={mod.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                            <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                              <mod.icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate">{mod.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 bg-orange-50/80 dark:bg-orange-950/40 rounded-2xl border border-orange-200/80 dark:border-orange-900/40 inline-block">
                  <p className="text-xs font-bold text-orange-900 dark:text-orange-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    Tip: Turn on additional tools anytime in Settings &gt; Tools
                  </p>
                </div>

                <div className="flex justify-between pt-2">
                  <button onClick={prevStep} className="px-5 py-3 text-slate-500 dark:text-slate-400 font-extrabold text-xs hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={nextStep} className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95">
                    <span>Got it</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Final Command Center */}
            {step === 5 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 sm:p-12 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20 rotate-6">
                  <ShieldCheck className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">You&apos;re All Set!</h3>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed font-medium">
                  Your business workspace is configured and operational. Click below to launch into your Command Center.
                </p>
                
                <div className="pt-4">
                  <button 
                    onClick={onClose}
                    className="px-10 py-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    Enter Command Center
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 flex">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div 
                key={i} 
                className={`h-full flex-1 transition-all duration-500 ${
                  i < step ? 'bg-gradient-to-r from-orange-500 to-amber-600' : 'bg-slate-100 dark:bg-slate-900'
                }`} 
              />
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
