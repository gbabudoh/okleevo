import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

// GET /api/projects/summary — Portfolio-level KPIs for the Projects list page
export const GET = withMultiTenancy(async (_req, { user }) => {
  try {
    const businessId = user.businessId;

    const projects = await prisma.project.findMany({
      where: { businessId },
      select: { id: true, status: true, dueDate: true },
    });

    const projectIds = projects.map(p => p.id);
    const now = new Date();

    const activeCount = projects.filter(p => p.status === 'ACTIVE').length;
    const onHoldCount = projects.filter(p => p.status === 'ON_HOLD').length;
    const completedCount = projects.filter(p => p.status === 'COMPLETED').length;
    const overdueCount = projects.filter(
      p => p.dueDate && p.dueDate < now && p.status !== 'COMPLETED' && p.status !== 'ARCHIVED'
    ).length;

    const [revenueByProject, expenseByProject, timeEntries] = await Promise.all([
      prisma.invoice.groupBy({
        by: ['projectId'],
        where: { businessId, status: 'PAID', projectId: { in: projectIds } },
        _sum: { amount: true },
      }),
      prisma.expense.groupBy({
        by: ['projectId'],
        where: { businessId, projectId: { in: projectIds } },
        _sum: { amount: true },
      }),
      prisma.timeEntry.findMany({
        where: { businessId, projectId: { in: projectIds } },
        select: { projectId: true, hoursLogged: true, employee: { select: { hourlyRate: true } } },
      }),
    ]);

    const revenueMap = new Map(revenueByProject.map(r => [r.projectId, r._sum.amount || 0]));
    const expenseMap = new Map(expenseByProject.map(r => [r.projectId, r._sum.amount || 0]));

    const laborMap = new Map<string, number>();
    for (const entry of timeEntries) {
      const rate = entry.employee?.hourlyRate || 0;
      laborMap.set(entry.projectId, (laborMap.get(entry.projectId) || 0) + entry.hoursLogged * rate);
    }

    let totalRevenue = 0;
    let totalExpenses = 0;
    let atRiskCount = 0;

    for (const p of projectIds) {
      const revenue = revenueMap.get(p) || 0;
      const expenses = (expenseMap.get(p) || 0) + (laborMap.get(p) || 0);
      totalRevenue += revenue;
      totalExpenses += expenses;
      if (revenue > 0 && revenue - expenses < 0) atRiskCount++;
    }

    return NextResponse.json({
      totalProjects: projects.length,
      activeCount,
      onHoldCount,
      completedCount,
      overdueCount,
      atRiskCount,
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
    });
  } catch (error) {
    console.error('Projects Summary GET Error:', error);
    return NextResponse.json({ error: 'Failed to calculate portfolio summary' }, { status: 500 });
  }
});
