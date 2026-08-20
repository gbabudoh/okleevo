"use client";

import { motion } from "framer-motion";
import { Video, Sparkles, Kanban, UploadCloud } from "lucide-react";

export function EnterpriseBento() {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white via-orange-50/20 to-slate-50/50 text-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-100/80 border border-amber-200 px-3 py-1 rounded-full">
            Modular Enterprise Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-4 text-slate-900">
            Everything Modern Teams Need. Zero Bloat.
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Replace 5 separate SaaS tools with one cohesive operating system designed for speed and security.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Large Featured Card - Borderless Communication & WebRTC */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 relative p-8 rounded-3xl bg-white border border-slate-200 shadow-sm backdrop-blur-xl overflow-hidden group hover:border-orange-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-orange-400/15 via-amber-300/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-orange-100 border border-orange-200 text-orange-600">
                  <Video className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                  Module 01 • Collaboration & Video Hub
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 mt-6">
                Instant HD Video Meetings & Team Messaging
              </h3>
              <p className="mt-2 text-slate-600 text-sm max-w-xl leading-relaxed font-normal">
                Launch studio-quality HD video meetings directly inside team channels. Zero external links, zero downloads, and zero Zoom license fees.
              </p>
            </div>

            {/* Micro visual widget */}
            <div className="mt-8 p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <span className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-slate-900">SC</span>
                  <span className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-slate-900">AR</span>
                  <span className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-slate-900">DK</span>
                </div>
                <div>
                  <p className="font-semibold text-white">Active Product Huddle</p>
                  <p className="text-[10px] text-emerald-400">1080p 60fps • 8ms Latency</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono border border-emerald-500/30">
                Connected
              </span>
            </div>
          </motion.div>

          {/* Card 2: Zero-Trust Client Portal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm backdrop-blur-xl hover:border-orange-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-600">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                  Module 02
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 mt-6">
                Client Booking & Safe Storage
              </h3>
              <p className="mt-2 text-slate-600 text-sm leading-relaxed font-normal">
                Clients schedule calls on your public booking page and upload files straight into malware-scanned buckets—no client account required.
              </p>
            </div>

            <div className="mt-6 p-3 rounded-xl bg-slate-900 text-white text-[11px] flex items-center justify-between">
              <span className="text-slate-300">ClamAV Malware Shield</span>
              <span className="text-emerald-400 font-mono font-bold">100% Clean</span>
            </div>
          </motion.div>

          {/* Card 3: AI Intelligence Engine */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm backdrop-blur-xl hover:border-orange-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-amber-100 border border-amber-200 text-amber-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                  Module 03
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 mt-6">
                AI Meeting Intelligence
              </h3>
              <p className="mt-2 text-slate-600 text-sm leading-relaxed font-normal">
                Automated Groq Llama-3 transcripts, action item extraction, and concise executive summaries generated instantly after every huddle.
              </p>
            </div>

            <div className="mt-6 p-3 rounded-xl bg-slate-900 text-white text-[11px] flex items-center justify-between">
              <span className="text-slate-300">Groq Llama-3 70B</span>
              <span className="text-amber-400 font-mono font-bold">Auto Summary</span>
            </div>
          </motion.div>

          {/* Card 4: Large Card - Async CRM Pipeline & Kanban */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-2 relative p-8 rounded-3xl bg-white border border-slate-200 shadow-sm backdrop-blur-xl overflow-hidden hover:border-orange-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-purple-100 border border-purple-200 text-purple-600">
                  <Kanban className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                  Module 04 • CRM Pipeline
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 mt-6">
                Lean CRM & Async Kanban Workflows
              </h3>
              <p className="mt-2 text-slate-600 text-sm max-w-xl leading-relaxed font-normal">
                Track enterprise sales, assign client projects, and manage revenue pipelines with zero drag-and-drop latency.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-lg font-bold font-mono text-slate-900">$1.2M</div>
                <div className="text-[10px] font-medium text-slate-600">Total Pipeline</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-lg font-bold font-mono text-emerald-600">98%</div>
                <div className="text-[10px] font-medium text-slate-600">Client Satisfaction</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-lg font-bold font-mono text-amber-600">14 Days</div>
                <div className="text-[10px] font-medium text-slate-600">Avg Close Cycle</div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
