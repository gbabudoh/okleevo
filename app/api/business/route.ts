import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (_req, { business }) => {
  return NextResponse.json({
    fiscalYearEndMonth: business.fiscalYearEndMonth,
    fiscalYearEndDay: business.fiscalYearEndDay,
  });
});

export const PATCH = withMultiTenancy(async (req, { dataFilter, user }) => {
  try {
    const body = await req.json();
    const { fiscalYearEndMonth, fiscalYearEndDay, name, address, city, country } = body;

    const data: Record<string, string | number> = {};

    if (fiscalYearEndMonth !== undefined || fiscalYearEndDay !== undefined) {
      const month = Number(fiscalYearEndMonth);
      const day = Number(fiscalYearEndDay);
      if (!Number.isInteger(month) || month < 1 || month > 12) {
        return NextResponse.json({ error: 'Fiscal year end month must be between 1 and 12' }, { status: 400 });
      }
      if (!Number.isInteger(day) || day < 1 || day > 31) {
        return NextResponse.json({ error: 'Fiscal year end day must be between 1 and 31' }, { status: 400 });
      }
      data.fiscalYearEndMonth = month;
      data.fiscalYearEndDay = day;
    }

    if (name !== undefined || address !== undefined || city !== undefined || country !== undefined) {
      if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (name !== undefined) {
        if (typeof name !== 'string' || name.trim() === '') {
          return NextResponse.json({ error: 'Business name cannot be empty' }, { status: 400 });
        }
        data.name = name.trim();
      }
      if (address !== undefined) data.address = address;
      if (city !== undefined) data.city = city;
      if (country !== undefined) data.country = country;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const business = await prisma.business.update({
      where: { id: dataFilter.businessId },
      data,
    });

    return NextResponse.json({
      fiscalYearEndMonth: business.fiscalYearEndMonth,
      fiscalYearEndDay: business.fiscalYearEndDay,
      name: business.name,
      address: business.address,
      city: business.city,
      country: business.country,
    });
  } catch (error) {
    console.error('Update business error:', error);
    return NextResponse.json({ error: 'Failed to update business' }, { status: 500 });
  }
});
