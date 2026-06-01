import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const PATCH = withMultiTenancy(async (req, { user, params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { code, name, type, description, openingBalance } = body;
    const upperType = (type as string).toUpperCase();

    await prisma.ledgerAccount.updateMany({
      where: { id: id as string, businessId: user.businessId },
      data: { code, name, type: upperType as any, description },
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
    await prisma.ledgerAccount.deleteMany({
      where: { id: id as string, businessId: user.businessId, isSystem: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
});
