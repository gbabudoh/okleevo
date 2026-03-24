import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

// Get Chart of Accounts for the current SME
export const GET = withMultiTenancy(async (req, { user }) => {
  try {
    const accounts = await prisma.ledgerAccount.findMany({
      where: {
        businessId: user.businessId,
      },
      orderBy: { code: 'asc' },
    });

    return NextResponse.json({ data: accounts });
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
    const { code, name, type, category, description } = body;

    const account = await prisma.ledgerAccount.create({
      data: {
        code,
        name,
        type,
        category,
        description,
        businessId: user.businessId,
      },
    });

    return NextResponse.json({ data: account }, { status: 201 });
  } catch (error) {
    console.error('Create account error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
});
