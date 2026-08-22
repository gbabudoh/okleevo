import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (_req, { business }) => {
  const biz = business as any;
  return NextResponse.json({
    id: biz.id,
    name: biz.name,
    country: biz.country,
    currency: biz.currency || null,
    fiscalYearEndMonth: biz.fiscalYearEndMonth,
    fiscalYearEndDay: biz.fiscalYearEndDay,
    pivotNavEnabled: biz.pivotNavEnabled,
  });
});

export const PATCH = withMultiTenancy(async (req, { dataFilter, user }) => {
  try {
    const body = await req.json();
    const { fiscalYearEndMonth, fiscalYearEndDay, name, address, city, country, currency, pivotNavEnabled } = body;

    const data: Record<string, string | number | boolean> = {};

    // Global pivot: self-serve opt-in to the new 3-tab nav (Virtual HQ /
    // Async Productivity / Client Engagement). Same OWNER/ADMIN gate as the
    // other workspace-identity fields below — any member switching this for
    // the whole business needs to be someone who can actually decide that.
    if (pivotNavEnabled !== undefined) {
      if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (typeof pivotNavEnabled !== 'boolean') {
        return NextResponse.json({ error: 'pivotNavEnabled must be a boolean' }, { status: 400 });
      }
      data.pivotNavEnabled = pivotNavEnabled;
    }

    if (currency !== undefined) {
      if (user.role !== 'OWNER' && user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Only the Account Holder can change the operating currency.' }, { status: 403 });
      }
      if (typeof currency === 'string' && currency.trim()) {
        data.currency = currency.trim().toUpperCase();
      }
    }

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
      currency: (business as any).currency || 'GBP',
      pivotNavEnabled: business.pivotNavEnabled,
    });
  } catch (error) {
    console.error('Update business error:', error);
    return NextResponse.json({ error: 'Failed to update business' }, { status: 500 });
  }
});
