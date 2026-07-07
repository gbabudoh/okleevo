import type { Step } from 'react-joyride';

export const vatToolsTourSteps: Step[] = [
  {
    target: '#tour-vat-tools-stats',
    title: 'Your VAT calculation history',
    content: 'Total calculations, cumulative VAT, average VAT, and your currently applied rate — all from calculations you\'ve run in this session.',
    skipBeacon: true,
    placement: 'bottom',
  },
  {
    target: '#tour-vat-tools-calculator',
    title: 'Add or remove VAT',
    content: 'Switch between Add VAT (from a net amount) and Remove VAT (from a gross amount), pick a rate, and hit Calculate.',
    placement: 'right',
  },
  {
    target: '#tour-vat-tools-rates',
    title: 'Quick-reference UK VAT rates',
    content: 'Click any rate card to apply it directly to the calculator — Standard (20%), Reduced (5%), or Zero (0%).',
    placement: 'top',
  },
];
