import { NextRequest, NextResponse } from 'next/server';

// Create Stripe checkout session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceId, customerId } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // TODO: Initialize Stripe and create checkout session
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const session = await stripe.checkout.sessions.create({...});

    // Mock response for now
    const mockSession = {
      id: 'cs_test_' + Date.now(),
      url: 'https://checkout.stripe.com/mock-session',
      status: 'open',
    };

    return NextResponse.json(mockSession);
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// Get subscription status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // TODO: Fetch from Stripe
    const mockSubscription = {
      id: 'sub_' + Date.now(),
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      plan: {
        amount: 1999,
        currency: 'gbp',
        interval: 'month',
      },
    };

    return NextResponse.json(mockSubscription);
  } catch (error) {
    console.error('Stripe Subscription Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
