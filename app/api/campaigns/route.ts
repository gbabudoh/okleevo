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

export const GET = withMultiTenancy(async (_req, { dataFilter }) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { businessId: dataFilter.businessId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(campaigns.map(serialize));
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
});

export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const body = await req.json();
    const { name, subject, content, type, audience, cost, scheduledAt } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 });
    }

    const scheduledDate = (scheduledAt && !isNaN(new Date(scheduledAt).getTime())) ? new Date(scheduledAt) : null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const campaign = await (prisma.campaign.create as any)({
      data: {
        name: name.trim(),
        subject: subject?.trim() || null,
        content: content?.trim() || null,
        type: (typeof type === 'string' ? type.toUpperCase() : 'PROMOTIONAL'),
        audience: audience || 'All Subscribers',
        cost: (cost && !isNaN(Number(cost))) ? Number(cost) : 0,
        scheduledAt: scheduledDate,
        status: scheduledDate ? 'SCHEDULED' : 'DRAFT',
        businessId: user.businessId,
      },
    });

    return NextResponse.json(serialize(campaign));
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
});

export const DELETE = withMultiTenancy(async (req, { dataFilter }) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    await prisma.campaign.delete({
      where: {
        id,
        businessId: dataFilter.businessId,
      },
    });

    return NextResponse.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
  }
});
