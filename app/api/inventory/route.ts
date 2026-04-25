import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (_req, { dataFilter }) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = await (prisma.inventoryItem.findMany as any)({
      where: { businessId: dataFilter.businessId },
      include: {
        supplier: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedItems = items.map((item: any) => ({
      ...item,
      supplier: item.supplier?.name || 'In-house',
      totalValue: item.quantity * (item.price || 0),
      // Map prisma fields to frontend naming
      unitPrice: item.price || 0,
      minStock: item.minQuantity,
      maxStock: item.maxQuantity,
      status: item.status.toLowerCase().replace('_', '-')
    }));

    // Fetch recent movements
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const movements = await (prisma as any).stockMovement.findMany({
      where: { businessId: dataFilter.businessId },
      include: {
        item: true,
        user: true
      },
      take: 20,
      orderBy: { date: 'desc' }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedMovements = movements.map((m: any) => ({
      id: m.id,
      itemId: m.itemId,
      itemName: m.item.name,
      type: m.type.toLowerCase(),
      quantity: m.quantity,
      date: m.date,
      reason: m.reason || 'N/A',
      user: m.user
        ? (m.user.name || `${m.user.firstName || ''} ${m.user.lastName || ''}`.trim() || 'System')
        : 'System'
    }));

    return NextResponse.json({ items: formattedItems, movements: formattedMovements });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Logistics failure' }, { status: 500 });
  }
});

export const POST = withMultiTenancy(async (req, { dataFilter }) => {
  try {
    const data = await req.json();
    const item = await prisma.inventoryItem.create({
      data: {
        ...data,
        businessId: dataFilter.businessId,
        status: data.quantity === 0 ? 'OUT_OF_STOCK' : 
                data.quantity <= (data.reorderPoint || 10) ? 'LOW_STOCK' : 
                data.quantity >= (data.maxQuantity || 100) ? 'OVERSTOCKED' : 'IN_STOCK'
      }
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json({ error: 'Asset provisioning failure' }, { status: 500 });
  }
});
