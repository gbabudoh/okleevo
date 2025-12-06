import { NextRequest, NextResponse } from 'next/server';

// Get subscription details
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Fetch from Stripe/database
    const mockSubscription = {
      id: 'sub_' + Date.now(),
      status: 'active',
      plan: {
        id: 'price_all_in_one',
        name: 'All-in-One Plan',
        amount: 1999,
        currency: 'gbp',
        interval: 'month',
      },
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      trialEnd: null,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return NextResponse.json(mockSubscription);
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
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body; // 'cancel', 'resume', 'update_payment'

    // TODO: Update subscription in Stripe

    return NextResponse.json({
      success: true,
      message: `Subscription ${action}ed successfully`,
    });
  } catch (error) {
    console.error('Update Subscription Error:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

// Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Cancel subscription in Stripe
    // Set cancelAtPeriodEnd to true

    return NextResponse.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
    });
  } catch (error) {
    console.error('Cancel Subscription Error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
