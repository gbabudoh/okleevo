# Email Setup Guide: VPS & Gmail

## Option 1: Gmail SMTP Setup (Development/Testing)

Gmail can be used for sending emails via SMTP. This is great for development and small-scale production.

### Prerequisites
- Gmail account
- App Password (not your regular Gmail password)

### Step 1: Enable Gmail App Password

1. Go to your Google Account: https://myaccount.google.com
2. Click **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Select **Mail** and **Other (Custom name)**
5. Enter "Okleevo" as the name
6. Click **Generate**
7. Copy the 16-character password (you'll need this)

### Step 2: Add to `.env.local`

```env
# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Okleevo
```

**Important:** Use the **App Password**, not your regular Gmail password!

### Step 3: Update Email Service

The email service in `lib/services/email.ts` needs to be implemented. See implementation below.

---

## Option 2: VPS Setup with SMTP (Production)

For production VPS deployment, you have several options:

### Option A: Use Gmail (Simple, but limited)
- **Free**: Up to 500 emails/day
- **Setup**: Same as above
- **Best for**: Small businesses, testing

### Option B: Use Resend (Recommended)
- **Free**: 3,000 emails/month
- **Setup**: API-based (no SMTP needed)
- **Best for**: Production, reliable delivery

### Option C: Use SendGrid
- **Free**: 100 emails/day
- **Setup**: SMTP or API
- **Best for**: Production, high volume

### Option D: Self-hosted SMTP (Advanced)
- **Setup**: Postfix/Sendmail on VPS
- **Best for**: Full control, high volume

---

## Implementation: Gmail SMTP with Nodemailer

### Step 1: Install Nodemailer

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### Step 2: Update `lib/services/email.ts`

```typescript
import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create reusable transporter
const createTransporter = () => {
  // Gmail SMTP
  if (process.env.SMTP_HOST === 'smtp.gmail.com') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
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
    // Check if email is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('Email not configured. Skipping email send.');
      console.log('Would send email:', options);
      return false;
    }

    const transporter = createTransporter();
    const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;
    const fromName = process.env.EMAIL_FROM_NAME || 'Okleevo';

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    });

    console.log('Email sent successfully to:', options.to);
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: 'Welcome to Okleevo!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #fc6813;">Welcome to Okleevo, ${name}!</h1>
        <p>Thank you for joining Okleevo - your all-in-one business platform.</p>
        <p>You can now access all 20 integrated business tools to help grow your SME.</p>
        <p style="margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/access" 
             style="background-color: #fc6813; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block;">
            Sign In to Your Account
          </a>
        </p>
      </div>
    `,
    text: `Welcome to Okleevo, ${name}! Thank you for joining us. Sign in at ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/access`,
  });
}

export async function sendVerificationEmail(email: string, token: string, name: string): Promise<boolean> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;
  
  return sendEmail({
    to: email,
    subject: 'Verify your Okleevo account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
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
        <p style="color: #666; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          This link will expire in 24 hours.
        </p>
      </div>
    `,
    text: `Hi ${name}, verify your email by visiting: ${verificationUrl}`,
  });
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
  return sendEmail({
    to: email,
    subject: 'Reset your Okleevo password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #fc6813;">Password Reset Request</h1>
        <p>Click the button below to reset your password:</p>
        <p style="margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #fc6813; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p style="color: #666; font-size: 12px;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
    text: `Reset your password: ${resetUrl}`,
  });
}

export async function sendInvoiceEmail(email: string, invoiceId: string, invoiceUrl: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: 'New Invoice from Okleevo',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #fc6813;">New Invoice</h1>
        <p>You have a new invoice: <strong>${invoiceId}</strong></p>
        <p style="margin: 30px 0;">
          <a href="${invoiceUrl}" 
             style="background-color: #fc6813; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block;">
            View Invoice
          </a>
        </p>
      </div>
    `,
    text: `You have a new invoice: ${invoiceId}. View at: ${invoiceUrl}`,
  });
}
```

---

## VPS Deployment Checklist

### 1. Environment Variables

Create `.env.production` on your VPS:

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/okleevo

# NextAuth.js
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://yourdomain.com

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Okleevo

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 2. VPS Email Setup Options

#### Option A: Use Gmail (Easiest)
- ✅ No server configuration needed
- ✅ Works immediately
- ❌ Limited to 500 emails/day
- ❌ May hit spam filters

#### Option B: Use Resend (Recommended)
```env
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@yourdomain.com
```
- ✅ Better deliverability
- ✅ 3,000 emails/month free
- ✅ No SMTP configuration

#### Option C: Self-hosted Postfix (Advanced)
```bash
# On Ubuntu/Debian VPS
sudo apt update
sudo apt install postfix
# Configure during installation
```

Then use:
```env
SMTP_HOST=localhost
SMTP_PORT=25
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@yourdomain.com
```

**Note:** Requires domain DNS setup (SPF, DKIM, DMARC records)

---

## Testing Email Setup

### Test Script

Create `scripts/test-email.ts`:

```typescript
import { sendEmail } from '../lib/services/email';

async function testEmail() {
  const result = await sendEmail({
    to: 'your-email@gmail.com',
    subject: 'Test Email from Okleevo',
    html: '<h1>Test Email</h1><p>If you receive this, email is working!</p>',
    text: 'Test Email - If you receive this, email is working!',
  });

  console.log('Email sent:', result);
  process.exit(0);
}

testEmail();
```

Run: `npx tsx scripts/test-email.ts`

---

## Gmail Limits & Best Practices

### Gmail Limits
- **Daily sending limit**: 500 emails/day
- **Rate limit**: ~100 emails/hour
- **App Password required**: Yes (for 2FA accounts)

### Best Practices
1. **Use App Passwords**: Never use your regular Gmail password
2. **Monitor sending**: Don't exceed daily limits
3. **For production**: Consider Resend or SendGrid for better deliverability
4. **Domain verification**: For better deliverability, verify your domain with Gmail

---

## Quick Setup Summary

### For Development (Gmail)
1. Enable 2FA on Gmail
2. Generate App Password
3. Add to `.env.local`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com
   ```
4. Implement email service (see above)
5. Test with test script

### For Production VPS
1. **Option 1**: Use Resend (recommended)
   - Sign up at resend.com
   - Get API key
   - Add `RESEND_API_KEY` to `.env.production`

2. **Option 2**: Use Gmail
   - Same as development setup
   - Monitor daily limits

3. **Option 3**: Self-hosted Postfix
   - Install Postfix on VPS
   - Configure DNS records
   - Use `localhost` as SMTP_HOST

---

## Next Steps

1. Choose your email provider (Gmail for dev, Resend for production)
2. Install nodemailer: `npm install nodemailer @types/nodemailer`
3. Update `lib/services/email.ts` with the implementation above
4. Add environment variables to `.env.local`
5. Test email sending
6. Update onboarding to send welcome emails (optional)

