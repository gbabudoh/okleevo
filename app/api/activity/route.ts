import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/multi-tenancy';

export const runtime = 'nodejs';

/**
 * GET - Get recent team activity feed
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user's business
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { businessId: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');
    const activity: any[] = [];

    // Get recent invoices
    const recentInvoices = await prisma.invoice.findMany({
      where: { businessId: currentUser.businessId },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    recentInvoices.forEach((invoice: any) => {
      activity.push({
        id: `invoice-${invoice.id}`,
        type: 'invoice',
        action: invoice.status === 'PAID' ? 'paid' : invoice.status === 'SENT' ? 'sent' : 'created',
        resource: `Invoice #${invoice.number}`,
        user: {
          name: `${invoice.user.firstName} ${invoice.user.lastName}`,
          email: invoice.user.email,
        },
        timestamp: invoice.updatedAt || invoice.createdAt,
        metadata: {
          amount: invoice.total,
          status: invoice.status,
        },
      });
    });

    // Get recent contacts
    const recentContacts = await prisma.contact.findMany({
      where: { businessId: currentUser.businessId },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    recentContacts.forEach((contact: any) => {
      activity.push({
        id: `contact-${contact.id}`,
        type: 'contact',
        action: 'created',
        resource: contact.name,
        user: {
          name: `${contact.user.firstName} ${contact.user.lastName}`,
          email: contact.user.email,
        },
        timestamp: contact.createdAt,
        metadata: {
          email: contact.email,
          status: contact.status,
        },
      });
    });

    // Get recent tasks
    const recentTasks = await prisma.task.findMany({
      where: { businessId: currentUser.businessId },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    recentTasks.forEach((task: any) => {
      activity.push({
        id: `task-${task.id}`,
        type: 'task',
        action: task.status === 'DONE' ? 'completed' : task.status === 'IN_PROGRESS' ? 'started' : 'created',
        resource: task.title,
        user: {
          name: `${task.user.firstName} ${task.user.lastName}`,
          email: task.user.email,
        },
        timestamp: task.updatedAt || task.createdAt,
        metadata: {
          status: task.status,
          priority: task.priority,
        },
      });
    });

    // Get recent user additions
    const recentUsers = await prisma.user.findMany({
      where: { 
        businessId: currentUser.businessId,
        id: { not: userId }, // Exclude current user
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    recentUsers.forEach((user: any) => {
      activity.push({
        id: `user-${user.id}`,
        type: 'user',
        action: 'joined',
        resource: `${user.firstName} ${user.lastName}`,
        user: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        },
        timestamp: user.createdAt,
      });
    });

    // Sort by timestamp and limit
    activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const limitedActivity = activity.slice(0, limit);

    return NextResponse.json({
      activity: limitedActivity,
      total: activity.length,
    });
  } catch (error: any) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}

