import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';

export const GET = withMultiTenancy(async () => {
  // For now, return an empty array as there is no Notification model in schema yet
  return NextResponse.json([]);
});
