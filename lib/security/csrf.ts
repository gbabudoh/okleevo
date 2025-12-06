import { generateToken } from './encryption';

// CSRF token storage (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; expiresAt: number }>();

// Generate CSRF token
export function generateCSRFToken(sessionId: string): string {
  const token = generateToken(32);
  const expiresAt = Date.now() + 3600000; // 1 hour
  
  csrfTokens.set(sessionId, { token, expiresAt });
  
  return token;
}

// Verify CSRF token
export function verifyCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  
  if (!stored) {
    return false;
  }
  
  if (Date.now() > stored.expiresAt) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  return stored.token === token;
}

// Clean expired tokens
export function cleanExpiredTokens(): void {
  const now = Date.now();
  
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (now > data.expiresAt) {
      csrfTokens.delete(sessionId);
    }
  }
}

// Run cleanup every hour
if (typeof window === 'undefined') {
  setInterval(cleanExpiredTokens, 3600000);
}
