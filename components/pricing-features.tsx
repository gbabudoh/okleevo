"use client";

import {
  UsersRound, Briefcase, Calendar, Cpu,
  CheckCircle2
} from "lucide-react";

export function PricingFeatures() {
  const categories = [
    {
      title: "Virtual HQ",
      icon: UsersRound,
      color: "text-blue-600",
      bg: "bg-blue-100",
      items: [
        "Team Chat Channels",
        "Voice & Video Huddles",
        "Async Status Tracker",
        "Direct Messaging",
        "File Sharing",
        "Timezone-Aware Presence"
      ]
    },
    {
      title: "Async Productivity",
      icon: Briefcase,
      color: "text-purple-600",
      bg: "bg-purple-100",
      items: [
         "Kanban & List Task Boards",
         "Unified Project Notes",
         "OKR & Delivery KPI Dashboard",
         "AI Meeting Transcription",
         "Action Item Extraction",
         "Timezone-Localized Calendar"
      ]
    },
    {
      title: "Client Engagement",
      icon: Calendar,
      color: "text-orange-600",
      bg: "bg-orange-100",
      items: [
        "Zero-Login Booking Pages",
        "Lean CRM Pipeline",
        "Okleevo Mail Engine",
        "Helpdesk Tickets",
        "Built-in E-Signature",
        "Isolated Guest File Uploads"
      ]
    },
    {
      title: "AI & Growth",
      icon: Cpu,
      color: "text-rose-600",
      bg: "bg-rose-100",
      items: [
        "AI Content Generator",
        "AI Note Taking",
        "Multi-Region Mail Campaigns",
        "Automated Insights",
        "White-Label Client Interfaces",
        "Priority Global Server Routing"
      ]
    }
  ];

  return (
    <div className="mt-12 space-y-8">
      <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
        Everything a Distributed Team Needs
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
          Seat allotments, storage, and video minutes scale with your plan — see the full breakdown below.
        </p>
      </div>
    </div>
  );
}
