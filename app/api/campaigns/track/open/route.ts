import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1x1 transparent GIF — always returned regardless of tracking outcome, so a
// missing/invalid log id never shows a broken-image icon in the email.
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', 'base64');

const PIXEL_RESPONSE_INIT = {
  status: 200,
  headers: {
    'Content-Type': 'image/gif',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },
};

export async function GET(req: Request) {
  try {
    const logId = new URL(req.url).searchParams.get('log');

    if (logId) {
      const log = await prisma.emailLog.findUnique({ where: { id: logId }, select: { openedAt: true, campaignId: true } });
      // Only the first open per recipient counts — most clients re-fetch the
      // pixel on every view, which would otherwise inflate the open count
      // every time the recipient re-reads the email.
      if (log && !log.openedAt) {
        await prisma.$transaction([
          prisma.emailLog.update({ where: { id: logId }, data: { openedAt: new Date() } }),
          ...(log.campaignId
            ? [prisma.campaign.update({ where: { id: log.campaignId }, data: { openedCount: { increment: 1 } } })]
            : []),
        ]);
      }
    }
  } catch (error) {
    console.error('Campaign open-tracking error:', error);
  }

  return new NextResponse(PIXEL, PIXEL_RESPONSE_INIT);
}
