import type { Step } from 'react-joyride';

export const taxationTourSteps: Step[] = [
  {
    target: '#tour-taxation-stats',
    title: 'Your tax position at a glance',
    content: 'Corporation Tax, VAT, PAYE & NI, and total outstanding — all calculated automatically from your real invoices, expenses, and payroll.',
    skipBeacon: true,
    placement: 'bottom',
  },
  {
    target: '#tour-taxation-disclaimer',
    title: 'Prepare, don\'t file',
    content: 'Okleevo calculates and prepares your figures, but doesn\'t submit them to HMRC directly — you or your accountant handle the actual filing.',
    placement: 'bottom',
  },
  {
    target: '#tour-taxation-tabs',
    title: 'Five tax areas, one place',
    content: 'Switch between Corporation Tax, Self Assessment, PAYE & NI, VAT, and Capital Gains — each has its own calculator and report.',
    placement: 'bottom',
  },
  {
    target: '#tour-taxation-new-return',
    title: 'Start a new return',
    content: 'Walk through a short wizard to prepare a new tax return for any of the five areas.',
    placement: 'bottom',
  },
  {
    target: '#tour-taxation-export',
    title: 'Download for your accountant',
    content: 'Export your figures as a PDF or Excel report, ready to hand off for official submission.',
    placement: 'bottom',
  },
];
