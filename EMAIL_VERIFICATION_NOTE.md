# Email Verification - Future Implementation

## Current Status

Email verification is **not currently implemented**. Users are automatically verified upon registration and can sign in immediately.

## Why This Approach?

1. **Simpler Setup**: No need to configure email service (SMTP, SendGrid, Resend, etc.)
2. **Faster Onboarding**: Users can start using the platform immediately
3. **Can Be Added Later**: Email verification can be implemented when needed

## Future Implementation Options

### Option 1: NextAuth.js Email Provider
NextAuth.js has built-in email verification support:
- Uses `nodemailer` or similar
- Requires SMTP configuration
- Automatic token generation and validation

### Option 2: Custom Email Service
Use a service like:
- **Resend** (recommended for Next.js)
- **SendGrid**
- **AWS SES**
- **Postmark**

### Option 3: Third-Party Service
- **Auth0** (has email verification)
- **Magic Link** services
- **Email verification APIs**

## Implementation Steps (When Ready)

1. **Choose Email Provider**
   - Resend is recommended for Next.js projects
   - Free tier: 3,000 emails/month

2. **Install Package**
   ```bash
   npm install resend
   ```

3. **Add Environment Variables**
   ```env
   RESEND_API_KEY=re_xxxxx
   EMAIL_FROM=noreply@yourdomain.com
   ```

4. **Create Email Service**
   - Create `lib/services/email.ts`
   - Implement `sendVerificationEmail()` function
   - Generate verification token
   - Store token in database (VerificationToken model)

5. **Create Verification Route**
   - `app/api/auth/verify-email/route.ts`
   - Validate token
   - Update `emailVerified` field

6. **Update Onboarding Flow**
   - Send verification email after registration
   - Don't auto-verify
   - Show "Check your email" message

7. **Optional: Resend Email**
   - Add "Resend verification email" button
   - Rate limit to prevent abuse

## Current Behavior

- ✅ Users can register
- ✅ Users can sign in immediately
- ✅ Email is stored in database
- ❌ No verification email sent
- ❌ No verification required

## Security Considerations

For production, consider:
- Requiring email verification before full access
- Limiting features until verified
- Sending welcome emails (separate from verification)
- Rate limiting registration attempts

