import { NextResponse } from 'next/server';

// ─── Enterprise Sliding-Window Rate Limiter ──────────────────────────────────
// Protects authentication endpoints, billing checkouts, OTP verifications,
// support ticket submissions, and guest booking gateways against brute-force
// attacks, credential stuffing, and DoS spam.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodic garbage collection for expired rate limit buckets (runs every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt <= now) {
        buckets.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds?: number;
}

/**
 * Checks if a given key has exceeded the allowed request limit within the time window.
 *
 * @param key Unique identifier (e.g. `auth:ip:1.2.3.4` or `otp:userId:abc`)
 * @param limit Maximum allowed requests within the window
 * @param windowMs Duration of the rate limit window in milliseconds
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetAt,
    };
  }

  if (bucket.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: bucket.resetAt,
      retryAfterSeconds,
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
  };
}

/**
 * Standard HTTP 429 Too Many Requests response helper with RFC compliant headers.
 */
export function rateLimitResponse(
  result: RateLimitResult,
  customMessage: string = 'Too many requests. Please slow down and try again later.'
): NextResponse {
  const retryAfter = result.retryAfterSeconds || 60;
  return NextResponse.json(
    {
      error: 'Too Many Requests',
      message: customMessage,
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
      },
    }
  );
}

/** Best-effort client IP identifier for rate limiting behind reverse proxies (Cloudflare, Vercel, Nginx). */
export function getClientIp(req: Request): string {
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();

  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  return req.headers.get('x-real-ip') || '127.0.0.1';
}
