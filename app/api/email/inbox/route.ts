import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { fetchInboxMessages } from '@/lib/services/imap';

export const GET = withMultiTenancy(async (_req, { user }) => {
  try {
    // 1. Get IMAP Config from Env (In production, this would be from the Business settings)
    const imapConfig = {
      host: process.env.IMAP_HOST || '',
      port: Number(process.env.IMAP_PORT) || 993,
      secure: process.env.IMAP_SECURE !== 'false',
      auth: {
        user: process.env.SMTP_USER || '', // Usually same as SMTP
        pass: process.env.SMTP_PASS || ''
      }
    };

    // If config is missing, return empty or error
    if (!imapConfig.host || !imapConfig.auth.user) {
       // Just fetch from DB if no config (allows seeing previously synced mail)
       const messages = await prisma.mailboxMessage.findMany({
         where: { businessId: user.businessId },
         orderBy: { date: 'desc' },
         take: 50
       });
       return NextResponse.json(messages);
    }

    // 2. Trigger a sync in the background (or foreground for simplicity now)
    const result = await fetchInboxMessages(imapConfig, 10);
    
    if (result.success && result.messages) {
      for (const msg of result.messages) {
        // Upsert message to avoid duplicates
        await prisma.mailboxMessage.upsert({
          where: { messageId: msg.messageId || `uid-${msg.uid}` },
          update: { uid: Number(msg.uid) },
          create: {
            businessId: user.businessId,
            messageId: msg.messageId || `uid-${msg.uid}`,
            uid: Number(msg.uid),
            from: msg.from,
            to: msg.to,
            subject: msg.subject,
            body: msg.body,
            html: msg.html,
            date: msg.date,
            hasAttachments: msg.hasAttachments,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            attachments: (msg.attachments || []) as any,
            folder: 'INBOX',
            status: 'UNREAD'
          }
        });
      }
    }

    // 3. Return all messages from DB
    const finalMessages = await prisma.mailboxMessage.findMany({
      where: { businessId: user.businessId },
      orderBy: { date: 'desc' },
      take: 50
    });

    return NextResponse.json(finalMessages);

  } catch (error) {
    console.error('Mailbox API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch mailbox' }, { status: 500 });
  }
});
