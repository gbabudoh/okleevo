import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { send2FAEmail } from '@/lib/services/email';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { action } = body;

    // 1. Send test 6-digit verification code to user's email
    if (action === 'send-enable-code') {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorCode: generatedOtp,
          twoFactorExpires: expires,
        },
      });

      const emailResult = await send2FAEmail(user.email, generatedOtp, user.firstName);
      if (!emailResult.success) {
        return NextResponse.json({ error: emailResult.error || 'Failed to send verification email' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: `Verification code sent to ${user.email}` });
    }

    // 2. Verify code and activate 2FA
    if (action === 'verify-enable') {
      const { code } = body;
      if (!code || typeof code !== 'string') {
        return NextResponse.json({ error: 'Please enter the 6-digit verification code' }, { status: 400 });
      }

      const trimmedCode = code.trim();
      const isCodeValid =
        user.twoFactorCode === trimmedCode &&
        user.twoFactorExpires !== null &&
        new Date(user.twoFactorExpires) > new Date();

      if (!isCodeValid) {
        return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorEnabled: true,
          twoFactorCode: null,
          twoFactorExpires: null,
        },
      });

      return NextResponse.json({ success: true, message: 'Two-Factor Authentication is now enabled.' });
    }

    // 3. Disable 2FA with password confirmation
    if (action === 'disable') {
      const { password } = body;
      if (!password || typeof password !== 'string') {
        return NextResponse.json({ error: 'Please enter your password to disable 2FA' }, { status: 400 });
      }

      if (user.password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return NextResponse.json({ error: 'Incorrect password' }, { status: 400 });
        }
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorEnabled: false,
          twoFactorCode: null,
          twoFactorExpires: null,
        },
      });

      return NextResponse.json({ success: true, message: 'Two-Factor Authentication has been disabled.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    console.error('2FA API error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
