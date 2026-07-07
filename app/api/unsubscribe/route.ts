import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public route (no session) — a campaign recipient clicks this from their inbox.
// Authorization is the unguessable unsubscribeToken itself, not a logged-in user.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const contact = await prisma.contact.findUnique({ where: { unsubscribeToken: token } });

  if (!contact) {
    return NextResponse.json({ error: 'Invalid or expired unsubscribe link' }, { status: 404 });
  }

  await prisma.contact.update({
    where: { id: contact.id },
    data: { unsubscribedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
