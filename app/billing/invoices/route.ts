import { NextRequest, NextResponse } from 'next/server';

// Get billing invoices
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // TODO: Fetch from Stripe
    const mockInvoices = {
      data: [
        {
          id: 'in_' + Date.now(),
          number: 'INV-2024-001',
          amount: 1999,
          currency: 'gbp',
          status: 'paid',
          paidAt: new Date().toISOString(),
          periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          periodEnd: new Date().toISOString(),
          invoicePdf: 'https://invoice.stripe.com/mock-pdf',
          hostedInvoiceUrl: 'https://invoice.stripe.com/mock-url',
        },
        {
          id: 'in_' + (Date.now() - 1000),
          number: 'INV-2024-002',
          amount: 1999,
          currency: 'gbp',
          status: 'paid',
          paidAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          periodStart: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          periodEnd: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          invoicePdf: 'https://invoice.stripe.com/mock-pdf-2',
          hostedInvoiceUrl: 'https://invoice.stripe.com/mock-url-2',
        },
      ],
      hasMore: false,
    };

    return NextResponse.json(mockInvoices);
  } catch (error) {
    console.error('Get Invoices Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
