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
 * GET - Get a specific subscription
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        business: {
          include: {
            users: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ subscription });
  } catch (error: unknown) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update a subscription
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { status, plan, amount, currency, currentPeriodStart, currentPeriodEnd, trialEnd, cancelAtPeriodEnd } = body;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (plan) updateData.plan = plan;
    if (amount !== undefined) updateData.amount = amount;
    if (currency) updateData.currency = currency;
    if (currentPeriodStart) updateData.currentPeriodStart = new Date(currentPeriodStart);
    if (currentPeriodEnd) updateData.currentPeriodEnd = new Date(currentPeriodEnd);
    if (trialEnd !== undefined) updateData.trialEnd = trialEnd ? new Date(trialEnd) : null;
    if (cancelAtPeriodEnd !== undefined) updateData.cancelAtPeriodEnd = cancelAtPeriodEnd;

    const subscription = await prisma.subscription.update({
      where: { id },
      data: updateData,
      include: {
        business: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error: unknown) {
    console.error('Error updating subscription:', error);
    const errMsg = error instanceof Error ? error.message : 'Failed to update subscription';
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a subscription
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    await prisma.subscription.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Error deleting subscription:', error);
    const errMsg = error instanceof Error ? error.message : 'Failed to delete subscription';
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}

