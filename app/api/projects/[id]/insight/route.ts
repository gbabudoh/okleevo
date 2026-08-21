import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

/**
 * Generates local project health and financial insights ($0 API cost).
 */
function generateProjectInsight(
  name: string,
  status: string,
  budget: number | null,
  revenue: number,
  totalExpenses: number,
  netProfit: number,
  margin: number,
  isOverdue: boolean
): string {
  const parts: string[] = [];

  if (isOverdue) {
    parts.push(`Project "${name}" is past its targeted completion date while currently in ${status} status.`);
  } else {
    parts.push(`Project "${name}" is actively tracking in ${status} status.`);
  }

  if (revenue > 0) {
    if (netProfit >= 0) {
      parts.push(
        `Financial position is healthy with $${revenue.toLocaleString()} billed against $${totalExpenses.toLocaleString()} in costs, yielding a ${margin.toFixed(1)}% profit margin ($${netProfit.toLocaleString()}).`
      );
    } else {
      parts.push(
        `Direct costs ($${totalExpenses.toLocaleString()}) have exceeded recognized revenue ($${revenue.toLocaleString()}), resulting in a current deficit of $${Math.abs(netProfit).toLocaleString()}.`
      );
    }
  } else {
    if (totalExpenses > 0) {
      parts.push(
        `$${totalExpenses.toLocaleString()} in project costs have been incurred with no billings recorded yet.`
      );
    } else {
      parts.push(`Initial milestone setup is underway with zero cost overruns recorded to date.`);
    }
  }

  if (budget !== null && totalExpenses > budget) {
    parts.push(`Recommendation: Project expenditure has exceeded the $${budget.toLocaleString()} budget ceiling; review scope deliverables immediately.`);
  } else if (isOverdue) {
    parts.push(`Recommendation: Prioritize closing outstanding milestone blockers or adjust the client schedule.`);
  } else {
    parts.push(`Recommendation: Maintain standard sprint velocity and verify milestone deliverables prior to phase close.`);
  }

  return parts.join(' ');
}

export const POST = withMultiTenancy(async (_req, { user, params }) => {
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
        include: { employee: { select: { hourlyRate: true } } },
      }),
    ]);

    const revenue = revenueAgg._sum.amount || 0;
    const rawExpenses = expenseAgg._sum.amount || 0;
    const laborCost = timeEntries.reduce((sum, entry) => sum + entry.hoursLogged * (entry.employee?.hourlyRate || 0), 0);
    const totalExpenses = rawExpenses + laborCost;
    const netProfit = revenue - totalExpenses;
    const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const isOverdue = !!(project.dueDate && project.dueDate < new Date() && project.status !== 'COMPLETED' && project.status !== 'ARCHIVED');

    const insight = generateProjectInsight(
      project.name,
      project.status,
      project.budget,
      revenue,
      totalExpenses,
      netProfit,
      margin,
      isOverdue
    );

    return NextResponse.json({
      insight,
      model: 'Local Project Health Engine (Zero API Cost)',
      latencyMs: 1,
    });
  } catch (error) {
    console.error('Project Insight Error:', error);
    return NextResponse.json({ error: 'Failed to generate insight' }, { status: 500 });
  }
});
