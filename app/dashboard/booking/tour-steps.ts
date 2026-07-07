import type { Step } from 'react-joyride';

export const bookingTourSteps: Step[] = [
  {
    target: '#tour-booking-new',
    title: 'Schedule an appointment',
    content: 'Create a new booking for a client — it syncs directly with your team calendar.',
    skipBeacon: true,
    placement: 'bottom',
  },
  {
    target: '#tour-booking-stats',
    title: 'Your booking pipeline',
    content: 'Total, Confirmed, Upcoming, and Completed bookings at a glance.',
    placement: 'bottom',
  },
];
