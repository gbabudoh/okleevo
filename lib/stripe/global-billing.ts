import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { stripe, createStripeCustomer } from './billing';

/**
 * Global pivot: USD tiered pricing (Starter/Growth/Scale), layered on top of
 * the legacy flat £9.99 plan without touching it. Existing subscribers keep
 * their current Subscription row (plan: 'all-in-one', currency: 'gbp')
 * completely untouched — this module only ever runs for a workspace that
 * explicitly starts a checkout session below, which sets
 * Subscription.planTier and is the one signal the rest of the codebase uses
 * to tell the two billing systems apart (see
 * lib/stripe/per-seat-billing.ts's syncSubscriptionWithSeats, which checks
 * planTier to decide which seat-sync path to use).
 *
 * Deliberately reuses the existing `stripe` client and `createStripeCustomer`
 * from ./billing rather than a second Stripe instance, so there's exactly
 * one place the SDK is configured.
 */

export type PlanTier = 'STARTER' | 'GROWTH' | 'SCALE';
export type BillingPeriod = 'monthly' | 'annual';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface TierConfig {
  includedSeats: number;
  priceEnvVars: Record<BillingPeriod, string>;
  seatAddonPriceEnvVar: string;
}

// Seat allotments match the pivot's published pricing (Starter 5 / Growth 12
// / Scale 25 included seats, priced per seat beyond that). Actual dollar
// amounts live in Stripe (via the price ids below), never duplicated here —
// the legacy billing.ts's PLAN_AMOUNT/schema-default mismatch this codebase
// already has is exactly the kind of drift this design avoids.
const TIER_CONFIG: Record<PlanTier, TierConfig> = {
  STARTER: {
    includedSeats: 5,
    priceEnvVars: { monthly: 'STRIPE_PRICE_STARTER_MONTHLY', annual: 'STRIPE_PRICE_STARTER_ANNUAL' },
    seatAddonPriceEnvVar: 'STRIPE_PRICE_STARTER_SEAT_ADDON',
  },
  GROWTH: {
    includedSeats: 12,
    priceEnvVars: { monthly: 'STRIPE_PRICE_GROWTH_MONTHLY', annual: 'STRIPE_PRICE_GROWTH_ANNUAL' },
    seatAddonPriceEnvVar: 'STRIPE_PRICE_GROWTH_SEAT_ADDON',
  },
  SCALE: {
    includedSeats: 25,
    priceEnvVars: { monthly: 'STRIPE_PRICE_SCALE_MONTHLY', annual: 'STRIPE_PRICE_SCALE_ANNUAL' },
    seatAddonPriceEnvVar: 'STRIPE_PRICE_SCALE_SEAT_ADDON',
  },
};

export function getTierConfig(tier: PlanTier): TierConfig {
  return TIER_CONFIG[tier];
}

function getGlobalPriceId(tier: PlanTier, period: BillingPeriod): string {
  const envVar = TIER_CONFIG[tier].priceEnvVars[period];
  const priceId = process.env[envVar];
  if (!priceId) throw new Error(`Missing Stripe price id — set ${envVar} to enable the ${tier} ${period} plan.`);
  return priceId;
}

function getSeatAddonPriceId(tier: PlanTier): string | null {
  return process.env[TIER_CONFIG[tier].seatAddonPriceEnvVar] || null;
}

/**
 * Records the chosen tier/price on our side ahead of redirecting to Stripe
 * Checkout. Reads the actual amount/currency back from the Stripe Price
 * object rather than hardcoding dollar figures here, so this can never drift
 * from what Stripe actually charges.
 */
async function recordChosenTier(businessId: string, tier: PlanTier, period: BillingPeriod, priceId: string) {
  if (!stripe) return;
  const price = await stripe.prices.retrieve(priceId);
  await prisma.subscription.update({
    where: { businessId },
    data: {
      planTier: tier,
      plan: `global-${tier.toLowerCase()}-${period}`,
      amount: price.unit_amount ?? 0,
      currency: price.currency,
    },
  });
}

/**
 * Starts a Stripe Checkout session for a Starter/Growth/Scale plan. Requires
 * a Subscription row to already exist for this business (created at
 * signup by the unmodified legacy onboarding flow) — this only ever runs
 * from an authenticated, already-onboarded workspace choosing to move onto
 * the new pricing, never from registration itself.
 */
export async function createGlobalCheckoutSession(
  businessId: string,
  tier: PlanTier,
  period: BillingPeriod,
): Promise<string> {
  if (!stripe) throw new Error('Stripe is not configured. Add STRIPE_SECRET_KEY to your .env file.');

  const priceId = getGlobalPriceId(tier, period);

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      subscription: true,
      users: { take: 1, orderBy: { createdAt: 'asc' }, select: { email: true } },
    },
  });
  if (!business) throw new Error('Workspace not found');

  let stripeCustomerId = business.subscription?.stripeCustomerId ?? null;
  if (!stripeCustomerId) {
    stripeCustomerId = await createStripeCustomer({
      businessId,
      email: business.users[0]?.email ?? '',
      businessName: business.name,
    });
  }
  if (!stripeCustomerId) throw new Error('Could not create a Stripe customer for this workspace.');

  const overageSeats = Math.max(0, business.seatCount - TIER_CONFIG[tier].includedSeats);
  const seatAddonPriceId = getSeatAddonPriceId(tier);

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [{ price: priceId, quantity: 1 }];
  if (overageSeats > 0 && seatAddonPriceId) {
    lineItems.push({ price: seatAddonPriceId, quantity: overageSeats });
  }

  await recordChosenTier(businessId, tier, period, priceId);

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: `${APP_URL}/dashboard/settings?tab=billing&success=true`,
    cancel_url: `${APP_URL}/dashboard/settings?tab=billing&cancelled=true`,
    metadata: { businessId, planTier: tier },
    subscription_data: { metadata: { businessId, planTier: tier } },
  });

  if (!session.url) throw new Error('Checkout session URL missing.');
  return session.url;
}

/**
 * Keeps the seat-addon line item quantity in sync with Business.seatCount
 * for a workspace already on a global tier. Called from
 * lib/stripe/per-seat-billing.ts's syncSubscriptionWithSeats, which is the
 * single existing trigger point (app/api/employees/**) for both billing
 * systems — this function only does anything if planTier is set and a
 * Stripe subscription already exists (i.e. checkout has completed).
 */
export async function syncGlobalSubscriptionSeats(businessId: string): Promise<void> {
  if (!stripe) return;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { subscription: true },
  });
  const sub = business?.subscription;
  if (!business || !sub?.planTier || !sub.stripeSubscriptionId) return;

  const tier = sub.planTier as PlanTier;
  const seatAddonPriceId = getSeatAddonPriceId(tier);
  if (!seatAddonPriceId) return;

  const overageSeats = Math.max(0, business.seatCount - TIER_CONFIG[tier].includedSeats);
  const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
  const existingItem = stripeSub.items.data.find((item) => item.price.id === seatAddonPriceId);

  if (overageSeats === 0) {
    if (existingItem) {
      await stripe.subscriptionItems.del(existingItem.id);
    }
    return;
  }

  if (existingItem) {
    await stripe.subscriptionItems.update(existingItem.id, {
      quantity: overageSeats,
      proration_behavior: 'always_invoice',
    });
  } else {
    await stripe.subscriptionItems.create({
      subscription: stripeSub.id,
      price: seatAddonPriceId,
      quantity: overageSeats,
      proration_behavior: 'always_invoice',
    });
  }
}
