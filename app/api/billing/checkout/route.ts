import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/stripe/billing';

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

    const url = await createCheckoutSession(businessId);
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('[Billing] Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create checkout session' }, { status: 500 });
  }
}
