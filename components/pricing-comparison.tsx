"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

export function PricingComparison() {
  return (
    <div className="mt-16 pt-12 border-t border-gray-200/60">
      <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
        Why Okleevo is the Smart Choice
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
          
          <h4 className="font-bold text-red-900 mb-6 text-lg">Traditional Software Stack</h4>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm text-red-800/80">
              <span>Invoicing & Accounting</span>
              <span className="font-medium">£30+</span>
            </div>
            <div className="w-full h-2 bg-red-200 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: "25%" }}
                className="h-full bg-red-500"
              />
            </div>

            <div className="flex justify-between text-sm text-red-800/80">
              <span>CRM & Leads</span>
              <span className="font-medium">£25+</span>
            </div>
            <div className="w-full h-2 bg-red-200 rounded-full overflow-hidden">
                <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: "20%" }}
                className="h-full bg-red-500"
                transition={{ delay: 0.1 }}
              />
            </div>

            <div className="flex justify-between text-sm text-red-800/80">
              <span>Project Management</span>
              <span className="font-medium">£12+</span>
            </div>
            <div className="w-full h-2 bg-red-200 rounded-full overflow-hidden">
               <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: "10%" }}
                className="h-full bg-red-500"
                transition={{ delay: 0.2 }}
              />
            </div>

            <div className="flex justify-between text-sm text-red-800/80">
              <span>HR & Payroll</span>
              <span className="font-medium">£18+</span>
            </div>
            <div className="w-full h-2 bg-red-200 rounded-full overflow-hidden">
               <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: "15%" }}
                className="h-full bg-red-500"
                transition={{ delay: 0.3 }}
              />
            </div>
            
             <div className="flex justify-between text-sm text-red-800/80">
              <span>Other Tools (Email, etc.)</span>
              <span className="font-medium">£35+</span>
            </div>
             <div className="w-full h-2 bg-red-200 rounded-full overflow-hidden">
               <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: "30%" }}
                className="h-full bg-red-500"
                transition={{ delay: 0.4 }}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-red-200 flex justify-between items-end">
            <span className="text-red-700 font-medium">Monthly Cost</span>
            <span className="text-3xl font-bold text-red-600">£120+</span>
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

          <h4 className="font-bold text-emerald-900 mb-6 text-lg">Okleevo All-In-One</h4>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm text-emerald-800/80">
              <span>All 20+ Modules Included</span>
              <span className="font-medium">Inclusive</span>
            </div>
            
            {/* One big bar representing value */}
            <div className="w-full h-32 bg-emerald-100/50 rounded-xl flex items-center justify-center border border-emerald-200/50 relative overflow-hidden">
               <span className="relative z-10 font-medium text-emerald-700">Everything in one place</span>
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
            <span className="text-emerald-700 font-medium">Monthly Cost</span>
            <span className="text-3xl font-bold text-emerald-600">£9.99</span>
          </div>
        </motion.div>
      </div>

      <p className="text-center mt-8 text-lg font-semibold text-emerald-600 bg-emerald-50 inline-block px-6 py-2 rounded-full mx-auto table">
        You save £1000+ per year
      </p>

      {/* Semantic Comparison Table for GEO (AI Engine Optimization) and Accessibility */}
      <div className="mt-12 overflow-x-auto print:hidden" data-ai-table="feature-pricing-comparison">
        <table className="w-full text-left border-collapse text-sm text-gray-500">
          <caption className="sr-only">Okleevo Features and Pricing Comparison vs Traditional Software Stack</caption>
          <thead>
            <tr className="border-b border-gray-200">
              <th scope="col" className="py-4 font-bold text-gray-900">Feature / Module Category</th>
              <th scope="col" className="py-4 font-bold text-gray-900">Okleevo All-In-One Plan</th>
              <th scope="col" className="py-4 font-bold text-gray-900">Traditional Software Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <th scope="row" className="py-4 font-medium text-gray-900">Invoicing & Accounting (MTD Compliant)</th>
              <td className="py-4 text-emerald-600 font-semibold">Included (Unlimited Invoices)</td>
              <td className="py-4">£30+/month (e.g. Xero, Quickbooks)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <th scope="row" className="py-4 font-medium text-gray-900">CRM & Leads Manager</th>
              <td className="py-4 text-emerald-600 font-semibold">Included (Unlimited Contacts)</td>
              <td className="py-4">£25+/month (e.g. Salesforce, HubSpot)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <th scope="row" className="py-4 font-medium text-gray-900">Project & Tasks Collaboration</th>
              <td className="py-4 text-emerald-600 font-semibold">Included (10 Seats Included)</td>
              <td className="py-4">£12+/month (e.g. Asana, Monday)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <th scope="row" className="py-4 font-medium text-gray-900">HR Records & E-Signatures</th>
              <td className="py-4 text-emerald-600 font-semibold">Included (Secure Signing)</td>
              <td className="py-4">£18+/month (e.g. DocuSign, BambooHR)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <th scope="row" className="py-4 font-medium text-gray-900">SMTP Bulk Email Marketing campaigns</th>
              <td className="py-4 text-emerald-600 font-semibold">Included (Native SMTP)</td>
              <td className="py-4">£20+/month (e.g. Mailchimp)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <th scope="row" className="py-4 font-medium text-gray-900">WebRTC Video & Team Chat</th>
              <td className="py-4 text-emerald-600 font-semibold">Included (Native WebRTC)</td>
              <td className="py-4">£15+/month (e.g. Zoom, Slack)</td>
            </tr>
            <tr className="bg-gray-50/50">
              <th scope="row" className="py-4 font-bold text-gray-900">Total Monthly Subscription Cost</th>
              <td className="py-4 text-lg text-emerald-600 font-black">£9.99/month</td>
              <td className="py-4 text-lg text-red-600 font-bold">£120+/month</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
