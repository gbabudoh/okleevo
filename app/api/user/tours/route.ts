import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Ensure this API route runs in Node.js runtime, as it uses Prisma
export const runtime = 'nodejs';

/**
 * GET /api/user/tours — module ids whose onboarding tour the user has completed/skipped
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { seenTours: true },
    });

    return NextResponse.json({ seenTours: user?.seenTours ?? [] });
  } catch (error: unknown) {
    console.error('Tours fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch seen tours' }, { status: 500 });
  }
}

/**
 * POST /api/user/tours — mark a module's onboarding tour as seen
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { moduleId } = await request.json();
    if (!moduleId || typeof moduleId !== 'string') {
      return NextResponse.json({ error: 'moduleId is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { seenTours: true },
    });

    const seenTours = Array.from(new Set([...(user?.seenTours ?? []), moduleId]));

    await prisma.user.update({
      where: { id: session.user.id },
      data: { seenTours },
    });

    return NextResponse.json({ seenTours });
  } catch (error: unknown) {
    console.error('Tours update error:', error);
    return NextResponse.json({ error: 'Failed to update seen tours' }, { status: 500 });
  }
}
