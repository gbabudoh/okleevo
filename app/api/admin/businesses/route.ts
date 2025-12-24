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
 * GET - List all businesses (SMEs)
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get businesses with user count and subscription info
    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        include: {
          subscription: true,
          _count: {
            select: { users: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.business.count({ where }),
    ]);

    return NextResponse.json({
      businesses: businesses.map((b: any) => ({
        id: b.id,
        name: b.name,
        industry: b.industry,
        size: b.size,
        country: b.country,
        city: b.city,
        address: b.address,
        seatCount: b.seatCount,
        maxSeats: b.maxSeats,
        userCount: b._count.users,
        subscription: b.subscription ? {
          status: b.subscription.status,
          plan: b.subscription.plan,
          currentPeriodEnd: b.subscription.currentPeriodEnd,
          trialEnd: b.subscription.trialEnd,
        } : null,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new business (SME)
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

    if (!(await isSuperAdmin(userId))) {
      return NextResponse.json(
        { error: 'Forbidden - Super admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, industry, size, country, city, address, maxSeats } = body;

    if (!name || !industry) {
      return NextResponse.json(
        { error: 'Name and industry are required' },
        { status: 400 }
      );
    }

    const business = await prisma.business.create({
      data: {
        name,
        industry,
        size: size || '1-5',
        country: country || 'UK',
        city: city || null,
        address: address || null,
        seatCount: 0,
        maxSeats: maxSeats || 10,
      },
    });

    return NextResponse.json({
      success: true,
      business,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating business:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create business' },
      { status: 500 }
    );
  }
}

