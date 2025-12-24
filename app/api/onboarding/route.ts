import { NextRequest, NextResponse } from 'next/server';
import { createSMEOnboarding } from '@/lib/auth/onboarding';
import { registrationSchema } from '@/lib/security/validation';
import { prisma } from '@/lib/prisma';

// Ensure API route runs in Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

/**
 * SME Registration/Onboarding API
 * Creates Clerk organization, user, and business record
 */
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate input
    const validationResult = registrationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const {
      businessName,
      industry,
      businessSize,
      firstName,
      lastName,
      email,
      phone,
      password,
      address,
      city,
      postcode,
    } = validationResult.data;

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

    // Create SME onboarding (organization + user + business)
    const result = await createSMEOnboarding({
      businessName,
      industry,
      businessSize,
      firstName,
      lastName,
      email,
      phone,
      password,
      address,
      city,
      postcode,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful! Your account is ready. Please sign in to continue.',
        data: {
          userId: result.user.id,
          businessId: result.business.id,
          email: result.user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Onboarding Error:', error);
    console.error('Error stack:', error.stack);

    // Handle Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }


    // Handle other errors
    const errorMessage = error.message || 'Failed to create account';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      },
      { status: 500 }
    );
  }
}

