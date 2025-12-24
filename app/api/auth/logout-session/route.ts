import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/multi-tenancy';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

/**
 * POST - Delete user's session from database on logout
 * This ensures the user shows as offline immediately after logout
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      // If no user ID, try to get session token and delete it
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get('authjs.session-token')?.value || 
                           cookieStore.get('__Secure-authjs.session-token')?.value;
      
      if (sessionToken) {
        // Delete session by token
        await prisma.session.deleteMany({
          where: { sessionToken },
        });
      }
      
      return NextResponse.json({ success: true });
    }

    // Get session token from cookies
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('authjs.session-token')?.value || 
                         cookieStore.get('__Secure-authjs.session-token')?.value;

    if (sessionToken) {
      // Delete the specific session
      await prisma.session.deleteMany({
        where: { 
          sessionToken,
          userId,
        },
      });
    }
    
    // Always delete all sessions for this user to ensure they show as offline
    // This handles cases where JWT strategy might not have database sessions
    await prisma.session.deleteMany({
      where: { userId },
    });
    
    // Also clear lastLoginAt to ensure they don't show as "recently logged in"
    // This makes the offline status immediate
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: null },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Session deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting session on logout:', error);
    // Don't fail the logout if session deletion fails
    return NextResponse.json({ 
      success: true,
      message: 'Logout proceeding despite session cleanup error' 
    });
  }
}

