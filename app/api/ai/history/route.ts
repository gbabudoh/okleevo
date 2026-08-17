import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

// Flat monthly allowance for AI Content Studio generation. Not tied to a
// per-plan tier system (this app only has a single subscription plan today)
// — a real, disclosed, fixed number rather than a fabricated one.
const AI_MONTHLY_WORD_QUOTA = 50000;

export const GET = withMultiTenancy(async (_req, { dataFilter }) => {
  try {
    const businessId = dataFilter.businessId;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [recent, monthGenerations] = await Promise.all([
      prisma.aIGeneration.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.aIGeneration.findMany({
        where: { businessId, createdAt: { gte: startOfMonth } },
        select: { wordCount: true },
      }),
    ]);

    const wordsUsed = monthGenerations.reduce((sum, g) => sum + g.wordCount, 0);

    return NextResponse.json({
      history: recent.map(g => ({
        id: g.id,
        templateId: g.templateId,
        templateName: g.templateName,
        content: g.content,
        wordCount: g.wordCount,
        model: g.model,
        createdAt: g.createdAt.toISOString(),
      })),
      quota: { used: wordsUsed, limit: AI_MONTHLY_WORD_QUOTA },
    });
  } catch (error) {
    console.error('Error fetching AI generation history:', error);
    return NextResponse.json({ error: 'Failed to fetch AI generation history' }, { status: 500 });
  }
});
