import {
  Users, Calendar, MessageSquare, Mail,
  CheckSquare, FileEdit, BarChart3, PenTool,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ModuleCatalogueEntry {
  id: string;
  label: string;
  icon: LucideIcon;
  group: string;
  color: string;
  desc: string;
}

// Single source of truth for the platform's module list — shared by the public
// marketing catalogue (app/guide) and the in-app guides (app/dashboard/guides).
//
// Global pivot cleanup: Invoicing, Accounting, Taxation, Cashflow, Expenses,
// VAT Tools, Inventory, Suppliers, Micro Pages, Compliance, HR Records, AI
// Content, and Forms have been retired from the product entirely (no nav
// entry, route blocked in proxy.ts) — none of them fit the Virtual HQ /
// Async Productivity / Client Engagement positioning. AI Content was a
// generic marketing-copy generator with no tie to any pillar (AI Notes —
// meeting transcription/summaries/action items — is the retained AI story);
// Forms was never named in the pivot spec and is functionally redundant
// with the booking page's own guest-intake flow, which already captures
// name/email/file straight into the CRM pipeline.
// Existing customer data in these modules is untouched in the database;
// this only removes them from the catalogue that drives navigation and the
// Settings module toggle.
export const modules: ModuleCatalogueEntry[] = [
  // Growth Engine
  { id: 'crm', label: 'CRM', icon: Users, group: 'Growth Engine', color: 'from-indigo-400 to-blue-500', desc: 'A centralized hub for your leads and customers. Send direct, branded emails via internal SMTP and track every interaction.' },
  { id: 'booking', label: 'Booking', icon: Calendar, group: 'Growth Engine', color: 'from-indigo-500 to-purple-500', desc: 'Integrated appointment scheduling that syncs directly with your team calendar.' },
  { id: 'helpdesk', label: 'Helpdesk', icon: MessageSquare, group: 'Growth Engine', color: 'from-blue-500 to-cyan-500', desc: 'Provide world-class support with a ticket system that organizes customer requests.' },
  { id: 'campaigns', label: 'Campaigns', icon: Mail, group: 'Growth Engine', color: 'from-indigo-600 to-purple-700', desc: 'Send beautiful bulk email marketing campaigns directly via the Okleevo SMTP engine with performance analytics.' },

  // Command Center
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, group: 'Command Center', color: 'from-purple-400 to-pink-500', desc: 'Collaborative project management. Assign tasks, set deadlines, and track progress in real-time.' },
  { id: 'ai-notes', label: 'AI Notes', icon: FileEdit, group: 'Command Center', color: 'from-rose-400 to-orange-500', desc: 'Smart note-taking that automatically summarizes meetings and identifies action items.' },
  { id: 'kpi-dashboard', label: 'KPI Dashboard', icon: BarChart3, group: 'Command Center', color: 'from-purple-600 to-indigo-800', desc: 'Visual business intelligence with real-time charts showing your most important metrics.' },

  // Operations Hub
  { id: 'e-signature', label: 'E-Signature', icon: PenTool, group: 'Operations Hub', color: 'from-orange-400 to-rose-500', desc: 'Send and sign legally binding documents electronically without leaving the platform.' },

  // Team & Comms
  { id: 'mailbox', label: 'Mail Engine', icon: Mail, group: 'Team & Comms', color: 'from-orange-400 to-orange-600', desc: 'Your business email, all in one place — send, receive, and organise messages with CRM context built in.' },
  { id: 'collaboration', label: 'Collaboration', icon: UsersRound, group: 'Team & Comms', color: 'from-indigo-500 to-violet-600', desc: 'Video-call and message your team without leaving Okleevo — no separate Slack or Zoom subscription, no extra login.' },
];

export const moduleGroups = ['All', 'Growth Engine', 'Command Center', 'Operations Hub', 'Team & Comms'];

export function getModuleById(id: string): ModuleCatalogueEntry | undefined {
  return modules.find(m => m.id === id);
}

// =============================================================================
// Global pivot: 3-tab nav grouping (Business.pivotNavEnabled)
// =============================================================================
// Single source of truth for which existing module ids appear under each of
// the pivot's 3 nav tabs — see app/dashboard/layout.tsx and
// components/navigation/PivotNav.tsx, which render this. The legacy grouping
// (`modules`/`moduleGroups` above) is untouched; this is an additive second
// grouping over the same module ids, not a replacement.
export type PivotNavGroupId = 'virtual-hq' | 'async-productivity' | 'client-engagement';

export interface PivotNavGroup {
  id: PivotNavGroupId;
  label: string;
  moduleIds: string[];
}

export const PIVOT_NAV_GROUPS: PivotNavGroup[] = [
  { id: 'virtual-hq', label: 'Virtual HQ', moduleIds: ['collaboration'] },
  { id: 'async-productivity', label: 'Async Productivity', moduleIds: ['tasks', 'ai-notes', 'kpi-dashboard'] },
  { id: 'client-engagement', label: 'Client Engagement', moduleIds: ['crm', 'booking', 'mailbox', 'helpdesk', 'e-signature', 'campaigns'] },
];

// Every module id that appears in *some* pivot tab.
export const PIVOT_NAV_MODULE_IDS = PIVOT_NAV_GROUPS.flatMap(g => g.moduleIds);

// Modules that exist under the legacy nav but have no home in the pivot's 3
// tabs — surfaced instead via a single "Legacy Tools" link. Empty now that
// every retained module has a pillar (see PIVOT_NAV_GROUPS above) — kept as
// a live computation, not deleted, so it self-populates correctly if a
// future module is added to `modules` without a pillar assignment.
export const LEGACY_ONLY_MODULE_IDS = modules
  .map(m => m.id)
  .filter(id => !PIVOT_NAV_MODULE_IDS.includes(id));
