"use client";

import React from "react";
import { 
  PiggyBank, Zap, Target, Rocket, Users, Shield, 
  BarChart3, GraduationCap, Sparkles 
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: PiggyBank,
    title: "Save Money",
    description: "Replace 5-10 separate tools with one affordable subscription. Save up to £500/month on software costs.",
    className: "md:col-span-2",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-600",
    delay: 0.1
  },
  {
    icon: Zap,
    title: "Save Time",
    description: "No more switching apps. Workflows that fly.",
    className: "md:col-span-1",
    gradient: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-600",
    delay: 0.2
  },
  {
    icon: Target,
    title: "Stay Organized",
    description: "One unified system for all your data.",
    className: "md:col-span-1",
    gradient: "from-purple-500/20 to-purple-500/5",
    iconColor: "text-purple-600",
    delay: 0.3
  },
  {
    icon: BarChart3,
    title: "Real-Time Insights",
    description: "Unified dashboard shows your entire business at a glance. Make informed decisions faster than ever before.",
    className: "md:col-span-2",
    gradient: "from-teal-500/20 to-teal-500/5",
    iconColor: "text-teal-600",
    delay: 0.4
  },
  {
    icon: Rocket,
    title: "Scale Easily",
    description: "Start small, grow big. Activate modules as you need them.",
    className: "md:col-span-1",
    gradient: "from-orange-500/20 to-orange-500/5",
    iconColor: "text-orange-600",
    delay: 0.5
  },
  {
    icon: Users,
    title: "Better Collaboration",
    description: "Share tasks and insights seamlessly with your team.",
    className: "md:col-span-1",
    gradient: "from-pink-500/20 to-pink-500/5",
    iconColor: "text-pink-600",
    delay: 0.6
  },
  {
    icon: Shield,
    title: "UK-Based & Secure",
    description: "GDPR compliant, enterprise-grade security.",
    className: "md:col-span-1",
    gradient: "from-indigo-500/20 to-indigo-500/5",
    iconColor: "text-indigo-600",
    delay: 0.7
  },
  {
    icon: Sparkles,
    title: "AI-Powered",
    description: "Automate boring tasks with built-in AI tools for content, notes, and more.",
    className: "md:col-span-2",
    gradient: "from-rose-500/20 to-rose-500/5",
    iconColor: "text-rose-600",
    delay: 0.8
  },
  {
    icon: GraduationCap,
    title: "Easy to Use",
    description: "Get started in minutes.",
    className: "md:col-span-1",
    gradient: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-600",
    delay: 0.9
  },
];

export function FeaturesBentoGrid() {
  return (
    <section id="benefits" className="py-24 px-6 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-slate-50 -z-20" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-200/30 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight"
                >
                Why SMEs Choose Okleevo
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
                >
                Stop paying for multiple subscriptions. Get everything you need in one powerful platform designed specifically for UK small businesses.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
                {features.map((feature, idx) => (
                    <motion.div
                        key={idx}
                        className={`group relative p-8 rounded-3xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${feature.className}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: feature.delay, duration: 0.5 }}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`} />
                        
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
  );
}
