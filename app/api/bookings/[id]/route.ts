import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { AppointmentStatus, AppointmentType } from '@/lib/prisma-client';
import { toLocalDateParts, findConflictingAppointment, notifyAppointmentStatus } from '@/lib/services/appointments';

export const PATCH = withMultiTenancy(async (req, { user, business, params }) => {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id as string;
    const body = await req.json();
    const {
      client, email, phone, service, date, time, duration, type, location, notes, status
    } = body;

    const existing = await prisma.appointment.findFirst({
      where: { id, businessId: user.businessId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Only rebuild start/end when the caller actually wants to move the
    // appointment or change its length — untouched otherwise, so an
    // unrelated edit (e.g. just confirming status) can never nudge the
    // stored time. When a rebuild IS needed, missing pieces are filled in
    // from the existing time using local getters (not toISOString() or
    // toLocaleTimeString(), which shift by timezone offset / aren't
    // reliably zero-padded 24h — that mismatch used to silently corrupt
    // the appointment's time on edits that never touched date or time).
    let startDateTime = existing.startTime;
    let endDateTime = existing.endTime;

    if (date !== undefined || time !== undefined || duration !== undefined) {
      const existingParts = toLocalDateParts(existing.startTime);
      const d = date !== undefined ? date : existingParts.date;
      const t = time !== undefined ? time : existingParts.time;

      startDateTime = new Date(`${d}T${t}`);
      const dur = duration !== undefined ? duration : Math.round((existing.endTime.getTime() - existing.startTime.getTime()) / 60000);
      endDateTime = new Date(startDateTime.getTime() + dur * 60000);
    }

    const timeChanged = startDateTime.getTime() !== existing.startTime.getTime() || endDateTime.getTime() !== existing.endTime.getTime();
    const newStatus = status ? (status.toUpperCase() as AppointmentStatus) : existing.status;

    if (timeChanged && newStatus !== 'CANCELLED') {
      const conflict = await findConflictingAppointment(user.businessId, startDateTime, endDateTime, id);
      if (conflict) {
        return NextResponse.json({
          error: `This time slot overlaps an existing booking for ${conflict.clientName} (${conflict.title}). Please choose a different time.`,
        }, { status: 409 });
      }
    }

    let rawPin: string | undefined = undefined;
    let securePinHashUpdate: { securePinHash?: string; meetingRoomStatus?: 'SCHEDULED' } = {};
    const targetType = type ? (type.toUpperCase().replace('-', '_') as AppointmentType) : existing.type;
    if (newStatus === 'CONFIRMED' && targetType === AppointmentType.VIDEO) {
      if (!existing.securePinHash) {
        const bcrypt = (await import('bcryptjs')).default;
        rawPin = Math.floor(100000 + Math.random() * 900000).toString();
        const hash = await bcrypt.hash(rawPin, 10);
        securePinHashUpdate = { securePinHash: hash, meetingRoomStatus: 'SCHEDULED' };
      }
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...(client && { clientName: client }),
        ...(email && { clientEmail: email }),
        ...(phone !== undefined && { clientPhone: phone }),
        ...(service && { title: service }),
        ...(timeChanged ? { startTime: startDateTime, endTime: endDateTime } : {}),
        ...(type && { type: type.toUpperCase().replace('-', '_') as AppointmentType }),
        ...(status && { status: newStatus }),
        ...(location !== undefined && { location }),
        ...(notes !== undefined && { description: notes }),
        ...securePinHashUpdate,
      },
    });

    if (status && newStatus !== existing.status && (newStatus === 'CONFIRMED' || newStatus === 'CANCELLED')) {
      notifyAppointmentStatus(updated, business.name, newStatus === 'CONFIRMED' ? 'confirmed' : 'cancelled', rawPin).catch(() => {});
    }

    return NextResponse.json({
      ...updated,
      client: updated.clientName,
      email: updated.clientEmail,
      startTime: updated.startTime.toISOString(),
      status: updated.status.toLowerCase(),
      type: updated.type.toLowerCase().replace('_', '-'),
    });
  } catch (error: unknown) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
});

export const PUT = PATCH;

export const DELETE = withMultiTenancy(async (_req, { user, params }) => {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id as string;

    const existing = await prisma.appointment.findFirst({
      where: { id, businessId: user.businessId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
});
