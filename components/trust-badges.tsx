"use client";

import { motion } from "framer-motion";
import { Database, ShieldCheck, Lock, ScanSearch } from "lucide-react";

const badges = [
  {
    icon: Database,
    title: "Isolated Object Storage",
    description: "Self-hosted storage isolation powered by MinIO — sandboxed guest uploads with zero public read access.",
  },
  {
    icon: ScanSearch,
    title: "Automated Malware Scanning",
    description: "Every guest upload is scanned before your team can ever see it.",
  },
  {
    icon: Lock,
    title: "TLS 1.3 Encryption",
    description: "Every connection, internal and guest-facing, is encrypted in transit.",
  },
  {
    icon: ShieldCheck,
    title: "GDPR-Compliant Architecture",
    description: "Built with data isolation and consent handling as first-class concerns.",
  },
];

export function TrustBadges() {
  return (
    <div className="max-w-6xl mx-auto px-2">
      <p className="text-center text-sm font-semibold uppercase tracking-wider text-gray-400 mb-8">
        Enterprise-Grade Infrastructure
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-3">
              <badge.icon className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">{badge.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{badge.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
