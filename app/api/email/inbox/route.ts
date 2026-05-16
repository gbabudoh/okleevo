import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

// Inbound emails arrive via POST /api/webhooks/postal/inbound (Postal HTTP Route).
// This endpoint simply reads what's in the database — no IMAP polling needed.
export const GET = withMultiTenancy(async (_req, { user }) => {
  try {
    const messages = await prisma.mailboxMessage.findMany({
      where: { businessId: user.businessId },
      orderBy: { date: 'desc' },
      take: 100,
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Mailbox API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch mailbox' }, { status: 500 });
  }
});
