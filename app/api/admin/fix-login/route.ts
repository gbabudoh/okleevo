import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

/**
 * POST - Force fix super admin login
 * This will create or fix the super admin user to ensure login works
 */
export async function POST(request: NextRequest) {
  try {
    const email = 'admin@okleevo.com';
    const password = 'Admin123!@#';

    console.log('[FIX-LOGIN] Starting super admin fix...');

    // First, ensure SUPER_ADMIN exists in the database enum
    try {
      await prisma.$executeRawUnsafe(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'SUPER_ADMIN' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
          ) THEN
            ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';
          END IF;
        END $$;
      `);
      console.log('[FIX-LOGIN] ✅ SUPER_ADMIN enum value added to database');
    } catch (enumError: any) {
      // If enum already exists or other error, continue
      if (enumError.message?.includes('already exists')) {
        console.log('[FIX-LOGIN] SUPER_ADMIN enum value already exists');
      } else {
        console.warn('[FIX-LOGIN] Could not add enum value (may already exist):', enumError.message);
      }
    }

    // Find or create Platform Admin business
    let platformBusiness = await prisma.business.findFirst({
      where: { name: 'Platform Administration' },
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
        } as any,
      });
      console.log('[FIX-LOGIN] Created Platform Administration business');
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
      // Update existing user
      console.log('[FIX-LOGIN] User exists, updating...');
      try {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            password: hashedPassword,
            role: 'SUPER_ADMIN' as any,
            status: 'ACTIVE' as any,
            emailVerified: new Date(),
            businessId: platformBusiness.id,
          } as any,
        });
        console.log('[FIX-LOGIN] User updated successfully');
      } catch (updateError: any) {
        console.error('[FIX-LOGIN] Error updating user:', updateError);
        // Try with raw query if enum issue
        if (updateError.message?.includes('UserRole') || updateError.message?.includes('enum')) {
          console.log('[FIX-LOGIN] Attempting raw update due to enum issue...');
          await prisma.$executeRawUnsafe(`
            UPDATE "User" 
            SET password = $1,
                role = 'SUPER_ADMIN'::"UserRole",
                status = 'ACTIVE'::"UserStatus",
                "emailVerified" = NOW(),
                "businessId" = $2
            WHERE id = $3
          `, hashedPassword, platformBusiness.id, user.id);
          user = await prisma.user.findUnique({ where: { id: user.id } });
          console.log('[FIX-LOGIN] User updated via raw query');
        } else {
          throw updateError;
        }
      }
    } else {
      // Create new user
      console.log('[FIX-LOGIN] Creating new user...');
      try {
        user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            firstName: 'Super',
            lastName: 'Admin',
            name: 'Super Admin',
            role: 'SUPER_ADMIN' as any,
            status: 'ACTIVE' as any,
            businessId: platformBusiness.id,
            emailVerified: new Date(),
            timezone: 'Europe/London',
          } as any,
        });
        console.log('[FIX-LOGIN] User created successfully');
      } catch (createError: any) {
        console.error('[FIX-LOGIN] Error creating user:', createError);
        // Try with raw query if enum issue
        if (createError.message?.includes('UserRole') || createError.message?.includes('enum')) {
          console.log('[FIX-LOGIN] Attempting raw insert due to enum issue...');
          const userId = `user_${Date.now()}`;
          await prisma.$executeRawUnsafe(`
            INSERT INTO "User" (id, email, password, "firstName", "lastName", name, role, status, "businessId", "emailVerified", timezone, "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, 'SUPER_ADMIN'::"UserRole", 'ACTIVE'::"UserStatus", $7, NOW(), $8, NOW(), NOW())
          `, userId, email, hashedPassword, 'Super', 'Admin', 'Super Admin', platformBusiness.id, 'Europe/London');
          user = await prisma.user.findUnique({ where: { id: userId } });
          console.log('[FIX-LOGIN] User created via raw query');
        } else {
          throw createError;
        }
      }
    }

    // Verify the password works
    const passwordValid = await bcrypt.compare(password, user.password!);
    
    if (!passwordValid) {
      // Re-hash if comparison fails
      const newHash = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash },
      });
      console.log('[FIX-LOGIN] Password re-hashed');
    }

    // Final verification
    const finalUser = await prisma.user.findUnique({
      where: { email },
      include: { business: true },
    });

    const finalPasswordCheck = await bcrypt.compare(password, finalUser!.password!);

    return NextResponse.json({
      success: true,
      message: 'Super admin login has been fixed!',
      user: {
        id: finalUser!.id,
        email: finalUser!.email,
        firstName: finalUser!.firstName,
        lastName: finalUser!.lastName,
        role: finalUser!.role,
        status: finalUser!.status,
        hasPassword: !!finalUser!.password,
        passwordValid: finalPasswordCheck,
      },
      credentials: {
        email,
        password,
      },
      loginUrl: 'http://localhost:3000/admin/access',
      instructions: [
        '1. Go to: http://localhost:3000/admin/access',
        '2. Enter email: admin@okleevo.com',
        '3. Enter password: Admin123!@#',
        '4. Click Sign In',
      ],
    });
  } catch (error: any) {
    console.error('[FIX-LOGIN] Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fix login',
        details: error.stack,
      },
      { status: 500 }
    );
  }
}

