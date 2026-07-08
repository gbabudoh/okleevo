import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPresignedUrl } from '@/lib/services/minio';

// GET /api/storage/resolve?key=... — Turn a stored object key back into a
// viewable (presigned) URL. Needed because upload only returns the URL once,
// and presigned URLs expire, so anything reopened later needs a fresh one.
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const key = request.nextUrl.searchParams.get('key');
    if (!key) {
      return NextResponse.json({ error: 'Missing key' }, { status: 400 });
    }

    const url = await getPresignedUrl(key);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Storage Resolve API Error:', error);
    return NextResponse.json({ error: 'Failed to resolve file' }, { status: 500 });
  }
}
