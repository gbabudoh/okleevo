import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (req, { dataFilter }) => {
  try {
    const businessId = dataFilter.businessId;

    // Fetch data for the current year (or last 12 months)
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    const [invoices, expenses] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          businessId,
          createdAt: { gte: oneYearAgo }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.expense.findMany({
        where: {
          businessId,
          date: { gte: oneYearAgo }
        },
        orderBy: { date: 'desc' }
      })
    ]);

    // Aggregate monthly data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyDataMap: Record<string, { month: string, income: number, expenses: number, net: number }> = {};

    // Initialize map with last 12 months
    for (let i = 0; i < 12; i++) {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      const mLabel = months[d.getMonth()];
      const year = d.getFullYear();
      const key = `${mLabel} ${year}`;
      monthlyDataMap[key] = { month: mLabel, income: 0, expenses: 0, net: 0 };
    }

    invoices.forEach(inv => {
      const d = new Date(inv.createdAt);
      const mLabel = months[d.getMonth()];
      const key = `${mLabel} ${d.getFullYear()}`;
      if (monthlyDataMap[key]) {
        monthlyDataMap[key].income += inv.amount;
        monthlyDataMap[key].net += inv.amount;
      }
    });

    expenses.forEach(exp => {
      const d = new Date(exp.date);
      const mLabel = months[d.getMonth()];
      const key = `${mLabel} ${d.getFullYear()}`;
      if (monthlyDataMap[key]) {
        monthlyDataMap[key].expenses += exp.amount;
        monthlyDataMap[key].net -= exp.amount;
      }
    });

    const monthlyData = Object.values(monthlyDataMap).reverse();

    // Recent Transactions
    const combinedTransactions = [
      ...invoices.map(inv => ({
        id: inv.id,
        type: 'income',
        description: `Invoice: ${inv.number}`,
        amount: inv.amount,
        date: inv.createdAt,
        category: 'Sales'
      })),
      ...expenses.map(exp => ({
        id: exp.id,
        type: 'expense',
        description: exp.description,
        amount: -exp.amount,
        date: exp.date,
        category: exp.category
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    // Expense Categories Breakdown
    const categoryMap: Record<string, number> = {};
    let totalExpAmount = 0;
    expenses.forEach(exp => {
      categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;
      totalExpAmount += exp.amount;
    });

    const expenseCategories = Object.entries(categoryMap).map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpAmount > 0 ? Math.round((amount / totalExpAmount) * 100) : 0,
      color: getCategoryColor(name),
      icon: 'Building2' // Simplified for API
    })).sort((a, b) => b.amount - a.amount);

    return NextResponse.json({
      monthlyData,
      recentTransactions: combinedTransactions,
      expenseCategories,
      summary: {
        totalIncome: invoices.reduce((sum, i) => sum + i.amount, 0),
        totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
        avgMonthlyIncome: invoices.reduce((sum, i) => sum + i.amount, 0) / 12,
        avgMonthlyExpenses: expenses.reduce((sum, e) => sum + e.amount, 0) / 12,
      }
    });
  } catch (error: unknown) {
    console.error('Cashflow API error:', error);
    return NextResponse.json({ error: 'Failed to fetch cashflow data' }, { status: 500 });
  }
});

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    'Operations': 'from-blue-500 to-cyan-500',
    'Salaries': 'from-purple-500 to-pink-500',
    'Marketing': 'from-orange-500 to-red-500',
    'Technology': 'from-indigo-500 to-blue-500',
    'Other': 'from-green-500 to-emerald-500',
  };
  return colors[category] || 'from-gray-500 to-slate-500';
}
