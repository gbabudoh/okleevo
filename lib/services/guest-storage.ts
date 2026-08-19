// ─── Guest (Layer 2) File Storage ───────────────────────────────────────────
// Wraps MinIO operations for the isolated, zero-login guest upload flow.
//
// Deliberately a separate bucket from lib/services/storage.ts's
// `okleevo-uploads` bucket: guest uploads are unauthenticated-submitted,
// unscanned-until-ClamAV-clears-them content, and must never share a
// namespace (or bucket policy) with internal team files.

import {
  getPresignedPutUrl,
  getObjectStream,
  deleteFromMinio,
  objectExists,
} from './minio';

export const GUEST_SANDBOX_BUCKET =
  process.env.GUEST_SANDBOX_BUCKET || process.env.MINIO_GUEST_BUCKET || 'okleevo-client-sandbox';

const PUT_EXPIRY_SECONDS = 15 * 60; // matches the pivot spec's "link dies after 15 minutes" requirement

/**
 * Build the object key for a guest upload. Keyed by appointment so a
 * malware-scan webhook or manual audit can find every file for a booking.
 */
export function buildGuestObjectKey(appointmentId: string, fileName: string): string {
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `incoming/${appointmentId}/${Date.now()}-${sanitized}`;
}

/** Presigned PUT url the guest's browser uploads directly to — 15 minute expiry. */
export async function getGuestUploadUrl(objectKey: string): Promise<string> {
  return getPresignedPutUrl(objectKey, GUEST_SANDBOX_BUCKET, PUT_EXPIRY_SECONDS);
}

/** Server-side stream of a guest object, for the authenticated shared-assets proxy route. */
export async function streamGuestObject(objectKey: string) {
  return getObjectStream(objectKey, GUEST_SANDBOX_BUCKET);
}

/** Used by the malware-scan worker (Phase 3) to remove an infected upload immediately. */
export async function deleteGuestObject(objectKey: string): Promise<void> {
  return deleteFromMinio(objectKey, GUEST_SANDBOX_BUCKET);
}

/** Confirms a presigned-PUT upload actually landed before trusting the record. */
export async function guestObjectExists(objectKey: string): Promise<boolean> {
  return objectExists(objectKey, GUEST_SANDBOX_BUCKET);
}
