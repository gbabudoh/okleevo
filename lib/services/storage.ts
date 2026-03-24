// ─── File Storage Service (MinIO-backed) ────────────────────────────────────
// Wraps MinIO operations with business-scoped paths and validation.

import {
  uploadToMinio,
  deleteFromMinio,
  getPresignedUrl,
  getPublicUrl,
} from './minio';

export interface UploadOptions {
  file: File;
  folder?: string;
  businessId?: string;
  maxSize?: number; // in bytes
}

export interface UploadResult {
  url: string;
  objectKey: string;
  filename: string;
  size: number;
  type: string;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB default

/**
 * Upload a File (browser File or Node Buffer) to MinIO.
 * Files are stored under `{businessId}/{folder}/{timestamp}-{filename}`.
 */
export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
  const { file, folder = 'uploads', businessId = 'general', maxSize = MAX_FILE_SIZE } = options;

  // Validate file size
  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum of ${maxSize / 1024 / 1024}MB`);
  }

  const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const objectName = `${businessId}/${folder}/${Date.now()}-${sanitized}`;

  // Convert File → Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await uploadToMinio(objectName, buffer, file.type);

  // Generate a presigned URL valid for 7 days
  const url = await getPresignedUrl(objectName);

  return {
    url,
    objectKey: objectName,
    filename: file.name,
    size: file.size,
    type: file.type,
  };
}

/**
 * Upload a raw Buffer to MinIO (useful server-side).
 */
export async function uploadBuffer(
  buffer: Buffer,
  filename: string,
  contentType: string,
  folder: string = 'attachments',
  businessId: string = 'general',
): Promise<UploadResult> {
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const objectName = `${businessId}/${folder}/${Date.now()}-${sanitized}`;

  await uploadToMinio(objectName, buffer, contentType);
  const url = await getPresignedUrl(objectName);

  return {
    url,
    objectKey: objectName,
    filename,
    size: buffer.length,
    type: contentType,
  };
}

/**
 * Delete a file from MinIO by its object key.
 */
export async function deleteFile(objectKey: string): Promise<boolean> {
  try {
    await deleteFromMinio(objectKey);
    return true;
  } catch (error) {
    console.error('File deletion error:', error);
    return false;
  }
}

/**
 * Get a fresh presigned download URL for an existing object.
 */
export async function getDownloadUrl(objectKey: string, expirySeconds?: number): Promise<string> {
  return getPresignedUrl(objectKey, undefined, expirySeconds);
}

/**
 * Get a permanent (non-expiring) public URL. Requires bucket to have public policy.
 */
export function getStaticUrl(objectKey: string): string {
  return getPublicUrl(objectKey);
}

// ─── Utilities ───────────────────────────────────────────────────────────────

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  return imageExtensions.includes(getFileExtension(filename));
}

export function isPDFFile(filename: string): boolean {
  return getFileExtension(filename) === 'pdf';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
