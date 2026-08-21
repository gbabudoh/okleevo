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
  if (!trend || trend.length < 2) return 0;
  const current = trend[trend.length - 1];
  const previous = trend[trend.length - 2] || 0;
  if (previous === 0 && current === 0) return 0;
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

    const [business, history] = await Promise.all([
      prisma.business.findUnique({
        where: { id: businessId },
        select: { country: true, subscription: { select: { currency: true } } },
      }),
      getHistoricalData(businessId),
    ]);

    const rawCurrency = (business?.subscription?.currency || (business?.country === 'UK' ? 'gbp' : 'usd')).toUpperCase();
    const currencySymbols: Record<string, string> = {
      GBP: '$',
      USD: '$',
      EUR: '€',
      NGN: '₦',
      GHS: 'GH₵',
      KES: 'KSh ',
      ZAR: 'R ',
    };
    const sym = currencySymbols[rawCurrency] || '$';

    // Current Values
    const totalRevenue = history.revenue.reduce((acc, v) => acc + v, 0);
    const totalExpenses = history.expenses.reduce((acc, v) => acc + v, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    const totalOrders = history.orders.reduce((acc, v) => acc + v, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalLeads = history.leads.reduce((acc, v) => acc + v, 0);
    const totalCustomers = history.customers.reduce((acc, v) => acc + v, 0);

    // Dynamic targets derived from actual data
    const revenueTarget = totalRevenue > 0 ? totalRevenue * 1.1 : 0;
    const expenseTarget = totalExpenses > 0 ? totalExpenses * 0.9 : 0;
    const orderTarget = totalOrders > 0 ? Math.ceil(totalOrders * 1.1) : 0;
    const leadTarget = totalLeads > 0 ? Math.ceil(totalLeads * 1.1) : 0;
    const customerTarget = totalCustomers > 0 ? Math.ceil(totalCustomers * 1.1) : 0;

    const revChange = calculateChange(history.revenue);
    const profitTrend = history.revenue.map((r, i) => {
      const prof = r - history.expenses[i];
      return r > 0 ? (prof / r) * 100 : 0;
    });
    const marginChange = calculateChange(profitTrend);
    const expChange = calculateChange(history.expenses);
    const orderChange = calculateChange(history.orders);
    const aovTrend = history.orders.map((o, i) => (o > 0 ? history.revenue[i] / o : 0));
    const aovChange = calculateChange(aovTrend);
    const leadChange = calculateChange(history.leads);
    const custChange = calculateChange(history.customers);

    const kpis = [
      {
        id: 'rev-1',
        name: 'Total Revenue',
        value: `${sym}${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: revChange,
        changeType: (revChange > 0 ? 'increase' : revChange < 0 ? 'decrease' : 'neutral') as 'increase' | 'decrease' | 'neutral',
        target: revenueTarget > 0 ? `${sym}${Math.round(revenueTarget).toLocaleString()}` : undefined,
        progress: revenueTarget > 0 ? Math.min(Math.round((totalRevenue / revenueTarget) * 100), 100) : (totalRevenue > 0 ? 100 : 0),
        category: 'financial',
        iconName: 'DollarSign',
        color: 'green',
        gradient: 'from-green-500 to-emerald-500',
        unit: rawCurrency,
        description: 'Aggregate revenue from all paid invoices',
        trend: history.revenue,
      },
      {
        id: 'prof-1',
        name: 'Net Profit Margin',
        value: `${profitMargin.toFixed(1)}%`,
        change: marginChange,
        changeType: (marginChange > 0 ? 'increase' : marginChange < 0 ? 'decrease' : 'neutral') as 'increase' | 'decrease' | 'neutral',
        target: profitMargin > 0 ? '25%' : undefined,
        progress: profitMargin > 0 ? Math.min(Math.round((profitMargin / 25) * 100), 100) : 0,
        category: 'financial',
        iconName: 'Percent',
        color: 'emerald',
        gradient: 'from-emerald-500 to-teal-500',
        unit: '%',
        description: 'Operational efficiency and net profitability index',
        trend: profitTrend,
      },
      {
        id: 'exp-1',
        name: 'Operating Expenses',
        value: `${sym}${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: expChange,
        changeType: (expChange < 0 ? 'decrease' : expChange > 0 ? 'increase' : 'neutral') as 'increase' | 'decrease' | 'neutral',
        target: expenseTarget > 0 ? `${sym}${Math.round(expenseTarget).toLocaleString()}` : undefined,
        progress: expenseTarget > 0 ? Math.min(Math.round((totalExpenses / (totalExpenses * 1.1 || 1)) * 100), 100) : 0,
        category: 'financial',
        iconName: 'CreditCard',
        color: 'red',
        gradient: 'from-red-500 to-rose-500',
        unit: rawCurrency,
        description: 'Total recorded overhead and operational expenses',
        trend: history.expenses,
      },
      {
        id: 'sales-1',
        name: 'Total Sales Volume',
        value: totalOrders.toLocaleString(),
        change: orderChange,
        changeType: (orderChange > 0 ? 'increase' : orderChange < 0 ? 'decrease' : 'neutral') as 'increase' | 'decrease' | 'neutral',
        target: orderTarget > 0 ? orderTarget.toLocaleString() : undefined,
        progress: orderTarget > 0 ? Math.min(Math.round((totalOrders / orderTarget) * 100), 100) : (totalOrders > 0 ? 100 : 0),
        category: 'sales',
        iconName: 'ShoppingCart',
        color: 'blue',
        gradient: 'from-blue-500 to-indigo-500',
        unit: 'invoices',
        description: 'Total quantity of completed invoices and orders',
        trend: history.orders,
      },
      {
        id: 'aov-1',
        name: 'Avg Order Value',
        value: `${sym}${avgOrderValue.toFixed(2)}`,
        change: aovChange,
        changeType: (aovChange > 0 ? 'increase' : aovChange < 0 ? 'decrease' : 'neutral') as 'increase' | 'decrease' | 'neutral',
        target: avgOrderValue > 0 ? `${sym}${(avgOrderValue * 1.1).toFixed(2)}` : undefined,
        progress: avgOrderValue > 0 ? Math.min(Math.round((avgOrderValue / (avgOrderValue * 1.1)) * 100), 100) : 0,
        category: 'sales',
        iconName: 'ShoppingBag',
        color: 'indigo',
        gradient: 'from-indigo-500 to-purple-500',
        unit: rawCurrency,
        description: 'Average transaction value across finalized invoices',
        trend: aovTrend,
      },
      {
        id: 'lead-1',
        name: 'Lead Acquisition',
        value: totalLeads.toLocaleString(),
        change: leadChange,
        changeType: (leadChange > 0 ? 'increase' : leadChange < 0 ? 'decrease' : 'neutral') as 'increase' | 'decrease' | 'neutral',
        target: leadTarget > 0 ? leadTarget.toLocaleString() : undefined,
        progress: leadTarget > 0 ? Math.min(Math.round((totalLeads / leadTarget) * 100), 100) : (totalLeads > 0 ? 100 : 0),
        category: 'marketing',
        iconName: 'Target',
        color: 'fuchsia',
        gradient: 'from-fuchsia-500 to-pink-500',
        unit: 'leads',
        description: 'Active leads acquired in CRM pipeline',
        trend: history.leads,
      },
      {
        id: 'cust-1',
        name: 'Customer Base',
        value: totalCustomers.toLocaleString(),
        change: custChange,
        changeType: (custChange > 0 ? 'increase' : custChange < 0 ? 'decrease' : 'neutral') as 'increase' | 'decrease' | 'neutral',
        target: customerTarget > 0 ? customerTarget.toLocaleString() : undefined,
        progress: customerTarget > 0 ? Math.min(Math.round((totalCustomers / customerTarget) * 100), 100) : (totalCustomers > 0 ? 100 : 0),
        category: 'customer',
        iconName: 'Users',
        color: 'orange',
        gradient: 'from-orange-500 to-red-500',
        unit: 'clients',
        description: 'Total active customer contacts in CRM',
        trend: history.customers,
      },
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
