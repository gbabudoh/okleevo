"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  Users,
  Calendar,
  CheckSquare,
  Sparkles,
  BarChart3,
  UserCheck,
  Shield,
  Receipt,
  Target,
} from "lucide-react";

const dashboardModules = [
  { icon: Receipt,  label: "Invoicing", color: "from-emerald-400 to-emerald-600", iconColor: "text-emerald-600" },
  { icon: BarChart3, label: "Analytics", color: "from-blue-400 to-blue-600",    iconColor: "text-blue-600" },
  { icon: Users,    label: "CRM",        color: "from-purple-400 to-purple-600", iconColor: "text-purple-600" },
  { icon: Calendar, label: "Booking",    color: "from-orange-400 to-orange-600", iconColor: "text-orange-600" },
  { icon: Sparkles, label: "AI Tools",   color: "from-pink-400 to-pink-600",     iconColor: "text-pink-600" },
  { icon: Target,   label: "Tasks",      color: "from-indigo-400 to-indigo-600", iconColor: "text-indigo-600" },
];

const agentData = [
  { init: { left: "5%",  top: "20%" }, anim: { left: ["5%","30%","50%","30%","5%"],   top: ["20%","40%","20%","60%","20%"] }, dur: 8,  delay: 0,   color: "from-blue-400 to-blue-600",    Icon: Users },
  { init: { left: "70%", top: "30%" }, anim: { left: ["70%","50%","30%","50%","70%"], top: ["30%","50%","30%","10%","30%"] }, dur: 10, delay: 1,   color: "from-emerald-400 to-emerald-600", Icon: UserCheck },
  { init: { left: "85%", top: "50%" }, anim: { left: ["85%","65%","45%","65%","85%"], top: ["50%","30%","60%","40%","50%"] }, dur: 9,  delay: 2,   color: "from-purple-400 to-purple-600", Icon: Users },
  { init: { left: "20%", top: "60%" }, anim: { left: ["20%","40%","60%","40%","20%"], top: ["60%","20%","50%","70%","60%"] }, dur: 11, delay: 0.5, color: "from-orange-400 to-orange-600", Icon: UserCheck },
  { init: { left: "50%", top: "10%" }, anim: { left: ["50%","70%","50%","30%","50%"], top: ["10%","40%","70%","40%","10%"] }, dur: 12, delay: 1.5, color: "from-pink-400 to-pink-600",    Icon: Users },
];

const featureCards = [
  { icon: CheckSquare, text: "20 Integrated Modules",           color: "text-emerald-500", bg: "bg-emerald-50" },
  { icon: DollarSign,  text: "Just £9.99/month – No Hidden Fees", color: "text-blue-500",   bg: "bg-blue-50" },
  { icon: Sparkles,    text: "AI-Powered Tools Included",       color: "text-purple-500", bg: "bg-purple-50" },
  { icon: Shield,      text: "UK-Based & GDPR Compliant",       color: "text-orange-500", bg: "bg-orange-50" },
  { icon: Users,       text: "10 seats – ideal for SMEs",       color: "text-indigo-500", bg: "bg-indigo-50" },
];

