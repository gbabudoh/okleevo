import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

interface EntryLine { accountId: string; debit?: number; credit?: number; description?: string; }

export const PATCH = withMultiTenancy(async (req, { user, params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { date, description, reference, entries } = body;
    const totalDebits = entries.reduce((s: number, e: EntryLine) => s + (e.debit || 0), 0);
    const totalCredits = entries.reduce((s: number, e: EntryLine) => s + (e.credit || 0), 0);
    if (Math.abs(totalDebits - totalCredits) > 0.001) {
      return NextResponse.json({ error: 'Journal entry does not balance.' }, { status: 400 });
    }
    // Verify ownership
    const existing = await prisma.journalEntry.findFirst({ where: { id: id as string, businessId: user.businessId } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Delete existing ledger entries and re-create
    await prisma.ledgerEntry.deleteMany({ where: { journalEntryId: id as string } });
    const updated = await prisma.journalEntry.update({
      where: { id: id as string },
      data: {
        date: new Date(date),
        description,
        reference,
        entries: { create: entries.map((e: EntryLine) => ({ accountId: e.accountId, debit: e.debit || 0, credit: e.credit || 0, description: e.description })) },
      },
      include: { entries: true },
    });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Update journal entry error:', error);
    return NextResponse.json({ error: 'Failed to update journal entry' }, { status: 500 });
  }
});

export const DELETE = withMultiTenancy(async (req, { user, params }) => {
  try {
    const { id } = await params;
    await prisma.journalEntry.deleteMany({ where: { id: id as string, businessId: user.businessId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete journal entry error:', error);
    return NextResponse.json({ error: 'Failed to delete journal entry' }, { status: 500 });
  }
});
