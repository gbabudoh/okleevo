"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

export function PricingComparison() {
  return (
    <div className="mt-16 pt-12 border-t border-gray-200/60">
      <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
        One platform. Massive savings.
      </h3>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Traditional Stack */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="p-6 rounded-2xl bg-red-50/50 border border-red-100 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <X className="w-24 h-24 text-red-500" />
          </div>

          <h4 className="font-bold text-red-900 mb-6 text-lg">The Old Fragmented Way</h4>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm text-red-800/80">
              <span>Internal Huddles & Chat (Slack)</span>
              <span className="font-medium">$8.75/user</span>
            </div>
            <div className="w-full h-2 bg-red-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "19%" }}
                className="h-full bg-red-500"
              />
            </div>

            <div className="flex justify-between text-sm text-red-800/80">
              <span>Video Infrastructure (Zoom)</span>
              <span className="font-medium">$14.99/user</span>
            </div>
            <div className="w-full h-2 bg-red-200 rounded-full overflow-hidden">
                <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "32%" }}
                className="h-full bg-red-500"
                transition={{ delay: 0.1 }}
              />
            </div>

            <div className="flex justify-between text-sm text-red-800/80">
              <span>External Scheduling (Calendly)</span>
              <span className="font-medium">$12/user</span>
            </div>
            <div className="w-full h-2 bg-red-200 rounded-full overflow-hidden">
               <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "26%" }}
                className="h-full bg-red-500"
                transition={{ delay: 0.2 }}
              />
            </div>

            <div className="flex justify-between text-sm text-red-800/80">
              <span>Project Tracking (Asana)</span>
              <span className="font-medium">$10.99/user</span>
            </div>
            <div className="w-full h-2 bg-red-200 rounded-full overflow-hidden">
               <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "24%" }}
                className="h-full bg-red-500"
                transition={{ delay: 0.3 }}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-red-200 flex justify-between items-end">
            <span className="text-red-700 font-medium">Monthly Cost (10-user team)</span>
            <span className="text-3xl font-bold text-red-600">$467.30</span>
          </div>
        </motion.div>

        {/* Okleevo */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100 relative overflow-hidden ring-4 ring-emerald-500/10"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Check className="w-24 h-24 text-emerald-500" />
          </div>

          <h4 className="font-bold text-emerald-900 mb-6 text-lg">The Okleevo Way</h4>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm text-emerald-800/80">
              <span>Virtual HQ + Booking + Async Boards</span>
              <span className="font-medium">Included</span>
            </div>

            {/* One big bar representing value */}
            <div className="w-full h-32 bg-emerald-100/50 rounded-xl flex items-center justify-center border border-emerald-200/50 relative overflow-hidden">
               <span className="relative z-10 font-medium text-emerald-700">Everything in one workspace</span>
               <motion.div
                 className="absolute inset-0 bg-emerald-200/30"
                 initial={{ scaleY: 0 }}
                 whileInView={{ scaleY: 1 }}
                 transition={{ duration: 0.5, ease: "easeOut" }}
                 style={{ originY: 1 }}
               />
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-200 flex justify-between items-end">
            <span className="text-emerald-700 font-medium">Monthly Cost (Growth, billed annually)</span>
            <span className="text-3xl font-bold text-emerald-600">$79</span>
          </div>
        </motion.div>
      </div>

      <p className="text-center mt-8 text-lg font-semibold text-emerald-600 bg-emerald-50 inline-block px-6 py-2 rounded-full mx-auto table">
        You save $388+ per month
      </p>

      {/* Semantic Comparison Table for GEO (AI Engine Optimization) and Accessibility */}
      <div className="mt-12 overflow-x-auto print:hidden" data-ai-table="feature-pricing-comparison">
        <table className="w-full text-left border-collapse text-sm text-gray-500">
          <caption className="sr-only">Okleevo Features and Pricing Comparison vs a Fragmented Software Stack</caption>
          <thead>
            <tr className="border-b border-gray-200">
              <th scope="col" className="py-4 font-bold text-gray-900">Feature Layer</th>
              <th scope="col" className="py-4 font-bold text-gray-900">The Old Fragmented Way</th>
              <th scope="col" className="py-4 font-bold text-gray-900">The Okleevo Way</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <th scope="row" className="py-4 font-medium text-gray-900">Team Messaging & Chat</th>
              <td className="py-4">Slack ($8.75/user)</td>
              <td className="py-4 text-emerald-600 font-semibold">Included (Virtual HQ)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <th scope="row" className="py-4 font-medium text-gray-900">Video Conferencing</th>
              <td className="py-4">Zoom ($14.99/user)</td>
              <td className="py-4 text-emerald-600 font-semibold">Included (Built-in HD Video)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <th scope="row" className="py-4 font-medium text-gray-900">External Scheduling</th>
              <td className="py-4">Calendly ($12/user)</td>
              <td className="py-4 text-emerald-600 font-semibold">Included (Booking Pages)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <th scope="row" className="py-4 font-medium text-gray-900">Project Tracking</th>
              <td className="py-4">Asana ($10.99/user)</td>
              <td className="py-4 text-emerald-600 font-semibold">Included (Async Boards)</td>
            </tr>
            <tr className="bg-gray-50/50">
              <th scope="row" className="py-4 font-bold text-gray-900">Monthly Cost (10-user team)</th>
              <td className="py-4 text-lg text-red-600 font-bold">$467.30/month</td>
              <td className="py-4 text-lg text-emerald-600 font-black">$79/month (Growth, annual)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
