import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/multi-tenancy';

export const runtime = 'nodejs';

/**
 * GET - Get online status of all team members
 */
export async function GET() {
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

    // Get all active sessions for users in this business
    // Note: With JWT strategy, sessions may not be in database, so we'll also use lastLoginAt
    const activeSessions = await prisma.session.findMany({
      where: {
        expires: {
          gt: new Date(), // Not expired
        },
        user: {
          businessId: currentUser.businessId,
          status: 'ACTIVE',
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            lastLoginAt: true,
          },
        },
      },
      orderBy: {
        expires: 'desc',
      },
    });

    // Get all users in the business
    const allUsers = await prisma.user.findMany({
      where: { businessId: currentUser.businessId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        lastLoginAt: true,
      },
    });

    // Determine online status
    // A user is considered "online" if:
    // 1. They are the current user making this request (they're definitely online right now), OR
    // 2. They were active recently (heartbeat sent within last 2 minutes)
    const now = new Date();
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

    const presence = allUsers.map(user => {
      // If this is the current user making the request, they're online
      const isCurrentUser = user.id === userId;

      // For JWT and DB sessions, use lastLoginAt as the heartbeat indicator
      // Heartbeat updates lastLoginAt every 15 seconds
      const recentlyActive = user.lastLoginAt &&
        new Date(user.lastLoginAt) > twoMinutesAgo;

      // User is online if they are current user or sent a heartbeat recently
      const isOnline = isCurrentUser || recentlyActive;

      // Get the most recent session for this user
      const userSessions = activeSessions.filter(s => s.userId === user.id);
      const lastActivity = userSessions.length > 0
        ? userSessions[0].expires
        : user.lastLoginAt;

      return {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isOnline: isOnline,
        lastActivity: lastActivity,
      };
    });

    // Debug: Log presence data
    console.log(`Presence check for business ${currentUser.businessId}: ${presence.filter(p => p.isOnline).length} online, ${presence.length} total.`);

    return NextResponse.json({
      presence,
      onlineCount: presence.filter(p => p.isOnline).length,
      totalCount: presence.length,
    });
  } catch (error: unknown) {
    console.error('Error fetching presence:', error);
    return NextResponse.json(
      { error: 'Failed to fetch presence' },
      { status: 500 }
    );
  }
}

/**
 * POST - Update user's online status (heartbeat)
 */
export async function POST() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update last login time as a heartbeat
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Error updating presence:', error);
    return NextResponse.json(
      { error: 'Failed to update presence' },
      { status: 500 }
    );
  }
}
