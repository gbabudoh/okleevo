import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (_req, { user, params }) => {
  try {
    const id = (await params).id as string;
    const form = await prisma.form.findFirst({
      where: { id, businessId: user.businessId },
    });
    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    return NextResponse.json({
      ...form,
      status: form.status.toLowerCase(),
      fields: Array.isArray(form.fieldList) ? (form.fieldList as unknown[]).length : 0,
      createdAt: form.createdAt.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 });
  }
});

export const PATCH = withMultiTenancy(async (req, { user, params }) => {
  try {
    const id = (await params).id as string;
    const body = await req.json();
    const { name, description, category, webhookUrl, fieldList, status } = body;

    const existing = await prisma.form.findFirst({
      where: { id, businessId: user.businessId },
    });
    if (!existing) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

    const form = await prisma.form.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(category !== undefined && { category }),
        ...(webhookUrl !== undefined && { webhookUrl: webhookUrl?.trim() || null }),
        ...(fieldList !== undefined && { fieldList }),
        ...(status !== undefined && { status: status.toUpperCase() as 'ACTIVE' | 'DRAFT' | 'CLOSED' }),
      },
    });

    return NextResponse.json({
      ...form,
      status: form.status.toLowerCase(),
      fields: Array.isArray(form.fieldList) ? (form.fieldList as unknown[]).length : 0,
      createdAt: form.createdAt.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
  }
});

export const DELETE = withMultiTenancy(async (_req, { user, params }) => {
  try {
    const id = (await params).id as string;
    const existing = await prisma.form.findFirst({
      where: { id, businessId: user.businessId },
    });
    if (!existing) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

    await prisma.form.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 });
  }
});
