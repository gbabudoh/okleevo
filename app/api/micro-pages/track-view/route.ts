import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const BOT_UA_RE =
  /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|discordbot|slackbot|linkedinbot|embedly|quora link preview|pinterest|preview|monitor|uptime|pingdom|semrush|ahrefs|mj12bot|dotbot|petalbot|bytespider|gptbot|ccbot|claudebot|applebot|yandex|baidu|duckduckbot/i;

const VIEW_COOKIE_MAX_AGE = 30 * 60; // 30 minutes — one visit dedup window

export async function POST(req: Request) {
  try {
    const { slug } = await req.json();
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Missing page reference.' }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || '';
    if (BOT_UA_RE.test(userAgent)) {
      return NextResponse.json({ counted: false });
    }

    const page = await prisma.microPage.findUnique({ where: { slug }, select: { id: true, status: true } });
    if (!page || page.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Page not found.' }, { status: 404 });
    }

    const cookieName = `mp_v_${page.id}`;
    const cookieHeader = req.headers.get('cookie') || '';
    const alreadyViewed = cookieHeader
      .split(';')
      .some((c) => c.trim().startsWith(`${cookieName}=`));

    if (alreadyViewed) {
      return NextResponse.json({ counted: false });
    }

    await prisma.microPage.update({ where: { id: page.id }, data: { views: { increment: 1 } } });

    const res = NextResponse.json({ counted: true });
    res.cookies.set(cookieName, '1', {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: VIEW_COOKIE_MAX_AGE,
      path: '/',
    });
    return res;
  } catch (error) {
    console.error('Micro Page Track View Error:', error);
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
  }
}
