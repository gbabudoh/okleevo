import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

async function getHistoricalData(businessId: string) {
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return {
      label: d.toLocaleString('default', { month: 'short' }),
      start: d,
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
    };
  }).reverse();

  const [revenueTrend, expenseTrend, orderTrend, leadTrend, customerTrend] = await Promise.all([
    Promise.all(months.map(m => prisma.invoice.aggregate({
      where: { businessId, status: 'PAID', createdAt: { gte: m.start, lte: m.end } },
      _sum: { amount: true }
    }))),
    Promise.all(months.map(m => prisma.expense.aggregate({
      where: { businessId, createdAt: { gte: m.start, lte: m.end } },
      _sum: { amount: true }
    }))),
    Promise.all(months.map(m => prisma.invoice.count({
      where: { businessId, createdAt: { gte: m.start, lte: m.end } }
    }))),
    Promise.all(months.map(m => prisma.contact.count({
      where: { businessId, status: 'LEAD', createdAt: { gte: m.start, lte: m.end } }
    }))),
    Promise.all(months.map(m => prisma.contact.count({
      where: { businessId, status: 'CUSTOMER', createdAt: { gte: m.start, lte: m.end } }
    })))
  ]);

  return {
    labels: months.map(m => m.label),
    revenue: revenueTrend.map(r => r._sum.amount || 0),
    expenses: expenseTrend.map(e => e._sum.amount || 0),
    orders: orderTrend,
    leads: leadTrend,
    customers: customerTrend
  };
}

