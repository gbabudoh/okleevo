import { NextRequest, NextResponse } from 'next/server';

// Get all invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // TODO: Fetch from database
    const mockInvoices = {
      data: [
        {
          id: 'INV-001',
          clientName: 'ABC Ltd',
          amount: 1250.00,
          currency: 'GBP',
          status: 'paid',
          dueDate: '2024-12-31',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'INV-002',
          clientName: 'XYZ Corp',
          amount: 850.50,
          currency: 'GBP',
          status: 'pending',
          dueDate: '2025-01-15',
          createdAt: new Date().toISOString(),
        },
      ],
      pagination: {
        page,
        limit,
        total: 2,
        totalPages: 1,
      },
      summary: {
        totalPaid: 1250.00,
        totalPending: 850.50,
        totalOverdue: 0,
      },
    };

    return NextResponse.json(mockInvoices);
  } catch (error) {
    console.error('Invoicing GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// Create new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientName, amount, items, dueDate } = body;

    if (!clientName || !amount) {
      return NextResponse.json(
        { error: 'Client name and amount are required' },
        { status: 400 }
      );
    }

    // TODO: Save to database
    const newInvoice = {
      id: `INV-${Date.now()}`,
      clientName,
      amount,
      currency: 'GBP',
      items: items || [],
      status: 'draft',
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error('Invoicing POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

// Update invoice
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // TODO: Update in database
    const updatedInvoice = {
      id,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error('Invoicing PUT Error:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

// Delete invoice
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // TODO: Delete from database
    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Invoicing DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
