import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { AppointmentStatus, AppointmentType } from '@/lib/prisma-client';
import { findConflictingAppointment, notifyAppointmentStatus } from '@/lib/services/appointments';

export const GET = withMultiTenancy(async (_req, { dataFilter }) => {
  try {
    const now = new Date();
    // Automatically transition expired confirmed appointments to COMPLETED and CONCLUDED
    await prisma.appointment.updateMany({
      where: {
        businessId: dataFilter.businessId,
        status: AppointmentStatus.CONFIRMED,
        endTime: { lte: now },
      },
      data: {
        status: AppointmentStatus.COMPLETED,
        meetingRoomStatus: 'CONCLUDED',
      },
    });

    const appointments = await prisma.appointment.findMany({
      where: { businessId: dataFilter.businessId },
      orderBy: { startTime: 'desc' },
    });

    const mapped = appointments.map(a => ({
      id: a.id,
      client: a.clientName,
      email: a.clientEmail,
      phone: a.clientPhone,
      service: a.title,
      date: a.startTime.toISOString().split('T')[0],
      time: a.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      startTime: a.startTime.toISOString(),
      duration: Math.round((a.endTime.getTime() - a.startTime.getTime()) / 60000),
      status: a.status.toLowerCase(),
      type: a.type.toLowerCase().replace('_', '-'),
      location: a.location,
      notes: a.description,
    }));

    return NextResponse.json(mapped);
  } catch (error: unknown) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
});

export const POST = withMultiTenancy(async (req, { user, business }) => {
  try {
    const body = await req.json();
    const {
      client, email, phone, service, date, time, duration, type, location, notes
    } = body;

    if (!client?.trim() || !email?.trim() || !service?.trim() || !date || !time) {
      return NextResponse.json({ error: 'Client, email, service, date, and time are required' }, { status: 400 });
    }

    // Parse date and time
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + (duration || 60) * 60000);

    const conflict = await findConflictingAppointment(user.businessId, startDateTime, endDateTime);
    if (conflict) {
      return NextResponse.json({
        error: `This time slot overlaps an existing booking for ${conflict.clientName} (${conflict.title}). Please choose a different time.`,
      }, { status: 409 });
    }

    const appointmentType = type.toUpperCase().replace('-', '_') as AppointmentType;
    const isVideo = appointmentType === AppointmentType.VIDEO;

    let rawPin: string | undefined = undefined;
    let securePinHash: string | null = null;
    if (isVideo) {
      const bcrypt = (await import('bcryptjs')).default;
      rawPin = Math.floor(100000 + Math.random() * 900000).toString();
      securePinHash = await bcrypt.hash(rawPin, 10);
    }

    const appointment = await prisma.appointment.create({
      data: {
        businessId: user.businessId,
        userId: user.id,
        clientName: client,
        clientEmail: email,
        clientPhone: phone,
        title: service,
        startTime: startDateTime,
        endTime: endDateTime,
        type: appointmentType,
        status: AppointmentStatus.PENDING,
        location: location || null,
        description: notes || null,
        securePinHash,
        meetingRoomStatus: isVideo ? 'SCHEDULED' : 'NOT_APPLICABLE',
      },
    });

    // Keep CRM in sync: if this client is an existing contact, record that
    // they were just engaged, same as the app already does for other
    // client-facing activity.
    prisma.contact.updateMany({
      where: { businessId: user.businessId, email: appointment.clientEmail },
      data: { lastContact: new Date() },
    }).catch((err) => console.error('Failed to update contact lastContact for booking:', err));

    notifyAppointmentStatus(appointment, business.name, 'received', rawPin).catch(() => {});

    return NextResponse.json({
      ...appointment,
      client: appointment.clientName,
      email: appointment.clientEmail,
      startTime: appointment.startTime.toISOString(),
      status: appointment.status.toLowerCase(),
      type: appointment.type.toLowerCase().replace('_', '-'),
    });
  } catch (error: unknown) {
    console.error('Error creating booking:', error);
    return NextResponse.json({
      error: 'Failed to create booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
});
