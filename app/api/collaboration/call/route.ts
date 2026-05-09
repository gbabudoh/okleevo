import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/multi-tenancy';

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { targetUserId, roomName, type } = await req.json();

    if (!targetUserId || !roomName) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const sender = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, businessId: true }
    });

    if (!sender) return NextResponse.json({ error: 'Sender not found' }, { status: 404 });

    // Create a special CALL_INVITE notification for the target user
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        businessId: sender.businessId,
        title: `Incoming ${type === 'video' ? 'Video' : 'Voice'} Call`,
        message: `${sender.firstName} ${sender.lastName} is calling you.`,
        type: 'CALL_INVITE',
        status: 'unread',
        metadata: {
          roomName,
          type,
          senderId: userId,
          senderName: `${sender.firstName} ${sender.lastName}`
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to send call invite:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
