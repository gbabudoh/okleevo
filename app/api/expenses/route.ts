import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { journalizeExpense } from '@/lib/accounting/accounting';
import { resolveReceiptUrl } from '@/lib/services/minio';

export const GET = withMultiTenancy(async (req, { dataFilter }) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: {
        businessId: dataFilter.businessId,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // receipt is stored as a stable MinIO object key; resolve it to a
    // freshly-signed URL on every read so it never goes stale in the client.
    const withFreshReceipts = await Promise.all(
      expenses.map(async (exp) => ({ ...exp, receipt: await resolveReceiptUrl(exp.receipt) }))
    );

    return NextResponse.json(withFreshReceipts);
  } catch (error: unknown) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
});

export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const body = await req.json();
    const { title, amount, category, date, projectId, receipt, vatAmount } = body;

    const expense = await prisma.expense.create({
      data: {
        description: title,
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        projectId: projectId || null,
        receipt: receipt || null,
        vatAmount: (vatAmount !== undefined && vatAmount !== null && vatAmount !== '') ? parseFloat(vatAmount) : null,
        businessId: user.businessId,
        userId: user.id,
      },
    });

    let journalWarning: string | undefined;
    try {
      await journalizeExpense(expense.id);
    } catch (journalError) {
      console.error('Failed to journalize expense:', journalError);
      journalWarning = 'Expense recorded, but the accounting journal entry could not be created. Check the Accounting module.';
    }

    return NextResponse.json({ ...expense, warning: journalWarning });
  } catch (error: unknown) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
});
