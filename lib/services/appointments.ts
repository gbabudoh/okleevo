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
function getAppBaseUrl(): string {
  if (process.env.NODE_ENV === 'development') {
    return (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
  }
  return (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://okleevo.com').replace(/\/$/, '');
}

export async function notifyAppointmentStatus(
  appointment: Appointment,
  businessName: string,
  kind: 'received' | 'confirmed' | 'cancelled',
  rawPin?: string,
) {
  const when = formatWhen(appointment.startTime);
  const appUrl = getAppBaseUrl();
  const meetingUrl = appointment.type === 'VIDEO' ? `${appUrl}/room/${appointment.id}` : undefined;

  const subjects = {
    received: `Booking request received — ${appointment.title}`,
    confirmed: `Booking confirmed — ${appointment.title}`,
    cancelled: `Booking cancelled — ${appointment.title}`,
  };

  const pinBlockHtml = rawPin ? `
    <div style="background-color: #fff7ed; border: 2px solid #fdba74; border-radius: 16px; padding: 18px 16px; text-align: center; margin: 16px 0;">
      <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 800; color: #ea580c; text-transform: uppercase; letter-spacing: 1px;">Your 6-Digit Meeting PIN</p>
      <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #ea580c; display: block; line-height: 1.1;">${rawPin}</span>
      <p style="margin: 8px 0 0 0; font-size: 11px; color: #78716c;">Enter this 6-digit code when joining the video room.</p>
    </div>
  ` : '';

  const videoButtonHtml = meetingUrl ? `
    <div style="margin: 20px 0; padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; text-align: center;">
      <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #1e293b;">Join Your Video Call:</p>
      <a href="${meetingUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #f97316, #ea580c); color: #ffffff; text-decoration: none; font-weight: 700; border-radius: 12px; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.2);">🎥 Join Video Meeting</a>
      ${pinBlockHtml}
      <p style="margin: 12px 0 0 0; font-size: 11px; color: #64748b;">No account or software installation required. Direct in-browser encrypted call.</p>
    </div>
  ` : '';

  const bodies = {
    received: `
      <p>Thanks — we've received your request for <strong>${appointment.title}</strong> with <strong>${businessName}</strong> on <strong>${when}</strong>.</p>
      ${videoButtonHtml}
      <p style="font-size: 13px; color: #64748b;">We look forward to speaking with you!</p>
    `,
    confirmed: `
      <p>Your booking for <strong>${appointment.title}</strong> with <strong>${businessName}</strong> on <strong>${when}</strong> is confirmed.</p>
      ${videoButtonHtml}
      ${appointment.location ? `<p style="margin-top: 12px; font-size: 13px; color: #475569;"><strong>Location:</strong> ${appointment.location}</p>` : ''}
      <p style="margin-top: 16px; font-size: 12px; color: #94a3b8;">A calendar invite (.ics) is attached to add this meeting directly to your Google, Outlook, or Apple Calendar.</p>
    `,
    cancelled: `
      <p>Your booking for <strong>${appointment.title}</strong> on <strong>${when}</strong> has been cancelled.</p>
    `,
  };

  try {
    await sendClientEmail({
      to: appointment.clientEmail,
      subject: subjects[kind],
      html: bodies[kind],
      businessName,
      ...(kind === 'confirmed' ? {
        attachments: [
          {
            filename: 'invite.ics',
            content: buildIcsInvite(appointment, businessName, meetingUrl),
            contentType: 'text/calendar; charset=utf-8; method=PUBLISH',
          },
        ],
      } : {}),
    });
  } catch (error) {
    console.error(`Failed to send ${kind} appointment email:`, error);
  }
}

/**
 * Notifies the SME Host (Business Owner / Staff) when a new client
 * booking is made, providing client details, meeting room link, and agenda.
 */
export async function notifyHostNewAppointment(options: {
  appointment: Appointment;
  businessName: string;
  hostEmail: string;
  hostName: string;
}) {
  const { appointment, businessName, hostEmail, hostName } = options;
  const when = formatWhen(appointment.startTime);
  const appUrl = getAppBaseUrl();
  const meetingUrl = appointment.type === 'VIDEO' ? `${appUrl}/room/${appointment.id}` : undefined;
  const dashboardUrl = `${appUrl}/dashboard/booking`;

  const videoButtonHtml = meetingUrl ? `
    <div style="margin: 20px 0; padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; text-align: center;">
      <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #1e293b;">Host Video Room:</p>
      <a href="${meetingUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #f97316, #ea580c); color: #ffffff; text-decoration: none; font-weight: 700; border-radius: 12px; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.2);">🎥 Open Host Meeting Room</a>
      <p style="margin: 12px 0 0 0; font-size: 11px; color: #64748b;">You will join automatically authenticated as Host (no PIN required).</p>
    </div>
  ` : '';

  const html = `
    <p>Hi ${hostName},</p>
    <p>You have a new client booking for <strong>${appointment.title}</strong> on <strong>${when}</strong>.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; margin: 16px 0;">
      <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Client Information</p>
      <p style="margin: 0 0 4px 0; font-size: 14px; color: #1e293b;"><strong>Name:</strong> ${appointment.clientName}</p>
      <p style="margin: 0 0 4px 0; font-size: 14px; color: #1e293b;"><strong>Email:</strong> <a href="mailto:${appointment.clientEmail}">${appointment.clientEmail}</a></p>
      ${appointment.clientPhone ? `<p style="margin: 0 0 4px 0; font-size: 14px; color: #1e293b;"><strong>Phone:</strong> ${appointment.clientPhone}</p>` : ''}
      ${appointment.description ? `<p style="margin: 8px 0 0 0; font-size: 13px; color: #475569;"><strong>Notes:</strong> ${appointment.description}</p>` : ''}
    </div>

    ${videoButtonHtml}

    <p style="margin-top: 16px; font-size: 12px; color: #64748b;">
      <a href="${dashboardUrl}" style="color: #ea580c; text-decoration: underline; font-weight: 600;">Manage bookings in your Okleevo Dashboard</a>
    </p>
  `;

  try {
    await sendClientEmail({
      to: hostEmail,
      subject: `New Booking: ${appointment.clientName} — ${appointment.title}`,
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
    console.error('Failed to send host new appointment email:', error);
  }
}

/**
 * Dispatches an automated meeting reminder before an appointment starts
 * (e.g. 24 hours prior or 15 minutes prior).
 */
export async function sendAppointmentReminderEmail(options: {
  appointment: Appointment;
  businessName: string;
  recipientEmail: string;
  recipientName: string;
  isHost?: boolean;
  timeframeText: string; // e.g. "in 15 minutes" or "tomorrow"
}) {
  const { appointment, businessName, recipientEmail, recipientName, isHost = false, timeframeText } = options;
  const when = formatWhen(appointment.startTime);
  const appUrl = getAppBaseUrl();
  const meetingUrl = appointment.type === 'VIDEO' ? `${appUrl}/room/${appointment.id}` : undefined;

  const subject = `Reminder: ${appointment.title} with ${businessName} starts ${timeframeText}`;

  const videoButtonHtml = meetingUrl ? `
    <div style="margin: 20px 0; padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; text-align: center;">
      <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #1e293b;">${isHost ? 'Host Meeting Room:' : 'Join Video Meeting:'}</p>
      <a href="${meetingUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #f97316, #ea580c); color: #ffffff; text-decoration: none; font-weight: 700; border-radius: 12px; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.2);">🎥 ${isHost ? 'Open Host Room' : 'Join Call'}</a>
      ${!isHost ? `<p style="margin: 12px 0 0 0; font-size: 12px; color: #64748b;">Check your booking confirmation email for your 6-digit access PIN.</p>` : ''}
    </div>
  ` : '';

  const html = `
    <p>Hi ${recipientName},</p>
    <p>This is a quick reminder that your appointment <strong>${appointment.title}</strong> with <strong>${businessName}</strong> is scheduled for <strong>${when}</strong> (${timeframeText}).</p>
    ${videoButtonHtml}
    ${appointment.location ? `<p style="margin-top: 12px; font-size: 13px; color: #475569;"><strong>Location:</strong> ${appointment.location}</p>` : ''}
    <p style="margin-top: 16px; font-size: 12px; color: #94a3b8;">See you soon!</p>
  `;

  try {
    await sendClientEmail({
      to: recipientEmail,
      subject,
      html,
      businessName,
    });
  } catch (error) {
    console.error('Failed to send appointment reminder email:', error);
  }
}

/**
 * Minimal RFC 5545 .ics invite for a single appointment.
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
 * Layer 2 (zero-login guest booking-page) confirmation email.
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
    <div style="background-color: #fff7ed; border: 2px solid #fdba74; border-radius: 16px; padding: 18px 16px; text-align: center; margin: 16px 0;">
      <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 800; color: #ea580c; text-transform: uppercase; letter-spacing: 1px;">Your 6-Digit Access PIN</p>
      <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #ea580c; display: block; line-height: 1.1;">${rawPin}</span>
      <p style="margin: 8px 0 0 0; font-size: 11px; color: #78716c;">Enter this code when you join — no account or download required.</p>
    </div>
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
