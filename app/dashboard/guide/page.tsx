"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  CheckCircle2, Circle, ChevronRight, Rocket,
  User, Users, FileText,
  BarChart3, MessageSquare, Star, Sparkles,
  Building2, Package, BookOpen,
} from "lucide-react";

interface Step {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  cta: string;
}

const STEPS: Step[] = [
  {
    id: "profile",
    title: "Complete your profile",
    description: "Add your name, photo, and contact details so your team and clients know who you are.",
    href: "/dashboard/settings",
    icon: User,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    cta: "Go to Settings",
  },
  {
    id: "business",
    title: "Set up your business",
    description: "Add your business name, logo, address, and bank details — used across invoices and documents.",
    href: "/dashboard/settings",
    icon: Building2,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    cta: "Set up Business",
  },
  {
    id: "client",
    title: "Add your first client",
    description: "Create a CRM contact so you can raise invoices, track interactions, and manage relationships.",
    href: "/dashboard/crm",
    icon: Users,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    cta: "Open CRM",
  },
  {
    id: "invoice",
    title: "Send your first invoice",
    description: "Create and send a professional invoice in seconds — track payments and chase overdue ones.",
    href: "/dashboard/invoicing",
    icon: FileText,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    cta: "Create Invoice",
  },
  {
    id: "team",
    title: "Invite a team member",
    description: "Add colleagues to your workspace — up to 10 seats included on your plan.",
    href: "/dashboard/settings",
    icon: Users,
    iconBg: "bg-pink-50",
    iconColor: "text-pink-600",
    cta: "Invite Team",
  },
  {
    id: "product",
    title: "Add a product or service",
    description: "Build your inventory or service catalogue to speed up invoice and quote creation.",
    href: "/dashboard/inventory",
    icon: Package,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    cta: "Add Product",
  },
  {
    id: "ai",
    title: "Try an AI tool",
    description: "Generate content, write emails, or summarise notes — all powered by built-in AI tools.",
    href: "/dashboard/ai-content",
    icon: Sparkles,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    cta: "Explore AI",
  },
  {
    id: "analytics",
    title: "Check your KPI dashboard",
    description: "Get a live overview of revenue, tasks, clients, and team activity in one place.",
    href: "/dashboard/kpi-dashboard",
    icon: BarChart3,
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
    cta: "View KPIs",
  },
];

const STORAGE_KEY = "okleevo_quickstart_done";

export default function QuickStartPage() {
  const { data: session } = useSession();
  const firstName = (session?.user?.name ?? "").split(" ")[0] || "there";

  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setDone(new Set(JSON.parse(saved)));
    } catch {
      // ignore
    }
  }, []);

  const toggle = (id: string) => {
    setDone(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const completed = done.size;
  const total = STEPS.length;
  const pct = Math.round((completed / total) * 100);
  const allDone = completed === total;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Rocket className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-black text-gray-900">Quick Start</h1>
        </div>
        <p className="text-sm text-gray-500">
          Hi {firstName}! Complete these steps to get the most out of Okleevo.
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-700">
            {allDone ? "🎉 All done!" : `${completed} of ${total} complete`}
          </span>
          <span className="text-sm font-black text-indigo-600">{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        {allDone && (
          <div className="flex items-center gap-2 pt-1">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-amber-600">
              You&apos;re fully set up — your business is ready to run.
            </span>
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {STEPS.map((step, i) => {
          const isDone = done.has(step.id);
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`bg-white border rounded-2xl p-4 shadow-sm transition-all ${
                isDone ? "border-gray-100 opacity-60" : "border-gray-100 hover:border-indigo-100 hover:shadow-md"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Step number / check */}
                <button
                  onClick={() => toggle(step.id)}
                  className="mt-0.5 shrink-0 cursor-pointer"
                  aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                >
                  {isDone
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    : <Circle className="w-5 h-5 text-gray-300" />
                  }
                </button>

                {/* Icon */}
                <div className={`w-9 h-9 rounded-xl ${step.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${step.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-bold ${isDone ? "line-through text-gray-400" : "text-gray-900"}`}>
                      <span className="text-[10px] font-black text-gray-300 mr-1.5">0{i + 1}</span>
                      {step.title}
                    </p>
                  </div>
                  {!isDone && (
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.description}</p>
                  )}
                </div>
              </div>

              {/* CTA */}
              {!isDone && (
                <div className="mt-3 ml-[68px]">
                  <Link
                    href={step.href}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {step.cta}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer links */}
      <div className="flex items-center justify-between pt-2 pb-8">
        <Link href="/guide" className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors">
          <BookOpen className="w-3.5 h-3.5" />
          Full User Guide
        </Link>
        <Link href="/dashboard/collaboration" className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors">
          <MessageSquare className="w-3.5 h-3.5" />
          Ask your team
        </Link>
      </div>

    </div>
  );
}
