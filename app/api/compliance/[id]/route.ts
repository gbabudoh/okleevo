import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const PATCH = withMultiTenancy(async (req, { dataFilter, params }) => {
  const { id } = await params;
  try {
    const data = await req.json();
    const { title, description, dueDate, category, status } = data;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) {
      const s = status.toUpperCase().replace('-', '_');
      updateData.status = (s === 'COMPLIANT' || s === 'COMPLETED') ? 'COMPLETED' : s === 'OVERDUE' ? 'OVERDUE' : 'PENDING';
      if (updateData.status === 'COMPLETED') updateData.completedAt = new Date();
    }

    const item = await prisma.complianceItem.update({
      where: { id: id as string, businessId: dataFilter.businessId },
      data: updateData,
    });

    return NextResponse.json({
      ...item,
      status: item.status.toLowerCase().replace('_', '-'),
    });
  } catch (error) {
    console.error('Error updating compliance item:', error);
    return NextResponse.json({ error: 'Failed to update compliance item' }, { status: 500 });
  }
});

export const DELETE = withMultiTenancy(async (_req, { dataFilter, params }) => {
  const { id } = await params;
  try {
    await prisma.complianceItem.delete({
      where: { id: id as string, businessId: dataFilter.businessId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting compliance item:', error);
    return NextResponse.json({ error: 'Failed to delete compliance item' }, { status: 500 });
  }
});
