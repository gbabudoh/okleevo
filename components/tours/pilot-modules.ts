// Modules that currently have a coach-mark tour defined. Extend as more
// modules get their own tour-steps.ts file.
export const TOUR_MODULE_IDS = [
  'invoicing', 'taxation', 'crm', 'expenses', 'helpdesk',
  'accounting', 'cashflow', 'vat-tools', 'campaigns', 'collaboration', 'mailbox',
] as const;

export function moduleHasTour(moduleId: string | null | undefined): boolean {
  return !!moduleId && (TOUR_MODULE_IDS as readonly string[]).includes(moduleId);
}
