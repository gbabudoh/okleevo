import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { notifyTicketEvent } from '@/lib/services/tickets';

export const POST = withMultiTenancy(async (req, { user, business, params }) => {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id as string;
    const { content, isInternal } = await req.json();

    if (!content?.trim()) {
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
        isInternal: isInternal === true,
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

    // Internal notes are agent-only — never notify the customer about those.
    if (!comment.isInternal && ticket.type === 'CUSTOMER') {
      notifyTicketEvent(ticket, business.name, 'replied', content).catch(() => {});
    }

    return NextResponse.json(comment);
  } catch (error: unknown) {
    console.error('Error adding ticket comment:', error);
    return NextResponse.json({ error: 'Failed to add response' }, { status: 500 });
  }
});
