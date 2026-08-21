import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import type { SubscriptionStatus } from '@/lib/prisma-client';

export const TRIAL_DAYS = 14;
export const PLAN_AMOUNT = 3900; // $39.00 in cents
export const PLAN_LABEL = 'Okleevo — Starter Plan ($39/mo · 5 Seats Included)';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const stripeKey = process.env.STRIPE_SECRET_KEY;
export const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2023-10-16' }) : null;
export const PRICE_ID = process.env.STRIPE_SUBSCRIPTION_PRICE_ID || process.env.STRIPE_PRICE_ID || process.env.STRIPE_PRICE_STARTER_MONTHLY || '';

// ─────────────────────────────────────────────
// Customer + Trial setup (called at registration)
// ─────────────────────────────────────────────

export async function createStripeCustomer(params: {
  businessId: string;
  email: string;
  businessName: string;
}): Promise<string | null> {
  if (!stripe) return null;
  try {
    const customer = await stripe.customers.create({
      email: params.email,
      name: params.businessName,
      metadata: { businessId: params.businessId },
    });
    return customer.id;
  } catch (err) {
    console.error('[Billing] Failed to create Stripe customer:', err);
    return null;
  }
}

export async function createTrialRecord(
  businessId: string,
  stripeCustomerId: string | null,
): Promise<void> {
  const now = new Date();
  const trialEnd = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.subscription.upsert({
    where: { businessId },
    create: {
      businessId,
      stripeCustomerId,
      status: 'TRIAL',
      plan: 'Starter Plan',
      amount: PLAN_AMOUNT,
      currency: 'usd',
      currentPeriodStart: now,
      currentPeriodEnd: trialEnd,
      trialEnd,
    },
    update: {
      // If a record already exists (e.g. re-registration), just attach customer id
      ...(stripeCustomerId ? { stripeCustomerId } : {}),
    },
  });
}

// ─────────────────────────────────────────────
// Subscription status helper
// ─────────────────────────────────────────────

export type SubscriptionInfo = {
  status: string;
  isActive: boolean;
  daysLeft: number | null;
  trialEnd: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  amount: number;
  currency: string;
  plan: string | null;
  // Global pivot: set once a workspace has switched to a Starter/Growth/
  // Scale USD plan (see lib/stripe/global-billing.ts); null for every
  // legacy £9.99 subscriber, unchanged.
  planTier: string | null;
};

export async function getSubscriptionInfo(businessId: string): Promise<SubscriptionInfo> {
  const sub = await prisma.subscription.findUnique({ where: { businessId } });

  const fallback: SubscriptionInfo = {
    status: 'NONE',
    isActive: false,
    daysLeft: null,
    trialEnd: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    paymentProvider: 'STRIPE',
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    amount: PLAN_AMOUNT,
    currency: 'usd',
    plan: 'Starter Plan',
    planTier: null,
  };

  if (!sub) return fallback;

  const now = new Date();

  if (sub.status === 'TRIAL') {
    const end = sub.trialEnd ?? sub.currentPeriodEnd;
    const msLeft = end.getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
    return {
      status: 'TRIAL',
      isActive: msLeft > 0,
      daysLeft,
      trialEnd: end,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      paymentProvider: sub.paymentProvider || 'STRIPE',
      stripeCustomerId: sub.stripeCustomerId,
      stripeSubscriptionId: sub.stripeSubscriptionId,
      amount: sub.amount,
      currency: sub.currency || 'usd',
      plan: sub.plan || 'Starter Plan',
      planTier: sub.planTier,
    };
  }

  if (sub.status === 'ACTIVE') {
    return {
      status: 'ACTIVE',
      isActive: true,
      daysLeft: null,
      trialEnd: null,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      paymentProvider: sub.paymentProvider || 'STRIPE',
      stripeCustomerId: sub.stripeCustomerId,
      stripeSubscriptionId: sub.stripeSubscriptionId,
      amount: sub.amount,
      currency: sub.currency || 'usd',
      plan: sub.plan || 'Starter Plan',
      planTier: sub.planTier,
    };
  }

  return {
    ...fallback,
    status: sub.status,
    paymentProvider: sub.paymentProvider || 'STRIPE',
    planTier: sub.planTier,
    stripeCustomerId: sub.stripeCustomerId,
    stripeSubscriptionId: sub.stripeSubscriptionId,
    amount: sub.amount,
  };
}

// ─────────────────────────────────────────────
// Stripe Checkout (trial → paid)
// ─────────────────────────────────────────────

