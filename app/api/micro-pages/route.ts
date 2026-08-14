import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { slugify, randomSlugSuffix } from '@/lib/slug';

export const GET = withMultiTenancy(async (_req, { dataFilter }) => {
  try {
    const pages = await prisma.microPage.findMany({
      where: { businessId: dataFilter.businessId },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error('Micro Pages GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
});

export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const body = await req.json();
    const { title, template, seoTitle, seoDescription, content, blockOrder } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Page title is required' }, { status: 400 });
    }
    if (!template?.trim()) {
      return NextResponse.json({ error: 'Template is required' }, { status: 400 });
    }

    // Slug namespace is global (public URL is /p/{slug}), so append a random
    // suffix rather than risk collisions across businesses.
    const slug = `${slugify(title)}-${randomSlugSuffix()}`;

    const page = await prisma.microPage.create({
      data: {
        title: title.trim(),
        slug,
        template: template.trim(),
        seoTitle: seoTitle?.trim() || null,
        seoDescription: seoDescription?.trim() || null,
        content: content ?? undefined,
        blockOrder: Array.isArray(blockOrder) ? blockOrder : [],
        businessId: user.businessId,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error('Micro Pages POST Error:', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
});
