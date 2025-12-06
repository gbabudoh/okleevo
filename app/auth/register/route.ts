import { NextRequest, NextResponse } from 'next/server';

// User registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
    } = body;

    // Validation
    if (!email || !password || !businessName || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // TODO: Check if email already exists
    // TODO: Hash password
    // TODO: Save to database
    // TODO: Send verification email
    // TODO: Generate JWT token

    // Mock successful registration
    const newUser = {
      id: 'user_' + Date.now(),
      businessName,
      industry,
      businessSize,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      postcode,
      role: 'owner',
      status: 'pending_verification',
      createdAt: new Date().toISOString(),
    };

    const mockToken = 'jwt_token_' + Date.now();

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        user: newUser,
        token: mockToken,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
