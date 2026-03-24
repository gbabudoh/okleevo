import * as nodemailer from 'nodemailer';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface EmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;           // URL or file path
  contentType?: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: EmailAttachment[];
}

export interface ClientEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: EmailAttachment[];
  businessName?: string;
  businessEmail?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ─── Transporter ─────────────────────────────────────────────────────────────

const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  // Gmail SMTP
  if (process.env.SMTP_HOST === 'smtp.gmail.com') {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Generic SMTP
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// ─── Core Send ───────────────────────────────────────────────────────────────

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.warn('Email not configured. SMTP_HOST, SMTP_USER, or SMTP_PASS missing.');
      console.log('Would send email:', { to: options.to, subject: options.subject });
      return { success: false, error: 'SMTP not configured' };
    }

    const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@okleevo.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'Okleevo';

    const mailOptions: Record<string, unknown> = {
      from: `"${fromName}" <${fromEmail}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    };

    if (options.replyTo) mailOptions.replyTo = options.replyTo;
    if (options.cc) mailOptions.cc = options.cc;
    if (options.bcc) mailOptions.bcc = options.bcc;

    if (options.attachments && options.attachments.length > 0) {
      mailOptions.attachments = options.attachments.map((att) => ({
        filename: att.filename,
        content: att.content,
        path: att.path,
        contentType: att.contentType,
      }));
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', options.to, '| MessageID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Email send failed:', message);
    return { success: false, error: message };
  }
}

// ─── SME → Client Email (branded) ───────────────────────────────────────────

export async function sendClientEmail(options: ClientEmailOptions): Promise<EmailResult> {
  const businessName = options.businessName || 'Your Business';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const brandedHtml = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #fc6813 0%, #ff8a47 100%); padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;">
          ${businessName}
        </h2>
        <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0; font-size: 13px;">
          via Okleevo
        </p>
      </div>

      <!-- Body -->
      <div style="padding: 32px; border: 1px solid #e5e7eb; border-top: none;">
        ${options.html}
      </div>

      <!-- Footer -->
      <div style="padding: 20px 32px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
          Sent by <strong>${businessName}</strong> using
          <a href="${appUrl}" style="color: #fc6813; text-decoration: none;">Okleevo</a>
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: options.to,
    subject: options.subject,
    html: brandedHtml,
    text: options.text,
    replyTo: options.replyTo || options.businessEmail,
    cc: options.cc,
    bcc: options.bcc,
    attachments: options.attachments,
  });
}

// ─── Template Helpers (existing) ─────────────────────────────────────────────

export async function sendWelcomeEmail(email: string, name: string): Promise<EmailResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

  return sendEmail({
    to: email,
    subject: 'Welcome to Okleevo!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #fc6813;">Welcome to Okleevo, ${name}!</h1>
        <p>Thank you for joining Okleevo - your all-in-one business platform.</p>
        <p>You can now access all 20 integrated business tools to help grow your SME.</p>
        <p style="margin-top: 30px;">
          <a href="${appUrl}/access"
             style="background-color: #fc6813; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block;">
            Sign In to Your Account
          </a>
        </p>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          If you have any questions, contact us at ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@okleevo.com'}
        </p>
      </div>
    `,
    text: `Welcome to Okleevo, ${name}! Thank you for joining us. Sign in at ${appUrl}/access`,
  });
}

export async function sendVerificationEmail(email: string, token: string, name: string): Promise<EmailResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const verificationUrl = `${appUrl}/auth/verify-email?token=${token}`;

  return sendEmail({
    to: email,
    subject: 'Verify your Okleevo account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #fc6813;">Verify your email address</h1>
        <p>Hi ${name},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <p style="margin: 30px 0;">
          <a href="${verificationUrl}"
             style="background-color: #fc6813; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block;">
            Verify Email Address
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; font-size: 12px; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          This link will expire in 24 hours.
        </p>
      </div>
    `,
    text: `Hi ${name}, verify your email by visiting: ${verificationUrl}`,
  });
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<EmailResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/auth/reset-password?token=${resetToken}`;

  return sendEmail({
    to: email,
    subject: 'Reset your Okleevo password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #fc6813;">Password Reset Request</h1>
        <p>Click the button below to reset your password:</p>
        <p style="margin: 30px 0;">
          <a href="${resetUrl}"
             style="background-color: #fc6813; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p style="color: #666; font-size: 12px;">
          If you didn't request this, please ignore this email. This link will expire in 1 hour.
        </p>
      </div>
    `,
    text: `Reset your password: ${resetUrl}`,
  });
}

export async function sendInvoiceEmail(email: string, invoiceId: string, invoiceUrl?: string): Promise<EmailResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const url = invoiceUrl || `${appUrl}/dashboard/invoices/${invoiceId}`;

  return sendEmail({
    to: email,
    subject: 'New Invoice from Okleevo',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #fc6813;">New Invoice</h1>
        <p>You have a new invoice: <strong>${invoiceId}</strong></p>
        <p style="margin: 30px 0;">
          <a href="${url}"
             style="background-color: #fc6813; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block;">
            View Invoice
          </a>
        </p>
      </div>
    `,
    text: `You have a new invoice: ${invoiceId}. View at: ${url}`,
  });
}
