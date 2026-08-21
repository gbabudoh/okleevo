import { NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { GUEST_TOKEN_TTL_SECONDS } from '@/lib/security/guest-tokens';

/**
 * Generates an authenticated Host LiveKit token for SME staff/owners
 * attending their client appointments in /room/[appointmentId].
 */
export const GET = withMultiTenancy(async (_req, { user, params }) => {
  try {
    const { appointmentId } = await params;

    if (!appointmentId || typeof appointmentId !== 'string') {
      return NextResponse.json({ access_granted: false, error: 'Invalid appointment' }, { status: 400 });
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        businessId: user.businessId,
      },
      include: {
        business: { select: { name: true } },
      },
    });

    if (!appointment) {
      return NextResponse.json({ access_granted: false, error: 'Appointment not found' }, { status: 404 });
    }

    if (appointment.status === 'CANCELLED') {
      return NextResponse.json({ access_granted: false, error: 'This appointment has been cancelled' }, { status: 400 });
    }

    const apiKey = (process.env.LIVEKIT_API_KEY || '').replace(/^key=/, '').trim();
    const apiSecret = (process.env.LIVEKIT_API_SECRET || '').trim();
    const wsUrl = (process.env.LIVEKIT_URL || '').trim();

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json({ access_granted: false, error: 'LiveKit server misconfigured' }, { status: 500 });
    }

    const roomId = `guest_appt_${appointment.id}`;
    const hostName = `${user.firstName || 'Host'} ${user.lastName || ''}`.trim() + ' (Host)';

    const at = new AccessToken(apiKey, apiSecret, {
      identity: `host_${user.id}`,
      name: hostName,
      ttl: GUEST_TOKEN_TTL_SECONDS,
    });

    at.addGrant({
      roomJoin: true,
      room: roomId,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const durationMinutes = Math.round(
      (appointment.endTime.getTime() - appointment.startTime.getTime()) / 60000
    );

    return NextResponse.json({
      access_granted: true,
      is_host: true,
      webrtc_room_id: roomId,
      webrtc_token: await at.toJwt(),
      ws_url: wsUrl,
      expires_in_seconds: GUEST_TOKEN_TTL_SECONDS,
      appointment: {
        id: appointment.id,
        title: appointment.title,
        clientName: appointment.clientName,
        clientEmail: appointment.clientEmail,
        businessName: appointment.business.name,
        startTime: appointment.startTime.toISOString(),
        endTime: appointment.endTime.toISOString(),
        durationMinutes: durationMinutes > 0 ? durationMinutes : 30,
      },
    });
  } catch (error) {
    console.error('Error generating host video room token:', error);
    return NextResponse.json({ access_granted: false, error: 'Internal server error' }, { status: 500 });
  }
});
