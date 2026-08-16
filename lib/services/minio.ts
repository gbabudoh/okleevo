import * as Minio from 'minio';

// ─── MinIO S3-Compatible Storage Client ─────────────────────────────────────
// Docs: https://min.io/docs/minio/linux/developers/javascript/API.html

const rawEndpoint = process.env.S3_ENDPOINT || process.env.MINIO_ENDPOINT || '127.0.0.1';
const MINIO_ENDPOINT = rawEndpoint.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
const isHttps = rawEndpoint.startsWith('https://') || process.env.S3_USE_SSL === 'true' || process.env.MINIO_USE_SSL === 'true';
const MINIO_USE_SSL  = isHttps;
const MINIO_PORT     = process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : (isHttps ? 443 : 9000);
const MINIO_ACCESS   = process.env.S3_ACCESS_KEY || process.env.MINIO_ACCESS_KEY || '';
const MINIO_SECRET   = process.env.S3_SECRET_KEY || process.env.MINIO_SECRET_KEY || '';
const DEFAULT_BUCKET = process.env.S3_BUCKET || process.env.MINIO_BUCKET || 'okleevo-uploads';

// Singleton client
let _client: Minio.Client | null = null;

export function getMinioClient(): Minio.Client {
  if (!_client) {
    if (!MINIO_ACCESS || !MINIO_SECRET) {
      throw new Error(
        'MinIO/S3 storage not configured. Set S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY (or MINIO_...) env vars.'
      );
    }
    _client = new Minio.Client({
      endPoint:  MINIO_ENDPOINT,
      port:      MINIO_PORT,
      useSSL:    MINIO_USE_SSL,
      accessKey: MINIO_ACCESS,
      secretKey: MINIO_SECRET,
    });
  }
  return _client;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Create bucket if it does not already exist */
export async function ensureBucket(bucket: string = DEFAULT_BUCKET): Promise<void> {
  const client = getMinioClient();
  const exists = await client.bucketExists(bucket);
  if (!exists) {
    await client.makeBucket(bucket);
    console.log(`✅ MinIO bucket "${bucket}" created`);
  }
}

/** Upload a Buffer to MinIO and return the object key */
export async function uploadToMinio(
  objectName: string,
  buffer: Buffer,
  contentType: string,
  bucket: string = DEFAULT_BUCKET,
): Promise<string> {
  const client = getMinioClient();
  await ensureBucket(bucket);

  await client.putObject(bucket, objectName, buffer, buffer.length, {
    'Content-Type': contentType,
  });

  console.log(`✅ Uploaded to MinIO: ${bucket}/${objectName}`);
  return objectName;
}

/** Generate a presigned GET url (default 7 days) */
export async function getPresignedUrl(
  objectName: string,
  bucket: string = DEFAULT_BUCKET,
  expirySeconds: number = 7 * 24 * 60 * 60,
): Promise<string> {
  const client = getMinioClient();
  return client.presignedGetObject(bucket, objectName, expirySeconds);
}

/**
 * A presigned URL's signature token expires (see getPresignedUrl), but the
 * underlying object doesn't — so a value that was stored as a full presigned
 * URL can still be resolved back to its stable object key by stripping the
 * host/bucket prefix and query string. Callers that persist a "receipt" URL
 * should store the object key (not the presigned URL) and call
 * resolveReceiptUrl at read time instead — this also transparently repairs
 * rows that were saved as an expired URL before that fix existed.
 */
export function extractObjectKey(stored: string, bucket: string = DEFAULT_BUCKET): string {
  if (!/^https?:\/\//i.test(stored)) return stored;
  try {
    const { pathname } = new URL(stored);
    const decoded = decodeURIComponent(pathname).replace(/^\//, '');
    return decoded.startsWith(`${bucket}/`) ? decoded.slice(bucket.length + 1) : decoded;
  } catch {
    return stored;
  }
}

/** Resolve a stored receipt value (object key, or legacy full/expired presigned URL) to a fresh, working presigned URL. */
export async function resolveReceiptUrl(stored: string | null | undefined, bucket: string = DEFAULT_BUCKET): Promise<string | null> {
  if (!stored) return null;
  const objectKey = extractObjectKey(stored, bucket);
  try {
    return await getPresignedUrl(objectKey, bucket);
  } catch (error) {
    console.error(`Failed to resolve receipt URL for object "${objectKey}":`, error);
    return null;
  }
}

/** Get a permanent public URL (works when bucket policy is public) */
export function getPublicUrl(
  objectName: string,
  bucket: string = DEFAULT_BUCKET,
): string {
  const protocol = MINIO_USE_SSL ? 'https' : 'http';
  const portSuffix = (MINIO_PORT === 443 || MINIO_PORT === 80) ? '' : `:${MINIO_PORT}`;
  return `${protocol}://${MINIO_ENDPOINT}${portSuffix}/${bucket}/${objectName}`;
}

/** Delete a single object */
export async function deleteFromMinio(
  objectName: string,
  bucket: string = DEFAULT_BUCKET,
): Promise<void> {
  const client = getMinioClient();
  await client.removeObject(bucket, objectName);
  console.log(`🗑️ Deleted from MinIO: ${bucket}/${objectName}`);
}

/** List objects under a prefix */
export async function listObjects(
  prefix: string,
  bucket: string = DEFAULT_BUCKET,
): Promise<Minio.BucketItem[]> {
  const client = getMinioClient();
  return new Promise((resolve, reject) => {
    const items: Minio.BucketItem[] = [];
    const stream = client.listObjectsV2(bucket, prefix, true);
    stream.on('data', (obj) => items.push(obj));
    stream.on('end', () => resolve(items));
    stream.on('error', reject);
  });
}
