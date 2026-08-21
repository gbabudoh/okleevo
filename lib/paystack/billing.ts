import { prisma } from '@/lib/prisma';
import { PlanTier, SubscriptionStatus } from '@/lib/prisma-client';
import {
  initializePaystackTransaction,
  verifyPaystackTransaction,
  InitializePaystackResponse,
  VerifyPaystackResponse,
} from './client';

export type PaystackCurrency = 'NGN' | 'GHS' | 'KES' | 'ZAR' | 'USD';
export type BillingPeriod = 'monthly' | 'annual';

/**
 * Standard Tier Pricing Matrix for Paystack (Amounts in base units, converted to sub-units for Paystack).
 * Starter: ~$19/mo | Growth: ~$49/mo | Scale: ~$99/mo with localized parity.
 */
export const PAYSTACK_PRICING: Record<
  PaystackCurrency,
  Record<PlanTier, { monthly: number; annual: number; symbol: string; name: string }>
> = {
  NGN: {
    STARTER: { monthly: 25000, annual: 250000, symbol: '₦', name: 'Nigerian Naira' },
    GROWTH:  { monthly: 65000, annual: 650000, symbol: '₦', name: 'Nigerian Naira' },
    SCALE:   { monthly: 130000, annual: 1300000, symbol: '₦', name: 'Nigerian Naira' },
  },
  GHS: {
    STARTER: { monthly: 250, annual: 2500, symbol: 'GH₵', name: 'Ghanaian Cedi' },
    GROWTH:  { monthly: 650, annual: 6500, symbol: 'GH₵', name: 'Ghanaian Cedi' },
    SCALE:   { monthly: 1300, annual: 13000, symbol: 'GH₵', name: 'Ghanaian Cedi' },
  },
  KES: {
    STARTER: { monthly: 2500, annual: 25000, symbol: 'KSh', name: 'Kenyan Shilling' },
    GROWTH:  { monthly: 6500, annual: 65000, symbol: 'KSh', name: 'Kenyan Shilling' },
    SCALE:   { monthly: 13000, annual: 130000, symbol: 'KSh', name: 'Kenyan Shilling' },
  },
  ZAR: {
    STARTER: { monthly: 350, annual: 3500, symbol: 'R', name: 'South African Rand' },
    GROWTH:  { monthly: 900, annual: 9000, symbol: 'R', name: 'South African Rand' },
    SCALE:   { monthly: 1800, annual: 18000, symbol: 'R', name: 'South African Rand' },
  },
  USD: {
    STARTER: { monthly: 19, annual: 190, symbol: '$', name: 'US Dollar' },
    GROWTH:  { monthly: 49, annual: 490, symbol: '$', name: 'US Dollar' },
    SCALE:   { monthly: 99, annual: 990, symbol: '$', name: 'US Dollar' },
  },
};

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
