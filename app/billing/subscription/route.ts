import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get subscription details
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const businessId = (session.user as any).businessId;

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID not found in session' },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { businessId },
    });

    if (!subscription) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
        id: subscription.id,
        status: subscription.status,
        plan: {
            id: subscription.stripePriceId || 'price_all_in_one',
            name: 'All-in-One Plan',
            amount: subscription.amount,
            currency: subscription.currency,
            interval: 'month',
        },
        currentPeriodStart: subscription.currentPeriodStart.toISOString(),
        currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        trialEnd: subscription.trialEnd ? subscription.trialEnd.toISOString() : null,
        createdAt: subscription.createdAt.toISOString(),
    });

  } catch (error) {
    console.error('Get Subscription Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

// Update subscription
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body; // 'cancel', 'resume'

    // TODO: implement Stripe API calls here for cancellation

    return NextResponse.json({
      success: true,
      message: `Subscription ${action}ed successfully (Mocked Action)`,
    });
  } catch (error) {
    console.error('Update Subscription Error:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

// Cancel subscription (Alternative to PUT)
export async function DELETE() {
    return NextResponse.json({
      success: true,
      message: 'Subscription cancellation implementation pending',
    });
}
