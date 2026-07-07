import {
  Receipt, Calculator, FileText, TrendingUp,
  Users, FormInput, Calendar, MessageSquare, Mail,
  CheckSquare, FileEdit, BarChart3, Package,
  Truck, UserCheck, PenTool, Globe, Shield, Sparkles,
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
export const modules: ModuleCatalogueEntry[] = [
  // Finance Hub
  { id: 'invoicing', label: 'Invoicing', icon: Receipt, group: 'Finance Hub', color: 'from-emerald-400 to-teal-500', desc: 'Generate professional invoices, track payments, and automate reminders to get paid faster.' },
  { id: 'accounting', label: 'Accounting', icon: Calculator, group: 'Finance Hub', color: 'from-emerald-500 to-emerald-700', desc: 'Full double-entry bookkeeping with automated ledgers and financial statement generation.' },
  { id: 'taxation', label: 'Taxation', icon: FileText, group: 'Finance Hub', color: 'from-teal-400 to-emerald-600', desc: 'Simplify your tax season with automated calculations and MTD-compliant reporting.' },
  { id: 'cashflow', label: 'Cashflow', icon: TrendingUp, group: 'Finance Hub', color: 'from-cyan-500 to-blue-500', desc: 'Predictive liquidity tracking to ensure you always have the capital needed to grow.' },
  { id: 'expenses', label: 'Expenses', icon: FileText, group: 'Finance Hub', color: 'from-emerald-300 to-teal-400', desc: 'Snap receipts and categorize business spending instantly for seamless reconciliation.' },
  { id: 'vat-tools', label: 'VAT Tools', icon: Calculator, group: 'Finance Hub', color: 'from-teal-600 to-emerald-800', desc: 'Specialized tools for managing VAT returns and multi-rate tax structures.' },

  // Growth Engine
  { id: 'crm', label: 'CRM', icon: Users, group: 'Growth Engine', color: 'from-indigo-400 to-blue-500', desc: 'A centralized hub for your leads and customers. Send direct, branded emails via internal SMTP and track every interaction.' },
  { id: 'forms', label: 'Forms', icon: FormInput, group: 'Growth Engine', color: 'from-blue-400 to-indigo-600', desc: 'Drag-and-drop builder for lead intake, feedback surveys, and customer onboarding.' },
  { id: 'booking', label: 'Booking', icon: Calendar, group: 'Growth Engine', color: 'from-indigo-500 to-purple-500', desc: 'Integrated appointment scheduling that syncs directly with your team calendar.' },
  { id: 'helpdesk', label: 'Helpdesk', icon: MessageSquare, group: 'Growth Engine', color: 'from-blue-500 to-cyan-500', desc: 'Provide world-class support with a ticket system that organizes customer requests.' },
  { id: 'campaigns', label: 'Campaigns', icon: Mail, group: 'Growth Engine', color: 'from-indigo-600 to-purple-700', desc: 'Send beautiful bulk email marketing campaigns directly via the Okleevo SMTP engine with performance analytics.' },

  // Command Center
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, group: 'Command Center', color: 'from-purple-400 to-pink-500', desc: 'Collaborative project management. Assign tasks, set deadlines, and track progress in real-time.' },
  { id: 'ai-content', label: 'AI Content', icon: Sparkles, group: 'Command Center', color: 'from-pink-500 to-rose-500', desc: 'Harness AI to generate marketing copy, social posts, and product descriptions in seconds.' },
  { id: 'ai-notes', label: 'AI Notes', icon: FileEdit, group: 'Command Center', color: 'from-rose-400 to-orange-500', desc: 'Smart note-taking that automatically summarizes meetings and identifies action items.' },
  { id: 'kpi-dashboard', label: 'KPI Dashboard', icon: BarChart3, group: 'Command Center', color: 'from-purple-600 to-indigo-800', desc: 'Visual business intelligence with real-time charts showing your most important metrics.' },

  // Operations Hub
  { id: 'inventory', label: 'Inventory', icon: Package, group: 'Operations Hub', color: 'from-amber-400 to-orange-500', desc: 'Track stock levels across multiple locations with automated low-stock alerts.' },
  { id: 'suppliers', label: 'Suppliers', icon: Truck, group: 'Operations Hub', color: 'from-orange-500 to-red-600', desc: 'Manage vendor relationships, purchase orders, and supply chain logistics.' },
  { id: 'hr-records', label: 'HR Records', icon: UserCheck, group: 'Operations Hub', color: 'from-amber-500 to-yellow-600', desc: 'Securely store employee contracts, performance reviews, and sensitive documents.' },
  { id: 'e-signature', label: 'E-Signature', icon: PenTool, group: 'Operations Hub', color: 'from-orange-400 to-rose-500', desc: 'Send and sign legally binding documents electronically without leaving the platform.' },
  { id: 'micro-pages', label: 'Micro Pages', icon: Globe, group: 'Operations Hub', color: 'from-yellow-400 to-orange-500', desc: 'Create stunning mini-websites or digital business cards to showcase your offerings.' },
  { id: 'compliance', label: 'Compliance', icon: Shield, group: 'Operations Hub', color: 'from-amber-600 to-orange-700', desc: 'Keep your business protected with automated regulatory reminders and checklists.' },

  // Team & Comms
  { id: 'mailbox', label: 'Mail Engine', icon: Mail, group: 'Team & Comms', color: 'from-orange-400 to-orange-600', desc: 'Your business email, all in one place — send, receive, and organise messages with CRM context built in.' },
  { id: 'collaboration', label: 'Collaboration', icon: UsersRound, group: 'Team & Comms', color: 'from-indigo-500 to-violet-600', desc: 'Video-call and message your team without leaving Okleevo — no separate Slack or Zoom subscription, no extra login.' },
];

export const moduleGroups = ['All', 'Finance Hub', 'Growth Engine', 'Command Center', 'Operations Hub', 'Team & Comms'];

export function getModuleById(id: string): ModuleCatalogueEntry | undefined {
  return modules.find(m => m.id === id);
}
