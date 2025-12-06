import { NextRequest, NextResponse } from 'next/server';

// User login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // TODO: Validate credentials against database
    // TODO: Hash password comparison
    // TODO: Generate JWT token or session

    // Mock successful login
    const mockUser = {
      id: 'user_' + Date.now(),
      email,
      name: 'John Smith',
      businessName: 'ABC Ltd',
      role: 'owner',
    };

    const mockToken = 'jwt_token_' + Date.now();

    return NextResponse.json({
      success: true,
      user: mockUser,
      token: mockToken,
      expiresIn: rememberMe ? '30d' : '24h',
    });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }
}
