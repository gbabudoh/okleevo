import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/email/history — Paginated email logs for the user's business
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = (session.user as Record<string, string>).businessId;
    if (!businessId) {
      return NextResponse.json({ error: 'No business found' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const status = searchParams.get('status'); // SENT | FAILED | QUEUED
    const search = searchParams.get('search');

    const where: Record<string, unknown> = { businessId };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { to: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [emails, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          to: true,
          cc: true,
          subject: true,
          status: true,
          messageId: true,
          errorMessage: true,
          attachments: true,
          createdAt: true,
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.emailLog.count({ where }),
    ]);

    return NextResponse.json({
      data: emails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Email History API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
