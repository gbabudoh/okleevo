import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/multi-tenancy';

export const runtime = 'nodejs';

/**
 * GET - Get online status of all team members
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
    
    // Also get all session tokens from cookies for users in this business
    // This helps track JWT-based sessions that aren't in the database
    // We'll use lastLoginAt as the primary indicator for JWT sessions

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

    // Create a map of online users (users with active sessions)
    const onlineUserIds = new Set(activeSessions.map((s: any) => s.userId));
    
    // Determine online status
    // A user is considered "online" if:
    // 1. They have an active session that expires in the future, OR
    // 2. They logged in recently (within last 5 minutes) - handles immediate post-login
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    const presence = allUsers.map((user: any) => {
      // Check if user has an active database session
      const hasActiveSession = activeSessions.some(
        (s: any) => s.userId === user.id && s.expires > now
      );
      
      // If this is the current user making the request, they're online (they're actively using the system)
      const isCurrentUser = user.id === userId;
      
      // For JWT sessions (not in database), use lastLoginAt as indicator
      // If user logged in or sent heartbeat within last 5 minutes, consider them online
      // This works because heartbeat updates lastLoginAt every 15 seconds
      const recentlyActive = user.lastLoginAt && 
        new Date(user.lastLoginAt) > fiveMinutesAgo;
      
      // User is online if:
      // 1. They have an active database session, OR
      // 2. They are the current user making this request (they're definitely online right now), OR
      // 3. They were active recently (lastLoginAt within 5 minutes) - handles JWT sessions and heartbeat
      // 
      // Note: With JWT strategy, sessions aren't in database, so we rely on lastLoginAt/heartbeat
      // The heartbeat updates lastLoginAt every 15 seconds, so active users will show as online
      const isOnline = hasActiveSession || isCurrentUser || recentlyActive;
      
      // Get the most recent session for this user
      const userSessions = activeSessions.filter((s: any) => s.userId === user.id);
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
    console.log('Presence check:', {
      businessId: currentUser.businessId,
      totalUsers: allUsers.length,
      activeSessions: activeSessions.length,
      presence: presence.map((p: any) => ({
        name: `${p.firstName} ${p.lastName}`,
        isOnline: p.isOnline,
        lastLoginAt: p.lastActivity,
      })),
    });

    return NextResponse.json({
      presence,
      onlineCount: presence.filter((p: any) => p.isOnline).length,
      totalCount: presence.length,
    });
  } catch (error: any) {
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
export async function POST(request: NextRequest) {
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
  } catch (error: any) {
    console.error('Error updating presence:', error);
    return NextResponse.json(
      { error: 'Failed to update presence' },
      { status: 500 }
    );
  }
}

