import { NextRequest, NextResponse } from 'next/server';

// Get current user
export async function GET(request: NextRequest) {
  try {
    // TODO: Extract token from Authorization header
    // TODO: Validate JWT token
    // TODO: Fetch user from database

    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Mock user data
    const mockUser = {
      id: 'user_123',
      email: 'john@business.com',
      firstName: 'John',
      lastName: 'Smith',
      businessName: 'ABC Ltd',
      industry: 'professional-services',
      businessSize: '1-10',
      role: 'owner',
      status: 'active',
      emailVerified: true,
      subscription: {
        status: 'active',
        plan: 'all-in-one',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(mockUser);
  } catch (error) {
    console.error('Get User Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// Update current user
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // TODO: Validate token
    // TODO: Update user in database

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: body,
    });
  } catch (error) {
    console.error('Update User Error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
