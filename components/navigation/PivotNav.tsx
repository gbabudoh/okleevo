"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  UsersRound, CheckSquare, FolderKanban, FileEdit, BarChart3,
  Users, Calendar, Mail, MessageSquare, PenTool, ChevronDown, Archive,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PIVOT_NAV_GROUPS, LEGACY_ONLY_MODULE_IDS, getModuleById } from '@/lib/module-catalogue';

interface ModuleUiMeta {
  href: string;
  icon: LucideIcon;
  label: string;
}

// Presentation metadata (icon/label/href) for every id that can appear in a
// pivot tab. Kept local to this component — PIVOT_NAV_GROUPS in
// lib/module-catalogue.ts owns *which* ids go in *which* tab; this only
// owns how each one is drawn.
const MODULE_UI: Record<string, ModuleUiMeta> = {
  collaboration: { href: '/dashboard/collaboration', icon: UsersRound, label: 'Team Messaging\n& Video Meeting' },
  tasks: { href: '/dashboard/tasks', icon: CheckSquare, label: 'Tasks' },
  projects: { href: '/dashboard/projects', icon: FolderKanban, label: 'Projects' },
  'ai-notes': { href: '/dashboard/ai-notes', icon: FileEdit, label: 'Notes' },
  'kpi-dashboard': { href: '/dashboard/kpi-dashboard', icon: BarChart3, label: 'KPI Dashboard' },
  crm: { href: '/dashboard/crm', icon: Users, label: 'CRM Pipeline' },
  booking: { href: '/dashboard/booking', icon: Calendar, label: 'Booking Pages' },
  mailbox: { href: '/dashboard/mailbox', icon: Mail, label: 'Mail Engine' },
  'e-signature': { href: '/dashboard/e-signature', icon: PenTool, label: 'E-Signatures' },
  campaigns: { href: '/dashboard/campaigns', icon: Mail, label: 'Campaigns' },
};

// projects is cross-module infrastructure, not a toggleable billed module —
// always shown, same convention as the legacy nav (app/dashboard/layout.tsx).
const ASYNC_PRODUCTIVITY_ALWAYS_ON = ['projects'];

interface PivotNavProps {
  finalModules: string[];
  pathname: string | null;
  unreadMailCount: number;
}

function NavItem({
  href, icon: Icon, label, active, badge,
}: {
  href: string; icon: LucideIcon; label: string; active: boolean; badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        active ? 'text-orange-700 font-semibold' : 'text-gray-600 hover:text-gray-900 font-medium'
      }`}
    >
      <span
        className={`flex items-center justify-center w-7 h-7 rounded-md shrink-0 transition-colors ${
          active ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'
        }`}
      >
        <Icon className="w-4 h-4" />
      </span>
      <span className="flex-1 text-sm leading-tight whitespace-pre-line">{label}</span>
      {Boolean(badge) && (
        <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[10px] font-bold leading-none shrink-0">
          {badge! > 99 ? '99+' : badge}
        </span>
      )}
      {active && (
        <motion.span
          layoutId="pivot-nav-active-dot"
          className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"
          transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
        />
      )}
    </Link>
  );
}

export default function PivotNav({ finalModules, pathname, unreadMailCount }: PivotNavProps) {
  const [legacyOpen, setLegacyOpen] = useState(false);

  const isModuleActive = (href: string) => pathname === href || Boolean(href !== '/dashboard' && pathname?.startsWith(href));

  const visibleLegacyIds = LEGACY_ONLY_MODULE_IDS.filter((id) => finalModules.includes(id));

  return (
    <div className="space-y-5">
      {PIVOT_NAV_GROUPS.map((group) => {
        // mailbox and collaboration are always shown regardless of
        // enabledModules — same convention as the legacy nav's "Okleevo Mail
        // Engine — always visible" treatment. Without this, a workspace
        // whose enabledModules array predates the Team & Comms modules (any
        // account created before this pivot) would have the entire Virtual
        // HQ tab silently vanish, since collaboration was never in its array.
        const ids = group.id === 'async-productivity'
          ? [...group.moduleIds.filter((id) => finalModules.includes(id)), ...ASYNC_PRODUCTIVITY_ALWAYS_ON]
          : group.moduleIds.filter((id) => id === 'mailbox' || id === 'collaboration' || finalModules.includes(id));

        if (ids.length === 0) return null;

        return (
          <div key={group.id}>
            <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{group.label}</p>
            <div className="space-y-0.5">
              {ids.map((id) => {
                const meta = MODULE_UI[id];
                if (!meta) return null;
                return (
                  <NavItem
                    key={id}
                    href={meta.href}
                    icon={meta.icon}
                    label={meta.label}
                    active={isModuleActive(meta.href)}
                    badge={id === 'mailbox' ? unreadMailCount : undefined}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {visibleLegacyIds.length > 0 && (
        <div>
          <button
            onClick={() => setLegacyOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            <span className="flex items-center gap-2">
              <Archive className="w-3.5 h-3.5" /> Legacy Tools
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${legacyOpen ? 'rotate-180' : ''}`} />
          </button>
          {legacyOpen && (
            <div className="mt-0.5 space-y-0.5">
              {visibleLegacyIds.map((id) => {
                const entry = getModuleById(id);
                if (!entry) return null;
                const href = `/dashboard/${id}`;
                return (
                  <NavItem key={id} href={href} icon={entry.icon} label={entry.label} active={isModuleActive(href)} />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
