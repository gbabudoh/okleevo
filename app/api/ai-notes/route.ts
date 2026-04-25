import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (_req, { dataFilter }) => {
  try {
    const notes = await prisma.aINote.findMany({
      where: { businessId: dataFilter.businessId },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching AI notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
});

export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const body = await req.json();
    const { title, content, type, date, tags, aiSummary, actionItems, participants, duration } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const note = await prisma.aINote.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        type: type || 'meeting',
        date: date ? new Date(date) : new Date(),
        tags: Array.isArray(tags) ? tags : [],
        aiSummary: aiSummary || null,
        actionItems: Array.isArray(actionItems) ? actionItems : [],
        participants: Array.isArray(participants) ? participants : [],
        duration: duration || null,
        businessId: user.businessId,
        userId: user.id,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error creating AI note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
});
