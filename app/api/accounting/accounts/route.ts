import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

// Get Chart of Accounts for the current SME
export const GET = withMultiTenancy(async (req, { user }) => {
  try {
    const accounts = await prisma.ledgerAccount.findMany({
      where: { businessId: user.businessId },
      include: { ledgerEntries: { select: { debit: true, credit: true } } },
      orderBy: { code: 'asc' },
    });

    const data = accounts.map(acc => {
      const debits = acc.ledgerEntries.reduce((s, e) => s + e.debit, 0);
      const credits = acc.ledgerEntries.reduce((s, e) => s + e.credit, 0);
      const type = acc.type.toLowerCase();
      const balance = ['asset', 'expense'].includes(type) ? debits - credits : credits - debits;
      return { ...acc, type, balance, ledgerEntries: undefined };
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Get accounts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
});

// Create new account
export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const body = await req.json();
    const { code, name, type, category, description, openingBalance } = body;
    const upperType = (type as string).toUpperCase();

    const account = await prisma.ledgerAccount.create({
      data: {
        code,
        name,
        type: upperType as any,
        category: category || upperType,
        description,
        businessId: user.businessId,
      },
    });

    const obAmount = parseFloat(openingBalance || '0');
    if (obAmount > 0) {
      // Find or create an Opening Balance equity account to use as counterpart
      let contraAccount = await prisma.ledgerAccount.findFirst({
        where: { businessId: user.businessId, type: 'EQUITY' },
        orderBy: { code: 'asc' },
      });
      if (!contraAccount) {
        contraAccount = await prisma.ledgerAccount.create({
          data: {
            code: '3999',
            name: 'Opening Balance Equity',
            type: 'EQUITY' as any,
            category: 'Equity',
            businessId: user.businessId,
          },
        });
      }

      // Debit-normal accounts (asset, expense): DR new account / CR equity
      // Credit-normal accounts (liability, equity, revenue): DR equity / CR new account
      const isDebitNormal = ['ASSET', 'EXPENSE'].includes(upperType);
      await prisma.journalEntry.create({
        data: {
          date: new Date(),
          description: `Opening balance — ${name}`,
          reference: 'OB',
          businessId: user.businessId,
          userId: user.id,
          entries: {
            create: [
              { accountId: isDebitNormal ? account.id : contraAccount.id, debit: obAmount, credit: 0 },
              { accountId: isDebitNormal ? contraAccount.id : account.id, debit: 0, credit: obAmount },
            ],
          },
        },
      });
    }

    return NextResponse.json({ data: { ...account, type: account.type.toLowerCase(), balance: obAmount } }, { status: 201 });
  } catch (error) {
    console.error('Create account error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
});
