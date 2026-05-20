import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Postal Inbound Webhook Receiver
 * Route: POST /api/webhooks/postal/inbound
 *
 * Postal must be configured with a catch-all route for *@reply.okleevo.com
 * pointing to this endpoint.
 *
 * Two routing strategies (tried in order):
 *   1. reply+{businessId}@reply.okleevo.com — token set in the Reply-To header
 *      when an SME sends outbound mail. External replies hit this address and
 *      are routed directly to the correct business without a user lookup.
 *   2. Fallback: match the To address against a user email in the User table.
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const payload = data.payload || data;

    const rawTo: string   = payload.rcpt_to   || payload.to    || '';
    const from: string    = payload.mail_from  || payload.from  || '';
    const subject: string = payload.subject    || 'No Subject';
    const messageId: string = payload.message_id || `postal-${Date.now()}`;
    const plainBody: string = payload.plain_body || '';
    const htmlBody: string  = payload.html_body  || '';
    const dateStr: string   = payload.timestamp
      ? new Date(payload.timestamp * 1000).toISOString()
      : new Date().toISOString();

    const attachments     = payload.attachments || [];
    const hasAttachments  = attachments.length > 0;

    // ── Strategy 1: reply+{uuid}@reply.okleevo.com ────────────────────────────
    let businessId: string | null = null;

    const replyMatch = rawTo.match(/^reply\+([^@]+)@/i);
    if (replyMatch) {
      const candidateToken = replyMatch[1];
      const replyToken = await prisma.replyToken.findUnique({
        where: { token: candidateToken },
        select: { businessId: true },
      });
      if (replyToken) {
        businessId = replyToken.businessId;
      }
    }

    // ── Strategy 2: match To address to a user's email (legacy / direct sends) ─
    if (!businessId) {
      const user = await prisma.user.findUnique({
        where: { email: rawTo.toLowerCase() },
        select: { businessId: true },
      });
      if (user?.businessId) {
        businessId = user.businessId;
      }
    }

    if (!businessId) {
      console.warn(`[Postal Inbound] No business matched for To: ${rawTo} — dropping.`);
      return NextResponse.json({ status: 'ignored', reason: 'No matching business' }, { status: 200 });
    }

    // ── Save to MailboxMessage (INBOX) ─────────────────────────────────────────
    const message = await prisma.mailboxMessage.create({
      data: {
        businessId,
        messageId,
        uid: Date.now(),
        from,
        to: rawTo,
        subject,
        body: plainBody,
        html: htmlBody,
        date: dateStr,
        hasAttachments,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attachments: attachments as any,
        folder: 'INBOX',
        status: 'UNREAD',
      },
    });

    console.log(`[Postal Inbound] ✅ Saved message ${message.id} for business ${businessId}`);
    return NextResponse.json({ status: 'success', id: message.id }, { status: 200 });

  } catch (error) {
    console.error('[Postal Inbound] ❌ Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