export async function createCheckoutSession(businessId: string): Promise<string> {
  if (!stripe) throw new Error('Stripe is not configured. Add STRIPE_SECRET_KEY to your .env file.');
  if (!PRICE_ID) throw new Error('Stripe price not set. Add STRIPE_SUBSCRIPTION_PRICE_ID or STRIPE_PRICE_ID to your .env.local file.');

  const sub = await prisma.subscription.findUnique({ where: { businessId } });
  let stripeCustomerId = sub?.stripeCustomerId;

  const ensureCustomer = async () => {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { users: { take: 1, orderBy: { createdAt: 'asc' } } },
    });
    if (business) {
      const newCustId = await createStripeCustomer({
        businessId,
        email: business.users[0]?.email || '',
        businessName: business.name,
      });
      if (newCustId) {
        await prisma.subscription.upsert({
          where: { businessId },
          create: {
            businessId,
            stripeCustomerId: newCustId,
            status: 'TRIAL',
            plan: 'Starter Plan',
            amount: PLAN_AMOUNT,
            currency: 'usd',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + TRIAL_DAYS * 86400000),
          },
          update: { stripeCustomerId: newCustId },
        });
        return newCustId;
      }
    }
    return null;
  };

  if (!stripeCustomerId) {
    stripeCustomerId = await ensureCustomer();
  }

  if (!stripeCustomerId) throw new Error('Could not create or find a Stripe customer for this workspace.');

  try {
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${APP_URL}/dashboard/settings?tab=billing&success=true`,
      cancel_url: `${APP_URL}/dashboard/settings?tab=billing&cancelled=true`,
      metadata: { businessId },
      subscription_data: { metadata: { businessId } },
    });

    if (!session.url) throw new Error('Checkout session URL missing.');
    return session.url;
  } catch (err: any) {
    // If the customer existed in live mode or was deleted, recreate in current mode and retry
    if (err?.message?.includes('No such customer') || err?.code === 'resource_missing') {
      const freshCustId = await ensureCustomer();
      if (!freshCustId) throw err;

      const session = await stripe.checkout.sessions.create({
        customer: freshCustId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: PRICE_ID, quantity: 1 }],
        success_url: `${APP_URL}/dashboard/settings?tab=billing&success=true`,
        cancel_url: `${APP_URL}/dashboard/settings?tab=billing&cancelled=true`,
        metadata: { businessId },
        subscription_data: { metadata: { businessId } },
      });

      if (!session.url) throw new Error('Checkout session URL missing.');
      return session.url;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────
// Stripe Customer Portal (manage / cancel)
// ─────────────────────────────────────────────

export async function createPortalSession(businessId: string): Promise<string> {
  if (!stripe) throw new Error('Stripe is not configured. Add STRIPE_SECRET_KEY to your .env file.');

  const sub = await prisma.subscription.findUnique({ where: { businessId } });
  let stripeCustomerId = sub?.stripeCustomerId;

  const ensureCustomer = async () => {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { users: { take: 1, orderBy: { createdAt: 'asc' } } },
    });
    if (business) {
      const newCustId = await createStripeCustomer({
        businessId,
        email: business.users[0]?.email || '',
        businessName: business.name,
      });
      if (newCustId) {
        await prisma.subscription.updateMany({
          where: { businessId },
          data: { stripeCustomerId: newCustId },
        });
        return newCustId;
      }
    }
    return null;
  };

  if (!stripeCustomerId) {
    stripeCustomerId = await ensureCustomer();
  }

  if (!stripeCustomerId) throw new Error('No Stripe customer found for this workspace.');

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${APP_URL}/dashboard/settings?tab=billing`,
    });
    return session.url;
  } catch (err: any) {
    if (err?.message?.includes('No such customer') || err?.code === 'resource_missing') {
      const freshCustId = await ensureCustomer();
      if (!freshCustId) throw err;
      const session = await stripe.billingPortal.sessions.create({
        customer: freshCustId,
        return_url: `${APP_URL}/dashboard/settings?tab=billing`,
      });
      return session.url;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────
// Webhook event handler
// ─────────────────────────────────────────────

export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    // Payment collected → activate subscription
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== 'subscription' || !session.subscription || !session.metadata?.businessId) break;

      const stripeSub = await stripe!.subscriptions.retrieve(session.subscription as string);
      await prisma.subscription.update({
        where: { businessId: session.metadata.businessId },
        data: {
          stripeSubscriptionId: stripeSub.id,
          stripePriceId: stripeSub.items.data[0]?.price.id ?? PRICE_ID,
          status: 'ACTIVE',
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          trialEnd: null,
        },
      });
      break;
    }

    // Renewal, plan change, or cancellation scheduled
    case 'customer.subscription.updated': {
      const s = event.data.object as Stripe.Subscription;
      const statusMap: Record<string, SubscriptionStatus> = {
        active: 'ACTIVE',
        past_due: 'PAST_DUE',
        incomplete: 'INCOMPLETE',
        canceled: 'CANCELED',
      };
      const newStatus = statusMap[s.status] ?? 'ACTIVE';

      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: s.id },
        data: {
          status: newStatus,
          cancelAtPeriodEnd: s.cancel_at_period_end,
          currentPeriodStart: new Date(s.current_period_start * 1000),
          currentPeriodEnd: new Date(s.current_period_end * 1000),
        },
      });
      break;
    }

    // User cancelled via portal → period ends, then deleted
    case 'customer.subscription.deleted': {
      const s = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: s.id },
        data: { status: 'CANCELED' },
      });
      break;
    }

    // Payment failed
    case 'invoice.payment_failed': {
      const inv = event.data.object as Stripe.Invoice;
      if (inv.subscription) {
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: inv.subscription as string },
          data: { status: 'PAST_DUE' },
        });
      }
      break;
    }
  }
}
