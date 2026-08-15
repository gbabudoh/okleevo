import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { createReversalEntry } from '@/lib/accounting/accounting';

export const POST = withMultiTenancy(async (req, { user, params }) => {
  try {
    const { id } = await params;
    const reversal = await createReversalEntry(id as string, user.businessId, user.id);
    return NextResponse.json({ data: reversal }, { status: 201 });
  } catch (error) {
    console.error('Reverse journal entry error:', error);
    const message = error instanceof Error ? error.message : 'Failed to reverse journal entry';
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
