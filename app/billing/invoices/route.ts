import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe/client";

// Get billing invoices
export async function GET(request: NextRequest) {
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
      return NextResponse.json({ data: [], hasMore: false });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const invoices = await stripe.invoices.list({
      customer: subscription.stripeCustomerId,
      limit,
    });

    const data = invoices.data.map(inv => ({
      id: inv.id,
      number: inv.number,
      amount: inv.amount_paid || inv.total,
      currency: inv.currency,
      status: inv.status,
      paidAt: inv.status === 'paid' ? new Date(inv.status_transitions.paid_at! * 1000).toISOString() : null,
      periodStart: new Date(inv.period_start * 1000).toISOString(),
      periodEnd: new Date(inv.period_end * 1000).toISOString(),
      invoicePdf: inv.invoice_pdf,
      hostedInvoiceUrl: inv.hosted_invoice_url,
    }));

    return NextResponse.json({ 
      data,
      hasMore: invoices.has_more,
    });
  } catch (error) {
    console.error('Get Invoices Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
