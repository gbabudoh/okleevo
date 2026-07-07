import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (_req, { user }) => {
  const connection = await prisma.shopifyConnection.findUnique({ where: { businessId: user.businessId } });
  if (!connection) {
    return NextResponse.json({ connected: false });
  }
  return NextResponse.json({
    connected: true,
    shopDomain: connection.shopDomain,
    connectedAt: connection.connectedAt,
  });
});

export const DELETE = withMultiTenancy(async (_req, { user }) => {
  await prisma.shopifyConnection.deleteMany({ where: { businessId: user.businessId } });
  return NextResponse.json({ success: true });
});
