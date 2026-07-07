import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (req, { dataFilter }) => {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'email query param is required' }, { status: 400 });
    }

    const businessId = dataFilter.businessId;

    const [contact, invoices, tickets] = await Promise.all([
      prisma.contact.findFirst({ where: { businessId, email } }),
      prisma.invoice.findMany({
        where: { businessId, clientEmail: email },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.ticket.findMany({
        where: { businessId, customerEmail: email },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return NextResponse.json({ contact, invoices, tickets });
  } catch (error) {
    console.error('CRM Context GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch client context' }, { status: 500 });
  }
});
