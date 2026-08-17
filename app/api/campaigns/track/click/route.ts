import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { env } from '@/config/env';

function safeRedirectTarget(raw: string | null): string {
  if (!raw) return env.APP_URL;
  try {
    const target = new URL(raw);
    // Only ever redirect to http(s) — the url param is attacker-controllable
    // (it's echoed straight from a query string), so this prevents this
    // endpoint being used as an open redirect to a javascript:/data: URL.
    if (target.protocol !== 'http:' && target.protocol !== 'https:') return env.APP_URL;
    return target.toString();
  } catch {
    return env.APP_URL;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const logId = searchParams.get('log');
  const destination = safeRedirectTarget(searchParams.get('url'));

  try {
    if (logId) {
      const log = await prisma.emailLog.findUnique({ where: { id: logId }, select: { clickedAt: true, campaignId: true } });
      // Only the first click per recipient counts, same reasoning as opens.
      if (log && !log.clickedAt) {
        await prisma.$transaction([
          prisma.emailLog.update({ where: { id: logId }, data: { clickedAt: new Date() } }),
          ...(log.campaignId
            ? [prisma.campaign.update({ where: { id: log.campaignId }, data: { clickedCount: { increment: 1 } } })]
            : []),
        ]);
      }
    }
  } catch (error) {
    console.error('Campaign click-tracking error:', error);
    // Never block the redirect — a broken tracking write shouldn't strand
    // the recipient on a dead link.
  }

  return NextResponse.redirect(destination, { status: 302 });
}
