import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { TicketStatus, TicketPriority } from '@/lib/prisma-client';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const user = session?.user as { role?: string } | undefined;
    if (!session?.user || user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const ticket = await prisma.ticket.findFirst({
      where: { id, type: 'PLATFORM' },
      include: {
        business: { select: { name: true } },
        user: { select: { firstName: true, lastName: true, email: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket detail:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const user = session?.user as { role?: string } | undefined;
    if (!session?.user || user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status, priority, assignedTo } = await req.json();

    const updateData: Partial<{
      status: TicketStatus;
      priority: TicketPriority;
      assignedTo: string | null;
      resolvedAt: Date;
    }> = {};
    if (status) updateData.status = status.toUpperCase() as TicketStatus;
    if (priority) updateData.priority = priority.toUpperCase() as TicketPriority;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

    if (status === 'RESOLVED') {
      updateData.resolvedAt = new Date();
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id, type: 'PLATFORM' },
      data: updateData
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
