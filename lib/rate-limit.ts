// ─── Best-effort in-process rate limiter ────────────────────────────────────
// Used to slow down abuse of unauthenticated Layer 2 endpoints (booking
// reservation spam, PIN brute-forcing) alongside the DB-backed PIN lockout
// on Appointment (pinAttempts/pinLockedUntil), which is the real defense for
// PIN guessing since it's durable across requests and instances.
//
// LIMITATION: state lives in process memory only. It resets on cold start
// and is NOT shared across concurrent serverless instances, so on Vercel
// this is a soft speed bump, not a hard guarantee. If distributed abuse
// becomes a real problem, swap this for a shared store (e.g. Upstash Redis)
// — the checkRateLimit signature is designed to make that a drop-in change.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true };
}

/** Best-effort client identifier for rate limiting public routes behind Vercel/a reverse proxy. */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}
