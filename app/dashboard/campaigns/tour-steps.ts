import type { Step } from 'react-joyride';

export const campaignsTourSteps: Step[] = [
  {
    target: '#tour-campaigns-stats',
    title: 'Mail Engine Metrics',
    content: 'Track total campaigns sent, delivery rates, open rates, and click engagement.',
    skipBeacon: true,
  },
  {
    target: '#tour-campaigns-new-button',
    title: 'Create Email Campaign',
    content: 'Compose new broadcast campaigns, select audience lists, and schedule delivery.',
    skipBeacon: true,
  },
  {
    target: '#tour-campaigns-list',
    title: 'Campaign Performance',
    content: 'View past campaign results, open counts, click-through rates, and recipient details.',
    skipBeacon: true,
  },
];
