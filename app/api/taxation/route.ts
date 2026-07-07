import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

const addMonths = (date: Date, months: number): Date => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

// monthIndex is 0-based (0 = January); clamps the day to the last real day of that month
// (e.g. day 31 in a 30-day month) so an invalid date can't silently roll into the next month.
const makeYearEndDate = (year: number, monthIndex: number, day: number): Date => {
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0).getDate();
  return new Date(year, monthIndex, Math.min(day, lastDayOfMonth));
};

// Returns the most recently completed fiscal year-end for the business's configured
// year-end date (1-based month/day), defaulting to the common UK 31 March.
const getMostRecentUkFiscalYearEnd = (now: Date, month = 3, day = 31): Date => {
  const monthIndex = month - 1;
  const yearEndThisYear = makeYearEndDate(now.getFullYear(), monthIndex, day);
  return yearEndThisYear > now ? makeYearEndDate(now.getFullYear() - 1, monthIndex, day) : yearEndThisYear;
};

// UK VAT quarters follow the calendar (Mar/Jun/Sep/Dec end); returns the next upcoming quarter-end.
const getNextVatQuarterEnd = (now: Date): Date => {
  const quarterEnds: [number, number][] = [[2, 31], [5, 30], [8, 30], [11, 31]];
  for (const [month, day] of quarterEnds) {
    const candidate = new Date(now.getFullYear(), month, day);
    if (candidate >= now) return candidate;
  }
  return new Date(now.getFullYear() + 1, 2, 31);
};

const fiscalYearLabel = (yearEnd: Date) => `FY ${yearEnd.getFullYear() - 1}/${yearEnd.getFullYear().toString().slice(-2)}`;

export const GET = withMultiTenancy(async (req, { dataFilter, business }) => {
  try {
    const businessId = dataFilter.businessId;
    const fyMonth = business.fiscalYearEndMonth;
    const fyDay = business.fiscalYearEndDay;

    // Fetch relevant data for tax calculation
    const [invoices, expenses, employees, complianceItems] = await Promise.all([
      prisma.invoice.findMany({ 
        where: { businessId },
        include: { journalEntry: true } 
      }),
      prisma.expense.findMany({ 
        where: { businessId },
        include: { journalEntry: true } 
      }),
      prisma.employee.findMany({ 
        where: { businessId, status: 'ACTIVE' } 
      }),
      prisma.complianceItem.findMany({ 
        where: { businessId },
        orderBy: { dueDate: 'asc' }
      }),
    ]);

    // Calculate VAT (assuming 20% on all invoices and expenses for simplicity)
    const vatOutput = invoices.reduce((sum, inv) => sum + (inv.amount * 0.20), 0);
    const vatInput = expenses.reduce((sum, exp) => sum + (exp.amount * 0.20), 0);
    const vatLiability = Math.max(0, vatOutput - vatInput);

    // Calculate PAYE & NI (using basic estimates for UK 2024/25)
    // Monthly salary aggregation
    const totalMonthlySalary = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
    const payeNI = totalMonthlySalary * 0.338; // 20% tax + 13.8% employer NI estimate

    // Calculate Profit for Corporation Tax
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const profit = Math.max(0, totalRevenue - totalExpenses - (totalMonthlySalary * 12));
    const corporationTax = profit * 0.19;

    // Map compliance items to obligations
    let obligations = complianceItems.map(item => ({
      id: item.id,
      type: item.category,
      description: item.title,
      dueDate: item.dueDate,
      amount: 0,
      status: item.status.toLowerCase(),
      period: fiscalYearLabel(getMostRecentUkFiscalYearEnd(item.dueDate, fyMonth, fyDay))
    }));

    // If no real compliance items exist yet, show illustrative defaults computed
    // relative to today (not fixed historical dates) using standard UK deadlines:
    // Corporation Tax Return — 12 months after year-end; VAT Return — 1 month + 7 days
    // after quarter-end; PAYE/NI — 22nd of the month following the pay period.
    if (obligations.length === 0) {
      const now = new Date();

      const fyEnd = getMostRecentUkFiscalYearEnd(now, fyMonth, fyDay);
      const ctReturnDue = addMonths(fyEnd, 12);

      const vatQuarterEnd = getNextVatQuarterEnd(now);
      const vatDue = addMonths(vatQuarterEnd, 1);
      vatDue.setDate(vatDue.getDate() + 7);
      const vatQuarterLabel = `Q${Math.floor(vatQuarterEnd.getMonth() / 3) + 1} ${vatQuarterEnd.getFullYear()}`;

      const payePeriodDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const payeDue = new Date(now.getFullYear(), now.getMonth(), 22);
      if (payeDue < now) payeDue.setMonth(payeDue.getMonth() + 1);
      const payeMonthLabel = payePeriodDate.toLocaleString('en-GB', { month: 'long', year: 'numeric' });

      obligations = [
        {
          id: 'def-1',
          type: 'Corporation Tax',
          description: `CT600 Return for year ending ${fyEnd.toLocaleDateString('en-GB')}`,
          dueDate: ctReturnDue,
          amount: corporationTax,
          status: 'pending',
          period: fiscalYearLabel(fyEnd)
        },
        {
          id: 'def-2',
          type: 'VAT Return',
          description: `VAT Return ${vatQuarterLabel}`,
          dueDate: vatDue,
          amount: vatLiability,
          status: 'pending',
          period: vatQuarterLabel
        },
        {
          id: 'def-3',
          type: 'PAYE',
          description: `PAYE/NI Payment ${payeMonthLabel}`,
          dueDate: payeDue,
          amount: payeNI,
          status: 'pending',
          period: payeMonthLabel
        }
      ];
    }

    return NextResponse.json({
      summary: {
        corporationTax,
        vatLiability,
        payeNI,
        totalTaxLiability: corporationTax + vatLiability + payeNI,
        taxPaid: 0, 
        taxOutstanding: corporationTax + vatLiability + payeNI,
      },
      details: {
        totalRevenue,
        totalExpenses,
        totalMonthlySalary,
        employeeCount: employees.length,
        vatOutput,
        vatInput,
        profit
      },
      obligations,
      selfAssessment: {
        selfEmployment: totalRevenue - totalExpenses,
        employment: 0,
        property: 0,
        dividends: 0,
        expenses: totalExpenses
      }
    });
  } catch (error: unknown) {
    console.error('Taxation API error:', error);
    return NextResponse.json({ error: 'Failed to fetch taxation data' }, { status: 500 });
  }
});
