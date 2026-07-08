import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/email/history/[id] — Archive/unarchive a sent email log entry
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = (session.user as Record<string, string>).businessId;
    if (!businessId) {
      return NextResponse.json({ error: 'No business found' }, { status: 400 });
    }

    const { id } = await params;
    const { archived } = await request.json();

    const email = await prisma.emailLog.findFirst({ where: { id, businessId } });
    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    const updated = await prisma.emailLog.update({
      where: { id: email.id },
      data: { archived: Boolean(archived) },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Email History API Error (PATCH):', error);
    return NextResponse.json({ error: 'Failed to update email' }, { status: 500 });
  }
}

// DELETE /api/email/history/[id] — Permanently delete a sent email log entry
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = (session.user as Record<string, string>).businessId;
    if (!businessId) {
      return NextResponse.json({ error: 'No business found' }, { status: 400 });
    }

    const { id } = await params;

    const email = await prisma.emailLog.findFirst({ where: { id, businessId } });
    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    await prisma.emailLog.delete({ where: { id: email.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email History API Error (DELETE):', error);
    return NextResponse.json({ error: 'Failed to delete email' }, { status: 500 });
  }
}
