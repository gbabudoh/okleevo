import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as Minio from 'minio';

// Load .env and .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const rawEndpoint = process.env.S3_ENDPOINT || process.env.MINIO_ENDPOINT || '127.0.0.1';
const MINIO_ENDPOINT = rawEndpoint.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
const isHttps = rawEndpoint.startsWith('https://') || process.env.S3_USE_SSL === 'true' || process.env.MINIO_USE_SSL === 'true';
const MINIO_USE_SSL = isHttps;
const MINIO_PORT = process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : (isHttps ? 443 : 9000);
const MINIO_ACCESS = process.env.S3_ACCESS_KEY || process.env.MINIO_ACCESS_KEY || '';
const MINIO_SECRET = process.env.S3_SECRET_KEY || process.env.MINIO_SECRET_KEY || '';
const DEFAULT_BUCKET = process.env.S3_BUCKET || process.env.MINIO_BUCKET || 'okleevo-uploads';

async function main() {
  console.log(`Checking MinIO configuration...`);
  console.log(`Endpoint: ${MINIO_ENDPOINT}:${MINIO_PORT}, SSL: ${MINIO_USE_SSL}, Bucket: ${DEFAULT_BUCKET}`);

  if (!MINIO_ACCESS || !MINIO_SECRET) {
    console.warn(`MinIO credentials (MINIO_ACCESS_KEY / MINIO_SECRET_KEY) are not set in .env / .env.local.`);
    console.log(`When credentials are provided, running this script will sync public/avatar/* to bucket '${DEFAULT_BUCKET}'.`);
    return;
  }

  const client = new Minio.Client({
    endPoint: MINIO_ENDPOINT,
    port: MINIO_PORT,
    useSSL: MINIO_USE_SSL,
    accessKey: MINIO_ACCESS,
    secretKey: MINIO_SECRET,
  });

  const bucketExists = await client.bucketExists(DEFAULT_BUCKET).catch(() => false);
  if (!bucketExists) {
    console.log(`Creating bucket ${DEFAULT_BUCKET}...`);
    await client.makeBucket(DEFAULT_BUCKET, 'us-east-1');
  }

  const avatarDir = path.join(__dirname, '..', 'public', 'avatar');
  const files = ['av1.jpg', 'av2.jpg', 'av3.jpg', 'av4.jpg'];

  for (const file of files) {
    const filePath = path.join(avatarDir, file);
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      const objectKey = `avatars/${file}`;
      console.log(`Uploading ${file} to ${DEFAULT_BUCKET}/${objectKey}...`);
      await client.putObject(DEFAULT_BUCKET, objectKey, buffer, buffer.length, {
        'Content-Type': 'image/jpeg',
      });
      console.log(`✓ Uploaded ${DEFAULT_BUCKET}/${objectKey}`);
    } else {
      console.warn(`File not found: ${filePath}`);
    }
  }

  console.log(`All avatars synced to MinIO successfully!`);
}

main().catch(err => {
  console.error(`MinIO upload error:`, err.message || err);
});
