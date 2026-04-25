import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const POST = withMultiTenancy(async (req, { user, params }) => {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id as string;
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const ticket = await prisma.ticket.findFirst({
      where: { id, businessId: user.businessId },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const comment = await prisma.ticketComment.create({
      data: {
        ticketId: id,
        userId: user.id,
        authorName: user.name || user.firstName || 'Support Agent',
        authorRole: 'agent',
        content,
      },
    });

    // Automatically update the ticket's updatedAt and status to PENDING if it was OPEN
    if (ticket.status === 'OPEN') {
      await prisma.ticket.update({
        where: { id },
        data: { status: 'PENDING' }
      });
    } else {
      // Just update timestamp
      await prisma.ticket.update({
        where: { id },
        data: { updatedAt: new Date() }
      });
    }

    return NextResponse.json(comment);
  } catch (error: unknown) {
    console.error('Error adding ticket comment:', error);
    return NextResponse.json({ error: 'Failed to add response' }, { status: 500 });
  }
});
