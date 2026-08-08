import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, message, slug, pageTitle } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Name and email are required fields.' }, { status: 400 });
    }

    console.log(`[MICRO_PAGE_SUBMISSION] Public form submitted for "${pageTitle || slug}":`, {
      name,
      email,
      phone,
      message,
      timestamp: new Date().toISOString(),
    });

    // Try incrementing views/conversions in Prisma DB if matching page exists
    if (slug) {
      try {
        await prisma.microPage.update({
          where: { slug },
          data: { conversions: { increment: 1 } },
        });
      } catch {
        // Page slug might be fallback sample page
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Form submission received successfully',
      timestamp: new Date().toISOString(),
      lead: { name, email, phone, message, pageTitle }
    });
  } catch (error) {
    console.error('Micro Page Submission API Error:', error);
    return NextResponse.json({ error: 'Failed to process submission' }, { status: 500 });
  }
}
