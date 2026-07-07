import type { Step } from 'react-joyride';

export const expensesTourSteps: Step[] = [
  {
    target: '#tour-expenses-stats',
    title: 'Your spending at a glance',
    content: 'Total spent, average per item, category count, and your top spending category — all calculated from your recorded expenses.',
    skipBeacon: true,
    placement: 'bottom',
  },
  {
    target: '#tour-expenses-add-button',
    title: 'Log an expense',
    content: 'Add a new expense here — you can attach a receipt photo or PDF, set the category, and even link it to a project.',
    placement: 'bottom',
  },
  {
    target: '#tour-expenses-search',
    title: 'Search and filter',
    content: 'Search by title, or filter the list down to a specific spending category.',
    placement: 'bottom',
  },
];
