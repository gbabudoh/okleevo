import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { calculateCorporationTax, invoiceOutputVAT } from '@/lib/tax/uk-tax';

const RECENT_TRANSACTIONS_LIMIT = 30;

export const GET = withMultiTenancy(async (req, { dataFilter }) => {
  try {
    const businessId = dataFilter.businessId;

    // Fetch data for the current year (or last 12 months)
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    // Draft and cancelled invoices were never earned/sent and must not
    // inflate income, VAT, or tax figures (same rule Taxation applies).
    const [invoices, expenses, employees, cashAccounts] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          businessId,
          status: { notIn: ['DRAFT', 'CANCELED'] },
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
      }),
      prisma.employee.findMany({
        where: { businessId, status: 'ACTIVE' }
      }),
      prisma.ledgerAccount.findMany({
        where: { businessId, isCashAccount: true },
        include: { ledgerEntries: { where: { journalEntry: { status: 'POSTED' } } } }
      }),
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
        description: inv.clientName,
        amount: inv.amount,
        date: inv.createdAt,
        category: inv.category || 'Sales'
      })),
      ...expenses.map(exp => ({
        id: exp.id,
        type: 'expense',
        description: exp.description,
        amount: -exp.amount,
        date: exp.date,
        category: exp.category
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, RECENT_TRANSACTIONS_LIMIT);

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

    // Averages divide by the number of months that actually have activity —
    // a new business with 2 months of data shouldn't have its average
    // diluted by 10 empty months.
    const monthsWithActivity = Math.max(1, monthlyData.filter(m => m.income > 0 || m.expenses > 0).length);
    const totalIncome = invoices.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const avgMonthlyIncome = totalIncome / monthsWithActivity;
    const avgMonthlyExpenses = totalExpenses / monthsWithActivity;

    // Real cash balance: sum of POSTED ledger entries on accounts flagged as
    // a bank/cash account. No cash account posted to yet -> no fabricated
    // number, the frontend shows "N/A" instead.
    const hasCashAccount = cashAccounts.length > 0;
    const cashBalance = cashAccounts.reduce(
      (sum, acc) => sum + acc.ledgerEntries.reduce((s, e) => s + e.debit - e.credit, 0),
      0
    );

    // Real Corporation Tax & VAT estimates over this trailing-12-month window,
    // using the same formulas and profit definition as the Taxation module
    // (revenue - expenses - annual salaries), instead of a flat 25%/20% guess.
    const totalAnnualSalary = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
    const profit = Math.max(0, totalIncome - totalExpenses - totalAnnualSalary);
    const corporationTaxEstimate = calculateCorporationTax(profit).tax;

    const vatOutput = invoices.reduce((sum, inv) => sum + invoiceOutputVAT(inv.items), 0);
    const vatInput = expenses.reduce((sum, exp) => sum + (exp.vatAmount ?? exp.amount * 0.20), 0);
    const vatLiabilityEstimate = Math.max(0, vatOutput - vatInput);

    // Real period-over-period trend: compare the two most recent months that
    // actually have activity, rather than a hardcoded badge string.
    const activeMonths = monthlyData.filter(m => m.income > 0 || m.expenses > 0);
    const latestMonth = activeMonths[activeMonths.length - 1];
    const previousMonth = activeMonths[activeMonths.length - 2];

    const pctChange = (curr: number, prev: number): number | null => {
      if (prev === 0) return curr === 0 ? 0 : null;
      return ((curr - prev) / Math.abs(prev)) * 100;
    };
    const savingsRateOf = (m: { income: number, expenses: number }) =>
      m.income > 0 ? ((m.income - m.expenses) / m.income) * 100 : 0;

    const savingsRateChangePct = (latestMonth && previousMonth)
      ? pctChange(savingsRateOf(latestMonth), savingsRateOf(previousMonth))
      : null;
    const burnRateChangePct = (latestMonth && previousMonth)
      ? pctChange(latestMonth.expenses, previousMonth.expenses)
      : null;

    return NextResponse.json({
      monthlyData,
      recentTransactions: combinedTransactions,
      expenseCategories,
      summary: {
        totalIncome,
        totalExpenses,
        avgMonthlyIncome,
        avgMonthlyExpenses,
        cashBalance,
        hasCashAccount,
        corporationTaxEstimate,
        vatLiabilityEstimate,
        savingsRateChangePct,
        burnRateChangePct,
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
