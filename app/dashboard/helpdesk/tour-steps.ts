import type { Step } from 'react-joyride';

export const helpdeskTourSteps: Step[] = [
  {
    target: '#tour-helpdesk-stats',
    title: 'Your ticket queue at a glance',
    content: 'Total, Open, Active, and Resolved ticket counts — updated automatically as you and your team work through requests.',
    skipBeacon: true,
    placement: 'bottom',
  },
  {
    target: '#tour-helpdesk-new-button',
    title: 'Log a support request',
    content: 'Create a new ticket with a priority and category. Try the AI Assist button on the description field to tidy up the wording.',
    placement: 'bottom',
  },
  {
    target: '#tour-helpdesk-search',
    title: 'Find a ticket fast',
    content: 'Search by subject, customer name, or email to jump straight to the ticket you need.',
    placement: 'bottom',
  },
];
