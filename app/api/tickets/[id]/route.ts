import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { TicketStatus, TicketPriority } from '@/lib/prisma-client';

export const GET = withMultiTenancy(async (_req, { user, params }) => {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id as string;

    const ticket = await prisma.ticket.findFirst({
      where: { id, businessId: user.businessId },
      include: {
        comments: {
          where: { isInternal: false },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...ticket,
      customer: ticket.customerName,
      status: ticket.status.toLowerCase(),
      priority: ticket.priority.toLowerCase(),
      responses: ticket.comments.length
    });
  } catch (error: unknown) {
    console.error('Error fetching ticket details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PATCH = withMultiTenancy(async (req, { user, params }) => {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id as string;
    const body = await req.json();
    const { status, priority, assignedTo, subject, description, category } = body;

    const existing = await prisma.ticket.findFirst({
      where: { id, businessId: user.businessId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        ...(status && { status: status.toUpperCase() as TicketStatus }),
        ...(priority && { priority: priority.toUpperCase() as TicketPriority }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(subject && { subject }),
        ...(description && { description }),
        ...(category && { category }),
      },
    });

    return NextResponse.json({
      ...updated,
      customer: updated.customerName,
      status: updated.status.toLowerCase(),
      priority: updated.priority.toLowerCase(),
    });
  } catch (error: unknown) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
});

export const DELETE = withMultiTenancy(async (_req, { user, params }) => {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id as string;

    const existing = await prisma.ticket.findFirst({
      where: { id, businessId: user.businessId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    await prisma.ticket.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 });
  }
});
