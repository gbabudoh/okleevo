import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

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

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        description: title,
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        category,
        date: date ? new Date(date) : undefined,
      },
    });

    return NextResponse.json(expense);
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

    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
});
