import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TicketStatus, TicketPriority } from '@/lib/prisma-client';
import { notifyTicketEvent } from '@/lib/services/tickets';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true },
    });
    if (!business) {
      return NextResponse.json({ error: 'Support page not found' }, { status: 404 });
    }
    return NextResponse.json(business);
  } catch (error) {
    console.error('Error fetching public support business:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) {
      return NextResponse.json({ error: 'Support page not found' }, { status: 404 });
    }

    const body = await req.json();
    const { subject, customer, email, category, description } = body;

    if (!subject?.trim() || !customer?.trim() || !email?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'Subject, name, email, and description are required' }, { status: 400 });
    }
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const owner = await prisma.user.findFirst({
      where: { businessId },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    if (!owner) {
      return NextResponse.json({ error: 'This business cannot accept requests right now' }, { status: 400 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        businessId,
        userId: owner.id,
        subject: subject.trim(),
        customerName: customer.trim(),
        customerEmail: email.trim(),
        priority: TicketPriority.MEDIUM,
        category: category?.trim() || 'Support',
        description: description.trim(),
        status: TicketStatus.OPEN,
        type: 'CUSTOMER',
      },
    });

    notifyTicketEvent(ticket, business.name, 'received').catch(() => {});

    return NextResponse.json({ success: true, id: ticket.id });
  } catch (error) {
    console.error('Error submitting public ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
