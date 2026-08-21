import { prisma } from '@/lib/prisma';
import { PlanTier, SubscriptionStatus } from '@/lib/prisma-client';
import {
  initializePaystackTransaction,
  verifyPaystackTransaction,
  InitializePaystackResponse,
  VerifyPaystackResponse,
} from './client';

export {
  type PaystackCurrency,
  type PaystackPlanTier,
  type BillingPeriod,
  PAYSTACK_PRICING,
} from './types';
import { PaystackCurrency, BillingPeriod, PAYSTACK_PRICING } from './types';

/**
 * Initializes a Paystack checkout session for an SME workspace.
 */
export async function createPaystackCheckoutSession(params: {
  businessId: string;
  userEmail: string;
  userName: string;
  tier: PlanTier;
  period: BillingPeriod;
  currency?: PaystackCurrency;
  redirectUrl?: string;
}): Promise<InitializePaystackResponse> {
  const {
    businessId,
    userEmail,
    userName,
    tier,
    period,
    currency = 'NGN',
    redirectUrl,
  } = params;

  const pricing = PAYSTACK_PRICING[currency][tier];
  const amountInMajor = period === 'annual' ? pricing.annual : pricing.monthly;
  // Paystack expects amount in lowest sub-unit (e.g. kobo/cents => multiply by 100)
  const amountInSubUnits = Math.round(amountInMajor * 100);

  const reference = `okleevo_${businessId}_${tier.toLowerCase()}_${Date.now()}`;
  const appBaseUrl = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  const callbackUrl = redirectUrl || `${appBaseUrl}/dashboard/settings?tab=billing&paystack_ref=${reference}`;

  const response = await initializePaystackTransaction({
    email: userEmail,
    amount: amountInSubUnits,
    currency,
    reference,
    callbackUrl,
    metadata: {
      businessId,
      userEmail,
      userName,
      tier,
      period,
      currency,
      source: 'okleevo_saas_subscription',
    },
    channels: ['card', 'bank', 'ussd', 'mobile_money', 'bank_transfer'],
  });

  return response;
}

/**
 * Verifies a completed Paystack transaction and activates the workspace subscription.
 */
export async function completePaystackSubscription(reference: string): Promise<{
  success: boolean;
  businessId?: string;
  tier?: PlanTier;
  error?: string;
}> {
  try {
    const verified = await verifyPaystackTransaction(reference);
    if (!verified.status || verified.data.status !== 'success') {
      return { success: false, error: verified.message || 'Payment was not successful' };
    }

    const meta = (verified.data.metadata || {}) as {
      businessId?: string;
      tier?: PlanTier;
      period?: BillingPeriod;
      currency?: string;
    };

    const businessId = meta.businessId;
    const tier = (meta.tier || 'STARTER') as PlanTier;
    const period = meta.period || 'monthly';
    const currency = (meta.currency || verified.data.currency || 'NGN').toLowerCase();

    if (!businessId) {
      return { success: false, error: 'Missing business ID in transaction metadata' };
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { subscription: true },
    });

    if (!business) {
      return { success: false, error: 'Business workspace not found' };
    }

    const now = new Date();
    const durationDays = period === 'annual' ? 365 : 30;
    const periodEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const customerCode = verified.data.customer?.customer_code || null;
    const subscriptionCode = verified.data.subscription?.subscription_code || null;
    const planCode = verified.data.plan?.plan_code || null;
    const emailToken = verified.data.subscription?.email_token || null;

    if (business.subscription) {
      await prisma.subscription.update({
        where: { id: business.subscription.id },
        data: {
          paymentProvider: 'PAYSTACK',
          paystackCustomerCode: customerCode,
          paystackSubscriptionCode: subscriptionCode,
          paystackPlanCode: planCode,
          paystackEmailToken: emailToken,
          status: SubscriptionStatus.ACTIVE,
          planTier: tier,
          plan: tier.toLowerCase(),
          amount: verified.data.amount,
          currency,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
        },
      });
    } else {
      await prisma.subscription.create({
        data: {
          businessId,
          paymentProvider: 'PAYSTACK',
          paystackCustomerCode: customerCode,
          paystackSubscriptionCode: subscriptionCode,
          paystackPlanCode: planCode,
          paystackEmailToken: emailToken,
          status: SubscriptionStatus.ACTIVE,
          planTier: tier,
          plan: tier.toLowerCase(),
          amount: verified.data.amount,
          currency,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
        },
      });
    }

    return { success: true, businessId, tier };
  } catch (error) {
    console.error('Error completing Paystack subscription:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
