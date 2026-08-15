import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const PATCH = withMultiTenancy(async (req, { user, params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { code, name, type, description, openingBalance, isCashAccount } = body;
    const upperType = (type as string).toUpperCase();

    await prisma.ledgerAccount.updateMany({
      where: { id: id as string, businessId: user.businessId },
      data: { code, name, type: upperType as any, description, isCashAccount: Boolean(isCashAccount) },
    });

    // If openingBalance provided, create a balance adjustment journal entry
    const obAmount = parseFloat(openingBalance || '0');
    if (obAmount > 0) {
      const account = await prisma.ledgerAccount.findFirst({ where: { id: id as string, businessId: user.businessId } });
      if (account) {
        let contraAccount = await prisma.ledgerAccount.findFirst({
          where: { businessId: user.businessId, type: 'EQUITY' },
          orderBy: { code: 'asc' },
        });
        if (!contraAccount) {
          contraAccount = await prisma.ledgerAccount.create({
            data: { code: '3999', name: 'Opening Balance Equity', type: 'EQUITY' as any, category: 'Equity', businessId: user.businessId },
          });
        }
        const isDebitNormal = ['ASSET', 'EXPENSE'].includes(upperType);
        await prisma.journalEntry.create({
          data: {
            date: new Date(),
            description: `Balance adjustment — ${account.name}`,
            reference: 'ADJ',
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
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update account error:', error);
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
});

export const DELETE = withMultiTenancy(async (req, { user, params }) => {
  try {
    const { id } = await params;
    const account = await prisma.ledgerAccount.findFirst({
      where: { id: id as string, businessId: user.businessId },
    });
    if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    if (account.isSystem) {
      return NextResponse.json({ error: 'System accounts cannot be deleted' }, { status: 409 });
    }

    // LedgerEntry cascades on account delete — silently corrupting any journal
    // entry that used this account (leaving it with only one leg) if we let
    // this through. Block instead of cascading.
    const entryCount = await prisma.ledgerEntry.count({ where: { accountId: id as string } });
    if (entryCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete "${account.name}" — it has ${entryCount} ledger entr${entryCount === 1 ? 'y' : 'ies'} posted against it. Reverse or void those entries first.` },
        { status: 409 }
      );
    }

    await prisma.ledgerAccount.delete({ where: { id: id as string } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
});
