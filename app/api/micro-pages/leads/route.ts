import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (_req, { dataFilter }) => {
  try {
    const leads = await prisma.microPageLead.findMany({
      where: { businessId: dataFilter.businessId },
      include: { microPage: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error('Micro Page Leads GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
});
