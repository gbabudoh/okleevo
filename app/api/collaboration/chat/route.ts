import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/multi-tenancy';
import { triggerNewChatMessage } from '@/lib/services/realtime';

/**
 * GET - Fetch chat messages history (supports 1-on-1 and Group HQ chat)
 */
export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const targetUserId = url.searchParams.get('targetUserId');

    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing targetUserId' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { businessId: true }
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const isGroupChat = targetUserId === 'GROUP_MAIN_HQ';

    const whereClause = isGroupChat
      ? { businessId: user.businessId, receiverId: 'GROUP_MAIN_HQ' }
      : {
          OR: [
            { senderId: userId, receiverId: targetUserId },
            { senderId: targetUserId, receiverId: userId }
          ]
        };

    const messages = await prisma.chatMessage.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'asc'
      },
      take: 100
    });

    const senderIds = Array.from(new Set(messages.map(m => m.senderId)));
    const senders = await prisma.user.findMany({
      where: { id: { in: senderIds } },
      select: { id: true, firstName: true, lastName: true, role: true, image: true }
    });
    const senderMap = new Map(senders.map(s => [s.id, s]));

    const enrichedMessages = messages.map(msg => {
      const sender = senderMap.get(msg.senderId);
      return {
        ...msg,
        senderName: sender ? `${sender.firstName} ${sender.lastName}`.trim() : 'Team Member',
        senderRole: sender?.role || null,
        senderImage: sender?.image || null,
      };
    });

    return NextResponse.json(enrichedMessages);
  } catch (err) {
    console.error('Failed to fetch chat messages:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST - Send a new chat message (supports 1-on-1 and Group HQ chat)
 */
export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { targetUserId, content } = await req.json();

    if (!targetUserId || !content) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const sender = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, businessId: true, image: true, role: true }
    });

    if (!sender) return NextResponse.json({ error: 'Sender not found' }, { status: 404 });

    const isGroupChat = targetUserId === 'GROUP_MAIN_HQ';

    if (!isGroupChat) {
      const receiver = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { businessId: true }
      });
      if (!receiver) return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });

      // Create special Notification for recipient in 1-on-1 chat
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          businessId: receiver.businessId,
          title: `New Message from ${sender.firstName}`,
          message: content.length > 60 ? `${content.substring(0, 60)}...` : content,
          type: 'CHAT_MESSAGE',
          status: 'unread',
          metadata: {
            senderId: userId,
            senderName: `${sender.firstName} ${sender.lastName}`,
            content
          }
        }
      });

      triggerNewChatMessage(userId, targetUserId).catch(() => {});
    } else {
      triggerNewChatMessage(userId, 'GROUP_MAIN_HQ').catch(() => {});
    }

    // Create the chat message
    const message = await prisma.chatMessage.create({
      data: {
        businessId: sender.businessId,
        senderId: userId,
        receiverId: isGroupChat ? 'GROUP_MAIN_HQ' : targetUserId,
        content
      }
    });

    return NextResponse.json(message);
  } catch (err) {
    console.error('Failed to send chat message:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
