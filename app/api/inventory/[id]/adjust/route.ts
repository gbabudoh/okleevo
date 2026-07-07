import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

type AdjustmentType = 'IN' | 'OUT' | 'ADJUSTMENT';

export const POST = withMultiTenancy(async (req, { user, dataFilter, params }) => {
  const { id } = await params;
  try {
    const { type, quantity, reason } = await req.json();

    if (!['IN', 'OUT', 'ADJUSTMENT'].includes(type)) {
      return NextResponse.json({ error: 'type must be IN, OUT, or ADJUSTMENT' }, { status: 400 });
    }
    const delta = Number(quantity);
    if (!Number.isFinite(delta) || delta < 0) {
      return NextResponse.json({ error: 'quantity must be a non-negative number' }, { status: 400 });
    }

    const existing = await prisma.inventoryItem.findFirst({
      where: { id: id as string, businessId: dataFilter.businessId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const adjustmentType = type as AdjustmentType;
    const newQuantity = adjustmentType === 'IN' ? existing.quantity + delta
      : adjustmentType === 'OUT' ? Math.max(0, existing.quantity - delta)
      : delta; // ADJUSTMENT sets the absolute value (stocktake correction)

    // Same merge-against-stored-values formula as the fixed PUT /api/inventory/[id]
    // handler — always uses the item's real reorderPoint/maxQuantity, never a
    // hardcoded fallback.
    const rp = existing.reorderPoint;
    const mxq = existing.maxQuantity;
    const newStatus = newQuantity === 0 ? 'OUT_OF_STOCK'
      : newQuantity <= rp ? 'LOW_STOCK'
      : newQuantity >= mxq ? 'OVERSTOCKED' : 'IN_STOCK';

    const [item] = await prisma.$transaction([
      prisma.inventoryItem.update({
        where: { id: id as string, businessId: dataFilter.businessId },
        data: { quantity: newQuantity, status: newStatus },
      }),
      prisma.stockMovement.create({
        data: {
          businessId: dataFilter.businessId,
          itemId: id as string,
          type: adjustmentType,
          quantity: delta,
          reason: reason || undefined,
          userId: user.id,
        },
      }),
    ]);

    // Notify only when this adjustment crosses INTO low/out-of-stock — not on
    // every write to an item that was already low, which would spam alerts.
    if (existing.status !== newStatus && (newStatus === 'LOW_STOCK' || newStatus === 'OUT_OF_STOCK')) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          businessId: dataFilter.businessId,
          title: 'Low Stock Alert',
          message: `${item.name} is ${newStatus === 'OUT_OF_STOCK' ? 'out of stock' : 'running low'} (${item.quantity} left, reorder at ${item.reorderPoint ?? 10})`,
          type: 'warning',
          link: '/dashboard/inventory',
        },
      });
    }

    return NextResponse.json({
      ...item,
      unitPrice: item.price || 0,
      totalValue: item.quantity * (item.price || 0),
      minStock: item.minQuantity,
      maxStock: item.maxQuantity,
      status: item.status.toLowerCase().replace('_', '-'),
    });
  } catch (error) {
    console.error('Error adjusting inventory item:', error);
    return NextResponse.json({ error: 'Failed to adjust stock' }, { status: 500 });
  }
});
