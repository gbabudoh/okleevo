import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { businessId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const business = await prisma.business.findUnique({
      where: { id: user.businessId },
      select: { enabledModules: true }
    });

    return NextResponse.json(business?.enabledModules || []);
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enabledModules } = await request.json();

    if (!Array.isArray(enabledModules)) {
      return NextResponse.json({ error: 'Invalid modules data' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { businessId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedBusiness = await prisma.business.update({
      where: { id: user.businessId },
      data: { enabledModules }
    });

    return NextResponse.json(updatedBusiness.enabledModules);
  } catch (error) {
    console.error('Error updating modules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
