import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const PATCH = withMultiTenancy(async (req, { params, user }) => {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id as string;
    const body = await req.json();
    const { status, folder, label } = body;

    // Verify ownership
    const message = await prisma.mailboxMessage.findFirst({
      where: {
        id: id as string,
        businessId: user.businessId,
      },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const updatedMessage = await prisma.mailboxMessage.update({
      where: { id: message.id },
      data: {
        ...(status !== undefined && { status }),
        ...(folder !== undefined && { folder }),
        ...(label !== undefined && { label }),
      },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Mailbox API Error (PATCH):', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
});

export const DELETE = withMultiTenancy(async (_req, { params, user }) => {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id as string;

    const message = await prisma.mailboxMessage.findFirst({
      where: { id, businessId: user.businessId },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    await prisma.mailboxMessage.delete({ where: { id: message.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mailbox API Error (DELETE):', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
});
