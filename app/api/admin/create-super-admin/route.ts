import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

/**
 * POST - Create super admin user (one-time setup endpoint)
 * This endpoint should be secured or removed after initial setup
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add a secret key check for security
    const authHeader = request.headers.get('authorization');
    const secretKey = process.env.SUPER_ADMIN_SECRET_KEY || 'CHANGE_THIS_IN_PRODUCTION';

    if (authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid secret key' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      email = 'admin@okleevo.com',
      password = 'Admin123!@#',
      firstName = 'Super',
      lastName = 'Admin'
    } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if super admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Update existing user to super admin
      if (existingUser.role !== 'SUPER_ADMIN') {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            role: 'SUPER_ADMIN',
            password: hashedPassword,
            status: 'ACTIVE',
            emailVerified: new Date(),
          },
        });
        return NextResponse.json({
          success: true,
          message: 'Existing user updated to SUPER_ADMIN',
          user: {
            email,
            role: 'SUPER_ADMIN',
          },
        });
      } else {
        return NextResponse.json({
          success: true,
          message: 'Super admin user already exists',
          user: {
            email,
            role: 'SUPER_ADMIN',
          },
        });
      }
    }

    // Find or create "Platform Admin" business
    let platformBusiness = await prisma.business.findFirst({
      where: {
        name: 'Platform Administration',
      },
    });

    if (!platformBusiness) {
      platformBusiness = await prisma.business.create({
        data: {
          name: 'Platform Administration',
          industry: 'Platform',
          size: '1-5',
          country: 'UK',
          seatCount: 1,
          maxSeats: 1,
        },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create super admin user
    const superAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        businessId: platformBusiness.id,
        emailVerified: new Date(),
        timezone: 'Europe/London',
      } as any,
    });

    return NextResponse.json({
      success: true,
      message: 'Super admin user created successfully',
      credentials: {
        email,
        password,
      },
      user: {
        id: superAdmin.id,
        email: superAdmin.email,
        firstName: superAdmin.firstName,
        lastName: superAdmin.lastName,
        role: superAdmin.role,
      },
      warning: 'Please change the password after first login and secure this endpoint!',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating super admin:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create super admin' },
      { status: 500 }
    );
  }
}

