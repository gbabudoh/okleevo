import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/multi-tenancy';

/**
 * GET - Fetch chat messages history
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

    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: userId }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: 100
    });

    return NextResponse.json(messages);
  } catch (err) {
    console.error('Failed to fetch chat messages:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST - Send a new chat message
 */
export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { targetUserId, content } = await req.json();

    if (!targetUserId || !content) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true, businessId: true }
      }),
      prisma.user.findUnique({
        where: { id: targetUserId },
        select: { businessId: true }
      })
    ]);

    if (!sender) return NextResponse.json({ error: 'Sender not found' }, { status: 404 });
    if (!receiver) return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });

    // Create the chat message
    const message = await prisma.chatMessage.create({
      data: {
        businessId: sender.businessId,
        senderId: userId,
        receiverId: targetUserId,
        content
      }
    });

    // Create a special Notification so the recipient receives an instant notification
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

    return NextResponse.json(message);
  } catch (err) {
    console.error('Failed to send chat message:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
