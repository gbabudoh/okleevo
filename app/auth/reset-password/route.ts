import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Find valid, unexpired token
    const record = await prisma.verificationToken.findFirst({
      where: { token, expires: { gt: new Date() } },
    });

    if (!record) {
      return NextResponse.json({ error: 'This reset link is invalid or has expired.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: record.identifier } });
    if (!user) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    }

    // Update password and delete the used token
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await Promise.all([
      prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } }),
      prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ResetPassword] Error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
