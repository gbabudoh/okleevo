import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const SPAM_SUBJECT_KEYWORDS = [
  'earn money', 'make money fast', 'work from home', 'free offer', 'free gift',
  'click here', 'you have won', "you're a winner", 'congratulations you',
  'weight loss', 'lose weight', 'diet pill', 'buy now', 'limited time offer',
  'act now', 'urgent reply', 'bank transfer', 'wire transfer', 'nigerian',
  'lottery winner', 'claim your prize', '100% free', 'no credit card',
  'risk free', 'guaranteed income', 'double your', 'casino', 'viagra',
  'cheap meds', 'online pharmacy',
];

const SPAM_FROM_PATTERNS = [
  /noreply@.*\.(xyz|top|club|info|bid|loan|gdn|win|review|date|faith|racing)$/i,
  /\d{5,}@/,
];

function isSpam(from: string, subject: string, body: string): boolean {
  const subjectLower = subject.toLowerCase();
  const bodyLower = body.toLowerCase();

  if (SPAM_SUBJECT_KEYWORDS.some(k => subjectLower.includes(k) || bodyLower.includes(k))) return true;
  if (SPAM_FROM_PATTERNS.some(p => p.test(from))) return true;

  // Excessive punctuation/caps in subject
  const capsRatio = (subject.match(/[A-Z]/g) || []).length / (subject.length || 1);
  if (subject.length > 10 && capsRatio > 0.7) return true;
  if ((subject.match(/[!?$]{2,}/g) || []).length > 0) return true;

  return false;
}

/**
 * Postal Inbound Webhook Receiver
 * Route: POST /api/webhooks/postal/inbound
 *
 * Postal must be configured with a catch-all route for *@reply.okleevo.com
 * pointing to this endpoint.
 *
 * Two routing strategies (tried in order):
 *   1. reply+{uuid}@reply.okleevo.com — token set in the Reply-To header
 *      when an SME sends outbound mail. External replies hit this address and
 *      are routed directly to the correct business without a user lookup.
 *   2. Fallback: match the To address against a user email in the User table.
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const payload = data.payload || data;

    const rawTo: string     = payload.rcpt_to    || payload.to    || '';
    const from: string      = payload.mail_from   || payload.from  || '';
    const subject: string   = payload.subject     || 'No Subject';
    const messageId: string = payload.message_id  || `postal-${Date.now()}`;
    const plainBody: string = payload.plain_body  || '';
    const htmlBody: string  = payload.html_body   || '';
    const dateStr: string   = payload.timestamp
      ? new Date(payload.timestamp * 1000).toISOString()
      : new Date().toISOString();

    const attachments    = payload.attachments || [];
    const hasAttachments = attachments.length > 0;

    // ── Strategy 1: reply+{uuid}@reply.okleevo.com ────────────────────────────
    let businessId: string | null = null;

    const replyMatch = rawTo.match(/^reply\+([^@]+)@/i);
    if (replyMatch) {
      const candidateToken = replyMatch[1];
      const replyToken = await prisma.replyToken.findUnique({
        where: { token: candidateToken },
        select: { businessId: true },
      });
      if (replyToken) businessId = replyToken.businessId;
    }

    // ── Strategy 2: match To address to a user's email ────────────────────────
    if (!businessId) {
      const user = await prisma.user.findUnique({
        where: { email: rawTo.toLowerCase() },
        select: { businessId: true },
      });
      if (user?.businessId) businessId = user.businessId;
    }

    if (!businessId) {
      console.warn(`[Postal Inbound] No business matched for To: ${rawTo} — dropping.`);
      return NextResponse.json({ status: 'ignored', reason: 'No matching business' }, { status: 200 });
    }

    // ── Spam detection ────────────────────────────────────────────────────────
    const folder = isSpam(from, subject, plainBody) ? 'SPAM' : 'INBOX';

    // ── Save to MailboxMessage ────────────────────────────────────────────────
    const message = await prisma.mailboxMessage.create({
      data: {
        businessId,
        messageId,
        from,
        to: rawTo,
        subject,
        body: plainBody,
        html: htmlBody,
        date: dateStr,
        hasAttachments,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attachments: attachments as any,
        folder,
        status: 'UNREAD',
      },
    });

    console.log(`[Postal Inbound] ✅ Saved message ${message.id} → ${folder} for business ${businessId}`);
    return NextResponse.json({ status: 'success', id: message.id, folder }, { status: 200 });

  } catch (error: unknown) {
    // Idempotency: Postal redelivers on retry. If the same messageId arrives twice, treat as already-processed.
    const code = (error as { code?: string })?.code;
    if (code === 'P2002') {
      console.warn('[Postal Inbound] ⚠️ Duplicate messageId received, treating as already processed');
      return NextResponse.json({ status: 'duplicate' }, { status: 200 });
    }
    console.error('[Postal Inbound] ❌ Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
