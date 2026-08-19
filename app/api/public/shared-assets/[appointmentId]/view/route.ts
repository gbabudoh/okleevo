import { Readable } from 'stream';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyGuestAssetToken } from '@/lib/security/guest-tokens';
import { streamGuestObject } from '@/lib/services/guest-storage';

/**
 * Streams a guest-uploaded file into the video room's shared-assets sidebar.
 * Requires the per-appointment guest asset token issued by
 * /api/public/video-rooms/verify (Authorization: Bearer, not a cookie) — the
 * client never receives a direct MinIO url/credentials, and a token for one
 * appointment can never be used to read another appointment's files.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params;

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
    const payload = token ? verifyGuestAssetToken(token) : null;

    if (!payload || payload.appointmentId !== appointmentId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const uploadId = new URL(req.url).searchParams.get('upload');
    if (!uploadId) {
      return NextResponse.json({ error: 'Missing upload id' }, { status: 400 });
    }

    const upload = await prisma.guestUpload.findFirst({
      where: { id: uploadId, appointmentId },
    });

    if (!upload || upload.malwareScanStatus !== 'CLEAN') {
      // Covers "not found", "still scanning", and "infected" with the same
      // response — an unscanned or infected file must never be streamed.
      return NextResponse.json({ error: 'File not available' }, { status: 404 });
    }

    const nodeStream = await streamGuestObject(upload.s3ObjectKey);
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': upload.mimeType,
        'Content-Disposition': `inline; filename="${upload.fileName.replace(/["\\]/g, '_')}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('Error streaming shared guest asset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
