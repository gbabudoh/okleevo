import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Create Stripe checkout session
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userBusinessId = (session.user as any).businessId;
    if (!userBusinessId) {
        return NextResponse.json({ error: 'Business ID missing' }, { status: 400 });
    }

    const body = await request.json();
    const { priceId, returnUrl } = body; 
    // returnUrl is where to redirect after success/cancel

    // Fetch subscription to get stripeCustomerId
    const subscription = await prisma.subscription.findUnique({
      where: { businessId: userBusinessId },
    });

    if (!subscription || !subscription.stripeCustomerId) {
       return NextResponse.json(
         { error: 'No subscription/customer found. Contact support.' },
         { status: 400 }
       );
    }

    // Determine mode: if connecting card for existing trial, use 'setup'
    // If upgrading or new sub, use 'subscription'
    const mode = 'subscription'; 

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: subscription.stripeCustomerId,
      mode: mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId || process.env.STRIPE_PRICE_TIER_1, 
          quantity: 1, // Logic for seats should be handled if dynamic
        },
      ],
      success_url: `${returnUrl || process.env.NEXT_PUBLIC_APP_URL + '/dashboard'}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl || process.env.NEXT_PUBLIC_APP_URL + '/dashboard'}?canceled=true`,
      metadata: {
        businessId: userBusinessId,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// Get subscription status - Handled by /api/billing/subscription now
// Keeping this as a proxy or removing. 
// Given the previous file handled it, we can remove GET or redirect logic.
// But valid REST API might keep it. Let's return 404 or use it for specific stripe direct calls.
export async function GET() {
   return NextResponse.json({ message: 'Use /api/billing/subscription for status' });
}
