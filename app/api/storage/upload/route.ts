import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadToMinio, getPresignedUrl, ensureBucket } from '@/lib/services/minio';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv',
];

// POST /api/storage/upload — Upload file to MinIO
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = (session.user as Record<string, string>).businessId;
    if (!businessId) {
      return NextResponse.json({ error: 'No business found' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'attachments';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed: ${file.type}` },
        { status: 400 }
      );
    }

    // Create object key
    const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `${businessId}/${folder}/${Date.now()}-${sanitized}`;

    // Upload to MinIO
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await ensureBucket();
    await uploadToMinio(objectKey, buffer, file.type);

    // Generate presigned URL
    const url = await getPresignedUrl(objectKey);

    return NextResponse.json({
      success: true,
      objectKey,
      filename: file.name,
      size: file.size,
      contentType: file.type,
      url,
    });
  } catch (error) {
    console.error('Storage Upload API Error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
