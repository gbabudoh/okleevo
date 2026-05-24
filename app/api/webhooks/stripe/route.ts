import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, handleWebhookEvent } from '@/lib/stripe/billing';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!stripe) {
    console.error('[Webhook] Stripe not configured');
    return new NextResponse('Stripe not configured', { status: 500 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET not set');
    return new NextResponse('Webhook secret not configured', { status: 500 });
  }

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return new NextResponse('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Webhook] Signature verification failed: ${msg}`);
    return new NextResponse(`Webhook Error: ${msg}`, { status: 400 });
  }

  try {
    await handleWebhookEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Handler error:', error);
    return new NextResponse('Error handling event', { status: 500 });
  }
}
