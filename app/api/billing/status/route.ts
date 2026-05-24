import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSubscriptionInfo } from '@/lib/stripe/billing';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = (session.user as { businessId?: string }).businessId;
    if (!businessId) {
      return NextResponse.json({ error: 'No business found' }, { status: 400 });
    }

    const info = await getSubscriptionInfo(businessId);
    return NextResponse.json(info);
  } catch (error) {
    console.error('[Billing] Status error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription status' }, { status: 500 });
  }
}
