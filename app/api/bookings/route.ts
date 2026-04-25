import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { AppointmentStatus, AppointmentType } from '@/lib/prisma-client';

export const GET = withMultiTenancy(async (_req, { dataFilter }) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { businessId: dataFilter.businessId },
      orderBy: { startTime: 'asc' },
    });

    const mapped = appointments.map(a => ({
      id: a.id,
      client: a.clientName,
      email: a.clientEmail,
      phone: a.clientPhone,
      service: a.title,
      date: a.startTime.toISOString().split('T')[0],
      time: a.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
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

export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const body = await req.json();
    const { 
      client, email, phone, service, date, time, duration, type, location, notes 
    } = body;

    // Parse date and time
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + (duration || 60) * 60000);

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
        type: type.toUpperCase().replace('-', '_') as AppointmentType,
        status: AppointmentStatus.PENDING,
        location: location || null,
        description: notes || null,
      },
    });

    return NextResponse.json({
      ...appointment,
      client: appointment.clientName,
      email: appointment.clientEmail,
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
