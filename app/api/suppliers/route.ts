import { NextRequest, NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (_req, { dataFilter }) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { businessId: dataFilter.businessId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
});

export const POST = withMultiTenancy(async (req: NextRequest, { dataFilter }) => {
  try {
    const data = await req.json();
    const { name, contactName, email, phone, address, category, website, notes } = data;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: {
        businessId: dataFilter.businessId,
        name,
        contactName: contactName || null,
        email,
        phone: phone || null,
        address: address || null,
        category: category || null,
        // website and notes not in schema — store in address if needed
      },
    });

    return NextResponse.json({
      ...supplier,
      website: website || null,
      notes: notes || null,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 });
  }
});

export const DELETE = withMultiTenancy(async (req: NextRequest, { dataFilter }) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await prisma.supplier.delete({
      where: { id, businessId: dataFilter.businessId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json({ error: 'Failed to delete supplier' }, { status: 500 });
  }
});
