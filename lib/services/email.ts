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
  senderName?: string;    // Explicit custom sender name e.g. "John Doe - Egobas Limited"
  userName?: string;      // User's name e.g. "John Doe"
  businessName?: string;  // SME Business name e.g. "Egobas Limited"
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
  userName?: string;
  senderName?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Format Option 2: "User Name - Business Name" or "Business Name" or custom sender name
 */
function getFormattedSenderName(options: EmailOptions): string {
  if (options.senderName && options.senderName.trim()) {
    return options.senderName.trim();
  }

  const uName = options.userName?.trim();
  const bName = options.businessName?.trim();

  if (uName && bName) {
    return `${uName} - ${bName}`;
  }
  if (bName) {
    return bName;
  }
  if (uName) {
    return uName;
  }

  return process.env.POSTAL_FROM_NAME || process.env.EMAIL_FROM_NAME || 'Okleevo';
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

// ─── Postal HTTP API Integration ───────────────────────────────────────────────

async function sendViaPostal(options: EmailOptions): Promise<EmailResult> {
  const apiUrl = process.env.POSTAL_API_URL;
  const apiKey = process.env.POSTAL_API_KEY;
  
  if (!apiUrl || !apiKey) {
    return { success: false, error: 'Postal API credentials missing' };
  }

  const fromEmail = process.env.POSTAL_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@okleevo.com';
  const fromName = getFormattedSenderName(options);

  // Format attachments for Postal (requires base64 data)
  const postalAttachments: { name: string; content_type: string; data: string }[] = [];
  if (options.attachments && options.attachments.length > 0) {
    for (const att of options.attachments) {
      try {
        let base64Data = '';

        if (att.content) {
          // Already have the file content in memory
          if (Buffer.isBuffer(att.content)) {
            base64Data = att.content.toString('base64');
          } else if (typeof att.content === 'string') {
            base64Data = Buffer.from(att.content).toString('base64');
          }
        } else if (att.path) {
          // Fetch from MinIO presigned URL and convert to base64
          const fileRes = await fetch(att.path);
          if (fileRes.ok) {
            const arrayBuffer = await fileRes.arrayBuffer();
            base64Data = Buffer.from(arrayBuffer).toString('base64');
          } else {
            console.warn(`⚠️ Could not fetch attachment from URL (${fileRes.status}): ${att.filename}`);
          }
        }

        if (base64Data) {
          postalAttachments.push({
            name: att.filename,
            content_type: att.contentType || 'application/octet-stream',
            data: base64Data,
          });
        }
      } catch (attErr) {
        console.warn(`⚠️ Skipping attachment "${att.filename}":`, attErr);
      }
    }
  }

  const payload = {
    to: Array.isArray(options.to) ? options.to : [options.to],
    cc: options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : [],
    bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : [],
    from: `${fromName} <${fromEmail}>`,
    subject: options.subject,
    html_body: options.html,
    plain_body: options.text || options.html.replace(/<[^>]*>/g, ''),
    reply_to: options.replyTo,
    attachments: postalAttachments.length > 0 ? postalAttachments : undefined
  };

  try {
    const response = await fetch(`${apiUrl}/api/v1/send/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Server-API-Key': apiKey,
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.status === 'success') {
      console.log('✅ Email sent via Postal HTTP API to:', options.to, '| Sender:', fromName, '| MessageID:', data.data.message_id);
      return { success: true, messageId: data.data.message_id };
    } else {
      console.error('❌ Postal API Error:', data.data.message || data.data.code);
      return { success: false, error: data.data.message || 'Postal API Error' };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Postal API Request Failed:', message);
    return { success: false, error: message };
  }
}

// ─── Core Send ───────────────────────────────────────────────────────────────

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    // 1. Prefer Postal HTTP API if configured
    if (process.env.POSTAL_API_URL && process.env.POSTAL_API_KEY) {
      return await sendViaPostal(options);
    }

    // 2. Fallback to standard SMTP
    const transporter = createTransporter();

    if (!transporter) {
      console.warn('Email not configured. SMTP/Postal credentials missing.');
      console.log('Would send email:', { to: options.to, subject: options.subject });
      return { success: false, error: 'Email service not configured' };
    }

    const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@okleevo.com';
    const fromName = getFormattedSenderName(options);

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
    console.log('✅ Email sent successfully via SMTP to:', options.to, '| Sender:', fromName, '| MessageID:', info.messageId);
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
    senderName: options.senderName,
    userName: options.userName,
    businessName: options.businessName,
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

export async function send2FAEmail(email: string, code: string, firstName?: string): Promise<EmailResult> {
  const name = firstName || 'there';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://okleevo.com';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Okleevo Verification Code</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f1f5f9; padding: 32px 16px;">
        <tr>
          <td align="center">
            
            <!-- Email Container -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
              
              <!-- Brand Header -->
              <tr>
                <td align="center" style="padding: 32px 24px 24px 24px; border-bottom: 1px solid #f1f5f9; background: #ffffff;">
                  <img src="${appUrl}/logo.png" alt="Okleevo" width="140" style="width: 140px; max-width: 140px; height: auto; display: block; border: 0; outline: none; margin: 0 auto;" />
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 32px 28px;">
                  
                  <!-- Security Badge -->
                  <div style="text-align: center; margin-bottom: 20px;">
                    <span style="display: inline-block; padding: 6px 14px; background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 9999px; font-size: 11px; font-weight: 800; color: #ea580c; text-transform: uppercase; letter-spacing: 1px;">
                      🛡️ Two-Factor Authentication
                    </span>
                  </div>

                  <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; text-align: center; margin: 0 0 12px 0; letter-spacing: -0.5px;">
                    Your Verification Code
                  </h1>

                  <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                    Hello <strong style="color: #0f172a;">${name}</strong>, enter the 6-digit code below to securely authenticate your sign-in to Okleevo:
                  </p>

                  <!-- Hero 6-Digit PIN Box -->
                  <div style="background-color: #fff7ed; border: 2px solid #fdba74; border-radius: 16px; padding: 20px 16px; text-align: center; margin: 0 0 24px 0;">
                    <span style="font-family: 'Courier New', Courier, monospace, monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #ea580c; display: block; line-height: 1;">
                      ${code}
                    </span>
                  </div>

                  <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0 0 24px 0;">
                    ⏱️ This single-use code is valid for <strong>10 minutes</strong>.
                  </p>

                  <!-- Security Advisory -->
                  <div style="background-color: #f8fafc; border-left: 4px solid #ea580c; border-radius: 8px; padding: 14px 16px;">
                    <p style="font-size: 12px; color: #334155; margin: 0; line-height: 1.5;">
                      <strong>Security Tip:</strong> If you did not request this verification code, someone may be attempting to access your account. Please sign in and update your password immediately.
                    </p>
                  </div>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px 28px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
                  <p style="font-size: 11px; color: #94a3b8; margin: 0 0 6px 0;">
                    Protected by Okleevo Multi-Factor Security Infrastructure
                  </p>
                  <p style="font-size: 11px; color: #cbd5e1; margin: 0;">
                    &copy; ${new Date().getFullYear()} Okleevo Business Operating Platform. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `🔐 Your Okleevo Verification Code: ${code}`,
    html,
    text: `Your Okleevo verification code is: ${code}. It is valid for 10 minutes.`,
    senderName: 'Okleevo Security',
  });
}

