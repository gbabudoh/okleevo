import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { PlanTier } from '@/lib/prisma-client';
import { createPaystackCheckoutSession, PaystackCurrency, BillingPeriod } from '@/lib/paystack/billing';

export const POST = withMultiTenancy(async (req, { user, business }) => {
  try {
    const body = await req.json();
    const { tier = 'STARTER', period = 'monthly', currency = 'NGN', redirectUrl } = body;

    const validTiers: PlanTier[] = ['STARTER', 'GROWTH', 'SCALE'];
    if (!validTiers.includes(tier as PlanTier)) {
      return NextResponse.json({ error: 'Invalid plan tier' }, { status: 400 });
    }

    const validPeriods: BillingPeriod[] = ['monthly', 'annual'];
    if (!validPeriods.includes(period as BillingPeriod)) {
      return NextResponse.json({ error: 'Invalid billing period' }, { status: 400 });
    }

    const validCurrencies: PaystackCurrency[] = ['NGN', 'GHS', 'KES', 'ZAR', 'USD'];
    const selectedCurrency = (validCurrencies.includes(currency) ? currency : 'NGN') as PaystackCurrency;

    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'SME Customer';

    const session = await createPaystackCheckoutSession({
      businessId: business.id,
      userEmail: user.email,
      userName,
      tier: tier as PlanTier,
      period: period as BillingPeriod,
      currency: selectedCurrency,
      redirectUrl,
    });

    return NextResponse.json({
      success: true,
      authorization_url: session.data.authorization_url,
      access_code: session.data.access_code,
      reference: session.data.reference,
    });
  } catch (error) {
    console.error('Error initializing Paystack checkout:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to initialize Paystack checkout' },
      { status: 500 }
    );
  }
});
