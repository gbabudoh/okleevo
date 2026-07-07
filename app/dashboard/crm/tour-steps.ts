import type { Step } from 'react-joyride';

export const crmTourSteps: Step[] = [
  {
    target: '#tour-crm-stats',
    title: 'Your relationships at a glance',
    content: 'See your total client count, active clients, new leads, and lifetime revenue — all updated automatically.',
    skipBeacon: true,
    placement: 'bottom',
  },
  {
    target: '#tour-crm-add-button',
    title: 'Add a new contact',
    content: 'Click here to add a lead or client with their details and starting pipeline stage.',
    placement: 'bottom',
  },
  {
    target: '#tour-crm-search',
    title: 'Find and organise contacts',
    content: 'Search by name or company, filter by status, and switch between grid and list views.',
    placement: 'bottom',
  },
];
