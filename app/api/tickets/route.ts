import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { TicketStatus, TicketPriority } from '@/lib/prisma-client';

export const GET = withMultiTenancy(async (_req, { dataFilter }) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { businessId: dataFilter.businessId },
      include: {
        _count: {
          select: { comments: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
    });

    const mapped = tickets.map(t => ({
      id: t.id,
      subject: t.subject,
      customer: t.customerName,
      email: t.customerEmail,
      status: t.status.toLowerCase(),
      priority: t.priority.toLowerCase(),
      category: t.category,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      assignedTo: t.assignedTo,
      description: t.description,
      responses: t._count.comments,
    }));

    return NextResponse.json(mapped);
  } catch (error: unknown) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
});

export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const body = await req.json();
    const { 
      subject, customer, email, priority, category, description 
    } = body;

    const ticket = await prisma.ticket.create({
      data: {
        businessId: user.businessId,
        userId: user.id,
        subject,
        customerName: customer,
        customerEmail: email,
        priority: priority.toUpperCase() as TicketPriority,
        category: category || 'Support',
        description,
        status: TicketStatus.OPEN,
      },
    });

    return NextResponse.json({
      ...ticket,
      customer: ticket.customerName,
      status: ticket.status.toLowerCase(),
      priority: ticket.priority.toLowerCase(),
    });
  } catch (error: unknown) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ 
      error: 'Failed to create ticket',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
});
