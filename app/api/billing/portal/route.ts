import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createPortalSession } from '@/lib/stripe/billing';
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

    // Rate Limit: Max 10 portal requests per business per 10 minutes
    const rateLimit = checkRateLimit(`portal:${businessId}`, 10, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return rateLimitResponse(
        rateLimit,
        'Too many customer portal requests. Please wait a few minutes before trying again.'
      );
    }

    const url = await createPortalSession(businessId);
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('[Billing] Portal error:', error);
    return NextResponse.json({ error: error.message || 'Failed to open billing portal' }, { status: 500 });
  }
}
