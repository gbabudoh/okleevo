import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { syncSubscriptionWithSeats } from '@/lib/stripe/per-seat-billing';
import { getAuthenticatedUserId } from '@/lib/multi-tenancy';
import { UserRole, UserStatus } from '@prisma/client';

export const runtime = 'nodejs';

/**
 * GET - List all employees/users for the current business
 */
export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      console.error('Auth check failed in GET: No user ID found');
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in. Your session may have expired.' },
        { status: 401 }
      );
    }

    // Get current user's business
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { businessId: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Note: All authenticated users can view team members (read-only)
    // Only OWNER and ADMIN can add/edit/delete (enforced in POST/PUT/DELETE)

    // Get business with seat info
    const business = await prisma.business.findUnique({
      where: { id: currentUser.businessId },
      select: {
        seatCount: true,
        maxSeats: true,
      },
    });

    // Get all users for this business
    const users = await prisma.user.findMany({
      where: { businessId: currentUser.businessId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      users,
      seatInfo: {
        used: business?.seatCount || 0,
        max: business?.maxSeats || 0,
        available: (business?.maxSeats || 0) - (business?.seatCount || 0),
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

/**
 * POST - Add a new employee/user
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      console.error('Auth check failed in POST: No user ID found');
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in. Session may have expired.' },
        { status: 401 }
      );
    }

    console.log('Authenticated user ID:', userId);

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body. Expected JSON.' },
        { status: 400 }
      );
    }
    const { email, firstName, lastName, phone, role, password } = body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Get current user's business
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        business: true,
      },
    });

    if (!currentUser || !currentUser.business) {
      return NextResponse.json(
        { error: 'User or business not found' },
        { status: 404 }
      );
    }

    // Check permissions - only OWNER can add employees
    if (currentUser.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only owners can add employees.' },
        { status: 403 }
      );
    }

    // Check seat limit
    const business = currentUser.business;
    if (business.seatCount >= business.maxSeats) {
      return NextResponse.json(
        { 
          error: `Seat limit reached. You have ${business.seatCount}/${business.maxSeats} seats used. Please upgrade your plan to add more employees.`,
          seatLimit: true,
        },
        { status: 403 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password if provided (otherwise user will need to set password via invite)
    let hashedPassword = null;
    if (password) {
      // If it's a 6-digit code, we'll use it as the password
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        phone: phone || null,
        password: hashedPassword,
        businessId: business.id,
        role: (role as UserRole) || UserRole.MEMBER,
        status: UserStatus.ACTIVE,
        emailVerified: password ? new Date() : null, // Auto-verify if password provided
        timezone: 'Europe/London',
      },
    });

    // Update seat count
    const newSeatCount = business.seatCount + 1;
    await prisma.business.update({
      where: { id: business.id },
      data: { seatCount: newSeatCount },
    });

    // Sync subscription with new seat count
    try {
      await syncSubscriptionWithSeats(business.id, newSeatCount);
    } catch (error) {
      console.error('Failed to sync subscription (non-critical):', error);
      // Continue even if Stripe sync fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Employee added successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
        },
        seatInfo: {
          used: newSeatCount,
          max: business.maxSeats,
          available: business.maxSeats - newSeatCount,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error adding employee:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to add employee';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

