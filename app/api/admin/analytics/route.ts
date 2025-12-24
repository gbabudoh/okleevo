import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/multi-tenancy';

export const runtime = 'nodejs';

/**
 * Check if user is super admin
 */
async function isSuperAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === 'SUPER_ADMIN';
}

/**
 * GET - Get platform-wide analytics and statistics
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

    if (!(await isSuperAdmin(userId))) {
      return NextResponse.json(
        { error: 'Forbidden - Super admin access required' },
        { status: 403 }
      );
    }

    // Get all counts in parallel for better performance
    const [
      totalBusinesses,
      totalUsers,
      totalSubscriptions,
      activeSubscriptions,
      trialSubscriptions,
      businesses,
      users,
      subscriptions,
    ] = await Promise.all([
      // Total counts
      prisma.business.count(),
      prisma.user.count({
        where: {
          role: {
            not: 'SUPER_ADMIN', // Exclude super admins from user count
          },
        },
      }),
      prisma.subscription.count(),
      prisma.subscription.count({
        where: { status: 'ACTIVE' },
      }),
      prisma.subscription.count({
        where: { status: 'TRIAL' },
      }),
      // Get all businesses for industry distribution
      prisma.business.findMany({
        select: {
          industry: true,
        },
      }),
      // Get all users (excluding SUPER_ADMIN) for role distribution
      prisma.user.findMany({
        where: {
          role: {
            not: 'SUPER_ADMIN',
          },
        },
        select: {
          role: true,
        },
      }),
      // Get all active subscriptions for revenue calculation
      prisma.subscription.findMany({
        where: {
          status: {
            in: ['ACTIVE', 'TRIAL'], // Include both active and trial subscriptions
          },
        },
        select: {
          amount: true,
          currency: true,
          status: true,
        },
      }),
    ]);

    // Calculate monthly revenue (sum of all active/trial subscription amounts)
    const totalRevenue = subscriptions.reduce((sum: number, sub: { amount: number | null }) => {
      return sum + (sub.amount || 0);
    }, 0);

    // Industry distribution
    const industryCount: Record<string, number> = {};
    businesses.forEach((b: { industry: string }) => {
      industryCount[b.industry] = (industryCount[b.industry] || 0) + 1;
    });

    // Role distribution (excluding SUPER_ADMIN)
    const roleCount: Record<string, number> = {};
    users.forEach((u: { role: string }) => {
      roleCount[u.role] = (roleCount[u.role] || 0) + 1;
    });

    return NextResponse.json({
      stats: {
        totalBusinesses,
        totalUsers,
        totalSubscriptions,
        activeSubscriptions,
        trialSubscriptions,
        totalRevenue,
        industryCount,
        roleCount,
      },
    });
  } catch (error: any) {
    console.error('[ANALYTICS] Error fetching analytics:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

