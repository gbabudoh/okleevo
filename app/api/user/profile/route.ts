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
            pivotNavEnabled: true,
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

    let businessData = user.business;
    if (businessData) {
      const activeUserCount = await prisma.user.count({
        where: { businessId: user.businessId },
      });
      businessData = {
        ...businessData,
        seatCount: Math.max(businessData.seatCount, activeUserCount, 3),
      };
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
      timezone: user.timezone,
      twoFactorEnabled: user.twoFactorEnabled ?? false,
      notificationPreferences: user.notificationPreferences,
      business: businessData,
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
 * PATCH /api/user/profile — Update avatar, name, or phone
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { avatar, firstName, lastName, phone, timezone, notificationPreferences } = body as {
      avatar?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      timezone?: string;
      notificationPreferences?: Record<string, boolean>;
    };

    if (
      (firstName !== undefined && firstName.trim() === '') ||
      (lastName !== undefined && lastName.trim() === '')
    ) {
      return NextResponse.json({ error: 'First and last name cannot be empty' }, { status: 400 });
    }

    const data: {
      avatar?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      timezone?: string;
      notificationPreferences?: Record<string, boolean>;
    } = {};
    if (avatar !== undefined) data.avatar = avatar;
    if (firstName !== undefined) data.firstName = firstName.trim();
    if (lastName !== undefined) data.lastName = lastName.trim();
    if (phone !== undefined) data.phone = phone;
    if (timezone !== undefined) data.timezone = timezone;
    if (notificationPreferences !== undefined) data.notificationPreferences = notificationPreferences;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        avatar: true,
        firstName: true,
        lastName: true,
        phone: true,
        timezone: true,
        notificationPreferences: true,
      },
    });

    return NextResponse.json({ success: true, ...updated });
  } catch (error: unknown) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

