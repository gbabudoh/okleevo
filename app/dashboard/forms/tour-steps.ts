import type { Step } from 'react-joyride';

export const formsTourSteps: Step[] = [
  {
    target: '#tour-forms-create',
    title: 'Build a form',
    content: 'Create a drag-and-drop form for lead intake, feedback, or customer onboarding.',
    skipBeacon: true,
    placement: 'bottom',
  },
  {
    target: '#tour-forms-stats',
    title: 'Track responses',
    content: 'See how many forms you have, how many are active, and how many responses they\'ve collected.',
    placement: 'bottom',
  },
];
