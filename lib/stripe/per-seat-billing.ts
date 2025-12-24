import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { calculateTrialEndDate, TRIAL_PERIOD_DAYS } from '@/lib/utils/subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

/**
 * Stripe Per-Seat Billing Integration
 * Supports tiered pricing based on number of users
 */

// Price IDs from Stripe (configure these in your Stripe dashboard)
const PRICE_IDS = {
  TIER_1: process.env.STRIPE_PRICE_TIER_1 || '', // 1-10 users
  TIER_2: process.env.STRIPE_PRICE_TIER_2 || '', // 11-20 users
  TIER_3: process.env.STRIPE_PRICE_TIER_3 || '', // 21+ users
};

/**
 * Get the appropriate Stripe price ID based on seat count
 */
export function getPriceIdForSeats(seatCount: number): string {
  if (seatCount <= 10) return PRICE_IDS.TIER_1;
  if (seatCount <= 20) return PRICE_IDS.TIER_2;
  return PRICE_IDS.TIER_3;
}

/**
 * Create or update Stripe subscription with per-seat pricing
 */
export async function syncSubscriptionWithSeats(businessId: string, seatCount: number) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { 
      subscription: true,
      users: {
        take: 1,
        select: {
          email: true,
        },
      },
    },
  });

  if (!business) {
    throw new Error('Business not found');
  }

  // If no Stripe customer, create one
  if (!business.subscription?.stripeCustomerId) {
    const firstUserEmail = business.users && business.users.length > 0 
      ? business.users[0].email 
      : undefined;
    
    const customer = await stripe.customers.create({
      email: firstUserEmail,
      name: business.name,
      metadata: {
        businessId: business.id,
        clerkOrgId: business.clerkOrgId || '',
      },
    });

    const trialEndDate = calculateTrialEndDate();
    
    await prisma.subscription.create({
      data: {
        businessId: business.id,
        stripeCustomerId: customer.id,
        status: 'TRIAL',
        plan: 'all-in-one',
        amount: 1999, // Base price in pence
        currency: 'gbp',
        currentPeriodStart: new Date(),
        currentPeriodEnd: trialEndDate,
        trialEnd: trialEndDate,
      },
    });
  }

  const subscription = business.subscription!;
  const priceId = getPriceIdForSeats(seatCount);

  // Update seat count in database
  await prisma.business.update({
    where: { id: businessId },
    data: { seatCount },
  });

  // If subscription exists in Stripe, update it
  if (subscription.stripeSubscriptionId) {
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    // Update subscription items if price changed
    if (subscription.stripePriceId !== priceId) {
      await stripe.subscriptions.update(stripeSubscription.id, {
        items: [
          {
            id: stripeSubscription.items.data[0].id,
            price: priceId,
            quantity: seatCount, // Per-seat quantity
          },
        ],
        proration_behavior: 'always_invoice', // Charge immediately for seat changes
      });

      // Update subscription record
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          stripePriceId: priceId,
        },
      });
    } else {
      // Just update quantity
      await stripe.subscriptions.update(stripeSubscription.id, {
        items: [
          {
            id: stripeSubscription.items.data[0].id,
            quantity: seatCount,
          },
        ],
        proration_behavior: 'always_invoice',
      });
    }
  } else {
    // Create new subscription
    const newSubscription = await stripe.subscriptions.create({
      customer: subscription.stripeCustomerId!,
      items: [
        {
          price: priceId,
          quantity: seatCount,
        },
      ],
      trial_period_days: TRIAL_PERIOD_DAYS, // 14 days trial
      metadata: {
        businessId: business.id,
      },
    });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        stripeSubscriptionId: newSubscription.id,
        stripePriceId: priceId,
        status: 'TRIAL',
        currentPeriodStart: new Date(newSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(newSubscription.current_period_end * 1000),
        trialEnd: newSubscription.trial_end
          ? new Date(newSubscription.trial_end * 1000)
          : null,
      },
    });
  }
}

/**
 * Handle Stripe webhook for subscription updates
 */
export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription;
      const businessId = subscription.metadata.businessId;

      if (businessId) {
        const quantity = subscription.items.data[0]?.quantity || 1;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status === 'active' ? 'ACTIVE' : 'PAST_DUE',
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        await prisma.business.updateMany({
          where: { id: businessId },
          data: { seatCount: quantity },
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: 'CANCELED' },
      });
      break;
    }
  }
}

