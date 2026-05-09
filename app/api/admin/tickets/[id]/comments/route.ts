import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const user = session?.user as { role?: string; id?: string } | undefined;
    if (!session?.user || user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { content, isInternal } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const ticket = await prisma.ticket.findFirst({
      where: { id, type: 'PLATFORM' },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const comment = await prisma.ticketComment.create({
      data: {
        ticketId: id,
        userId: (session.user as { id: string }).id,
        authorName: session.user.name || 'Platform Admin',
        authorRole: 'agent',
        content,
        isInternal: !!isInternal,
      },
    });

    // Update status to IN_PROGRESS if it was OPEN/PENDING
    if (ticket.status === 'OPEN' || ticket.status === 'PENDING') {
      await prisma.ticket.update({
        where: { id },
        data: { status: 'IN_PROGRESS' }
      });
    } else {
      await prisma.ticket.update({
        where: { id },
        data: { updatedAt: new Date() }
      });
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error adding admin comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
