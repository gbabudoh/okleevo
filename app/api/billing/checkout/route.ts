import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/stripe/billing';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = (session.user as { businessId?: string }).businessId;
    if (!businessId) {
      return NextResponse.json({ error: 'No business found' }, { status: 400 });
    }

    // Rate Limit: Max 10 checkout session creations per business per 10 minutes
    const rateLimit = checkRateLimit(`checkout:${businessId}`, 10, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return rateLimitResponse(
        rateLimit,
        'Too many checkout attempts. Please wait a few minutes before trying again.'
      );
    }

    const url = await createCheckoutSession(businessId);
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('[Billing] Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create checkout session' }, { status: 500 });
  }
}
