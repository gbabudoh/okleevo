import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { handleStripeWebhook } from '@/lib/stripe/per-seat-billing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
  typescript: true,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature') as string;

    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET');
      return new NextResponse('Webhook secret is not set', { status: 500 });
    }

    if (!signature) {
      return new NextResponse('Missing stripe-signature header', { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`Webhook signature verification failed: ${errorMessage}`);
      return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
    }

    // Handle the event using our unified handler in lib/stripe
    try {
      await handleStripeWebhook(event);
      return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
    } catch (error) {
      console.error('Error handling webhook event:', error);
      return new NextResponse('Error handling event', { status: 500 });
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
