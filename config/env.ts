/**
 * Environment Configuration
 * Centralized environment variable management
 */

export const env = {
  // Application
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // PostgreSQL (Primary Database)
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  
  // AI APIs
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  
  // Email & Notifications
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@smehub20.com',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: process.env.SMTP_PORT || '587',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  
  // Authentication
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || '',

  // Layer 2 (borderless-workspace pivot): signs short-lived guest video-room
  // asset tokens. Deliberately separate from NEXTAUTH_SECRET — see
  // lib/security/guest-tokens.ts.
  GUEST_TOKEN_SECRET: process.env.GUEST_TOKEN_SECRET || '',
  GUEST_SANDBOX_BUCKET: process.env.GUEST_SANDBOX_BUCKET || 'okleevo-client-sandbox',

  // Shared secret the malware-scan worker (worker/malware-scan) presents when
  // calling back into /api/internal/webhooks/malware-scan-result.
  INTERNAL_WEBHOOK_SECRET: process.env.INTERNAL_WEBHOOK_SECRET || '',

  // UK VAT API (HMRC)
  HMRC_API_KEY: process.env.HMRC_API_KEY || '',

  // Scheduled Jobs (Vercel Cron)
  CRON_SECRET: process.env.CRON_SECRET || '',

  // Subscription
  SUBSCRIPTION_PRICE_ID: process.env.STRIPE_SUBSCRIPTION_PRICE_ID || '',
  SUBSCRIPTION_PRICE_GBP: 9.99,
} as const;

// Validation
if (process.env.NODE_ENV === 'production') {
  const required: (keyof typeof env)[] = [
    'DATABASE_URL',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'GEMINI_API_KEY',
    'GROQ_API_KEY',
    'JWT_SECRET',
    'CRON_SECRET',
    'NEXTAUTH_SECRET',
    'GUEST_TOKEN_SECRET',
    'INTERNAL_WEBHOOK_SECRET',
  ];

  // Checked against the resolved `env` object (not raw process.env) so vars
  // with a fallback source, like NEXTAUTH_SECRET/AUTH_SECRET, are recognized
  // as present regardless of which underlying var was actually set.
  const missing = required.filter(key => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

