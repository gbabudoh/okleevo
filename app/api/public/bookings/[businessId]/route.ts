import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AppointmentStatus, AppointmentType } from '@/lib/prisma-client';
import { findConflictingAppointment, notifyAppointmentStatus, notifyHostNewAppointment } from '@/lib/services/appointments';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true },
    });
    if (!business) {
      return NextResponse.json({ error: 'Booking page not found' }, { status: 404 });
    }
    return NextResponse.json(business);
  } catch (error) {
    console.error('Error fetching public booking business:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) {
      return NextResponse.json({ error: 'Booking page not found' }, { status: 404 });
    }

    const body = await req.json();
    const { client, email, phone, service, date, time, duration, type, notes } = body;

    if (!client?.trim() || !email?.trim() || !service?.trim() || !date || !time) {
      return NextResponse.json({ error: 'Name, email, service, date, and time are required' }, { status: 400 });
    }
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const startDateTime = new Date(`${date}T${time}`);
    if (Number.isNaN(startDateTime.getTime())) {
      return NextResponse.json({ error: 'Invalid date or time' }, { status: 400 });
    }
    if (startDateTime.getTime() < Date.now()) {
      return NextResponse.json({ error: 'Please choose a future date and time' }, { status: 400 });
    }
    const dur = Number.isFinite(duration) && duration > 0 ? duration : 60;
    const endDateTime = new Date(startDateTime.getTime() + dur * 60000);

    const conflict = await findConflictingAppointment(businessId, startDateTime, endDateTime);
    if (conflict) {
      return NextResponse.json({
        error: 'That time slot was just taken. Please choose a different time.',
      }, { status: 409 });
    }

    // Public requests need an owning user for the Appointment record —
    // attribute it to the business's first user (the owner/earliest member),
    // same convention as other business-wide records without a specific actor.
    const owner = await prisma.user.findFirst({
      where: { businessId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, email: true, firstName: true, lastName: true },
    });
    if (!owner) {
      return NextResponse.json({ error: 'This business cannot accept bookings right now' }, { status: 400 });
    }

    const validTypes: AppointmentType[] = ['VIDEO', 'PHONE', 'IN_PERSON'];
    const normalizedType = typeof type === 'string' ? (type.toUpperCase().replace('-', '_') as AppointmentType) : 'VIDEO';
    const isVideo = (validTypes.includes(normalizedType) ? normalizedType : AppointmentType.VIDEO) === AppointmentType.VIDEO;

    let rawPin: string | undefined = undefined;
    let securePinHash: string | null = null;
    if (isVideo) {
      const bcrypt = (await import('bcryptjs')).default;
      rawPin = Math.floor(100000 + Math.random() * 900000).toString();
      securePinHash = await bcrypt.hash(rawPin, 10);
    }

    const appointment = await prisma.appointment.create({
      data: {
        businessId,
        userId: owner.id,
        clientName: client.trim(),
        clientEmail: email.trim(),
        clientPhone: phone?.trim() || null,
        title: service.trim(),
        startTime: startDateTime,
        endTime: endDateTime,
        type: validTypes.includes(normalizedType) ? normalizedType : AppointmentType.VIDEO,
        status: AppointmentStatus.CONFIRMED,
        description: notes?.trim() || null,
        securePinHash,
        meetingRoomStatus: isVideo ? 'SCHEDULED' : 'NOT_APPLICABLE',
      },
    });

    prisma.contact.updateMany({
      where: { businessId, email: appointment.clientEmail },
      data: { lastContact: new Date() },
    }).catch((err) => console.error('Failed to update contact lastContact for public booking:', err));

    notifyAppointmentStatus(appointment, business.name, 'confirmed', rawPin).catch(() => {});

    if (owner?.email) {
      notifyHostNewAppointment({
        appointment,
        businessName: business.name,
        hostEmail: owner.email,
        hostName: `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || 'Host',
      }).catch((err) => console.error('Failed to notify host of new booking:', err));
    }

    return NextResponse.json({ success: true, id: appointment.id, pin: rawPin });
  } catch (error) {
    console.error('Error submitting public booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
