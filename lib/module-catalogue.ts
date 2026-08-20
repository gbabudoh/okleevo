import {
  Users, Calendar, MessageSquare, Mail,
  CheckSquare, FolderKanban, FileEdit, BarChart3, PenTool,
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
  features?: string[];
  route?: string;
}

// Single source of truth for the platform's module list — shared by the public
// marketing catalogue (app/guide) and the in-app guides (app/dashboard/guides).
export const modules: ModuleCatalogueEntry[] = [
  // Virtual HQ
  {
    id: 'collaboration',
    label: 'Team Chat & Huddles',
    icon: UsersRound,
    group: 'Virtual HQ',
    color: 'from-orange-500 to-amber-600',
    desc: 'Instant WebRTC audio/video huddles, screen sharing, and persistent team messaging without separate Slack or Zoom licenses.',
    features: ['WebRTC Video Calls', 'Multi-channel Chat', 'Live Presence'],
    route: '/dashboard/collaboration',
  },

  // Async Productivity
  {
    id: 'tasks',
    label: 'Tasks',
    icon: CheckSquare,
    group: 'Async Productivity',
    color: 'from-orange-500 to-amber-600',
    desc: 'Collaborative task and sprint tracking with real-time assignment, deadline SLAs, and checklist execution.',
    features: ['Kanban Board', 'Due Date Alerts', 'Subtasks'],
    route: '/dashboard/tasks',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: FolderKanban,
    group: 'Async Productivity',
    color: 'from-orange-500 to-amber-600',
    desc: 'Cross-module project spaces unifying client deliverables, milestones, team roadmaps, and assets.',
    features: ['Milestone Tracking', 'Asset Vault', 'Team Roadmaps'],
    route: '/dashboard/projects',
  },
  {
    id: 'ai-notes',
    label: 'AI Notes',
    icon: FileEdit,
    group: 'Async Productivity',
    color: 'from-orange-500 to-amber-600',
    desc: 'Collaborative note-taking with automated executive summaries, action item extraction, and team brainstorm scratchpads.',
    features: ['Smart Summaries', 'Action Items', 'Scratchpad'],
    route: '/dashboard/ai-notes',
  },
  {
    id: 'kpi-dashboard',
    label: 'KPI Dashboard',
    icon: BarChart3,
    group: 'Async Productivity',
    color: 'from-orange-500 to-amber-600',
    desc: 'Executive business intelligence with live target variance tracking, velocity sparklines, and OKR scorecards.',
    features: ['Target Variance', '7-Day Sparklines', 'OKR Matrix'],
    route: '/dashboard/kpi-dashboard',
  },

  // Client Engagement
  {
    id: 'crm',
    label: 'CRM Pipeline',
    icon: Users,
    group: 'Client Engagement',
    color: 'from-orange-500 to-amber-600',
    desc: 'Centralized relationship management to track client pipelines, lifecycle stages, deal values, and communication histories.',
    features: ['Deal Stages', 'Client Histories', 'Custom Fields'],
    route: '/dashboard/crm',
  },
  {
    id: 'booking',
    label: 'Booking Pages',
    icon: Calendar,
    group: 'Client Engagement',
    color: 'from-orange-500 to-amber-600',
    desc: 'Zero-login public appointment scheduling that auto-syncs with team availability and feeds leads directly into CRM.',
    features: ['Public Booking Links', 'Calendar Sync', 'Intake Questions'],
    route: '/dashboard/booking',
  },
  {
    id: 'mailbox',
    label: 'Mail Engine',
    icon: Mail,
    group: 'Client Engagement',
    color: 'from-orange-500 to-amber-600',
    desc: 'Dedicated enterprise business email client with internal SMTP dispatch, folder routing, and CRM context overlays.',
    features: ['Native SMTP Engine', 'CRM Context', 'Labels & Folders'],
    route: '/dashboard/mailbox',
  },
  {
    id: 'helpdesk',
    label: 'Helpdesk',
    icon: MessageSquare,
    group: 'Client Engagement',
    color: 'from-orange-500 to-amber-600',
    desc: 'Multi-agent customer support ticket desk with priority routing, internal notes, and resolution telemetry.',
    features: ['Ticket Queue', 'Priority Triage', 'SLA Response Tracking'],
    route: '/dashboard/helpdesk',
  },
  {
    id: 'e-signature',
    label: 'E-Signatures',
    icon: PenTool,
    group: 'Client Engagement',
    color: 'from-orange-500 to-amber-600',
    desc: 'Legally binding eIDAS & ESIGN electronic document execution with cryptographic SHA-256 audit certificates.',
    features: ['SHA-256 Audit Trail', 'Sequential Routing', 'PDF Template Studio'],
    route: '/dashboard/e-signature',
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    icon: Mail,
    group: 'Client Engagement',
    color: 'from-orange-500 to-amber-600',
    desc: 'Broadcast bulk email marketing campaigns with open/click analytics delivered directly through Okleevo infrastructure.',
    features: ['Broadcast Dispatch', 'Engagement Analytics', 'Audience Segments'],
    route: '/dashboard/campaigns',
  },
];

export const moduleGroups = ['All', 'Virtual HQ', 'Async Productivity', 'Client Engagement'];

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
