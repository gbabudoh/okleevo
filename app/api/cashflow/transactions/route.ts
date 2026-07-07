import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

// Quick income/expense entry from the Cashflow "New Transaction" modal.
// Income has no dedicated table — it's recorded as a paid Invoice so it flows
// into the same aggregation /api/cashflow already uses for real invoices.
export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const body = await req.json();
    const { type, description, amount, date, category } = body;

    if (!type || !description || typeof amount !== 'number' || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transactionDate = new Date(date);

    if (type === 'expense') {
      const expense = await prisma.expense.create({
        data: {
          businessId: user.businessId,
          userId: user.id,
          description,
          amount,
          category: category || 'Other',
          date: transactionDate,
        },
      });
      return NextResponse.json({ data: expense }, { status: 201 });
    }

    if (type === 'income') {
      const invoiceCount = await prisma.invoice.count({ where: { businessId: user.businessId } });
      const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, '0')}`;

      const invoice = await prisma.invoice.create({
        data: {
          number: invoiceNumber,
          businessId: user.businessId,
          userId: user.id,
          clientName: description,
          amount,
          category: category || 'Sales',
          items: [{ description, quantity: 1, price: amount }],
          dueDate: transactionDate,
          status: 'PAID',
          paidAt: transactionDate,
          createdAt: transactionDate,
        },
      });
      return NextResponse.json({ data: invoice }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
});
