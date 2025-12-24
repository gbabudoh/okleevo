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
 * GET - Get a specific business with details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Promise and direct params (Next.js 15 vs 14)
    const resolvedParams = params instanceof Promise ? await params : params;
    const businessId = resolvedParams.id;

    if (!businessId) {
      console.error('[ADMIN-BUSINESS] Missing business ID in params');
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    console.log('[ADMIN-BUSINESS] Fetching business:', businessId);

    const userId = await getAuthenticatedUserId();

    if (!userId) {
      console.error('[ADMIN-BUSINESS] Unauthorized - No user ID');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[ADMIN-BUSINESS] User ID:', userId);

    if (!(await isSuperAdmin(userId))) {
      console.error('[ADMIN-BUSINESS] Forbidden - Not super admin');
      return NextResponse.json(
        { error: 'Forbidden - Super admin access required' },
        { status: 403 }
      );
    }

    console.log('[ADMIN-BUSINESS] Super admin verified, fetching business...');

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        subscription: true,
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            lastLoginAt: true,
          },
        },
        _count: {
          select: {
            invoices: true,
            contacts: true,
            tasks: true,
          },
        },
      },
    });

    if (!business) {
      console.error('[ADMIN-BUSINESS] Business not found:', businessId);
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    console.log('[ADMIN-BUSINESS] Business fetched successfully:', business.name);
    return NextResponse.json({ business });
  } catch (error: any) {
    console.error('[ADMIN-BUSINESS] Error fetching business:', error);
    console.error('[ADMIN-BUSINESS] Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Failed to fetch business',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update a business
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Promise and direct params (Next.js 15 vs 14)
    const resolvedParams = params instanceof Promise ? await params : params;
    const businessId = resolvedParams.id;

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
    const { name, industry, size, country, city, address, maxSeats, seatCount } = body;

    const business = await prisma.business.update({
      where: { id: businessId },
      data: {
        ...(name && { name }),
        ...(industry && { industry }),
        ...(size && { size }),
        ...(country && { country }),
        ...(city !== undefined && { city }),
        ...(address !== undefined && { address }),
        ...(maxSeats !== undefined && { maxSeats }),
        ...(seatCount !== undefined && { seatCount }),
      },
    });

    return NextResponse.json({
      success: true,
      business,
    });
  } catch (error: any) {
    console.error('Error updating business:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update business' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a business (and all associated data)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Promise and direct params (Next.js 15 vs 14)
    const resolvedParams = params instanceof Promise ? await params : params;
    const businessId = resolvedParams.id;

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

    // Check if business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Delete business (cascade will delete all related data)
    await prisma.business.delete({
      where: { id: businessId },
    });

    return NextResponse.json({
      success: true,
      message: 'Business deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting business:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete business' },
      { status: 500 }
    );
  }
}

