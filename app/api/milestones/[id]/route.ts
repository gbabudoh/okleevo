import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const PATCH = withMultiTenancy(async (req, { user, params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, dueDate, completed } = body;

    const existing = await prisma.milestone.findFirst({ where: { id: id as string, businessId: user.businessId } });
    if (!existing) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });

    const milestone = await prisma.milestone.update({
      where: { id: id as string },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
        ...(completed !== undefined && { completed: !!completed }),
      },
    });

    return NextResponse.json(milestone);
  } catch (error) {
    console.error('Milestone PATCH Error:', error);
    return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 });
  }
});

export const DELETE = withMultiTenancy(async (_req, { user, params }) => {
  try {
    const { id } = await params;
    const { count } = await prisma.milestone.deleteMany({ where: { id: id as string, businessId: user.businessId } });
    if (count === 0) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Milestone DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete milestone' }, { status: 500 });
  }
});
