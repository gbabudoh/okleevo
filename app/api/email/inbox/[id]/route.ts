import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const PATCH = withMultiTenancy(async (req, { params, user }) => {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id as string;
    const body = await req.json();
    const { status, folder } = body;

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
        // Note: isStarred is not currently in the schema, but keeping it prepared for future use.
      },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Mailbox API Error (PATCH):', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
});
