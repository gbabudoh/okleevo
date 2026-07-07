import type { Step } from 'react-joyride';

export const invoicingTourSteps: Step[] = [
  {
    target: '#tour-invoicing-stats',
    title: 'Your invoicing at a glance',
    content: 'Track total revenue, paid, pending, and overdue invoices here — updated automatically as invoices are created and paid.',
    skipBeacon: true,
    placement: 'bottom',
  },
  {
    target: '#tour-invoicing-new-button',
    title: 'Create an invoice',
    content: 'Click here to build a new invoice with line items, a due date, and client details.',
    placement: 'bottom',
  },
  {
    target: '#tour-invoicing-search',
    title: 'Find an invoice fast',
    content: 'Search by client name or invoice ID, or use the filter to narrow the list down to a specific status.',
    placement: 'bottom',
  },
  {
    target: '#tour-invoicing-export',
    title: 'Export for your records',
    content: 'Download your invoice list as a PDF or CSV — handy for bookkeeping or sharing with your accountant.',
    placement: 'bottom',
  },
];