function calculateChange(trend: number[]) {
  const current = trend[trend.length - 1];
  const previous = trend[trend.length - 2] || 0;
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function parseProgress(value?: string, target?: string): number | undefined {
  if (!value || !target) return undefined;
  const v = parseFloat(value.replace(/[^0-9.-]/g, ''));
  const t = parseFloat(target.replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(v) || !Number.isFinite(t) || t === 0) return undefined;
  return Math.min(100, Math.max(0, Math.round((v / t) * 100)));
}

export const GET = withMultiTenancy(async (_req, { dataFilter }) => {
  try {
    const businessId = dataFilter.businessId;
    const history = await getHistoricalData(businessId);

    // Current Values
    const totalRevenue = history.revenue.reduce((acc, v) => acc + v, 0);
    const totalExpenses = history.expenses.reduce((acc, v) => acc + v, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    const totalOrders = history.orders.reduce((acc, v) => acc + v, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalLeads = history.leads.reduce((acc, v) => acc + v, 0);
    const totalCustomers = history.customers.reduce((acc, v) => acc + v, 0);

    // Dynamic targets based on current performance (with 10% safety margin)
    // If no data, target is 0 (clean slate)
    const revenueTarget = totalRevenue > 0 ? totalRevenue * 1.1 : 0;
    const expenseTarget = totalExpenses > 0 ? totalExpenses * 0.9 : 0;
    const orderTarget = totalOrders > 0 ? Math.ceil(totalOrders * 1.1) : 0;
    const leadTarget = totalLeads > 0 ? Math.ceil(totalLeads * 1.1) : 0;
    const customerTarget = totalCustomers > 0 ? Math.ceil(totalCustomers * 1.1) : 0;

    const kpis = [
      {
        id: 'rev-1',
        name: 'Total Revenue',
        value: `$${totalRevenue.toLocaleString()}`,
        change: calculateChange(history.revenue),
        changeType: calculateChange(history.revenue) >= 0 ? 'increase' : 'decrease',
        target: `$${Math.round(revenueTarget).toLocaleString()}`,
        progress: revenueTarget > 0 ? Math.min(Math.round((totalRevenue / revenueTarget) * 100), 100) : 0,
        category: 'financial',
        iconName: 'DollarSign',
        color: 'green',
        gradient: 'from-green-500 to-emerald-500',
        unit: 'USD',
        description: 'Aggregate revenue from all paid data streams',
        trend: history.revenue
      },
      {
        id: 'prof-1',
        name: 'Net Profit Margin',
        value: `${profitMargin.toFixed(1)}%`,
        change: calculateChange(history.revenue.map((r, i) => r - history.expenses[i])),
        changeType: calculateChange(history.revenue.map((r, i) => r - history.expenses[i])) >= 0 ? 'increase' : 'decrease',
        target: '25%',
        progress: Math.min(Math.round((profitMargin / 25) * 100), 100),
        category: 'financial',
        iconName: 'Percent',
        color: 'emerald',
        gradient: 'from-emerald-500 to-teal-500',
        unit: '%',
        description: 'Operational efficiency and profitability index',
        trend: history.revenue.map((r, i) => {
          const prof = r - history.expenses[i];
          return r > 0 ? (prof / r) * 100 : 0;
        })
      },
      {
        id: 'exp-1',
        name: 'Operating Expenses',
        value: `$${totalExpenses.toLocaleString()}`,
        change: calculateChange(history.expenses),
        changeType: calculateChange(history.expenses) <= 0 ? 'decrease' : 'increase',
        target: `$${Math.round(expenseTarget).toLocaleString()}`,
        progress: expenseTarget > 0 ? Math.min(Math.round((totalExpenses / (totalExpenses * 1.1)) * 100), 100) : 0,
        category: 'financial',
        iconName: 'CreditCard',
        color: 'red',
        gradient: 'from-red-500 to-rose-500',
        unit: 'USD',
        description: 'Total overhead and resource consumption',
        trend: history.expenses
      },
      {
        id: 'sales-1',
        name: 'Total Sales Volume',
        value: totalOrders.toLocaleString(),
        change: calculateChange(history.orders),
        changeType: calculateChange(history.orders) >= 0 ? 'increase' : 'decrease',
        target: orderTarget.toLocaleString(),
        progress: orderTarget > 0 ? Math.min(Math.round((totalOrders / orderTarget) * 100), 100) : 0,
        category: 'sales',
        iconName: 'ShoppingCart',
        color: 'blue',
        gradient: 'from-blue-500 to-indigo-500',
        unit: 'units',
        description: 'Total quantity of finalized transactions',
        trend: history.orders
      },
      {
        id: 'aov-1',
        name: 'Avg Order Value',
        value: `$${avgOrderValue.toFixed(2)}`,
        change: calculateChange(history.orders.map((o, i) => o > 0 ? history.revenue[i] / o : 0)),
        changeType: 'increase',
        target: '$100.00',
        progress: Math.min(Math.round((avgOrderValue / 100) * 100), 100),
        category: 'sales',
        iconName: 'ShoppingBag',
        color: 'indigo',
        gradient: 'from-indigo-500 to-purple-500',
        unit: 'USD',
        description: 'Average revenue generated per transaction',
        trend: history.orders.map((o, i) => o > 0 ? history.revenue[i] / o : 0)
      },
      {
        id: 'lead-1',
        name: 'Lead Acquisition',
        value: totalLeads.toLocaleString(),
        change: calculateChange(history.leads),
        changeType: calculateChange(history.leads) >= 0 ? 'increase' : 'decrease',
        target: leadTarget.toLocaleString(),
        progress: leadTarget > 0 ? Math.min(Math.round((totalLeads / leadTarget) * 100), 100) : 0,
        category: 'marketing',
        iconName: 'Target',
        color: 'fuchsia',
        gradient: 'from-fuchsia-500 to-pink-500',
        unit: 'leads',
        description: 'New potential assets identified',
        trend: history.leads
      },
      {
        id: 'cust-1',
        name: 'Customer Base',
        value: totalCustomers.toLocaleString(),
        change: calculateChange(history.customers),
        changeType: calculateChange(history.customers) >= 0 ? 'increase' : 'decrease',
        target: customerTarget.toLocaleString(),
        progress: customerTarget > 0 ? Math.min(Math.round((totalCustomers / customerTarget) * 100), 100) : 0,
        category: 'customer',
        iconName: 'Users',
        color: 'orange',
        gradient: 'from-orange-500 to-red-500',
        unit: 'entities',
        description: 'Total active nodes in the customer network',
        trend: history.customers
      }
    ];

    const custom = await prisma.kpiTarget.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });

    const customKpis = custom.map(k => ({
      id: k.id,
      name: k.name,
      value: k.value,
      change: 0,
      changeType: 'neutral' as const,
      target: k.target ?? undefined,
      progress: parseProgress(k.value, k.target ?? undefined),
      category: k.category,
      iconName: k.iconName,
      color: k.color,
      gradient: k.gradient,
      description: 'User-defined target metric',
      trend: [] as number[],
      ownerId: k.ownerId ?? undefined,
      custom: true,
    }));

    const trendLabels = history.labels;

    return NextResponse.json({ kpis: [...kpis, ...customKpis], trendLabels });
  } catch (error) {
    console.error('Error generating live KPIs:', error);
    return NextResponse.json({ error: 'Data synthesis failure' }, { status: 500 });
  }
});

const VALID_CATEGORIES = ['financial', 'sales', 'marketing', 'customer'];

export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const { name, value, target, category, ownerId } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const created = await prisma.kpiTarget.create({
      data: {
        businessId: user.businessId,
        name: name.trim(),
        value: value?.trim() || '0',
        target: target?.trim() || null,
        category,
        ownerId: ownerId || null,
      },
    });

    return NextResponse.json({
      id: created.id,
      name: created.name,
      value: created.value,
      change: 0,
      changeType: 'neutral' as const,
      target: created.target ?? undefined,
      progress: parseProgress(created.value, created.target ?? undefined),
      category: created.category,
      iconName: created.iconName,
      color: created.color,
      gradient: created.gradient,
      description: 'User-defined target metric',
      trend: [] as number[],
      ownerId: created.ownerId ?? undefined,
      custom: true,
    });
  } catch (error) {
    console.error('Error creating KPI target:', error);
    return NextResponse.json({ error: 'Failed to create KPI target' }, { status: 500 });
  }
});
