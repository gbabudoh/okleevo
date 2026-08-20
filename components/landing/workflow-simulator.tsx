"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Video, CheckSquare, CreditCard, ArrowRight, ShieldCheck } from "lucide-react";

export function WorkflowSimulator() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: "01",
      title: "Public Client Booking & File Vault",
      description: "Clients pick a time slot on your branded public page and upload attachments directly to isolated, malware-scanned cloud storage. Zero account creation required.",
      icon: Calendar,
      highlight: "ClamAV Virus Shield • One-time Access Codes",
      metric: "< 30 sec Booking Time"
    },
    {
      number: "02",
      title: "Instant HD Video Meetings",
      description: "Click to launch studio-quality HD video meetings straight from your workspace chat. High-definition screen sharing, crystal audio, and secure rooms built-in.",
      icon: Video,
      highlight: "Zero App Downloads • 1080p HD • Screen Share",
      metric: "Instant 1-Click Launch"
    },
    {
      number: "03",
      title: "Autonomous AI Meeting Intelligence",
      description: "Groq Llama-3 automatically transcribes the conversation in real-time, extracts key decision points, and generates structured Kanban task items.",
      icon: CheckSquare,
      highlight: "Groq Llama-3 70B • Real-time Transcripts",
      metric: "100% Automated Notes"
    },
    {
      number: "04",
      title: "Instant Invoice & Deal Closure",
      description: "Convert completed project milestones straight into branded Stripe invoices and record revenue progress in your CRM board automatically.",
      icon: CreditCard,
      highlight: "Stripe Connect • Real-time Revenue Telemetry",
      metric: "Instant Payout Sync"
    }
  ];

  return (
    <section id="workflow" className="py-24 bg-slate-50/70 text-slate-900 relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full">
            End-To-End Automation Flow
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-4 text-slate-900">
            How Okleevo Powers Enterprise Workflows
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            From initial client inquiry to final payment—streamline your entire operation into 4 simple steps.
          </p>
        </div>

        {/* Workflow Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Step Selectors (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                    isActive
                      ? "bg-white border-orange-500 shadow-[0_4px_20px_rgba(252,104,19,0.2)]"
                      : "bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`font-mono text-sm font-extrabold ${isActive ? "text-orange-600" : "text-slate-400"}`}>
                      {step.number}
                    </span>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isActive ? "text-orange-600" : "text-slate-500"}`} />
                      <span className={`text-sm font-bold ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                        {step.title}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 transition-transform ${isActive ? "text-orange-600 translate-x-1" : "text-slate-400"}`} />
                </button>
              );
            })}
          </div>

          {/* Right Active Step Display Window (7 cols) */}
          <div className="lg:col-span-7">
            <div className="relative p-8 rounded-3xl bg-white border border-slate-200 shadow-xl backdrop-blur-2xl min-h-[360px] flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-orange-700 bg-orange-100 border border-orange-200 px-3 py-1 rounded-full">
                      STEP {steps[activeStep].number} OF 04
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
                      {steps[activeStep].metric}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-extrabold text-slate-900">
                      {steps[activeStep].title}
                    </h3>
                    <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                      {steps[activeStep].description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-orange-600" />
                      <span>{steps[activeStep].highlight}</span>
                    </div>
                    <span className="font-mono text-slate-500 font-semibold">Automated Pipeline</span>
                  </div>
                </motion.div>
              </AnimatePresence>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
