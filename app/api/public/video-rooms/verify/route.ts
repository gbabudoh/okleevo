import bcrypt from 'bcryptjs';
import { AccessToken } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { signGuestAssetToken, GUEST_TOKEN_TTL_SECONDS } from '@/lib/security/guest-tokens';

const MAX_PIN_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

/**
 * Validates a guest's 6-digit PIN and, on success, issues a room-scoped
 * LiveKit token plus a separate guest asset token — never a NextAuth
 * session or cookie. This is the only bridge between the public Layer 2
 * surface and the LiveKit video infra; proxy.ts's authenticated-route gate
 * is entirely bypassed by design here (this route is public), and entirely
 * unaffected by it (no cookie is ever set).
 */
export async function POST(req: Request) {
  try {
    // Best-effort IP throttle in front of the durable per-appointment lockout below.
    const rateLimit = checkRateLimit(`pin-verify:${getClientIp(req)}`, 20, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { access_granted: false, error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds ?? 900) } }
      );
    }

    const body = await req.json();
    const appointmentId = body?.appointment_id;
    const enteredPin = body?.entered_pin;

    if (typeof appointmentId !== 'string' || typeof enteredPin !== 'string') {
      return NextResponse.json({ access_granted: false, error: 'Invalid request' }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        business: { select: { name: true } },
        guestUploads: { where: { malwareScanStatus: 'CLEAN' }, select: { id: true, fileName: true } },
      },
    });

    // Same generic error whether the appointment doesn't exist or the PIN is
    // wrong — never confirm/deny appointment existence to an unauthenticated caller.
    const genericInvalid = () =>
      NextResponse.json({ access_granted: false, error: 'Invalid code' }, { status: 401 });

    if (!appointment || !appointment.securePinHash) {
      return genericInvalid();
    }

    if (appointment.pinLockedUntil && appointment.pinLockedUntil.getTime() > Date.now()) {
      return NextResponse.json(
        { access_granted: false, error: 'Too many incorrect attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const matches = await bcrypt.compare(enteredPin, appointment.securePinHash);

    if (!matches) {
      const attempts = appointment.pinAttempts + 1;
      const lockedOut = attempts >= MAX_PIN_ATTEMPTS;
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          pinAttempts: lockedOut ? 0 : attempts,
          pinLockedUntil: lockedOut ? new Date(Date.now() + LOCKOUT_MS) : null,
        },
      });
      return genericInvalid();
    }

    const apiKey = (process.env.LIVEKIT_API_KEY || '').replace(/^key=/, '').trim();
    const apiSecret = (process.env.LIVEKIT_API_SECRET || '').trim();
    const wsUrl = (process.env.LIVEKIT_URL || '').trim();
    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json({ access_granted: false, error: 'Server misconfigured' }, { status: 500 });
    }

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { pinAttempts: 0, pinLockedUntil: null, meetingRoomStatus: 'ACTIVE' },
    });

    // Scoped and namespaced separately from internal huddle rooms
    // (app/api/livekit/token uses `biz_{businessId}_{room}`) so a guest
    // token can never be reused to join an internal team room.
    const roomId = `guest_appt_${appointment.id}`;

    const at = new AccessToken(apiKey, apiSecret, {
      identity: `guest_${appointment.id}`,
      name: appointment.clientName,
      ttl: GUEST_TOKEN_TTL_SECONDS,
    });
    at.addGrant({
      roomJoin: true,
      room: roomId,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const assetToken = signGuestAssetToken({ appointmentId: appointment.id, scope: 'shared-assets' });

    const durationMinutes = Math.round(
      (appointment.endTime.getTime() - appointment.startTime.getTime()) / 60000
    );

    return NextResponse.json({
      access_granted: true,
      is_host: false,
      webrtc_room_id: roomId,
      webrtc_token: await at.toJwt(),
      ws_url: wsUrl,
      expires_in_seconds: GUEST_TOKEN_TTL_SECONDS,
      appointment: {
        id: appointment.id,
        title: appointment.title,
        clientName: appointment.clientName,
        businessName: appointment.business?.name || 'SME Meeting',
        startTime: appointment.startTime.toISOString(),
        endTime: appointment.endTime.toISOString(),
        durationMinutes: durationMinutes > 0 ? durationMinutes : 30,
      },
      shared_assets: appointment.guestUploads.map((u) => ({
        id: u.id,
        file_name: u.fileName,
        download_url: `/api/public/shared-assets/${appointment.id}/view?upload=${u.id}`,
      })),
      asset_token: assetToken,
    });
  } catch (error) {
    console.error('Error verifying guest video room PIN:', error);
    return NextResponse.json({ access_granted: false, error: 'Internal server error' }, { status: 500 });
  }
}
