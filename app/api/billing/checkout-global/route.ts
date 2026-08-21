import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createGlobalCheckoutSession, type PlanTier, type BillingPeriod } from '@/lib/stripe/global-billing';

export const runtime = 'nodejs';

const VALID_TIERS: PlanTier[] = ['STARTER', 'GROWTH', 'SCALE'];
const VALID_PERIODS: BillingPeriod[] = ['monthly', 'annual'];

/**
 * Starts checkout for the new global USD pricing tiers. Deliberately
 * separate from /api/billing/checkout (the legacy $9.99 flow), which is
 * untouched — existing subscribers keep working exactly as before, and only
 * reach this route if they choose to from the billing settings UI.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = (session.user as { businessId?: string }).businessId;
    if (!businessId) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { planTier, billingPeriod } = body ?? {};

    if (!VALID_TIERS.includes(planTier)) {
      return NextResponse.json({ error: 'Invalid planTier' }, { status: 400 });
    }
    if (!VALID_PERIODS.includes(billingPeriod)) {
      return NextResponse.json({ error: 'Invalid billingPeriod' }, { status: 400 });
    }

    const url = await createGlobalCheckoutSession(businessId, planTier, billingPeriod);
    return NextResponse.json({ url });
  } catch (error: unknown) {
    console.error('[Billing] Global checkout error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
