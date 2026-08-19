import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Public, zero-login booking-page config. Strips everything down to only
 * what a guest's browser needs to render the page and submit a booking —
 * never returns raw Business/User rows, internal ids beyond the ones
 * already in the URL, or anything about other booking pages.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ businessId: string; slug: string }> }
) {
  try {
    const { businessId, slug } = await params;

    const bookingPage = await prisma.bookingPage.findUnique({
      where: { businessId_slug: { businessId, slug } },
      select: {
        id: true,
        name: true,
        isPublic: true,
        workingHours: true,
        allowedMimeTypes: true,
        maxFileSizeBytes: true,
        brandingConfig: true,
        business: { select: { name: true } },
      },
    });

    if (!bookingPage || !bookingPage.isPublic) {
      return NextResponse.json({ error: 'Booking page not found' }, { status: 404 });
    }

    return NextResponse.json({
      booking_page_id: bookingPage.id,
      company_name: bookingPage.business.name,
      page_name: bookingPage.name,
      allowed_mime_types: bookingPage.allowedMimeTypes,
      max_file_size_bytes: bookingPage.maxFileSizeBytes,
      working_hours: bookingPage.workingHours,
      branding: bookingPage.brandingConfig,
    });
  } catch (error) {
    console.error('Error fetching public booking page config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
