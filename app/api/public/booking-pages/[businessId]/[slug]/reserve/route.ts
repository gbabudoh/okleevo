import { randomInt } from 'crypto';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { env } from '@/config/env';
import { emailSchema, sanitizeInput } from '@/lib/security/validation';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { findConflictingAppointment, notifyGuestBookingConfirmed } from '@/lib/services/appointments';
import { buildGuestObjectKey, getGuestUploadUrl } from '@/lib/services/guest-storage';

const DEFAULT_DURATION_MINUTES = 30;
const MIN_DURATION_MINUTES = 15;
const MAX_DURATION_MINUTES = 240;

function generateSixDigitPin(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ businessId: string; slug: string }> }
) {
  try {
    const { businessId, slug } = await params;

    // Best-effort defense-in-depth against reservation spam; the durable
    // guard against abuse is per-slot conflict checking below.
    const rateLimit = checkRateLimit(`reserve:${getClientIp(req)}`, 10, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many booking attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds ?? 3600) } }
      );
    }

    const bookingPage = await prisma.bookingPage.findUnique({
      where: { businessId_slug: { businessId, slug } },
      include: { business: { select: { id: true, name: true } } },
    });
    if (!bookingPage || !bookingPage.isPublic) {
      return NextResponse.json({ error: 'Booking page not found' }, { status: 404 });
    }

    const body = await req.json();
    const { guest_name, guest_email, selected_slot, duration_minutes, file_metadata } = body ?? {};

    if (typeof guest_name !== 'string' || guest_name.trim().length < 2) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const emailResult = emailSchema.safeParse(guest_email);
    if (!emailResult.success) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }
    if (typeof selected_slot !== 'string') {
      return NextResponse.json({ error: 'A selected time slot is required' }, { status: 400 });
    }

    const startTime = new Date(selected_slot);
    if (Number.isNaN(startTime.getTime())) {
      return NextResponse.json({ error: 'Invalid selected time slot' }, { status: 400 });
    }
    if (startTime.getTime() < Date.now()) {
      return NextResponse.json({ error: 'Please choose a future date and time' }, { status: 400 });
    }

    const duration = Number.isFinite(duration_minutes)
      ? Math.min(Math.max(duration_minutes, MIN_DURATION_MINUTES), MAX_DURATION_MINUTES)
      : DEFAULT_DURATION_MINUTES;
    const endTime = new Date(startTime.getTime() + duration * 60_000);

    const conflict = await findConflictingAppointment(businessId, startTime, endTime);
    if (conflict) {
      return NextResponse.json(
        { error: 'That time slot was just taken. Please choose a different time.' },
        { status: 409 }
      );
    }

    // Every Appointment row needs an owning user — same convention as the
    // pre-pivot public booking route (app/api/public/bookings/[businessId]).
    const owner = await prisma.user.findFirst({
      where: { businessId },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    if (!owner) {
      return NextResponse.json({ error: 'This workspace cannot accept bookings right now' }, { status: 400 });
    }

    let uploadUrl: string | null = null;
    let guestObjectKey: string | null = null;
    let fileMeta: { fileName: string; fileSizeBytes: number; mimeType: string } | null = null;

    if (file_metadata) {
      const { file_name, file_size_bytes, mime_type } = file_metadata;
      if (typeof file_name !== 'string' || typeof mime_type !== 'string' || !Number.isFinite(file_size_bytes)) {
        return NextResponse.json({ error: 'Invalid file metadata' }, { status: 400 });
      }
      if (!bookingPage.allowedMimeTypes.includes(mime_type)) {
        return NextResponse.json({ error: `File type "${mime_type}" is not accepted here` }, { status: 400 });
      }
      if (file_size_bytes > bookingPage.maxFileSizeBytes) {
        return NextResponse.json({ error: 'File is too large' }, { status: 400 });
      }
      fileMeta = { fileName: file_name, fileSizeBytes: file_size_bytes, mimeType: mime_type };
    }

    const rawPin = generateSixDigitPin();
    const securePinHash = await bcrypt.hash(rawPin, 10);

    const appointment = await prisma.appointment.create({
      data: {
        businessId,
        userId: owner.id,
        bookingPageId: bookingPage.id,
        clientName: sanitizeInput(guest_name.trim()),
        clientEmail: emailResult.data,
        title: bookingPage.name,
        startTime,
        endTime,
        type: 'VIDEO',
        status: 'CONFIRMED',
        securePinHash,
        meetingRoomStatus: 'SCHEDULED',
      },
    });

    if (fileMeta) {
      guestObjectKey = buildGuestObjectKey(appointment.id, fileMeta.fileName);
      uploadUrl = await getGuestUploadUrl(guestObjectKey);
      await prisma.guestUpload.create({
        data: {
          appointmentId: appointment.id,
          fileName: fileMeta.fileName,
          s3ObjectKey: guestObjectKey,
          fileSizeBytes: fileMeta.fileSizeBytes,
          mimeType: fileMeta.mimeType,
        },
      });
    }

    prisma.contact
      .updateMany({ where: { businessId, email: appointment.clientEmail }, data: { lastContact: new Date() } })
      .catch((err) => console.error('Failed to update contact lastContact for guest booking:', err));

    const meetingUrl = `${env.APP_URL}/room/${appointment.id}`;
    notifyGuestBookingConfirmed(appointment, bookingPage.business.name, rawPin, meetingUrl).catch(() => {});

    return NextResponse.json(
      {
        appointment_id: appointment.id,
        status: uploadUrl ? 'reserved_pending_upload' : 'scheduled',
        ...(uploadUrl && { upload_instructions: { upload_url: uploadUrl, method: 'PUT' } }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error reserving guest booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
