import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

/**
 * GET - Verify and fix super admin user
 * This endpoint checks if super admin exists and fixes any issues
 */
export async function GET(request: NextRequest) {
  try {
    const email = 'admin@okleevo.com';
    const password = 'Admin123!@#';

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        business: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        exists: false,
        message: 'Super admin user not found. Please create it first using POST /api/admin/create-super-admin',
        instructions: [
          '1. Make a POST request to /api/admin/create-super-admin',
          '2. Or use: npm run create-super-admin (if ts-node is installed)',
        ],
      }, { status: 404 });
    }

    const issues: string[] = [];
    const fixes: string[] = [];

    // Check password
    let passwordValid = false;
    if (!user.password) {
      issues.push('User has no password set');
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      fixes.push('Password set successfully');
      passwordValid = true;
    } else {
      passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        issues.push('Password does not match expected value');
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        });
        fixes.push('Password updated to match expected value');
        passwordValid = true;
      }
    }

    // Check role
    if (user.role !== 'SUPER_ADMIN') {
      issues.push(`User role is "${user.role}" instead of "SUPER_ADMIN"`);
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'SUPER_ADMIN' as any },
      });
      fixes.push('Role updated to SUPER_ADMIN');
    }

    // Check status
    if (user.status !== 'ACTIVE') {
      issues.push(`User status is "${user.status}" instead of "ACTIVE"`);
      await prisma.user.update({
        where: { id: user.id },
        data: { status: 'ACTIVE' as any },
      });
      fixes.push('Status updated to ACTIVE');
    }

    return NextResponse.json({
      exists: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        hasPassword: !!user.password,
        passwordValid,
        business: user.business?.name,
      },
      issues: issues.length > 0 ? issues : null,
      fixes: fixes.length > 0 ? fixes : null,
      credentials: {
        email,
        password,
      },
      message: issues.length === 0 && fixes.length === 0
        ? 'Super admin user is properly configured!'
        : 'Super admin user has been fixed!',
      loginUrl: 'http://localhost:3000/admin/access',
    });
  } catch (error: any) {
    console.error('Error verifying super admin:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify super admin' },
      { status: 500 }
    );
  }
}

