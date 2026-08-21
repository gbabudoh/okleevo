import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AppointmentStatus } from '@/lib/prisma-client';

/**
 * Concludes a video room session and marks the appointment as completed/archived.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params;

    if (!appointmentId || typeof appointmentId !== 'string') {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        meetingRoomStatus: 'COMPLETED',
        status: AppointmentStatus.COMPLETED,
      },
    });

    return NextResponse.json({ success: true, status: 'completed', meetingRoomStatus: 'COMPLETED' });
  } catch (error) {
    console.error('Error concluding meeting room session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
