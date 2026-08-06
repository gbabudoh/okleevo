import { AccessToken } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';

export const GET = withMultiTenancy(async (req, { user }) => {
  const room = req.nextUrl.searchParams.get('room');
  const username = req.nextUrl.searchParams.get('username') || `${user.firstName} ${user.lastName}`;

  if (!room) {
    return NextResponse.json({ error: 'Missing room parameter' }, { status: 400 });
  }

  // CRITICAL: Scope the room name to the business ID for isolation
  const scopedRoom = `biz_${user.businessId}_${room}`;

  const apiKey = (process.env.LIVEKIT_API_KEY || '').replace(/^key=/, '').trim();
  const apiSecret = (process.env.LIVEKIT_API_SECRET || '').trim();
  const wsUrl = (process.env.LIVEKIT_URL || '').trim();

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: user.id,
    name: username,
  });

  at.addGrant({ 
    roomJoin: true, 
    room: scopedRoom,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true // For Chat
  });

  return NextResponse.json({ 
    token: await at.toJwt(),
    wsUrl,
    room: scopedRoom
  });
});
