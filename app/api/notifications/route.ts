import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

/**
 * GET - Fetch user notifications
 */
export const GET = withMultiTenancy(async (_req, { user }) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        businessId: user.businessId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Notifications GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
});

/**
 * PATCH - Mark notification as read
 */
export const PATCH = withMultiTenancy(async (req, { user }) => {
  try {
    const { id, status } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    const notification = await prisma.notification.update({
      where: {
        id,
        userId: user.id, // Ensure ownership
      },
      data: {
        status: status || 'read',
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Notifications PATCH Error:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
});

/**
 * POST - Create a notification (for manual testing)
 */
export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const { title, message, type, link } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        businessId: user.businessId,
        title,
        message,
        type: type || 'info',
        link,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Notifications POST Error:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
});