function LaptopMockup() {
  return (
    <div className="relative">
      {/* Screen */}
      <div className="w-[600px] h-[380px] bg-gray-900 rounded-t-2xl border-8 border-gray-800 shadow-2xl overflow-hidden">
        <div className="w-full h-full bg-linear-to-br from-blue-50 via-white to-orange-50 p-6">
          {/* Browser chrome dots */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>

          <div className="space-y-3">
            {/* Animated header bar */}
            <motion.div
              className="h-8 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center px-3 gap-2"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              {[0, 0.2, 0.4].map((d, i) => (
                <motion.div key={i} className="w-2 h-2 bg-white rounded-full"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, delay: d, repeat: Infinity }}
                />
              ))}
            </motion.div>

            {/* Module cards grid */}
            <div className="grid grid-cols-3 gap-3">
              {dashboardModules.map((module, i) => (
                <motion.div key={i}
                  className="h-20 bg-white rounded-lg shadow-md border border-gray-100 p-2 relative overflow-hidden"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    className={`absolute inset-0 bg-linear-to-br ${module.color} opacity-5`}
                    animate={{ opacity: [0.05, 0.15, 0.05] }}
                    transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }}
                  />
                  <div className="relative flex items-center gap-2 h-full">
                    <motion.div
                      className={`w-10 h-10 bg-linear-to-br ${module.color} rounded-lg flex items-center justify-center shadow-sm`}
                      animate={{ rotate: [0, 5, 0, -5, 0] }}
                      transition={{ duration: 4, delay: i * 0.2, repeat: Infinity }}
                    >
                      <module.icon className="w-5 h-5 text-white" />
                    </motion.div>
                    <div className="flex-1 space-y-1">
                      <div className={`h-2 ${module.iconColor.replace('text', 'bg')} bg-opacity-30 rounded`} />
                      <div className="h-2 bg-gray-100 rounded w-2/3" />
                    </div>
                  </div>
                  <motion.div
                    className={`absolute top-1 right-1 w-2 h-2 ${module.iconColor.replace('text', 'bg')} rounded-full`}
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Animated people / agents panel */}
            <motion.div
              className="h-32 bg-white rounded-lg shadow-md border border-gray-100 p-4 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.5 }}
            >
              <div className="absolute inset-0 opacity-5">
                <div className="grid grid-cols-8 h-full">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="border-r border-gray-300" />
                  ))}
                </div>
              </div>
              <div className="relative h-full">
                {agentData.map((a, i) => (
                  <motion.div key={i} className="absolute" initial={a.init} animate={a.anim}
                    transition={{ duration: a.dur, repeat: Infinity, ease: "easeInOut", delay: a.delay }}
                  >
                    <div className={`w-10 h-10 rounded-full bg-linear-to-br ${a.color} flex items-center justify-center shadow-lg border-2 border-white`}>
                      <a.Icon className="w-5 h-5 text-white" />
                    </div>
                  </motion.div>
                ))}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                  <motion.line x1="10%" y1="30%" x2="70%" y2="40%"
                    stroke="url(#grad1)" strokeWidth="2" strokeDasharray="5,5"
                    initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%"   stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Laptop base */}
      <div className="w-[600px] h-4 bg-gray-300 rounded-b-xl -mt-1 shadow-lg" />
      <div className="w-[610px] h-2 bg-gray-400 rounded-b-2xl shadow-xl mx-auto" />
    </div>
  );
}

export function HeroAnimation() {
  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">

      {/* ── Text – first on mobile, right column on desktop ── */}
      <motion.div
        className="order-1 lg:order-2 space-y-5 lg:space-y-8 text-center lg:text-left"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <motion.h2
          className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Run Your Entire Business<br />from One Dashboard
        </motion.h2>

        <motion.p
          className="text-sm sm:text-base lg:text-xl text-gray-600 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          One platform, zero headaches. All the tools you need to manage and grow your business, without the juggling act.
        </motion.p>

        {/* Mobile: compact 2-col chips */}
        <motion.div
          className="grid grid-cols-2 gap-2 lg:hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {featureCards.map((f, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className={`p-1.5 ${f.bg} rounded-lg shrink-0`}>
                <f.icon className={`w-3.5 h-3.5 ${f.color}`} />
              </div>
              <span className="text-[11px] font-semibold text-gray-700 leading-tight">{f.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Desktop: full cards */}
        <div className="hidden lg:block space-y-4">
          {featureCards.map((feature, i) => (
            <motion.div key={i}
              className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className={`p-3 ${feature.bg} rounded-lg`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <span className="text-lg font-medium text-gray-800">{feature.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Laptop – second on mobile, left column on desktop ── */}
      <div className="order-2 lg:order-1 relative w-full h-[220px] sm:h-[300px] lg:h-[500px] overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="scale-[0.48] sm:scale-[0.65] md:scale-[0.78] lg:scale-100 origin-center transition-transform">
            <LaptopMockup />
          </div>
        </motion.div>
      </div>

    </div>
  );
}
