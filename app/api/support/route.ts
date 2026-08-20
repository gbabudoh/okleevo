import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/services/email';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { business: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { category, subject, message, priority } = body;

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    const refNumber = `OKL-${Math.floor(100000 + Math.random() * 900000)}`;
    const businessName = user.business?.name || 'Workspace';
    const userName = `${user.firstName} ${user.lastName}`.trim() || user.name || 'Okleevo User';
    const userEmail = user.email;

    const supportRecipient = process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || 'support@okleevo.com';

    // 1. Email Okleevo Admin / Support Team
    const adminHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #ea580c, #f59e0b); padding: 24px 28px; color: #ffffff;">
          <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase;">
            New SME Support Inquiry • ${refNumber}
          </span>
          <h2 style="margin: 12px 0 0 0; font-size: 20px; font-weight: 800;">${subject}</h2>
        </div>
        <div style="padding: 28px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 120px;"><strong>Client:</strong></td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${userName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;"><strong>Business:</strong></td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${businessName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;"><strong>Email:</strong></td>
              <td style="padding: 6px 0; color: #0f172a;"><a href="mailto:${userEmail}" style="color: #ea580c;">${userEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;"><strong>Category:</strong></td>
              <td style="padding: 6px 0; color: #0f172a;">${category || 'General Support'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;"><strong>Priority:</strong></td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700; text-transform: uppercase;">${priority || 'NORMAL'}</td>
            </tr>
          </table>

          <div style="background: #f8fafc; border-left: 4px solid #ea580c; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Inquiry Message:</p>
            <p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="mailto:${userEmail}?subject=Re: [${refNumber}] ${encodeURIComponent(subject)}" style="display: inline-block; background: #ea580c; color: #ffffff; padding: 10px 24px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 13px;">
              Reply Directly to Client →
            </a>
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      to: supportRecipient,
      replyTo: userEmail,
      subject: `🚨 [Support Request ${refNumber}] ${subject} - ${businessName}`,
      html: adminHtml,
      text: `Support Request ${refNumber}\nFrom: ${userName} (${userEmail}) - ${businessName}\nCategory: ${category}\nPriority: ${priority}\n\nMessage:\n${message}`,
      senderName: `Okleevo Support Desk`,
    }).catch(err => console.error('Admin support notification failed:', err));

    // 2. Email Confirmation to the SME Client
    const clientHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: #ffffff; padding: 24px 24px 16px 24px; border-bottom: 1px solid #f1f5f9; text-align: center;">
          <img src="https://okleevo.com/logo.png" alt="Okleevo" width="130" style="display: block; margin: 0 auto;" />
        </div>
        <div style="padding: 28px;">
          <span style="display: inline-block; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase;">
            ✓ Request Received • ${refNumber}
          </span>
          <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 14px 0 8px 0;">We have received your support request</h2>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
            Hello ${userName}, our technical support team and system engineers have received your inquiry regarding <strong>"${subject}"</strong>.
          </p>

          <div style="background: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; margin-bottom: 20px; font-size: 13px;">
            <p style="margin: 0 0 6px 0; color: #64748b;"><strong>Reference ID:</strong> ${refNumber}</p>
            <p style="margin: 0 0 6px 0; color: #64748b;"><strong>Topic:</strong> ${category || 'General Support'}</p>
            <p style="margin: 0; color: #64748b;"><strong>Expected Response Time:</strong> Within 2–4 business hours</p>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            An Okleevo specialist will review your details and respond to this email thread directly.
          </p>
        </div>
        <div style="background: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #f1f5f9;">
          <p style="font-size: 11px; color: #94a3b8; margin: 0;">&copy; ${new Date().getFullYear()} Okleevo Platform Support. All rights reserved.</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: userEmail,
      subject: `Support Request Received: ${subject} [${refNumber}]`,
      html: clientHtml,
      text: `Hello ${userName},\n\nWe have received your support request "${subject}" (Ref: ${refNumber}). An Okleevo specialist will respond to you shortly.\n\nBest regards,\nOkleevo Support Team`,
      senderName: 'Okleevo Support',
    }).catch(err => console.error('Client support confirmation failed:', err));

    // 3. Create Notification for in-app alert
    await prisma.notification.create({
      data: {
        userId: user.id,
        businessId: user.businessId,
        title: `Support Request Submitted (${refNumber})`,
        message: `Your inquiry regarding "${subject}" was forwarded to Okleevo support engineers.`,
        type: 'info',
        status: 'unread',
      },
    }).catch(err => console.error('Notification create error:', err));

    return NextResponse.json({
      success: true,
      refNumber,
      message: 'Support request submitted successfully. Our team has been notified.',
    });
  } catch (error) {
    console.error('Error submitting support request:', error);
    return NextResponse.json({ error: 'Failed to submit support request' }, { status: 500 });
  }
}
