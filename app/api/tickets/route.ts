import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { TicketStatus, TicketPriority } from '@/lib/prisma-client';
import { notifyTicketEvent } from '@/lib/services/tickets';

export const GET = withMultiTenancy(async (_req, { dataFilter }) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { 
        businessId: dataFilter.businessId,
        type: 'CUSTOMER'
      },
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
      type: t.type,
    }));

    return NextResponse.json(mapped);
  } catch (error: unknown) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
});

export const POST = withMultiTenancy(async (req, { user, business }) => {
  try {
    const body = await req.json();
    const {
      subject, customer, email, priority, category, description, type
    } = body;

    if (!subject?.trim() || !customer?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Subject, customer, and email are required' }, { status: 400 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        businessId: user.businessId,
        userId: user.id,
        subject,
        customerName: customer,
        customerEmail: email,
        priority: (priority || 'MEDIUM').toUpperCase() as TicketPriority,
        category: category || 'Support',
        description,
        status: TicketStatus.OPEN,
        type: type === 'PLATFORM' ? 'PLATFORM' : 'CUSTOMER',
      },
    });

    if (ticket.type === 'CUSTOMER') {
      notifyTicketEvent(ticket, business.name, 'received').catch(() => {});
    }

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
