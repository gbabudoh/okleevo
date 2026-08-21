import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/config/env';
import { prisma } from '@/lib/prisma';
import { sendAppointmentReminderEmail } from '@/lib/services/appointments';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (!env.CRON_SECRET || authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();

    // 1. Auto-archive all confirmed appointments whose scheduled end time has passed
    const archived = await prisma.appointment.updateMany({
      where: {
        status: 'CONFIRMED',
        endTime: { lte: now },
      },
      data: {
        status: 'COMPLETED',
        meetingRoomStatus: 'COMPLETED',
      },
    });

    // 2. Look ahead 24 hours for upcoming reminders
    const windowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        status: 'CONFIRMED',
        type: 'VIDEO',
        startTime: {
          gte: now,
          lte: windowEnd,
        },
      },
      include: {
        business: { select: { name: true } },
        user: { select: { email: true, firstName: true, lastName: true } },
      },
    });

    let sent = 0;

    for (const appt of upcomingAppointments) {
      const msUntilStart = appt.startTime.getTime() - now.getTime();
      const minutesUntilStart = Math.round(msUntilStart / 60000);

      // Determine reminder timeframe
      let timeframeText = '';
      if (minutesUntilStart <= 20) {
        timeframeText = 'in about 15 minutes';
      } else if (minutesUntilStart <= 70) {
        timeframeText = 'in 1 hour';
      } else {
        timeframeText = 'tomorrow';
      }

      // Send to client
      await sendAppointmentReminderEmail({
        appointment: appt,
        businessName: appt.business.name,
        recipientEmail: appt.clientEmail,
        recipientName: appt.clientName,
        isHost: false,
        timeframeText,
      }).catch((err) => console.error(`Error sending reminder to client for ${appt.id}:`, err));

      // Send to SME host
      if (appt.user?.email) {
        await sendAppointmentReminderEmail({
          appointment: appt,
          businessName: appt.business.name,
          recipientEmail: appt.user.email,
          recipientName: `${appt.user.firstName || ''} ${appt.user.lastName || ''}`.trim() || 'Host',
          isHost: true,
          timeframeText,
        }).catch((err) => console.error(`Error sending reminder to host for ${appt.id}:`, err));
      }

      sent++;
    }

    return NextResponse.json({ success: true, processed: upcomingAppointments.length, sent });
  } catch (error) {
    console.error('Error running booking reminders cron:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
