"use client";

import React from "react";
import { 
  Wallet, Briefcase, TrendingUp, Cpu, 
  CheckCircle2
} from "lucide-react";

export function PricingFeatures() {
  const categories = [
    {
      title: "Finance & Sales",
      icon: Wallet,
      color: "text-blue-600",
      bg: "bg-blue-100",
      items: [
        "Mini Invoicing System",
        "Cashflow Snapshot",
        "Expense Tracker",
        "VAT Calculator",
        "Lite CRM",
        "Lead Forms Builder"
      ]
    },
    {
      title: "Operations",
      icon: Briefcase,
      color: "text-purple-600",
      bg: "bg-purple-100",
      items: [
         "Appointment Booking",
         "Helpdesk System",
         "Task Board",
         "Inventory Management",
         "Supplier Tracker",
         "Employee Onboarding"
      ]
    },
    {
      title: "Growth & Tools",
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-100",
      items: [
        "Email Campaigns",
        "Micro Pages",
        "HR Records",
        "E-Signature",
        "Compliance Reminders",
        "KPI Dashboard"
      ]
    },
    {
      title: "AI Power",
      icon: Cpu,
      color: "text-rose-600",
      bg: "bg-rose-100",
      items: [
        "AI Content Generator",
        "AI Note Taking",
        "AI Business Assistant", 
        "Automated Insights",
        "Smart Categorization",
        "24/7 AI Support"
      ]
    }
  ];

  return (
    <div className="mt-12 space-y-8">
      <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
        Everything Included for £19.99
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {categories.map((cat, idx) => (
          <div key={idx} className="bg-white/50 rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${cat.bg}`}>
                <cat.icon className={`w-5 h-5 ${cat.color}`} />
              </div>
              <h4 className="font-semibold text-gray-900">{cat.title}</h4>
            </div>
            
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cat.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className={`w-4 h-4 ${cat.color} opacity-70`} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="text-center pt-6">
        <p className="text-sm text-gray-500">
          + Unlimited Users, Unlimited Storage, Free Updates, and Priority Support.
        </p>
      </div>
    </div>
  );
}
