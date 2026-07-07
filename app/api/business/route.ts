import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (_req, { business }) => {
  return NextResponse.json({
    fiscalYearEndMonth: business.fiscalYearEndMonth,
    fiscalYearEndDay: business.fiscalYearEndDay,
  });
});

export const PATCH = withMultiTenancy(async (req, { dataFilter }) => {
  try {
    const { fiscalYearEndMonth, fiscalYearEndDay } = await req.json();
    const month = Number(fiscalYearEndMonth);
    const day = Number(fiscalYearEndDay);

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: 'Fiscal year end month must be between 1 and 12' }, { status: 400 });
    }
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      return NextResponse.json({ error: 'Fiscal year end day must be between 1 and 31' }, { status: 400 });
    }

    const business = await prisma.business.update({
      where: { id: dataFilter.businessId },
      data: { fiscalYearEndMonth: month, fiscalYearEndDay: day },
    });

    return NextResponse.json({
      fiscalYearEndMonth: business.fiscalYearEndMonth,
      fiscalYearEndDay: business.fiscalYearEndDay,
    });
  } catch (error) {
    console.error('Update business fiscal year end error:', error);
    return NextResponse.json({ error: 'Failed to update fiscal year end' }, { status: 500 });
  }
});
