import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { guestObjectExists } from '@/lib/services/guest-storage';

/**
 * Called by the guest's browser after it finishes PUTting its file to the
 * presigned upload_url from /reserve (or immediately, if there was no file).
 * The confirmation email + PIN were already sent at reserve time (see
 * lib/services/appointments.ts notifyGuestBookingConfirmed) so this step
 * never needs to recover a raw PIN — it only finalizes the upload record and
 * the CRM lead. Idempotent: safe to call more than once.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { guestUploads: true, business: { select: { id: true } } },
    });
    if (!appointment || !appointment.bookingPageId) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Best-effort: confirm the file actually landed in the sandbox bucket.
    // Non-fatal either way — the malware-scan worker (Phase 3) is the real
    // gate on whether the file ever becomes visible to the SME.
    for (const upload of appointment.guestUploads) {
      const exists = await guestObjectExists(upload.s3ObjectKey).catch(() => false);
      if (!exists) {
        console.warn(`Guest upload ${upload.id} not found in sandbox bucket at confirm time`);
      }
    }

    const existingContact = await prisma.contact.findFirst({
      where: { businessId: appointment.businessId, email: appointment.clientEmail },
      select: { id: true },
    });

    if (!existingContact) {
      await prisma.contact.create({
        data: {
          businessId: appointment.businessId,
          userId: appointment.userId,
          name: appointment.clientName,
          email: appointment.clientEmail,
          pipelineStage: 'new',
          status: 'LEAD',
          source: 'booking-page',
          lastContact: new Date(),
        },
      });
    }

    return NextResponse.json({
      appointment_id: appointment.id,
      status: 'scheduled',
      message: 'Confirmation email containing the secure 6-digit access PIN has been dispatched.',
    });
  } catch (error) {
    console.error('Error confirming guest booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
