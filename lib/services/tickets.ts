import { sendClientEmail } from '@/lib/services/email';
import type { Ticket } from '@/lib/prisma-client';

/**
 * Best-effort customer notification for a helpdesk ticket. Failures are
 * swallowed (same pattern as appointments/webhooks elsewhere) — a missing
 * SMTP config or a bad send must never block the ticket action itself.
 */
export async function notifyTicketEvent(
  ticket: Ticket,
  businessName: string,
  kind: 'received' | 'replied' | 'resolved',
  replyContent?: string,
) {
  const subjects = {
    received: `We've received your request: ${ticket.subject}`,
    replied: `New reply on your request: ${ticket.subject}`,
    resolved: `Your request has been resolved: ${ticket.subject}`,
  };
  const bodies = {
    received: `<p>Thanks for reaching out — we've logged your request <strong>"${ticket.subject}"</strong> and will get back to you shortly.</p><p>Reference: ${ticket.id.slice(-6).toUpperCase()}</p>`,
    replied: `<p>You have a new reply on <strong>"${ticket.subject}"</strong>:</p><blockquote style="margin:12px 0;padding:12px 16px;background:#f9fafb;border-left:3px solid #6366f1;">${(replyContent || '').replace(/\n/g, '<br/>')}</blockquote>`,
    resolved: `<p>Your request <strong>"${ticket.subject}"</strong> has been marked as resolved.</p><p>If this doesn't fully address your issue, just reply to let us know and we'll reopen it.</p>`,
  };

  try {
    await sendClientEmail({
      to: ticket.customerEmail,
      subject: subjects[kind],
      html: bodies[kind],
      businessName,
    });
  } catch (error) {
    console.error(`Failed to send ${kind} ticket email:`, error);
  }
}
