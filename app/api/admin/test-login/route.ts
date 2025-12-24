import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

/**
 * POST - Test login credentials
 * This endpoint helps debug login issues
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

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        business: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        exists: false,
        message: 'User not found with this email',
        suggestions: [
          'Check if the email is correct',
          'Create the user first using /api/admin/create-super-admin',
        ],
      }, { status: 404 });
    }

    // Check if user has password
    if (!user.password) {
      return NextResponse.json({
        exists: true,
        hasPassword: false,
        message: 'User exists but has no password set',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
        },
        fix: 'Set a password using /api/admin/verify-super-admin',
      }, { status: 400 });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    return NextResponse.json({
      exists: true,
      hasPassword: true,
      passwordValid: isValid,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        business: user.business?.name,
      },
      message: isValid 
        ? 'Credentials are valid! The issue might be in the authentication flow.'
        : 'Password does not match. The stored password hash does not match the provided password.',
      debug: {
        providedEmail: email,
        providedPasswordLength: password.length,
        storedPasswordHashLength: user.password.length,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error: any) {
    console.error('Error testing login:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to test login' },
      { status: 500 }
    );
  }
}

