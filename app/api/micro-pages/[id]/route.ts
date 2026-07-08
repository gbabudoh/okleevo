import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';
import { MicroPageStatus } from '@/lib/prisma-client';

export const GET = withMultiTenancy(async (_req, { user, params }) => {
  try {
    const { id } = await params;

    const page = await prisma.microPage.findFirst({
      where: { id: id as string, businessId: user.businessId },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('Micro Page GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
  }
});

export const PATCH = withMultiTenancy(async (req, { user, params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, slug, status, seoTitle, seoDescription, content } = body;

    const existing = await prisma.microPage.findFirst({
      where: { id: id as string, businessId: user.businessId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Page not found or unauthorized' }, { status: 404 });
    }

    let nextSlug: string | undefined;
    if (slug !== undefined && slug !== existing.slug) {
      nextSlug = slugify(slug);
      const collision = await prisma.microPage.findUnique({ where: { slug: nextSlug } });
      if (collision && collision.id !== existing.id) {
        return NextResponse.json({ error: 'That URL slug is already taken' }, { status: 409 });
      }
    }

    const nextStatus = status ? (status.toUpperCase() as MicroPageStatus) : undefined;
    const publishedAt =
      nextStatus === 'PUBLISHED' && !existing.publishedAt ? new Date() : undefined;

    const page = await prisma.microPage.update({
      where: { id: id as string },
      data: {
        title: title?.trim(),
        slug: nextSlug,
        status: nextStatus,
        seoTitle: seoTitle !== undefined ? (seoTitle?.trim() || null) : undefined,
        seoDescription: seoDescription !== undefined ? (seoDescription?.trim() || null) : undefined,
        content: content !== undefined ? content : undefined,
        publishedAt,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error('Micro Page PATCH Error:', error);
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
});

export const DELETE = withMultiTenancy(async (_req, { user, params }) => {
  try {
    const { id } = await params;

    const { count } = await prisma.microPage.deleteMany({
      where: { id: id as string, businessId: user.businessId },
    });

    if (count === 0) {
      return NextResponse.json({ error: 'Page not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Micro Page DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
});
