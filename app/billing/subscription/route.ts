import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe/client";

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

    const businessId = (session.user as { businessId: string }).businessId;

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

    // If we have a Stripe subscription ID, fetch real-time data
    let stripeData = null;
    if (subscription.stripeSubscriptionId) {
      try {
        stripeData = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
      } catch (e) {
        console.error('Stripe retrieval error:', e);
      }
    }

    return NextResponse.json({
        id: subscription.id,
        status: stripeData?.status || subscription.status,
        plan: {
            id: stripeData?.items.data[0].price.id || subscription.stripePriceId || 'price_all_in_one',
            name: 'All-in-One Plan',
            amount: stripeData?.items.data[0].price.unit_amount || subscription.amount,
            currency: stripeData?.currency || subscription.currency,
            interval: stripeData?.items.data[0].price.recurring?.interval || 'month',
        },
        currentPeriodStart: stripeData 
          ? new Date(stripeData.current_period_start * 1000).toISOString() 
          : subscription.currentPeriodStart.toISOString(),
        currentPeriodEnd: stripeData 
          ? new Date(stripeData.current_period_end * 1000).toISOString() 
          : subscription.currentPeriodEnd.toISOString(),
        cancelAtPeriodEnd: stripeData?.cancel_at_period_end ?? subscription.cancelAtPeriodEnd,
        trialEnd: stripeData?.trial_end 
          ? new Date(stripeData.trial_end * 1000).toISOString() 
          : (subscription.trialEnd ? subscription.trialEnd.toISOString() : null),
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
