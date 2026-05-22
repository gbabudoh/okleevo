import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const PUT = withMultiTenancy(async (req, { dataFilter, params }) => {
  const { id } = await params;
  try {
    const data = await req.json();
    const { name, contactName, email, phone, address, category, status } = data;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (contactName !== undefined) updateData.contactName = contactName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) updateData.status = status.toUpperCase();

    const supplier = await prisma.supplier.update({
      where: { id: id as string, businessId: dataFilter.businessId },
      data: updateData,
    });

    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Error updating supplier:', error);
    return NextResponse.json({ error: 'Failed to update supplier' }, { status: 500 });
  }
});

export const DELETE = withMultiTenancy(async (_req, { dataFilter, params }) => {
  const { id } = await params;
  try {
    await prisma.supplier.delete({
      where: { id: id as string, businessId: dataFilter.businessId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json({ error: 'Failed to delete supplier' }, { status: 500 });
  }
});
