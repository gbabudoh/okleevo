import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (_req, { user, params }) => {
  try {
    const id = (await params).id as string;

    const form = await prisma.form.findFirst({
      where: { id, businessId: user.businessId },
      select: { id: true, name: true, fieldList: true },
    });
    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

    const responses = await prisma.formResponse.findMany({
      where: { formId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      fieldList: form.fieldList,
      responses: responses.map(r => ({
        id: r.id,
        data: r.data,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching form responses:', error);
    return NextResponse.json({ error: 'Failed to fetch form responses' }, { status: 500 });
  }
});
