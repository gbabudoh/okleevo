import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { journalizeInvoice, journalizeExpense } from '@/lib/accounting/accounting';

// Quick income/expense entry from the Cashflow "New Transaction" modal.
// Income has no dedicated table — it's recorded as a paid Invoice so it flows
// into the same aggregation /api/cashflow already uses for real invoices.
// Both branches post to the ledger the same way the Invoicing and Expenses
// modules do, so a quick entry here doesn't silently skip Accounting/VAT.
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

      let journalWarning: string | undefined;
      try {
        await journalizeExpense(expense.id);
      } catch (journalError) {
        console.error('Failed to journalize cashflow expense:', journalError);
        journalWarning = 'Transaction recorded, but the accounting journal entry could not be created. Check the Accounting module.';
      }

      return NextResponse.json({ data: expense, warning: journalWarning }, { status: 201 });
    }

    if (type === 'income') {
      const invoiceCount = await prisma.invoice.count({ where: { businessId: user.businessId } });
      const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, '0')}`;

      // items uses "rate" (not "price") to match the shape Taxation's VAT
      // calculation expects — vatRate is left unset, which defaults to the
      // app-wide 20% assumption applied to every other item without one.
      const invoice = await prisma.invoice.create({
        data: {
          number: invoiceNumber,
          businessId: user.businessId,
          userId: user.id,
          clientName: description,
          amount,
          category: category || 'Sales',
          items: [{ description, quantity: 1, rate: amount }],
          dueDate: transactionDate,
          status: 'PAID',
          paidAt: transactionDate,
          createdAt: transactionDate,
        },
      });

      let journalWarning: string | undefined;
      try {
        await journalizeInvoice(invoice.id);
      } catch (journalError) {
        console.error('Failed to journalize cashflow income:', journalError);
        journalWarning = 'Transaction recorded, but the accounting journal entry could not be created. Check the Accounting module.';
      }

      return NextResponse.json({ data: invoice, warning: journalWarning }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
});
