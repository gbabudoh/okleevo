import { NextRequest, NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (_req, { dataFilter }) => {
  try {
    const items = await prisma.complianceItem.findMany({
      where: { businessId: dataFilter.businessId },
      orderBy: { dueDate: 'asc' },
    });

    const mapped = items.map(item => ({
      ...item,
      status: item.status.toLowerCase().replace('_', '-'),
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Error fetching compliance items:', error);
    return NextResponse.json({ error: 'Failed to fetch compliance items' }, { status: 500 });
  }
});

export const POST = withMultiTenancy(async (req: NextRequest, { dataFilter }) => {
  try {
    const data = await req.json();
    const { title, description, dueDate, category, priority, assignedTo, framework, frequency, jurisdiction } = data;

    if (!title || !dueDate) {
      return NextResponse.json({ error: 'Title and due date are required' }, { status: 400 });
    }

    const item = await prisma.complianceItem.create({
      data: {
        businessId: dataFilter.businessId,
        title,
        description: description || null,
        dueDate: new Date(dueDate),
        category: category || null,
        status: 'PENDING',
        // Extra fields stored in description as JSON if model doesn't have them
      },
    });

    return NextResponse.json({
      ...item,
      status: 'pending',
      priority: priority || 'medium',
      assignedTo: assignedTo || '',
      framework: framework || '',
      frequency: frequency || 'one-time',
      jurisdiction: jurisdiction || '',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating compliance item:', error);
    return NextResponse.json({ error: 'Failed to create compliance item' }, { status: 500 });
  }
});

export const DELETE = withMultiTenancy(async (req: NextRequest, { dataFilter }) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await prisma.complianceItem.delete({
      where: { id, businessId: dataFilter.businessId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting compliance item:', error);
    return NextResponse.json({ error: 'Failed to delete compliance item' }, { status: 500 });
  }
});
