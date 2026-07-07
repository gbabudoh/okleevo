import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (req, { dataFilter }) => {
  try {
    const reportType = req.nextUrl.searchParams.get('type');

    const reports = await prisma.taxReportDownload.findMany({
      where: {
        businessId: dataFilter.businessId,
        ...(reportType ? { reportType } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json(reports);
  } catch (error: unknown) {
    console.error('Error fetching tax report downloads:', error);
    return NextResponse.json({ error: 'Failed to fetch tax report downloads' }, { status: 500 });
  }
});

export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const body = await req.json();
    const { reportType, format, period, amount } = body;

    if (!reportType || !format || !period || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const report = await prisma.taxReportDownload.create({
      data: {
        businessId: user.businessId,
        userId: user.id,
        reportType,
        format,
        period,
        amount,
      },
    });

    return NextResponse.json(report);
  } catch (error: unknown) {
    console.error('Error logging tax report download:', error);
    return NextResponse.json({ error: 'Failed to log tax report download' }, { status: 500 });
  }
});
