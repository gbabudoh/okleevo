# Email Environment Variables Setup

## Current Status

Email service is **not currently configured**. The environment variables exist in `.env.local` but the email service is not implemented.

## Environment Variables in `.env.local`

You currently have:
```env
# Email Service (SendGrid/Resend/Mailgun)
# SendGrid
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@okleevo.com
SENDGRID_FROM_NAME=Okleevo
# Alternative: Resend
# RESEND_API_KEY=re_your_resend_api_key_here
NEXT_PUBLIC_SUPPORT_EMAIL=support@okleevo.com
```

## Expected Environment Variables (from `config/env.ts`)

The code expects these variables:
```env
# Email & Notifications
EMAIL_FROM=noreply@smehub20.com
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key_here
```

## Email Service Options

### Option 1: Resend (Recommended for Next.js)
**Free tier:** 3,000 emails/month

1. Sign up at https://resend.com
2. Get your API key
3. Add to `.env.local`:
```env
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@yourdomain.com
```

### Option 2: SendGrid
**Free tier:** 100 emails/day

1. Sign up at https://sendgrid.com
2. Create API key
3. Add to `.env.local`:
```env
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=noreply@yourdomain.com
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key_here
```

### Option 3: SMTP (Gmail, Outlook, etc.)
For development/testing with Gmail:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

**Note:** Gmail requires an "App Password" (not your regular password).

## Current Implementation Status

- ❌ Email service not implemented (`lib/services/email.ts` is a placeholder)
- ❌ No emails are being sent
- ✅ Environment variables are defined
- ✅ Email service structure exists

## To Enable Email

1. **Choose a provider** (Resend recommended)
2. **Get API key** from provider
3. **Update `.env.local`** with real credentials
4. **Implement email service** in `lib/services/email.ts`
5. **Update onboarding** to send verification emails

## For Now

Since email verification is disabled, you **don't need** to configure email service right now. Users can register and sign in without email verification.

When you're ready to add email verification, follow the steps in `EMAIL_VERIFICATION_NOTE.md`.

