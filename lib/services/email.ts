import nodemailer from 'nodemailer';

// Email service for sending transactional emails
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create reusable transporter
const createTransporter = () => {
  // Check if email is configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  // Gmail SMTP
  if (process.env.SMTP_HOST === 'smtp.gmail.com') {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // App Password for Gmail
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

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    // If email not configured, log and return false
    if (!transporter) {
      console.warn('Email not configured. SMTP_HOST, SMTP_USER, or SMTP_PASS missing.');
      console.log('Would send email:', { to: options.to, subject: options.subject });
      return false;
    }

    const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@okleevo.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'Okleevo';

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    });

    console.log('✅ Email sent successfully to:', options.to);
    return true;
  } catch (error) {
    console.error('❌ Email send failed:', error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
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

export async function sendVerificationEmail(email: string, token: string, name: string): Promise<boolean> {
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

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
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

export async function sendInvoiceEmail(email: string, invoiceId: string, invoiceUrl?: string): Promise<boolean> {
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
