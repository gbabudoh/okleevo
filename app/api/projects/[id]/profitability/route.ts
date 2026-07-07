import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (_req, { user, params }) => {
  try {
    const { id } = await params;
    const projectId = id as string;

    const project = await prisma.project.findFirst({
      where: { id: projectId, businessId: user.businessId },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const [revenueAgg, expenseAgg, timeEntries] = await Promise.all([
      prisma.invoice.aggregate({
        where: { projectId, businessId: user.businessId, status: 'PAID' },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { projectId, businessId: user.businessId },
        _sum: { amount: true },
      }),
      prisma.timeEntry.findMany({
        where: { projectId, businessId: user.businessId },
        include: { employee: { select: { id: true, firstName: true, lastName: true, hourlyRate: true } } },
      }),
    ]);

    const revenue = revenueAgg._sum.amount || 0;
    const expenses = expenseAgg._sum.amount || 0;

    const laborCost = timeEntries.reduce((sum, entry) => {
      const rate = entry.employee.hourlyRate || 0;
      return sum + entry.hoursLogged * rate;
    }, 0);

    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hoursLogged, 0);

    const netProfit = revenue - expenses - laborCost;
    const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    return NextResponse.json({
      revenue,
      expenses,
      laborCost,
      totalHours,
      netProfit,
      margin,
    });
  } catch (error) {
    console.error('Project Profitability GET Error:', error);
    return NextResponse.json({ error: 'Failed to calculate profitability' }, { status: 500 });
  }
});
