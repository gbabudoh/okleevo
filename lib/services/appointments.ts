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

/**
 * Minimal RFC 5545 .ics invite for a single appointment. Good enough for
 * every mainstream calendar client to pick up date/time/location — not a
 * full calendar integration (no recurrence, no attendee RSVP tracking).
 */
export function buildIcsInvite(appointment: Appointment, businessName: string, meetingUrl?: string): string {
  const toIcsDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const escape = (s: string) => s.replace(/[\\,;]/g, (m) => `\\${m}`).replace(/\n/g, '\\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Okleevo//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${appointment.id}@okleevo.com`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(appointment.startTime)}`,
    `DTEND:${toIcsDate(appointment.endTime)}`,
    `SUMMARY:${escape(`${appointment.title} — ${businessName}`)}`,
    ...(meetingUrl ? [`DESCRIPTION:${escape(`Join: ${meetingUrl}`)}`, `LOCATION:${escape(meetingUrl)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

/**
 * Layer 2 (zero-login guest booking-page) confirmation email: booking
 * details, the .ics invite, and the one-time 6-digit access PIN for the
 * guest video room. The PIN is passed in raw here (never stored raw — only
 * appointment.securePinHash is persisted) and sent exactly once, at the
 * moment it's generated, so the server never needs to hold or recover it
 * again later.
 */
export async function notifyGuestBookingConfirmed(
  appointment: Appointment,
  businessName: string,
  rawPin: string,
  meetingUrl: string,
) {
  const when = formatWhen(appointment.startTime);
  const html = `
    <p>Your booking for <strong>${appointment.title}</strong> with <strong>${businessName}</strong> on <strong>${when}</strong> is confirmed.</p>
    <p>Join at the scheduled time: <a href="${meetingUrl}">${meetingUrl}</a></p>
    <p>Your one-time access code: <strong style="font-size:1.25em;letter-spacing:0.15em;">${rawPin}</strong></p>
    <p>You'll be asked to enter this code when you join — no account or download required.</p>
  `;

  try {
    await sendClientEmail({
      to: appointment.clientEmail,
      subject: `Booking confirmed — ${appointment.title}`,
      html,
      businessName,
      attachments: [
        {
          filename: 'invite.ics',
          content: buildIcsInvite(appointment, businessName, meetingUrl),
          contentType: 'text/calendar; charset=utf-8; method=PUBLISH',
        },
      ],
    });
  } catch (error) {
    console.error('Failed to send guest booking confirmation email:', error);
  }
}
