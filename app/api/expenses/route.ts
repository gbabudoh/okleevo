import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

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

    return NextResponse.json(expenses);
  } catch (error: unknown) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
});

export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const body = await req.json();
    const { title, amount, category, date } = body;

    const expense = await prisma.expense.create({
      data: {
        description: title,
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        businessId: user.businessId,
        userId: user.id,
      },
    });

    return NextResponse.json(expense);
  } catch (error: unknown) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
});
