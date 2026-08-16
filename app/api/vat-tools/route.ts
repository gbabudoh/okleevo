import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

// Most recent history is more than enough for a manual, one-at-a-time
// calculator; capping avoids an unbounded payload for pathological usage.
const HISTORY_LIMIT = 200;

export const GET = withMultiTenancy(async (req, { dataFilter }) => {
  try {
    const calculations = await prisma.vatCalculation.findMany({
      where: { businessId: dataFilter.businessId },
      orderBy: { createdAt: 'desc' },
      take: HISTORY_LIMIT,
    });
    return NextResponse.json(calculations);
  } catch (error: unknown) {
    console.error('VAT Tools GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch VAT calculation history' }, { status: 500 });
  }
});

export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const body = await req.json();
    const { mode, amount, vatRate, vatAmount, netAmount, grossAmount } = body;

    if (
      (mode !== 'add' && mode !== 'remove') ||
      !Number.isFinite(amount) || amount <= 0 ||
      !Number.isFinite(vatRate) || vatRate < 0 ||
      !Number.isFinite(vatAmount) || !Number.isFinite(netAmount) || !Number.isFinite(grossAmount)
    ) {
      return NextResponse.json({ error: 'Invalid calculation input' }, { status: 400 });
    }

    const calculation = await prisma.vatCalculation.create({
      data: {
        businessId: user.businessId,
        userId: user.id,
        mode,
        amount,
        vatRate,
        vatAmount,
        netAmount,
        grossAmount,
      },
    });

    return NextResponse.json(calculation, { status: 201 });
  } catch (error: unknown) {
    console.error('VAT Tools POST error:', error);
    return NextResponse.json({ error: 'Failed to save VAT calculation' }, { status: 500 });
  }
});

export const DELETE = withMultiTenancy(async (req, { user }) => {
  try {
    await prisma.vatCalculation.deleteMany({ where: { businessId: user.businessId } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('VAT Tools DELETE error:', error);
    return NextResponse.json({ error: 'Failed to clear VAT calculation history' }, { status: 500 });
  }
});
