import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { journalizeInvoice, journalizeExpense, voidJournalEntry } from '@/lib/accounting/accounting';

// Cashflow "transactions" are really Invoices (income, always recorded PAID)
// or Expenses — see /api/cashflow/transactions for why. Every write here must
// keep the linked JournalEntry in sync: void it before any amount/type change
// or deletion, then re-post fresh — the same reversal-not-edit rule the
// Invoicing and Expenses modules follow, so this quick-edit path can't leave
// stale or dangling ledger entries behind.
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
    let journalWarning: string | undefined;

    if (originalType === type) {
      if (type === 'expense') {
        const existing = await prisma.expense.findFirst({ where: { id, businessId: user.businessId } });
        if (!existing) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

        if (existing.journalEntryId) {
          try {
            await voidJournalEntry(existing.journalEntryId);
          } catch (voidError) {
            console.error('Failed to void journal entry for edited expense:', voidError);
            journalWarning = 'Transaction updated, but its previous accounting entry could not be voided. Check the Accounting module.';
          }
        }

        const expense = await prisma.expense.update({
          where: { id },
          data: { description, amount: absAmount, category: category || 'Other', date: transactionDate, journalEntryId: null },
        });

        try {
          await journalizeExpense(expense.id);
        } catch (journalError) {
          console.error('Failed to journalize edited expense:', journalError);
          journalWarning = 'Transaction updated, but the accounting journal entry could not be created. Check the Accounting module.';
        }
      } else {
        const existing = await prisma.invoice.findFirst({ where: { id, businessId: user.businessId } });
        if (!existing) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

        if (existing.journalEntryId) {
          try {
            await voidJournalEntry(existing.journalEntryId);
          } catch (voidError) {
            console.error('Failed to void journal entry for edited income:', voidError);
            journalWarning = 'Transaction updated, but its previous accounting entry could not be voided. Check the Accounting module.';
          }
        }

        const invoice = await prisma.invoice.update({
          where: { id },
          data: {
            clientName: description, amount: absAmount, category: category || 'Sales',
            items: [{ description, quantity: 1, rate: absAmount }],
            dueDate: transactionDate, paidAt: transactionDate, createdAt: transactionDate,
            journalEntryId: null,
          },
        });

        try {
          await journalizeInvoice(invoice.id);
        } catch (journalError) {
          console.error('Failed to journalize edited income:', journalError);
          journalWarning = 'Transaction updated, but the accounting journal entry could not be created. Check the Accounting module.';
        }
      }
      return NextResponse.json({ success: true, warning: journalWarning });
    }

    // Type changed — move the record from one table to the other. Void the
    // old journal entry (the row it belonged to is being deleted) inside the
    // same transaction as the move, then journalize the new row afterward.
    const moved = await prisma.$transaction(async (tx) => {
      if (originalType === 'expense') {
        const existing = await tx.expense.findFirst({ where: { id, businessId: user.businessId } });
        if (!existing) return null;
        if (existing.journalEntryId) {
          await tx.journalEntry.update({ where: { id: existing.journalEntryId }, data: { status: 'VOID' } });
        }
        await tx.expense.deleteMany({ where: { id, businessId: user.businessId } });
        const invoiceCount = await tx.invoice.count({ where: { businessId: user.businessId } });
        const invoice = await tx.invoice.create({
          data: {
            number: `INV-${String(invoiceCount + 1).padStart(4, '0')}`,
            businessId: user.businessId,
            userId: user.id,
            clientName: description,
            amount: absAmount,
            category: category || 'Sales',
            items: [{ description, quantity: 1, rate: absAmount }],
            dueDate: transactionDate,
            status: 'PAID',
            paidAt: transactionDate,
            createdAt: transactionDate,
          },
        });
        return { kind: 'invoice' as const, id: invoice.id };
      } else {
        const existing = await tx.invoice.findFirst({ where: { id, businessId: user.businessId } });
        if (!existing) return null;
        if (existing.journalEntryId) {
          await tx.journalEntry.update({ where: { id: existing.journalEntryId }, data: { status: 'VOID' } });
        }
        await tx.invoice.deleteMany({ where: { id, businessId: user.businessId } });
        const expense = await tx.expense.create({
          data: {
            businessId: user.businessId,
            userId: user.id,
            description,
            amount: absAmount,
            category: category || 'Other',
            date: transactionDate,
          },
        });
        return { kind: 'expense' as const, id: expense.id };
      }
    });

    if (!moved) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    try {
      if (moved.kind === 'invoice') {
        await journalizeInvoice(moved.id);
      } else {
        await journalizeExpense(moved.id);
      }
    } catch (journalError) {
      console.error('Failed to journalize moved transaction:', journalError);
      journalWarning = 'Transaction type changed, but the new accounting journal entry could not be created. Check the Accounting module.';
    }

    return NextResponse.json({ success: true, warning: journalWarning });
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

    let journalWarning: string | undefined;

    if (type === 'expense') {
      const existing = await prisma.expense.findFirst({ where: { id, businessId: user.businessId } });
      if (existing?.journalEntryId) {
        try {
          await voidJournalEntry(existing.journalEntryId);
        } catch (voidError) {
          console.error('Failed to void journal entry for deleted expense:', voidError);
          journalWarning = 'Transaction deleted, but its accounting journal entry could not be voided. Check the Accounting module.';
        }
      }
      await prisma.expense.deleteMany({ where: { id, businessId: user.businessId } });
    } else if (type === 'income') {
      const existing = await prisma.invoice.findFirst({ where: { id, businessId: user.businessId } });
      if (existing?.journalEntryId) {
        try {
          await voidJournalEntry(existing.journalEntryId);
        } catch (voidError) {
          console.error('Failed to void journal entry for deleted income:', voidError);
          journalWarning = 'Transaction deleted, but its accounting journal entry could not be voided. Check the Accounting module.';
        }
      }
      await prisma.invoice.deleteMany({ where: { id, businessId: user.businessId } });
    } else {
      return NextResponse.json({ error: 'Missing or invalid type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, warning: journalWarning });
  } catch (error: unknown) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
});
