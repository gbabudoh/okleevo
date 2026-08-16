import { prisma } from '@/lib/prisma';
import { sendClientEmail } from '@/lib/services/email';
import type { Appointment } from '@/lib/prisma-client';

/**
 * Appointment start/end times are stored as plain local-wall-clock Dates
 * (parsed from "YYYY-MM-DDTHH:mm" with no timezone suffix — see the POST
 * handler). Reconstructing a date/time pair from an existing Date must use
 * these same local getters, not toISOString()/toLocaleTimeString() — the
 * former shifts by timezone offset, the latter isn't reliably zero-padded
 * or 24h, both of which previously caused edits to silently corrupt the
 * stored time.
 */
export function toLocalDateParts(d: Date): { date: string; time: string } {
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { date, time };
}

/**
 * Finds an existing, non-cancelled appointment for this business whose
 * [startTime, endTime) range overlaps the given range. Pass excludeId when
 * checking an edit, so an appointment doesn't conflict with itself.
 */
export async function findConflictingAppointment(
  businessId: string,
  startTime: Date,
  endTime: Date,
  excludeId?: string,
): Promise<Appointment | null> {
  return prisma.appointment.findFirst({
    where: {
      businessId,
      status: { not: 'CANCELLED' },
      ...(excludeId && { id: { not: excludeId } }),
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });
}

const formatWhen = (start: Date) => {
  const { date, time } = toLocalDateParts(start);
  return `${new Date(`${date}T00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at ${time}`;
};

/**
 * Best-effort client notification for a booking's current state. Failures
 * are swallowed (same pattern as Forms' webhook forwarding) — a missing
 * SMTP config or a bad send must never block the booking itself.
 */
export async function notifyAppointmentStatus(
  appointment: Appointment,
  businessName: string,
  kind: 'received' | 'confirmed' | 'cancelled',
) {
  const when = formatWhen(appointment.startTime);
  const subjects = {
    received: `Booking request received — ${appointment.title}`,
    confirmed: `Booking confirmed — ${appointment.title}`,
    cancelled: `Booking cancelled — ${appointment.title}`,
  };
  const bodies = {
    received: `<p>Thanks — we've received your request for <strong>${appointment.title}</strong> on <strong>${when}</strong>.</p><p>We'll confirm shortly.</p>`,
    confirmed: `<p>Your booking for <strong>${appointment.title}</strong> on <strong>${when}</strong> is confirmed.</p>${appointment.location ? `<p>Location: ${appointment.location}</p>` : ''}`,
    cancelled: `<p>Your booking for <strong>${appointment.title}</strong> on <strong>${when}</strong> has been cancelled.</p>`,
  };

  try {
    await sendClientEmail({
      to: appointment.clientEmail,
      subject: subjects[kind],
      html: bodies[kind],
      businessName,
    });
  } catch (error) {
    console.error(`Failed to send ${kind} appointment email:`, error);
  }
}
