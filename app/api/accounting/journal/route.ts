import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

interface JournalEntryLine {
  accountId: string;
  debit?: number;
  credit?: number;
  description?: string;
}

// Get Journal Entries for the current SME
export const GET = withMultiTenancy(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where: {
          businessId: user.businessId,
        },
        include: {
          entries: {
            include: {
              account: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.journalEntry.count({
        where: { businessId: user.businessId },
      }),
    ]);

    return NextResponse.json({
      data: entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get journal entries error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal entries' },
      { status: 500 }
    );
  }
});

// Create new journal entry (Manual Entry)
export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const body = await req.json();
    const { date, description, reference, entries } = body;

    // Validate overall balance (Sum of debits must equal sum of credits)
    const totalDebits = entries.reduce((sum: number, e: JournalEntryLine) => sum + (e.debit || 0), 0);
    const totalCredits = entries.reduce((sum: number, e: JournalEntryLine) => sum + (e.credit || 0), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.001) {
      return NextResponse.json(
        { error: 'Journal entry does not balance. Debits must equal Credits.' },
        { status: 400 }
      );
    }

    const journalEntry = await prisma.journalEntry.create({
      data: {
        date: new Date(date),
        description,
        reference,
        businessId: user.businessId,
        userId: user.id,
        entries: {
          create: entries.map((e: JournalEntryLine) => ({
            accountId: e.accountId,
            debit: e.debit || 0,
            credit: e.credit || 0,
            description: e.description,
          })),
        },
      },
      include: {
        entries: true,
      },
    });

    return NextResponse.json({ data: journalEntry }, { status: 201 });
  } catch (error) {
    console.error('Create journal entry error:', error);
    return NextResponse.json(
      { error: 'Failed to create journal entry' },
      { status: 500 }
    );
  }
});
