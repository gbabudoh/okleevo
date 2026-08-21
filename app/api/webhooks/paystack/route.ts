import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PlanTier, SubscriptionStatus } from '@/lib/prisma-client';
import { verifyPaystackWebhookSignature } from '@/lib/paystack/client';
import { completePaystackSubscription } from '@/lib/paystack/billing';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature') || '';

    // Verify HMAC SHA512 signature
    const isValid = verifyPaystackWebhookSignature(signature, rawBody);
    if (!isValid) {
      console.warn('Invalid Paystack webhook signature rejected');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const data = event.data;

    switch (eventType) {
      case 'charge.success': {
        const reference = data.reference;
        if (reference) {
          await completePaystackSubscription(reference).catch((err) =>
            console.error('Error handling charge.success in webhook:', err)
          );
        }
        break;
      }

      case 'subscription.create': {
        const subCode = data.subscription_code;
        const customerCode = data.customer?.customer_code;
        const planCode = data.plan?.plan_code;
        const emailToken = data.email_token;

        if (customerCode) {
          await prisma.subscription.updateMany({
            where: { paystackCustomerCode: customerCode },
            data: {
              paystackSubscriptionCode: subCode,
              paystackPlanCode: planCode,
              paystackEmailToken: emailToken,
              status: SubscriptionStatus.ACTIVE,
            },
          });
        }
        break;
      }

      case 'subscription.disable':
      case 'subscription.not_renew': {
        const subCode = data.subscription_code;
        if (subCode) {
          await prisma.subscription.updateMany({
            where: { paystackSubscriptionCode: subCode },
            data: {
              cancelAtPeriodEnd: true,
            },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const subCode = data.subscription_code;
        if (subCode) {
          await prisma.subscription.updateMany({
            where: { paystackSubscriptionCode: subCode },
            data: {
              status: SubscriptionStatus.PAST_DUE,
            },
          });
        }
        break;
      }

      default:
        // Acknowledge other unhandled events safely
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Paystack webhook:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
