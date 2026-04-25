import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (req, { dataFilter }) => {
  try {
    const businessId = dataFilter.businessId;

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
      period: 'FY 2024/25'
    }));

    // If no obligations, provide some defaults based on UK tax calendar
    if (obligations.length === 0) {
      obligations = [
        {
          id: 'def-1',
          type: 'Corporation Tax',
          description: 'CT600 Return for year ending 31/03/2024',
          dueDate: new Date('2025-01-01'),
          amount: corporationTax,
          status: 'pending',
          period: 'FY 2023/24'
        },
        {
          id: 'def-2',
          type: 'VAT Return',
          description: 'VAT Return Q4 2024',
          dueDate: new Date('2025-02-07'),
          amount: vatLiability,
          status: 'pending',
          period: 'Q4 2024'
        },
        {
          id: 'def-3',
          type: 'PAYE',
          description: 'PAYE/NI Payment December 2024',
          dueDate: new Date('2025-01-22'),
          amount: payeNI,
          status: 'pending',
          period: 'Dec 2024'
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
