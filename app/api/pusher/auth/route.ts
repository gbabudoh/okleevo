import { NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/multi-tenancy';
import { authorizeChatChannel, isRealtimeConfigured } from '@/lib/services/realtime';

/**
 * Pusher's private-channel authorization endpoint. Called by pusher-js in
 * the browser before it's allowed to subscribe to a `private-chat-*`
 * channel — only one of the two participants encoded in the channel name
 * may authorize (see lib/services/realtime.ts authorizeChatChannel).
 *
 * This is an authenticated route (uses the normal session, same as every
 * other /api/collaboration/* route) — it is NOT part of the Layer 2 guest
 * gateway and must never be added to proxy.ts's publicRoutes.
 */
export async function POST(req: Request) {
  if (!isRealtimeConfigured()) {
    return NextResponse.json({ error: 'Realtime chat is not configured' }, { status: 503 });
  }

  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const socketId = formData.get('socket_id');
  const channelName = formData.get('channel_name');

  if (typeof socketId !== 'string' || typeof channelName !== 'string') {
    return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 });
  }

  const authResponse = authorizeChatChannel(userId, socketId, channelName);
  if (!authResponse) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(authResponse);
}
