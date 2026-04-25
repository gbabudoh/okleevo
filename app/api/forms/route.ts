import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { FormStatus } from '@/lib/prisma-client';

export const GET = withMultiTenancy(async (_req, { dataFilter }) => {
  try {
    const forms = await prisma.form.findMany({
      where: { businessId: dataFilter.businessId },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = forms.map(f => ({
      ...f,
      status: f.status.toLowerCase() as 'active' | 'draft' | 'closed',
      fields: Array.isArray(f.fieldList) ? (f.fieldList as unknown[]).length : 0,
      createdAt: f.createdAt.toISOString().split('T')[0],
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 });
  }
});

export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const body = await req.json();
    const { name, description, category, webhookUrl, fieldList, status } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Form name is required' }, { status: 400 });
    }

    const form = await prisma.form.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        category: category || 'Contact',
        webhookUrl: webhookUrl?.trim() || null,
        fieldList: Array.isArray(fieldList) ? fieldList : [],
        status: (status?.toUpperCase() as FormStatus) || 'ACTIVE',
        businessId: user.businessId,
        userId: user.id,
      },
    });

    return NextResponse.json({
      ...form,
      status: form.status.toLowerCase(),
      fields: Array.isArray(form.fieldList) ? (form.fieldList as unknown[]).length : 0,
      createdAt: form.createdAt.toISOString().split('T')[0],
    });
  } catch (error: unknown) {
    console.error('Error creating form:', error);
    return NextResponse.json({ 
      error: 'Failed to create form',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
});
