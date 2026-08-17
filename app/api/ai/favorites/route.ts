import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (_req, { user }) => {
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { favoriteAiTemplates: true },
    });
    return NextResponse.json({ favorites: dbUser?.favoriteAiTemplates ?? [] });
  } catch (error) {
    console.error('Error fetching AI favorites:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
});

export const PATCH = withMultiTenancy(async (req, { user }) => {
  try {
    const { favorites } = await req.json();
    if (!Array.isArray(favorites) || !favorites.every(f => typeof f === 'string')) {
      return NextResponse.json({ error: 'favorites must be an array of template ids' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { favoriteAiTemplates: favorites },
    });

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('Error updating AI favorites:', error);
    return NextResponse.json({ error: 'Failed to update favorites' }, { status: 500 });
  }
});
