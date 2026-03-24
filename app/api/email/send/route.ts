import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendClientEmail } from '@/lib/services/email';
import { getPresignedUrl } from '@/lib/services/minio';
import { notifyEmailSent } from '@/lib/services/mattermost';

// POST /api/email/send — Send email from SME to client
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const businessId = (session.user as Record<string, string>).businessId;

    if (!businessId) {
      return NextResponse.json({ error: 'No business found for user' }, { status: 400 });
    }

    const body = await request.json();
    const { to, subject, html, text, cc, bcc, replyTo, attachmentKeys } = body;

    // Validation
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    // Fetch business info for branding
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { name: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true },
    });

    // Resolve attachments from MinIO if provided
    const attachments: { filename: string; path: string; contentType?: string }[] = [];
    const attachmentMeta: { filename: string; objectKey: string; size?: number; contentType?: string }[] = [];

    if (attachmentKeys && Array.isArray(attachmentKeys) && attachmentKeys.length > 0) {
      for (const key of attachmentKeys) {
        const url = await getPresignedUrl(key.objectKey || key);
        attachments.push({
          filename: key.filename || key.objectKey || key,
          path: url,
          contentType: key.contentType,
        });
        attachmentMeta.push({
          filename: key.filename || key.objectKey || key,
          objectKey: key.objectKey || key,
          size: key.size,
          contentType: key.contentType,
        });
      }
    }

    // Send the email
    const result = await sendClientEmail({
      to,
      subject,
      html,
      text,
      cc,
      bcc,
      replyTo: replyTo || user?.email,
      attachments,
      businessName: business?.name || 'Your Business',
      businessEmail: user?.email,
    });

    // Log to database
    await prisma.emailLog.create({
      data: {
        businessId,
        userId,
        to: Array.isArray(to) ? to.join(', ') : to,
        cc: cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : null,
        bcc: bcc ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : null,
        subject,
        body: html,
        attachments: attachmentMeta.length > 0 ? attachmentMeta : undefined,
        status: result.success ? 'SENT' : 'FAILED',
        errorMessage: result.error || null,
        messageId: result.messageId || null,
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    // Notify team via Mattermost (fire-and-forget)
    notifyEmailSent({
      senderName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Unknown',
      recipientEmail: Array.isArray(to) ? to.join(', ') : to,
      subject,
      businessName: business?.name || 'Unknown Business',
    }).catch((err) => console.warn('Mattermost notification skipped:', err));

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: `Email sent to ${to}`,
    });
  } catch (error) {
    console.error('Email Send API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
