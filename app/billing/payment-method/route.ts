import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe/client";
import Stripe from 'stripe';

// Get payment methods
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const businessId = (session.user as { businessId: string }).businessId;

    const subscription = await prisma.subscription.findUnique({
      where: { businessId },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ data: [] });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: subscription.stripeCustomerId,
      type: 'card',
    });

    // Also fetch customer to see default payment method
    const customer = await stripe.customers.retrieve(subscription.stripeCustomerId);
    
    if (customer.deleted) {
      return NextResponse.json({ data: [] });
    }

    const stripeCustomer = customer as Stripe.Customer;
    const defaultPmId = stripeCustomer.invoice_settings?.default_payment_method;

    const data = paymentMethods.data.map(pm => ({
      id: pm.id,
      type: pm.type,
      card: {
        brand: pm.card?.brand,
        last4: pm.card?.last4,
        expMonth: pm.card?.exp_month,
        expYear: pm.card?.exp_year,
      },
      isDefault: pm.id === defaultPmId,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Get Payment Methods Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

// Add payment method
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { paymentMethodId } = body;

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // TODO: Attach payment method to customer in Stripe
    // TODO: Set as default if requested

    return NextResponse.json({
      success: true,
      message: 'Payment method added successfully',
    });
  } catch (error) {
    console.error('Add Payment Method Error:', error);
    return NextResponse.json(
      { error: 'Failed to add payment method' },
      { status: 500 }
    );
  }
}

// Update default payment method
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { paymentMethodId } = body;

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // TODO: Update default payment method in Stripe

    return NextResponse.json({
      success: true,
      message: 'Default payment method updated',
    });
  } catch (error) {
    console.error('Update Payment Method Error:', error);
    return NextResponse.json(
      { error: 'Failed to update payment method' },
      { status: 500 }
    );
  }
}

// Delete payment method
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const paymentMethodId = searchParams.get('id');

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // TODO: Detach payment method from customer in Stripe

    return NextResponse.json({
      success: true,
      message: 'Payment method removed',
    });
  } catch (error) {
    console.error('Delete Payment Method Error:', error);
    return NextResponse.json(
      { error: 'Failed to remove payment method' },
      { status: 500 }
    );
  }
}
