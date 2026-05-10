import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Postal Inbound Webhook Receiver
 * Route: POST /api/webhooks/postal/inbound
 * 
 * This endpoint receives incoming emails from your self-hosted Postal server
 * and saves them directly into the Okleevo Mailbox database.
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Postal wraps data in a 'payload' object depending on the event type,
    // but sometimes sends direct payload for HTTP routes.
    const payload = data.payload || data;

    // Extract core email fields from Postal's payload
    const to = payload.rcpt_to || payload.to || '';
    const from = payload.mail_from || payload.from || '';
    const subject = payload.subject || 'No Subject';
    const messageId = payload.message_id || `postal-${Date.now()}`;
    const plainBody = payload.plain_body || '';
    const htmlBody = payload.html_body || '';
    
    // Fallback date
    const dateStr = payload.timestamp ? new Date(payload.timestamp * 1000).toISOString() : new Date().toISOString();

    // 1. Identify the SME Business based on the "To" address
    // We look up the User table to find which business this email belongs to.
    const user = await prisma.user.findUnique({
      where: { email: to },
      select: { businessId: true }
    });

    if (!user || !user.businessId) {
      console.warn(`[Postal Webhook] Incoming email to ${to} rejected: No matching user/business found.`);
      // Return 200 so Postal doesn't keep retrying, even if we drop it.
      return NextResponse.json({ status: 'ignored', reason: 'User not found' }, { status: 200 });
    }

    // 2. Parse attachments if any (Postal provides an array of attachments)
    const attachments = payload.attachments || [];
    const hasAttachments = attachments.length > 0;

    // 3. Save the email into the MailboxMessage table
    const message = await prisma.mailboxMessage.create({
      data: {
        businessId: user.businessId,
        messageId: messageId,
        uid: Date.now(), // Generate a fake UID for IMAP compatibility layer
        from: from,
        to: to,
        subject: subject,
        body: plainBody,
        html: htmlBody,
        date: dateStr,
        hasAttachments: hasAttachments,
        // Store raw attachment metadata if needed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attachments: attachments as any,
        folder: 'INBOX',
        status: 'UNREAD'
      }
    });

    console.log(`[Postal Webhook] ✅ Email received and saved for business ${user.businessId}`);

    return NextResponse.json({ status: 'success', id: message.id }, { status: 200 });
  } catch (error) {
    console.error('[Postal Webhook] ❌ Error processing inbound email:', error);
    // Return 500 so Postal knows it failed and can retry if configured
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
