import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/services/email';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Delete any existing reset tokens for this email
      await prisma.verificationToken.deleteMany({ where: { identifier: email } });

      // Generate a secure random token (1-hour expiry)
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.verificationToken.create({
        data: { identifier: email, token, expires },
      });

      const emailResult = await sendPasswordResetEmail(email, token);
      if (!emailResult.success) {
        console.error('[ForgotPassword] Failed to send reset email to:', email, '| Error:', emailResult.error);
      } else {
        console.log('[ForgotPassword] Reset email sent to:', email, '| MessageID:', emailResult.messageId);
      }
    }

    // Always return success — never reveal whether an email is registered
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ForgotPassword] Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
