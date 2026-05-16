import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Ensure this API route runs in Node.js runtime, as it uses Prisma
export const runtime = 'nodejs';

/**
 * Get current user profile with business information
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            industry: true,
            size: true,
            address: true,
            city: true,
            postcode: true,
            country: true,
            seatCount: true,
            maxSeats: true,
            enabledModules: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      avatar: user.avatar ?? user.image ?? null,
      business: user.business,
    });
  } catch (error: unknown) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile — Update avatar URL (or other profile fields)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { avatar } = body as { avatar?: string };

    if (!avatar) {
      return NextResponse.json({ error: 'No avatar URL provided' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar },
      select: { id: true, avatar: true },
    });

    return NextResponse.json({ success: true, avatar: updated.avatar });
  } catch (error: unknown) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

