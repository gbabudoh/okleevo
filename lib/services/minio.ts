import * as Minio from 'minio';

// ─── MinIO S3-Compatible Storage Client ─────────────────────────────────────
// Docs: https://min.io/docs/minio/linux/developers/javascript/API.html

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || '127.0.0.1';
const MINIO_PORT     = parseInt(process.env.MINIO_PORT || '9000', 10);
const MINIO_ACCESS   = process.env.MINIO_ACCESS_KEY || '';
const MINIO_SECRET   = process.env.MINIO_SECRET_KEY || '';
const MINIO_USE_SSL  = process.env.MINIO_USE_SSL === 'true';
const DEFAULT_BUCKET = process.env.MINIO_BUCKET || 'okleevo-uploads';

// Singleton client
let _client: Minio.Client | null = null;

export function getMinioClient(): Minio.Client {
  if (!_client) {
    if (!MINIO_ACCESS || !MINIO_SECRET) {
      throw new Error(
        'MinIO not configured. Set MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY env vars.'
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

/** Get a permanent public URL (works when bucket policy is public) */
export function getPublicUrl(
  objectName: string,
  bucket: string = DEFAULT_BUCKET,
): string {
  const protocol = MINIO_USE_SSL ? 'https' : 'http';
  return `${protocol}://${MINIO_ENDPOINT}:${MINIO_PORT}/${bucket}/${objectName}`;
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
