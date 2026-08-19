import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const DELETE = withMultiTenancy(async (_req, { user, params }) => {
  try {
    const { id } = await params;
    const { count } = await prisma.projectNote.deleteMany({ where: { id: id as string, businessId: user.businessId } });
    if (count === 0) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Note DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
});
