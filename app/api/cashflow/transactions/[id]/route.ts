import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

// Cashflow "transactions" are really Invoices (income) or Expenses (expense) —
// see /api/cashflow/transactions for why. Editing can also switch the type,
// which means moving the record from one table to the other.
export const PATCH = withMultiTenancy(async (req, { user, params }) => {
  try {
    const { id: rawId } = await params;
    const id = rawId as string;
    const body = await req.json();
    const { originalType, type, description, amount, date, category } = body;

    if (!originalType || !type || !description || typeof amount !== 'number' || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const absAmount = Math.abs(amount);
    const transactionDate = new Date(date);

    if (originalType === type) {
      if (type === 'expense') {
        await prisma.expense.updateMany({
          where: { id, businessId: user.businessId },
          data: { description, amount: absAmount, category: category || 'Other', date: transactionDate },
        });
      } else {
        await prisma.invoice.updateMany({
          where: { id, businessId: user.businessId },
          data: { clientName: description, amount: absAmount, category: category || 'Sales', dueDate: transactionDate, paidAt: transactionDate, createdAt: transactionDate },
        });
      }
      return NextResponse.json({ success: true });
    }

    // Type changed — move the record from one table to the other.
    await prisma.$transaction(async (tx) => {
      if (originalType === 'expense') {
        await tx.expense.deleteMany({ where: { id, businessId: user.businessId } });
        const invoiceCount = await tx.invoice.count({ where: { businessId: user.businessId } });
        await tx.invoice.create({
          data: {
            number: `INV-${String(invoiceCount + 1).padStart(4, '0')}`,
            businessId: user.businessId,
            userId: user.id,
            clientName: description,
            amount: absAmount,
            category: category || 'Sales',
            items: [{ description, quantity: 1, price: absAmount }],
            dueDate: transactionDate,
            status: 'PAID',
            paidAt: transactionDate,
            createdAt: transactionDate,
          },
        });
      } else {
        await tx.invoice.deleteMany({ where: { id, businessId: user.businessId } });
        await tx.expense.create({
          data: {
            businessId: user.businessId,
            userId: user.id,
            description,
            amount: absAmount,
            category: category || 'Other',
            date: transactionDate,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
});

export const DELETE = withMultiTenancy(async (req, { user, params }) => {
  try {
    const { id: rawId } = await params;
    const id = rawId as string;
    const type = req.nextUrl.searchParams.get('type');

    if (type === 'expense') {
      await prisma.expense.deleteMany({ where: { id, businessId: user.businessId } });
    } else if (type === 'income') {
      await prisma.invoice.deleteMany({ where: { id, businessId: user.businessId } });
    } else {
      return NextResponse.json({ error: 'Missing or invalid type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
});
