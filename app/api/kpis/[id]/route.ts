import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

function parseProgress(value?: string, target?: string): number | undefined {
  if (!value || !target) return undefined;
  const v = parseFloat(value.replace(/[^0-9.-]/g, ''));
  const t = parseFloat(target.replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(v) || !Number.isFinite(t) || t === 0) return undefined;
  return Math.min(100, Math.max(0, Math.round((v / t) * 100)));
}

const VALID_CATEGORIES = ['financial', 'sales', 'marketing', 'customer'];

export const PATCH = withMultiTenancy(async (req, { user, params }) => {
  try {
    const { id } = await params;
    const { name, value, target, category, ownerId } = await req.json();

    const existing = await prisma.kpiTarget.findFirst({
      where: { id: id as string, businessId: user.businessId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'KPI target not found' }, { status: 404 });
    }
    if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const updated = await prisma.kpiTarget.update({
      where: { id: id as string },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(value !== undefined && { value: value.trim() || '0' }),
        ...(target !== undefined && { target: target?.trim() || null }),
        ...(category !== undefined && { category }),
        ...(ownerId !== undefined && { ownerId: ownerId || null }),
      },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      value: updated.value,
      change: 0,
      changeType: 'neutral' as const,
      target: updated.target ?? undefined,
      progress: parseProgress(updated.value, updated.target ?? undefined),
      category: updated.category,
      iconName: updated.iconName,
      color: updated.color,
      gradient: updated.gradient,
      description: 'User-defined target metric',
      trend: [] as number[],
      ownerId: updated.ownerId ?? undefined,
      custom: true,
    });
  } catch (error) {
    console.error('Error updating KPI target:', error);
    return NextResponse.json({ error: 'Failed to update KPI target' }, { status: 500 });
  }
});

export const DELETE = withMultiTenancy(async (_req, { user, params }) => {
  try {
    const { id } = await params;

    const existing = await prisma.kpiTarget.findFirst({
      where: { id: id as string, businessId: user.businessId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'KPI target not found' }, { status: 404 });
    }

    await prisma.kpiTarget.delete({ where: { id: id as string } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting KPI target:', error);
    return NextResponse.json({ error: 'Failed to delete KPI target' }, { status: 500 });
  }
});
