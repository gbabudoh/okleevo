import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const PUT = withMultiTenancy(async (req, { dataFilter, params }) => {
  const { id } = await params;
  try {
    const data = await req.json();
    const { name, sku, category, quantity, unitPrice, location, minStock, maxStock, unit, description, reorderPoint } = data;

    const existing = await prisma.inventoryItem.findFirst({
      where: { id: id as string, businessId: dataFilter.businessId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (sku !== undefined) updateData.sku = sku;
    if (category !== undefined) updateData.category = category;
    if (unit !== undefined) updateData.unit = unit;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (minStock !== undefined) updateData.minQuantity = Number(minStock);
    if (maxStock !== undefined) updateData.maxQuantity = Number(maxStock);
    if (reorderPoint !== undefined) updateData.reorderPoint = Number(reorderPoint);
    if (unitPrice !== undefined) updateData.price = Number(unitPrice);

    // Recompute status whenever quantity or any of its thresholds change,
    // always merging against the item's actual stored values rather than
    // hardcoded fallbacks — otherwise a partial update (e.g. just `{ quantity }`
    // with no reorderPoint in the body) would compute against the wrong threshold.
    if (quantity !== undefined || reorderPoint !== undefined || maxStock !== undefined) {
      const qty = quantity !== undefined ? Number(quantity) : existing.quantity;
      const rp = reorderPoint !== undefined ? Number(reorderPoint) : existing.reorderPoint;
      const mxq = maxStock !== undefined ? Number(maxStock) : existing.maxQuantity;
      updateData.quantity = qty;
      updateData.status = qty === 0 ? 'OUT_OF_STOCK' : qty <= rp ? 'LOW_STOCK' : qty >= mxq ? 'OVERSTOCKED' : 'IN_STOCK';
    }

    const item = await prisma.inventoryItem.update({
      where: { id: id as string, businessId: dataFilter.businessId },
      data: updateData,
    });

    return NextResponse.json({
      ...item,
      unitPrice: item.price || 0,
      totalValue: item.quantity * (item.price || 0),
      minStock: item.minQuantity,
      maxStock: item.maxQuantity,
      status: item.status.toLowerCase().replace('_', '-'),
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
});

export const DELETE = withMultiTenancy(async (_req, { dataFilter, params }) => {
  const { id } = await params;
  try {
    await prisma.inventoryItem.delete({
      where: { id: id as string, businessId: dataFilter.businessId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
});
