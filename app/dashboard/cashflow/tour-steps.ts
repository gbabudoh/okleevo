import type { Step } from 'react-joyride';

export const cashflowTourSteps: Step[] = [
  {
    target: '#tour-cashflow-new-entry',
    title: 'Log income or an expense',
    content: 'Add a quick income or expense entry here — income is recorded as a paid invoice, and expenses go straight into your Expenses records.',
    skipBeacon: true,
    placement: 'bottom',
  },
  {
    target: '#tour-cashflow-time-range',
    title: 'Change your time range',
    content: 'Switch between week, month, quarter, and year to see your cashflow trends over different periods.',
    placement: 'bottom',
  },
  {
    target: '#tour-cashflow-insights',
    title: 'Key financial health metrics',
    content: 'Cash Runway, Savings Rate, and Burn Rate give you a quick read on how healthy your cashflow is right now.',
    placement: 'top',
  },
];
