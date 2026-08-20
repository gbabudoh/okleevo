"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Zap, Activity, Users } from "lucide-react";

export function TelemetryStrip() {
  const metrics = [
    { label: "Uptime SLA", value: "99.99%", detail: "Enterprise Grade", icon: Activity, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-900/50" },
    { label: "Edge Latency", value: "<15ms", detail: "Global CDN Routing", icon: Zap, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/60 border-orange-200/80 dark:border-orange-900/50" },
    { label: "Storage Security", value: "Zero-Trust", detail: "AES-256 Encrypted", icon: ShieldCheck, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/60 border-blue-200/80 dark:border-blue-900/50" },
    { label: "Team Velocity", value: "10x", detail: "Faster Onboarding", icon: Users, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-900/50" },
  ];

  return (
    <section className="py-8 sm:py-12 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-y border-slate-200/80 dark:border-slate-800 relative shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-3xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md hover:border-orange-400/50 transition-all shadow-2xs group"
              >
                <div className={`p-2.5 sm:p-3 rounded-2xl border ${m.bg} ${m.color} shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-base sm:text-2xl font-extrabold tracking-tight font-mono text-slate-900 dark:text-white truncate">
                    {m.value}
                  </div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate mt-0.5">{m.label}</div>
                  <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 truncate">{m.detail}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
