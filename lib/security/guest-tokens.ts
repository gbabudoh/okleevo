// ─── Layer 2 Guest Access Tokens ────────────────────────────────────────────
// Short-lived, narrowly-scoped tokens issued to anonymous meeting guests
// after PIN verification (app/api/public/video-rooms/verify).
//
// CRITICAL ISOLATION RULE: this is a deliberately separate signing path from
// NextAuth (lib/auth.ts). It is signed with its own secret, is never set as
// a cookie, and never grants access to any authenticated dashboard route —
// proxy.ts's session-cookie gate is completely unaware of these tokens. A
// guest who verifies a PIN gets *only* a room-scoped LiveKit token and one of
// these — never a login.

import jwt from 'jsonwebtoken';

export const GUEST_TOKEN_TTL_SECONDS = 2 * 60 * 60; // 2 hours

function getGuestTokenSecret(): string {
  const secret = process.env.GUEST_TOKEN_SECRET;
  if (!secret) {
    throw new Error(
      'GUEST_TOKEN_SECRET environment variable is required for Layer 2 guest access tokens.'
    );
  }
  return secret;
}

export interface GuestAssetTokenPayload {
  appointmentId: string;
  scope: 'shared-assets';
}

/** Signs a token scoping the bearer to viewing shared assets for one appointment only. */
export function signGuestAssetToken(payload: GuestAssetTokenPayload): string {
  return jwt.sign(payload, getGuestTokenSecret(), { expiresIn: GUEST_TOKEN_TTL_SECONDS });
}

/** Returns the payload if valid and correctly scoped, otherwise null. Never throws. */
export function verifyGuestAssetToken(token: string): GuestAssetTokenPayload | null {
  try {
    const decoded = jwt.verify(token, getGuestTokenSecret());
    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      decoded.scope === 'shared-assets' &&
      typeof (decoded as Record<string, unknown>).appointmentId === 'string'
    ) {
      return { appointmentId: (decoded as { appointmentId: string }).appointmentId, scope: 'shared-assets' };
    }
    return null;
  } catch {
    return null;
  }
}
