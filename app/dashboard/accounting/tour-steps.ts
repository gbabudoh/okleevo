import type { Step } from 'react-joyride';

export const accountingTourSteps: Step[] = [
  {
    target: '#tour-accounting-tabs',
    title: 'Full double-entry bookkeeping',
    content: 'Switch between Overview, Chart of Accounts, Journal, Trial Balance, Reports, and Year-End — everything you need for proper books.',
    skipBeacon: true,
    placement: 'bottom',
  },
  {
    target: '#tour-accounting-new-entry',
    title: 'Record a journal entry',
    content: 'Create a new journal entry here. If you haven\'t set up your Chart of Accounts yet, you\'ll be prompted to initialize the default one first.',
    placement: 'bottom',
  },
  {
    target: '#tour-accounting-export',
    title: 'Export your books',
    content: 'Download your accounting records for your own files or to share with your accountant.',
    placement: 'bottom',
  },
];
