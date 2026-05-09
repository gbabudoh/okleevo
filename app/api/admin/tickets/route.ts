import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user as { role?: string } | undefined;

    if (!session?.user || user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tickets = await prisma.ticket.findMany({
      where: { 
        type: 'PLATFORM' 
      },
      include: {
        business: {
          select: { name: true }
        },
        user: {
          select: { firstName: true, lastName: true, email: true }
        },
        _count: {
          select: { comments: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
    });

    const mapped = tickets.map(t => ({
      id: t.id,
      subject: t.subject,
      businessName: t.business.name,
      customer: t.customerName || `${t.user?.firstName} ${t.user?.lastName}`,
      email: t.customerEmail || t.user?.email,
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
    console.error('Error fetching admin tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}
