import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { AppointmentStatus, AppointmentType } from '@/lib/prisma-client';

export const PATCH = withMultiTenancy(async (req, { user, params }) => {
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

    // Handle date/time update
    let startDateTime = existing.startTime;
    let endDateTime = existing.endTime;

    if (date || time || duration) {
      const d = date || existing.startTime.toISOString().split('T')[0];
      const t = time || existing.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      // Note: toLocaleTimeString with hour12: false might need care for ISO format
      // Better to use individual parts if possible, but let's assume standard 24h for the API
      
      startDateTime = new Date(`${d}T${t}`);
      const dur = duration || Math.round((existing.endTime.getTime() - existing.startTime.getTime()) / 60000);
      endDateTime = new Date(startDateTime.getTime() + dur * 60000);
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...(client && { clientName: client }),
        ...(email && { clientEmail: email }),
        ...(phone !== undefined && { clientPhone: phone }),
        ...(service && { title: service }),
        ...(date || time || duration ? { startTime: startDateTime, endTime: endDateTime } : {}),
        ...(type && { type: type.toUpperCase().replace('-', '_') as AppointmentType }),
        ...(status && { status: status.toUpperCase() as AppointmentStatus }),
        ...(location !== undefined && { location }),
        ...(notes !== undefined && { description: notes }),
      },
    });

    return NextResponse.json({
      ...updated,
      client: updated.clientName,
      email: updated.clientEmail,
      status: updated.status.toLowerCase(),
      type: updated.type.toLowerCase().replace('_', '-'),
    });
  } catch (error: unknown) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
});

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
