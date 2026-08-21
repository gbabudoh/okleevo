import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (_req, { user, dataFilter }) => {
  try {
    const notes = await prisma.aINote.findMany({
      where: {
        businessId: dataFilter.businessId,
        OR: [
          { isPrivate: false },
          { userId: user.id },
        ],
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { date: 'desc' },
    });

    const formatted = notes.map(n => ({
      ...n,
      authorName: n.authorName || (n.user ? `${n.user.firstName} ${n.user.lastName}`.trim() : 'Team Member'),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching AI notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
});

export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const body = await req.json();
    const { title, content, type, date, tags, isPinned, isStarred, isPrivate, aiSummary, actionItems, participants, duration } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const authorFullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Team Member';

    const note = await prisma.aINote.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        type: type || 'meeting',
        date: date ? new Date(date) : new Date(),
        tags: Array.isArray(tags) ? tags : [],
        isPinned: Boolean(isPinned),
        isStarred: Boolean(isStarred),
        isPrivate: Boolean(isPrivate),
        authorName: authorFullName,
        aiSummary: aiSummary || null,
        actionItems: Array.isArray(actionItems) ? actionItems : [],
        participants: Array.isArray(participants) ? participants : [],
        duration: duration || null,
        businessId: user.businessId,
        userId: user.id,
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    return NextResponse.json({
      ...note,
      authorName: note.authorName || authorFullName,
    });
  } catch (error) {
    console.error('Error creating AI note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
});
