import { NextRequest, NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (req: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    // 1. Fetch system-sent emails (EmailLog)
    const logs = await prisma.emailLog.findMany({
      where: {
        businessId: user.businessId,
        to: { contains: email, mode: 'insensitive' }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // 2. Fetch shared mailbox messages (MailboxMessage)
    const messages = await prisma.mailboxMessage.findMany({
      where: {
        businessId: user.businessId,
        OR: [
          { from: { contains: email, mode: 'insensitive' } },
          { to: { contains: email, mode: 'insensitive' } }
        ]
      },
      orderBy: { date: 'desc' },
      take: 20
    });

    // 3. Combine and transform into a unified timeline
    const timeline = [
      ...logs.map(log => ({
        id: log.id,
        type: 'SENT',
        source: 'SYSTEM',
        subject: log.subject,
        date: log.createdAt,
        status: log.status,
        body: log.body,
        from: 'System',
        to: log.to
      })),
      ...messages.map(msg => ({
        id: msg.id,
        type: msg.folder === 'SENT' ? 'SENT' : 'RECEIVED',
        source: 'MAILBOX',
        subject: msg.subject,
        date: msg.date,
        status: msg.status,
        body: msg.body,
        from: msg.from,
        to: msg.to
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(timeline);

  } catch (error) {
    console.error('CRM Emails API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch communication history' }, { status: 500 });
  }
});
