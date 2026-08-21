import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { completePaystackSubscription } from '@/lib/paystack/billing';

export const POST = withMultiTenancy(async (req, { business }) => {
  try {
    const body = await req.json();
    const { reference } = body;

    if (!reference || typeof reference !== 'string') {
      return NextResponse.json({ error: 'Missing transaction reference' }, { status: 400 });
    }

    const result = await completePaystackSubscription(reference);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Verification failed' }, { status: 400 });
    }

    // Safety check: ensure transaction belongs to the calling business
    if (result.businessId && result.businessId !== business.id) {
      return NextResponse.json({ error: 'Unauthorized workspace mismatch' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      message: 'Paystack subscription activated successfully',
      tier: result.tier,
    });
  } catch (error) {
    console.error('Error verifying Paystack subscription:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 500 }
    );
  }
});
