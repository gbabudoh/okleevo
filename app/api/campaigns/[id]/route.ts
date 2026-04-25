import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

function serialize(c: ReturnType<typeof Object.assign>) {
  return {
    ...c,
    status: c.status.toLowerCase(),
    type: c.type.toLowerCase(),
    sent: c.sentCount,
    opened: c.openedCount,
    clicked: c.clickedCount,
    bounced: c.bouncedCount,
    createdAt: c.createdAt.toISOString().split('T')[0],
    sentAt: c.sentAt ? c.sentAt.toISOString().replace('T', ' ').slice(0, 16) : undefined,
    scheduledAt: c.scheduledAt ? c.scheduledAt.toISOString().slice(0, 16) : undefined,
  };
}

export const PATCH = withMultiTenancy(async (req, { user, params }) => {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id as string;
    const body = await req.json();
    const { name, subject, content, type, audience, status, cost, scheduledAt, revenue } = body;

    const existing = await prisma.campaign.findFirst({ where: { id, businessId: user.businessId } });
    if (!existing) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const campaign = await (prisma.campaign.update as any)({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(subject !== undefined && { subject: subject?.trim() || null }),
        ...(content !== undefined && { content: content?.trim() || null }),
        ...(type !== undefined && { type: typeof type === 'string' ? type.toUpperCase() : 'PROMOTIONAL' }),
        ...(audience !== undefined && { audience }),
        ...(status !== undefined && { status: typeof status === 'string' ? status.toUpperCase() : 'DRAFT' }),
        ...(cost !== undefined && { cost: (cost !== null && !isNaN(Number(cost))) ? Number(cost) : 0 }),
        ...(revenue !== undefined && { revenue: (revenue !== null && !isNaN(Number(revenue))) ? Number(revenue) : 0 }),
        ...(scheduledAt !== undefined && { scheduledAt: (scheduledAt && !isNaN(new Date(scheduledAt).getTime())) ? new Date(scheduledAt) : null }),
      },
    });

    return NextResponse.json(serialize(campaign));
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
});

export const DELETE = withMultiTenancy(async (_req, { user, params }) => {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id as string;
    const existing = await prisma.campaign.findFirst({ where: { id, businessId: user.businessId } });
    if (!existing) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

    await prisma.campaign.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
  }
});
