import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

/**
 * POST - Test authentication flow end-to-end
 * This simulates the exact same flow NextAuth uses
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('[CHECK-AUTH] Testing authentication for:', email);

    // Step 1: Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { business: true },
    });

    if (!user) {
      return NextResponse.json({
        step: 'user_lookup',
        success: false,
        error: 'User not found',
        message: 'User does not exist in database',
        fix: 'Run POST /api/admin/fix-login to create the user',
      }, { status: 404 });
    }

    console.log('[CHECK-AUTH] ✅ User found:', user.id, 'Role:', user.role);

    // Step 2: Check password
    if (!user.password) {
      return NextResponse.json({
        step: 'password_check',
        success: false,
        error: 'No password set',
        message: 'User exists but has no password',
        fix: 'Run POST /api/admin/fix-login to set the password',
      }, { status: 400 });
    }

    // Step 3: Verify password
    const isValid = await bcrypt.compare(password, user.password);
    console.log('[CHECK-AUTH] Password valid:', isValid);

    if (!isValid) {
      return NextResponse.json({
        step: 'password_verification',
        success: false,
        error: 'Invalid password',
        message: 'Password does not match',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
        },
        fix: 'Run POST /api/admin/fix-login to reset the password',
      }, { status: 401 });
    }

    // Step 4: Check status
    if (user.status !== 'ACTIVE') {
      return NextResponse.json({
        step: 'status_check',
        success: false,
        error: 'User not active',
        message: `User status is ${user.status}, not ACTIVE`,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
        },
        fix: 'Run POST /api/admin/fix-login to activate the user',
      }, { status: 403 });
    }

    // All checks passed
    return NextResponse.json({
      step: 'complete',
      success: true,
      message: 'Authentication would succeed!',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        business: user.business?.name,
      },
      note: 'If NextAuth still fails, check NextAuth configuration and database connection',
    });
  } catch (error: any) {
    console.error('[CHECK-AUTH] Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to check authentication',
        details: error.stack,
      },
      { status: 500 }
    );
  }
}

