import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { journalizeExpense, voidJournalEntry } from '@/lib/accounting/accounting';

export const PATCH = withMultiTenancy(async (req, { user, params }) => {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id as string;
    const body = await req.json();
    const { title, amount, category, date } = body;

    // Check ownership first
    const existing = await prisma.expense.findFirst({
      where: { id, businessId: user.businessId }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Expense not found or unauthorized' }, { status: 404 });
    }

    // A change to amount/category invalidates the posted journal entry — it's
    // never rewritten in place, only voided and reposted fresh, same as the
    // rest of the ledger.
    const amountChanged = amount !== undefined && parseFloat(amount) !== existing.amount;
    const categoryChanged = category !== undefined && category !== existing.category;
    const needsRepost = (amountChanged || categoryChanged) && !!existing.journalEntryId;

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        description: title,
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        category,
        date: date ? new Date(date) : undefined,
        ...(needsRepost && { journalEntryId: null }),
      },
    });

    let journalWarning: string | undefined;
    if (needsRepost) {
      try {
        await voidJournalEntry(existing.journalEntryId!);
        await journalizeExpense(expense.id);
      } catch (journalError) {
        console.error('Failed to re-journalize updated expense:', journalError);
        journalWarning = 'Expense updated, but its accounting journal entry could not be reposted. Check the Accounting module.';
      }
    }

    return NextResponse.json({ ...expense, warning: journalWarning });
  } catch (error: unknown) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
});

export const DELETE = withMultiTenancy(async (req, { user, params }) => {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id as string;

    // Check ownership first
    const existing = await prisma.expense.findFirst({
      where: { id, businessId: user.businessId }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Expense not found or unauthorized' }, { status: 404 });
    }

    let journalWarning: string | undefined;
    if (existing.journalEntryId) {
      try {
        await voidJournalEntry(existing.journalEntryId);
      } catch (journalError) {
        console.error('Failed to void journal entry for deleted expense:', journalError);
        journalWarning = 'Expense deleted, but its accounting journal entry could not be voided. Check the Accounting module.';
      }
    }

    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, warning: journalWarning });
  } catch (error: unknown) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
});
